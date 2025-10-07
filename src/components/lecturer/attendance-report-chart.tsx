"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ReportData {
  name: string;
  attended: number;
  total: number;
  percentage: number;
}

const chartConfig = {
  percentage: {
    label: "Attendance (%)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

interface AttendanceReportChartProps {
  data: ReportData[];
}

export function AttendanceReportChart({ data }: AttendanceReportChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Student Attendance Overview</CardTitle>
        <CardDescription>Attendance percentage for each student in the selected course.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col">
                           <span>{item.payload.name}</span>
                           <span className="text-muted-foreground">{`Attended: ${item.payload.attended} / ${item.payload.total}`}</span>
                           <span className="font-bold">{`${value}%`}</span>
                        </div>
                      )}
                    />
                  }
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
          <div className="flex h-[400px] w-full items-center justify-center">
            <p className="text-muted-foreground">No attendance data to display for this course yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
