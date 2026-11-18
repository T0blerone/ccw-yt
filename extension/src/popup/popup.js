import "../shared/ext.js";
import "../shared/icons.js";
import "../shared/state.js";

const { ext, icons, state } = CCW;

const statusPill = document.getElementById("status-pill");
const activePanel = document.getElementById("active-panel");
const cooldownPanel = document.getElementById("cooldown-panel");
const lockedPanel = document.getElementById("locked-panel");
const remainingDisplay = document.getElementById("remaining-display");
const cooldownDisplay = document.getElementById("cooldown-display");
const endSessionBtn = document.getElementById("end-session");
const openOptionsBtn = document.getElementById("open-options");
const stepMinusBtn = document.getElementById("step-minus");
const stepPlusBtn = document.getElementById("step-plus");
const minutesInput = /** @type {HTMLInputElement | null} */ (
  document.getElementById("minutes-input")
);
const minutesSlider = /** @type {HTMLInputElement | null} */ (
  document.getElementById("minutes-slider")
);
const startSessionBtn = document.getElementById("start-session");

if (openOptionsBtn) openOptionsBtn.appendChild(icons.create("gear", 18));
if (stepMinusBtn) stepMinusBtn.appendChild(icons.create("minus", 16));
if (stepPlusBtn) stepPlusBtn.appendChild(icons.create("plus", 16));

/** @type {CCWStateSnapshot | null} */
let currentSnapshot = null;
let selectedMinutes = 20;
let initializedDefault = false;

/**
 * @param {number} mins
 */
function setSelectedMinutes(mins) {
  const clamped = Math.max(1, Math.min(240, Math.round(mins)));
  selectedMinutes = clamped;

  if (minutesInput && document.activeElement !== minutesInput) {
    minutesInput.value = String(clamped);
    minutesInput.style.width = `${Math.max(1, String(clamped).length)}ch`;
  }
  if (minutesSlider) {
    minutesSlider.value = String(Math.max(5, Math.min(120, clamped)));
  }
}

/**
 * @param {-1 | 1} direction
 */
function stepByFive(direction) {
  const next =
    direction > 0
      ? Math.floor(selectedMinutes / 5) * 5 + 5
      : Math.ceil(selectedMinutes / 5) * 5 - 5;
  setSelectedMinutes(Math.max(5, Math.min(120, next)));
}

/**
 * @param {CCWStateSnapshot} snapshot
 */
function applySnapshot(snapshot) {
  currentSnapshot = snapshot;
  if (!initializedDefault) {
    initializedDefault = true;
    setSelectedMinutes(snapshot.settings.defaultMinutes);
  }
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

if (stepMinusBtn) {
  stepMinusBtn.addEventListener("click", () => stepByFive(-1));
}
if (stepPlusBtn) {
  stepPlusBtn.addEventListener("click", () => stepByFive(1));
}
if (minutesSlider) {
  minutesSlider.addEventListener("input", () => {
    setSelectedMinutes(Number(minutesSlider.value));
  });
}
if (minutesInput) {
  minutesInput.addEventListener("focus", () => {
    minutesInput.select();
  });
  minutesInput.addEventListener("input", () => {
    const digits = minutesInput.value.replace(/\D+/g, "").slice(0, 3);
    minutesInput.value = digits;
    minutesInput.style.width = `${Math.max(1, digits.length)}ch`;
    if (digits.length > 0) {
      const parsed = Math.max(1, Math.min(240, Number(digits)));
      selectedMinutes = parsed;
      if (minutesSlider) {
        minutesSlider.value = String(Math.max(5, Math.min(120, parsed)));
      }
    }
  });
  minutesInput.addEventListener("blur", () => {
    const parsed = Number(minutesInput.value);
    setSelectedMinutes(
      Number.isFinite(parsed) && parsed >= 1
        ? parsed
        : currentSnapshot?.settings.defaultMinutes ?? 20
    );
  });
  minutesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      minutesInput.blur();
      startSessionBtn?.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      minutesInput.value = String(selectedMinutes);
      minutesInput.blur();
    }
  });
}

if (startSessionBtn) {
  startSessionBtn.addEventListener("click", async () => {
    const result = await state.startTimedSession(selectedMinutes * 60);
    applySnapshot(result.state);
  });
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
