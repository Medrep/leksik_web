# SESSION_HISTORY.md

## Purpose
This file tracks major project sessions, decisions, accepted results, and next steps.

It is not meant to be a full task tracker.  
It is a concise working history so future AI chats and coding agents can understand recent project context.

---

## Session template

### YYYY-MM-DD — Session title

#### Context
Short description of why the session happened.

#### Decisions
- decision 1
- decision 2

#### Work completed
- completed item 1
- completed item 2

#### Accepted outputs
- accepted output 1
- accepted output 2

#### Deferred / not now
- deferred item 1
- deferred item 2

#### Next step
Short description of the next smallest recommended step.

---

## 2026-07-13 — Web Settings interface-language preference wiring added

#### Context
The deployed learning-preferences contract added nullable `ui_locale`, and the web Settings screen needed to persist it without introducing a web localization runtime or resending unchanged preferences.

#### Work completed
- Added a separate controlled interface-locale registry for `en`, `pl`, `ru`, and `uk` and a nullable Interface language selector where `System/browser default` maps to explicit `null`.
- Added `ui_locale` to the full normalized learning-preferences response model while separating updates into a partial changed-fields-only input model.
- Updated Settings and the existing onboarding helper call site so omitted fields remain untouched, explicit nullable changes remain distinct, and onboarding completion still depends only on `learning_language` and `preferred_translation_language`.

#### Accepted outputs
- The current web interface remains English; no localization provider, translation bundles, browser-locale resolution, locale-aware routes, or runtime locale switching were added.
- Successful Settings saves still replace drafts and saved baselines from the full backend-confirmed response, while failed saves preserve the unsaved draft and previous baseline.

#### Deferred / not now
- web localization runtime and translated labels
- browser-locale resolution and `<html lang>` switching
- localization of public, dictionary, Telegram, or account-management surfaces

#### Next step
Use the stored interface-language preference in a separately accepted future localization slice.

---

## 2026-07-06 — Web client Settings account deletion added

#### Context
Backend account deletion is deployed, and the narrow web Settings screen needed self-service deletion through the fixed frontend-only contract.

#### Work completed
- Added a bottom-of-Settings Danger zone with a destructive account deletion button and confirmation modal requiring exact `DELETE`.
- Wired the modal to `POST /account/delete` with only `{ "confirmation": "DELETE" }`, then reused sign-out/local cleanup and redirected to the public entry route after success or deletion-boundary 401.
- Kept existing Settings preference load/save, Telegram panel behavior, backend contract, and Supabase Auth deletion out of scope.

#### Deferred / not now
- backend changes
- Supabase Auth deletion
- admin deletion, Telegram deletion command, restore, data export, billing, or broader account-management UI

#### Next step
Smoke test the Settings deletion modal and successful redirect against the deployed backend.

---

## 2026-07-02 — Web client onboarding language gate added

#### Context
New authenticated users need to choose both language preferences earlier while keeping Settings and the existing preferences endpoint as the source of truth.

#### Work completed
- Added a narrow protected-entry language gate shown only when `learning_language` or `preferred_translation_language` is missing.
- Reused the existing `/preferences/learning` fetch/update flow and shared Settings language options for both fields.
- Preserved normal app entry after successful save and kept Settings as the later editing surface.

#### Deferred / not now
- backend changes
- new onboarding framework or progress system
- capture, enrichment, review, Telegram, billing, or Settings redesign changes

#### Next step
Smoke test new-account entry with missing language preferences and verify Settings shows the saved values afterward.

---

## 2026-06-29 — Web client root and shared row overflow trace fixed

#### Context
Real mobile runtime screenshots still showed horizontal overflow after earlier containment attempts, including sign-in clipping and dictionary list content extending past the viewport.

#### Work completed
- Added root inline-size containment at `html`, `body`, and body children so the shared app width chain stays viewport-bound.
- Tightened the shared public/authenticated shells, auth form/card wrappers, authenticated header controls, route-gate panel, and dictionary list grid/card rows so nested content cannot set an oversized intrinsic width.

#### Deferred / not now
- backend changes
- API, auth, or business-logic changes
- screen redesigns or new product scope

#### Next step
Keep future shared rows and repeated list/card children explicitly full-width and shrinkable inside their parent containers.

---

## 2026-06-22 — Web client root overflow source fixed

#### Context
Real mobile runtime screenshots still showed horizontal overflow after the earlier responsive containment patch, affecting both public auth and authenticated dictionary surfaces.

#### Work completed
- Added shared root shrink containment so app boxes and the body width chain stay within the viewport.
- Tightened protected route panels, Telegram completion shell content, the sign-in footer row, and dictionary result links/cards so flex/grid children cannot force intrinsic-width overflow.

#### Deferred / not now
- backend changes
- API, auth, or business-logic changes
- screen redesigns or new product scope

#### Next step
Keep future shell rows and grid/list children explicitly shrinkable and full-width within their parent containers.

---

## 2026-06-22 — Web client shared responsive containment fixed

#### Context
Mobile browser verification showed the narrow web client could still let shared public/authenticated layout content become wider than the viewport, clipping the right side of forms or page content.

