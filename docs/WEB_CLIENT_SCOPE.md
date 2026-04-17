# WEB_CLIENT_SCOPE.md

## Purpose

This document defines the accepted implementation scope for the responsive web client of the Personal AI Vocabulary System.

Its purpose is to keep the web-client workstream narrow, implementation-oriented, and aligned with the accepted backend-first product model while reflecting the updated client/backend baseline.

This document is a scope-control artifact.
It does not define backend implementation.
It does not define deployment execution.
It does not redefine the overall product baseline.

## Status

- accepted implementation-baseline document for the current web-client workstream
- updated to reflect the newly accepted client/backend baseline
- not a full frontend product definition
- not a mobile scope document
- not a backend redesign document

## Role of the web client in the product

The responsive web client is a small authenticated browser client over the shared backend API.

Its role is to provide:
- landing / entry
- sign up
- sign in
- password recovery
- authenticated dictionary access
- dictionary search
- card details viewing
- a narrow settings screen for accepted preferences
- delete from dictionary through a narrow details-first flow
- empty dictionary state with a simple CTA
- lightweight local cache for dictionary read data
- responsive browser usage on mobile and desktop
- presentation-layer behavior such as theme toggle

The web client is not the product core.
The backend remains the system core and the source of truth for identity, access, vocabulary data, settings, and business rules.

Telegram remains the primary interface for capture and daily review.
The web client does not replace that model.

## Why this workstream exists

The project remains backend-first and Telegram-first for core capture/review behavior, but now has an accepted narrow web-client baseline that includes:
- account entry
- authenticated dictionary usage
- narrow preferences handling
- narrow dictionary delete flow
- lightweight read optimization

This workstream exists to implement that client baseline without expanding the web client into a broader product surface.

## Source inputs for this scope

This scope is derived from:
- accepted backend-first architecture baseline
- accepted API direction
- accepted updated client/backend baseline
- current web-client narrow-scope principles
- current Telegram-first operating model

Visual design references may inform layout and hierarchy, but they do not define product scope.

## In scope

### 1. Entry and auth surface
The web client may include:
- landing / entry screen
- sign up screen
- sign-up confirmation state
- sign in screen
- password recovery screen and recovery confirmation state
- sign out action

### 2. Authenticated app shell
The web client may include:
- minimal authenticated shell/header
- session-aware entry into protected screens
- minimal authenticated navigation limited to:
  - dictionary browsing
  - card opening
  - settings access
  - sign out

This remains a narrow shell, not a broader application workspace.

### 3. Dictionary browsing
The web client may include:
- dictionary list screen
- dictionary item summary cards/rows
- dictionary search by text
- empty dictionary state with a simple CTA
- navigation from dictionary list to card details
- responsive list/grid adaptation for desktop and mobile browser use

### 4. Card details
The web client may include read-only presentation of the stored dictionary card for the current user, plus a narrow delete action.

Accepted card-details content is limited to:
- word or phrase
- canonical form when applicable
- explanation in the source word language
- translation only when:
  - `preferred_translation_language` is set, and
  - the backend returns translation
- examples
- language label when present in the accepted backend detail payload
- learning status when present in the accepted backend detail payload

Card details do not expand into:
- manual status change
- capture actions
- review actions
- broader notes/history/source-management UI
- arbitrary extra fields just because the backend may return them

### 5. Settings
The web client may include:
- one narrow authenticated settings route
- one narrow settings screen
- backend-backed read/write support for accepted preference fields needed by the current baseline

Current accepted settings scope is limited to:
- `preferred_translation_language`

Settings must use the same backend settings/preferences endpoints as mobile where applicable.

Settings do not expand into:
- profile editing
- billing
- security center
- broad account-management area
- Telegram-linking expansion
- general preferences dashboard

### 6. Dictionary delete
The web client may include:
- delete from card details only
- small confirmation step
- backend-backed delete call
- redirect back to dictionary after success
- explicit client-side invalidation of affected visible read state

Delete in current web scope is:
- details-first
- narrow
- client-facing
- aligned to backend soft delete behavior

Delete does not expand into:
- restore
- trash
- bulk delete
- list-row delete
- manual status change

### 7. Lightweight local cache
The web client may include a lightweight local cache for:
- dictionary list
- card details

Cache is accepted only as a read optimization.
The backend remains the source of truth.

Cache scope includes:
- read caching
- simple refresh behavior
- explicit invalidation after known events such as:
  - delete
  - sign out
  - relevant settings changes if needed

Cache does not expand into:
- offline-first behavior
- sync engine
- conflict resolution
- optimistic write queue
- broad client-side state-management redesign

### 8. Responsive browser support
The web client must work as a narrow responsive browser client for:
- mobile browser
- desktop browser

Responsive support here means:
- one web client
- one screen system
- adaptive layout behavior
- not a separate mobile product track

### 9. Theme toggle
Theme toggle remains in scope as a presentation-layer preference for the web client.

