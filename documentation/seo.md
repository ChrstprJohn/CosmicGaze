# Search indexing

The production domain is https://cosmicgaze.chrbuilds.dev. If the domain changes, update `SITE_URL` in `src/lib/seo.js` and rebuild.

`npm run build` generates a separate HTML entry for every enabled route, with its title, description, canonical URL, Open Graph and Twitter tags, and WebSite/WebPage structured data. The initial HTML contains a short page introduction and navigation; React replaces it with the interactive tool. Interactive results still require JavaScript. SPA navigation updates the page metadata as well.

The build also generates `/sitemap.xml` and `/robots.txt`. Only enabled pages are listed. Vercel rewrites these known routes to their HTML entries and returns a 404 for unknown paths. Keep the route list in `vercel.json` aligned when enabling or disabling a tool; the SEO test checks it.

After deployment:

1. Complete the Google Search Console HTML-file ownership verification.
2. Submit `sitemap.xml` in Search Console under Sitemaps.
3. Use URL Inspection on the homepage and key tool pages, test the live URL, and request indexing.
4. Monitor Page indexing for crawl or indexing errors. Discovery and indexing can take time and are not guaranteed.

The original Google verification file must remain in `public/`. The sitemap does not include date or planet query variants because they share their tool’s canonical URL.
