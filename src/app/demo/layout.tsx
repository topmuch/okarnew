import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Démo OKAR - Découvrez le Passeport Automobile Numérique",
  description: "Testez OKAR en conditions réelles. Découvrez comment fonctionne le passeport automobile numérique : scan QR, historique d'entretien, score de confiance et rapport véhicule.",
  alternates: {
    canonical: "https://shopqr.pro/demo",
  },
  openGraph: {
    title: "Démo OKAR - Testez le Passeport Auto Numérique",
    description: "Essayez OKAR gratuitement. Scannez un QR code, consultez un historique d'entretien et découvrez le rapport véhicule complet.",
    url: "https://shopqr.pro/demo",
    type: "website",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
