/**
 * OKAR - Oil Rules Database
 * Base de données des règles d'huile, filtres et recommandations
 * par catégorie de véhicule
 * 
 * Expert Mécanicien: Ce fichier contient toute la logique métier
 * pour les recommandations de vidange intelligentes.
 */

import { VehicleCategory, VehicleCategoryInfo, CATEGORY_CONFIG } from './vehicleClassifier';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface OilProduct {
  id: string;
  name: string;
  viscosity: string;
  type: 'mineral' | 'synthese' | 'semi-synthese';
  spec: string; // API, ACEA spec
  capacity: string; // Bidon de 1L, 5L, 20L
  price: number; // Prix indicatif FCFA
  isHeavyDuty?: boolean;
  isManufacturerApproved?: boolean;
  brands: string[]; // Marques disponibles (Total, Shell, Mobil, etc.)
  recommended: boolean;
  badge?: string; // Label spécial
}

export interface OilRecommendation {
  primary: OilProduct[];
  alternatives: OilProduct[];
  estimatedQuantity: {
    min: number;
    max: number;
    recommended: number;
    unit: string;
  };
  notes: string[];
  warnings: string[];
}

export interface FilterProduct {
  id: string;
  name: string;
  type: 'oil_filter' | 'air_filter' | 'fuel_filter' | 'cabin_filter' | 'water_separator';
  critical: boolean; // Critique à changer
  frequency: string; // Fréquence de changement
  price: number;
  note?: string;
}

export interface FilterRecommendation {
  filters: FilterProduct[];
  mandatoryFilters: FilterProduct[];
  optionalFilters: FilterProduct[];
  notes: string[];
}

export interface CategoryRecommendations {
  category: VehicleCategoryInfo;
  title: string;
  subtitle: string;
  oil: OilRecommendation;
  filters: FilterRecommendation;
  whatsAppTemplate: {
    header: string;
    body: string;
    footer: string;
  };
  additionalChecks: string[];
}

// =============================================================================
// BASE DE DONNÉES DES HUILES
// =============================================================================

