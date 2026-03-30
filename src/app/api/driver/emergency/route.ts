/**
 * OKAR API - Driver Emergency
 * Trouve les garages OKAR certifiés les plus proches
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer tous les garages actifs et certifiés
    const garages = await db.garage.findMany({
      where: {
        isActive: true,
        user: {
          role: 'garage_certified',
          isApproved: true
        }
      },
      include: {
        badges: {
          where: { badgeType: 'top_garage' },
          take: 1
        }
      }
    })

    // Calculer la distance pour chaque garage et trier
    interface GarageWithDistance {
      id: string;
      businessName: string;
      address: string;
      city: string;
      phone: string;
      latitude: number | null;
      longitude: number | null;
      rating: number;
      totalClients: number;
      distance?: number;
      badges: { badgeType: string; badgeName: string }[];
    }

    const garagesWithDistance: GarageWithDistance[] = garages.map((garage: GarageWithDistance) => {
      let distance = 999999 // Distance par défaut si pas de coords
      
      if (lat && lng && garage.latitude && garage.longitude) {
        // Calcul de la distance en km (formule de Haversine simplifiée)
        const R = 6371 // Rayon de la Terre en km
        const dLat = (garage.latitude - lat) * Math.PI / 180
        const dLng = (garage.longitude - lng) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(garage.latitude * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        distance = R * c
      }

      return {
        ...garage,
        distance
      }
    })

    // Trier par distance
    garagesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    // Limiter les résultats
    const nearestGarages = garagesWithDistance.slice(0, limit)

    return NextResponse.json({
      userLocation: lat && lng ? { lat, lng } : null,
      garages: nearestGarages.map(g => ({
        id: g.id,
        name: g.businessName,
        address: g.address,
        city: g.city,
        phone: g.phone,
        rating: g.rating,
        totalClients: g.totalClients,
        distance: g.distance ? Math.round(g.distance * 10) / 10 : null,
        latitude: g.latitude,
        longitude: g.longitude,
        isTopRated: g.badges.length > 0,
        googleMapsUrl: g.latitude && g.longitude 
          ? `https://www.google.com/maps/dir/?api=1&destination=${g.latitude},${g.longitude}`
          : null,
        callUrl: g.phone ? `tel:${g.phone.replace(/\s/g, '')}` : null
      })),
      total: garages.length
    })
  } catch (error) {
    console.error('Erreur recherche garages:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
