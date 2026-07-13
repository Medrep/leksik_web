# API Specification (MVP)

## 1. Auth / Access

### Current backend auth boundary

- protected backend requests use `Authorization: Bearer <supabase_jwt>`
- backend verifies the Supabase JWT server-side
- the narrow web client uses Supabase Auth directly in the browser for sign up, sign in, sign out, and password recovery initiation
- after browser sign-in, the web client sends the Supabase access token to the backend as the bearer token on protected requests
- the backend is a bearer-token-consuming protected API and does not own browser auth entry for the current web-client slice
- current docs do not define a backend cookie/session contract
- debug-only local development may use dev auth headers, but those are not a production auth contract

### Current implemented endpoints

### GET /auth/me
Return current authenticated user profile.

**Auth**
- required
- bearer token expected at the backend boundary

**Behavior**
- resolves the current authenticated user from the bearer token
- if the authenticated user does not yet exist in the app database, the backend provisions the user record on first authenticated request
- if email is present in the token and differs from stored value, the backend updates the stored email

**Success response**
`200 OK`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "email": "user@example.com"
}
```

**Unauthenticated response**
`401 Unauthorized`

```json
{
  "detail": "Authentication is required."
}
```

**Other auth failure responses**
- malformed auth header: `401` with `{"detail":"Authorization header must use Bearer authentication."}`
- invalid or expired token: `401` with `{"detail":"..."}` from backend token validation
- Supabase JWKS / verification configuration unavailable: `503` with `{"detail":"..."}`

### GET /auth/access
Return current authenticated access state.

**Auth**
- required
- bearer token expected at the backend boundary

**Behavior**
- resolves the current authenticated user from the bearer token
- if the authenticated user does not yet exist in the app database, the backend provisions the user record on first authenticated request
- if the authenticated user has no access record yet, the backend provisions a default access record
- current default provisioned access state is `free`

**Success response**
`200 OK`

```json
{
  "state": "free"
}
```

Allowed values:
- `free`
- `trial`
- `paid`
- `inactive`

**Unauthenticated response**
`401 Unauthorized`

```json
{
  "detail": "Authentication is required."
}
```

**Current missing-access behavior**
- there is currently no separate authenticated-but-missing-access error contract
- authenticated requests without an existing access row are provisioned and return `200 OK`
- current effective response for that case is `{"state":"free"}`

### Reserved auth endpoints

### POST /auth/signup
Create a new user account.

Current status:
- listed in the intended product API surface
- backend implementation not present yet
- not part of the current narrow web-client auth-entry contract
- the current web client should use Supabase Auth directly in the browser instead

### POST /auth/login
Authenticate a user and start a session.

Current status:
- listed in the intended product API surface
- backend implementation not present yet
- not part of the current narrow web-client auth-entry contract
- the current web client should use Supabase Auth directly in the browser instead

### POST /auth/logout
Terminate the current session.

Current status:
- listed in the intended product API surface
- backend implementation not present yet
- not part of the current narrow web-client auth-entry contract
- the current web client should use Supabase Auth directly in the browser instead

### POST /auth/recover
Initiate account recovery.

Current status:
- listed in the intended product API surface
- backend implementation not present yet
- not part of the current narrow web-client auth-entry contract
- the current web client should use Supabase Auth directly in the browser instead

### Browser auth contract status

Current docs are sufficient to say:
- browser auth entry is owned by Supabase Auth, not by the backend
- the web client signs in directly with Supabase Auth and receives a Supabase access token in the browser
- the browser calls the backend with `Authorization: Bearer <supabase_access_token>`
- backend owns authenticated identity resolution for backend API requests
- backend owns access-state resolution
- `/auth/me` is the current-user check
- `/auth/access` is the current access-state check

Current docs are not yet sufficient to define:
- browser token persistence and refresh behavior
- self-serve browser revisit/session restore contract
- exact frontend claims and screens for Supabase-hosted recovery completion

## 2. Messaging / Telegram Linking

### Current backend linking foundation

The backend now distinguishes between:
- observed messaging identity
- confirmed messaging-link ownership

For Telegram in the current slice, this means:
- an observed Telegram identity can exist at the backend before a final product-user link is completed
- confirmed Telegram ownership for product behavior is represented separately from observation
- the backend owns canonical link state and conflict handling

### Canonical backend link states

The canonical backend messaging-link states for Telegram are:
- `pending`
- `linked`
- `conflict`

Notes:
- `pending` is representable at the backend state/model level in this slice
- `linked` is the current operational state that allows normal Telegram product behavior
- `conflict` represents blocked/manual-resolution cases such as an already-linked Telegram identity or a user who already has another active linked Telegram identity

### MVP uniqueness / conflict position

Current MVP rules are:
- one active linked Telegram account per product user
- one active linked owner per Telegram identity
- no self-serve reassignment flow

If a linking attempt conflicts with existing linked ownership, the backend represents that as conflict state rather than silently reassigning the Telegram account.

### Current implemented endpoints and behavior

### POST /messaging-links/telegram
Create or update the current authenticated user's linked Telegram identity on the current direct-link path.

**Auth**
- required

**Input**
- `telegram_user_id`
- `telegram_username` nullable
- `telegram_display_name` nullable

**Behavior**
- upserts the observed Telegram identity record
- attempts to create or preserve the canonical `linked` relationship for the current authenticated user
- returns `409 Conflict` if the Telegram identity is already actively linked elsewhere
- returns `409 Conflict` if the current user already has another active linked Telegram identity
- does not provide self-serve reassignment
- does not implement the later pending-link completion mechanics in this slice

**Success response**
`200 OK`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "user_id": "00000000-0000-0000-0000-000000000000",
  "provider": "telegram",
  "provider_user_id": "123456789",
  "provider_username": "mytelegram",
  "provider_display_name": "My Telegram"
}
```

