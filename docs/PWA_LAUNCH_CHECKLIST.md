# PWA Launch Checklist

## Purpose

This is the single web PWA launch validation record. PWA-00 and PWA-01 have passed. PWA-02 implementation and static validation are complete; its broader browser/installed-runtime device verification remains pending.

## Gates

| Gate | Status | Exit focus |
|---|---|---|
| PWA-00 — Launch Baseline and Documentation Alignment | Complete | Approved launch baseline and validation record exist. |
| PWA-01 — Installability Foundation | Pass | Accepted manifest identity, start behavior, scope, standalone display, and assets. |
| PWA-02 — Installed Runtime Hardening | IMPLEMENTED — DEVICE/RUNTIME VERIFICATION PENDING | Online-first installed runtime is hardened without private-data service-worker caching. |
| PWA-03 — Minimal Installation UX | Planned / not implemented | Small installation-help presentation is available where appropriate. |
| PWA-04 — Final Real-Device Launch Gate | Planned / not executed | Required physical-device checks pass with recorded evidence. |

`ANDROID-01 — Optional Capacitor Android Distribution` is deferred and is not launch-blocking.

## PWA-01 static validation

| Check | Result |
|---|---|
| Native manifest route | Pass — `/manifest.webmanifest` builds and responds with `application/manifest+json`. |
| Install contract | Pass — `id: "/"`, `name` and `short_name: "Leksik"`, `start_url: "/dictionary"`, `scope: "/"`, `display: "standalone"`, both colors `#f7f3eb`, and `prefer_related_applications: false`. |
| Manifest icons | Pass — public PNG assets are 192×192 and 512×512 and respond without authentication or redirects. |
| Apple Home Screen support | Pass — the native Apple touch icon is a 180×180 PNG, and standalone-capable metadata uses the `Leksik` title and conservative `default` status-bar style. |
| Root metadata and viewport | Pass — title and application name are `Leksik`; manifest, icon, and theme-color output were inspected in the production build. Normal zoom remains enabled. |
| Maskable icon | Not included — current artwork has not been independently safe-zone-qualified; this remains non-blocking polish. |
| Online-first boundary | Pass — no service worker, offline behavior, caching layer, background synchronization, or push implementation was added. |
| Dependency boundary | Pass — `package.json` and `package-lock.json` are unchanged. |
| `git diff --check` | Pass. |
| TypeScript | Pass — `./node_modules/.bin/tsc --noEmit --incremental false`. |
| Production build | Pass — `npm run build` with Next.js 14.2.35. |
| Physical iPhone/Safari installation | Pass — physically verified in the installed PWA; device/version/date detail was not supplied for this record. |
| Physical Android/Chrome installation | Pass — physically verified in the installed PWA; device/version/date detail was not supplied for this record. |

PWA-01 status: **PASS**.

## PWA-02 implementation and validation record

