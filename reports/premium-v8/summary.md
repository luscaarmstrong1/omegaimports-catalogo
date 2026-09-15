# Premium site audit v8

Generated: 2026-07-22

## Scope

- Existing OMEGAIMPORTS static catalog.
- Public routes: home, products, categories, blog, article, product detail, about, privacy and 404.
- Viewports: 320, 360, 375, 390, 412, 480, 768, 820, 1024, 1280, 1366, 1440, 1920 and 2560 px.

## Relevant Findings

| Severity | Category | Finding | Evidence | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| P1 | Security | `xlsx@0.18.5` had high-severity advisories in `pnpm audit`. | Baseline `pnpm audit --audit-level high` reported prototype pollution and ReDoS in SheetJS. | Removed `xlsx`; replaced XLSX import with local zip/XML parsing via `fflate` and `fast-xml-parser`. | Fixed |
| P2 | XSS surface | Catalog filter button rewrote markup using `innerHTML`. | `public/assets/site.js` used `outerHTML` + `innerHTML` to update the filter label. | Added `.filter-toggle-label` and now updates only `textContent`. | Fixed |
| P2 | Accessibility | Some secondary text links had a visible target below 32 px. | Browser audit detected header CTA, breadcrumbs, article TOC, image link, footer summaries and one product title link. | Added minimum target heights and inline-flex alignment to those controls. | Fixed |
| P2 | Security headers | GitHub Pages cannot set custom HTTP security headers from this repo. | Hosting is GitHub Pages. | Documented limitation and correct infrastructure layer in `SECURITY.md`; avoided fake meta-header controls. | Documented |

## Validation

- Build, lint, typecheck, unit tests, static E2E, link audit, SEO audit, blog audit and encoding audit passed.
- Dependency audit now reports no known high-severity vulnerabilities.
- Browser audit passed with no horizontal overflow, console errors, failed requests, duplicate IDs, missing image alt attributes, target blank rel issues, small touch targets under 32 px, or H1/main issues on tested routes.
- Menu, search and catalog filters responded at applicable widths.

## Performance

The browser report includes lab proxy fields per route/viewport:

- `resourceTransferKB`
- `domCompleteMs`

These are not field Core Web Vitals. Lighthouse could not run in the local environment because the project helper reported Lighthouse/Chrome unavailable.

## Residual Risks

- HTTP security headers still depend on an infrastructure layer compatible with custom headers, such as Cloudflare or another proxy/host.
- Real marketplace data integrity still depends on the Mercado Livre source and the existing product audit rules.
- The XLSX importer was not exercised against a local real export during this run because the expected Downloads file was not present.
