# Cosmicgaze PostHog Analytics

This folder documents the analytics implemented in Cosmicgaze: its local and deployment setup, browser SDK, optional location-sharing flow, captured data, and dashboard configuration. All source references are inside this repository.

| Guide | Contents |
| --- | --- |
| [Implementation and events](IMPLEMENTATION.md) | Initialization, source map, automatic events, and the location-sharing request flow |
| [Dashboard setup and prompt](DASHBOARD.md) | Site/hostname filters, traffic and geography insights, and a PostHog AI prompt |

## What Is Implemented

Cosmicgaze uses `posthog-js` in the browser for automatic pageviews, navigation, and supported interaction autocapture. SDK events are tagged `site_name: cosmicgaze`. Visitors remain anonymous: the app does not call `identify()`, and person profiles are configured for identified users only. Session recording is disabled.

There are two sources of geographic data. PostHog can enrich regular browser events with approximate IP-based GeoIP properties. Separately, visitors can choose Share location, grant browser permission, and send a location snapshot with resolved place names through the custom `visitor_location_shared` event. That optional flow is documented in detail in [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Local Setup

The SDK dependency is recorded in [package.json](../../package.json). Use plain `npm install` when dependencies need installing. Configure public analytics variables in `.env.local`:

```dotenv
VITE_POSTHOG_TOKEN=your_public_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

See [.env.example](../../.env.example). Use the public project token and ingestion host from the PostHog project's setup screen. For an EU project, use `https://eu.i.posthog.com`. Do not use the PostHog dashboard URL as the ingestion host. Never put personal or secret API keys in `VITE_` variables.

Run `npm run dev` in the foreground and restart it after changing the variables. Stop it when finished. Without the token, SDK initialization is skipped and the location-sharing UI is hidden. Configured local visits send analytics; the code does not disable tracking in development.

The browser permission flow requires a secure context, normally HTTPS or supported localhost development, and `navigator.geolocation` support.

## Deployment Setup

Set `VITE_POSTHOG_TOKEN` and `VITE_POSTHOG_HOST` in Cosmicgaze's hosting environment, then rebuild/redeploy. Vite embeds the values into the browser build. Local settings alone do not change a deployed website.

Enable autocapture and GeoIP enrichment in PostHog if you want interaction and approximate geographic analytics. Project settings or transformations that discard IP/location data can prevent GeoIP enrichment. Session recording is disabled by this app's SDK configuration.

The integration can use a dedicated PostHog project or share one with other websites. Shared-project dashboards must filter `site_name = cosmicgaze`. This app has no runtime dependency on another repository.

## Production Filtering

Cosmicgaze does not add an `environment` property. To separate deployed visits from localhost, combine `site_name = cosmicgaze` with a `$current_url` filter for your actual deployed website origin. Apply that filter to every insight and funnel step. Do not assume an `environment = production` filter exists.

## Verify Delivery

1. Open the configured site and visit the home page and one discovery page.
2. In PostHog's live events, filter `site_name = cosmicgaze` and confirm `$pageview` and, when enabled, `$autocapture`.
3. To verify optional location sharing, click Share location and grant browser permission.
4. Confirm a `visitor_location_shared` event. Inspect its place fields, `geocoding_status`, and reported `accuracy_meters`.
5. Use your production URL filter when checking deployed traffic.

The app marks location sharing successful after an OK HTTP response from ingestion. This is not a separate check that the event is already queryable in PostHog; allow for processing and inspect live events.

If tracking is unavailable, check the token, ingestion host, hosting rebuild, content blockers, capture opt-out, and network. Location-specific problems can also involve browser permission, secure context, device location availability, or reverse geocoding.

## Public homepage stats

The hero displays Cosmic explorers (unique pageview distinct IDs), Cosmic views
(all pageviews including the homepage and repeat views), and Discoveries made (explicit
successful birthday lookups/shuffles, Moon calculations, and cosmic shuffle requests).
All three stats cover the last 30 days. Automatic initial results are excluded from discovery completions. Dates and form input
are not attached to these events. Completion counts start with this implementation.

`api/public-stats.js` is a Vercel function. Configure Production environment variables
`POSTHOG_PROJECT_ID`, `POSTHOG_API_HOST` (US: `https://us.posthog.com`), and
`POSTHOG_PERSONAL_API_KEY` (project-restricted, `query:read`). Keep the key sensitive and
server-only; never prefix it with `VITE_`. Redeploy after saving settings and code.
Existing public `VITE_POSTHOG_TOKEN` and `VITE_POSTHOG_HOST` are still required for capture.

Queries restrict events to `site_name = cosmicgaze` and URLs starting with
`https://cosmicgaze.chrbuilds.dev/`. Earlier domains and Celestial-tagged events are excluded.
Vercel caches aggregate responses for one hour. Errors show dashes rather than fake counts.
Plain Vite development/preview does not run Vercel functions; use a Vercel preview deployment
with the matching environment variables to verify real data. Check `/api/public-stats` for
a 200 JSON response containing only the three aggregate fields, then confirm the hero.

## API references

- [PostHog JavaScript configuration](https://posthog.com/docs/libraries/js/config)
- [PostHog capture opt-out](https://posthog.com/docs/libraries/js#opt-out-of-data-capture)
- [PostHog GeoIP properties](https://posthog.com/docs/libraries/go#overriding-geoip-properties)
