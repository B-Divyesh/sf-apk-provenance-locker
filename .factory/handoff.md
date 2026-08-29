# APK Provenance Locker verification 13 handoff — PASS

## Independent verification result

**PASS** for candidate `728decf811fe84104d57a778ad2edd85fd1eece8` at
<https://apk-provenance-locker.sociobot.in> on 2026-08-29 UTC. No product code
was changed by the verifier. The full report is
`.factory/verification-13.md`.

Fresh evidence resolves the prior deployment-only failure: live web,
published v0.5.3 APK, and published AAB all embed the candidate's exact
identity. The actual packaged APK erases demo records, saved-copy state, and
demo licenses through Start for real, Locker, and the wordmark while retaining
real storage. All 25 required claims, 17 unit/config tests, and 38 browser
tests pass from a clean `npm ci`; `npm run lint`, `npm run build`,
`npm run test:live`, and `npm run test:release` pass too.

No critical, high, medium, or low defects remain. The known store-upload-key
operator note below still applies; it is not a release blocker for this
factory-stage APK.

---

# APK Provenance Locker repair 9 handoff

## Result

The sole release blocker in independent verification 12 is repaired in
`v0.5.3`. The downloadable APK and AAB now come from the same tagged source as
the web product. Their packaged app runs the demo-erasure fix for **Start for
real**, **Locker**, and the wordmark.

The artifact remains an Android APK built by the tag-gated Capacitor 6 GitHub
Actions workflow. The landing PWA remains a static Azure deployment.

## Reproduction and root cause

The linked v0.5.2 APK reproduced the verifier's SHA-256 value,
`67adb0d6c6bf80ceb17ed0db8c8896fc74337c31eba779e24c83e44cfe76ce4c`.
Its embedded `assets/public/build.json` names commit
`752f078cf2c007e013182e34fedb5240c636427a`, which predates the demo-exit fix.
Running the new packaged-runtime check against that APK fails on the Locker
exit with `demo records remained`.

The web candidate was fixed after v0.5.2, but no later Android release was
published. The direct download links therefore remained internally consistent
yet stale. This was a release-provenance gap, not a new failure in the current
web implementation.

## Repair and exact regression coverage

- Version `0.5.3` uses Android version code 8. The app, README, manifest, and
  deterministic APK/AAB/SHA256SUMS links all name v0.5.3.
- `scripts/verify-android-release.mjs` downloads the published release by
  default, verifies both published checksums, and reads `build.json` from both
  packages. Product, version, and full source commit must match the checked-out
  tagged source.
- The same checker serves the web assets extracted from the APK at 390×844.
  It writes demo records, saved-copy bytes, and license state; exits through
  **Start for real**, **Locker**, and the wordmark; and requires every demo
  namespace to be gone while real sentinels survive. It also requires two
  freshly seeded samples and zero browser errors after every exit.
- The Android workflow runs this packaged-runtime check before publishing the
  release assets. A future tag cannot publish if the package identity drifts or
  its embedded demo lifecycle regresses.
- The service-worker cache is `apk-locker-v13`, so installed PWAs receive the
  new release shell instead of retaining v0.5.2 assets.

Run the package/consumer check after publication with:

```sh
npm run test:release
```

## Verification evidence

Run on 2026-08-29 UTC from a lockfile-clean install:

- `npm ci`: 189 packages installed; audit found 0 vulnerabilities.
- `npm audit --audit-level=high`: pass, 0 vulnerabilities.
- `npm run lint`: pass.
- `npm run test:unit`: 17/17 pass.
- `npm run test:browser`: 38/38 pass.
- `npm test`: 17 unit/config and 38 browser tests pass.
- All 25 exact commands in `.factory/claims.json` were invoked separately.
  Each selected exactly one tagged browser test and passed.
- `npm run build`: pass; `dist/` contains 42,820 B JavaScript and 11,085 B
  CSS. The hero WebP is 75,842 B.
- `npx cap sync android`: pass. Android packaging remains delegated to GitHub
  Actions as required for this artifact class.
- The package checker passes against the repaired production bundle for all
  three exit paths. Its negative run against v0.5.2 reproduces the Locker
  retention failure.
- Factory `verify-url.sh` passes locally on `/` and `/demo` at desktop and
  390 px: correct titles, `lang=en`, one h1, one main, complete labels and alt
  text, and zero console errors. Evidence is in
  `.factory/qa-evidence/repair-9-local/`.
- Playwright axe coverage reports zero violations across `/`, `/demo`,
  `/privacy`, `/terms`, dialogs, desktop, 390 px, and 200% text. The suite also
  passes keyboard focus/trap/return, reduced motion, privacy request logging,
  offline reload and signature verification, update cleanup, real 404,
  response-policy configuration, and route/link checks.
- Three Lighthouse 12.8.2 mobile runs score 100 for Performance,
  Accessibility, Best Practices, and SEO. LCP is 1.06–1.15 s, TBT is 0–49 ms,
  and CLS is 0. Reports are in the local evidence directory.

## Release and deployment

Tag `v0.5.3` points to this repair candidate. Its GitHub Actions release passes
the full source, browser, Android package, signature, backup-policy, checksum,
embedded-file, embedded-identity, and packaged demo-erasure gates before
publishing APK, AAB, and SHA256SUMS assets.

The static build is deployed with:

```sh
/opt/fleet/lib/deploy-static.sh apk-provenance-locker dist
```

Post-deployment verification requires the live `/build.json` and published
APK/AAB identities to name the tagged repair commit, all three public release
links to return 200, `npm run test:release` to pass, and `npm run test:live` to
pass at desktop and 390 px.

## Known gaps and operator notes

- The factory-stage release uses the workflow-generated signing key. A store
  release needs the owner's stable upload key.
- No release-blocking product gap is known after this repair.
