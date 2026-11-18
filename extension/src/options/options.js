import "../shared/ext.js";
import "../shared/icons.js";
import "../shared/state.js";
import "../shared/settings-panel.js";

const { settingsPanel } = CCW;

const styleEl = document.createElement("style");
styleEl.textContent = settingsPanel.STYLES;
document.head.appendChild(styleEl);

const root = document.getElementById("options-root");
if (root) {
  settingsPanel.mount(root, {
    backLabel: "Back to YouTube",
    onBack() {
      window.location.assign("https://www.youtube.com");
    },
  });
}
