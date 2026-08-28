# APK Provenance Locker

APK Provenance Locker helps Android sideloaders keep a local record of APK
hashes, signing evidence, sources, and encrypted restoration kits. It is for
people who already hold lawful APKs and want to know exactly what they can
restore later.

It never distributes APKs, searches for apps, or bypasses Android controls.
Your records and optional saved APK copies remain in browser or app storage.

## Use it

1. Open the app and choose **Record an APK**.
2. Choose an APK you own, add its name, version, and source URL.
3. The app hashes it locally and reads v2/v3 signer evidence when present.
4. Choose **Export restore kit** and set a password to download an encrypted
   manifest with any APK copies you chose to save.
5. Later, use **Validate a restore kit** to check its saved copies against the
   recorded hashes.

Try the isolated sample at `/demo`. Demo storage uses the `demo:` namespace and
is discarded with **Reset demo** or **Start for real**.

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

## Privacy and license

There are no analytics or third-party runtime scripts. Encrypted kits use
PBKDF2-SHA256 and AES-GCM in the browser. The export password is never stored.
Read the in-app `/privacy` and `/terms` pages. The source is MIT licensed.

Locker Plus is a $12 one-time optional purchase through Sociobot. It does not
gate hashes, exports, or safety checks. The checkout link uses the product slug;
the factory registers the billing product before release.
