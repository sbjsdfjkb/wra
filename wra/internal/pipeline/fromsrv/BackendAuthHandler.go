package fromsrv

import (
	"net/http"
	"strconv"
	"wra/internal/kvstorage"
	"wra/internal/pipeline/base"
	"wra/internal/structs"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type BackendAuthHandler struct {
}

func (h *BackendAuthHandler) HandleFromSrv(req *http.Request, resp *http.Response, log *zap.SugaredLogger) base.PipelineResult {
	wraContent, serverCreateData := resp.Header["X-Wra-Data"]
	clientFingerPrint, clientFingerPrintExists := req.Header["X-Wra-Fp"]

	sessionUuid := uuid.New()
	attestUuid := uuid.New()
	headers := map[string]string{}

	headers["X-Wra-Debug"] = strconv.FormatBool(serverCreateData)

	log.Debug("Processing backend authentication response",
		zap.Bool("server_create_data", serverCreateData),
		zap.Bool("client_fingerprint_exists", clientFingerPrintExists))

	if serverCreateData && clientFingerPrintExists {
		clientFp := clientFingerPrint[0]
		sessionId := sessionUuid.String()
		attestId := attestUuid.String()

		log.Info("Creating new session for client",
			zap.String("session_id", sessionId),
			zap.String("attest_id", attestId),
			zap.String("client_fingerprint", clientFp))

		headers["X-Wra-Public"] = sessionId
		headers["X-Wra-Private"] = attestId

		session := structs.WraSession{
			Fingerprints: clientFp,
			Data:         wraContent[0],
			Attestation:  attestId,
		}

		if err := kvstorage.StoreSession(sessionId, session, log); err != nil {
			log.Error("Failed to store session in kvstorage",
				zap.Error(err),
				zap.String("session_id", sessionId))
			// Return a result that indicates the packet should be blocked due to the error
			return base.PipelineResult{
				BlockPacket:  true,
				BlockMessage: "Failed to create session",
			}
		} else {
			log.Info("Session stored successfully",
				zap.String("session_id", sessionId))
		}
	} else {
		log.Debug("Skipping session creation - conditions not met",
			zap.Bool("server_create_data", serverCreateData),
			zap.Bool("client_fingerprint_exists", clientFingerPrintExists))
	}

	return base.PipelineResult{Headers: headers}
}
