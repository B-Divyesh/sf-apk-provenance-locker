# APK Provenance Locker verification 7 handoff

## Result

**FAIL — do not release candidate
`152ed6e25a66eb5ddae98d583c997d535bb736de`.**

- Live URL: <https://apk-provenance-locker.sociobot.in>
- Work order: `apk-provenance-locker-verify-7`
- Full evidence: `.factory/verification-7.md`

The live site, GitHub release, APK/AAB, and embedded `build.json` all match the
candidate. The prior deployment-only concern is resolved. The core product,
all 21 claim commands, full tests/build, live privacy, offline behavior,
accessibility, paid checkout, and endpoint throttling pass.

## Release blockers

1. **High — irreversible one-click deletion.** Activating a record's Remove
   control immediately erased both its localStorage record and IndexedDB APK
   bytes. There was no confirmation or Undo. This violates the required
   destructive-action policy and can erase the user's only rollback copy.
2. **High — claims bypass the required demo sandbox.** Only five of 21 tagged
   claim tests open `/demo`; sixteen explicitly run in the real `/` namespace.
   Green command exits therefore do not satisfy the supplied demo-only claim
   test contract.
3. **High — unlisted Terms claim.** “A refunded or revoked license stops paid
   features” is not declared in `.factory/claims.json` with its own tagged
   observable test. A revoked-license regression exists but is untagged, and
   refund behavior is not tested. The claims contract makes this
   release-blocking.
4. **Medium — incomplete Android download disclosure.** The landing page links
   `SHA256SUMS` but does not display the APK digest, and it omits the required
   note that the app is not on Google Play yet.

## Verification summary

- `npm ci`: pass, 189 packages.
- `npm audit --audit-level=high`: pass, 0 vulnerabilities.
- all 21 `.factory/claims.json` commands: pass independently.
- `npm run lint`: pass.
- `npm test`: pass, 15 unit/config + 31 Chromium tests.
- `npm run build`: pass; `dist/` produced.
- `npx cap sync android`: pass.
- live desktop and 390 px: no console/page errors; zero axe violations.
- offline reload and offline v1 signature verification: pass.
- fresh endpoint allowance: 30 responses at 200, then 429 from request 31;
  `Retry-After: 4` present.
- APK/AAB downloads and published checksums: pass; APK web payload exactly
  matches local `dist/` and identifies the candidate.
- live Lighthouse mobile median: Performance 95, Accessibility 100, Best
  Practices 100, SEO 100; median LCP 1.459 s and CLS 0.

Evidence screenshots and the factory URL check are under
`.factory/qa-evidence/`.

## Reverify after repair

Run:

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build
npx cap sync android
npm run test:live
```

Then run every exact command in `.factory/claims.json`, confirm deletion is
confirmed or reversible for both metadata and bytes, confirm every claim test
uses `/demo`, verify the newly tagged license claim, inspect the Android
download disclosure, and repeat artifact identity, offline, axe, request-log,
response-header, and 429 checks.
