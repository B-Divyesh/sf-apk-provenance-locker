# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-29 UTC. Live URL:
https://apk-provenance-locker.sociobot.in. Source base:
`e7de00fe45c6079def7e19bc68dfc6c36e2a0663`.

## Verdict

**FAIL.** Twelve findings remain: two blocking, two medium, and eight minor.
All 23 declared claims passed their exact tests, but two live claim locations
contain unlisted claims. The demo also fails the required first post-click
screen.

## Cold first read

Fresh 390 × 844 and 1440 × 900 browser contexts opened `/` with empty
storage. Before scrolling, I could answer all three questions:

- What it does: it verifies an APK's signature, package/version, signing
  history, and hash before restoration.
- For whom: Android sideloaders preparing for a reinstall.
- What to click first: **Try it with sample data**.

The evidence is the exact first-screen copy: “Verify APKs before restoring,”
“For Android sideloaders who need verified package, version, signer, lineage,
and hash evidence before a reinstall,” and “Try it with sample data.” On the
390 px screen, the headline, audience sentence, sample action, adjacent
outcome, and all three facts ended by y=764 within the 844 px viewport. The
same elements were visible within the 900 px desktop viewport.

This gate passes. The jargon in the audience sentence remains a minor copy
finding below.

## Findings

### Blocking

#### F-2-1 — The demo's first screen does not show the sample product in use

**Location/evidence:** After one click on **Try it with sample data**, `/demo`
opens at the top of the repeated landing hero. At 390 × 844 the first sample
record starts at y=1467. At 1440 × 900 it starts at y=1150. It is outside both
first viewports. The visible mobile screen contains the demo banner, headline,
audience sentence, actions, and facts, but no F-Droid or KeePassDX record.

**Why:** The one-click path exists, but the required first screen after the
click does not already look like the product being used. A visitor must scroll
past the marketing hero to discover whether sample data loaded. This is a weak
demo and therefore blocking.

**Fix:** Give `/demo` a product-first layout. Keep the persistent demo banner,
then place “Your verified APK records” and both seeded records above the fold.
Remove or move the repeated hero below the records. Add a 390 × 844 assertion
that the first `.record` intersects the initial viewport without scrolling.

#### F-1-10 — The Google Play claim regressed after being marked fixed

**Location/quote:** Live landing: “This app is not on Google Play yet.” README:
“It is not on Google Play yet.” Source: `src/main.ts`, `README.md`, and tests
that now require this text.

**Why:** Review 1 identified this as an unlisted, non-actionable claim. Polish
1 says it was removed. It is now back in both reviewed locations and has no
entry in `.factory/claims.json`. The history rule makes the regression
blocking under the original ID.

**Fix:** Delete both sentences. Remove the positive assertions for this text
from `tests/static-config.test.ts` and `tests/browser/locker.spec.ts`; replace
them with an assertion that the unlisted phrase is absent.

### Medium

#### F-2-2 — The Terms page makes unlisted merchant and refund claims

**Location/quote:** `/terms`: “Sociobot/Dodo is the merchant of record.
Checkout shows purchase and refund terms.”

**Why:** `hosted-checkout` proves the $12 price, the Sociobot checkout URL,
and a redirect to a Dodo session. It does not establish the stated legal role
or inspect purchase/refund terms. A buyer could rely on both statements.

**Fix:** Replace them with the tested sentence “Locker Plus uses Sociobot's
hosted checkout.” Alternatively add a dedicated claim whose test follows the
checkout and verifies the named merchant and visible refund terms.

#### F-2-3 — A restore kit cannot restore records or release its saved APKs

**Location/evidence:** `validateKit()` decrypts and checks a restore kit.
`showResults()` then offers only **Close report**. There is no action to import
verified records into a fresh locker or download a verified saved APK copy.

**Why:** The brief says users record APK hashes and signers before they need
to restore them. The product offers optional saved APK copies, encrypts them
into a restore kit, and can validate them, but the person cannot retrieve or
restore those copies. This is the most obvious missing import/export step.
AI is not useful here; deterministic restore behavior is.

**Fix:** After validation, add **Import verified records** and a **Download
verified APK** action for each matching saved copy. Show conflicts before
overwriting records. Keep imports in the demo namespace during demo mode. Add
`restore-import` and `saved-apk-download` claims that export from one clean
namespace, import into another, and compare the restored bytes and evidence.

