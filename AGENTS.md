# AGENTS.md

## Purpose

This repository contains the narrow responsive web client for the Personal AI Vocabulary System.

This is a separate client project.
It is not the backend repo.
It is not the mobile app repo.

The web client is a thin client over the shared backend API.

## Product role

The web client exists to provide a small user-facing entrypoint before the mobile app is built.

Current approved scope:
- landing / entry
- sign up
- sign in
- password recovery only if required
- authenticated app shell
- dictionary list
- card details
- responsive browser support for mobile and desktop

## Explicit anti-scope

Do not add or expand into:
- manual add flow
- review UI
- Telegram replacement
- admin panel
- billing UI
- OCR
- manual status change
- advanced settings/profile work unless strictly required by auth flow
- client-owned business logic
- backend logic duplication

## System baseline

- backend remains the system core
- Telegram remains the primary capture and daily review channel
- this web client is a narrow bridge, not a full web product
- mobile remains a separate future client project

## Backend integration rules

- Treat backend API contracts as the source of truth
- Do not invent parallel auth semantics in the client
- Do not move access checks to the client
- Do not duplicate dictionary ownership logic in the client
- If a backend/API gap is found, document the smallest missing dependency instead of working around it with client-side logic

## Implementation rules

- Keep the web client narrow
- Prefer simple, maintainable structure over abstraction-heavy architecture
- Prefer implementation slices in this order:
  1. auth entry
  2. authenticated shell
  3. dictionary list
  4. card details
- Keep responsive behavior practical, not design-system heavy
- Do not expand scope silently

## Allowed changes

Typical allowed work:
- web screens within approved scope
- routing
- auth entry UI
- dictionary list/detail UI
- responsive layout
- API integration for approved flows
- narrow frontend docs

## Changes that require explicit approval

Ask before:
- adding new product scope
- changing auth model assumptions
- adding client-side state/business logic beyond normal UI needs
- introducing major dependencies
- changing deployment topology
- expanding beyond the approved screen list

## Docs to use in this repo

Primary docs for this repo should be:
- web client scope brief
- web client flows
- web client screen list
- API dependencies
- local decisions/history for the web workstream

Do not use backend deployment/runbook docs as implementation guidance for this repo unless explicitly relevant.

## Delivery posture

This repo should stay:
- simple
- thin
- backend-dependent
- easy to deploy independently
