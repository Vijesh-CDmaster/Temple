import {
    Card,
    CardContent,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { ArrowRight, Ticket } from "lucide-react";
  import Link from "next/link";
  
  export default function DashboardPage() {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">Pilgrim Dashboard</h1>
          <p className="text-muted-foreground">Your portal for a seamless pilgrimage</p>
        </div>
  
        <div className="grid gap-6 md:grid-cols-1">
            <ActionCard
                title="Book Virtual Queue"
                description="Skip the physical lines by booking your darshan slot in advance."
                icon={<Ticket className="w-8 h-8 text-primary" />}
                href="/dashboard/virtual-queue"
            />
        </div>
      </div>
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
  