# Page Generation Automation

This project now includes a config-driven generator so you can scale from tens of pages to hundreds with minimal manual edits.

## Files

- `pages.config.json`: Source of truth for what pages to generate.
- `scripts/generate-pages.js`: Builds pages from config and updates:
  - generated pages (`*.html`)
  - `generated-calculators.html`
  - `sitemap.xml`
- `scripts/validate-pages.js`: Validates metadata/link quality.
- `package.json`: Includes npm scripts.

## Commands

```bash
npm run generate:pages
npm run validate:pages
```

## Current Families

Configured in `pages.config.json`:

- `currencyConverter` (from/to pairs)
- `loanPaymentByAmount` (amount-based pages)
- `salaryToHourlyByAmount` (amount-based pages)

With current config, generation target is 100 pages.

## How to Scale to 300+

1. Open `pages.config.json`.
2. Add more currency pairs and/or amount values.
3. Run:
   - `npm run generate:pages`
   - `npm run validate:pages`
4. Commit and push.

## Overwrite behavior

Generator is safe by default:

- It skips existing files unless `--overwrite` is used.

Manual overwrite:

```bash
node scripts/generate-pages.js --overwrite
```
