(() => {
  const { icons, state, mediaGuard } = CCW;

  const HOST_ID = "ccw-yt-watch-guard";
  const CLICK_BUFFER_SEC = 15;

  const GUARD_STYLES = `
    :host {
      all: initial;
      position: fixed !important;
      top: 56px !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 2010 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    :host([hidden]) {
      display: none !important;
    }

    * {
      box-sizing: border-box;
    }

    .guard {
      --bg: #f8f9fb;
      --surface: #ffffff;
      --surface-hover: #eef1f6;
      --fg: #141820;
      --muted: #5f6876;
      --border: #dfe4ec;
      --accent: #f06449;
      --primary-bg: #141820;
      --primary-fg: #ffffff;

      width: 100%;
      height: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }

    .guard[data-theme="dark"] {
      --bg: #0f0f0f;
      --surface: #1a1d24;
      --surface-hover: #242933;
      --fg: #f3f5f8;
      --muted: #98a2b3;
      --border: #2b303c;
      --accent: #f2755d;
      --primary-bg: #f3f5f8;
      --primary-fg: #0f0f0f;
    }

    .guard__card {
      max-width: 440px;
      width: 100%;
      padding: 28px 26px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--surface);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 18px;
    }

    .guard__icon {
      color: var(--accent);
      display: inline-flex;
    }

    .guard__title {
      margin: 0;
      font-size: 19px;
      font-weight: 650;
      line-height: 1.35;
      color: var(--fg);
    }

    .guard__detail {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }

    .guard__actions {
      margin-top: 4px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .guard__btn {
      appearance: none;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 10px 20px;
      background: transparent;
      color: var(--muted);
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease, opacity 120ms ease;
    }

    .guard__btn:hover {
      background: var(--surface-hover);
      color: var(--fg);
    }

    .guard__btn--primary {
      border-color: transparent;
      background: var(--primary-bg);
      color: var(--primary-fg);
      font-weight: 600;
    }

    .guard__btn--primary:hover {
      background: var(--primary-bg);
      color: var(--primary-fg);
      opacity: 0.9;
    }
  `;

  /** @type {HTMLDivElement | null} */
  let hostEl = null;
  /** @type {HTMLDivElement | null} */
  let rootEl = null;
  /** @type {HTMLHeadingElement | null} */
  let titleEl = null;
  /** @type {HTMLParagraphElement | null} */
  let detailEl = null;

  /**
   * @type {{
   *   onGoBack: () => void;
   *   onOpenSettings: () => void;
   * } | null}
   */
  let guardCallbacks = null;
  let initialized = false;
  let currentlyBlocking = false;

  /** @type {number | null} */
  let trackedSessionStartedAt = null;
  /** @type {Set<string>} */
  const approvedVideoIds = new Set();
  /** @type {Map<string, number>} */
  const openBudgetByVideoId = new Map();

  /** @type {string | null} */
  let lastSeenVideoId = null;
  /** @type {string | null} */
  let staleSrcFromPreviousVideo = null;
  /** @type {CCWTabResolution | null} */
  let latestResolution = null;

  function syncTheme() {
    if (!rootEl) return;
    const htmlDark = document.documentElement?.hasAttribute("dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    rootEl.dataset.theme = htmlDark || prefersDark ? "dark" : "light";
  }

  function ensureMounted() {
    if (hostEl && hostEl.isConnected) return;
    if (!document.documentElement) return;

    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.id = HOST_ID;
      hostEl.hidden = true;

      const shadow = hostEl.attachShadow({ mode: "open" });

      const styleEl = document.createElement("style");
      styleEl.textContent = GUARD_STYLES;

      rootEl = document.createElement("div");
      rootEl.className = "guard";

      const card = document.createElement("div");
      card.className = "guard__card";

      const iconWrap = document.createElement("span");
      iconWrap.className = "guard__icon";
      iconWrap.appendChild(icons.create("clock-counter-clockwise", 28));

      titleEl = document.createElement("h2");
      titleEl.className = "guard__title";
      titleEl.textContent = "Video exceeds remaining time";

      detailEl = document.createElement("p");
      detailEl.className = "guard__detail";

      const actions = document.createElement("div");
      actions.className = "guard__actions";

      const backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.className = "guard__btn guard__btn--primary";
      backBtn.appendChild(icons.create("arrow-left", 16));
      const backLabel = document.createElement("span");
      backLabel.textContent = "Go Back";
      backBtn.appendChild(backLabel);
      backBtn.addEventListener("click", () => {
        guardCallbacks?.onGoBack();
      });

      const settingsBtn = document.createElement("button");
      settingsBtn.type = "button";
      settingsBtn.className = "guard__btn";
      settingsBtn.appendChild(icons.create("gear", 16));
      const settingsLabel = document.createElement("span");
      settingsLabel.textContent = "Settings";
      settingsBtn.appendChild(settingsLabel);
      settingsBtn.addEventListener("click", () => {
        guardCallbacks?.onOpenSettings();
      });

      actions.append(backBtn, settingsBtn);
      card.append(iconWrap, titleEl, detailEl, actions);
      rootEl.appendChild(card);
      shadow.append(styleEl, rootEl);
    }

    document.documentElement.appendChild(hostEl);
    syncTheme();
  }

  function pauseMainVideo() {
    const video = mediaGuard.getMainVideo();
    if (video && !video.paused) {
      video.pause();
    }
  }

  /**
   * @param {{ title: string; detail: string }} msg
   */
  function showBlockNotice(msg) {
    ensureMounted();
    currentlyBlocking = true;
    pauseMainVideo();
    if (titleEl) titleEl.textContent = msg.title;
    if (detailEl) detailEl.textContent = msg.detail;
    if (hostEl) hostEl.hidden = false;
  }

  function clearBlockNotice() {
    currentlyBlocking = false;
    if (hostEl) hostEl.hidden = true;
  }

  function evaluate() {
    if (!latestResolution) return;

    const { mode, currentVideoId, remainingSec, state: snap } = latestResolution;
    const sessionStartedAt = snap.session?.startedAt ?? null;

    if (sessionStartedAt !== trackedSessionStartedAt) {
      trackedSessionStartedAt = sessionStartedAt;
      approvedVideoIds.clear();
      openBudgetByVideoId.clear();
      staleSrcFromPreviousVideo = null;
      lastSeenVideoId = null;
    }

    if (mode !== "active" || !currentVideoId) {
      lastSeenVideoId = currentVideoId;
      clearBlockNotice();
      return;
    }

    const video = mediaGuard.getMainVideo();

    // Detect SPA transition between two `/watch?v=` videos so we don't inspect the previous video's duration
    if (currentVideoId !== lastSeenVideoId) {
      if (lastSeenVideoId !== null && video?.currentSrc) {
        staleSrcFromPreviousVideo = video.currentSrc;
      } else {
        staleSrcFromPreviousVideo = null;
      }
      lastSeenVideoId = currentVideoId;
    }

    if (!openBudgetByVideoId.has(currentVideoId)) {
      openBudgetByVideoId.set(currentVideoId, remainingSec + CLICK_BUFFER_SEC);
    }

    const { allowLiveStreams, blockOverBudgetWatch } = snap.settings;
    if (allowLiveStreams && !blockOverBudgetWatch) {
      clearBlockNotice();
      return;
    }

    if (!video || video.readyState < 1) {
      return;
    }

    if (
      staleSrcFromPreviousVideo &&
      video.currentSrc === staleSrcFromPreviousVideo
    ) {
      return;
    }
    staleSrcFromPreviousVideo = null;

    // Wait until any pre-roll ad finishes before inspecting the content video's duration
    if (mediaGuard.isAdPlaying(video)) {
      return;
    }

    // 1. Live stream check
    if (mediaGuard.isMainVideoLive()) {
      if (!allowLiveStreams) {
        showBlockNotice({
          title: "Live streams are hidden",
          detail:
            "Live broadcasts don't have a fixed length. You can allow live streams during active sessions in Settings.",
        });
      } else {
        clearBlockNotice();
      }
      return;
    }

    // 2. Finite video duration check
    if (!blockOverBudgetWatch) {
      clearBlockNotice();
      return;
    }

    if (approvedVideoIds.has(currentVideoId)) {
      clearBlockNotice();
      return;
    }

    const totalDurationSec = video.duration;
    if (!Number.isFinite(totalDurationSec) || totalDurationSec <= 0) {
      return;
    }

    const neededSec = Math.max(
      0,
      Math.floor(totalDurationSec - video.currentTime)
    );
    const allowedAtOpen =
      openBudgetByVideoId.get(currentVideoId) ?? remainingSec + CLICK_BUFFER_SEC;
    const effectiveAllowed = Math.max(
      allowedAtOpen,
      remainingSec + CLICK_BUFFER_SEC
    );

    if (neededSec <= effectiveAllowed) {
      approvedVideoIds.add(currentVideoId);
      clearBlockNotice();
      return;
    }

    showBlockNotice({
      title: "Longer than your remaining session",
      detail: `This video needs ${state.formatDuration(neededSec)}, and you have ${state.formatDuration(remainingSec)} left.`,
    });
  }

  /**
   * @param {{
   *   onGoBack: () => void;
   *   onOpenSettings: () => void;
   * }} callbacks
   */
  function init(callbacks) {
    guardCallbacks = callbacks;
    if (initialized) return;
    initialized = true;

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", syncTheme);

    for (const evtName of ["loadedmetadata", "durationchange", "play", "playing"]) {
      document.addEventListener(
        evtName,
        (ev) => {
          if (!(ev.target instanceof HTMLVideoElement)) return;
          if (
            (evtName === "play" || evtName === "playing") &&
            currentlyBlocking
          ) {
            ev.target.pause();
            return;
          }
          evaluate();
        },
        true
      );
    }
  }

  /**
   * @param {CCWTabResolution} resolution
   */
  function update(resolution) {
    latestResolution = resolution;
    syncTheme();
    evaluate();
  }

  CCW.watchGuard = Object.freeze({
    init,
    update,
  });
})();
