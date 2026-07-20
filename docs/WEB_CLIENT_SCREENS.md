# Web Client Screens

## Purpose and authority

This document is the screen and route authority for the Leksik web client. It defines the current route inventory, the responsibility of each user-facing screen, its stable visible regions, and its local presentation states.

Other documents own adjacent concerns:

- [Web scope](WEB_CLIENT_SCOPE.md) defines accepted and excluded product capabilities.
- [User flows](WEB_CLIENT_FLOWS.md) defines journeys and transitions between screens.
- [Web architecture](ARCHITECTURE.md) defines technical and runtime boundaries.
- [Backend integration](BACKEND_INTEGRATION.md) defines consumed backend surfaces and frontend mapping.
- [Current status](WEB_CLIENT_STATUS.md) records the implementation snapshot.

## Route inventory

| Route | Screen | Access |
|---|---|---|
| `/` | Landing | Public |
| `/sign-up` | Sign Up | Public |
| `/sign-up/confirmation` | Sign Up Confirmation | Public |
| `/sign-in` | Sign In | Public |
| `/password-recovery` | Password Recovery | Public |
| `/password-recovery/confirmation` | Password Recovery Confirmation | Public |
| `/dictionary` | Dictionary List | Authenticated |
| `/dictionary/[item_id]` | Dictionary Details | Authenticated |
| `/settings` | Settings | Authenticated |
| `/telegram/complete` | Telegram Completion | Public entry with authenticated completion states |

Language onboarding and account deletion are screen-local states rather than separate routes.

## Public screens

### Landing

**Responsibility:** Provide the public entry into the web client.

**Visible regions:**

- product identity;
- concise product positioning;
- Sign In action;
- Create Account action;
- brief Telegram-first capture and review context.

**Local states:**

- locale-readiness placeholder;
- localized ready state.

### Sign Up

**Responsibility:** Collect the information required to create an account.

**Visible regions:**

- back action to Landing;
- title and supporting copy;
- Display name, email, password, and password-confirmation controls;
- primary create-account action;
- Sign In link.

**Local states:**

- locale-readiness placeholder;
- ready form;
- inline validation errors;
- submitting state;
- configuration or account-creation error.

### Sign Up Confirmation

**Responsibility:** Confirm accepted registration and direct the user toward email confirmation and sign in.

**Visible regions:**

- confirmation icon and message;
- check-email instruction;
- Sign In action that preserves an intended continuation when present.

**Local states:**

- localized confirmation state.

This screen does not provide resend-email controls.

### Sign In

**Responsibility:** Collect credentials and begin authenticated entry.

**Visible regions:**

- back action to Landing;
- title and supporting copy;
- email and password controls;
- primary sign-in action;
- Password Recovery link;
- Create Account link.

**Local states:**

- locale-readiness placeholder;
- ready form;
- inline validation errors;
- submitting state;
- configuration or authentication error.

Successful authentication continues toward the intended protected destination; this screen does not assume that every user goes directly to Dictionary List.

### Password Recovery

**Responsibility:** Collect the email address for recovery initiation.

**Visible regions:**

- back action to Sign In;
- title and supporting copy;
- email control;
- primary recovery action.

**Local states:**

- locale-readiness placeholder;
- ready form;
- inline validation error;
- submitting state;
- configuration or recovery error.

### Password Recovery Confirmation

**Responsibility:** Confirm recovery initiation and provide the next public actions.

**Visible regions:**

- confirmation icon and message;
- check-email instruction;
- Back to Sign In action;
- Reset Again action.

**Local states:**

- localized confirmation state.

## Shared authenticated presentation

### Authenticated shell

**Responsibility:** Provide the shared frame for Dictionary List, Dictionary Details, and Settings.

**Visible regions:**

- product identity linking to Dictionary List;
- Settings action;
- Sign Out action;
- main content region.

**Local states:**

- locale-readiness placeholder;
- ready header;
- sign-out submitting state;
- sign-out error.

### Protected entry states

Protected routes share these visible entry states before their screen content is available:

- checking authentication;
- loading access and required preferences;
- redirecting an unauthenticated user toward Sign In;
- missing-configuration state;
- authentication or access error with Retry;
- language-preference loading or error with Retry;
- required language onboarding.

These states replace the destination content until protected entry is ready.

### Required language onboarding state

**Responsibility:** Collect the two language selections required before an authenticated destination can be shown.

