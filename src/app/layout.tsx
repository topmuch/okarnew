/**
 * CleanCheck - Layout Principal
 *
 * Plateforme SaaS pour les sociétés de nettoyage :
 * QR codes dynamiques, checklists interactives, Score Qualité automatisé
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Police principale - Inter (moderne, lisible)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "CleanCheck — Digitalisez vos Interventions de Nettoyage | QR Codes, Checklists & Score Qualité",
    template: "%s | CleanCheck — SaaS Nettoyage",
  },
  description:
    "CleanCheck est la plateforme SaaS #1 pour les sociétés de nettoyage. Générez des QR codes dynamiques, suivez vos interventions en temps réel via des checklists interactives, et automatisez votre Score Qualité client. Essai gratuit.",
  keywords: [
    "CleanCheck",
    "logiciel nettoyage",
    "SaaS nettoyage professionnel",
    "gestion interventions nettoyage",
    "QR code nettoyage",
    "checklist ménage",
    "score qualité nettoyage",
    "digitalisation nettoyage",
    "application ménage",
    "suivi interventions",
    "tracing nettoyage",
    "audit qualité nettoyage",
    "entreprise de nettoyage",
    "gestion agents ménage",
    "rapport client nettoyage",
    "notation service nettoyage",
    "cleaning management software",
    "cleaning checklist app",
    "quality score cleaning",
  ],
  authors: [{ name: "CleanCheck Team" }],
  creator: "CleanCheck",
  publisher: "CleanCheck",

  openGraph: {
    title: "CleanCheck — Digitalisez vos Interventions de Nettoyage en 1 Scan QR",
    description:
      "QR codes dynamiques, checklists interactives, Score Qualité automatisé. La plateforme tout-en-un pour les sociétés de nettoyage professionnelles.",
    type: "website",
    locale: "fr_FR",
    siteName: "CleanCheck",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CleanCheck — Plateforme SaaS pour les sociétés de nettoyage",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CleanCheck — SaaS Nettoyage Professionnel",
    description:
      "Digitalisez vos interventions : QR codes, checklists, Score Qualité. Essai gratuit.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://cleancheck.app",
  },

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

  category: "business",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://cleancheck.app"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
