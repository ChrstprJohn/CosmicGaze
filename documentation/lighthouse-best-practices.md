# Cloudflare and Lighthouse Best Practices

Live desktop and mobile audits on October 18, 2026 reproduced a Best Practices score of 81. The single failed scored audit was `deprecations`. All reported deprecated API use originated in Cloudflare's injected `/cdn-cgi/challenge-platform/scripts/jsd/main.js`: FencedFrame, persistent storage, and Protected Audience APIs. These calls are not in the application source. Performance insights and Best Practices are separate audit categories.

The Vercel HTML response policy now includes `Cache-Control: public, max-age=0, must-revalidate, no-transform` for the homepage, every discovery route, and their generated `.html` files. Asset and media caching remain separately configured. This is a response header, not an HTML meta tag or a browser-console workaround, and applies equally to mobile and desktop visitors.

Cloudflare documents that an origin `no-transform` response prevents automatic JavaScript Detections injection: https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-your-origin-sends-a-no-transform-header

## Bot-detection tradeoff

These HTML pages will no longer generate the JavaScript Detections signal (`cf.bot_management.js_detection.passed` is missing). Review any Cloudflare rules that rely on that field before deployment. This does not toggle Cloudflare's zone settings or remove all bot protection. If that signal is required, retain JavaScript Detections instead and ask Cloudflare to update its deprecated API use; the application cannot patch their hosted script.

## Verify after deployment

1. Verify that the homepage and discovery HTML responses contain `no-transform` in the actual HTTP `Cache-Control` header.
2. Check that new page loads no longer request `/cdn-cgi/challenge-platform/scripts/jsd/main.js`.
3. Re-run Lighthouse with cleared storage on the public domain in both Desktop and Mobile modes. Confirm the deprecated API audit and performance metrics.
4. Keep the one-year immutable cache policy on hashed `/assets/` files.

Local production audits can confirm the application itself, but cannot prove Cloudflare honors the deployed header. Do not describe a local score as a verified public-domain result.

Final local production results: desktop Performance 100 / Best Practices 100; mobile Performance 95 / Best Practices 100. These are single-run lab results, not guarantees for the public domain. The detailed discovery skeleton module now starts loading only for discovery routes; it is absent from the initial homepage network requests.
