import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OurMoments — Romantic Photobox for Couples',
  description: 'Create beautiful photoboxes from your favorite moments together. A romantic photo experience designed for couples.',
  keywords: ['photobox', 'couples', 'romantic', 'photo', 'memories', 'anniversary'],
  openGraph: {
    title: 'OurMoments',
    description: 'Every moment together, beautifully framed.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <MusicPlayer />
        </Providers>
      </body>
    </html>
  );
}
