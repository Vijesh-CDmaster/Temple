"use client";

import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SosButton() {
  const { toast } = useToast();

  const handleSosClick = () => {
    toast({
      title: "🚨 SOS Activated!",
      description: "Help is on the way. Your location has been shared with emergency services. This is a demo feature.",
      variant: "destructive",
      duration: 5000,
    });
  };

  return (
    <Button
      onClick={handleSosClick}
      variant="destructive"
      className="fixed bottom-6 right-6 h-20 w-20 rounded-full shadow-2xl z-50 flex items-center justify-center text-white p-0 animate-pulse"
      aria-label="Emergency SOS"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <Phone className="h-8 w-8" />
        <span className="text-sm font-bold mt-1">SOS</span>
      </div>
    </Button>
  );
}