Scope note:
- this is a UI/theme behavior only
- it must not expand into a broader settings/profile area beyond the accepted narrow settings surface

### 10. Thin-client consumption of backend behavior
The web client consumes backend-owned behavior for:
- auth/account identity
- access state
- dictionary list
- dictionary search
- dictionary details
- learning preferences
- delete behavior

The client must not re-own business logic already owned by the backend.

## Card-content rendering rule

The web client must follow the accepted card-content rule:

- `explanation` is always shown in the source word language
- `translation` is shown only when `preferred_translation_language` is set and the backend returns it
- if `preferred_translation_language` is not set, the client shows explanation only

The client must not imply:
- immediate automatic backfill of older cards after preference changes
- client-owned translation generation
- client-owned fallback logic that invents missing translation content

## Out of scope

The following are explicitly out of scope for the current web-client baseline:

- manual add
- review UI
- Telegram replacement
- product redesign
- admin panel
- billing UI
- OCR
- manual status change
- advanced filters
- broad settings/profile/account expansion
- client-owned business logic
- mobile implementation detail
- separate mobile app planning inside this workstream
- broad analytics
- advanced personalization
- browser-extension-like behaviors
- any feature that shifts capture or review away from Telegram-first operation
- restore/trash flow
- offline-first sync behavior
- generalized client-side data platform

## Key constraints

### Backend-first constraint
The web client is a thin client over the backend system core.
It must not become an alternative product core.

### Telegram-first constraint
Telegram remains primary for:
- capture
- daily review

The web client must not absorb those responsibilities in this baseline.

### Narrow-scope constraint
This workstream is still intentionally smaller than a full app surface.
Its purpose is narrow browser access to accepted dictionary, settings, and delete behavior, not feature parity with broader product plans.

### No client-owned workaround logic
If a required backend/API capability is missing, that should be documented as a backend dependency or gap.
It should not be replaced with ad hoc client-side behavior.

### Settings-boundary constraint
Settings must remain narrow and specific to accepted current need.
Do not let settings become a broad account-management area.

### Cache-boundary constraint
Cache must remain a lightweight read optimization only.
Do not let cache evolve into offline-first or broad state-management redesign.

## Backend and system dependencies

The web client depends on the backend/API for the following capabilities:

### Auth/account entry
Current accepted web-client auth boundary remains:
- browser auth handled through Supabase Auth in the browser
- backend protected requests use bearer token auth
- backend resolves current user and access state through:
  - `GET /auth/me`
  - `GET /auth/access`

### Settings/preferences
Expected backend/API surface:
- `GET /preferences/learning`
- `PUT /preferences/learning`

Current accepted field to support:
- `preferred_translation_language`

### Dictionary list and search
Expected backend/API surface:
- user-scoped dictionary list endpoint
- search by text for current user dictionary
- payload shape that safely supports separate explanation/translation rendering

### Card details
Expected backend/API surface:
- user-scoped vocabulary item details endpoint
- payload shape that safely supports:
  - explanation
  - optional translation
  - canonical form when applicable

### Delete
Expected backend/API surface:
- authenticated delete endpoint for dictionary items
- backend-owned soft delete behavior
- deleted items excluded from normal dictionary browsing after success

### Session handling
The web client still requires a real browser-ready auth/session path.
That remains an implementation dependency, not a client-owned responsibility.

## Smallest likely backend/API gaps to validate

Before implementation starts, this workstream must explicitly validate:

1. The exact backend contract shape for:
- `preferred_translation_language`

2. The exact payload shape needed to support the new rendering rule:
- source-language explanation
- conditional translation

3. The delete endpoint behavior needed for:
- details-first delete
- redirect and invalidation after success

4. The minimal safe invalidation behavior needed after:
- delete
- sign out
- relevant settings changes if rendering depends on them

This document does not assume those gaps are broad.
It only states that they must be validated explicitly.

## What remains in Telegram

The following remain in Telegram and are not moved into the web client:
- vocabulary capture
- ready-card return after capture
- daily review session delivery
- answer submission during review
- compact review feedback

This remains consistent with the accepted backend-first and Telegram-first product model.

## High-level implementation order

Recommended order for the current web-client workstream:

1. Request helper + preferences contract wiring
2. Settings route, screen, and navigation entry
3. Dictionary rendering rules + empty-state CTA
4. Details-first delete flow
5. Lightweight local cache for dictionary list and card details

## Explicit anti-expansion rule

The web client must not expand from:
- narrow responsive browser client with dictionary, settings, delete, and lightweight cache

into:
- full app parity
- capture client
- review client
- admin/client management panel
- billing frontend
- generalized product shell
- offline-first sync app

If a feature is not required for:
- account entry
- authenticated dictionary access
- accepted settings behavior
- read-only card viewing with narrow delete
- empty-state CTA
- lightweight read caching
- approved theme handling

it is out of scope unless explicitly accepted later.
