import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TempleIcon } from "@/components/shared/icons";

export default function Home() {
  const templeImage = PlaceHolderImages.find(p => p.id === 'temple-exterior');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 sm:p-8 relative overflow-hidden">
      {templeImage && (
        <Image
          src={templeImage.imageUrl}
          alt={templeImage.description}
          fill
          className="object-cover z-0 opacity-20"
          priority
          data-ai-hint={templeImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background z-0"></div>
      
      <div className="z-10 text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <TempleIcon className="h-12 w-12 text-primary"/>
          <h1 className="text-4xl sm:text-6xl font-bold font-headline text-primary-foreground drop-shadow-md">
            TempleConnect
          </h1>
        </div>
        <p className="text-md sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          A Smart Pilgrimage Crowd Management System for a safe, serene, and streamlined spiritual experience.
        </p>
      </div>
      
      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl w-full">
        <RoleCard
          role="Pilgrim"
          description="Access live crowd info, book virtual queues, and navigate the temple grounds with ease."
          icon={<User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />}
          href="/dashboard"
        />
        <RoleCard
          role="Worker"
          description="Manage on-ground tasks, respond to incidents, and coordinate with the team for smooth operations."
          icon={<Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />}
          href="/worker"
        />
        <RoleCard
          role="Admin"
          description="Monitor the entire ecosystem, analyze crowd data, and make data-driven decisions."
          icon={<Shield className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />}
          href="/admin"
        />
      </div>
    </main>
  );
}

interface RoleCardProps {
  role: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function RoleCard({ role, description, icon, href }: RoleCardProps) {
  return (
    <Card className="text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-card/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50">
      <CardHeader className="items-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 sm:p-4 w-fit mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline text-xl sm:text-2xl">{role}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <p className="text-muted-foreground mb-6 text-sm sm:text-base flex-grow min-h-[4.5rem]">{description}</p>
        <Button asChild className="w-full mt-auto" size="lg">
          <Link href={href}>Enter as {role}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
