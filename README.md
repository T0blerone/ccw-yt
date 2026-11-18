# ccw-yt

Counter-Clockwise mindful session timer and dynamic duration-based feed filter for YouTube.

## Core Principles

- **Privacy #1:** 100% local state (`storage.local`). Zero external servers, analytics, telemetry, remote fonts, or network calls.
- **Minimal Permissions:** Strictly `storage` and YouTube host permissions (`www.youtube.com`, `youtube.com`, and `m.youtube.com` -> `www.youtube.com` redirect). Leaves YouTube Music, Creator Studio, and third-party embedded videos untouched.
- **Zero-Build Source:** Plain Vanilla JS (ES2022+) and CSS inside `extension/`, loadable directly in Firefox and ready for single-zip AMO submission.

## Project Layout

- `extension/` — Self-contained WebExtension directory (Manifest V3, Firefox-ready out of the box).
  - `manifest.json` — Firefox MV3 manifest (`strict_min_version: "128.0"`).
  - `icons/` — Local SVG and PNG icons.
  - `src/shared/` — Cross-browser API alias (`ext.js`) and shared state/constants.
  - `src/background/` — Event-driven MV3 background script.
  - `src/content/` — `document_start` mobile redirect and main YouTube content scripts.
  - `src/popup/` — Toolbar action popup.
  - `src/options/` — Full-tab extension settings page (`options_ui`).
- `scripts/build-manifests.mjs` — Zero-dependency helper that generates `dist/firefox`, `dist/chrome`, and `dist/safari-webext` with browser-specific `manifest.json` `background` fields.

## Local Development (Firefox)

### Option A: Zero-install (`about:debugging`)
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `extension/manifest.json`.

### Option B: With `web-ext` (auto-reload & AMO linting)
```sh
npm install
npm start        # Launches Firefox with extension/ loaded
npm run lint     # Runs Mozilla's AMO web-ext linter
npm run check    # Runs JSDoc static type checking
```

## Cross-Browser Packaging (Chrome & Safari)

```sh
npm run build:manifests
```
- **Chrome:** Load `dist/chrome` unpacked at `chrome://extensions` (Developer Mode).
- **Safari (macOS):** Run `xcrun safari-web-extension-converter dist/safari-webext` to generate the local Xcode wrapper.
