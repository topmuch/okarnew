import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rapport Véhicule Complet - 1 000 FCFA | OKAR",
  description: "Obtenez le rapport complet d'un véhicule pour 1 000 FCFA. Historique d'entretien détaillé, kilométrage vérifié, score de confiance, statut assurance et contrôle technique.",
  alternates: {
    canonical: "https://shopqr.pro/report",
  },
  openGraph: {
    title: "Rapport Véhicule Complet - 1 000 FCFA | OKAR",
    description: "Rapport complet incluant historique d'entretien, kilométrage vérifié, assurance, contrôle technique et estimation de la valeur. Seulement 1 000 FCFA.",
    url: "https://shopqr.pro/report",
    type: "website",
  },
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