#### Work completed
- Tightened shared public and authenticated shells, shared cards, route-gate panels, and core content wrappers with width, shrink, and long-content containment.
- Removed shell-level horizontal clipping that could hide broken width calculations while keeping controls and content mobile-safe.

#### Deferred / not now
- backend changes
- auth or endpoint-contract changes
- screen redesigns or new product scope

#### Next step
Keep future screen work inside the shared containment primitives so mobile pages remain viewport-safe.

---

## 2026-06-15 — Web client settings learning language field added

#### Context
The shared learning-preferences backend contract added nullable `learning_language`, and the narrow web Settings screen needed to expose it without expanding settings scope.

#### Decisions
- `learning_language` is a hint for interpreting newly captured words and phrases, not a hard language restriction.
- The web client continues using the existing `GET /preferences/learning` and `PUT /preferences/learning` settings path.
- Existing `preferred_translation_language` behavior remains translation-output-only and unchanged.

#### Work completed
- Added `learning_language` to the web learning-preferences model and Settings draft/saved state.
- Added a nullable `I’m learning` select to `/settings` with controlled language options and `Not selected`.
- Preserved existing daily review, translation-language, and Telegram settings behavior.

#### Deferred / not now
- backend changes
- settings redesign
- onboarding changes
- mandatory language selection
- language mismatch warnings
- capture-time prompts
- card regeneration or backfill

#### Next step
Verify the narrow Settings save/load behavior against the backend contract in normal browser smoke testing.

---

## 2026-06-15 — Web client settings language options aligned

#### Context
Production verification confirmed the backend-supported non-null language set for both `preferred_translation_language` and `learning_language`.

#### Decisions
- Both settings fields use the same controlled non-null language options.
- Existing nullable UI labels remain field-specific: translation keeps its shipped null option, and learning language keeps `Not selected`.
- Existing settings load/save behavior and field meanings remain unchanged.

#### Work completed
- Added missing `uk`, `de`, `es`, and `pt` options to `preferred_translation_language`.
- Reused one local non-null language options source for both settings fields.
- Preserved the narrow Settings screen, helper copy, and endpoint usage.

#### Deferred / not now
- backend changes
- settings redesign
- null-label redesign
- onboarding, review, Telegram, mobile, or billing changes

#### Next step
Keep future language-option changes aligned with the shared backend preferences contract.

---

## 2026-04-22 — Scheduled daily review runtime and worker path accepted

#### Context
Several narrow backend slices completed the scheduled daily review path from runtime state through worker invocation and production Compose wiring.

#### Decisions
- Scheduled daily review remains a backend runtime concern, not a new public API endpoint.
- Manual `/review` remains separate and unchanged.
- The dedicated worker runs the scheduled runtime core; it does not reimplement due-user selection, lease/claim logic, session creation, or Telegram delivery behavior.
- Production runtime uses Docker Compose with separate `api` and `worker` services; no systemd backend runtime was introduced.
- `processing_jobs` and generic worker/job orchestration remain deferred.

#### Work completed
- Added scheduled review runtime state and traceability with `preferred_review_timezone`, `scheduled_review_runtime`, manual/scheduled session origins, and scheduled local-date markers.
- Implemented the callable scheduled runtime core for due-user selection, lease/claim handling, local-day idempotency, scheduled session creation, marker advancement, and Telegram delivery attempts for newly created scheduled sessions.
- Added a dedicated scheduled-review worker entrypoint with a 60-second loop, per-tick failure isolation, and minimal logging.
- Added production Docker Compose wiring for a separate long-running worker service using the same backend env-file family as `api`.

#### Accepted outputs
- Scheduled daily review can be invoked by a separate worker process without changing manual review behavior.
- At most one scheduled session is created per user local day.
- Telegram delivery is attempted only for newly created scheduled sessions.
- The production backend Compose runtime now includes separate `api` and `worker` services.

#### Deferred / not now
- `processing_jobs` integration for scheduled review execution
- generic worker/job orchestration platform
- broader retry framework, delivery-attempt history, notification center, or messaging-platform redesign
- review, Telegram, auth, or proxy redesign

#### Next step
Run live functional verification with eligible linked users in the production-like runtime and confirm scheduled sessions are created and delivered as expected.

---

## 2026-04-21 — Scheduled daily review runtime core accepted

#### Context
The scheduled daily review DB foundation was already in place, and the next narrow backend slice added the first real scheduled runtime execution path without implementing a full scheduler daemon or broad worker platform.

#### Decisions
- Scheduled daily review remains separate from manual `/review`; manual review does not update or block scheduled runtime markers.
- The anti-duplicate rule is one scheduled review session created per user local day, not one successfully delivered Telegram message.
- The scheduled runtime exists as a callable backend service; the scheduler daemon/worker invocation loop remains separate follow-up work.
- `processing_jobs` integration remains deferred for this slice.