### Minor

#### F-2-4 — The sample-action explanation is vague

**Location/quote:** Landing hero: “See a ready-to-check locker.”

**Why:** “Locker” is the product metaphor, while “ready-to-check” does not say
what sample content appears.

**Fix:** “Open two sample APK records.”

#### F-2-5 — The first-screen audience sentence stacks unexplained jargon

**Location/quote:** “For Android sideloaders who need verified package,
version, signer, lineage, and hash evidence before a reinstall.”

**Why:** “Signer,” “lineage,” and “hash evidence” require prior signing-system
knowledge. The first screen should describe the situation in one read.

**Fix:** “For Android users keeping APK files, this checks each app, version,
signing history, and file fingerprint before a reinstall.”

#### F-2-6 — The license button does not name its result

**Location/quote:** Landing button and README reference: “Have a license?
Paste it”.

**Why:** It is phrased as a question plus an input instruction, not a verb that
names the result.

**Fix:** “Restore Locker Plus license”.

#### F-2-7 — The verifier sentence is implementation jargon

**Location/quote:** Landing: “The verifier runs locally with a pinned browser
build of the Android-compatible apksig verifier.” README: “Signature
verification uses the self-hosted Apache-2.0 apksig-go v1.1.0 WebAssembly
build.”

**Why:** “Pinned browser build,” “apksig-go,” and “WebAssembly” do not help a
visitor use the download. The implementation details belong in the developer
section, with the user outcome stated first.

**Fix:** Landing: “APK checks run on this device using Android's signature
rules.” README: “APK checks run in the browser. Developers can inspect the
pinned apksig-go v1.1.0 WebAssembly adapter in `tools/apksig-wasm`.”

#### F-2-8 — README invents “restoration record” beside “restore kit”

**Location/quote:** README: “It is for people who keep lawful APK files and
want an encrypted restoration record.” Elsewhere the encrypted export is a
“restore kit” and stored entries are “records.”

**Why:** The sentence makes one concept sound like two products.

**Fix:** “It is for people who keep lawful APK files and want an encrypted
restore kit.”

#### F-2-9 — The README heading “Use it” fails out of context

**Location/quote:** README heading: “Use it”.

**Why:** A heading list or screen-reader outline does not identify what “it”
means.

**Fix:** “Use APK Provenance Locker”.

#### F-2-10 — The copy uses several terms for the same signing-history concept

**Location/quotes:** Landing: “Verified signer lineage ... reveal signer
changes.” README: “signer history,” “v1/JAR, v2, and v3,” “certificate
history,” “signer drift,” and later “signers.”

**Why:** The copy switches between unexplained scheme labels and three names
for the certificate-history concept. The terminology table itself chooses
“signer lineage,” creating another variant.

**Fix:** Define one plain term once: “signing history.” For example: “The app
verifies Android's v1, v2, and v3 signing formats on this device. Earlier
verified records expose a new signing certificate or an older app version.”
Use “signing history” everywhere else.

#### F-2-11 — The README puts release-maintainer jargon in user download copy

**Location/quote:** “A store release needs the owner's upload key.”

**Why:** “Upload key” is unexplained and does not help someone download or
verify the current APK.

**Fix:** Move this note to maintainer release documentation. If it must remain,
write “Publishing on Google Play requires the owner's private signing setup.”

## Copy audit

Counts are whitespace-delimited; hyphenated terms and paths count as one word.
Markdown emphasis is ignored. Repeated labels are listed where they serve a
different control. No sentence exceeds 22 words and no banned marketing word
appears. The failures are jargon, inconsistent terms, a vague sentence, a
contextless heading, and a non-result-naming button.

### Landing page and demo banner

