import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Démarrage de la migration de la base de données...');
    
    // Exécuter prisma db push pour synchroniser le schéma
    const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate', {
      cwd: process.cwd(),
      env: process.env,
      timeout: 60000
    });
    
    console.log('Migration stdout:', stdout);
    if (stderr) {
      console.log('Migration stderr:', stderr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration de la base de données effectuée avec succès',
      stdout: stdout,
      stderr: stderr || undefined
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la migration:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur inconnue',
      stdout: error.stdout || undefined,
      stderr: error.stderr || undefined,
      solution: 'Vérifiez les logs du serveur pour plus de détails'
    }, { status: 500 });
  }
}
