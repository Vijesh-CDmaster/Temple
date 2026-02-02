
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PilgrimHeader } from "@/components/shared/PilgrimHeader";
import { SosButton } from "@/components/shared/SosButton";
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isInitialized, router]);

  if (!isInitialized || !currentUser) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center">
        <div className="space-y-4 w-full max-w-lg p-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <PilgrimHeader />
      <main className="flex-1">{children}</main>
      <SosButton />
    </div>
  );
}
