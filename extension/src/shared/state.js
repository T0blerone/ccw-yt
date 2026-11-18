(() => {
  const { ext } = CCW;

  const SCHEMA_VERSION = 1;
  const MISCLICK_GRACE_MS = 10_000;
  const MIN_DURATION_SEC = 10;
  const MAX_DURATION_SEC = 12 * 3600;
  const MIN_DEFAULT_MINUTES = 1;
  const MAX_DEFAULT_MINUTES = 240;
  const MAX_COOLDOWN_MINUTES = 240;

  const KEYS = Object.freeze({
    SCHEMA_VERSION: "schemaVersion",
    SESSION: "session",
    COOLDOWN_UNTIL: "cooldownUntil",
    SETTINGS: "settings",
  });

  /** @type {Readonly<Record<CCWLandingTarget, string>>} */
  const LANDING_PATHS = Object.freeze({
    home: "/",
    subscriptions: "/feed/subscriptions",
    search_only: "/",
    watch_later: "/playlist?list=WL",
    library: "/feed/you",
    history: "/feed/history",
  });

  /** @type {Readonly<Set<CCWTimerVisibility>>} */
  const VALID_TIMER_VISIBILITY = new Set(["always", "feeds_only", "hidden"]);

  /** @type {Readonly<Set<CCWWatchElementMode>>} */
  const VALID_WATCH_ELEMENT_MODES = new Set(["always", "after_video", "hidden"]);

  /** @type {Readonly<CCWSettings>} */
  const DEFAULT_SETTINGS = Object.freeze({
    defaultMinutes: 20,
    cooldownMinutes: 0,
    defaultLanding: "home",
    timerVisibility: "always",
    allowLiveStreams: false,
    blockOverBudgetWatch: true,
    exemptSearch: false,
    exemptChannels: false,
    exemptPlaylistsAndHistory: false,
    watchRecsMode: "after_video",
    commentsMode: "after_video",
    showEarlyCommentsButton: true,
    disableHold2x: true,
    lockPlayback1x: false,
  });

  /**
   * @param {unknown} value
   * @returns {number}
   */
  function parseTimestamp(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? value
      : 0;
  }

  /**
   * @param {unknown} raw
   * @returns {CCWSession | null}
   */
  function parseSession(raw) {
    if (!raw || typeof raw !== "object") return null;
    const candidate = /** @type {Record<string, unknown>} */ (raw);
    const { startedAt, endsAt, durationSec } = candidate;
    if (
      typeof startedAt !== "number" ||
      !Number.isFinite(startedAt) ||
      typeof endsAt !== "number" ||
      !Number.isFinite(endsAt) ||
      typeof durationSec !== "number" ||
      !Number.isFinite(durationSec) ||
      endsAt <= startedAt ||
      durationSec <= 0
    ) {
      return null;
    }
    return { startedAt, endsAt, durationSec };
  }

  /**
   * @param {unknown} raw
   * @returns {CCWSettings}
   */
  function sanitizeSettings(raw) {
    const src =
      raw && typeof raw === "object"
        ? /** @type {Record<string, unknown>} */ (raw)
        : {};

    let defaultMinutes = DEFAULT_SETTINGS.defaultMinutes;
    if (typeof src.defaultMinutes === "number" && Number.isFinite(src.defaultMinutes)) {
      defaultMinutes = Math.max(
        MIN_DEFAULT_MINUTES,
        Math.min(MAX_DEFAULT_MINUTES, Math.round(src.defaultMinutes))
      );
    }

    let cooldownMinutes = DEFAULT_SETTINGS.cooldownMinutes;
    if (typeof src.cooldownMinutes === "number" && Number.isFinite(src.cooldownMinutes)) {
      cooldownMinutes = Math.max(
        0,
        Math.min(MAX_COOLDOWN_MINUTES, Math.round(src.cooldownMinutes))
      );
    }

    /** @type {CCWLandingTarget} */
    let defaultLanding = DEFAULT_SETTINGS.defaultLanding;
    if (
      typeof src.defaultLanding === "string" &&
      Object.prototype.hasOwnProperty.call(LANDING_PATHS, src.defaultLanding)
    ) {
      defaultLanding = /** @type {CCWLandingTarget} */ (src.defaultLanding);
    }

    /** @type {CCWTimerVisibility} */
    let timerVisibility = DEFAULT_SETTINGS.timerVisibility;
    if (
      typeof src.timerVisibility === "string" &&
      VALID_TIMER_VISIBILITY.has(/** @type {CCWTimerVisibility} */ (src.timerVisibility))
    ) {
      timerVisibility = /** @type {CCWTimerVisibility} */ (src.timerVisibility);
    }

    const allowLiveStreams =
      typeof src.allowLiveStreams === "boolean"
        ? src.allowLiveStreams
        : DEFAULT_SETTINGS.allowLiveStreams;
    const blockOverBudgetWatch =
      typeof src.blockOverBudgetWatch === "boolean"
        ? src.blockOverBudgetWatch
        : DEFAULT_SETTINGS.blockOverBudgetWatch;
    const exemptSearch =
      typeof src.exemptSearch === "boolean"
        ? src.exemptSearch
        : DEFAULT_SETTINGS.exemptSearch;
    const exemptChannels =
      typeof src.exemptChannels === "boolean"
        ? src.exemptChannels
        : DEFAULT_SETTINGS.exemptChannels;
    const exemptPlaylistsAndHistory =
      typeof src.exemptPlaylistsAndHistory === "boolean"
        ? src.exemptPlaylistsAndHistory
        : DEFAULT_SETTINGS.exemptPlaylistsAndHistory;

    /** @type {CCWWatchElementMode} */
    let watchRecsMode = DEFAULT_SETTINGS.watchRecsMode;
    if (
      typeof src.watchRecsMode === "string" &&
      VALID_WATCH_ELEMENT_MODES.has(/** @type {CCWWatchElementMode} */ (src.watchRecsMode))
    ) {
      watchRecsMode = /** @type {CCWWatchElementMode} */ (src.watchRecsMode);
    }

    /** @type {CCWWatchElementMode} */
    let commentsMode = DEFAULT_SETTINGS.commentsMode;
    if (
      typeof src.commentsMode === "string" &&
      VALID_WATCH_ELEMENT_MODES.has(/** @type {CCWWatchElementMode} */ (src.commentsMode))
    ) {
      commentsMode = /** @type {CCWWatchElementMode} */ (src.commentsMode);
    }

    const showEarlyCommentsButton =
      typeof src.showEarlyCommentsButton === "boolean"
        ? src.showEarlyCommentsButton
        : DEFAULT_SETTINGS.showEarlyCommentsButton;

    const disableHold2x =
      typeof src.disableHold2x === "boolean"
        ? src.disableHold2x
        : DEFAULT_SETTINGS.disableHold2x;

    const lockPlayback1x =
      typeof src.lockPlayback1x === "boolean"
        ? src.lockPlayback1x
        : DEFAULT_SETTINGS.lockPlayback1x;

    return {
      defaultMinutes,
      cooldownMinutes,
      defaultLanding,
      timerVisibility,
      allowLiveStreams,
      blockOverBudgetWatch,
      exemptSearch,
      exemptChannels,
      exemptPlaylistsAndHistory,
      watchRecsMode,
      commentsMode,
      showEarlyCommentsButton,
      disableHold2x,
      lockPlayback1x,
    };
  }

  /**
   * @param {CCWLandingTarget} landing
   * @returns {string}
   */
  function getLandingPath(landing) {
    return LANDING_PATHS[landing] ?? "/";
  }

  /**
   * @param {CCWSession | null} session
   * @param {number} [now]
   * @returns {number}
   */
  function getRemainingSeconds(session, now = Date.now()) {
    if (!session) return 0;
    const msLeft = session.endsAt - now;
    if (msLeft <= 0) return 0;
    return Math.ceil(msLeft / 1000);
  }

  /**
   * @param {number} totalSeconds
   * @returns {string}
   */
  function formatDuration(totalSeconds) {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const seconds = clamped % 60;
    const pad2 = (/** @type {number} */ n) => String(n).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
    }
    return `${minutes}:${pad2(seconds)}`;
  }

  /**
   * Calm top-bar time string: whole minutes above 60s (`20m`..`2m`),
   * switching to `1:00`..`0:01` during the final 60 seconds.
   *
   * @param {number} totalSeconds
   * @returns {string}
   */
  function formatCalmDuration(totalSeconds) {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    if (clamped > 60) {
      return `${Math.ceil(clamped / 60)}m`;
    }
    return formatDuration(clamped);
  }

  /**
   * Reads local state and lazily normalizes any naturally expired session or cooldown.
   *
   * @param {number} [now]
   * @returns {Promise<CCWStateSnapshot>}
   */
  async function getState(now = Date.now()) {
    const raw = await ext.storage.local.get([
      KEYS.SCHEMA_VERSION,
      KEYS.SESSION,
      KEYS.COOLDOWN_UNTIL,
      KEYS.SETTINGS,
    ]);

    const settings = sanitizeSettings(raw[KEYS.SETTINGS]);
    let session = parseSession(raw[KEYS.SESSION]);
    let cooldownUntil = parseTimestamp(raw[KEYS.COOLDOWN_UNTIL]);

    /** @type {Record<string, unknown>} */
    const updates = {};

    if (raw[KEYS.SCHEMA_VERSION] !== SCHEMA_VERSION) {
      updates[KEYS.SCHEMA_VERSION] = SCHEMA_VERSION;
    }

    if (session && session.endsAt <= now) {
      if (settings.cooldownMinutes > 0) {
        const scheduledCooldownEnd =
          session.endsAt + settings.cooldownMinutes * 60_000;
        if (scheduledCooldownEnd > cooldownUntil) {
          cooldownUntil = scheduledCooldownEnd;
        }
      }
      session = null;
      updates[KEYS.SESSION] = null;
    }

    if (cooldownUntil > 0 && cooldownUntil <= now) {
      cooldownUntil = 0;
      updates[KEYS.COOLDOWN_UNTIL] = 0;
    } else if (updates[KEYS.SESSION] === null && cooldownUntil > now) {
      updates[KEYS.COOLDOWN_UNTIL] = cooldownUntil;
    }

    if (Object.keys(updates).length > 0) {
      await ext.storage.local.set(updates);
    }

    const remainingSec = getRemainingSeconds(session, now);
    const cooldownRemainingSec =
      cooldownUntil > now ? Math.ceil((cooldownUntil - now) / 1000) : 0;

    return {
      session,
      cooldownUntil,
      settings,
      remainingSec,
      cooldownRemainingSec,
    };
  }

  /**
   * Starts a wall-clock timed session if no session or cooldown is currently active.
   *
   * @param {number} durationSec
   * @param {number} [now]
   * @returns {Promise<CCWStartResult>}
   */
  async function startTimedSession(durationSec, now = Date.now()) {
    const cleanSec = Math.round(durationSec);
    const current = await getState(now);

    if (
      !Number.isFinite(cleanSec) ||
      cleanSec < MIN_DURATION_SEC ||
      cleanSec > MAX_DURATION_SEC
    ) {
      return { ok: false, reason: "INVALID_DURATION", state: current };
    }

    if (current.session && current.remainingSec > 0) {
      return { ok: false, reason: "SESSION_ALREADY_ACTIVE", state: current };
    }

    if (current.cooldownRemainingSec > 0) {
      return { ok: false, reason: "COOLDOWN_ACTIVE", state: current };
    }

    /** @type {CCWSession} */
    const session = {
      startedAt: now,
      endsAt: now + cleanSec * 1000,
      durationSec: cleanSec,
    };

    await ext.storage.local.set({
      [KEYS.SCHEMA_VERSION]: SCHEMA_VERSION,
      [KEYS.SESSION]: session,
      [KEYS.COOLDOWN_UNTIL]: 0,
    });

    const nextState = await getState(now);
    return { ok: true, state: nextState };
  }

  /**
   * Ends the active session. Applies post-session cooldown when configured,
   * skipping cooldown if ended manually within `MISCLICK_GRACE_MS` (10s) of start.
   *
   * @param {{ reason?: "manual" | "expired" }} [options]
   * @param {number} [now]
   * @returns {Promise<CCWStateSnapshot>}
   */
  async function endSession(options = {}, now = Date.now()) {
    const reason = options.reason ?? "manual";
    const raw = await ext.storage.local.get([
      KEYS.SESSION,
      KEYS.COOLDOWN_UNTIL,
      KEYS.SETTINGS,
    ]);

    const settings = sanitizeSettings(raw[KEYS.SETTINGS]);
    const session = parseSession(raw[KEYS.SESSION]);
    let cooldownUntil = parseTimestamp(raw[KEYS.COOLDOWN_UNTIL]);

    if (session) {
      const elapsedMs = now - session.startedAt;
      const isAccidentalStart =
        reason === "manual" && elapsedMs >= 0 && elapsedMs < MISCLICK_GRACE_MS;

      if (settings.cooldownMinutes > 0 && !isAccidentalStart) {
        const anchorMs =
          reason === "expired" || session.endsAt <= now ? session.endsAt : now;
        const candidateEnd = anchorMs + settings.cooldownMinutes * 60_000;
        if (candidateEnd > now && candidateEnd > cooldownUntil) {
          cooldownUntil = candidateEnd;
        }
      }

      await ext.storage.local.set({
        [KEYS.SCHEMA_VERSION]: SCHEMA_VERSION,
        [KEYS.SESSION]: null,
        [KEYS.COOLDOWN_UNTIL]: cooldownUntil > now ? cooldownUntil : 0,
      });
    }

    return getState(now);
  }

  /**
   * Ensures post-session cooldown starts from `now` when an overtime video finishes
   * (so overtime playback doesn't consume the user's configured break in the background).
   *
   * @param {number} [now]
   * @returns {Promise<CCWStateSnapshot>}
   */
  async function startPostOvertimeCooldown(now = Date.now()) {
    const raw = await ext.storage.local.get([
      KEYS.COOLDOWN_UNTIL,
      KEYS.SETTINGS,
    ]);
    const settings = sanitizeSettings(raw[KEYS.SETTINGS]);
    const existing = parseTimestamp(raw[KEYS.COOLDOWN_UNTIL]);

    if (settings.cooldownMinutes > 0) {
      const targetEnd = now + settings.cooldownMinutes * 60_000;
      if (targetEnd > existing) {
        await ext.storage.local.set({
          [KEYS.SCHEMA_VERSION]: SCHEMA_VERSION,
          [KEYS.COOLDOWN_UNTIL]: targetEnd,
        });
      }
    }

    return getState(now);
  }

  /**
   * Merges and persists partial user settings.
   *
   * @param {Partial<CCWSettings>} partial
   * @returns {Promise<CCWSettings>}
   */
  async function updateSettings(partial) {
    const raw = await ext.storage.local.get(KEYS.SETTINGS);
    const current = sanitizeSettings(raw[KEYS.SETTINGS]);
    const merged = sanitizeSettings({ ...current, ...partial });

    await ext.storage.local.set({
      [KEYS.SCHEMA_VERSION]: SCHEMA_VERSION,
      [KEYS.SETTINGS]: merged,
    });

    return merged;
  }

  /**
   * Subscribes to `storage.local` updates across tabs/contexts.
   *
   * @param {(state: CCWStateSnapshot) => void} listener
   * @returns {() => void} Unsubscribe callback
   */
  function subscribe(listener) {
    /**
     * @param {Record<string, { oldValue?: unknown; newValue?: unknown }>} _changes
     * @param {string} areaName
     */
    const handleStorageChange = (_changes, areaName) => {
      if (areaName !== "local") return;
      getState().then(listener).catch((err) => {
        console.error("[ccw-yt] Failed to refresh state on storage change:", err);
      });
    };

    ext.storage.onChanged.addListener(handleStorageChange);
    return () => {
      ext.storage.onChanged.removeListener(handleStorageChange);
    };
  }

  CCW.state = Object.freeze({
    SCHEMA_VERSION,
    MISCLICK_GRACE_MS,
    DEFAULT_SETTINGS,
    getState,
    startTimedSession,
    endSession,
    startPostOvertimeCooldown,
    updateSettings,
    getRemainingSeconds,
    formatDuration,
    formatCalmDuration,
    getLandingPath,
    subscribe,
  });
})();
