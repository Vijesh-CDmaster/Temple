'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { temples } from '@/lib/app-data';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function MapsPage() {
    const InteractiveMap = useMemo(() => dynamic(
        () => import('@/components/shared/InteractiveMap'),
        { 
            ssr: false,
            loading: () => <Skeleton className="h-full w-full" />
        }
    ), []);

    const markers = temples.map(temple => ({
        lat: temple.lat,
        lng: temple.lng,
        name: temple.name,
        location: temple.location
    }));

    return (
        <div className="container py-8 flex flex-col h-[calc(100vh-theme(spacing.16))]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Interactive Map</h1>
                <p className="text-muted-foreground">Navigate the temple complex with ease</p>
            </div>
            
            <Card className='flex-grow'>
                <CardContent className="p-2 h-full">
                   <InteractiveMap markers={markers} />
                </CardContent>
            </Card>
        </div>
    )
}
