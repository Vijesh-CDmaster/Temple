import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Footprints, AlertTriangle, Siren } from "lucide-react";
import { CrowdCounter } from "./_components/CrowdCounter";

export default function AdminDashboardPage() {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Admin Command Center</h1>
                <p className="text-muted-foreground">Monitor, predict, and control temple operations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Live Footfall" value="12,483" icon={<Footprints className="text-primary"/>} />
                <StatCard title="Active Staff" value="215" icon={<Users className="text-primary"/>} />
                <StatCard title="Active Alerts" value="3" icon={<AlertTriangle className="text-destructive"/>} />
                <StatCard title="SOS Requests" value="1" icon={<Siren className="text-destructive"/>} />
            </div>

            <CrowdCounter />
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
