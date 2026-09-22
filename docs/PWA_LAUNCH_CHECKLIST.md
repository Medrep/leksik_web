# PWA Launch Checklist

## Purpose

This is the single web PWA launch validation record. PWA-00 is complete, and PWA-01 implementation and static validation are complete. Required physical-device verification remains pending.

## Gates

| Gate | Status | Exit focus |
|---|---|---|
| PWA-00 — Launch Baseline and Documentation Alignment | Complete | Approved launch baseline and validation record exist. |
| PWA-01 — Installability Foundation | Implemented; device verification pending | Accepted manifest identity, start behavior, scope, standalone display, and assets. |
| PWA-02 — Installed Runtime Hardening | Planned / not implemented | Online-first installed runtime is hardened without private-data service-worker caching. |
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
| Physical iPhone/Safari installation | Pending. |
| Physical Android/Chrome installation | Pending. |

PWA-01 status: **IMPLEMENTED — DEVICE VERIFICATION PENDING**.

## Initial validation matrix

Run each check on one real iPhone using current supported Safari and one real Android phone using current supported Chrome, in both normal browser and installed standalone modes.

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

Static build checks do not replace this device launch gate. Current support is limited to the versions physically validated here; this checklist does not claim older mobile OS or browser support.

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
