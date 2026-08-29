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

The v0.3.0 GitHub release and production deployment evidence will be appended
after the repair commit is pushed and the configured release workflow runs.

## Known gaps

None in the researched product scope. Android remains the final authority for
device-specific installation policy. The workflow uses a release-specific test
key; a store release needs the owner's stable upload key.
