"use client";

import React from "react";
import {
  X,
  CheckCircle,
  Archive,
  Trash2,
  Target,
  Server,
  Clock,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { severityConfig, statusConfig } from "@/lib/alerts-api";

const getSeverityIcon = (severity) => {
  switch (severity) {
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

export function AlertDetail({ alert, onClose, onResolve, onArchive, onDelete }) {
  if (!alert) return null;

  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const IconComponent = getSeverityIcon(alert.severity);

  return (
    <Card className="fixed inset-4 z-50 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <IconComponent className={`h-5 w-5 text-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : alert.severity === 'medium' ? 'yellow' : 'blue'}-500`} />
          <CardTitle>Детали оповещения #{alert.id}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 overflow-y-auto h-[calc(100%-80px)]">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
              <p className="text-muted-foreground">{alert.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Источник</span>
                </div>
                <p className="font-mono text-sm">{alert.source}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Назначение</span>
                </div>
                <p className="font-mono text-sm">{alert.destination}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Технические детали</h4>
              <div className="p-4 rounded-lg bg-muted font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(alert.details, null, 2)}</pre>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Серьёзность</span>
                <Badge variant={severity.variant} className={severity.className}>
                  {severity.label}
                </Badge>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Статус</span>
                <Badge variant={status.variant} className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Категория</span>
                <Badge variant="outline">{alert.category}</Badge>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Правило</span>
                <span className="font-mono text-xs">{alert.rule}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Действие</span>
                <span>{alert.action}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Время</span>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {alert.time}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => onResolve(alert.id)}
                disabled={alert.status === "resolved"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Отметить как решённое
              </Button>
              <Button className="w-full" variant="outline" onClick={() => onArchive(alert.id)}>
                <Archive className="h-4 w-4 mr-2" />
                Архивировать
              </Button>
              <Button className="w-full" variant="destructive" onClick={() => onDelete(alert.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
