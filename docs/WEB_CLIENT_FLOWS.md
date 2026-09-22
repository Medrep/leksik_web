# Web Client Flows

## Purpose and authority

This document is the user-flow authority for the Leksik web client. It describes user intent, entry conditions, transitions, visible outcomes, and failure or cancel paths.

Other documents own adjacent concerns:

- [Web scope](WEB_CLIENT_SCOPE.md) defines accepted and excluded product capabilities.
- [Screens and routes](WEB_CLIENT_SCREENS.md) defines the screen inventory and UI composition.
- [Web architecture](ARCHITECTURE.md) defines technical boundaries and runtime behavior.
- [Backend integration](BACKEND_INTEGRATION.md) defines consumed backend surfaces and frontend mapping.
- [Current status](WEB_CLIENT_STATUS.md) records the implementation snapshot.

## Public entry flows

### Landing entry

**User goal:** Enter the web experience and choose an account path.

**Entry conditions:** The user opens the public web entry or returns there after signing out.

**Main transition:** The user chooses to sign in or create an account.

**Outcome:** The selected authentication flow opens. The landing experience remains a narrow product entry rather than a broader marketing or product-navigation surface.

### Sign up

**User goal:** Create a product account.

**Entry conditions:** The user arrives from the public entry, the sign-in flow, or an authentication-required continuation.

**Main transition:** The user enters the required account information and submits it.

**Success outcome:** The user reaches a confirmation state that asks them to check their email before signing in. Any intended continuation remains available through the later sign-in flow.

**Failure or cancel outcome:** Validation or account-creation failure is shown without leaving the flow, and the user can correct the input and retry. The user may return to sign in instead of continuing.

### Sign in

**User goal:** Authenticate and continue into the requested web experience.

**Entry conditions:** The user arrives from the public entry, sign up, a protected-area redirect, or Telegram completion.

**Main transition:** The user enters credentials and submits them.

**Success outcome:** The user continues toward the originally requested destination. Authenticated entry may require language-preference onboarding before that destination becomes available.

**Failure or cancel outcome:** Authentication failure is shown without leaving the flow, and the user can retry, start password recovery, create an account, or return to the public experience.

### Password-recovery initiation

**User goal:** Request help regaining access to an account.

**Entry conditions:** The user starts recovery from sign in.

**Main transition:** The user enters an email address and submits the recovery request.

**Success outcome:** A confirmation state tells the user to check their email.

**Failure or cancel outcome:** Validation or recovery failure is shown without leaving the flow, and the user can retry or return to sign in.

This flow covers recovery initiation only. It does not define a broader account-management journey.

## Planned PWA launch flows

PWA installability is planned until PWA-01 completes. These accepted flows describe the intended launch behavior and do not describe current implementation details.

### Installation

**User goal:** Install the responsive web client as a standalone web app.

**Entry conditions:** The user opens Leksik in current supported Safari on iOS or current supported Chrome on Android.

**Main transition:** On iOS, the user uses Safari's Add to Home Screen path. On Android, the user uses Chrome's PWA installation path. Future minimal help may be presented in PWA-03 when appropriate.

**Outcome:** The installed app uses the accepted PWA identity and standalone contract. Installation does not create an App Store, Google Play, or native-wrapper flow.

### Installed launch and signed-out continuation

**User goal:** Open the installed app and reach the main authenticated experience.

**Entry conditions:** The user opens the installed app.

**Main transition:** The app starts at `/dictionary`. A signed-in user proceeds to Dictionary List through normal protected entry. A signed-out user follows the existing protected-route redirect and sign-in continuation, then returns toward the intended destination.

**Outcome:** The launch target remains Dictionary List for authenticated users without changing public landing behavior. If required preferences are missing, existing onboarding occurs before the protected destination.

### iOS reauthentication and browser handoffs

**User goal:** Continue safely when browser contexts or external handoffs differ.

**Entry conditions:** An iOS user moves between Safari and the installed Home Screen app, or a user returns from a Telegram or email handoff.

**Main transition:** Separate Safari and installed-app storage contexts can require a separate sign-in on first installed launch. External links may open in Safari or another browser context instead of an installed PWA window.

