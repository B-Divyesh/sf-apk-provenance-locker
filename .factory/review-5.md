# Adversarial first-read review 5 — FAIL

Reviewed 2026-08-29 UTC. Live URL:
<https://apk-provenance-locker.sociobot.in>. Source base:
`b2b37d9b447ff68adaa341a6dcab2e15dcabd244`.

## Verdict

**FAIL.** Six findings remain: two blocking, two medium, and two minor.
All 26 declared claim commands passed independently from a clean clone. Two
claim-like statements are not declared in `.factory/claims.json`, so the
claim audit is not complete despite the green suite.

## Cold first read

Fresh 390 × 844 and 1440 × 900 contexts opened `/` with no prior storage.
Before scrolling, I could answer all three questions:

- What it does: checks an APK's signature, app/version, signing history, and
  SHA-256 file fingerprint before reinstalling it.
- For whom: Android users who keep APK files for a later reinstall.
- What to click first: **Try it with sample data**.

The exact first-screen evidence was “Verify APKs before restoring,” “For
Android users keeping APK files, this checks each app, version, signing
history, and SHA-256 file fingerprint before a reinstall,” and “Try it with
sample data.” The adjacent result says “Open two sample APK records.” All
three facts ended at y=764 on mobile and y=846 on desktop. This gate passes.

Evidence: `review-5-evidence/cold-mobile.png` and
`review-5-evidence/cold-desktop.png`.

## Findings

### Blocking

#### F-5-1 — Client navigation loses the new page top and the prior scroll position

**Location/evidence:** Live `/`, footer **Privacy** link. At 390 × 844, the
landing page was at its footer (`scrollY=3246`). Selecting **Privacy** used
`pushState`, rendered `/privacy`, and left it at its maximum scroll
(`scrollY=227`). The focused H1 began at y=-42, partly outside the viewport.
Selecting Back returned to `/` at `scrollY=2924`, not 3246. In source,
`src/main.ts` calls `history.pushState()` and `render(true)` without saving the
old scroll position or moving a new route to the top. `popstate` also rerenders
without restoring stored scroll.

**Why:** A visitor using the legal link reaches the bottom of the new page and
can miss its title and opening text. Back does not return to the place they
left. This fails the required deep-link/back/focus behavior and is broken
routing, which is blocking under this review contract.

**Fix:** Save the outgoing `scrollY` in the current history entry. Push new
routes with `scrollY: 0`, render, scroll to the top, then focus the H1. On
`popstate`, render, restore the saved scroll position, and focus/announce the
H1 without changing that restored position. Add a browser test that enters
Privacy from the landing footer and asserts both the new-route top and exact
Back restoration.

#### F-1-11 — The README release-workflow sentence exceeds 22 words again

**Location/quote:** README, “Develop and verify APK Provenance Locker”:
“After the tag workflow publishes a release, `npm run test:release` uses the
GitHub API to download its APK, AAB, checksums, and provenance record.” It is
23 whitespace-delimited words.

**Why:** Review 1 identified the same release-workflow overrun. Polish 1 marked
F-1-11 fixed, but the current replacement again exceeds the hard cap. The
history rule makes this regression blocking under the original ID.

**Fix:** “After a release is published, run `npm run test:release`. It
downloads the APK, AAB, checksums, and source record from GitHub.” Add the
current README to the copy regression test and compute counts with the same
whitespace rule used by the review.

### Medium

#### F-5-2 — The landing page publishes unlisted quantitative size claims

**Location/quote:** Live Android download status: “APK 5.3 MB · AAB 5.2 MB.”

**Why:** `release-assets` declares link/source binding, but its claim text does
not include package sizes. Its sandbox test uses mocked values rather than
measuring the published files. A downloader can rely on these numbers, so the
quantitative statements require a declared claim and measured assertion.

**Fix:** Add a `release-sizes` claim whose test obtains the published asset
byte lengths, applies the same MiB rounding, and compares them with the
displayed values. Alternatively remove the sizes from visitor copy.

#### F-5-3 — README promises an unlisted release-metadata fallback

**Location/quote:** README Privacy section: “It falls back to versioned links
when that request fails.”

**Why:** The behavior has an untagged browser regression test, but there is no
corresponding entry in `.factory/claims.json`. The claims contract requires
the visitor-facing promise to be listed and to have exactly one tagged test.

**Fix:** Add a `release-fallback` claim and tag the existing
`keeps immutable versioned release links when GitHub metadata is unavailable`
test as `@claim:release-fallback`; assert all four fallback links. Or remove
the sentence.

### Minor

