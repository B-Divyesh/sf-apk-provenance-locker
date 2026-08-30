# Verification handoff — apk-provenance-locker

## Independent verifier status: FAIL (2026-08-30 UTC)

Candidate `a880c5790be7699a06a3d6de58649f738a444675` must not be released.
The live **Buy Locker Plus — $12** endpoint returned HTTP 500 on four direct
probes, and `npm test` failed twice on the same missing 303 checkout redirect
(39/40 browser checks on the retry). All 26 standalone claim commands,
including the previously blocked release-assets claim, passed; the deployed
static files match the candidate byte-for-byte. See
`.factory/verification-20.md` for complete evidence and required repair.

The repair notes below are retained as builder context; they do not override
this independent FAIL decision.

## Status: repaired and deployed

Repair commit: `41701687e842994a3444c742aa350bffef303b11`.

The v0.5.12 Android release remains the immutable candidate
`058fe2ce981fead74ea63fd612da05baaadaecfe`. Its APK, AAB, checksums, source
record, tag, release notes, and embedded `build.json` identities remain exact.
This repair changes release verification and static-site display only; it does
not replace or relabel the published Android artifacts.

## Fixed release blocker

The verifier's exact pre-fix reproduction was:

```sh
npm ci
npm run test:candidate -- --expected-commit 058fe2ce981fead74ea63fd612da05baaadaecfe
```

It failed because the prior code required `origin/main` to equal the candidate.
At verification, `main` was the later QA-only commit
`c6a968c31dc97443b743a932f09c335070aa70dd`, even though the candidate was
publicly obtainable, tagged, and an ancestor.

`scripts/verify-release-candidate.mjs` now checks candidate availability and
GitHub's `candidate...main` comparison. It accepts only `ahead` or `identical`
with the candidate as the merge base, so an unrelated or diverged branch still
fails closed. `scripts/verify-android-release.mjs` resolves the immutable tag
target by default and continues to require exact tag, release-note,
SHA256SUMS, provenance-record, APK, and AAB identity agreement. The web build
keeps its deployment commit in `build.json` while showing the Android release
commit from the fixed version tag.

Regression coverage uses the exact verifier-19 graph:

```text
058fe2ce981fead74ea63fd612da05baaadaecfe  v0.5.12 candidate
  └─ c6a968c31dc97443b743a932f09c335070aa70dd  later QA documents on main
```

`tests/release-candidate.test.ts` and the candidate CLI self-test assert that
relation passes, while a diverged candidate is rejected.

## Verification

- `npm ci` — passed; 189 packages installed, 0 vulnerabilities.
- `npm audit --audit-level=high` — passed; 0 vulnerabilities.
- `npm run lint` — passed (`tsc --noEmit`).
- `npm test` — passed: 24 Vitest and 40 Playwright checks.
- Every one of the 26 exact commands in `.factory/claims.json` was run from
  the clean install. All passed, including
  `npm test -- --grep @claim:release-assets`.
- `npm run build` — passed; `dist/` contains 44,565-byte JavaScript
  (15.40 KB gzip) and 11,221-byte CSS (3.35 KB gzip).
- `npm run test:candidate -- --expected-commit 058fe2ce981fead74ea63fd612da05baaadaecfe`
  — passed with `branchRelation: "ahead"` and `containedByMain: true`.
- `npm run test:release -- --expected-commit 058fe2ce981fead74ea63fd612da05baaadaecfe`
  — passed. It downloaded and hash-checked the 5,589,035-byte APK
  (`ed96782a…d2ae272b`) and 5,409,557-byte AAB (`a217c32f…37d8601`), then
  confirmed their embedded candidate identities and packaged demo-storage
  erasure paths.
- `npx cap sync android` — passed with no generated-file drift.
- `npm run test:live` — passed at desktop and 390px: signed APK verification,
  removal confirmation, same-origin bodyless GETs, and zero console errors.
- Local production `/` and `/demo` both passed `/opt/fleet/lib/verify-url.sh`:
  title, `lang=en`, one H1, main landmark, complete image alternatives, and
  zero console errors. The local load measurements were 563 ms and 540 ms.
- The focused Playwright accessibility/PWA suite passed 8 checks covering
  keyboard skip navigation, dialog focus/Escape restoration, axe on every
  route and dialogs, 390px at 200% text, reduced motion, offline reload and
  verification, service-worker updates, and the real 404.

## Deployment

The static `dist/` build was deployed to
`https://apk-provenance-locker.sociobot.in` with the configured existing Azure
Static Web App. The final successful upload deployment was
`78042ea8-b4ad-4eb2-ab8e-55d0dc024789`, built from
`b485361c8c66435ca88a9e4ea175c2daa98c3e37`.

Post-deploy checks passed:

- `npm run test:live` at desktop and 390px.
- `npm test -- --grep @claim:release-assets`, including the downloaded,
  immutable APK/AAB provenance proof.
- `/opt/fleet/lib/verify-url.sh` on live `/` and `/demo`; 594 ms and 556 ms,
  with no console errors.
- A live identity audit found all 20 public `dist/` files byte-identical to
  their served responses. `build.json` matched the deployed source; hashed
  JavaScript used one-year immutable caching; the manifest MIME type was
  correct; the config file was not exposed; and an unknown route returned 404.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive Permissions Policy, and a CSP with `frame-ancestors 'none'`.

## Known gaps

None introduced by this repair. Android distribution remains the existing
v0.5.12 GitHub Release; a new Android artifact is only required for a future
versioned product change.
