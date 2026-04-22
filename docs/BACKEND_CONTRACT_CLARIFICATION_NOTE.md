# Backend Contract Clarification Note

## Purpose

This note records the current confirmed backend contract used by the responsive web client.

It is a narrow clarification artifact only.
It does not redesign backend ownership, frontend scope, or product architecture.

## Preserved boundaries

- the backend remains the system core
- Telegram remains the primary interface for capture and daily review
- the responsive web client remains a thin client over the backend
- browser auth entry uses Supabase directly
- protected backend requests use `Authorization: Bearer <supabase_jwt>`
- authenticated browser entry is bootstrapped through:
  - `GET /auth/me`
  - `GET /auth/access`
- Card Details remains a narrow read-only scope
- this note does not expand the web client into capture, review, billing, admin, delete, or manual-status scope

## Confirmed contract

### Auth boundary

Confirmed:
- the browser signs in directly with Supabase Auth
- after sign-in, the browser sends the Supabase access token to the backend as `Authorization: Bearer <supabase_jwt>`
- the backend verifies the bearer token server-side
- the backend does not provide a backend-owned auth-entry facade for the current web-client slice

### GET /auth/me

Confirmed endpoint role:
- backend current-user check for authenticated entry

Auth:
- required
- expects `Authorization: Bearer <supabase_jwt>`

Confirmed success shape:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "email": "user@example.com"
}
```

Field notes:
- `id` is required
- `email` is optional and may be `null`

Confirmed behavior:
- resolves the authenticated user from the bearer token
- provisions the app user row on first authenticated request if needed
- updates stored email when token email is present and different

Confirmed unauthenticated behavior:
- returns `401 Unauthorized`

### GET /auth/access

Confirmed endpoint role:
- backend access-state check for authenticated entry

Auth:
- required
- expects `Authorization: Bearer <supabase_jwt>`

Confirmed success shape:

```json
{
  "state": "free"
}
```

Field notes:
- `state` is required
- current enum values are:
  - `free`
  - `trial`
  - `paid`
  - `inactive`

Confirmed behavior:
- resolves the authenticated user from the bearer token
- provisions the app user row on first authenticated request if needed
- provisions a default access row when missing
- current default provisioned access state is `free`

Confirmed unauthenticated behavior:
- returns `401 Unauthorized`

### GET /vocab

Confirmed endpoint role:
- user-scoped dictionary list read for authenticated clients

Auth:
- required
- uses the same authenticated request-context path as `/auth/me` and `/auth/access`

Confirmed query params:
- `search`
- `language`
- `learning_status`

Confirmed success envelope:

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "display_text": "prendre une decision",
      "canonical_text": "prendre une decision",
      "translation": "to make a decision",
      "language": "fr",
      "item_type": "phrase",
      "learning_status": "new"
    }
  ]
}
```

Field notes for each list item:
- `id` is required
- `display_text` is required
- `canonical_text` is optional and may be `null`
- `translation` is optional and may be `null`
- `language` is optional and may be `null`
- `item_type` is required
- `learning_status` is optional and may be `null`

Confirmed behavior:
- returns only items owned by the authenticated user
- returns only non-deleted items in normal dictionary reads
- supports search across `display_text`, `canonical_text`, and `translation` when translation is present
- normalizes `language` filter to trimmed lowercase
- returns items ordered by most recently updated, then most recently created

Pagination status:
- current backend evidence shows no pagination
- there are no pagination query params on the route
- the response shape contains `items` only
- there is currently no documented pagination metadata

### GET /vocab/{item_id}

Confirmed endpoint role:
- user-scoped dictionary item details read for authenticated clients

Auth:
- required
- uses the same authenticated request-context path as `/auth/me` and `/auth/access`

Confirmed route naming:
- backend route parameter is `item_id`
- project docs should use `GET /vocab/{item_id}`

