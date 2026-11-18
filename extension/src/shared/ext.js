(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  if (!api) {
    throw new Error("[ccw-yt] WebExtension runtime API not available.");
  }

  /** @type {CCWNamespace} */
  const namespace = Object.assign(globalThis.CCW || {}, {
    ext: api,
    MESSAGES: Object.freeze({
      OPEN_OPTIONS: /** @type {const} */ ("CCW_OPEN_OPTIONS"),
    }),
  });

  globalThis.CCW = namespace;
})();
