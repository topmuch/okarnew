import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos d'OKAR - Notre Mission pour l'Automobile au Sénégal",
  description: "Découvrez OKAR, le passeport numérique automobile #1 au Sénégal. Notre mission : créer un écosystème de confiance pour les propriétaires et garages automobiles. Transparence, innovation, excellence.",
  alternates: {
    canonical: "https://shopqr.pro/about",
  },
  openGraph: {
    title: "À propos d'OKAR - Le Passeport Auto au Sénégal",
    description: "Découvrez OKAR, la plateforme qui révolutionne la gestion automobile au Sénégal. Plus de 50 000 véhicules suivis et 500 garages partenaires.",
    url: "https://shopqr.pro/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
