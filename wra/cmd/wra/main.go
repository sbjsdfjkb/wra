package main

import (
	"fmt"
	"net/http"
	"os"
	"wra/internal/config"
	"wra/internal/http_handler"
	"wra/internal/kvstorage"
	"wra/internal/logger"

	"go.uber.org/zap"
)

func main() {
	// Initialize logger first
	log := logger.GetLogger()
	defer func() {
		// Sync logger before exiting
		if err := logger.Sync(); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to sync logger: %v\n", err)
		}
	}()

	log.Info("Starting WRA proxy server",
		zap.String("address", config.Configuration.Proxy.WraListenAddress),
		zap.String("port", config.Configuration.Proxy.WraListenPort),
		zap.String("target", config.Configuration.Proxy.WraProxyTarget))

	// Initialize Redis storage
	log.Info("Initializing Redis connection...")
	kvstorage.InitializeRedis(log)
	log.Info("Redis connection initialized successfully")

	log.Info("Proxy server starting...",
		zap.String("listen_address", config.Configuration.Proxy.WraListenAddress+":"+config.Configuration.Proxy.WraListenPort))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http_handler.HandleProxy(w, r, log)
	})

	if err := http.ListenAndServe(config.Configuration.Proxy.WraListenAddress+":"+config.Configuration.Proxy.WraListenPort, nil); err != nil {
		log.Fatal("Failed to start server", zap.Error(err))
	}
}
