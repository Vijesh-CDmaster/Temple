
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield } from "lucide-react";

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
        <h1 className="text-4xl sm:text-6xl font-bold font-headline text-primary-foreground drop-shadow-md">
            Welcome to TempleConnect
        </h1>
        <p className="text-md sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
          Please select your role to continue
        </p>
      </div>
      
      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <RoleCard
          title="Pilgrim"
          description="Access dashboard for darshan booking, live status, and more."
          icon={<User className="w-10 h-10 text-primary" />}
          href="/dashboard"
        />
        <RoleCard
          title="Worker"
          description="Manage on-ground tasks, monitor crowd, and handle alerts."
          icon={<Briefcase className="w-10 h-10 text-primary" />}
          href="/worker"
        />
        <RoleCard
          title="Admin"
          description="Oversee operations, manage staff, and view analytics."
          icon={<Shield className="w-10 h-10 text-primary" />}
          href="/admin"
        />
      </div>
    </main>
  );
}

function RoleCard({ title, description, icon, href }: { title: string, description: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="block group">
      <Card className="flex flex-col items-center text-center p-6 h-full bg-card/80 backdrop-blur-sm transition-all group-hover:bg-card/95 group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="mb-4 bg-primary/10 p-4 rounded-full">
          {icon}
        </div>
        <CardHeader className="p-0 mb-2">
          <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
