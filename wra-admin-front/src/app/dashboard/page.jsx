"use client";

import React from "react";
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
  Users, Shield,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const recentAlerts = [
  {
    id: 1,
    type: "critical",
    title: "Обнаружена попытка SQL-инъекции",
    source: "192.168.1.105",
    time: "2 мин назад",
    rule: "SQL-INJECT-001",
    action: "Заблокировано",
  },
  {
    id: 2,
    type: "high",
    title: "Подозрительная активность пользователя",
    source: "user_admin",
    time: "5 мин назад",
    rule: "USER-BEHAV-023",
    action: "Предупреждение",
  },
  {
    id: 3,
    type: "medium",
    title: "Превышен лимит запросов API",
    source: "api-gateway-01",
    time: "12 мин назад",
    rule: "RATE-LIMIT-005",
    action: "Ограничено",
  },
  {
    id: 4,
    type: "low",
    title: "Неудачная попытка входа",
    source: "10.0.0.45",
    time: "18 мин назад",
    rule: "AUTH-FAIL-012",
    action: "Запротоколировано",
  },
  {
    id: 5,
    type: "info",
    title: "Обновление сигнатур вирусов",
    source: "security-center",
    time: "1 час назад",
    rule: "SYS-UPDATE-001",
    action: "Успешно",
  },
];

const activeAgents = [
  { name: "Agent-01", status: "active", cpu: 45, memory: 62 },
  { name: "Agent-02", status: "active", cpu: 32, memory: 48 },
  { name: "Agent-03", status: "warning", cpu: 78, memory: 85 },
  { name: "Agent-04", status: "active", cpu: 28, memory: 41 },
  { name: "Agent-05", status: "offline", cpu: 0, memory: 0 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 space-y-6">
        {/* Заголовок и статус */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Панель безопасности
            </h1>
            <p className="text-muted-foreground">
              Мониторинг угроз в реальном времени
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="gap-2 px-4 py-2 text-sm border-green-500/50 bg-green-500/10 text-green-500"
            >
              <CheckCircle className="h-4 w-4" />
              Система защищена
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Карточки метрик */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активных угроз
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">23</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+12% за последний час</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Заблокировано атак
              </CardTitle>
              <Lock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">1,847</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>98.7% эффективность</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Сетевой трафик
              </CardTitle>
              <Globe className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 TB</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingDown className="h-3 w-3" />
                <span>-3% за неделю</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активных агентов
              </CardTitle>
              <Server className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47/50</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <CheckCircle className="h-3 w-3" />
                <span>94% онлайн</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* График атак */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Активность атак (24ч)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                attacks: {
                  label: "Атаки",
                  color: "hsl(var(--chart-1))",
                },
                blocked: {
                  label: "Заблокировано",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={attackData}>
                <XAxis dataKey="time" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="attacks"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Вкладки с дополнительной информацией */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Последние оповещения
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Server className="h-4 w-4" />
              Агенты безопасности
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
                  <span>Последние оповещения</span>
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
                      {recentAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <Badge
                              variant={
                                alert.type === "critical"
                                  ? "destructive"
                                  : alert.type === "high"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={
                                alert.type === "critical"
                                  ? ""
                                  : alert.type === "high"
                                  ? "border-orange-500 text-orange-500"
                                  : alert.type === "medium"
                                  ? "border-yellow-500 text-yellow-500"
                                  : ""
                              }
                            >
                              {alert.type === "critical" && "Критический"}
                              {alert.type === "high" && "Высокий"}
                              {alert.type === "medium" && "Средний"}
                              {alert.type === "low" && "Низкий"}
                              {alert.type === "info" && "Инфо"}
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
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Агенты безопасности</CardTitle>
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
