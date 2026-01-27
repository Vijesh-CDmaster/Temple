import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const temples = [
    { id: "1", name: "Somnath Temple", location: "Gujarat, India", crowd: "Medium", imageId: "temple-1" },
    { id: "2", name: "Dwarkadhish Temple", location: "Gujarat, India", crowd: "Low", imageId: "temple-2" },
    { id: "3", name: "Ambaji Temple", location: "Gujarat, India", crowd: "High", imageId: "temple-3" },
    { id: "4", name: "Pavagadh Temple", location: "Gujarat, India", crowd: "Medium", imageId: "temple-4" },
]

const crowdVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
    "Low": "secondary",
    "Medium": "default",
    "High": "destructive"
}

export default function TemplesPage() {
    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Temples</h1>
                <p className="text-muted-foreground">Discover and plan your visit</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {temples.map((temple) => {
                    const image = PlaceHolderImages.find(p => p.id === temple.imageId);
                    return (
                        <Card key={temple.id} className="overflow-hidden flex flex-col">
                            <CardHeader className="p-0">
                                {image && (
                                     <Image src={image.imageUrl} alt={temple.name} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={image.imageHint} />
                                )}
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <CardTitle className="font-headline mb-1">{temple.name}</CardTitle>
                                <CardDescription>{temple.location}</CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center p-6 pt-0">
                                <div>
                                    <span className="text-sm text-muted-foreground mr-2">Crowd:</span>
                                    <Badge variant={crowdVariant[temple.crowd]}>{temple.crowd}</Badge>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/temples/${temple.id}`}>
                                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}