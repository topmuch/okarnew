import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = {
      scoring: {
        key: 'scoring',
        label: 'Scoring',
        icon: 'Target',
        configs: [
          { key: 'score_weights_punctuality', label: 'Poids ponctualité (%)', type: 'number', value: 25, description: 'Impact de la ponctualité sur le score global' },
          { key: 'score_weights_completion', label: 'Poids complétion (%)', type: 'number', value: 30, description: 'Impact du taux de complétion des checklists' },
          { key: 'score_weights_rating', label: 'Poids note client (%)', type: 'number', value: 25, description: 'Impact de la satisfaction client' },
          { key: 'score_weights_regularity', label: 'Poids régularité (%)', type: 'number', value: 10, description: 'Impact de la régularité des interventions' },
          { key: 'score_weights_reactivity', label: 'Poids réactivité (%)', type: 'number', value: 10, description: 'Impact du temps de réponse' },
          { key: 'score_min_interventions', label: 'Nombre min. interventions pour scoring', type: 'number', value: 5 },
        ],
      },
      qrcode: {
        key: 'qrcode',
        label: 'QR Code',
        icon: 'QrCode',
        configs: [
          { key: 'qr_expiry_hours', label: 'Durée de validité QR (heures)', type: 'number', value: 24, description: 'Durée avant expiration du code QR' },
          { key: 'qr_pin_length', label: 'Longueur du code PIN', type: 'number', value: 6 },
          { key: 'qr_auto_complete', label: 'Auto-complétion après scan', type: 'toggle', value: true },
          { key: 'qr_require_photo', label: 'Photo obligatoire', type: 'toggle', value: false },
        ],
      },
      email: {
        key: 'email',
        label: 'Email',
        icon: 'Mail',
        configs: [
          { key: 'email_from_address', label: 'Adresse d\'expédition', type: 'text', value: 'noreply@cleancheck.fr' },
          { key: 'email_from_name', label: 'Nom d\'expédition', type: 'text', value: 'CleanCheck' },
          { key: 'email_rating_reminder', label: 'Rappel de notation activé', type: 'toggle', value: true },
          { key: 'email_rating_reminder_hours', label: 'Délai rappel notation (heures)', type: 'number', value: 48 },
        ],
      },
      sms: {
        key: 'sms',
        label: 'SMS',
        icon: 'MessageSquare',
        configs: [
          { key: 'sms_enabled', label: 'SMS activé', type: 'toggle', value: false },
          { key: 'sms_provider', label: 'Fournisseur SMS', type: 'text', value: 'twilio' },
          { key: 'sms_from_number', label: 'Numéro d\'expédition', type: 'text', value: '+33612345678' },
        ],
      },
      storage: {
        key: 'storage',
        label: 'Stockage',
        icon: 'HardDrive',
        configs: [
          { key: 'storage_provider', label: 'Fournisseur', type: 'text', value: 'local' },
          { key: 'storage_max_file_size_mb', label: 'Taille max fichier (Mo)', type: 'number', value: 10 },
          { key: 'storage_auto_compress', label: 'Auto-compression images', type: 'toggle', value: true },
        ],
      },
      general: {
        key: 'general',
        label: 'Général',
        icon: 'Globe',
        configs: [
          { key: 'app_name', label: 'Nom de l\'application', type: 'text', value: 'CleanCheck' },
          { key: 'app_url', label: 'URL de l\'application', type: 'text', value: 'https://cleancheck.fr' },
          { key: 'default_language', label: 'Langue par défaut', type: 'text', value: 'fr' },
          { key: 'timezone', label: 'Fuseau horaire', type: 'text', value: 'Europe/Paris' },
          { key: 'maintenance_mode', label: 'Mode maintenance', type: 'toggle', value: false },
        ],
      },
    }

    return NextResponse.json(Object.values(config))
  } catch {
    return NextResponse.json([])
  }
}