#### F-5-4 — “Identity” and the compiled manifest are unexplained copy jargon

**Locations/quotes:** Landing empty state: “Choose a file to check its
signature and identity.” Landing workflow: “It extracts the package name and
version code from the compiled Android manifest.” README lead says “identity,”
and later names “compiled `AndroidManifest.xml`.”

**Why:** A first-time APK keeper should not have to translate “identity” or
know what a compiled manifest is. The useful result is the package name and
version.

**Fix:** Use “Choose a file to check its signature, package name, and version.”
Use “It reads the package name and version from the APK.” Rewrite the README
lead the same way; keep `AndroidManifest.xml` only in developer documentation.

#### F-5-5 — The download instructions do not explain “provenance” or “immutable source commit”

**Locations/quotes:** Landing: “Download release provenance from GitHub,”
“Use SHA256SUMS and the provenance record to check the package and its
immutable source commit,” and “Confirm the provenance commit matches the
source commit shown above.” README repeats “provenance record” and
`RELEASE_PROVENANCE.json` without first explaining its purpose.

**Why:** These terms describe the most important trust check in the download
section, but a first-time visitor cannot tell what is being compared or why.

**Fix:** Introduce the file by result: “Download the source record from
GitHub.” Then say, “Use SHA256SUMS to check the files. Use the source record to
confirm which repository commit built them.” Keep the literal filename in a
follow-up instruction.

## Copy audit

Counts are whitespace-delimited. Hyphenated terms, URLs, paths, and filenames
count as one word. Headings, labels, alt text, and actions are included because
the review explicitly covers them. Repeated controls remain listed where they
appear. No banned marketing adjective appears. Every landing action names a
result; navigation nouns and the required demo controls are appropriate.

### Live landing page

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| APK Provenance Locker | 3 | Pass |
| Demo | 1 | Pass |
| Locker | 1 | Pass |
| Privacy | 1 | Pass |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android users keeping APK files, this checks each app, version, signing history, and SHA-256 file fingerprint before a reinstall. | 20 | Pass |
| Try it with sample data | 5 | Pass |
| Open two sample APK records. | 5 | Pass |
| Verify an APK | 3 | Pass |
| Verified on this device | 4 | Pass |
| Password-encrypted exports | 2 | Pass |
| No sign-in or account | 4 | Pass |
| A paper-cut archive cabinet holding APK evidence parcels and certificate slips. | 11 | Pass — useful alt text |
| Your APK files are never uploaded. | 6 | Pass |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Verify an APK | 3 | Pass |
| Export restore kit | 3 | Pass |
| No APK evidence yet | 4 | Pass |
| Verified APKs will appear here. | 5 | Pass |
| Choose a file to check its signature and identity. | 9 | F-5-4 |
| Verify your first APK | 4 | Pass |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks Android's v1, v2, and v3 signatures and creates a SHA-256 file fingerprint on this device. | 18 | Pass |
| Read the package and version. | 5 | Pass |
| It extracts the package name and version code from the compiled Android manifest. | 13 | F-5-4 |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signing history and version codes reveal new certificates and incompatible downgrade risk. | 13 | Pass |
| Optional one-time purchase | 3 | Pass |
| Group APKs by device | 4 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for sorting a large locker. | 10 | Pass |
| Verification, signer and downgrade warnings, and restore-kit export stay free. | 10 | Pass |
| The free locker is active. | 5 | Pass |
| Buy Locker Plus — $12 | 5 | Pass |
| Restore Locker Plus license | 4 | Pass |
| Sociobot hosted checkout. | 3 | Pass |
| Android download | 2 | Pass |
| APK checks run on this device using Android's signature rules. | 10 | Pass |
| Android still makes the final install decision. | 7 | Pass |
| v0.5.7 matches source b6d8aeb8c9e1. | 4 | Pass — release-assets |
| APK 5.3 MB · AAB 5.2 MB. | 7 | F-5-2 |
| Download APK from GitHub | 4 | Pass |
| Download AAB from GitHub | 4 | Pass |
| Download SHA256SUMS from GitHub | 4 | Pass |
| Download release provenance from GitHub | 5 | F-5-5 |
| Use SHA256SUMS and the provenance record to check the package and its immutable source commit. | 15 | F-5-5 |
| Download the APK, SHA256SUMS, and provenance record. | 7 | F-5-5 |
| Compare the APK's SHA-256 file fingerprint with the matching line in SHA256SUMS. | 12 | Pass |
| Confirm the provenance commit matches the source commit shown above. | 10 | F-5-5 |
| Allow installs from your browser or file manager when Android asks. | 11 | Pass |
| Open the APK. | 3 | Pass |
| Android shows the final install decision. | 6 | Pass |
| Records and saved APK copies stay on this device. | 9 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory · v0.5.7 | 6 | Pass |

