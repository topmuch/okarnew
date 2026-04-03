'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  CheckCircle,
  QrCode,
  Star,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Menu,
  X,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Building2,
  Play,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative overflow-x-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-100/50 via-teal-100/30 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-100/40 via-cyan-100/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-emerald-50/50 via-green-50/30 to-transparent blur-3xl" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:shadow-emerald-300/60 transition-shadow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CleanCheck
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">Fonctionnalités</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">Comment ça marche</a>
            <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">Tarifs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-medium">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-200/50">
                Commencer gratuitement
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-emerald-100/50 px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-emerald-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-emerald-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
            <a href="#pricing" className="block text-gray-600 hover:text-emerald-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <Link href="/auth/login" className="block text-gray-600 hover:text-emerald-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Se connecter</Link>
          </div>
        )}
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 border border-emerald-200/50 px-5 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              La plateforme #1 de gestion de nettoyage
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-gray-900">Digitalisez vos</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                interventions de nettoyage
              </span>
              <br />
              <span className="text-gray-900">avec des </span>
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                QR Codes intelligents
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Créez, suivez et auditez vos interventions de nettoyage via des QR Codes, des checklists interactives et un système de scoring qualité automatisé.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-200/50 h-auto text-base">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 font-semibold px-8 py-3.5 rounded-xl h-auto text-base">
                  <Play className="mr-2 h-4 w-4" />
                  Voir la démo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '2 500+', label: 'Entreprises', icon: Building2 },
              { value: '50 000+', label: 'Interventions', icon: ClipboardCheck },
              { value: '4.8/5', label: 'Note moyenne', icon: Star },
              { value: '99.9%', label: 'Disponibilité', icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <stat.icon className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/30 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200/50 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-1.5" /> Fonctionnalités
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Une suite complète d&apos;outils pour digitaliser et optimiser votre activité de nettoyage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: QrCode,
                title: 'QR Codes dynamiques',
                description: 'Générez des QR Codes uniques pour chaque intervention. Les agents scannent et accèdent directement à leur mission.',
                gradient: 'from-emerald-400 to-teal-500',
                shadow: 'shadow-emerald-200/50',
                features: ['QR unique par intervention', 'Scan instantané mobile', 'Suivi en temps réel'],
              },
              {
                icon: ClipboardCheck,
                title: 'Checklists interactives',
                description: 'Créez des templates de checklists personnalisés. Les agents cochent les tâches en temps réel sur le terrain.',
                gradient: 'from-teal-400 to-cyan-500',
                shadow: 'shadow-teal-200/50',
                features: ['Templates personnalisables', 'Tâches avec photos', 'Saisie de notes terrain'],
              },
              {
                icon: BarChart3,
                title: 'Score Qualité automatisé',
                description: 'Le client note l\'intervention en scannant le QR. Un score qualité est calculé automatiquement par agent.',
                gradient: 'from-cyan-400 to-blue-500',
                shadow: 'shadow-cyan-200/50',
                features: ['Évaluation client 5 étoiles', 'Score agent automatique', 'Classement qualité'],
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden group hover:-translate-y-1"
              >
                <CardContent className="p-6 lg:p-8">
                  <div className={cn(
                    'w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110',
                    feature.gradient,
                    feature.shadow
                  )}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-100 text-teal-700 border border-teal-200/50 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Clock className="h-4 w-4 mr-1.5" /> Processus simple
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                icon: ClipboardCheck,
                title: 'Créez une intervention',
                description: 'Sélectionnez un client, un agent et un template de checklist. Un QR Code est généré automatiquement.',
                gradient: 'from-emerald-400 to-emerald-500',
              },
              {
                step: 2,
                icon: QrCode,
                title: "L'agent scanne le QR",
                description: "Sur le terrain, l'agent scanne le QR Code avec son téléphone et accède à sa mission en un clic.",
                gradient: 'from-teal-400 to-teal-500',
              },
              {
                step: 3,
                icon: CheckCircle,
                title: 'Validez la checklist',
                description: "L'agent coche chaque tâche, ajoute des photos et des notes. L'intervention est terminée.",
                gradient: 'from-cyan-400 to-cyan-500',
              },
              {
                step: 4,
                icon: Star,
                title: 'Le client note',
                description: 'Le client scanne le QR et évalue la prestation. Le score qualité est mis à jour en temps réel.',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 relative">
                {/* Connector line */}
                {item.step < 4 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200" />
                )}
                <div className={cn(
                  'w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg transition-transform duration-300 hover:scale-105 relative z-10',
                  item.gradient
                )}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg mb-3 font-bold text-emerald-700 text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50/30 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200/50 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Users className="h-4 w-4 mr-1.5" /> Tarifs
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Des tarifs adaptés à votre activité
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Commencez gratuitement, évoluez selon vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 lg:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Gratuit</h3>
                <p className="text-gray-500 text-sm mb-6">Pour démarrer votre activité</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">0€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    '3 agents',
                    '30 interventions/mois',
                    '2 templates de checklist',
                    'Rapports de base',
                    'Support email',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button variant="outline" className="w-full border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 font-semibold rounded-xl h-11">
                    Commencer gratuitement
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro - Popular */}
            <Card className="border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-xl shadow-emerald-100/50 relative">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                Populaire
              </div>
              <CardContent className="p-6 lg:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-500 text-sm mb-6">Pour les entreprises en croissance</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-emerald-600">99€</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    '15 agents',
                    'Interventions illimitées',
                    'Templates illimités',
                    'Scores qualité avancés',
                    'Rapports détaillés',
                    'Notifications',
                    'Support prioritaire',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 shadow-lg shadow-emerald-200/50">
                    Démarrer l&apos;essai gratuit
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 lg:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Entreprise</h3>
                <p className="text-gray-500 text-sm mb-6">Pour les grandes structures</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Sur devis</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Agents illimités',
                    'Multi-sites',
                    'API & intégrations',
                    'SLA garanti 99.99%',
                    'Formation dédiée',
                    'Account manager',
                    'Support 24/7',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <Button variant="outline" className="w-full border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 font-semibold rounded-xl h-11">
                    Nous contacter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à digitaliser votre activité de nettoyage ?
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez plus de 2 500 entreprises qui font confiance à CleanCheck pour gérer leurs interventions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-3.5 rounded-xl shadow-lg h-auto text-base">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl h-auto text-base">
                  Voir les tarifs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CleanCheck</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                La plateforme tout-en-un pour digitaliser vos interventions de nettoyage.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Phone className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Intégrations</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Mises à jour</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Sécurité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} CleanCheck. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">Paris, France</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
