(() => {
  if (window !== window.top) return;
  if (window.location.hostname !== "m.youtube.com") return;

  const target = new URL(window.location.href);
  target.protocol = "https:";
  target.hostname = "www.youtube.com";

  window.stop();
  window.location.replace(target.toString());
})();
