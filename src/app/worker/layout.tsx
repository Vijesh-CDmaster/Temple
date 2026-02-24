
"use client";

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { WorkerSidebar } from "./dashboard/_components/sidebar";
import { WorkerAuthProvider, useWorkerAuth } from "@/context/WorkerContext";
import { Skeleton } from '@/components/ui/skeleton';

function WorkerProtectedLayout({ children }: { children: React.ReactNode }) {
  const { currentWorker, isInitialized } = useWorkerAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize public route check to avoid recalculation
  const isPublicRoute = useMemo(() => 
    pathname === '/worker' || pathname === '/worker/register',
    [pathname]
  );

  // Single redirect effect - only runs when auth state truly changes
  useEffect(() => {
    if (isInitialized && !currentWorker && !isPublicRoute) {
      router.replace('/worker');
    }
  }, [currentWorker, isInitialized, router, isPublicRoute]);

  // Public routes render immediately without sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show skeleton only during initial auth check
  if (!isInitialized) {
    return (
      <div className="flex min-h-dvh w-full">
        <div className="hidden md:flex w-64">
          <div className="p-4 space-y-2 w-full">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // If initialized but no worker, just render null while redirecting
  if (!currentWorker) {
    return null;
  }

  return (
    <>
      <WorkerSidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}


export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkerAuthProvider>
      <div className="flex min-h-dvh bg-muted/40 w-full">
        <WorkerProtectedLayout>{children}</WorkerProtectedLayout>
      </div>
    </WorkerAuthProvider>
  );
}
