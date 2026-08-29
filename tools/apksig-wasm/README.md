# Browser verifier adapter

This adapter builds the self-hosted verifier at
`public/vendor/apksig/apksig.wasm`. It pins Apache-2.0 `apksig-go` v1.1.0 and
exposes only APK verification plus verified v3/v3.1 certificate lineage.

Build with Go 1.23 or newer:

```sh
cd tools/apksig-wasm
go mod download
GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o ../../public/vendor/apksig/apksig.wasm .
cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../../public/vendor/apksig/wasm_exec.js
```

The committed binary is used directly by Vite and works offline. Its SHA-256
is recorded in `.factory/handoff.md`.