**Outcome:** Separate reauthentication is acceptable at launch. The installed app fetches current backend state after reopening or returning. This does not promise session transfer or native deep-link capture.

## Authenticated entry and onboarding

### Authenticated entry

**User goal:** Open an accepted protected web capability.

**Entry conditions:** The user signs in, returns with an existing session, or opens a protected destination directly.

**Main transition:**

1. The web client confirms that the user can enter the protected experience.
2. If required language preferences are complete, the user continues to the intended destination.
3. If either required language preference is missing, the user enters the language-preference onboarding flow first.

**Success outcome:** The user reaches the intended dictionary or settings destination inside the minimal authenticated experience.

**Failure outcome:** A user without a valid session returns to sign in with the intended continuation preserved. A temporary entry failure is shown with an opportunity to retry.

### Required language-preference onboarding

**User goal:** Complete the minimum language setup required for the authenticated web experience.

**Entry conditions:** An authenticated user is missing a learning language or preferred translation language.

**Main transition:** The user selects both required languages and submits them.

**Success outcome:** The saved preferences satisfy the onboarding requirement and the user continues to the originally intended destination.

**Failure outcome:** The user remains in onboarding, sees the failure state, and can retry. Incomplete selections do not complete the flow.

Interface language remains optional and is managed through Settings rather than being required to pass this gate.

## Dictionary flows

### Browse dictionary

**User goal:** Review saved vocabulary items.

**Entry conditions:** An authenticated user opens the dictionary, returns from details or Settings, or completes another flow that leads back to the dictionary.

**Main transition:** The dictionary loads and the user browses the available item summaries.

**Success outcome:** The user can open an item, search the dictionary, open Settings, or sign out.

**Failure outcome:** A loading or access failure is shown within the dictionary experience, with no fallback to non-user-owned data.

### Search dictionary

**User goal:** Narrow the dictionary by text.

**Entry conditions:** The user is browsing the dictionary.

**Main transition:** The user enters a text query and sees the matching dictionary result set in the same browsing context.

**Success outcome:** The user can open a matching item or clear the query to restore the broader list.

**Failure outcome:** A search failure is shown within the dictionary context, and the user can change or clear the query.

Search does not become an advanced filtering, saved-search, or analytics flow.

### Open dictionary details

**User goal:** Read one saved dictionary item.

**Entry conditions:** The user selects an item from the dictionary or its search results.

**Main transition:** The item details load and the user reads the accepted card content.

**Success outcome:** The user can return to the dictionary or begin the details-first deletion flow.

**Failure outcome:** A missing, unavailable, or inaccessible item produces an unavailable or error state rather than a valid details view.

This flow does not add capture, review, manual learning-status editing, or broader item-management actions.

### Empty dictionary

**User goal:** Understand what to do when no saved items are available.

**Entry conditions:** The dictionary has no visible items and no active search result context explains the empty state.

**Main transition:** The user sees an empty-state explanation and a Telegram-first call to action.

**Success outcome:** The user can continue toward Telegram capture without turning the web client into a capture surface.

**Failure boundary:** The empty state must not imply a data error or introduce unsupported web capture behavior.

### Delete a dictionary item

**User goal:** Remove an item from normal dictionary use.

**Entry conditions:** The user starts deletion from dictionary details.

**Main transition:**

1. The user selects delete.
2. A confirmation state explains the destructive action.
3. The user either cancels or confirms.

**Success outcome:** After confirmed deletion succeeds, the user returns to the dictionary and the deleted item is no longer presented in normal browsing.

**Failure or cancel outcome:** Cancel returns to the unchanged details view. Failure remains in the deletion context and does not present the item as successfully deleted.

Deletion remains details-first. It does not include list-row deletion, bulk deletion, restore, trash management, or manual learning-status editing.

## Settings flows

### View and update preferences

**User goal:** Review and change the accepted web preference surface.

**Entry conditions:** An authenticated user opens Settings.

**Main transition:** The current preferences load, the user changes one or more accepted language or daily-review preferences, and the user saves the changes.

