import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import "./globals.css";

const inter = Inter({
  subsets: ['latin']
});


export const metadata: Metadata = {
  title: 'Система Контроля - Управление строительными объектами',
  description: 'PWA приложение для контроля и управления строительными объектами',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Система Контроля'
  },
  openGraph: {
    title: 'Система Контроля',
    description: 'PWA приложение для контроля строительных объектов',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="manifest" href="/manifest.json " />


        <meta name="theme-color" content="#3B82F6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-title" content="Система Контроля" />
        <link rel="touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%233B82F6' d='M20 80h60V40L50 20 20 40v40z'/%3E%3Cpath fill='%23ffffff' d='M30 70h10V50h20v20h10V45L50 30 30 45v25z'/%3E%3C/svg%3E" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body> 
    </html>
  );
}
