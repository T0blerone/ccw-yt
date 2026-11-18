(() => {
  const { icons, state, settingsPanel } = CCW;

  const HOST_ID = "ccw-yt-gate-host";

  const GATE_STYLES = `
    :host {
      all: initial;
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      display: block !important;
    }

    :host([hidden]) {
      display: none !important;
    }

    * {
      box-sizing: border-box;
    }

    [hidden] {
      display: none !important;
    }

    .gate {
      --bg: #f8f9fb;
      --surface: #ffffff;
      --surface-hover: #eef1f6;
      --input-bg: #f8f9fb;
      --fg: #141820;
      --muted: #646e7e;
      --subtle: #8b95a5;
      --border: #dfe4ec;
      --accent: #f06449;
      --track: #dfe4ec;
      --primary-bg: #141820;
      --primary-fg: #ffffff;

      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    .gate[data-view="settings"] {
      justify-content: flex-start;
      padding-top: 48px;
      padding-bottom: 48px;
    }

    .gate[data-theme="dark"] {
      --bg: #0f0f0f;
      --surface: #1a1d24;
      --surface-hover: #242933;
      --input-bg: #11141a;
      --fg: #f3f5f8;
      --muted: #98a2b3;
      --subtle: #697386;
      --border: #2b303c;
      --accent: #f2755d;
      --track: #2b303c;
      --primary-bg: #f3f5f8;
      --primary-fg: #0f0f0f;
    }

    .gate__settings-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
    }

    .gate__settings-btn:hover,
    .gate__settings-btn:focus-visible {
      background: var(--surface);
      border-color: var(--border);
      color: var(--fg);
      outline: none;
    }

    .gate__center {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 28px;
    }

    .gate__settings-wrap {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .gate__eyebrow {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .gate__readout {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 10px;
      cursor: text;
    }

    .gate__minutes-input {
      appearance: none;
      border: none;
      border-bottom: 2px solid transparent;
      outline: none;
      background: transparent;
      padding: 0 0 2px;
      margin: 0;
      width: 2ch;
      text-align: right;
      color: var(--fg);
      font-family: inherit;
      font-size: 68px;
      font-weight: 650;
      line-height: 1;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      caret-color: var(--accent);
      transition: border-color 140ms ease;
    }

    .gate__readout:hover .gate__minutes-input {
      border-bottom-color: var(--border);
    }

    .gate__minutes-input:focus {
      border-bottom-color: var(--accent);
    }

    .gate__minutes-unit {
      font-size: 24px;
      font-weight: 500;
      color: var(--muted);
    }

    .gate__slider-row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .gate__step-btn {
      appearance: none;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 120ms ease, transform 80ms ease;
    }

    .gate__step-btn:hover {
      background: var(--surface-hover);
    }

    .gate__step-btn:active {
      transform: scale(0.96);
    }

    .gate__step-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .gate__slider {
      flex: 1;
      appearance: none;
      -webkit-appearance: none;
      height: 6px;
      border-radius: 999px;
      background: var(--track);
      outline: none;
      cursor: pointer;
    }

    .gate__slider::-moz-range-track {
      height: 6px;
      border-radius: 999px;
      background: var(--track);
    }

    .gate__slider::-moz-range-progress {
      height: 6px;
      border-radius: 999px;
      background: var(--accent);
    }

    .gate__slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: var(--accent);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.28);
      cursor: pointer;
    }

    .gate__slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: var(--accent);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.28);
      cursor: pointer;
    }

    .gate__primary-btn {
      appearance: none;
      border: none;
      border-radius: 999px;
      padding: 13px 32px;
      background: var(--primary-bg);
      color: var(--primary-fg);
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      cursor: pointer;
      transition: opacity 140ms ease, transform 80ms ease;
    }

    .gate__primary-btn:hover {
      opacity: 0.9;
    }

    .gate__primary-btn:active {
      transform: scale(0.98);
    }

    .gate__primary-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }

    .gate__video-title {
      margin: 0;
      max-width: 520px;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.4;
      color: var(--fg);
      user-select: text;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .gate__video-title[data-placeholder="true"] {
      color: var(--muted);
      font-weight: 500;
      font-size: 16px;
    }

    .gate__cooldown-icon {
      color: var(--accent);
      display: inline-flex;
    }

    .gate__cooldown-time {
      font-size: 56px;
      font-weight: 650;
      line-height: 1;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
    }

    .gate__cooldown-note {
      margin: 0;
      font-size: 14px;
      color: var(--muted);
    }

    .gate__bottom-note {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
    }

    .gate__subtle-btn {
      appearance: none;
      border: none;
      background: transparent;
      padding: 6px 10px;
      color: var(--subtle);
      font-family: inherit;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: color 140ms ease;
    }

    .gate__subtle-btn:hover,
    .gate__subtle-btn:focus-visible {
      color: var(--muted);
      text-decoration: underline;
      outline: none;
    }

    ${settingsPanel.STYLES}
  `;

  /** @type {HTMLDivElement | null} */
  let hostEl = null;
  /** @type {HTMLDivElement | null} */
  let rootContainer = null;
  /** @type {HTMLButtonElement | null} */
  let settingsGearBtn = null;
  /** @type {HTMLDivElement | null} */
  let timerView = null;
  /** @type {HTMLDivElement | null} */
  let videoView = null;
  /** @type {HTMLDivElement | null} */
  let cooldownView = null;
  /** @type {HTMLDivElement | null} */
  let settingsView = null;
  /** @type {HTMLInputElement | null} */
  let minutesInput = null;
  /** @type {HTMLInputElement | null} */
  let minutesSlider = null;
  /** @type {HTMLParagraphElement | null} */
  let videoTitleEl = null;
  /** @type {HTMLDivElement | null} */
  let cooldownTimeEl = null;
  /** @type {HTMLButtonElement | null} */
  let switchToSessionBtn = null;
  /** @type {HTMLButtonElement | null} */
  let backToVideoBtn = null;

  /**
   * @type {{
   *   onStartTimedSession: (minutes: number) => Promise<void>;
   *   onGrantSingleVideo: (videoId: string) => void;
   *   onSettingsOverlayVisibilityChange?: (open: boolean) => void;
   * } | null}
   */
  let gateCallbacks = null;

  /** @type {CCWTabResolution | null} */
  let latestResolution = null;
  let selectedMinutes = 20;
  let forceTimerOnVideo = false;
  let showingSettings = false;
  let wasLockedVisible = false;
  /** @type {string | null} */
  let activeVideoId = null;

  /**
   * Extracts clean plain-text video title from YouTube's `<title>` without thumbnails.
   *
   * @returns {string | null}
   */
  function extractPlainVideoTitle() {
    const raw = (document.title || "").trim();
    if (!raw) return null;
    const stripped = raw
      .replace(/^\(\d+\)\s*/, "")
      .replace(/\s*-\s*YouTube$/i, "")
      .trim();
    if (!stripped || stripped.toLowerCase() === "youtube") {
      return null;
    }
    return stripped;
  }

  function refreshVideoTitleDisplay() {
    if (!videoTitleEl) return;
    const title = extractPlainVideoTitle();
    if (title) {
      videoTitleEl.textContent = title;
      delete videoTitleEl.dataset.placeholder;
    } else {
      videoTitleEl.textContent = "Direct video link";
      videoTitleEl.dataset.placeholder = "true";
    }
  }

  function syncTheme() {
    if (!rootContainer) return;
    const htmlDark = document.documentElement?.hasAttribute("dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    rootContainer.dataset.theme = htmlDark || prefersDark ? "dark" : "light";
  }

  /**
   * @param {number} mins
   */
  function setSelectedMinutes(mins) {
    const clamped = Math.max(1, Math.min(240, Math.round(mins)));
    selectedMinutes = clamped;

    if (minutesInput && hostEl?.shadowRoot?.activeElement !== minutesInput) {
      minutesInput.value = String(clamped);
      minutesInput.style.width = `${Math.max(1, String(clamped).length)}ch`;
    }
    if (minutesSlider) {
      minutesSlider.value = String(Math.max(5, Math.min(120, clamped)));
    }
  }

  /**
   * @param {-1 | 1} direction
   */
  function stepByFive(direction) {
    const next =
      direction > 0
        ? Math.floor(selectedMinutes / 5) * 5 + 5
        : Math.ceil(selectedMinutes / 5) * 5 - 5;
    setSelectedMinutes(Math.max(5, Math.min(120, next)));
  }

  function openSettings() {
    ensureMounted();
    showingSettings = true;
    if (latestResolution) {
      update(latestResolution);
    } else if (hostEl) {
      hostEl.hidden = false;
      renderSubView("locked");
    }
    gateCallbacks?.onSettingsOverlayVisibilityChange?.(true);
  }

  function closeSettings() {
    if (!showingSettings) return;
    showingSettings = false;
    if (latestResolution) {
      update(latestResolution);
    }
    gateCallbacks?.onSettingsOverlayVisibilityChange?.(false);
  }

  function ensureMounted() {
    if (hostEl && hostEl.isConnected) return;
    if (!document.documentElement) return;

    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.id = HOST_ID;
      hostEl.hidden = true;

      const shadow = hostEl.attachShadow({ mode: "open" });

      shadow.addEventListener("keydown", (ev) => {
        const ke = /** @type {KeyboardEvent} */ (ev);
        if (ke.key === "Escape" && showingSettings) {
          ke.preventDefault();
          ke.stopPropagation();
          closeSettings();
          return;
        }
        if (!ke.metaKey && !ke.ctrlKey && !ke.altKey) {
          ev.stopPropagation();
        }
      });

      for (const evtName of ["keypress", "keyup"]) {
        shadow.addEventListener(evtName, (ev) => {
          const ke = /** @type {KeyboardEvent} */ (ev);
          if (!ke.metaKey && !ke.ctrlKey && !ke.altKey) {
            ev.stopPropagation();
          }
        });
      }

      const styleEl = document.createElement("style");
      styleEl.textContent = GATE_STYLES;

      rootContainer = document.createElement("div");
      rootContainer.className = "gate";

      settingsGearBtn = document.createElement("button");
      settingsGearBtn.type = "button";
      settingsGearBtn.className = "gate__settings-btn";
      settingsGearBtn.title = "Settings";
      settingsGearBtn.setAttribute("aria-label", "Settings");
      settingsGearBtn.appendChild(icons.create("gear", 22));
      settingsGearBtn.addEventListener("click", () => {
        openSettings();
      });

      // --- 1. Timer View ---
      timerView = document.createElement("div");
      timerView.className = "gate__center";

      const timerEyebrow = document.createElement("p");
      timerEyebrow.className = "gate__eyebrow";
      timerEyebrow.textContent = "How long do you want to watch?";

      const readoutLabel = document.createElement("label");
      readoutLabel.className = "gate__readout";

      minutesInput = document.createElement("input");
      minutesInput.type = "text";
      minutesInput.inputMode = "numeric";
      minutesInput.className = "gate__minutes-input";
      minutesInput.value = "20";
      minutesInput.setAttribute("aria-label", "Session duration in minutes");

      const minutesUnit = document.createElement("span");
      minutesUnit.className = "gate__minutes-unit";
      minutesUnit.textContent = "min";

      readoutLabel.append(minutesInput, minutesUnit);

      const sliderRow = document.createElement("div");
      sliderRow.className = "gate__slider-row";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "gate__step-btn";
      minusBtn.setAttribute("aria-label", "Decrease by 5 minutes");
      minusBtn.appendChild(icons.create("minus", 18));
      minusBtn.addEventListener("click", () => stepByFive(-1));

      minutesSlider = document.createElement("input");
      minutesSlider.type = "range";
      minutesSlider.className = "gate__slider";
      minutesSlider.min = "5";
      minutesSlider.max = "120";
      minutesSlider.step = "5";
      minutesSlider.value = "20";
      minutesSlider.setAttribute("aria-label", "Duration slider");
      minutesSlider.addEventListener("input", () => {
        if (minutesSlider) setSelectedMinutes(Number(minutesSlider.value));
      });

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "gate__step-btn";
      plusBtn.setAttribute("aria-label", "Increase by 5 minutes");
      plusBtn.appendChild(icons.create("plus", 18));
      plusBtn.addEventListener("click", () => stepByFive(1));

      sliderRow.append(minusBtn, minutesSlider, plusBtn);

      const startBtn = document.createElement("button");
      startBtn.type = "button";
      startBtn.className = "gate__primary-btn";
      startBtn.textContent = "Start Session";
      startBtn.addEventListener("click", () => {
        gateCallbacks?.onStartTimedSession(selectedMinutes);
      });

      minutesInput.addEventListener("focus", () => {
        minutesInput?.select();
      });
      minutesInput.addEventListener("input", () => {
        if (!minutesInput) return;
        const digits = minutesInput.value.replace(/\D+/g, "").slice(0, 3);
        minutesInput.value = digits;
        minutesInput.style.width = `${Math.max(1, digits.length)}ch`;
        if (digits.length > 0) {
          const parsed = Math.max(1, Math.min(240, Number(digits)));
          selectedMinutes = parsed;
          if (minutesSlider) {
            minutesSlider.value = String(Math.max(5, Math.min(120, parsed)));
          }
        }
      });
      minutesInput.addEventListener("blur", () => {
        if (!minutesInput) return;
        const parsed = Number(minutesInput.value);
        setSelectedMinutes(
          Number.isFinite(parsed) && parsed >= 1 ? parsed : selectedMinutes
        );
      });
      minutesInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          minutesInput?.blur();
          gateCallbacks?.onStartTimedSession(selectedMinutes);
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (minutesInput) {
            minutesInput.value = String(selectedMinutes);
            minutesInput.blur();
          }
        }
      });

      timerView.append(timerEyebrow, readoutLabel, sliderRow, startBtn);

      // --- 2. Direct Video View (`/watch?v=...`) ---
      videoView = document.createElement("div");
      videoView.className = "gate__center";
      videoView.hidden = true;

      videoTitleEl = document.createElement("p");
      videoTitleEl.className = "gate__video-title";
      videoTitleEl.textContent = "Direct video link";
      videoTitleEl.dataset.placeholder = "true";

      const watchSingleBtn = document.createElement("button");
      watchSingleBtn.type = "button";
      watchSingleBtn.className = "gate__primary-btn";
      watchSingleBtn.appendChild(icons.create("play", 16));
      const watchBtnText = document.createElement("span");
      watchBtnText.textContent = "Just Watch This Video";
      watchSingleBtn.appendChild(watchBtnText);
      watchSingleBtn.addEventListener("click", () => {
        if (activeVideoId) {
          gateCallbacks?.onGrantSingleVideo(activeVideoId);
        }
      });

      videoView.append(videoTitleEl, watchSingleBtn);

      // --- 3. Cooldown View ---
      cooldownView = document.createElement("div");
      cooldownView.className = "gate__center";
      cooldownView.hidden = true;

      const cdIcon = document.createElement("span");
      cdIcon.className = "gate__cooldown-icon";
      cdIcon.appendChild(icons.create("clock-counter-clockwise", 32));

      cooldownTimeEl = document.createElement("div");
      cooldownTimeEl.className = "gate__cooldown-time";
      cooldownTimeEl.textContent = "0:00";

      const cdNote = document.createElement("p");
      cdNote.className = "gate__cooldown-note";
      cdNote.textContent = "Post-session cooldown active";

      cooldownView.append(cdIcon, cooldownTimeEl, cdNote);

      // --- 4. In-Page Settings View ---
      settingsView = document.createElement("div");
      settingsView.className = "gate__settings-wrap";
      settingsView.hidden = true;

      settingsPanel.mount(settingsView, {
        backLabel: "Back",
        onBack: () => closeSettings(),
        onSettingsChanged: (updated) => {
          setSelectedMinutes(updated.defaultMinutes);
        },
      });

      // --- Subtle bottom switcher on `/watch?v=...` ---
      const bottomBar = document.createElement("div");
      bottomBar.className = "gate__bottom-note";

      switchToSessionBtn = document.createElement("button");
      switchToSessionBtn.type = "button";
      switchToSessionBtn.className = "gate__subtle-btn";
      switchToSessionBtn.textContent = "Start a timed session instead";
      switchToSessionBtn.hidden = true;
      switchToSessionBtn.addEventListener("click", () => {
        forceTimerOnVideo = true;
        renderSubView("locked");
      });

      backToVideoBtn = document.createElement("button");
      backToVideoBtn.type = "button";
      backToVideoBtn.className = "gate__subtle-btn";
      backToVideoBtn.appendChild(icons.create("arrow-left", 14));
      const backLabel = document.createElement("span");
      backLabel.textContent = "Back to single video";
      backToVideoBtn.appendChild(backLabel);
      backToVideoBtn.hidden = true;
      backToVideoBtn.addEventListener("click", () => {
        forceTimerOnVideo = false;
        renderSubView("locked");
      });

      bottomBar.append(switchToSessionBtn, backToVideoBtn);

      rootContainer.append(
        settingsGearBtn,
        timerView,
        videoView,
        cooldownView,
        settingsView,
        bottomBar
      );
      shadow.append(styleEl, rootContainer);
    }

    document.documentElement.appendChild(hostEl);
    syncTheme();
  }

  /**
   * @param {CCWTabMode} mode
   */
  function renderSubView(mode) {
    if (!timerView || !videoView || !cooldownView || !settingsView || !rootContainer) {
      return;
    }

    if (showingSettings) {
      rootContainer.dataset.view = "settings";
      if (settingsGearBtn) settingsGearBtn.hidden = true;
      settingsView.hidden = false;
      timerView.hidden = true;
      videoView.hidden = true;
      cooldownView.hidden = true;
      if (switchToSessionBtn) switchToSessionBtn.hidden = true;
      if (backToVideoBtn) backToVideoBtn.hidden = true;
      return;
    }

    delete rootContainer.dataset.view;
    if (settingsGearBtn) settingsGearBtn.hidden = false;
    settingsView.hidden = true;

    if (mode === "cooldown") {
      timerView.hidden = true;
      videoView.hidden = true;
      cooldownView.hidden = false;
      if (switchToSessionBtn) switchToSessionBtn.hidden = true;
      if (backToVideoBtn) backToVideoBtn.hidden = true;
      return;
    }

    cooldownView.hidden = true;
    const isDirectVideo = Boolean(activeVideoId);

    if (isDirectVideo && !forceTimerOnVideo) {
      refreshVideoTitleDisplay();
      videoView.hidden = false;
      timerView.hidden = true;
      if (switchToSessionBtn) switchToSessionBtn.hidden = false;
      if (backToVideoBtn) backToVideoBtn.hidden = true;
    } else {
      videoView.hidden = true;
      timerView.hidden = false;
      if (switchToSessionBtn) switchToSessionBtn.hidden = true;
      if (backToVideoBtn) backToVideoBtn.hidden = !isDirectVideo;
    }
  }

  /**
   * @param {{
   *   onStartTimedSession: (minutes: number) => Promise<void>;
   *   onGrantSingleVideo: (videoId: string) => void;
   *   onSettingsOverlayVisibilityChange?: (open: boolean) => void;
   * }} callbacks
   */
  function init(callbacks) {
    gateCallbacks = callbacks;
    ensureMounted();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", syncTheme);

    const docObserver = new MutationObserver(() => {
      syncTheme();
      if (wasLockedVisible && activeVideoId) {
        refreshVideoTitleDisplay();
      }
    });

    if (document.documentElement) {
      docObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["dark"],
        childList: true,
        subtree: false,
      });
    }

    const observeHeadTitle = () => {
      if (!document.head) return;
      const titleObserver = new MutationObserver(() => {
        if (wasLockedVisible && activeVideoId) {
          refreshVideoTitleDisplay();
        }
      });
      titleObserver.observe(document.head, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    };

    if (document.head) {
      observeHeadTitle();
    } else {
      document.addEventListener("DOMContentLoaded", observeHeadTitle, {
        once: true,
      });
    }
  }

  /**
   * @param {CCWTabResolution} resolution
   */
  function update(resolution) {
    latestResolution = resolution;
    ensureMounted();
    if (!hostEl) return;

    const isGateLocked =
      resolution.mode === "locked" || resolution.mode === "cooldown";

    if (!isGateLocked && !showingSettings) {
      wasLockedVisible = false;
      forceTimerOnVideo = false;
      hostEl.hidden = true;
      return;
    }

    const videoChanged = activeVideoId !== resolution.currentVideoId;
    activeVideoId = resolution.currentVideoId;

    if (isGateLocked && !wasLockedVisible) {
      wasLockedVisible = true;
      forceTimerOnVideo = false;
      setSelectedMinutes(resolution.state.settings.defaultMinutes);
    } else if (videoChanged) {
      forceTimerOnVideo = false;
    }

    if (resolution.mode === "cooldown" && cooldownTimeEl) {
      cooldownTimeEl.textContent = state.formatDuration(
        resolution.cooldownRemainingSec
      );
    }

    hostEl.hidden = false;
    renderSubView(resolution.mode);
  }

  CCW.entryGate = Object.freeze({
    init,
    update,
    openSettings,
    closeSettings,
  });
})();
