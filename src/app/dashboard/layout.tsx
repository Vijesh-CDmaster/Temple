
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PilgrimHeader } from "@/components/shared/PilgrimHeader";
import { SosButton } from "@/components/shared/SosButton";
import { useAuth } from '@/context/AuthContext';

// Lightweight loading component
function LoadingSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-lg p-8">
        <div className="h-16 w-full bg-muted rounded" />
        <div className="h-64 w-full bg-muted rounded" />
        <div className="h-32 w-full bg-muted rounded" />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isInitialized } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isInitialized, router]);

  // Always show loading on server and initial client render to prevent hydration mismatch
  if (!mounted || !isInitialized || !currentUser) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <PilgrimHeader />
      <main className="flex-1">{children}</main>
      <SosButton />
    </div>
  );
}
