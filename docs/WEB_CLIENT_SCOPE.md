# Web Client Scope

## Purpose and authority

This document defines the accepted and excluded product scope for the Leksik web client.

It describes which user-facing capabilities belong in the web repository and the boundaries that keep the client narrow. It does not define web architecture, backend contracts, route-by-route behavior, detailed user flows, implementation status, or implementation sequencing.

## Product role and boundaries

The web client is a responsive browser/PWA interface and a thin client over the shared backend. It is the primary customer launch client.

The backend remains authoritative for identity, access, vocabulary and preference behavior, account behavior, authorization, persistence, and other domain rules. The web client presents backend-owned state and initiates accepted operations without becoming a separate system of record.

Telegram remains the primary interface for vocabulary capture and daily review. Web linking and completion capabilities support that model; they do not replace Telegram capture or review.

### Launch delivery

Installed PWA delivery is accepted web-client launch scope. Initial iOS delivery is Safari with Add to Home Screen, and initial Android delivery is the Chrome-installed PWA. Minimal installation help is accepted for the later PWA-03 slice; it will not add a dedicated installation route or broaden product features.

PWA installability and installed-runtime work remain planned until their respective PWA-01 through PWA-04 slices complete. Native/mobile packaging remains deferred, including App Store, Google Play, Capacitor iOS, and a Capacitor Android distribution package.

## Accepted scope

### Public entry and authentication

The web client includes:

- landing and product entry;
- sign up and sign-up confirmation;
- sign in and sign out;
- password-recovery initiation and confirmation;
- browser authentication integration for entry into protected web capabilities.

### Authenticated entry and application shell

The web client includes:

- a minimal authenticated shell;
- protected entry for dictionary and settings capabilities;
- a language-preference onboarding gate when required preferences are missing;
- narrow navigation between dictionary, card details, settings, and sign out.

The shell is not a general-purpose product workspace.

### Dictionary browsing

The web client includes:

- an authenticated dictionary list;
- text search within the dictionary;
- dictionary item summaries;
- an empty-dictionary state with a Telegram-first call to action;
- navigation from the list to dictionary details.

Advanced filtering and client-owned search behavior are not part of this scope.

### Dictionary details

The web client includes read-only presentation of an authenticated user's stored dictionary item, including the accepted vocabulary content and metadata available for web presentation.

The presentation boundary remains narrow:

- explanations are presented in the source language;
- translations are presented only when the user has selected a translation language and the backend provides a translation;
- missing translation content is not generated or invented by the client;
- backend fields do not become web features automatically.

Dictionary details do not include capture, review, manual learning-status editing, or broader notes and history management.

### Settings and preferences

The web client includes one narrow authenticated settings capability for:

- learning language;
- preferred translation language;
- interface language;
- daily-review enablement, target, preferred time, and timezone;
- Telegram link status and authenticated link completion;
- entry into narrow self-service account deletion.

Settings do not expand into general profile editing, a security center, billing, provider management, Telegram reassignment or unlinking, or a broad account-management area.

### Telegram linking and completion

The web client includes:

- Telegram link status in Settings;
- authenticated completion from Settings;
- a dedicated Telegram completion route for the browser handoff from Telegram;
- web presentation of backend-confirmed completion outcomes.

Telegram identity, ownership, conflict, and reassignment semantics remain backend-owned. This capability does not introduce Telegram capture or review into the web client.

### Dictionary deletion

The web client includes a narrow details-first dictionary deletion flow with explicit confirmation and return to the dictionary after backend-confirmed success.

Dictionary deletion does not expand into:

- list-row or bulk deletion;
- restore or trash management;
- manual learning-status editing.

### Account deletion

The web client includes narrow self-service account deletion from Settings with explicit destructive confirmation and backend-confirmed completion.

This capability does not expand Settings into general account administration, data export, restore, operator tooling, or a broader account center.

### Localization

The web client includes web-owned interface localization in English, Polish, Russian, and Ukrainian, including an interface-language preference and browser-locale fallback.

Localization applies to web-owned interface copy. It does not transfer ownership of vocabulary content, generated explanations or translations, backend values, or backend error semantics to the web client.

### Browser cache

The web client may cache dictionary list and details reads as a browser-side read optimization.

The cache must remain subordinate to backend state and must be invalidated when authentication boundaries, accepted mutations, or relevant preference changes make cached data unsafe or stale.

The cache is not:

- an offline-first mode;
- a synchronization engine;
- a conflict-resolution system;
- a durable or optimistic write queue;
- an alternative source of truth.

### Responsive presentation and theme

The accepted web surface is one responsive browser client for mobile and desktop widths.

The web client uses a light-theme presentation only. Dark-theme support, theme switching, and appearance settings require separate explicit acceptance.

## Explicitly excluded scope

The following remain outside the accepted web-client scope:

- manual vocabulary capture;
- review sessions, review answering, and review feedback UI;
- replacing Telegram as the primary capture or daily-review interface;
- manual learning-status editing;
- advanced dictionary filters;
- restore or trash flows;
- billing UI or payment flows;
- OCR;
- broad profile, settings, security, or account-management expansion beyond the accepted narrow capabilities;
- Telegram reassignment, unlinking, or general provider management;
- admin or operator tooling, which belongs to the admin repository;
- native-client implementation and store distribution, including Capacitor iOS and Android packages, App Store, and Google Play;
- broad analytics or advanced personalization;
- dark-theme support or theme switching;
- offline-first synchronization;
- a generalized client-side data platform;
- client-owned domain, authorization, persistence, or fallback business logic.

## Scope control

New web capabilities require explicit acceptance. Backend capabilities or fields do not enter web scope automatically, and missing backend behavior must not be replaced with client-owned domain logic.

The following boundaries remain mandatory:

- Telegram remains primary for vocabulary capture and daily review;
- dictionary deletion remains details-first and narrow;
- the backend remains authoritative for domain behavior;
- browser cache remains a read optimization, not offline synchronization;
- broad admin and mobile concerns remain in their own repositories.

## Related documentation

- [Web architecture](ARCHITECTURE.md)
- [Backend integration](BACKEND_INTEGRATION.md)
- [User flows](WEB_CLIENT_FLOWS.md)
- [Screens and routes](WEB_CLIENT_SCREENS.md)
- [Current implementation status](WEB_CLIENT_STATUS.md)
