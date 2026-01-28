"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Siren, Users, Search, ArrowRight } from "lucide-react";
import { CrowdCounter } from "@/components/shared/CrowdCounter";
import { useWorker } from "@/context/WorkerContext";
import Link from "next/link";

export default function WorkerDashboardPage() {
    const { worker } = useWorker();

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Worker Dashboard</h1>
                <p className="text-muted-foreground">You are logged in as a <span className="font-semibold text-primary">{worker?.name}</span>.</p>
            </div>

            <div className="mb-8">
                <CrowdCounter />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <ActionCard
                    title="Crowd Control"
                    description="Live crowd analysis and barricade management."
                    icon={<Users className="text-primary" />}
                    href="/worker/dashboard/crowd-control"
                    roles={["Security / Police", "Supervisor"]}
                    workerRole={worker?.name}
                 />
                 <ActionCard
                    title="Emergency Alerts"
                    description="View active high-priority alerts and notifications."
                    icon={<Siren className="text-primary" />}
                    href="/worker/dashboard/emergency-alerts"
                    roles={["all"]}
                    workerRole={worker?.name}
                 />
                 <ActionCard
                    title="Lost & Found"
                    description="File and manage reports for missing persons and items."
                    icon={<Search className="text-primary" />}
                    href="/worker/dashboard/lost-and-found"
                    roles={["Lost & Found Staff", "Supervisor"]}
                    workerRole={worker?.name}
                 />
            </div>
        </>
    );
}


interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    roles: string[];
    workerRole?: string;
}

function ActionCard({ title, description, icon, href, roles, workerRole }: ActionCardProps) {
    if (!workerRole || !(roles.includes(workerRole) || roles.includes("all"))) {
        return null;
    }
    
    return (
         <Card className="flex flex-col p-6 hover:bg-secondary transition-colors">
            <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-headline">{title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{description}</p>
                </div>
            </div>
            <div className="flex-grow" />
            <Button asChild className="mt-4 ml-auto">
                <Link href={href}>
                    Go <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
        </Card>
    )
}
