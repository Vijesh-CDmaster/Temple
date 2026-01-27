"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

export function RoleSwitcher() {
    return (
        <div className="fixed bottom-6 left-6 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-full shadow-lg bg-background">
                        <Users className="h-6 w-6" />
                        <span className="sr-only">Switch Role</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                    <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard">Pilgrim</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/worker">Worker</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/">Role Selection</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
