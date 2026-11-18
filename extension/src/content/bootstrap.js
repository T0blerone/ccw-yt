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
  } = CCW;

  if (
    !state ||
    !tabAllowance ||
    !mediaGuard ||
    !entryGate ||
    !searchOnly
  ) {
    console.error("[ccw-yt] Missing required content modules.");
    return;
  }

  /** @type {CCWStateSnapshot | null} */
  let latestSnapshot = null;
  let lastObservedHref = window.location.href;
  let storageCleanPending = false;

  mediaGuard.init();

  /**
   * Builds a live snapshot from `latestSnapshot` using the current wall-clock timestamp.
   *
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
    const isEnded =
      Boolean(opts.forceVideoEnded) || mediaGuard.isMainVideoEnded();

    const resolution = tabAllowance.resolveTabState(live, {
      isCurrentVideoEnded: isEnded,
      urlString,
      now,
    });

    const docEl = document.documentElement;
    if (docEl) {
      docEl.dataset.ccwMode = resolution.mode;
    }

    const isUnlocked =
      resolution.mode === "active" || resolution.mode === "single_video";

    if (isUnlocked) {
      if (docEl) {
        docEl.dataset.ccwReady = "unlocked";
      }
      mediaGuard.setLocked(false);

      const isBareHome =
        window.location.pathname === "/" && !window.location.search;
      const showSearchOnly =
        resolution.mode === "active" &&
        live.settings.defaultLanding === "search_only" &&
        isBareHome;

      searchOnly.update(showSearchOnly);
      entryGate.update(resolution);
    } else {
      if (docEl) {
        delete docEl.dataset.ccwReady;
      }
      mediaGuard.setLocked(true);
      searchOnly.update(false);
      entryGate.update(resolution);
    }

    // Persist storage cleanup once when a session or cooldown crosses `0:00`.
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

  entryGate.init({
    async onStartTimedSession(minutes) {
      const result = await state.startTimedSession(minutes * 60);
      latestSnapshot = result.state;

      if (!result.ok) {
        syncUI();
        return;
      }

      const isBareHome =
        window.location.pathname === "/" && !window.location.search;
      if (isBareHome) {
        const targetPath = state.getLandingPath(
          result.state.settings.defaultLanding
        );
        if (targetPath !== "/") {
          // Stay cloaked on `/` while navigating directly to the configured landing screen.
          window.location.replace(targetPath);
          return;
        }
      }

      syncUI();
    },

    onGrantSingleVideo(videoId) {
      tabAllowance.grantSingleVideo(videoId);
      syncUI();
    },

    onOpenOptions() {
      ext.runtime.sendMessage({ type: MESSAGES.OPEN_OPTIONS }).catch((err) => {
        console.error("[ccw-yt] Failed to open options page:", err);
      });
    },
  });

  // SPA navigation & video completion listeners
  window.addEventListener("yt-navigate-start", (ev) => {
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
    syncUI();
  });

  window.addEventListener("popstate", () => {
    lastObservedHref = window.location.href;
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
        syncUI({ forceVideoEnded: true });
      }
    },
    true
  );

  // Initial load + cross-tab subscription + wall-clock tick
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
      syncUI();
      return;
    }

    if (
      latestSnapshot &&
      (latestSnapshot.session || latestSnapshot.cooldownUntil > 0)
    ) {
      syncUI();
    }
  }, 500);
})();
