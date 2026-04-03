import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Automobile - Conseils, Guides et Actualités Auto Sénégal",
  description: "Blog OKAR : conseils d'entretien automobile, guides d'achat de voiture occasion au Sénégal, actualités du contrôle technique et de l'assurance auto. Articles par des experts.",
  alternates: {
    canonical: "https://shopqr.pro/blog",
  },
  openGraph: {
    title: "Blog OKAR - Conseils & Guides Automobiles au Sénégal",
    description: "Tous les conseils pour l'entretien de votre véhicule, l'achat de voiture d'occasion et les démarches administratives au Sénégal.",
    url: "https://shopqr.pro/blog",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
