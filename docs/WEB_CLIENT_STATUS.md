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

Explicitly out of scope and still excluded
- manual add
- review UI
- Telegram replacement
- admin
- billing UI
- OCR
- manual status change
- advanced filters
- settings/profile expansion unless explicitly accepted later
- client-owned business logic

Implemented architecture boundary
- browser auth uses Supabase directly
- protected backend requests use Authorization: Bearer <supabase_jwt>
- authenticated entry is validated through backend-owned checks:
  - GET /auth/me
  - GET /auth/access
- Dictionary List uses the protected backend model
- Card Details uses the protected backend model
- sign out uses the real Supabase sign-out path
- the client does not implement a parallel auth/session model

Current implementation status
- public auth-entry screens are implemented
- public auth interaction layer is implemented
- Supabase browser auth is wired
- authenticated route entry is gated through real backend auth/access checks
- Dictionary List is backend-backed
- dictionary search is backend-owned and stays inside Dictionary List
- Card Details is backend-backed and read-only
- theme behavior is implemented and persisted locally in the browser
- shared public and authenticated layouts are implemented
- integration hardening pass is completed
- visual/layout cleanup pass is completed
- public entry and auth screens now use a simplified centered auth-card presentation
- authenticated shell is simplified to a minimal deploy-oriented header pattern
- Dictionary List no longer includes internal explanatory side panels or prototype-style helper blocks
- Card Details now uses a cleaner reading-oriented layout without prototype/dashboard-style framing
- prototype/documentation-like UI noise has been removed from user-facing screens
- theme control remains available but is visually quieter
- no functionality, route, backend-integration, or scope changes were introduced in the cleanup pass
- production build passes after the cleanup pass

Known confirmed contract points
- browser auth uses Supabase directly
- protected backend requests use Authorization: Bearer <supabase_jwt>
- authenticated entry uses GET /auth/me and GET /auth/access
- GET /vocab exists
- GET /vocab/{item_id} exists
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

Known explicitly provisional contract points
- exact GET /vocab response envelope and item schema
- exact GET /vocab/{item_id} success response shape
- exact guaranteed vs optional fields for list/details
- exact examples payload shape
- exact unauthenticated and access-denial status-code behavior for both endpoints
- item-id field naming in response payloads if backend/docs still mix `item_id`, `id`, or another confirmed identifier field

Local contract-clarification artifact
- docs/BACKEND_CONTRACT_CLARIFICATION_NOTE.md

Important implementation rules going forward
- do not add new frontend features unless explicitly accepted
- do not expand scope beyond the accepted screen set
- do not add client-owned auth, access, or search logic
- do not promote extra backend fields into UI scope automatically
- keep Card Details read-only
- keep search inside Dictionary List
- keep sign out as an action, not a screen
- keep theme as presentation behavior only, not a settings feature

Recommended next move
- use docs/BACKEND_CONTRACT_CLARIFICATION_NOTE.md to confirm the remaining GET /vocab and GET /vocab/{item_id} contract details in the backend/project repository
- explicitly confirm response-payload identifier naming if backend/docs still mix `item_id`, `id`, or another identifier field
- after backend confirmation, do only narrow normalization/correction work in this web repo if needed
