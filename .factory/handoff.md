# Adversarial first-read review 2 handoff — FAIL

Review 2 inspected the live deployment cold at 390 × 844 and 1440 × 900,
audited all landing/README copy, exercised the one-click demo and isolated
storage, ran every declared claim command from a clean clone, checked offline
and request behavior, crawled links, verified route metadata/focus/axe, and
rechecked every review-1/polish-1 and prior handoff issue against live and
source. No product code was changed.

The report is `.factory/review-2.md`. It records 12 findings. F-2-1 is blocking
because no sample record appears in the first post-click demo viewport.
F-1-10 is blocking because the unlisted Google Play sentence regressed after
polish 1 marked it removed. The remaining findings cover unlisted purchase
claims, the missing restore/import path, and eight copy defects.

Verification: all 23 exact claim commands pass individually from clean clone
`/tmp/apk-review2-q7dMr2`; `npm test` passes 17 unit/config and 34 browser
tests; `npm run lint`, `npm run build`, and `npm run test:live` pass. Live
privacy logs are same-origin GET-only, offline reload/verification pass, every
crawled link resolves, and live axe scans report zero violations. The prior
390 px/200% evidence-dialog repair remains fixed at 367/367 px.

To reproduce the product gates, run `npm ci`, every `test` command in
`.factory/claims.json`, `npm test`, `npm run lint`, `npm run build`, and
`npm run test:live`. Reproduce the main blocker by opening `/`, clicking **Try
it with sample data**, and observing `/demo` without scrolling at either
reviewed viewport.

# Independent verification 10 handoff — PASS

Candidate `c5865bba6cf1833f5662e1c1ecdbe1104836bf0f` is accepted. Fresh QA
passed every one of the 23 declared claim tests, all available unit/browser/
type/build checks, live desktop and 390 px flows, a real released-APK
verification/export/restore flow, a 20-record encrypted restore validation,
offline reload and verification, accessibility, headers, privacy request logs,
and rate-limit behavior. The live build identity and all deployed web assets
byte-match this candidate. See `.factory/verification-10.md` for exact command
results and evidence.

The v0.5.1 APK/AAB are valid and match their published checksums. They are
built from tagged parent `8fbbb02623dd765d341f4cdfdf6ae524b8934a3e`; the
candidate differs only in factory documentation/evidence, so this is recorded
as an informational provenance note, not a release defect.

To reproduce: `npm ci && npm test && npm run lint && npm run build`, then
`npm run test:live` with the live site available. The sample sandbox is
`/demo`. No product code was changed by the verifier.

# APK Provenance Locker repair 8 handoff

## Result

The release-blocking finding in independent verification 9 is repaired for
release `v0.5.1`. The recorded-evidence dialog now reflows long package names,
URLs, hashes, and signer evidence at 390 px and 200% text without horizontal
panning. The accepted APK verification, privacy, offline, demo, paid-license,
and removal behavior is unchanged.

The release candidate is the commit tagged `v0.5.1`. The tag workflow builds
the Android APK and AAB; the static site is deployed from that same commit.

## Reproduction and root cause

The verifier's real package name, `in.sociobot.apk_provenance_locker`, and a
long release source URL reproduced the reported measurement exactly: the
dialog had a 367 px client width and a 983 px scroll width at 390×844 and 200%
text.

The form is a CSS grid. Its direct grid children retained their automatic
minimum-content width, so the unbroken package heading and evidence list could
force the grid beyond the dialog's max width. The source link was also an
inline flex box, which made wrapping less reliable.

The repair gives every direct form-grid child a zero minimum width, allows the
heading and each evidence term/value to shrink, wraps long text anywhere, and
makes the source link a block with a 44 px minimum target. The definition-list
indent is capped relative to the viewport.

## Exact regression coverage

`tests/browser/locker.spec.ts` now has **recorded evidence reflows long release
identity and source at 390px and 200% text**. It:

1. opens the isolated `/demo` namespace at 390×844;
2. records `in.sociobot.apk_provenance_locker` and a long release URL;
3. sets the root text size to 200%;
4. opens **Recorded evidence** and proves both values are visible;
5. requires `dialog.scrollWidth <= dialog.clientWidth`, the dialog's right
   edge within 390 px, and page scroll width within the viewport.

Before the CSS repair it failed with `983 > 367`. After the repair it passes
at `367 <= 367`; the heading and link both end at x=357.30. The browser emitted
no console or page errors. Screenshot:
`.factory/qa-evidence/repair-8-local/evidence-dialog-mobile-200pct.png`.

## Local verification evidence

Run from a clean dependency install on 2026-08-29 UTC:

