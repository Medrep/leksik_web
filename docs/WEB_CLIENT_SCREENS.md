# WEB_CLIENT_SCREENS.md

## Purpose

This document defines the screen list for the responsive web client of the Personal AI Vocabulary System.

Its purpose is to translate the accepted narrow web-client scope and flow set into a practical implementation-baseline screen map.

This document defines:
- screen list
- purpose of each screen
- key UI blocks per screen
- entry and exit paths between screens
- what is intentionally excluded from each screen

This document does not define:
- backend implementation
- component-level implementation detail
- design-system specification
- mobile app screens
- capture screens
- review screens
- admin or billing screens

The backend remains the system core.
Telegram remains the primary interface for capture and daily review.

## Status

- implementation-baseline screen document
- aligned to the approved narrow responsive web-client scope
- not a full frontend product screen map
- not a mobile-app specification

## Screen system principles

### 1. Narrow screen rule
Only screens required for:
- account entry
- authenticated dictionary browsing
- dictionary search within Dictionary List
- read-only card details viewing
- narrow backend-backed settings/preferences
- responsive browser usability
- password recovery

are included in this document.

### 2. Backend-first rule
Screens render backend-owned state.
They do not introduce client-owned business logic.

### 3. Telegram-first rule
The web client does not add screens for:
- vocabulary capture
- ready-card creation after capture
- daily review
- review answering
- review feedback

Those remain in Telegram.

### 4. Responsive rule
This is one responsive screen system for:
- mobile browser
- desktop browser

It is not a separate mobile-web product and not a separate desktop product.

## Screen list

The approved narrow screen set is:

1. Landing / Entry
2. Sign Up
3. Sign Up Confirmation
4. Sign In
5. Password Recovery
6. Password Recovery Confirmation
7. Dictionary List
8. Card Details
9. Settings

Narrow accepted add-on route:
- Dedicated Telegram Completion at `/telegram/complete`

No additional product screens should be assumed unless explicitly accepted later.

## Narrow Add-On — Dedicated Telegram Completion

### Purpose
Provide one public Telegram-first completion surface for users arriving from Telegram with a backend-owned one-time completion code.

### Key UI blocks
- Telegram-specific completion status
- auth-required state when the product account session is not ready
- loading/checking state while authenticated completion is handed to the backend
- success state after backend completion returns linked
- blocked/conflict state when backend-owned linking rules block completion
- invalid/expired state for missing, invalid, or expired completion codes
- refreshed Telegram completion presentation with narrower centered layout, refreshed spacing and typography, state-specific icon treatment, compact supporting detail block, and button-style CTAs

### Entry paths
- direct visit to `/telegram/complete?code=...` from Telegram-first onboarding
- return from Sign In through the `next` parameter

### Exit paths
- to Sign In when authentication is required
- to Sign Up when account creation is needed
- to Dictionary through the success CTA after backend completion returns linked

### Intentionally excluded
- generic onboarding framework
- settings or dictionary branch behavior
- provider-management UI
- account-center behavior
- unlink or reassignment flow
- second completion endpoint or fallback completion route
- client-owned interpretation of Telegram identity or ownership
- Telegram capture or review behavior

## Screen 1 — Landing / Entry

### Purpose
Provide the public browser entry point into the web client and route the user into sign up or sign in.

### Key UI blocks
- product mark / identity
- short product positioning text
- primary action: sign in to `/sign-in`
- secondary action: create account to `/sign-up`
- brief note that capture and daily review happen through Telegram

### Entry paths
- direct visit to web root
- return to public entry after sign-out action

### Exit paths
- to Sign In
- to Sign Up

### Intentionally excluded
- large marketing-site sections
- feature-comparison sections
- pricing
- onboarding walkthrough
- Telegram linking flow
- app dashboard navigation before authentication
- review or capture actions

## Screen 2 — Sign Up

### Purpose
Allow a new user to create an account and reach the sign-up confirmation state.

### Key UI blocks
- back navigation to Landing / Entry if retained by UI
- screen title
- required sign-up form fields, including the `Display name` UI label for the name field
- primary submit action
- link/path to Sign In
- refreshed public auth form presentation for layout, spacing, typography, labels, inline field errors, and auth/config error blocks

### Entry paths
- from Landing / Entry
- from Sign In

### Exit paths
- to Sign Up Confirmation after successful submission
- to Sign In
- to Landing / Entry if that navigation pattern is retained

### Intentionally excluded
- profile-completion flow
- billing step
- access-plan selection
- Telegram linking
- tutorial/onboarding wizard
- advanced account settings
- any post-sign-up capture flow

## Screen 3 — Sign Up Confirmation

### Purpose
Confirm that registration was accepted and tell the user to check their email before signing in.