| Text | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| APK Provenance Locker | 3 | Pass |
| Demo | 1 | Pass |
| Locker | 1 | Pass |
| Privacy | 1 | Pass |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android sideloaders who need verified package, version, signer, lineage, and hash evidence before a reinstall. | 16 | F-2-5 |
| Try it with sample data | 5 | Pass |
| See a ready-to-check locker. | 4 | F-2-4 |
| Verify an APK | 3 | Pass |
| Verified on this device | 4 | Pass |
| Password-encrypted exports | 2 | Pass |
| No sign-in or account | 4 | Pass |
| A paper-cut archive cabinet holding APK evidence parcels and certificate slips. | 11 | Pass |
| Your APK files are never uploaded. | 6 | Pass |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Verify an APK | 3 | Pass |
| Export restore kit | 3 | Pass |
| No APK evidence yet | 4 | Pass |
| Verified APKs will appear here. | 5 | Pass |
| Choose a file to check its signature and identity. | 9 | Pass |
| Verify your first APK | 4 | Pass |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks v1, v2, and v3 signatures and hashes every byte on this device. | 15 | Pass |
| Read the package and version. | 5 | Pass |
| It extracts the package name and version code from the compiled Android manifest. | 13 | Pass |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signer lineage and version codes reveal signer changes and incompatible downgrade risk. | 13 | F-2-10 |
| Optional one-time purchase | 3 | Pass |
| Group APKs by device | 4 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for sorting a large locker. | 10 | Pass |
| Verification, warnings, and restore-kit export stay free. | 7 | Pass |
| The free locker is active. | 5 | Pass |
| Buy Locker Plus — $12 | 5 | Pass |
| Have a license? Paste it | 5 | F-2-6 |
| One-time purchase through Sociobot/Dodo. | 4 | Pass |
| Android download | 2 | Pass |
| The verifier runs locally with a pinned browser build of the Android-compatible apksig verifier. | 14 | F-2-7 |
| Android still makes the final install decision. | 7 | Pass |
| Download APK from GitHub | 4 | Pass |
| Download AAB from GitHub | 4 | Pass |
| Download SHA256SUMS from GitHub | 4 | Pass |
| Use the versioned SHA256SUMS file to check the APK's SHA-256. | 10 | Pass |
| This app is not on Google Play yet. | 8 | F-1-10 |
| Download the APK and its SHA256SUMS file. | 7 | Pass |
| Compare the APK's SHA-256 with the matching line in SHA256SUMS. | 10 | Pass |
| Allow installs from your browser or file manager when Android asks. | 11 | Pass |
| Open the APK. | 3 | Pass |
| Android shows the final install decision. | 6 | Pass |
| Records and saved APK copies stay on this device. | 9 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory · v0.5.1 | 6 | Pass |
| Demo — sample data, nothing is saved | 7 | Pass |
| Reset demo | 2 | Pass |
| Start for real | 3 | Pass |

### README

