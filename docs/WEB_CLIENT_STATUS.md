Responsive web client status brief

Project position
- This repository contains the narrow responsive web client for the Personal AI Vocabulary System.
- It is a separate client repository.
- It is a thin client over the existing backend.
- The backend remains the system core.
- Telegram remains the primary interface for capture and daily review.

Accepted scope implemented
- Landing / Entry
- Sign Up
- Sign Up Confirmation
- Sign In
- Password Recovery
- Password Recovery Confirmation
- Dedicated Telegram Completion at `/telegram/complete`
- authenticated Telegram completion handoff through:
  - POST /messaging-links/telegram/complete
- Supabase browser auth for web auth entry
- authenticated-entry bootstrap through:
  - GET /auth/me
  - GET /auth/access
- Dictionary List
- search inside Dictionary List
- Card Details
- sign-out action
- responsive browser support for mobile and desktop
- protected narrow settings route
- narrow settings screen for accepted learning preferences and the relocated existing Telegram link panel
- minimal authenticated header settings gear entry to `/settings`
- dictionary rendering aligned to the accepted explanation/translation rule
- empty dictionary state with a simple CTA inside Telegram-first product boundaries
- narrow details-first delete flow from Card Details only
- lightweight local cache for dictionary list and card details

Explicitly out of scope and still excluded
- manual add
- review UI
- Telegram replacement
- admin
- billing UI
- OCR
- manual status change
- advanced filters
- broad settings/profile/account expansion
- restore/trash flow
- offline-first sync
- client-owned business logic

Implemented architecture boundary
- browser auth uses Supabase directly
- protected backend requests use Authorization: Bearer <supabase_jwt>
- authenticated entry is validated through backend-owned checks:
  - GET /auth/me
  - GET /auth/access
- Dictionary List uses the protected backend model
- Card Details uses the protected backend model
- settings use the shared backend learning-preferences endpoints
- delete uses the backend-owned soft-delete endpoint
- sign out uses the real Supabase sign-out path
- lightweight cache is a browser-side read optimization only
- the client does not implement a parallel auth/session model

Current implementation status
- `/` now renders the real Landing / Entry screen with product mark/name, short supporting copy, a primary Sign in action to `/sign-in`, and a secondary Create account action to `/sign-up`.
- public auth-entry screens are implemented
- `/sign-up`, `/sign-in`, and `/password-recovery` use the refreshed public auth form presentation for layout, spacing, typography, labels, inline field errors, and auth/config error blocks.
- mobile width containment for the shared public auth layout/card/form layer has been tightened so `/sign-up`, `/sign-in`, and `/password-recovery` do not force horizontal overflow through inputs, buttons, cards, or status/error text.
- sign-up now presents the name field with the UI label `Display name`; auth behavior, validation, submit flow, route structure, and backend integration remain unchanged.
- public auth behavior remains unchanged: routing, validation, fields, submit logic, and backend integration were not changed by the mobile containment fix.
- `/sign-up/confirmation` and `/password-recovery/confirmation` use the refreshed public confirmation presentation with narrower centered layout, updated icon treatment, supporting copy layout, and button-style actions.
- confirmation behavior remains unchanged: sign-up confirmation routes to sign in with existing `next` handling, password recovery confirmation links back to sign in and reset-again, and no resend-email implementation or backend call was added.
- successful sign-up now redirects to a dedicated check-your-email confirmation screen
- public auth interaction layer is implemented
- Supabase browser auth is wired
- authenticated route entry is gated through real backend auth/access checks
- dedicated Telegram completion page is implemented at `/telegram/complete`
- `/telegram/complete` uses the refreshed Telegram completion presentation with narrower centered layout, refreshed spacing/typography, state-specific icon treatment, compact supporting detail block, and button-style CTAs.
- Telegram completion state coverage and behavior remain unchanged: success, checking, sign-in-required, blocked/conflict, and invalid/expired states are present, endpoint usage and state/result mapping are unchanged, and the success CTA still leads to `/dictionary`.
- authenticated Telegram completion handoff is isolated to `/telegram/complete`
- Telegram completion uses the existing backend endpoint only:
  - POST /messaging-links/telegram/complete
