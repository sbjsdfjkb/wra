"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  Lock,
  Globe,
  Server,
  TrendingUp,
  TrendingDown,
  Eye,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  ChevronRight,
  Users,
  Shield,
  RefreshCcw,
  Database,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from "recharts";
import { fetchAlerts } from "@/lib/alerts-api";

const API_URL = "http://localhost:8080/health";

const attackData = [
  { time: "00:00", attacks: 12, blocked: 10 },
  { time: "04:00", attacks: 18, blocked: 16 },
  { time: "08:00", attacks: 45, blocked: 42 },
  { time: "12:00", attacks: 38, blocked: 35 },
  { time: "16:00", attacks: 52, blocked: 50 },
  { time: "20:00", attacks: 28, blocked: 26 },
  { time: "23:59", attacks: 15, blocked: 14 },
];

const networkData = [
  { time: "Пн", traffic: 2.4, threats: 12 },
  { time: "Вт", traffic: 3.2, threats: 18 },
  { time: "Ср", traffic: 2.8, threats: 15 },
  { time: "Чт", traffic: 4.1, threats: 24 },
  { time: "Пт", traffic: 3.6, threats: 20 },
  { time: "Сб", traffic: 1.8, threats: 8 },
  { time: "Вс", traffic: 2.1, threats: 10 },
];

