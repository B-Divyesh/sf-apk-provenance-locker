# Independent product verification — FAIL

**Candidate:** `cd2b886d5de512311eb87b9174e217a62935d3f0`  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Result:** **FAIL — do not release**

The deployed files match the candidate, so these are current product defects,
not a stale-deployment result. The required claim commands all fail, a normal
12 MB saved APK cannot be exported, arbitrary non-APK bytes are accepted as
valid evidence, and no downloadable Android artifact exists.

## Mandatory opening gates

### Claims: FAIL

`.factory/claims.json` exists and contains four claims. After `npm ci`, every
exact command from that file exited 1 before running a test because Vitest
4.1.11 does not support `--grep`:

| Claim | Exact command | Result |
| --- | --- | --- |
| `encrypted-export` | `npm test -- --grep @claim:encrypted-export` | FAIL: `CACError: Unknown option --grep` |
| `hash-check` | `npm test -- --grep @claim:hash-check` | FAIL: same error |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | FAIL: same error |
| `local-storage` | `npm test -- --grep @claim:local-storage` | FAIL: same error |

This is release-blocking under the claims contract. The underlying tests also
do not use `/demo` or a browser. They test crypto helpers, fixture shape, and
two hard-coded storage-key strings, so they do not establish the observable
claims even if selected with Vitest's `-t` option.

Unlisted, testable claims are present too: “No account required,” “The locker
reads v2/v3 signer evidence,” “The password is not saved,” the privacy page's
network and erase claims, and `.factory/demo.md`'s offline-shell claim. There
is no matching claim entry or browser sandbox test for them.

### Cold first read: PASS

At 1440×900 and 390×844, the first screen says:

- what: “Keep APK restore evidence”;
- for whom: “For Android sideloaders…”;
- first action: “Try it with sample data,” followed by “See a ready-to-check
  locker.”

The action opens `/demo` in one click with two populated records and a
persistent “Demo — sample data, nothing is saved” banner. This gate passes.

## Clean-checkout gates

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | `npm ci`, 188 packages installed |
| Unit tests | PASS | `npm test`: 1 file, 4 tests passed |
| Type check + production build | PASS | `npm run build`; `tsc --noEmit` and Vite succeeded |
| Lint | NOT AVAILABLE | No lint script or configuration exists |
| Dependency audit | FAIL | `npm audit --json`: 1 high and 1 critical vulnerability through `@capacitor/cli` → `tar@6.2.1` |
| Build output | PASS | `dist/` produced; JS 19,003 B (7.33 KB gzip), CSS 8,787 B (2.84 KB gzip) |

## End-to-end product results

### Critical defects

1. **A representative saved APK cannot be exported.** I selected the official
   12,426,276-byte F-Droid APK, whose shell SHA-256 was
   `985f5181d48bb6bafd54083a048b391271e0ab28385881cc41294fb01a222762`.
   The UI recorded the same hash and displayed v2 + v3 signer evidence. With
   “Save this APK copy” enabled, “Download encrypted kit” produced no download,
   raised the page error `Maximum call stack size exceeded`, and left the
   dialog open without an explanation. The failure is caused by converting the
   whole APK with a spread call in `b64`. A single normal APK fails, so the
   brief's 20-app restoration goal is not achievable.

2. **The tool does not verify APK provenance as contracted.** A file containing
   only `not an apk` was accepted, hashed, saved, and reported as “Recorded
   Broken package” with “signer not read.” The implementation reads certificate
   bytes from v2/v3 blocks but does not cryptographically verify the APK
   signature, does not support v1 verification, and does not parse v3 signer
   lineage. App name and version are user-entered rather than read from the APK.
   There is no downgrade compatibility check or downgrade warning.

3. **There is no Android release artifact.** The GitHub latest-release API
   returns 404, the repository has no tags, and the live “Download APK” link
   points directly to that JSON API response and returns 404. No APK/AAB could
   be downloaded, size-checked, unpacked, or installed. A Capacitor project and
   release workflow exist, with source app id
   `in.sociobot.apk_provenance_locker`, but the `android-apk` product itself has
   not shipped.

### High-severity defects

1. **Saved copies are neither isolated nor erased.** Demo and real modes share
   the same IndexedDB database and `files` object store. After adding a saved
   demo APK and choosing “Start for real,” demo metadata was gone but one demo
   file remained in the shared store. Separately, removing a 12,426,276-byte
   real APK record left one 12,426,276-byte value in IndexedDB. This contradicts
   both the demo-isolation contract and the privacy page's claim that Remove
   erases the local record.

2. **The seeded demo misstates backup availability.** F-Droid is shown as
   “copy saved,” but exporting the untouched demo reports “Exported 2 records
   and 0 saved APK copies.” Validating that kit reports `0 hashes match` and
   `missing copy` for both records. It does not demonstrate a restoration set.

3. **Paid unlock is not deliverable.** The checkout endpoint returns HTTP 404
   with `{"error":"enabled factory product","status":404}`. The page asks for
   $12 while saying the signer-change timeline is added “when it ships”; no paid
   feature is implemented. A previously stored token causes no verification
   request on reload and remains at “License saved — verifying when online.”