#### Work completed
- Implemented scheduled due-user selection using learning preferences and `scheduled_review_runtime`.
- Added durable claim/lease handling for repeated ticks and worker restarts.
- Enforced local-day idempotency for scheduled review session creation.
- Created scheduled sessions with `origin = scheduled` and `scheduled_review_local_date`.
- Advanced scheduled runtime markers after new session creation, confirmed existing scheduled session, or no eligible items.
- Attempted Telegram delivery only for newly created scheduled sessions.

#### Accepted outputs
- The scheduled daily review DB/runtime foundation now includes `learning_preferences.preferred_review_timezone`, `scheduled_review_runtime`, `review_sessions.origin`, and `review_sessions.scheduled_review_local_date`.
- The scheduled runtime core can find due users, claim them, create at most one scheduled session per local day, and advance runtime state to avoid duplicate creation or hot-looping.
- Telegram delivery failure after scheduled session creation does not create another scheduled session for the same local day.
- Manual `/review` remains an explicit separate path and does not update scheduled runtime markers.

#### Deferred / not now
- full scheduler daemon or always-running worker invocation loop
- `processing_jobs` integration for scheduled review execution
- notification-center or generic messaging-platform design
- delivery-attempt history table, retry queue redesign, review redesign, Telegram redesign, or auth redesign

#### Next step
Add the narrow scheduler/worker invocation path that calls the accepted scheduled runtime service, without broadening into a generic job platform.

---

## 2026-04-15 — Backend baseline Slices A-D implemented

#### Context
The accepted backend/client baseline update moved from docs/planning into narrow backend implementation slices covering shared preferences, optional translation support, backend-owned soft delete, and review compatibility protection.

#### Decisions
- Slice A remains a shared-preferences foundation only: `preferred_translation_language` was added without redesigning preferences, auth, review, or enrichment behavior beyond storing the setting.
- Slice B keeps the existing payload shape while making `translation` nullable, keeps `short_explanation` source-language-first, and preserves synchronous ready-card behavior for API and Telegram capture.
- Slice C uses backend-owned soft delete with a real authenticated user-scoped delete endpoint and treats soft-deleted items as unavailable in normal dictionary read paths.
- Slice D remains a narrow review compatibility patch only and does not add new review modes, explanation-first review, or stored-session rewrites.

#### Work completed
- Implemented Slice A:
  - added nullable `preferred_translation_language` to `learning_preferences`
  - added an additive migration
  - updated shared preferences read/update schemas and service logic
- Implemented Slice B:
  - made stored `translation` nullable
  - updated capture/list/details payload contracts to keep `translation` present but nullable
  - threaded `preferred_translation_language` into enrichment/capture handling
  - made Telegram ready-card formatting null-safe
- Implemented Slice C:
  - added backend-owned soft-delete persistence for vocabulary items
  - added `DELETE /vocab/{item_id}` as an authenticated user-scoped soft-delete endpoint
  - excluded soft-deleted items from normal dictionary list/details reads
- Implemented Slice D:
  - kept existing MCQ review generation guards for untranslated/deleted items
  - added a narrow runtime-safe answer-submission compatibility check so no longer active review items do not update learning state

#### Accepted outputs
- `preferred_translation_language` now exists in the shared backend preferences contract and remains nullable.
- Translation now remains in the existing payload shape while becoming nullable for capture and dictionary reads.
- Telegram capture still returns an immediate ready card after the nullable-translation change.
- Soft delete is now implemented as a real backend-owned authenticated endpoint with non-destructive storage.
- Soft-deleted items now disappear from normal dictionary list/details reads and are excluded from active review selection paths.
- Current review flow remains snapshot-based and shared across API and Telegram, with narrow compatibility protection rather than redesign.

#### Deferred / not now
- lazy refresh or old-card regeneration after preference changes
- restore flow, hard delete, or deleted-item re-capture semantics
- explanation-first review or broader MCQ/review redesign
- billing work, sync/conflict protocol work, or mobile/client implementation

#### Next step
Use the implemented Slice A-D backend baseline as the source for future client handoff and keep any remaining follow-up work narrow, compatibility-oriented, and separate from these accepted slices.

---

## 2026-04-14 — Client/settings baseline refined in docs

#### Context
Accepted client/backend baseline changes needed to be reflected across the project docs without changing architecture direction or reopening unrelated scope.

#### Decisions
- Current mobile scope includes auth, dictionary list, search, language/status filters, card details, manual add, Delete from dictionary, settings, `preferred_translation_language`, and cache-only local storage for dictionary list/details.
- Current mobile scope excludes manual status change, app-side review UI, OCR, billing UI/flows, advanced analytics, gamification, and social features.
- Narrow web-client scope now includes a settings screen using the same backend settings/preferences endpoints where applicable.
- Card explanation remains stored in the source word language, and translation is stored only when `preferred_translation_language` is set.
- Changing `preferred_translation_language` does not immediately regenerate old cards; older cards refresh lazily later.
- Delete from dictionary maps to backend soft delete.
- Client cache remains cache-only; the backend remains the source of truth.
- Billing remains backend access-model only for now.