**Success outcome:** The confirmed saved values become the current Settings state. A saved interface-language change updates the web interface after the save succeeds.

**Failure or cancel outcome:** A load failure offers a retry. A save failure leaves the user in Settings with the previous confirmed state and the unsaved choices available for correction or retry. Leaving without saving does not apply draft changes.

### Telegram linking in Settings

**User goal:** Understand or complete the connection between the product account and Telegram.

**Entry conditions:** The user opens the Telegram section in Settings.

**Main transition by visible state:**

- **Unlinked:** The user can enter a completion code and submit it.
- **Pending:** The user can complete the pending link with a code.
- **Linked:** The linked state is shown and no completion input is offered.
- **Conflict or error:** The blocked or failed state is shown without offering reassignment or unlinking.

**Success outcome:** Successful completion changes the visible state to linked.

**Failure outcome:** The user remains in the Telegram section, sees the failure state, and may retry only where the current state permits completion.

This flow does not include provider management, unlinking, or reassignment.

### Delete account

**User goal:** Permanently request deletion of the current product account.

**Entry conditions:** The authenticated user enters the danger area in Settings and opens account deletion.

**Main transition:**

1. The user sees the destructive-account warning.
2. The user must enter the exact confirmation text `DELETE`.
3. The user either cancels or confirms deletion.

**Success outcome:** After deletion succeeds, the authenticated experience ends and the user returns to the public entry.

**Failure or cancel outcome:** Cancel closes the confirmation and leaves the account unchanged. Failure remains in Settings and shows that deletion was not confirmed as successful.

Account deletion does not create a broader account center, data-export, restore, or operator flow.

## Telegram completion flow

### Complete a Telegram link from a Telegram handoff

**User goal:** Finish linking Telegram to the product account after arriving from Telegram.

**Entry conditions:** The user opens the dedicated completion experience from a Telegram handoff.

**Main transition:**

1. If authentication is required, the user chooses sign in or account creation.
2. After authentication, the user returns to the pending completion experience.
3. The completion enters a visible processing state.
4. The user receives a success, invalid or expired, or blocked or conflict outcome.

**Success outcome:** The user sees that linking completed and can continue to the dictionary.

**Invalid or expired outcome:** The user sees that the completion cannot proceed with the supplied handoff.

**Blocked or conflict outcome:** The user sees that completion is blocked and is not offered client-side reassignment or ownership resolution.

**Authentication failure outcome:** The user remains in the authentication flow and can retry without losing the intended completion continuation.

## Sign out flow

**User goal:** Leave the protected web experience.

**Entry conditions:** The user selects sign out from the authenticated experience.

**Main transition:** The current authenticated session ends.

**Success outcome:** Protected areas are no longer available and the user returns to the public experience.

**Failure outcome:** The failure is shown to the user and protected access is not presented as ambiguously terminated.

Sign out remains an action, not a standalone account-management screen.

## Localization-related user flow

### Select the interface language

**User goal:** Use the web interface in an accepted language.

**Entry conditions:** Public users enter with the applicable public locale behavior; authenticated users may select an interface language in Settings.

**Main transition:** The authenticated user selects an interface language and saves the preference.

**Success outcome:** The interface changes to the saved language after the update succeeds. Public experiences use a supported browser language when available and otherwise use English.

**Failure or cancel outcome:** A failed save or an unsaved draft does not replace the currently active interface language. After sign out, the public experience returns to public locale behavior.

Localization changes web-owned interface copy only; vocabulary content and externally supplied messages are not rewritten as part of this user flow.

## Explicit flow boundaries

- Vocabulary capture and ready-card delivery remain Telegram-first; there is no manual web capture flow.
- Daily review, review answering, and review feedback remain outside the web client.
- Billing, OCR, admin, restore, and offline-synchronization flows are not part of the web experience.
- Telegram completion does not add provider management, unlinking, or reassignment journeys.
- Account deletion does not expand into a general account-management flow.
- Theme selection is not a user flow; the web experience remains light-theme only.
- Offline, background-sync, offline mutation-queue, and push-notification flows are deferred.
