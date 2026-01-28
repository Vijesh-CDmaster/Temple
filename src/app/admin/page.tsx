import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, Siren } from "lucide-react";
import { adminStats } from "@/lib/app-data";
import { CrowdCounter } from "@/components/shared/CrowdCounter";

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
