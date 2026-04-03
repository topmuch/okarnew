'use client'

import Script from 'next/script'

// ============================================================================
// ORGANIZATION - Pour la Homepage
// ============================================================================

interface OrganizationJsonLdProps {
  name: string
  url: string
  logo?: string
  description?: string
  telephone?: string
  email?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressCountry: string
  }
}

export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
  telephone,
  email,
  address,
}: OrganizationJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    sameAs: [
      'https://facebook.com/okarsenegal',
      'https://twitter.com/okarsenegal',
      'https://instagram.com/okarsenegal',
    ],
    foundingDate: '2023',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 10,
      maxValue: 50,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sénégal',
    },
  }

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// WEBSITE - Avec SearchAction pour le sitelinks Google
// ============================================================================

interface WebSiteJsonLdProps {
  name: string
  url: string
  description?: string
  potentialAction?: {
    target: string | string[]
    queryInput?: string
  }
}

export function WebSiteJsonLd({
  name,
  url,
  description,
  potentialAction,
}: WebSiteJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(description && { description }),
    ...(potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: potentialAction.target,
        'query-input': potentialAction.queryInput || 'required name=search_term_string',
      },
    }),
    inLanguage: 'fr',
  }

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// LOCAL BUSINESS / AUTO REPAIR - Pour les profils Garages
// ============================================================================

interface LocalBusinessJsonLdProps {
  name: string
  url: string
  description?: string
  telephone?: string
  email?: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion?: string
    postalCode?: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[]
  priceRange?: string
  image?: string
  ratingValue?: number
  reviewCount?: number
}

export function LocalBusinessJsonLd({
  name,
  url,
  description,
  telephone,
  email,
  address,
  geo,
  openingHours,
  priceRange,
  image,
  ratingValue,
  reviewCount,
}: LocalBusinessJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name,
    url,
    ...(description && { description }),
    ...(telephone && { telephone }),
    ...(email && { email }),
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    ...(geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(openingHours && { openingHours }),
    ...(priceRange && { priceRange }),
    ...(image && { image }),
    ...(ratingValue && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue,
        bestRating: 5,
        worstRating: 1,
        ...(reviewCount && { reviewCount }),
      },
    }),
  }

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// SERVICE - Pour les pages de services
// ============================================================================

interface ServiceJsonLdProps {
  name: string
  description: string
  provider: string
  url: string
  serviceType?: string
  areaServed?: string
  offers?: {
    price: string
    priceCurrency: string
    availability?: string
  }
}

export function ServiceJsonLd({
  name,
  description,
  provider,
  url,
  serviceType,
  areaServed,
  offers,
}: ServiceJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    url,
    ...(serviceType && { serviceType }),
    ...(areaServed && { areaServed: { '@type': 'Country', name: areaServed } }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
        ...(offers.availability && { availability: offers.availability }),
      },
    }),
  }

  return (
    <Script
      id="service-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// PRODUCT - Pour le rapport véhicule (1000 FCFA)
// ============================================================================

interface ProductJsonLdProps {
  name: string
  description: string
  url: string
  image?: string
  price: string
  priceCurrency: string
  availability?: string
  seller: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export function ProductJsonLd({
  name,
  description,
  url,
  image,
  price,
  priceCurrency,
  availability = 'https://schema.org/InStock',
  seller,
  aggregateRating,
}: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    ...(image && { image }),
    brand: {
      '@type': 'Brand',
      name: 'OKAR',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
      availability,
      seller: {
        '@type': 'Organization',
        name: seller,
      },
    },
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        bestRating: 5,
        worstRating: 1,
        reviewCount: aggregateRating.reviewCount,
      },
    }),
  }

  return (
    <Script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// ARTICLE - Pour les pages du Blog
// ============================================================================

interface ArticleJsonLdProps {
  title: string
  description: string
  url: string
  image?: string
  datePublished: string
  dateModified?: string
  authorName?: string
  publisherName?: string
  publisherLogo?: string
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'OKAR Team',
  publisherName = 'OKAR',
  publisherLogo = 'https://shopqr.pro/icons/icon-512x512.png',
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    ...(image && { image }),
    datePublished,
    ...(dateModified && { dateModified }),
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    inLanguage: 'fr',
  }

  return (
    <Script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// FAQ - Pour les pages FAQ (aide au référencement Featured Snippets)
// ============================================================================

interface FaqItem {
  question: string
  answer: string
}

interface FaqJsonLdProps {
  faqs: FaqItem[]
}

export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ============================================================================
// BREADCRUMB - Pour la navigation fil d'Ariane
// ============================================================================

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
