package tosrv

import (
	"net/http"
	"wra/internal/kvstorage"
	"wra/internal/logger"
	"wra/internal/pipeline/base"

	"go.uber.org/zap"
)

type RequestIDHandler struct {
}

func (h *RequestIDHandler) HandleToSrv(r *http.Request, body string, log *zap.SugaredLogger) base.PipelineResult {
	Xid, idExists := r.Header["X-Id"]

	securityLogger := logger.GetSecurityLogger()

	if idExists {
		requestId := Xid[0]
		log.Debug("Checking request ID in storage", zap.String("request_id", requestId))

		if kvstorage.ContainsRequestKey(requestId, log) {
			securityLogger.Info("Duplicate request ID detected", zap.String("request_id", requestId))
			return base.PipelineResult{BlockPacket: true, BlockMessage: "Suspect Id"}
		}

		if err := kvstorage.StoreRequestId(requestId, log); err != nil {
			log.Error("Failed to store request ID", zap.Error(err), zap.String("request_id", requestId))
			return base.PipelineResult{BlockPacket: true, BlockMessage: "Internal error storing request ID"}
		}

		log.Debug("Request ID stored successfully", zap.String("request_id", requestId))
	} else {
		log.Debug("No request ID header found in request")
	}

	return base.PipelineResult{}
}
