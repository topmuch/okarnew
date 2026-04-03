import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - OKAR",
  description: "Politique de confidentialité d'OKAR. Protection des données personnelles des utilisateurs du passeport automobile numérique au Sénégal. RGPD et réglementations locales.",
  alternates: {
    canonical: "https://shopqr.pro/confidentialite",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
