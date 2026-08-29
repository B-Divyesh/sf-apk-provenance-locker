# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-29 UTC. Live URL: https://apk-provenance-locker.sociobot.in

## Verdict

**FAIL.** Thirteen findings remain. All 19 declared claims were tested; none is untested.

## Cold first read

Fresh 390 × 844 and 1440 × 900 contexts, with no prior storage, answered all three required questions before scrolling.

- It verifies APK signature, package/version, signer history, and hash evidence before restoration.
- It is for Android sideloaders preparing for a reinstall.
- Click **Try it with sample data** first; it says it opens a ready-to-check locker.

The mobile screen is readable and uses the documented paper-cut identity rather than a generic SaaS template.

## Findings

### Medium

#### F-1-1 — The live 404 omits required route metadata

**Location/evidence:** https://apk-provenance-locker.sociobot.in/not-a-real-route returns HTTP 404 with the title “Page not found — APK Provenance Locker”, but has no meta description, canonical URL, Open Graph/Twitter metadata, or favicon.

**Why:** A 404 is still a real shareable route. The site-structure contract requires this metadata and product icon on every route.

**Fix:** Add the favicon, theme color, description, canonical https://apk-provenance-locker.sociobot.in/404, and suitable Open Graph/Twitter metadata to public/404.html. Retain noindex if desired. Add a browser assertion for the static 404 response.

#### F-1-2 — The live 404 omits the shared header/footer navigation

**Location/quote:** Its header has only “◆ APK Provenance Locker”; its footer has only “Built by Param Factory · v0.3.0”. It omits the Demo/Locker/Privacy header links and Privacy/Terms footer links.

**Why:** A visitor following an old or mistyped URL loses the normal product navigation and legal links. The standalone 404 is not repaired by the SPA layout.

**Fix:** Use the same header/footer link set as normal routes in public/404.html, while keeping “Go to the locker” as the recovery action. Add a route-skeleton test.

### Minor — landing copy

#### F-1-3 — “A local evidence locker” is an unexplained metaphor heading

**Location/quote:** Landing eyebrow: “A local evidence locker”.

**Why:** “Locker” does not say what is stored or what action happens when heard out of context. It supplies mood rather than a usable section name.

**Fix:** “Local APK verification”.

#### F-1-4 — “Your restoration set” is vague and inconsistent with “restore kit”

**Location/quote:** Landing section eyebrow: “Your restoration set”. The terminology table defines *restore kit* and *evidence*, not “restoration set”.

**Why:** It can be confused with the password-encrypted restore kit; a visitor cannot tell whether this means exports, files, or records.

**Fix:** “Your verified APK records”.

#### F-1-5 — “Read signed identity.” does not name the information

**Location/quote:** Landing verification step 2: “Read signed identity.”

**Why:** “Signed identity” is jargon and does not make sense as a standalone heading in a screen-reader scan.

**Fix:** “Read the package and version”.

#### F-1-6 — “Check restore safety.” hides the useful result

**Location/quote:** Landing verification step 3: “Check restore safety.”

**Why:** It uses an abstract safety phrase instead of naming signer-change and downgrade warnings.

**Fix:** “Check signer and downgrade risks”.

#### F-1-7 — The footer is an uninformative slogan

**Location/quote:** “APK evidence stays in your hands.”

**Why:** It is not a concrete privacy explanation and could appear unchanged on unrelated products.

**Fix:** “Records and saved APK copies stay on this device.” This wording is covered by the existing local-storage claim.

### Minor — unlisted claims and README copy

#### F-1-8 — Artwork provenance is an unlisted claim

**Location/quote:** Landing caption: “Original generated paper-cut art.”

**Why:** This visitor-facing provenance claim has no entry in .factory/claims.json and does not help a person decide what the tool does.

**Fix:** Delete it from the live caption; retain asset provenance in .factory/design.md.

#### F-1-9 — The release-key statement is an unlisted security claim

