(() => {
  const { icons, mediaGuard, feedFilter } = CCW;

  const EARLY_BTN_HOST_ID = "ccw-yt-early-comments-host";

  const EARLY_BTN_STYLES = `
    :host {
      all: initial;
      display: block !important;
      margin: 18px 0 28px !important;
    }

    :host([hidden]) {
      display: none !important;
    }

    * {
      box-sizing: border-box;
    }

    .early-wrap {
      --border: rgba(20, 24, 32, 0.12);
      --surface-hover: rgba(20, 24, 32, 0.06);
      --muted: #606060;
      --fg: #0f0f0f;

      display: flex;
      justify-content: flex-start;
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .early-wrap[data-theme="dark"] {
      --border: rgba(255, 255, 255, 0.14);
      --surface-hover: rgba(255, 255, 255, 0.08);
      --muted: #aaaaaa;
      --fg: #f1f1f1;
    }

    .early-btn {
      appearance: none;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 7px 14px;
      background: transparent;
      color: var(--muted);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
    }

    .early-btn:hover,
    .early-btn:focus-visible {
      background: var(--surface-hover);
      color: var(--fg);
      outline: none;
    }
  `;

  /** @type {CCWTabResolution | null} */
  let latestResolution = null;
  /** @type {string | null} */
  let activeVisitVideoId = null;
  let finishedCurrentVisitVideo = false;
  let earlyCommentsRevealed = false;
  let wasCentered = false;
  let initialized = false;
  let rafScheduled = false;

  /** @type {HTMLDivElement | null} */
  let earlyBtnHost = null;
  /** @type {HTMLDivElement | null} */
  let earlyBtnWrap = null;

  function syncTheme() {
    if (!earlyBtnWrap) return;
    const htmlDark = document.documentElement?.hasAttribute("dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    earlyBtnWrap.dataset.theme = htmlDark || prefersDark ? "dark" : "light";
  }

  /**
   * Checks whether YouTube's right `#secondary` column is currently displaying an active
   * Playlist queue, expanded Chapters/Transcript engagement panel, or Live Chat.
   *
   * @returns {boolean}
   */
  function hasActiveSecondaryPanel() {
    const playlist = document.querySelector(
      "ytd-watch-flexy #secondary ytd-playlist-panel-renderer:not([hidden])"
    );
    if (playlist && !playlist.querySelector("#container[hidden]")) {
      return true;
    }

    const engagement = document.querySelector(
      'ytd-watch-flexy #secondary ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]'
    );
    if (engagement) {
      return true;
    }

    const liveChat = document.querySelector(
      "ytd-watch-flexy #secondary ytd-live-chat-frame:not([hidden]):not([collapsed])"
    );
    if (liveChat && liveChat.children.length > 0) {
      return true;
    }

    return false;
  }

  function wakeLazyObservers() {
    const nudge = () => {
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("scroll"));
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
    };
    nudge();
    window.requestAnimationFrame(nudge);
    window.setTimeout(nudge, 80);
  }

  function ensureEarlyButtonMounted() {
    const commentsEl = document.querySelector("ytd-watch-flexy ytd-comments#comments");
    const belowContainer =
      commentsEl?.parentElement ||
      document.querySelector("ytd-watch-flexy #below, ytd-watch-flexy #primary-inner");
    if (!belowContainer) return null;

    if (!earlyBtnHost) {
      earlyBtnHost = document.createElement("div");
      earlyBtnHost.id = EARLY_BTN_HOST_ID;
      earlyBtnHost.hidden = true;

      const shadow = earlyBtnHost.attachShadow({ mode: "open" });

      const styleEl = document.createElement("style");
      styleEl.textContent = EARLY_BTN_STYLES;

      earlyBtnWrap = document.createElement("div");
      earlyBtnWrap.className = "early-wrap";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "early-btn";
      btn.appendChild(icons.create("chat-circle", 16));
      const label = document.createElement("span");
      label.textContent = "Show comments";
      btn.appendChild(label);

      btn.addEventListener("click", () => {
        earlyCommentsRevealed = true;
        applyFocusState();
        wakeLazyObservers();
      });

      earlyBtnWrap.appendChild(btn);
      shadow.append(styleEl, earlyBtnWrap);
    }

    if (commentsEl && commentsEl.parentElement === belowContainer) {
      if (earlyBtnHost.nextElementSibling !== commentsEl) {
        belowContainer.insertBefore(earlyBtnHost, commentsEl);
      }
    } else if (earlyBtnHost.parentElement !== belowContainer) {
      belowContainer.appendChild(earlyBtnHost);
    }

    syncTheme();
    return earlyBtnHost;
  }

  function hideEarlyButton() {
    if (earlyBtnHost) {
      earlyBtnHost.hidden = true;
    }
  }

  function clearWatchAttributes() {
    const docEl = document.documentElement;
    if (!docEl) return;
    delete docEl.dataset.ccwHideWatchRecs;
    delete docEl.dataset.ccwHideComments;
    if (wasCentered) {
      wasCentered = false;
      delete docEl.dataset.ccwCenterWatch;
      window.dispatchEvent(new Event("resize"));
    }
    hideEarlyButton();
  }

  function applyFocusState() {
    rafScheduled = false;
    const docEl = document.documentElement;
    if (!docEl || !latestResolution) return;

    const { mode, currentVideoId, state: snap } = latestResolution;
    const isUnlocked = mode === "active" || mode === "single_video";

    if (!isUnlocked || !currentVideoId) {
      if (!currentVideoId) {
        activeVisitVideoId = null;
        finishedCurrentVisitVideo = false;
        earlyCommentsRevealed = false;
      }
      clearWatchAttributes();
      return;
    }

    if (currentVideoId !== activeVisitVideoId) {
      activeVisitVideoId = currentVideoId;
      finishedCurrentVisitVideo = false;
      earlyCommentsRevealed = false;
    }

    if (!finishedCurrentVisitVideo && mediaGuard.isMainVideoEnded()) {
      finishedCurrentVisitVideo = true;
    }

    const { watchRecsMode, commentsMode, showEarlyCommentsButton } = snap.settings;

    // 1. Watch-page recommendations (`#related` & player end-cards)
    // In `single_video` / overtime (`0:00`) mode, recommendations always stay hidden.
    const hideRecs =
      mode === "single_video" ||
      watchRecsMode === "hidden" ||
      (watchRecsMode === "after_video" && !finishedCurrentVisitVideo);

    const prevHideRecs = docEl.dataset.ccwHideWatchRecs === "true";
    if (hideRecs) {
      docEl.dataset.ccwHideWatchRecs = "true";
    } else {
      delete docEl.dataset.ccwHideWatchRecs;
      if (prevHideRecs) {
        feedFilter.notifyNavigation();
        feedFilter.update(latestResolution);
        wakeLazyObservers();
      }
    }

    // 2. Smart centering when recommendations are hidden and `#secondary` has no open panel
    const shouldCenter = hideRecs && !hasActiveSecondaryPanel();
    if (shouldCenter) {
      docEl.dataset.ccwCenterWatch = "true";
      if (!wasCentered) {
        wasCentered = true;
        window.dispatchEvent(new Event("resize"));
      }
    } else {
      delete docEl.dataset.ccwCenterWatch;
      if (wasCentered) {
        wasCentered = false;
        window.dispatchEvent(new Event("resize"));
      }
    }

    // 3. Comments (`ytd-comments#comments` + `#comment-teaser`)
    const hideComments =
      commentsMode === "hidden" ||
      (commentsMode === "after_video" &&
        !finishedCurrentVisitVideo &&
        !earlyCommentsRevealed);

    const prevHideComments = docEl.dataset.ccwHideComments === "true";
    if (hideComments) {
      docEl.dataset.ccwHideComments = "true";
    } else {
      delete docEl.dataset.ccwHideComments;
      if (prevHideComments) {
        wakeLazyObservers();
      }
    }

    // 4. Optional understated "Show comments" button while watching
    const shouldShowEarlyBtn =
      hideComments &&
      commentsMode === "after_video" &&
      showEarlyCommentsButton;

    if (shouldShowEarlyBtn) {
      const host = ensureEarlyButtonMounted();
      if (host) host.hidden = false;
    } else {
      hideEarlyButton();
    }
  }

  function scheduleSync() {
    if (rafScheduled) return;
    rafScheduled = true;
    window.requestAnimationFrame(applyFocusState);
  }

  /**
   * @param {string} videoId
   */
  function markVideoFinished(videoId) {
    if (videoId && videoId === activeVisitVideoId) {
      finishedCurrentVisitVideo = true;
      applyFocusState();
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", syncTheme);

    if (document.documentElement) {
      const observer = new MutationObserver((mutations) => {
        if (!latestResolution?.currentVideoId) return;
        for (const m of mutations) {
          if (
            m.target instanceof Element &&
            m.target.id === EARLY_BTN_HOST_ID
          ) {
            continue;
          }
          scheduleSync();
          break;
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["hidden", "visibility", "collapsed", "dark"],
      });
    }
  }

  /**
   * @param {CCWTabResolution} resolution
   */
  function update(resolution) {
    latestResolution = resolution;
    syncTheme();
    applyFocusState();
  }

  CCW.watchFocus = Object.freeze({
    init,
    update,
    markVideoFinished,
  });
})();
