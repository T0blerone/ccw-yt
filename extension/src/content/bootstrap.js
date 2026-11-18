(() => {
  if (window !== window.top) return;

  const { state, tabAllowance } = CCW;
  if (!state || !tabAllowance) {
    console.error("[ccw-yt] Missing core state modules in content script.");
    return;
  }

  /** @param {CCWStateSnapshot} snapshot */
  function syncDocumentState(snapshot) {
    const resolution = tabAllowance.resolveTabState(snapshot);
    if (document.documentElement) {
      document.documentElement.dataset.ccwMode = resolution.mode;
    }
  }

  state
    .getState()
    .then(syncDocumentState)
    .catch((err) => {
      console.error("[ccw-yt] Initial state read failed:", err);
    });

  state.subscribe(syncDocumentState);
})();
