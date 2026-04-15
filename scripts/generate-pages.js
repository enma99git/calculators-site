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
  dkk: "Danish Krone"
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

function currencyTemplate(entry) {
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
</script>`
  });
}

function loanTemplate(entry) {
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
</script>`
  });
}

function salaryTemplate(entry) {
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
</script>`
  });
}

function buildEntries() {
  const entries = [];
  const families = config.families || {};

  if (families.currencyConverter?.enabled) {
    for (const [from, to] of families.currencyConverter.pairs || []) {
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
    for (const amount of families.loanPaymentByAmount.amounts || []) {
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
    for (const amount of families.salaryToHourlyByAmount.amounts || []) {
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

function renderPage(entry) {
  if (entry.family === "currencyConverter") {
    return currencyTemplate(entry);
  }
  if (entry.family === "loanPaymentByAmount") {
    return loanTemplate(entry);
  }
  if (entry.family === "salaryToHourlyByAmount") {
    return salaryTemplate(entry);
  }
  throw new Error(`Unknown family: ${entry.family}`);
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
      const listItems = items
        .map((item) => `<li><a href="${item.fileName}">${item.h1}</a></li>`)
        .join("\n");
      return `<h2>${category}</h2>\n<ul>\n${listItems}\n</ul>`;
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

function writeSitemap(entries) {
  if (!config.siteUrl) {
    return;
  }

  const base = config.siteUrl.replace(/\/$/, "");
  const urls = new Set(entries.map((entry) => `${base}/${entry.fileName}`));
  urls.add(`${base}/${config.generatedIndexFile || "generated-calculators.html"}`);
  urls.add(`${base}/index.html`);

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
    fs.writeFileSync(outputPath, renderPage(entry), "utf8");
    created += 1;
  }

  writeGeneratedIndex(entries);
  writeSitemap(entries);

  console.log(`Generated entries configured: ${entries.length}`);
  console.log(`Pages created/updated: ${created}`);
  console.log(`Pages skipped (existing): ${skipped}`);
  console.log(`Wrote ${config.generatedIndexFile || "generated-calculators.html"} and sitemap.xml`);
}

main();
