import "../shared/ext.js";
import "../shared/state.js";

const { state } = CCW;

const landingSelect = /** @type {HTMLSelectElement | null} */ (
  document.getElementById("default-landing")
);
const defaultMinutesInput = /** @type {HTMLInputElement | null} */ (
  document.getElementById("default-minutes")
);
const cooldownMinutesInput = /** @type {HTMLInputElement | null} */ (
  document.getElementById("cooldown-minutes")
);
const saveIndicator = document.getElementById("save-indicator");

/** @type {number | undefined} */
let saveTimer;

function flashSaved() {
  if (!saveIndicator) return;
  saveIndicator.textContent = "Saved locally.";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    if (saveIndicator) saveIndicator.textContent = "";
  }, 1800);
}

/**
 * @param {CCWSettings} settings
 */
function populateForm(settings) {
  if (landingSelect) {
    landingSelect.value = settings.defaultLanding;
  }
  if (defaultMinutesInput && document.activeElement !== defaultMinutesInput) {
    defaultMinutesInput.value = String(settings.defaultMinutes);
  }
  if (cooldownMinutesInput && document.activeElement !== cooldownMinutesInput) {
    cooldownMinutesInput.value = String(settings.cooldownMinutes);
  }
}

landingSelect?.addEventListener("change", async () => {
  const updated = await state.updateSettings({
    defaultLanding: /** @type {CCWLandingTarget} */ (landingSelect.value),
  });
  populateForm(updated);
  flashSaved();
});

defaultMinutesInput?.addEventListener("change", async () => {
  const parsed = Number(defaultMinutesInput.value);
  const updated = await state.updateSettings({
    defaultMinutes: Number.isFinite(parsed) ? parsed : 20,
  });
  populateForm(updated);
  flashSaved();
});

cooldownMinutesInput?.addEventListener("change", async () => {
  const parsed = Number(cooldownMinutesInput.value);
  const updated = await state.updateSettings({
    cooldownMinutes: Number.isFinite(parsed) ? parsed : 0,
  });
  populateForm(updated);
  flashSaved();
});

state.getState().then((snap) => populateForm(snap.settings));
state.subscribe((snap) => populateForm(snap.settings));
