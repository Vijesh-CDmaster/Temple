
"use client";

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from "./_components/sidebar";
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminContext';
import { Skeleton } from '@/components/ui/skeleton';

function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { currentAdmin, isInitialized } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize public route check to avoid recalculation
  const isPublicRoute = useMemo(() => 
    pathname === '/admin/login' || pathname === '/admin/register',
    [pathname]
  );

  // Single redirect effect - only runs when auth state truly changes
  useEffect(() => {
    if (isInitialized && !currentAdmin && !isPublicRoute) {
      router.replace('/admin/login');
    }
  }, [currentAdmin, isInitialized, router, isPublicRoute]);
  
  // Public routes render immediately without sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show skeleton only during initial auth check
  if (!isInitialized) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center w-full">
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

  // If initialized but no admin, just render null while redirecting
  if (!currentAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-dvh bg-muted/40 w-full">
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