**Conflict response**
`409 Conflict`

Current detail values are implementation-level strings such as:
- `"Messaging identity is already linked to another user."`
- `"User already has a linked messaging identity for this provider."`

### GET /messaging-links/telegram
Return the current authenticated user's Telegram linking status.

**Auth**
- required

**Behavior**
- resolves status from the canonical backend-owned Telegram linking model for the current authenticated user
- current status values are:
  - `unlinked`
  - `pending`
  - `linked`
  - `conflict`
- returns a minimal current-user view only
- does not expose other users or ownership internals

**Success response**
`200 OK`

```json
{
  "state": "linked",
  "provider": "telegram",
  "provider_username": "mytelegram",
  "provider_display_name": "My Telegram",
  "last_observed_at": "2026-04-13T18:30:00Z"
}
```

Field notes:
- `state` is always present
- `provider` is always `telegram`
- provider profile fields may be `null`
- `last_observed_at` may be `null` when no Telegram identity is yet known for the current user view

### POST /messaging-links/telegram/complete
Complete Telegram link ownership for the current authenticated user using a backend-owned one-time completion code.

**Auth**
- required

**Input**
- `code`

**Behavior**
- validates the code against an observed Telegram identity at the backend
- rejects invalid or expired codes safely
- rejects completion when canonical conflict rules block attachment
- finalizes ownership through the existing canonical backend-owned linking model
- does not use email matching, implicit identity guessing, or self-serve reassignment
- successful completion clears the one-time code so reuse is rejected safely

**Success response**
`200 OK`

```json
{
  "state": "linked",
  "provider": "telegram",
  "provider_username": "mytelegram",
  "provider_display_name": "My Telegram",
  "last_observed_at": "2026-04-13T18:30:00Z"
}
```

**Invalid or expired code response**
`400 Bad Request`

```json
{
  "detail": "Telegram completion code is invalid or expired."
}
```

**Conflict response**
`409 Conflict`

Current detail values are implementation-level strings such as:
- `"Messaging identity is already linked to another user."`
- `"User already has a linked messaging identity for this provider."`

### POST /telegram/webhook
Accept a Telegram webhook update.

**Auth**
- Telegram webhook secret enforcement is optional through `TELEGRAM_WEBHOOK_SECRET`

**Behavior**
- records or refreshes the observed Telegram identity from inbound Telegram traffic
- uses the canonical backend messaging-link state as the Telegram product-flow decision point
- if the Telegram identity is in `linked` state, preserves the current operational baseline:
  - capture works through the shared backend capture flow
  - review works through the shared backend review flow
