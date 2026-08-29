# APK Provenance Locker polish 5 handoff — PASS

## Result

Polish round 5 is complete. The released source is
`ab3eb699bcd49051f663dc3d5a077299313e83a3` (`v0.5.10`), deployed at
`https://apk-provenance-locker.sociobot.in`.

This release closes every numbered finding in `.factory/review-1.md` through
`.factory/review-5.md`; the full id-to-evidence mapping is in
`.factory/polish-5.md`. There are no known remaining product gaps.

## What changed

- Kept all prior 404, legal, demo isolation, restore/import, plain-language,
  and mobile fixes, and rechecked them on the live site.
- Fixed route navigation: entering a client route resets to its heading, Back
  restores the exact prior position, and focus moves to the new heading.
- Removed unlisted Android package-size copy and rewrote package/version and
  source-record language in the product, policies, README, and copy audit.
- Removed the automatic GitHub release-metadata request that could produce a
  live 403 console error. Download links now use the built tag and commit
  directly; the demo makes no automatic third-party request.
- Bumped the source-bound release to v0.5.10 / Android versionCode 15 / cache
  `apk-locker-v20`.

## Verification

- Clean clone: `/tmp/apk-polish5-final-0N4TOB/repo` at
  `ab3eb699bcd49051f663dc3d5a077299313e83a3`.
  - `npm ci`: 0 vulnerabilities.
  - `npm run lint`: passed.
  - All 26 exact commands declared by `.factory/claims.json`: passed
    independently from the clean clone.
  - `npm test`: passed (22 unit/config + 40 browser tests).
  - `npm run build`: passed and produced `dist/`.
  - `npx cap sync android`: passed; packaged web assets contain v0.5.10 and
    the source build identity.
- Deployment build: `npm ci && npm test && npm run build` passed immediately
  before `/opt/fleet/lib/deploy-static.sh apk-provenance-locker dist`.
- Android GitHub Actions run `33281210515` succeeded for tag `v0.5.10`.
  - APK: 5,589,014 bytes; SHA-256
    `31fcaf37e75fee233cf18bd85dc32486e27150a1ea463d460fce93a0cde28e4b`.
  - AAB: 5,409,555 bytes; SHA-256
    `5f7a45fe029e262cd03ecf029b956c94635b3bb2137590a485ce45c6a701fcf4`.
  - `npm run test:release -- --expected-commit
    ab3eb699bcd49051f663dc3d5a077299313e83a3`: passed; tag, APK, AAB,
    source record, package identity, and all three demo-exit erasure paths
    match the source commit.
- Cold live checks:
  - `/` and `/?demo=1` passed `/opt/fleet/lib/verify-url.sh` with zero
    console errors, one H1, `<main>`, `lang=en`, and no missing image alt text.
  - `npm run test:live` passed at desktop and 390px mobile: a real signed APK
    verifies and removal confirmation works with same-origin bodyless GETs
    only and zero errors.
  - Playwright Axe audit on `/`, `/demo`, `/privacy`, `/terms`, and an unknown
    route found no serious or critical violations. The route audit confirms
    titles, canonicals, one H1/main, no mobile overflow, HTTP 404, and exact
    scroll restoration (3221 → 0 → 3221) with H1 focus.
  - Lighthouse mobile on live `/`: performance 100, accessibility 100, best
    practices 100, SEO 100; LCP 1.4 s, CLS 0, total page weight 95 KiB.

## Evidence

- `.factory/evidence/polish-5/live/root/verify.json`
- `.factory/evidence/polish-5/live/demo/verify.json`
- `.factory/evidence/polish-5/live/final-audit.json`
- `.factory/evidence/polish-5/live/lighthouse-mobile.json`
- `.factory/evidence/polish-5/live/demo-one-click-mobile.png`
- `.factory/evidence/polish-5/live/routes/404-mobile.png`

## Run locally

```sh
npm ci
npm run lint
npm test
npm run build
npx cap sync android
```

For the published Android assets, run:

```sh
npm run test:release -- --expected-commit ab3eb699bcd49051f663dc3d5a077299313e83a3
```

No operator action is required for this work order.
