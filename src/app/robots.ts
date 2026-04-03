import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://shopqr.pro'

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/superadmin/', '/debug/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/superadmin/', '/debug/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/superadmin/', '/debug/', '/login', '/register'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