### README

| Sentence or label | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker | 3 | Pass |
| APK Provenance Locker verifies APK signatures, identity, SHA-256 file fingerprints, and signing history before an Android reinstall. | 17 | F-5-4 |
| It is for people who keep lawful APK files and want an encrypted restore kit. | 15 | Pass |
| The app verifies Android's v1, v2, and v3 signing formats on this device. | 13 | Pass |
| It checks signing history after an Android signing-key change and rejects files whose signed contents changed. | 16 | Pass |
| It reads the package name, version name, and version code from compiled AndroidManifest.xml. | 13 | F-5-4 |
| Prior verified records reveal a new signing certificate and lower-version downgrade risk. | 12 | Pass |
| Android still makes the final install decision. | 7 | Pass |
| Use APK Provenance Locker | 4 | Pass |
| Open the app and choose Verify an APK. | 8 | Pass |
| Choose an APK you own and add its source URL. | 10 | Pass |
| Choose whether to keep an optional APK copy in local app storage. | 12 | Pass |
| Choose Export restore kit and set a password. | 8 | Pass |
| Later, choose Validate a restore kit to check saved copies. | 10 | Pass |
| Import verified records or download a verified saved APK from the report. | 12 | Pass |
| Try the isolated sample at /?demo=1 or /demo. | 8 | Pass |
| The demo keeps its records and files separate from your real locker. | 12 | Pass |
| Leaving, Reset demo, and Start for real erase demo data. | 10 | Pass |
| Removing a record first asks for confirmation. | 7 | Pass |
| Confirming it erases its optional saved copy. | 7 | Pass |
| Develop and verify APK Provenance Locker | 6 | Pass |
| npm ci | 2 | Pass |
| npm run lint | 3 | Pass |
| npm test | 2 | Pass |
| npm run build | 3 | Pass |
| npx cap sync android | 4 | Pass |
| npm test -- --grep @claim:\<id\> runs each observable claim listed in .factory/claims.json. | 12 | Pass |
| The production static site is written to dist/. | 8 | Pass |
| After the tag workflow publishes a release, npm run test:release uses the GitHub API to download its APK, AAB, checksums, and provenance record. | 23 | F-1-11 |
| It confirms that the tag, release notes, provenance, and both packages name this repository commit. | 15 | F-5-5 |
| It also checks that Start for real, Locker, and the wordmark erase demo data. | 14 | Pass |
| Deploy APK Provenance Locker | 4 | Pass |
| The factory deploys dist/ with the configured static work order. | 10 | Pass — operator instruction |
| Pushing a matching v\<version\> tag runs the Android release workflow and publishes APK, AAB, and checksum assets. | 17 | Pass — operator instruction |
| APK checks run in the browser. | 6 | Pass |
| Developers can inspect the pinned apksig-go v1.1.0 WebAssembly adapter in tools/apksig-wasm. | 11 | Pass — developer dependency detail |
| Android fixtures and their exact checksums are in tests/fixtures. | 9 | Pass — developer fixture detail |
| Android downloads | 2 | Pass |
| Download APK | 2 | Pass |
| Download AAB | 2 | Pass |
| Download SHA256SUMS | 2 | Pass |
| Download release provenance | 3 | F-5-5 |
| These links use the immutable v0.5.7 release. | 7 | Pass — release-assets |
| Compare each file fingerprint with SHA256SUMS. | 6 | Pass |
| Then confirm RELEASE_PROVENANCE.json names the tag and source commit embedded in both Android packages. | 14 | F-5-5 |
| Optional Locker Plus | 3 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for organizing a large locker. | 10 | Pass |
| Verification, signer and downgrade warnings, and restore-kit export stay free. | 10 | Pass |
| Buy through Sociobot's hosted checkout, or use Restore Locker Plus license to restore a purchase on another device. | 18 | Pass |
| A refunded or revoked license stops private device labels. | 9 | Pass |
| Verification remains free. | 3 | Pass |
| Privacy and license | 3 | Pass |
| Records and optional APK copies stay in browser or installed-app storage. | 11 | Pass |
| Android system backup and device transfer are disabled for installed-app data. | 11 | Pass |
| Recording, checking, and exporting send no APK data or record content over the network. | 14 | Pass |
| There are no analytics, advertising, or accounts. | 7 | Pass |
| The download section sends one bodyless GET to api.github.com for public release metadata. | 13 | Pass |
| It falls back to versioned links when that request fails. | 10 | F-5-3 |
| A saved Plus license is sent only to Sociobot for verification, at most once each day. | 16 | Pass |
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 13 | Pass — outcome precedes algorithms |
| The app does not store the export password. | 8 | Pass |
| See /privacy and /terms. | 4 | Pass |
| The source is MIT licensed. | 5 | Pass — confirmed by LICENSE |

