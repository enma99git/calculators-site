/**
 * Collapsible "How this calculation works" blocks for calculator templates.
 * Used by generate-pages.js — keep HTML accessible and assumptions explicit.
 */

function methodologyDetailsWrap(helpers, lang, innerHtml) {
  const { LOCALE_LABELS, localeCode, escapeHtml } = helpers;
  const locale = localeCode(lang);
  const L = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const title = L.methodologyTitle || "How this calculation works";
  return `<details class="methodology-block">
<summary>${escapeHtml(title)}</summary>
<div>
${innerHtml}
</div>
</details>`;
}

function methodologyCurrency(helpers, entry, lang) {
  const { escapeHtml, LOCALE_LABELS, localeCode } = helpers;
  const locale = localeCode(lang);
  const L = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const fc = escapeHtml(String(entry.fromCode || ""));
  const tc = escapeHtml(String(entry.toCode || ""));
  const fn = escapeHtml(String(entry.fromName || entry.fromCode || ""));
  const tn = escapeHtml(String(entry.toName || entry.toCode || ""));
  const inner = `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>${fc} amount</strong> — How much of the source currency you are converting.</li>
<li><strong>Exchange rate (${fc} to ${tc})</strong> — How many <strong>${tc}</strong> units equal one <strong>${fc}</strong> unit (e.g. if 1 ${fn} = 0.85 ${tn}, enter 0.85).</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>Result ≈ amount × rate</em></p>
<p class="small">The script loads a suggested rate when online; you can override it. Banks and cards may use different spreads, fees, and cut-off times—use results for planning only.</p>`;
  return methodologyDetailsWrap(helpers, lang, inner);
}

function methodologyLoanLadder(helpers, entry, lang) {
  const { escapeHtml, formatAmount, LOCALE_LABELS, localeCode } = helpers;
  const locale = localeCode(lang);
  const L = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const amt = formatAmount(entry.amount);
  const inner = `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Loan amount ($)</strong> — Principal; defaults to <strong>$${escapeHtml(amt)}</strong> for this page. You can change it.</li>
<li><strong>Annual interest rate (%)</strong> — Nominal yearly rate; converted to a monthly rate <em>r = (annual ÷ 100) ÷ 12</em>.</li>
<li><strong>Loan term (years)</strong> — Number of monthly payments <em>n = years × 12</em>.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>Fixed-rate amortization (equal monthly payments):</p>
<p><em>M = P × r / (1 − (1 + r)<sup>−n</sup>)</em></p>
<p class="small">If the rate is 0%, payment = P / n. Does not include escrow, PMI, or lender-specific rounding.</p>`;
  return methodologyDetailsWrap(helpers, lang, inner);
}

function methodologySalaryLadder(helpers, entry, lang) {
  const { escapeHtml, formatAmount, LOCALE_LABELS, localeCode } = helpers;
  const locale = localeCode(lang);
  const L = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const amt = formatAmount(entry.amount);
  const inner = `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Annual salary ($)</strong> — Gross yearly pay; defaults to <strong>$${escapeHtml(amt)}</strong>.</li>
<li><strong>Hours per week</strong> — Typical working hours in one week.</li>
<li><strong>Weeks per year</strong> — Often 52; adjust if you use a different work-year assumption.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>Hourly rate = annual salary ÷ (hours per week × weeks per year)</em></p>
<p class="small">Does not subtract taxes, benefits, or unpaid time off—use as a quick gross estimate.</p>`;
  return methodologyDetailsWrap(helpers, lang, inner);
}

function methodologyStatePaycheck(helpers, entry, lang) {
  const { escapeHtml, LOCALE_LABELS, localeCode } = helpers;
  const locale = localeCode(lang);
  const L = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const stateName = escapeHtml(String(entry.stateName || ""));
  const ratePct = ((Number(entry.stateTaxRate) || 0) * 100).toFixed(1);
  const inner = `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Annual gross salary</strong> — Pre-tax yearly income.</li>
<li><strong>Federal tax year</strong> — Selects IRS bracket and standard deduction values baked into this tool.</li>
<li><strong>Filing status</strong> — Chooses single, married filing jointly, or head of household for federal brackets and standard deduction.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>Federal income tax is estimated with <strong>progressive brackets</strong> after the <strong>standard deduction</strong> for the chosen status and year.</p>
<p><strong>${stateName} state tax</strong> is approximated as a flat <strong>${escapeHtml(ratePct)}%</strong> of gross (pilot assumption—not a full state return).</p>
<p><em>Net ≈ gross − estimated federal tax − estimated state tax</em>; then divided into monthly / biweekly / weekly for display.</p>
<p class="small">Not payroll advice. Real paychecks include FICA, local taxes, pre-tax deductions, and withholding adjustments.</p>`;
  return methodologyDetailsWrap(helpers, lang, inner);
}

