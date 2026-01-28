"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, AlertTriangle, Siren, BarChart } from "lucide-react";
import { adminStats } from "@/lib/app-data";
import { CrowdCounter } from "@/components/shared/CrowdCounter";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const crowdData = [
  { time: "10 AM", count: 2500 },
  { time: "11 AM", count: 3200 },
  { time: "12 PM", count: 4500 },
  { time: "1 PM", count: 6000 },
  { time: "2 PM", count: 5200 },
  { time: "3 PM", count: 7100 },
  { time: "4 PM", count: 8500 },
];

const chartConfig = {
  count: {
    label: "Crowd Count",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function AdminDashboardPage() {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Admin Command Center</h1>
                <p className="text-muted-foreground">Monitor, predict, and control temple operations.</p>
            </div>

            <div className="mb-8">
                <CrowdCounter />
            </div>

            <div className="mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><BarChart /> Crowd Analytics</CardTitle>
                        <CardDescription>Estimated crowd count over the last several hours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <ResponsiveContainer>
                                <LineChart
                                data={crowdData}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                                >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                                />
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Line
                                    dataKey="count"
                                    type="natural"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={true}
                                />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <StatCard title="Active Staff" value={adminStats.activeStaff} icon={<Users className="text-primary"/>} />
                <StatCard title="Active Alerts" value={adminStats.activeAlerts} icon={<AlertTriangle className="text-destructive"/>} />
                <StatCard title="SOS Requests" value={adminStats.sosRequests} icon={<Siren className="text-destructive"/>} />
            </div>
        </>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="h-6 w-6">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
