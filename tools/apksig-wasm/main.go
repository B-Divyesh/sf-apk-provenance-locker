//go:build js && wasm

//go:debug x509negativeserial=1

// This small adapter exposes only verification from the pinned apksig-go
// dependency. It also surfaces verified certificate lineages, which the
// upstream demo adapter does not include in its JavaScript result.
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"syscall/js"

	"github.com/agusibrahim/apksig-go/pkg/apkverifier"
	"github.com/agusibrahim/apksig-go/pkg/datasource"
	"github.com/agusibrahim/apksig-go/pkg/verifier/v3"
)

func main() {
	js.Global().Set("apksigVerify", js.FuncOf(verify))
	js.Global().Set("apksigVersion", "apksig-go/v1.1.0+locker.1")
	select {}
}

func verify(_ js.Value, args []js.Value) interface{} {
	if len(args) != 1 || args[0].Type() != js.TypeObject {
		return map[string]interface{}{"verified": false, "error": "apksigVerify requires a Uint8Array"}
	}
	buf := make([]byte, args[0].Get("length").Int())
	js.CopyBytesToGo(buf, args[0])
	result, err := apkverifier.Verify(datasource.NewBytes(buf), 1, 35)
	if err != nil {
		return map[string]interface{}{"verified": false, "error": err.Error()}
	}
	return resultToJS(result)
}

func resultToJS(result *apkverifier.Result) map[string]interface{} {
	errors := append([]string(nil), result.Errors...)
	validLineage := true
	for _, scheme := range []*v3.Result{result.V3, result.V31} {
		if scheme == nil {
			continue
		}
		for _, signer := range scheme.Signers {
			if len(signer.LineageBytes) > 0 && signer.Lineage == nil {
				validLineage = false
				errors = append(errors, "v3 signing certificate lineage is invalid")
			}
		}
	}
	if result.HasV3Block && !result.V3Verified {
		errors = append(errors, "v3 signature or lineage is invalid")
	}
	if result.HasV31Block && !result.V31Verified {
		errors = append(errors, "v3.1 signature or lineage is invalid")
	}
	if result.HasV2Block && !result.V2Verified {
		errors = append(errors, "v2 signature is invalid")
	}
	// Never fall back to an older valid scheme when a newer block is present
	// but invalid. Android treats that as a broken/stripped modern signature.
	verified := result.Verified && validLineage &&
		(!result.HasV2Block || result.V2Verified) &&
		(!result.HasV3Block || result.V3Verified) &&
		(!result.HasV31Block || result.V31Verified)
	return map[string]interface{}{
		"verified":       verified,
		"v1Verified":     result.V1Verified,
		"v2Verified":     result.V2Verified,
		"v3Verified":     result.V3Verified,
		"v31Verified":    result.V31Verified,
		"hasV2Block":     result.HasV2Block,
		"hasV3Block":     result.HasV3Block,
		"hasV31Block":    result.HasV31Block,
		"detectedMinSdk": result.DetectedMinSdk,
		"errors":         stringsToJS(errors),
		"warnings":       stringsToJS(result.Warnings),
		"signers":        signersToJS(result),
	}
}

func signersToJS(result *apkverifier.Result) []interface{} {
	out := []interface{}{}
	if result.V31 != nil {
		out = append(out, v3SignersToJS("v3.1", result.V31)...)
	}
	if result.V3 != nil {
		out = append(out, v3SignersToJS("v3", result.V3)...)
	}
	if result.V2 != nil {
		for _, signer := range result.V2.Signers {
			certs := []interface{}{}
			for _, cert := range signer.Certs {
				certs = append(certs, certToJS(cert.Raw, cert.Subject.String()))
			}
			out = append(out, map[string]interface{}{"scheme": "v2", "verified": signer.Verified, "certs": certs})
		}
	}
	if result.V1 != nil {
		for _, signer := range result.V1.Signers {
			certs := []interface{}{}
			if signer.Cert != nil {
				certs = append(certs, certToJS(signer.Cert.Raw, signer.Cert.Subject.String()))
			}
			out = append(out, map[string]interface{}{"scheme": "v1", "verified": signer.Verified, "certs": certs})
		}
	}
	return out
}

func v3SignersToJS(name string, result *v3.Result) []interface{} {
	out := []interface{}{}
	for _, signer := range result.Signers {
		certs := []interface{}{}
		for _, cert := range signer.Certs {
			certs = append(certs, certToJS(cert.Raw, cert.Subject.String()))
		}
		lineage := []interface{}{}
		if signer.Lineage != nil {
			for _, node := range signer.Lineage.Nodes {
				lineage = append(lineage, map[string]interface{}{
					"certificateSha256": digest(node.Cert.Raw),
					"subject":           node.Cert.Subject.String(),
					"capabilities":      int(node.Flags),
				})
			}
		}
		out = append(out, map[string]interface{}{
			"scheme": name, "verified": signer.Verified, "certs": certs,
			"lineage": lineage, "lineagePresent": len(signer.LineageBytes) > 0,
			"minSdk": int(signer.MinSDK), "maxSdk": int(signer.MaxSDK),
		})
	}
	return out
}

func certToJS(raw []byte, subject string) map[string]interface{} {
	return map[string]interface{}{"certificateSha256": digest(raw), "subject": subject}
}

func digest(raw []byte) string { sum := sha256.Sum256(raw); return hex.EncodeToString(sum[:]) }
func stringsToJS(values []string) []interface{} {
	out := make([]interface{}, len(values))
	for i, v := range values {
		out[i] = v
	}
	return out
}