const OILS_DATABASE: Record<string, OilProduct> = {
  // ═══════════════════════════════════════════════════════════════
  // HUILES POIDS LOURDS (Heavy Duty)
  // ═══════════════════════════════════════════════════════════════
  'hd-15w40-20l': {
    id: 'hd-15w40-20l',
    name: '15W-40 Heavy Duty',
    viscosity: '15W-40',
    type: 'mineral',
    spec: 'API CI-4 / ACEA E7',
    capacity: 'Bidon 20L',
    price: 45000,
    isHeavyDuty: true,
    brands: ['Total Rubia', 'Shell Rimula', 'Mobil Delvac', 'Castrol Tection'],
    recommended: true,
    badge: 'Heavy Duty'
  },
  'hd-15w40-5l': {
    id: 'hd-15w40-5l',
    name: '15W-40 Heavy Duty',
    viscosity: '15W-40',
    type: 'mineral',
    spec: 'API CI-4 / ACEA E7',
    capacity: 'Bidon 5L',
    price: 12000,
    isHeavyDuty: true,
    brands: ['Total Rubia', 'Shell Rimula', 'Mobil Delvac'],
    recommended: true,
    badge: 'Heavy Duty'
  },
  'hd-20w50-20l': {
    id: 'hd-20w50-20l',
    name: '20W-50 Heavy Duty',
    viscosity: '20W-50',
    type: 'mineral',
    spec: 'API CH-4 / ACEA E5',
    capacity: 'Bidon 20L',
    price: 42000,
    isHeavyDuty: true,
    brands: ['Total Rubia', 'Shell Rimula'],
    recommended: false,
    badge: 'Moteurs Anciens'
  },

  // ═══════════════════════════════════════════════════════════════
  // HUILES UTILITAIRES DIESEL
  // ═══════════════════════════════════════════════════════════════
  'util-10w40-5l': {
    id: 'util-10w40-5l',
    name: '10W-40 Diesel Robuste',
    viscosity: '10W-40',
    type: 'semi-synthese',
    spec: 'API CF/SL / ACEA A3/B4',
    capacity: 'Bidon 5L',
    price: 15000,
    brands: ['Total Quartz', 'Shell Helix', 'Mobil Super'],
    recommended: true,
    badge: 'Diesel Robuste'
  },
  'util-5w30-5l': {
    id: 'util-5w30-5l',
    name: '5W-30 Diesel Euro 6',
    viscosity: '5W-30',
    type: 'synthese',
    spec: 'API SN / ACEA C3',
    capacity: 'Bidon 5L',
    price: 25000,
    brands: ['Total Quartz', 'Shell Helix Ultra', 'Mobil 1'],
    recommended: false,
    badge: 'Euro 6 Récent'
  },

  // ═══════════════════════════════════════════════════════════════
  // HUILES VOITURES NEUVES / SYNTHÉTIQUES
  // ═══════════════════════════════════════════════════════════════
  'new-0w20-5l': {
    id: 'new-0w20-5l',
    name: '0W-20 Full Synthetic',
    viscosity: '0W-20',
    type: 'synthese',
    spec: 'API SP / ACEA C5 / ILSAC GF-6',
    capacity: 'Bidon 5L',
    price: 35000,
    isManufacturerApproved: true,
    brands: ['Total Quartz Ineo', 'Shell Helix Ultra', 'Mobil 1 ESP'],
    recommended: true,
    badge: 'Homologué Constructeur'
  },
  'new-5w30-5l': {
    id: 'new-5w30-5l',
    name: '5W-30 Full Synthetic',
    viscosity: '5W-30',
    type: 'synthese',
    spec: 'API SN Plus / ACEA C3',
    capacity: 'Bidon 5L',
    price: 30000,
    isManufacturerApproved: true,
    brands: ['Total Quartz Ineo', 'Shell Helix Ultra', 'Mobil 1'],
    recommended: true,
    badge: 'Homologué Constructeur'
  },
  'new-5w40-5l': {
    id: 'new-5w40-5l',
    name: '5W-40 Full Synthetic',
    viscosity: '5W-40',
    type: 'synthese',
    spec: 'API SN / ACEA C3',
    capacity: 'Bidon 5L',
    price: 28000,
    isManufacturerApproved: true,
    brands: ['Total Quartz', 'Shell Helix Ultra', 'Mobil 1'],
    recommended: false,
    badge: 'Performance'
  },

  // ═══════════════════════════════════════════════════════════════
  // HUILES STANDARD / ANCIENNES
  // ═══════════════════════════════════════════════════════════════
  'std-10w40-5l': {
    id: 'std-10w40-5l',
    name: '10W-40 Standard',
    viscosity: '10W-40',
    type: 'semi-synthese',
    spec: 'API SL/CF / ACEA A3/B4',
    capacity: 'Bidon 5L',
    price: 10000,
    brands: ['Total Quartz', 'Shell Helix', 'Mobil Super', 'Elf'],
    recommended: true
  },
  'std-15w40-5l': {
    id: 'std-15w40-5l',
    name: '15W-40 Minéral',
    viscosity: '15W-40',
    type: 'mineral',
    spec: 'API SG/CD',
    capacity: 'Bidon 5L',
    price: 8000,
    brands: ['Total', 'Shell', 'Elf'],
    recommended: false,
    badge: 'Économique'
  },
  'std-20w50-5l': {
    id: 'std-20w50-5l',
    name: '20W-50 Classic',
    viscosity: '20W-50',
    type: 'mineral',
    spec: 'API SG/CD',
    capacity: 'Bidon 5L',
    price: 7500,
    brands: ['Total', 'Shell', 'Elf', 'Motul'],
    recommended: false,
    badge: 'Moteurs Usés'
  }
};

// =============================================================================
// BASE DE DONNÉES DES FILTRES
// =============================================================================

