/**
 * OKAR - Vehicle Classifier
 * Système de classification automatique des véhicules
 * 
 * Classifie les véhicules en 4 catégories pour adapter les recommandations:
 * - CATÉGORIE A : Poids Lourd / Camion / Bus
 * - CATÉGORIE B : Utilitaire / Van
 * - CATÉGORIE C : Véhicule Neuf / Récent (sous garantie)
 * - CATÉGORIE D : Véhicule Ancien / Standard
 */

// Types de véhicules supportés
export type VehicleCategory = 'A' | 'B' | 'C' | 'D';

export interface VehicleCategoryInfo {
  category: VehicleCategory;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgClass: string;
  description: string;
}

export interface VehicleData {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  type?: string | null;
  weight?: number | null; // en tonnes
  plateNumber?: string | null;
}

// Configuration des catégories
export const CATEGORY_CONFIG: Record<VehicleCategory, VehicleCategoryInfo> = {
  A: {
    category: 'A',
    label: 'Poids Lourd / Camion / Bus',
    shortLabel: 'Poids Lourd',
    icon: '🚛',
    color: '#F97316', // orange
    bgClass: 'bg-orange-500/20',
    description: 'Véhicule utilitaire lourds nécessitant des huiles Heavy Duty'
  },
  B: {
    category: 'B',
    label: 'Utilitaire / Van',
    shortLabel: 'Utilitaire',
    icon: '🚐',
    color: '#8B5CF6', // violet
    bgClass: 'bg-violet-500/20',
    description: 'Véhicules utilitaires légers (Hiace, Master, Sprinter)'
  },
  C: {
    category: 'C',
    label: 'Véhicule Neuf / Récent',
    shortLabel: 'Neuf/Garantie',
    icon: '🚗',
    color: '#10B981', // emerald
    bgClass: 'bg-emerald-500/20',
    description: 'Véhicule récent sous garantie constructeur'
  },
  D: {
    category: 'D',
    label: 'Véhicule Standard / Ancien',
    shortLabel: 'Standard',
    icon: '🚙',
    color: '#6B7280', // gray
    bgClass: 'bg-gray-500/20',
    description: 'Véhicule particulier standard ou ancien'
  }
};

// Patterns de détection pour les poids lourds
const HEAVY_TRUCK_PATTERNS = [
  // Marques poids lourds
  'actros', 'axor', 'atego', 'antos', 'arocs',
  'volvo fh', 'volvo fm', 'volvo fx', 'volvo truck',
  'man tga', 'man tgx', 'man tgs', 'man truck',
  'scania r', 'scania s', 'scania p', 'scania g',
  'iveco stralis', 'iveco eurocargo', 'iveco daily truck', 'iveco hi-way',
  'renault magnum', 'renault premium', 'renault kerax', 'renault t-range',
  'daf xf', 'daf cf', 'daf lf',
  'mercedes truck', 'mercedes camion',
  // Bus
  'bus', 'autocar', 'minibus',
  // Modèles spécifiques
  'hino', 'foton', 'howo', 'shacman', 'sinotruk'
];

// Patterns de détection pour les utilitaires
const UTILITY_VAN_PATTERNS = [
  'hiace', 'toyota hiace',
  'master', 'renault master',
  'sprinter', 'mercedes sprinter',
  'transit', 'ford transit',
  'boxer', 'peugeot boxer',
  'jumper', 'citroen jumper',
  'ducato', 'fiat ducato',
  'crafter', 'vw crafter', 'volkswagen crafter',
  'iveco daily',
  'nv400', 'nissan nv400',
  'movano', 'vauxhall movano',
  'relay', 'citroen relay',
  'expert', 'peugeot expert',
  'partner', 'peugeot partner', 'citroen partner'
];

