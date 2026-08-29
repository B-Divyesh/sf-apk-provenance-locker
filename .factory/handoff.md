# APK Provenance Locker repair 5 handoff

## Result

The four release blockers in `.factory/verification-6.md` are repaired. The
product remains a Capacitor 6 Android APK plus a Vite/TypeScript offline PWA.
The researched APK verification, encrypted restore-kit, demo, privacy, and
visual behavior that passed verification 6 is unchanged.

Work order: `apk-provenance-locker-repair-5`

Verifier report commit: `73985aec8e53e566c35af305aa0a2d086867d82b`

Rejected candidate: `aa342a3dce20ea5df5fc3f1b58290ec4b47b607b`

Repair implementation: `d6415d3b3d083e2041c52a484cc6aa880db08d10`

Release: `v0.4.0`, Android version code 4

## Repairs

1. **Android package provenance:** v0.4.0 replaces the stale v0.3.0 links and
   packages. Every Vite build emits `build.json` with its version and source
   commit. The release workflow rejects a tag that differs from the package
   version, rejects a checkout that differs from `GITHUB_SHA`, checks the APK
   app ID/version/signature, and byte-compares every `dist/` file with the copy
   inside the APK before publishing APK, AAB, and `SHA256SUMS` assets.
2. **44 px targets:** the wordmark, focused skip link, and footer legal links
   now have explicit 44 by 44 CSS-pixel minimums. A regression measures all
   three at 1440 by 900 and 390 by 844. The existing 200% mobile reflow check
   remains green.
3. **One-time purchase:** Locker Plus is a real $12 one-time product. It adds
   private device labels without gating APK verification, warnings, deletion,
   accessibility, or restore-kit export. The app stores a restored token under
   `sb_license:apk-provenance-locker`, strips returned tokens from the URL,
   verifies through Sociobot no more than daily, keeps a cached valid verdict
   offline, locks paid behavior after revocation, and lets the user remove the
   local license. The service worker ignores the cross-origin check and the
   request uses `cache: no-store`, so license URLs do not enter Cache Storage.
4. **README claim registry:** the unsupported sentence about workflow checks
   was removed. A static regression prevents both sentences from returning.
   Release-asset and package-provenance behavior now have separate executable
   coverage.

The production Sociobot registry reports slug `apk-provenance-locker`, name
`APK Provenance Locker Plus`, `price_minor: 1200`, currency `USD`, and the
correct product URL. The checkout returned HTTP 303 to a Dodo hosted session.
No Dodo credential or provider endpoint was added to this repository.

## Clean local verification

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

- `npm ci`: 189 packages installed; audit found 0 vulnerabilities.
- `npm run lint`: strict TypeScript check passed.
- `npm test`: 15 unit/config tests and 31 Chromium tests passed.
- All 21 commands in `.factory/claims.json` passed independently. A registry
  test also proves one unique `@claim:<id>` tag exists for every entry.
- `npm run build`: produced `dist/`; initial JS is 38,097 bytes raw / 13,620
  bytes gzip, and CSS is 10,101 bytes raw / 3,032 bytes gzip.
- `npx cap sync android`: copied the production build into the Capacitor 6
  project and updated Android plugins successfully.
- `git diff --check`: passed.

The browser suite covers genuine v1/v2/v3 APK verification, signer lineage,
tamper and malformed-file rejection, identity extraction, downgrade/signer
warnings, 12 MiB and 20-record restore kits, wrong-password recovery, storage
isolation/deletion, checkout, license restore/revocation, and persisted paid
labels. The APK privacy flow still emits only same-origin bodyless GETs.

## Browser, accessibility, PWA, and response evidence

- Factory URL verification at local production `/`: HTTP 200 in 585 ms;
  descriptive title, `lang=en`, one h1, one main, complete image alt text and
  button names, and zero console errors.
- Axe Playwright scans found zero violations on `/`, `/demo`, `/privacy`,
  `/terms`, the APK dialog, and the license dialog.
- Keyboard regressions cover the skip link, SPA heading focus, Enter, Escape,
  and dialog focus return. Reduced-motion checks find no active animation or
  transition durations.
- Desktop and 390 px captures were inspected. At 390 px with 200% text, every
  route and both tested dialogs stay within the viewport.
- Offline tests disable the browser HTTP cache, reload the populated demo, and
  verify a signed APK. The update check completes and leaves only
  `apk-locker-v7` in Cache Storage.
- A 35-request live license burst returned 30 HTTP 200 responses and 5 HTTP
  429 responses; throttled responses included `Retry-After: 2`.
- Local mobile Lighthouse 12.8.2 on `/demo`: Performance 99, Accessibility
  100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.9 s, TBT 90 ms, CLS 0,
  and 93 KiB transferred.

Local evidence is in `.factory/evidence/repair-5-local/`, including desktop
and 390 px screenshots, URL-verifier JSON, and Lighthouse JSON.

## Release and deployment

The final handoff commit is the source for tag `v0.4.0`. Pushing that tag runs
`.github/workflows/android.yml`; the workflow will publish the APK, AAB, and
checksums only after package identity, signature, size, and embedded-candidate
byte checks pass. The static build is deployed from `dist/` with:

```sh
/opt/fleet/lib/deploy-static.sh apk-provenance-locker dist
```

The public web candidate must be checked against `dist/`, and the published
APK's `assets/public/build.json` must identify the same final tagged commit.

## Known gaps

Google Play publication still needs the owner's stable upload key. This
factory worker does not build Android packages locally; the required GitHub
Actions runner supplies JDK 17 and the Android SDK, as specified by the mobile
product contract.
