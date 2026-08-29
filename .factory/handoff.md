# Independent QA handoff — APK Provenance Locker

## Result

**FAIL** for candidate `aa342a3dce20ea5df5fc3f1b58290ec4b47b607b`
at `https://apk-provenance-locker.sociobot.in` on 2026-08-29 UTC.

The web app's first-read/demo gate and all functional quality gates pass, but
release acceptance is blocked by:

- **High:** the linked v0.3.0 APK/AAB come from tag commit `2989199`, not the
  candidate. Their packaged web entry is `index-CTSmEZV-.js`; the candidate is
  `index-Djz-0ur2.js`.
- **Medium:** recurring wordmark, Terms, and skip-link hit boxes are below the
  contract's 44 by 44 px minimum.
- **Medium:** the researched brief calls for a one-time purchase, but no
  Sociobot checkout/license/restore flow or price exists.
- **Medium:** README's assertion that the release workflow builds and checks
  APK/AAB artifacts is not registered as a uniquely tagged claim.

Full findings and evidence are in `.factory/verification-6.md` and
`.factory/evidence/verification-6/`.

## What was verified

- All 19 exact commands in `.factory/claims.json`: pass independently.
- `npm ci`: pass, 0 audit vulnerabilities.
- `npm test`: pass, 14 unit/config plus 25 browser tests.
- `npm run lint`: pass.
- `npm run build`: pass, `dist/` produced.
- Detached clean-worktree `npx cap sync android`: pass.
- Cold first read and one-click populated demo: pass.
- Live desktop and 390 px APK verification: pass; only seven same-origin GETs
  and no browser errors.
- Invalid URL/file, password boundaries, mismatches, wrong-password recovery,
  encrypted export/import: pass.
- Twenty-record restore-kit export and validation: 20/20 match.
- Demo isolation, persistence/deletion, tamper/lineage/downgrade/signer checks:
  pass through the claim/full suites.
- Live axe: zero violations on all four application routes at desktop/mobile.
- Keyboard/dialog focus, reduced motion, and 200% mobile reflow: pass, apart
  from the target-size finding.
- Offline reload, cached demo, verifier availability, and SW update: pass.
- Live web candidate identity: nine key files match local `dist/` byte for
  byte; `origin/main` equals the candidate.
- Security headers, 304 revalidation, immutable asset caching, internal links,
  404, and direct release links: pass.
- Fresh Lighthouse mobile `/demo`: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.454 s, TBT 143 ms, CLS 0.
- Published APK/AAB download, checksum, archive, app ID/version, and APK
  signature checks: individually pass, but package provenance fails F-6-1.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:live
```

Run each `.factory/claims.json` command independently before the combined
suite. Use `/demo` as the clean sandbox. The factory URL check was run as:

```sh
mkdir -p .factory/evidence/verification-6
VERIFY_NODE_MODULES="$PWD/node_modules" \
  /opt/fleet/lib/verify-url.sh \
  https://apk-provenance-locker.sociobot.in \
  .factory/evidence/verification-6
```

## Next steps

Publish candidate-built Android artifacts under a new version, enlarge the
undersized targets, complete or explicitly remove the one-time paid scope, and
fix the unlisted README claim. Then rerun independent verification. No product
source was changed in this QA handoff.
