# APK signature fixtures

These tiny APKs come from the Apache-2.0 Android `apksig` test corpus mirrored
at `venshine/apksig`. They are checked in so signature, lineage, and manifest
regressions run without a network or Android SDK.

- `v1-only-rsa-2048.apk`: valid v1/JAR signature fixture.
- `v1v2v3-lineage.apk`: valid v1, v2, and v3 fixture with a verified
  three-certificate signing lineage.
- `v1v2v3-invalid-lineage.apk`: signed v1/v2/v3 fixture whose lineage
  attribute is malformed; the locker must reject it.

The exact upstream paths and SHA-256 values are recorded in `SHA256SUMS`.
