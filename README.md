# APK Provenance Locker

APK Provenance Locker helps Android sideloaders keep a local record of APK
hashes, readable certificate evidence, sources, and encrypted restoration kits. It is for
people who already hold lawful APKs and want to know exactly what they can
restore later.

It never distributes APKs, searches for apps, or bypasses Android controls.
Your records and optional saved APK copies remain in browser or app storage.

## Use it

1. Open the app and choose **Record an APK**.
2. Choose an APK you own, add its name, version, and source URL.
3. The app checks that it is a ZIP-based APK with `AndroidManifest.xml`, hashes
   it locally, and records readable v2/v3 certificate evidence when present.
   Android remains the authority for installation-signature verification.
4. Choose **Export restore kit** and set a password to download an encrypted
   manifest with any APK copies you chose to save.
5. Later, use **Validate a restore kit** to check its saved copies against the
   recorded hashes.

Try the isolated sample at `/demo`. Demo metadata and optional APK files use
separate `demo:` storage namespaces and are discarded with **Reset demo** or
**Start for real**. Removing a real record also removes its optional saved copy.

## Develop and verify

```sh
npm install
npm run dev
npm test
npm run build # writes ./dist
```

The static deploy root is `dist/`. The Capacitor project is in `android/`.
GitHub Actions builds the signed-with-an-ephemeral-debug-key APK and AAB after a
version tag. A store release needs an owner-controlled upload key.

## Privacy and Android release

There are no analytics or third-party runtime scripts. Encrypted kits use
PBKDF2-SHA256 and AES-GCM in the browser. The export password is never stored.
Read the in-app `/privacy` and `/terms` pages. The source is MIT licensed.
The landing page reads the public GitHub release listing to show the Android
download when a release is published. Each release includes an APK, AAB, and
`SHA256SUMS`; it is not distributed through Google Play.