| Check | Result |
|---|---|
| Authenticated backend browser cache safeguard | Implemented — the shared authenticated backend request path uses `cache: "no-store"`. |
| Dictionary denial and failure behavior | Implemented — 401/403 remove protected rendered data, 404 invalidates missing detail and list state, and transient failures show errors instead of treating cached data as current. |
| Mutation and account-boundary cleanup | Implemented — deletion invalidates item/list cache; backend revalidation is scoped to live owner/token/generation and coalesces equivalent concurrent refreshes, so stale or superseded refreshes cannot initiate destructive cleanup; authoritative rejection immediately revokes product state and exposes public sign-in only after the one valid current-owner Supabase cleanup attempt settles; a failed attempt leaves the owner blocked for the page lifecycle but may leave persisted session material for rejection after reload; account-deletion completions retain captured owner/token/generation identity, current-owner deletion `401` uses the tracked rejection lifecycle, and stale or already-covered deletion completions cannot launch unscoped sign-out or a second cleanup; backend-confirmed account deletion remains a separate synchronous owner-aware local ownership/cache revocation; normal sign-out retains its existing semantics; account transition blocks previous-user results. |
| Late-response protection | Implemented — list/detail commits require the live authenticated user, access token, route/query, and active request generation to remain current. |
| Local storage failure behavior | Implemented — unavailable, throwing, or malformed storage remains non-fatal to backend reads. |
| Telegram return behavior | Implemented — Settings coalesces a burst of visible/focus/page-show events and retains at most one pending follow-up when a request is already active, without polling or background synchronization. |
| Layout changes | None — source inspection did not establish a concrete layout defect requiring a PWA-02 change. |
| Dependency/service-worker boundary | Pass — no dependency, service worker, offline mode, or additional persistence layer was added. |
| `git diff --check` | Pass. |
| TypeScript | Pass — `./node_modules/.bin/tsc --noEmit --incremental false`. |
| Production build | Pass — single bounded `npm run build` attempt with Next.js 14.2.35. |
| Browser/device runtime matrix | Not executed in this implementation environment; the blank matrix below remains the required follow-up evidence. |
| External infrastructure caching | Not tested against a deployed origin; no infrastructure finding is asserted. |

Implementation inspection identified stale-cache masking, incomplete denial/missing-item invalidation, localStorage access/shape failure, late account-transition response risks, delayed post-deletion local revocation, a public-sign-in race with rejected-session cleanup, and duplicate return-event Telegram refreshes. Those code paths were corrected and statically revalidated. Controlled 401/403/404/network scenarios, cleanup success/failure, disposable-account deletion, Telegram handoff cases, and physical browser/standalone retests remain pending because this environment did not provide the required accounts, deployed origin, or devices.

## Initial validation matrix

Run each check on one real iPhone using current supported Safari and one real Android phone using current supported Chrome, in both normal browser and installed standalone modes.

The cells remain blank because the supplied PWA-01 PASS evidence did not include per-cell device, version, date, or retest detail. They are retained for the granular PWA-02/PWA-04 runs rather than being backfilled with assumptions.

| Check | iPhone browser | iPhone standalone | Android browser | Android standalone |
|---|---|---|---|---|
| Installation |  |  |  |  |
| Icon and name |  |  |  |  |
| Standalone launch |  |  |  |  |
| `/dictionary` start behavior |  |  |  |  |
| Signed-out entry |  |  |  |  |
| Signed-in entry |  |  |  |  |
| New-account and onboarding path |  |  |  |  |
| Session reopen and resume |  |  |  |  |
| Dictionary list, search, and details |  |  |  |  |
| Settings |  |  |  |  |
| Localization |  |  |  |  |
| Sign-out |  |  |  |  |
| Account switch |  |  |  |  |
| Direct routes and reload |  |  |  |  |
| Telegram completion |  |  |  |  |
| Dictionary deletion |  |  |  |  |
| Account deletion with disposable accounts |  |  |  |  |
| Network failure and reconnect |  |  |  |  |
| Mobile portrait and landscape |  |  |  |  |
| Keyboard-open forms |  |  |  |  |
| Safe area, notch, and home-indicator behavior |  |  |  |  |
| Modal reachability |  |  |  |  |
| Release update and reopen |  |  |  |  |

Static build checks do not replace this device launch gate. Current support claims are limited to the supplied current iPhone Safari and Android Chrome installed-PWA contexts; this checklist does not claim unrecorded older mobile OS or browser support.

## Evidence record template

Create one empty record per executed check or grouped test run:

| Field | Value |
|---|---|
| Candidate revision/build identifier |  |
| HTTPS origin |  |
| Date |  |
| Tester |  |
| Device model |  |
| OS version |  |
| Browser version |  |
| Browser or standalone context |  |
| Test result |  |
| Defect reference |  |
| Retest result |  |

Do not record passwords, authentication tokens, Telegram completion codes, private vocabulary, or personal account data in this checklist.
