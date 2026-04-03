import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - OKAR",
  description: "Consultez les conditions générales d'utilisation d'OKAR, le passeport numérique automobile au Sénégal. Droits, obligations et fonctionnement du service.",
  alternates: {
    canonical: "https://shopqr.pro/cgu",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CguLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
