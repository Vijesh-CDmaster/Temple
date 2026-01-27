import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Clock, Building, Siren } from "lucide-react";
  import { CrowdCounter } from "@/components/shared/CrowdCounter";
  import { liveStatus, liveAlert } from "@/lib/app-data";
  
  export default function LiveStatusPage() {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Live Status</h1>
          <p className="text-muted-foreground">Real-time updates for your pilgrimage</p>
        </div>
        
        <div className="mb-8">
            <CrowdCounter />
        </div>
  
        <Alert className="mb-8 border-primary/50 bg-primary/10">
          <Siren className="h-4 w-4 !text-primary" />
          <AlertTitle className="font-semibold text-primary">{liveAlert.title}</AlertTitle>
          <AlertDescription>
            {liveAlert.description}
          </AlertDescription>
        </Alert>
  
        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard
            title="Estimated Waiting Time"
            value={liveStatus.waitingTime.value}
            description={liveStatus.waitingTime.description}
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            colorClass="text-amber-600"
          />
          <InfoCard
            title="Temple Status"
            value={liveStatus.templeStatus.value}
            description={liveStatus.templeStatus.description}
            icon={<Building className="w-6 h-6 text-green-600" />}
            colorClass="text-green-600"
          />
        </div>
      </div>
    );
}
  
interface InfoCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    colorClass?: string;
}

function InfoCard({ title, value, description, icon, colorClass }: InfoCardProps) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
}
