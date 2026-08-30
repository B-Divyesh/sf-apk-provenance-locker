# APK Provenance Locker repair 12 handoff

## Result

Independent verification 17's release-blocking candidate identity failure is
repaired for `v0.5.12` (Android version code 17). The obtainable report commit
`76e414b95380bb6295acab6e3cb000b879238a11` was the repair base. The final tag,
release notes, source record, APK, AAB, checksums, and deployed `build.json`
bind the exact pushed `v0.5.12` commit.

The researched scope, paper-cut visual system, local APK verifier, encrypted
restore flow, isolated demo, paid device labels, and all previously passing
behavior remain unchanged.

## Reproduction and root cause

The supplied candidate `d7186184975c193d520d40a14b27fb552067e8ce` was not a
GitHub object. `git fetch` returned `not our ref`, the GitHub commit API returned
422, and the release audit failed because v0.5.11 correctly named the different
available commit `d71861d6633f0e1d5c1d67e2ab1845a7f12e115f`.

The release pipeline checked a tag and its packaged identity, but it did not
make remote candidate availability an explicit gate before build work. Exact
before-and-after output is in `.factory/evidence/repair-12/reproduction.md`.

## Repair

- `scripts/verify-release-candidate.mjs` checks a complete candidate SHA
  against GitHub and requires `origin/main` to equal it.
- The Android workflow runs that check immediately after checkout, before
  dependency installation, tests, builds, signing, or publication.
- The published-package verifier runs the same preflight before it reads
  release metadata or downloads artifacts.
- A regression recreates verifier 17's exact missing SHA, HTTP 422 response,
  and available commit. It also covers an existing but unpushed candidate.
- Release metadata, web links, manifest, service-worker cache, Android version,
  claim copy, and package assertions advance together to v0.5.12 / code 17.

## Verification evidence

- Clean install: `npm ci` installed 189 packages with 0 vulnerabilities.
- Dependency gate: `npm audit --audit-level=high` passed.
- Type/lint: `npm run lint` passed.
- Unit/config: 23 tests passed, including the exact identity regression.
- Browser integration: all 40 Playwright tests passed. Coverage includes
  desktop and 390px mobile, keyboard and focus, axe, 200% text, privacy request
  logging, demo isolation, reduced motion, offline reload/update, genuine APK
  signatures, export/import recovery, 12 MiB storage, and 20 saved APKs.
- Production build: `npm run build` produced `dist/`; JavaScript is 44,565
  bytes (15.40 KB gzip), CSS is 11,221 bytes (3.35 KB gzip), and the hero WebP
  is 75,842 bytes.
- Capacitor consumer check: `npx cap sync android` passed without tracked
  generated changes. App id remains `in.sociobot.apk_provenance_locker`.
- Local URL checks found distinct titles, `lang=en`, one H1 and main landmark,
  complete image alternatives, labeled buttons, and no console/page errors on
  `/` and `/demo`. Desktop and 390px screenshots are under
  `.factory/evidence/repair-12/`.
- Local mobile Lighthouse scored 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO; FCP 1.1s, LCP 1.3s, CLS 0, and TBT 30ms.
- The successful tag workflow is the package build evidence. It verifies the
  binary manifest, app id/version, backup policy, APK signature, embedded web
  files, checksums, source record, and packaged demo before publication.
- `npm run test:release -- --expected-commit "$(git rev-parse v0.5.12^{commit})"`
  is the post-publication proof for the tag, notes, APK, AAB, SHA256SUMS,
  RELEASE_PROVENANCE.json, embedded `build.json`, and packaged demo exits.
- `npm run test:live` plus `/opt/fleet/lib/verify-url.sh` is the post-deployment
  proof for desktop, 390px mobile, headers, routes, offline/update behavior,
  response policy, and the live build identity.

## Run it

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build
npx cap sync android
```

After pushing the final commit, verify it before tagging:

```sh
npm run test:candidate -- --expected-commit "$(git rev-parse HEAD)"
```

After the tag workflow publishes the packages, verify the immutable release:

```sh
npm run test:release -- --expected-commit "$(git rev-parse v0.5.12^{commit})"
```

## Deployment

The static artifact is `dist/` and deploys to
<https://apk-provenance-locker.sociobot.in>. The Android workflow publishes
`v0.5.12` from the matching tag and attaches `app-release.apk`,
`app-release.aab`, `SHA256SUMS`, and `RELEASE_PROVENANCE.json`.

## Known limitation and operator action

The GitHub workflow signs each sideload release with a generated key, as the
work order requires. A stable store/update channel needs the owner's upload
key. Lighthouse does not provide a lab INP value; the browser suite exercises
the interactive paths without application errors. No repair finding remains
open.
