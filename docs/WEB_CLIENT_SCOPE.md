# WEB_CLIENT_SCOPE.md

## Purpose

This document defines the smallest correct scope for the responsive web client of the Personal AI Vocabulary System.

Its purpose is to keep the web-client workstream narrow, implementation-oriented, and aligned with the accepted backend-first product model.

This document is a scope-control artifact.
It does not define backend implementation.
It does not define deployment execution.
It does not redefine the product baseline.  [oai_citation:0‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)

## Status

- accepted planning direction for the next client workstream
- implementation-baseline document
- not a full frontend product definition
- not a mobile scope document
- not a backend redesign document

## Role of the web client in the product

The responsive web client is a small user-facing bridge between account entry and dictionary access.

Its role is to provide:
- landing / entry
- sign up
- sign in
- password recovery
- authenticated access to the user dictionary
- card details viewing
- dictionary search
- responsive browser usage on mobile and desktop
- light presentation-layer preferences such as theme toggle

The web client is not the product core.
The backend remains the system core and the source of truth for identity, access, vocabulary data, and business rules.  [oai_citation:1‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)  [oai_citation:2‡API_SPEC.md](sediment://file_00000000b8bc71f7907d40c7b21412e1)

Telegram remains the primary interface for capture and daily review.
The web client does not replace that model.  [oai_citation:3‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)

## Why this workstream exists

The project currently has a backend-first MVP baseline and a Telegram-first operating model, while current onboarding is still manual / controlled rather than a finished self-serve frontend path.  [oai_citation:4‡CONTROLLED_TESTER_ONBOARDING.md](sediment://file_000000006a74724387035024c4ad5788)

This web-client workstream exists to add the smallest real user-facing browser path for:
- account entry
- authentication
- dictionary access

without expanding into a full frontend product.

## Source inputs for this scope

This scope is derived from:
- accepted backend-first architecture baseline
- accepted product/API direction
- current controlled onboarding reality
- the HTML design presentation used as a visual/UI reference only  [oai_citation:5‡leksik-ui-mockup.html](sediment://file_000000002b70724394a2ec26b889889b)

The HTML file is used to understand:
- layout
- screen structure
- component grouping
- responsive intent
- visual hierarchy

The HTML file is not treated as:
- final scope authority
- required implementation code
- proof that every visible feature is in scope

## In scope

### 1. Entry and auth surface
The web client may include:
- landing / entry screen
- sign up screen
- sign in screen
- password recovery screen and recovery confirmation state
- sign out action

### 2. Authenticated app shell
The web client may include:
- minimal authenticated shell/header
- session-aware entry into protected screens
- minimal authenticated navigation limited to dictionary browsing and card opening

### 3. Dictionary browsing
The web client may include:
- dictionary list screen
- dictionary item summary cards/rows
- dictionary search by text
- navigation from dictionary list to card details
- responsive list/grid adaptation for desktop and mobile browser use

### 4. Card details
The web client may include read-only presentation of the stored dictionary card for the current user.

Card details are limited to:
- word or phrase
- translation
- short explanation / meaning
- examples
- language label when present in the accepted dictionary detail payload
- learning status when present in the accepted dictionary detail payload

Card details do not expand into:
- edit controls
- manual status change
- capture actions
- review actions
- broader notes/history/source-management UI
- arbitrary extra fields just because the backend may return them

### 5. Responsive browser support
The web client must work as a narrow responsive browser client for:
- mobile browser
- desktop browser

Responsive support here means:
- one web client
- one screen system
- adaptive layout behavior
- not a separate mobile product track

### 6. Theme toggle
Theme toggle is in scope as a presentation-layer preference for the web client.

Scope note:
- this is a UI/theme behavior only
- it must not expand into a broader settings/profile area unless that becomes strictly necessary

### 7. Thin-client consumption of backend behavior
The web client consumes backend-owned behavior for:
- auth/account identity
- access state
- dictionary list
- dictionary search
- card details

The client must not re-own business logic already owned by the backend.  [oai_citation:6‡API_SPEC.md](sediment://file_00000000b8bc71f7907d40c7b21412e1)

## Out of scope

The following are explicitly out of scope for this web-client release:

- manual add
- review UI
- Telegram replacement
- product redesign
- admin panel
- billing UI
- OCR
- manual status change
- advanced settings/profile area unless strictly required by auth flow
- advanced filters
- client-owned business logic
- mobile implementation detail
- separate mobile app planning inside this workstream
- broad analytics
- advanced personalization
- browser-extension-like behaviors
- any feature that shifts capture or review away from Telegram-first operation

These exclusions remain aligned with the accepted product and architecture boundaries.  [oai_citation:7‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)

## Key constraints

### Backend-first constraint
The web client is a thin client over the backend system core.
It must not become an alternative product core.  [oai_citation:8‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)

### Telegram-first constraint
Telegram remains primary for:
- capture
- daily review

The web client must not absorb those responsibilities in this release.  [oai_citation:9‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)

### Narrow-scope constraint
This workstream is intentionally smaller than a full app surface.
Its purpose is browser access to auth-entry and dictionary reading, not feature parity with the broader app roadmap.

### No client-owned workaround logic
If a required backend/API capability is missing, that should be documented as a backend dependency or gap.
It should not be replaced with ad hoc client-side behavior.

### Design-reference constraint
The HTML presentation should be used aggressively for UI structure and layout direction, but not as automatic feature scope.  [oai_citation:10‡leksik-ui-mockup.html](sediment://file_000000002b70724394a2ec26b889889b)

## Backend and system dependencies

The web client depends on the backend/API for the following capabilities:

### Auth/account entry
Expected backend/API surface:
- sign up
- login
- logout
- current-user resolution
- recovery initiation  [oai_citation:11‡API_SPEC.md](sediment://file_00000000b8bc71f7907d40c7b21412e1)

### Access state / gating
Expected backend/API surface:
- current access lookup
- authenticated protected-resource enforcement  [oai_citation:12‡API_SPEC.md](sediment://file_00000000b8bc71f7907d40c7b21412e1)

### Dictionary list and search
Expected backend/API surface:
- user-scoped dictionary list endpoint
- search by text for current user dictionary  [oai_citation:13‡API_SPEC.md](sediment://file_00000000b8bc71f7907d40c7b21412e1)

### Card details
Expected backend/API surface:
- user-scoped vocabulary item details endpoint for read-only dictionary viewing  [oai_citation:14‡API_SPEC.md](sediment://file_00000000b8bc71f7907d40c7b21412e1)

### Session handling
The web client requires a real browser-ready auth/session entry path.
That path must be explicitly confirmed rather than inferred from the existence of backend auth concepts alone.

## Smallest likely backend/API gap to validate

Before implementation starts, this workstream must explicitly validate whether the following gap exists:

**Is there already a real frontend-ready browser auth-entry path, or only backend/account concepts and API endpoints?**

This is the main dependency check for the web client.

Possible gap areas:
- browser-ready session establishment
- protected-route auth persistence
- logout/session invalidation behavior
- password recovery path
- access-state gating behavior for authenticated web entry

This document does not assume the gap is large.
It only states that it must be validated explicitly.

## HTML-derived screen baseline

The current HTML presentation suggests a narrow screen system consisting of:
- landing
- sign up
- sign in
- recovery
- dictionary
- card detail
in responsive mobile and desktop variants, plus theme switching.  [oai_citation:15‡leksik-ui-mockup.html](sediment://file_000000002b70724394a2ec26b889889b)

This is a good starting screen baseline for the web client because it mostly matches the accepted narrow direction.

However, individual UI elements from the HTML must still be checked against scope boundaries before being promoted into the final flow and screen documents.

## What remains in Telegram

The following remain in Telegram and are not moved into the web client:
- vocabulary capture
- ready-card return after capture
- daily review session delivery
- answer submission during review
- compact review feedback

This remains consistent with the accepted architecture and product baseline.  [oai_citation:16‡ARCHITECTURE.md](sediment://file_00000000170471fd975e0c25d5422bf0)

## High-level implementation order

Recommended order for the web-client workstream:

1. Confirm web-client scope boundary.
2. Confirm real backend auth-entry/session dependency.
3. Define narrow user flows.
4. Define final screen list and per-screen exclusions.
5. Only after that, move into implementation planning.

## Explicit anti-expansion rule

The web client must not expand from:
- narrow responsive browser client

into:
- full app parity
- capture client
- review client
- admin/client management panel
- billing frontend
- generalized product shell

If a feature is not required for:
- account entry
- authenticated dictionary access
- dictionary search
- card viewing
- approved theme handling

it should be treated as out of scope unless explicitly accepted later.
