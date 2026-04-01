/**
 * OKAR - Page Démo Interactive
 * 
 * Démonstration des fonctionnalités principales de OKAR
 * Design cohérent avec la landing page "Wahoo Multicolor"
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Car,
  QrCode,
  FileText,
  Shield,
  Wrench,
  Users,
  CheckCircle,
  Search,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Gauge,
  Battery,
  Zap,
} from 'lucide-react'
import { BackToHomeButton } from '@/components/okar/BackToHomeButton'

export default function DemoPage() {
  const [demoStep, setDemoStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchPlate, setSearchPlate] = useState('')

  const demoSteps = [
    {
      title: 'Scan du QR Code',
      description: 'Le garage scanne le QR code OKAR du véhicule avec son smartphone.',
      icon: QrCode,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Enregistrement',
      description: 'L\'intervention est enregistrée avec photos, kilométrage et détails.',
      icon: FileText,
      gradient: 'from-rose-400 to-pink-500',
    },
    {
      title: 'Validation',
      description: 'Le propriétaire reçoit une notification et valide l\'intervention.',
      icon: Shield,
      gradient: 'from-sky-400 to-blue-500',
    },
  ]

  const handlePlayDemo = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    setDemoStep(0)
    
    const interval = setInterval(() => {
      setDemoStep((prev) => {
        if (prev >= 2) {
          clearInterval(interval)
          setIsPlaying(false)
          return 2
        }
        return prev + 1
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
      {/* Header simplifié */}
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
            <Play className="h-4 w-4 mr-2" />
            Démonstration Interactive
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Découvrez OKAR en action
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez les fonctionnalités principales de OKAR et voyez comment nous révolutionnons la gestion automobile au Sénégal.
          </p>
        </div>

        {/* Démo Animée */}
        <Card className="max-w-4xl mx-auto mb-12 border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="text-center border-b border-gray-100 pb-6">
            <CardTitle className="text-2xl">Comment ça fonctionne ?</CardTitle>
            <CardDescription>
              Un processus simple en 3 étapes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* Étapes */}
            <div className="flex justify-center gap-4 mb-8">
              {demoSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setDemoStep(index)}
                  className={`flex-1 max-w-xs p-6 rounded-2xl border-2 transition-all duration-300 ${
                    demoStep === index
                      ? `bg-gradient-to-br ${step.gradient} text-white border-transparent shadow-lg`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <step.icon className={`h-10 w-10 mx-auto mb-3 ${demoStep === index ? 'text-white' : 'text-gray-400'}`} />
                  <h3 className={`font-semibold mb-1 ${demoStep === index ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${demoStep === index ? 'text-white/90' : 'text-gray-500'}`}>
                    Étape {index + 1}
                  </p>
                </button>
              ))}
            </div>

            {/* Description active */}
            <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 mb-6">
              <p className="text-lg text-gray-700">{demoSteps[demoStep].description}</p>
            </div>

            {/* Contrôles */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handlePlayDemo}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  isPlaying
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white hover:from-amber-500 hover:via-orange-500 hover:to-rose-500'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Lancer la démo
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDemoStep(0)}
                className="px-6 py-3 rounded-full border-gray-200 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Rejouer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Démo Recherche */}
        <Card className="max-w-4xl mx-auto mb-12 border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="text-center border-b border-gray-100 pb-6">
            <CardTitle className="text-2xl">Essayez la recherche</CardTitle>
            <CardDescription>
              Simulez une recherche de véhicule (données de démonstration)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex gap-3 mb-6">
              <Input
                type="text"
                placeholder="Entrez un numéro de plaque (ex: AA-1234-AA)"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                className="h-14 text-lg px-4 rounded-2xl border-2 border-gray-100 focus:border-amber-300 font-mono tracking-wider"
              />
              <Button className="h-14 px-8 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white rounded-2xl font-semibold">
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </Button>
            </div>

            {/* Résultat fictif */}
            {searchPlate.length >= 4 && (
              <div className="p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 rounded-2xl border border-amber-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 font-mono">{searchPlate || 'AA-1234-AA'}</h3>
                    <p className="text-gray-600">Toyota Corolla (2020)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Score OKAR</div>
                    <div className="text-3xl font-bold text-emerald-500 font-mono">87/100</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Gauge, label: '45 000 km', color: 'text-amber-500' },
                    { icon: Battery, label: 'CT Valide', color: 'text-emerald-500' },
                    { icon: Shield, label: 'Certifié', color: 'text-sky-500' },
                    { icon: CheckCircle, label: 'Santé OK', color: 'text-rose-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white/70 rounded-xl border border-white">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  ✨ Ceci est une démonstration avec des données fictives
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="inline-block border-0 shadow-xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-3">Convaincu ?</h2>
              <p className="text-white/90 mb-6">Créez votre compte gratuit et rejoignez OKAR</p>
              <div className="flex gap-3">
                <Link href="/register">
                  <Button className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg">
                    Créer mon compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?role=garage">
                  <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-8 py-3 rounded-full font-semibold">
                    <Wrench className="mr-2 h-4 w-4" />
                    Devenir garage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer simple */}
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