- if the Telegram identity is in `pending` state, normal product flow does not run and the user receives link-first guidance
- if the Telegram identity is observed but has no active link yet, normal product flow does not run and the user receives link-first guidance
- the current link-first guidance path may issue or reuse a backend-owned one-time completion code for later authenticated completion
- if the Telegram identity is in `conflict` state, normal product flow does not run and the user receives safe blocked/conflict guidance without ownership details

### Not implemented in this slice

This slice does not yet define or implement:
- deep-link completion flow
- unlink flow
- reassignment flow
- user-facing web or Telegram completion UX

## 3. Vocabulary

### POST /vocab/capture
Capture a word or phrase through the bot.

**Input**
- `text`

**Behavior**
- create raw input
- run enrichment
- create or update vocabulary item
- initialize learning state if needed
- return ready card

**Output**
- display text preserving the requested word or phrase
- canonical text when the requested form is not already canonical
- translation field remains in the payload shape and is nullable; it is populated only when `preferred_translation_language` is set and differs from the source language
- short explanation in the source word language
- exactly three examples in the source word language
- learning status

### POST /vocab
Manual add through the app.

Uses the same enrichment path as `/vocab/capture`.

### GET /vocab
Return user dictionary list.

**Supports**
- search by text
- filter by language
- filter by learning status

**Query params**
- `search`
- `language`
- `learning_status`

**Success response**
`200 OK`

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "display_text": "prendre une decision",
      "canonical_text": null,
      "translation": "to make a decision",
      "language": "fr",
      "item_type": "phrase",
      "learning_status": "new"
    }
  ]
}
```

**Field notes**
- `items` is always present
- each list item includes:
  - `id`
  - `display_text`
  - `canonical_text` nullable
  - `translation` nullable
  - `language` nullable
  - `item_type`
  - `learning_status` nullable

**Behavior**
- authenticated and user-scoped
- returns only non-deleted items in normal dictionary reads
- search may match translation when translation is present
- no pagination is currently implemented
- current response envelope contains `items` only with no pagination metadata

### GET /vocab/{item_id}
Return full vocabulary item details.

**Success response**
`200 OK`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "display_text": "prendre une decision",
  "canonical_text": null,
  "translation": "to make a decision",
  "short_explanation": "Signifie choisir apres reflexion.",
  "examples": [
    "Il faut prendre une decision rapidement.",
    "Nous devons prendre une decision aujourd'hui.",
    "Elle prefere prendre une decision claire."
  ],
  "language": "fr",
  "item_type": "phrase",
  "learning_status": "new"
}
```

**Field notes**
- response includes:
  - `id`
  - `display_text`
  - `canonical_text` nullable
  - `translation` nullable
  - `short_explanation` in the source word language
  - exactly three `examples` in the source word language
  - `language` nullable
  - `item_type`
  - `learning_status` nullable

**Behavior**
- authenticated and user-scoped
- soft-deleted items do not appear in normal item-details reads
- returns `404` when the item does not exist for the current user

### DELETE /vocab/{item_id}
Delete an item from the dictionary.

**Auth**
- required

**Behavior**
- user-facing action is Delete from dictionary
- endpoint is authenticated and user-scoped
- backend performs soft delete rather than immediate physical deletion
- deleted item disappears from normal dictionary list/details responses
- deleted item does not participate in review
- deleted item is not treated as an active learning item
- deleted row remains physically stored
- restore flow, hard delete, and deleted-item re-capture semantics are deferred

## 4. Review

### POST /review/session
Create or fetch a review session.

Manual review note:
- this endpoint represents an explicit user-triggered review path
- `daily_review_enabled` does not block this manual path
- scheduled daily review/reminder gating remains separate from manual review session creation
- manual sessions are stored separately from scheduled-session runtime markers
- manual review does not update scheduled-review runtime markers

**Current compatibility note**
- current MCQ session generation excludes soft-deleted items
- current MCQ session generation excludes items without translation
- already-created review sessions are stored snapshots and are not rewritten automatically
- stored review sessions distinguish manual vs scheduled origin for backend traceability

### GET /review/session/{sessionId}/next
Return the next question in the session.

### POST /review/session/{sessionId}/question/{questionId}/answer
Submit an answer to a question.

