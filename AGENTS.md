# AGENTS.md

## Purpose

This repository contains the narrow responsive web client for Leksik.

The web client is a separate Next.js project and a thin client over the shared backend API. Keep changes scoped to the web repository unless work in another repository is explicitly authorized.

## Current product role

The accepted web surface includes:

- browser authentication entry and recovery;
- authenticated dictionary list, search, details, and narrow deletion;
- backend-backed settings and preferences;
- Telegram link status and authenticated completion;
- self-service account deletion;
- web-owned localization and responsive light-theme UI.

Telegram remains the primary capture and daily-review channel. The web client must not become a parallel product core.

## Repository ownership

### Web repository

This repository owns:

- the Next.js application;
- web routes and screens;
- browser authentication integration;
- client-side state and cache;
- the web localization runtime and UI behavior;
- frontend API mapping;
- web-specific UX behavior.

### Backend repository

The backend repository owns:

- API schemas and semantics;
- authorization and access rules;
- domain behavior;
- Telegram backend flows;
- workers and scheduled processing;
- the persistence model.

Backend canonical documentation remains authoritative for backend contracts. Web documentation must reference those contracts and must not duplicate backend API or data-model authority.

### Admin repository

The admin repository owns:

- admin UI;
- operator workflows;
- admin presentation behavior.

During web-only tasks, sibling repositories may be inspected when necessary but must not be modified unless explicitly authorized. Report cross-repository mismatches instead of silently changing another repository.

## Explicit anti-scope

Do not add or expand into:

- manual vocabulary capture;
- review UI;
- Telegram replacement;
- admin or operator tooling;
- billing UI;
- OCR;
- manual learning-status changes;
- client-owned domain or authorization logic;
- copied backend contracts.

## Implementation rules

- Inspect the current implementation and relevant web documentation before modifying.
- Keep changes small, focused, and within the accepted web surface.
- Preserve backend ownership of identity, access, vocabulary, preferences, and other domain behavior.
- Do not invent client-side workarounds for backend contract gaps.
- Keep cache as a read optimization, not an offline-first or synchronization system.
- Keep responsive behavior practical and localization inside the existing web-owned runtime.
- Do not introduce major dependencies or change deployment topology without explicit approval.
- Do not expand scope silently.

## Documentation rules

- Use web documentation for web routes, screens, flows, localization, cache behavior, and frontend mapping.
- Use backend canonical documentation for API, authorization, domain, and persistence contracts.
- Keep repository instructions practical; do not copy full architecture, API, or data-model specifications here.
- Update web documentation only when the task requires it or the implemented web behavior changes.

## Delivery posture

Keep this repository:

- simple;
- thin;
- backend-dependent;
- independently versioned and deployable.
