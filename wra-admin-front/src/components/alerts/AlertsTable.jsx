"use client";

import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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

export function AlertsTable({ alerts, onAlertClick }) {
  return (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Серьёзность</TableHead>
            <TableHead>Оповещение</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Источник</TableHead>
            <TableHead>Правило</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Время</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => {
            const severity = severityConfig[alert.severity];
            const status = statusConfig[alert.status];
            const IconComponent = severity.icon;

            return (
              <TableRow
                key={alert.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onAlertClick(alert)}
              >
                <TableCell>
                  <IconComponent className={`h-5 w-5 ${severity.iconClass}`} />
                </TableCell>
                <TableCell>
                  <Badge variant={severity.badgeVariant} className={severity.badgeClass}>
                    {severity.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  <a href={"/dashboard/alerts/1"}>{alert.title}</a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{alert.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {alert.source}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {alert.rule}
                </TableCell>
                <TableCell>
                  <Badge>
                    LABEL
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.time.split(" ")[1]}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, filteredItems }) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        Показано {filteredItems} из {totalItems} оповещений
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
