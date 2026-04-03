import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tickets = [
      { id: 'tk-001', subject: 'Problème de connexion QR', companyName: 'CleanPro Services', priority: 'high', status: 'resolved', assignedTo: 'Super Admin', createdAt: '2025-01-10T10:00:00Z' },
      { id: 'tk-002', subject: 'Demande de changement de forfait', companyName: 'CleanPro Services', priority: 'medium', status: 'open', assignedTo: 'Super Admin', createdAt: '2025-01-14T15:30:00Z' },
      { id: 'tk-003', subject: 'Bug dans les scores qualité', companyName: 'CleanPro Services', priority: 'critical', status: 'in_progress', assignedTo: 'Super Admin', createdAt: '2025-01-15T09:00:00Z' },
      { id: 'tk-004', subject: 'Agent ne peut pas scanner le QR', companyName: 'Nettexpert', priority: 'high', status: 'open', assignedTo: null, createdAt: '2025-01-15T11:00:00Z' },
      { id: 'tk-005', subject: 'Mise à jour des informations sociétés', companyName: 'Propreté Plus', priority: 'low', status: 'closed', assignedTo: 'Super Admin', createdAt: '2025-01-12T14:00:00Z' },
      { id: 'tk-006', subject: 'Facturation incorrecte', companyName: 'MaintenPro', priority: 'high', status: 'open', assignedTo: null, createdAt: '2025-01-15T08:30:00Z' },
      { id: 'tk-007', subject: 'Nouveau modèle de checklist', companyName: 'Hygiène Services', priority: 'medium', status: 'in_progress', assignedTo: 'Super Admin', createdAt: '2025-01-13T16:00:00Z' },
      { id: 'tk-008', subject: 'Accès refusé pour un agent', companyName: 'CleanOffice', priority: 'high', status: 'resolved', assignedTo: 'Super Admin', createdAt: '2025-01-11T10:30:00Z' },
      { id: 'tk-009', subject: 'Demande de fonctionnalité export', companyName: 'Nettexpert', priority: 'low', status: 'open', assignedTo: null, createdAt: '2025-01-14T09:00:00Z' },
      { id: 'tk-010', subject: 'Erreur 500 sur le dashboard', companyName: 'Brillance SAS', priority: 'critical', status: 'in_progress', assignedTo: 'Super Admin', createdAt: '2025-01-15T12:00:00Z' },
    ]

    return NextResponse.json(tickets)
  } catch {
    return NextResponse.json([])
  }
}
