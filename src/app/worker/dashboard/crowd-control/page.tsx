import { CrowdCounter } from "@/components/shared/CrowdCounter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function CrowdControlPage() {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Crowd Control</h1>
                <p className="text-muted-foreground">Monitor live feeds and manage zone barricades.</p>
            </div>

            <div className="mb-8">
                <CrowdCounter />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Shield /> Barricade Management</CardTitle>
                    <CardDescription>Control crowd flow by managing barricades in your assigned zone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Zone A - Entry Point</h4>
                            <p className="text-sm text-muted-foreground">Status: Open</p>
                        </div>
                        <div className="space-x-2">
                            <Button variant="outline">Restrict Entry</Button>
                            <Button variant="destructive">Close Gate</Button>
                        </div>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Zone B - Main Courtyard</h4>
                            <p className="text-sm text-muted-foreground">Status: Restricted Flow</p>
                        </div>
                         <div className="space-x-2">
                            <Button>Allow Full Entry</Button>
                            <Button variant="destructive">Close Gate</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
