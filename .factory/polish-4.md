# Polish round 4 — cumulative finding closure

Reviewed base: `1113b926d5723234332bbc20cb15326a2d330862`.
Final product commit: `0809df82645dfecf73c1d9f592cc79728b2495e3`.
Live URL: <https://apk-provenance-locker.sociobot.in>.
Final deployment: `f04cc380-48f6-492f-923a-79b6ebaf92fd`.
Android release: <https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/tag/v0.5.5>.

Every review and polish report was reread. This table maps every numbered
finding to its final change and evidence. The live screenshots are
`.factory/evidence/polish-4/live/root/screenshot-mobile.png`,
`.factory/evidence/polish-4/live/demo-one-click-mobile.png`,
`.factory/evidence/polish-4/live/free-core-features-mobile.png`, and
`.factory/evidence/polish-4/live/404-mobile.png`. Machine-readable results are
in `clean-clone.json`, `release.json`, and `live/audit.json` beside them.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained complete 404 description, canonical, icons, theme, Open Graph, and Twitter metadata. | Test `static 404 has complete route metadata and shared recovery navigation`; `live/404-mobile.png`; live `/not-a-real-route` returned 404 with canonical `/404`. |
| F-1-2 | Retained the shared Demo, Locker, Privacy, Privacy/Terms, wordmark, and build footer on 404. | Same static-404 test; `live/404-mobile.png`; live 404 link/landmark audit passed. |
| F-1-3 | Kept “Local APK verification.” | Test `keeps reviewed visitor copy concrete and discloses the published Android package`; `live/root/screenshot-mobile.png`; live `/`. |
| F-1-4 | Kept “Your verified APK records.” | Same copy test; `live/demo-one-click-mobile.png`; live `/?demo=1`. |
| F-1-5 | Kept “Read the package and version.” | Same copy test; `live/root/screenshot-desktop.png`; live `/`. |
| F-1-6 | Kept “Check signer and downgrade risks.” | Same copy test and `@claim:free-core-features`; live `/`. |
| F-1-7 | Kept the concrete device-storage footer. | `@claim:local-storage`; `live/404-mobile.png`; all live routes. |
| F-1-8 | Kept generated-art provenance out of visitor copy while preserving it in `design.md`. | Copy regression test; `live/root/screenshot-mobile.png`; live `/` text audit. |
| F-1-9 | Kept the unproved release-key statement out of landing and README. | Copy regression test; published `npm run test:release`; live `/`. |
| F-1-10 | Kept Google Play assertions out of landing, README, and tests. | `@claim:release-assets` and copy regression test; live `/`. |
| F-1-11 | Kept release instructions as short, single-idea sentences. | `.factory/copy-audit.md`; static copy test; GitHub README at final commit. |
| F-1-12 | Kept the plain signing-key-change explanation. | `.factory/copy-audit.md`; `@claim:signer-drift`; final README. |
| F-1-13 | Kept the password-encryption outcome before algorithm names. | `.factory/copy-audit.md`; `@claim:encrypted-export`; final README. |
| F-2-1 | Retained product-first demo rendering and the required `/?demo=1` action. | Test `opens sample records above the fold from the first-screen demo action`; `live/demo-one-click-mobile.png`; first live record y=638 in an 844px viewport. |
| F-2-2 | Kept only the tested Sociobot hosted-checkout wording in Terms. | `@claim:hosted-checkout`; live `/terms`; zero unregistered merchant/refund copy. |
| F-2-3 | Retained verified-record import, conflict choice, and verified saved-APK download. | `@claim:restore-import`, `@claim:saved-apk-download`, and `shows a conflict choice before replacing a matching local record`; live `/demo`. |
| F-2-4 | Kept “Open two sample APK records.” beside the sample action. | Copy regression test; `live/root/screenshot-mobile.png`; live `/`. |
| F-2-5 | Kept the first-screen audience sentence in plain app/version/signing-history/file-fingerprint language. | `.factory/copy-audit.md`; `live/root/screenshot-mobile.png`; facts end at y=764. |
| F-2-6 | Kept the result-naming “Restore Locker Plus license” action. | `@claim:paid-unlock`; live `/?demo=1`. |
| F-2-7 | Kept the Android-signature-rules outcome on the site and implementation detail in developer documentation. | Copy regression test; `@claim:signature-verification`; live `/`. |
| F-2-8 | Kept “restore kit” as the sole encrypted-export term. | `.factory/copy-audit.md`; `@claim:encrypted-export`; final README. |
| F-2-9 | Kept the contextual “Use APK Provenance Locker” README heading. | Copy regression test; final README. |
| F-2-10 | Kept “signing history” as the single visitor-facing certificate-history term. | `@claim:signature-verification`, `@claim:signer-drift`, and `.factory/copy-audit.md`; live `/`. |
| F-2-11 | Kept upload-key and Google Play maintainer jargon out of download copy. | Copy regression test; final README; live `/`. |
| F-3-1 | Retained one `leaveDemo()` path for Start for real, Locker, and wordmark, including records, IndexedDB, and demo license cleanup. | `@claim:demo-sandbox`; published `npm run test:release`; live audit repeated all three exits with real sentinels preserved. |
| F-3-2 | Kept “SHA-256 file fingerprint” as the introduced digest term and “file fingerprint” thereafter. | `@claim:hash-check`; `.factory/copy-audit.md`; `live/root/screenshot-mobile.png`; live `/`. |
| F-4-1 | Added the `free-core-features` claim and a fresh no-license test covering v1/v2/v3 verification, signer warning, downgrade warning, encrypted export, and decryption. Standardized all four claim locations. | `@claim:free-core-features`; `live/free-core-features-mobile.png`; live `/demo` produced both warnings and reopened the encrypted kit without storing a license. |
| F-4-2 | Renamed the heading to “Develop and verify APK Provenance Locker.” | Test `keeps reviewed visitor copy concrete and discloses the published Android package`; `.factory/copy-audit.md`; final README. |
| F-4-3 | Renamed the heading to “Deploy APK Provenance Locker.” | Same copy test and audit; final README. |
| F-4-4 | Replaced namespace jargon with “The demo keeps its records and files separate from your real locker.” | Same copy test; `@claim:demo-sandbox`; final README and live demo-isolation audit. |
| F-4-5 | Replaced opaque release language with the repository-commit check and the three named exit checks. | Same copy test; published `npm run test:release`; final README. |

