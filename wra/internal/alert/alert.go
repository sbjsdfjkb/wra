package alert

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
	"wra/internal/config"

	"go.uber.org/zap"
)

type Alert struct {
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

func SendAlert(alert Alert, log *zap.SugaredLogger) {
	alertJSON, err := json.Marshal(alert)
	if err != nil {
		log.Error("Failed to marshal alert", zap.Error(err))
		return
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Post(
		config.Configuration.Backend.AlertURL,
		"application/json",
		bytes.NewBuffer(alertJSON),
	)
	if err != nil {
		log.Error("Failed to send alert to backend", zap.Error(err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		log.Warn("Backend returned non-201 status for alert",
			zap.Int("status_code", resp.StatusCode))
		return
	}

	log.Info("Alert sent successfully",
		zap.String("severity", alert.Severity),
		zap.String("rule", alert.Rule))
}
