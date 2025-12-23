package http_handler

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"wra/internal/config"
	"wra/internal/pipeline/base"
	"wra/internal/pipeline/fromsrv"
	"wra/internal/pipeline/tosrv"
)

var toSrvHandlers = [...]base.ToSrvHandler{
	&tosrv.RequestIDHandler{},
	&tosrv.SignCheckerHandler{},
}

var fromSrvHandlers = [...]base.FromSrvHandler{
	&fromsrv.BackendAuthHandler{},
}

func HandleProxy(w http.ResponseWriter, r *http.Request) {
	log.Printf(
		"%s %s %s",
		r.Method,
		r.URL.Path,
		r.RemoteAddr,
	)

	var bodyBytes []byte
	if r.Body != nil {
		bodyBytes, _ = io.ReadAll(r.Body)
	}
	body := string(bodyBytes)

	// Создаем новый запрос
	proxyReq, err := http.NewRequest(r.Method, config.Configuration.Proxy.WraProxyTarget+"/"+r.RequestURI, bytes.NewBufferString(body))
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	for _, h := range toSrvHandlers {
		result := h.HandleToSrv(r, body)

		for k, v := range result.Headers {
			proxyReq.Header.Set(k, v)
		}

		if result.BlockPacket {
			http.Error(w, result.BlockMessage, http.StatusForbidden)
			return
		}
	}

	for k, v := range r.Header {
		proxyReq.Header[k] = v
	}

	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("Request error: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	for k, v := range resp.Header {
		w.Header()[k] = v
	}

	for _, h := range fromSrvHandlers {
		result := h.HandleFromSrv(r, resp)

		for k, v := range result.Headers {
			w.Header().Set(k, v)
		}

		if result.BlockPacket {
			http.Error(w, result.BlockMessage, http.StatusForbidden)
			return
		}
	}

	w.Header().Del("X-Wra-Data")
	w.Header().Set("Server", "wra")

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
