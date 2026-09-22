# Web Architecture

## Purpose and authority

This is the architecture document for the Leksik web repository. It describes the web application boundary, internal web architecture, and repository ownership boundaries.

The web application is a thin client over backend APIs. This document does not define backend architecture, API schemas or semantics, authorization rules, domain behavior, persistence, Telegram runtime, workers, or scheduling. Those concerns defer to canonical documentation in the backend repository.

Web scope, user workflows, screen behavior, and implementation status remain in their focused web documents rather than being duplicated here.

## Application boundary

The repository contains a separately versioned Next.js App Router application. The responsive web/PWA product is the primary customer launch client; Telegram remains the primary channel for capture and daily review.

The web application owns:

- browser routes and screen composition;
- browser authentication integration;
- authenticated and public UI state;
- frontend mapping from backend responses into web view data;
- web localization;
- browser-side cache and state behavior;
- responsive UI behavior.

The backend remains authoritative for authenticated identity, product access, vocabulary and preference behavior, account behavior, and all other domain decisions. The web client may present backend state and initiate supported operations, but it does not become a second system of record.

## Authentication architecture

Browser authentication is handled through the Supabase browser client. The browser session supplies an access token for protected backend requests.

The backend receives the access token as bearer authentication and remains responsible for validating identity, access, and authorization. Web route guards and visibility rules support browser navigation and presentation only; they do not replace backend enforcement.

Public authentication and recovery surfaces are separated from authenticated dictionary and settings surfaces. Authenticated entry depends on both a valid browser session and successful backend acceptance.

## Routing and UI architecture

The App Router owns the web route hierarchy and separates:

- public entry, authentication, recovery, and Telegram-completion surfaces;
- authenticated dictionary and settings surfaces;
- shared public and authenticated layouts.

Route details, screen contents, entry and exit paths, and user workflows belong in the web screen and flow documents.

The repository provides one responsive browser UI for mobile and desktop widths. Responsive presentation may adapt layout and density, but it does not change product scope, backend ownership, or available domain behavior.

## PWA launch delivery

PWA delivery is accepted for launch. Its PWA-01 installability foundation is implemented with the native Next.js manifest route, public PNG application icons, Apple Home Screen metadata, and root theme metadata. The install contract is:

- `id: "/"`;
- name: `Leksik`;
- `start_url: "/dictionary"`;
- `scope: "/"`;
- `display: "standalone"`;
- online-first runtime behavior.

`/dictionary` is the intended authenticated launch experience. Signed-out users continue through the existing protected-route and sign-in continuation behavior, without changing landing-page behavior. The root scope permits the installed application to navigate existing authentication, dictionary, details, Settings, and Telegram-completion routes; it does not introduce routes.

Initial iOS delivery is Safari with Add to Home Screen. Initial Android delivery is the Chrome-installed PWA. Apple App Store, Google Play, Capacitor iOS, and a Capacitor Android distribution package are deferred; broader native/mobile development is not part of the launch architecture.

### Online-first and private-data boundary

The initial installed runtime is online-first. No service worker is required for the approved initial PWA implementation; service-worker implementation, offline product mode, offline dictionary support, background synchronization, offline mutation queues, and push notifications are deferred.

Current browser persistence remains unchanged: Supabase persists the browser authentication session, and the dictionary read cache stores user-keyed list and detail data in `localStorage`. That is not an offline product layer. PWA work must not introduce another persistent data layer or service-worker caching for authenticated API responses, dictionary or generated vocabulary data, preferences, identity/access state, authentication tokens, Telegram completion URLs or proofs, or mutation requests.

Authenticated browser requests to the backend use the Fetch API `no-store` cache mode through the shared authenticated backend client. This browser safeguard does not change request URLs, bodies, authorization headers, Supabase requests, or backend contracts.

### Browser and device expectations

iOS Safari and an installed Home Screen web app can use separate browser-storage contexts. An installed app's first launch may therefore require another sign-in; seamless Safari-to-installed-PWA session transfer and cookie/session migration architecture are not launch requirements.

External links are not guaranteed to open an already installed PWA window. Telegram and email handoffs can occur through Safari or another browser context, and an installed app must fetch current backend state after it is reopened or resumed. Native deep-link capture is not part of this delivery.

PWA launch readiness requires physical-device validation, not just static build checks: one real iPhone using current supported Safari and one real Android phone using current supported Chrome, each tested in normal browser and installed standalone modes. Older OS or browser versions are not claimed supported unless added to that physical validation. The operational record is [the PWA launch validation checklist](PWA_LAUNCH_CHECKLIST.md).

The accepted implementation sequence is PWA-00 — Launch Baseline and Documentation Alignment; PWA-01 — Installability Foundation; PWA-02 — Installed Runtime Hardening; PWA-03 — Minimal Installation UX; and PWA-04 — Final Real-Device Launch Gate. `ANDROID-01 — Optional Capacitor Android Distribution` remains deferred and is not launch-blocking.

## Frontend API mapping

The web repository owns the mapping layer between backend wire responses and web-facing view data.

That layer may:

- normalize confirmed backend fields for rendering;
- shape loading, success, empty, and error states for the UI;
- keep web components independent from raw transport handling.

