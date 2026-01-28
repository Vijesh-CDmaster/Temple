import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, Heart } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-headline">About TempleConnect</h1>
        <p className="text-xl text-muted-foreground mt-2">Your portal for a seamless and spiritual pilgrimage</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <InfoCard
          icon={<Target className="w-8 h-8 text-primary" />}
          title="Our Mission"
          description="To bridge the gap between ancient traditions and modern technology, ensuring your pilgrimage is peaceful, safe, and well-managed from start to finish."
        />
        <InfoCard
          icon={<Info className="w-8 h-8 text-primary" />}
          title="What We Do"
          description="We provide tools for virtual queue booking, live crowd status, real-time alerts, and comprehensive temple information to streamline your visit."
        />
        <InfoCard
          icon={<Heart className="w-8 h-8 text-primary" />}
          title="Our Philosophy"
          description="We believe technology can serve devotion. By handling the logistics, we help you focus on your spiritual journey and peace of mind."
        />
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="font-headline">Welcome to Your Enhanced Pilgrimage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to TempleConnect, your dedicated partner for a modern, seamless, and spiritually fulfilling pilgrimage experience. Our platform is designed to bring convenience and peace of mind to your sacred journey.
          </p>
          <p>
            With our system, you can leave behind the worries of long queues and uncertainty. Book your darshan slot in advance with our virtual queue, get live updates on waiting times, and receive important alerts directly on your device. Our goal is to empower you with all the information you need, right at your fingertips.
          </p>
           <p>
            For temple administrators and staff, TempleConnect offers a powerful command center to manage crowds, coordinate security, and respond to emergencies effectively. By leveraging real-time data and AI-powered insights, we help ensure a safe and organized environment for everyone.
          </p>
          <p>
            Thank you for joining us. We hope TempleConnect makes your pilgrimage a more serene and memorable experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function InfoCard({ icon, title, description }: InfoCardProps) {
    return (
        <Card className="p-6 text-center flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold font-headline mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
        </Card>
    );
}
