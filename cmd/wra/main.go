package main

import (
	"fmt"
	"net/http"
	"wra/internal/config"
	"wra/internal/http_handler"
	"wra/internal/kvstorage"
)

func main() {
	kvstorage.InitializeRedis()

	fmt.Println("Proxy running on " + config.Configuration.Proxy.WraListenAddress + ":" + config.Configuration.Proxy.WraListenPort)

	http.HandleFunc("/", http_handler.HandleProxy)
	http.ListenAndServe(config.Configuration.Proxy.WraListenAddress+":"+config.Configuration.Proxy.WraListenPort, nil)
}