### Key UI blocks
- success/confirmation message
- brief instruction to check email for the confirmation link
- button-style action to Sign In using the existing sign-in route and `next` handling
- refreshed public confirmation presentation with narrower centered layout, updated icon treatment, and supporting copy layout

### Entry paths
- from Sign Up after accepted submission

### Exit paths
- to Sign In with existing `next` handling

### Intentionally excluded
- resend-email implementation or backend call
- onboarding expansion
- account-setup wizard
- authenticated product navigation
- broader account-management UI

## Screen 4 — Sign In

### Purpose
Allow an existing user to authenticate and enter the authenticated web-client path.

### Key UI blocks
- back navigation to Landing / Entry if retained by UI
- screen title
- sign-in form fields
- primary submit action
- link/path to Password Recovery
- link/path to Sign Up
- refreshed public auth form presentation for layout, spacing, typography, labels, inline field errors, and auth/config error blocks

### Entry paths
- from Landing / Entry
- from Sign Up
- from protected-route redirect for unauthenticated user

### Exit paths
- to Dictionary List after successful sign-in
- to Password Recovery
- to Sign Up
- to Landing / Entry if that navigation pattern is retained

### Intentionally excluded
- broader account-management UI
- security-center UI
- social login expansion unless explicitly accepted later
- Telegram linking
- capture or review actions

## Screen 5 — Password Recovery

### Purpose
Allow the user to initiate password recovery from the web client.

### Key UI blocks
- back navigation to Sign In
- screen title
- recovery email input
- primary action to initiate recovery
- refreshed public auth form presentation for layout, spacing, typography, labels, inline field errors, and auth/config error blocks

### Entry paths
- from Sign In

### Exit paths
- to Password Recovery Confirmation after successful submission
- back to Sign In

### Intentionally excluded
- broader account-management area
- password policy/settings area
- multi-step recovery dashboard
- unrelated support/contact flows
- authenticated product navigation

## Screen 6 — Password Recovery Confirmation

### Purpose
Confirm that the password recovery initiation request was accepted and guide the user back to Sign In.

### Key UI blocks
- success/confirmation message
- brief instruction such as check-your-inbox
- button-style action back to Sign In
- secondary reset-again link back to Password Recovery
- refreshed public confirmation presentation with narrower centered layout, updated icon treatment, and supporting copy layout

### Entry paths
- from Password Recovery after accepted submission

### Exit paths
- to Sign In
- to Password Recovery for reset-again

### Intentionally excluded
- resend-email implementation or backend call
- account-management expansion
- support workflow
- broader auth troubleshooting UI
- authenticated product navigation

## Screen 7 — Dictionary List

### Purpose
Provide the main authenticated web-client screen for browsing and searching the current user’s dictionary.

### Key UI blocks
- minimal authenticated header/shell
- product mark / identity
- sign-out action
- minimal authenticated settings navigation entry
- dictionary search input
- dictionary result count or equivalent lightweight list context
- responsive list/grid of user-scoped dictionary items
- item summary block for each result
- empty state with a simple CTA inside Telegram-first product boundaries when no items are visible
- navigation into Card Details

### Entry paths
- after successful sign-in
- default authenticated-shell entry
- return from Card Details
- direct visit to protected dictionary route by authenticated user

### Exit paths
- to Card Details
- to Settings when provided by the minimal authenticated layout
- sign-out action returns user to Landing / Entry

### Intentionally excluded
- manual add
- advanced filters
- sort/filter control expansion beyond accepted search
- manual status change
- separate Telegram management area
- unlink flow
- reassignment flow
- review controls
- capture controls
- bulk actions
- admin or broader account-management navigation
- billing/subscription navigation

## Screen 8 — Card Details

### Purpose
Show the accepted card fields for one user-scoped dictionary item together with the narrow details-first delete action.

### Key UI blocks
- back navigation to Dictionary List at `/dictionary`
- minimal authenticated header pattern if retained by layout
- sign-out action when presented in the shared authenticated layout
- word or phrase
- compact metadata presentation
- canonical form when applicable
- explanation in the source word language
- translation only when `preferred_translation_language` is set and backend returns translation
- examples
- language label only when present in the accepted backend detail payload
- learning status only when present in the accepted backend detail payload
- narrow delete action from Card Details only
- refreshed delete presentation with confirmation, `Confirm delete`, `Cancel`, `Deleting…`, and delete error messaging
- refreshed one-column reading-oriented detail composition with updated loading/error panels

### Entry paths
- from Dictionary List
- from search results inside Dictionary List

### Exit paths
- back to Dictionary List at `/dictionary`
- back to Dictionary List at `/dictionary` after successful delete
- sign-out action returns user to Landing / Entry when available from the shared authenticated layout

