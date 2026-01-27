import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Ticket, Clock, Calendar, Users, QrCode } from "lucide-react";
import { activeToken } from "@/lib/app-data";

export default function MyTokensPage() {
    const qrImage = PlaceHolderImages.find(p => p.id === "qr-code");

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">My Tokens</h1>
                <p className="text-muted-foreground">Your active and upcoming virtual queue passes</p>
            </div>

            <Alert className="mb-8">
                <Ticket className="h-4 w-4" />
                <AlertTitle>Upcoming Darshan</AlertTitle>
                <AlertDescription>
                    Your entry slot is approaching. Please be near the designated gate on time.
                </AlertDescription>
            </Alert>
            
            <Card className="max-w-md mx-auto">
                <CardHeader className="text-center bg-primary/10">
                    <CardTitle className="font-headline text-2xl">{activeToken.temple}</CardTitle>
                    <CardDescription>Your Virtual Darshan Pass</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex justify-center mb-6">
                        {qrImage && (
                            <div className="p-4 bg-white rounded-lg shadow-md">
                                <Image 
                                    src={qrImage.imageUrl} 
                                    alt="QR Code" 
                                    width={200}
                                    height={200}
                                    data-ai-hint={qrImage.imageHint}
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 text-sm">
                        <InfoRow icon={<Calendar className="w-4 h-4 text-muted-foreground" />} label="Date" value={activeToken.date} />
                        <InfoRow icon={<Clock className="w-4 h-4 text-muted-foreground" />} label="Time Slot" value={activeToken.timeSlot} />
                        <InfoRow icon={<Users className="w-4 h-4 text-muted-foreground" />} label="Pilgrims" value={activeToken.pilgrims} />
                        <InfoRow icon={<QrCode className="w-4 h-4 text-muted-foreground" />} label="Token ID" value={activeToken.tokenId} />
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
                    Show this QR code at {activeToken.gate} for entry.
                </CardFooter>
            </Card>
        </div>
    )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-muted-foreground">
                {icon}
                {label}
            </span>
            <span className="font-semibold">{value}</span>
        </div>
    )
}
