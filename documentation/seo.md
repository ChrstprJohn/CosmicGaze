# Search indexing

The production domain is https://orbitmallow.chrbuilds.dev. If the domain changes, update `SITE_URL` in `src/lib/seo.js` and rebuild.

`npm run build` generates a separate HTML entry for every enabled route, with its title, description, canonical URL, Open Graph and Twitter tags, and WebSite/WebPage structured data. The prerender step waits for lazy components and writes the actual page heading, content, controls and navigation into each entry. Tool styles are included in the initial HTML. The build fails if a page cannot render or has no heading. React hydrates the homepage and remounts tools using the visitor's current date, query parameters and motion preferences. Interactive results still require JavaScript. SPA navigation updates the page metadata as well.

The build also generates `/sitemap.xml` and `/robots.txt`. Only enabled pages are listed. Vercel rewrites these known routes to their HTML entries and returns a 404 for unknown paths. Keep the route list in `vercel.json` aligned when enabling or disabling a tool; the SEO test checks it.

After deployment:

1. Complete the Google Search Console HTML-file ownership verification.
2. Submit `sitemap.xml` in Search Console under Sitemaps.
3. Use URL Inspection on the homepage and key tool pages, test the live URL, and request indexing.
4. Monitor Page indexing for crawl or indexing errors. Discovery and indexing can take time and are not guaranteed.

The current Search Console verification file is `public/googlea9a57c4ee9eb8005.html`, served at `/googlea9a57c4ee9eb8005.html`. Keep its contents unchanged and keep it deployed after verification. It replaces the previous account verification file. The sitemap does not include date or planet query variants because they share their tool’s canonical URL.

## Coverage export from October 23, 2026

The supplied summary contains two indexed pages, two “Crawled - currently not indexed” pages and one “Page with redirect” (chart data dated October 16). It contains no affected URLs, so it cannot identify which pages were excluded or which redirect Google saw. A redirected URL is normally excluded in favor of its destination; inspect that URL and confirm its final destination before changing redirects. For the crawled pages, inspect the deployed HTML and Google's rendered page after publishing this change, then request indexing of the canonical URLs. Prerendering removes a rendering dependency but cannot guarantee Google's indexing decision.
