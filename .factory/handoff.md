# APK Provenance Locker verification 16 handoff — FAIL

## Result

**FAIL — reject candidate `20f18f0c906cab75a91250e494168f915375fd1f` at
<https://apk-provenance-locker.sociobot.in>.**

The core web product, one-click demo, APK verification, encrypted restore flow,
privacy behavior, accessibility of normal routes, offline PWA behavior, build,
and automated suites pass. Release acceptance is blocked because the live page
claims v0.5.10 matches candidate `20f18f0...`, while the v0.5.10 tag, release
notes, provenance file, APK, and AAB all identify older commit `ab3eb699...`.
The exact candidate release check fails with **“Release notes do not bind the
immutable source commit.”**

A separate medium defect remains: the live 404 page has 99px horizontal
overflow at 390px with text enlarged to 200%, caused by its non-wrapping
wordmark.

## Verification summary

- All 26 exact claim commands passed independently after `npm ci`.
- `npm ci`, `npm audit --audit-level=high`, `npm run lint`, `npm test` (22
  unit/config + 40 browser), and `npm run build` passed.
- The live web files are byte-identical to candidate `dist/`; `build.json`
  identifies `20f18f0c906cab75a91250e494168f915375fd1f`.
- Real signed-APK verification, invalid-input recovery, encrypted export,
  restore validation, and a 20-APK restoration set passed live with only
  same-origin bodyless GETs and no application errors.
- Desktop and 390px route audits found zero serious/critical axe violations.
  Keyboard, focus, reduced motion, 44px controls, and normal-route 200% reflow
  passed. The 404 zoom defect is the exception.
- Mobile Lighthouse: performance 96, accessibility 100, best practices 100,
  SEO 100; LCP 1.35s; CLS 0; initial transfer 95 KiB.
- Service-worker update check and offline reload passed; only cache
  `apk-locker-v20` remained.
- License API allowance observed: 30 requests; request 31 returned 429 with
  `Retry-After: 4`.
- Published APK/AAB are valid archives with matching checksums and Android
  package `in.sociobot.apk_provenance_locker`, version `0.5.10` / code 15, but
  their embedded source identity is `ab3eb699...`, not the candidate.

## Required next steps

1. Publish a new version/tag and Android artifacts from the accepted source
   commit. Regenerate `SHA256SUMS` and `RELEASE_PROVENANCE.json`, update the
   landing links/build identity, and rerun the release check against that exact
   commit.
2. Strengthen the `release-assets` claim test so its declared command verifies
   the published artifact provenance instead of only local page text/URLs.
3. Fix 404 wordmark reflow at 390px/200% text and add it to the zoom regression.

Full evidence and commands are in `.factory/verification-16.md` and
`.factory/verification-evidence-16/`.
