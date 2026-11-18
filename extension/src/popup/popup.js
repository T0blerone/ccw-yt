import "../shared/ext.js";
import "../shared/state.js";

const { ext, state } = CCW;

const statusPill = document.getElementById("status-pill");
const activePanel = document.getElementById("active-panel");
const cooldownPanel = document.getElementById("cooldown-panel");
const lockedPanel = document.getElementById("locked-panel");
const remainingDisplay = document.getElementById("remaining-display");
const cooldownDisplay = document.getElementById("cooldown-display");
const presetGrid = document.getElementById("preset-grid");
const endSessionBtn = document.getElementById("end-session");
const openOptionsBtn = document.getElementById("open-options");

/** @type {CCWStateSnapshot | null} */
let currentSnapshot = null;

/** @type {string} */
let renderedPresetsKey = "";

/**
 * @param {number[]} presetMinutes
 */
function renderPresets(presetMinutes) {
  if (!presetGrid) return;
  const key = presetMinutes.join(",");
  if (key === renderedPresetsKey) return;
  renderedPresetsKey = key;

  presetGrid.replaceChildren();
  for (const mins of presetMinutes) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "popup__preset-btn";
    btn.textContent = `${mins} min`;
    btn.addEventListener("click", async () => {
      const result = await state.startTimedSession(mins * 60);
      applySnapshot(result.state);
    });
    presetGrid.appendChild(btn);
  }
}

/**
 * @param {CCWStateSnapshot} snapshot
 */
function applySnapshot(snapshot) {
  currentSnapshot = snapshot;
  renderPresets(snapshot.settings.presetMinutes);
  renderTick();
}

function renderTick() {
  if (!currentSnapshot) return;
  const now = Date.now();

  if (currentSnapshot.session) {
    const rem = state.getRemainingSeconds(currentSnapshot.session, now);
    if (rem <= 0) {
      state.getState(now).then(applySnapshot);
      return;
    }

    if (statusPill) {
      statusPill.textContent = "Active";
      statusPill.dataset.status = "active";
    }
    if (remainingDisplay) {
      remainingDisplay.textContent = state.formatDuration(rem);
    }
    if (activePanel) activePanel.hidden = false;
    if (cooldownPanel) cooldownPanel.hidden = true;
    if (lockedPanel) lockedPanel.hidden = true;
    return;
  }

  if (currentSnapshot.cooldownUntil > 0) {
    const cdSec = Math.max(
      0,
      Math.ceil((currentSnapshot.cooldownUntil - now) / 1000)
    );
    if (cdSec <= 0) {
      state.getState(now).then(applySnapshot);
      return;
    }

    if (statusPill) {
      statusPill.textContent = "Cooldown";
      statusPill.dataset.status = "cooldown";
    }
    if (cooldownDisplay) {
      cooldownDisplay.textContent = state.formatDuration(cdSec);
    }
    if (activePanel) activePanel.hidden = true;
    if (cooldownPanel) cooldownPanel.hidden = false;
    if (lockedPanel) lockedPanel.hidden = true;
    return;
  }

  if (statusPill) {
    statusPill.textContent = "Locked";
    delete statusPill.dataset.status;
  }
  if (activePanel) activePanel.hidden = true;
  if (cooldownPanel) cooldownPanel.hidden = true;
  if (lockedPanel) lockedPanel.hidden = false;
}

if (endSessionBtn) {
  endSessionBtn.addEventListener("click", async () => {
    const next = await state.endSession({ reason: "manual" });
    applySnapshot(next);
  });
}

if (openOptionsBtn) {
  openOptionsBtn.addEventListener("click", async () => {
    await ext.runtime.openOptionsPage();
    window.close();
  });
}

state.getState().then(applySnapshot);
const unsubscribe = state.subscribe(applySnapshot);
const tickId = window.setInterval(renderTick, 250);

window.addEventListener("unload", () => {
  unsubscribe();
  window.clearInterval(tickId);
});