## Final verification

- Clean remote clone `/tmp/apk-polish4-final-VLaNjX/repo` at `0809df8`:
  `npm ci` found zero vulnerabilities; all 26 exact claim commands passed;
  lint passed; `npm test` passed 18 unit/config and 39 browser tests; build and
  Capacitor sync passed.
- The browser suite includes axe on every route and dialogs, keyboard/dialog
  focus, 44px targets, 200% text reflow, reduced motion, privacy request logs,
  demo isolation, offline reload, and offline APK verification.
- Initial JavaScript is 42,970 bytes raw / 14,790 bytes gzip. CSS is 11,080
  bytes raw / 3,290 bytes gzip.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1s, CLS 0, total blocking time 20ms.
- Final v0.5.5 workflow run `33274942368` passed. Independent
  `npm run test:release` verified both published packages, their checksums,
  embedded commit, and every packaged demo exit.
- Final live Lighthouse: 100/100/100/100; LCP 1.0s, CLS 0, total blocking time
  40ms. The factory URL verifier reported no console errors on `/` or
  `/?demo=1`; `npm run test:live` passed desktop and mobile with five
  same-origin bodyless GETs per flow.
- Cold live checks passed `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and
  the designed HTTP 404. All routes had correct metadata, one H1/main, legal
  links, zero axe violations, zero overflow, and correct navigation focus.

No numbered finding, discovered regression, or known product defect remains.
