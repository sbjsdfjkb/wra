"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Bell,
  Lock,
  Globe,
  Database,
  AlertTriangle,
  Save,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Настройки без сохранения состояния (только UI)
  const [settings, setSettings] = useState({
    // Общие настройки
    siteName: "WRA",
    language: "ru",
    timezone: "Europe/Moscow",

    // Безопасность
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    minPasswordLength: "8",

    // Уведомления
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    alertSound: true,

    // Логи и аудит
    logRetention: "90",
    auditLogging: true,
    logLevel: "info",

    // Сетевые настройки
    firewallEnabled: true,
    intrusionDetection: true,
    autoBlockIP: false,
    blockThreshold: "100",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Имитация сохранения
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleReset = () => {
    // Сброс к значениям по умолчанию (без реального сохранения)
    setSettings({
      siteName: "WRA Security",
      language: "ru",
      timezone: "Europe/Moscow",
      twoFactorAuth: false,
      sessionTimeout: "30",
      passwordExpiry: "90",
      minPasswordLength: "8",
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      alertSound: true,
      logRetention: "90",
      auditLogging: true,
      logLevel: "info",
      firewallEnabled: true,
      intrusionDetection: true,
      autoBlockIP: false,
      blockThreshold: "100",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
            <p className="text-muted-foreground">
              Управление параметрами системы безопасности
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showSaveNotification && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Сохранено!
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Сбросить
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Общие настройки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                Общие настройки
              </CardTitle>
              <CardDescription>
                Основные параметры системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Название системы</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Язык интерфейса</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                    <SelectItem value="Europe/Kaliningrad">
                      Калининград (UTC+2)
                    </SelectItem>
                    <SelectItem value="Asia/Yekaterinburg">
                      Екатеринбург (UTC+5)
                    </SelectItem>
                    <SelectItem value="Asia/Novosibirsk">
                      Новосибирск (UTC+7)
                    </SelectItem>
                    <SelectItem value="Asia/Vladivostok">
                      Владивосток (UTC+10)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Настройки безопасности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                Безопасность
              </CardTitle>
              <CardDescription>
                Параметры аутентификации и доступа
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Двухфакторная аутентификация</Label>
                  <p className="text-sm text-muted-foreground">
                    Требовать 2FA при входе
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, twoFactorAuth: value })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  Таймаут сессии (минут)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">
                  Срок действия пароля (дней)
                </Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) =>
                    setSettings({ ...settings, passwordExpiry: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPasswordLength">
                  Минимальная длина пароля
                </Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  value={settings.minPasswordLength}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minPasswordLength: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Уведомления */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                Уведомления
              </CardTitle>
              <CardDescription>
                Настройки оповещений системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Отправлять оповещения на email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, emailNotifications: value })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Отправлять оповещения по SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, smsNotifications: value })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать push-уведомления
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, pushNotifications: value })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Звук оповещений</Label>
                  <p className="text-sm text-muted-foreground">
                    Воспроизводить звук при тревоге
                  </p>
                </div>
                <Switch
                  checked={settings.alertSound}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, alertSound: value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Логи и аудит */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                Логи и аудит
              </CardTitle>
              <CardDescription>
                Настройки логирования и аудита
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Аудит действий</Label>
                  <p className="text-sm text-muted-foreground">
                    Логировать все действия пользователей
                  </p>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, auditLogging: value })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="logRetention">
                  Срок хранения логов (дней)
                </Label>
                <Input
                  id="logRetention"
                  type="number"
                  value={settings.logRetention}
                  onChange={(e) =>
                    setSettings({ ...settings, logRetention: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logLevel">Уровень логирования</Label>
                <Select
                  value={settings.logLevel}
                  onValueChange={(value) =>
                    setSettings({ ...settings, logLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Только ошибки</SelectItem>
                    <SelectItem value="warn">Предупреждения</SelectItem>
                    <SelectItem value="info">Информация</SelectItem>
                    <SelectItem value="debug">Отладка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Сетевые настройки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                Сетевая безопасность
              </CardTitle>
              <CardDescription>
                Параметры защиты сети
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Межсетевой экран</Label>
                  <p className="text-sm text-muted-foreground">
                    Включить firewall
                  </p>
                </div>
                <Switch
                  checked={settings.firewallEnabled}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, firewallEnabled: value })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Обнаружение вторжений</Label>
                  <p className="text-sm text-muted-foreground">
                    Система IDS/IPS
                  </p>
                </div>
                <Switch
                  checked={settings.intrusionDetection}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, intrusionDetection: value })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Автоматическая блокировка IP</Label>
                  <p className="text-sm text-muted-foreground">
                    Блокировать при превышении лимита
                  </p>
                </div>
                <Switch
                  checked={settings.autoBlockIP}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, autoBlockIP: value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blockThreshold">
                  Порог блокировки (запросов/мин)
                </Label>
                <Input
                  id="blockThreshold"
                  type="number"
                  value={settings.blockThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, blockThreshold: e.target.value })
                  }
                  disabled={!settings.autoBlockIP}
                />
              </div>
            </CardContent>
          </Card>

          {/* Информация о системе */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                Информация о системе
              </CardTitle>
              <CardDescription>
                Технические данные
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Версия системы:</span>
                <span className="font-mono">2.4.1</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Последнее обновление:</span>
                <span>2026-03-02</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">База сигнатур:</span>
                <span className="font-mono">2026.03.02</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Статус лицензии:</span>
                <span className="text-green-500">Активна</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
