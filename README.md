# wra-complex

Система мониторинга и алертинга для WRA-прокси.

## Описание проекта

Прокси комплекс для защиты от использования украденных куки файлов. Для удобство использования добавлена админ панель.

## Архитектура

![arch.png](images/arch.png)

## Компоненты

### wra

Прокси-сервер с функцией детектирования атак.

**Новые возможности:**
- Модуль отправки алертов (`internal/alert/alert.go`)
- Конфигурация URL бекенда через ENV переменную `WRA_BACKEND_ALERT_URL`
- Автоматическая отправка алертов при обнаружении несоответствия подписи (Session Hijacking)

**Детектирование атак:**
При неудачной верификации подписи отправляется алерт с параметрами:
- Severity: `critical`
- Title: `Критическое несовпадение Fingerprint`
- Rule: `WRA-FP-MISMATCH-002`
- Category: `Session Hijacking`

### wra-admin-back

Бэкенд для приёма и хранения алертов.

**Технологии:**
- Go
- PostgreSQL (драйвер `github.com/lib/pq`)
- Zap logger (`go.uber.org/zap`)
- UUID генерация (`github.com/google/uuid`)

**Функционал:**
- Создание таблицы `alerts` при старте
- Логирование всех запросов
- REST API для управления алертами

**Структура таблицы alerts:**
- id (UUID) — уникальный идентификатор
- severity — уровень критичности
- title — заголовок
- description — описание
- source — IP адрес источника
- destination — узел назначения
- time — временная метка
- rule — идентификатор правила
- category — категория угрозы
- action — предпринятое действие
- status — статус алерта
- details (JSONB) — дополнительные данные

**Индексы:**
- По полю `time`
- По полю `severity`
- По полю `status`

### wra-admin-front

Веб-интерфейс для просмотра и управления алертами.

**Технологии:**
- Next.js
- React

**Функционал:**
- Просмотр списка всех алертов
- Фильтрация по статусу и уровню критичности
- Просмотр деталей конкретного алерта
- Интеграция с бэкендом через API

### wra-example-app

Пример приложения банка с SQL базой данных.

**Возможности:**
- Поддержка нескольких СУБД (SQLite, PostgreSQL, MySQL)
- Управление пользователями и картами
- Транзакции и сообщения
- Аутентификация и авторизация

## API Endpoints

### wra-admin-back

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/alert | Создать новый алерт |
| GET | /api/alerts | Получить все алерты |
| GET | /api/alerts/:alert_id | Получить алерт по ID |

### Формат запроса POST /api/alert

```json
{
  "severity": "critical",
  "title": "Заголовок алерта",
  "description": "Описание",
  "source": "IP адрес источника",
  "destination": "wra-proxy-node",
  "rule": "WRA-RULE-001",
  "category": "Session Hijacking",
  "action": "Доступ запрещен",
  "status": "new",
  "details": {}
}
```

### Формат ответа GET /api/alerts

```json
[
  {
    "id": "uuid-string",
    "severity": "critical",
    "title": "Заголовок",
    "description": "Описание",
    "source": "45.12.88.21",
    "destination": "wra-proxy-node",
    "time": "2026-03-14 15:10:04",
    "rule": "WRA-FP-MISMATCH-002",
    "category": "Session Hijacking",
    "action": "Доступ запрещен",
    "status": "new",
    "details": {}
  }
]
```

## Переменные окружения

### wra

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `WRA_BACKEND_ALERT_URL` | URL бекенда для отправки алертов | `http://localhost:8080/api/alert` |

### wra-admin-back

Подключение к PostgreSQL задаётся в коде:
- host: `localhost`
- port: `5432`
- user: `wra`
- password: `wra`
- dbname: `wra`

### wra-example-app

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Строка подключения к базе данных |

Примеры:
- PostgreSQL: `postgresql://username:password@localhost/database_name`
- MySQL: `mysql+pymysql://username:password@localhost/database_name`
- SQLite: `sqlite:///bank.db`

## Быстрый старт

```bash
docker compose up -d
```

## База данных

### Таблица alerts

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    severity VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    source VARCHAR(45),
    destination VARCHAR(255),
    time TIMESTAMP,
    rule VARCHAR(100),
    category VARCHAR(100),
    action VARCHAR(255),
    status VARCHAR(50),
    details JSONB
);

CREATE INDEX idx_alerts_time ON alerts(time);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
```

## Уровни критичности алертов

- `critical` — критическая угроза (например, Session Hijacking)
- `high` — высокая угроза
- `medium` — средняя угроза
- `low` — низкая угроза
- `info` — информационное сообщение

## Статусы алертов

- `new` — новый алерт
- `in_progress` — в обработке
- `resolved` — решён
- `false_positive` — ложное срабатывание

## Логирование

Бэкенд использует zap logger в production формате. Логируются:
- Все входящие запросы (health, devices, alerts)
- Ошибки базы данных
- Ошибки валидации
- Успешные операции (создание алерта, получение списка)

## Безопасность

- Password hashing в wra-example-app
- SQL injection protection через SQLAlchemy ORM
- Input validation и sanitization
- User session management
