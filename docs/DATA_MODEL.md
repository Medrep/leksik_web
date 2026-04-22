# Data Model

## 1. Design principles

- One product core, two clients
- Raw input is not the same as vocabulary item
- Vocabulary item is not the same as learning state
- Review execution is a separate layer
- Payment and OCR boundaries must exist from day one

## 2. Core domain entities

### User
Account owner and top-level ownership boundary.

### UserAccess
Stores current access state:
- free
- trial
- paid
- inactive

### LearningPreference
Stores user review and card-display preferences such as:
- daily review enabled
- daily review target count
- preferred review time
- preferred review timezone
- preferred_translation_language

### MessagingIdentity
Stores an observed messaging-provider identity such as a Telegram account.

### MessagingLink
Stores backend-owned link state between an observed messaging identity and a product user:
- pending
- linked
- conflict

### RawInput
Stores the original captured input from:
- bot
- app
- future OCR channel

### RawInputCandidate
Optional candidate extracted from raw input.
Mostly useful for future OCR or ambiguous snippets.

### VocabularyItem
Normalized dictionary unit for one user:
- word
- phrase

Also carries the current active/deleted dictionary visibility state used by the soft-delete behavior.

### VocabularySource
Links a vocabulary item to the original raw input and context.

### VocabularyExample
Stores exactly three examples attached to a vocabulary item.

### VocabularyTag / VocabularyItemTag
Optional tag system for labels such as:
- spoken
- formal
- business
- casual
- common

### LearningState
Stores user learning progress for one vocabulary item:
- new
- learning
- known
- archived

### ReviewSession
Stores one review session for one user.
Distinguishes manual vs scheduled origin and can store a scheduled local-date reference for scheduled-session traceability.
Manual sessions remain independent from scheduled runtime markers.

### ScheduledReviewRuntime
Stores one row per user for scheduled-review operational state:
- next due time
- claim lease expiry and owner
- last scheduled local date
- last scheduled session reference
This table stores runtime state, not user configuration or delivery-attempt history.

### ReviewQuestion
Stores one question snapshot inside a session.

### ReviewAnswer
Stores the user’s answer to a review question.

### ReviewFeedbackSignal
Future/optional structure for:
- easy
- hard
- later

### ProcessingJob
Stores queued background work:
- enrichment
- review generation
- future OCR
- future billing sync

### MediaAsset
Future OCR file asset.

### OCRExtraction
Future OCR text result.

### BillingEvent
Future billing webhook/event log.

## 3. Most important separation rules

- A raw input is not a finished learning unit.
- A vocabulary item is content.
- A learning state is progress on that content.
- A review question is a snapshot of a specific testing moment.
- An observed messaging identity is not the same as a confirmed product-user link.

## 4. Relational schema draft

### Included in MVP
- `users`
- `user_access`
- `learning_preferences`
- `messaging_identities`
- `messaging_links`
- `raw_inputs`
- `vocabulary_items`
- `vocabulary_sources`
- `vocabulary_examples`
- `learning_states`
- `review_sessions`
- `scheduled_review_runtime`
- `review_questions`
- `review_answers`
- `processing_jobs`

### Optional in MVP if easy
- `vocabulary_tags`
- `vocabulary_item_tags`

### Planned but not implemented yet
- `raw_input_candidates`
- `review_feedback_signals`
- `media_assets`
- `ocr_extractions`
- `billing_events`

## 5. Minimal MVP table roles

### users
Stores product user identity.

### user_access
Stores access state for billing readiness.

### learning_preferences
Stores review preferences, `preferred_review_timezone`, and `preferred_translation_language`.

### messaging_identities
Stores observed provider identities and provider-side profile metadata.
For Telegram-first completion in the current slice, this table also carries the minimal backend-owned one-time completion code artifact and its issuance / expiry timestamps.

### messaging_links
Stores canonical backend-owned link state between a provider identity and a product user.

### raw_inputs
Stores raw capture events and processing status.

### vocabulary_items
Stores the main normalized dictionary units and their soft-delete visibility state.

### vocabulary_sources
Links vocabulary items to original input/context.

### vocabulary_examples
Stores usage examples for a vocabulary item.

### learning_states
Stores current learning status and review metadata.

### review_sessions
Stores one generated review session.
Stores whether the session was manual or scheduled, and stores the scheduled local date for scheduled-session traceability.

### scheduled_review_runtime
Stores per-user scheduled-review runtime state for due-user lookup, lease/claim protection, local-date anti-duplicate checks, and next-due advancement.

### review_questions
Stores each question within a session.

### review_answers
Stores the selected answer and correctness.

### processing_jobs
Stores queued background tasks.

## 6. Important relational decisions

### Why raw_inputs and vocabulary_items are separate
Because one user input is not always equal to one final dictionary unit.

### Why examples are separate rows
Because examples are easier to manage, extend, and reorder that way.

### Why learning_states are separate
Because dictionary content and memorization progress are different domains.

### Why dictionary delete is soft delete
Because dictionary removal in MVP should hide an item from normal reads and review without immediately destroying the stored record.

### Why messaging_identities and messaging_links are separate
Because observing a Telegram account is not the same as confirming ownership linkage to a product user.

### Why review_questions store snapshots
Because review history must not break when the current card content changes later.

### Why scheduled_review_runtime is separate from learning_preferences
Because preferences are user configuration, while due-time and local-date anti-duplicate markers are operational scheduler state.
Review history stays in `review_sessions`; scheduled operational state stays in `scheduled_review_runtime`.

## 7. Recommended MVP modeling position

- Keep vocabulary items user-scoped in MVP
- Do not build a shared global lexicon yet
- Do not over-tighten dedup constraints too early
- Keep retention strategy in mind for raw input from day one
- Treat translation as optional stored card content driven by `preferred_translation_language` and omitted when the source language already matches that preference
- Do not eagerly regenerate old cards when `preferred_translation_language` changes
- Keep one linked provider account per user/provider in MVP and treat reassignment as conflict/manual resolution
