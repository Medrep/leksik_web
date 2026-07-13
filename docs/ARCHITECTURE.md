# Architecture v1

## 1. Architecture goal

Build a **backend-first MVP** with a primary bot flow and thin client surfaces:
- **bot client** — capture + daily review
- **mobile app client** — auth + dictionary + manual add + delete from dictionary + settings
- **narrow web client** — auth + dictionary read + settings

The system must:
- accept words and phrases
- immediately return a ready card
- store a user dictionary
- run daily mini-quizzes
- support shared user settings/preferences across clients where applicable
- be ready for future payment and OCR

## 2. Architecture style

### Chosen style
**Modular monolith**

That means:
- one backend codebase
- one Postgres database
- one worker codebase/process
- logical separation into application modules

This is the recommended MVP architecture because it is simple enough for AI-assisted implementation and clean enough to grow later.

## 3. Core components

### Mobile app client
Responsibilities:
- auth
- dictionary list
- search
- filter by language
- filter by learning status
- card details
- manual add
- delete from dictionary
- settings screen
- local cache for dictionary list and card details

Delivery:
- the mobile app is a separate client project
- mobile implementation is done in Antigravity
- mobile remains a thin client over the shared backend API

### Narrow web client
Responsibilities:
- auth entry
- dictionary list
- card details
- settings screen
- shared use of backend settings/preferences endpoints where applicable

Web localization boundary:
- the web client owns its typed message bundles; backend and web share locale identifiers only
- one globally mounted locale runtime owns both public and authenticated web surfaces
- before authentication, effective locale resolves in this order: supported browser locale, then English
- after authenticated preferences are confirmed, effective locale resolves in this order: saved `ui_locale`, supported browser locale, then English
- browser-derived locale is transient and is never persisted automatically
- localized coverage includes landing, public authentication and recovery, public Telegram completion, Settings, the shared authenticated shell, Dictionary List, Dictionary Details, and the authenticated language-preferences onboarding gate in `en`, `pl`, `ru`, and `uk`
- locale-neutral readiness states keep server and first-client markup compatible while browser locale or current-user preferences are being resolved
- sign-out discards user-bound locale input and returns public UI to the already resolved transient browser locale
- authenticated bootstrap and preference responses are guarded against stale-session commits
- Supabase and arbitrary backend errors remain external pass-through text rather than web-owned translations
- product vocabulary content remains backend-owned data and is never translated by the web localization runtime
- root `<html lang="en">` and static English metadata remain intentional document-boundary limitations; route locale prefixes, server locale cookies, and request-based locale propagation are not used
- no third-party internationalization dependency is used

### Bot client
Responsibilities:
- receive user text
- send capture requests to backend
- display ready card
- deliver review questions
- submit answers
- show compact feedback

### Backend API (FastAPI)
Main product core.
Responsibilities:
- auth-aware API
- vocabulary capture
- dictionary read API
- dictionary soft delete
- preferences read/update
- review answer submission
- access checks
- orchestration of synchronous flows

### Worker process
Responsibilities:
- processing jobs
- enrichment jobs
- daily review generation
- retries
- future OCR jobs
- future billing sync jobs

### Database (Postgres)
Source of truth for:
- users
- access states
- raw inputs
- vocabulary items
- examples
- learning states
- review sessions/questions/answers
- processing jobs

### Auth provider
**Supabase Auth**

### Storage
**Supabase Storage**

### LLM provider
**Qwen API**

Used only for:
- structured enrichment
- translation when `preferred_translation_language` is set and differs from the source language
- short explanation in the source word language
- examples
- canonicalization support

Not used for:
- learning state logic
- scheduling
- review scoring
- access logic

## 4. Backend modules

### Identity & Access
Handles:
- current user context
- access state
- review, timezone, and translation preferences
- future billing-ready entitlement checks

### Vocabulary Intake
Handles:
- raw text capture from bot/app
- raw input creation
- handoff into enrichment pipeline

### Enrichment
Handles:
- normalization
- word vs phrase classification
- translation when `preferred_translation_language` is set and differs from the source language
- short explanation in the source word language
- examples
- vocabulary item creation/update
- source linkage

### Dictionary
Handles:
- list
- details
- search
- filters
- soft-delete exclusion from normal reads

### Learning State
Handles:
- initialize state for new item
- automatic status updates
- exclusion of deleted items from active learning/review
- next-review metadata basics

