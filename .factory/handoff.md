# APK Provenance Locker repair handoff

## Result

The release-blocking finding in `.factory/verification-3.md` is repaired for
work order `apk-provenance-locker-repair-3`. The product remains a Capacitor 6
Android APK plus a Vite/TypeScript offline PWA.

## Reproduction and root cause

Before the repair, `src/lib.ts` only hashed certificate-shaped bytes found in
v2/v3 blocks. It did not verify signatures, v1 signers, or v3 lineage. The form
stored user-entered app names and versions, and compared those notes for a
non-authoritative downgrade message. A failing contract test was added first;
the candidate had no `verifyApk` or `extractApkIdentity` implementation.

## Repair

- Added a pinned, self-hosted WebAssembly adapter for Apache-2.0 `apksig-go`
  v1.1.0. It verifies APK v1/JAR, v2, and v3 signatures and content digests.
- Exposed and verifies v3 certificate-rotation lineage. A present invalid v2,
  v3, or v3.1 block cannot fall back to an older valid signature scheme.
- Added local binary `AndroidManifest.xml` parsing for package name, version
  name, and version code. User-entered identity fields were removed.
- Added package-scoped signer compatibility and numeric version-code checks.
  Signer drift and incompatible downgrade risk remain visible on the record.
- Restore-kit validation now rechecks the saved APK hash, signature, package,
  version code, and signer instead of checking only the hash.
- Kept real and demo storage separate, encrypted export, large-copy encoding,
  offline support, privacy behavior, and the product visual system.
- Versioned the PWA and Android package as v0.3.0. The verifier runtime is
  self-hosted, immutable-cached, and precached for offline checks.

## Independent regression fixtures

The fixtures in `tests/fixtures` come from Android apksig's Apache-2.0 test
corpus and are checked in with `SHA256SUMS`:

| Fixture | SHA-256 | Expected result |
| --- | --- | --- |
| `v1-only-rsa-2048.apk` | `1a2aa49011c5e0a773bd559484cb867b8bd15423381178b2137b63d16dff7540` | valid v1 signer |
| `v1v2v3-lineage.apk` | `9c6947bf9398a15e85a52bf83b07cfae6686ff49e03034d09cbea45a19bdaa15` | valid v1/v2/v3, three-node lineage, package `android.appsecurity.cts.tinyapp`, version `1.0`, code `10` |
| `v1v2v3-invalid-lineage.apk` | `d521755adb86006d8247da2e94f17f28067654b802f7350ca97dd668eadaa477` | rejected invalid v3 lineage |

The built verifier SHA-256 is
`c5e629011c528bbc20c1eb6e366c54c5a1ec4e54955829b76dc3d0610b052381`.
Its reproducible adapter and pinned Go module are in `tools/apksig-wasm`.

## Local verification

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

- Clean install: 189 packages, 0 vulnerabilities.
- Type check: passed.
- Unit/config tests: 12 passed.
- Chromium browser tests: 23 passed, including desktop, 390 × 844, keyboard,
  axe, privacy requests, offline reload, and offline APK verification.
- Every one of 18 exact claim commands in `.factory/claims.json`: passed alone.
- Capacitor Android sync: passed and copied the self-hosted verifier.
- Production build: `dist/` produced; JS 32.74 KB raw / 12.22 KB gzip; CSS
  9.64 KB raw / 2.98 KB gzip. The verifier WASM loads on use and is 5.6 MB raw
  / 1.65 MB gzip.
- Local mobile Lighthouse 13.4.1: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.8 s, CLS 0, TBT 10 ms.

## Candidate and release evidence

Implementation commit and annotated v0.3.0 tag target:
`29891996aed3d5cd66867aa29ff6b87ee617d009`.

GitHub Actions run
[`33239385886`](https://github.com/B-Divyesh/sf-apk-provenance-locker/actions/runs/33239385886)
completed successfully. Its Android checks confirmed package
`in.sociobot.apk_provenance_locker`, version code `3`, version `0.3.0`, and
valid v1 and v2 signatures. Independent `apksig-go` verification also returned
`Verified: true`, v1 true, v2 true, and one signer.

Published v0.3.0 assets:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `app-release.apk` | 5,583,235 | `cdaf8cbc1e6cdf0921fb53e959e4900c0e29c9d768165daa759385ba56f5bbe3` |
| `app-release.aab` | 5,403,880 | `f6941bfa20c5f2bfa9eead06c680d37b91fe0a45b561cbe89e45afb21a7198af` |

All three direct release links return HTTP 200. `sha256sum -c SHA256SUMS`
passes. Both packages contain their Android manifests and the bundled web app.
The APK's bundled `index.html`, JS, CSS, and verifier WASM match local `dist/`
byte-for-byte. The live product accepted this APK and independently displayed
package `in.sociobot.apk_provenance_locker`, version `0.3.0`, code `3`, and
verified v1 + v2.

`dist/` was deployed with Azure Static Web Apps CLI 2.0.10 to the existing
`sf-apk-provenance-locker` production app. Live checks at
<https://apk-provenance-locker.sociobot.in> found:

- `/`, `/demo`, `/privacy`, `/terms`: HTTP 200; unknown route: HTTP 404.
- Verifier WASM: HTTP 200, `application/wasm`, immutable one-year cache.
- CSP includes self-only connections, WebAssembly execution, and
  `frame-ancestors 'none'`; HSTS, nosniff, referrer, and permissions headers
  are present.
- Live `index.html`, JS, and CSS SHA-256 values match local `dist/`:
  `9d05af561395d245a467e772d768f1420ed557c4149ddc63378abcd238cbaaa9`,
  `207feb2a0f56766a6a4ee0b8d8326348c4e546c25feb55b54e3c0ee74a17ab8b`,
  and `d2d9e1c1c6add59ccbb6a672b0a51fbe1d5e5947b80605f7874f13180acbb367`.
- Desktop and 390 px live runs: zero axe violations, console errors, page
  errors, automatic third-party requests, or horizontal overflow. The live
  v0.3.0 APK identity and signatures verified in both viewports.
- Live offline reload and v1 fixture verification passed after the first
  visit.
- Live mobile Lighthouse 13.4.1: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, CLS 0, TBT 10 ms.

## Known gaps

None in the researched product scope. Android remains the final authority for
device-specific installation policy. The workflow uses a release-specific test
key; a store release needs the owner's stable upload key.
