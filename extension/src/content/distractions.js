(() => {
  /** @type {CCWSettings | null} */
  let currentSettings = null;
  /** @type {string | null} */
  let redirectingShortId = null;
  let lastAutonavToggleMs = 0;
  let initialized = false;

  /**
   * Extracts `VIDEO_ID` from a `/shorts/VIDEO_ID` URL, or `null` if not a Shorts watch route.
   *
   * @param {string} urlString
   * @returns {string | null}
   */
  function extractShortsId(urlString) {
    try {
      const url = new URL(urlString, window.location.origin);
      if (!url.pathname.startsWith("/shorts/")) return null;
      const id = url.pathname.slice("/shorts/".length).split("/")[0]?.trim() || "";
      return id.length > 0 ? id : null;
    } catch {
      return null;
    }
  }

  function sanitizeDocumentTitle() {
    if (!currentSettings?.hideNotificationBell) return;
    if (/^\(\d+\)\s+/.test(document.title)) {
      document.title = document.title.replace(/^\(\d+\)\s+/, "");
    }
  }

  function enforceAutoplayOff() {
    if (!currentSettings?.disableAutoplayNext) return;
    if (window.location.pathname !== "/watch") return;

    const now = Date.now();
    if (now - lastAutonavToggleMs < 2500) return;

    const checkedToggle = document.querySelector(
      '#movie_player .ytp-autonav-toggle-button[aria-checked="true"]'
    );
    if (!(checkedToggle instanceof HTMLElement)) return;

    const button =
      checkedToggle.closest('button.ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"]') ||
      checkedToggle.closest("button.ytp-button") ||
      checkedToggle;

    if (button instanceof HTMLElement) {
      lastAutonavToggleMs = now;
      button.click();
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    // Intercept inline `/shorts/XYZ` links (e.g. inside comments or descriptions) when Hide Shorts is active
    document.addEventListener(
      "click",
      (ev) => {
        if (
          !currentSettings?.hideShorts ||
          ev.button !== 0 ||
          ev.metaKey ||
          ev.ctrlKey ||
          ev.shiftKey ||
          ev.altKey
        ) {
          return;
        }
        if (!(ev.target instanceof Element)) return;
        const anchor = ev.target.closest('a[href*="/shorts/"]');
        if (!(anchor instanceof HTMLAnchorElement)) return;

        const shortId = extractShortsId(anchor.href);
        if (!shortId) return;

        ev.preventDefault();
        ev.stopImmediatePropagation();
        window.location.assign(`/watch?v=${encodeURIComponent(shortId)}`);
      },
      true
    );

    const observeHead = () => {
      if (!document.head) return;
      const titleObserver = new MutationObserver(sanitizeDocumentTitle);
      titleObserver.observe(document.head, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    };

    if (document.head) {
      observeHead();
    } else {
      document.addEventListener("DOMContentLoaded", observeHead, {
        once: true,
      });
    }

    document.addEventListener("loadedmetadata", enforceAutoplayOff, true);
    window.addEventListener("yt-navigate-finish", enforceAutoplayOff);
  }

  /**
   * Applies site-wide distraction attributes and redirects `/shorts/ID` -> `/watch?v=ID`
   * when `hideShorts` is active. Returns `true` if a `/shorts/` redirect is in progress.
   *
   * @param {CCWSettings} settings
   * @param {string} [urlOverride]
   * @returns {boolean}
   */
  function update(settings, urlOverride) {
    currentSettings = settings;

    const docEl = document.documentElement;
    if (docEl) {
      docEl.dataset.ccwHideShorts = String(settings.hideShorts);
      docEl.dataset.ccwThumbnails = settings.thumbnailMode;
      docEl.dataset.ccwDisableAutoplay = String(settings.disableAutoplayNext);
      docEl.dataset.ccwHideEndscreens = String(settings.hideEndScreenCards);
      docEl.dataset.ccwCleanSidebar = String(settings.hideExploreSidebar);
      docEl.dataset.ccwHideBell = String(settings.hideNotificationBell);
      docEl.dataset.ccwHidePosts = String(settings.hideCommunityPosts);
      docEl.dataset.ccwHideMerch = String(settings.hideMerchAndPlayables);
      docEl.dataset.ccwHideLiveChat = String(settings.hideLiveChat);
    }

    sanitizeDocumentTitle();
    enforceAutoplayOff();

    const targetUrl = urlOverride ?? window.location.href;
    const shortId = extractShortsId(targetUrl);

    if (!shortId) {
      redirectingShortId = null;
      return false;
    }

    if (settings.hideShorts) {
      if (redirectingShortId !== shortId) {
        redirectingShortId = shortId;
        window.location.replace(`/watch?v=${encodeURIComponent(shortId)}`);
      }
      return true;
    }

    return false;
  }

  CCW.distractions = Object.freeze({
    init,
    update,
  });
})();
