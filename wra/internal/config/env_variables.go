package config

import (
	"wra/internal/logger"

	"github.com/Netflix/go-env"
	"go.uber.org/zap"
)

type EnvConfig struct {
	KVStorage struct {
		Addr     string `env:"WRA_REDIS_ADDR,default=localhost:6379"`
		Db       int    `env:"WRA_REDIS_DB,default=0"`
		Password string `env:"WRA_REDIS_PASSWORD"`
	}
	Proxy struct {
		WraListenPort    string `env:"WRA_LISTEN_PORT,default=8079"`
		WraProxyTarget   string `env:"WRA_PROXY_TARGET,required=true"`
		WraListenAddress string `env:"WRA_LISTEN_ADDRESS,default=0.0.0.0"`
	}
}

var Configuration EnvConfig

func init() {
	log := logger.GetLogger()

	_, err := env.UnmarshalFromEnviron(&Configuration)
	if err != nil {
		log.Fatal("Failed to load environment variables", zap.Error(err))
	}

	log.Info("Configuration loaded successfully",
		zap.String("redis_addr", Configuration.KVStorage.Addr),
		zap.Int("redis_db", Configuration.KVStorage.Db),
		zap.String("listen_port", Configuration.Proxy.WraListenPort),
		zap.String("proxy_target", Configuration.Proxy.WraProxyTarget),
		zap.String("listen_address", Configuration.Proxy.WraListenAddress))
}
