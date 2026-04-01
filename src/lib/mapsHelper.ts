/**
 * OKAR - Google Maps Helper Utilities
 * 
 * Fonctions pour générer les URLs Google Maps avec destination pré-remplie
 * pour l'itinéraire vers les garages
 */

/**
 * Génère une URL Google Maps pour l'itinéraire
 * 
 * @param latitude - Latitude de la destination
 * @param longitude - Longitude de la destination
 * @param placeId - Google Place ID (optionnel, pour une meilleure précision)
 * @param address - Adresse textuelle (fallback si pas de coords)
 * @param name - Nom du lieu (optionnel)
 * @returns URL Google Maps complète pour l'itinéraire
 */
export function generateGoogleMapsUrl(
  latitude?: number | null,
  longitude?: number | null,
  placeId?: string | null,
  address?: string | null,
  name?: string | null
): string {
  const baseUrl = 'https://www.google.com/maps/dir/'
  
  // Si on a les coordonnées GPS
  if (latitude && longitude) {
    const params = new URLSearchParams({
      api: '1',
      destination: `${latitude},${longitude}`,
      travelmode: 'driving'
    })
    
    // Ajouter le place_id si disponible pour une meilleure précision
    if (placeId) {
      params.set('destination_place_id', placeId)
    }
    
    return `https://www.google.com/maps/dir/?${params.toString()}`
  }
  
  // Fallback: utiliser l'adresse textuelle
  if (address) {
    const encodedAddress = encodeURIComponent(address)
    const encodedName = name ? encodeURIComponent(name) : ''
    const query = encodedName ? `${encodedName}, ${encodedAddress}` : encodedAddress
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }
  
  // Dernier fallback: ouvrir Google Maps
  return 'https://www.google.com/maps'
}

/**
 * Génère une URL pour ouvrir Google Maps avec un marqueur sur le garage
 * 
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @param name - Nom du garage
 * @returns URL pour afficher le lieu sur la carte
 */
export function generateGoogleMapsPlaceUrl(
  latitude: number,
  longitude: number,
  name?: string
): string {
  const query = name 
    ? encodeURIComponent(`${name}@${latitude},${longitude}`)
    : `${latitude},${longitude}`
  
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/**
 * Génère un lien Google Maps embed pour afficher une carte intégrée
 * 
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @param zoom - Niveau de zoom (défaut: 15)
 * @returns URL pour iframe embed
 */
export function generateGoogleMapsEmbedUrl(
  latitude: number,
  longitude: number,
  zoom: number = 15
): string {
  return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=${zoom}`
}

/**
 * Génère un lien pour appeler directement (tel:)
 * 
 * @param phone - Numéro de téléphone
 * @returns URL tel: formatée
 */
export function generateTelUrl(phone: string): string {
  // Nettoyer le numéro de téléphone
  const cleanPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '')
  return `tel:${cleanPhone}`
}

/**
 * Génère un lien WhatsApp avec message pré-rempli
 * 
 * @param phone - Numéro de téléphone (format international sans +)
 * @param message - Message pré-rempli
 * @returns URL WhatsApp
 */
export function generateWhatsAppUrl(phone: string, message?: string): string {
  // Nettoyer le numéro
  let cleanPhone = phone.replace(/\s/g, '').replace(/[^\d]/g, '')
  
  // S'assurer que le numéro commence par le code pays
  if (!cleanPhone.startsWith('221') && cleanPhone.startsWith('0')) {
    cleanPhone = '221' + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith('221') && !cleanPhone.startsWith('+')) {
    cleanPhone = '221' + cleanPhone
  }
  
  const baseUrl = `https://wa.me/${cleanPhone}`
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`
  }
  
  return baseUrl
}

/**
 * Calcule la distance entre deux points GPS (en km)
 * Utilise la formule de Haversine
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Formate une distance pour l'affichage
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}
