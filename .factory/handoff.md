# APK Provenance Locker handoff

## What shipped

- Local-first Vite PWA at `dist/` and a Capacitor 6 Android project using app id
  `in.sociobot.apk_provenance_locker`.
- APK inventory flow: choose a lawful APK, record name/version/source, calculate
  SHA-256 locally, retain an optional IndexedDB copy, and extract v2/v3 signing
  certificate evidence where available. v1-only signer evidence is explicitly
  marked unavailable rather than guessed.
- Password-encrypted restoration kits (PBKDF2-SHA256, 210,000 iterations and
  AES-GCM) that include records and saved APK copies. Validation re-hashes saved
  copies and reports matches or mismatches.
- Signer-drift warning when a newly recorded app name has different readable
  signer evidence than an earlier record.
- Isolated `/demo` with seeded F-Droid and KeePassDX records, plus reset and
  real-data exit controls.
- `/privacy`, `/terms`, PWA manifest/service worker, offline shell, sitemap,
  robots, static-web-app security headers, and paid-license checkout/restore
  contract for the optional $12 Locker Plus tier.
- Original hero illustration at `src/assets/archive-locker.png`; optimized
  `public/archive-locker.webp` is 75 KB. Prompt provenance is in the adjacent
  JSON and visual rationale is in `design.md`.

## Verification

Run from a clean clone:

```sh
npm install
npm test
npm run build
```

Verified on 2026-08-28:

- `npm test`: 4 passing tests, including each claim tag in `claims.json`.
- `npm run build`: passed; `dist/index.html` is the deploy root. Initial JS is
  19.00 KB raw / 7.33 KB gzip and CSS is 8.78 KB raw / 2.84 KB gzip.
- Playwright mobile smoke at 390×844: exactly one h1 and one main landmark,
  correct title, demo banner present, and no console errors.
- axe Playwright scan of `/demo`: zero violations after fixing contrast and the
  banner live region.
- Playwright offline reload after the first `/demo` visit: title and h1 loaded
  successfully from the service worker cache.
- Lighthouse was invoked against the local demo. The bundled Chromium crashed
  during final screenshot collection, so no Lighthouse score is reported. The
  separate axe, console, mobile, and offline checks above passed.

## Android release

`.github/workflows/android.yml` installs JDK 17 and Android SDK, generates an
ephemeral release keystore in CI, runs `assembleRelease bundleRelease`, writes
SHA256SUMS, and attaches APK/AAB assets to the version-tag GitHub Release. The
current worker image has no Java runtime (`JAVA_HOME` and `java` are absent),
so a local `assembleDebug` could not be run here. The native project was added
and `npx cap sync android` passed.

For a store listing, replace the ephemeral CI signing key with the owner's
upload key; never commit that key. The release link on the landing page is in a
publishing state until the first GitHub Release exists.

## Known limits / next steps

- Android v1/JAR certificates are reported as unavailable; v2/v3 signer blocks
  are read in-browser. A native `apksigner` verification bridge would broaden
  certificate coverage in a later Android-focused iteration.
- App package identifiers and version labels are user-recorded in this v1;
  parsing binary AndroidManifest.xml is deliberately not guessed.
- Validate restore kits checks the included saved copies. If a kit contains
  metadata-only records, it clearly reports `missing copy`; users can compare
  a separately selected APK in the locker.
