# Web Architecture

## Purpose and authority

This is the architecture document for the Leksik web repository. It describes the web application boundary, internal web architecture, and repository ownership boundaries.

The web application is a thin client over backend APIs. This document does not define backend architecture, API schemas or semantics, authorization rules, domain behavior, persistence, Telegram runtime, workers, or scheduling. Those concerns defer to canonical documentation in the backend repository.

Web scope, user workflows, screen behavior, and implementation status remain in their focused web documents rather than being duplicated here.

## Application boundary

The repository contains a separately versioned Next.js App Router application for responsive browser use.

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

The cache does not provide:

- an offline-first product mode;
- background synchronization guarantees;
- conflict resolution;
- a durable write queue;
- authority over backend data.

Cache failure must not change backend ownership or prevent normal backend reads.

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
