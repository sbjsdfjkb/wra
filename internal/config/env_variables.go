package config

import (
	"log"

	"github.com/Netflix/go-env"
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
	_, err := env.UnmarshalFromEnviron(&Configuration)
	if err != nil {
		log.Fatal(err)
	}
}