**Location/quote:** Landing note and README: “This build uses a release-specific test key for direct sideloading.” / “The release-specific test key supports direct sideloading.”

**Why:** A downloader could rely on this statement, but claims.json has no test that verifies the published APK certificate/key intent.

**Fix:** Remove it, or add a release-signing-key claim that downloads the pinned release, verifies a documented certificate fingerprint, and confirms the intended sideload test key.

#### F-1-10 — “It is not on Google Play” is an unlisted, non-actionable claim

**Location/quote:** Landing and README: “It is not on Google Play.” / “The app is not on Google Play.”

**Why:** It has no claim entry and does not help complete the distribution/verification task.

**Fix:** Delete it. The direct download links and installation steps already explain the distribution path.

#### F-1-11 — The README release-workflow sentence exceeds the 22-word cap

**Location/quote:** README Android downloads: “The release workflow syncs the Capacitor 6 project, builds both packages, checks their size, package id, manifest, and APK signature, then publishes checksums.” (23 words.)

**Why:** It exceeds the hard cap and packs too many developer facts into one sentence.

**Fix:** “The release workflow builds the APK and AAB. It checks their size, package ID, manifest, signature, and checksums.”

#### F-1-12 — The README uses unexplained certificate-rotation jargon

**Location/quote:** “It validates v3 certificate-rotation lineage and rejects changed signed content.”

**Why:** “certificate-rotation lineage” is accurate but not first-read language for the stated sideloader audience.

**Fix:** “It checks the certificate history after an Android signing-key change and rejects files whose signed contents changed.” Put “v3” in a parenthetical if necessary.

#### F-1-13 — The README leads with encryption acronyms, not the user outcome

**Location/quote:** “Restore kits use PBKDF2-SHA256 and AES-GCM in the browser.”

**Why:** The acronyms do not tell a first-time reader what happens to their data.

**Fix:** “Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM).”

## Copy audit

Counts use whitespace-delimited words; hyphenated terms, URLs, and filenames count as one word. This lists every static visitor-facing landing sentence/label and every README sentence. Dynamic sample package values and dialog text opened after an action are excluded.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| A local evidence locker | 4 | F-1-3 |
| Verify APKs before restoring | 4 | Pass |
| For Android sideloaders who need verified package, version, signer, lineage, and hash evidence before a reinstall. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| See a ready-to-check locker. | 5 | Pass |
| Verify an APK | 3 | Pass — result-naming verb |
| Verified on this device | 4 | Pass — signature/hash claims |
| Password-encrypted exports | 2 | Pass — encrypted-export |
| No sign-in or account | 4 | Pass — no-account-network |
| Original generated paper-cut art. | 4 | F-1-8 |
| Your APK files are never uploaded. | 6 | Pass — apk-never-uploaded |
| Your restoration set | 3 | F-1-4 |
| Keep verified APK evidence | 4 | Pass |
| Export restore kit | 3 | Pass — result-naming verb |
| No APK evidence yet | 4 | Pass |
| Verified APKs will appear here. | 5 | Pass |
| Choose a file to check its signature and identity. | 9 | Pass |
| Verify your first APK | 4 | Pass — result-naming verb |
| View full evidence | 3 | Pass — result-naming verb |
| Recheck hashes, signatures, package identity, and signer lineage from saved APK copies. | 11 | Pass |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks v1, v2, and v3 signatures and hashes every byte on this device. | 15 | Pass — hash-check/signature-verification |
| Read signed identity. | 3 | F-1-5 |
| It extracts the package name and version code from the compiled Android manifest. | 13 | Pass — apk-identity |
| Check restore safety. | 3 | F-1-6 |
| Verified signer lineage and version codes reveal signer changes and incompatible downgrade risk. | 13 | Pass — signer-drift/downgrade-risk |
| Android download | 2 | Pass |
| The verifier runs locally with a pinned browser build of the Android-compatible apksig verifier. | 15 | Pass — offline-verification/apk-never-uploaded |
| Android still makes the final install decision. | 7 | Pass — limitation |
| Download APK from GitHub | 4 | Pass — descriptive external link |
| Download AAB from GitHub | 4 | Pass — descriptive external link |
| Download SHA256SUMS from GitHub | 3 | Pass — descriptive external link |
| Download the APK and compare its SHA-256 with SHA256SUMS. | 9 | Pass |
| Allow installs from your browser or file manager when Android asks. | 11 | Pass |
| Open the APK. | 3 | Pass |
| Android shows the final install decision. | 6 | Pass |
| This build uses a release-specific test key for direct sideloading. | 10 | F-1-9 |
| It is not on Google Play. | 6 | F-1-10 |
| APK evidence stays in your hands. | 6 | F-1-7 |
| Privacy / Terms / Built by Param Factory · v0.3.0 | 7 | Pass — navigation/build label |

