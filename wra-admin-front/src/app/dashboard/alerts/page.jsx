"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/alerts/StatsCard";
import { Filters } from "@/components/alerts/Filters";
import { AlertsTable, Pagination } from "@/components/alerts/AlertsTable";
import { AlertDetail } from "@/components/alerts/AlertDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAlerts,
  updateAlertStatus,
  deleteAlert,
  severityConfig,
  statusConfig,
} from "@/lib/alerts-api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

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

  const handleResolve = async (id) => {
    try {
      await updateAlertStatus(id, "resolved");
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
      );
      setSelectedAlert(null);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const handleArchive = async (id) => {
    // Archive = mark as acknowledged
    try {
      await updateAlertStatus(id, "acknowledged");
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a))
      );
      setSelectedAlert(null);
    } catch (err) {
      console.error("Failed to archive alert:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setSelectedAlert(null);
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const handleRefresh = () => {
    loadAlerts();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(alerts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alerts-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка оповещений...</p>
        </div>
      </div>
    );
  }

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
          <StatsCard
            title="Критические"
            value={stats.critical}
            className="text-red-500"
          />
          <StatsCard
            title="Высокие"
            value={stats.high}
            className="text-orange-500"
          />
          <StatsCard
            title="Новые"
            value={stats.new}
            className="text-destructive"
          />
          <StatsCard
            title="Решено"
            value={stats.resolved}
            className="text-green-500"
          />
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
              {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
                  Ошибка загрузки: {error}
                </div>
              )}
              <AlertsTable
                alerts={filteredAlerts}
                onAlertClick={setSelectedAlert}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAlerts.length / 10) || 1}
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