#### Work completed
- Updated the source-of-truth docs to align product, backlog, architecture, API, mobile-baseline, web-scope, and index wording with the accepted baseline.
- Removed current-scope wording that implied manual status change in the mobile client baseline.
- Added concise settings, soft-delete, optional-translation, and cache-boundary clarifications where those rules materially affect the docs.

#### Accepted outputs
- The docs now consistently use `preferred_translation_language`.
- Current mobile scope no longer implies manual status change.
- Settings scope is reflected for both mobile and the narrow web client where relevant.
- Delete behavior is documented as soft delete.

#### Deferred / not now
- implementation mechanics for lazy card refresh
- offline-first sync/conflict design
- billing screens or billing flows
- app-side review UI

#### Next step
Use the updated docs baseline for future backend and client work without expanding scope beyond these accepted changes.

---

## 2026-04-13 — Telegram link-state foundation added

#### Context
Cross-channel onboarding planning was accepted, and the first implementation slice needed a backend-owned canonical Telegram link-state foundation without building the full web-first or Telegram-first completion flow yet.

#### Decisions
- The existing provider-aware messaging model was extended instead of introducing a separate Telegram-only linking subsystem.
- Observed messaging identities and confirmed product-user links are now modeled separately.
- Telegram-first observation is persisted at the backend even before linkage is completed.
- MVP keeps one active linked Telegram account per product user and one active linked owner per Telegram identity.
- Reassignment remains conflict/manual resolution rather than self-serve behavior.

#### Work completed
- Split observed messaging identities from canonical messaging link state in the backend data model.
- Added explicit link states for pending, linked, and conflict plus basic audit timestamps.
- Migrated existing linked Telegram rows into the new canonical linked-state table.
- Updated Telegram webhook handling to record observed identities while preserving link-required product behavior.

#### Accepted outputs
- The backend can now represent observed-but-unlinked Telegram identities.
- The backend now has canonical pending, linked, and conflict state support for Telegram linkage.
- Existing linked Telegram capture/review behavior remains on the linked path instead of silently breaking.

#### Deferred / not now
- one-time code completion flow
- web connect CTA / UX
- Telegram onboarding wording polish
- unlink flow
- reassignment flow
- admin/manual-resolution tooling

#### Next step
Build the next narrow slice on top of this foundation: secure link-completion mechanics that reuse the same canonical backend-owned link model.

---

## 2026-04-13 — Backend web-client CORS runtime blocker fixed

#### Context
The first real web-client auth bootstrap test hit a backend runtime blocker before backend auth behavior could be evaluated from the browser.

#### Decisions
- The blocker was confirmed to be CORS preflight handling, not Supabase browser auth, bearer-token ownership, or backend current-user/access logic.
- The accepted fix remained narrow: add env-driven FastAPI CORS support to the backend runtime.
- The auth ownership model remains unchanged: browser uses Supabase Auth directly, backend consumes bearer tokens, and `/auth/me` plus `/auth/access` remain backend checks.

#### Work completed
- Added backend CORS settings for allowed origins and credential behavior.
- Added normalization for origin values loaded from env.
- Registered FastAPI `CORSMiddleware` so browser preflight requests can complete for allowed origins.

#### Accepted outputs
- The backend now supports env-driven CORS runtime configuration for the current web-client integration path.
- The accepted local browser origin can be allowed without hardcoding it into backend code.
- No backend auth-entry facade, cookie/session auth layer, or endpoint-contract change was introduced.

#### Deferred / not now
- auth redesign
- browser auth/session contract expansion
- broader web-client integration documentation rewrite

#### Next step
Deploy the CORS patch to the target backend runtime and re-run browser auth bootstrap testing against `/auth/me` and `/auth/access`.

---

## 2026-04-12 — Future mobile baseline accepted

#### Context
A mobile MVP scope brief was reviewed and accepted, but only as a future client baseline rather than as the immediate next implementation workstream.

#### Decisions
- The mobile scope brief is accepted as the future mobile client baseline.
- It must not be treated as the immediate next client implementation step.
- Immediate client priority is still being evaluated separately against a smaller responsive web-first option.
- The accepted mobile role remains: separate client project in Antigravity, thin over the shared backend API, with Telegram still primary for capture and daily review.

#### Work completed
- Added a small source-of-truth doc for the accepted future mobile MVP baseline.
- Added the new mobile baseline doc to the documentation index.
- Recorded the accepted baseline and its non-immediate status in session history.

#### Accepted outputs
- The future mobile baseline is now documented at scope/flow/screen-list level.
- The docs make clear that mobile implementation does not start now from this acceptance.
- The docs preserve the already accepted mobile role and scope without changing current delivery priority.

#### Deferred / not now
- immediate mobile implementation start
- web-vs-mobile priority decision
- detailed mobile UX or onboarding design

#### Next step
Keep the future mobile baseline as accepted reference material while current client-priority evaluation continues separately.

---

## 2026-04-12 — Production onboarding scope kept controlled

#### Context
The project needed a clear recorded decision about current production onboarding posture versus later user-facing auth/onboarding work.

