package kvstorage

import (
	"context"
	"encoding/json"
	"time"
	"wra/internal/config"
	"wra/internal/structs"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

var (
	rdb *redis.Client
	ctx = context.Background()
)

func InitializeRedis(log *zap.SugaredLogger) {
	log.Info("Initializing Redis connection",
		zap.String("addr", config.Configuration.KVStorage.Addr),
		zap.Int("db", config.Configuration.KVStorage.Db))

	rdb = redis.NewClient(&redis.Options{
		Addr:     config.Configuration.KVStorage.Addr,
		Password: config.Configuration.KVStorage.Password,
		DB:       config.Configuration.KVStorage.Db,
	})

	// Test the connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis", zap.Error(err))
	}

	log.Info("Connected to Redis successfully")
}

func StoreSession(sessionID string, session structs.WraSession, log *zap.SugaredLogger) error {
	sessionJSON, err := json.Marshal(session)
	if err != nil {
		log.Error("Failed to marshal session to JSON", zap.Error(err), zap.String("session_id", sessionID))
		return err
	}

	// Store the session with an expiration time (e.g., 1 hour)
	err = rdb.Set(ctx, sessionID, sessionJSON, 0).Err() // 0 means no expiration
	if err != nil {
		log.Error("Failed to store session in Redis", zap.Error(err), zap.String("session_id", sessionID))
		return err
	}

	log.Debug("Session stored in Redis", zap.String("session_id", sessionID))
	return nil
}

func StoreRequestId(ReqId string, log *zap.SugaredLogger) error {
	log.Debug("Storing request ID in Redis", zap.String("request_id", ReqId))

	// Store the session with an expiration time (e.g., 1 hour)
	err := rdb.Set(ctx, "req___"+ReqId, "1", 10*time.Minute).Err() // 0 means no expiration
	if err != nil {
		log.Error("Failed to store request ID in Redis", zap.Error(err), zap.String("request_id", ReqId))
		return err
	}

	log.Debug("Request ID stored successfully", zap.String("request_id", ReqId))
	return nil
}

func ContainsRequestKey(ReqId string, log *zap.SugaredLogger) bool {
	log.Debug("Checking if request ID exists in Redis", zap.String("request_id", ReqId))

	err := rdb.Get(ctx, "req___"+ReqId).Err()
	if err != nil {
		if err == redis.Nil {
			log.Debug("Request ID not found in Redis", zap.String("request_id", ReqId))
			return false
		}

		log.Error("Error checking request ID in Redis", zap.Error(err), zap.String("request_id", ReqId))
		return false
	}

	log.Debug("Request ID found in Redis", zap.String("request_id", ReqId))
	return true
}

func LoadSession(sessionID string, log *zap.SugaredLogger) (*structs.WraSession, bool) {
	log.Debug("Loading session from Redis", zap.String("session_id", sessionID))

	val, err := rdb.Get(ctx, sessionID).Result()
	if err != nil {
		if err == redis.Nil {
			// Key does not exist
			log.Debug("Session not found in Redis", zap.String("session_id", sessionID))
			return nil, false
		}
		// Some other error occurred
		log.Error("Error getting session from Redis", zap.Error(err), zap.String("session_id", sessionID))
		return nil, false
	}

	var session structs.WraSession
	err = json.Unmarshal([]byte(val), &session)
	if err != nil {
		log.Error("Error unmarshaling session from Redis", zap.Error(err), zap.String("session_id", sessionID))
		return nil, false
	}

	log.Debug("Session loaded from Redis", zap.String("session_id", sessionID))
	return &session, true
}
