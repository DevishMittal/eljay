import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Eljay - Modern Multi-Page Website",
    template: "%s | Eljay"
  },
  description: "A modern, high-performance multi-page website built with Next.js and Tailwind CSS",
  keywords: ["Next.js", "React", "Tailwind CSS", "Modern Web", "Performance"],
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
    title: 'Eljay - Modern Multi-Page Website',
    description: 'A modern, high-performance multi-page website built with Next.js and Tailwind CSS',
    siteName: 'Eljay',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eljay - Modern Multi-Page Website',
    description: 'A modern, high-performance multi-page website built with Next.js and Tailwind CSS',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
