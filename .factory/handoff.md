# APK Provenance Locker repair 11 handoff

## Result

The two findings in independent verification 16 are repaired for release
`v0.5.11` (Android version code 16). The APK/AAB release is produced from the
same immutable commit as this handoff, and the 404 page now reflows at 390px
with text enlarged to 200%.

The researched scope, paper-cut visual system, local APK verifier, encrypted
restore flow, isolated demo, paid device labels, and all previously passing
behavior remain unchanged.

## Repairs

1. **Android release provenance:** all download links now target the new
   immutable `v0.5.11` release. The tag workflow checks the Git commit against
   `build.json`, packages that exact build into both Android files, creates
   `SHA256SUMS` and `RELEASE_PROVENANCE.json`, and redownloads all four assets
   after publication. The exact `release-assets` claim command now runs that
   published-package audit after its browser check. It fails for a stale tag,
   release note, source record, checksum, embedded build identity, APK, or AAB.
2. **404 text reflow:** the standalone 404 wordmark can wrap at narrow widths.
   Its browser regression now uses a 390×844 viewport, enlarges text to 200%,
   runs axe, and asserts that both the document and wordmark have no horizontal
   overflow.

The PWA cache was advanced to `apk-locker-v21`, so installed copies receive the
new shell. The manifest, README, static 404 footer, web release links, Android
version name, workflow package assertion, tests, and claim registry all use
`0.5.11`.

## Reproduction evidence

- `npm run test:release -- --expected-commit
  20f18f0c906cab75a91250e494168f915375fd1f` failed with `Release notes do not
  bind the immutable source commit` against the stale v0.5.10 release.
- Before the CSS repair, Playwright measured the 404 at 489px document width in
  a 390px viewport at 200% text. The wordmark measured 335px client width and
  462px scroll width.

## Verification evidence

- Clean install: `npm ci` installed 189 packages with 0 vulnerabilities.
- Dependency gate: `npm audit --audit-level=high` passed with 0 vulnerabilities.
- Type/lint: `npm run lint` passed.
- Unit/config: 22 tests passed.
- Browser integration: 40 tests passed in Chromium. These cover desktop,
  390px mobile, keyboard and focus behavior, axe, 200% text, offline reload,
  service-worker updates, demo isolation, privacy/network boundaries, license
  behavior, genuine APK signatures, a 12 MiB export, and 20 saved APKs.
- Production build: `npm run build` produced `dist/`; JavaScript was 44,565
  bytes (15.40 KB gzip), CSS was 11,221 bytes (3.35 KB gzip), and the hero WebP
  was 75,842 bytes.
- Capacitor consumer check: `npx cap sync android` passed without tracked
  generated changes. App id remains `in.sociobot.apk_provenance_locker`.
- URL verifier: `/` and `/demo` returned 200 with titles, `lang=en`, one H1,
  one main landmark, complete image alternatives, labeled buttons, and zero
  console/page errors. Evidence is in `.factory/repair-evidence/`.
- Local mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.1s, LCP 1.7s, CLS 0, TBT 60ms, transfer 95 KiB.
- Release acceptance: `npm test -- --grep @claim:release-assets` is the exact
  end-to-end command. It checks the `/demo` links, downloads the published APK,
  AAB, checksums, and source record, verifies their hashes and embedded
  identities, checks the tag and release notes, and exercises the packaged demo.
- Production identity: `npm run test:live` and `/opt/fleet/lib/verify-url.sh`
  are rerun after the static deployment. Response headers, the real HTTP 404,
  offline/update behavior, and the live `build.json` are checked separately.

## Run it

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build
npx cap sync android
```

Run one declared claim with `npm test -- --grep @claim:<id>`. After the GitHub
release exists, audit its published provenance with:

```sh
npm run test:release -- --expected-commit "$(git rev-parse HEAD)"
```

## Deployment

The static artifact is `dist/` and deploys to
<https://apk-provenance-locker.sociobot.in>. The Android workflow publishes
`v0.5.11` from the matching tag and attaches `app-release.apk`,
`app-release.aab`, `SHA256SUMS`, and `RELEASE_PROVENANCE.json`.

## Known limitation and operator action

The GitHub workflow signs this sideload release with a new generated key, as
required by the work order. A store/update channel needs the owner's stable
upload key. Lighthouse does not provide a lab INP value; the browser suite
instead exercises the interactive flows without application errors. No repair
finding remains open.
