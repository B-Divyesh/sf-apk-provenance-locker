# APK Provenance Locker repair handoff

## Result

All release-blocking findings in `.factory/verification.md` and
`.factory/verification-2.md` were repaired for work order
`apk-provenance-locker-repair-2`. The repaired web app is live at
<https://apk-provenance-locker.sociobot.in>. Android v0.2.0 is published at
<https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/tag/v0.2.0>.

The implementation commit is `b9cec221d496f28644d35d03eb3d07724fb8d311`.

## Reproduction and root causes

Before editing, the candidate reproduced the verification-2 evidence:

- GitHub `releases/latest` returned 404. The live page logged that failed
  request on every load.
- Initial focus was the `h1`; the first Tab skipped the skip link and header.
- `/this-route-does-not-exist` returned 200.
- `/manifest.webmanifest` returned `application/octet-stream`.
- The v0.1.1 Android Action had failed. Its log showed Capacitor's generated
  `cordova.variables.gradle` was missing. `cap copy` did not generate it.
- Claim commands exited green, but the browser tests did not inspect the exact
  hash, downloaded ciphertext, decryption result, passwords, or saved bytes.
- The web code read certificate bytes without cryptographic verification and
  compared user-entered version strings while public copy implied more.

## Repairs

- Removed the automatic `api.github.com` call. The landing page now has fixed
  v0.2.0 APK, AAB, and SHA256SUMS release links. GitHub is contacted only when
  a visitor selects a download.
- Published real APK/AAB/checksum assets through the corrected Android Action.
  The Action now uses `cap sync`, validates package id/version and archive
  structure, runs `apksigner`, checks both packages exceed 1 MB, then publishes.
- Kept Capacitor 6 and audited tar 7. A narrow postinstall compatibility shim
  repairs Capacitor 6's removed tar default-export assumption so clean syncs
  work without restoring the vulnerable tar release.
- Narrowed every signer and version promise to the browser's actual behavior.
  The UI now says certificate bytes are unverified, v1 and v3 lineage are not
  read, names/versions are user notes, and Android decides install/downgrade
  compatibility. The ZIP/local-header checks were strengthened.
- Replaced weak claim checks with exact browser outcomes. Coverage now includes
  a known complete SHA-256, a deterministic v2/v3 evidence fixture, 12 MiB
  encrypted export plus decryption, plaintext exclusion, password non-storage,
  real IndexedDB deletion, demo database deletion, and request capture.
- Closed IndexedDB handles after transactions and prevented navigation until
  demo storage deletion completes.
- Removed the catch-all navigation fallback. Only `/`, `/demo`, `/privacy`, and
  `/terms` rewrite to the SPA; the deployed response override now returns the
  designed 404 with HTTP 404.
- Added the `.webmanifest` MIME mapping and tightened CSP `connect-src` to
  `'self'`. The 404 page no longer needs inline styles.
- Removed initial heading focus. The skip link is the first Tab stop; client
  route changes still focus the new `h1`.
- The service worker now discovers and precaches hashed Vite assets and ignores
  response `Vary` differences during offline cache matching.

## Clean local verification

Run:

```sh
npm ci
npm run lint
npm test
npm run build
npx cap sync android
npm audit --omit=dev
```

Evidence from 2026-08-29 UTC:

- `npm ci`: 188 packages; full install audit reported 0 vulnerabilities.
- `npm run lint`: TypeScript passed.
- `npm test`: 9 unit/config tests and 14 Playwright tests passed.
- Every one of the 11 exact commands in `.factory/claims.json` passed alone.
- `npm run build`: `dist/` produced. Initial JS is 23.58 KB raw / 8.62 KB
  gzip. CSS is 9.44 KB raw / 2.93 KB gzip.
- `npx cap sync android`: copy and native update passed.
- Browser checks at 1440×900 and 390×844: `/`, `/demo`, `/privacy`, and
  `/terms` each had one `h1`, one `main`, zero overflow, zero console errors,
  zero automatic third-party requests, and zero axe violations.
- At 200% root text size, the 390px routes had no horizontal overflow. All
  tested nav, footer, and demo-banner targets remain at least 44px high.
- Keyboard: initial active element is `BODY`; first Tab reaches “Skip to
  content”; client navigation focuses the destination `h1`.
- Reduced-motion checks found no non-zero animation or transition durations.
- Offline: `/demo` reloaded with sample records after the browser HTTP cache was
  disabled and the context was taken offline.
- Live Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.8 s, LCP 1.2 s, CLS 0, TBT 30 ms.

## Android release evidence

GitHub Action run `33236279287` completed successfully. Its package check found
`in.sociobot.apk_provenance_locker`, version code `2`, version `0.2.0`.
`apksigner` reported one signer and valid v1 and v2 signatures.

Public downloads were fetched again through the landing-page URLs:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `app-release.apk` | 3,929,072 | `6608a8371086c3fa17ac87036a9748e5801542ad9d2302ce89539c0aea44a7ec` |
| `app-release.aab` | 3,749,635 | `78134ef4b24f4730c109e8782b5a7573002adf15b72ad824c9e4ae6f4f2207fb` |
| `SHA256SUMS` | 164 | Contains both values above; `sha256sum -c` passed |

The APK contains `AndroidManifest.xml` and bundled `assets/public/index.html`.
The AAB contains `base/manifest/AndroidManifest.xml` and the bundled web app.

## Production deployment and identity

Built `dist/` was deployed to the `sf-apk-provenance-locker` Azure Static Web
Apps production environment. Live checks returned:

- `/`, `/demo`, `/privacy`, `/terms`: HTTP 200.
- unknown path: HTTP 404 with the designed page and zero axe violations.
- `/manifest.webmanifest`: HTTP 200, `application/manifest+json`.
- CSP has `connect-src 'self'` and `frame-ancestors 'none'`; HSTS, nosniff,
  strict-origin referrer policy, and permissions policy are present.
- APK, AAB, and SHA256SUMS direct URLs: HTTP 200.

Deployed build identity matches local `dist/` exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `01966cae33b557ce6997b953267622431eda945defbb7bcfc7d807b6e645ab8a` |
| `assets/index-CqPAtxi8.js` | `1df303431278d5ad4fa7ca643c8b22ff29cfc94989fff3ad02eded64d6bb3fbb` |
| `assets/style-vLxLalKb.css` | `ce518c7b1b2d7c840d35f9ac0ac4b0cd0e56d56f7e89ab5d5952ee234b7bce4e` |

## Known boundary

The browser records hashes and limited, unverified v2/v3 certificate evidence;
it is not an APK signature verifier. This boundary is now explicit everywhere.
The public Android package itself is verified by `apksigner` during release.

The workflow creates a release-specific test key as required by the Android
work order. A future store build needs the owner's stable upload key, and direct
sideload upgrades across differently keyed releases may require reinstalling.
