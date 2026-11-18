(() => {
  if (window !== window.top) return;

  // Step 1 scaffold verification: confirms `CCW.ext` initialized cleanly at `document_start`.
  // Step 2 (session state) and Step 3 (`document_start` cloak + Entry Gate) hook in here.
  if (!globalThis.CCW?.ext) {
    console.error("[ccw-yt] Missing CCW.ext runtime in content script.");
  }
})();
