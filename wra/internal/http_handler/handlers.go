package http_handler

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"
	"wra/internal/config"
	"wra/internal/pipeline/base"
	"wra/internal/pipeline/fromsrv"
	"wra/internal/pipeline/tosrv"

	"go.uber.org/zap"
)

var toSrvHandlers = [...]base.ToSrvHandler{
	&tosrv.RequestIDHandler{},
	&tosrv.SignCheckerHandler{},
}

var fromSrvHandlers = [...]base.FromSrvHandler{
	&fromsrv.BackendAuthHandler{},
}

func HandleProxy(w http.ResponseWriter, r *http.Request, log *zap.SugaredLogger) {
	startTime := time.Now()

	log.Info("Incoming request",
		zap.String("method", r.Method),
		zap.String("path", r.URL.Path),
		zap.String("remote_addr", r.RemoteAddr),
		zap.String("user_agent", r.UserAgent()),
		zap.String("request_id", r.Header.Get("X-Id")))

	var bodyBytes []byte
	if r.Body != nil {
		var err error
		bodyBytes, err = io.ReadAll(r.Body)
		if err != nil {
			log.Error("Failed to read request body", zap.Error(err))
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}
	}
	body := string(bodyBytes)

	log.Debug("Processing request body", zap.Int("body_length", len(body)))

	// Создаем новый запрос
	proxyURL := config.Configuration.Proxy.WraProxyTarget + "/" + r.RequestURI
	proxyReq, err := http.NewRequest(r.Method, proxyURL, bytes.NewBufferString(body))
	if err != nil {
		log.Error("Failed to create proxy request", zap.Error(err))
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Copy headers
	for k, v := range r.Header {
		proxyReq.Header[k] = v
	}

	// Process to-server handlers
	for _, h := range toSrvHandlers {
		result := h.HandleToSrv(r, body, log)

		for k, v := range result.Headers {
			proxyReq.Header.Set(k, v)
		}

		if result.BlockPacket {
			log.Warn("Request blocked by to-server handler",
				zap.String("block_message", result.BlockMessage),
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path))
			http.Error(w, result.BlockMessage, http.StatusForbidden)
			return
		}
	}

	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Error("Failed to make upstream request",
			zap.Error(err),
			zap.String("upstream_url", proxyURL))
		http.Error(w, fmt.Sprintf("Request error: %v", err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for k, v := range resp.Header {
		w.Header()[k] = v
	}

	// Process from-server handlers
	for _, h := range fromSrvHandlers {
		result := h.HandleFromSrv(r, resp, log)

		for k, v := range result.Headers {
			w.Header().Set(k, v)
		}

		if result.BlockPacket {
			log.Warn("Response blocked by from-server handler",
				zap.String("block_message", result.BlockMessage),
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path))
			http.Error(w, result.BlockMessage, http.StatusForbidden)
			return
		}
	}

	w.Header().Del("X-Wra-Data")
	w.Header().Set("Server", "wra")

	log.Info("Request completed",
		zap.String("method", r.Method),
		zap.String("path", r.URL.Path),
		zap.Int("status_code", resp.StatusCode),
		zap.Duration("duration", time.Since(startTime)),
		zap.String("remote_addr", r.RemoteAddr))

	w.WriteHeader(resp.StatusCode)
	_, err = io.Copy(w, resp.Body)
	if err != nil {
		log.Error("Failed to write response body", zap.Error(err))
	}
}
