package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

type HealthResponse struct {
	AlertsLast24h int `json:"alerts_last_24h"`
	EventsLast24h int `json:"events_last_24h"`

	RedisStatus bool `json:"redis_status"`
	RedisPing   int  `json:"redis_ping"`

	DBStatus bool `json:"db_status"`
	DBPing   int  `json:"db_ping"`

	Status string `json:"status"`
}

type Device struct {
	Hostname  string    `json:"hostname"`
	CustomTag string    `json:"custom_tag"`
	IP        string    `json:"ip"`
	LastSeen  time.Time `json:"-"`
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

var db *sql.DB
var logger *zap.SugaredLogger

type Alert struct {
	ID          string         `json:"id"`
	Severity    string         `json:"severity"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Source      string         `json:"source"`
	Destination string         `json:"destination"`
	Time        string         `json:"time"`
	Rule        string         `json:"rule"`
	Category    string         `json:"category"`
	Action      string         `json:"action"`
	Status      string         `json:"status"`
	Details     map[string]any `json:"details"`
}

type CreateAlertRequest struct {
	Severity    string         `json:"severity"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Source      string         `json:"source"`
	Destination string         `json:"destination"`
	Rule        string         `json:"rule"`
	Category    string         `json:"category"`
	Action      string         `json:"action"`
	Status      string         `json:"status"`
	Details     map[string]any `json:"details"`
}

func main() {
	initLogger()
	defer logger.Sync()

	var err error
	db, err = initDB()
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}
	defer db.Close()

	if err := createAlertsTable(); err != nil {
		logger.Fatal("Failed to create alerts table", zap.Error(err))
	}

	logger.Info("Starting wra-admin-back server on :8080")

	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/devices", devicesHandler)
	mux.HandleFunc("/api/alert", alertPostHandler)
	mux.HandleFunc("/api/alerts", alertsGetHandler)

	handler := enableCORS(mux)

	http.ListenAndServe(":8080", handler)
}

func initDB() (*sql.DB, error) {
	// Чтение переменных окружения для подключения к БД
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "wra"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "wra"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "wra"
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	// Формирование строки подключения
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func createAlertsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS alerts (
		id UUID PRIMARY KEY,
		severity VARCHAR(50) NOT NULL,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		source VARCHAR(255),
		destination VARCHAR(255),
		time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
		rule VARCHAR(100),
		category VARCHAR(100),
		action VARCHAR(255),
		status VARCHAR(50) DEFAULT 'new',
		details JSONB
	);
	CREATE INDEX IF NOT EXISTS idx_alerts_time ON alerts(time);
	CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
	CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
	`
	_, err := db.Exec(query)
	if err != nil {
		logger.Error("Failed to create alerts table", zap.Error(err))
	} else {
		logger.Info("Alerts table created successfully")
	}
	return err
}

func initLogger() {
	logConfig := zap.NewProductionConfig()
	logConfig.OutputPaths = []string{"stdout"}
	logConfig.Level = zap.NewAtomicLevelAt(zap.InfoLevel)

	log, err := logConfig.Build()
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize logger: %v", err))
	}
	logger = log.Sugar()
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	logger.Info("Health check requested",
		zap.String("method", r.Method),
		zap.String("remote_addr", r.RemoteAddr))

	resp := HealthResponse{
		AlertsLast24h: 376,
		EventsLast24h: 1337,

		RedisStatus: true,
		RedisPing:   367,

		DBStatus: true,
		DBPing:   145,

		Status: "UP",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func devicesHandler(w http.ResponseWriter, r *http.Request) {
	logger.Info("Devices list requested",
		zap.String("method", r.Method),
		zap.String("remote_addr", r.RemoteAddr))

	resp := []Device{
		{
			Hostname:  "inter.sosal.1.local",
			CustomTag: "TEST",
			IP:        "10.20.89.10",
			LastSeen:  time.Now(),
		},
		{
			Hostname:  "inter.sosal.2.local",
			CustomTag: "DEV",
			IP:        "10.20.89.11",
			LastSeen:  time.Now(),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func alertPostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		logger.Warn("Alert endpoint called with wrong method",
			zap.String("method", r.Method))
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateAlertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.Warn("Failed to decode alert request",
			zap.Error(err),
			zap.String("remote_addr", r.RemoteAddr))
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	alertID := uuid.New()
	alertTime := time.Now()

	logger.Info("New alert received",
		zap.String("alert_id", alertID.String()),
		zap.String("severity", req.Severity),
		zap.String("title", req.Title),
		zap.String("rule", req.Rule),
		zap.String("source", req.Source))

	detailsJSON, err := json.Marshal(req.Details)
	if err != nil {
		logger.Error("Failed to marshal alert details",
			zap.String("alert_id", alertID.String()),
			zap.Error(err))
		http.Error(w, "Failed to marshal details", http.StatusInternalServerError)
		return
	}

	query := `
	INSERT INTO alerts (id, severity, title, description, source, destination, time, rule, category, action, status, details)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err = db.Exec(query,
		alertID,
		req.Severity,
		req.Title,
		req.Description,
		req.Source,
		req.Destination,
		alertTime,
		req.Rule,
		req.Category,
		req.Action,
		req.Status,
		detailsJSON,
	)

	if err != nil {
		logger.Error("Failed to save alert to database",
			zap.String("alert_id", alertID.String()),
			zap.Error(err))
		http.Error(w, fmt.Sprintf("Failed to save alert: %v", err), http.StatusInternalServerError)
		return
	}

	logger.Info("Alert saved successfully",
		zap.String("alert_id", alertID.String()))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": alertID.String(), "status": "created"})
}

func alertsGetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		logger.Warn("Alerts endpoint called with wrong method",
			zap.String("method", r.Method))
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/alerts")
	path = strings.TrimPrefix(path, "/")

	if path != "" {
		alertID := path
		getAlertByIDHandler(w, r, alertID)
		return
	}

	logger.Info("Fetching all alerts",
		zap.String("remote_addr", r.RemoteAddr))

	rows, err := db.Query(`
		SELECT id, severity, title, description, source, destination,
		       time, rule, category, action, status, details
		FROM alerts
		ORDER BY time DESC
	`)
	if err != nil {
		logger.Error("Failed to fetch alerts from database",
			zap.Error(err))
		http.Error(w, fmt.Sprintf("Failed to fetch alerts: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	alerts := []Alert{}
	for rows.Next() {
		var alert Alert
		var alertTime time.Time
		var detailsJSON []byte

		err := rows.Scan(
			&alert.ID,
			&alert.Severity,
			&alert.Title,
			&alert.Description,
			&alert.Source,
			&alert.Destination,
			&alertTime,
			&alert.Rule,
			&alert.Category,
			&alert.Action,
			&alert.Status,
			&detailsJSON,
		)
		if err != nil {
			logger.Error("Failed to scan alert row",
				zap.Error(err))
			http.Error(w, fmt.Sprintf("Failed to scan alert: %v", err), http.StatusInternalServerError)
			return
		}

		alert.Time = alertTime.Format("2006-01-02 15:04:05")

		if detailsJSON != nil {
			json.Unmarshal(detailsJSON, &alert.Details)
		}

		alerts = append(alerts, alert)
	}

	logger.Info("Successfully fetched alerts",
		zap.Int("count", len(alerts)))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alerts)
}

func getAlertByIDHandler(w http.ResponseWriter, r *http.Request, alertID string) {
	logger.Info("Fetching alert by ID",
		zap.String("alert_id", alertID),
		zap.String("remote_addr", r.RemoteAddr))

	var alert Alert
	var alertTime time.Time
	var detailsJSON []byte

	err := db.QueryRow(`
		SELECT id, severity, title, description, source, destination,
		       time, rule, category, action, status, details
		FROM alerts
		WHERE id = $1
	`, alertID).Scan(
		&alert.ID,
		&alert.Severity,
		&alert.Title,
		&alert.Description,
		&alert.Source,
		&alert.Destination,
		&alertTime,
		&alert.Rule,
		&alert.Category,
		&alert.Action,
		&alert.Status,
		&detailsJSON,
	)

	if err == sql.ErrNoRows {
		logger.Warn("Alert not found",
			zap.String("alert_id", alertID))
		http.Error(w, "Alert not found", http.StatusNotFound)
		return
	}
	if err != nil {
		logger.Error("Failed to fetch alert from database",
			zap.String("alert_id", alertID),
			zap.Error(err))
		http.Error(w, fmt.Sprintf("Failed to fetch alert: %v", err), http.StatusInternalServerError)
		return
	}

	alert.Time = alertTime.Format("2006-01-02 15:04:05")

	if detailsJSON != nil {
		json.Unmarshal(detailsJSON, &alert.Details)
	}

	logger.Info("Alert fetched successfully",
		zap.String("alert_id", alertID))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alert)
}