Confirmed success shape:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "display_text": "prendre une decision",
  "canonical_text": "prendre une decision",
  "translation": "to make a decision",
  "short_explanation": "Used to express making a choice.",
  "examples": [
    "Il faut prendre une decision rapidement.",
    "Nous devons prendre une decision aujourd'hui."
  ],
  "language": "fr",
  "item_type": "phrase",
  "learning_status": "new"
}
```

Field notes:
- `id` is required
- `display_text` is required
- `canonical_text` is optional and may be `null`
- `translation` is optional and may be `null`
- `short_explanation` is required and is stored in the source word language
- `examples` is required and is returned as a list of strings
- `language` is optional and may be `null`
- `item_type` is required
- `learning_status` is optional and may be `null`

Confirmed behavior:
- returns full details only for the authenticated user's item
- soft-deleted items do not appear in normal item-details reads
- returns `404 Not Found` when the item is missing or not owned by the current user

### GET /preferences/learning

Confirmed endpoint role:
- shared settings/preferences read for authenticated clients

Accepted baseline note:
- used by the narrow web settings screen where applicable
- current translation-preference field name is `preferred_translation_language`
- scheduled-review timezone is represented as `preferred_review_timezone`

Confirmed success shape:

```json
{
  "daily_review_enabled": true,
  "daily_review_target_count": 10,
  "preferred_review_time": "18:30:00",
  "preferred_review_timezone": "Europe/Warsaw",
  "preferred_translation_language": "en"
}
```

Field notes:
- `daily_review_enabled` is required
- `daily_review_target_count` is required
- `preferred_review_time` is optional and may be `null`
- `preferred_review_timezone` is optional and may be `null`
- `preferred_translation_language` is optional and may be `null`

### PUT /preferences/learning

Confirmed endpoint role:
- shared settings/preferences update for authenticated clients

Accepted baseline note:
- used by the narrow web settings screen where applicable
- accepts the same learning-preference field family returned by `GET /preferences/learning`
- changing `preferred_translation_language` does not immediately regenerate old cards
- older cards refresh lazily later
- `daily_review_enabled`, `daily_review_target_count`, `preferred_review_time`, and `preferred_review_timezone` apply to the scheduled daily-review path
- manual `/review` remains a separate explicit path and is not blocked by `daily_review_enabled`

## Safe web-client assumptions

Safe assumptions for the current responsive web client:
- use Supabase browser auth directly for sign up, sign in, sign out, and recovery initiation
- call backend protected endpoints with `Authorization: Bearer <supabase_jwt>`
- bootstrap authenticated shell entry with:
  - `GET /auth/me`
  - `GET /auth/access`
- treat `GET /vocab` as the dictionary list endpoint
- treat `GET /vocab/{item_id}` as the Card Details endpoint
- treat dictionary reads as authenticated and user-scoped
- treat settings/preferences reads and writes as authenticated and user-scoped
- use snake_case backend field names exactly as returned by the backend

## Card Details scope boundary

The accepted narrow Card Details read-only field family remains:
- `display_text`
- `canonical_text`
- `translation` when present
- `short_explanation`
- `examples`
- `learning_status`
- `language` when present

Important:
- backend responses also include `id` and `item_type`
- this note does not imply that every backend response field automatically becomes UI scope

## Still provisional

Still not explicitly locked beyond current backend evidence:
- the exact unauthenticated error body for every protected dictionary route
- whether future pagination will be added to `GET /vocab`
- any frontend token persistence or refresh behavior
- any additional UI use of backend fields outside the accepted narrow screen scope

## Evidence basis

This note is based on current project docs and backend code, especially:
- `docs/API_SPEC.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/SESSION_HISTORY.md`
- `docs/WEB_CLIENT_STATUS.md`
- `backend/app/modules/identity_access/api.py`
- `backend/app/modules/identity_access/schemas.py`
- `backend/app/modules/dictionary/api.py`
- `backend/app/modules/dictionary/schemas.py`
- `backend/app/modules/dictionary/services.py`
