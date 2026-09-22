# Leksik Web Client

## Purpose

This repository contains the separate responsive web client for Leksik.

It is a narrow Next.js client over the shared backend API. The backend remains the system core and owns domain behavior, API contracts, authorization, and persistence. Telegram remains the primary interface for vocabulary capture and daily review.

## Launch target

The primary customer launch client is the responsive web/PWA product. Initial iOS delivery is Safari with Add to Home Screen; initial Android delivery is the Chrome-installed PWA. Physical-device PWA testing requires an HTTPS origin.

App Store and Google Play distribution, Capacitor iOS, and a Capacitor Android distribution package are deferred. The PWA-01 installability foundation has passed, including physical installed-PWA verification on iPhone and Android; see the [PWA launch validation checklist](docs/PWA_LAUNCH_CHECKLIST.md).

The native manifest is defined in `app/manifest.ts`. Manifest icons are under `public/icons/`, and the Apple touch icon uses the native `app/apple-icon.png` convention. PWA-02 installed-runtime hardening is implemented with final device-flow verification still tracked in the launch checklist. Installation testing must use an HTTPS deployment; localhost is suitable only for local static/runtime inspection.

Browser account entry uses Supabase Auth directly. Protected backend requests use the Supabase access token as a bearer token, and the backend remains authoritative for authenticated identity and product access.

## Implemented web surface

The current web client provides:

- sign up, sign in, sign out, and password-recovery initiation;
- authenticated dictionary list, search, and card details;
- details-first dictionary deletion;
- backend-backed learning settings and preferences;
- Telegram link status and authenticated completion, including the dedicated `/telegram/complete` route;
- self-service account deletion from Settings;
- localized web-owned UI in English, Polish, Russian, and Ukrainian;
- responsive mobile and desktop browser layouts;
- light-theme presentation.

Manual vocabulary capture, review UI, admin tooling, billing UI, OCR, and manual learning-status changes remain outside the web-client scope.

## Ownership boundaries

- The web repository owns Next.js routes, screens, browser authentication integration, frontend API mapping, client-side cache/state, localization, and web UX.
- The backend repository owns API schemas and semantics, authorization, domain behavior, Telegram/backend runtime, workers, scheduled processing, and persistence.
- The admin repository owns admin UI, operator workflows, and admin presentation.

Backend canonical documentation remains authoritative for backend contracts. This repository should document how the web client consumes those contracts, not copy backend API or data-model authority.

## Requirements

- Node.js 20, as pinned in [`.nvmrc`](.nvmrc)
- npm
- A configured Supabase project and backend API

Required public environment variables:

```text
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Use [`.env.example`](.env.example) as the local configuration template.

## Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Create a production build:

```sh
npm run build
```

Start the production server after building:

```sh
npm run start
```

The current `package.json` does not define test or lint scripts. Do not invent `npm test` or `npm run lint` as repository validation commands unless those scripts are added in an explicitly approved task.

## Documentation

- [Web architecture](docs/ARCHITECTURE.md)
- [Backend integration](docs/BACKEND_INTEGRATION.md)
- [Web scope](docs/WEB_CLIENT_SCOPE.md)
- [User flows](docs/WEB_CLIENT_FLOWS.md)
- [Screens and routes](docs/WEB_CLIENT_SCREENS.md)
- [Current status](docs/WEB_CLIENT_STATUS.md)
- [PWA launch validation checklist](docs/PWA_LAUNCH_CHECKLIST.md)
- [Manual smoke checks](docs/WEB_CLIENT_MANUAL_SMOKE.md)

These files own web-specific scope and behavior. Broader product, API, authorization, data-model, Telegram, worker, and backend-runtime contracts remain owned by the backend repository.
