package base

import "net/http"

type FromSrvHandler interface {
	HandleFromSrv(req *http.Request, resp *http.Response) PipelineResult
}

type ToSrvHandler interface {
	HandleToSrv(req *http.Request, body string) PipelineResult
}

type PipelineResult struct {
	BlockPacket  bool
	BlockMessage string
	Headers      map[string]string
}
