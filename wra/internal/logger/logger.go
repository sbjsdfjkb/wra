package logger

import (
	"wra/internal/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var SugaredLogger *zap.SugaredLogger
var SecuritySugaredLogger *zap.SugaredLogger

func init() {
	logLevel := zapcore.InfoLevel
	if levelStr := config.Configuration.Logging.Level; levelStr != "" {
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

	commonOutputPaths := make([]string, 0, 2)
	if config.Configuration.Logging.IsWriteCommon2StdoutLog {
		commonOutputPaths = append(commonOutputPaths, "stdout")
	}
	if val := config.Configuration.Logging.CommonLogPath; val != "" {
		commonOutputPaths = append(commonOutputPaths, val)
	}

	securityOutputPaths := make([]string, 0, 2)
	if config.Configuration.Logging.IsWriteSecurity2StdoutLog {
		securityOutputPaths = append(securityOutputPaths, "stdout")
	}
	if val := config.Configuration.Logging.SecurityLogPath; val != "" {
		securityOutputPaths = append(securityOutputPaths, val)
	}

	errorOutputPaths := make([]string, 0, 2)
	if config.Configuration.Logging.IsWriteError2StdoutLog {
		errorOutputPaths = append(errorOutputPaths, "stderr")
	}
	if val := config.Configuration.Logging.ErrorLogPath; val != "" {
		errorOutputPaths = append(errorOutputPaths, val)
	}

	commonConfig := zap.Config{
		Level:            zap.NewAtomicLevelAt(logLevel),
		Development:      true,
		Encoding:         config.Configuration.Logging.Format,
		EncoderConfig:    zap.NewDevelopmentEncoderConfig(),
		OutputPaths:      commonOutputPaths,
		ErrorOutputPaths: errorOutputPaths,
	}

	securityConfig := zap.Config{
		Level:            zap.NewAtomicLevelAt(logLevel),
		Development:      true,
		Encoding:         config.Configuration.Logging.Format,
		EncoderConfig:    zap.NewDevelopmentEncoderConfig(),
		OutputPaths:      securityOutputPaths,
		ErrorOutputPaths: errorOutputPaths,
	}

	logger, err := commonConfig.Build()
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
