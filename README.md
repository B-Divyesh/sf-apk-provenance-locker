# APK Provenance Locker

APK Provenance Locker verifies APK signatures, identity, SHA-256 file
fingerprints, and signing history before an Android reinstall. It is for
people who keep lawful APK files and want an encrypted restore kit.

The app verifies Android's v1, v2, and v3 signing formats on this device. It
checks signing history after an Android signing-key change and rejects files
whose signed contents changed. It reads the
package name, version name, and version code from compiled `AndroidManifest.xml`.
Prior verified records reveal a new signing certificate and lower-version
downgrade risk.
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
`.factory/claims.json`. The production static site is written to `dist/`.
After the tag workflow publishes a release, `npm run test:release` uses the
GitHub API to download its APK, AAB, checksums, and provenance record. It
confirms that the tag, release notes, provenance, and both packages name this
repository commit. It also checks that **Start for real**, **Locker**, and the
wordmark erase demo data.

## Deploy APK Provenance Locker

The factory deploys `dist/` with the configured static work order. Pushing a
matching `v<version>` tag runs the Android release workflow and publishes APK,
AAB, and checksum assets.

APK checks run in the browser. Developers can inspect the pinned `apksig-go`
v1.1.0 WebAssembly adapter in `tools/apksig-wasm`. Android fixtures and their
exact checksums are in `tests/fixtures`.

## Android downloads

- [Download APK](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.6/app-release.apk)
- [Download AAB](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.6/app-release.aab)
- [Download SHA256SUMS](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.6/SHA256SUMS)
- [Download release provenance](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.5.6/RELEASE_PROVENANCE.json)

These links use the immutable `v0.5.6` release. Compare each file fingerprint
with `SHA256SUMS`. Then confirm `RELEASE_PROVENANCE.json` names the tag and
source commit embedded in both Android packages.

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
network. There are no analytics, advertising, or accounts. The download
section sends one bodyless GET to `api.github.com` for public release metadata.
It falls back to versioned links when that request fails. A saved Plus license
is sent only to Sociobot for verification, at most once each day.

Restore kits encrypt records in this browser with your password (PBKDF2-SHA256
and AES-GCM). The app does not store the export password. See `/privacy` and
`/terms`. The source is MIT licensed.
