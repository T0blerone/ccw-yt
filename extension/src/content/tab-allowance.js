(() => {
  const SESSION_VIDEO_KEY = "ccw_yt_allowed_video_id";
  const SESSION_ORIGIN_KEY = "ccw_yt_allowed_video_origin";

  /** @type {{ videoId: string | null; origin: CCWSingleVideoOrigin | null }} */
  const initialStored = readSessionStorage();

  /** @type {string | null} */
  let memoryAllowedVideoId = initialStored.videoId;
  /** @type {CCWSingleVideoOrigin | null} */
  let memoryOrigin = initialStored.origin;

  /** @type {CCWSession | null} */
  let lastActiveSession = null;

  /**
   * @returns {{ videoId: string | null; origin: CCWSingleVideoOrigin | null }}
   */
  function readSessionStorage() {
    try {
      const rawId = window.sessionStorage.getItem(SESSION_VIDEO_KEY);
      const rawOrigin = window.sessionStorage.getItem(SESSION_ORIGIN_KEY);
      const videoId = rawId && rawId.trim().length > 0 ? rawId.trim() : null;
      const origin =
        rawOrigin === "overtime" || rawOrigin === "direct"
          ? rawOrigin
          : videoId
            ? "direct"
            : null;
      return { videoId, origin };
    } catch {
      return { videoId: null, origin: null };
    }
  }

  /**
   * @param {string | null} videoId
   * @param {CCWSingleVideoOrigin | null} origin
   */
  function writeSessionStorage(videoId, origin) {
    try {
      if (videoId && origin) {
        window.sessionStorage.setItem(SESSION_VIDEO_KEY, videoId);
        window.sessionStorage.setItem(SESSION_ORIGIN_KEY, origin);
      } else {
        window.sessionStorage.removeItem(SESSION_VIDEO_KEY);
        window.sessionStorage.removeItem(SESSION_ORIGIN_KEY);
      }
    } catch {
      // Ignore storage access errors under strict cookie/storage policies
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
   * Grants per-tab allowance for a single `/watch?v=...` video.
   *
   * @param {string} videoId
   * @param {CCWSingleVideoOrigin} [origin]
   */
  function grantSingleVideo(videoId, origin = "direct") {
    const trimmed = videoId.trim();
    if (!trimmed) return;
    memoryAllowedVideoId = trimmed;
    memoryOrigin = origin;
    writeSessionStorage(trimmed, origin);
  }

  /**
   * Clears any per-tab single-video allowance immediately.
   */
  function clearAllowedVideo() {
    memoryAllowedVideoId = null;
    memoryOrigin = null;
    writeSessionStorage(null, null);
  }

  /**
   * Resolves the effective lock/session mode for this tab.
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
        singleVideoOrigin: null,
        currentVideoId,
        state,
      };
    }

    if (lastActiveSession) {
      const expiredNaturally = now >= lastActiveSession.endsAt;
      lastActiveSession = null;

      if (expiredNaturally && currentVideoId && !isEnded) {
        grantSingleVideo(currentVideoId, "overtime");
      } else {
        clearAllowedVideo();
      }
    }

    if (memoryAllowedVideoId) {
      if (currentVideoId === memoryAllowedVideoId && !isEnded) {
        return {
          mode: "single_video",
          remainingSec: 0,
          cooldownRemainingSec: state.cooldownRemainingSec,
          allowedVideoId: memoryAllowedVideoId,
          singleVideoOrigin: memoryOrigin ?? "direct",
          currentVideoId,
          state,
        };
      }
      clearAllowedVideo();
    }

    if (state.cooldownRemainingSec > 0) {
      return {
        mode: "cooldown",
        remainingSec: 0,
        cooldownRemainingSec: state.cooldownRemainingSec,
        allowedVideoId: null,
        singleVideoOrigin: null,
        currentVideoId,
        state,
      };
    }

    return {
      mode: "locked",
      remainingSec: 0,
      cooldownRemainingSec: 0,
      allowedVideoId: null,
      singleVideoOrigin: null,
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
