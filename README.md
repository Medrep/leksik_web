# Responsive Web Client Baseline

## Purpose

This repository is the separate responsive web client for the Personal AI Vocabulary System.

It is a narrow browser client only.
It is not the backend repo.
It is not the mobile app repo.

The backend remains the system core.
Telegram remains the primary interface for capture and daily review.

The current repo boundary includes the approved narrow screen set, while the currently integrated backend-backed UI slices remain Supabase browser auth entry, thin authenticated-entry bootstrap through backend auth checks, backend-backed Dictionary List loading/search, backend-backed Card Details rendering, and a minimal authenticated Telegram link status/completion subflow inside Dictionary List.
It does not redesign backend behavior or expand beyond the accepted narrow screen scope.

## Accepted repo boundary

### In scope
- Landing / Entry
- Sign Up
- Sign In
- Password Recovery
- Password Recovery Confirmation
- Dictionary List
- Dictionary search inside Dictionary List
- Card Details
- Settings
- sign-out action
- theme toggle
- responsive browser support for mobile and desktop

### Out of scope
- manual add
- review UI
- Telegram replacement
- admin
- billing UI
- OCR
- manual status change
- advanced filters
- profile/account-management expansion beyond the accepted narrow settings screen
- client-owned business logic

## Thin-client ownership model

- Supabase Auth owns browser auth entry and browser session state
- backend owns access state checks
- backend owns dictionary list/search/details behavior
- backend owns accepted settings/preferences behavior
- the web client only renders browser states and routes between approved screens

If a required backend/API capability is missing, document the gap.
Do not invent client-side workaround logic.

## Minimum backend/API dependencies

- Supabase browser auth for sign up, sign in, sign out, and password recovery initiation
- `GET /auth/me`
- `GET /auth/access`
- `GET /vocab`
- `GET /vocab/{item_id}`
- `GET /messaging-links/telegram`
- `POST /messaging-links/telegram/complete`

## Main dependency risk to validate

Before each new integration slice, confirm the narrow browser-to-backend contract the web client depends on.
The current auth slice is based on direct Supabase browser auth plus backend bearer-token checks.
If a required capability is missing, do not work around it in the client.

## Auth Validation Result

Confirmed auth model for this repository:
- browser auth entry happens through Supabase Auth directly
- the backend remains a bearer-token-consuming protected API
- after browser auth, the web client sends `Authorization: Bearer <supabase_jwt>` to `GET /auth/me` and `GET /auth/access`
- the browser flow does not depend on backend-owned `/auth/signup`, `/auth/login`, `/auth/logout`, or `/auth/recover` endpoints
- the browser flow does not assume backend cookie/session auth

Current implementation boundary:
- the web client uses Supabase for sign up, sign in, sign out, and password recovery initiation
- authenticated entry into protected routes is accepted only after backend `/auth/me` and `/auth/access` succeed
- Dictionary List uses `GET /vocab` with the confirmed `search` query parameter and keeps search inside the same screen
- Card Details uses `GET /vocab/{item_id}` and promotes only the accepted read-only detail fields into the UI
- Dictionary List may show a small authenticated Telegram link panel that reads `GET /messaging-links/telegram` and submits `POST /messaging-links/telegram/complete`
- confirmed project evidence already supports field names such as `display_text`, `canonical_text`, `translation`, `short_explanation`, `examples`, and `learning_status`
- exact `GET /vocab` and `GET /vocab/{item_id}` response envelope schemas are still only partially documented here, and item-id field naming in response payloads remains conservatively handled in the client mapper
- no client-owned auth/session workaround model is introduced beyond the built-in Supabase browser session behavior

Current required environment for this slice:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

## Source docs

Use these files as the repository source of truth for the accepted boundary:
- [docs/WEB_CLIENT_SCOPE.md]
- [docs/WEB_CLIENT_FLOWS.md]
- [docs/WEB_CLIENT_SCREENS.md]

This responsive web client lives in a separate repository.
The broader product, API, and architecture docs live in the backend/project repository and remain the source of truth for those areas.
This separate web-client repository implements against the accepted web-client docs above together with the local README baseline.
The endpoint list in this README is the current integration baseline for the web client.
Future integration slices must still be validated against the backend/project repository docs and live backend behavior.

## Recommended next slice

Contract validation and payload hardening:
- validate any still-provisional field mappings and query-parameter assumptions against the backend/project repository contract
- tighten UI rendering around confirmed payload shapes without expanding product scope
- continue treating backend responses as the source of truth for access and vocabulary data
