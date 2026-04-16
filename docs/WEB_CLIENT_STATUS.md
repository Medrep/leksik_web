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
- Sign In
- Password Recovery
- Password Recovery Confirmation
- Supabase browser auth for web auth entry
- authenticated-entry bootstrap through:
  - GET /auth/me
  - GET /auth/access
- Dictionary List
- search inside Dictionary List
- Card Details
- sign-out action
- theme toggle across shared layouts
- responsive browser support for mobile and desktop
- protected narrow settings route
- narrow settings screen for `preferred_translation_language`
- minimal authenticated settings navigation entry
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
- public auth-entry screens are implemented
- public auth interaction layer is implemented
- Supabase browser auth is wired
- authenticated route entry is gated through real backend auth/access checks
- Dictionary List is backend-backed
- dictionary search is backend-owned and stays inside Dictionary List
- Card Details is backend-backed
- protected settings route and screen are implemented
- `preferred_translation_language` load/save is implemented through:
  - GET /preferences/learning
  - PUT /preferences/learning
- dictionary rendering now follows the accepted rule:
  - explanation is shown as the source-language explanation
  - translation is shown only when `preferred_translation_language` is set and backend returns translation
- empty dictionary state is implemented with a narrow CTA that stays inside Telegram-first boundaries
- details-first delete is implemented from Card Details only with a small confirmation step
- successful delete returns the user to Dictionary List and removes the deleted item from normal visible reads
- lightweight local cache is implemented for dictionary list and card details
- cache invalidation is implemented after:
  - delete
  - sign out / auth-boundary loss
  - relevant settings changes
- theme behavior is implemented and persisted locally in the browser
- shared public and authenticated layouts are implemented
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
- keep theme as presentation behavior only, not a settings feature
- keep cache as a lightweight read optimization only

Current baseline result
- the accepted baseline-update slices are implemented through:
  - request/helper + preferences contract wiring
  - settings route, screen, and navigation entry
  - dictionary rendering rules + empty-state CTA
  - details-first delete flow
  - lightweight local cache for dictionary list and card details
- no broader scope expansion was introduced