#### Decisions
- For the current stage, production user onboarding remains manual / controlled.
- There is no self-serve production onboarding flow yet.
- Self-serve onboarding is intentionally deferred as scope control, not as an accidentally missing task.
- Proper user-facing auth/onboarding will be designed and implemented later with the mobile app workstream.
- The later user-facing entrypoint is expected to be a simple landing/auth flow.

#### Work completed
- Recorded the accepted onboarding scope decision in the project decision log.
- Added a matching session-history note so future implementation chats inherit the same operational baseline.
- Added a minimal product-spec clarification so the current stage is not read as having self-serve onboarding already.

#### Accepted outputs
- The docs now state clearly that current production onboarding is controlled/manual.
- The docs now state clearly that self-serve onboarding is intentionally deferred.
- The docs now tie future proper auth/onboarding flow to the mobile app workstream without defining the future design in detail.

#### Deferred / not now
- Self-serve production onboarding flow
- detailed landing/auth UX design
- mobile auth implementation details

#### Next step
Continue current controlled onboarding operations and defer full user-facing onboarding/auth design to the later mobile app stream.

---

## 2026-04-12 — Production auth validation blocker fixed

#### Context
Production bearer-token validation rejected real Supabase access tokens on backend protected endpoints even though Supabase Auth accepted the same tokens.

#### Decisions
- The production auth blocker was confirmed to be in backend bearer-token validation, not in token acquisition, Telegram linking, or DB user provisioning.
- The accepted fix remained narrow: update only the bearer-token validation boundary and keep the existing request-context/current-user flow intact.
- Production validation must no longer assume HS256/shared-secret-only verification.

#### Work completed
- Replaced the narrow manual bearer-token validation path with Supabase-compatible JWT verification.
- Added ES256 session-token verification through Supabase JWKS.
- Kept legacy HS256 token support through `SUPABASE_JWT_SECRET` for compatibility.
- Normalized blank `SUPABASE_JWT_AUDIENCE` and `SUPABASE_JWT_ISSUER` values so blank env values behave as unset.

#### Accepted outputs
- Real Supabase-style production bearer tokens are accepted through the backend auth validation path.
- Existing request-context/current-user resolution semantics were preserved after token validation succeeds.
- Endpoint contracts did not change.
- The fix remained limited to auth validation/config behavior and did not change Telegram, capture, dictionary, review, or product scope.

#### Deferred / not now
- Auth architecture redesign
- broader auth/product documentation rewrite

#### Next step
Continue normal backend/product work on top of the corrected production auth validation path.

---

## 2026-04-08 — Product baseline and architecture set

#### Context
Initial project definition, MVP scope alignment, architecture selection, and documentation packaging for the Personal AI Vocabulary System.

#### Decisions
- Product is backend-first.
- Bot is the primary interface for capture and daily review.
- Mobile app is the secondary interface for dictionary browsing, manual add, and status management.
- Main MVP learning unit is a word or phrase.
- After bot capture, the user must receive a ready card immediately.
- The app must support manual add.
- OCR must be planned from day one but is not part of MVP.
- OCR moves to Phase 1 after MVP.
- Payment must be planned from day one.
- Billing UI / active payment flow is not required in MVP.
- Architecture style is modular monolith.
- Chosen stack direction is FastAPI + Supabase Postgres/Auth/Storage + Flutter + Qwen + worker/jobs.
- Review logic is code-driven.
- Question generation is template-based MCQ.
- Vocabulary items remain user-scoped in MVP.
- The product must not be built around OpenClaw or any specific bot platform.

#### Work completed
- Product concept defined.
- MVP functional scope defined.
- MVP backlog defined.
- High-level architecture defined.
- Data model defined.
- API surface defined.
- Implementation plan defined.
- Project docs package prepared:
  - README_DOCS_INDEX.md
  - PRODUCT_SPEC.md
  - MVP_BACKLOG.md
  - ARCHITECTURE.md
  - DATA_MODEL.md
  - API_SPEC.md
  - IMPLEMENTATION_PLAN.md
  - DECISIONS.md

#### Accepted outputs
- Product baseline accepted.
- Architecture baseline accepted.
- Realistic implementation order accepted.
- New chat workflow accepted:
  - architect chat
  - Codex prompt chat
  - Codex in VS Code
  - separate control-tower usage

#### Deferred / not now
- OCR implementation
- billing flow UI
- advanced SRS
- tutor mode
- social features
- shared/global vocabulary model

#### Next step
Start implementation with Milestone 1, Phase 0: backend foundation only.

---

## 2026-04-09 — Milestone 1 completed: Phase 0 and Phase 1 accepted

#### Context
Implementation and local validation of Milestone 1 foundation work for the backend, covering Phase 0 project foundation and Phase 1 identity and access foundation.

#### Decisions
- Phase 0 is accepted as complete.
- Phase 1 is accepted as complete.
- Local development should use the configured `.env` path.
- For local development, Supabase connectivity should use the Supabase session pooler when direct connection fails in the current environment.
- The `access_state` enum mapping must use lowercase DB values consistent with the Postgres enum definition.

