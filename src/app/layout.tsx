import type { Metadata } from "next";
import "./globals.css";
import { TaskProvider } from '@/contexts/TaskContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';


export const metadata: Metadata = {
  title: {
    default: "Eljay - Hearing Care Management",
    template: "%s | Eljay"
  },
  description: "Modern hearing care management system for audiologists and healthcare professionals",
  keywords: ["hearing care", "audiologist", "healthcare", "management", "appointments"],
  authors: [{ name: "Eljay Team" }],
  creator: "Eljay",
  publisher: "Eljay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eljay.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eljay.com',
    title: 'Eljay - Hearing Care Management',
    description: 'Modern hearing care management system for audiologists and healthcare professionals',
    siteName: 'Eljay',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eljay - Hearing Care Management',
    description: 'Modern hearing care management system for audiologists and healthcare professionals',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="antialiased min-h-screen bg-background text-foreground"
      >
        <AuthProvider>
          <TaskProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