### Intentionally excluded
- edit controls
- restore/trash/bulk-delete controls
- manual status change
- notes editor
- source/history management UI
- review actions
- capture actions
- arbitrary extra sections just because backend may expose additional fields

## Screen 9 — Settings

### Purpose
Provide one narrow authenticated settings/preferences screen for accepted backend-backed user settings and the relocated existing Telegram link panel.

### Key UI blocks
- minimal authenticated header/shell
- screen title
- sign-out action when presented in the shared authenticated layout
- refreshed narrower centered settings presentation with updated spacing, typography, and section structure
- accepted backend-backed settings fields:
  - `preferred_translation_language`
  - `daily_review_enabled`
  - `daily_review_target_count`
  - `preferred_review_time`
  - `preferred_review_timezone`
- existing `preferred_translation_language` label/value mapping and null-cleared backend behavior
- daily review enabled control
- daily review target count control using step `5`, minimum `5`, and maximum `50`
- preferred review time control
- preferred review timezone control with nullable/unset values handled safely through the shared preferences contract
- refreshed select control, save action, retry action, and loading/success/error presentation
- relocated existing Telegram link-status/completion panel, visually integrated into the settings layout
- existing Telegram status loading, link completion, and conflict presentation without behavior expansion; code input and `Complete link` are hidden when status is `linked`
- submit/apply action only when required by the accepted backend contract

### Entry paths
- from Dictionary List when settings navigation is present in the minimal authenticated layout
- direct visit to protected settings route by authenticated user

### Exit paths
- back to Dictionary List
- sign-out action returns user to Landing / Entry when available from the shared authenticated layout

### Intentionally excluded
- profile editing
- password/security-center expansion
- billing/subscription management
- admin controls
- Telegram linking management expansion beyond the existing relocated panel
- Telegram panel expansion beyond the existing relocated panel
- Telegram reassignment or unlinking
- provider-management or account-center behavior
- daily-review controls beyond the accepted learning-preference fields
- capture or review actions
- support/operations tooling
- arbitrary web-only preferences outside the backend settings/preferences contract

## Shared layout behavior

### Public auth-entry layout
The following screens may share one common public layout pattern:
- Landing / Entry
- Sign Up
- Sign Up Confirmation
- Sign In
- Password Recovery
- Password Recovery Confirmation

Shared traits may include:
- centered auth-entry content
- refreshed form presentation on Sign Up, Sign In, and Password Recovery
- refreshed confirmation presentation on Sign Up Confirmation and Password Recovery Confirmation
- lightweight branding
- consistent navigation/back pattern
- light-theme presentation only

This is a presentation pattern only.
It does not imply additional product scope.

### Authenticated layout
The following screens may share one minimal authenticated layout pattern:
- Dictionary List
- Card Details
- Settings

Shared traits may include:
- lightweight header
- product mark
- sign-out action
- light-theme presentation only
- no explanatory side panels or internal helper chrome

This is a minimal shell only.
It must not expand into a broader application workspace.

## Cache boundary

Lightweight local cache may support:
- Dictionary List read reuse
- Card Details read reuse

This is an implementation optimization only.
It is not a separate screen, flow, or product surface.

## Mobile and desktop behavior

The same screen set above must work across:
- mobile browser
- desktop browser

Responsive adaptation may change:
- spacing
- card/list density
- grid vs stacked layout
- header composition
- search-field placement

Responsive adaptation must not change:
- product scope
- flow availability
- backend ownership boundaries
- Telegram-first capture/review boundaries

## Theme boundary

The web client uses the light-theme presentation only.

It must not imply:
- broader profile/account-management area
- appearance settings
- dark theme support or theme-toggle UI

## Backend source-of-truth boundary by screen

### Public auth-entry screens
Backend owns:
- account creation
- authentication
- recovery initiation
- session validity

### Authenticated dictionary screens
Backend owns:
- access validation
- user-scoped dictionary list
- user-scoped dictionary search
- user-scoped card details payload

### Settings screen
Backend owns:
- accepted settings/preferences data
- accepted settings/preferences update behavior
- the same settings/preferences contract used by the mobile app where applicable

The web client renders these states and routes the user between accepted screens.
It does not re-own these responsibilities.

## Explicit screen exclusions

The following screens are intentionally excluded from this document:
- Manual Add
- Review
- Status Change
- Filters panel / advanced filtering
- Profile
- Billing
- Admin
- OCR
- Telegram linking
- Analytics
- Notifications center

## Final screen rule

If a screen is not required for:
- account entry
- password recovery
- authenticated dictionary browsing
- dictionary search within Dictionary List
- read-only card viewing
- narrow backend-backed settings/preferences
- responsive browser usability
- light-theme presentation

it is out of scope for this web-client workstream unless explicitly accepted later.
