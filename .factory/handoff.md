# Verification 17 handoff

## Result

**FAIL — reject candidate `d7186184975c193d520d40a14b27fb552067e8ce`.**

The requested commit does not exist in the supplied repository or on GitHub.
The clean clone, `origin/main`, live `/build.json`, v0.5.11 tag, release notes,
source record, APK, and AAB all identify
`d71861d6633f0e1d5c1d67e2ab1845a7f12e115f` instead. The exact release audit
with the requested SHA fails with `Release notes do not bind the immutable
source commit`.

No product code was changed. Full evidence and the severity-ranked finding are
in `.factory/verification-17.md`.

## What was verified

- All 26 commands in `.factory/claims.json` passed separately through the demo
  entry point on the only obtainable commit, `d71861d6633f...`.
- The cold first screen and one-click sample demo pass.
- `npm ci`, `npm audit --audit-level=high`, `npm run lint`, `npm test`,
  `npm run build`, `npm run test:release`, `npm run test:live`, and
  `npx cap sync android` pass on `d71861d6633f...`.
- The live desktop/mobile flows, invalid inputs, encrypted export/restore,
  privacy request log, headers, cache policy, keyboard, focus, 200% text,
  reduced motion, axe, service-worker update, and offline reload pass.
- The license endpoint permits 30 requests and returns 429 plus `Retry-After`
  on request 31.
- Five mobile Lighthouse runs have a median performance score of 92; all five
  score 100 for accessibility, best practices, and SEO.
- Published APK/AAB checksums, embedded build identity, archive integrity, app
  id/version, permissions, and backup policy pass for `d71861d6633f...`.

## Reproduce

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build
npm run test:release
npm run test:live
npx cap sync android
```

To reproduce the release blocker:

```sh
git fetch origin d7186184975c193d520d40a14b27fb552067e8ce
npm run test:release -- --expected-commit d7186184975c193d520d40a14b27fb552067e8ce
```

The first command returns `not our ref`; the second reports that the published
release does not bind the requested commit.

## Required next step

Push the exact requested candidate and publish/deploy packages from it, or
correct the candidate SHA to `d71861d6633f...` and issue a new verification
work order. Do not treat the healthy available build as proof for a different
commit.
