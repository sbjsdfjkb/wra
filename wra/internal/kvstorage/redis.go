package kvstorage

import (
	"context"
	"encoding/json"
	"log"
	"time"
	"wra/internal/config"
	"wra/internal/structs"

	"github.com/redis/go-redis/v9"
)

var (
	rdb *redis.Client
	ctx = context.Background()
)

func InitializeRedis() {

	rdb = redis.NewClient(&redis.Options{
		Addr:     config.Configuration.KVStorage.Addr,
		Password: config.Configuration.KVStorage.Password,
		DB:       config.Configuration.KVStorage.Db,
	})

	// Test the connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis successfully")
}

func StoreSession(sessionID string, session structs.WraSession) error {
	sessionJSON, err := json.Marshal(session)
	if err != nil {
		return err
	}

	// Store the session with an expiration time (e.g., 1 hour)
	err = rdb.Set(ctx, sessionID, sessionJSON, 0).Err() // 0 means no expiration
	if err != nil {
		return err
	}

	return nil
}

func StoreRequestId(ReqId string) error {

	// Store the session with an expiration time (e.g., 1 hour)
	err := rdb.Set(ctx, "req___"+ReqId, "1", 10*time.Minute).Err() // 0 means no expiration
	if err != nil {
		return err
	}

	return nil
}

func ContainsRequestKey(ReqId string) bool {
	err := rdb.Get(ctx, "req___"+ReqId).Err()
	if err != nil {
		return false
	}

	return true
}

func LoadSession(sessionID string) (*structs.WraSession, bool) {
	val, err := rdb.Get(ctx, sessionID).Result()
	if err != nil {
		if err == redis.Nil {
			// Key does not exist
			return nil, false
		}
		// Some other error occurred
		log.Printf("Error getting session from Redis: %v", err)
		return nil, false
	}

	var session structs.WraSession
	err = json.Unmarshal([]byte(val), &session)
	if err != nil {
		log.Printf("Error unmarshaling session: %v", err)
		return nil, false
	}

	return &session, true
}
