package tosrv

import (
	"net/http"
	"wra/internal/kvstorage"
	"wra/internal/logger"
	"wra/internal/pipeline/base"
	"wra/internal/sign"

	"go.uber.org/zap"
)

type SignCheckerHandler struct {
}

func (h *SignCheckerHandler) HandleToSrv(r *http.Request, body string, log *zap.SugaredLogger) base.PipelineResult {
	// Копируем заголовки и при желании меняем их

	securityLogger := logger.GetSecurityLogger()

	clientUUID, clientUUIDExists := r.Header["X-Wra-Public"]
	clientSecret, clientSecretExists := r.Header["X-Wra-Attest"]

	timestamp, timestampExists := r.Header["X-Timestamp"]
	reqId, reqIdExists := r.Header["X-Id"]

	headers := map[string]string{}

	request_attestated := false
	attestated_data := ""

	log.Debug("Processing signature check",
		zap.Bool("has_client_uuid", clientUUIDExists),
		zap.Bool("has_client_secret", clientSecretExists),
		zap.Bool("has_timestamp", timestampExists),
		zap.Bool("has_req_id", reqIdExists))

	if clientUUIDExists && clientSecretExists && timestampExists && reqIdExists {
		clientUUIDVal := clientUUID[0]
		clientSecretVal := clientSecret[0]
		timestampVal := timestamp[0]
		reqIdVal := reqId[0]

		log.Debug("Attempting to load session for signature verification",
			zap.String("client_uuid", clientUUIDVal),
			zap.String("request_id", reqIdVal))

		sessionValue, exists := kvstorage.LoadSession(clientUUIDVal, log)

		if !exists {
			securityLogger.Info("Session not found for signature verification",
				zap.String("client_uuid", clientUUIDVal))
		} else {
			calculatedSignature := sign.SignCookie(body, sessionValue.Attestation, clientUUIDVal, timestampVal, reqIdVal)

			if calculatedSignature == clientSecretVal {
				request_attestated = true
				attestated_data = sessionValue.Data
				log.Info("Signature verification successful",
					zap.String("client_uuid", clientUUIDVal),
					zap.String("request_id", reqIdVal))
			} else {
				securityLogger.Warn("Signature verification failed",
					zap.String("client_uuid", clientUUIDVal),
					zap.String("request_id", reqIdVal))
			}
		}
	} else {
		log.Debug("Missing required headers for signature verification")
	}

	if request_attestated {
		headers["X-Attestation"] = "true"
		headers["X-Attestation-Data"] = attestated_data
		log.Debug("Setting attestation headers as verified")
	} else {
		headers["X-Attestation"] = "false"
		log.Debug("Setting attestation headers as unverified")
	}

	return base.PipelineResult{Headers: headers}
}
