# Repair handoff — APK Provenance Locker

## Independent verification 21

Verification work order `apk-provenance-locker-verify-21` completed with
**PASS** on 2026-09-05 UTC: zero findings and zero untested public claims.
The implementation reviewed was
`614badd1471bf84e7bffec1f4dd042eb5eb63b08`; the later documentation/evidence
revision was `05ab79387182a604c469f9b212ef0aeb7936992f`. See
`.factory/verification-21.md` for complete independent evidence. It records
26/26 claim commands, 24 unit + 41 browser tests, live desktop/phone flows,
checkout redirects, rate limiting, accessibility, offline behavior, Android
artifact provenance, links, and the disposition of every earlier finding.

## Status

Repair work order `apk-provenance-locker-repair-14` is complete and deployed.
The live site serves implementation `614badd1471bf84e7bffec1f4dd042eb5eb63b08`
at <https://apk-provenance-locker.sociobot.in>.

The documentation and evidence snapshot is
`2348afab412e5e9d9a335ff3dadc4c696fe60370`; it is report-only and was not
deployed over the implementation build.

The final Azure Static Web Apps deployment is
`547c4c63-0a98-4431-84fb-f108f8157ff3`. Live `/build.json` names the exact
implementation commit. A preliminary upload in this session was immediately
superseded because its build stamp still named the base commit; it was not used
for final verification.

The immutable Android v0.5.12 release still comes from
`058fe2ce981fead74ea63fd612da05baaadaecfe`. Its published APK, AAB, checksums,
source record, tag, and embedded identity remain mutually consistent. This
work order repaired the deployed web startup path and did not relabel those
Android artifacts.

## Recorded defects

### Hosted checkout — resolved external dependency

Verification 20 received HTTP 500 from the Sociobot checkout endpoint. No raw
provider integration or app-side workaround was added. During this repair the
authorised Sociobot/Dodo registration was healthy again:

- The exact `@claim:hosted-checkout` command passed from the clean checkout.
- Three consecutive direct probes returned HTTP 303 to
  `checkout.dodopayments.com`.
- The hosted order page showed **APK Provenance Locker Plus** at **$12.00**.
- The complete 41-test browser suite passed.

This proves checkout creation, not paid entitlement. No purchase was made and
no credential was invented. Valid, invalid, and revoked license transitions
remain covered with recorded browser fixtures. Public offer metadata is in
`/work/.evidence/billing-offer.json` and the repository evidence copy.

### Mobile Lighthouse 87 — fixed

The failing audit transferred about 95 KiB and recorded 523 ms total blocking
time. The repair now:

- sends the 20,448-byte 640 px hero derivative to the Lighthouse phone layout;
- keeps APK parsing out of the first-screen module;
- loads the parser only after the user starts APK verification;
- precaches that lazy parser chunk so offline APK verification still works;
- updates `fflate` to 0.8.3, which also clears the reported dependency advisory.

The production build now contains 36.47 KB initial JavaScript (12.11 KB gzip),
a 9.73 KB lazy APK chunk (4.41 KB gzip), and 11.22 KB CSS (3.35 KB gzip). An
outcome browser regression checks the first-screen transfer, responsive image,
lazy load, and successful signed-APK result.

Three fresh live mobile Lighthouse runs each scored **100 performance, 100
accessibility, 100 best practices, and 100 SEO**. FCP was 902–905 ms, LCP was
1,052–1,055 ms, TBT was 9–12 ms, CLS was 0, and transfer was about 37.5 KB.

## Clean verification

The final implementation was cloned from GitHub into a new directory. From
that clean checkout:

- `npm ci` — passed; 189 packages installed and zero vulnerabilities.
- Every exact command in `.factory/claims.json` — **26/26 passed separately**.
- `npm test` — passed: 24 Vitest and 41 Playwright tests.
- `npm run lint` — passed.
- `npm run build` — passed and produced `dist/`.
- `npm audit --audit-level=high` — passed with zero vulnerabilities.
- `npx cap sync android` — passed.
- `npm run test:candidate -- --expected-commit 614badd1471bf84e7bffec1f4dd042eb5eb63b08`
  — passed; the commit is obtainable and identical to `origin/main` at the
  implementation checkpoint.
- `npm run test:release` — passed for v0.5.12. It downloaded and checked the
  5,589,035-byte APK and 5,409,557-byte AAB against their checksums, source
  record, tag, packaged identities, and demo-erasure paths.

Evidence: `.factory/evidence/repair-14/claims-all.log`,
`clean-full-test.log`, and `clean-build-consumer.log`.

## Live verification

- `npm run test:live` passed on desktop and 390 px with real signed-fixture
  verification, removal confirmation, same-origin bodyless GETs, and no app
  console errors.
- Fresh phone and desktop contexts clearly showed the job **Verify APKs before
  restoring**, the Android-user audience, and **Try it with sample data**.
- One click showed the F-Droid and KeePassDX records plus the persistent
  **Demo — sample data, nothing is saved** banner.
- Reset removed a deliberately added demo record, restored the two samples,
  and preserved both real localStorage and IndexedDB sentinels.
- Normal, invalid APK, invalid URL, password-length, password-mismatch, wrong
  password, one-record restore, and 20-record restore paths passed live.
- The live restore kit hid the package name in ciphertext. APK verification
  and export made no third-party requests and sent no request bodies.
- `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 had one H1, one main
  landmark, correct titles, no missing image alternatives, no 390 px or 200%
  text overflow, and no serious or critical axe findings.
- Keyboard skip navigation, visible focus, dialog focus/Escape restoration,
  reduced motion, service-worker update state, and offline demo reload passed.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo` with zero app
  console errors.
- Every rendered link resolved. The checkout link reached Dodo; all four
  immutable GitHub release downloads returned 200.
- License verification allowed 30 requests, then returned 429 with
  `Retry-After: 4` and the exact product-origin CORS header.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive Permissions Policy, and CSP `frame-ancestors 'none'`.

An unknown URL intentionally returns HTTP 404 with the product's heading,
metadata, landmarks, and return action. The browser's failed-resource message
for that deliberate navigation is expected, not a broken page.

Evidence is under `.factory/evidence/repair-14/`, including live screenshots,
route/axe results, the demo reset proof, checkout probes, rate-limit proof,
full link audit, response headers, deployment identity, and three Lighthouse
reports.

## Earlier findings

The complete earlier review and verification history was re-read before this
repair. The full clean and live suites reconfirm the prior corrections for the
404 structure and metadata, plain wording, product-first one-click demo,
separate demo storage and exit erasure, restore import and verified APK
download, free-core entitlements, navigation focus/scroll restoration,
offline/update behavior, Android release provenance, and source-candidate
ancestry. No earlier minor finding regressed.

## Known limits

- Sociobot/Dodo remains an external dependency for buying and verifying Locker
  Plus. Current redirect creation is stable, but this repository cannot repair
  or operate that service.
- The Dodo-hosted page logs two accelerometer Permissions Policy warnings. They
  occur on the provider origin and do not affect checkout. Product pages log no
  errors.
- No real payment or post-purchase license was created in this repair. A
  checkout redirect alone is not recorded as entitlement proof.
- This static product has no product backend, tenant store, process restart, or
  shared database. User and demo state persistence is local browser storage;
  refresh, offline reload, and demo isolation were tested instead.

## Reproduce

```sh
npm ci
npm run lint
npm test
npm run build
npm audit --audit-level=high
npx cap sync android
npm run test:candidate -- --expected-commit 614badd1471bf84e7bffec1f4dd042eb5eb63b08
npm run test:release
npm run test:live
```
