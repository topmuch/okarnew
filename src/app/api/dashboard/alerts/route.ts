import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json([
      { id: '1', type: 'overdue', message: 'Intervention Hôtel Riviera en retard depuis 2h', time: 'Il y a 2h' },
      { id: '2', type: 'upcoming', message: 'Intervention Clinique Santé+ dans 30 minutes', time: 'Il y a 5min' },
      { id: '3', type: 'low_score', message: 'Score qualité de Marc D. sous la moyenne (3.2/5)', time: 'Hier' },
    ])
  } catch (error) {
    return NextResponse.json([])
  }
}
