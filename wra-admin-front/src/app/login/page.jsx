"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Хардкод авторизация
    if (username === "admin" && password === "admin") {
      // Сохраняем состояние авторизации в cookie (30 дней)
      document.cookie = "isAuthenticated=true; path=/; max-age=" + (30 * 24 * 60 * 60);
      document.cookie = "user=" + encodeURIComponent(JSON.stringify({ username: "admin" })) + "; path=/; max-age=" + (30 * 24 * 60 * 60);
      router.push("/dashboard");
    } else {
      setError("Неверное имя пользователя или пароль");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">WRA</CardTitle>
          <CardDescription>
            Войдите для просмотра данной страницы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Вход...
                </span>
              ) : (
                "Войти"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Тестовые учётные данные:</p>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <span>Логин:</span>
              <span>admin</span>
              <span>Пароль:</span>
              <span>admin</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