**Input**
- selected answer key

**Behavior**
- evaluate answer
- save answer
- update learning state when the runtime item remains review-compatible
- return compact feedback

**Current compatibility note**
- if the underlying runtime item is now soft-deleted or otherwise no longer review-compatible, the stored question/answer flow still completes
- in that runtime-safety case, learning-state update is suppressed rather than rewriting the stored session

### GET /review/session/{sessionId}
Return session details/history.

## 5. Preferences

### GET /preferences/learning
Return learning preferences.

**Success response**
`200 OK`

```json
{
  "daily_review_enabled": true,
  "daily_review_target_count": 10,
  "preferred_review_time": "18:30:00",
  "preferred_review_timezone": "Europe/Warsaw",
  "preferred_translation_language": "en",
  "learning_language": "pl",
  "ui_locale": "en"
}
```

### PUT /preferences/learning
Update learning preferences.

**Input**
- `daily_review_enabled`
- `daily_review_target_count`
- `preferred_review_time` nullable
- `preferred_review_timezone` nullable
- `preferred_translation_language` nullable
- `learning_language` nullable
- `ui_locale` nullable; supported canonical values are `en`, `pl`, `ru`, and `uk`

**Partial update behavior**
- omitted fields preserve their current stored values
- explicit `"ui_locale": null` clears the saved interface-locale override
- omitted `ui_locale` preserves the current value
- supported regional `ui_locale` values canonicalize to the supported base locale
- malformed or unsupported explicit `ui_locale` values return `422` and do not mutate preferences

**Success response**
- same shape as `GET /preferences/learning`

Current shared settings/preferences note:
- the same backend settings/preferences endpoints are used by mobile and by the narrow web settings screen where applicable
- current preference field name for translation behavior is `preferred_translation_language`
- changing `preferred_translation_language` does not immediately regenerate old cards
- older cards refresh lazily later
- `ui_locale` stores a cross-surface interface-language preference only; the current web interface remains English

Supported MVP fields:
- daily review enabled
- daily review target count
- preferred review time
- preferred review timezone nullable
- preferred_translation_language nullable
- learning_language nullable
- ui_locale nullable

Daily review settings semantics:
- `daily_review_enabled` gates scheduled daily review / reminder behavior only
- `daily_review_target_count`, `preferred_review_time`, and `preferred_review_timezone` apply to the scheduled daily-review path only
- scheduled-review operational state is stored separately from preferences
- when update payloads omit `daily_review_target_count`, `preferred_review_time`, or `preferred_review_timezone`, existing stored values are preserved

Scheduled runtime semantics:
- scheduled daily review currently exists as backend runtime behavior, not as a new public API endpoint
- scheduled runtime selects due users from learning preferences and `scheduled_review_runtime`
- scheduled runtime uses `preferred_review_time` and `preferred_review_timezone` to determine each user's due local day/time
- scheduled runtime uses a short per-user lease to protect repeated ticks and restarts
- scheduled runtime creates at most one scheduled session per user local day
- `next_due_at` advances after scheduled-session creation, confirmed existing scheduled session, or no eligible items
- Telegram delivery is attempted only for newly created scheduled sessions
- Telegram delivery failure after scheduled-session creation does not allow a second scheduled session for that same user local day
- manual `/review` remains a separate explicit path and does not update scheduled runtime markers
- dedicated worker invocation exists as a separate process that runs the scheduled runtime on a 60-second cadence
- `processing_jobs` integration and generic worker/job orchestration remain deferred

## 6. Reserved for future phases

### OCR
Not part of MVP, but future routes are expected:
- upload image input
- OCR extraction
- candidate confirmation

### Billing
Not part of MVP as active UI flow, but future routes/webhooks are expected.
Current MVP client boundary remains backend access-model only.

## 7. API design notes

- Same backend core serves bot, mobile, and narrow web client surfaces
- Shared settings/preferences behavior should stay aligned across mobile and web where applicable
- Bot and app must use the same vocabulary capture logic
- Review answer evaluation stays server-side, and learning-state updates remain server-side when the runtime item is still review-compatible
- Access checks must happen server-side
- OCR is planned but out of MVP scope
- Payment is planned from day one but not fully activated in MVP
