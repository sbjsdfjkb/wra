package main

import (
	"encoding/json"
	"net/http"
	"time"
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

		// preflight запрос
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/devices", devicesHandler)
	mux.HandleFunc("/alerts", alertsHandler)

	handler := enableCORS(mux)

	http.ListenAndServe(":8080", handler)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	//redisOK, redisPing := checkRedis()
	//dbOK, dbPing := checkDB()

	resp := HealthResponse{
		AlertsLast24h: 376,  // TODO: взять из БД
		EventsLast24h: 1337, // TODO: взять из БД

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

type Alert struct {
	ID          int            `json:"id"`
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

var allAlerts = []Alert{
	{
		ID:          1,
		Severity:    "critical",
		Title:       "Критическое несовпадение Fingerprint",
		Description: "Авторизационный токен (X-Wra-Public) предъявлен с устройства, чей отпечаток (Canvas/Fonts) не соответствует исходной сессии. Вероятная кража Cookie.",
		Source:      "45.12.88.21",
		Destination: "wra-proxy-node",
		Time:        "2026-03-02 15:10:04",
		Rule:        "WRA-FP-MISMATCH-002",
		Category:    "Session Hijacking",
		Action:      "Доступ запрещен",
		Status:      "new",
		Details: map[string]any{
			"method":    "GET",
			"path":      "/api/user/profile",
			"payload":   "SessionID: 88fa...12a",
			"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			"mismatch":  "Expected: {fonts: 19, canvas: '0ab8...'}; Received: {fonts: 42, canvas: 'ff21...'}",
		},
	},
	{
		ID:          2,
		Severity:    "high",
		Title:       "Подозрительная активность аттестации",
		Description: "Зафиксировано более 20 последовательных запросов с неверным заголовком X-Wra-Attest для одного публичного ID. Попытка подбора секретного ключа.",
		Source:      "172.21.0.14",
		Destination: "wra-proxy-node",
		Time:        "2026-03-02 15:45:12",
		Rule:        "WRA-AUTH-BRUTE-005",
		Category:    "Authentication Bypass",
		Action:      "IP временно заблокирован",
		Status:      "investigating",
		Details: map[string]any{
			"method":    "POST",
			"path":      "/api/payments/transfer",
			"payload":   "invalid_attestation_token_retry_#22",
			"userAgent": "python-requests/2.28.1",
		},
	},
	{
		ID:          3,
		Severity:    "medium",
		Title:       "Обнаружена попытка повтора запроса",
		Description: "Временная метка в подписи (Timestamp) устарела (более 300 секунд). Запрос отклонен как потенциальная Replay-атака.",
		Source:      "192.168.1.55",
		Destination: "wra-proxy-node",
		Time:        "2026-03-02 16:02:30",
		Rule:        "WRA-TIME-EXPIRED-003",
		Category:    "Replay Attack",
		Action:      "Отклонено",
		Status:      "closed",
		Details: map[string]any{
			"method":    "PATCH",
			"path":      "/api/settings/email",
			"payload":   "request_time: 2026-03-02 12:00:00",
			"userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
		},
	},
	{
		ID:          4,
		Severity:    "high",
		Title:       "Неавторизованный прямой доступ к API",
		Description: "Бэкенд-сервер получил запрос напрямую, минуя WRA-Proxy (отсутствует заголовок X-Attestation). Попытка обхода защитного периметра.",
		Source:      "10.0.0.5",
		Destination: "flask-app-srv",
		Time:        "2026-03-02 16:20:00",
		Rule:        "WRA-BYPASS-DETECT-007",
		Category:    "Policy Violation",
		Action:      "Сброс соединения",
		Status:      "new",
		Details: map[string]any{
			"method":    "DELETE",
			"path":      "/api/admin/purge",
			"payload":   "Missing X-Attestation Header",
			"userAgent": "curl/7.81.0",
		},
	},
	{
		ID:          5,
		Severity:    "medium",
		Title:       "Аномалия: Изменение User-Agent",
		Description: "Идентификатор сессии валиден, но User-Agent изменился в рамках одной активной сессии. Доступ ограничен до повторного подтверждения личности.",
		Source:      "91.210.10.45",
		Destination: "wra-proxy-node",
		Time:        "2026-03-02 16:45:55",
		Rule:        "WRA-UA-CHANGE-004",
		Category:    "Session Anomaly",
		Action:      "Требуется Re-auth",
		Status:      "new",
		Details: map[string]any{
			"method":     "GET",
			"path":       "/api/dashboard",
			"payload":    "Session: valid",
			"userAgent":  "Mozilla/5.0 (Gecko) Firefox/120.0",
			"previousUA": "Mozilla/5.0 (Windows NT 10.0) Chrome/121.0",
		},
	},
	{
		ID:          6,
		Severity:    "medium",
		Title:       "Menad обнаружен",
		Description: "Идентификатор сессии валиден, но User-Agent изменился в рамках одной активной сессии. Доступ ограничен до повторного подтверждения личности.",
		Source:      "91.210.10.45",
		Destination: "wra-proxy-node",
		Time:        "2026-03-02 16:45:55",
		Rule:        "WRA-UA-CHANGE-004",
		Category:    "Session Anomaly",
		Action:      "Требуется Re-auth",
		Status:      "new",
		Details: map[string]any{
			"method":     "GET",
			"path":       "/api/dashboard",
			"payload":    "Session: valid",
			"userAgent":  "Mozilla/5.0 (Gecko) Firefox/120.0",
			"previousUA": "Mozilla/5.0 (Windows NT 10.0) Chrome/121.0",
		},
	},
}

func alertsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(allAlerts)
}

//
//func checkRedis() (bool, int) {
//	start := time.Now()
//	err := redisClient.Ping(ctx).Err()
//	ping := int(time.Since(start).Milliseconds())
//
//	return err == nil, ping
//}
//
//func checkDB() (bool, int) {
//	start := time.Now()
//	err := db.Ping()
//	ping := int(time.Since(start).Milliseconds())
//
//	return err == nil, ping
//}
