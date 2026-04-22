import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from '@/context/app-context';
import { Cormorant_Garamond, Syne } from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-heading',
});

import { PWARegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'couplesna',
  description: 'The Boutique Sanctuary for Connected Hearts.',
  manifest: '/manifest.json',
  themeColor: '#070708',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Couplesna',
  },
  icons: {
    icon: '/couplesna_favicon.png',
    shortcut: '/couplesna_favicon.png',
    apple: '/couplesna_favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${syne.variable} dark`} suppressHydrationWarning>
      <body className="font-serif antialiased selection:bg-primary/30" suppressHydrationWarning>
        <AppProvider>
          <PWARegister />
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
