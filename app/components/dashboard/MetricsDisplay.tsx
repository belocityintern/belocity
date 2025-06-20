"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, BarChart2, TrendingUp } from "lucide-react";

interface MetricsDisplayProps {
  liquidity: number;
  volume24h: number;
  priceChange24h: number | null;
}

const formatUsd = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number | null) => {
  if (value === null) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

export function MetricsDisplay({ liquidity, volume24h, priceChange24h }: MetricsDisplayProps) {
  const priceChangeColor = priceChange24h === null ? 'text-gray-400' : priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-gray-400">Liquidity</p>
            <p className="text-xl font-bold">{formatUsd(liquidity)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-gray-400">24h Volume</p>
            <p className="text-xl font-bold">{formatUsd(volume24h)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-gray-400">24h Price Change</p>
            <p className={`text-xl font-bold ${priceChangeColor}`}>{formatPercentage(priceChange24h)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 