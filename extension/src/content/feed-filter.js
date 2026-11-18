(() => {
  const { icons, state } = CCW;

  const CARD_SELECTOR = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-compact-radio-renderer",
    "ytd-compact-playlist-renderer",
    "yt-lockup-view-model",
    "ytd-playlist-video-renderer",
    "ytd-playlist-panel-video-renderer",
    "ytd-radio-renderer",
    "ytd-playlist-renderer",
    "ytd-reel-item-renderer",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2",
    ".ytp-ce-video",
    ".ytp-ce-playlist",
    ".ytp-videowall-still",
    ".ytp-modern-videowall-still",
  ].join(", ");

  const SHELF_SELECTOR =
    "ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-shelf-renderer";

  const BADGE_TEXT_SELECTOR = [
    ".badge-shape-wiz__text",
    ".yt-badge-shape__text",
    '[class*="badge-shape"][class*="text"]',
    "badge-shape",
    "ytd-thumbnail-overlay-time-status-renderer #text",
    "span.ytd-thumbnail-overlay-time-status-renderer",
    '[class*="time-status"]',
    '[class*="videowall-still-info-duration"]',
    '[class*="ce-video-duration"]',
  ].join(", ");

  const THUMBNAIL_CONTAINER_SELECTOR =
    'yt-thumbnail-view-model, ytd-thumbnail, a#thumbnail, [class*="content-image"]';

  const INACTIVE_PAGE_SELECTOR =
    "ytd-browse[hidden], ytd-search[hidden], ytd-watch-flexy[hidden]";

  const FOOTER_HOST_ID = "ccw-yt-filter-footer";

  const FOOTER_STYLES = `
    :host {
      all: initial;
      display: block !important;
      width: 100% !important;
      margin: 20px 0 36px !important;
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

    .footer {
      --surface: rgba(20, 24, 32, 0.04);
      --border: rgba(20, 24, 32, 0.1);
      --fg: #141820;
      --muted: #5f6876;
      --btn-bg: #ffffff;
      --btn-hover: #eef1f6;
      --accent: #e05338;
      --accent-soft: rgba(240, 100, 73, 0.13);

      max-width: 560px;
      margin: 0 auto;
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      -webkit-font-smoothing: antialiased;
    }

    .footer[data-theme="dark"] {
      --surface: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.1);
      --fg: #f1f1f1;
      --muted: #a0a6b2;
      --btn-bg: #24272f;
      --btn-hover: #2f333d;
      --accent: #f2755d;
      --accent-soft: rgba(242, 117, 93, 0.18);
    }

    .footer__text {
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
      color: var(--muted);
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .footer__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .footer__btn {
      appearance: none;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 7px 14px;
      background: var(--btn-bg);
      color: var(--fg);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: background 120ms ease, opacity 120ms ease;
    }

    .footer__btn:hover {
      background: var(--btn-hover);
    }

    .footer__btn--end {
      border-color: transparent;
      background: var(--accent-soft);
      color: var(--accent);
    }
  `;

  const TIMESTAMP_RE = /^(?:(?:(\d+):)?(\d+):)?([0-5]?\d):([0-5]\d)$/;
  const INVISIBLE_CHARS_RE = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

  /** @type {WeakSet<Element>} */
  const hoverDeferredListeners = new WeakSet();

  /** @type {CCWTabResolution | null} */
  let currentResolution = null;
  /** @type {{ onEndSession: () => Promise<void> } | null} */
  let filterCallbacks = null;
  let rafScheduled = false;
  let initialized = false;

  // Per-route continuation guard state
  let autoBatchBaseline = -1;
  let autoBatchUsed = false;
  let manualAllowBaseline = -1;

  /** @type {HTMLDivElement | null} */
  let footerHost = null;
  /** @type {HTMLDivElement | null} */
  let footerRoot = null;
  /** @type {HTMLSpanElement | null} */
  let footerMessageEl = null;
  /** @type {HTMLButtonElement | null} */
  let loadMoreBtn = null;
  /** @type {HTMLButtonElement | null} */
  let endSessionBtn = null;

  /**
   * Parses `H:MM:SS` or `MM:SS` into total seconds, or `null` if invalid.
   *
   * @param {string} raw
   * @returns {number | null}
   */
  function parseTimestampText(raw) {
    const cleaned = raw.replace(INVISIBLE_CHARS_RE, "").trim();
    const match = TIMESTAMP_RE.exec(cleaned);
    if (!match) return null;
    const days = match[1] ? Number(match[1]) : 0;
    const hours = match[2] ? Number(match[2]) : 0;
    const minutes = Number(match[3]);
    const seconds = Number(match[4]);
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Fallback parser for YouTube's `aria-label` duration phrases (e.g. "12 minutes, 34 seconds"),
   * ignoring relative upload times like "12 minutes ago".
   *
   * @param {string} label
   * @returns {number | null}
   */
  function parseAriaDuration(label) {
    const hoursMatch = /\b(\d+)\s+hours?(?!\s+ago)\b/i.exec(label);
    const minsMatch = /\b(\d+)\s+minutes?(?!\s+ago)\b/i.exec(label);
    const secsMatch = /\b(\d+)\s+seconds?(?!\s+ago)\b/i.exec(label);
    if (!hoursMatch && !minsMatch && !secsMatch) return null;

    const h = hoursMatch ? Number(hoursMatch[1]) : 0;
    const m = minsMatch ? Number(minsMatch[1]) : 0;
    const s = secsMatch ? Number(secsMatch[1]) : 0;
    const total = h * 3600 + m * 60 + s;
    return total > 0 ? total : null;
  }

  /**
   * Checks whether an element is nested inside an outer card container we already evaluate.
   *
   * @param {Element} el
   * @returns {boolean}
   */
  function isNestedInsideOuterCard(el) {
    const tag = el.tagName;
    if (
      tag === "YT-LOCKUP-VIEW-MODEL" ||
      tag === "YTM-SHORTS-LOCKUP-VIEW-MODEL" ||
      tag === "YTM-SHORTS-LOCKUP-VIEW-MODEL-V2" ||
      tag === "YTD-REEL-ITEM-RENDERER"
    ) {
      return Boolean(
        el.parentElement?.closest(
          "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer"
        )
      );
    }
    return false;
  }

  /**
   * Inspects a single badge/overlay text string for duration or stream status.
   *
   * @param {string} rawText
   * @returns {
   *   | { kind: "video"; durationSec: number }
   *   | { kind: "live" }
   *   | { kind: "upcoming" }
   *   | { kind: "mix" }
   *   | null
   * }
   */
  function matchBadgeLabel(rawText) {
    const text = rawText.replace(INVISIBLE_CHARS_RE, "").trim();
    if (!text || text.length > 28) return null;

    const parsedSec = parseTimestampText(text);
    if (parsedSec !== null) {
      return { kind: "video", durationSec: parsedSec };
    }
    if (/^(live|live now|premiering now)$/i.test(text)) {
      return { kind: "live" };
    }
    if (/^(upcoming|premiere)$/i.test(text)) {
      return { kind: "upcoming" };
    }
    if (/^(mix|\d+\s*(videos?|episodes?|podcasts?|lessons?|courses?))$/i.test(text)) {
      return { kind: "mix" };
    }
    return null;
  }

  /**
   * Classifies a YouTube card element for duration filtering.
   *
   * @param {Element} card
   * @returns {
   *   | { kind: "video"; durationSec: number }
   *   | { kind: "short"; durationSec: number }
   *   | { kind: "live" }
   *   | { kind: "upcoming" }
   *   | { kind: "mix" }
   *   | { kind: "non_video" }
   *   | { kind: "pending" }
   * }
   */
  function classifyCard(card) {
    const tag = card.tagName;

    // 1. Explicit Mix / Radio / Playlist renderers
    if (
      tag === "YTD-RADIO-RENDERER" ||
      tag === "YTD-COMPACT-RADIO-RENDERER" ||
      tag === "YTD-PLAYLIST-RENDERER" ||
      tag === "YTD-COMPACT-PLAYLIST-RENDERER" ||
      card.classList.contains("ytp-ce-playlist") ||
      card.querySelector(
        '[class*="collection-stack"], yt-collections-stack'
      )
    ) {
      return { kind: "mix" };
    }

    // 2. Shorts cards
    if (
      tag === "YTD-REEL-ITEM-RENDERER" ||
      tag === "YTM-SHORTS-LOCKUP-VIEW-MODEL" ||
      tag === "YTM-SHORTS-LOCKUP-VIEW-MODEL-V2" ||
      card.querySelector('a[href*="/shorts/"], [overlay-style="SHORTS"]')
    ) {
      return { kind: "short", durationSec: 60 };
    }

    // 3. Check primary link for Mixes (`list=RD...` / `start_radio=1`) or Playlists (`/playlist?list=`)
    const primaryLink =
      card instanceof HTMLAnchorElement ? card : card.querySelector("a[href]");
    if (primaryLink instanceof HTMLAnchorElement && primaryLink.href) {
      try {
        const url = new URL(primaryLink.href, window.location.origin);
        const listParam = url.searchParams.get("list") || "";
        if (
          url.pathname === "/playlist" ||
          url.searchParams.get("start_radio") === "1" ||
          listParam.startsWith("RD")
        ) {
          return { kind: "mix" };
        }
      } catch {
        // Ignore malformed URLs
      }
    }

    // 4. Explicit Live / Upcoming attributes
    if (
      card.getAttribute("data-is-live") === "true" ||
      card.querySelector(
        '[overlay-style="LIVE"], .badge-style-type-live-now, .badge-style-type-live-now-alternate'
      )
    ) {
      return { kind: "live" };
    }
    if (card.querySelector('[overlay-style="UPCOMING"]')) {
      return { kind: "upcoming" };
    }

    // 5. Inspect thumbnail / overlay badge text (both Polymer and Wiz badge classes)
    /** @type {{ kind: "live" | "upcoming" | "mix" } | null} */
    let statusMatch = null;
    for (const badge of card.querySelectorAll(BADGE_TEXT_SELECTOR)) {
      const res = matchBadgeLabel(badge.textContent || "");
      if (!res) continue;
      if (res.kind === "video") return res;
      if (!statusMatch) statusMatch = res;
    }

    // 6. Class-agnostic leaf scan inside thumbnail container or player endscreen tile
    const isPlayerTile =
      card.classList.contains("ytp-videowall-still") ||
      card.classList.contains("ytp-modern-videowall-still") ||
      card.classList.contains("ytp-ce-video");
    const thumbRoot = isPlayerTile
      ? card
      : card.querySelector(THUMBNAIL_CONTAINER_SELECTOR);
    if (thumbRoot) {
      for (const node of thumbRoot.querySelectorAll("*")) {
        if (node.children.length > 0) continue;
        const res = matchBadgeLabel(node.textContent || "");
        if (!res) continue;
        if (res.kind === "video") return res;
        if (!statusMatch) statusMatch = res;
      }
    }

    if (statusMatch) {
      return statusMatch;
    }

    // 7. Fallback to any `[aria-label]` inside (or on) the card
    if (card.hasAttribute("aria-label")) {
      const selfAria = parseAriaDuration(card.getAttribute("aria-label") || "");
      if (selfAria !== null) {
        return { kind: "video", durationSec: selfAria };
      }
    }
    for (const labeled of card.querySelectorAll("a[aria-label], h3[aria-label], span[aria-label]")) {
      const label = labeled.getAttribute("aria-label") || "";
      if (!label) continue;
      const ariaSec = parseAriaDuration(label);
      if (ariaSec !== null) {
        return { kind: "video", durationSec: ariaSec };
      }
    }

    // Creator end-screen cards (`.ytp-ce-video`) often omit duration text completely;
    // treat unbadged creator end-cards as unbounded so over-budget videos don't slip onto the player.
    if (card.classList.contains("ytp-ce-video") && primaryLink) {
      return { kind: "mix" };
    }

    // 8. Non-video items (Community posts, Channel cards, Ads without watch/shorts links)
    const hasVideoOrShortsLink =
      (card instanceof HTMLAnchorElement &&
        (card.href.includes("/watch") || card.href.includes("/shorts/"))) ||
      Boolean(card.querySelector('a[href*="/watch"], a[href*="/shorts/"]'));

    if (
      !hasVideoOrShortsLink &&
      (card.querySelector(
        "ytd-post-renderer, ytd-backstage-post-thread-renderer, ytd-channel-renderer, ytd-display-ad-renderer, ytd-in-feed-ad-layout-renderer"
      ) ||
        Boolean(primaryLink))
    ) {
      return { kind: "non_video" };
    }

    return { kind: "pending" };
  }

  /**
   * Checks whether the current top-level route is exempted from filtering by user settings.
   *
   * @param {CCWSettings} settings
   * @returns {boolean}
   */
  function isCurrentPageExempt(settings) {
    const p = window.location.pathname;
    if (p === "/results") {
      return settings.exemptSearch;
    }
    if (
      p.startsWith("/@") ||
      p.startsWith("/channel/") ||
      p.startsWith("/c/") ||
      p.startsWith("/user/")
    ) {
      return settings.exemptChannels;
    }
    if (p === "/playlist" || p === "/feed/history" || p === "/feed/you") {
      return settings.exemptPlaylistsAndHistory;
    }
    return false;
  }

  /**
   * Decides whether a classified card should be hidden under `resolution`.
   *
   * @param {Element} card
   * @param {ReturnType<typeof classifyCard>} info
   * @param {CCWTabResolution} resolution
   * @returns {boolean}
   */
  function shouldHideCard(card, info, resolution) {
    const { settings } = resolution.state;

    // On `/watch`, allow playlist queue items if `exemptPlaylistsAndHistory` is enabled
    if (
      card.tagName === "YTD-PLAYLIST-PANEL-VIDEO-RENDERER" &&
      settings.exemptPlaylistsAndHistory
    ) {
      return false;
    }

    // In `single_video` / overtime mode (`remainingSec === 0`), hide all surrounding video/live/mix cards
    if (resolution.mode === "single_video") {
      return info.kind !== "non_video" && info.kind !== "pending";
    }

    const budgetSec = resolution.remainingSec;

    switch (info.kind) {
      case "short":
        return settings.hideShorts || info.durationSec > budgetSec;
      case "video":
        return info.durationSec > budgetSec;
      case "live":
        return !settings.allowLiveStreams || budgetSec <= 0;
      case "upcoming":
      case "mix":
        return true;
      case "non_video":
      case "pending":
      default:
        return false;
    }
  }

  /**
   * @param {Element} el
   * @param {boolean} filtered
   */
  function setElementFiltered(el, filtered) {
    if (filtered) {
      el.setAttribute("data-ccw-filtered", "true");
      if (el instanceof HTMLElement) {
        el.style.setProperty("display", "none", "important");
      }
    } else {
      el.removeAttribute("data-ccw-filtered");
      if (el instanceof HTMLElement) {
        el.style.removeProperty("display");
      }
    }
  }

  /**
   * @param {Element} card
   * @returns {string}
   */
  function getCardPrimaryHref(card) {
    if (card instanceof HTMLAnchorElement) return card.getAttribute("href") || "";
    const a = card.querySelector('a[href*="/watch"], a[href*="/shorts/"], a[href]');
    return a?.getAttribute("href") || "";
  }

  /**
   * @param {Element} card
   * @param {boolean} hide
   * @param {string} currentHref
   */
  function applyCardVisibility(card, hide, currentHref) {
    const alreadyFiltered = card.getAttribute("data-ccw-filtered") === "true";

    if (!hide) {
      if (alreadyFiltered) {
        setElementFiltered(card, false);
      }
      card.removeAttribute("data-ccw-defer-hide");
      card.setAttribute("data-ccw-approved", "true");
      card.setAttribute("data-ccw-href", currentHref);
      return;
    }

    if (alreadyFiltered) return;

    // Hover / focus guard: never yank an already-approved visible card out from under the cursor
    if (
      card.getAttribute("data-ccw-approved") === "true" &&
      (card.matches(":hover") || card.matches(":focus-within"))
    ) {
      card.setAttribute("data-ccw-defer-hide", "true");
      if (!hoverDeferredListeners.has(card)) {
        hoverDeferredListeners.add(card);
        const recheck = () => scheduleFilterPass();
        card.addEventListener("pointerleave", recheck);
        card.addEventListener("focusout", recheck);
      }
      return;
    }

    card.removeAttribute("data-ccw-defer-hide");
    card.removeAttribute("data-ccw-approved");
    setElementFiltered(card, true);
  }

  function clearAllFiltering() {
    if (document.documentElement) {
      delete document.documentElement.dataset.ccwFilteringActive;
    }
    for (const el of document.querySelectorAll("[data-ccw-filtered]")) {
      setElementFiltered(el, false);
    }
    for (const el of document.querySelectorAll("[data-ccw-approved]")) {
      el.removeAttribute("data-ccw-approved");
      el.removeAttribute("data-ccw-href");
    }
    for (const el of document.querySelectorAll("[data-ccw-pause-continuation]")) {
      el.removeAttribute("data-ccw-pause-continuation");
    }
    hideFooter();
  }

  function syncFooterTheme() {
    if (!footerRoot) return;
    const htmlDark = document.documentElement?.hasAttribute("dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    footerRoot.dataset.theme = htmlDark || prefersDark ? "dark" : "light";
  }

  /**
   * Finds the primary visible feed container on browse/search pages to append our calm footer.
   *
   * @returns {Element | null}
   */
  function findPrimaryFeedHost() {
    const p = window.location.pathname;
    if (p === "/watch" || p.startsWith("/shorts/")) return null;

    return document.querySelector(
      "ytd-browse:not([hidden]) ytd-rich-grid-renderer, ytd-browse:not([hidden]) ytd-two-column-browse-results-renderer #primary, ytd-search #primary"
    );
  }

  function ensureFooterMounted() {
    const container = findPrimaryFeedHost();
    if (!container) return null;

    if (!footerHost) {
      footerHost = document.createElement("div");
      footerHost.id = FOOTER_HOST_ID;
      footerHost.hidden = true;

      const shadow = footerHost.attachShadow({ mode: "open" });

      const styleEl = document.createElement("style");
      styleEl.textContent = FOOTER_STYLES;

      footerRoot = document.createElement("div");
      footerRoot.className = "footer";

      const textP = document.createElement("p");
      textP.className = "footer__text";
      textP.appendChild(icons.create("funnel-simple", 16));
      footerMessageEl = document.createElement("span");
      textP.appendChild(footerMessageEl);

      const actions = document.createElement("div");
      actions.className = "footer__actions";

      loadMoreBtn = document.createElement("button");
      loadMoreBtn.type = "button";
      loadMoreBtn.className = "footer__btn";
      loadMoreBtn.appendChild(icons.create("arrows-clockwise", 15));
      const loadLabel = document.createElement("span");
      loadLabel.textContent = "Check more videos";
      loadMoreBtn.appendChild(loadLabel);
      loadMoreBtn.addEventListener("click", () => {
        triggerManualBatchCheck();
      });

      endSessionBtn = document.createElement("button");
      endSessionBtn.type = "button";
      endSessionBtn.className = "footer__btn footer__btn--end";
      endSessionBtn.appendChild(icons.create("lock-simple", 15));
      const endLabel = document.createElement("span");
      endLabel.textContent = "End Session Early";
      endSessionBtn.appendChild(endLabel);
      endSessionBtn.addEventListener("click", () => {
        filterCallbacks?.onEndSession();
      });

      actions.append(loadMoreBtn, endSessionBtn);
      footerRoot.append(textP, actions);
      shadow.append(styleEl, footerRoot);
    }

    if (footerHost.parentElement !== container) {
      container.appendChild(footerHost);
    }
    syncFooterTheme();
    return footerHost;
  }

  function hideFooter() {
    if (footerHost) {
      footerHost.hidden = true;
    }
  }

  function triggerManualBatchCheck() {
    const allCards = document.querySelectorAll(CARD_SELECTOR);
    manualAllowBaseline = allCards.length;

    const continuations = document.querySelectorAll(
      "ytd-continuation-item-renderer[data-ccw-pause-continuation]"
    );
    for (const c of continuations) {
      c.removeAttribute("data-ccw-pause-continuation");
    }

    // Nudge scroll by 1px so YouTube's IntersectionObserver re-fires if already in view
    window.scrollBy(0, 1);
    window.scrollBy(0, -1);
    hideFooter();
  }

  /**
   * Returns video-feed continuation spinners, strictly excluding comment threads
   * and engagement panels (Transcript, Chapters, Live Chat).
   *
   * @returns {Element[]}
   */
  function getFeedContinuations() {
    const all = document.querySelectorAll("ytd-continuation-item-renderer");
    /** @type {Element[]} */
    const feedOnly = [];
    for (const el of all) {
      if (
        el.closest(
          "ytd-comments, #comments, ytd-engagement-panel-section-list-renderer"
        )
      ) {
        el.removeAttribute("data-ccw-pause-continuation");
        continue;
      }
      feedOnly.push(el);
    }
    return feedOnly;
  }

  /**
   * @param {number} visibleCount
   * @param {number} hiddenCount
   * @param {CCWTabResolution} resolution
   */
  function manageStarvationAndContinuations(visibleCount, hiddenCount, resolution) {
    const totalResolved = visibleCount + hiddenCount;
    const continuations = getFeedContinuations();
    const isWatchPage = window.location.pathname === "/watch";

    // While watch-page recommendations are hidden by Watch Page Focus, don't prematurely
    // lock `#related`'s initial continuation loader before it has a chance to reveal.
    if (
      isWatchPage &&
      document.documentElement?.dataset.ccwHideWatchRecs === "true" &&
      resolution.mode === "active"
    ) {
      for (const c of continuations) {
        c.removeAttribute("data-ccw-pause-continuation");
      }
      hideFooter();
      return;
    }

    if (hiddenCount === 0 || resolution.mode === "single_video") {
      // In single_video mode on `/watch`, pause `#related` continuations so sidebar doesn't infinite-fetch
      if (resolution.mode === "single_video") {
        for (const c of continuations) {
          c.setAttribute("data-ccw-pause-continuation", "true");
        }
      } else {
        for (const c of continuations) {
          c.removeAttribute("data-ccw-pause-continuation");
        }
      }
      hideFooter();
      return;
    }

    // On `/watch`, let `#related` finish populating its initial ~18–20 item sidebar batch first
    if (isWatchPage && totalResolved < 16) {
      for (const c of continuations) {
        c.removeAttribute("data-ccw-pause-continuation");
      }
      return;
    }

    // If user clicked "Check more videos", wait until 1 new batch arrives before re-pausing
    if (manualAllowBaseline >= 0) {
      if (totalResolved > manualAllowBaseline) {
        manualAllowBaseline = -1;
      } else {
        return;
      }
    }

    // Allow at most 1 automatic continuation batch when visible items < 4
    if (!autoBatchUsed && visibleCount < 4) {
      if (autoBatchBaseline < 0) {
        autoBatchBaseline = totalResolved;
        return;
      }
      if (totalResolved > autoBatchBaseline) {
        autoBatchUsed = true;
      } else {
        return;
      }
    } else if (visibleCount >= 6) {
      for (const c of continuations) {
        c.removeAttribute("data-ccw-pause-continuation");
      }
      hideFooter();
      return;
    }

    // Sparse filtered feed (`visibleCount < 6` and auto-batch already used or 4..5 visible):
    if (visibleCount < 6) {
      for (const c of continuations) {
        c.setAttribute("data-ccw-pause-continuation", "true");
      }

      const host = ensureFooterMounted();
      if (host && footerMessageEl && loadMoreBtn && endSessionBtn) {
        const calmLimit = state.formatCalmDuration(resolution.remainingSec);
        const noun = hiddenCount === 1 ? "video" : "videos";
        footerMessageEl.textContent = `Showing videos under ${calmLimit} · ${hiddenCount} longer ${noun} hidden`;
        loadMoreBtn.hidden = continuations.length === 0;
        endSessionBtn.hidden = visibleCount > 0;
        host.hidden = false;
      }
    }
  }

  function runFilterPass() {
    rafScheduled = false;
    if (!currentResolution) return;

    const { mode, state: snap } = currentResolution;
    const isUnlocked = mode === "active" || mode === "single_video";

    if (!isUnlocked || (mode === "active" && isCurrentPageExempt(snap.settings))) {
      clearAllFiltering();
      return;
    }

    // Search-Only home page hides the entire home grid anyway
    if (
      mode === "active" &&
      snap.settings.defaultLanding === "search_only" &&
      window.location.pathname === "/" &&
      !window.location.search
    ) {
      if (document.documentElement) {
        delete document.documentElement.dataset.ccwFilteringActive;
      }
      hideFooter();
      return;
    }

    if (document.documentElement) {
      document.documentElement.dataset.ccwFilteringActive = "true";
    }

    const candidates = document.querySelectorAll(CARD_SELECTOR);
    let visibleCount = 0;
    let hiddenCount = 0;

    for (const card of candidates) {
      if (isNestedInsideOuterCard(card)) continue;
      // Ignore elements inside cached inactive YouTube SPA route views
      if (card.closest(INACTIVE_PAGE_SELECTOR)) continue;

      const currentHref = getCardPrimaryHref(card);
      if (
        card.getAttribute("data-ccw-approved") === "true" &&
        card.getAttribute("data-ccw-href") !== currentHref
      ) {
        card.removeAttribute("data-ccw-approved");
      }

      const info = classifyCard(card);
      if (info.kind === "pending") continue;

      const hide = shouldHideCard(card, info, currentResolution);
      applyCardVisibility(card, hide, currentHref);

      if (info.kind !== "non_video") {
        if (card.getAttribute("data-ccw-filtered") === "true") {
          hiddenCount += 1;
        } else {
          visibleCount += 1;
        }
      }
    }

    // Hide shelves whose evaluated cards were all filtered out
    for (const shelf of document.querySelectorAll(SHELF_SELECTOR)) {
      if (shelf.closest(INACTIVE_PAGE_SELECTOR)) continue;
      const shelfCards = shelf.querySelectorAll(CARD_SELECTOR);
      if (shelfCards.length === 0) continue;

      let anyVisible = false;
      let anyEvaluated = false;
      for (const sc of shelfCards) {
        if (isNestedInsideOuterCard(sc)) continue;
        anyEvaluated = true;
        if (sc.getAttribute("data-ccw-filtered") !== "true") {
          anyVisible = true;
          break;
        }
      }

      if (anyEvaluated && !anyVisible) {
        setElementFiltered(shelf, true);
      } else if (shelf.getAttribute("data-ccw-filtered") === "true") {
        setElementFiltered(shelf, false);
      }
    }

    manageStarvationAndContinuations(visibleCount, hiddenCount, currentResolution);
  }

  function scheduleFilterPass() {
    if (rafScheduled) return;
    rafScheduled = true;
    window.requestAnimationFrame(runFilterPass);
  }

  function notifyNavigation() {
    autoBatchBaseline = -1;
    autoBatchUsed = false;
    manualAllowBaseline = -1;
    hideFooter();
    scheduleFilterPass();
  }

  /**
   * @param {{ onEndSession: () => Promise<void> }} callbacks
   */
  function init(callbacks) {
    filterCallbacks = callbacks;
    if (initialized) return;
    initialized = true;

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", syncFooterTheme);

    const attachObserver = () => {
      const target = document.documentElement;
      if (!target) return;
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.target instanceof Element && m.target.id === FOOTER_HOST_ID) {
            continue;
          }
          scheduleFilterPass();
          break;
        }
      });
      observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-label", "href", "overlay-style"],
      });
    };

    attachObserver();
  }

  /**
   * @param {CCWTabResolution} resolution
   */
  function update(resolution) {
    currentResolution = resolution;
    scheduleFilterPass();
  }

  CCW.feedFilter = Object.freeze({
    init,
    update,
    notifyNavigation,
  });
})();
