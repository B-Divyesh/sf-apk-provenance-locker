# APK Provenance Locker — adversarial review 3 handoff

## Result: FAIL

Reviewed source `1f6ffa249f8832d2386f6a72c5b3f1bbf2279ff3` and the live
site at <https://apk-provenance-locker.sociobot.in> on 2026-08-29 UTC. Product
code was not modified.

`.factory/review-3.md` records one blocking sandbox/routing defect and one
minor terminology defect. The blocker is reproducible by editing `/demo`,
selecting the shared-header **Locker** link, and reopening `/demo`: edited
demo data survives even though the app entered real mode and removed the demo
banner. The wordmark can also place demo state at the `/` URL. The existing
`@claim:demo-sandbox` test covers only **Start for real** and therefore misses
both paths.

## Verification completed

- Opened the live site cold at 390 × 844 and 1440 × 900; the first-read gate
  passed.
- Exercised the one-click demo, sample visibility, Reset, Start for real,
  real-storage sentinels, offline reload, request logging, and the failing
  header exits.
- Ran every one of the 25 exact claim commands independently from clean clone
  `/tmp/apk-review3-EZi7KI`; all commands passed.
- Ran `npm run lint`, full `npm test` (17 unit/config and 38 browser tests),
  `npm run build`, and `npm run test:live`; all passed.
- Crawled live internal, release, and checkout links; checked titles,
  metadata, 404 behavior, route focus, and mobile overflow.
- Ran live Playwright axe scans on all product routes and the 404 with zero
  violations. `/opt/fleet/lib/verify-url.sh` also passed the live landing.
- Rechecked every F-1 and F-2 finding in live output and source; none
  regressed.

## Remaining work

Implement the F-3-1 cleanup through every demo exit and add the specified
multi-exit claim test. Apply the F-3-2 digest terminology rewrite. Rerun the
same commands and live paths before claiming PASS.
