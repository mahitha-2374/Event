import type { Metadata } from 'next';
import { GeistSans } from 'next/font/google'; // Corrected import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from '@/components/layout/app-providers';

const geistSans = GeistSans({ // Corrected usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist_Mono as it's not explicitly used in the prompt and GeistSans is preferred for UI

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
    <html lang="en" className="dark"> {/* Apply dark theme by default */}
      <body className={`${geistSans.variable} antialiased`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
