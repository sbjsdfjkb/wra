"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/alerts/StatsCard";
import { Filters } from "@/components/alerts/Filters";
import { AlertsTable, Pagination } from "@/components/alerts/AlertsTable";
import { AlertDetail } from "@/components/alerts/AlertDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const allAlerts = [
  {
    id: 1,
    severity: "critical",
    title: "Обнаружена попытка SQL-инъекции",
    description:
      "Злоумышленник попытался выполнить SQL-инъекцию через параметр search формы. Атака была успешно заблокирована WAF.",
    source: "192.168.1.105",
    destination: "db-server-01",
    time: "2026-03-02 14:32:15",
    rule: "SQL-INJECT-001",
    category: "Web Attack",
    action: "Заблокировано",
    status: "new",
    details: {
      method: "POST",
      path: "/api/users/search",
      payload: "' OR 1=1 --",
      userAgent: "Mozilla/5.0 (compatible; sqlmap/1.5)",
    },
  },
  {
    id: 2,
    severity: "high",
    title: "Подозрительная активность пользователя",
    description:
      "Пользователь admin попытался получить доступ к ресурсам вне своей зоны ответственности в нерабочее время.",
    source: "user_admin",
    destination: "file-server-03",
    time: "2026-03-02 14:28:42",
    rule: "USER-BEHAV-023",
    category: "Insider Threat",
    action: "Предупреждение",
    status: "new",
    details: {
      userId: "admin",
      accessedResources: ["/confidential/hr", "/confidential/finance"],
      loginTime: "23:45",
      location: "Неизвестное устройство",
    },
  },
  {
    id: 3,
    severity: "medium",
    title: "Превышен лимит запросов API",
    description:
      "Клиент превысил допустимый лимит запросов к API (1000/мин). Применено ограничение скорости.",
    source: "api-gateway-01",
    destination: "external-client",
    time: "2026-03-02 14:21:08",
    rule: "RATE-LIMIT-005",
    category: "DoS Protection",
    action: "Ограничено",
    status: "acknowledged",
    details: {
      clientId: "client-xyz-123",
      limit: 1000,
      actual: 1547,
      window: "60s",
    },
  },
  {
    id: 4,
    severity: "low",
    title: "Неудачная попытка входа",
    description:
      "Зафиксирована неудачная попытка входа в систему. Возможна ошибка пользователя или попытка подбора.",
    source: "10.0.0.45",
    destination: "auth-server-01",
    time: "2026-03-02 14:15:33",
    rule: "AUTH-FAIL-012",
    category: "Authentication",
    action: "Запротоколировано",
    status: "resolved",
    details: {
      username: "john.doe",
      reason: "Неверный пароль",
      attemptCount: 2,
      maxAttempts: 5,
    },
  },
  {
    id: 5,
    severity: "info",
    title: "Обновление сигнатур вирусов",
    description:
      "Антивирусные сигнатуры успешно обновлены до последней версии. База содержит 2,847,392 записи.",
    source: "security-center",
    destination: "all-endpoints",
    time: "2026-03-02 13:45:00",
    rule: "SYS-UPDATE-001",
    category: "System",
    action: "Успешно",
    status: "resolved",
    details: {
      previousVersion: "2026.03.01",
      newVersion: "2026.03.02",
      signaturesAdded: 1247,
      signaturesRemoved: 89,
    },
  },
  {
    id: 6,
    severity: "critical",
    title: "DDoS-атака обнаружена",
    description:
      "Зафиксирована распределённая атака типа DDoS на основной веб-сервер. Активирована система защиты.",
    source: "multiple",
    destination: "web-server-01",
    time: "2026-03-02 13:12:45",
    rule: "DDOS-DET-001",
    category: "DDoS",
    action: "Митигация",
    status: "in_progress",
    details: {
      attackType: "SYN Flood",
      peakTraffic: "45 Gbps",
      sources: 15847,
      duration: "12 мин",
    },
  },
  {
    id: 7,
    severity: "high",
    title: "Обнаружен вредоносный файл",
    description:
      "При сканировании входящей почты обнаружен файл с трояном. Файл помещён в карантин.",
    source: "mail-gateway",
    destination: "user_inbox",
    time: "2026-03-02 12:58:22",
    rule: "MALWARE-001",
    category: "Malware",
    action: "Карантин",
    status: "resolved",
    details: {
      fileName: "invoice_march.exe",
      malwareType: "Trojan.Win32.Generic",
      sender: "unknown@suspicious.com",
      recipient: "employee@company.com",
    },
  },
  {
    id: 8,
    severity: "medium",
    title: "Сканирование портов",
    description:
      "Зафиксировано сканирование портов из внешней сети. IP-адрес добавлен в список наблюдения.",
    source: "203.0.113.42",
    destination: "firewall-01",
    time: "2026-03-02 12:34:11",
    rule: "PORT-SCAN-003",
    category: "Reconnaissance",
    action: "Мониторинг",
    status: "acknowledged",
    details: {
      scannedPorts: "1-1000",
      openPorts: 3,
      protocol: "TCP",
      duration: "45 сек",
    },
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(allAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity =
      filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesSearch =
      searchQuery === "" ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.rule.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    new: alerts.filter((a) => a.status === "new").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  const handleResolve = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
    setSelectedAlert(null);
  };

  const handleArchive = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setSelectedAlert(null);
  };

  const handleDelete = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setSelectedAlert(null);
  };

  const handleRefresh = () => {
    // Здесь будет логика обновления данных
    console.log("Refreshing...");
  };

  const handleExport = () => {
    // Здесь будет логика экспорта
    console.log("Exporting...");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Оповещения безопасности
            </h1>
            <p className="text-muted-foreground">
              Управление и анализ инцидентов безопасности
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid gap-4 md:grid-cols-5">
          <StatsCard title="Всего" value={stats.total} />
          <StatsCard title="Критические" value={stats.critical} className="text-red-500" />
          <StatsCard title="Высокие" value={stats.high} className="text-orange-500" />
          <StatsCard title="Новые" value={stats.new} className="text-destructive" />
          <StatsCard title="Решено" value={stats.resolved} className="text-green-500" />
        </div>

        {/* Фильтры и таблица */}
        <Card>
          <CardHeader>
            <CardTitle>Все оповещения</CardTitle>
          </CardHeader>
          <CardContent>
            <Filters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterSeverity={filterSeverity}
              onFilterSeverityChange={setFilterSeverity}
              onRefresh={handleRefresh}
              onExport={handleExport}
            />

            <div className="mt-4">
              <AlertsTable alerts={filteredAlerts} onAlertClick={setSelectedAlert} />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
              totalItems={alerts.length}
              filteredItems={filteredAlerts.length}
            />
          </CardContent>
        </Card>

        {/* Детали оповещения */}
        {selectedAlert && (
          <AlertDetail
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onResolve={handleResolve}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
