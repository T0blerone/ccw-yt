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

    const card = document.createElement("section");
    card.className = "ccw-settings__card";

    const sectionTitle = document.createElement("h2");
    sectionTitle.className = "ccw-settings__section-title";
    sectionTitle.textContent = "Session & Starting Screen";

    /** @type {number | undefined} */
    let saveTimer;

    function flashSaved() {
      saveStatus.textContent = "Saved locally.";
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveStatus.textContent = "";
      }, 1800);
    }

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
      async onCommit(nextVal) {
        const updated = await state.updateSettings({ defaultMinutes: nextVal });
        refresh(updated);
        flashSaved();
        options.onSettingsChanged?.(updated);
      },
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
      async onCommit(nextVal) {
        const updated = await state.updateSettings({ cooldownMinutes: nextVal });
        refresh(updated);
        flashSaved();
        options.onSettingsChanged?.(updated);
      },
    });

    rowCooldown.append(cooldownLabels, cooldownStepper.element);

    card.append(sectionTitle, rowLanding, rowDefaultMins, rowCooldown);
    root.append(topRow, header, card);
    container.replaceChildren(root);

    /**
     * @param {CCWSettings} settings
     */
    function refresh(settings) {
      landingSelect.value = settings.defaultLanding;
      defaultMinsStepper.setValue(settings.defaultMinutes);
      cooldownStepper.setValue(settings.cooldownMinutes);
    }

    landingSelect.addEventListener("change", async () => {
      const updated = await state.updateSettings({
        defaultLanding: /** @type {CCWLandingTarget} */ (landingSelect.value),
      });
      refresh(updated);
      flashSaved();
      options.onSettingsChanged?.(updated);
    });

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
