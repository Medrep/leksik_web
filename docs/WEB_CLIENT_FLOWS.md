# WEB_CLIENT_FLOWS.md

## Purpose

This document defines the accepted narrow user flows for the responsive web client of the Personal AI Vocabulary System.

Its purpose is to translate the accepted web-client scope into a small set of implementation-baseline flows without expanding the web client into a full frontend product.

This document covers only:
- landing / entry
- sign up
- sign in
- password recovery
- authenticated shell entry
- dictionary list browsing
- dictionary search
- card details viewing
- settings
- details-first delete
- empty dictionary state
- sign out
- responsive browser usage on mobile and desktop
- light-theme presentation only

It does not define:
- backend implementation
- deployment behavior
- mobile-app implementation
- capture flows
- review flows
- admin flows
- billing flows

The backend remains the system core.
Telegram remains the primary interface for capture and daily review.

## Status

- implementation-baseline flow document
- aligned to the updated narrow responsive web-client scope
- not a full product flow map
- not a replacement for the broader app roadmap

## Flow principles

### 1. Backend-first rule
All identity, access, dictionary, preference, and delete behavior remain backend-owned.
The web client is a thin browser client over backend behavior.

### 2. Telegram-first rule
The web client does not take over:
- vocabulary capture
- ready-card delivery after capture
- daily review
- review answer submission
- review feedback

Those flows remain in Telegram.

### 3. Narrow-flow rule
Only the smallest user-facing flows required for account entry, dictionary usage, narrow settings, and narrow delete behavior are included here.

### 4. No client-side business-logic rule
If a flow depends on authentication, access state, dictionary ownership, preferences, or delete behavior, the backend is the source of truth.
The web client must not invent fallback client-side logic for those responsibilities.

### 5. Read-optimization rule
Lightweight local cache may support the user experience for dictionary reads, but it does not create a separate product flow and does not change backend ownership.

## Included flows

The accepted narrow web-client flows are:

1. Landing / entry
2. Sign up
3. Sign in
4. Password recovery
5. Authenticated shell entry
6. Dictionary list browsing
7. Dictionary search
8. Card details viewing
9. Settings
10. Details-first delete
11. Empty dictionary state
12. Sign out
13. Responsive use on desktop and mobile browser
14. Light-theme presentation only

## Flow 1 — Landing / entry

### Purpose
Give the user a simple browser entry point into the product and route them into sign up or sign in.

### Entry points
- direct visit to the web root
- return visit to the public entry page
- sign-out completion

### Main path
1. User opens the web client.
2. User sees the landing / entry screen.
3. User chooses either:
   - sign in to `/sign-in`
   - sign up to `/sign-up`

### Exit paths
- to sign in
- to sign up

### Notes
- Landing is a lightweight entry surface, not a marketing-site expansion.
- It may communicate that capture and daily review happen through Telegram.
- It does not introduce broader product navigation before authentication.

## Flow 2 — Sign up

### Purpose
Allow a new user to create an account through the web client.

### Entry points
- from landing / entry
- from sign in via sign-up path

### Main path
1. User opens the sign-up screen.
2. User enters required registration fields.
3. User submits the sign-up form.
4. Browser auth flow creates the account through the accepted auth boundary.
5. On success, user reaches a dedicated sign-up confirmation state that tells them to check their email.

### Success result
- user account is created
- user is redirected away from the sign-up form
- user reaches a dedicated sign-up confirmation state
- user is instructed to check email before signing in

### Failure result
- sign-up failure is shown to the user
- user remains in the sign-up flow and can retry

### Exit paths
- to sign-up confirmation on success
- back to sign in
- back to landing if supported by the UI design

### Boundaries
- This flow creates account entry only.
- It does not include onboarding expansion, profile completion, billing setup, Telegram linking, or tutorial flows.

## Flow 3 — Sign in

### Purpose
Allow an existing user to authenticate and enter the web client.

### Entry points
- from landing / entry
- from sign up via already-have-an-account path
- from protected-route redirect behavior

### Main path
1. User opens the sign-in screen.
2. User enters credentials.
3. User submits the sign-in form.
4. Browser auth flow validates the session.
5. On success, user enters the authenticated shell and dictionary entry path.

