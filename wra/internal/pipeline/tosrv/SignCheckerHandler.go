package tosrv

import (
	"net/http"
	"wra/internal/alert"
	"wra/internal/kvstorage"
	"wra/internal/logger"
	"wra/internal/pipeline/base"
	"wra/internal/sign"

	"go.uber.org/zap"
)

type SignCheckerHandler struct {
}

func (h *SignCheckerHandler) HandleToSrv(r *http.Request, body string, log *zap.SugaredLogger) base.PipelineResult {
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

			alert.SendAlert(alert.Alert{
				Severity:    "high",
				Title:       "Несуществующий X-Wra-Public",
				Description: "Запрос с невалидным или несуществующим идентификатором сессии X-Wra-Public. Возможная попытка несанкционированного доступа.",
				Source:      r.RemoteAddr,
				Destination: "wra-proxy-node",
				Rule:        "WRA-PUBLIC-INVALID-001",
				Category:    "Unauthorized Access",
				Action:      "Доступ запрещен",
				Status:      "new",
				Details: map[string]any{
					"method":    r.Method,
					"path":      r.URL.Path,
					"sessionId": clientUUIDVal[:8] + "...",
					"userAgent": r.UserAgent(),
				},
			}, log)
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

				alert.SendAlert(alert.Alert{
					Severity:    "critical",
					Title:       "Критическое несовпадение Fingerprint",
					Description: "Авторизационный токен (X-Wra-Public) предъявлен с устройства, чья подпись не соответствует исходной сессии. Вероятная кража Cookie.",
					Source:      r.RemoteAddr,
					Destination: "wra-proxy-node",
					Rule:        "WRA-FP-MISMATCH-002",
					Category:    "Session Hijacking",
					Action:      "Доступ запрещен",
					Status:      "new",
					Details: map[string]any{
						"method":    r.Method,
						"path":      r.URL.Path,
						"payload":   "SessionID: " + clientUUIDVal[:8] + "...",
						"userAgent": r.UserAgent(),
						"mismatch":  "Signature mismatch",
					},
				}, log)
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
