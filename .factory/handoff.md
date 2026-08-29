# APK Provenance Locker repair handoff

## Repair scope

Repaired the release blockers independently recorded for candidate
`cd2b886d5de512311eb87b9174e217a62935d3f0`:

- Claim commands now run exactly as written in `claims.json`. Each is a
  Playwright sandbox test of the shipped UI, not a helper-only test.
- Replaced the spread-based base64 conversion with bounded chunks. The browser
  regression test exports a saved 12 MiB APK into an encrypted `.locker` file.
- Recording now rejects non-ZIP files, malformed ZIP directories, and archives
  missing `AndroidManifest.xml`. The UI and README accurately distinguish
  structural checks/certificate evidence from Android's cryptographic install
  signature verification; no v1/v2/v3 cryptographic-verification claim remains.
- Demo and real saved bytes use separate IndexedDB databases. Reset/leave-demo
  deletes the demo database; Remove deletes the corresponding real saved copy.
- Demo sample records no longer falsely claim that an APK copy is included.
  Record cards expose source URL, full hash, and full certificate fingerprint.
  A lower user-entered version produces a downgrade warning.
- Removed the unavailable $12 checkout and license path, including the unsafe
  cross-origin service-worker cache behavior. The service worker is same-origin
  only, precaches its shell, deletes old caches, and surfaces an update reload.
- The Android download area uses the GitHub release API and degrades to an
  honest publishing state. Tag `v0.1.1` triggers the Android workflow, which
  uses `npx cap copy android` before release APK/AAB assets and `SHA256SUMS`.
- Added a designed `404.html`, response/security/cache headers, mobile touch
  target fixes, keyboard route-heading focus, and a dependency override that
  eliminates the prior audit findings while retaining Capacitor 6.

## Verification evidence

Run from a clean checkout:

```sh
npm ci
npm run lint
npm test
npm run build
npx cap copy android
npm audit
```

Verified in this worker on 2026-08-29:

- `npm ci`: completed; `npm audit`: 0 vulnerabilities.
- `npm run lint`: passed.
- `npm test`: 6 Vitest tests and 7 Playwright tests passed. Browser coverage
  includes every claim command, 12 MiB export/download, malformed APK rejection,
  demo/real storage isolation and deletion, 390×844 layout, 44px control height,
  keyboard focus route change, and offline `/demo` reload after first visit.
- `npm run build`: passed; `dist/` created. Initial JS is 21.46 KB raw / 7.95
  KB gzip; CSS is 9.14 KB raw / 2.87 KB gzip.
- Axe (`@axe-core/playwright`) scanned `/`, `/demo`, `/privacy`, and `/terms`
  at 390px with zero violations. The same test asserts no horizontal overflow.
- `npx cap copy android`: passed. A JDK is not installed in this worker, so the
  APK is built in the committed GitHub Actions Android release workflow.

## Deployment and release

The static deploy root remains `dist/`. Push the repair commit to `main` for
the configured static deployment, then push tag `v0.1.1`; `.github/workflows/
android.yml` creates the signed-with-ephemeral-debug-key APK, AAB, and
`SHA256SUMS` GitHub release. The landing page will resolve that release through
the GitHub API once it is published.

## Known limitation

This local-first web app validates the APK container and records a local hash
and readable v2/v3 certificate fingerprint. It deliberately does not present
that as cryptographic Android signature verification or v1 support; Android's
package installer remains the signature authority. A future native verifier can
add `apksigner`-equivalent verification only if it retains this clear boundary.
