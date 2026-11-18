(() => {
  if (window !== window.top) return;

  const {
    ext,
    MESSAGES,
    state,
    tabAllowance,
    mediaGuard,
    entryGate,
    searchOnly,
    hud,
    feedFilter,
    watchGuard,
    watchFocus,
    distractions,
  } = CCW;

  if (
    !state ||
    !tabAllowance ||
    !mediaGuard ||
    !entryGate ||
    !searchOnly ||
    !hud ||
    !feedFilter ||
    !watchGuard ||
    !watchFocus ||
    !distractions
  ) {
    console.error("[ccw-yt] Missing required content modules.");
    return;
  }

  /** @type {CCWStateSnapshot | null} */
  let latestSnapshot = null;
  let lastObservedHref = window.location.href;
  let storageCleanPending = false;
  /** @type {string | null} */
  let redirectingToPath = null;
  /** @type {CCWSingleVideoOrigin | null} */
  let previousSingleVideoOrigin = null;

  mediaGuard.init();

  /**
   * @param {string} urlString
   * @returns {boolean}
   */
  function isBareHomeUrl(urlString) {
    try {
      const url = new URL(urlString, window.location.origin);
      return url.pathname === "/" && !url.search;
    } catch {
      return false;
    }
  }

  /**
   * Finds YouTube's own sidebar/mini-guide SPA link for `targetPath` when available
   * so clicking the YouTube Logo/Home transitions smoothly without a full reload.
   *
   * @param {string} targetPath
   * @returns {HTMLAnchorElement | null}
   */
  function findSpaGuideAnchor(targetPath) {
    const candidates = document.querySelectorAll(
      "ytd-guide-entry-renderer a[href], ytd-mini-guide-entry-renderer a[href]"
    );
    for (const el of candidates) {
      if (!(el instanceof HTMLAnchorElement)) continue;
      try {
        const resolved = new URL(el.href, window.location.origin);
        if (`${resolved.pathname}${resolved.search}` === targetPath) {
          return el;
        }
      } catch {
        // Ignore malformed hrefs
      }
    }
    return null;
  }

  /**
   * @param {number} now
   * @returns {CCWStateSnapshot | null}
   */
  function getLiveSnapshot(now) {
    if (!latestSnapshot) return null;
    const remainingSec = state.getRemainingSeconds(latestSnapshot.session, now);
    const cooldownRemainingSec =
      latestSnapshot.cooldownUntil > now
        ? Math.ceil((latestSnapshot.cooldownUntil - now) / 1000)
        : 0;

    return {
      ...latestSnapshot,
      remainingSec,
      cooldownRemainingSec,
    };
  }

  /**
   * @param {{ urlOverride?: string; forceVideoEnded?: boolean }} [opts]
   */
  function syncUI(opts = {}) {
    const now = Date.now();
    const live = getLiveSnapshot(now);
    if (!live) return;

    const urlString = opts.urlOverride ?? window.location.href;
    if (!isBareHomeUrl(urlString)) {
      redirectingToPath = null;
    }

    // Apply site-wide distraction settings and redirect `/shorts/ID` -> `/watch?v=ID` before unlocking
    if (distractions.update(live.settings, urlString)) {
      if (document.documentElement) {
        delete document.documentElement.dataset.ccwReady;
      }
      return;
    }

    const isEnded =
      Boolean(opts.forceVideoEnded) || mediaGuard.isMainVideoEnded();
    const isLive = mediaGuard.isMainVideoLive();

    const resolution = tabAllowance.resolveTabState(live, {
      isCurrentVideoEnded: isEnded,
      isCurrentVideoLive: isLive,
      urlString,
      now,
    });

    const justFinishedOvertime =
      previousSingleVideoOrigin === "overtime" &&
      resolution.mode !== "single_video" &&
      resolution.mode !== "active";
    previousSingleVideoOrigin = resolution.singleVideoOrigin;

    if (justFinishedOvertime && live.settings.cooldownMinutes > 0) {
      state.startPostOvertimeCooldown(now).then(applySnapshot);
    }

    const docEl = document.documentElement;
    if (docEl) {
      const wasLocked1x = docEl.dataset.ccwLockSpeed1x === "true";
      docEl.dataset.ccwMode = resolution.mode;
      docEl.dataset.ccwBlockHold2x = String(live.settings.disableHold2x);
      docEl.dataset.ccwLockSpeed1x = String(live.settings.lockPlayback1x);
      if (!wasLocked1x && live.settings.lockPlayback1x) {
        window.dispatchEvent(new CustomEvent("ccw-enforce-1x"));
      }
    }

    // Whenever an active timed session hits bare `/` and Starting Screen has a non-`/` route,
    // keep `<html>` cloaked and redirect immediately so the Home feed never flashes.
    if (resolution.mode === "active" && isBareHomeUrl(urlString)) {
      const targetPath = state.getLandingPath(live.settings.defaultLanding);
      if (targetPath !== "/") {
        if (docEl) {
          delete docEl.dataset.ccwReady;
        }
        searchOnly.update(false);
        hud.update({ ...resolution, mode: "locked" });
        entryGate.update(resolution);
        if (redirectingToPath !== targetPath) {
          redirectingToPath = targetPath;
          window.location.replace(targetPath);
        }
        return;
      }
    }

    const isUnlocked =
      resolution.mode === "active" || resolution.mode === "single_video";

    if (isUnlocked) {
      if (docEl) {
        docEl.dataset.ccwReady = "unlocked";
      }
      mediaGuard.setLocked(false);

      const showSearchOnly =
        resolution.mode === "active" &&
        live.settings.defaultLanding === "search_only" &&
        isBareHomeUrl(urlString);

      searchOnly.update(showSearchOnly);
      hud.update(resolution);
      feedFilter.update(resolution);
      watchGuard.update(resolution);
      watchFocus.update(resolution);
      entryGate.update(resolution);
    } else {
      if (docEl) {
        delete docEl.dataset.ccwReady;
      }
      mediaGuard.setLocked(true);
      searchOnly.update(false);
      hud.update(resolution);
      feedFilter.update(resolution);
      watchGuard.update(resolution);
      watchFocus.update(resolution);
      entryGate.update(resolution);
    }

    const sessionJustExpired =
      Boolean(latestSnapshot?.session) && live.remainingSec <= 0;
    const cooldownJustExpired =
      (latestSnapshot?.cooldownUntil ?? 0) > 0 && live.cooldownRemainingSec <= 0;

    if ((sessionJustExpired || cooldownJustExpired) && !storageCleanPending) {
      storageCleanPending = true;
      state
        .getState(now)
        .then((fresh) => {
          storageCleanPending = false;
          applySnapshot(fresh);
        })
        .catch(() => {
          storageCleanPending = false;
        });
    }
  }

  /**
   * @param {CCWStateSnapshot} snapshot
   */
  function applySnapshot(snapshot) {
    latestSnapshot = snapshot;
    syncUI();
  }

  async function handleEndSessionNow() {
    tabAllowance.clearAllowedVideo();
    const next = await state.endSession({ reason: "manual" });
    applySnapshot(next);
  }

  entryGate.init({
    async onStartTimedSession(minutes) {
      const result = await state.startTimedSession(minutes * 60);
      latestSnapshot = result.state;
      syncUI();
    },

    onGrantSingleVideo(videoId) {
      tabAllowance.grantSingleVideo(videoId, "direct");
      syncUI();
    },

    onSettingsOverlayVisibilityChange(open) {
      if (!open) {
        syncUI();
      }
    },
  });

  hud.init({
    onOpenSettings() {
      entryGate.openSettings();
    },
    onEndSession: handleEndSessionNow,
  });

  feedFilter.init({
    onEndSession: handleEndSessionNow,
  });

  watchGuard.init({
    onGoBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = latestSnapshot
          ? state.getLandingPath(latestSnapshot.settings.defaultLanding)
          : "/";
        window.location.assign(fallback);
      }
    },

    onOpenSettings() {
      entryGate.openSettings();
    },
  });

  watchFocus.init();
  distractions.init();

  // Allow Toolbar Popup to open the in-page Settings view inside the current YouTube tab
  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (
      message &&
      typeof message === "object" &&
      "type" in message &&
      message.type === MESSAGES.OPEN_INPAGE_SETTINGS
    ) {
      entryGate.openSettings();
      sendResponse({ ok: true });
    }
    return false;
  });

  // Intercept unmodified clicks on YouTube's Logo or Home button (`href="/"`) during active sessions
  document.addEventListener(
    "click",
    (ev) => {
      if (
        ev.button !== 0 ||
        ev.metaKey ||
        ev.ctrlKey ||
        ev.shiftKey ||
        ev.altKey
      ) {
        return;
      }
      if (!(ev.target instanceof Element) || !latestSnapshot?.session) return;
      if (state.getRemainingSeconds(latestSnapshot.session) <= 0) return;

      const targetPath = state.getLandingPath(
        latestSnapshot.settings.defaultLanding
      );
      if (targetPath === "/") return;

      const anchor = ev.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isBareHomeUrl(anchor.href)) return;

      ev.preventDefault();
      ev.stopImmediatePropagation();

      const currentPathAndQuery = `${window.location.pathname}${window.location.search}`;
      if (currentPathAndQuery === targetPath) return;

      const spaLink = findSpaGuideAnchor(targetPath);
      if (spaLink) {
        spaLink.click();
      } else {
        window.location.assign(targetPath);
      }
    },
    true
  );

  // SPA navigation & video completion listeners
  window.addEventListener("yt-navigate-start", (ev) => {
    feedFilter.notifyNavigation();
    const customEv = /** @type {CustomEvent<{ url?: string }>} */ (ev);
    const nextRelUrl = customEv.detail?.url;
    if (typeof nextRelUrl === "string" && nextRelUrl.length > 0) {
      try {
        const resolved = new URL(nextRelUrl, window.location.origin).toString();
        syncUI({ urlOverride: resolved });
        return;
      } catch {
        // Fall through to current href check
      }
    }
    syncUI();
  });

  window.addEventListener("yt-navigate-finish", () => {
    lastObservedHref = window.location.href;
    feedFilter.notifyNavigation();
    syncUI();
  });

  window.addEventListener("popstate", () => {
    lastObservedHref = window.location.href;
    feedFilter.notifyNavigation();
    syncUI();
  });

  document.addEventListener(
    "ended",
    (ev) => {
      if (
        ev.target instanceof HTMLVideoElement &&
        !mediaGuard.isAdPlaying(ev.target) &&
        mediaGuard.isMainVideoEnded()
      ) {
        const vid = tabAllowance.getCurrentVideoId();
        if (vid) {
          watchFocus.markVideoFinished(vid);
        }
        syncUI({ forceVideoEnded: true });
      }
    },
    true
  );

  state
    .getState()
    .then(applySnapshot)
    .catch((err) => {
      console.error("[ccw-yt] Initial state load failed:", err);
    });

  state.subscribe(applySnapshot);

  window.setInterval(() => {
    if (window.location.href !== lastObservedHref) {
      lastObservedHref = window.location.href;
      feedFilter.notifyNavigation();
      syncUI();
      return;
    }

    if (
      latestSnapshot &&
      (latestSnapshot.session ||
        latestSnapshot.cooldownUntil > 0 ||
        Boolean(tabAllowance.getAllowedVideoId()))
    ) {
      syncUI();
    }
  }, 500);
})();
