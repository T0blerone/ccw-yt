# ccw-yt

Counter-Clockwise mindful session timer, dynamic duration-based feed filter, and distraction blocker for YouTube.

## Core Principles

- **Privacy #1:** 100% local state (`storage.local` & tab-scoped `sessionStorage`). Zero external servers, analytics, telemetry, remote fonts, CDNs, or network calls.
- **Minimal Permissions:** Strictly `"permissions": ["storage"]` and YouTube host permissions (`www.youtube.com`, `youtube.com`, and `m.youtube.com` -> `www.youtube.com` redirect). Leaves YouTube Music, Creator Studio, and third-party embedded videos untouched.
- **Zero-Build Source:** Plain Vanilla JS (ES2022+) and CSS inside `extension/`, loadable directly in Firefox and ready for single-zip Firefox Add-ons (AMO) submission without requiring a build reproduction bundle.

## Features

1. **Zero-Flash Full-Screen Entry Gate (`document_start`):**
   - Intercepts YouTube before a single thumbnail or video frame paints, suppressing background autoplay and global hotkeys while locked.
   - Smooth 5-minute stepper/slider (`5`–`120` min) + click-to-type inline minutes (`1`–`240` min).
   - **Direct Video Links (`/watch?v=...`):** Offers a focused *"Just Watch This Video"* single-video unlock without encouraging a full browsing session.
   - **Configurable Starting Screen:** Route bare `youtube.com` and Home/Logo clicks to *Home*, *Subscriptions*, *Search-Only*, *Watch Later*, *Library*, or *History*.
2. **Wall-Clock Countdown & Dynamic Duration Filtering:**
   - Filters feeds, search, channels, playlists, watch recommendations, and player endscreen tiles so only videos fitting within your remaining wall-clock budget appear (with zero-flash loading and a cursor hover-guard).
   - **Sparse-Feed Starvation Guard:** Prevents YouTube's `<ytd-continuation-item-renderer>` from looping infinite pagination requests when few short videos remain.
   - **Graceful `0:00` Expiry:** Idle tabs lock immediately at `0:00`, while an actively watched non-live `/watch` video is allowed to finish before locking.
3. **Distraction-Free Watch Page (Post-Video Reveal):**
   - Independently set **Watch-page recommendations** and **Comments** to *Reveal after video finishes*, *Always show*, or *Always hide*, centering the video player cleanly while recommendations are hidden.
4. **Playback Speed Discipline:**
   - Blocks YouTube's *"Hold for 2x Speed"* pointer and Spacebar gestures (`MAIN`-world `playbackRate` guard) while keeping click-to-pause, timeline scrubbing, single-tap Spacebar, and manual gear-menu speeds intact—plus an optional strict *1x speed lock*.
5. **Modular Site-Wide Distraction Controls:**
   - Hide Shorts (including redirecting `/shorts/ID` -> standard `/watch?v=ID`), control Thumbnails (*Normal* / *No hover previews* / *Blur* / *Hide*), disable Autoplay Next, clean up Left Sidebar clutter, hide Notification Bell & `(N)` tab badges, and hide Community posts, Playables, Merch shelves, End-screen walls, and Live Chat.

## Project Layout

- `extension/` — Self-contained WebExtension directory (Manifest V3, Firefox 128+ ready out of the box).
  - `manifest.json` — Firefox MV3 manifest (`strict_min_version: "128.0"`, `"data_collection_permissions": { "required": ["none"] }`).
  - `icons/` — Vector master (`icon.svg`) and multi-resolution PNG icons (`16`, `32`, `48`, `96`, `128`).
  - `src/shared/`
    - `ext.js` — Cross-browser `browser ?? chrome` runtime alias & message constants.
    - `icons.js` — Verbatim MIT-licensed `@phosphor-icons/core` SVG helper.
    - `state.js` — Schema-versioned `storage.local` session & settings engine.
    - `settings-panel.js` — Shared 4-tab Settings UI mounted both in-page on YouTube and in `options.html`.
  - `src/background/index.js` — Event-driven MV3 background listener for `openOptionsPage()`.
  - `src/content/`
    - `redirect-mobile.js` — Synchronous `m.youtube.com` -> `www.youtube.com` redirect.
    - `speed-guard-main.js` — `MAIN`-world `HTMLMediaElement.prototype.playbackRate` guard.
    - `cloak.css` — Synchronous `document_start` cloak, zero-flash pending card rules, and distraction CSS.
    - `tab-allowance.js` — Per-tab single-video & `0:00` overtime state resolver.
    - `media-guard.js` — Locked-state autoplay/hotkey blocker & ad-aware playback detector.
    - `entry-gate.js` — Isolated Shadow DOM Entry Gate & in-page Settings host.
    - `search-only.js` — Centered Search-Only home view.
    - `hud.js` — Calm top-bar remaining-time pill & quick-action popover.
    - `feed-filter.js` — Dynamic duration card parser, hider, and continuation starvation guard.
    - `watch-guard.js` — Over-budget & live-stream `/watch` playback notice.
    - `watch-focus.js` — Post-video reveal & smart watch-page centering controller.
    - `distractions.js` — Shorts `/watch` redirector, Autoplay-off enforcer, and title badge sanitizer.
    - `bootstrap.js` — Content script coordinator & SPA lifecycle wiring.
  - `src/popup/` — Toolbar popup (`popup.html`, `popup.css`, `popup.js`).
  - `src/options/` — Standalone Options page (`options.html`, `options.css`, `options.js`).
- `scripts/build-manifests.mjs` — Zero-dependency script generating `dist/firefox`, `dist/chrome`, and `dist/safari-webext`.

## Local Development & Packaging

### Load Directly in Firefox (`about:debugging`)
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `extension/manifest.json`.

### CLI Tooling (`web-ext` & Static Checks)
```sh
npm install
npm start            # Launch Firefox with extension/ loaded
npm run check        # Run JSDoc / TypeScript static verification
npm run lint         # Run Mozilla's AMO web-ext linter
npm run package:amo  # Build single-zip AMO release in web-ext-artifacts/
npm run build:manifests # Generate dist/firefox, dist/chrome, and dist/safari-webext
```
