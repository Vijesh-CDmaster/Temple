import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";
import Image from "next/image";

export default function MapsPage() {
    const mapImage = PlaceHolderImages.find(p => p.id === 'map-placeholder');

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Interactive Map</h1>
                <p className="text-muted-foreground">Navigate the temple complex with ease</p>
            </div>

            <Alert className="mb-8">
                <Construction className="h-4 w-4" />
                <AlertTitle>Feature in Development</AlertTitle>
                <AlertDescription>
                    The interactive map feature is coming soon. Below is a static preview.
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardContent className="p-4">
                    {mapImage && (
                        <Image 
                            src={mapImage.imageUrl} 
                            alt={mapImage.description} 
                            width={1200}
                            height={800}
                            className="rounded-lg w-full h-auto"
                            data-ai-hint={mapImage.imageHint}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}