### Success result
- authenticated session is established through the accepted browser-ready auth path
- user reaches the authenticated web-client path

### Failure result
- sign-in failure is shown to the user
- user remains in the sign-in flow and can retry

### Exit paths
- to authenticated shell entry on success
- to password recovery
- to sign up
- back to landing if supported by the UI design

### Boundaries
- This flow is only for authentication.
- It does not include advanced security or account-management UI beyond the accepted narrow auth-entry path.

## Flow 4 — Password recovery

### Purpose
Allow the user to initiate password recovery through the web client.

### Entry points
- from sign in

### Main path
1. User opens the password recovery screen.
2. User enters email.
3. User submits the recovery form.
4. Recovery initiation runs through the accepted auth boundary.
5. User sees the recovery confirmation state.

### Success result
- recovery initiation request is accepted
- user sees a confirmation state such as check-your-inbox

### Failure result
- recovery initiation failure is shown
- user remains in the recovery flow and can retry

### Exit paths
- back to sign in
- remain on recovery confirmation state until user leaves

### Boundaries
- This flow covers recovery initiation only.
- It does not expand into a broader account-management area.

## Flow 5 — Authenticated shell entry

### Purpose
Provide the smallest authenticated browser entry into the dictionary experience.

### Entry points
- successful sign in
- successful sign in after email confirmation
- returning authenticated user opening a protected route
- successful session restoration on browser revisit

### Main path
1. User reaches an authenticated route.
2. Web client resolves the authenticated session through the accepted auth path.
3. Web client resolves the current user and allowed access state through backend-owned checks.
4. User is admitted into the minimal authenticated shell.
5. Default continuation goes to dictionary list.

### Success result
- authenticated user reaches the protected web-client area
- dictionary becomes the main post-auth destination

### Failure result
- unauthenticated user is sent to sign in
- invalid or expired session returns user to the auth-entry path
- unresolved access or auth dependency is treated as backend/API dependency behavior, not client-owned business logic

### Exit paths
- to dictionary list
- to settings
- to sign out

### Boundaries
- Authenticated shell is intentionally minimal.
- It is not a broader application workspace.
- It is not a multi-feature dashboard.
- It is not an admin shell or broad account-management shell.

## Flow 6 — Dictionary list browsing

### Purpose
Allow the authenticated user to browse their saved dictionary items.

### Entry points
- authenticated shell default entry
- return from card details
- returning authenticated session opening the dictionary route directly
- return from settings after relevant preference change
- return after successful delete

### Main path
1. Authenticated user opens dictionary list.
2. Web client requests the current user’s dictionary list from the backend.
3. Backend returns user-scoped dictionary items.
4. Web client renders the list in responsive form.
5. User scrolls or browses the list.
6. User opens one item to view card details.

### Success result
- user can browse their own dictionary items
- list supports responsive presentation for desktop and mobile browser

### Failure result
- loading or access error is shown
- user does not get fallback access to non-owned data

### Exit paths
- to card details
- remain on dictionary list
- to settings
- to sign out

### Boundaries
- This is a dictionary browsing flow.
- Search remains inside this screen.
- This flow does not include manual add.
- This flow does not include manual status change.
- This flow does not include review actions.
- This flow does not include advanced filters.

## Flow 7 — Dictionary search

### Purpose
Allow the authenticated user to search their own dictionary by text.

### Entry points
- inside dictionary list

### Main path
1. User is on dictionary list.
2. User enters search text.
3. Web client sends the search request through the accepted dictionary list/search API path.
4. Backend applies search within the current user’s dictionary scope.
5. Matching results are returned and rendered in the same dictionary view.

### Success result
- user can narrow the visible dictionary list by text query
- search remains scoped to the current user’s dictionary

### Failure result
- search error is shown within the dictionary context
- no client-owned search logic replaces backend search ownership

### Exit paths
- open card details from filtered results
- clear search and return to the broader dictionary list

### Boundaries
- Search is limited to dictionary text search.
- Search remains inside Dictionary List.
- This flow does not include advanced filters.
- This flow does not include saved searches or search analytics.

## Flow 8 — Card details viewing

### Purpose
Allow the authenticated user to open a stored dictionary item and view its accepted card fields.

### Entry points
- from dictionary list
- from search results within dictionary list

