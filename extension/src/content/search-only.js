(() => {
  const { icons } = CCW;

  const HOST_ID = "ccw-yt-search-host";

  const SEARCH_STYLES = `
    :host {
      all: initial;
      position: fixed !important;
      top: 56px !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 2000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: none !important;
    }

    :host([hidden]) {
      display: none !important;
    }

    * {
      box-sizing: border-box;
    }

    .search-card {
      --surface: #ffffff;
      --fg: #141820;
      --muted: #646e7e;
      --border: #d5dce6;
      --accent: #f06449;

      pointer-events: auto;
      width: min(540px, calc(100vw - 40px));
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: var(--fg);
    }

    .search-card[data-theme="dark"] {
      --surface: #181b22;
      --fg: #f3f5f8;
      --muted: #98a2b3;
      --border: #2e3442;
      --accent: #f2755d;
    }

    .search-card__form {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: border-color 140ms ease;
    }

    .search-card__form:focus-within {
      border-color: var(--accent);
      color: var(--fg);
    }

    .search-card__input {
      flex: 1;
      appearance: none;
      border: none;
      outline: none;
      background: transparent;
      color: var(--fg);
      font: inherit;
      font-size: 16px;
    }

    .search-card__input::placeholder {
      color: var(--muted);
    }
  `;

  /** @type {HTMLDivElement | null} */
  let hostEl = null;
  /** @type {HTMLDivElement | null} */
  let cardEl = null;
  /** @type {HTMLInputElement | null} */
  let searchInput = null;
  let wasActive = false;

  function syncTheme() {
    if (!cardEl) return;
    const htmlDark = document.documentElement?.hasAttribute("dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    cardEl.dataset.theme = htmlDark || prefersDark ? "dark" : "light";
  }

  function ensureMounted() {
    if (hostEl && hostEl.isConnected) return;
    if (!document.documentElement) return;

    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.id = HOST_ID;
      hostEl.hidden = true;

      const shadow = hostEl.attachShadow({ mode: "open" });

      for (const evtName of ["keydown", "keypress", "keyup"]) {
        shadow.addEventListener(evtName, (ev) => {
          const ke = /** @type {KeyboardEvent} */ (ev);
          if (!ke.metaKey && !ke.ctrlKey && !ke.altKey) {
            ev.stopPropagation();
          }
        });
      }

      const styleEl = document.createElement("style");
      styleEl.textContent = SEARCH_STYLES;

      cardEl = document.createElement("div");
      cardEl.className = "search-card";

      const form = document.createElement("form");
      form.className = "search-card__form";

      const iconEl = icons.create("magnifying-glass", 20);

      searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.className = "search-card__input";
      searchInput.placeholder = "Search YouTube…";
      searchInput.setAttribute("aria-label", "Search YouTube");

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = (searchInput?.value || "").trim();
        if (!query) return;
        window.location.assign(
          `/results?search_query=${encodeURIComponent(query)}`
        );
      });

      form.append(iconEl, searchInput);
      cardEl.appendChild(form);
      shadow.append(styleEl, cardEl);
    }

    document.documentElement.appendChild(hostEl);
    syncTheme();
  }

  /**
   * @param {boolean} active
   */
  function update(active) {
    if (!document.documentElement) return;

    if (!active) {
      wasActive = false;
      delete document.documentElement.dataset.ccwSearchOnly;
      if (hostEl) hostEl.hidden = true;
      return;
    }

    ensureMounted();
    syncTheme();
    document.documentElement.dataset.ccwSearchOnly = "true";
    if (hostEl) hostEl.hidden = false;

    if (!wasActive) {
      wasActive = true;
      window.requestAnimationFrame(() => {
        searchInput?.focus();
      });
    }
  }

  CCW.searchOnly = Object.freeze({
    update,
  });
})();
