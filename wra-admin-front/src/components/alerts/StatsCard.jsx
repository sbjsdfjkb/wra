import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCard({ title, value, className }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${className || ""}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