| Text | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker | 3 | Pass |
| APK Provenance Locker verifies APK signatures, identity, hashes, and signer history before an Android reinstall. | 15 | F-2-10 |
| It is for people who keep lawful APK files and want an encrypted restoration record. | 15 | F-2-8 |
| The app verifies v1/JAR, v2, and v3 signatures locally. | 9 | F-2-10 |
| It checks certificate history after an Android signing-key change and rejects files whose signed contents changed. | 16 | F-2-10 |
| It reads the package name, version name, and version code from compiled AndroidManifest.xml. | 13 | Pass |
| Prior verified records reveal signer drift and lower-version downgrade risk. | 10 | F-2-10 |
| Android still makes the final install decision. | 7 | Pass |
| Use it | 2 | F-2-9 |
| Open the app and choose Verify an APK. | 8 | Pass |
| Choose an APK you own and add its source URL. | 10 | Pass |
| Choose whether to keep an optional APK copy in local app storage. | 12 | Pass |
| Choose Export restore kit and set a password. | 8 | Pass |
| Later, choose Validate a restore kit to recheck saved copies against their hashes, signatures, package identity, and signers. | 18 | Pass |
| Try the isolated sample at /demo. | 6 | Pass |
| Demo metadata and files use separate demo: namespaces. | 8 | Pass |
| Reset demo and Start for real erase the demo data. | 10 | Pass |
| Removing a record first asks for confirmation. | 7 | Pass |
| Confirming it erases its optional saved copy. | 7 | Pass |
| Develop and verify | 3 | Pass |
| npm ci | 2 | Pass |
| npm run lint | 3 | Pass |
| npm test | 2 | Pass |
| npm run build | 3 | Pass |
| npx cap sync android | 4 | Pass |
| npm test -- --grep @claim:\<id\> runs each observable claim listed in .factory/claims.json. | 12 | Pass |
| The production static site is written to dist/. | 8 | Pass |
| Signature verification uses the self-hosted Apache-2.0 apksig-go v1.1.0 WebAssembly build. | 10 | F-2-7 |
| Its pinned adapter is in tools/apksig-wasm. | 6 | Pass |
| Android apksig fixtures and their exact checksums are in tests/fixtures. | 10 | Pass |
| Android downloads | 2 | Pass |
| Download APK | 2 | Pass |
| Download AAB | 2 | Pass |
| Download SHA256SUMS | 2 | Pass |
| These links use the current v0.5.1 release. | 7 | Pass |
| Check the APK against its line in the versioned SHA256SUMS file. | 11 | Pass |
| A store release needs the owner's upload key. | 8 | F-2-11 |
| It is not on Google Play yet. | 7 | F-1-10 |
| Optional Locker Plus | 3 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for organizing a large locker. | 10 | Pass |
| Verification, warnings, and restore-kit export remain free. | 7 | Pass |
| Buy through Sociobot/Dodo, or use Have a license? Paste it to restore a purchase on another device. | 17 | F-2-6 |
| A refunded or revoked license stops private device labels. | 9 | Pass |
| Verification remains free. | 3 | Pass |
| Privacy and license | 3 | Pass |
| Records and optional APK copies stay in browser or installed-app storage. | 11 | Pass |
| Android system backup and device transfer are disabled for installed-app data. | 11 | Pass |
| Recording, checking, and exporting send no APK data or record content over the network. | 14 | Pass |
| There are no analytics, advertising, or accounts. | 7 | Pass |
| The free locker makes no automatic third-party requests. | 8 | Pass |
| Download links contact GitHub only when selected. | 7 | Pass |
| A saved Plus license is sent only to Sociobot for verification, at most once each day. | 16 | Pass |
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 13 | Pass |
| The app does not store the export password. | 8 | Pass |
| See /privacy and /terms. | 4 | Pass |
| The source is MIT licensed. | 5 | Pass |

## Demo and sandbox behavior

| Check | Result |
| --- | --- |
| One-click entry from first screen | Pass: `/demo` opened in one click. |
| Realistic sample | Pass: F-Droid 1.21.0 and KeePassDX 4.1.7 records were seeded. |
| Sample visible on first post-click screen | **Fail: F-2-1.** First record begins below both initial viewports. |
| Persistent banner | Pass: “Demo — sample data, nothing is saved,” **Reset demo**, and **Start for real** were present. |
| Reset | Pass: removing F-Droid reduced the list to one; Reset restored both records. |
| Separate storage | Pass: demo used `demo:apk-locker:records` and `demo:apk-locker-files`. |
| Real data untouched | Pass: a sentinel in `apk-locker:records` and a sentinel object in `apk-locker-files` survived demo edits, Reset, and Start for real unchanged. |
| Leave-demo cleanup | Pass: Start for real removed the demo key/database and retained the real key/database. |
| Network privacy | Pass: cold landing, demo, reset, and real APK verification made same-origin GET requests only, with no request bodies or errors. |
| Offline | Pass: after the first visit, `/demo` reloaded offline and verified the v1 signed APK fixture offline. |

## Declared claims

Each exact command in `.factory/claims.json` ran independently in clean clone
`/tmp/apk-review2-q7dMr2`. Each command selected and passed one tagged
Playwright test.

| Claim ID | Exact command result |
| --- | --- |
| hash-check | Pass — 1 test |
| signature-verification | Pass — 1 test |
| v1-verification | Pass — 1 test |
| tamper-rejection | Pass — 1 test |
| lineage-integrity | Pass — 1 test |
| apk-identity | Pass — 1 test |
| downgrade-risk | Pass — 1 test |
| signer-drift | Pass — 1 test |
| apk-structure | Pass — 1 test |
| encrypted-export | Pass — 1 test |
| password-not-stored | Pass — 1 test |
| local-storage | Pass — 1 test |
| android-backup-disabled | Pass — 1 test |
| saved-copy-erasure | Pass — 1 test |
| demo-sandbox | Pass — 1 test |
| no-account-network | Pass — 1 test |
| apk-never-uploaded | Pass — 1 test |
| offline-reload | Pass — 1 test |
| offline-verification | Pass — 1 test |
| release-assets | Pass — 1 test |
| paid-unlock | Pass — 1 test |
| revoked-license | Pass — 1 test |
| hosted-checkout | Pass — 1 test |

