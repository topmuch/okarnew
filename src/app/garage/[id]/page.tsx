/**
 * OKAR - Profil Public Garage
 * 
 * Mini-site vitrine publique pour les garages
 * Design lumineux (pas dark) pour le grand public
 */

'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Award,
  Shield,
  Users,
  Wrench,
  Car,
  CheckCircle2,
  MessageCircle,
  Navigation,
  ChevronRight,
  Heart,
  Share2,
  Mail,
} from 'lucide-react'

// Mock data
const mockGarage = {
  id: 'g1',
  businessName: 'Auto Service Dakar',
  address: 'Route de Ouakam, 15ème Rue',
  city: 'Dakar',
  phone: '77 123 45 67',
  email: 'contact@autodakar.sn',
  website: 'www.autodakar.sn',
  rating: 4.8,
  totalReviews: 156,
  totalClients: 423,
  totalInterventions: 1250,
  certifiedDate: '2022-03-15',
  isOpen: true,
  openingHours: {
    weekdays: '7h30 - 19h00',
    saturday: '8h00 - 16h00',
    sunday: 'Fermé',
  },
  services: [
    { name: 'Vidange & Entretien', icon: '🔧' },
    { name: 'Mécanique Générale', icon: '⚙️' },
    { name: 'Carrosserie', icon: '🚗' },
    { name: 'Diagnostic Électronique', icon: '💻' },
    { name: 'Climatisation', icon: '❄️' },
    { name: 'Freins & Suspension', icon: '🛞' },
  ],
  specialties: ['Toyota', 'Peugeot', 'Renault', 'Hyundai'],
  photos: [
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
  ],
  reviews: [
    {
      id: '1',
      author: 'Moussa D.',
      rating: 5,
      date: '2024-01-10',
      comment: 'Excellent service ! Mon véhicule a été réparé rapidement et à un prix raisonnable. Je recommande vivement.',
      verified: true,
    },
    {
      id: '2',
      author: 'Fatou S.',
      rating: 5,
      date: '2024-01-08',
      comment: 'Très professionnel. Ils ont pris le temps de m\'expliquer les réparations nécessaires.',
      verified: true,
    },
    {
      id: '3',
      author: 'Ibrahima N.',
      rating: 4,
      date: '2024-01-05',
      comment: 'Bon garage, personnel compétent. Un peu d\'attente mais le résultat est là.',
      verified: true,
    },
  ],
  badges: ['Certifié OKAR', 'Top 10 Dakar', '5 Ans d\'Excellence'],
}

export default function GaragePublicProfilePage() {
  const params = useParams()
  const garageId = params?.id || 'default'
  const [garage] = useState(mockGarage)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-pink-900 text-white">
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg">OKAR</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main info */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{garage.businessName}</h1>
                {garage.isOpen && (
                  <Badge className="bg-green-400/20 text-green-100 border-green-400/30">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                    Ouvert
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{garage.address}, {garage.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-white">{garage.rating}</span>
                  <span>({garage.totalReviews} avis)</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {garage.badges.map((badge) => (
                  <Badge
                    key={badge}
                    className="bg-white/10 text-white border-white/20 backdrop-blur-sm"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-white/90 shadow-lg"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Clients satisfaits', value: garage.totalClients, icon: Users },
                { label: 'Interventions', value: garage.totalInterventions, icon: Wrench },
                { label: 'Années d\'expérience', value: 5, icon: Award },
              ].map((stat) => (
                <Card key={stat.label} className="text-center border-0 shadow-sm">
                  <CardContent className="p-4">
                    <stat.icon className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  Services
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  Avis
                </TabsTrigger>
                <TabsTrigger value="photos" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                  Photos
                </TabsTrigger>
              </TabsList>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Services proposés</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {garage.services.map((service) => (
                        <div
                          key={service.name}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="text-2xl">{service.icon}</span>
                          <span className="font-medium text-gray-700">{service.name}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="font-semibold text-gray-900 mt-6 mb-4">Spécialités</h3>
                    <div className="flex flex-wrap gap-2">
                      {garage.specialties.map((brand) => (
                        <Badge key={brand} variant="outline" className="border-pink-200 text-pink-600">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-900">Avis clients</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{garage.rating}</span>
                        <span className="text-gray-500">({garage.totalReviews} avis)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {garage.reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600 font-semibold">
                                  {review.author.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{review.author}</span>
                                  {review.verified && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      Voir tous les avis
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-video bg-gray-200 rounded-xl overflow-hidden"
                    >
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Car className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-0 shadow-sm sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Contacter</h3>
                
                <div className="space-y-3">
                  <a
                    href={`tel:${garage.phone}`}
                    className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-semibold text-gray-900">{garage.phone}</p>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/221${garage.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-semibold text-gray-900">Envoyer un message</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${garage.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{garage.email}</p>
                    </div>
                  </a>
                </div>

                {/* Hours */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <h4 className="font-medium text-gray-900">Horaires</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lun - Ven</span>
                      <span className="text-gray-900 font-medium">{garage.openingHours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Samedi</span>
                      <span className="text-gray-900 font-medium">{garage.openingHours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimanche</span>
                      <span className="text-gray-900 font-medium">{garage.openingHours.sunday}</span>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <h4 className="font-medium text-gray-900">Certifications</h4>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-700">Certifié OKAR</p>
                      <p className="text-xs text-green-600">Depuis {garage.certifiedDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              <span className="font-semibold">OKAR - Passeport Numérique Automobile</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 OKAR. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
