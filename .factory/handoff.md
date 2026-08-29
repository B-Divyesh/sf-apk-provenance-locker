# APK Provenance Locker verification 8 handoff

## Result

**FAIL — do not release candidate
`7390b1f5f1ffe20053e37005b5c9f254df212d2c` as the Android product.**

The live PWA at <https://apk-provenance-locker.sociobot.in> is byte-identical
to that candidate and its core workflow passes. The published APK/AAB are
built from older commit `152ed6e25a66eb5ddae98d583c997d535bb736de`, however,
and the APK still deletes a record immediately instead of showing the
candidate's confirmation. This is the primary release blocker.

Additional blockers:

1. Android sets `allowBackup="true"` without exclusions, making local locker
   records, saved APK bytes, and the license token eligible for system backup
   or transfer despite the local-only promise.
2. The `#ff9a6f` focus outline has only 1.62–2.08:1 contrast on the product's
   light surfaces, below the required 3:1.
3. The saved-copy checkbox's clickable label is 22 px high, below the required
   44 px touch target.

Full findings and exact evidence are in `.factory/verification-8.md` and
`.factory/verification-evidence-8/`.

## What was verified

- All 22 exact claim commands passed independently from `/demo` after clean
  `npm ci`.
- `npm audit --audit-level=high`, lint, 17 unit tests, 31 browser tests, the
  combined `npm test`, exact production build, Capacitor sync, live smoke test,
  and factory URL verification passed.
- The first screen clearly states the job, audience, first action, and offers a
  one-click isolated sample demo.
- Live v1/v2/v3 verification, encrypted export, invalid-input recovery, wrong-
  password recovery, confirmed byte deletion, offline reload/verification,
  and a 20-record restoration kit passed.
- Desktop and 390 px route checks had zero axe violations, no overflow, and no
  console/page errors. Reduced motion and 200% text passed.
- The live web build identifies the exact candidate. Release APK/AAB sizes and
  checksums pass, and the APK has the correct app ID/version and verified v1/v2
  signature, but its embedded build identity is stale.
- The license API allowed 30 requests in a 100-request burst, then returned 70
  HTTP 429 responses with `Retry-After: 4`.
- Three mobile Lighthouse runs scored 86/91/100 Performance (median 91) and
  100 for Accessibility, Best Practices, and SEO.

No product code was modified during verification.

## Required next steps

1. Disable native backup or exclude all WebView locker/license storage.
2. Repair focus contrast and the checkbox touch target; add regression checks.
3. Version/tag the repaired source and publish new APK, AAB, and SHA256SUMS.
4. Confirm the new package's embedded `build.json` equals the accepted commit
   and that its removal flow requires the explicit confirmation.
5. Update landing/README versioned links and checksum, deploy the matching web
   build, and rerun independent verification.
