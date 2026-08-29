# Polish round 3 — cumulative finding closure

Base reviewed: `fe78a4d8a6172908a0c6c32c4344741ff4dad904`.
Repair: `e4d1f4eafb9e09b80a9a9a64af42b454505da88f`.
Live URL: <https://apk-provenance-locker.sociobot.in>.
Deployment: `cd211bd3-ab63-4098-88ff-3901de5206f5`.

All review and polish reports were reread. The table records every numbered
finding, including earlier findings that remained fixed. Screenshot evidence
is under `.factory/evidence/polish-3/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained complete static 404 metadata: description, canonical, OG/Twitter, theme, and icon. | `static 404 has complete route metadata and shared recovery navigation`; live `route-recheck.json`; `live/404-mobile.png`; live `/not-a-real-route` HTTP 404. |
| F-1-2 | Retained the shared Demo, Locker, Privacy, Privacy/Terms recovery shell on the 404. | Same static-404 test; `live/404-mobile.png`; live `/not-a-real-route`. |
| F-1-3 | Kept the concrete eyebrow “Local APK verification.” | `keeps reviewed visitor copy concrete…`; `live/screenshot-mobile.png`; live `/`. |
| F-1-4 | Kept “Your verified APK records.” | Same copy regression test; `live/demo-query-mobile.png`; live `/?demo=1`. |
| F-1-5 | Kept “Read the package and version.” | Same copy regression test; live `/`. |
| F-1-6 | Kept “Check signer and downgrade risks.” | Same copy regression test; live `/`. |
| F-1-7 | Kept the specific device-storage footer. | `@claim:local-storage`; `live/screenshot-mobile.png`; live `/`. |
| F-1-8 | Kept generated-art provenance out of visitor copy; provenance remains in design documentation. | Copy regression test rejects the phrase; `live/screenshot-mobile.png`; live `/`. |
| F-1-9 | Kept release-key assertions out of visitor copy and README. | Copy regression test rejects the phrase; live `/`; README audit. |
| F-1-10 | Kept Google Play assertions out of visitor copy and README. | `@claim:release-assets`; copy regression test; live `/`. |
| F-1-11 | Kept README release instructions as short sentences. | `.factory/copy-audit.md`; clean-clone README audit. |
| F-1-12 | Kept the signing-key-change explanation instead of certificate-rotation jargon. | `.factory/copy-audit.md`; `@claim:signer-drift`; README audit. |
| F-1-13 | Kept the user outcome before encryption algorithm names. | `@claim:encrypted-export`; `.factory/copy-audit.md`; README audit. |
| F-2-1 | Retained the product-first demo and made the first-screen action use the required `/?demo=1` entry. | `opens sample records above the fold from the first-screen demo action`; `local/demo-query-mobile.png`; `live/demo-query-mobile.png`; live `/?demo=1`. |
| F-2-2 | Kept only the tested Sociobot hosted-checkout sentence in Terms. | `@claim:hosted-checkout`; live `/terms`; `live/route-recheck.json`. |
| F-2-3 | Retained verified-record import, conflict choice, and saved-APK download from the validation report. | `@claim:restore-import`; `@claim:saved-apk-download`; full clean-clone suite. |
| F-2-4 | Kept “Open two sample APK records.” next to the primary action. | Copy regression test; `live/screenshot-mobile.png`; live `/`. |
| F-2-5 | Kept the audience sentence concrete and introduced its file digest as a SHA-256 file fingerprint. | `.factory/copy-audit.md`; `live/screenshot-mobile.png`; live `/`. |
| F-2-6 | Kept the result-naming “Restore Locker Plus license” action. | `@claim:paid-unlock`; live `/?demo=1`. |
| F-2-7 | Kept Android-signature-rules outcome copy and confined adapter detail to developer README text. | `.factory/copy-audit.md`; live `/`; README audit. |
| F-2-8 | Kept “restore kit” as the one encrypted-export term. | `.factory/copy-audit.md`; README audit. |
| F-2-9 | Kept the contextual README heading “Use APK Provenance Locker.” | Copy regression test; README audit. |
| F-2-10 | Kept “signing history” as the one certificate-change term. | `@claim:signature-verification`; `@claim:signer-drift`; `.factory/copy-audit.md`. |
| F-2-11 | Kept upload-key and Google Play maintainer jargon out of user download copy. | Copy regression test; README audit; live `/`. |
| F-3-1 | Replaced load-time demo state with route-aware detection. All internal demo exits call `leaveDemo()`, which clears demo records, IndexedDB, and demo license keys before navigation; non-demo boot also clears stale demo storage. Reset clears the same isolated namespace. | Expanded `@claim:demo-sandbox` tests Start for real, Locker, and wordmark with real localStorage/IndexedDB sentinels; live three-exit recheck passed; `live/demo-query-mobile.png`; live `/?demo=1`, `/`, and `/#locker`. |
| F-3-2 | Introduced “SHA-256 file fingerprint” once, then used “file fingerprint” consistently in landing, evidence, download, README, metadata, claims, demo docs, and catalog copy. | `keeps reviewed visitor copy concrete…`; `@claim:hash-check`; `.factory/copy-audit.md`; `live/screenshot-mobile.png`; live `/`. |

## Verification

- Clean clone `/tmp/apk-provenance-polish3-DKnwWi`: `npm ci`, `npm run lint`,
  all 25 exact commands in `.factory/claims.json`, `npm test` (17 unit/config
  and 38 browser tests), `npm run build`, and `npx cap sync android` passed.
- The test command for every claim was independently invoked as
  `npm test -- --grep @claim:<id>`; the final Playwright run recorded
  `status: passed` with no failed tests.
- Local `verify-url.sh` passed with no console errors, one H1/main, language,
  title, and complete image/button checks. Local Playwright axe found zero
  violations on `/?demo=1` and `/404.html`; the full suite covers app routes
  and dialogs at 200% text.
- Local Lighthouse: performance 100, accessibility 100, SEO 100. The initial
  JavaScript is 42,820 bytes raw / 14,770 bytes gzip. Evidence:
  `local/lighthouse.json`, `local/verify.json`, `local/demo-query-mobile.png`,
  and `local/404-mobile.png`.
- Live `/build.json` names repair `e4d1f4e`; live `/`, `/?demo=1`, `/demo`,
  `/privacy`, and `/terms` return 200, while `/not-a-real-route` returns 404.
  `verify-url.sh` and `npm run test:live` passed with zero application console
  errors and same-origin GET-only verification flows. `live/route-recheck.json`
  records mobile metadata, zero axe violations, zero unexpected console errors,
  and no horizontal overflow for every route. The browser's expected top-level
  404 network message is not an application console error.

No review finding remains unresolved.