#### Work completed
- Completed Phase 0 backend foundation:
  - backend repository/app structure
  - FastAPI scaffold
  - environment config structure
  - DB connection setup
  - migration setup
  - Docker setup
  - `/health` endpoint
- Completed Phase 1 identity/access foundation:
  - `users`
  - `user_access`
  - `learning_preferences`
  - auth integration boundary
  - current user resolution
  - access-state aware request context
  - `/auth/me`
  - `/auth/access`
  - learning preferences read/update endpoints
- Discovered and fixed a provisioning bug where Python-side `access_state` enum binding did not match the lowercase Postgres enum values.

#### Accepted outputs
- Backend foundation validated locally.
- `.env` was set up correctly.
- Supabase DB connectivity works.
- `/health` returned `{"status":"ok","database":"ok","environment":"development"}`.
- Identity/access foundation validated locally.
- `/auth/me` works with dev auth headers.
- `/auth/access` returns state `free`.
- Learning preferences read/update works.
- Unauthenticated access to protected endpoints returns `401`.
- Milestone 1 is complete.

#### Deferred / not now
- Vocabulary capture
- enrichment
- bot integration
- dictionary flows
- review logic
- OCR
- billing UI / payment flow
- Flutter/mobile work
- Direct Supabase connection in the current environment due to IPv6 routing issues

#### Next step
Start Milestone 2 / Phase 2: Vocabulary capture core.

---

## 2026-04-09 — Milestone 2 / Phase 2 accepted: Vocabulary capture core

#### Context
Implementation and local validation of the first real vocabulary capture loop for the backend.

#### Decisions
- Milestone 2 / Phase 2 is accepted as complete.
- The happy-path capture flow remains synchronous and returns a ready card immediately.
- Qwen remains limited to structured enrichment only.
- The Qwen local validation issue was configuration-related and was resolved by fixing the `QWEN_API_BASE_URL` typo.

#### Work completed
- Added Phase 2 capture persistence:
  - `raw_inputs`
  - `vocabulary_items`
  - `vocabulary_sources`
  - `vocabulary_examples`
  - minimal `learning_states` initialization for new vocabulary items
- Added the capture API:
  - `POST /vocab/capture`
- Added the enrichment pipeline boundary and Qwen structured enrichment integration.
- Implemented minimal user-scoped normalization/reuse so repeat capture reuses the same vocabulary item.

#### Accepted outputs
- Real capture flow was validated locally end-to-end.
- Authenticated capture through `POST /vocab/capture` works.
- Ready card is returned immediately.
- The response includes:
  - `vocabulary_item_id`
  - `display_text`
  - `canonical_text`
  - `translation`
  - `short_explanation`
  - `examples`
  - `learning_status`
- Repeat capture reused the same vocabulary item.
- Unauthenticated capture returned `401`.
- Qwen integration worked in real local validation after fixing the `QWEN_API_BASE_URL` typo.
- The first real product loop is now proven:
  - authenticated user submits text
  - backend stores raw input
  - enrichment runs
  - vocabulary item is created or reused
  - source/examples are stored
  - learning state is initialized
  - ready card is returned immediately
- Milestone 2 / Phase 2 is complete.

#### Deferred / not now
- Bot integration
- dictionary list/details/search/filter flows
- review logic
- OCR
- billing UI / payment flow
- Flutter/mobile work

#### Next step
Start Milestone 2 / Phase 3: Dictionary read model.

---

## 2026-04-09 — Milestone 2 completed: capture core and dictionary read model accepted

#### Context
Completion and local validation of Milestone 2, covering the first real vocabulary capture loop and the dictionary read model for app consumption.

#### Decisions
- Milestone 2 / Phase 2 is accepted as complete.
- Milestone 2 / Phase 3 is accepted as complete.
- Milestone 2 overall is accepted as complete.
- Qwen remains limited to structured enrichment only.
- A minimal schema fix was accepted to persist `language` on `vocabulary_items` for real dictionary language filtering.

#### Work completed
- Completed Milestone 2 / Phase 2 vocabulary capture core:
  - authenticated `POST /vocab/capture`
  - synchronous ready-card flow
  - raw input persistence
  - vocabulary item create/reuse
  - source/example persistence
  - learning-state initialization
  - Qwen structured enrichment integration
- Completed Milestone 2 / Phase 3 dictionary read model:
  - dictionary list endpoint
  - item details endpoint
  - search by text
  - filter by language
  - filter by learning status
  - user-scoped dictionary responses for UI consumption

#### Accepted outputs
- Milestone 2 / Phase 2 was completed and accepted.
- Real capture flow was validated locally end-to-end.
- Authenticated capture through `POST /vocab/capture` works.
- Ready card is returned immediately.
- Repeat capture reused the same vocabulary item.
- Unauthenticated capture returned `401`.
- Qwen integration worked in real local validation after fixing the `QWEN_API_BASE_URL` typo.
- The first real product loop is now proven:
  - authenticated user submits text
  - backend stores raw input
  - enrichment runs
  - vocabulary item is created or reused
  - source/examples are stored
  - learning state is initialized
  - ready card is returned immediately
