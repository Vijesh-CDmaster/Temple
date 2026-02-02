
'use client';

import { useParams } from 'next/navigation';
import { temples } from '@/lib/app-data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Landmark, ScrollText, Sparkles, Gem } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TempleDetailPage() {
    const params = useParams();
    const templeId = params.id as string;
    const temple = temples.find(t => t.id === templeId);

    if (!temple) {
        return (
            <div className="container py-8 text-center">
                <h1 className="text-2xl font-bold">Temple Not Found</h1>
                <p className="text-muted-foreground">The temple you are looking for does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/temples">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Temples
                    </Link>
                </Button>
            </div>
        );
    }

    const image = PlaceHolderImages.find(p => p.id === temple.imageId);

    return (
        <div>
            <div className="relative h-64 md:h-80">
                {image && (
                    <Image
                        src={image.imageUrl}
                        alt={temple.name}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8">
                     <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg">{temple.name}</h1>
                     <p className="text-lg text-muted-foreground">{temple.location}</p>
                </div>
                <div className="absolute top-4 left-4">
                    <Button asChild variant="secondary">
                         <Link href="/dashboard/temples">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="container py-8 grid gap-8">
                <div className="space-y-8">
                     <InfoSection title="History" icon={<Landmark className="w-6 h-6 text-primary" />}>
                        <p className="text-muted-foreground leading-relaxed">{temple.history}</p>
                    </InfoSection>
                    
                    <InfoSection title="Mythology" icon={<ScrollText className="w-6 h-6 text-primary" />}>
                        <p className="text-muted-foreground leading-relaxed">{temple.mythology}</p>
                    </InfoSection>

                     <InfoSection title="Mysteries & Facts" icon={<Sparkles className="w-6 h-6 text-primary" />}>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                            {temple.mysteries.map((mystery, index) => (
                                <li key={index}>{mystery}</li>
                            ))}
                        </ul>
                    </InfoSection>

                    <InfoSection title="Architecture" icon={<Gem className="w-6 h-6 text-primary" />}>
                         <p className="text-muted-foreground leading-relaxed">{temple.architecture}</p>
                    </InfoSection>
                </div>
            </div>
        </div>
    );
}

function InfoSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-3">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
