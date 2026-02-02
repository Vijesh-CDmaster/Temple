
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bell, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { TempleIcon, UserIcon } from "./icons";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/live-status", label: "Live Status" },
  { href: "/dashboard/temples", label: "Temples" },
  { href: "/dashboard/virtual-queue", label: "Virtual Queue" },
  { href: "/dashboard/my-tokens", label: "My Tokens" },
  { href: "/dashboard/history", label: "History" },
];

export function PilgrimHeader() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const mobileNav = (
    <SheetContent side="left" className="pr-0">
      <div className="flex justify-between items-center p-4 border-b">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <TempleIcon className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">
            TempleConnect
            </span>
        </Link>
        <SheetClose asChild>
            <Button variant="ghost" size="icon">
                <X className="h-6 w-6" />
            </Button>
        </SheetClose>
      </div>
      <div className="mt-6">
        {currentUser ? (
           <nav className="grid gap-2 p-4">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.href}>
                  <Link
                      href={link.href}
                      className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                      )}
                  >
                      {link.label}
                  </Link>
              </SheetClose>
            ))}
            <SheetClose asChild>
                <Link href="/dashboard/profile" className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-lg font-medium transition-colors hover:text-primary",
                      pathname === "/dashboard/profile" ? "text-primary bg-primary/10" : "text-muted-foreground"
                      )}>Profile</Link>
            </SheetClose>
             <SheetClose asChild>
                <Button variant="ghost" onClick={logout} className="flex justify-start text-lg font-medium text-muted-foreground w-full px-3 py-2">
                  <LogOut className="mr-3 h-5 w-5" /> Logout
                </Button>
            </SheetClose>
          </nav>
        ) : (
          <div className="p-4 space-y-4">
            <Button asChild className="w-full" size="lg"><Link href="/login">Login</Link></Button>
            <Button asChild className="w-full" size="lg" variant="outline"><Link href="/register">Register</Link></Button>
          </div>
        )}
      </div>
    </SheetContent>
  );

  const desktopNav = currentUser ? (
    <>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors hover:text-primary",
              pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" asChild className={cn(pathname === "/dashboard/profile" && "bg-accent")}>
              <Link href="/dashboard/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
              </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
          </Button>
      </div>
    </>
  ) : (
    <div className="flex flex-1 items-center justify-end space-x-2">
      <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
      <Button asChild><Link href="/register">Register</Link></Button>
    </div>
  );


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            {mobileNav}
          </Sheet>
        </div>

        <div className="mr-4 hidden md:flex items-center flex-1">
          <Link href={currentUser ? "/dashboard" : "/"} className="mr-6 flex items-center space-x-2">
            <TempleIcon className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              TempleConnect
            </span>
          </Link>
          {desktopNav}
        </div>
      </div>
    </header>
  );
}
