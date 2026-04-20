# Web Client Manual Smoke Notes

## Purpose

This note records the narrow manual smoke checks for the dedicated Telegram completion page.

It is not an automated test plan.
It is not a generic onboarding QA framework.
It does not expand product scope.

## Dedicated Telegram Completion

Route:
- `/telegram/complete?code=<one-time-code>`

Checks:
- Open `/telegram/complete` without `code`; the page shows the invalid/expired state.
- Open `/telegram/complete?code=test-code` while signed out; the page shows auth required and keeps the completion route in the Sign In `next` return path.
- Sign in from that state; after backend auth bootstrap is ready, the page stays on `/telegram/complete` and calls `POST /messaging-links/telegram/complete` with the existing `code`.
- With a valid completion response, the page shows the narrow success state.
- With a backend conflict response, the page shows the narrow blocked/conflict state and does not offer reassignment or unlinking.
- With an invalid or expired code response, the page shows the narrow invalid/expired state.
- During normal render/re-render, the page should not repeatedly fire duplicate completion calls for the same access token and code.

## Public Auth Non-Regression

Checks:
- Sign Up still submits through Supabase browser auth and redirects to Sign Up Confirmation.
- Sign In still signs in through Supabase browser auth and returns to the requested `next` route when present.
- Password Recovery still submits through Supabase browser auth and redirects to Password Recovery Confirmation.

## Boundaries

- No automated test scaffolding is introduced by this note.
- No broad validation framework is introduced by this note.
- Dictionary, settings, delete, cache, theme, and sign-out behavior are outside this smoke note except for confirming they remain untouched by the completion-page slice.
