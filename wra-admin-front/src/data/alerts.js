export const allAlerts = [
    {
        "id": 1,
        "severity": "critical",
        "title": "Критическое несовпадение Fingerprint",
        "description": "Авторизационный токен (X-Wra-Public) предъявлен с устройства, чей отпечаток (Canvas/Fonts) не соответствует исходной сессии. Вероятная кража Cookie.",
        "source": "45.12.88.21",
        "destination": "wra-proxy-node",
        "time": "2026-03-02 15:10:04",
        "rule": "WRA-FP-MISMATCH-002",
        "category": "Session Hijacking",
        "action": "Доступ запрещен",
        "status": "new",
        "details": {
            "method": "GET",
            "path": "/api/user/profile",
            "payload": "SessionID: 88fa...12a",
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "mismatch": "Expected: {fonts: 19, canvas: '0ab8...'}; Received: {fonts: 42, canvas: 'ff21...'}"
        }
    },
    {
        "id": 2,
        "severity": "high",
        "title": "Подозрительная активность аттестации",
        "description": "Зафиксировано более 20 последовательных запросов с неверным заголовком X-Wra-Attest для одного публичного ID. Попытка подбора секретного ключа.",
        "source": "172.21.0.14",
        "destination": "wra-proxy-node",
        "time": "2026-03-02 15:45:12",
        "rule": "WRA-AUTH-BRUTE-005",
        "category": "Authentication Bypass",
        "action": "IP временно заблокирован",
        "status": "investigating",
        "details": {
            "method": "POST",
            "path": "/api/payments/transfer",
            "payload": "invalid_attestation_token_retry_#22",
            "userAgent": "python-requests/2.28.1"
        }
    },
    {
        "id": 3,
        "severity": "medium",
        "title": "Обнаружена попытка повтора запроса",
        "description": "Временная метка в подписи (Timestamp) устарела (более 300 секунд). Запрос отклонен как потенциальная Replay-атака.",
        "source": "192.168.1.55",
        "destination": "wra-proxy-node",
        "time": "2026-03-02 16:02:30",
        "rule": "WRA-TIME-EXPIRED-003",
        "category": "Replay Attack",
        "action": "Отклонено",
        "status": "closed",
        "details": {
            "method": "PATCH",
            "path": "/api/settings/email",
            "payload": "request_time: 2026-03-02 12:00:00",
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        }
    },
    {
        "id": 4,
        "severity": "high",
        "title": "Неавторизованный прямой доступ к API",
        "description": "Бэкенд-сервер получил запрос напрямую, минуя WRA-Proxy (отсутствует заголовок X-Attestation). Попытка обхода защитного периметра.",
        "source": "10.0.0.5",
        "destination": "flask-app-srv",
        "time": "2026-03-02 16:20:00",
        "rule": "WRA-BYPASS-DETECT-007",
        "category": "Policy Violation",
        "action": "Сброс соединения",
        "status": "new",
        "details": {
            "method": "DELETE",
            "path": "/api/admin/purge",
            "payload": "Missing X-Attestation Header",
            "userAgent": "curl/7.81.0"
        }
    },
    {
        "id": 5,
        "severity": "medium",
        "title": "Аномалия: Изменение User-Agent",
        "description": "Идентификатор сессии валиден, но User-Agent изменился в рамках одной активной сессии. Доступ ограничен до повторного подтверждения личности.",
        "source": "91.210.10.45",
        "destination": "wra-proxy-node",
        "time": "2026-03-02 16:45:55",
        "rule": "WRA-UA-CHANGE-004",
        "category": "Session Anomaly",
        "action": "Требуется Re-auth",
        "status": "new",
        "details": {
            "method": "GET",
            "path": "/api/dashboard",
            "payload": "Session: valid",
            "userAgent": "Mozilla/5.0 (Gecko) Firefox/120.0",
            "previousUA": "Mozilla/5.0 (Windows NT 10.0) Chrome/121.0"
        }
    }
]