- Milestone 2 / Phase 3 was completed and accepted.
- Dictionary list and item details were implemented.
- `GET /vocab` supports:
  - search by text
  - filter by language
  - filter by learning status
- `GET /vocab/{item_id}` returns full item details for the current user.
- Dictionary reads are user-scoped.
- No hidden write behavior was added in the read layer.
- Older rows may remain `language = NULL` by design.
- Milestone 2 overall is now complete.

#### Deferred / not now
- Bot integration
- review logic
- OCR
- billing UI / payment flow
- Flutter/mobile work
- manual status change

#### Next step
Start Milestone 3 — Bot working flow.

---

## 2026-04-10 — Milestone 3 accepted: Telegram bot working flow

#### Context
Implementation and local validation of the first concrete bot transport for backend capture, using Telegram while keeping the product core provider-agnostic.

#### Decisions
- Milestone 3 is accepted as complete.
- Telegram is accepted as the first concrete messaging transport.
- The messaging/user-linking model remains provider-agnostic so future providers can be added without redesign.
- Telegram remains a thin transport adapter, not the system core.

#### Work completed
- Added Telegram as the first concrete messaging transport.
- Added a provider-agnostic messaging/user-linking model for product-user mapping.
- Added Telegram-to-product-user linking.
- Wired Telegram capture flow to reuse the existing backend capture core.
- Added Telegram-ready formatting for the immediate ready-card response.

#### Accepted outputs
- Milestone 3 was completed and accepted.
- Telegram was implemented as the first concrete messaging transport.
- A provider-agnostic messaging/user-linking model was added for future multi-provider support.
- Telegram user identity can be linked to the correct product user.
- Telegram capture flow reuses the existing backend capture core.
- Ready card is returned immediately through Telegram flow.
- Telegram transport remains a thin adapter, not the system core.
- No review flow was added yet.
- No WhatsApp implementation was added yet.
- Local Telegram webhook smoke testing passed.
- Milestone 3 is now complete.

#### Deferred / not now
- WhatsApp implementation
- review flow
- quiz/question answering
- OCR
- billing UI / payment flow
- advanced bot conversation state

#### Next step
Start Milestone 4 — Learning loop / review flow.

---

## 2026-04-10 — Milestone 4 accepted: learning loop and review history surface complete

#### Context
Implementation, validation, and follow-up gap closure for the MVP learning loop, covering backend review flow, Telegram review delivery, and the missing review session history endpoint from the documented API surface.

#### Decisions
- Milestone 4 is accepted as complete.
- Review flow remains backend-owned and code-driven.
- Review questions remain stored snapshots and are not recomputed from live vocabulary state.
- Telegram remains a thin transport adapter over the shared backend review flow.
- The mobile app remains a separate client project to be implemented in Antigravity.
- Future mobile implementation work belongs in a separate mobile implementation chat.

#### Work completed
- Implemented Milestone 4 learning loop / review flow:
  - review session generation
  - review question model
  - review answer submission
  - learning state updates after answers
  - Telegram delivery of review questions
  - Telegram answer handling
  - minimal session flow only
  - template-based MCQ only
  - compact feedback
- Completed the Milestone 4 follow-up gap closure:
  - added `GET /review/session/{session_id}`
  - kept the endpoint read-only
  - scoped the endpoint to the authenticated current user
  - returned stored session details/history
  - returned stored question snapshots in stored order
  - returned stored answers when present
  - kept the endpoint free of side effects

#### Accepted outputs
- Milestone 4 was implemented and accepted as the learning loop / review flow milestone.
- Review session generation was implemented and accepted.
- Review question model was implemented and accepted.
- Review answer submission was implemented and accepted.
- Learning state updates after answers were implemented and accepted.
- Telegram delivery of review questions was implemented and accepted.
- Telegram answer handling was implemented and accepted.
- Minimal session flow only was implemented and accepted.
- Template-based MCQ only was implemented and accepted.
- Compact feedback was implemented and accepted.
- The follow-up gap closure was completed and accepted:
  - `GET /review/session/{session_id}` was added
  - the endpoint is read-only
  - the endpoint is authenticated and user-scoped
  - the endpoint returns stored session details/history
  - the endpoint returns stored question snapshots in stored order
  - the endpoint returns stored answers when present
  - the endpoint has no side effects
- This closed the doc/implementation mismatch for review session history.
- Current accepted project status:
  - Milestone 1 complete and accepted
  - Milestone 2 complete and accepted
  - Milestone 3 complete and accepted
  - Milestone 4 complete and accepted
- Important boundary remains accepted:
  - mobile app is a separate client project
  - mobile implementation will be done in Antigravity
  - mobile remains a thin client over the shared backend API
  - backend remains the system core

#### Deferred / not now
- OCR
- billing UI / payment flow
- WhatsApp implementation
- advanced SRS
- advanced analytics
- app-side review UI
- worker/scheduler expansion beyond the current MVP review loop

#### Next step
Start Milestone 5 — App usability + release prep.

---

## 2026-04-10 — Backend hardening Slice 1 and Slice 2 accepted

