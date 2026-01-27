import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
          Your seamless guide to a divine pilgrimage experience in Gujarat.
        </p>
      </div>
      
      <div className="z-10 mt-4">
        <Button asChild size="lg">
            <Link href="/dashboard/virtual-queue">Book Darshan Token</Link>
        </Button>
      </div>
    </main>
  );
}
