/**
 * Runs in `"world": "MAIN"` at `document_start` to guard `HTMLMediaElement.prototype.playbackRate`
 * against YouTube's hold-to-2x ("Speedmaster") gesture without breaking normal clicks, scrubbing,
 * single-tap Spacebar play/pause, or intentional gear-menu speed selections.
 */
(() => {
  if (window !== window.top) return;

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    "playbackRate"
  );
  if (!descriptor || typeof descriptor.get !== "function" || typeof descriptor.set !== "function") {
    return;
  }

  const origGet = descriptor.get;
  const origSet = descriptor.set;

  const EXCLUDED_PLAYER_UI_SELECTOR = [
    ".ytp-chrome-bottom",
    ".ytp-chrome-top",
    ".ytp-settings-menu",
    ".ytp-popup",
    ".ytp-contextmenu",
    ".ytp-ce-element",
  ].join(", ");

  let videoSurfacePointerHeld = false;
  let spaceHeld = false;

  function isBlockHold2xEnabled() {
    const docEl = document.documentElement;
    if (!docEl) return true;
    const val = docEl.dataset.ccwBlockHold2x;
    // Default to enabled during the initial ~2ms before isolated-world settings hydrate
    return val === undefined ? true : val === "true";
  }

  function isLock1xEnabled() {
    return document.documentElement?.dataset.ccwLockSpeed1x === "true";
  }

  /**
   * @param {EventTarget | null} target
   * @returns {boolean}
   */
  function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    if (
      target.id === "ccw-yt-gate-host" ||
      target.id === "ccw-yt-search-host"
    ) {
      return true;
    }
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      return true;
    }
    return target instanceof HTMLElement && target.isContentEditable;
  }

  /**
   * @param {Event} ev
   */
  function handlePointerDown(ev) {
    if (!(ev.target instanceof Element)) return;
    const inPlayer = ev.target.closest(
      "#movie_player, ytd-player, ytd-reel-video-renderer"
    );
    if (!inPlayer) return;
    if (ev.target.closest(EXCLUDED_PLAYER_UI_SELECTOR)) return;
    videoSurfacePointerHeld = true;
  }

  function clearPointerHeld() {
    videoSurfacePointerHeld = false;
  }

  window.addEventListener("pointerdown", handlePointerDown, true);
  window.addEventListener("mousedown", handlePointerDown, true);
  window.addEventListener("touchstart", handlePointerDown, true);

  for (const upEvt of [
    "pointerup",
    "pointercancel",
    "mouseup",
    "touchend",
    "touchcancel",
    "contextmenu",
    "blur",
  ]) {
    window.addEventListener(upEvt, clearPointerHeld, true);
  }

  window.addEventListener(
    "keydown",
    (ev) => {
      if (isEditableTarget(ev.target)) return;

      if (ev.code === "Space" || ev.key === " ") {
        spaceHeld = true;
        if (ev.repeat && isBlockHold2xEnabled()) {
          ev.stopImmediatePropagation();
          ev.preventDefault();
        }
        return;
      }

      if (
        isLock1xEnabled() &&
        ev.shiftKey &&
        (ev.key === ">" ||
          ev.key === "<" ||
          ev.code === "Period" ||
          ev.code === "Comma")
      ) {
        ev.stopImmediatePropagation();
        ev.preventDefault();
      }
    },
    true
  );

  window.addEventListener(
    "keyup",
    (ev) => {
      if (ev.code === "Space" || ev.key === " ") {
        spaceHeld = false;
      }
    },
    true
  );

  window.addEventListener("blur", () => {
    spaceHeld = false;
  });

  Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      return origGet.call(this);
    },
    set(value) {
      const numeric = Number(value);

      if (isLock1xEnabled()) {
        origSet.call(this, 1);
        return;
      }

      if (
        isBlockHold2xEnabled() &&
        (videoSurfacePointerHeld || spaceHeld) &&
        Number.isFinite(numeric) &&
        Math.abs(numeric - 2) < 0.001
      ) {
        return;
      }

      origSet.call(this, value);
    },
  });

  function enforce1xOnExistingMedia() {
    if (!isLock1xEnabled()) return;
    for (const media of document.querySelectorAll("video, audio")) {
      if (media instanceof HTMLMediaElement && origGet.call(media) !== 1) {
        origSet.call(media, 1);
      }
    }
  }

  if (document.documentElement) {
    const attrObserver = new MutationObserver(enforce1xOnExistingMedia);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ccw-lock-speed-1x"],
    });
  }
})();
