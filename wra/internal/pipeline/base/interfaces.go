package base

import (
	"net/http"

	"go.uber.org/zap"
)

type FromSrvHandler interface {
	HandleFromSrv(req *http.Request, resp *http.Response, log *zap.SugaredLogger) PipelineResult
}

type ToSrvHandler interface {
	HandleToSrv(req *http.Request, body string, log *zap.SugaredLogger) PipelineResult
}

type PipelineResult struct {
	BlockPacket  bool
	BlockMessage string
	Headers      map[string]string
}
