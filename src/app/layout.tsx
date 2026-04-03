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
    default: "OKAR - Le Passeport Auto au Sénégal | Vérifiez l'Historique de Tout Véhicule",
    template: "%s | OKAR - Le Passeport Auto au Sénégal",
  },
  description: "OKAR est le #1 du passeport automobile au Sénégal. Vérifiez l'historique d'entretien, le kilométrage, l'assurance et le contrôle technique de tout véhicule en un scan QR. Achetez en confiance.",
  keywords: [
    "OKAR", "passeport automobile Sénégal", "carnet entretien numérique", "vérification véhicule",
    "historique voiture Sénégal", "controle technique valide", "assurance auto Sénégal",
    "achat voiture occasion Dakar", "kilométrage vérifié", "arnaque voiture",
    "garage automobile Dakar", "voiture occasion Sénégal", "QR code auto",
    "rapport véhicule Sénégal", "entretien voiture Afrique", "automobile Sénégal",
    "vérifier plaque immatriculation", "carnet entretien en ligne", "mécanicien certifié Sénégal",
    "assurance voiture Dakar", "contrôle technique auto Afrique de l'Ouest",
  ],
  authors: [{ name: "OKAR Team", url: "https://shopqr.pro/about" }],
  creator: "OKAR",
  publisher: "OKAR",
  
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
  
  // OpenGraph - Optimisé pour le partage WhatsApp/Facebook
  openGraph: {
    title: "OKAR - Le Passeport Auto au Sénégal | Vérifiez Tout Véhicule en 1 Scan",
    description: "Scannez un QR code pour vérifier l'historique complet d'un véhicule au Sénégal : kilométrage, entretien, assurance, contrôle technique. Protégez-vous contre l'arnaque.",
    type: "website",
    locale: "fr_SN",
    url: "https://shopqr.pro",
    siteName: "OKAR",
    images: [
      {
        url: "https://shopqr.pro/og-image.png",
        width: 1200,
        height: 630,
        alt: "OKAR - Passeport Numérique Automobile au Sénégal - Vérifiez l'historique de tout véhicule",
      },
    ],
  },
  
  // Twitter Cards - Optimisé pour l'affichage sur X
  twitter: {
    card: "summary_large_image",
    title: "OKAR - Le Passeport Auto au Sénégal",
    description: "Vérifiez l'historique de tout véhicule au Sénégal en un scan QR. Kilométrage, entretien, assurance, contrôle technique.",
    images: ["https://shopqr.pro/og-image.png"],
  },
  
  // PWA
  manifest: "/manifest.json",
  
  // URL canonique - Éviter le contenu dupliqué
  alternates: {
    canonical: "https://shopqr.pro",
  },
  
  // Directives robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Catégorie et vérification
  category: "automotive",
  verification: {
    google: "89137c0360e6b581",
  },
  metadataBase: new URL("https://shopqr.pro"),
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
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="89137c0360e6b581" />
        
        {/* Geo Tags pour référencement local Sénégal */}
        <meta name="geo.region" content="SN" />
        <meta name="geo.placename" content="Dakar, Sénégal" />
        <meta name="geo.position" content="14.6937;-17.4441" />
        <meta name="ICBM" content="14.6937, -17.4441" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://shopqr.pro" />
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
