import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { TokenProvider } from '@/context/TokenContext';
import { AuthProvider } from '@/context/AuthContext';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'TempleConnect',
  description: 'Smart Pilgrimage Crowd Management System',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
        <AuthProvider>
          <TokenProvider>
            <Suspense fallback={null}>
              <div className="relative flex min-h-dvh flex-col">
                  {children}
              </div>
            </Suspense>
            <Toaster />
          </TokenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
