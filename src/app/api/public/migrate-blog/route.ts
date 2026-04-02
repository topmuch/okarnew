/**
 * OKAR - Blog Migration API
 * Creates the BlogPost table if it doesn't exist
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/public/migrate-blog - Check and create BlogPost table
export async function GET(request: NextRequest) {
  try {
    // Test if BlogPost table exists by trying to count
    const count = await db.blogPost.count()
    
    return NextResponse.json({
      success: true,
      message: 'Table BlogPost existe déjà',
      count
    })
  } catch (error: any) {
    console.log('BlogPost table check error:', error.message)
    
    // If table doesn't exist, we need to run Prisma migration
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'Table BlogPost non trouvée',
        solution: 'Exécutez "npx prisma db push" ou "npx prisma migrate dev" sur le serveur pour créer la table.',
        hint: 'La table BlogPost doit être créée dans la base de données SQLite.'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}

// POST /api/public/migrate-blog - Force check
export async function POST(request: NextRequest) {
  return GET(request)
}
