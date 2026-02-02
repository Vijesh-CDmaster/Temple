
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield } from "lucide-react";
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
          className="object-cover z-0 opacity-10"
          priority
          data-ai-hint={templeImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/90 to-background z-0"></div>
      
      <div className="z-10 text-center mb-12">
        <div className="flex justify-center items-center gap-4 mb-4">
            <TempleIcon className="w-12 h-12 text-primary" />
            <h1 className="text-4xl sm:text-6xl font-bold font-headline text-primary-foreground drop-shadow-lg">
                TempleConnect
            </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your portal for a seamless and spiritual pilgrimage.
        </p>
      </div>
      
      <div className="z-10 text-center mb-10">
        <h2 className="text-xl font-semibold text-primary-foreground">Select Your Role to Begin</h2>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <RoleCard
          title="Pilgrim"
          description="Access dashboard for darshan booking, live status, and more."
          icon={<User className="w-10 h-10 text-primary" />}
          href="/login"
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
      <Card className="flex flex-col items-center text-center p-6 sm:p-8 h-full bg-card/70 backdrop-blur-md border-2 border-transparent transition-all duration-300 group-hover:bg-card/80 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:border-primary/50">
        <div className="mb-4 bg-primary/10 p-4 rounded-full transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <CardHeader className="p-0 mb-2">
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
