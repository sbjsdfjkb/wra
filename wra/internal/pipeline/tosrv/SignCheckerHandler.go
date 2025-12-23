package tosrv

import (
	"net/http"
	"wra/internal/kvstorage"
	"wra/internal/pipeline/base"
	"wra/internal/sign"
)

type SignCheckerHandler struct {
}

func (h *SignCheckerHandler) HandleToSrv(r *http.Request, body string) base.PipelineResult {

	// Копируем заголовки и при желании меняем их

	clientUUID, clientUUIDExists := r.Header["X-Wra-Public"]
	clientSecret, clientSecretExists := r.Header["X-Wra-Attest"]

	timestamp, timestampExists := r.Header["X-Timestamp"]
	reqId, reqIdExists := r.Header["X-Id"]

	headers := map[string]string{}

	request_attestated := false
	attestated_data := ""

	if clientUUIDExists && clientSecretExists && timestampExists && reqIdExists {
		sessionValue, exists := kvstorage.LoadSession(clientUUID[0])

		if exists {

			aaaaaaa := sign.SignCookie(body, sessionValue.Attestation, clientUUID[0], timestamp[0], reqId[0])

			if aaaaaaa == clientSecret[0] {
				request_attestated = true
				attestated_data = sessionValue.Data
			}
		}

	}

	if request_attestated {
		headers["X-Attestation"] = "true"
		headers["X-Attestation-Data"] = attestated_data
	} else {
		headers["X-Attestation"] = "false"
	}

	return base.PipelineResult{Headers: headers}

}