### Review
Handles:
- eligible item selection
- review session generation
- scheduled/manual review session origin metadata
- question generation
- answer evaluation
- learning state updates

### Scheduled Review Runtime
Handles:
- callable backend runtime service for scheduled daily review processing
- per-user scheduled-review due-time state
- scheduler claim/lease state
- scheduled local-date anti-duplicate markers
- scheduled-session traceability markers

### Job Processing
Handles:
- queued jobs
- retries
- scheduled execution

### Billing Access
Handles:
- access checks
- plan/access-state compatibility

### OCR boundary
Planned, not implemented in MVP.

## 5. Runtime shape

### Process 1 — API server
Serves:
- app requests
- bot requests
- auth-aware product operations

### Process 2 — worker
Runs:
- enrichment jobs
- review generation jobs
- retries
- scheduled tasks

Both can be built from the same repository and the same Docker image with different start commands.

Current scheduled-review implementation note:
- the backend has a callable scheduled runtime core for due-user selection, lease/claim handling, local-day idempotency, scheduled-session creation, runtime marker advancement, and Telegram delivery attempts for newly created scheduled sessions
- a dedicated worker invocation loop exists and production Docker Compose wiring runs it as a separate service from the API
- `processing_jobs` integration and generic worker/job orchestration remain deferred

## 6. Main end-to-end flows

### Bot capture flow
1. User sends word/phrase to bot
2. Bot sends request to backend
3. Backend authenticates/maps user
4. Vocabulary Intake creates `raw_input`
5. Enrichment processes input
6. Vocabulary item is created or matched
7. Examples and source are stored
8. Learning state is initialized if needed
9. Backend returns ready card payload
10. Bot displays card

### App manual add flow
1. User enters word/phrase in app
2. App sends request to backend
3. Backend creates `raw_input`
4. Enrichment runs
5. Vocabulary item is created/updated
6. Learning state initialized if needed
7. Backend returns ready card
8. App shows result

### Dictionary browsing flow
1. App requests dictionary list
2. Client may use local cache for dictionary list/details as a read optimization only
3. Backend remains the source of truth and loads user-scoped non-deleted items
4. Filters/search applied
5. Response returned to app

### Daily review generation flow
1. Scheduler/worker invocation calls the scheduled runtime core for users eligible for review
2. Scheduled Review Runtime claims due users with a short lease
3. Review module loads eligible learning states
4. At most one scheduled review session is created per user local day
5. Runtime markers are advanced so repeated ticks do not duplicate or hot-loop
6. Telegram delivery is attempted only for newly created scheduled sessions

### Review answer flow
1. Bot sends selected answer to backend
2. Review module evaluates answer
3. Review answer is stored
4. Learning State module updates item state
5. Backend returns compact feedback
6. Bot shows feedback and moves to next question

## 7. Synchronous vs asynchronous behavior

### Synchronous user-facing flows
- capture from bot
- manual add from app
- dictionary reads
- dictionary soft delete
- settings/preferences updates
- review answer submission

### Asynchronous internal flows
- retries after failed enrichment
- daily review generation
- future OCR processing
- future billing event processing

### Important UX rule
After capture, the user must receive a ready card immediately.

So MVP behavior should be:
- create raw input
- run enrichment in-request with controlled timeout
- if successful, return ready card immediately
- if not, fail gracefully and schedule retry

## 8. Question generation approach

Chosen approach:
**Template-based MCQ generation**

Backend owns question assembly.

Supported MVP question types:
- choose the correct meaning
- choose the correct word/phrase by meaning
- choose the correct option in context

LLM provides structured card content, but the backend owns review logic.

## 9. Security and data handling baseline

- all user data is user-scoped
- access checks happen server-side
- bot messages must map to authenticated user identity
- raw input should not be retained forever without purpose
- future OCR uploads should follow minimal-retention approach
- account deletion / full data deletion should be planned from the start

## 10. Final architecture statement

MVP v1 is a backend-first modular monolith built on FastAPI and Postgres, with a shared product core serving two clients (bot and mobile app), a separate worker process for enrichment and review generation, Qwen used only for structured card enrichment, and architecture boundaries prepared from day one for future billing and OCR.

The mobile app is a separate client project implemented in Antigravity and remains a thin client over the shared backend API.
