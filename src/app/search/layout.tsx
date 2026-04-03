import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérifier un Véhicule - Recherche par Plaque d'Immatriculation",
  description: "Vérifiez l'historique complet d'un véhicule au Sénégal en entrant sa plaque d'immatriculation. Historique d'entretien, kilométrage, assurance et contrôle technique.",
  alternates: {
    canonical: "https://shopqr.pro/search",
  },
  openGraph: {
    title: "Vérifier un Véhicule au Sénégal - Recherche par Plaque",
    description: "Entrez un numéro de plaque pour vérifier l'historique complet d'un véhicule : entretien, kilométrage, assurance, contrôle technique.",
    url: "https://shopqr.pro/search",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
