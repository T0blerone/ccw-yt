(() => {
  const { icons, state } = CCW;

  const HOST_ID = "ccw-yt-hud-host";

  const HUD_STYLES = `
    :host {
      all: initial;
      display: inline-flex !important;
      align-items: center !important;
      margin-right: 8px !important;
      position: relative !important;
      z-index: 2100 !important;
    }

    :host([data-dock="floating"]) {
      position: fixed !important;
      top: 11px !important;
      right: 16px !important;
      margin-right: 0 !important;
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

    .hud {
      --pill-bg: rgba(20, 24, 32, 0.06);
      --pill-hover: rgba(20, 24, 32, 0.11);
      --pill-border: rgba(20, 24, 32, 0.1);
      --fg: #0f0f0f;
      --muted: #606060;
      --menu-bg: #ffffff;
      --menu-border: #dfe4ec;
      --menu-hover: #f2f4f8;
      --accent: #e05338;
      --accent-soft: rgba(240, 100, 73, 0.13);

      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--fg);
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    .hud[data-theme="dark"] {
      --pill-bg: rgba(255, 255, 255, 0.1);
      --pill-hover: rgba(255, 255, 255, 0.17);
      --pill-border: rgba(255, 255, 255, 0.12);
      --fg: #f1f1f1;
      --muted: #aaaaaa;
      --menu-bg: #212121;
      --menu-border: #383838;
      --menu-hover: #303030;
      --accent: #f2755d;
      --accent-soft: rgba(242, 117, 93, 0.18);
    }

    .hud__pill {
      appearance: none;
      height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid var(--pill-border);
      background: var(--pill-bg);
      color: var(--fg);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
    }

    .hud__pill:hover,
    .hud__pill[aria-expanded="true"] {
      background: var(--pill-hover);
    }

    .hud__pill:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .hud__pill[data-tone="ending"] {
      background: var(--accent-soft);
      border-color: transparent;
      color: var(--accent);
    }

    .hud__icon {
      display: inline-flex;
      opacity: 0.85;
    }

    .hud__menu {
      position: fixed;
      top: 48px;
      right: 16px;
      width: 224px;
      padding: 8px;
      border-radius: 12px;
      border: 1px solid var(--menu-border);
      background: var(--menu-bg);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 2147483646;
    }

    .hud__summary {
      padding: 8px 10px 10px;
      border-bottom: 1px solid var(--menu-border);
      margin-bottom: 2px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hud__exact-time {
      font-size: 20px;
      font-weight: 650;
      line-height: 1.15;
      font-variant-numeric: tabular-nums;
      color: var(--fg);
    }

    .hud__caption {
      font-size: 12px;
      color: var(--muted);
    }

    .hud__item {
      appearance: none;
      width: 100%;
      border: none;
      border-radius: 8px;
      padding: 8px 10px;
      background: transparent;
      color: var(--fg);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 9px;
      cursor: pointer;
      transition: background 100ms ease;
    }

    .hud__item:hover,
    .hud__item:focus-visible {
      background: var(--menu-hover);
      outline: none;
    }

    .hud__item--danger {
      color: var(--accent);
    }
  `;

  /** @type {HTMLDivElement | null} */
  let hostEl = null;
  /** @type {HTMLDivElement | null} */
  let rootEl = null;
  /** @type {HTMLButtonElement | null} */
  let pillBtn = null;
  /** @type {HTMLSpanElement | null} */
  let pillTextEl = null;
  /** @type {HTMLDivElement | null} */
  let menuEl = null;
  /** @type {HTMLDivElement | null} */
  let exactTimeEl = null;
  /** @type {HTMLDivElement | null} */
  let captionEl = null;
  /** @type {HTMLSpanElement | null} */
  let endBtnLabelEl = null;

  /**
   * @type {{
   *   onOpenSettings: () => void;
   *   onEndSession: () => Promise<void>;
   * } | null}
   */
  let hudCallbacks = null;
  let menuOpen = false;
  let initialized = false;

  function syncTheme() {
    if (!rootEl) return;
    const htmlDark = document.documentElement?.hasAttribute("dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    rootEl.dataset.theme = htmlDark || prefersDark ? "dark" : "light";
  }

  function isFullscreenActive() {
    return Boolean(
      document.fullscreenElement ||
        document.querySelector("ytd-watch-flexy[fullscreen]")
    );
  }

  function isWatchLikeRoute() {
    const p = window.location.pathname;
    return p === "/watch" || p.startsWith("/shorts/");
  }

  function positionMenu() {
    if (!menuEl || !pillBtn) return;
    const rect = pillBtn.getBoundingClientRect();
    const top = Math.max(8, Math.round(rect.bottom + 8));
    const right = Math.max(12, Math.round(window.innerWidth - rect.right));
    menuEl.style.top = `${top}px`;
    menuEl.style.right = `${right}px`;
  }

  /**
   * @param {boolean} nextOpen
   */
  function setMenuOpen(nextOpen) {
    menuOpen = nextOpen;
    if (pillBtn) {
      pillBtn.setAttribute("aria-expanded", String(menuOpen));
    }
    if (menuEl) {
      if (menuOpen) {
        positionMenu();
        menuEl.hidden = false;
      } else {
        menuEl.hidden = true;
      }
    }
  }

  function ensureMounted() {
    if (!document.documentElement) return;

    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.id = HOST_ID;
      hostEl.hidden = true;

      const shadow = hostEl.attachShadow({ mode: "open" });

      for (const evtName of ["keydown", "keypress", "keyup"]) {
        shadow.addEventListener(evtName, (ev) => {
          const ke = /** @type {KeyboardEvent} */ (ev);
          if (evtName === "keydown" && ke.key === "Escape" && menuOpen) {
            ke.preventDefault();
            ke.stopPropagation();
            setMenuOpen(false);
            return;
          }
          if (!ke.metaKey && !ke.ctrlKey && !ke.altKey) {
            ev.stopPropagation();
          }
        });
      }

      const styleEl = document.createElement("style");
      styleEl.textContent = HUD_STYLES;

      rootEl = document.createElement("div");
      rootEl.className = "hud";

      pillBtn = document.createElement("button");
      pillBtn.type = "button";
      pillBtn.className = "hud__pill";
      pillBtn.setAttribute("aria-haspopup", "menu");
      pillBtn.setAttribute("aria-expanded", "false");
      pillBtn.title = "ccw-yt session timer";

      const iconWrap = document.createElement("span");
      iconWrap.className = "hud__icon";
      iconWrap.appendChild(icons.create("clock-counter-clockwise", 15));

      pillTextEl = document.createElement("span");
      pillTextEl.textContent = "20m";

      pillBtn.append(iconWrap, pillTextEl);
      pillBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        setMenuOpen(!menuOpen);
      });

      menuEl = document.createElement("div");
      menuEl.className = "hud__menu";
      menuEl.setAttribute("role", "menu");
      menuEl.hidden = true;

      const summary = document.createElement("div");
      summary.className = "hud__summary";

      exactTimeEl = document.createElement("div");
      exactTimeEl.className = "hud__exact-time";
      exactTimeEl.textContent = "20:00";

      captionEl = document.createElement("div");
      captionEl.className = "hud__caption";
      captionEl.textContent = "Remaining in session";

      summary.append(exactTimeEl, captionEl);

      const settingsItem = document.createElement("button");
      settingsItem.type = "button";
      settingsItem.className = "hud__item";
      settingsItem.setAttribute("role", "menuitem");
      settingsItem.appendChild(icons.create("gear", 16));
      const settingsText = document.createElement("span");
      settingsText.textContent = "Settings";
      settingsItem.appendChild(settingsText);
      settingsItem.addEventListener("click", () => {
        setMenuOpen(false);
        hudCallbacks?.onOpenSettings();
      });

      const endItem = document.createElement("button");
      endItem.type = "button";
      endItem.className = "hud__item hud__item--danger";
      endItem.setAttribute("role", "menuitem");
      endItem.appendChild(icons.create("lock-simple", 16));
      endBtnLabelEl = document.createElement("span");
      endBtnLabelEl.textContent = "End Session Early";
      endItem.appendChild(endBtnLabelEl);
      endItem.addEventListener("click", () => {
        setMenuOpen(false);
        hudCallbacks?.onEndSession();
      });

      menuEl.append(summary, settingsItem, endItem);
      rootEl.append(pillBtn, menuEl);
      shadow.append(styleEl, rootEl);
    }

    const mastheadEnd = document.querySelector("ytd-masthead #end");
    if (mastheadEnd) {
      if (hostEl.parentElement !== mastheadEnd) {
        mastheadEnd.prepend(hostEl);
      }
      hostEl.dataset.dock = "masthead";
    } else if (!hostEl.isConnected) {
      hostEl.dataset.dock = "floating";
      document.documentElement.appendChild(hostEl);
    }

    syncTheme();
  }

  /**
   * @param {{
   *   onOpenSettings: () => void;
   *   onEndSession: () => Promise<void>;
   * }} callbacks
   */
  function init(callbacks) {
    hudCallbacks = callbacks;
    if (initialized) return;
    initialized = true;

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", syncTheme);

    document.addEventListener("pointerdown", (ev) => {
      if (!menuOpen || !hostEl) return;
      if (!ev.composedPath().includes(hostEl)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (ev) => {
      if (menuOpen && ev.key === "Escape") {
        setMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (menuOpen) positionMenu();
    });

    document.addEventListener("fullscreenchange", () => {
      if (isFullscreenActive() && hostEl) {
        setMenuOpen(false);
        hostEl.hidden = true;
      }
    });

    window.addEventListener("yt-navigate-start", () => {
      if (menuOpen) setMenuOpen(false);
    });
  }

  /**
   * @param {CCWTabResolution} resolution
   */
  function update(resolution) {
    ensureMounted();
    if (!hostEl || !pillBtn || !pillTextEl || !exactTimeEl || !captionEl || !endBtnLabelEl) {
      return;
    }

    const unlocked =
      resolution.mode === "active" || resolution.mode === "single_video";
    const visPref = resolution.state.settings.timerVisibility;
    const hideByPref =
      visPref === "hidden" || (visPref === "feeds_only" && isWatchLikeRoute());

    if (!unlocked || hideByPref || isFullscreenActive()) {
      if (menuOpen) setMenuOpen(false);
      hostEl.hidden = true;
      return;
    }

    if (resolution.mode === "active") {
      const rem = resolution.remainingSec;
      pillTextEl.textContent = state.formatCalmDuration(rem);
      if (rem <= 60) {
        pillBtn.dataset.tone = "ending";
      } else {
        delete pillBtn.dataset.tone;
      }

      exactTimeEl.textContent = state.formatDuration(rem);
      captionEl.textContent = "Remaining in session";
      endBtnLabelEl.textContent = "End Session Early";
    } else {
      if (resolution.singleVideoOrigin === "overtime") {
        pillTextEl.textContent = "Finishing video";
        pillBtn.dataset.tone = "ending";
        exactTimeEl.textContent = "0:00";
        captionEl.textContent = "Time's up — finishing current video";
      } else {
        pillTextEl.textContent = "Single video";
        delete pillBtn.dataset.tone;
        exactTimeEl.textContent = "1 video";
        captionEl.textContent = "Locks when this video ends";
      }
      endBtnLabelEl.textContent = "Lock YouTube Now";
    }

    hostEl.hidden = false;
    if (menuOpen) {
      positionMenu();
    }
  }

  CCW.hud = Object.freeze({
    init,
    update,
  });
})();
