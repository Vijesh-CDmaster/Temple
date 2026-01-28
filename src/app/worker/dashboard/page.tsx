"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Siren, ListChecks, BellOff } from "lucide-react";
import { CrowdCounter } from "@/components/shared/CrowdCounter";
import { useWorker } from "@/context/WorkerContext";

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
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><ListChecks /> Priority Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
                         <ListChecks className="w-12 h-12 text-muted-foreground mb-4" />
                         <h3 className="font-semibold text-muted-foreground">No Tasks Assigned</h3>
                         <p className="text-sm text-muted-foreground mt-1">Your assigned tasks will be listed here.</p>
                    </CardContent>
                     <CardFooter>
                        <Button variant="outline" className="w-full">Refresh Tasks</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Siren /> Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
                       <BellOff className="w-12 h-12 text-muted-foreground mb-4" />
                       <h3 className="font-semibold text-muted-foreground">No Active Alerts</h3>
                       <p className="text-sm text-muted-foreground mt-1">High-priority notifications will appear here.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Siren /> Incident Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">File a new report or view past incidents in your zone.</p>
                        <Button className="w-full">File New Report</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
