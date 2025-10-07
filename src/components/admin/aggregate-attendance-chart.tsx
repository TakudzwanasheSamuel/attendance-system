"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
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
    <div className="w-full h-[300px]">
        {data.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
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
                <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4}>
                    <LabelList
                    position="top"
                    offset={10}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => `${value}%`}
                    />
                </Bar>
                </BarChart>
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
