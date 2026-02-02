
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from "./_components/sidebar";
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminContext';
import { Skeleton } from '@/components/ui/skeleton';

function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { currentAdmin, isInitialized } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !currentAdmin) {
      router.push('/admin/login');
    }
  }, [currentAdmin, isInitialized, router]);

  if (!isInitialized || !currentAdmin) {
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
    <div className="flex min-h-dvh bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
        <AdminProtectedLayout>{children}</AdminProtectedLayout>
    </AdminAuthProvider>
  );
}
