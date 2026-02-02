
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, ListChecks, Users, Siren, Map, Menu, Home, Shield, HeartPulse, Search, ParkingCircle, Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWorkerAuth } from "@/context/WorkerContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const allNavLinks = [
  { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard, groups: ["all"] },
  { href: "/worker/dashboard/crowd-control", label: "Crowd Control", icon: Users, groups: ["Security (Inside Temple)", "Security (Parking Area)"] },
  { href: "#", label: "Barricades", icon: Shield, groups: ["Security (Inside Temple)", "Security (Parking Area)"] },
  { href: "/worker/dashboard/emergency-alerts", label: "Emergency Alerts", icon: Siren, groups: ["all"] },
  { href: "#", label: "Patient Care", icon: HeartPulse, groups: ["Public Help & Safety (Parking Area)"] },
  { href: "#", label: "Assistance Tasks", icon: ListChecks, groups: ["Guidance (Inside Temple)", "Transport Assistance (Parking Area)"] },
  { href: "#", label: "Queue Flow", icon: Users, groups: ["Parking Control & Traffic Flow"] },
  { href: "/worker/dashboard/lost-and-found", label: "Lost and Found", icon: Search, groups: ["Guidance (Inside Temple)"] },
  { href: "#", label: "Parking Management", icon: ParkingCircle, groups: ["Parking Control & Traffic Flow"] },
  { href: "#", label: "Fire & Safety", icon: Flame, groups: ["Public Help & Safety (Parking Area)"] },
  { href: "#", label: "Zone Overview", icon: Map, groups: ["Parking Control & Traffic Flow"] },
];

export function WorkerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentWorker, logout } = useWorkerAuth();

  useEffect(() => {
    if (!currentWorker) {
      router.push("/worker");
    }
  }, [currentWorker, router]);

  if (!currentWorker) {
    return null; // Don't render anything if there's no worker, while redirecting.
  }

  const handleLogout = () => {
    logout();
    router.push("/worker");
  };

  const hasAccess = (allowedGroups: string[]) => {
    if (allowedGroups.includes("all")) return true;
    if (currentWorker.role.includes('Supervisor')) return true;
    return allowedGroups.includes(currentWorker.roleGroup);
  };
  
  const navLinks = allNavLinks.filter(link => hasAccess(link.groups));

  const avatarFallback = currentWorker.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  const navContent = (
    <>
        <div className="flex h-16 shrink-0 items-center border-b px-4 lg:px-6">
            <Link href="/worker/dashboard" className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">Worker App</span>
            </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
            <div className="px-4 mb-4 border-b pb-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{currentWorker.name}</p>
                        <p className="text-xs text-muted-foreground">{currentWorker.role}</p>
                    </div>
                </div>
            </div>
            <nav>
                <ul className="space-y-1 px-2 lg:px-4">
                {navLinks.map((link) => (
                    <li key={link.label}>
                    <Link
                        href={link.href}
                        className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
                        pathname === link.href && "bg-primary/10 text-primary font-semibold"
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </nav>
        </div>
        <div className="mt-auto border-t p-4 space-y-2">
             <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Main Page
                </Link>
            </Button>
        </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        {navContent}
      </aside>
       <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                {navContent}
            </SheetContent>
        </Sheet>
        <Link href="/worker/dashboard" className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">Worker</span>
        </Link>
      </header>
    </>
  );
}
