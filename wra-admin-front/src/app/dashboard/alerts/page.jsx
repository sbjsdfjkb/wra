"use client";

import React, {useState} from "react";
import {DashboardHeader} from "@/components/dashboard/DashboardHeader";
import {StatsCard} from "@/components/alerts/StatsCard";
import {Filters} from "@/components/alerts/Filters";
import {AlertsTable, Pagination} from "@/components/alerts/AlertsTable";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {allAlerts} from "@/data/alerts";


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
            prev.map((a) => (a.id === id ? {...a, status: "resolved"} : a))
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
            <DashboardHeader/>

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
                    <StatsCard title="Всего" value={stats.total}/>
                    <StatsCard title="Критические" value={stats.critical} className="text-red-500"/>
                    <StatsCard title="Высокие" value={stats.high} className="text-orange-500"/>
                    <StatsCard title="Новые" value={stats.new} className="text-destructive"/>
                    <StatsCard title="Решено" value={stats.resolved} className="text-green-500"/>
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
                            <AlertsTable alerts={filteredAlerts} onAlertClick={setSelectedAlert}/>
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

            </main>
        </div>
    );
}
