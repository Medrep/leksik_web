# Backend Integration Map

## Purpose and authority

This document is the web client's focused backend integration map. It describes how the web application consumes implemented backend capabilities as a thin client.

The backend repository owns API contracts, request and response schemas, HTTP status behavior, error contracts, authorization, domain semantics, and persistence behavior. Canonical backend documentation remains authoritative.

This document intentionally does not duplicate backend schemas, payload examples, field lists, status tables, or detailed error behavior. Web documentation owns only client consumption, frontend mapping, and presentation boundaries.

## Authentication boundary

Browser authentication uses the Supabase browser client. An authenticated browser session provides the access token sent as bearer authentication on protected backend requests.

The backend validates identity, product access, and authorization. Frontend route visibility, navigation guards, and hidden controls support browser UX only; they do not grant access or replace backend enforcement.

## Consumed backend surfaces

Only backend endpoints currently consumed by web source are listed here.

### Authentication

| Method and path | Web purpose | Classification |
|---|---|---|
| `GET /auth/me` | Confirm backend acceptance of the current authenticated identity during protected entry. | Read |
| `GET /auth/access` | Resolve backend-owned product access during protected entry. | Read |

### Dictionary

| Method and path | Web purpose | Classification |
|---|---|---|
| `GET /vocab` | Load and search the authenticated user's dictionary for the list screen. | Read |
| `GET /vocab/{item_id}` | Load one authenticated user's dictionary item for the details screen. | Read |
| `DELETE /vocab/{item_id}` | Submit the details-first dictionary deletion action. | Mutation |

### Preferences

| Method and path | Web purpose | Classification |
|---|---|---|
| `GET /preferences/learning` | Load backend-owned learning and interface preferences for authenticated UI. | Read |
| `PUT /preferences/learning` | Submit changed settings and use the backend-confirmed result. | Mutation |

### Account

| Method and path | Web purpose | Classification |
|---|---|---|
| `POST /account/delete` | Submit the authenticated self-service account deletion action from Settings. | Mutation |

### Telegram linking and completion

| Method and path | Web purpose | Classification |
|---|---|---|
| `GET /messaging-links/telegram` | Load backend-owned Telegram link status for the Settings surface. | Read |
| `POST /messaging-links/telegram/complete` | Submit an authenticated completion code from Settings or the dedicated Telegram-completion route. | Mutation |

## Frontend mapping responsibility

The web repository owns:

- converting confirmed backend responses into web UI view models;
- route- and screen-level loading, empty, success, and error presentation;
- deciding which confirmed backend data is presented in the accepted web scope;
- updating or invalidating browser cache after relevant backend-confirmed changes.

The web repository does not own:

- backend request validation;
- authorization or product-access enforcement;
- persistence semantics;
- domain rules;
- alternative behavior when a backend contract rejects an operation.

Frontend mapping must follow canonical backend contracts. A mismatch must be reported and resolved at the ownership boundary rather than hidden with new client-owned semantics.

## Cache boundary

Browser cache is a read optimization for web UI. The backend remains the source of truth.

Backend reads may refresh local cached view data. Backend-confirmed mutations must invalidate or update affected local cache so stale data is not presented as authoritative.

The cache does not change backend ownership and does not provide offline-first guarantees, synchronization authority, conflict resolution, or a durable write queue.

## Localization boundary

Web-owned UI strings belong to the web localization runtime and web message bundles.

Backend payload content remains backend-owned. The web client does not rewrite vocabulary content, generated translations or explanations, backend values, or other backend-generated content as part of interface localization.

Backend and web may share supported locale identifiers, but they do not share runtime translation bundles or transfer localization ownership.

## Explicit exclusions

This integration map does not document:

- backend modules or service structure;
- database models or persistence design;
- workers, schedulers, or background processing;
- Telegram backend runtime internals;
- enrichment or review logic;
- mobile-client plans;
- product roadmap or implementation chronology;
- API schemas, response examples, or detailed error contracts.
