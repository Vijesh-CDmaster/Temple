"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, HeartPulse, Shield, Search, Info, Siren } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const emergencyServices = [
    { name: "Medical Emergency", icon: HeartPulse, team: "Medical Team" },
    { name: "Security Assistance", icon: Shield, team: "Security Team" },
    { name: "Lost & Found", icon: Search, team: "Help Desk" },
    { name: "General Inquiry", icon: Info, team: "Support Staff" },
];

export function SosButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleServiceRequest = (service: { name: string; team: string }) => {
    setOpen(false);
    toast({
      title: `🚨 ${service.name} Requested!`,
      description: `The ${service.team} has been notified and is on the way. Your location has been shared. This is a demo feature.`,
      variant: "destructive",
      duration: 5000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button
                variant="destructive"
                className="fixed bottom-6 right-6 h-20 w-20 rounded-full shadow-2xl z-50 flex items-center justify-center text-white p-0 animate-pulse"
                aria-label="Emergency SOS"
            >
                <div className="flex flex-col items-center justify-center text-center">
                    <Phone className="h-8 w-8" />
                    <span className="text-sm font-bold mt-1">SOS</span>
                </div>
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Siren className="text-destructive"/> Emergency Services</DialogTitle>
                <DialogDescription>
                    Please select the type of assistance you require. A dedicated team will be dispatched to your location.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                {emergencyServices.map((service) => (
                    <Button
                        key={service.name}
                        variant="outline"
                        className="h-24 text-base flex-col gap-2"
                        onClick={() => handleServiceRequest(service)}
                    >
                        <service.icon className="h-8 w-8 text-primary" />
                        <span>{service.name}</span>
                    </Button>
                ))}
            </div>
        </DialogContent>
    </Dialog>
  );
}
