"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Area as RechartsArea,
} from "recharts";

interface TrajectoryPoint {
  day: string;
  score: number;
}

interface ChartDisplayProps {
  trajectory: TrajectoryPoint[];
}

export function ChartDisplay({ trajectory }: ChartDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AreaChart className="h-6 w-6 text-primary" />
          <CardTitle>Score Trajectory</CardTitle>
        </div>
        <CardDescription>
          Predicted belief score over the next 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={trajectory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <RechartsArea type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 