The catalog description, “Verify APK signatures and record file fingerprints
before a reinstall,” is 10 words, starts with a verb, contains no banned
adjective, and is 70 characters.

### Terminology

| Concept | Current product term | Result |
| --- | --- | --- |
| Android package archive | APK | Pass |
| Stored package/version/signature entry | APK record; its contents are evidence | Pass |
| SHA-256 digest | file fingerprint | Pass |
| Password-encrypted export | restore kit | Pass |
| Optional stored APK bytes | saved APK copy | Pass |
| Certificate-change sequence | signing history | Pass |
| Lower version-code warning | downgrade risk | Pass |
| APK package/version | identity / package and version | F-5-4 |
| Release-to-source mapping file | provenance record / source record | F-5-5 |

## Demo and sandbox behavior

| Check | Result |
| --- | --- |
| One-click entry | Pass: the first-screen action opened `/?demo=1`. |
| Product visible immediately | Pass: first record y=638 on 390 × 844 and y=490 on 1440 × 900. |
| Realistic sample | Pass: F-Droid 1.21.0 and KeePassDX 4.1.7 records appeared. |
| Persistent banner | Pass: “Demo — sample data, nothing is saved,” Reset demo, and Start for real remained present. |
| Reset | Pass: an edited one-record demo reseeded both records and removed the demo IndexedDB bytes. |
| Real data untouched | Pass: a real localStorage sentinel and real IndexedDB bytes survived demo Reset unchanged. |
| Start for real | Pass: edited demo records were deleted and the real sentinel remained. |
| Locker exit | Pass: edited demo records were deleted before `/#locker`; the banner matched real mode. |
| Wordmark exit | Pass: edited demo records were deleted before `/`; the banner matched real mode. |
| APK request log | Pass: live v1 verification made only bodyless GETs to the product origin plus one GitHub metadata GET; no APK bytes, console error, or page error appeared. |
| Offline | Pass: after one online visit, live `/demo` reloaded offline with its records and banner. |

The sample records are clearly labeled “Demo sample evidence” and “metadata
only.” Opening a sample explains that it is sample metadata and asks the user
to choose an APK for cryptographic verification.

## Declared claims

A no-local clone was created at `/tmp/apk-review5-clean-Pcfqmf/repo`, followed
by `npm ci`. Each exact command in `.factory/claims.json` was invoked
separately. Each selected one tagged test and exited zero.

| Claim ID | Result |
| --- | --- |
| hash-check | Pass |
| signature-verification | Pass |
| v1-verification | Pass |
| tamper-rejection | Pass |
| lineage-integrity | Pass |
| apk-identity | Pass |
| downgrade-risk | Pass |
| signer-drift | Pass |
| apk-structure | Pass |
| encrypted-export | Pass |
| password-not-stored | Pass |
| local-storage | Pass |
| android-backup-disabled | Pass |
| saved-copy-erasure | Pass |
| demo-sandbox | Pass |
| no-account-network | Pass |
| apk-never-uploaded | Pass |
| offline-reload | Pass |
| offline-verification | Pass |
| release-assets | Pass |
| paid-unlock | Pass |
| free-core-features | Pass |
| revoked-license | Pass |
| hosted-checkout | Pass |
| restore-import | Pass |
| saved-apk-download | Pass |

F-5-2 and F-5-3 are unlisted claims, not failures of the 26 declared tests.
The broader clean-clone gates also passed: `npm run lint`; `npm test` with 21
unit/config tests and 40 browser tests; and `npm run build`. The build produced
`dist/`; initial JavaScript is 45.62 kB raw / 15.72 kB gzip.

## Earlier-finding verification

All four prior reviews, all four polish reports, and the prior handoff were
read. Every numbered finding was checked against both live behavior and
current source.

