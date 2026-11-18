import "../shared/ext.js";

const { ext } = CCW;

const statusEl = document.getElementById("storage-status");

async function checkLocalStorage() {
  if (!statusEl) return;
  try {
    await ext.storage.local.get(null);
    statusEl.textContent =
      "Local storage connected. Configurable distraction & timer settings will be added incrementally.";
  } catch (err) {
    statusEl.textContent = `Failed to read storage.local: ${String(err)}`;
  }
}

checkLocalStorage();