function methodologySpanishPilot(helpers, formulaType, lang) {
  const innerByType = {
    bmi: `<h3>Qué significa cada dato</h3>
<ul>
<li><strong>Estatura (cm)</strong> — Altura en centímetros.</li>
<li><strong>Peso (kg)</strong> — Masa en kilogramos.</li>
</ul>
<h3>Fórmula</h3>
<p><em>IMC = peso (kg) ÷ (estatura (m))²</em> con estatura en metros (cm ÷ 100).</p>
<p class="small">Clasificación orientativa; no sustituye evaluación médica.</p>`,
    loan: `<h3>Qué significa cada dato</h3>
<ul>
<li><strong>Monto</strong> — Capital del préstamo.</li>
<li><strong>Tasa anual (%)</strong> — Se convierte a tasa mensual.</li>
<li><strong>Años</strong> — Plazo en años (pagos mensuales).</li>
</ul>
<h3>Fórmula</h3>
<p>Amortización con cuota fija: <em>M = P × r / (1 − (1 + r)<sup>−n</sup>)</em>, con <em>r</em> mensual y <em>n</em> meses.</p>`,
    savings: `<h3>Qué significa cada dato</h3>
<ul>
<li><strong>Aporte inicial, aporte mensual, tasa, años</strong> — Entradas para proyección con interés compuesto periódico.</li>
</ul>
<h3>Regla</h3>
<p>Crecimiento por períodos con la tasa indicada (estimación educativa).</p>`,
    kmMi: `<h3>Qué significa cada dato</h3>
<ul><li>Kilómetros o millas: convierte usando el factor fijo entre unidades.</li></ul>
<h3>Factor</h3>
<p>1 milla ≈ 1,609344 km (según la implementación en página).</p>`,
    cF: `<h3>Qué significa cada dato</h3>
<ul><li><strong>Celsius / Fahrenheit</strong> — Rellena uno para obtener el otro.</li></ul>
<h3>Fórmulas</h3>
<p><em>°F = °C × 9/5 + 32</em>; <em>°C = (°F − 32) × 5/9</em>.</p>`,
    salary: `<h3>Qué significa cada dato</h3>
<ul>
<li><strong>Salario anual</strong> — Bruto anual.</li>
<li><strong>Horas por semana / semanas por año</strong> — Para pasar a tarifa horaria bruta.</li>
</ul>
<h3>Fórmula</h3>
<p><em>Tarifa horaria ≈ salario ÷ (horas × semanas)</em>.</p>`,
    discount: `<h3>Qué significa cada dato</h3>
<ul><li><strong>Precio original</strong> y <strong>descuento (%)</strong>.</li></ul>
<h3>Fórmula</h3>
<p><em>Precio final = precio × (1 − descuento/100)</em>.</p>`,
    tip: `<h3>Qué significa cada dato</h3>
<ul><li><strong>Cuenta</strong> y <strong>propina (%)</strong>.</li></ul>
<h3>Fórmula</h3>
<p><em>Total ≈ cuenta × (1 + propina/100)</em> (interpretación de total con propina según el script).</p>`
  };
  const inner =
    innerByType[formulaType] ||
    `<h3>Qué significa cada dato</h3>
<p>Introduce los valores en los campos. La página calcula en tu navegador según la lógica de esta herramienta.</p>
<p class="small">Resultados orientativos.</p>`;
  return methodologyDetailsWrap(helpers, lang, inner);
}

