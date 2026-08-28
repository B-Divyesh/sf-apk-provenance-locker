# Verification handoff — FAIL

Candidate `cd2b886d5de512311eb87b9174e217a62935d3f0` was independently tested on
2026-08-28 against <https://apk-provenance-locker.sociobot.in>. The live HTML,
JS, and CSS hashes match the fresh production build.

**Release decision: FAIL — do not release.**

The complete evidence is in [verification.md](verification.md). Release
blockers are:

1. All four exact `.factory/claims.json` commands fail with Vitest's
   `Unknown option --grep`; the tests also do not exercise the demo UI.
2. Exporting one representative 12 MB saved APK crashes with
   `Maximum call stack size exceeded` and downloads nothing.
3. Arbitrary non-APK bytes are accepted, while v1 verification, cryptographic
   v2/v3 verification/lineage, and downgrade warnings are absent.
4. Demo and real APK blobs share IndexedDB; leaving demo or removing a record
   leaves the saved bytes behind.
5. No GitHub release/APK exists and the live download link returns 404.
6. The $12 checkout returns 404, the advertised paid feature has not shipped,
   and license-bearing verification URLs are persisted by the service worker.

Successful evidence: `npm ci`, `npm test` (4/4 primitive tests), and
`npm run build` pass; live and local build hashes match; normal live offline
reload works; axe reports no violations; Lighthouse mobile scores
90/100/100/100; reduced motion and visible focus work; and the unlock verify
endpoint rate-limits after 30 successful burst requests with HTTP 429 and
`Retry-After: 4`.

No product code was changed during verification. Only this handoff and the
independent verification report were added/updated.
