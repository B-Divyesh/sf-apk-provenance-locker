# APK Provenance Locker — polish round 2 handoff

## Result

Repair commit `752f078cf2c007e013182e34fedb5240c636427a` closes every finding in
`.factory/review-1.md` and `.factory/review-2.md`. It is pushed to `main` and
tagged `v0.5.2`. The deployed static build is live at
<https://apk-provenance-locker.sociobot.in>.

The release has a product-first one-click demo, plain first-screen copy, real
encrypted-kit import and verified-copy download behavior, conflict-aware
restore imports, corrected legal and download copy, complete claim coverage,
and Android release links for the matching version.

## Run and verify

```sh
npm ci
npm run lint
npm test
npm run build
npx cap sync android
```

Run every exact command from `.factory/claims.json`. The isolated demo is
`/demo` or `/?demo=1`; it uses `demo:apk-locker:records` and
`demo:apk-locker-files` only. **Reset demo** reseeds it, and **Start for real**
erases its separate storage.

## Exact evidence

- Clean clone `/tmp/apk-provenance-clean-cWc0de` completed `npm ci`, lint,
  `npm test` (17 unit/config + 38 browser), build, and all 25 exact claim
  commands independently.
- Local build: JS 42,010 B raw / 14,550 B gzip; CSS 11,080 B raw / 3,290 B
  gzip. `dist/build.json` names `752f078` and `0.5.2`.
- Playwright axe passes all routes, dialogs, and 390 px/200% reflow.
  `verify-url.sh` reported zero console errors, one H1/main, `lang=en`, and no
  missing image alternatives for local `/`, local `/demo`, and live `/demo`.
  The separate axe CLI could not run because its ChromeDriver targets Chrome
  152 while the worker browser is 145; the pinned Playwright axe suite passed.
- Live demo: the first record starts at y=638.39 on a fresh 390×844 page.
  Screenshots: `.factory/evidence/polish-2/live-demo-mobile.png` and
  `.factory/evidence/polish-2/live-demo-desktop.png`.
- Live restore flow exported and revalidated a kit, downloaded a 16,791-byte
  verified APK matching the fixture byte-for-byte, and displayed the
  conflict-safe replacement choice. No console errors.
- Live `/`, `/demo`, `/privacy`, and `/terms` return 200; unknown URLs return
  HTTP 404. Routes have titles, one H1/main, and legal links. Terms has no
  merchant/refund assertion; landing has no Google Play assertion.
- Post-deploy `npm run test:live` passed desktop and mobile fixture verification
  plus removal cancellation with five same-origin GETs each and no request body.
- Azure Static Web Apps deployment `29cbf23f-8309-4630-8365-4c19ff0c79a6`
  succeeded. GitHub Actions run `33263394300` released `v0.5.2`.
- Published release assets: APK 5,588,120 B,
  `67adb0d6c6bf80ceb17ed0db8c8896fc74337c31eba779e24c83e44cfe76ce4c`;
  AAB 5,408,642 B,
  `4c60c62d932390f5051ada05409759920a09e0aa08793f95edaa6267dd0c8d3c`.
  `SHA256SUMS` passed and the APK embeds `0.5.2` / `752f078`.

## Known gaps

None in the reviewed product scope. The APK uses the workflow’s factory-stage
signing key; a future Google Play submission needs the owner’s signing setup,
which is outside this work order.
