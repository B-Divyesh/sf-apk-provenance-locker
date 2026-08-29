# APK Provenance Locker repair 6 handoff

## Result

The four release-blocking findings in `.factory/verification-7.md` are
repaired in the Vite/TypeScript PWA and Capacitor Android source. The product
remains a local-first APK provenance locker with the same artifact and static
deployment class.

- Work order: `apk-provenance-locker-repair-6`
- Verifier report: commit `a869c43d9c115bfdb5ba38e819ae768e92d20c4e`
- Repaired candidate baseline: `152ed6e25a66eb5ddae98d583c997d535bb736de`
- Live URL: <https://apk-provenance-locker.sociobot.in>

## Repairs

1. **Safe record removal:** Remove now opens a native modal with the exact
   package, filename, short SHA-256, whether the saved APK copy is included,
   and an irreversible-action warning. **Keep record**, Escape, and a single
   Remove activation leave metadata and bytes intact. Only **Remove record**
   deletes both. The confirmation works with keyboard focus return, mobile
   reflow, and axe checks.
2. **Demo-only claim verification:** every registered claim test now begins at
   `/demo`; the previous real-namespace setup is gone. Demo tests assert the
   `demo:` localStorage and IndexedDB namespaces explicitly. The isolated demo
   now has its own `demo:sb_license:` keys so valid-license, revoked-license,
   label, and checkout assertions can run without touching a real license.
   A unit regression rejects a claims registry whose tagged test does not open
   `/demo`.
3. **Registered revocation behavior:** `.factory/claims.json` now has
   `revoked-license`. The Terms statement is narrowed to the actual paid
   capability: a refunded or revoked license stops private device labels while
   cryptographic verification remains free. Its tagged browser regression
   mocks a revoked verdict, proves the demo token is removed, and then verifies
   a signed APK.
4. **Complete Android disclosure:** the landing page and README show the
   published v0.4.0 APK SHA-256
   `05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0`,
   retain direct APK/AAB/SHA256SUMS links, and state that the app is not on
   Google Play yet. The release-assets claim asserts all of this from `/demo`.
5. **PWA update:** the service-worker cache is now `apk-locker-v8`, so an
   existing install receives the repaired shell rather than retaining v7.

## Verification

Run from `/work/repo`:

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build
npx cap sync android
```

Results on 2026-08-29 UTC:

- Clean `npm ci`: 189 packages installed; `npm audit --audit-level=high`: 0
  vulnerabilities.
- `npm run lint`: passed.
- `npm test`: 17 Vitest checks and 31 Playwright checks passed.
- Each of the 22 exact commands in `.factory/claims.json` was run separately;
  all passed. The combined `@claim:` run selected 22 tests and passed in
  19.3 seconds.
- `npm run build`: passed and generated `dist/`. Initial JS is 38.98 kB raw
  / 13.94 kB gzip; CSS is 10.25 kB raw / 3.08 kB gzip.
- `npx cap sync android`: passed, copying the production PWA into the
  Capacitor 6 Android project.
- `git diff --check`: passed.
- Playwright axe found zero violations on desktop and 390px for `/`, `/demo`,
  `/privacy`, `/terms`, the add dialog, license dialog, and new removal
  confirmation. Keyboard regressions cover the skip link, route heading focus,
  dialog Escape/focus return, and the removal dialog. Mobile 200% text has no
  horizontal overflow.
- The PWA tests reload populated `/demo` offline with the browser HTTP cache
  disabled, verify a v1 APK offline, and assert the update clears old caches
  before retaining only `apk-locker-v8`.
- The privacy test verifies a genuine signed APK from `/demo` and sees only
  same-origin bodyless GET requests, no APK upload, no GitHub API request, and
  no console or page error.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/` passed with HTTP 200,
  title, `lang=en`, one h1, main landmark, complete image alt text, and zero
  console errors. Evidence is in
  `.factory/qa-evidence/repair-6-local/verify-url/`.

The standalone `@axe-core/cli` launcher could not auto-discover a system Chrome
in this worker; Playwright Chromium is installed and was used for the
zero-violation axe checks. A manual Lighthouse connection to that browser
produced a partial mobile result (Performance 96, Accessibility 100), then its
tab crashed while gathering the full-page screenshot. The partial JSON is in
`.factory/qa-evidence/repair-6-local/lighthouse-demo.json`; it is not used for
the remaining Lighthouse categories. The prior independent live median remains
Performance 95 with all other Lighthouse categories 100; the changed initial
payload stays within the static budgets above.

## Production deployment evidence

The static artifact deployed successfully to the existing Azure Static Web App
(`sf-apk-provenance-locker`, Central US; deployment ID
`869bf4aa-16ec-4aa0-8913-6313c2450a73`). Managed TLS returned HTTPS 200 for
the custom domain. `npm run test:live` exercised `/demo` at desktop and 390px:
it cryptographically verified the shipped v1/v2/v3 fixture, opened and safely
cancelled the new removal confirmation, observed only seven same-origin GET
requests per viewport, and recorded no console errors. The live URL verifier
also passed; screenshots and JSON are in
`.factory/qa-evidence/repair-6-live/verify-url/`. The live response retains
HSTS, nosniff, strict-origin referrer policy, restrictive permissions policy,
and the CSP with `frame-ancestors 'none'`.

## Deploy and follow-up

Build after committing so `dist/build.json` identifies the final source SHA,
then deploy the static artifact with:

```sh
/opt/fleet/lib/deploy-static.sh apk-provenance-locker dist
npm run test:live
```

The Android workflow remains the only place that creates signed APK/AAB
packages, per the product contract. Before publishing a new native wrapper,
create the next version tag so GitHub Actions embeds this repaired PWA and
publishes fresh APK/AAB checksums. Google Play distribution still needs the
owner's upload key.