- `npm ci`: 189 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: pass; 0 vulnerabilities.
- `npm run lint`: pass.
- `npm run test:unit`: 17/17 pass.
- `npm run test:browser`: 34/34 pass.
- `npm test`: 17 unit/integration and 34 browser tests pass.
- Every command in `.factory/claims.json` was run separately: 23/23 select
  exactly one claim test and pass.
- `npm run build`: pass; `dist/` produced.
- `npx cap sync android`: pass and leaves generated native assets current.
- Factory `verify-url.sh` on local `/` and `/demo`: HTTP 200, correct titles,
  `lang=en`, one h1, one main, complete image/button labels, zero console
  errors, and desktop plus 390 px screenshots.
- Axe through Playwright: zero violations on `/`, `/demo`, `/privacy`, and
  `/terms`, at desktop and 390 px, including dialogs and 200% text.
- Keyboard: skip link, route focus, Enter/Space, Escape, dialog focus return,
  and browser back/forward pass in the full browser suite.
- Privacy: the real signed-fixture workflow issues same-origin bodyless GETs
  only; no APK upload, GitHub API call, analytics call, console error, or page
  error.
- Offline/update: offline demo reload and v1 verification pass; the update
  test leaves only the `apk-locker-v10` cache.
- Response policy: static configuration tests pass for CSP, route rewrites,
  MIME types, a real 404, caching, and allowed license connectivity.
- Production size: JS 39,053 B raw / 13,785 B gzip; CSS 10,648 B raw / 3,205 B
  gzip; hero WebP 75,842 B.
- Lighthouse 12.8.2 mobile `/demo`, three runs: Performance 100/100/100,
  Accessibility 100/100/100, Best Practices 100/100/100, SEO 100/100/100.
  Median FCP 0.903 s, LCP 1.804 s, TBT 0.039 s, CLS 0.

Evidence is under `.factory/qa-evidence/repair-8-local/`.

## Release and deployment

Version `0.5.1` uses Android version code 6 and service-worker cache
`apk-locker-v10`. Landing and README links point to deterministic `v0.5.1`
APK, AAB, and SHA256SUMS assets.

The tag-gated GitHub workflow runs lint, build, unit and browser tests,
Capacitor sync, release APK/AAB assembly, signature and package inspection,
backup-policy inspection, embedded source identity checks, exact packaged-web
comparisons, and checksum generation. Static deployment uses:

```sh
/opt/fleet/lib/deploy-static.sh apk-provenance-locker dist
```

Release and live verification completed successfully:

- Candidate/tag commit:
  `8fbbb02623dd765d341f4cdfdf6ae524b8934a3e` / `v0.5.1`.
- GitHub Actions run `33259644806`: success, including all package checks and
  publication of APK, AAB, and SHA256SUMS.
- Published APK: 5,587,400 B, SHA-256
  `158df45f8a7526ac957d816cacb67db95a3a9ed46ba15743eceb8285ea7f88ae`.
- Published AAB: 5,407,902 B, SHA-256
  `f6bb3d90152b2ed56fdcf65a3cacd75ca1e4d9d82f2f10145ac05d196de03b91`.
- The downloaded checksums pass. Both packages contain version `0.5.1`, code
  6, and the exact candidate identity; every embedded web file matches local
  `dist/` byte for byte.
- Azure Static Web Apps deployment
  `cbce3523-bc0a-4849-8a01-026f6c1380fd` succeeded in `centralus`.
- Live `/build.json` names version `0.5.1` and the exact candidate commit. All
  20 publicly served `dist/` files byte-match the local tagged build.
- Live `/`, `/demo`, `/privacy`, and `/terms` return 200; the designed unknown
  route returns 404. APK, AAB, and checksum links return 200. Checkout returns
  303 to the Dodo-hosted session.
- Live `npm run test:live` passes at desktop and 390 px. Each real signed-APK
  flow made seven same-origin bodyless GETs and emitted no console errors.
- Live Axe scans have zero violations on all routes at desktop and 390 px and
  in the 200% evidence dialog. The live dialog remains 367/367 px. Offline
  demo reload and offline v1 verification pass with only `apk-locker-v10`.
- Live responses carry CSP with header-only `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, and the restrictive permissions
  policy. HTML and `sw.js` revalidate after 30 seconds; hashed assets are
  immutable for one year; the manifest has its correct MIME type.

Compact live and release results are in
`.factory/qa-evidence/repair-8-live/live-audit.json` and
`.factory/qa-evidence/repair-8-live/release-audit.json`. Route screenshots and
the 200% dialog screenshot are in the same directory.

## Known gaps and operator notes

- The release APK uses the workflow-generated signing key required for this
  factory stage. A store listing needs the owner's upload key.
- The app is not on Google Play. Users must allow the selected browser or file
  manager to install the APK.
- No release-blocking product gap is known after this repair.
