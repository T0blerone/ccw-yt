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
  if (
    !descriptor ||
    typeof descriptor.get !== "function" ||
    typeof descriptor.set !== "function"
  ) {
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

  /** @type {Set<HTMLElement>} */
  const temporarilyHiddenPills = new Set();

  function isBlockHold2xEnabled() {
    const docEl = document.documentElement;
    if (!docEl) return true;
    const val = docEl.dataset.ccwBlockHold2x;
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
   * Hides YouTube's "2x" hold pill inside `#movie_player` (both `.ytp-speedmaster-*`
   * and newer bezel/pill variants) when a hold gesture is blocked.
   */
  function suppressActive2xPill() {
    const player = document.getElementById("movie_player");
    if (!player) return;

    for (const el of player.querySelectorAll('[class*="speedmaster"]')) {
      if (el instanceof HTMLElement) {
        el.style.setProperty("display", "none", "important");
      }
    }

    // Also catch modern bezel/tooltip pills displaying "2x" outside menus/controls
    for (const node of player.querySelectorAll("*")) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.children.length > 0) continue;
      if (node.closest(EXCLUDED_PLAYER_UI_SELECTOR)) continue;

      const txt = (node.textContent || "").trim();
      if (/^2x$/i.test(txt) || /^2(\.0)?x\s*»*$/i.test(txt)) {
        const pill =
          node.closest(
            '[class*="speedmaster"], .ytp-bezel-text-wrapper, [class*="overlay"], [class*="pill"]'
          ) || node.parentElement;
        if (
          pill instanceof HTMLElement &&
          pill !== player &&
          !pill.classList.contains("html5-video-container")
        ) {
          pill.style.setProperty("visibility", "hidden", "important");
          pill.style.setProperty("opacity", "0", "important");
          temporarilyHiddenPills.add(pill);
        }
      }
    }
  }

  function restoreTemporaryPills() {
    for (const pill of temporarilyHiddenPills) {
      if (!Array.from(pill.classList).some((c) => c.includes("speedmaster"))) {
        pill.style.removeProperty("visibility");
        pill.style.removeProperty("opacity");
      }
    }
    temporarilyHiddenPills.clear();
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
    if (videoSurfacePointerHeld) {
      videoSurfacePointerHeld = false;
      window.setTimeout(restoreTemporaryPills, 60);
    }
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
        window.setTimeout(restoreTemporaryPills, 60);
      }
    },
    true
  );

  window.addEventListener("blur", () => {
    spaceHeld = false;
    restoreTemporaryPills();
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
        if ((videoSurfacePointerHeld || spaceHeld) && Math.abs(numeric - 2) < 0.001) {
          suppressActive2xPill();
          window.requestAnimationFrame(suppressActive2xPill);
        }
        origSet.call(this, 1);
        return;
      }

      if (
        isBlockHold2xEnabled() &&
        (videoSurfacePointerHeld || spaceHeld) &&
        Number.isFinite(numeric) &&
        Math.abs(numeric - 2) < 0.001
      ) {
        suppressActive2xPill();
        window.requestAnimationFrame(suppressActive2xPill);
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

    // Also update YouTube's internal player API state so the gear menu reflects "Normal"
    const player = /** @type {HTMLElement & { setPlaybackRate?: (r: number) => void } | null} */ (
      document.getElementById("movie_player")
    );
    if (player && typeof player.setPlaybackRate === "function") {
      try {
        player.setPlaybackRate(1);
      } catch {
        // Ignore player API errors if player is mid-initialization
      }
    }
  }

  window.addEventListener("ccw-enforce-1x", enforce1xOnExistingMedia);

  const attachAttrObserver = () => {
    if (!document.documentElement) return;
    const attrObserver = new MutationObserver(enforce1xOnExistingMedia);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ccw-lock-speed-1x"],
    });
    enforce1xOnExistingMedia();
  };

  if (document.documentElement) {
    attachAttrObserver();
  } else {
    document.addEventListener("DOMContentLoaded", attachAttrObserver, {
      once: true,
    });
  }
})();