4. **License tokens are persisted in Cache Storage URLs.** After restoring
   `qa-sensitive-token-123`, Cache Storage contained
   `https://api.sociobot.in/.../verify?license=qa-sensitive-token-123`. The
   service worker caches every GET, including cross-origin license checks, and
   is cache-first. This both exposes the token to persistent browser storage
   and can preserve a stale verdict instead of observing revocation.

5. **The inventory cannot be independently inspected.** Record cards omit the
   recorded source and show only shortened hashes and signer fingerprints.
   There is no record-detail or compare-file action. This prevents the user
   from checking the full evidence without writing a separate decryptor.

### Input and recovery paths

- Required file/name fields correctly block an empty submit.
- An invalid source URL correctly blocks submit; replacing it with a valid URL
  recovers and saves the record.
- A wrong restore-kit password reports “That password did not open this restore
  kit”; entering the correct password then opens the validation report.
- An arbitrary 1-byte `.apk` is incorrectly accepted, as described above.
- The normal metadata-only demo export downloads an encrypted 1,278-byte
  `.locker` file and does not expose record names in plaintext.

## Deployment identity and links

The live response and fresh local build are byte-identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `8d0df902957a27c466988515fd8baea6b4f75b6e240ee6dc9b1e91c4bd522a6d` |
| `assets/index-DE-IQUj-.js` | `54226b0934698ad77ca9b1c8b7b9ab2b2442e3ccaadac8b9e86fcf1bd60e1aa2` |
| `assets/style-DmTLHgan.css` | `93d9b1c3bbe4f50f51e4081bd9e186fbb92f03f2a7444f4318144a8293f171d6` |

`/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path also returns
the home page with HTTP 200; the required designed 404 route does not exist.
The two product-critical external links are broken: checkout and latest release
both return 404.

## Accessibility, responsive behavior, and browser quality

### Passes

- Axe 4.13 found zero violations (and therefore zero serious/critical issues)
  on `/`, `/demo`, `/privacy`, `/terms`, the add dialog, and the fallback page.
- Each tested route has `lang=en`, a descriptive title, one `h1`, and one main
  landmark. The skip link works and its focus ring is a visible 3 px outline.
- The native dialog focuses the file field and returns focus to its trigger on
  Escape. Required inputs have labels and async errors use live regions.
- At 390 px there is no ordinary horizontal overflow. Reduced-motion emulation
  leaves no non-zero animation or transition durations. Cold load and mobile
  checks had no console or page errors.

### Defects

- Client-side route changes try to focus an unfocusable `h1`; after navigating
  to Privacy, `document.activeElement` is `BODY`, not the new heading.
- At 200% text size on a 390 px viewport, document width grows to 509 px and the
  header navigation is clipped/off-screen.
- Navigation/footer links and demo-banner actions are below the 44×44 px touch
  target baseline (observed heights 20–32 px).
- The representative saved-APK export produces a console/page error, so the
  no-console-errors quality gate fails during the main workflow.

## PWA, privacy, network, and response policies

- PASS: manifest parses without browser errors; 192/512 maskable icons,
  standalone display, service-worker registration, and controller are present.
- PASS: a normal live `/demo` reload after first visit works offline with both
  sample records. Demo/export flow made only same-origin requests. There are no
  third-party scripts, fonts, analytics, or advertising requests.
- FAIL: the service worker does not precache the hashed JS/CSS shell, has no
  update-available UI, uses cache-first behavior for API calls, and does not
  delete old cache versions. A local production preview failed offline reload
  when the browser HTTP cache was disabled, despite the service worker being in
  control.
- PASS: live HTML has HSTS, CSP, `nosniff`, and strict-origin referrer policy.
- FAIL: hashed assets are served with only `max-age=30, must-revalidate`, not
  long-lived immutable caching. `manifest.webmanifest` is served as
  `application/octet-stream`. There is no frame protection (`frame-ancestors`
  or `X-Frame-Options`) or Permissions Policy.
- PASS: the Sociobot verify endpoint is rate-limited. In a 100-request burst,
  30 returned 200 and 70 returned 429; 429 responses included `Retry-After: 4`.
  The observed effective threshold was 30 successful requests per burst.
- Sign-in is not used, so the Entra authority requirement is not applicable.

## Performance

Lighthouse 12.8.2 mobile against the local production `/demo` build scored:

- Performance 90, Accessibility 100, Best Practices 100, SEO 100
- FCP 1.0 s, LCP 1.8 s, CLS 0, TBT 390 ms, max potential FID 360 ms

Static budgets pass: initial JS 19,003 B, CSS 8,787 B, hero WebP 75,842 B, no
web fonts. Lighthouse flagged render-blocking resources, improperly sized image
delivery, forced reflow, and the 390 ms blocking time. Lab Lighthouse does not
provide an INP result, so the `<200 ms` INP target was not independently proven.

## Required disposition

Do not release this commit. At minimum, make every claim command runnable and
browser-observable; reject/verify APK structure and signatures; implement v1,
v2/v3 lineage and downgrade safety; stream or chunk large backup encoding;
separate and delete demo/real blobs; ship and link a verifiable APK; remove or
implement the paid offer; and stop caching license URLs. Re-run all acceptance
checks from a clean clone after those changes.
