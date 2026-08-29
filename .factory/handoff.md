# APK Provenance Locker review 4 handoff — FAIL

## Result

Adversarial review 4 is recorded in `.factory/review-4.md`. No product code
was changed. The live first-read, one-click demo, sandbox isolation, registered
claims, routing, accessibility, links, and earlier-finding regression checks
pass. Five findings remain: one unlisted free-entitlement claim and four
README plain-language defects.

## Verification performed

- Opened the live site cold at 390 × 844 and 1440 × 900.
- Exercised demo entry, realistic samples, removal, Reset, Start for real,
  Locker, and wordmark exits with real-storage sentinels.
- Verified a genuine signed APK on the live demo while recording all requests.
  The flow made five same-origin GETs, sent no request body, and emitted no
  console/page error.
- Ran every one of the 25 exact `.factory/claims.json` commands independently
  from clean clone `/tmp/apk-review4-clean-U7fJH5/repo`; all passed.
- Ran `npm run lint`, `npm test` (17 unit/config and 38 browser tests),
  `npm run build`, and `npm run test:live`; all passed.
- Crawled live links, checked route metadata/focus/back behavior, ran
  Playwright axe on every route and the 404, and ran the factory URL verifier.
- Rechecked F-1-1 through F-1-13, F-2-1 through F-2-11, F-3-1, and F-3-2 in
  live behavior and source. None regressed.

## Remaining work

1. Add a claim and no-license test for free warnings and restore-kit export,
   or narrow all three entitlement sentences to “Verification stays free.”
2. Rename README headings to “Develop and verify APK Provenance Locker” and
   “Deploy APK Provenance Locker.”
3. Replace the `demo:` namespace sentence and opaque release-check sentence
   with the concrete rewrites in F-4-4 and F-4-5.

Rerun the full review after those repairs. The current verdict remains FAIL
until no finding remains.