function methodologyLegacyByFileName(helpers, fileName, lang) {
  const { escapeHtml, LOCALE_LABELS, localeCode } = helpers;
  const locale = localeCode(lang);
  const L = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const key = String(fileName || "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .toLowerCase();

  const generic = () => {
    const inner = `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<p class="desc">Use the labeled fields above. This page runs the calculation in your browser using the rules implemented in this tool.</p>
<p class="small">Treat results as estimates. Banks, tax authorities, and health professionals may use different definitions—verify important outcomes independently.</p>`;
    return methodologyDetailsWrap(helpers, lang, inner);
  };

  const specific = {
    "mortgage-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Loan amount</strong> — Principal <em>P</em>.</li>
<li><strong>Interest %</strong> — Annual nominal rate → monthly <em>r = (annual ÷ 100) ÷ 12</em>.</li>
<li><strong>Years</strong> — Term; number of monthly payments <em>n = years × 12</em>.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>M = P × r / (1 − (1 + r)<sup>−n</sup>)</em></p>
<p class="small">Simplified fixed-rate payment. Excludes escrow, PMI, fees, and lender rounding.</p>`,
    "loan-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Loan amount, interest rate (% yearly), years</strong> — Same amortization inputs as the mortgage tool.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>Monthly payment uses standard amortization (see mortgage methodology). Script may use equivalent rearrangement of the same formula.</p>`,
    "compound-interest.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li><strong>Principal, rate %, years</strong> — Growth of a lump sum at compounded interest.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>A = P × (1 + r/100)<sup>t</sup></em> (compounding per implementation on the page—often annual).</p>`,
    "savings-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li>Typically <strong>monthly savings</strong> and <strong>years</strong> (see labels on the page).</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>Projects total saved over time (simple sum or interest—match the script’s logic on the page).</p>`,
    "tax-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Income</strong> — Amount the tax percentage applies to.</li>
<li><strong>Tax %</strong> — Effective or marginal rate you choose for a quick estimate.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>Tax ≈ income × (tax% ÷ 100)</em></p>
<p class="small">Not a full tax return—no brackets, deductions, or credits.</p>`,
    "debt-payoff.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li><strong>Debt</strong> balance and <strong>monthly payment</strong> toward it.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>Months to pay off ≈ debt ÷ monthly payment</em> when interest is not modeled (check the page script for details).</p>`,
    "tip-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li><strong>Bill</strong> and <strong>tip %</strong>.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>Tip amount ≈ bill × (tip% ÷ 100)</em></p>`,
    "discount-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li><strong>Price</strong> and <strong>discount %</strong>.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>Final price = price × (1 − discount/100)</em></p>`,
    "percentage-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li>Values depend on mode (percent of, change, etc.)—see placeholders on the page.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>Uses ratio/percent definitions implemented in the script (e.g. <em>part ÷ whole × 100</em>).</p>`,
    "bmi-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul>
<li><strong>Weight (kg)</strong> and <strong>height (m)</strong>.</li>
</ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>BMI = weight ÷ height²</em></p>
<p class="small">Screening metric only—not a medical diagnosis.</p>`,
    "calorie-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li>Age, sex, height, weight, activity—standard Mifflin–St Jeor style inputs on the page.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>BMR estimate × activity factor → maintenance calories (see script for exact coefficients).</p>`,
    "kilometers-to-miles-converter.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li>Enter km or mi; the tool converts using a fixed conversion factor.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>1 mi = 1.609344 km (definition used for conversion).</p>`,
    "celsius-to-fahrenheit-converter.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li>Celsius and/or Fahrenheit fields.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p><em>°F = °C × 9/5 + 32</em>; inverse for °C.</p>`,
    "gpa-calculator.html": `<h3>${escapeHtml(L.methodologyInputs)}</h3>
<ul><li>Course grades and credit hours as implemented on the page.</li></ul>
<h3>${escapeHtml(L.methodologyFormula)}</h3>
<p>GPA = weighted average of grade points by credit hours (match the page’s grade scale).</p>`
  };

  if (specific[key]) {
    return methodologyDetailsWrap(helpers, lang, specific[key]);
  }
  return generic();
}

function buildMethodologySection(entry, helpers) {
  const lang = entry.lang || "en";
  const fam = entry.family;

  if (fam === "currencyConverter") {
    return methodologyCurrency(helpers, entry, lang);
  }
  if (fam === "loanPaymentByAmount") {
    return methodologyLoanLadder(helpers, entry, lang);
  }
  if (fam === "salaryToHourlyByAmount") {
    return methodologySalaryLadder(helpers, entry, lang);
  }
  if (fam === "spanishPilotPage") {
    return methodologySpanishPilot(helpers, entry.formulaType || "percentage", lang);
  }
  if (fam === "statePaycheckPilotPage") {
    return methodologyStatePaycheck(helpers, entry, lang);
  }
  if (fam === "legacyStaticPage") {
    const fn = entry.pagePath || entry.fileName;
    return methodologyLegacyByFileName(helpers, fn, lang);
  }

  return "";
}

module.exports = { buildMethodologySection };
