"use client";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Ticket, Clock, Calendar, Users, QrCode, ArrowRight, User, Phone, Accessibility, Badge } from "lucide-react";
import { useToken, Token } from "@/context/TokenContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MyTokensPage() {
    const { activeTokens } = useToken();
    

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">My Tokens</h1>
                <p className="text-muted-foreground">Your active and upcoming virtual queue passes</p>
            </div>

            {activeTokens && activeTokens.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {activeTokens.map(token => (
                        <TokenCard key={token.tokenId} token={token} />
                    ))}
                </div>
            ) : (
                <Card className="max-w-md mx-auto flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                    <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground">No Active Tokens</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-6">You have not booked any virtual queue tokens yet.</p>
                    <Button asChild>
                        <Link href="/dashboard/virtual-queue">
                            Book a Token <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </Card>
            )}
        </div>
    )
}

function TokenCard({ token }: { token: Token }) {
    const qrImage = PlaceHolderImages.find(p => p.id === "qr-code");

    return (
        <Card className="flex flex-col">
            <CardHeader className="text-center bg-primary/10">
                <CardTitle className="font-headline text-2xl">{token.temple}</CardTitle>
                <CardDescription>Virtual Darshan Pass</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
                <div className="flex justify-center mb-6">
                    {qrImage && (
                        <div className="p-2 bg-white rounded-lg shadow-md">
                            <Image 
                                src={qrImage.imageUrl} 
                                alt="QR Code" 
                                width={150}
                                height={150}
                                data-ai-hint={qrImage.imageHint}
                            />
                        </div>
                    )}
                </div>
                <div className="space-y-4 text-sm mb-4">
                    <InfoRow icon={<User className="w-4 h-4 text-muted-foreground" />} label="Name" value={token.pilgrim.name} />
                     <InfoRow icon={<Badge className="w-4 h-4 text-muted-foreground" />} label="Age" value={String(token.pilgrim.age)} />
                    <InfoRow icon={<Phone className="w-4 h-4 text-muted-foreground" />} label="Phone" value={token.pilgrim.phone} />
                    <InfoRow icon={<Calendar className="w-4 h-4 text-muted-foreground" />} label="Date" value={token.date} />
                    <InfoRow icon={<Clock className="w-4 h-4 text-muted-foreground" />} label="Time Slot" value={token.timeSlot} />
                </div>
                 {token.pilgrim.isDifferentlyAbled && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 text-green-800 text-xs font-semibold mb-4">
                        <Accessibility className="w-4 h-4" />
                        <span>Priority Access Enabled</span>
                    </div>
                )}
                <InfoRow icon={<QrCode className="w-4 h-4 text-muted-foreground" />} label="Token ID" value={token.tokenId} />
            </CardContent>
            <CardFooter className="bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
                Show this QR code at {token.gate} for entry.
            </CardFooter>
        </Card>
    );
}


function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-muted-foreground">
                {icon}
                {label}
            </span>
            <span className="font-semibold text-right">{value}</span>
        </div>
    )
}