All visible buttons use result-naming verbs or explicit accessible names; no button-label finding was observed.

### README

| Text | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker verifies APK signatures, identity, hashes, and signer history before an Android reinstall. | 15 | Pass |
| It is for people who keep lawful APK files and want an encrypted restoration record. | 15 | Pass |
| The app verifies v1/JAR, v2, and v3 signatures locally. | 10 | Pass |
| It validates v3 certificate-rotation lineage and rejects changed signed content. | 10 | F-1-12 |
| It reads the package name, version name, and version code from compiled AndroidManifest.xml. | 13 | Pass |
| Prior verified records reveal signer drift and lower-version downgrade risk. | 9 | Pass |
| Android still makes the final install decision. | 7 | Pass |
| Open the app and choose Verify an APK. | 8 | Pass |
| Choose an APK you own and add its source URL. | 10 | Pass |
| Choose whether to keep an optional APK copy in local app storage. | 12 | Pass |
| Choose Export restore kit and set a password. | 8 | Pass |
| Later, choose Validate a restore kit to recheck saved copies against their hashes, signatures, package identity, and signers. | 18 | Pass |
| Try the isolated sample at /demo. | 5 | Pass |
| Demo metadata and files use separate demo: namespaces. | 7 | Pass — demo-sandbox |
| Reset demo and Start for real erase the demo data. | 10 | Pass — demo-sandbox |
| Removing a real record erases its optional saved copy. | 9 | Pass — saved-copy-erasure |
| npm test -- --grep @claim:<id> runs each observable claim listed in .factory/claims.json. | 8 | Pass |
| The production static site is written to dist/. | 8 | Pass |
| Signature verification uses the self-hosted Apache-2.0 apksig-go v1.1.0 WebAssembly build. | 10 | Pass — developer detail |
| Its pinned adapter is in tools/apksig-wasm. | 6 | Pass |
| Android apksig fixtures and their exact checksums are in tests/fixtures. | 9 | Pass |
| The release workflow syncs the Capacitor 6 project, builds both packages, checks their size, package id, manifest, and APK signature, then publishes checksums. | 23 | F-1-11 |
| The release-specific test key supports direct sideloading. | 7 | F-1-9 |
| A store release needs the owner's upload key. | 8 | Pass — maintenance note |
| The app is not on Google Play. | 6 | F-1-10 |
| Records and optional APK copies stay in browser or installed-app storage. | 10 | Pass — local-storage |
| Recording, checking, and exporting send no APK data or record content over the network. | 13 | Pass — apk-never-uploaded |
| There are no analytics, advertising, account, or automatic third-party requests. | 10 | Pass — no-account-network |
| Download links contact GitHub only when selected. | 7 | Pass — release-assets |
| Restore kits use PBKDF2-SHA256 and AES-GCM in the browser. | 8 | F-1-13 |
| The app does not store the export password. | 8 | Pass — password-not-stored |
| See /privacy and /terms. | 4 | Pass |
| The source is MIT licensed. | 5 | Pass |

