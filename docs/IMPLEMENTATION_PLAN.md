# Implementation Plan

## 1. Strategy

Build order:
**backend core -> first capture loop -> dictionary -> bot integration -> review loop -> app polish**

Do not start with mobile UI work before the backend core and bot/review loops are stable.
Do not start with OCR.
Do not start with billing flow UI.

## 2. Milestones

### Milestone 1 — Backend foundation
Includes:
- project scaffold
- DB connection
- migrations
- auth
- users/access model

**Outcome**
Auth-ready backend skeleton with DB and access model.

### Milestone 2 — First product value
Includes:
- text capture
- enrichment pipeline
- ready card response
- save vocabulary item
- dictionary list/details
- settings/preferences foundation

**Outcome**
User can add a word, get a card, store it, browse dictionary, and read/update core settings.

### Milestone 3 — Bot working flow
Includes:
- thin bot adapter
- bot capture integration

**Outcome**
Bot capture works against real backend and gives immediate value.

### Milestone 4 — Learning loop
Includes:
- review session generation
- MCQ answer flow
- learning state updates
- worker and scheduled jobs

**Outcome**
Daily review exists and works through bot.

### Milestone 5 — App usability + release prep
Includes:
- app screens
- search/filter UI
- manual add screen
- deployment hardening
- logs
- dogfooding-ready release

**Outcome**
Complete dogfooding-ready MVP.

Delivery note:
- the mobile app is a separate client project
- mobile implementation will be done in Antigravity
- a separate implementation chat will be used for mobile work
- backend API remains the shared system core

## 3. Detailed phase sequence

### Phase 0. Project foundation
**Deliverables**
- FastAPI app scaffold
- environment config
- DB connection
- migration setup
- Docker setup
- health endpoint

### Phase 1. Identity and access foundation
**Deliverables**
- user model
- user_access model
- learning_preferences model
- auth integration
- current user resolution
- access-state aware request context

### Phase 2. Vocabulary capture core
**Deliverables**
- raw_inputs
- vocabulary_items
- vocabulary_sources
- vocabulary_examples
- enrichment pipeline
- Qwen integration
- shared capture service

### Phase 3. Dictionary read model
**Deliverables**
- dictionary list queries
- item detail queries
- search
- filters

### Phase 4. Preferences and dictionary management
**Deliverables**
- learning_states logic
- learning preferences read/update including nullable `preferred_review_timezone` and `preferred_translation_language`
- nullable translation support in capture/read payloads while preserving existing response shape
- dictionary soft-delete command
- normal dictionary reads exclude soft-deleted items
- status visible in dictionary views

### Phase 5. Bot integration v1
**Deliverables**
- thin bot adapter
- user mapping between bot and backend account
- capture request wiring
- ready-card formatting for bot

### Phase 6. Review engine foundation
**Deliverables**
- review_sessions
- review_questions
- review_answers
- review generation service
- item eligibility logic
- question templates
- answer evaluation
- learning state update after answer
- narrow compatibility guards for deleted or untranslated items without broad review redesign

### Phase 7. Bot review flow
**Deliverables**
- bot flow for session start
- next question handling
- answer submission
- compact feedback
- session completion message

### Phase 8. Worker and scheduled jobs
**Deliverables**
- scheduled review runtime-state usage
- processing_jobs execution
- worker process
- retry logic
- scheduled review generation
- operational logs

Current status:
- scheduled daily review DB/runtime foundation is implemented
- callable scheduled runtime core is implemented for due-user selection, lease/claim handling, local-day idempotency, scheduled-session creation, runtime marker advancement, and Telegram delivery attempts for newly created scheduled sessions
- dedicated scheduled-review worker invocation is implemented with a 60-second loop, per-tick failure isolation, and minimal logging
- production Docker Compose wiring includes a separate worker service for scheduled review
- `processing_jobs` integration, generic job orchestration, and broader retry/operational-history work remain deferred follow-up work

### Phase 9. Mobile app client v1
**Deliverables**
- auth screens
- dictionary list screen
- search/filter UI
- card details screen
- manual add screen
- delete from dictionary action
- settings screen
- local cache for dictionary list and card details
- simple empty-state message and CTA for an empty dictionary

Delivery:
- implemented in Antigravity
- tracked as a separate client project
- built as a thin client over the shared backend API

### Phase 10. Hardening and release prep
**Deliverables**
- access gating enforcement basics
- error handling polish
- logging polish
- migration cleanup
- smoke test checklist
- deployment-ready config

## 4. Recommended first vertical slice

The first real slice should be:

- user logs in
- submits text
- backend creates raw input
- enrichment runs
- vocabulary item created
- examples stored
- learning state initialized
- ready card returned

This is the first real proof point of the entire product.

## 5. What not to build too early

Do not add too early:
- OCR
- billing UI
- app-side review UI
- complex SRS
- offline-first sync/conflict engine
- user-configurable review modes
- advanced analytics
- polished design system in the mobile client before backend flows are proven
- global/shared vocabulary model

## 6. MVP success criteria

You should be able to:
- create an account
- send a word through the bot
- immediately receive a ready card
- find it in the app dictionary
- add a new word manually in the app
- delete an item from the dictionary
- update `preferred_translation_language`
- complete a review session in the bot
- see statuses change over time
- use the system for several days without it falling apart
