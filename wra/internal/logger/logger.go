package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var SugaredLogger *zap.SugaredLogger
var SecuritySugaredLogger *zap.SugaredLogger

func init() {
	logLevel := zapcore.InfoLevel
	if levelStr := os.Getenv("LOG_LEVEL"); levelStr != "" {
		switch levelStr {
		case "debug":
			logLevel = zapcore.DebugLevel
		case "info":
			logLevel = zapcore.InfoLevel
		case "warn":
			logLevel = zapcore.WarnLevel
		case "error":
			logLevel = zapcore.ErrorLevel
		case "fatal":
			logLevel = zapcore.FatalLevel
		}
	}

	config := zap.Config{
		Level:            zap.NewAtomicLevelAt(logLevel),
		Development:      true,
		Encoding:         "console",
		EncoderConfig:    zap.NewDevelopmentEncoderConfig(),
		OutputPaths:      []string{"stdout", "logfile.log"},
		ErrorOutputPaths: []string{"stderr", "errlog.log"},
	}

	securityConfig := zap.Config{
		Level:       zap.NewAtomicLevelAt(logLevel),
		Development: true,
		Encoding:    "console",
		//Encoding:         "json",
		EncoderConfig:    zap.NewDevelopmentEncoderConfig(),
		OutputPaths:      []string{"stderr", "security.log"},
		ErrorOutputPaths: []string{"stderr", "errlog.log"},
	}

	logger, err := config.Build()
	if err != nil {
		panic(err)
	}
	SugaredLogger = logger.Sugar()

	securityLogger, err := securityConfig.Build()
	if err != nil {
		panic(err)
	}
	SecuritySugaredLogger = securityLogger.Sugar()

}

func GetLogger() *zap.SugaredLogger {
	return SugaredLogger
}

func GetSecurityLogger() *zap.SugaredLogger {
	return SecuritySugaredLogger
}

func Sync() error {
	return SugaredLogger.Sync()
}