const FILTERS_DATABASE: Record<string, FilterProduct> = {
  'oil-filter-standard': {
    id: 'oil-filter-standard',
    name: 'Filtre à Huile',
    type: 'oil_filter',
    critical: true,
    frequency: 'À chaque vidange',
    price: 2500,
    note: 'Obligatoire à chaque vidange'
  },
  'oil-filter-cartridge': {
    id: 'oil-filter-cartridge',
    name: 'Filtre à Huile (Cartouche)',
    type: 'oil_filter',
    critical: true,
    frequency: 'À chaque vidange',
    price: 3500,
    note: 'Type cartouche pour certains modèles (Toyota, BMW)'
  },
  'air-filter-standard': {
    id: 'air-filter-standard',
    name: 'Filtre à Air',
    type: 'air_filter',
    critical: false,
    frequency: 'Tous les 15 000 - 20 000 km',
    price: 4000,
    note: 'Important pour véhicules en zone poussiéreuse'
  },
  'air-filter-heavy': {
    id: 'air-filter-heavy',
    name: 'Filtre à Air (Poids Lourd)',
    type: 'air_filter',
    critical: false,
    frequency: 'À vérifier régulièrement',
    price: 15000,
    note: 'Filtre à air double étage pour poids lourds'
  },
  'fuel-filter-diesel': {
    id: 'fuel-filter-diesel',
    name: 'Filtre à Gasoil',
    type: 'fuel_filter',
    critical: true,
    frequency: 'Tous les 20 000 - 30 000 km',
    price: 6000,
    note: '⚠️ CRUCIAL au Sénégal - Qualité gasoil variable'
  },
  'fuel-filter-heavy': {
    id: 'fuel-filter-heavy',
    name: 'Filtre à Gasoil (Poids Lourd)',
    type: 'fuel_filter',
    critical: true,
    frequency: 'Tous les 15 000 km',
    price: 18000,
    note: '⚠️ CRUCIAL pour camions - Risque de panne'
  },
  'water-separator': {
    id: 'water-separator',
    name: 'Séparateur d\'Eau',
    type: 'water_separator',
    critical: true,
    frequency: 'Vérification à chaque vidange',
    price: 12000,
    note: 'Indispensable pour protéger le système d\'injection'
  },
  'cabin-filter': {
    id: 'cabin-filter',
    name: 'Filtre d\'Habitacle',
    type: 'cabin_filter',
    critical: false,
    frequency: 'Tous les 20 000 km',
    price: 5000,
    note: 'Confort passagers'
  }
};

// =============================================================================
// RÈGLES PAR CATÉGORIE
// =============================================================================

