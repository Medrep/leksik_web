# Web Client Status

## Purpose

This document is the current implementation snapshot for the Leksik web client. It records implemented capabilities, current limitations, and available verification notes without redefining neighboring authorities.

- [Web scope](WEB_CLIENT_SCOPE.md) defines accepted and excluded capabilities.
- [User flows](WEB_CLIENT_FLOWS.md) defines user journeys and transitions.
- [Screens and routes](WEB_CLIENT_SCREENS.md) defines routes, screen composition, and visible states.
- [Web architecture](ARCHITECTURE.md) defines technical boundaries and runtime behavior.
- [Backend integration](BACKEND_INTEGRATION.md) defines consumed backend surfaces and frontend mapping.

## Implemented capabilities

### Public and authentication

- The public landing entry is available.
- Sign up, sign in, sign out, and password-recovery initiation are available.
- Sign-up and password-recovery confirmation screens are available.
- Browser authentication sessions support entry into the protected web application.

### Protected application entry

- Dictionary and Settings use a shared authenticated application shell.
- Protected routes handle authenticated entry and access readiness before showing application content.
- Authentication redirects preserve the intended protected destination and continue there after successful sign in.
- A required language-preference onboarding gate appears when the learning language or preferred translation language is missing.

### Dictionary

- The authenticated dictionary list and text search are available.
- Dictionary item details are available for individual saved items.
- Loading, error, dictionary-empty, and search-empty states are represented.
- Dictionary deletion is available from item details with explicit confirmation and return to the dictionary after success.

### Settings

- Settings supports learning language, preferred translation language, and interface language preferences.
- Daily-review enablement, target count, preferred time, and timezone preferences are available.
- Telegram connection status and authenticated link completion are available in Settings.
- Self-service account deletion is available from Settings with explicit destructive confirmation.

### Telegram

- Telegram linking can be completed from Settings.
- A dedicated Telegram completion experience is available at `/telegram/complete`.
- The completion experience represents authentication-required, checking, success, invalid or expired, and blocked or conflict states.

### Localization

- Web-owned interface copy is available in:
  - English (`en`);
  - Polish (`pl`);
  - Russian (`ru`);
  - Ukrainian (`uk`).
- Public and authenticated web surfaces use the supported interface locales.
- An authenticated user can select an interface language, with supported browser-locale fallback available when no explicit preference is active.

### Browser behavior

- The web presentation supports mobile and desktop browser widths.
- A browser-side cache is used as a read optimization for dictionary list and item details.

## PWA launch workstream

### Implemented

- **PWA-00 — Launch Baseline and Documentation Alignment:** completed in the web and backend documentation repositories.
- **PWA-01 — Installability Foundation:** implementation and static validation are complete. Physical installation verification remains pending on iPhone Safari and Android Chrome, so the PWA-01 gate has not yet passed.

### Planned / not implemented

- **PWA-02 — Installed Runtime Hardening:** planned; installed-runtime hardening is not yet implemented.
- **PWA-03 — Minimal Installation UX:** planned; no installation-help UI is implemented.
- **PWA-04 — Final Real-Device Launch Gate:** planned; it is not yet executed or passed.

The intended initial delivery is iOS Safari Add to Home Screen and Android Chrome PWA. App Store, Google Play, Capacitor iOS, and a Capacitor Android distribution package are deferred. The accepted PWA install contract and online-first boundary are documented in [Web architecture](ARCHITECTURE.md); validation evidence belongs in [the PWA launch checklist](PWA_LAUNCH_CHECKLIST.md).

## Current limitations

- Telegram remains the primary vocabulary-capture and daily-review surface.
- The web client does not provide vocabulary capture or review-session UI.
- The web presentation is light-theme only.
- Root document metadata and the root HTML language remain static English rather than following the active interface locale.
- No service worker, offline mode, background synchronization, offline mutation queue, or push-notification implementation is present.
- The manifest icon set does not include a maskable icon; safe-zone qualification is deferred as non-blocking polish.
- Real-device PWA launch validation remains pending on one current supported iPhone Safari and one current supported Android Chrome device, in both browser and installed standalone contexts.
- Additional accepted and excluded capability boundaries are maintained in [Web scope](WEB_CLIENT_SCOPE.md).

## Verification

- The snapshot is consistent with the current route and capability structure under `app/`, `components/`, and `lib/`.
- PWA-01 passes `git diff --check`, TypeScript validation, and the production build. The generated manifest, root metadata, public icon responses, icon MIME types, and required dimensions were inspected locally.
- Focused manual checks for Telegram completion and public authentication non-regression are documented in [Web Client Manual Smoke Notes](WEB_CLIENT_MANUAL_SMOKE.md).
- No physical-device installation result or broader automated-test result is asserted by this snapshot.
