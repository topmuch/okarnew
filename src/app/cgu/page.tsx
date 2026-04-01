/**
 * OKAR - Page CGU (Conditions Générales d'Utilisation)
 * 
 * Mentions légales et CGU
 * Design cohérent avec la landing page
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  FileText,
  Scale,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

export default function CGUPage() {
  const sections = [
    {
      title: '1. Objet',
      content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme OKAR, un service de gestion automobile numérique permettant le suivi des véhicules et l'enregistrement des interventions techniques. En utilisant OKAR, vous acceptez sans réserve les présentes conditions.`
    },
    {
      title: '2. Définitions',
      content: `• Utilisateur : toute personne physique ou morale utilisant la plateforme OKAR.
• Propriétaire : utilisateur inscrit en tant que propriétaire d'un ou plusieurs véhicules.
• Garage : professionnel de l'automobile inscrit sur la plateforme pour enregistrer des interventions.
• QR Code OKAR : identifiant unique associé à un véhicule permettant son suivi.
• Intervention : toute opération technique réalisée sur un véhicule (réparation, entretien, contrôle technique, etc.).`
    },
    {
      title: '3. Inscription et Compte',
      content: `L'inscription à OKAR est gratuite. Chaque utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. Le compte est personnel et ne peut être cédé. OKAR se réserve le droit de refuser ou de suspendre un compte en cas de non-respect des CGU. Les garages doivent fournir des informations professionnelles vérifiables.`
    },
    {
      title: '4. Services Proposés',
      content: `OKAR propose les services suivants :
• Carnet d'entretien numérique pour les véhicules
• Génération et gestion de QR codes d'identification
• Enregistrement et suivi des interventions techniques
• Recherche et consultation de l'historique des véhicules
• Mise en relation entre propriétaires et garages partenaires
• Rapports détaillés sur l'état des véhicules (service premium)`
    },
    {
      title: '5. Responsabilités des Utilisateurs',
      content: `Les utilisateurs s'engagent à :
• Fournir des informations exactes et sincères
• Ne pas créer de faux comptes ou de fausses identités
• Respecter les droits de propriété intellectuelle d'OKAR
• Utiliser la plateforme de manière légale et éthique
• Signaler tout contenu inapproprié ou fraude suspectée
Les garages s'engagent à enregistrer uniquement les interventions réellement effectuées.`
    },
    {
      title: '6. Responsabilité d\'OKAR',
      content: `OKAR s'efforce d'assurer la disponibilité et la sécurité de la plateforme. Cependant, OKAR ne peut être tenu responsable des dommages indirects liés à l'utilisation du service. OKAR ne garantit pas l'exactitude des informations fournies par les utilisateurs. Le service peut être temporairement indisponible pour maintenance.`
    },
    {
      title: '7. Protection des Données',
      content: `OKAR s'engage à protéger la vie privée des utilisateurs conformément à la réglementation sénégalaise et internationale. Les données personnelles sont collectées uniquement pour les besoins du service. Les utilisateurs disposent d'un droit d'accès, de rectification et de suppression de leurs données. Pour plus d'informations, consultez notre Politique de Confidentialité.`
    },
    {
      title: '8. Propriété Intellectuelle',
      content: `L'ensemble des éléments constituant la plateforme OKAR (logo, design, textes, images, code source) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation ou utilisation non autorisée est strictement interdite. Les QR codes OKAR restent la propriété d'OKAR.`
    },
    {
      title: '9. Tarification',
      content: `L'inscription et l'utilisation de base d'OKAR sont gratuites. Certains services premium (rapports détaillés, fonctionnalités avancées) peuvent être facturés. Les tarifs sont affichés avant toute transaction et peuvent être modifiés avec préavis d'un mois.`
    },
    {
      title: '10. Résiliation',
      content: `Chaque utilisateur peut supprimer son compte à tout moment depuis les paramètres de son profil. OKAR se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des CGU, sans préjudice de dommages et intérêts éventuels.`
    },
    {
      title: '11. Modifications des CGU',
      content: `OKAR se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés de toute modification substantielle par email ou notification dans l'application. La continuation de l'utilisation du service vaut acceptation des nouvelles conditions.`
    },
    {
      title: '12. Droit Applicable',
      content: `Les présentes CGU sont régies par le droit sénégalais. Tout litige relatif à l'interprétation ou à l'exécution des présentes conditions sera soumis aux tribunaux compétents de Dakar, après tentative de résolution amiable.`
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>
          <BackToHomeButton />
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-12">
        {/* Titre */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 text-amber-700 border border-amber-200/50 px-4 py-2 rounded-full">
            <Scale className="h-4 w-4 mr-2" />
            Mentions Légales
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : Janvier 2024
          </p>
        </div>

        {/* Contenu */}
        <Card className="max-w-4xl mx-auto border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Introduction */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 mb-8">
              <Shield className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-gray-700 leading-relaxed">
                Bienvenue sur OKAR. Avant d'utiliser notre plateforme, veuillez lire attentivement 
                ces conditions générales d'utilisation. Elles définissent le cadre juridique de votre 
                utilisation de nos services.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="scroll-mt-24" id={`section-${index + 1}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line pl-11">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Acceptation */}
            <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Acceptation des conditions</h3>
                  <p className="text-gray-600 text-sm">
                    En utilisant OKAR, vous reconnaissez avoir lu, compris et accepté les présentes 
                    Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, 
                    veuillez ne pas utiliser notre plateforme.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-3">
                Une question sur nos conditions d'utilisation ?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Contactez-nous
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="container mx-auto px-4 lg:px-8 py-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 OKAR - Le passeport numérique automobile au Sénégal 🇸🇳
          </p>
        </div>
      </footer>
    </div>
  )
}
