import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact OKAR - Parle à Notre Équipe",
  description: "Contactez l'équipe OKAR par téléphone, email ou formulaire. Support disponible 7j/7 au Sénégal. Devenez garage partenaire ou posez vos questions sur le passeport automobile.",
  alternates: {
    canonical: "https://shopqr.pro/contact",
  },
  openGraph: {
    title: "Contact OKAR - Notre équipe est là pour vous",
    description: "Besoin d'aide ? Contactez OKAR par téléphone au +221 78 485 82 26 ou par email à contact@okar.sn. Réponse sous 24h.",
    url: "https://shopqr.pro/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