Terminology is otherwise consistent: APK, evidence, restore kit, saved copy, signer lineage, and downgrade risk. F-1-4 is the only coined-term collision.

## Demo, claims, privacy, and behavior

The demo gate passes. One click opens /demo with realistic F-Droid and KeePassDX records, the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real. The initial screen visibly shows the locker in use.

Live exercise selected genuine v1-only-rsa-2048.apk in /demo. It showed “Signature verified · v1”; every request was a bodyless same-origin GET; no console/page error occurred. Start for real removed demo:apk-locker:records and demo:apk-locker-files, then opened the empty real locker.

Every exact command in .factory/claims.json passed from this clean working copy: hash-check, signature-verification, v1-verification, tamper-rejection, lineage-integrity, apk-identity, downgrade-risk, signer-drift, apk-structure, encrypted-export, password-not-stored, local-storage, saved-copy-erasure, demo-sandbox, no-account-network, apk-never-uploaded, offline-reload, offline-verification, and release-assets. A prior overlapping harness run caused a local port collision; the affected local-storage and no-account-network commands were rerun alone and passed.

npm test passed (12 unit/config tests and 24 browser tests). npm run lint and npm run build passed; build produced dist/.

## Structure, links, and missed leverage

- /, /demo, /privacy, and /terms return 200; unknown routes return the designed HTTP 404. Direct v0.3.0 APK, AAB, and SHA256SUMS links reach release assets.
- SPA routes have one h1, per-route title/description/canonical/OG/favicon, working deep links/back focus, skip link, Privacy/Terms, and no dead internal links. F-1-1/F-1-2 are the static-404 exceptions.
- Same-origin-only request logs, declared privacy/offline claims, and the local service-worker verifier were confirmed. No analytics, account control, third-party request, APK upload, console error, or page error was observed.
- The documented paper-cut palette, typography, art, and clipped-paper shape language are visibly distinct and match .factory/design.md.
- No AI feature is missing. Deterministic, offline APK provenance verification is the brief’s central job; an AI step would be decorative and less trustworthy.

## Earlier-review regression check

No earlier review-*.md or polish-*.md exists. Every finding in verification.md, verification-2.md, verification-3.md, verification-4.md, verification-5.md, and the prior handoff was checked against current code and live behavior.

| Earlier finding | Current confirmation |
| --- | --- |
| Broken/weak claim commands and unlisted upload claim | All 19 browser-observable claim commands pass; apk-never-uploaded is declared and tested. |
| No release artifacts or failing GitHub API request | Direct v0.3.0 APK/AAB/SHA256SUMS assets resolve; no GitHub API load or console error. |
| Missing v1/v2/v3 verification, lineage, manifest identity, downgrade, signer drift | Local apksig WebAssembly and every corresponding fixture claim pass; live v1 verification passed. |
| Large export failure, malformed APK acceptance, restore validation weakness | Export, archive rejection, tamper, lineage, and validation tests pass. |
| Demo/real sharing or saved-copy erasure failure | Separate demo namespace and live leaving-demo cleanup were confirmed. |
| Demo claimed unavailable saved copies | Current samples say “metadata only”. |
| Unavailable paid checkout or cached license token | No paid checkout/license runtime remains. |
| Missing full evidence details | Current View full evidence dialog shows source, hash, identity, signer, schemes, and lineage. |
| 404 status, manifest MIME, keyboard/focus/overflow/touch, SW/cache/header faults | Current source tests/live checks confirm these repairs. F-1-1/F-1-2 are remaining new 404 metadata/skeleton defects. |

## What would make this perfect

Repair F-1-1 through F-1-13, add the proposed static-404 and release-signing-key regression tests, and rerun this complete cold-read, copy, claim, demo, privacy, history, and route checklist from a clean checkout. Pass is appropriate only when the finding list is empty.

