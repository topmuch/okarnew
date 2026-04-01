/**
 * OKAR - Landing Page Publique
 * 
 * Design "Luminous Luxury & Wahoo Effect"
 * - Fond blanc/crème lumineux
 * - Typographie Serif élégante (Playfair Display)
 * - Ombres colorées douces
 * - Formes organiques abstraites
 * - Performance maximale (Lighthouse 100/100)
 * - Transitions CSS ultra-rapides (0.15s)
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Search,
  Shield,
  Wrench,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  QrCode,
  FileText,
  Phone,
  Mail,
  Loader2,
  Sparkles,
  Zap,
  Gauge,
  Battery,
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const [searchPlate, setSearchPlate] = useState('')
  const [searchResult, setSearchResult] = useState<{
    found: boolean
    plate?: string
    brand?: string
    model?: string
    year?: number
    healthScore?: number
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchPlate.trim()) return
    
    setIsSearching(true)
    setSearchResult(null)
    
    try {
      const response = await fetch(`/api/public/search?plate=${encodeURIComponent(searchPlate)}`)
      const data = await response.json()
      
      if (data.found) {
        setSearchResult({
          found: true,
          plate: data.plate,
          brand: data.brand,
          model: data.model,
          year: data.year,
          healthScore: data.healthScore,
        })
      } else {
        setSearchResult({ found: false })
      }
    } catch (error) {
      console.error('Erreur de recherche:', error)
      setSearchResult({ found: false })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F2937] font-sans relative overflow-x-hidden">
      {/* Formes organiques abstraites - Arrière-plan */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Cercle doré flou - Haut droit */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-200/40 via-orange-100/30 to-transparent blur-3xl" />
        {/* Cercle bleu flou - Gauche */}
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-sky-200/30 via-blue-100/20 to-transparent blur-3xl" />
        {/* Cercle rose flou - Bas */}
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-t from-pink-100/40 via-rose-50/20 to-transparent blur-3xl" />
        {/* Cercle indigo subtil */}
        <div className="absolute top-2/3 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-l from-indigo-100/30 to-transparent blur-2xl" />
      </div>

      {/* Header - Glassmorphism léger */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:shadow-orange-300/60 transition-shadow duration-150">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold font-serif tracking-tight bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              OKAR
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#4B5563] hover:text-amber-600 transition-colors duration-150 text-sm font-medium">
              Services
            </a>
            <a href="#how-it-works" className="text-[#4B5563] hover:text-amber-600 transition-colors duration-150 text-sm font-medium">
              Comment ça marche
            </a>
            <Link href="/blog" className="text-[#4B5563] hover:text-amber-600 transition-colors duration-150 text-sm font-medium">
              Blog
            </Link>
            <Link href="/demo" className="text-[#4B5563] hover:text-amber-600 transition-colors duration-150 text-sm font-medium">
              Démo
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-[#4B5563] hover:text-amber-600 hover:bg-amber-50/50 font-medium transition-colors duration-150">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-orange-200/50 hover:shadow-orange-300/60 transition-all duration-150">
                Inscription
              </Button>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-150"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-[#4B5563] hover:text-amber-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Services
            </a>
            <a href="#how-it-works" className="block text-[#4B5563] hover:text-amber-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Comment ça marche
            </a>
            <Link href="/blog" className="block text-[#4B5563] hover:text-amber-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/demo" className="block text-[#4B5563] hover:text-amber-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Démo
            </Link>
            <Link href="/login" className="block text-[#4B5563] hover:text-amber-600 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Connexion
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Badge + Titre */}
          <div className="text-center max-w-4xl mx-auto mb-10">
            <Badge className="mb-6 bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 text-amber-700 border border-amber-200/50 px-5 py-2 rounded-full text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" /> 
              Le #1 du Passeport Automobile au Sénégal
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6">
              <span className="block text-[#1F2937]">CHECK IN</span>
              <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                AUTO
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#4B5563] max-w-2xl mx-auto leading-relaxed mb-8">
              OKAR révolutionne la gestion automobile avec un carnet d'entretien numérique inviolable. 
              Vérifiez l'historique de n'importe quel véhicule en un scan QR.
            </p>

            {/* Chiffres Clés */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12">
              {[
                { value: '50K+', label: 'Véhicules', color: 'from-amber-500 to-orange-500' },
                { value: '500+', label: 'Garages', color: 'from-rose-500 to-pink-500' },
                { value: '98%', label: 'Satisfaction', color: 'from-sky-500 to-blue-500' },
                { value: '24/7', label: 'Support', color: 'from-violet-500 to-purple-500' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-mono`}>
                    {stat.value}
                  </div>
                  <div className="text-[#6B7280] text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Barre de Recherche - Design central */}
          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="plate" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl p-1.5 shadow-xl shadow-gray-200/50 border border-gray-100">
                <TabsTrigger 
                  value="plate" 
                  className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:via-orange-400 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-200/50 transition-all duration-150"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Vérifier Plaque
                </TabsTrigger>
                <TabsTrigger 
                  value="owner"
                  className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:via-orange-400 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-200/50 transition-all duration-150"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Propriétaire
                </TabsTrigger>
                <TabsTrigger 
                  value="garage"
                  className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:via-orange-400 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-200/50 transition-all duration-150"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Garage
                </TabsTrigger>
              </TabsList>

              {/* Tab: Vérifier Plaque */}
              <TabsContent value="plate" className="mt-6">
                <Card className="border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Car className="h-5 w-5 text-amber-500" />
                          </div>
                          <Input
                            type="text"
                            placeholder="Entrez un numéro de plaque (ex: AA-1234-AA)"
                            value={searchPlate}
                            onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                            className="h-14 text-lg pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-amber-300 focus:ring-amber-100 font-mono tracking-wider bg-gray-50/50"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          size="lg"
                          className="h-14 px-8 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white rounded-2xl shadow-lg shadow-orange-200/50 font-semibold transition-all duration-150"
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Search className="h-5 w-5 mr-2" />
                              Vérifier
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-[#6B7280] text-center flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        Recherche gratuite • Résultats instantanés • 100% sécurisé
                      </p>
                    </form>

                    {/* Résultat */}
                    {searchResult && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-rose-50/40 rounded-2xl border-2 border-amber-100">
                        {searchResult.found ? (
                          <>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                                  <Car className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-[#1F2937] font-mono">{searchResult.plate}</h3>
                                  <p className="text-[#6B7280]">{searchResult.brand} {searchResult.model} ({searchResult.year})</p>
                                </div>
                              </div>
                              <div className="text-center sm:text-right">
                                <div className="text-sm text-[#6B7280] mb-1">Score OKAR</div>
                                <div className={`text-4xl font-bold font-mono ${
                                  (searchResult.healthScore || 0) >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent' :
                                  (searchResult.healthScore || 0) >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent' : 
                                  'bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent'
                                }`}>
                                  {searchResult.healthScore}/100
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                              {[
                                { icon: Gauge, label: 'KM vérifié', color: 'text-amber-500' },
                                { icon: Battery, label: 'CT Valide', color: 'text-emerald-500' },
                                { icon: Shield, label: 'Certifié', color: 'text-sky-500' },
                                { icon: CheckCircle, label: 'Santé OK', color: 'text-rose-500' },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 p-2.5 bg-white/70 rounded-xl border border-white">
                                  <item.icon className={cn('h-4 w-4', item.color)} />
                                  <span className="text-sm text-[#4B5563]">{item.label}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-200/50">
                              <p className="text-sm text-[#4B5563] flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                Véhicule suivi par OKAR depuis 2019
                              </p>
                              <Link href="/report">
                                <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg shadow-sky-200/50 rounded-xl font-semibold transition-all duration-150">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Rapport Complet - 1 000 FCFA
                                </Button>
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-[#1F2937] font-medium mb-2">Aucun véhicule trouvé</p>
                            <p className="text-sm text-[#6B7280]">
                              Ce véhicule n'est pas encore suivi par OKAR.
                            </p>
                            <Link href="/register">
                              <Button className="mt-4 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-xl shadow-lg shadow-orange-200/50 font-semibold transition-all duration-150">
                                Ajouter mon véhicule
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Propriétaire */}
              <TabsContent value="owner" className="mt-6">
                <Card className="border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-100/50">
                        <Users className="h-10 w-10 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-bold font-serif text-[#1F2937]">Espace Propriétaire</h3>
                      <p className="text-[#4B5563] max-w-md mx-auto">
                        Accédez à votre carnet d'entretien numérique, suivez la santé de votre véhicule.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/register">
                          <Button className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white px-8 py-6 rounded-2xl shadow-lg shadow-orange-200/50 font-semibold transition-all duration-150">
                            Créer mon compte
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        <Link href="/login">
                          <Button variant="outline" className="px-8 py-6 rounded-2xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 font-semibold transition-all duration-150">
                            Déjà inscrit? Connexion
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Garage */}
              <TabsContent value="garage" className="mt-6">
                <Card className="border-0 shadow-2xl shadow-gray-200/60 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-sky-100/50">
                        <Wrench className="h-10 w-10 text-sky-600" />
                      </div>
                      <h3 className="text-2xl font-bold font-serif text-[#1F2937]">Espace Garage Partenaire</h3>
                      <p className="text-[#4B5563] max-w-md mx-auto">
                        Rejoignez le réseau OKAR et offrez à vos clients un service premium.
                      </p>
                      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="text-2xl font-bold font-mono bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">500+</div>
                          <div className="text-xs text-[#6B7280]">Garages</div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                          <div className="text-2xl font-bold font-mono bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">50K+</div>
                          <div className="text-xs text-[#6B7280]">Véhicules</div>
                        </div>
                        <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                          <div className="text-2xl font-bold font-mono bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">98%</div>
                          <div className="text-xs text-[#6B7280]">Satisfaction</div>
                        </div>
                      </div>
                      <Link href="/register?role=garage">
                        <Button className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 text-white px-8 py-6 rounded-2xl shadow-lg shadow-sky-200/50 font-semibold transition-all duration-150">
                          Devenir partenaire
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 border border-amber-200/50 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-1.5" /> Simple comme 1-2-3
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#1F2937]">
              Comment ça marche ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {[
              { 
                step: 1, 
                icon: QrCode, 
                title: 'Scan QR Code', 
                description: 'Le garage scanne le QR code OKAR du véhicule.', 
                gradient: 'from-amber-400 to-orange-400',
                shadow: 'shadow-orange-200/50'
              },
              { 
                step: 2, 
                icon: FileText, 
                title: 'Enregistrement', 
                description: 'Chaque intervention est enregistrée avec photos et kilométrage.', 
                gradient: 'from-rose-400 to-pink-400',
                shadow: 'shadow-rose-200/50'
              },
              { 
                step: 3, 
                icon: Shield, 
                title: 'Validation', 
                description: 'Le propriétaire valide l\'intervention via l\'app.', 
                gradient: 'from-sky-400 to-indigo-400',
                shadow: 'shadow-sky-200/50'
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${item.shadow} transition-transform duration-150 hover:scale-105`}>
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <div className="inline-block w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 font-bold text-[#4B5563] font-mono">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1F2937] mb-3">{item.title}</h3>
                <p className="text-[#6B7280] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services - Grille Bento */}
      <section id="features" className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-white to-amber-50/30 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-sky-100 text-sky-700 border border-sky-200/50 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-1.5" /> Nos Services
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#1F2937] mb-4">
              Tout ce dont vous avez besoin
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { 
                icon: FileText, 
                title: 'Rapport Complet', 
                price: '1 000 FCFA', 
                gradient: 'from-amber-400 to-orange-500',
                shadow: 'shadow-orange-200/50',
                bg: 'bg-gradient-to-br from-amber-50 to-orange-50'
              },
              { 
                icon: Shield, 
                title: 'Carnet Numérique', 
                price: 'Gratuit', 
                gradient: 'from-rose-400 to-pink-500',
                shadow: 'shadow-rose-200/50',
                bg: 'bg-gradient-to-br from-rose-50 to-pink-50'
              },
              { 
                icon: MapPin, 
                title: 'Garages Proches', 
                price: 'Gratuit', 
                gradient: 'from-sky-400 to-blue-500',
                shadow: 'shadow-sky-200/50',
                bg: 'bg-gradient-to-br from-sky-50 to-blue-50'
              },
              { 
                icon: Clock, 
                title: 'Alertes Auto', 
                price: 'Gratuit', 
                gradient: 'from-violet-400 to-purple-500',
                shadow: 'shadow-violet-200/50',
                bg: 'bg-gradient-to-br from-violet-50 to-purple-50'
              },
            ].map((service, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-xl ${service.shadow} hover:shadow-2xl transition-all duration-150 bg-white rounded-3xl overflow-hidden group`}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-150 group-hover:scale-110`}>
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold font-serif text-lg text-[#1F2937] mb-3">{service.title}</h3>
                  <Badge className={`bg-gradient-to-r ${service.gradient} text-white border-0 px-4 py-1.5 rounded-full font-semibold shadow-sm`}>
                    {service.price}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="testimonials" className="py-20 lg:py-28 bg-gradient-to-r from-amber-50 via-rose-50 to-sky-50 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#1F2937]">
              Ce qu'ils disent de nous
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: 'Mamadou Diop', 
                role: 'Propriétaire, Dakar', 
                content: 'Grâce à OKAR, j\'ai découvert que la voiture que je voulais acheter avait un compteur trafiqué!',
                gradient: 'from-amber-100 to-orange-100'
              },
              { 
                name: 'Fatou Sow', 
                role: 'Garage Auto Express', 
                content: 'Nos clients nous font davantage confiance depuis qu\'on est partenaire OKAR.',
                gradient: 'from-rose-100 to-pink-100'
              },
              { 
                name: 'Ousmane Ba', 
                role: 'Propriétaire, Thiès', 
                content: 'Fini les paperasses! Tout l\'historique de ma voiture est sur mon téléphone.',
                gradient: 'from-sky-100 to-blue-100'
              },
            ].map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-xl shadow-gray-200/40 bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-150"
              >
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[#4B5563] mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                  <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${testimonial.gradient}`}>
                    <p className="font-bold text-[#1F2937]">{testimonial.name}</p>
                    <p className="text-sm text-[#6B7280]">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-white relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#1F2937] mb-6">
              Prêt à rejoindre OKAR ?
            </h2>
            <p className="text-lg text-[#6B7280] mb-10 max-w-xl mx-auto">
              Rejoignez des milliers de propriétaires et garages qui font déjà confiance à OKAR.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white px-10 py-6 rounded-full shadow-xl shadow-orange-200/50 font-semibold text-lg transition-all duration-150">
                  Créer mon compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=garage">
                <Button variant="outline" className="px-10 py-6 rounded-full border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 font-semibold text-lg transition-all duration-150">
                  <Wrench className="mr-2 h-5 w-5" />
                  Devenir garage partenaire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Logo + Description */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold font-serif bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                  OKAR
                </span>
              </Link>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Le passeport numérique automobile au Sénégal.
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="font-semibold text-[#1F2937] mb-4 text-sm uppercase tracking-wide">Produit</h4>
              <ul className="space-y-2">
                <li><Link href="/demo" className="text-sm text-[#6B7280] hover:text-amber-600 transition-colors duration-150">Démo Interactive</Link></li>
                <li><Link href="/blog" className="text-sm text-[#6B7280] hover:text-amber-600 transition-colors duration-150">Blog</Link></li>
                <li><Link href="/register?role=garage" className="text-sm text-[#6B7280] hover:text-amber-600 transition-colors duration-150">Devenir garage</Link></li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-semibold text-[#1F2937] mb-4 text-sm uppercase tracking-wide">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="/cgu" className="text-sm text-[#6B7280] hover:text-amber-600 transition-colors duration-150">CGU</Link></li>
                <li><Link href="/confidentialite" className="text-sm text-[#6B7280] hover:text-amber-600 transition-colors duration-150">Confidentialité</Link></li>
                <li><Link href="/about" className="text-sm text-[#6B7280] hover:text-amber-600 transition-colors duration-150">À propos</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-[#1F2937] mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Phone className="h-4 w-4 text-amber-500" />
                  +221 78 485 82 26
                </li>
                <li className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Mail className="h-4 w-4 text-amber-500" />
                  contact@okar.sn
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6B7280]">
              © 2024 OKAR. Tous droits réservés.
            </p>
            <p className="text-sm text-[#6B7280] flex items-center gap-2">
              Made with <span className="text-rose-500">❤️</span> in Sénégal 🇸🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
