"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorker } from "@/context/WorkerContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { workerRoles } from "@/lib/app-data";
import { Briefcase, ArrowRight } from "lucide-react";

export default function WorkerLoginPage() {
    const router = useRouter();
    const { setWorker, roles } = useWorker();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleLogin = () => {
        if (selectedRole) {
            const role = roles.find(r => r.name === selectedRole);
            if (role) {
                setWorker(role);
                router.push("/worker/dashboard");
            }
        }
    };

    return (
        <div className="w-full flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                     <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Briefcase className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Worker Login</CardTitle>
                    <CardDescription>Please select your assigned role to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Select onValueChange={setSelectedRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your role..." />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleLogin} disabled={!selectedRole} className="w-full" size="lg">
                        Login <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
