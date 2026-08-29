# APK Provenance Locker repair 7 handoff

## Result

All four release blockers from independent verification 8 are repaired for
release `v0.5.0`:

1. The Android release tag now builds the current source as version `0.5.0`
   (code 5). The workflow compares every `dist/` file with both the APK and
   AAB, checks embedded `build.json`, and requires the packaged **Keep record**
   and **Remove record** confirmation copy before publication.
2. Android backup and full-backup content are disabled. Locker records, saved
   APK bytes, and the Plus token are therefore excluded from Android system
   backup and device transfer.
3. Focus uses a 3 px paper ring plus a 7 px ink ring. The light ring contrasts
   15.94:1 with night ink; the dark ring contrasts 14.47:1 with warm pulp and
   12.84:1 with moss paper.
4. The saved-copy checkbox has a 44 px minimum label target and a 20 px visible
   control at desktop and 390 px.

The researched scope, offline behavior, local verification, demo isolation,
paid license flow, and confirmed record removal behavior are unchanged.

## Reproduction and root cause

The old `v0.4.0` APK was reproduced at 5,585,535 bytes with SHA-256
`05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0`.
Its embedded `build.json` named commit `152ed6e25a66eb5ddae98d583c997d535bb736de`,
its worker used `apk-locker-v7`, and its JavaScript lacked **Keep record**.
The source manifest set `android:allowBackup="true"`; the global focus color was
`#ff9a6f`; and the checkbox label had no minimum target height.

The root causes were a release tag left behind after the safety repair, an
unrestricted default Capacitor backup policy, one focus color used across dark
and pale surfaces, and sizing only the checkbox glyph instead of its label.

## Regression coverage

- `.factory/claims.json` now includes
  `@claim:android-backup-disabled`. It asserts both native backup flags and the
  packaged-manifest workflow checks.
- The release configuration test requires v0.5.0/code 5, exact APK and AAB web
  byte comparisons, packaged backup flags, and both confirmation actions.
- Browser coverage measures the checkbox label at 1440 px and 390 px and
  requires at least 44 px height.
- Browser coverage reads the computed dual-ring focus styles and calculates
  both light-on-dark and dark-on-light contrast above 3:1.
- The existing saved-copy-erasure claim still proves cancellation keeps the
  record and confirmation erases metadata plus IndexedDB bytes.
- Release links point only to deterministic `v0.5.0` assets. SHA-256 values
  come from the versioned `SHA256SUMS` asset, avoiding a stale hash embedded in
  the package whose own bytes it describes.

## Verification evidence

Run from a clean dependency install on 2026-08-29 UTC:

- `npm ci`: 189 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: pass; 0 vulnerabilities.
- `npm run lint`: pass.
- `npm run test:unit`: 17/17 pass.
- `npm run test:browser`: 33/33 pass in Chromium, including desktop, 390 px,
  keyboard, dialogs, 200% text, axe, reduced motion, offline reload, service
  worker update, privacy network logging, and all product workflows.
- `npm test`: pass; the same 17 unit/integration and 33 browser tests.
- Every one of the 23 claim commands in `.factory/claims.json`: exactly one
  selected test and pass.
- `npm run build`: pass; `dist/` produced. Initial JS is 39.06 KB raw / 13.91
  KB gzip. CSS is 10.46 KB raw / 3.13 KB gzip.
- `npx cap sync android`: pass.
- Factory `verify-url.sh` on local `/` and `/demo`: HTTP 200, correct titles,
  `lang=en`, one h1, main landmark, complete alt/button labels, and zero console
  errors at desktop and 390 px.
- Lighthouse 12.8.2 mobile `/demo`: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.8 s, TBT 50 ms, CLS 0.

Local screenshots, reports, and Lighthouse JSON are under
`.factory/qa-evidence/repair-7-local/`.

## Release and deployment

The `v0.5.0` tag workflow runs lint, build, unit tests, the full Playwright
suite, Capacitor sync, release APK/AAB assembly, signature verification,
package/version inspection, backup-policy inspection, embedded source identity
checks, exact packaged-web comparisons, and SHA256SUMS generation. It publishes
`app-release.apk`, `app-release.aab`, and `SHA256SUMS` to the GitHub release.

The PWA deploy command is:

```sh
/opt/fleet/lib/deploy-static.sh apk-provenance-locker dist
```

After deployment, verify `/`, `/demo`, `/privacy`, `/terms`, the real 404,
`/build.json`, response headers, release asset redirects, package contents,
and the live desktop/390 px APK flow.

## Known gaps and operator notes

- The release APK uses the workflow-generated release key, as required for
  this factory stage. A store listing needs the owner's upload key.
- The app is not on Google Play. Users must allow the selected browser or file
  manager to install the APK.
- No functional release blocker remains. Android remains the final authority
  on whether a package may be installed.
