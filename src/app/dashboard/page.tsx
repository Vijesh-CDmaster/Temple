import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Users, Clock, Building, Siren, ArrowRight, Ticket, Map as MapIcon } from "lucide-react";
  import Link from "next/link";
  
  export default function DashboardPage() {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Live Dashboard</h1>
          <p className="text-muted-foreground">Real-time updates for your pilgrimage</p>
        </div>
  
        <Alert className="mb-8 border-primary/50 bg-primary/10">
          <Siren className="h-4 w-4 !text-primary" />
          <AlertTitle className="font-semibold text-primary">Live Alert</AlertTitle>
          <AlertDescription>
            High crowd density expected near Gate 3 between 4 PM - 6 PM. Please use alternate routes.
          </AlertDescription>
        </Alert>
  
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <InfoCard
            title="Live Crowd Status"
            value="High"
            description="Density at main complex"
            icon={<Users className="w-6 h-6 text-destructive" />}
            colorClass="text-destructive"
          />
          <InfoCard
            title="Estimated Waiting Time"
            value="~45 mins"
            description="For general darshan queue"
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            colorClass="text-amber-600"
          />
          <InfoCard
            title="Temple Status"
            value="Open"
            description="Closes at 9:00 PM"
            icon={<Building className="w-6 h-6 text-green-600" />}
            colorClass="text-green-600"
          />
        </div>
  
        <div className="grid gap-6 md:grid-cols-2">
            <ActionCard
                title="Book Virtual Queue"
                description="Skip the physical lines by booking your darshan slot in advance."
                icon={<Ticket className="w-8 h-8 text-primary" />}
                href="/dashboard/virtual-queue"
            />
            <ActionCard
                title="Interactive Temple Map"
                description="Navigate through the temple complex, find facilities, and see crowd heatmaps."
                icon={<MapIcon className="w-8 h-8 text-primary" />}
                href="/dashboard/maps"
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

  interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
  }

  function ActionCard({ title, description, icon, href }: ActionCardProps) {
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
            <Button asChild className="mt-4 ml-auto">
                <Link href={href}>
                    Go <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
        </Card>
    );
  }
  