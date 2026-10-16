import { EXTRA_DISCOVERIES } from './discoveries.js'

export const SITE_URL = 'https://cosmicgaze.chrbuilds.dev'
export const SEO_PAGES = {
  '/': { title: 'Cosmicgaze — Birthday NASA Pictures, Moon Phases & Planets', description: 'Find NASA’s astronomy picture from your birthday, calculate Moon phases, explore the Solar System, and try free interactive astronomy tools.' },
  '/birthday': { title: 'NASA Picture on My Birthday — Cosmicgaze', description: 'Enter a date to discover NASA’s Astronomy Picture of the Day from your birthday. Explore the image, read its story, and download your birthday picture.' },
  '/moon': { title: 'Moon Phase Calculator for Any Date — Cosmicgaze', description: 'Find the Moon phase for your birthday or any date. Explore lunar illumination and see what the Moon looked like with Cosmicgaze’s free Moon phase calculator.' },
  '/shuffle': { title: 'Random NASA Astronomy Pictures — Cosmicgaze', description: 'Discover a random NASA Astronomy Picture of the Day. Explore galaxies, nebulae, stars, and space photography with Cosmic shuffle.' },
  '/solar-system': { title: 'Interactive 3D Solar System & Planet Facts — Cosmicgaze', description: 'Explore all eight Solar System planets in 3D. Compare their appearance and learn planet facts, from Mercury and Earth to Saturn and Neptune.' },
  '/pets': { title: 'Cosmic Pets & Space Companions — Cosmicgaze', description: 'Meet Cosmicgaze’s collection of imaginative cosmic pets: playful space companions inspired by planets, stars, and a little imagination.' },
  ...Object.fromEntries(EXTRA_DISCOVERIES.filter(page => page.enabled).map(page => [page.href, { title: `${page.title} — Cosmicgaze`, description: page.description }])),
}

export function pageSchema(pathname) {
  const page = SEO_PAGES[pathname]
  return { '@context': 'https://schema.org', '@type': pathname === '/' ? 'WebSite' : 'WebPage', name: page.title, description: page.description, url: `${SITE_URL}${pathname}`, ...(pathname === '/' ? {} : { isPartOf: { '@type': 'WebSite', name: 'Cosmicgaze', url: `${SITE_URL}/` } }) }
}

export function updateSeo(pathname) {
  const page = SEO_PAGES[pathname]
  document.title = page?.title || 'Page not found — Cosmicgaze'
  const meta = (attribute, name, content) => {
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, name)
      document.head.appendChild(element)
    }
    element.content = content
  }
  meta('name', 'robots', page ? 'index, follow, max-image-preview:large' : 'noindex, follow')
  meta('name', 'description', page?.description || 'The requested page could not be found.')
  meta('property', 'og:title', document.title)
  meta('property', 'og:description', page?.description || '')
  meta('property', 'og:url', `${SITE_URL}${pathname}`)
  meta('name', 'twitter:title', document.title)
  meta('name', 'twitter:description', page?.description || '')
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = `${SITE_URL}${pathname}`
  let schema = document.head.querySelector('script[type="application/ld+json"]')
  if (!page) {
    schema?.remove()
  } else {
    if (!schema) {
      schema = document.createElement('script')
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(pageSchema(pathname)).replaceAll('<', '\\u003c')
  }
}
