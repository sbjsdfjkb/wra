package config

import (
	"log"

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
	Logging struct {
		Level  string `env:"WRA_LOG_LEVEL,default=info"`
		Format string `env:"WRA_LOG_FORMAT,default=console"`

		IsWriteSecurity2StdoutLog bool `env:"WRA_SECURITYLOG_STDOUT_ENABLED,default=true"`
		IsWriteCommon2StdoutLog   bool `env:"WRA_COMMONLOG_STDOUT_ENABLED,default=true"`
		IsWriteError2StdoutLog    bool `env:"WRA_ERRORLOG_STDOUT_ENABLED,default=true"`

		SecurityLogPath string `env:"WRA_SECURITYLOG_PATH"`
		CommonLogPath   string `env:"WRA_COMMONLOG_PATH"`
		ErrorLogPath    string `env:"WRA_ERRORLOG_PATH"`
	}
	Metrics struct {
		Enabled string `env:"WRA_METRICS_ENABLED,default=false"`
		Port    int    `env:"WRA_METRICS_PORT,default=8078"`
	}
}

var Configuration EnvConfig

func init() {

	_, err := env.UnmarshalFromEnviron(&Configuration)
	if err != nil {
		log.Fatal("Failed to load environment variables", zap.Error(err))
	}

}
