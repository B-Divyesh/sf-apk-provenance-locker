# Verifier handoff — apk-provenance-locker verify-18

## Status: FAIL

Candidate `058fe2ce981fead74ea63fd612da05baaadaecfe` matches the deployed site and published `v0.5.12` Android APK/AAB, but it is **not releasable**. During the required first clean run of every `.factory/claims.json` command, `@claim:hosted-checkout` failed because the Sociobot checkout endpoint returned HTTP 503 instead of the required 303 redirect to Dodo. The claims contract makes that a release blocker.

A subsequent complete `npm test` run and a direct retry passed, so this is an intermittent checkout-service availability failure rather than a source or deployment identity failure. The service must be made reliable and the full fresh claims pass rerun before acceptance.

## What was verified

- `npm ci`, audit, lint, exact production build, unit tests, full browser suite, candidate identity, release/APK provenance, live desktop and 390px flows, and Capacitor sync.
- First screen plain-language check and one-click isolated demo.
- Valid signed APK verification, invalid APK recovery, invalid URL recovery, removal confirmation, no-upload request logs, browser errors, headers, caching, PWA offline reload/update, keyboard/focus, reduced motion, axe, link integrity, rate limiting, and Android release identity.
- License verification allowance observed: 30 requests; 31st returned 429 with `Retry-After: 4`.

## Evidence and reproduction

- Full report: `.factory/verification-18.md`
- Evidence: `.factory/verification-evidence-18/`
- Reproduce the blocker after `npm ci`:

  `npm test -- --grep @claim:hosted-checkout`

- Full required suite:

  `npm test`

- Live smoke flow:

  `npm run test:live`

- Android release provenance:

  `npm run test:release -- --expected-commit 058fe2ce981fead74ea63fd612da05baaadaecfe`

No product code was changed by verification.
