/**
 * OKAR - Page À Propos
 * 
 * Présentation de l'entreprise et de l'équipe
 * Design cohérent avec la landing page
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Transparence',
      description: 'Chaque intervention est tracée et vérifiable. Plus de doute sur l\'historique d\'un véhicule.',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      icon: Heart,
      title: 'Confiance',
      description: 'Nous créons un lien de confiance entre propriétaires et garages grâce à la validation mutuelle.',
      gradient: 'from-rose-400 to-pink-500',
    },
    {
      icon: Globe,
      title: 'Innovation',
      description: 'La technologie au service de l\'automobile africaine, avec des solutions adaptées à nos réalités.',
      gradient: 'from-sky-400 to-blue-500',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Un service premium accessible à tous, avec un support réactif et une plateforme intuitive.',
      gradient: 'from-violet-400 to-purple-500',
    },
  ]

  const stats = [
    { value: '50K+', label: 'Véhicules suivis' },
    { value: '500+', label: 'Garages partenaires' },
    { value: '100K+', label: 'Interventions enregistrées' },
    { value: '98%', label: 'Satisfaction client' },
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
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 text-amber-700 border border-amber-200/50 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Notre Histoire
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Révolutionner l'automobile au Sénégal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            OKAR est né d'un constat simple : l'industrie automobile sénégalaise manque de transparence. 
            Nous avons décidé de changer cela.
          </p>
        </div>

        {/* Mission */}
        <Card className="max-w-4xl mx-auto mb-16 border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl flex items-center justify-center shadow-xl shrink-0">
                <Target className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Notre Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  Créer un écosystème de confiance autour de l'automobile au Sénégal. Nous permettons 
                  à chaque propriétaire de suivre l'historique complet de son véhicule, et à chaque 
                  garage de valoriser son expertise. Le résultat ? Une meilleure transparence pour tous, 
                  et des transactions automobiles plus sûres.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl shadow-gray-200/40 bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent font-mono mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Valeurs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Nos Valeurs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-xl shadow-gray-200/40 bg-white rounded-2xl overflow-hidden group hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="inline-block border-0 shadow-xl bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-3">Rejoignez l'aventure OKAR</h2>
              <p className="text-white/90 mb-6">Faites partie de la révolution automobile au Sénégal</p>
              <div className="flex gap-3">
                <Link href="/register">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg">
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-8 py-3 rounded-full font-semibold">
                    Nous contacter
                  </Button>
                </Link>
              </div>
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
