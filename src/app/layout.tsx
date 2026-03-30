/**
 * OKAR - Layout Principal
 * 
 * Intègre l'AuthProvider pour la gestion d'authentification globale.
 * L'AuthProvider gère l'état de loading et les redirections de manière centralisée.
 */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthProvider";

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

export const metadata: Metadata = {
  title: "OKAR - Passeport Numérique Automobile",
  description: "Le carnet d'entretien numérique inviolable pour votre véhicule. Vérifiez l'historique de n'importe quel véhicule au Sénégal en un scan QR.",
  keywords: ["OKAR", "passeport automobile", "carnet entretien", "Sénégal", "voiture", "historique véhicule", "QR code"],
  authors: [{ name: "OKAR Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "OKAR - Passeport Numérique Automobile",
    description: "Le carnet d'entretien numérique inviolable pour votre véhicule.",
    type: "website",
    locale: "fr_SN",
  },
  twitter: {
    card: "summary_large_image",
    title: "OKAR - Passeport Numérique Automobile",
    description: "Le carnet d'entretien numérique inviolable pour votre véhicule.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