// Marques de voitures neuves/premium (nécessitant huile spécifique)
const PREMIUM_NEW_CAR_BRANDS = [
  'mercedes', 'bmw', 'audi', 'porsche', 'lexus',
  'volkswagen', 'vw', 'toyota', 'honda', 'mazda',
  'nissan', 'hyundai', 'kia', 'ford', 'renault', 'peugeot'
];

/**
 * Fonction principale de classification
 * Analyse les données du véhicule et retourne la catégorie appropriée
 */
export function classifyVehicle(vehicle: VehicleData): VehicleCategoryInfo {
  const modelLower = (vehicle.model || '').toLowerCase();
  const brandLower = (vehicle.brand || '').toLowerCase();
  const typeLower = (vehicle.type || '').toLowerCase();
  const year = vehicle.year || 0;
  const mileage = vehicle.mileage || 0;
  const weight = vehicle.weight || 0;

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE A : POIDS LOURD / CAMION / BUS
  // ═══════════════════════════════════════════════════════════════
  
  // Critère 1: Type déclaré comme camion/bus
  if (['camion', 'truck', 'bus', 'autocar', 'poids lourd', 'heavy duty'].includes(typeLower)) {
    return CATEGORY_CONFIG.A;
  }

  // Critère 2: Poids > 3.5 tonnes
  if (weight > 3.5) {
    return CATEGORY_CONFIG.A;
  }

  // Critère 3: Modèle correspond aux patterns poids lourd
  if (HEAVY_TRUCK_PATTERNS.some(pattern => modelLower.includes(pattern))) {
    return CATEGORY_CONFIG.A;
  }

  // Critère 4: Combinaison marque + indicateur poids lourd
  const heavyIndicators = ['fh', 'fm', 'tga', 'tgx', 'tgs', 'xf', 'cf'];
  if (heavyIndicators.some(ind => modelLower.includes(ind))) {
    return CATEGORY_CONFIG.A;
  }

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE B : UTILITAIRE / VAN
  // ═══════════════════════════════════════════════════════════════

  // Critère 1: Type déclaré comme utilitaire
  if (['utilitaire', 'van', 'fourgon', 'pickup', 'commercial'].includes(typeLower)) {
    return CATEGORY_CONFIG.B;
  }

  // Critère 2: Modèle correspond aux patterns utilitaire
  if (UTILITY_VAN_PATTERNS.some(pattern => modelLower.includes(pattern))) {
    return CATEGORY_CONFIG.B;
  }

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE C : VÉHICULE NEUF / RÉCENT (GARANTIE)
  // ═══════════════════════════════════════════════════════════════

  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - year;

  // Critère 1: Véhicule de moins de 5 ans ET moins de 50 000 km
  if (vehicleAge <= 5 && mileage < 50000) {
    // Vérifier que ce n'est pas un utilitaire ou camion
    if (!UTILITY_VAN_PATTERNS.some(pattern => modelLower.includes(pattern))) {
      return CATEGORY_CONFIG.C;
    }
  }

  // Critère 2: Véhicule de moins de 3 ans (garantie fabricant)
  if (vehicleAge <= 3 && year > 2020) {
    if (!UTILITY_VAN_PATTERNS.some(pattern => modelLower.includes(pattern))) {
      return CATEGORY_CONFIG.C;
    }
  }

  // Critère 3: Véhicule très récent avec kilométrage très bas
  if (vehicleAge <= 2 && mileage < 30000) {
    if (!UTILITY_VAN_PATTERNS.some(pattern => modelLower.includes(pattern))) {
      return CATEGORY_CONFIG.C;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE D : VÉHICULE STANDARD / ANCIEN (PAR DÉFAUT)
  // ═══════════════════════════════════════════════════════════════

  return CATEGORY_CONFIG.D;
}

/**
 * Estime le type de carburant basé sur le modèle/marque
 */
export function estimateFuelType(vehicle: VehicleData): 'diesel' | 'essence' | 'hybride' | 'electrique' {
  const modelLower = (vehicle.model || '').toLowerCase();
  const brandLower = (vehicle.brand || '').toLowerCase();
  
  // Patterns diesel
  const dieselIndicators = ['d', 'dci', 'tdi', 'hdi', 'cdti', 'crdi', 'jtd', 'td', 'diesel'];
  if (dieselIndicators.some(ind => modelLower.includes(ind))) {
    return 'diesel';
  }
  
  // Patterns essence
  const essenceIndicators = ['tce', 'thp', 'tsi', 'mpi', 'vvti', 'vtec', 'gdi', 'essence'];
  if (essenceIndicators.some(ind => modelLower.includes(ind))) {
    return 'essence';
  }
  
  // Patterns hybride
  const hybrideIndicators = ['hybrid', 'h', 'phev', 'mhev', 'hev'];
  if (hybrideIndicators.some(ind => modelLower.includes(ind))) {
    return 'hybride';
  }
  
  // Patterns électrique
  const electricIndicators = ['electric', 'ev', 'bev', 'tesla'];
  if (electricIndicators.some(ind => modelLower.includes(ind) || brandLower.includes(ind))) {
    return 'electrique';
  }
  
  // Par défaut au Sénégal: diesel (majorité du parc)
  return 'diesel';
}

/**
 * Détecte si le véhicule a un moteur turbo
 */
export function hasTurboEngine(vehicle: VehicleData): boolean {
  const modelLower = (vehicle.model || '').toLowerCase();
  const turboIndicators = ['turbo', 'tdi', 'tce', 'thp', 'tsi', 'crdi', 'dci', 'hdi'];
  return turboIndicators.some(ind => modelLower.includes(ind));
}

/**
 * Retourne le contexte climatique (important pour les recommandations huile)
 * Au Sénégal: climat chaud, ce qui influence la viscosité recommandée
 */
export function getClimateContext(): {
  climate: string;
  temperatureRange: string;
  recommendation: string;
} {
  return {
    climate: 'Tropical Chaud',
    temperatureRange: '25°C - 45°C',
    recommendation: 'Privilégier les huiles avec viscosité stable à haute température'
  };
}

/**
 * Génère un résumé de la classification pour l'affichage
 */
export function getClassificationSummary(vehicle: VehicleData): {
  category: VehicleCategoryInfo;
  fuelType: 'diesel' | 'essence' | 'hybride' | 'electrique';
  hasTurbo: boolean;
  climateContext: ReturnType<typeof getClimateContext>;
  quickTips: string[];
} {
  const category = classifyVehicle(vehicle);
  const fuelType = estimateFuelType(vehicle);
  const hasTurbo = hasTurboEngine(vehicle);
  const climateContext = getClimateContext();
  
  // Conseils rapides selon la catégorie
  const quickTips: string[] = [];
  
  switch (category.category) {
    case 'A':
      quickTips.push('Vérifier le niveau de liquide de refroidissement');
      quickTips.push('Inspecter l\'état des courroies');
      quickTips.push('Contrôler la pression des pneus');
      quickTips.push('Filtre à gasoil critique au Sénégal');
      break;
    case 'B':
      quickTips.push('Filtre à air à vérifier (environnement poussiéreux)');
      quickTips.push('Filtre à gasoil recommandé');
      quickTips.push('Vérifier le niveau d\'huile de boîte');
      break;
    case 'C':
      quickTips.push('⚠️ Utiliser uniquement huile homologuée constructeur');
      quickTips.push('Mettre à jour le carnet de garantie');
      quickTips.push('Conserver les factures pour la garantie');
      break;
    case 'D':
      quickTips.push('Vérifier l\'état des joints');
      quickTips.push('Contrôler le niveau de liquide de refroidissement');
      quickTips.push('Nettoyer le filtre à air si nécessaire');
      break;
  }
  
  return {
    category,
    fuelType,
    hasTurbo,
    climateContext,
    quickTips
  };
}

export default classifyVehicle;
