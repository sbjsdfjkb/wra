"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Shield, Search, Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "isAuthenticated=; path=/; max-age=0";
    document.cookie = "user=; path=/; max-age=0";
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Обзор", active: pathname === "/dashboard" },
    { href: "/dashboard/alerts", label: "Алерты", active: pathname.startsWith("/dashboard/alerts") },
    { href: "/dashboard/settings", label: "Настройки", active: pathname === "/dashboard/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">WRA</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 ml-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                item.active
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">


          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  A
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="flex items-center gap-2">
                <span>admin</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
