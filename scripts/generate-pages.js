const fs = require("fs");
const path = require("path");

const root = process.cwd();
const configPath = path.join(root, "pages.config.json");

if (!fs.existsSync(configPath)) {
  throw new Error("Missing pages.config.json");
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const existingHtml = new Set(
  fs
    .readdirSync(root)
    .filter((name) => name.endsWith(".html"))
    .map((name) => name.toLowerCase())
);

const codeNames = {
  usd: "US Dollar",
  eur: "Euro",
  cop: "Colombian Peso",
  gbp: "British Pound",
  cad: "Canadian Dollar",
  mxn: "Mexican Peso",
  jpy: "Japanese Yen",
  inr: "Indian Rupee",
  aud: "Australian Dollar",
  brl: "Brazilian Real",
  ars: "Argentine Peso",
  chf: "Swiss Franc",
  sek: "Swedish Krona",
  nok: "Norwegian Krone",
  dkk: "Danish Krone",
  zar: "South African Rand",
  sgd: "Singapore Dollar",
  aed: "UAE Dirham"
};

function capitalize(code) {
  return code.toUpperCase();
}

function formatAmount(num) {
  return Number(num).toLocaleString("en-US");
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildRange(rangeConfig = {}) {
  const start = Number(rangeConfig.start);
  const end = Number(rangeConfig.end);
  const step = Number(rangeConfig.step);
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step <= 0) {
    return [];
  }

  const values = [];
  for (let value = start; value <= end; value += step) {
    values.push(value);
  }
  return values;
}

function getAmounts(family) {
  if (Array.isArray(family.amounts) && family.amounts.length > 0) {
    return family.amounts;
  }
  if (family.amountRange) {
    return buildRange(family.amountRange);
  }
  return [];
}

function getCurrencyPairs(currencyFamily) {
  if (Array.isArray(currencyFamily.pairs) && currencyFamily.pairs.length > 0) {
    return currencyFamily.pairs;
  }

  const codes = Array.isArray(currencyFamily.codes) ? currencyFamily.codes : [];
  const includeReverse = Boolean(currencyFamily.includeReverse);
  const limit = Number(currencyFamily.limit) || Number.MAX_SAFE_INTEGER;
  const pairs = [];

  for (let i = 0; i < codes.length; i += 1) {
    for (let j = i + 1; j < codes.length; j += 1) {
      pairs.push([codes[i], codes[j]]);
      if (includeReverse) {
        pairs.push([codes[j], codes[i]]);
      }
      if (pairs.length >= limit) {
        return pairs;
      }
    }
  }

  return pairs;
}

function htmlShell({ title, description, body, lang = "en" }) {
  const robots = config.defaults?.includeRobotsMeta
    ? '<meta name="robots" content="index, follow">\n'
    : "";
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${robots}<link rel="stylesheet" href="styles.css">
</head>
<body>
${body}
<hr>
<p>Browse Categories:</p>
<a href="financial-calculators.html">Financial</a> |
<a href="health-calculators.html">Health</a> |
<a href="conversion-calculators.html">Conversions</a> |
<a href="career-calculators.html">Career</a>
<p><a href="generated-calculators.html">Generated Calculators Index</a></p>
<p><a href="index.html">Home</a></p>
</body>
</html>
`;
}

function pickRelatedEntries(entries, entry, limit = 8) {
  const sameFamily = entries.filter(
    (candidate) => candidate.fileName !== entry.fileName && candidate.family === entry.family
  );
  const sameCategory = entries.filter(
    (candidate) =>
      candidate.fileName !== entry.fileName &&
      candidate.category === entry.category &&
      candidate.family !== entry.family
  );

  return [...sameFamily, ...sameCategory].slice(0, limit);
}

function relatedHtml(entries, entry) {
  const related = pickRelatedEntries(entries, entry, 8);
  if (!related.length) {
    return "";
  }

  const links = related
    .map((item) => `<li><a href="${item.fileName}">${escapeHtml(item.h1)}</a></li>`)
    .join("\n");

  return `<p>Related Calculators:</p>
<ul>
${links}
</ul>`;
}

function currencyTemplate(entry, entries) {
  return htmlShell({
    title: entry.title,
    description: entry.description,
    body: `<h1>${entry.h1}</h1>
<p>Convert ${entry.fromName} (${entry.fromCode}) to ${entry.toName} (${entry.toCode}) using a manual exchange rate.</p>

<label>${entry.fromCode} Amount:</label>
<input type="number" id="amount" value="100"><br><br>
<label>Exchange Rate (${entry.fromCode} to ${entry.toCode}):</label>
<input type="number" id="rate" value="1.00" step="0.0001"><br><br>

<button onclick="convert()">Convert</button>
<h2 id="result"></h2>

<script>
function convert() {
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;
  const converted = amount * rate;
  document.getElementById("result").innerHTML = converted.toFixed(2) + " ${entry.toCode}";
}
</script>
${relatedHtml(entries, entry)}`
  });
}

function loanTemplate(entry, entries) {
  return htmlShell({
    title: entry.title,
    description: entry.description,
    body: `<h1>${entry.h1}</h1>
<p>Estimate monthly payment for a $${formatAmount(
      entry.amount
    )} loan amount using simple amortization.</p>

<label>Loan Amount ($):</label>
<input type="number" id="amount" value="${entry.amount}"><br><br>
<label>Annual Interest Rate (%):</label>
<input type="number" id="rate" value="7.5" step="0.1"><br><br>
<label>Loan Term (Years):</label>
<input type="number" id="years" value="5"><br><br>

<button onclick="calcPayment()">Calculate Payment</button>
<h2 id="result"></h2>

<script>
function calcPayment() {
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const annualRate = parseFloat(document.getElementById("rate").value) || 0;
  const years = parseFloat(document.getElementById("years").value) || 0;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (months <= 0) {
    document.getElementById("result").innerHTML = "Enter a valid loan term.";
    return;
  }
  if (monthlyRate === 0) {
    const noInterestPayment = amount / months;
    document.getElementById("result").innerHTML = "Monthly Payment: $" + noInterestPayment.toFixed(2);
    return;
  }
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  document.getElementById("result").innerHTML = "Monthly Payment: $" + payment.toFixed(2);
}
</script>
${relatedHtml(entries, entry)}`
  });
}

function salaryTemplate(entry, entries) {
  return htmlShell({
    title: entry.title,
    description: entry.description,
    body: `<h1>${entry.h1}</h1>
<p>Convert a $${formatAmount(entry.amount)} yearly salary into hourly pay.</p>

<label>Annual Salary ($):</label>
<input type="number" id="salary" value="${entry.amount}"><br><br>
<label>Hours Per Week:</label>
<input type="number" id="hours" value="40"><br><br>
<label>Weeks Per Year:</label>
<input type="number" id="weeks" value="52"><br><br>

<button onclick="calcHourly()">Calculate Hourly</button>
<h2 id="result"></h2>

<script>
function calcHourly() {
  const salary = parseFloat(document.getElementById("salary").value) || 0;
  const hours = parseFloat(document.getElementById("hours").value) || 0;
  const weeks = parseFloat(document.getElementById("weeks").value) || 0;
  const denominator = hours * weeks;
  if (denominator <= 0) {
    document.getElementById("result").innerHTML = "Enter valid hours and weeks.";
    return;
  }
  const hourly = salary / denominator;
  document.getElementById("result").innerHTML = "Hourly Rate: $" + hourly.toFixed(2);
}
</script>
${relatedHtml(entries, entry)}`
  });
}

function buildEntries() {
  const entries = [];
  const families = config.families || {};

  if (families.currencyConverter?.enabled) {
    for (const [from, to] of getCurrencyPairs(families.currencyConverter)) {
      const fromCode = capitalize(from);
      const toCode = capitalize(to);
      const fromName = codeNames[from] || fromCode;
      const toName = codeNames[to] || toCode;
      const slug = slugify(`${from}-to-${to}-converter`);
      entries.push({
        family: "currencyConverter",
        category: families.currencyConverter.categoryLabel || "Currency",
        slug,
        fileName: `${slug}.html`,
        title: `${fromCode} to ${toCode} Converter (Free) - Convert ${fromCode} to ${toCode}`,
        description: `Convert ${fromCode} to ${toCode} instantly with this free currency converter calculator.`,
        h1: `${fromCode} to ${toCode} Converter`,
        fromCode,
        toCode,
        fromName,
        toName
      });
    }
  }

  if (families.loanPaymentByAmount?.enabled) {
    for (const amount of getAmounts(families.loanPaymentByAmount)) {
      const slug = slugify(`${amount}-loan-payment-calculator`);
      entries.push({
        family: "loanPaymentByAmount",
        category: families.loanPaymentByAmount.categoryLabel || "Financial",
        slug,
        fileName: `${slug}.html`,
        title: `${formatAmount(amount)} Loan Payment Calculator (Free)`,
        description: `Estimate monthly payment for a $${formatAmount(amount)} loan with this free calculator.`,
        h1: `$${formatAmount(amount)} Loan Payment Calculator`,
        amount
      });
    }
  }

  if (families.salaryToHourlyByAmount?.enabled) {
    for (const amount of getAmounts(families.salaryToHourlyByAmount)) {
      const slug = slugify(`${amount}-salary-to-hourly-calculator`);
      entries.push({
        family: "salaryToHourlyByAmount",
        category: families.salaryToHourlyByAmount.categoryLabel || "Career",
        slug,
        fileName: `${slug}.html`,
        title: `${formatAmount(amount)} Salary to Hourly Calculator (Free)`,
        description: `Convert a $${formatAmount(amount)} annual salary into hourly pay instantly.`,
        h1: `$${formatAmount(amount)} Salary to Hourly Calculator`,
        amount
      });
    }
  }

  return entries;
}

function renderPage(entry, entries) {
  if (entry.family === "currencyConverter") {
    return currencyTemplate(entry, entries);
  }
  if (entry.family === "loanPaymentByAmount") {
    return loanTemplate(entry, entries);
  }
  if (entry.family === "salaryToHourlyByAmount") {
    return salaryTemplate(entry, entries);
  }
  throw new Error(`Unknown family: ${entry.family}`);
}

function categorySlug(label) {
  return slugify(String(label || "other"));
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getCategoryIndexFile(category) {
  return `generated-${categorySlug(category)}-calculators.html`;
}

function writeCategoryIndexes(entries) {
  const byCategory = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {});

  const indexFiles = [];
  for (const [category, items] of Object.entries(byCategory)) {
    const listItems = items
      .map((item) => `<li><a href="${item.fileName}">${escapeHtml(item.h1)}</a></li>`)
      .join("\n");

    const fileName = getCategoryIndexFile(category);
    const page = htmlShell({
      title: `${category} Generated Calculators`,
      description: `Browse generated ${category.toLowerCase()} calculators.`,
      body: `<h1>${escapeHtml(category)} Generated Calculators</h1>
<p>This page is generated automatically from <code>pages.config.json</code>.</p>
<ul>
${listItems}
</ul>`
    });

    fs.writeFileSync(path.join(root, fileName), page, "utf8");
    indexFiles.push({ category, fileName, count: items.length });
  }

  return indexFiles;
}

function upsertCategoryHubSection(fileName, heading, items) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const startMarker = "<!-- GENERATED_CATEGORY_LINKS_START -->";
  const endMarker = "<!-- GENERATED_CATEGORY_LINKS_END -->";
  const itemLinks = items
    .map((item) => `<li><a href="${item.fileName}">${escapeHtml(item.h1)}</a></li>`)
    .join("\n");
  const section = `${startMarker}
<h2>${escapeHtml(heading)}</h2>
<p>Auto-generated links from <code>pages.config.json</code>.</p>
<ul>
${itemLinks}
</ul>
${endMarker}`;

  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(startMarker) && content.includes(endMarker)) {
    const replacePattern = new RegExp(
      `${startMarker}[\\s\\S]*?${endMarker}`,
      "m"
    );
    content = content.replace(replacePattern, section);
  } else if (content.includes("<hr>")) {
    content = content.replace("<hr>", `${section}\n\n<hr>`);
  } else if (content.includes("</body>")) {
    content = content.replace("</body>", `${section}\n</body>`);
  } else {
    content += `\n${section}\n`;
  }

  fs.writeFileSync(filePath, content, "utf8");
}

function syncMainCategoryPages(entries) {
  const financialGenerated = entries.filter((entry) => entry.category === "Financial");
  const conversionGenerated = entries.filter((entry) => entry.category === "Conversions");
  const careerGenerated = entries.filter((entry) => entry.category === "Career");
  const healthGenerated = entries.filter((entry) => entry.category === "Health");

  upsertCategoryHubSection(
    "financial-calculators.html",
    `More Financial Calculators (${financialGenerated.length})`,
    financialGenerated
  );
  upsertCategoryHubSection(
    "conversion-calculators.html",
    `More Conversion Calculators (${conversionGenerated.length})`,
    conversionGenerated
  );
  upsertCategoryHubSection(
    "career-calculators.html",
    `More Career Calculators (${careerGenerated.length})`,
    careerGenerated
  );
  upsertCategoryHubSection(
    "health-calculators.html",
    `More Health Calculators (${healthGenerated.length})`,
    healthGenerated
  );
}

function writeGeneratedIndex(entries) {
  const byCategory = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {});

  const sections = Object.entries(byCategory)
    .map(([category, items]) => {
      const categoryIndexFile = getCategoryIndexFile(category);
      const listItems = items
        .slice(0, 15)
        .map((item) => `<li><a href="${item.fileName}">${escapeHtml(item.h1)}</a></li>`)
        .join("\n");
      const hasMore = items.length > 15
        ? `<p><a href="${categoryIndexFile}">View all ${items.length} ${escapeHtml(category)} calculators</a></p>`
        : "";
      return `<h2>${escapeHtml(category)}</h2>\n<ul>\n${listItems}\n</ul>\n${hasMore}`;
    })
    .join("\n\n");

  const page = htmlShell({
    title: "Generated Calculators Index",
    description: "Browse generated calculator pages by category.",
    body: `<h1>Generated Calculators Index</h1>
<p>This page is generated automatically from <code>pages.config.json</code>.</p>
${sections}`
  });

  const indexPath = path.join(root, config.generatedIndexFile || "generated-calculators.html");
  fs.writeFileSync(indexPath, page, "utf8");
}

function writeSitemap(entries, categoryIndexes) {
  if (!config.siteUrl) {
    return;
  }

  const base = config.siteUrl.replace(/\/$/, "");
  const htmlFiles = fs
    .readdirSync(root)
    .filter((name) => name.endsWith(".html"));

  const urls = new Set(htmlFiles.map((file) => `${base}/${file}`));
  urls.add(`${base}/${config.generatedIndexFile || "generated-calculators.html"}`);
  for (const categoryIndex of categoryIndexes) {
    urls.add(`${base}/${categoryIndex.fileName}`);
  }
  for (const entry of entries) {
    urls.add(`${base}/${entry.fileName}`);
  }

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls)
  .sort()
  .map((url) => `  <url><loc>${url}</loc></url>`)
  .join("\n")}
</urlset>
`;

  fs.writeFileSync(path.join(root, "sitemap.xml"), content, "utf8");
}

function main() {
  const overwrite = process.argv.includes("--overwrite");
  const entries = buildEntries();
  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    const outputPath = path.join(root, entry.fileName);
    const fileExists = fs.existsSync(outputPath) || existingHtml.has(entry.fileName.toLowerCase());
    if (fileExists && !overwrite) {
      skipped += 1;
      continue;
    }
    fs.writeFileSync(outputPath, renderPage(entry, entries), "utf8");
    created += 1;
  }

  syncMainCategoryPages(entries);
  const categoryIndexes = writeCategoryIndexes(entries);
  writeGeneratedIndex(entries);
  writeSitemap(entries, categoryIndexes);

  console.log(`Generated entries configured: ${entries.length}`);
  console.log(`Pages created/updated: ${created}`);
  console.log(`Pages skipped (existing): ${skipped}`);
  console.log(
    `Wrote ${config.generatedIndexFile || "generated-calculators.html"}, ${categoryIndexes.length} category indexes, and sitemap.xml`
  );
}

main();
