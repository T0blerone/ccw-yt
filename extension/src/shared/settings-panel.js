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

    .ccw-settings__select,
    .ccw-settings__number {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      background: var(--input-bg, var(--bg));
      color: var(--fg);
      font-family: inherit;
      font-size: 14px;
      flex-shrink: 0;
    }

    .ccw-settings__select {
      min-width: 210px;
      cursor: pointer;
    }

    .ccw-settings__number {
      width: 92px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .ccw-settings__select:focus,
    .ccw-settings__number:focus {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
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
   * Mounts the shared Settings UI inside `container` (works in both Shadow DOM and Options page).
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
    defaultMinsLabel.textContent = "Default slider duration (minutes)";

    const defaultMinsHint = document.createElement("p");
    defaultMinsHint.className = "ccw-settings__hint";
    defaultMinsHint.textContent =
      "Initial position when the Entry Gate opens (1–240 min).";

    defaultMinsLabels.append(defaultMinsLabel, defaultMinsHint);

    const defaultMinsInput = document.createElement("input");
    defaultMinsInput.type = "number";
    defaultMinsInput.className = "ccw-settings__number";
    defaultMinsInput.id = "ccw-default-minutes";
    defaultMinsInput.min = "1";
    defaultMinsInput.max = "240";
    defaultMinsInput.step = "5";

    rowDefaultMins.append(defaultMinsLabels, defaultMinsInput);

    // Row 3: Post-session cooldown
    const rowCooldown = document.createElement("div");
    rowCooldown.className = "ccw-settings__row";

    const cooldownLabels = document.createElement("div");
    cooldownLabels.className = "ccw-settings__label-group";

    const cooldownLabel = document.createElement("label");
    cooldownLabel.className = "ccw-settings__label";
    cooldownLabel.htmlFor = "ccw-cooldown-minutes";
    cooldownLabel.textContent = "Post-session cooldown (minutes)";

    const cooldownHint = document.createElement("p");
    cooldownHint.className = "ccw-settings__hint";
    cooldownHint.textContent =
      "Optional break enforced after a session ends (0 = disabled).";

    cooldownLabels.append(cooldownLabel, cooldownHint);

    const cooldownInput = document.createElement("input");
    cooldownInput.type = "number";
    cooldownInput.className = "ccw-settings__number";
    cooldownInput.id = "ccw-cooldown-minutes";
    cooldownInput.min = "0";
    cooldownInput.max = "240";
    cooldownInput.step = "5";

    rowCooldown.append(cooldownLabels, cooldownInput);

    card.append(sectionTitle, rowLanding, rowDefaultMins, rowCooldown);
    root.append(topRow, header, card);
    container.replaceChildren(root);

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
     * @param {CCWSettings} settings
     */
    function refresh(settings) {
      const activeEl =
        root.getRootNode() instanceof ShadowRoot
          ? /** @type {ShadowRoot} */ (root.getRootNode()).activeElement
          : document.activeElement;

      landingSelect.value = settings.defaultLanding;
      if (activeEl !== defaultMinsInput) {
        defaultMinsInput.value = String(settings.defaultMinutes);
      }
      if (activeEl !== cooldownInput) {
        cooldownInput.value = String(settings.cooldownMinutes);
      }
    }

    landingSelect.addEventListener("change", async () => {
      const updated = await state.updateSettings({
        defaultLanding: /** @type {CCWLandingTarget} */ (landingSelect.value),
      });
      refresh(updated);
      flashSaved();
      options.onSettingsChanged?.(updated);
    });

    defaultMinsInput.addEventListener("change", async () => {
      const parsed = Number(defaultMinsInput.value);
      const updated = await state.updateSettings({
        defaultMinutes: Number.isFinite(parsed) ? parsed : 20,
      });
      refresh(updated);
      flashSaved();
      options.onSettingsChanged?.(updated);
    });

    cooldownInput.addEventListener("change", async () => {
      const parsed = Number(cooldownInput.value);
      const updated = await state.updateSettings({
        cooldownMinutes: Number.isFinite(parsed) ? parsed : 0,
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
