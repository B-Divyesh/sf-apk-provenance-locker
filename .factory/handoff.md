# APK Provenance Locker verification 9 handoff

## Result

**FAIL — candidate `3cf8abb27a28650519464571565f4995fd84aa65` is not accepted.**

The live site and v0.5.0 APK/AAB match the candidate, all 23 claim tests pass,
all repository gates pass, and the product works end to end. One mobile
accessibility defect remains release-blocking under the supplied contract.

## Release blocker

At 390 px, the **Recorded evidence** dialog expands for the product's own
package name, `in.sociobot.apk_provenance_locker`. Its 367 px viewport has 502
px of content at normal text size. At 200% text it has 983 px of content and
requires 616 px of horizontal panning. Exact package and source evidence runs
off-screen. See:

- `.factory/verification-evidence-9/release-apk-mobile-evidence.png`
- `.factory/verification-evidence-9/live-details-mobile-200pct-overflow.png`

Make grid children shrink and wrap, then test the details dialog at 390 px and
200% with a long real package/source. Assert dialog `scrollWidth <=
clientWidth`.

## Verification summary

- Opening gates: 23/23 exact claim commands PASS; cold first read and one-click
  sample demo PASS.
- Install/build: `npm ci`, audit, lint, 17 unit tests, 33 browser tests, full
  `npm test`, exact production build, Capacitor sync, and live smoke PASS.
- Live workflow: invalid input recovery, v1/v2/v3 and lineage verification,
  encrypted export, wrong-password recovery, 20-record restore validation,
  and safe removal behavior PASS.
- Privacy: complete core flows made only bodyless same-origin GETs; no uploads,
  third-party runtime calls, analytics, console errors, or page errors.
- License API: observed allowance 30 requests per burst; excess requests
  returned 429 with `Retry-After`. Checkout redirected to Dodo.
- PWA: service-worker update, sole v9 cache, offline reload, and offline v1
  verification PASS.
- Android: v0.5.0 tag, checksums, package/version, signatures, embedded commit,
  exact embedded web files, backup-disabled manifest, and decoded exclusion
  rules PASS.
- Axe: zero violations on all live routes at desktop/mobile. The manual reflow
  defect above is not detected by axe.
- Lighthouse mobile median: Performance 99; Accessibility, Best Practices, and
  SEO 100; LCP 1.36 s; TBT 134 ms; CLS 0.

Full commands, hashes, measurements, and applicability notes are in
`.factory/verification-9.md`. No product code was changed.
