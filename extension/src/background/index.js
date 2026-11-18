import "../shared/ext.js";

const { ext, MESSAGES } = CCW;

ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    message.type === MESSAGES.OPEN_OPTIONS
  ) {
    ext.runtime
      .openOptionsPage()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
  return false;
});
