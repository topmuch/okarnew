import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const flags = [
      { key: 'qr_v2', name: 'QR Code V2', description: 'Nouveau format de QR code avec signature cryptographique', enabled: true },
      { key: 'ai_scoring', name: 'IA Scoring', description: 'Utilisation de l\'IA pour l\'analyse des scores qualité', enabled: false },
      { key: 'multi_company', name: 'Multi-sociétés', description: 'Permettre à un agent d\'appartenir à plusieurs sociétés', enabled: true },
      { key: 'client_portal', name: 'Portail Client', description: 'Accès client pour suivre les interventions en temps réel', enabled: true },
      { key: 'bulk_import', name: 'Import en masse', description: 'Importation CSV des clients et interventions', enabled: false },
      { key: 'api_v2', name: 'API V2', description: 'Nouvelle version de l\'API avec endpoints RESTful', enabled: true },
      { key: 'dark_mode', name: 'Mode sombre', description: 'Thème sombre pour le dashboard', enabled: false },
      { key: 'realtime_notifications', name: 'Notifications temps réel', description: 'Notifications push et WebSocket en temps réel', enabled: true },
    ]

    return NextResponse.json(flags)
  } catch {
    return NextResponse.json([])
  }
}
