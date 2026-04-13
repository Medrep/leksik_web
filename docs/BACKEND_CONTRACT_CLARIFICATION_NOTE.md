# BACKEND_CONTRACT_CLARIFICATION_NOTE.md

## Purpose

This document records the currently confirmed backend contract used by the narrow responsive web client of the Personal AI Vocabulary System.

Its purpose is to remove remaining contract ambiguity for the web client without redesigning the backend and without expanding frontend scope.

This note is a clarification artifact.
It does not redefine product scope.
It does not redesign endpoint ownership.
It does not add new frontend features.

## Context

The responsive web client is:
- a separate client repository
- a thin client over the existing backend
- limited to narrow browser flows for:
  - auth entry
  - authenticated shell entry
  - dictionary list
  - dictionary search inside Dictionary List
  - Card Details
  - sign-out action
  - theme toggle
  - responsive browser access on mobile and desktop

The backend remains the system core.
Telegram remains the primary interface for capture and daily review.

## Confirmed contract

### Auth model used by the web client

The current web-client auth model is:

- browser auth uses Supabase directly
- the browser obtains a Supabase JWT
- protected backend requests use:

`Authorization: Bearer <supabase_jwt>`

The backend consumes and validates bearer tokens from Supabase Auth.

### Authenticated entry bootstrap

The web client uses these backend-owned checks for authenticated entry:

- `GET /auth/me`
- `GET /auth/access`

Working reliance:
- `GET /auth/me` resolves the current authenticated user
- `GET /auth/access` resolves the current access state

Protected endpoints are expected to reject unauthenticated access.

### Dictionary list endpoint

Confirmed route:
- `GET /vocab`

Confirmed supported query parameters from current project evidence:
- `search`
- `language`
- `learning_status`

Confirmed behavior:
- dictionary reads are user-scoped
- search is supported
- language filter is supported
- learning-status filter is supported

### Dictionary details endpoint

Confirmed route form:
- `GET /vocab/{item_id}`

Route naming should be treated as:
- `item_id`
- not `itemId`

Confirmed behavior:
- returns details for the current user’s item
- non-owned item should currently be treated as not found
- current working assumption for non-owned item behavior is `404`

### Confirmed read-model field family

Confirmed project evidence supports snake_case vocabulary/card fields such as:
- `display_text`
- `canonical_text`
- `translation`
- `short_explanation`
- `examples`
- `learning_status`

These are the safe read-only fields the narrow web client may rely on for Card Details and dictionary rendering.

### Data nuance already confirmed

Older rows may legitimately have:
- `language = NULL`

So language should be treated as optional in the web client UI.

## Still provisional

The following points are still not fully confirmed from backend route/schema code or concrete response samples:

### GET /vocab
- exact response envelope shape
- exact per-item list schema
- exact guaranteed vs optional fields
- whether pagination exists
- exact pagination params/metadata if pagination exists
- exact unauthenticated response body
- exact authenticated-but-denied response body/status

### GET /vocab/{item_id}
- exact success response envelope shape
- exact examples payload shape
- exact guaranteed vs optional field split
- exact path parameter type/format at route level
- exact unauthenticated response body
- exact not-found response body
- whether missing item and non-owned item intentionally collapse to the same `404` payload shape

### GET /auth/me and GET /auth/access
- exact JSON schema returned by each endpoint
- whether `/auth/me` returns only identity or additional profile fields
- whether `/auth/access` returns only access state or a broader entitlement object
- exact status/body behavior beyond general protected-route `401`

## Current safe web-client assumptions

The web client may safely assume the following right now:

- Supabase browser auth is the source of the JWT used for backend access
- protected backend calls use `Authorization: Bearer <supabase_jwt>`
- authenticated shell entry is gated through:
  - `GET /auth/me`
  - `GET /auth/access`
- unauthenticated access to protected routes should be treated as `401`
- dictionary list uses:
  - `GET /vocab`
  - optional `search`
  - optional `language`
  - optional `learning_status`
- dictionary details use:
  - `GET /vocab/{item_id}`
- dictionary reads are user-scoped
- Card Details remain read-only
- Card Details should rely only on accepted narrow fields:
  - `display_text`
  - `canonical_text`
  - `translation`
  - `short_explanation`
  - `examples`
  - `learning_status`
  - `language` only when present

The web client should not assume:
- pagination
- total-count metadata
- richer response envelopes
- extra fields as UI scope
- fallback aliases beyond confirmed snake_case fields

## Required narrow clarifications

The following small clarification work is recommended:

1. Normalize docs to:
- `GET /vocab/{item_id}`

2. Add explicit response examples for:
- `GET /auth/me`
- `GET /auth/access`
- `GET /vocab`
- `GET /vocab/{item_id}`

3. Explicitly document whether `GET /vocab` is:
- unpaginated
or
- paginated

4. Explicitly document the browser-entry ownership model:
- direct Supabase browser auth
- backend bearer-token consumption
- authenticated-entry bootstrap via `/auth/me` and `/auth/access`

## Not in scope for this clarification

This clarification note does not:
- redesign endpoint ownership
- add frontend scope
- expand Card Details
- add advanced filters
- add settings/profile work
- move capture or review into the web client
- introduce client-owned auth/access/search logic

## Practical next step

After this note is accepted:

1. patch backend/project docs with route-name normalization and response examples
2. confirm whether `GET /vocab` is paginated or not
3. return to the web client repo
4. apply only narrow normalization/correction work if contract clarification reveals a mismatch