export function getRecommendationsForCategory(category: VehicleCategory): CategoryRecommendations {
  const config = CATEGORY_CONFIG[category];

  switch (category) {
    case 'A': // POIDS LOURD
      return {
        category: config,
        title: '🚛 Assistant Vidange Poids Lourd',
        subtitle: 'Détection: Moteur Diesel Lourd. Climat chaud.',
        oil: {
          primary: [OILS_DATABASE['hd-15w40-20l'], OILS_DATABASE['hd-15w40-5l']],
          alternatives: [OILS_DATABASE['hd-20w50-20l']],
          estimatedQuantity: { min: 20, max: 35, recommended: 24, unit: 'Litres' },
          notes: [
            'Huile Heavy Duty obligatoire pour moteurs diesel lourds',
            'Viscosité 15W-40 adaptée au climat sénégalais',
            'Prévoir plusieurs bidons de 20L'
          ],
          warnings: [
            'Ne jamais utiliser d\'huile voiture sur un poids lourd',
            'Vérifier la spécification API CI-4 minimum'
          ]
        },
        filters: {
          filters: [
            FILTERS_DATABASE['oil-filter-cartridge'],
            FILTERS_DATABASE['fuel-filter-heavy'],
            FILTERS_DATABASE['water-separator'],
            FILTERS_DATABASE['air-filter-heavy']
          ],
          mandatoryFilters: [
            FILTERS_DATABASE['oil-filter-cartridge'],
            FILTERS_DATABASE['fuel-filter-heavy']
          ],
          optionalFilters: [
            FILTERS_DATABASE['water-separator'],
            FILTERS_DATABASE['air-filter-heavy']
          ],
          notes: [
            'Filtre à gasoil CRUCIAL au Sénégal',
            'Séparateur d\'eau à vérifier impérativement',
            'Filtre à air selon indicateur d\'encrassement'
          ]
        },
        whatsAppTemplate: {
          header: '🚛 Vidange Poids Lourd Effectuée',
          body: 'Bonjour, votre véhicule {{plateNumber}} a reçu une vidange complète:\n• {{quantity}}L d\'huile 15W-40 Heavy Duty\n• Filtres changés: {{filters}}',
          footer: 'Bonnes routes ! 🛣️\nVotre garage OKAR'
        },
        additionalChecks: [
          'Vérifier le niveau de liquide de refroidissement',
          'Inspecter l\'état des courroies',
          'Contrôler la pression des pneus',
          'Vérifier les freins (importance pour PL)'
        ]
      };

    case 'B': // UTILITAIRE
      return {
        category: config,
        title: '🚐 Assistant Vidange Utilitaire',
        subtitle: 'Détection: Utilitaire Diesel. Usage intensif probable.',
        oil: {
          primary: [OILS_DATABASE['util-10w40-5l']],
          alternatives: [OILS_DATABASE['util-5w30-5l'], OILS_DATABASE['std-10w40-5l']],
          estimatedQuantity: { min: 6, max: 9, recommended: 7, unit: 'Litres' },
          notes: [
            'Huile 10W-40 robuste pour usage intensif',
            'Si Euro 6 récent, préférer 5W-30',
            'Vérifier le carnet d\'entretien'
          ],
          warnings: [
            'Filtre à gasoil recommandé (qualité carburant)',
            'Filtre à air à surveiller (environnement poussiéreux)'
          ]
        },
        filters: {
          filters: [
            FILTERS_DATABASE['oil-filter-standard'],
            FILTERS_DATABASE['fuel-filter-diesel'],
            FILTERS_DATABASE['air-filter-standard']
          ],
          mandatoryFilters: [
            FILTERS_DATABASE['oil-filter-standard']
          ],
          optionalFilters: [
            FILTERS_DATABASE['fuel-filter-diesel'],
            FILTERS_DATABASE['air-filter-standard']
          ],
          notes: [
            'Filtre à gasoil fortement recommandé',
            'Filtre à air important pour véhicules chargés',
            'Contrôler le niveau d\'huile de boîte'
          ]
        },
        whatsAppTemplate: {
          header: '🚐 Vidange Utilitaire Effectuée',
          body: 'Bonjour, votre {{brand}} {{model}} a reçu une vidange:\n• {{quantity}}L d\'huile {{oilType}}\n• Filtres changés: {{filters}}',
          footer: 'Merci de votre confiance !\nVotre garage OKAR'
        },
        additionalChecks: [
          'Filtre à air à vérifier (environnement poussiéreux)',
          'Vérifier le niveau d\'huile de boîte',
          'Contrôler les freins (charge importante)'
        ]
      };

    case 'C': // VOITURE NEUVE
      return {
        category: config,
        title: '🚗 Entretien Constructeur (Garantie)',
        subtitle: '⚠️ Véhicule récent. Respect strict des normes requis.',
        oil: {
          primary: [OILS_DATABASE['new-5w30-5l'], OILS_DATABASE['new-0w20-5l']],
          alternatives: [OILS_DATABASE['new-5w40-5l']],
          estimatedQuantity: { min: 3, max: 5, recommended: 4, unit: 'Litres' },
          notes: [
            'Huile synthétique HOMOLOGUÉE CONSTRUCTEUR obligatoire',
            'Préserver la garantie constructeur',
            'Conserver la facture pour le carnet'
          ],
          warnings: [
            '⚠️ ATTENTION: Huile non homologuée = perte de garantie',
            'Vérifier la viscosité recommandée dans le manuel',
            'Mettre à jour le carnet d\'entretien'
          ]
        },
        filters: {
          filters: [
            FILTERS_DATABASE['oil-filter-standard']
          ],
          mandatoryFilters: [
            FILTERS_DATABASE['oil-filter-standard']
          ],
          optionalFilters: [],
          notes: [
            'Filtre à air non requis avant 20 000 km',
            'Joint de bouchon selon spécification constructeur'
          ]
        },
        whatsAppTemplate: {
          header: '🚗 Entretien Périodique Effectué',
          body: 'Bonjour, votre {{brand}} {{model}} a reçu un entretien périodique:\n• Huile synthétique homologuée constructeur\n• Garantie préservée ✓',
          footer: 'Carnet de garantie mis à jour.\nVotre garage OKAR'
        },
        additionalChecks: [
          '⚠️ Utiliser uniquement huile homologuée constructeur',
          'Mettre à jour le carnet de garantie',
          'Conserver les factures pour la garantie'
        ]
      };

    case 'D': // STANDARD / ANCIEN
    default:
      return {
        category: config,
        title: '🚙 Assistant Vidange Standard',
        subtitle: 'Véhicule particulier classique.',
        oil: {
          primary: [OILS_DATABASE['std-10w40-5l']],
          alternatives: [OILS_DATABASE['std-15w40-5l'], OILS_DATABASE['std-20w50-5l']],
          estimatedQuantity: { min: 3, max: 5, recommended: 4, unit: 'Litres' },
          notes: [
            '10W-40 adapté à la plupart des véhicules',
            'Si moteur usé, 15W-40 ou 20W-50 possible',
            'Joint de bouchon à prévoir'
          ],
          warnings: [
            'Vérifier l\'état des joints moteur',
            'Contrôler si fuites éventuelles'
          ]
        },
        filters: {
          filters: [
            FILTERS_DATABASE['oil-filter-standard'],
            FILTERS_DATABASE['air-filter-standard'],
            FILTERS_DATABASE['fuel-filter-diesel']
          ],
          mandatoryFilters: [
            FILTERS_DATABASE['oil-filter-standard']
          ],
          optionalFilters: [
            FILTERS_DATABASE['air-filter-standard'],
            FILTERS_DATABASE['fuel-filter-diesel']
          ],
          notes: [
            'Joint de bouchon obligatoire',
            'Filtre à air à nettoyer/vérifier',
            'Filtre à gasoil selon kilométrage'
          ]
        },
        whatsAppTemplate: {
          header: '🚙 Vidange Effectuée',
          body: 'Bonjour, votre {{brand}} {{model}} a reçu une vidange:\n• {{quantity}}L d\'huile {{oilType}}\n• Filtre à huile changé',
          footer: 'Prochaine vidange dans 5 000 km.\nVotre garage OKAR'
        },
        additionalChecks: [
          'Vérifier l\'état des joints',
          'Contrôler le liquide de refroidissement',
          'Nettoyer le filtre à air si nécessaire'
        ]
      };
  }
}

