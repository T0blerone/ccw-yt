(() => {
  const SESSION_STORAGE_KEY = "ccw_yt_allowed_video_id";

  /** @type {string | null} */
  let memoryAllowedVideoId = readSessionStorage();

  /** @type {CCWSession | null} */
  let lastActiveSession = null;

  /**
   * @returns {string | null}
   */
  function readSessionStorage() {
    try {
      const value = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return value && value.trim().length > 0 ? value : null;
    } catch {
      return null;
    }
  }

  /**
   * @param {string | null} videoId
   */
  function writeSessionStorage(videoId) {
    try {
      if (videoId) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, videoId);
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors under strict cookie/storage policies;
      // `memoryAllowedVideoId` still tracks allowance for the lifetime of the document.
    }
  }

  /**
   * Extracts the `/watch?v=...` video ID, returning `null` for feeds, Shorts, or other routes.
   *
   * @param {string} [urlString]
   * @returns {string | null}
   */
  function getCurrentVideoId(urlString = window.location.href) {
    try {
      const url = new URL(urlString);
      if (url.pathname !== "/watch") return null;
      const v = url.searchParams.get("v");
      return v && v.trim().length > 0 ? v.trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * @returns {string | null}
   */
  function getAllowedVideoId() {
    return memoryAllowedVideoId;
  }

  /**
   * Grants per-tab allowance for a single `/watch?v=...` video
   * (used by "Just Watch This Video" and natural `0:00` overtime grace).
   *
   * @param {string} videoId
   */
  function grantSingleVideo(videoId) {
    const trimmed = videoId.trim();
    if (!trimmed) return;
    memoryAllowedVideoId = trimmed;
    writeSessionStorage(trimmed);
  }

  /**
   * Clears any per-tab single-video allowance immediately.
   */
  function clearAllowedVideo() {
    memoryAllowedVideoId = null;
    writeSessionStorage(null);
  }

  /**
   * Resolves the effective lock/session mode for this tab.
   * Distinguishes natural `0:00` expiration (which grants single-video grace if
   * currently watching a `/watch?v=` video) from manual "End Session Early"
   * (which locks immediately without grace).
   *
   * @param {CCWStateSnapshot} state
   * @param {{
   *   wasSessionActiveInTab?: boolean;
   *   isCurrentVideoEnded?: boolean;
   *   urlString?: string;
   *   now?: number;
   * }} [options]
   * @returns {CCWTabResolution}
   */
  function resolveTabState(state, options = {}) {
    const now = options.now ?? Date.now();
    const currentVideoId = getCurrentVideoId(options.urlString);
    const isEnded = Boolean(options.isCurrentVideoEnded);

    // Active global timed session supersedes any prior single-video allowance.
    if (state.session && state.remainingSec > 0) {
      lastActiveSession = state.session;
      if (memoryAllowedVideoId) {
        clearAllowedVideo();
      }
      return {
        mode: "active",
        remainingSec: state.remainingSec,
        cooldownRemainingSec: 0,
        allowedVideoId: null,
        currentVideoId,
        state,
      };
    }

    // Transition out of an active timed session in this tab:
    if (lastActiveSession) {
      const expiredNaturally = now >= lastActiveSession.endsAt;
      lastActiveSession = null;

      if (expiredNaturally && currentVideoId && !isEnded) {
        grantSingleVideo(currentVideoId);
      } else {
        clearAllowedVideo();
      }
    }

    // Validate any existing single-video allowance against current URL & playback state:
    if (memoryAllowedVideoId) {
      if (currentVideoId === memoryAllowedVideoId && !isEnded) {
        return {
          mode: "single_video",
          remainingSec: 0,
          cooldownRemainingSec: state.cooldownRemainingSec,
          allowedVideoId: memoryAllowedVideoId,
          currentVideoId,
          state,
        };
      }
      // Navigated away from the allowed video or playback finished -> revoke immediately.
      clearAllowedVideo();
    }

    if (state.cooldownRemainingSec > 0) {
      return {
        mode: "cooldown",
        remainingSec: 0,
        cooldownRemainingSec: state.cooldownRemainingSec,
        allowedVideoId: null,
        currentVideoId,
        state,
      };
    }

    return {
      mode: "locked",
      remainingSec: 0,
      cooldownRemainingSec: 0,
      allowedVideoId: null,
      currentVideoId,
      state,
    };
  }

  CCW.tabAllowance = Object.freeze({
    getCurrentVideoId,
    getAllowedVideoId,
    grantSingleVideo,
    clearAllowedVideo,
    resolveTabState,
  });
})();
