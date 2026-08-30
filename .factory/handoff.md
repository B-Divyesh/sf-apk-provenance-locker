# Verifier handoff — apk-provenance-locker verify-19

## Status: FAIL

Candidate `058fe2ce981fead74ea63fd612da05baaadaecfe` matches the
live site, v0.5.12 tag, APK, AAB, checksums, and source record. Functional,
privacy, accessibility, offline, Android package, and performance checks pass.
It is nevertheless **not releasable** because the mandatory first-run claims
gate passed only 25 of 26 commands.

`npm test -- --grep @claim:release-assets` exits 1. Its release verifier
requires `origin/main` to equal the candidate SHA exactly. The candidate is
already obtainable and is an ancestor of `main`; `main` is two QA-document
commits ahead (`7f7708e`, `bca9bfc`). This mutable-branch equality makes an
already-reported immutable release fail verification. Update that gate to use
candidate availability plus exact tag/artifact provenance, or an ancestor
check, then rerun all claims from a clean checkout.

The prior hosted-checkout outage has recovered. Its exact claim passed on the
first fresh run, and the independent link audit reached a Dodo hosted session.

## Evidence

- Full report: `.factory/verification-19.md`
- Evidence: `.factory/verification-evidence-19/`
- Claims: 25 pass, `release-assets` fail.
- Full suite: 23 Vitest and 40 Playwright tests pass.
- Build: 44,565-byte JS, 11,221-byte CSS, 75,842-byte hero.
- Live flow: valid v1/v2/v3 APK, invalid recovery, encrypted restore, and 20
  matching APK records pass with only same-origin bodyless GETs.
- Accessibility/PWA: zero axe serious/critical findings; keyboard, 390px,
  200% text, reduced motion, service-worker update, and offline reload pass.
- Lighthouse mobile: 90 performance; 100 accessibility, best practices, SEO;
  LCP 1.43 s; CLS 0; 97,364-byte initial transfer.
- License API allowance: 30 requests; request 31 returns 429 with
  `Retry-After: 4`.
- Android: APK 5,589,035 bytes (`ed96782a...d2ae272b`), AAB 5,409,557 bytes
  (`a217c32f...37d8601`), exact candidate identity and valid package metadata.

## Reproduce

```sh
npm ci
npm test -- --grep @claim:release-assets
npm run test:candidate -- --expected-commit 058fe2ce981fead74ea63fd612da05baaadaecfe
npm run test:release -- --expected-commit 058fe2ce981fead74ea63fd612da05baaadaecfe
```

All three release-related commands reproduce the same `origin/main` equality
failure where applicable; the first is the release-blocking required claim.
`npm audit --audit-level=high`, `npm run lint`, `npm test`, `npm run build`, and
`npm run test:live` otherwise pass.

No product code was changed.