export default function DashboardPage() {
  const [healthData, setHealthData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertsData = async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchAlertsData();
  }, []);

  const activeAgents = [
    { name: "(SYS) Database", status: healthData?.db_status ? "active" : "offline", ping: healthData?.db_ping || 0 },
    { name: "(SYS) Redis", status: healthData?.redis_status ? "active" : "offline", ping: healthData?.redis_ping || 0 },
    { name: "Agent-01", status: "active", cpu: 45, memory: 62 },
    { name: "Agent-02", status: "active", cpu: 32, memory: 48 },
    { name: "Agent-03", status: "warning", cpu: 78, memory: 85 },
    { name: "Agent-04", status: "active", cpu: 28, memory: 41 },
    { name: "Agent-05", status: "offline", cpu: 0, memory: 0 },
  ];
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 space-y-6">
        {/* Заголовок и статус */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Главный дашборд
            </h1>
            <p className="text-muted-foreground">
              Мониторинг системы безопасности
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`gap-2 px-4 py-2 text-sm ${
                healthData?.status === "UP"
                  ? "border-green-500/50 bg-green-500/10 text-green-500"
                  : "border-red-500/50 bg-red-500/10 text-red-500"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              {healthData?.status || "UNKNOWN"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchHealth}
              disabled={loading}
              className={loading ? "animate-pulse" : ""}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-red-500 text-sm">Ошибка загрузки данных: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Карточки метрик */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Алерты за 24ч
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {loading ? "..." : healthData?.alerts_last_24h || 0}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>INFO, DEBUG События</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Событий за 24ч
              </CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {loading ? "..." : healthData?.events_last_24h || 0}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>Все события</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Redis
              </CardTitle>
              <Database className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {loading ? "..." : healthData?.redis_ping || 0}
                </span>
                <span className="text-xs text-muted-foreground">ms</span>
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <Badge
                  variant="outline"
                  className={
                    healthData?.redis_status
                      ? "border-green-500 text-green-500"
                      : "border-red-500 text-red-500"
                  }
                >
                  {healthData?.redis_status ? "UP" : "DOWN"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Database
              </CardTitle>
              <Server className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {loading ? "..." : healthData?.db_ping || 0}
                </span>
                <span className="text-xs text-muted-foreground">ms</span>
              </div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <Badge
                  variant="outline"
                  className={
                    healthData?.db_status
                      ? "border-green-500 text-green-500"
                      : "border-red-500 text-red-500"
                  }
                >
                  {healthData?.db_status ? "UP" : "DOWN"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Вкладки с дополнительной информацией */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Последние алерты
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Server className="h-4 w-4" />
              Healthcheck систем
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2">
              <Wifi className="h-4 w-4" />
              Сетевая активность
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Последние алерты</span>
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    5 новых
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Тип</TableHead>
                        <TableHead>Оповещение</TableHead>
                        <TableHead>Источник</TableHead>
                        <TableHead>Правило</TableHead>
                        <TableHead>Действие</TableHead>
                        <TableHead>Время</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.length > 0 ? alerts.slice(0, 10).map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <Badge
                              variant={
                                alert.severity === "critical"
                                  ? "destructive"
                                  : alert.severity === "high"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={
                                alert.severity === "critical"
                                  ? ""
                                  : alert.severity === "high"
                                  ? "border-orange-500 text-orange-500"
                                  : alert.severity === "medium"
                                  ? "border-yellow-500 text-yellow-500"
                                  : ""
                              }
                            >
                              {alert.severity === "critical" && "Критический"}
                              {alert.severity === "high" && "Высокий"}
                              {alert.severity === "medium" && "Средний"}
                              {alert.severity === "low" && "Низкий"}
                              {alert.severity === "info" && "Инфо"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {alert.title}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {alert.source}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {alert.rule}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{alert.action}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {alert.time}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            Нет алертов
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Healthcheck систем</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAgents.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            agent.status === "active"
                              ? "bg-green-500"
                              : agent.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Статус:{" "}
                            {agent.status === "active"
                              ? "Активен"
                              : agent.status === "warning"
                              ? "Предупреждение"
                              : "Офлайн"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* Для системных сервисов показываем ping */}
                        {(agent.name === "(SYS) Database" || agent.name === "(SYS) Redis") && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Ping</p>
                              <p className="text-lg font-bold">{agent.ping} ms</p>
                            </div>
                          </div>
                        )}
                        {/* Для агентов показываем CPU/RAM */}
                        {agent.name !== "(SYS) Database" && agent.name !== "(SYS) Redis" && (
                          <>
                            <div className="w-32 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Cpu className="h-3 w-3" />
                                  CPU
                                </span>
                                <span>{agent.cpu}%</span>
                              </div>
                              <Progress
                                value={agent.cpu}
                                className="h-2"
                                indicatorClassName={
                                  agent.cpu > 75
                                    ? "bg-red-500"
                                    : agent.cpu > 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }
                              />
                            </div>
                            <div className="w-32 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <HardDrive className="h-3 w-3" />
                                  RAM
                                </span>
                                <span>{agent.memory}%</span>
                              </div>
                              <Progress
                                value={agent.memory}
                                className="h-2"
                                indicatorClassName={
                                  agent.memory > 75
                                    ? "bg-red-500"
                                    : agent.memory > 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }
                              />
                            </div>
                          </>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Сетевая активность за неделю
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    traffic: {
                      label: "Трафик (TB)",
                      color: "hsl(var(--chart-1))",
                    },
                    threats: {
                      label: "Угрозы",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={networkData}>
                    <XAxis dataKey="time" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="traffic" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="threats" fill="hsl(var(--chart-5))" />
                  </BarChart>
                </ChartContainer>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-secondary/20">
                    <p className="text-sm text-muted-foreground">
                      Всего трафика
                    </p>
                    <p className="text-2xl font-bold">18.4 TB</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/20">
                    <p className="text-sm text-muted-foreground">
                      Средний трафик/день
                    </p>
                    <p className="text-2xl font-bold">2.6 TB</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/20">
                    <p className="text-sm text-muted-foreground">
                      Пиковый день
                    </p>
                    <p className="text-2xl font-bold">Чт (4.1 TB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Быстрые действия */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">Полная проверка</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                <Lock className="h-8 w-8 text-green-500" />
                <span className="text-sm font-medium">Блокировка IP</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                <Users className="h-8 w-8 text-blue-500" />
                <span className="text-sm font-medium">Проверка пользователей</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                <Activity className="h-8 w-8 text-orange-500" />
                <span className="text-sm font-medium">Анализ логов</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