| Earlier ID | Current independent confirmation |
| --- | --- |
| F-1-1 | Fixed: the live 404 has description, canonical, OG/Twitter metadata, icons, theme, and HTTP 404 status. |
| F-1-2 | Fixed: the live/source 404 has Demo, Locker, Privacy, Privacy/Terms, wordmark, and build footer. |
| F-1-3 | Fixed: live/source say “Local APK verification.” |
| F-1-4 | Fixed: live/source say “Your verified APK records.” |
| F-1-5 | Fixed: live/source say “Read the package and version.” |
| F-1-6 | Fixed: live/source say “Check signer and downgrade risks.” |
| F-1-7 | Fixed: every footer states that records and saved APK copies stay on this device. |
| F-1-8 | Fixed: generated-art provenance is absent from visitor copy and remains in design documentation. |
| F-1-9 | Fixed: release-test-key copy is absent from landing and README. |
| F-1-10 | Fixed: Google Play copy is absent live, in source, README, and tests. |
| F-1-11 | **Regressed/blocking:** the current release-workflow sentence is 23 words. |
| F-1-12 | Fixed: visitor copy uses “signing history,” not certificate-rotation jargon. |
| F-1-13 | Fixed: the password-encryption outcome precedes algorithm names. |
| F-2-1 | Fixed: the first demo record intersects both initial viewports. |
| F-2-2 | Fixed: merchant-of-record/refund assertions are absent; hosted checkout is declared and tested. |
| F-2-3 | Fixed: restore validation offers tested import, conflict handling, and saved-APK download. |
| F-2-4 | Fixed: the first action says “Open two sample APK records.” |
| F-2-5 | Fixed: the audience sentence names Android users, apps, versions, signing history, and the file fingerprint. |
| F-2-6 | Fixed: the result-naming action is “Restore Locker Plus license.” |
| F-2-7 | Fixed: landing states the device-local result; adapter detail is confined to developer copy. |
| F-2-8 | Fixed: README consistently uses “restore kit,” not “restoration record.” |
| F-2-9 | Fixed: README says “Use APK Provenance Locker.” |
| F-2-10 | Fixed: visitor copy consistently uses “signing history.” |
| F-2-11 | Fixed: upload-key and Google Play maintainer copy is absent. |
| F-3-1 | Fixed: live Start for real, Locker, and wordmark exits each erased edited demo records while preserving real data. Source routes all three through `leaveDemo()`. |
| F-3-2 | Fixed: visitor copy introduces “SHA-256 file fingerprint” and then uses “file fingerprint”; `SHA256SUMS` remains only as a filename. |
| F-4-1 | Fixed: `free-core-features` declares and tests verification, warnings, export, and decryption without a license. |
| F-4-2 | Fixed: README heading says “Develop and verify APK Provenance Locker.” |
| F-4-3 | Fixed: README heading says “Deploy APK Provenance Locker.” |
| F-4-4 | Fixed: README explains demo isolation without namespace jargon. |
| F-4-5 | Fixed: README names the repository-commit check and all three demo exits. |

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  the designed, product-styled HTTP 404.
- Every route has the required title pattern, `lang=en`, one H1, one main,
  description, canonical, OG/Twitter data, SVG favicon, and touch icon. The
  social image is 1200 × 630. `robots.txt`, `sitemap.xml`, and the web manifest
  return 200 with the expected content types.
- Direct deep links work. H1 focus works for the tested client transition, but
  F-5-1 fails new-route scrolling and Back restoration.
- All discovered internal links returned 200. The four GitHub release links,
  F-Droid, and KeePassDX reached 200. Checkout returned the declared 303 to a
  Dodo hosted session. No dead link was found.
- Live Playwright axe scans found zero violations on `/`, `/demo`, `/privacy`,
  `/terms`, and the designed 404 at 390 px. All had no horizontal overflow at
  200% text. Reduced-motion behavior and dialog/keyboard coverage passed in
  the clean suite.
- The paper-cut cabinet art, clipped paper shapes, moss/pulp/orange palette,
  Georgia display face, and paper-lift motion match `.factory/design.md`. The
  visual identity is product-specific rather than a generic SaaS template.

## Missed leverage

No AI feature is warranted. Cryptographic signature and lineage verification
must remain deterministic, local, and explainable. The product already has
the obvious brief-implied leverage: encrypted export, verified restore import,
saved-APK download, and optional device labels. Automatic sync would conflict
with the local-first privacy promise unless introduced as a separate opt-in
feature.

## What would make this perfect

Resolve F-5-1 and the blocking F-1-11 regression. Declare and test both
unlisted claims in F-5-2 and F-5-3, or remove their copy. Apply the concrete
plain-language rewrites in F-5-4 and F-5-5. Then rerun every claim command,
the complete suite/build, the live demo/privacy/offline checks, exact footer
navigation and Back restoration, and this full copy/history/structure audit.
PASS is appropriate only when the finding list is empty.
