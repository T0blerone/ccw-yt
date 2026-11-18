(() => {
  const { icons, state } = CCW;

  const STYLES = `
    .ccw-settings {
      width: 100%;
      max-width: 640px;
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

    .ccw-settings__card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .ccw-settings__section-title {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
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
      min-width: 215px;
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

  /**
   * Builds a spinnerless `[ − ] 20 min [ + ]` numeric stepper control.
   *
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
   * Builds a clean settings row with an accessible pill switch (`role="switch"`).
   *
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
   * Mounts the shared Settings UI inside `container`.
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

    function flashSaved() {
      saveStatus.textContent = "Saved locally.";
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

    // --- Card 1: Session & Starting Screen ---
    const sessionCard = document.createElement("section");
    sessionCard.className = "ccw-settings__card";

    const sessionSectionTitle = document.createElement("h2");
    sessionSectionTitle.className = "ccw-settings__section-title";
    sessionSectionTitle.textContent = "Session & Starting Screen";

    // Row 1: Starting screen
    const rowLanding = document.createElement("div");
    rowLanding.className = "ccw-settings__row ccw-settings__row--first";

    const landingLabels = document.createElement("div");
    landingLabels.className = "ccw-settings__label-group";

    const landingLabel = document.createElement("label");
    landingLabel.className = "ccw-settings__label";
    landingLabel.htmlFor = "ccw-default-landing";
    landingLabel.textContent = "Starting screen";

    const landingHint = document.createElement("p");
    landingHint.className = "ccw-settings__hint";
    landingHint.textContent =
      "Replaces bare youtube.com and the Home button during active sessions. Direct video & search links are preserved.";

    landingLabels.append(landingLabel, landingHint);

    const landingSelect = document.createElement("select");
    landingSelect.className = "ccw-settings__select";
    landingSelect.id = "ccw-default-landing";
    for (const opt of LANDING_OPTIONS) {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      landingSelect.appendChild(optionEl);
    }

    rowLanding.append(landingLabels, landingSelect);

    // Row 2: Default slider duration
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

    // Row 3: Post-session cooldown
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

    // Row 4: Top-bar timer pill visibility
    const rowTimerVis = document.createElement("div");
    rowTimerVis.className = "ccw-settings__row";

    const timerVisLabels = document.createElement("div");
    timerVisLabels.className = "ccw-settings__label-group";

    const timerVisLabel = document.createElement("label");
    timerVisLabel.className = "ccw-settings__label";
    timerVisLabel.htmlFor = "ccw-timer-visibility";
    timerVisLabel.textContent = "Timer pill visibility";

    const timerVisHint = document.createElement("p");
    timerVisHint.className = "ccw-settings__hint";
    timerVisHint.textContent =
      "Show remaining time in YouTube's top bar (always hidden in fullscreen).";

    timerVisLabels.append(timerVisLabel, timerVisHint);

    const timerVisSelect = document.createElement("select");
    timerVisSelect.className = "ccw-settings__select";
    timerVisSelect.id = "ccw-timer-visibility";
    for (const opt of TIMER_VISIBILITY_OPTIONS) {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      timerVisSelect.appendChild(optionEl);
    }

    rowTimerVis.append(timerVisLabels, timerVisSelect);

    sessionCard.append(
      sessionSectionTitle,
      rowLanding,
      rowDefaultMins,
      rowCooldown,
      rowTimerVis
    );

    // --- Card 2: Duration Filtering ---
    const filterCard = document.createElement("section");
    filterCard.className = "ccw-settings__card";

    const filterSectionTitle = document.createElement("h2");
    filterSectionTitle.className = "ccw-settings__section-title";
    filterSectionTitle.textContent = "Duration Filtering";

    const toggleBlockOverBudget = createToggleRow({
      id: "ccw-block-over-budget",
      label: "Block opening videos longer than remaining time",
      hint: "Pauses playback and shows a calm notice if you open a link to a video that won't fit in your remaining session budget.",
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
      filterSectionTitle,
      toggleBlockOverBudget.element,
      toggleAllowLive.element,
      toggleExemptSearch.element,
      toggleExemptChannels.element,
      toggleExemptPlaylists.element
    );

    // --- Card 3: Watch Page Focus ---
    const watchFocusCard = document.createElement("section");
    watchFocusCard.className = "ccw-settings__card";

    const watchFocusTitle = document.createElement("h2");
    watchFocusTitle.className = "ccw-settings__section-title";
    watchFocusTitle.textContent = "Watch Page Focus";

    // Row 1: Watch-page recommendations
    const rowWatchRecs = document.createElement("div");
    rowWatchRecs.className = "ccw-settings__row ccw-settings__row--first";

    const watchRecsLabels = document.createElement("div");
    watchRecsLabels.className = "ccw-settings__label-group";

    const watchRecsLabel = document.createElement("label");
    watchRecsLabel.className = "ccw-settings__label";
    watchRecsLabel.htmlFor = "ccw-watch-recs-mode";
    watchRecsLabel.textContent = "Watch-page recommendations";

    const watchRecsHint = document.createElement("p");
    watchRecsHint.className = "ccw-settings__hint";
    watchRecsHint.textContent =
      "Centers the video while hidden. Revealed items still respect remaining session time.";

    watchRecsLabels.append(watchRecsLabel, watchRecsHint);

    const watchRecsSelect = document.createElement("select");
    watchRecsSelect.className = "ccw-settings__select";
    watchRecsSelect.id = "ccw-watch-recs-mode";
    for (const opt of WATCH_ELEMENT_OPTIONS) {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      watchRecsSelect.appendChild(optionEl);
    }

    rowWatchRecs.append(watchRecsLabels, watchRecsSelect);

    // Row 2: Comments
    const rowComments = document.createElement("div");
    rowComments.className = "ccw-settings__row";

    const commentsLabels = document.createElement("div");
    commentsLabels.className = "ccw-settings__label-group";

    const commentsLabel = document.createElement("label");
    commentsLabel.className = "ccw-settings__label";
    commentsLabel.htmlFor = "ccw-comments-mode";
    commentsLabel.textContent = "Comments";

    const commentsHint = document.createElement("p");
    commentsHint.className = "ccw-settings__hint";
    commentsHint.textContent =
      "Hide the comment section while watching so you can focus on the video.";

    commentsLabels.append(commentsLabel, commentsHint);

    const commentsSelect = document.createElement("select");
    commentsSelect.className = "ccw-settings__select";
    commentsSelect.id = "ccw-comments-mode";
    for (const opt of WATCH_ELEMENT_OPTIONS) {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      commentsSelect.appendChild(optionEl);
    }

    rowComments.append(commentsLabels, commentsSelect);

    // Row 3: Show "Show comments" button while watching
    const toggleEarlyComments = createToggleRow({
      id: "ccw-early-comments-btn",
      label: 'Show "Show comments" button while watching',
      hint: 'Offers a small button below the description when Comments are set to "Reveal after video finishes".',
      onToggle: (val) => commitPatch({ showEarlyCommentsButton: val }),
    });

    watchFocusCard.append(
      watchFocusTitle,
      rowWatchRecs,
      rowComments,
      toggleEarlyComments.element
    );

    // --- Card 4: Playback ---
    const playbackCard = document.createElement("section");
    playbackCard.className = "ccw-settings__card";

    const playbackTitle = document.createElement("h2");
    playbackTitle.className = "ccw-settings__section-title";
    playbackTitle.textContent = "Playback";

    const toggleHold2x = createToggleRow({
      id: "ccw-disable-hold-2x",
      label: 'Disable "Hold for 2x Speed"',
      hint: "Blocks holding down the mouse/pointer or Spacebar to jump to 2x speed, while keeping normal pause, scrubbing, and menu speed controls intact.",
      isFirst: true,
      onToggle: (val) => commitPatch({ disableHold2x: val }),
    });

    const toggleLock1x = createToggleRow({
      id: "ccw-lock-playback-1x",
      label: "Lock playback speed to 1x",
      hint: "Keeps all videos strictly at 1x normal speed (overrides player speed menu and Shift + > shortcuts).",
      onToggle: (val) => commitPatch({ lockPlayback1x: val }),
    });

    playbackCard.append(
      playbackTitle,
      toggleHold2x.element,
      toggleLock1x.element
    );

    root.append(topRow, header, sessionCard, filterCard, watchFocusCard, playbackCard);
    container.replaceChildren(root);

    /**
     * @param {CCWSettings} settings
     */
    function refresh(settings) {
      landingSelect.value = settings.defaultLanding;
      timerVisSelect.value = settings.timerVisibility;
      watchRecsSelect.value = settings.watchRecsMode;
      commentsSelect.value = settings.commentsMode;
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
    }

    landingSelect.addEventListener("change", () =>
      commitPatch({
        defaultLanding: /** @type {CCWLandingTarget} */ (landingSelect.value),
      })
    );

    timerVisSelect.addEventListener("change", () =>
      commitPatch({
        timerVisibility: /** @type {CCWTimerVisibility} */ (timerVisSelect.value),
      })
    );

    watchRecsSelect.addEventListener("change", () =>
      commitPatch({
        watchRecsMode: /** @type {CCWWatchElementMode} */ (watchRecsSelect.value),
      })
    );

    commentsSelect.addEventListener("change", () =>
      commitPatch({
        commentsMode: /** @type {CCWWatchElementMode} */ (commentsSelect.value),
      })
    );

    state.getState().then((snap) => refresh(snap.settings));
    const unsubscribe = state.subscribe((snap) => refresh(snap.settings));

    return {
      refresh,
      destroy() {
        unsubscribe();
        window.clearTimeout(saveTimer);
      },
    };
  }

  CCW.settingsPanel = Object.freeze({
    STYLES,
    mount,
  });
})();
