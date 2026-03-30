/**
 * OKAR - Page Politique de Confidentialité
 * 
 * Protection des données personnelles
 * Design cohérent avec la landing page
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Car,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  AlertCircle,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

export default function ConfidentialitePage() {
  const dataTypes = [
    {
      icon: UserCheck,
      title: 'Données d\'identification',
      examples: 'Nom, prénom, email, téléphone',
      purpose: 'Création et gestion de votre compte',
    },
    {
      icon: Car,
      title: 'Données véhicules',
      examples: 'Plaque d\'immatriculation, marque, modèle, kilométrage',
      purpose: 'Suivi de l\'historique et génération du carnet numérique',
    },
    {
      icon: Database,
      title: 'Données techniques',
      examples: 'Interventions, photos, rapports',
      purpose: 'Documentation et traçabilité des opérations',
    },
    {
      icon: Eye,
      title: 'Données de connexion',
      examples: 'Adresse IP, logs, appareils utilisés',
      purpose: 'Sécurité et détection des anomalies',
    },
  ]

  const rights = [
    { title: 'Droit d\'accès', description: 'Consulter toutes vos données personnelles' },
    { title: 'Droit de rectification', description: 'Corriger vos informations inexactes' },
    { title: 'Droit de suppression', description: 'Demander la suppression de vos données' },
    { title: 'Droit d\'opposition', description: 'Refuser certains traitements de données' },
    { title: 'Droit à la portabilité', description: 'Récupérer vos données dans un format standard' },
    { title: 'Droit de limitation', description: 'Limiter le traitement de vos données' },
  ]

  const sections = [
    {
      title: '1. Qui sommes-nous ?',
      content: `OKAR est une plateforme de gestion automobile numérique basée au Sénégal. Nous sommes le responsable du traitement des données collectées via notre site web et notre application mobile. Vous pouvez nous contacter à tout moment à l'adresse : contact@okar.sn`
    },
    {
      title: '2. Données collectées',
      content: `Nous collectons les données que vous nous fournissez directement (inscription, profil, véhicules) et celles collectées automatiquement (logs de connexion, cookies). Les données sont collectées uniquement pour les finalités décrites dans cette politique.`
    },
    {
      title: '3. Finalités du traitement',
      content: `Vos données sont utilisées pour :
• Fournir nos services de suivi automobile
• Gérer votre compte utilisateur
• Vous envoyer des notifications et alertes
• Améliorer nos services et développer de nouvelles fonctionnalités
• Assurer la sécurité de la plateforme
• Respecter nos obligations légales`
    },
    {
      title: '4. Base légale du traitement',
      content: `Le traitement de vos données repose sur :
• Votre consentement (inscription, cookies non-essentiels)
• L'exécution du contrat (fourniture des services)
• Nos intérêts légitimes (amélioration des services, sécurité)
• Nos obligations légales (conservation des données)`
    },
    {
      title: '5. Conservation des données',
      content: `Vos données sont conservées pendant la durée de votre compte, et selon les durées légales pour les données comptables et techniques. Après suppression de votre compte, les données sont anonymisées ou supprimées dans un délai de 90 jours, sauf obligation légale de conservation.`
    },
    {
      title: '6. Partage des données',
      content: `Vos données peuvent être partagées avec :
• Les garages partenaires (uniquement les données nécessaires aux interventions)
• Nos prestataires techniques (hébergement, paiement)
• Les autorités compétentes (si requis par la loi)
Nous ne vendons jamais vos données à des tiers.`
    },
    {
      title: '7. Sécurité des données',
      content: `Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement SSL/TLS, accès restreint, surveillance des systèmes, sauvegardes régulières. Cependant, aucun système n'est infaillible et nous vous recommandons de protéger vos identifiants.`
    },
    {
      title: '8. Cookies',
      content: `Notre site utilise des cookies pour :
• Assurer le fonctionnement du site (cookies essentiels)
• Mémoriser vos préférences (cookies de préférence)
• Analyser l'utilisation du site (cookies analytiques)
Vous pouvez gérer vos préférences de cookies via notre bannière de consentement.`
    },
    {
      title: '9. Vos droits',
      content: `Conformément à la réglementation applicable, vous disposez de plusieurs droits sur vos données personnelles. Pour exercer ces droits, contactez-nous à contact@okar.sn avec pour objet "Exercice de droits RGPD".`
    },
    {
      title: '10. Modifications',
      content: `Cette politique peut être mise à jour périodiquement. Les modifications significatives vous seront notifiées par email ou via la plateforme. La date de dernière mise à jour est indiquée en haut de cette page.`
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
          <Badge className="mb-4 bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 text-sky-700 border border-sky-200/50 px-4 py-2 rounded-full">
            <Lock className="h-4 w-4 mr-2" />
            Protection des Données
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : Janvier 2024
          </p>
        </div>

        {/* Types de données */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
          {dataTypes.map((type, index) => (
            <Card key={index} className="border-0 shadow-xl shadow-gray-200/40 bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{type.examples}</p>
                <p className="text-xs text-sky-600">{type.purpose}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contenu principal */}
        <Card className="max-w-4xl mx-auto border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden mb-12">
          <CardContent className="p-8 md:p-12">
            {/* Introduction */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-100 mb-8">
              <Shield className="h-6 w-6 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-gray-700 leading-relaxed">
                Chez OKAR, nous attachons une grande importance à la protection de vos données personnelles. 
                Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                lorsque vous utilisez notre plateforme.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
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
          </CardContent>
        </Card>

        {/* Vos droits */}
        <Card className="max-w-4xl mx-auto border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden mb-12">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Vos Droits</h2>
                <p className="text-gray-500">Contrôlez vos données personnelles</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {rights.map((right, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-1">{right.title}</h3>
                  <p className="text-sm text-gray-600">{right.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500" />
                <p className="text-sm text-gray-700">
                  Pour exercer vos droits : <strong>contact@okar.sn</strong> avec pour objet "Exercice de droits"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Contact */}
        <div className="text-center">
          <Card className="inline-block border-0 shadow-xl bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-3">Questions sur vos données ?</h2>
              <p className="text-white/90 mb-6">Notre équipe est là pour répondre à vos questions</p>
              <Link href="/contact">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg">
                  Nous contacter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
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
