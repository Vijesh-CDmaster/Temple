
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkerSidebar } from "./_components/sidebar";
import { useWorkerAuth } from '@/context/WorkerContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentWorker, isInitialized } = useWorkerAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !currentWorker) {
      router.push('/worker');
    }
  }, [currentWorker, isInitialized, router]);

  if (!isInitialized || !currentWorker) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center">
            <div className="w-full flex">
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
        </div>
    );
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
