"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ReportData {
  name: string;
  percentage: number;
}

const chartConfig = {
  percentage: {
    label: "Attendance (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface AggregateAttendanceChartProps {
  data: ReportData[];
}

export function AggregateAttendanceChart({ data }: AggregateAttendanceChartProps) {
  return (
    <div className="w-full h-[320px] overflow-hidden">
        {data.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    hide
                />
                <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="var(--color-percentage)" 
                    strokeWidth={3}
                    dot={{ fill: "var(--color-percentage)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--color-percentage)", strokeWidth: 2 }}
                />
                </LineChart>
            </ResponsiveContainer>
            </ChartContainer>
        ) : (
            <div className="flex h-[300px] w-full items-center justify-center">
            <p className="text-muted-foreground">No attendance data to display yet.</p>
            </div>
        )}
    </div>
  );
}
