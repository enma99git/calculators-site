# AdSense & monetization readiness checklist

Use this before applying to AdSense and before turning ads on. Check items off as you complete them. Google’s policies and product requirements change; verify the latest [AdSense Help](https://support.google.com/adsense/) and [Program policies](https://support.google.com/adsense/answer/48182) when you apply.

### Progress (started in repo)

After pulling changes, run **`node scripts/generate-pages.js`** so `about.html`, `contact.html`, `privacy.html`, `terms.html`, and `es/*` counterparts regenerate.

- [x] **Privacy (EN + ES)** — expanded in `scripts/generate-pages.js`: analytics, advertising/cookies, Google policy links, Ads Settings link, GitHub Pages hosting, contact/forms, minors, external links, policy changes.
- [x] **Terms (EN + ES)** — added **Advertising** and **Intellectual property** sections in the generator.
- [x] **Informational footer** — replaced calculator-style trust boilerplate with a short **Site information** / **Información del sitio** block on About, Contact, Privacy, Terms (`informationalFooterHtml` in `generate-pages.js`).
- [x] **About (EN)** — one sentence reinforcing that tools are not a substitute for professional advice.
- [x] **`pages.config.json`** — `analytics.measurementId` set to `G-MCGS825TDW` to match `site-analytics.js`.
- [x] **`MONETIZATION_WEEKLY_CHECKLIST.md`** — links here under Monetization Readiness.
- [x] **Canonical URLs** on About, Contact, Privacy, Terms (and `es/` versions) via `writeInformationalPages` → `htmlShell` `canonicalPath` using `pages.config.json` `siteUrl`.

**Still manual / follow-up:** Search Console property & sitemap, custom domain decision, **CMP / consent** for EEA/UK/CH if needed, deeper **EEA lawful-basis** language in Privacy after legal review, **`ads.txt`** after you have a publisher ID, AdSense application itself.

---

## 1. Site access & technical baseline

- [ ] Site loads over **HTTPS** on the URL you will submit (custom domain or `*.github.io`).
- [ ] **No broken** critical pages (home, hubs, About, Contact, Privacy, Terms).
- [ ] **Robots**: `robots.txt` allows crawling of content you want monetized; important pages are not accidentally `noindex`.
- [ ] **Sitemap** submitted in Google Search Console for that property.
- [ ] **Canonical URLs** consistent (avoid duplicate `www`/non-`www` or mixed hosts once you choose a primary).

---

## 2. Required / expected pages (trust & policy)

- [ ] **About** — who runs the site, what it offers, editorial intent (helps E-E-A-T and reviewer context).
- [ ] **Contact** — working way to reach you (form or email).
- [ ] **Privacy Policy** — updated to cover:
  - [ ] **Analytics** (e.g. GA4): what is collected, roughly why.
  - [ ] **Advertising** (Google and other ad tags): cookies/storage, personalized vs non-personalized where relevant.
  - [ ] **Third parties** — name Google (AdSense) and link to [Google’s privacy](https://policies.google.com/privacy) / [how Google uses data from sites](https://policies.google.com/technologies/partner-sites).
  - [ ] **User choices** — e.g. [Google Ads Settings](https://adssettings.google.com/), industry opt-outs where you mention them.
  - [ ] **EEA/UK/CH** (if you target or receive that traffic): lawful bases, retention, rights — align with your CMP (below).
- [ ] **Terms of Use** — includes short **Advertising** section: ads may appear, third-party servers, site provided “as is,” limits of calculator output.
- [ ] **Footer** (or equivalent) links to About, Contact, Privacy, Terms on **calculator templates** and hub pages.

---

## 3. Consent & cookies (especially EEA / UK / CH)

- [ ] Decide whether you will serve **personalized** ads, **non-personalized only**, or region-specific behavior.
- [ ] If you need consent for your traffic mix: implement a **Google-certified CMP** (Consent Mode v2 / IAB TCF as required for your setup) and test in **Tag Assistant** / **Consent Mode** diagnostics.
- [ ] Document in Privacy Policy how consent choices affect ads and analytics.

---

## 4. After AdSense approval (ads go live)

- [ ] Publish **`/ads.txt`** at the site root with your Google publisher line (format per [Google ads.txt spec](https://support.google.com/adsense/answer/7532444)).
- [ ] **Ad placement UX**: avoid pushing core calculator controls below the fold; respect [Better Ads Standards](https://www.betterads.org/standards/).
- [ ] **Monitor** AdSense policy center and email for violations or limited ads.

---

## 5. Content & “low value” risk (ranking + AdSense)

- [ ] High-intent pages (major finance/health) have **unique** intro copy, not only the widget + boilerplate.
- [ ] **Methodology / disclaimers** on sensitive calculators (finance, tax, health) where appropriate.
- [ ] **Informational pages** (About, Privacy, Terms, Contact) do **not** reuse calculator-only boilerplate (e.g. “How this result is estimated” where it doesn’t fit).
- [ ] Use **GSC** to watch indexed vs excluded URLs; prune or `noindex` only with a deliberate strategy (see your monetization backlog / data gates).

---

## 6. Analytics & measurement (for decisions, not AdSense approval)

- [ ] **GA4** property matches the ID in `site-analytics.js` (and optionally sync `pages.config.json` `analytics.measurementId` if you use it elsewhere).
- [ ] Key events firing (e.g. calculator use) — verify in **DebugView** or reports.
- [ ] **Search Console**: coverage, Core Web Vitals (field data when available), queries for top pages.

---

## 7. Brand, domain, and long-term monetization

- [ ] **Custom domain** (optional but recommended): DNS + GitHub Pages custom domain + update `siteUrl` / canonicals / sitemap base URL in config/generator.
- [ ] If you add **affiliates** or sponsored placements: **clear disclosure** on affected pages and in Terms/Privacy as needed.

---

## 8. Application day (quick pass)

- [ ] Apply with the **same URL** users see (primary canonical).
- [ ] Remove or fix any **placeholder** / “under construction” main content on that host.
- [ ] Re-read **Program policies** for restricted verticals (your calculators are generally standard, but finance/health deserve extra care on claims and disclaimers).

---

## Related repo docs

- `MONETIZATION_WEEKLY_CHECKLIST.md` — ongoing ops after launch.
- `MONETIZATION_PHASE2_PHASE3_BACKLOG.md` — content scale planning.
- `MONETIZATION_PAGE_AUDIT.md` — de-duplication and intent coverage.