### Main path
1. User selects a dictionary item.
2. Web client requests the item details from the backend.
3. Backend returns the user-scoped card details.
4. Web client renders the accepted card view.
5. If delete is available, user may continue into the narrow delete flow from this screen.

### Card-details content boundary
Card details are limited to accepted dictionary/card fields:
- word or phrase
- canonical form when applicable
- explanation in the source word language
- translation only when:
  - `preferred_translation_language` is set, and
  - the backend returns translation
- examples
- language label when present in the accepted detail payload
- learning status when present in the accepted detail payload

### Success result
- user can read the stored card content for their own item
- user can navigate back to dictionary list

### Failure result
- missing or non-owned item does not open as a valid card view
- error state does not expand into broader management UI

### Exit paths
- back to dictionary list
- to details-first delete
- sign out if available from the minimal authenticated shell/header pattern

### Boundaries
- Card details do not include manual status change.
- Card details do not include capture actions.
- Card details do not include review actions.
- Card details do not include arbitrary extra fields just because the backend may return them.
- The client must not imply immediate backfill of older cards when settings change.

## Flow 9 — Settings

### Purpose
Allow the authenticated user to view and update accepted settings through backend-owned preference behavior and access the relocated existing Telegram link panel.

### Entry points
- from minimal authenticated shell/header
- from accepted authenticated navigation within dictionary/settings scope

### Main path
1. Authenticated user opens settings.
2. Web client requests accepted settings data from the backend.
3. Backend returns backend-owned settings for the current user.
4. Web client renders the accepted settings controls and the relocated existing Telegram link panel.
5. User updates accepted learning-preference fields:
   - `preferred_translation_language`
   - `daily_review_enabled`
   - `daily_review_target_count`
   - `preferred_review_time`
   - `preferred_review_timezone`
6. Web client sends the update through the accepted backend preferences endpoint.
7. Backend persists and returns the updated preference state.

### Success result
- user can view and update `preferred_translation_language`, `daily_review_enabled`, `daily_review_target_count`, `preferred_review_time`, and `preferred_review_timezone`
- `daily_review_target_count` uses step `5`, minimum `5`, and maximum `50`
- nullable or unset `preferred_review_timezone` is handled safely and can be saved back as `null`
- user can use the same Telegram status/loading/link-completion/conflict behavior that previously lived on Dictionary List
- resulting settings state is confirmed by backend-owned behavior

### Failure result
- loading or update failure is shown within the settings flow
- Telegram status or completion failure is shown within the relocated Telegram panel
- no client-owned settings logic replaces backend validation or persistence

### Exit paths
- back to dictionary list
- remain on settings
- to sign out

### Boundaries
- This is a narrow settings flow only.
- Settings preferences remain limited to `preferred_translation_language`, `daily_review_enabled`, `daily_review_target_count`, `preferred_review_time`, and `preferred_review_timezone`.
- The Telegram panel move is a placement change for existing behavior, not Telegram feature expansion.
- It does not include profile/account-management expansion.
- It does not include billing, admin, or security-center flows.
- It does not include Telegram reassignment, unlinking, provider-management, account-center behavior, or new backend calls.
- It does not include review preferences UI unless separately accepted later.

## Flow 10 — Details-first delete

### Purpose
Allow the authenticated user to delete a dictionary item through the narrow accepted delete flow.

### Entry points
- from card details only

### Main path
1. User selects delete from card details.
2. Web client shows a small confirmation step.
3. User confirms deletion.
4. Web client calls the accepted backend delete endpoint.
5. Backend applies soft delete behavior.
6. Web client invalidates affected visible read state.
7. User is redirected back to dictionary list.
8. Deleted item is no longer shown in normal dictionary browsing.

### Success result
- item is deleted through the accepted backend flow
- user returns to dictionary list
- stale visible read state is not left behind

### Failure result
- delete failure is shown within the narrow delete flow
- client does not pretend delete succeeded when backend did not confirm it

### Exit paths
- back to card details if delete is canceled
- to dictionary list after success

### Boundaries
- Delete works only from card details.
- This flow does not include restore.
- This flow does not include trash.
- This flow does not include bulk delete.
- This flow does not include list-row delete.
- This flow does not include manual status change.

## Flow 11 — Empty dictionary state

