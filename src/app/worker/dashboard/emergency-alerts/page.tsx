import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Siren, Clock, MapPin } from "lucide-react";

const alerts = [
    {
        id: 1,
        title: "Medical Emergency Reported",
        description: "An elderly pilgrim has fainted near the main sanctum. Medical team required immediately.",
        location: "Zone C",
        time: "2 minutes ago",
        severity: "High"
    },
    {
        id: 2,
        title: "Crowd Surge Warning",
        description: "High crowd density detected at Gate 3. Security personnel requested to manage the flow.",
        location: "Gate 3",
        time: "5 minutes ago",
        severity: "Medium"
    },
     {
        id: 3,
        title: "Lost Child Reported",
        description: "A 5-year-old child reported missing near the food court. All staff be on the lookout.",
        location: "Food Court Area",
        time: "15 minutes ago",
        severity: "Low"
    }
]

const severityVariant: { [key: string]: "destructive" | "default" } = {
    High: "destructive",
    Medium: "default",
    Low: "default",
};
const severityColor: { [key:string]: string } = {
    High: "text-destructive",
    Medium: "text-amber-600",
    Low: "text-blue-600",
}


export default function EmergencyAlertsPage() {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Emergency Alerts</h1>
                <p className="text-muted-foreground">Active alerts and notifications for all on-ground staff.</p>
            </div>

            <div className="space-y-6">
                {alerts.map(alert => (
                     <Alert key={alert.id} variant={severityVariant[alert.severity]} className="border-l-4">
                        <Siren className={`h-5 w-5 ${severityColor[alert.severity]}`} />
                        <AlertTitle className={`font-bold`}>{alert.title}</AlertTitle>
                        <AlertDescription className="mt-2">
                           <p className="mb-4">{alert.description}</p>
                           <div className="flex items-center justify-between text-xs text-muted-foreground">
                               <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>{alert.location}</span>
                               </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                     <span>{alert.time}</span>
                               </div>
                           </div>
                        </AlertDescription>
                    </Alert>
                ))}
            </div>
        </>
    )
}
