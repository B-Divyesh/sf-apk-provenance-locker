# Polish round 2 — finding closure

Base reviewed: `d70e5a2bddb822cc4cc2160658db2854ee556802`.
Repair: `752f078cf2c007e013182e34fedb5240c636427a`.
Live URL: <https://apk-provenance-locker.sociobot.in>.

Every earlier review, polish report, and verification report was reread. The
table maps each still-relevant review finding to the shipped result. Evidence
screenshots are in `.factory/evidence/polish-2/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the complete standalone 404 metadata and rechecked it after deployment. | `static 404 has complete route metadata and shared recovery navigation`; live `https://apk-provenance-locker.sociobot.in/not-a-real-route` is HTTP 404 with its route title and one main. |
| F-1-2 | Retained the shared Demo/Locker/Privacy header and Privacy/Terms footer on 404. | Same static-404 test; live route skeleton check. |
| F-1-3 | Kept “Local APK verification.” | `keeps reviewed visitor copy concrete…`; live `/` recheck. |
| F-1-4 | Kept “Your verified APK records.” | Same copy regression test; live `/demo` screenshot. |
| F-1-5 | Kept “Read the package and version.” | Same copy regression test; live `/` recheck. |
| F-1-6 | Kept “Check signer and downgrade risks.” | Same copy regression test; live `/` recheck. |
| F-1-7 | Kept the concrete footer storage sentence. | `@claim:local-storage`; live `/demo` footer. |
| F-1-8 | Kept generated-art provenance out of visitor copy. | Copy regression test; live `/` text check. |
| F-1-9 | Kept release-key assertions out of visitor copy. | Copy regression test; live `/` and README search. |
| F-1-10 | Removed every Google Play sentence from landing, README, and tests. | `@claim:release-assets`; live `/` text check asserts no Google Play text. |
| F-1-11 | Kept the README release wording split into short sentences. | `.factory/copy-audit.md`; README check. |
| F-1-12 | Replaced the remaining certificate-history variants with “signing history.” | `.factory/copy-audit.md`; live and README copy check. |
| F-1-13 | Kept the password-encryption outcome before algorithm names. | `@claim:encrypted-export`; README audit. |
| F-2-1 | Built a product-first `/demo`: banner, sample title, locker controls, and seeded records precede marketing sections. | `opens sample records above the fold from the first-screen demo action`; live 390 px y=638.39 record check; `.factory/evidence/polish-2/live-demo-mobile.png`. |
| F-2-2 | Replaced merchant/refund assertions with “Locker Plus uses Sociobot’s hosted checkout.” | `@claim:hosted-checkout`; live `/terms` text check rejects the removed assertions. |
| F-2-3 | Validation now offers per-copy **Download verified APK** and **Import verified records**. Imports are revalidated first and show a keep-or-replace conflict choice. | `@claim:restore-import`, `@claim:saved-apk-download`, and `shows a conflict choice before replacing a matching local record`; live restore flow compared 16,791 downloaded bytes. |
| F-2-4 | Changed sample-action help to “Open two sample APK records.” | Copy regression test; live `/` recheck. |
| F-2-5 | Rewrote the audience sentence around apps, versions, signing history, and file fingerprints. | `.factory/copy-audit.md`; live `/` first-screen check. |
| F-2-6 | Renamed the license action to “Restore Locker Plus license.” | `@claim:paid-unlock`; live `/` and `/demo` recheck. |
| F-2-7 | Replaced browser/verifier implementation jargon with the Android-signature-rules outcome; moved adapter detail to developer documentation. | `.factory/copy-audit.md`; live `/` and README recheck. |
| F-2-8 | Replaced “restoration record” with “restore kit.” | `.factory/copy-audit.md`; README recheck. |
| F-2-9 | Renamed the README heading to “Use APK Provenance Locker.” | `keeps reviewed visitor copy concrete…`; README recheck. |
| F-2-10 | Standardized user-facing certificate-change language on “signing history.” | `.factory/copy-audit.md`; `@claim:signature-verification` and `@claim:signer-drift`. |
| F-2-11 | Removed the Google Play release-maintainer note from user download copy. | `.factory/copy-audit.md`; README recheck. |

## Verification

- Clean clone `/tmp/apk-provenance-clean-cWc0de`: `npm ci`, `npm run lint`,
  `npm test` (17 unit/config and 38 browser tests), and `npm run build` passed.
- Each of the 25 exact commands in `.factory/claims.json` passed separately
  from that clean clone.
- `npx cap sync android` passed after the final build.
- `npm run test:live` passed after deploy at desktop and 390 px: verified a
  genuine fixture, confirmed removal cancellation, made five same-origin GETs
  per flow, and emitted no console errors.
- Factory `verify-url.sh` passed on local `/` and `/demo`, then live `/demo`:
  title, language, one H1, one main, alt text, labels, and console checks pass.
- Playwright axe coverage in `passes axe, has one page structure, and fits
  mobile at 200% text` passes on all product routes and dialogs. The standalone
  axe CLI could not launch a matching ChromeDriver in this worker; its matching
  Playwright axe integration is the recorded accessibility authority.
- Static deployment `29cbf23f-8309-4630-8365-4c19ff0c79a6` succeeded. Live
  `/build.json` names repair `752f078`; `/`, `/demo`, `/privacy`, and `/terms`
  return 200 and unknown routes return 404.