#### Context
Narrow backend hardening follow-up focused on small API consistency cleanup and config/runtime clarification after the core MVP milestones were accepted.

#### Decisions
- Backend hardening Slice 1 is accepted as complete.
- Backend hardening Slice 2 is accepted as complete.
- Review response-contract cleanup stays narrow and does not redesign review logic or Telegram flow.
- Broader `DATABASE_URL` default policy remains explicitly unchanged in this pass.

#### Work completed
- Completed Backend hardening Slice 1:
  - reviewed the active backend API surface
  - normalized the approved narrow review response-contract mismatches
- Completed Backend hardening Slice 2:
  - changed backend settings loading from cwd-sensitive `.env` loading to an explicit backend-root env path
  - normalized `TELEGRAM_WEBHOOK_SECRET` empty-string behavior so empty values behave as unset
  - updated `.env.example` and `README.md` narrowly to clarify the runtime behavior

#### Accepted outputs
- Slice 1 completed and accepted.
- Review response-contract mismatches were normalized in a narrow patch.
- No review logic or Telegram flow redesign was introduced.
- Slice 2 completed and accepted.
- Backend settings loading was changed from cwd-sensitive `.env` loading to an explicit backend-root env path.
- `TELEGRAM_WEBHOOK_SECRET` empty-string behavior was normalized so empty values behave as unset.
- `.env.example` and README were updated narrowly to clarify the runtime behavior.
- Broader `DATABASE_URL` default policy was explicitly left unchanged.

#### Deferred / not now
- Broader `DATABASE_URL` default policy changes
- wider deployment/runtime cleanup
- broader API error payload normalization

#### Next step
Start Backend hardening Slice 3 — Logging and observability minimum.

---

## 2026-04-11 — Backend hardening Slices 3-5 and Deployment Slices 1-5 accepted

#### Context
Documentation-first hardening and deployment-planning follow-up for first production deployment and controlled Telegram dogfooding readiness.

#### Decisions
- Backend hardening Slice 3 is accepted as complete.
- Backend hardening Slice 4 is accepted as complete.
- Backend hardening Slice 5 is accepted as complete.
- Deployment Slice 1 is accepted as complete.
- Deployment Slice 2 is accepted as complete.
- Deployment Slice 3 is accepted as complete.
- Deployment Slice 4 is accepted as complete.
- Deployment Slice 5 is accepted as complete.
- Backend MVP core, backend hardening, and deployment-planning slices are now effectively closed.

#### Work completed
- Completed Backend hardening Slice 3:
  - added one global unexpected-exception visibility improvement in the backend API runtime path
  - added one narrow success-boundary log for `POST /vocab/capture`
  - kept the change narrow and did not introduce broad logging standardization
- Completed Backend hardening Slice 4:
  - audited migration hygiene
  - confirmed the Alembic migration chain is coherent and single-head
  - clarified in README that API/Docker startup does not auto-apply Alembic migrations
  - added the explicit compose/container migration step to README
- Completed Backend hardening Slice 5:
  - added a practical backend smoke/regression checklist to README
  - added a backend dogfooding/release-readiness minimum section to README
  - kept the slice documentation-only
- Completed Deployment Slice 1:
  - added a deployment-readiness doc covering production backend runtime/env checklist, API and worker prerequisites, migration run order, deploy order, and the rule that Telegram production webhook activation comes last
- Completed Deployment Slice 2:
  - added a dedicated Telegram production webhook cutover doc covering prerequisites, safe cutover sequence, immediate sanity checks, and minimal containment notes
  - kept the slice docs-only
- Completed Deployment Slice 3:
  - added a production smoke verification doc covering post-deploy checks and post-webhook-cutover checks for already accepted MVP backend flows
  - kept the slice docs-only
- Completed Deployment Slice 4:
  - added a controlled tester onboarding doc covering manual onboarding prerequisites, sequence, readiness checks, and narrow failure notes
  - kept the slice manual and did not introduce admin tooling or self-serve onboarding
- Completed Deployment Slice 5:
  - added a first-run ops notes doc covering minimal containment, basic rollback direction, and first production launch-window operator notes
  - kept the slice narrow and did not expand it into a full runbook or incident-management process

#### Accepted outputs
- Backend hardening Slice 3 completed and accepted.
- Backend hardening Slice 4 completed and accepted.
- Backend hardening Slice 5 completed and accepted.
- Deployment Slice 1 completed and accepted.
- Deployment Slice 2 completed and accepted.
- Deployment Slice 3 completed and accepted.
- Deployment Slice 4 completed and accepted.
- Deployment Slice 5 completed and accepted.
- The project now has a minimal operational pack for first production deployment and controlled Telegram dogfooding.

#### Deferred / not now
- broader logging standardization
- full rollback/runbook detail
- incident-management process design
- support-process design
- CI/CD rollback automation

#### Next step
Execute the first production path:
- prepare real production env/secrets
- deploy backend
- apply migrations
- confirm runtime readiness
- perform Telegram webhook cutover
- run production smoke verification
- onboard first controlled testers
