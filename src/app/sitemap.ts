import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cleancheck.app'
  const now = new Date()

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ]

  // Pages dynamiques : Rapports clients publics
  try {
    const interventions = await db.intervention.findMany({
      where: { status: 'completed', clientReportUrl: { not: null } },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })

    const reportPages: MetadataRoute.Sitemap = interventions.map((intervention) => ({
      url: `${baseUrl}/report/${intervention.id}`,
      lastModified: intervention.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    staticPages.push(...reportPages)
  } catch (error) {
    console.warn('Sitemap: Impossible de charger les rapports clients', error)
  }

  return staticPages
}
