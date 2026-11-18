(() => {
  let locked = true;
  let initialized = false;

  /** @type {WeakSet<HTMLMediaElement>} */
  const pausedByGuard = new WeakSet();

  const MAIN_VIDEO_SELECTOR =
    "#movie_player video.html5-main-video, ytd-player video.html5-main-video, video.html5-main-video";

  /**
   * Checks whether YouTube is currently playing an ad inside the main player container.
   * Prevents ad completion from falsely triggering main-video `ended` session locks.
   *
   * @param {HTMLMediaElement | null} [videoEl]
   * @returns {boolean}
   */
  function isAdPlaying(videoEl = null) {
    if (videoEl && videoEl.closest(".ad-showing, .ad-interrupting")) {
      return true;
    }
    return Boolean(
      document.querySelector("#movie_player.ad-showing, #movie_player.ad-interrupting")
    );
  }

  /**
   * @returns {HTMLVideoElement | null}
   */
  function getMainVideo() {
    return /** @type {HTMLVideoElement | null} */ (
      document.querySelector(MAIN_VIDEO_SELECTOR)
    );
  }

  /**
   * Returns true only when the actual content video (not an ad) has finished playing.
   *
   * @returns {boolean}
   */
  function isMainVideoEnded() {
    const video = getMainVideo();
    if (!video) return false;
    if (isAdPlaying(video)) return false;
    return video.ended && Number.isFinite(video.duration) && video.duration > 0;
  }

  /**
   * @param {HTMLMediaElement} media
   */
  function suppressMedia(media) {
    if (!media.paused) {
      pausedByGuard.add(media);
      media.pause();
    }
  }

  function pauseAllActiveMedia() {
    const elements = document.querySelectorAll("video, audio");
    for (const el of elements) {
      if (el instanceof HTMLMediaElement) {
        suppressMedia(el);
      }
    }
  }

  function resumeGuardedMainVideo() {
    if (window.location.pathname !== "/watch") return;
    const video = getMainVideo();
    if (video && pausedByGuard.has(video) && video.paused && !video.ended) {
      pausedByGuard.delete(video);
      video.play().catch(() => {
        // Autoplay policy may require direct user click on player; safe to ignore.
      });
    }
  }

  /**
   * @param {Event} event
   */
  function handleMediaPlayCapture(event) {
    if (!locked) return;
    if (event.target instanceof HTMLMediaElement) {
      suppressMedia(event.target);
    }
  }

  /**
   * Blocks unmodified YouTube global hotkeys (Space, k, m, f, 0-9, /) when focus
   * sits outside our Entry Gate while locked.
   *
   * @param {KeyboardEvent} event
   */
  function handleLockedKeyCapture(event) {
    if (!locked) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const gateHost = document.getElementById("ccw-yt-gate-host");
    if (gateHost && event.composedPath().includes(gateHost)) {
      return;
    }

    if (event.key === "Tab") return;

    event.stopImmediatePropagation();
    event.preventDefault();
  }

  function init() {
    if (initialized) return;
    initialized = true;

    document.addEventListener("play", handleMediaPlayCapture, true);
    document.addEventListener("playing", handleMediaPlayCapture, true);
    window.addEventListener("keydown", handleLockedKeyCapture, true);
    window.addEventListener("keypress", handleLockedKeyCapture, true);
    window.addEventListener("keyup", handleLockedKeyCapture, true);
  }

  /**
   * @param {boolean} nextLocked
   */
  function setLocked(nextLocked) {
    const wasLocked = locked;
    locked = nextLocked;

    if (locked) {
      pauseAllActiveMedia();
    } else if (wasLocked) {
      resumeGuardedMainVideo();
    }
  }

  CCW.mediaGuard = Object.freeze({
    init,
    setLocked,
    isAdPlaying,
    isMainVideoEnded,
  });
})();
