# WEB_CLIENT_FLOWS.md

## Purpose

This document defines the approved narrow user flows for the responsive web client of the Personal AI Vocabulary System.

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
- sign out
- responsive browser usage on mobile and desktop
- theme toggle as a presentation-layer behavior across accepted screens

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
- aligned to the narrow responsive web-client scope
- not a full product flow map
- not a replacement for the broader app roadmap

## Flow principles

### 1. Backend-first rule
All identity, access, and dictionary data remain backend-owned.
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
Only the smallest user-facing flows required for account entry and dictionary viewing are included here.

### 4. No client-side business-logic rule
If a flow depends on authentication, access state, or dictionary ownership, the backend is the source of truth.
The web client must not invent fallback client-side logic for those responsibilities.

## Included flows

The approved narrow web-client flows are:

1. Landing / entry
2. Sign up
3. Sign in
4. Password recovery
5. Authenticated shell entry
6. Dictionary list browsing
7. Dictionary search
8. Card details viewing
9. Sign out
10. Responsive use on desktop and mobile browser
11. Theme toggle as a presentation-layer behavior

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
   - sign up
   - sign in

### Exit paths
- to sign up
- to sign in

### Notes
- Landing is a lightweight entry surface, not a marketing site expansion.
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
4. Backend-owned auth flow creates the account.
5. On success, user enters the authenticated web-client path.

### Success result
- user account is created
- user is authenticated or moved into the accepted authenticated-entry continuation
- user reaches the authenticated shell and dictionary entry path

### Failure result
- sign-up failure is shown to the user
- user remains in the sign-up flow and can retry

### Exit paths
- to authenticated shell entry on success
- back to sign in
- back to landing if supported by the UI design

### Boundaries
- This flow creates account entry only.
- It does not include onboarding expansion, profile completion, billing setup, Telegram linking, or product tutorial flows.

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
4. Backend-owned auth flow validates the session.
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
4. Backend-owned recovery initiation runs.
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
- Password reset completion behavior outside the web-client release boundary should follow the accepted auth implementation path.

## Flow 5 — Authenticated shell entry

### Purpose
Provide the smallest authenticated browser entry into the dictionary experience.

### Entry points
- successful sign up
- successful sign in
- returning authenticated user opening a protected route
- successful session restoration on browser revisit

### Main path
1. User reaches an authenticated route.
2. Web client resolves the authenticated session through the backend-owned auth path.
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
- to sign out

### Boundaries
- Authenticated shell is intentionally minimal.
- It is not a broader application workspace.
- It is not a multi-feature dashboard.
- It is not an admin or settings shell.

## Flow 6 — Dictionary list browsing

### Purpose
Allow the authenticated user to browse their saved dictionary items.

### Entry points
- authenticated shell default entry
- return from card details
- returning authenticated session opening the dictionary route directly

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
- to sign out

### Boundaries
- This is a read-only dictionary browsing flow.
- It does not include manual add.
- It does not include manual status change.
- It does not include review actions.
- It does not include advanced filters.

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
- This flow does not include advanced filters.
- This flow does not include saved searches or search analytics.

## Flow 8 — Card details viewing

### Purpose
Allow the authenticated user to open a stored dictionary item and view its accepted read-only card fields.

### Entry points
- from dictionary list
- from search results within dictionary list

### Main path
1. User selects a dictionary item.
2. Web client requests the item details from the backend.
3. Backend returns the user-scoped card details.
4. Web client renders the accepted read-only card view.

### Card-details content boundary
Card details are limited to read-only viewing of accepted dictionary/card fields:
- word or phrase
- canonical form when applicable
- translation
- short explanation / meaning
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
- sign out if available from the minimal authenticated shell/header pattern

### Boundaries
- Card details are read-only.
- This flow does not include:
  - edit
  - delete
  - manual status change
  - notes editing
  - source/history management
  - capture actions
  - review actions
  - arbitrary additional fields just because the backend may return them

## Flow 9 — Sign out

### Purpose
Allow the authenticated user to leave the protected web-client area safely.

### Entry points
- from minimal authenticated shell/header

### Main path
1. User selects sign out.
2. Web client calls the accepted logout or session-termination path.
3. Authenticated state is cleared.
4. User returns to landing or sign-in entry.

### Success result
- protected session is terminated
- user is no longer inside the authenticated shell

### Failure result
- sign-out error is handled as an auth or session issue
- protected access must not remain ambiguous

### Exit paths
- to landing
- to sign in

### Boundaries
- Sign out does not expand into session-management UI or account-management settings.

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

## Theme-toggle boundary

Theme toggle is in scope as a presentation-layer behavior across the accepted web-client screens.

Boundary:
- it affects visual presentation only
- it does not introduce a broader settings or profile flow
- it does not create additional product-state complexity in this flow document

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

The web client is responsible only for:
- initiating these flows from the browser
- rendering the resulting states
- routing the user between approved screens

## Smallest backend/API dependency to validate

Before implementation starts, the web-client workstream must confirm that a real browser-ready auth-entry/session path exists for:
- sign up
- sign in
- sign out
- recovery initiation
- protected-route session continuity

This remains the main backend/API dependency check for the web client.

## Explicit flow exclusions

The following flows are intentionally excluded from this document:
- manual add
- manual status change
- review UI
- advanced filters
- profile or settings expansion
- Telegram linking flow
- billing or subscription flow
- admin flow
- OCR flow
- analytics flow

## Final scope rule

If a user flow is not required for:
- account entry
- authenticated dictionary browsing
- dictionary search
- read-only card details viewing
- responsive browser usability
- approved theme handling

it is out of scope for this web-client workstream unless explicitly accepted later.
