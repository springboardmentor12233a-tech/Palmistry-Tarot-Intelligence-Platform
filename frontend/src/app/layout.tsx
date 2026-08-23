import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import StarfieldBackground from '@/components/cosmic/StarfieldBackground';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import NotificationToast from '@/components/notifications/NotificationToast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Palmistry & Tarot Intelligence Platform · Cosmic Oracle',
  description:
    'Synthesizing advanced biometric palm-line computer vision with archetypal Hermetic tarot intelligence into unified, actionable soul guidance.',
  keywords: [
    'Palmistry AI',
    'Tarot Intelligence',
    'Cosmic Oracle',
    'Biometric Palm Reading',
    'Archetypal Psychology',
    'Life Trend Forecasting',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} dark scroll-smooth`}>
      <body className="bg-midnight text-cosmic-text font-sans antialiased relative min-h-screen flex flex-col selection:bg-violet selection:text-white">
        {/* Living Cosmic Starfield Background */}
        <StarfieldBackground />

        {/* Global Providers */}
        <AuthProvider>
          <NotificationProvider>
            {/* Header / Cosmic Navbar */}
            <Navbar />

            {/* Main Application Viewport */}
            <main className="flex-1 relative z-10 flex flex-col">{children}</main>

            {/* In-app Toast Banner */}
            <NotificationToast />

            {/* Cosmic Footer */}
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
