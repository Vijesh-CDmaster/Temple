"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, ListChecks, Users, Siren, Map, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/worker", label: "Dashboard", icon: LayoutDashboard },
  { href: "#", label: "My Tasks", icon: ListChecks },
  { href: "#", label: "Crowd Monitoring", icon: Users },
  { href: "#", label: "Emergency Alerts", icon: Siren },
  { href: "#", label: "Navigation Map", icon: Map },
];

export function WorkerSidebar() {
  const pathname = usePathname();

  const navContent = (
    <>
        <div className="flex h-16 shrink-0 items-center border-b px-4 lg:px-6">
            <Link href="/worker" className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">Worker App</span>
            </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
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
        <div className="mt-auto border-t p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
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
        <Link href="/worker" className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">Worker</span>
        </Link>
      </header>
    </>
  );
}
