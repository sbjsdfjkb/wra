"use client";

import React from "react";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download } from "lucide-react";

export function Filters({
  searchQuery,
  onSearchChange,
  filterSeverity,
  onFilterSeverityChange,
  onRefresh,
  onExport,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Поиск оповещений..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-4 py-2 h-9 w-64 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Обновить
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Экспорт
        </Button>
      </div>

      <Tabs value={filterSeverity} onValueChange={onFilterSeverityChange} className="w-full sm:w-auto">
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="critical">
            <span className="text-red-500">●</span>
          </TabsTrigger>
          <TabsTrigger value="high">
            <span className="text-orange-500">●</span>
          </TabsTrigger>
          <TabsTrigger value="medium">
            <span className="text-yellow-500">●</span>
          </TabsTrigger>
          <TabsTrigger value="low">
            <span className="text-blue-500">●</span>
          </TabsTrigger>
          <TabsTrigger value="info">
            <span className="text-gray-500">●</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
