(() => {
  const { icons, state } = CCW;

  const STYLES = `
    .ccw-settings {
      width: 100%;
      max-width: 660px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      text-align: left;
      user-select: text;
    }

    .ccw-settings__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .ccw-settings__back-btn {
      appearance: none;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 7px 14px;
      background: var(--surface);
      color: var(--fg);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      transition: background 120ms ease, border-color 120ms ease;
    }

    .ccw-settings__back-btn:hover,
    .ccw-settings__back-btn:focus-visible {
      background: var(--surface-hover, var(--surface));
      border-color: var(--accent);
      outline: none;
    }

    .ccw-settings__saved {
      margin: 0;
      font-size: 13px;
      color: var(--muted);
      min-height: 18px;
    }

    .ccw-settings__header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ccw-settings__title {
      margin: 0;
      font-size: 24px;
      font-weight: 650;
      color: var(--fg);
    }

    .ccw-settings__subtitle {
      margin: 0;
      font-size: 14px;
      color: var(--muted);
    }

    .ccw-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 5px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--input-bg, var(--bg));
    }

    .ccw-tabs__btn {
      appearance: none;
      flex: 1 1 auto;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      background: transparent;
      color: var(--muted);
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;
    }

    .ccw-tabs__btn:hover {
      color: var(--fg);
    }

    .ccw-tabs__btn[aria-selected="true"] {
      background: var(--surface);
      color: var(--fg);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .ccw-tabs__btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }

    .ccw-settings__card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .ccw-settings__card[hidden] {
      display: none !important;
    }

    .ccw-settings__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .ccw-settings__row--first {
      padding-top: 2px;
      border-top: none;
    }

    .ccw-settings__row[hidden] {
      display: none !important;
    }

    .ccw-settings__label-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .ccw-settings__label {
      font-size: 15px;
      font-weight: 500;
      color: var(--fg);
      cursor: pointer;
    }

    .ccw-settings__hint {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      color: var(--muted);
    }

    .ccw-settings__select {
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 8px 12px;
      min-width: 220px;
      background: var(--input-bg, var(--bg));
      color: var(--fg);
      font-family: inherit;
      font-size: 14px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .ccw-settings__select:focus {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }

    .ccw-stepper {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--input-bg, var(--bg));
      flex-shrink: 0;
      transition: border-color 120ms ease;
    }

    .ccw-stepper:focus-within {
      border-color: var(--accent);
    }

    .ccw-stepper__btn {
      appearance: none;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease, opacity 120ms ease;
    }

    .ccw-stepper__btn:hover:not(:disabled) {
      background: var(--surface-hover, var(--surface));
      color: var(--fg);
    }

    .ccw-stepper__btn:disabled {
      opacity: 0.32;
      cursor: default;
    }

    .ccw-stepper__btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }

    .ccw-stepper__field {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      min-width: 64px;
      padding: 0 4px;
      cursor: text;
    }

    .ccw-stepper__input {
      appearance: none;
      border: none;
      outline: none;
      background: transparent;
      padding: 0;
      margin: 0;
      width: 2ch;
      text-align: right;
      color: var(--fg);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      caret-color: var(--accent);
    }

    .ccw-stepper__unit {
      font-size: 13px;
      color: var(--muted);
      user-select: none;
    }

    .ccw-switch {
      appearance: none;
      position: relative;
      width: 44px;
      height: 25px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--input-bg, var(--bg));
      padding: 0;
      flex-shrink: 0;
      cursor: pointer;
      transition: background 140ms ease, border-color 140ms ease;
    }

    .ccw-switch[aria-checked="true"] {
      background: var(--accent);
      border-color: var(--accent);
    }

    .ccw-switch::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background: var(--muted);
      transition: transform 140ms ease, background 140ms ease;
    }

    .ccw-switch[aria-checked="true"]::after {
      transform: translateX(19px);
      background: #ffffff;
    }

    .ccw-switch:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .ccw-settings__footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 2px;
    }

    .ccw-settings__reset-btn {
      appearance: none;
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 6px 12px;
      background: transparent;
      color: var(--muted);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: color 120ms ease, border-color 120ms ease;
    }

    .ccw-settings__reset-btn:hover,
    .ccw-settings__reset-btn:focus-visible {
      color: var(--fg);
      border-color: var(--border);
      outline: none;
    }

    .ccw-settings__reset-btn[data-confirm="true"] {
      color: var(--accent);
      border-color: var(--accent);
    }
  `;

  /** @type {ReadonlyArray<{ value: CCWLandingTarget; label: string }>} */
  const LANDING_OPTIONS = [
    { value: "home", label: "Home" },
    { value: "subscriptions", label: "Subscriptions" },
    { value: "search_only", label: "Search-Only (hide Home feed)" },
    { value: "watch_later", label: "Watch Later" },
    { value: "library", label: "Library (You)" },
    { value: "history", label: "History" },
  ];

  /** @type {ReadonlyArray<{ value: CCWTimerVisibility; label: string }>} */
  const TIMER_VISIBILITY_OPTIONS = [
    { value: "always", label: "Always (except fullscreen)" },
    { value: "feeds_only", label: "Feeds only (hide on video pages)" },
    { value: "hidden", label: "Hidden" },
  ];

  /** @type {ReadonlyArray<{ value: CCWWatchElementMode; label: string }>} */
  const WATCH_ELEMENT_OPTIONS = [
    { value: "after_video", label: "Reveal after video finishes" },
    { value: "always", label: "Always show" },
    { value: "hidden", label: "Always hide" },
  ];

  /** @type {ReadonlyArray<{ value: CCWThumbnailMode; label: string }>} */
  const THUMBNAIL_OPTIONS = [
    { value: "normal", label: "Normal" },
    { value: "no_hover_preview", label: "Stop hover-autoplay previews" },
    { value: "blur", label: "Blur thumbnails" },
    { value: "hidden", label: "Hide thumbnails" },
  ];

  /**
   * @param {{
   *   id: string;
   *   min: number;
   *   max: number;
   *   step: number;
   *   initialValue: number;
   *   unit: string;
   *   ariaLabel: string;
   *   onCommit: (nextValue: number) => void;
   * }} cfg
   */
  function createNumberStepper(cfg) {
    let currentValue = cfg.initialValue;

    const wrap = document.createElement("div");
    wrap.className = "ccw-stepper";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "ccw-stepper__btn";
    minusBtn.setAttribute("aria-label", `Decrease ${cfg.ariaLabel}`);
    minusBtn.appendChild(icons.create("minus", 14));

    const fieldLabel = document.createElement("label");
    fieldLabel.className = "ccw-stepper__field";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.className = "ccw-stepper__input";
    input.id = cfg.id;
    input.setAttribute("aria-label", cfg.ariaLabel);

    const unitSpan = document.createElement("span");
    unitSpan.className = "ccw-stepper__unit";
    unitSpan.textContent = cfg.unit;

    fieldLabel.append(input, unitSpan);

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "ccw-stepper__btn";
    plusBtn.setAttribute("aria-label", `Increase ${cfg.ariaLabel}`);
    plusBtn.appendChild(icons.create("plus", 14));

    wrap.append(minusBtn, fieldLabel, plusBtn);

    /**
     * @param {number} val
     * @param {boolean} [forceInputSync]
     */
    function setValue(val, forceInputSync = false) {
      const clamped = Math.max(cfg.min, Math.min(cfg.max, Math.round(val)));
      currentValue = clamped;
      minusBtn.disabled = clamped <= cfg.min;
      plusBtn.disabled = clamped >= cfg.max;

      const rootNode = wrap.getRootNode();
      const activeEl =
        rootNode instanceof ShadowRoot
          ? rootNode.activeElement
          : document.activeElement;

      if (forceInputSync || activeEl !== input) {
        const text = String(clamped);
        input.value = text;
        input.style.width = `${Math.max(1, text.length)}ch`;
      }
    }

    /**
     * @param {-1 | 1} dir
     */
    function stepBy(dir) {
      const next =
        dir > 0
          ? Math.floor(currentValue / cfg.step) * cfg.step + cfg.step
          : Math.ceil(currentValue / cfg.step) * cfg.step - cfg.step;
      const clamped = Math.max(cfg.min, Math.min(cfg.max, next));
      setValue(clamped, true);
      cfg.onCommit(clamped);
    }

    minusBtn.addEventListener("click", () => stepBy(-1));
    plusBtn.addEventListener("click", () => stepBy(1));

    input.addEventListener("focus", () => {
      input.select();
    });

    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D+/g, "").slice(0, 3);
      input.value = digits;
      input.style.width = `${Math.max(1, digits.length)}ch`;
    });

    function commitTypedValue() {
      const parsed = Number(input.value);
      const next =
        input.value.trim().length > 0 && Number.isFinite(parsed)
          ? Math.max(cfg.min, Math.min(cfg.max, Math.round(parsed)))
          : currentValue;
      const changed = next !== currentValue;
      setValue(next, true);
      if (changed) {
        cfg.onCommit(next);
      }
    }

    input.addEventListener("blur", commitTypedValue);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitTypedValue();
        input.blur();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        stepBy(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepBy(-1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setValue(currentValue, true);
        input.blur();
      }
    });

    setValue(cfg.initialValue, true);

    return { element: wrap, setValue };
  }

  /**
   * @template {string} T
   * @param {{
   *   id: string;
   *   label: string;
   *   hint: string;
   *   options: ReadonlyArray<{ value: T; label: string }>;
   *   isFirst?: boolean;
   *   onChange: (value: T) => void;
   * }} cfg
   */
  function createSelectRow(cfg) {
    const row = document.createElement("div");
    row.className = cfg.isFirst
      ? "ccw-settings__row ccw-settings__row--first"
      : "ccw-settings__row";

    const labels = document.createElement("div");
    labels.className = "ccw-settings__label-group";

    const labelEl = document.createElement("label");
    labelEl.className = "ccw-settings__label";
    labelEl.htmlFor = cfg.id;
    labelEl.textContent = cfg.label;

    const hintEl = document.createElement("p");
    hintEl.className = "ccw-settings__hint";
    hintEl.textContent = cfg.hint;

    labels.append(labelEl, hintEl);

    const selectEl = document.createElement("select");
    selectEl.className = "ccw-settings__select";
    selectEl.id = cfg.id;
    for (const opt of cfg.options) {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      selectEl.appendChild(optionEl);
    }

    selectEl.addEventListener("change", () => {
      cfg.onChange(/** @type {T} */ (selectEl.value));
    });

    row.append(labels, selectEl);
    return {
      element: row,
      setValue(/** @type {T} */ val) {
        selectEl.value = val;
      },
    };
  }

  /**
   * @param {{
   *   id: string;
   *   label: string;
   *   hint: string;
   *   isFirst?: boolean;
   *   onToggle: (checked: boolean) => void;
   * }} cfg
   */
  function createToggleRow(cfg) {
    let checked = false;

    const row = document.createElement("div");
    row.className = cfg.isFirst
      ? "ccw-settings__row ccw-settings__row--first"
      : "ccw-settings__row";

    const labels = document.createElement("div");
    labels.className = "ccw-settings__label-group";

    const labelEl = document.createElement("label");
    labelEl.className = "ccw-settings__label";
    labelEl.htmlFor = cfg.id;
    labelEl.textContent = cfg.label;

    const hintEl = document.createElement("p");
    hintEl.className = "ccw-settings__hint";
    hintEl.textContent = cfg.hint;

    labels.append(labelEl, hintEl);

    const switchBtn = document.createElement("button");
    switchBtn.type = "button";
    switchBtn.id = cfg.id;
    switchBtn.className = "ccw-switch";
    switchBtn.setAttribute("role", "switch");
    switchBtn.setAttribute("aria-checked", "false");

    /** @param {boolean} next */
    function setChecked(next) {
      checked = Boolean(next);
      switchBtn.setAttribute("aria-checked", String(checked));
    }

    function toggle() {
      const next = !checked;
      setChecked(next);
      cfg.onToggle(next);
    }

    switchBtn.addEventListener("click", toggle);
    labelEl.addEventListener("click", (ev) => {
      ev.preventDefault();
      toggle();
    });

    row.append(labels, switchBtn);
    return { element: row, setChecked };
  }

  /**
   * Mounts the shared 4-tab Settings UI inside `container`.
   *
   * @param {HTMLElement} container
   * @param {CCWSettingsPanelOptions} options
   * @returns {CCWSettingsPanelHandle}
   */
  function mount(container, options) {
    const root = document.createElement("div");
    root.className = "ccw-settings";

    const topRow = document.createElement("div");
    topRow.className = "ccw-settings__top";

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "ccw-settings__back-btn";
    backBtn.appendChild(icons.create("arrow-left", 16));
    const backSpan = document.createElement("span");
    backSpan.textContent = options.backLabel;
    backBtn.appendChild(backSpan);
    backBtn.addEventListener("click", () => options.onBack());

    const saveStatus = document.createElement("p");
    saveStatus.className = "ccw-settings__saved";
    saveStatus.setAttribute("aria-live", "polite");

    topRow.append(backBtn, saveStatus);

    const header = document.createElement("header");
    header.className = "ccw-settings__header";

    const title = document.createElement("h1");
    title.className = "ccw-settings__title";
    title.textContent = "ccw-yt Settings";

    const subtitle = document.createElement("p");
    subtitle.className = "ccw-settings__subtitle";
    subtitle.textContent = "100% local settings — stored strictly on your device.";

    header.append(title, subtitle);

    /** @type {number | undefined} */
    let saveTimer;

    /** @param {string} [msg] */
    function flashSaved(msg = "Saved locally.") {
      saveStatus.textContent = msg;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveStatus.textContent = "";
      }, 1800);
    }

    /**
     * @param {Partial<CCWSettings>} patch
     */
    async function commitPatch(patch) {
      const updated = await state.updateSettings(patch);
      refresh(updated);
      flashSaved();
      options.onSettingsChanged?.(updated);
    }

    // --- Tab 1: Session ---
    const sessionCard = document.createElement("section");
    sessionCard.className = "ccw-settings__card";
    sessionCard.setAttribute("role", "tabpanel");

    const selectLanding = createSelectRow({
      id: "ccw-default-landing",
      label: "Starting screen",
      hint: "Replaces bare youtube.com and the Home button during active sessions. Direct video & search links are preserved.",
      options: LANDING_OPTIONS,
      isFirst: true,
      onChange: (val) => commitPatch({ defaultLanding: val }),
    });

    const rowDefaultMins = document.createElement("div");
    rowDefaultMins.className = "ccw-settings__row";
    const defaultMinsLabels = document.createElement("div");
    defaultMinsLabels.className = "ccw-settings__label-group";
    const defaultMinsLabel = document.createElement("label");
    defaultMinsLabel.className = "ccw-settings__label";
    defaultMinsLabel.htmlFor = "ccw-default-minutes";
    defaultMinsLabel.textContent = "Default slider duration";
    const defaultMinsHint = document.createElement("p");
    defaultMinsHint.className = "ccw-settings__hint";
    defaultMinsHint.textContent =
      "Initial position when the Entry Gate opens (1–240 min).";
    defaultMinsLabels.append(defaultMinsLabel, defaultMinsHint);
    const defaultMinsStepper = createNumberStepper({
      id: "ccw-default-minutes",
      min: 1,
      max: 240,
      step: 5,
      initialValue: 20,
      unit: "min",
      ariaLabel: "default slider duration in minutes",
      onCommit: (nextVal) => commitPatch({ defaultMinutes: nextVal }),
    });
    rowDefaultMins.append(defaultMinsLabels, defaultMinsStepper.element);

    const rowCooldown = document.createElement("div");
    rowCooldown.className = "ccw-settings__row";
    const cooldownLabels = document.createElement("div");
    cooldownLabels.className = "ccw-settings__label-group";
    const cooldownLabel = document.createElement("label");
    cooldownLabel.className = "ccw-settings__label";
    cooldownLabel.htmlFor = "ccw-cooldown-minutes";
    cooldownLabel.textContent = "Post-session cooldown";
    const cooldownHint = document.createElement("p");
    cooldownHint.className = "ccw-settings__hint";
    cooldownHint.textContent =
      "Optional break enforced after a session ends (0 = disabled).";
    cooldownLabels.append(cooldownLabel, cooldownHint);
    const cooldownStepper = createNumberStepper({
      id: "ccw-cooldown-minutes",
      min: 0,
      max: 240,
      step: 5,
      initialValue: 0,
      unit: "min",
      ariaLabel: "post-session cooldown in minutes",
      onCommit: (nextVal) => commitPatch({ cooldownMinutes: nextVal }),
    });
    rowCooldown.append(cooldownLabels, cooldownStepper.element);

    const selectTimerVis = createSelectRow({
      id: "ccw-timer-visibility",
      label: "Timer pill visibility",
      hint: "Show remaining time in YouTube's top bar (always hidden in fullscreen).",
      options: TIMER_VISIBILITY_OPTIONS,
      onChange: (val) => commitPatch({ timerVisibility: val }),
    });

    sessionCard.append(
      selectLanding.element,
      rowDefaultMins,
      rowCooldown,
      selectTimerVis.element
    );

    // --- Tab 2: Filtering ---
    const filterCard = document.createElement("section");
    filterCard.className = "ccw-settings__card";
    filterCard.setAttribute("role", "tabpanel");
    filterCard.hidden = true;

    const toggleBlockOverBudget = createToggleRow({
      id: "ccw-block-over-budget",
      label: "Block opening videos longer than remaining time",
      hint: "Pauses playback and shows a notice if you open a link to a video that won't fit in your remaining session budget.",
      isFirst: true,
      onToggle: (val) => commitPatch({ blockOverBudgetWatch: val }),
    });

    const toggleAllowLive = createToggleRow({
      id: "ccw-allow-live",
      label: "Allow Live streams during active sessions",
      hint: "Show live broadcasts while time remains (Live streams still lock right at 0:00).",
      onToggle: (val) => commitPatch({ allowLiveStreams: val }),
    });

    const toggleExemptSearch = createToggleRow({
      id: "ccw-exempt-search",
      label: "Exempt Search results",
      hint: "Show all video lengths on /results pages regardless of remaining time.",
      onToggle: (val) => commitPatch({ exemptSearch: val }),
    });

    const toggleExemptChannels = createToggleRow({
      id: "ccw-exempt-channels",
      label: "Exempt Channel pages",
      hint: "Show all video lengths when browsing a creator's channel page.",
      onToggle: (val) => commitPatch({ exemptChannels: val }),
    });

    const toggleExemptPlaylists = createToggleRow({
      id: "ccw-exempt-playlists",
      label: "Exempt Playlists & History",
      hint: "Show all video lengths in Watch Later, playlists, Library, and History.",
      onToggle: (val) => commitPatch({ exemptPlaylistsAndHistory: val }),
    });

    filterCard.append(
      toggleBlockOverBudget.element,
      toggleAllowLive.element,
      toggleExemptSearch.element,
      toggleExemptChannels.element,
      toggleExemptPlaylists.element
    );

    // --- Tab 3: Watch & Playback ---
    const watchCard = document.createElement("section");
    watchCard.className = "ccw-settings__card";
    watchCard.setAttribute("role", "tabpanel");
    watchCard.hidden = true;

    const selectWatchRecs = createSelectRow({
      id: "ccw-watch-recs-mode",
      label: "Watch-page recommendations",
      hint: "Centers the video while hidden. Revealed items still respect remaining session time.",
      options: WATCH_ELEMENT_OPTIONS,
      isFirst: true,
      onChange: (val) => commitPatch({ watchRecsMode: val }),
    });

    const selectComments = createSelectRow({
      id: "ccw-comments-mode",
      label: "Comments",
      hint: "Hide the comment section while watching so you can focus on the video.",
      options: WATCH_ELEMENT_OPTIONS,
      onChange: (val) => commitPatch({ commentsMode: val }),
    });

    const toggleEarlyComments = createToggleRow({
      id: "ccw-early-comments-btn",
      label: 'Show "Show comments" button while watching',
      hint: 'Offers a small button below the description when Comments are set to "Reveal after video finishes", offering to reveal them early.',
      onToggle: (val) => commitPatch({ showEarlyCommentsButton: val }),
    });

    const toggleHold2x = createToggleRow({
      id: "ccw-disable-hold-2x",
      label: 'Disable "Hold for 2x Speed"',
      hint: "Blocks holding down the mouse/pointer or Spacebar to jump to 2x speed, while keeping normal pause, scrubbing, and menu speeds intact.",
      onToggle: (val) => commitPatch({ disableHold2x: val }),
    });

    const toggleLock1x = createToggleRow({
      id: "ccw-lock-playback-1x",
      label: "Lock playback speed to 1x",
      hint: "Keeps all videos strictly at 1x normal speed (overrides player speed menu and Shift + > shortcuts).",
      onToggle: (val) => commitPatch({ lockPlayback1x: val }),
    });

    const toggleDisableAutoplay = createToggleRow({
      id: "ccw-disable-autoplay-next",
      label: 'Disable "Autoplay Next"',
      hint: "Automatically turns off YouTube's player Autoplay toggle so videos never advance on their own.",
      onToggle: (val) => commitPatch({ disableAutoplayNext: val }),
    });

    const toggleHideEndScreens = createToggleRow({
      id: "ccw-hide-end-screens",
      label: "Hide in-player End-Screen cards & video wall",
      hint: "Removes creator end-screen popups and the post-video suggestion grid inside the player.",
      onToggle: (val) => commitPatch({ hideEndScreenCards: val }),
    });

    const toggleHideLiveChat = createToggleRow({
      id: "ccw-hide-live-chat",
      label: "Hide Live Chat",
      hint: "Hides the live chat box on streams and premieres.",
      onToggle: (val) => commitPatch({ hideLiveChat: val }),
    });

    watchCard.append(
      selectWatchRecs.element,
      selectComments.element,
      toggleEarlyComments.element,
      toggleHold2x.element,
      toggleLock1x.element,
      toggleDisableAutoplay.element,
      toggleHideEndScreens.element,
      toggleHideLiveChat.element
    );

    // --- Tab 4: Feeds & UI ---
    const feedsUiCard = document.createElement("section");
    feedsUiCard.className = "ccw-settings__card";
    feedsUiCard.setAttribute("role", "tabpanel");
    feedsUiCard.hidden = true;

    const toggleHideShorts = createToggleRow({
      id: "ccw-hide-shorts",
      label: "Hide Shorts",
      hint: "Hides Shorts shelves and sidebar tabs, and opens incoming /shorts/ links in the standard single-video player.",
      isFirst: true,
      onToggle: (val) => commitPatch({ hideShorts: val }),
    });

    const selectThumbnails = createSelectRow({
      id: "ccw-thumbnail-mode",
      label: "Thumbnails",
      hint: "Control hover video previews or blur/hide thumbnail images while keeping duration badges legible.",
      options: THUMBNAIL_OPTIONS,
      onChange: (val) => commitPatch({ thumbnailMode: val }),
    });

    const toggleCleanSidebar = createToggleRow({
      id: "ccw-hide-explore-sidebar",
      label: "Clean up Left Sidebar clutter",
      hint: 'Hides Explore, Trending, Shopping, Gaming, and "More from YouTube" while keeping Subscriptions & Library.',
      onToggle: (val) => commitPatch({ hideExploreSidebar: val }),
    });

    const toggleHideBell = createToggleRow({
      id: "ccw-hide-notification-bell",
      label: "Hide Notification Bell & unread count",
      hint: "Hides YouTube's top-bar notification bell and strips (N) unread badges from the browser tab title.",
      onToggle: (val) => commitPatch({ hideNotificationBell: val }),
    });

    const toggleHidePosts = createToggleRow({
      id: "ccw-hide-community-posts",
      label: "Hide Community posts",
      hint: "Hides text, image, and poll posts from feeds.",
      onToggle: (val) => commitPatch({ hideCommunityPosts: val }),
    });

    const toggleHideMerchPlayables = createToggleRow({
      id: "ccw-hide-merch-playables",
      label: "Hide Playables, Merch & Promo shelves",
      hint: "Hides YouTube Playables games shelves, product/ticket shelves below videos, and promo banners.",
      onToggle: (val) => commitPatch({ hideMerchAndPlayables: val }),
    });

    feedsUiCard.append(
      toggleHideShorts.element,
      selectThumbnails.element,
      toggleCleanSidebar.element,
      toggleHideBell.element,
      toggleHidePosts.element,
      toggleHideMerchPlayables.element
    );

    // --- Category Tab Bar ---
    const tabBar = document.createElement("div");
    tabBar.className = "ccw-tabs";
    tabBar.setAttribute("role", "tablist");
    tabBar.setAttribute("aria-label", "Settings categories");

    const tabDefs = [
      { id: "session", label: "Session", panel: sessionCard },
      { id: "filtering", label: "Filtering", panel: filterCard },
      { id: "watch", label: "Watch & Playback", panel: watchCard },
      { id: "feeds", label: "Feeds & UI", panel: feedsUiCard },
    ];

    /** @type {HTMLButtonElement[]} */
    const tabButtons = [];

    /** @param {number} activeIdx */
    function selectTab(activeIdx) {
      tabDefs.forEach((def, idx) => {
        const isSelected = idx === activeIdx;
        tabButtons[idx].setAttribute("aria-selected", String(isSelected));
        tabButtons[idx].tabIndex = isSelected ? 0 : -1;
        def.panel.hidden = !isSelected;
      });
    }

    tabDefs.forEach((def, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ccw-tabs__btn";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(idx === 0));
      btn.tabIndex = idx === 0 ? 0 : -1;
      btn.textContent = def.label;
      btn.addEventListener("click", () => selectTab(idx));
      btn.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowRight") {
          ev.preventDefault();
          const next = (idx + 1) % tabDefs.length;
          selectTab(next);
          tabButtons[next].focus();
        } else if (ev.key === "ArrowLeft") {
          ev.preventDefault();
          const prev = (idx - 1 + tabDefs.length) % tabDefs.length;
          selectTab(prev);
          tabButtons[prev].focus();
        }
      });
      tabButtons.push(btn);
      tabBar.appendChild(btn);
    });

    // --- Footer: Reset to Defaults (2-step inline confirm) ---
    const footer = document.createElement("footer");
    footer.className = "ccw-settings__footer";

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "ccw-settings__reset-btn";
    resetBtn.textContent = "Reset to defaults";

    /** @type {number | undefined} */
    let confirmResetTimer;
    let awaitingResetConfirm = false;

    function clearResetConfirm() {
      awaitingResetConfirm = false;
      delete resetBtn.dataset.confirm;
      resetBtn.textContent = "Reset to defaults";
      window.clearTimeout(confirmResetTimer);
    }

    resetBtn.addEventListener("click", async () => {
      if (!awaitingResetConfirm) {
        awaitingResetConfirm = true;
        resetBtn.dataset.confirm = "true";
        resetBtn.textContent = "Confirm reset?";
        confirmResetTimer = window.setTimeout(clearResetConfirm, 3500);
        return;
      }

      clearResetConfirm();
      const defaults = await state.resetSettings();
      refresh(defaults);
      flashSaved("Defaults restored.");
      options.onSettingsChanged?.(defaults);
    });

    footer.appendChild(resetBtn);

    root.append(
      topRow,
      header,
      tabBar,
      sessionCard,
      filterCard,
      watchCard,
      feedsUiCard,
      footer
    );
    container.replaceChildren(root);

    /**
     * @param {CCWSettings} settings
     */
    function refresh(settings) {
      selectLanding.setValue(settings.defaultLanding);
      selectTimerVis.setValue(settings.timerVisibility);
      selectWatchRecs.setValue(settings.watchRecsMode);
      selectComments.setValue(settings.commentsMode);
      selectThumbnails.setValue(settings.thumbnailMode);
      defaultMinsStepper.setValue(settings.defaultMinutes);
      cooldownStepper.setValue(settings.cooldownMinutes);

      toggleBlockOverBudget.setChecked(settings.blockOverBudgetWatch);
      toggleAllowLive.setChecked(settings.allowLiveStreams);
      toggleExemptSearch.setChecked(settings.exemptSearch);
      toggleExemptChannels.setChecked(settings.exemptChannels);
      toggleExemptPlaylists.setChecked(settings.exemptPlaylistsAndHistory);
      toggleEarlyComments.setChecked(settings.showEarlyCommentsButton);
      toggleEarlyComments.element.hidden =
        settings.commentsMode !== "after_video";
      toggleHold2x.setChecked(settings.disableHold2x);
      toggleLock1x.setChecked(settings.lockPlayback1x);
      toggleDisableAutoplay.setChecked(settings.disableAutoplayNext);
      toggleHideEndScreens.setChecked(settings.hideEndScreenCards);
      toggleHideLiveChat.setChecked(settings.hideLiveChat);
      toggleHideShorts.setChecked(settings.hideShorts);
      toggleCleanSidebar.setChecked(settings.hideExploreSidebar);
      toggleHideBell.setChecked(settings.hideNotificationBell);
      toggleHidePosts.setChecked(settings.hideCommunityPosts);
      toggleHideMerchPlayables.setChecked(settings.hideMerchAndPlayables);
    }

    state.getState().then((snap) => refresh(snap.settings));
    const unsubscribe = state.subscribe((snap) => refresh(snap.settings));

    return {
      refresh,
      destroy() {
        unsubscribe();
        window.clearTimeout(saveTimer);
        window.clearTimeout(confirmResetTimer);
      },
    };
  }

  CCW.settingsPanel = Object.freeze({
    STYLES,
    mount,
  });
})();
