# CSL‑App Project

A lightweight, static web app for querying and displaying the U.S. Consolidated Screening List (CSL). All logic is client‑side and lives in `index.html`, `script.js`, and `style.css`.

---

## Quick Start

| Action | Command |
| --- | --- |
| Local preview | `npx serve .` |
| Deploy to GitHub Pages | Push to `main`, enable Pages on `/ (root)` |
| Validate HTML | `npx html-validate index.html` |

_No build or dependency install is required._

---

## Coding Guidelines

1. **UI & Design**  
   * Clean, modern look is essential—use **Bootstrap 5 components wherever possible**.  
   * Avoid custom CSS unless Bootstrap utility classes can’t achieve the effect.

2. **Language / tooling**  
   * Vanilla ES2023, no frameworks.  
   * 2‑space indent, semicolons, single quotes.

3. **Structure**  
   * Keep all new UI in Bootstrap components; do **not** add other CSS frameworks.  
   * Group related state in module‑level objects; avoid expanding the current global list in `script.js`.

4. **Fetch calls**  
   * Always check `response.ok`; show a friendly error banner on failure.  
   * Add `Cache-Control: no-cache` header.

5. **Accessibility**  
   * Label every form control.  
   * Accordion / buttons must be keyboard‑navigable.

6. **Style & naming**  
   * Descriptive variable and function names (`searchResults`, not `sr`).  
   * Use CamelCase with “API”, “URL”, “ID” fully capitalised.

7. **Security**  
   * Never commit secrets; the public demo key already in `script.js` is the only key allowed.  
   * Sanitize any string inserted via `innerHTML`.

---

## Optional Testing

If you add pure functions, place Jest tests in `__tests__/filename.test.js`. No E2E tests are expected at this time.

---

## PR Checklist

- [ ] Manual test: search, pagination, sort, filter, history.
- [ ] ESLint passes (`npx eslint .` once config is added).
- [ ] Lighthouse performance & accessibility ≥ 90.
- [ ] Update `README.md` and this file if you change conventions.
