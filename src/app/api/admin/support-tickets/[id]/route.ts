import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ticket = {
      id,
      subject: 'Problème de connexion QR',
      status: 'in_progress',
      priority: 'high',
      companyName: 'CleanPro Services',
      assignedTo: 'Super Admin',
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-15T09:00:00Z',
      messages: [
        { id: 'm1', senderName: 'Marie Dupont', senderRole: 'user', content: 'Bonjour, nos agents ne peuvent plus scanner les QR codes depuis ce matin. L\'application affiche "Code invalide" pour tous les codes.', createdAt: '2025-01-10T10:00:00Z' },
        { id: 'm2', senderName: 'Super Admin', senderRole: 'admin', content: 'Bonjour Marie, merci pour votre signalement. Je vais vérifier le système de QR codes immédiatement. Pouvez-vous me confirmer la version de l\'application que vous utilisez ?', createdAt: '2025-01-10T10:30:00Z' },
        { id: 'm3', senderName: 'Marie Dupont', senderRole: 'user', content: 'Nous utilisons la version 2.3.1. Le problème est survenu après la mise à jour d\'hier.', createdAt: '2025-01-10T11:00:00Z' },
        { id: 'm4', senderName: 'Super Admin', senderRole: 'admin', content: 'Merci pour cette information. Nous avons identifié un problème dans la génération des tokens QR après la mise à jour. Nous déployons un correctif qui sera actif d\'ici 2 heures.', createdAt: '2025-01-10T14:00:00Z' },
        { id: 'm5', senderName: 'Super Admin', senderRole: 'admin', content: 'Le correctif a été déployé. Pouvez-vous tester à nouveau les QR codes et me confirmer que tout fonctionne ?', createdAt: '2025-01-10T16:00:00Z' },
        { id: 'm6', senderName: 'Marie Dupont', senderRole: 'user', content: 'C\'est parfait, tout fonctionne à nouveau ! Merci pour la réactivité.', createdAt: '2025-01-10T16:30:00Z' },
        { id: 'm7', senderName: 'Super Admin', senderRole: 'admin', content: 'Excellent ! Je marque le ticket comme résolu. N\'hésitez pas à nous contacter si le problème réapparaît.', createdAt: '2025-01-10T16:45:00Z' },
      ],
    }

    return NextResponse.json(ticket)
  } catch {
    return NextResponse.json(
      {
        id: 'unknown',
        subject: 'Ticket non trouvé',
        status: 'open',
        priority: 'medium',
        companyName: 'Inconnu',
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      },
      { status: 200 }
    )
  }
}