- Dictionary List is backend-backed
- dictionary search is backend-owned and stays inside Dictionary List
- the existing Telegram link panel/functionality has been removed from `/dictionary`; Dictionary List behavior is otherwise unchanged.
- Card Details is backend-backed
- `/dictionary/[item_id]` uses the refreshed Card Details presentation with a narrower one-column reading layout, compact metadata, canonical-form placement, refreshed translation/explanation/examples structure, loading/error panels, and refreshed delete UI.
- Card Details field coverage and behavior remain unchanged: translation, explanation, examples, canonical form, language, and learning status render when returned and allowed by existing data/preferences logic, and the back path to `/dictionary` remains in place.
- protected settings route and screen are implemented
- `/settings` uses the refreshed settings presentation with a narrower centered layout, updated typography/spacing, section structure, select styling, save/retry actions, and loading/success/error presentation.
- `/settings` now includes `learning_language`, `preferred_translation_language`, `ui_locale`, `daily_review_enabled`, `daily_review_target_count`, `preferred_review_time`, and `preferred_review_timezone`.
- Settings use the existing `GET /preferences/learning` load flow and `PUT /preferences/learning` save flow for all accepted learning-preference fields.
- `learning_language` is nullable, uses the existing shared learning-preferences endpoints, and is presented only as a hint for interpreting newly captured words or phrases.
- `learning_language` and `preferred_translation_language` share the same controlled non-null language options: `en`, `pl`, `ru`, `uk`, `de`, `es`, and `pt`.
- `preferred_translation_language` behavior remains unchanged: the existing label/value mapping and null-cleared backend behavior remain intact.
- `ui_locale` is wired as the nullable Interface language preference with controlled values `en`, `pl`, `ru`, and `uk`; `null` is shown as `System/browser default` and clears the explicit saved override.
- One authenticated web-owned locale runtime now resolves effective locale in the order saved `ui_locale`, supported browser locale, then English.
- Browser locale resolution is transient, supports regional `en`, `pl`, `ru`, and `uk` tags, and is never silently persisted.
- Authenticated localization coverage now includes Settings, the shared authenticated shell, Dictionary List, and Dictionary Details in `en`, `pl`, `ru`, and `uk` through the same locale owner and typed bundle system.
- Dictionary List includes localized search, loading, empty/error/helper states, Telegram CTA copy, and a narrow locale-aware saved-word count; Dictionary Details includes localized navigation, states, labels, missing-content copy, and delete confirmation flow.
- Product vocabulary terms, generated translations, explanations, examples, metadata values, language badges, identifiers, backend requests, and payloads remain unchanged by the web localization runtime.
- An unsaved Interface language draft does not change the active locale; the locale changes immediately only from the authoritative successful PUT response, while failed saves preserve the previous locale and draft.
- The web client owns typed message bundles; backend and web share locale identifiers, not translation bundles, and no third-party i18n dependency was introduced.
- The authenticated language-preferences onboarding gate now uses the existing locale runtime for its title, helper copy, field labels, controlled option display labels, action/loading state, generic error, and accessible names; both existing language values remain required and `ui_locale` remains optional.
- Telegram completion uses the same typed bundles for runtime-safe authenticated checking, success, blocked/conflict, and invalid/expired states without changing token handling, endpoint behavior, result mapping, or navigation.
- Public/auth pages and Telegram completion states rendered before an authenticated locale is available remain English; root `<html lang="en">` remains intentionally static.
- No public locale owner, additional preferences request, or third-party internationalization dependency was introduced; locale precedence remains saved `ui_locale`, supported browser locale, then English.
- Locale-aware routes, server locale cookies, request-based locale propagation, dynamic metadata localization, and broader web localization remain out of scope.
- Settings preference updates now send only fields changed from the backend-confirmed saved baseline; omitted fields remain untouched, while explicit nullable changes continue to serialize as `null`.
- `preferred_review_timezone` is loaded and saved through the existing shared preferences flow; nullable or unset timezone values are handled safely and can be saved back as `null`.
- `daily_review_target_count` uses step `5`, minimum `5`, and maximum `50`; temporarily null daily-review preference values are handled with narrow defensive defaults.
- the existing Telegram link panel/functionality now lives on `/settings` and is visually integrated into the settings layout.
- Telegram-related behavior remains unchanged: status loading, link completion, conflict handling, endpoint usage, and backend-owned semantics are unchanged; the code input and `Complete link` action are hidden when status is `linked`.
- No Telegram reassignment, unlinking, provider-management, account-center behavior, or new backend calls were added.
- accepted learning-preference load/save is implemented through:
  - GET /preferences/learning
  - PUT /preferences/learning
