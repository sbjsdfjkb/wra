"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Shield,
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
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const alertData = {
  id: "ALT-2026-001234",
  severity: "critical",
  title: "Обнаружена попытка SQL-инъекции",
  description:
    "Злоумышленник попытался выполнить SQL-инъекцию через параметр search формы. Атака была успешно заблокирована WAF.",
  sourceIp: "192.168.1.105",
  destination: "db-server-01 (10.0.0.50)",
  time: "2026-03-02 14:32:15",
  rule: "SQL-INJECT-001",
  ruleDescription: "[sys] opensosal",
  category: "Web Attack",
  action: "Заблокировано",
  status: "new",
  details: {
    method: "POST",
    path: "/api/users/search",
    payload: "' OR 1=1 --",
    userAgent: "Mozilla/5.0 (compatible; sqlmap/1.5)",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": "47",
      Host: "api.example.com",
    },
  },
  metadata: {
    user: "AAA",
    userId: 1,
    sessionId: "sess_abc123",
    geoLocation: "Moscow, RU",
  },
};

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    iconClass: "text-red-500",
    badgeVariant: "destructive",
    badgeClass: "",
    label: "Критический",
  },
  high: {
    icon: AlertTriangle,
    iconClass: "text-orange-500",
    badgeVariant: "outline",
    badgeClass: "border-orange-500 text-orange-500",
    label: "Высокий",
  },
  medium: {
    icon: AlertCircle,
    iconClass: "text-yellow-500",
    badgeVariant: "secondary",
    badgeClass: "border-yellow-500 text-yellow-500",
    label: "Средний",
  },
  low: {
    icon: Info,
    iconClass: "text-blue-500",
    badgeVariant: "outline",
    badgeClass: "border-blue-500 text-blue-500",
    label: "Низкий",
  },
  info: {
    icon: Info,
    iconClass: "text-gray-500",
    badgeVariant: "secondary",
    badgeClass: "",
    label: "Инфо",
  },
};

const statusConfig = {
  new: {
    badgeVariant: "destructive",
    badgeClass: "",
    label: "Новое",
  },
  in_progress: {
    badgeVariant: "outline",
    badgeClass: "border-blue-500 text-blue-500",
    label: "В работе",
  },
  acknowledged: {
    badgeVariant: "secondary",
    badgeClass: "",
    label: "Подтверждено",
  },
  resolved: {
    badgeVariant: "outline",
    badgeClass: "border-green-500 text-green-500",
    label: "Решено",
  },
};

export default function AlertIdPage() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState(alertData);
  const [copied, setCopied] = useState(false);

  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const IconComponent = severity.icon;

  const handleCopyIp = () => {
    navigator.clipboard.writeText(alert.sourceIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBanIp = () => {
    console.log("Banning IP:", alert.sourceIp);
  };

  const handleFreezeUser = () => {
    console.log("Freezing user:", alert.metadata.user);
  };

  const handleBanUser = () => {
    console.log("Banning user:", alert.metadata.user);
  };

  const handleMarkResolved = () => {
    setAlert((prev) => ({ ...prev, status: "resolved" }));
  };

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
            <IconComponent className={`h-6 w-6 ${severity.iconClass}`} />
            <div>
              <h1 className="text-2xl font-bold">Детали оповещения</h1>
              <p className="text-muted-foreground text-sm">{alert.id}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={severity.badgeVariant} className={severity.badgeClass}>
              {severity.label}
            </Badge>
            <Badge variant={status.badgeVariant} className={status.badgeClass}>
              {status.label}
            </Badge>
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
                    <p className="font-mono text-sm">{alert.sourceIp}</p>
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
                      window.open(`/dashboard/users?ip=${alert.sourceIp}`, "_blank")
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
                <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(alert.metadata, null, 2)}</pre>
                </div>
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
                      {alert.ruleDescription}
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
                  <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                  </div>
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
                >
                  <Ban className="h-4 w-4" />
                  Ban IP
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={handleFreezeUser}
                >
                  <Lock className="h-4 w-4" />
                  Freeze User login
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant="outline"
                  onClick={handleBanUser}
                >
                  <UserX className="h-4 w-4" />
                  Ban User login
                </Button>
                <Separator className="my-2" />
                <Button
                  className="w-full gap-2"
                  variant={alert.status === "resolved" ? "secondary" : "default"}
                  onClick={handleMarkResolved}
                  disabled={alert.status === "resolved"}
                >
                  <CheckCircle className="h-4 w-4" />
                  {alert.status === "resolved" ? "Решено" : "Mark as resolved"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
