"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Ban,
  Lock,
  UserX,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Target,
  Server,
  FileText,
  ShieldAlert,
  Shield,
  RefreshCcw,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchAlertById,
  updateAlertStatus,
  deleteAlert,
  banIP,
  freezeUser,
  banUser,
  severityConfig,
  statusConfig,
} from "@/lib/alerts-api";

export default function AlertIdPage() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const alertId = params?.alertId;

  useEffect(() => {
    if (alertId) {
      loadAlert();
    }
  }, [alertId]);

  const loadAlert = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAlertById(alertId);
      setAlert(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const severity = alert ? severityConfig[alert.severity] : null;
  const status = alert ? statusConfig[alert.status] : null;

  const getSeverityIcon = (severityName) => {
    switch (severityName) {
      case "critical":
        return ShieldAlert;
      case "high":
        return AlertTriangle;
      case "medium":
        return AlertCircle;
      case "low":
        return Info;
      default:
        return Info;
    }
  };

  const handleCopyIp = () => {
    if (alert?.source) {
      navigator.clipboard.writeText(alert.source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBanIp = async () => {
    if (!alert?.source) return;
    setActionLoading("banIp");
    try {
      await banIP(alert.source);
      alert("IP заблокирован");
    } catch (err) {
      console.error("Failed to ban IP:", err);
      alert("Ошибка при блокировке IP");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFreezeUser = async () => {
    const userId = alert?.details?.userId || alert?.metadata?.userId;
    if (!userId) return;
    setActionLoading("freezeUser");
    try {
      await freezeUser(userId);
      alert("Пользователь заморожен");
    } catch (err) {
      console.error("Failed to freeze user:", err);
      alert("Ошибка при заморозке пользователя");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async () => {
    const userId = alert?.details?.userId || alert?.metadata?.userId;
    if (!userId) return;
    setActionLoading("banUser");
    try {
      await banUser(userId);
      alert("Пользователь заблокирован");
    } catch (err) {
      console.error("Failed to ban user:", err);
      alert("Ошибка при блокировке пользователя");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkResolved = async () => {
    if (!alert) return;
    setActionLoading("resolve");
    try {
      await updateAlertStatus(alert.id, "resolved");
      setAlert((prev) => ({ ...prev, status: "resolved" }));
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!alert) return;
    if (!confirm("Вы уверены, что хотите удалить это оповещение?")) return;
    setActionLoading("delete");
    try {
      await deleteAlert(alert.id);
      router.push("/dashboard/alerts");
    } catch (err) {
      console.error("Failed to delete alert:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const IconComponent = alert ? getSeverityIcon(alert.severity) : ShieldAlert;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка оповещения...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="p-6 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
              <p className="text-muted-foreground mb-4">{error || "Оповещение не найдено"}</p>
              <Button onClick={() => router.push("/dashboard/alerts")}>
                Вернуться к списку
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6">
        {/* Навигация и заголовок */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 text-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : alert.severity === 'medium' ? 'yellow' : 'blue'}-500`} />
            <div>
              <h1 className="text-2xl font-bold">Детали оповещения</h1>
              <p className="text-muted-foreground text-sm">#{alert.id}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={severity?.variant} className={severity?.className}>
              {severity?.label}
            </Badge>
            <Badge variant={status?.variant} className={status?.className}>
              {status?.label}
            </Badge>
            <Button variant="ghost" size="icon" onClick={loadAlert}>
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Описание */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{alert.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{alert.description}</p>
              </CardContent>
            </Card>

            {/* Сеть */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  Сетевая информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        IP адрес источника
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopyIp}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-mono text-sm">{alert.source}</p>
                    {copied && (
                      <p className="text-xs text-green-500 mt-1">Скопировано!</p>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Назначение
                      </span>
                    </div>
                    <p className="font-mono text-sm">{alert.destination}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBanIp}
                    disabled={actionLoading === "banIp"}
                    className="gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    Ban IP
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      window.open(`/dashboard/users?ip=${alert.source}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    Проверить пользователей с этим IP
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Метаданные */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Метаданные
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alert.details && Object.keys(alert.details).length > 0 ? (
                  <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Нет данных</p>
                )}
              </CardContent>
            </Card>

            {/* Правило */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  Правило безопасности
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-mono text-sm font-semibold">{alert.rule}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.category}
                    </p>
                  </div>
                  <Badge variant="outline">{alert.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Технические детали */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Технические детали</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {alert.details && Object.keys(alert.details).length > 0 ? (
                    <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Нет данных</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Время</span>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {alert.time}
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Действие</span>
                  <Badge variant="outline">{alert.action}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Категория</span>
                  <Badge variant="outline">{alert.category}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Статус</span>
                  <Badge variant={status?.variant} className={status?.className}>
                    {status?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Действия */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={handleBanIp}
                  disabled={actionLoading === "banIp"}
                >
                  <Ban className="h-4 w-4" />
                  Ban IP
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={handleFreezeUser}
                  disabled={actionLoading === "freezeUser" || !alert?.details?.userId}
                >
                  <Lock className="h-4 w-4" />
                  Freeze User login
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={handleBanUser}
                  disabled={actionLoading === "banUser" || !alert?.details?.userId}
                >
                  <UserX className="h-4 w-4" />
                  Ban User login
                </Button>
                <Separator className="my-2" />
                <Button
                  className="w-full gap-2"
                  variant={status?.label === "Решено" ? "secondary" : "default"}
                  onClick={handleMarkResolved}
                  disabled={actionLoading === "resolve" || alert.status === "resolved"}
                >
                  <CheckCircle className="h-4 w-4" />
                  {alert.status === "resolved" ? "Решено" : "Mark as resolved"}
                </Button>
                <Button
                  className="w-full gap-2"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={actionLoading === "delete"}
                >
                  <CheckCircle className="h-4 w-4" />
                  Удалить
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
