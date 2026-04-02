/**
 * OKAR - Layout Principal
 * 
 * Intègre l'AuthProvider pour la gestion d'authentification globale.
 * Configuration PWA avec manifest, theme-color, et InstallPrompt.
 * Mobile First avec navigation en bas sur mobile.
 */

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthProvider";
import { InstallPrompt } from "@/components/okar/InstallPrompt";
import { MobileNav } from "@/components/okar/MobileNav";

// Police principale - Inter (moderne, lisible)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Police décorative - Playfair Display (titres élégants)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff6201" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "OKAR - Passeport Numérique Automobile",
    template: "%s | OKAR",
  },
  description: "Le carnet d'entretien numérique inviolable pour votre véhicule. Vérifiez l'historique de n'importe quel véhicule au Sénégal en un scan QR.",
  keywords: ["OKAR", "passeport automobile", "carnet entretien", "Sénégal", "voiture", "historique véhicule", "QR code"],
  authors: [{ name: "OKAR Team" }],
  
  // Icons
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/icon-512x512.png", color: "#ff6201" },
    ],
  },
  
  // OpenGraph
  openGraph: {
    title: "OKAR - Passeport Numérique Automobile",
    description: "Le carnet d'entretien numérique inviolable pour votre véhicule.",
    type: "website",
    locale: "fr_SN",
    siteName: "OKAR",
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "OKAR - Passeport Numérique Automobile",
    description: "Le carnet d'entretien numérique inviolable pour votre véhicule.",
  },
  
  // PWA
  manifest: "/manifest.json",
  
  // Autres
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OKAR" />
        <meta name="application-name" content="OKAR" />
        <meta name="msapplication-TileColor" content="#ff6201" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
        <InstallPrompt />
        <MobileNav />
      </body>
    </html>
  );
}
