'use client'

import Script from 'next/script'

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
    ...(address && { address: {
      '@type': 'PostalAddress',
      ...address,
    }}),
    sameAs: [
      'https://facebook.com/okarsenegal',
      'https://twitter.com/okarsenegal',
      'https://instagram.com/okarsenegal',
    ],
  }

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

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
  }

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

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
}: LocalBusinessJsonLdProps) {
  const data = {
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
  }

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface ServiceJsonLdProps {
  name: string
  description: string
  provider: string
  url: string
  serviceType?: string
  areaServed?: string
}

export function ServiceJsonLd({
  name,
  description,
  provider,
  url,
  serviceType,
  areaServed,
}: ServiceJsonLdProps) {
  const data = {
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
    ...(areaServed && { areaServed }),
  }

  return (
    <Script
      id="service-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

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
