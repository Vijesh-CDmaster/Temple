import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Siren, ListChecks, Users, MapPin, CheckCircle } from "lucide-react";
import { workerTasks, workerZone } from "@/lib/app-data";

export default function WorkerDashboardPage() {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Worker Dashboard</h1>
                <p className="text-muted-foreground">Your on-ground command center</p>
            </div>

            <Alert variant="destructive" className="mb-8">
                <Siren className="h-4 w-4" />
                <AlertTitle>High Priority Alert: SOS Received!</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>Pilgrim in distress near West Gate. Medical assistance required.</span>
                    <Button size="sm">Navigate to Incident</Button>
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><ListChecks /> Priority Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {workerTasks.map((task) => (
                            <TaskItem key={task.id} title={task.title} priority={task.priority as "High" | "Medium" | "Low"} />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Users /> Zone Monitoring</CardTitle>
                        <CardDescription>Your assigned area: <span className="font-semibold text-primary">{workerZone.name}</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">Live Crowd Density:</p>
                        <div className="text-2xl font-bold text-amber-600">{workerZone.crowdDensity}</div>
                        <p className="text-xs text-muted-foreground">{workerZone.pilgrimFlow}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">View Zone Map</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Siren /> Incident Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">File a new report or view past incidents.</p>
                        <Button className="w-full">File New Report</Button>
                    </CardContent>
                </Card>

            </div>
        </>
    );
}


function TaskItem({ title, priority }: { title: string, priority: "High" | "Medium" | "Low" }) {
    const priorityClasses = {
        High: "border-l-destructive",
        Medium: "border-l-primary",
        Low: "border-l-muted-foreground"
    }
    return (
        <div className={`p-3 bg-secondary rounded-md border-l-4 ${priorityClasses[priority]}`}>
            <p className="font-medium text-sm">{title}</p>
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Priority: {priority}</span>
                <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:bg-green-100 hover:text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1"/> Mark as Done
                </Button>
            </div>
        </div>
    )
}
