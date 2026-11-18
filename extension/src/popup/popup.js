import "../shared/ext.js";

const { ext } = CCW;

const openOptionsButton = document.getElementById("open-options");
if (openOptionsButton) {
  openOptionsButton.addEventListener("click", async () => {
    await ext.runtime.openOptionsPage();
    window.close();
  });
}
