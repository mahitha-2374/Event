import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from '@/components/layout/app-providers';

export const metadata: Metadata = {
  title: 'Eventide Calendar',
  description: 'A smart calendar application with AI scheduling assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">{/* Apply dark theme by default */}
      <body className={`${GeistSans.variable} antialiased`}> {/* Use GeistSans.variable directly */}
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