// =============================================================================
// UTILITAIRES
// =============================================================================

/**
 * Calcule le prix estimé de la vidange
 */
export function estimateOilChangePrice(
  category: VehicleCategory,
  quantity: number,
  selectedFilters: string[]
): { oilPrice: number; filtersPrice: number; total: number } {
  const recommendations = getRecommendationsForCategory(category);
  const primaryOil = recommendations.oil.primary[0];
  
  // Calcul prix huile
  const litersPerUnit = primaryOil.capacity.includes('20L') ? 20 : 5;
  const unitsNeeded = Math.ceil(quantity / litersPerUnit);
  const oilPrice = unitsNeeded * primaryOil.price;
  
  // Calcul prix filtres
  let filtersPrice = 0;
  for (const filterId of selectedFilters) {
    const filter = FILTERS_DATABASE[filterId];
    if (filter) {
      filtersPrice += filter.price;
    }
  }
  
  return {
    oilPrice,
    filtersPrice,
    total: oilPrice + filtersPrice
  };
}

/**
 * Génère le message WhatsApp personnalisé
 */
export function generateWhatsAppMessage(
  category: VehicleCategory,
  vehicleData: {
    plateNumber: string;
    brand: string;
    model: string;
  },
  serviceData: {
    quantity: number;
    oilType: string;
    filters: string[];
  }
): string {
  const recommendations = getRecommendationsForCategory(category);
  const template = recommendations.whatsAppTemplate;
  
  let message = template.header + '\n\n';
  message += template.body
    .replace('{{plateNumber}}', vehicleData.plateNumber)
    .replace('{{brand}}', vehicleData.brand)
    .replace('{{model}}', vehicleData.model)
    .replace('{{quantity}}', serviceData.quantity.toString())
    .replace('{{oilType}}', serviceData.oilType)
    .replace('{{filters}}', serviceData.filters.join(', '));
  message += '\n\n' + template.footer;
  
  return message;
}

/**
 * Retourne la liste des huiles disponibles filtrées par catégorie
 */
export function getAvailableOils(category: VehicleCategory): OilProduct[] {
  switch (category) {
    case 'A':
      return Object.values(OILS_DATABASE).filter(o => o.isHeavyDuty);
    case 'B':
      return Object.values(OILS_DATABASE).filter(o => 
        o.viscosity === '10W-40' || o.viscosity === '5W-30'
      );
    case 'C':
      return Object.values(OILS_DATABASE).filter(o => 
        o.type === 'synthese' && o.isManufacturerApproved
      );
    case 'D':
    default:
      return Object.values(OILS_DATABASE).filter(o => 
        !o.isHeavyDuty && ['10W-40', '15W-40', '20W-50'].includes(o.viscosity)
      );
  }
}

export { OILS_DATABASE, FILTERS_DATABASE };
export default getRecommendationsForCategory;
