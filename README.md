# APK Provenance Locker

APK Provenance Locker verifies APK signatures, package names, versions,
SHA-256 file fingerprints, and signing history before an Android reinstall.
It is for people who keep lawful APK files and want an encrypted restore kit.

The app verifies Android's v1, v2, and v3 signing formats on this device. It
checks signing history after an Android signing-key change and rejects files
whose signed contents changed. It reads the package name, version name, and
version code from each APK. Prior verified records reveal a new signing
certificate and lower-version downgrade risk.
Android still makes the final install decision.

## Use APK Provenance Locker

1. Open the app and choose **Verify an APK**.
2. Choose an APK you own and add its source URL.
3. Choose whether to keep an optional APK copy in local app storage.
4. Choose **Export restore kit** and set a password.
5. Later, choose **Validate a restore kit** to check saved copies.
6. Import verified records or download a verified saved APK from the report.

Try the isolated sample at `/?demo=1` or `/demo`. The demo keeps its records
and files separate from your real locker. Leaving, **Reset demo**, and **Start
for real** erase demo data. Removing a record first asks for confirmation.
Confirming it erases its optional saved copy.

## Develop and verify APK Provenance Locker

```sh
npm ci
npm run lint
npm test
npm run build
npx cap sync android
```

`npm test -- --grep @claim:<id>` runs each observable claim listed in
`.factory/claims.json`. The release-assets command also downloads and checks
the published APK, AAB, checksums, source record, tag, and release notes. The
production static site is written to `dist/`.
After a release is published, run `npm run test:release`. It downloads the
APK, AAB, checksums, and source record from GitHub. It checks that the tag,
release notes, source record, and both packages name the release's immutable
source commit.
It also checks that **Start for real**, **Locker**, and the wordmark erase demo
data.

## Deploy APK Provenance Locker

The factory deploys `dist/` with the configured static work order. Push the
final candidate to `origin/main` before tagging it. Run
`npm run test:candidate -- --expected-commit "$(git rev-parse HEAD)"` to prove
GitHub can obtain that exact commit and `main` retains it. Later QA documents
may advance `main`. Pushing the matching `v<version>` tag then runs the Android
workflow and publishes APK, AAB, checksums, and source record.

APK checks run in the browser. Developers can inspect the pinned `apksig-go`
v1.1.0 WebAssembly adapter in `tools/apksig-wasm`. Android fixtures and their
exact checksums are in `tests/fixtures`.

## Android downloads

- [Download APK](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.12/app-release.apk)
- [Download AAB](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.12/app-release.aab)
- [Download SHA256SUMS](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.12/SHA256SUMS)
- [Download source record](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.12/RELEASE_PROVENANCE.json)

These links use the fixed `v0.5.12` release. Compare each file fingerprint with
`SHA256SUMS`. Then use `RELEASE_PROVENANCE.json`, the source record, to confirm
which repository commit built the files.

## Optional Locker Plus

Locker Plus costs $12 once. It adds private device labels for organizing a
large locker. Verification, signer and downgrade warnings, and restore-kit
export stay free. Buy through Sociobot's hosted checkout, or use **Restore
Locker Plus license** to restore a purchase on another device. A refunded or
revoked license stops private device labels. Verification remains free.

## Privacy and license

Records and optional APK copies stay in browser or installed-app storage.
Android system backup and device transfer are disabled for installed-app data.
Recording, checking, and exporting send no APK data or record content over the
network. There are no analytics, advertising, or accounts. The page makes no
automatic third-party requests.
A saved Plus license is sent only to Sociobot for verification, at most once
each day.

Restore kits encrypt records in this browser with your password (PBKDF2-SHA256
and AES-GCM). The app does not store the export password. See `/privacy` and
`/terms`. The source is MIT licensed.
