import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Démarrage de la migration de la base de données...');
    console.log('Current working directory:', process.cwd());
    
    // D'abord, essayer de créer la table BlogPost directement avec SQL
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BlogPost" (
          "id" TEXT PRIMARY KEY,
          "title" TEXT NOT NULL,
          "slug" TEXT NOT NULL UNIQUE,
          "content" TEXT NOT NULL,
          "excerpt" TEXT,
          "coverImage" TEXT,
          "category" TEXT NOT NULL,
          "tags" TEXT,
          "status" TEXT NOT NULL DEFAULT 'draft',
          "authorId" TEXT NOT NULL,
          "publishedAt" DATETIME,
          "viewCount" INTEGER NOT NULL DEFAULT 0,
          "readingTime" INTEGER NOT NULL DEFAULT 5,
          "metaTitle" TEXT,
          "metaDescription" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Table BlogPost créée avec succès');
      
      // Créer les index
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogPost_status_idx" ON "BlogPost"("status")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogPost_authorId_idx" ON "BlogPost"("authorId")`);
      
      console.log('Index créés avec succès');
      
      return NextResponse.json({
        success: true,
        message: 'Table BlogPost créée avec succès via SQL',
        method: 'direct-sql'
      });
      
    } catch (sqlError: any) {
      console.log('Erreur SQL, tentative avec prisma db push:', sqlError.message);
      
      // Fallback: essayer prisma db push
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      
      try {
        const { stdout, stderr } = await execAsync(`npx prisma db push --schema="${schemaPath}" --skip-generate`, {
          cwd: process.cwd(),
          env: process.env,
          timeout: 120000
        });
        
        return NextResponse.json({
          success: true,
          message: 'Migration effectuée avec prisma db push',
          stdout: stdout,
          stderr: stderr || undefined,
          method: 'prisma-db-push'
        });
        
      } catch (prismaError: any) {
        // Si prisma db push échoue aussi, retourner l'erreur SQL
        throw sqlError;
      }
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la migration:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur inconnue',
      cwd: process.cwd(),
      solution: 'Vérifiez les logs du serveur pour plus de détails'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
