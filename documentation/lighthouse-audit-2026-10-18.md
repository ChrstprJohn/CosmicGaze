# Lighthouse audit — October 18, 2026

Audited the current homepage production build at `http://127.0.0.1:4173/` with Lighthouse 13.5.0 and headless Chrome. Mobile used Lighthouse's default simulated mobile throttling; desktop used its desktop preset. Analytics and public stats remained enabled. These are local lab results, not deployed-site or physical-device scores.

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile, before | 83 | 95 | 100 | 100 |
| Mobile, final | 95 | 100 | 100 | 100 |
| Desktop, final | 100 | 100 | 100 | 100 |

Final mobile metrics: FCP 1.8 seconds, LCP 2.8 seconds, total blocking time 40 milliseconds, CLS 0. Mobile Performance has **not** reached 100; the remaining score loss is primarily first contentful paint and largest contentful paint. Lab scores vary between runs.

Changes: replaced invalid stats definition labels with accessible text; prerendered and hydrated the existing homepage; inlined entry CSS and placed font/image preloads early in HTML; limited Tailwind class scanning to application source instead of saved reports and other project files. Prerendering runs during `npm run build`, with its module compiler closed afterward and no listening server or file watcher.

Validation: all 54 tests, ESLint, and the production build passed. The production homepage hydrated without console errors; mobile had no horizontal overflow, its hero loaded, and navigation to Solar System worked. The audit preview process was stopped after verification.

Reports: `output/performance/verified-mobile.report.html` and `output/performance/verified-desktop.report.html`, with matching JSON and viewport screenshots. Initial reports are `current-mobile.report.*` and `current-desktop.report.*` in the same directory.