- dictionary rendering now follows the accepted rule:
  - explanation is shown as the source-language explanation
  - translation is shown only when `preferred_translation_language` is set and backend returns translation
- empty dictionary state is implemented with a narrow CTA that stays inside Telegram-first boundaries
- details-first delete is implemented from Card Details only with a small confirmation step
- delete mechanics remain unchanged: the delete action opens the confirmation block, `Confirm delete`, `Cancel`, `Deleting…`, and delete error messaging remain present, and successful delete returns to `/dictionary`.
- successful delete returns the user to Dictionary List and removes the deleted item from normal visible reads
- lightweight local cache is implemented for dictionary list and card details
- cache invalidation is implemented after:
  - delete
  - sign out / auth-boundary loss
  - relevant settings changes
- dark theme support and theme-toggle UI have been removed; the web client now uses the light-theme presentation only.
- shared public and authenticated layouts are implemented
- the authenticated shared header now includes a settings gear icon before the existing Sign out action; it links to `/settings`, and sign-out behavior remains unchanged.
- production build passes

Known confirmed contract points
- browser auth uses Supabase directly
- protected backend requests use Authorization: Bearer <supabase_jwt>
- authenticated entry uses GET /auth/me and GET /auth/access
- GET /vocab exists
- GET /vocab/{item_id} exists
- DELETE /vocab/{item_id} exists
- GET /preferences/learning exists
- PUT /preferences/learning exists
- POST /messaging-links/telegram/complete exists for authenticated Telegram completion handoff
- dictionary reads are user-scoped
- GET /vocab supports:
  - search
  - language
  - learning_status
- GET /vocab currently has no pagination params and no pagination metadata
- confirmed backend/project evidence supports snake_case fields such as:
  - display_text
  - canonical_text
  - translation
  - short_explanation
  - examples
  - learning_status
  - preferred_translation_language
  - learning_language
  - ui_locale

Known explicitly provisional contract points
- exact GET /vocab response envelope and item schema beyond the current accepted narrow field family
- exact guaranteed vs optional fields for list/details beyond the currently confirmed baseline
- exact examples payload shape beyond current accepted narrow handling
- exact unauthenticated and access-denial status-code behavior for both vocab reads and delete
- item-id field naming in response payloads if backend/docs still mix `item_id`, `id`, or another confirmed identifier field

Local contract-clarification artifact
- docs/BACKEND_CONTRACT_CLARIFICATION_NOTE.md

Important implementation rules going forward
- do not add new frontend features unless explicitly accepted
- do not expand scope beyond the accepted screen set
- do not add client-owned auth, access, search, or delete logic
- do not promote extra backend fields into UI scope automatically
- keep delete details-first and narrow
- keep search inside Dictionary List
- keep sign out as an action, not a screen
- keep the client on the light-theme presentation only; do not add appearance settings or theme switching without explicit acceptance
- keep cache as a lightweight read optimization only
- keep Telegram completion isolated to the dedicated `/telegram/complete` route
- do not turn Telegram completion into generic onboarding, account-center, provider-management, unlink, or reassignment UI

Current baseline result
- the accepted baseline-update slices are implemented through:
  - request/helper + preferences contract wiring
  - settings route, screen, and navigation entry
  - dictionary rendering rules + empty-state CTA
  - details-first delete flow
  - lightweight local cache for dictionary list and card details
- the dedicated Telegram completion route and authenticated handoff are implemented as narrow onboarding additions
- no broader scope expansion was introduced