It must not redefine backend schemas, invent alternative authorization rules, or reproduce backend domain logic. Canonical backend API documentation remains authoritative when web mapping assumptions and backend contracts differ.

## Localization architecture

The web client owns its localization runtime and typed web message bundles. Backend and web surfaces may share locale identifiers, but they do not share runtime translation bundles.

Supported web locales are:

- English (`en`);
- Polish (`pl`);
- Russian (`ru`);
- Ukrainian (`uk`).

One web-owned locale runtime covers public and authenticated web surfaces.

Locale resolution is:

- before authenticated preferences are available: supported browser locale, then English;
- after authenticated preferences are available: saved `ui_locale`, supported browser locale, then English.

Browser-derived locale is transient and is not automatically persisted. Sign-out removes user-bound locale input and returns the public UI to the resolved browser locale.

Web-owned interface copy uses the web bundles. Vocabulary content, generated translations and explanations, backend payload values, Supabase errors, and arbitrary backend errors are not rewritten by the web localization runtime.

The root document currently retains static English metadata and `<html lang="en">`. Locale-prefixed routes, server locale cookies, and request-derived server metadata are not part of the current architecture. No third-party internationalization library is used.

## Client state and cache

Client state coordinates browser session state, authenticated readiness, locale readiness, UI drafts, and request presentation. Backend responses remain authoritative.

The dictionary cache is a browser-side read optimization. The frontend owns safe cache invalidation when authentication boundaries, user identity, mutations, or relevant preferences make cached data stale or unsafe to reuse.

Cached dictionary data is never authoritative after an authenticated refresh fails. Authorization denial removes protected content from the rendered state and invalidates the affected cache; an authoritative missing item invalidates its detail and related list cache; successful deletion invalidates the item and list caches; and sign-out, account deletion, or account transition clears user-bound product cache in the executing browser context. Backend revalidation is scoped to the live owner, access token, and auth generation; equivalent concurrent refreshes share one in-flight operation, while stale invocations and results become inert before they can mutate state or initiate destructive cleanup. When authoritative backend bootstrap rejects a restored or active Supabase session, the client immediately revokes protected product state and remains in auth loading/checking state while its one valid current-owner Supabase cleanup attempt is in flight. Public authentication becomes usable only after that attempt settles, so a newer browser session cannot be established through the supported UI while the old cleanup can still mutate shared Supabase storage. A returned cleanup error or thrown cleanup failure still releases the public UI after the attempt has settled; the rejected owner remains blocked for that page lifecycle, although persisted rejected session material may survive and be rejected again after a future full reload. Account-deletion requests capture the initiating owner, access token, and auth generation. A deletion `401` for that still-current ownership enters the same tracked backend-rejection lifecycle; it never calls ordinary unscoped sign-out, and a stale completion or a completion during an existing cleanup cannot start another destructive operation. Other stale deletion failures are inert with respect to the current Settings owner. After backend-confirmed account deletion, a separate synchronous path tombstones the deleted owner and invalidates that owner's cache, while revoking local session ownership, access/bootstrap state, and preferences only when the captured ownership is still current. That deletion-specific path deliberately does not start an asynchronous, unscoped Supabase sign-out: normal sign-out retains that responsibility, while omitting it from deletion prevents old user A cleanup from later removing a newer user B session in the shared browser client. The deleted-owner guard rejects same-runtime restoration events, and a retained Supabase session encountered after reload still has to pass authoritative backend bootstrap before protected content can render. Successful results are committed only while their authenticated owner, access token, and active request still match, so late responses cannot repopulate previous-user state.

The cache does not provide:

- an offline-first product mode;
- background synchronization guarantees;
- conflict resolution;
- a durable write queue;
- authority over backend data.

Cache failure, unavailable browser storage, or malformed cache data must not change backend ownership or prevent normal backend reads. Transient authoritative read failures retain stored cache for possible later use but replace any rendered cached result with the normal error state; this is not an offline fallback.

## Repository ownership boundaries

### Web repository

The web repository owns:

- Next.js routes and screens;
- browser authentication integration;
- frontend API mapping;
- localization runtime and bundles;
- responsive UI architecture;
- browser UI state and cache behavior.

### Backend repository

The backend repository owns:

- API contracts and semantics;
- authorization and access enforcement;
- persistence and data-model authority;
- domain rules;
- Telegram backend flows;
- workers and scheduled processing.

Backend canonical documentation is authoritative for those concerns. This document references that authority rather than copying it.

### Admin repository

The admin repository owns:

- admin routes and UI;
- operator workflows;
- admin presentation behavior.

Admin behavior is not part of the web application architecture.

## Deployment boundary

The web application is independently versioned and deployable from the backend and admin applications. At runtime it connects to configured Supabase browser-auth services and a configured backend API.

No platform-specific deployment topology is defined by this document or by the current framework configuration. Introducing one is a separate explicit decision.

## Related web documentation

- [Web scope](WEB_CLIENT_SCOPE.md)
- [User flows](WEB_CLIENT_FLOWS.md)
- [Screens and routes](WEB_CLIENT_SCREENS.md)
- [Current status](WEB_CLIENT_STATUS.md)
- [PWA launch validation checklist](PWA_LAUNCH_CHECKLIST.md)