### Purpose
Provide a simple non-passive experience when the authenticated user has no visible dictionary items.

### Entry points
- dictionary list load returns no visible items for the current user

### Main path
1. User opens dictionary list.
2. Backend returns an empty user-scoped dictionary result.
3. Web client renders an empty state message.
4. Web client shows a simple CTA.
5. CTA points the user back toward the Telegram-first product path without turning the web client into a capture surface.

### Success result
- empty dictionary state is clear and not passive
- CTA remains consistent with Telegram-first product boundaries

### Failure result
- empty state does not turn into unsupported web capture behavior
- empty state does not imply missing data when the backend result is simply empty

### Exit paths
- remain on dictionary list
- follow the accepted CTA direction
- to settings
- to sign out

### Boundaries
- CTA must remain inside Telegram-first product boundaries.
- This flow does not create web capture.
- This flow does not create onboarding expansion.
- This flow does not create advanced branching by link state unless separately accepted later.

## Flow 12 — Sign out

### Purpose
Allow the authenticated user to leave the protected web-client area safely.

### Entry points
- from minimal authenticated shell/header

### Main path
1. User selects sign out.
2. Web client calls the accepted logout or session-termination path.
3. Authenticated state is cleared.
4. Relevant cached read data is cleared or made inaccessible.
5. User returns to landing or sign-in entry.

### Success result
- protected session is terminated
- protected cached read state is not left accessible after sign out
- user is no longer inside the authenticated shell

### Failure result
- sign-out error is handled as an auth or session issue
- protected access must not remain ambiguous

### Exit paths
- to landing
- to sign in

### Boundaries
- Sign out remains an action, not a standalone screen.
- It does not expand into session-management UI or account-management settings.

## Responsive usage boundary

The same narrow flows above must work in:
- mobile browser
- desktop browser

Responsive behavior means:
- the same feature scope
- the same flow system
- layout adaptation only

Responsive behavior does not mean:
- separate mobile-web scope
- separate desktop feature set
- hidden product-scope expansion on one form factor

## Theme boundary

The web client uses the light-theme presentation only.

Boundary:
- dark theme support and theme-toggle UI are not part of the current web client
- appearance settings must not be added without separate explicit acceptance
- this does not expand the accepted settings flow into a broader profile/account-management area

## Cache boundary

Lightweight local cache may support:
- dictionary list read performance
- card details read performance

Cache is not a user-facing product flow.
It is a narrow implementation optimization.

Boundary:
- backend remains the source of truth
- cache must invalidate after delete
- cache must clear or become inaccessible after sign out
- cache must not become offline-first sync logic

## What remains in Telegram

The following product flows remain in Telegram and are not moved into the web client:
- capture of new words or phrases
- immediate ready-card response after capture
- daily review session start
- review question delivery
- answer submission
- compact review feedback

This remains consistent with the accepted backend-first and Telegram-first product model.

## Backend source-of-truth boundaries

The backend remains the source of truth for:
- account creation and authentication behavior
- session validity
- access-state checks
- user-scoped dictionary retrieval
- user-scoped dictionary search
- user-scoped card details access
- accepted settings/preferences data and update behavior
- delete behavior

The web client is responsible only for:
- initiating these flows from the browser
- rendering the resulting states
- routing the user between approved screens

## Smallest backend/API dependencies to validate

Before implementation starts, the web-client workstream must confirm:
- the contract shape for `preferred_translation_language`
- the payload shape needed for explanation + conditional translation rendering
- the delete endpoint behavior needed for details-first delete
- the invalidation behavior needed after delete, sign out, and relevant settings changes

## Explicit flow exclusions

The following flows are intentionally excluded from this document:
- manual add
- manual status change
- review UI
- advanced filters
- profile or account-management expansion beyond the accepted narrow settings flow
- Telegram linking flow
- billing or subscription flow
- admin flow
- OCR flow
- analytics flow
- restore/trash flow
- offline-first sync flow

## Final scope rule

If a user flow is not required for:
- account entry
- authenticated dictionary browsing
- dictionary search
- accepted card viewing
- narrow backend-backed settings
- narrow details-first delete
- empty dictionary handling
- responsive browser usability
- light-theme presentation

it is out of scope for this web-client workstream unless explicitly accepted later.