**Visible regions:**

- title and explanation;
- learning-language control;
- preferred-translation-language control;
- helper text;
- Continue action.

**Local states:**

- incomplete state with Continue unavailable;
- ready state;
- saving state;
- save error.

After successful completion, the intended authenticated destination becomes visible. Interface language remains optional and belongs to Settings.

## Dictionary screens

### Dictionary List

**Responsibility:** Present the authenticated user's dictionary and text search in one screen.

**Visible regions:**

- shared authenticated shell;
- dictionary heading and lightweight result context;
- text search control and clear action;
- item summary list or grid;
- links from item summaries to Dictionary Details.

**Local states:**

- initial loading placeholders;
- preference-readiness state;
- background updating indicator;
- load error;
- dictionary-empty state with a Telegram call to action;
- search-empty state with query context;
- populated result state.

Search remains embedded in Dictionary List and does not have a separate route.

### Dictionary Details

**Responsibility:** Present one dictionary item and its narrow deletion control.

**Visible regions:**

- shared authenticated shell;
- back action to Dictionary List;
- word or phrase title;
- compact metadata and canonical form when available;
- translation region when available for presentation;
- explanation region;
- examples region when available;
- deletion region.

**Local states:**

- loading placeholders;
- preference-warning state;
- unavailable item state;
- load error;
- ready content state;
- delete confirmation;
- deleting state;
- delete error.

### Dictionary delete confirmation state

The deletion region expands in place within Dictionary Details.

**Visible regions:**

- destructive-action explanation;
- Confirm Delete action;
- Cancel action;
- deletion failure message when applicable.

Cancel restores the unchanged details state. Successful deletion exits Dictionary Details and returns to Dictionary List.

## Settings screen

### Settings

**Responsibility:** Present the accepted preference controls, Telegram connection area, and account-deletion area.

**Visible regions:**

- shared authenticated shell;
- back action to Dictionary List;
- title and supporting copy;
- learning-language control;
- preferred-translation-language control;
- interface-language control;
- daily-review enablement, target, preferred-time, and timezone controls;
- Save action;
- Telegram area;
- Danger Zone.

**Preference states:**

- loading;
- load error with Retry;
- ready values;
- unsaved changes;
- saving;
- saved success;
- save error with Retry.

### Telegram area

**Responsibility:** Present the current Telegram connection state and completion controls where applicable.

**Visible states:**

- checking;
- unlinked, with completion-code input and action;
- pending, with completion-code input and action;
- linked, with linked identity context and no completion input;
- conflict, without completion input;
- completion submitting;
- completion success;
- load or completion error.

The area does not present unlinking, reassignment, or general provider-management controls.

### Danger Zone and account deletion

**Responsibility:** Isolate the destructive account-deletion action from ordinary preferences.

**Visible regions:**

- Danger Zone heading and warning;
- Delete Account action;
- account-deletion confirmation modal;
- irreversible-action and retention information;
- confirmation-text control;
- Cancel and Confirm Delete actions.

**Local states:**

- closed Danger Zone state;
- open confirmation modal;
- confirmation unavailable until the exact text `DELETE` is entered;
- deleting state;
- deletion error.

Cancel closes the modal without changing the account. Successful deletion exits the authenticated presentation and returns to the public entry.

## Telegram Completion screen

### Telegram Completion

**Responsibility:** Present the browser handoff for completing a Telegram connection.

**Visible regions:**

- state icon and badge;
- state title and explanation;
- completion detail;
- Sign In and Create Account actions when authentication is required;
- Open Dictionary action after success.

**Local states:**

- locale-readiness placeholder;
- authentication required;
- checking;
- success;
- invalid or expired handoff;
- blocked or conflict.

The screen does not present unlinking, reassignment, ownership resolution, or alternate-provider controls.

## Shared screen rules

- Web-owned screen copy is available in English, Polish, Russian, and Ukrainian; externally supplied content remains visually distinct from interface copy.
- The same screen inventory serves mobile and desktop browser widths. Regions may reflow without changing screen responsibility.
- Screens use the accepted light-theme presentation; theme selection is not a screen responsibility.
- Loading, empty, error, unavailable, confirmation, and success states belong in this document only when they are visibly owned by a screen.
- Journey sequencing belongs in [User flows](WEB_CLIENT_FLOWS.md), not in the screen descriptions above.
