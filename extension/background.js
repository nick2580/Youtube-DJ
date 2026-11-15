// Relays requests from the YouTube page to the local yt-dj helper (avoids CORS / private-network limits).
const HELPER = "http://127.0.0.1:8765";

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  return btoa(s);
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  (async () => {
    try {
      const opts = { method: msg.method || "GET", headers: {} };
      if (msg.body) {
        opts.body = JSON.stringify(msg.body);
        opts.headers["content-type"] = "application/json";
      }
      const r = await fetch(HELPER + msg.path, opts);
      if (!r.ok) return reply({ ok: false, status: r.status, error: await r.text() });
      if (msg.op === "bin") return reply({ ok: true, b64: toBase64(await r.arrayBuffer()) });
      reply({ ok: true, data: await r.json() });
    } catch (e) {
      reply({ ok: false, offline: true, error: String(e) });
    }
  })();
  return true; // async reply
});

// Toolbar button: toggle the DJ view on the active YouTube tab.
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.tabs.sendMessage(tab.id, { op: "toggle" }).catch(() => {});
});
