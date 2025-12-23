package tosrv

import (
	"net/http"
	"wra/internal/kvstorage"
	"wra/internal/pipeline/base"
)

type RequestIDHandler struct {
}

func (h *RequestIDHandler) HandleToSrv(r *http.Request, body string) base.PipelineResult {
	Xid, idExists := r.Header["X-Id"]

	if idExists {

		if kvstorage.ContainsRequestKey(Xid[0]) {
			return base.PipelineResult{BlockPacket: true, BlockMessage: "Suspect Id"}
		}

		kvstorage.StoreRequestId(Xid[0])
	}

	return base.PipelineResult{}
}