No declared claim is untested. The live/README cross-check found the unlisted
Google Play claim in F-1-10 and the unlisted Terms claims in F-2-2. All other
claim-like copy maps to a declared test.

The broader clean-clone gates also passed: `npm test` ran 17 unit/config tests
and 34 browser tests; `npm run lint` passed; `npm run build` produced `dist/`.
The built JavaScript is 39,053 bytes raw and 13,785 bytes gzip. Live
`npm run test:live` passed desktop and mobile real-fixture flows with seven
same-origin GETs and no console errors in each.

## Earlier finding verification

Review 1, polish 1, and the existing handoff were read completely. Every
review-1 finding was checked in live output and source, not accepted from the
polish status alone.

| Earlier ID / handoff issue | Current verification |
| --- | --- |
| F-1-1: missing 404 metadata | Fixed. Live unknown route returns 404 with title, description, canonical `/404`, OG/Twitter data, favicon, and theme metadata; `public/404.html` contains them. |
| F-1-2: incomplete 404 skeleton | Fixed. Live/source header contains Demo, Locker, Privacy; footer contains Privacy and Terms. |
| F-1-3: “A local evidence locker” | Fixed. Live/source say “Local APK verification.” |
| F-1-4: “Your restoration set” | Fixed. Live/source say “Your verified APK records.” |
| F-1-5: “Read signed identity.” | Fixed. Live/source say “Read the package and version.” |
| F-1-6: “Check restore safety.” | Fixed. Live/source say “Check signer and downgrade risks.” |
| F-1-7: slogan footer | Fixed. Live/source say “Records and saved APK copies stay on this device.” |
| F-1-8: generated-art claim | Fixed. It is absent from live visitor copy and remains only in design provenance. |
| F-1-9: release-test-key claim | Fixed. It is absent from live landing and README. |
| F-1-10: Google Play claim | **Regressed and blocking.** See F-1-10 above. |
| F-1-11: 23-word workflow sentence | Fixed. The old sentence is absent; no current landing/README sentence exceeds 22 words. |
| F-1-12: certificate-rotation jargon | Fixed at the cited sentence. README now explains a signing-key change, although broader signing terminology still fails F-2-10. |
| F-1-13: encryption acronyms first | Fixed. README leads with the local password-encryption outcome and leaves algorithms in parentheses. |
| Repair-8 handoff: 200% evidence-dialog overflow | Fixed. Live at 390 px and 200% text measured 367 px client/scroll width, right edge 378.3 px, and 390 px page client/scroll width. The long source URL remained visible. |

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  the designed 404.
- Route titles are “APK Provenance Locker — Verify APK restore evidence,”
  “Demo — APK Provenance Locker,” “Privacy — APK Provenance Locker,” “Terms —
  APK Provenance Locker,” and “Page not found — APK Provenance Locker.”
- Every route has `lang=en`, one `<main>`, one H1, ordered headings, a skip
  link, description, canonical, OG/Twitter data, product image, favicon, and
  consistent header/footer legal navigation.
- Deep links reload correctly. Client navigation and browser back move focus
  to the new H1 at both widths.
- All internal routes, anchors, v0.5.1 APK/AAB/SHA256SUMS links, and the
  checkout link resolve. The assets return 200; checkout returns the expected
  303.
- Axe reports zero violations on all five checked routes at desktop and 390
  px. Live flows emitted no console or page errors.
- The paper-cut archive art, clipped paper shapes, moss/pulp/orange palette,
  Georgia display face, and sparse paper-lift motion match `.factory/design.md`
  and do not present as a generic SaaS template. Reduced-motion CSS is present.
- The social image is 1200 × 630. The 180 px touch icon is present. The first
  JavaScript load is well below the 150 KB gzip limit.

No structure or visual-identity finding remains.

## What would make this perfect

Fix F-2-1 and the F-1-10 regression first. Then make the two purchase claims
testable or remove them, add a real restore/import path for saved APKs, and
apply the eight exact copy rewrites. Rerun all 23 claim commands from a clean
clone plus the live first-screen, demo-isolation, offline, link, route-focus,
axe, and prior-finding checks. A PASS requires the finding list to be empty.
