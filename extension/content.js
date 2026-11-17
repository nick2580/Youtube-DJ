// yt-dj content script: Mix-queue detection, audio handover engine, and the view model for the DJ worlds (ui/*.js).
(() => {
  if (window.__ytdj) return;
  window.__ytdj = true;

  // ------------------------------------------------------------------ helper bridge
  // After the extension is reloaded or updated, this copy keeps running in the open tab but can no longer reach
  // the extension ("Extension context invalidated"); the new copy only arrives when the tab is refreshed.
  // So this copy retires: hands the sound back to YouTube, stops its loops, and asks for a refresh.
  const alive = () => { try { return !!(chrome.runtime && chrome.runtime.id); } catch (_) { return false; } };
  const send = (msg) => new Promise((res) => {
    const fail = { ok: false, offline: true };
    if (!alive()) { retire(); return res(fail); }
    try { chrome.runtime.sendMessage(msg, (r) => res(r || fail)); } catch (_) { retire(); res(fail); }
  });
  const api = (path, method = "GET", body) => send({ op: "json", path, method, body });
  const apiBin = (path) => send({ op: "bin", path });
  const b64ToBuf = (b64) => {
    const s = atob(b64), u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u.buffer;
  };

  const SKIP = new Set();

  // ------------------------------------------------------------------ YouTube page access
  const getVideo = () => document.querySelector("#movie_player video.html5-main-video") || document.querySelector("video");
  const urlParam = (k) => new URLSearchParams(location.search).get(k);
  const adShowing = () => !!document.querySelector("#movie_player.ad-showing");

  function cleanTitle(t) {
    t = (t || "").replace(/\s+/g, " ").trim();
    const parts = t.split("|").map((x) => x.trim()).filter(Boolean);
    let main = parts[0] || t;
    const extra = [];
    const from = main.match(/\((?:from|From|FROM)\s+["“']?([^"”')]+)["”']?\)/);
    if (from) { extra.push(from[1]); main = main.replace(from[0], ""); }
    main = main.replace(/^(full video|full song|lyrical|video|audio)\s*[:\-–—]\s*/i, "");
    main = main.replace(/\s*[\-–—:]\s*(official\s+(music\s+)?video|official\s+audio|lyrical( video)?|full (video|version|song)|audio( song)?|video song|lyric video)\b.*$/i, "");
    main = main.replace(/\((?:[^)]*(?:video|lyric|audio|official|full|hd|4k|song)[^)]*)\)/gi, "");
    main = main.replace(/\s+(full video|full song|video song|song|lyrical)$/i, "").replace(/\s{2,}/g, " ").trim();
    return { title: main || t, sub: [...extra, ...parts.slice(1, 3)].join(" · ") };
  }

  function readQueue() {
    const panels = [...document.querySelectorAll("ytd-playlist-panel-renderer")];
    const panel = panels.find((p) => p.querySelector("ytd-playlist-panel-video-renderer[selected]")) || panels[0];
    if (!panel) return null;
    const items = [...panel.querySelectorAll("ytd-playlist-panel-video-renderer")];
    const sel = items.findIndex((el) => el.hasAttribute("selected"));
    if (sel < 0) return null;
    const info = (el) => {
      if (!el) return null;
      const a = el.querySelector("a#wc-endpoint") || el.querySelector("a[href*='watch?v=']");
      const href = a ? a.getAttribute("href") : "";
      const id = (href.match(/[?&]v=([\w-]{11})/) || [])[1];
      if (!id) return null;
      const rawTitle = (el.querySelector("#video-title")?.getAttribute("title") || el.querySelector("#video-title")?.textContent || "").trim();
      const byline = (el.querySelector("#byline")?.textContent || "").trim();
      const c = cleanTitle(rawTitle);
      return { id, rawTitle, title: c.title, sub: c.sub, artist: byline, el, anchor: a };
    };
    // skip videos the helper flagged as not-a-song (full albums, jukeboxes > 10 min)
    const after = items.slice(sel + 1).map(info).filter((x) => x && !SKIP.has(x.id));
    const upcoming = [info(items[sel]), ...after.slice(0, 4)].filter(Boolean).map((x) => x.id);
    return { cur: info(items[sel]), next: after[0] || null, next2: after[1] || null, upcoming };
  }

  // ------------------------------------------------------------------ audio graph
  const A = { ctx: null, src: null, vidGain: null, bufGain: null, hooked: false };

  function initAudio() {
    if (A.hooked) return true;
    const v = getVideo();
    if (!v) return false;
    A.ctx = A.ctx || new AudioContext({ latencyHint: "playback" });
    if (A.ctx.state !== "running") return false;
    A.src = A.ctx.createMediaElementSource(v);
    A.vidGain = A.ctx.createGain();
    A.bufGain = A.ctx.createGain();
    A.bufGain.gain.value = 0;
    A.src.connect(A.vidGain).connect(A.ctx.destination);
    A.bufGain.connect(A.ctx.destination);
    // analyser tap (not routed to the speakers): lets the DJ view react to what is actually audible
    A.an = A.ctx.createAnalyser();
    A.an.fftSize = 1024; A.an.smoothingTimeConstant = 0.5;
    A.vidGain.connect(A.an); A.bufGain.connect(A.an);
    A.hooked = true;
    A.video = v;
    return true;
  }

  function ramp(param, to, t0, dur) {
    param.cancelScheduledValues(t0);
    param.setValueAtTime(param.value, t0);
    param.linearRampToValueAtTime(to, t0 + dur);
  }

  // ------------------------------------------------------------------ engine state
  const S = {
    enabled: localStorage.getItem("ytdj-enabled") === "1",
    phase: "idle",          // idle | preparing | armed | mixing | handover | error
    status: "",
    q: null,
    curId: null,
    aRate: 1,               // playbackRate (session tempo) of the current video
    rateFor: null,          // video id that aRate belongs to
    planKey: null,
    plan: null,
    buffer: null,
    pollT: 0,
    mix: null,              // {startCtx, tau0, src, target, k}
    art: {},
    segs: {},               // video id -> allin1 sections in YouTube (original) time
    engine: "", online: false,
    lastErr: "",
  };
  const fmt = (s) => (isFinite(s) && s >= 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "–:––");
  const vol = () => { const v = getVideo(); return v ? (v.muted ? 0 : v.volume) : 1; };

  async function loadArt(id) {
    if (!id || S.art[id]) return;
    S.art[id] = { accent: "#8a7dff", deep: "#14121c", pending: true };
    const r = await api(`/art/${id}`);
    if (r.ok) S.art[id] = r.data;
  }

  function resetPlan(reason) {
    S.planKey = null; S.plan = null; S.buffer = null; S.phase = "idle";
    if (reason) S.status = reason;
  }

  async function prepare(cur, next, v) {
    const key = `${cur.id}|${next.id}|${S.aRate.toFixed(4)}`;
    S.planKey = key; S.plan = null; S.buffer = null; S.phase = "preparing"; S.status = "Sending queue to the decks…";
    // the songs after `next` let the helper plan the set a few songs ahead; a_entry = where this song was mixed in
    const L = S.lastMix, aEntry = L && L.outcome === "ok" && L.b.id === cur.id ? L.plan.entry_b_orig : null;
    const r = await api("/prepare", "POST", { a: cur.id, b: next.id, a_rate: S.aRate, min_exit: v.currentTime + 35, now: v.currentTime,
      queue: (S.q.upcoming || []).slice(2, 4), a_entry: aEntry });
    if (!r.ok) { S.phase = "error"; S.status = r.offline ? "helper offline" : `helper error: ${r.error}`; S.planKey = null; return; }
    S.pollT = 0;
  }

  async function poll(cur, next) {
    const key = S.planKey;
    const r = await api(`/plan?a=${cur.id}&b=${next.id}&a_rate=${S.aRate}`);
    if (key !== S.planKey) return;
    if (!r.ok) {
      if (r.offline) { S.phase = "error"; S.status = "helper offline"; S.planKey = null; }
      else if (r.status === 404) S.planKey = null;          // helper restarted / lost the job: ask again
      return;
    }
    const d = r.data;
    if (d.status === "error" && d.skip && d.skip === next.id) {
      S.skipShow = { info: next, until: performance.now() + 5500 };
      SKIP.add(d.skip); S.planKey = null; S.phase = "idle";        // re-plan straight into the song after it
      S.status = "Skipping a full album / long video in the queue";
      return;
    }
    if (d.status === "error" && d.skip && d.skip === cur.id) {
      S.phase = "error"; S.errAt = performance.now() + 1e9;       // don't retry for this video
      S.status = "Too long to mix — playing normally";
      return;
    }
    if (d.status === "error") { S.phase = "error"; S.errAt = performance.now(); S.status = d.error || "could not plan this mix"; return; }
    if (d.status !== "ready") { S.status = cap(d.status) + "…"; return; }
    S.status = "Loading the blend…";
    const bin = await apiBin(`/blend?a=${cur.id}&b=${next.id}&a_rate=${S.aRate}`);
    if (key !== S.planKey || !bin.ok) return;
    const ctx = A.ctx || new AudioContext();
    A.ctx = ctx;
    S.buffer = await ctx.decodeAudioData(b64ToBuf(bin.b64));
    S.plan = d.plan;
    if (d.plan.a.segments) S.segs[cur.id] = d.plan.a.segments.map((x) => ({ ...x, start: x.start * d.plan.a_rate, end: x.end * d.plan.a_rate }));
    if (d.plan.b.segments) S.segs[next.id] = d.plan.b.segments;
    S.phase = "armed";
    S.status = d.plan.style === "bass_drop" ? "Bass drop armed" : "Blend armed";
  }
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  // ------------------------------------------------------------------ feedback log
  // Every transition becomes one record. It is sent to the helper when the handover ends, when the listener
  // rates it (thumbs up/down + optional tags), and when song B is left (how long it was kept = implicit signal).
  const songInfo = (x) => (x ? { id: x.id, title: x.title || "", artist: x.artist || "", raw: x.rawTitle || "" } : null);
  function logMix(L, event) {
    const v = getVideo();
    api("/feedback", "POST", {
      mix_id: L.mix_id, a: L.a.id, b: L.b.id, a_rate: L.a_rate, rating: L.rating, tags: L.tags, event, plan: L.plan,
      client: {
        a: L.a, b: L.b, started_at: L.started_at, outcome: L.outcome, why: L.why, sync: L.sync,
        level: L.level, ui_check: L.ui_check, restart_fixed: L.restart_fixed || 0,
        paused_during_mix: L.paused, rated_at_s_after_drop: L.rated_at, b_kept_s: L.b_kept_s, b_left_how: L.b_left_how,
        b_left_at: L.b_left_at, b_dur: L.b_dur, volume: L.volume, theme: localStorage.getItem("ytdj-theme"),
        ui_open: !!(window.YTDJ.isOpen && window.YTDJ.isOpen()), playback_rate_now: v ? v.playbackRate : null,
      },
    });
  }
  function closeB(L, how) {
    if (!L || L.outcome !== "ok" || L.b_kept_s != null) return;
    L.b_kept_s = Math.round((Date.now() - L.dropWall) / 100) / 10; L.b_left_how = how;
    logMix(L, "left_b");
  }
  let tagTimer = 0;
  const rateAct = {
    rate: (r) => {
      const L = S.lastMix; if (!L) return;
      L.rating = L.rating === r ? null : r; L.tags = [];
      L.rated_at = Math.round((Date.now() - L.dropWall) / 100) / 10;
      logMix(L, "rate");
    },
    tag: (t) => {
      const L = S.lastMix; if (!L || !L.rating) return;
      L.tags = L.tags.includes(t) ? L.tags.filter((x) => x !== t) : [...L.tags, t];
      clearTimeout(tagTimer); tagTimer = setTimeout(() => logMix(L, "rate"), 1200);
    },
  };

  function startMix(v) {
    const P = S.plan, ctx = A.ctx;
    const lead = 0.15, when = ctx.currentTime + lead;
    const tau0 = (v.currentTime - P.file_start_a_orig) / S.aRate + lead;
    closeB(S.lastMix, "next_mix");
    const src = ctx.createBufferSource();
    src.buffer = S.buffer;
    src.connect(A.bufGain);
    src.start(when, Math.max(0, tau0));
    // YouTube normalises loudness by lowering each video's element volume (min(1, 10^((-14-LUFS)/20))),
    // so the buffer must play A at A's volume and B at the volume YouTube will give B, or B's part of the
    // blend is too loud/quiet and snaps back at the handover. The ratio cancels the user's slider.
    const volA = vol(), gA = P.a.yt_gain, gB = P.b.yt_gain;
    const normOn = gA > 0 && gB > 0 && volA <= gA * 1.06;            // volA above gA: normalisation isn't active
    const volB = Math.min(1, normOn ? volA * gB / gA : volA);
    const g = A.bufGain.gain, tBlend = when + Math.max(0.35, P.blend_start - tau0), tDrop = when + Math.max(0.4, P.drop - tau0);
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(0, when + 0.02);
    g.linearRampToValueAtTime(volA, when + 0.32);
    g.setValueAtTime(volA, Math.max(when + 0.33, tBlend));
    g.linearRampToValueAtTime(volB, Math.max(when + 0.34, tDrop));
    ramp(A.vidGain.gain, 0, when + 0.02, 0.3);
    const rec = { mix_id: `${S.q.cur.id}_${S.q.next.id}_${Date.now()}`, a: songInfo(S.q.cur), b: songInfo(S.q.next), a_rate: S.aRate, plan: P,
      started_at: new Date().toISOString(), dropWall: Date.now() + (P.drop - tau0) * 1000, outcome: "playing", why: null, sync: null,
      paused: false, rating: null, tags: [], rated_at: null, b_kept_s: null, b_left_how: null, b_left_at: null, b_dur: null, volume: Math.round(volA * 100) / 100,
      level: { a: r3(volA), b_pred: r3(volB), b_actual: null, norm: normOn }, ui_check: null };
    S.lastMix = rec;
    S.mix = { startCtx: when, tau0, src, target: S.q.next, k: P.k, plan: P, step: "wait", tries: 0, navAt: 0, rec };
    S.phase = "mixing";
    S.status = "Mixing";
  }
  const r3 = (x) => Math.round(x * 1000) / 1000;
  const tau = () => S.mix.tau0 + (A.ctx.currentTime - S.mix.startCtx);

  function finishHandover(ok, why) {
    const M = S.mix, now = A.ctx.currentTime;
    const L = M.rec;
    L.outcome = ok ? "ok" : "fell_back"; L.why = ok ? null : why || "unknown";
    L.sync = { step: M.step, tries: M.tries, ms: M.syncStart ? Math.round(performance.now() - M.syncStart) : null,
      drift_ms: M.drift != null ? Math.round(M.drift * 1000) : null };
    if (!ok) L.dropWall = Math.min(L.dropWall, Date.now());
    const vv = getVideo();
    if (L.level && vv) L.level.b_actual = r3(vv.muted ? 0 : vv.volume);
    logMix(L, "mix_end");
    ramp(A.vidGain.gain, 1, now, 0.3);
    ramp(A.bufGain.gain, 0, now, 0.3);
    try { M.src.stop(now + 0.45); } catch (_) {}
    const v = getVideo();
    if (ok && v) {
      v.playbackRate = M.k; S.aRate = M.k; S.rateFor = M.target.id;
      // safety net: if YouTube still restarts B from the top after the handover, put it back where the mix left it
      S.guard = { id: M.target.id, pos: v.currentTime, at: performance.now(), k: M.k, until: performance.now() + 12000, fixes: 0, rec: L };
    }
    S.curId = M.target.id;
    S.mix = null;
    resetPlan(ok ? "" : "Handover fell back");
  }

  function handoverTick(v) {
    const M = S.mix, P = M.plan;
    const t = tau();
    const bOrig = (x) => (P.b_file_origin + x) * P.k;
    if (t > P.file_dur - 0.4) return finishHandover(false, "handover_timeout");
    if (urlParam("v") !== M.target.id || adShowing() || v.readyState < 2) return;
    if (M.step === "wait") {
      if (performance.now() - M.navAt < 400) return;
      const durB = P.b && P.b.dur, isB = !durB || Math.abs(v.duration - durB) < 3;
      const changed = M.mediaChanged || v.currentSrc !== M.srcA;
      const durMoved = isFinite(M.durA) && Math.abs(v.duration - M.durA) > 3;
      if (!(isB && (changed || durMoved))) return;
      v.preservesPitch = true;
      v.playbackRate = P.k;
      M.lead = 0.7;
      v.currentTime = bOrig(t + M.lead);
      if (v.paused) v.play().catch(() => {});
      M.step = "sync"; M.syncStart = performance.now();
      return;
    }
    if (M.step === "sync") {
      if (v.seeking || v.paused) return;
      const drift = v.currentTime - bOrig(tau());
      M.drift = drift;
      // the video is muted (vidGain 0) until the crossfade, so re-seeking and big speed nudges are inaudible.
      // A seek lands `lead` seconds ahead minus however long the seek took: correct the lead by what we measured.
      if (Math.abs(drift) > 0.25 && M.tries < 4) {
        M.tries++; M.lead = Math.max(0.05, Math.min(2, M.lead - drift));
        v.currentTime = bOrig(tau() + M.lead); return;
      }
      // lock, or give up while there is still B tail left to crossfade over (it used to stop at 4 s, ~300 ms off)
      M.lockN = Math.abs(drift) < 0.025 ? (M.lockN || 0) + 1 : 0;      // must hold for 3 ticks (~0.4 s)
      if (M.lockN >= 3 || performance.now() - M.syncStart > 12000 || tau() > P.file_dur - 2) {
        v.playbackRate = P.k;
        return finishHandover(true);
      }
      v.playbackRate = P.k * (1 - Math.max(-0.25, Math.min(0.25, drift)));
    }
  }

  function restartGuard(v, vid) {
    const G = S.guard;
    if (!G) return;
    const now = performance.now();
    if (now > G.until || vid !== G.id || S.mix) { S.guard = null; return; }
    if (v.paused || v.seeking) { G.pos = v.currentTime; G.at = now; return; }       // re-anchor across pauses
    const expected = G.pos + ((now - G.at) / 1000) * G.k;
    if (v.currentTime < Math.min(5, expected - 3) && G.fixes < 2) {               // jumped back to the top
      G.fixes++; G.rec.restart_fixed = (G.rec.restart_fixed || 0) + 1;
      console.warn("[yt-dj] YouTube restarted the song after the handover; seeking back to", expected.toFixed(1));
      v.currentTime = expected;
      G.pos = expected; G.at = now;
      return;
    }
    G.pos = v.currentTime; G.at = now;
  }

  // What is on screen around the song switch. Records the first moments the DJ view is not what the
  // listener sees (covered, closed, fullscreen, popover...), for the "YouTube flashes for a few seconds" report.
  function uiCheck() {
    const L = S.lastMix;
    if (!L || !L.navAt || L.uiDone || !window.YTDJ.screen) return;
    const since = performance.now() - L.navAt;
    if (since > 15000) {                     // window over: send what was seen, if anything was wrong
      L.uiDone = true;
      if (L.ui_check && L.ui_check.bad.length) logMix(L, "ui_check");
      return;
    }
    const s = window.YTDJ.screen();
    if (!L.ui_check) L.ui_check = { wasOpen: s.open, samples: 0, bad: [] };
    const U = L.ui_check; U.samples++;
    if (!U.wasOpen) return;
    if (s.hidden) return;                    // tab in the background: nothing to see
    const bad = !s.open || s.top !== "div#ytdj-host" || s.fs || s.popovers || s.modal || s.ovOpacity < 0.99;
    if (bad && U.bad.length < 6) {
      U.bad.push({ ms: Math.round(since), step: S.mix ? S.mix.step : "after", ...s });
      console.debug("[yt-dj] DJ view check during handover", JSON.stringify(s));
    }
  }

  // ------------------------------------------------------------------ main loop
  let busy = false;
  async function tick() {
    if (busy) return;
    busy = true;
    try { await step(); } catch (e) { console.warn("[yt-dj]", e); }
    busy = false;
  }

  async function step() {
    const v = getVideo();
    const vid = urlParam("v");
    const isMix = (urlParam("list") || "").startsWith("RD") || !!urlParam("list");
    if (!S.enabled || !v || location.pathname !== "/watch") return;
    uiCheck();
    restartGuard(v, vid);

    // audio context needs a user gesture; wait for it
    if (!A.hooked) {
      if (!A.ctx || A.ctx.state !== "running") { S.status = "Click anywhere on the page to arm the decks"; return; }
      initAudio();
    }

    // how long song B is kept after a mix: tracked until the page moves to another video
    const L = S.lastMix;
    if (L && L.outcome === "ok" && L.b_kept_s == null && !S.mix) {
      if (vid === L.b.id) { L.b_left_at = Math.round(v.currentTime); if (isFinite(v.duration)) L.b_dur = Math.round(v.duration); }
      else if (vid) closeB(L, L.b_dur && L.b_left_at >= L.b_dur - 3 ? "ended" : "skipped_or_jumped");
    }

    // keep YouTube paused/playing in step with the blend buffer
    if (S.mix) {
      if (v.paused && S.phase === "mixing" && urlParam("v") === S.curId) S.mix.rec.paused = true;
      if (v.paused && A.ctx.state === "running" && urlParam("v") === (S.phase === "handover" ? S.mix.target.id : S.curId)) A.ctx.suspend();
      else if (!v.paused && A.ctx.state === "suspended") A.ctx.resume();
    }

    if (S.phase === "mixing") {
      const P = S.mix.plan, t = tau();
      if (t >= P.blend_end + 0.3) {
        S.phase = "handover"; S.status = "Handing over";
        S.mix.navAt = S.mix.rec.navAt = performance.now();
        // The URL changes at once on the click, but the <video> keeps playing A's media for a moment before
        // YouTube loads B into it. Syncing then locks onto A and YouTube starts B from 0:00 right after.
        // So remember A's media and wait for evidence that B is loaded.
        const M0 = S.mix;
        M0.srcA = v.currentSrc; M0.durA = v.duration; M0.mediaChanged = false;
        for (const ev of ["emptied", "loadstart", "durationchange"]) v.addEventListener(ev, () => { M0.mediaChanged = true; }, { once: true });
        const q = readQueue();
        const tgt = q && q.next && q.next.id === S.mix.target.id ? q.next : S.mix.target;
        (tgt.anchor || document.querySelector(".ytp-next-button"))?.click();
      }
      return;
    }
    if (S.phase === "handover") return handoverTick(v);

    S.q = readQueue();
    if (!isMix || !S.q || !S.q.cur) { S.status = "Play a YouTube Mix to start the set"; resetPlan(); return; }
    const { cur, next } = S.q;
    if (vid !== cur.id) return;  // panel not updated yet
    loadArt(cur.id); next && loadArt(next.id); S.q.next2 && loadArt(S.q.next2.id);
    // prefetch: the helper downloads + preps every upcoming track in the background
    const wk = S.q.upcoming.join(",");
    if (wk && wk !== S.warmKey) { S.warmKey = wk; api("/warm", "POST", { ids: S.q.upcoming }); }

    // session tempo belongs to one video; a manual jump resets it
    if (S.rateFor !== vid) { S.aRate = 1; S.rateFor = vid; }
    if (Math.abs(v.playbackRate - S.aRate) > 0.001 && S.aRate !== 1) v.playbackRate = S.aRate;
    if (S.curId !== vid) { S.curId = vid; resetPlan(); }
    if (!next) { S.status = "End of queue"; return; }

    const key = `${cur.id}|${next.id}|${S.aRate.toFixed(4)}`;
    if (S.planKey !== key) {
      if (S.phase === "error" && performance.now() - (S.errAt || 0) < 15000) return;
      await prepare(cur, next, v);
      if (S.phase === "error") S.errAt = performance.now();
      return;
    }
    if (S.phase === "preparing") {
      if (performance.now() - S.pollT > 1500) { S.pollT = performance.now(); await poll(cur, next); }
      return;
    }
    if (S.phase === "armed") {
      const P = S.plan;
      const preStart = P.file_start_a_orig, blendStart = P.file_start_a_orig + P.blend_start * S.aRate;
      if (v.currentTime > blendStart - 1.0) { resetPlan("Missed the mix point, re-planning"); S.planKey = null; return; }
      if (v.currentTime >= preStart + 0.3 && !v.paused && !adShowing()) startMix(v);
    }
  }
  let retired = false;
  function retire() {
    if (retired) return;
    retired = true;
    clearInterval(tickT); clearInterval(healthT);
    try {
      if (S.mix) S.mix.src.stop();
      if (A.hooked) {         // the video stays routed through our AudioContext, so keep it running at full level
        A.bufGain.gain.cancelScheduledValues(0); A.bufGain.gain.value = 0;
        A.vidGain.gain.cancelScheduledValues(0); A.vidGain.gain.value = 1;
        if (A.ctx.state !== "running") A.ctx.resume();
      }
    } catch (_) {}
    console.info("[yt-dj] the extension was reloaded: refresh this tab to use the new version");
    if (window.YTDJ.retire) window.YTDJ.retire("Updated · click to refresh");
  }

  const tickT = setInterval(tick, 120);
  async function health() {
    const r = await api("/health");
    S.online = !!r.ok; S.engine = r.ok ? r.data.analyzer : "";
  }
  health(); const healthT = setInterval(health, 8000);


  const arm = () => {
    if (!S.enabled) return;
    A.ctx = A.ctx || new AudioContext({ latencyHint: "playback" });
    if (A.ctx.state !== "running") A.ctx.resume();
  };
  document.addEventListener("click", arm, true);
  document.addEventListener("keydown", arm, true);

  chrome.runtime.onMessage.addListener((m) => { if (m.op === "toggle") toggleUI(); });

  // ------------------------------------------------------------------ view model
  // The worlds in ui/*.js never touch the engine: every frame they get one plain object describing the set.
  const STEPS = ["fetching audio", "checking length", "separating stems", "mapping sections", "matching tempo & key", "choosing the moment"];
  let rqC = null, rqT = -1e9;
  const rq = () => { const n = performance.now(); if (n - rqT > 150) { rqT = n; rqC = readQueue(); } return rqC; };

  // stable roles (no flash at the handover)
  const V = { lastQ: null, from: null, pin: null, meta: {}, dropAt: null, prevPlan: null, skip: null };
  function view() {
    const q = rq();
    if (q && q.cur && q.cur.id === urlParam("v")) V.lastQ = q;
    const Q = V.lastQ;
    if (S.mix) {
      const P = S.mix.plan, t = tau();
      if (!V.from) V.from = (Q && Q.cur && Q.cur.id === S.curId) ? Q.cur : { id: S.curId, title: "", sub: "" };
      const after = Q ? [Q.next, Q.next2].find((x) => x && x.id !== S.mix.target.id) || null : null;
      if (t >= P.drop) {
        if (!V.pin) { V.dropAt = performance.now(); V.prevPlan = P; }
        V.pin = { main: S.mix.target, side: after, prev: V.from };
        return { main: S.mix.target, side: after, prev: V.from, P, t, phase: "arrival" };
      }
      return { main: V.from, side: S.mix.target, P, t, phase: t >= P.blend_start ? "blending" : "armed" };
    }
    V.from = null;
    if (V.pin) {
      if (Q && Q.cur && Q.cur.id === V.pin.main.id) V.pin = null;
      else return { main: V.pin.main, side: V.pin.side, prev: V.pin.prev, P: null, t: null, phase: "arrival" };
    }
    const sinceDrop = V.dropAt ? (performance.now() - V.dropAt) / 1000 : 99;
    if (S.skipShow && performance.now() < S.skipShow.until && Q && Q.cur) {
      V.skip = S.skipShow.info.title;
      return { main: Q.cur, side: S.skipShow.info, P: null, t: null, phase: "skipping" };
    }
    const phase = sinceDrop < 7 ? "arrival" : S.phase === "armed" ? "armed" : "listening";
    return { main: Q ? Q.cur : null, side: Q ? Q.next : null, prev: sinceDrop < 7 && V.lastPrev ? V.lastPrev : null, P: S.plan, t: null, phase };
  }

  const leaveText = (s) => ({ "end of chorus": "at the end of the chorus", "chorus": "within the chorus", "end of verse": "at the end of the verse",
    "end of bridge": "at the end of the bridge" }[s] || (s ? `from the ${s}` : "at a vocal break"));
  const enterText = (s) => ({ "chorus start": "at the start of the chorus", "chorus": "within the chorus", "verse start": "as a verse begins",
    "verse": "within a verse" }[s] || (s ? `at the ${s}` : "on a vocal line"));
  const techName = (s) => ({ overlap: "Overlapping blend", bass_drop: "Bass drop", blend: "Harmonic blend" }[s] || "Blend");
  const keyNice = (k) => (k || "").replace("#", "♯").replace(" maj", " major").replace(" min", " minor");
  const stepFromStatus = (st) => {
    st = (st || "").toLowerCase();
    if (/download|queued|sending/.test(st)) return 0;
    if (/waiting for gpu|length/.test(st)) return 1;
    if (/separat/.test(st)) return 2;
    if (/allin1|section|analys/.test(st)) return 3;
    if (/tempo|key/.test(st)) return 4;
    if (/mix point|loading the blend|finding/.test(st)) return 5;
    return 0;
  };

  // what is audible right now, as 24 log-spaced bands (0..1). Falls back to a beat-driven guess before the decks are armed.
  const AU = { bins: new Float32Array(24), level: 0, bass: 0, mid: 0, high: 0, low: 0, buf: null, real: false };
  function hear(pulse, paused, now) {
    const b = AU.bins, an = A.an;
    AU.real = !!(an && A.ctx && A.ctx.state === "running");
    if (AU.real) {
      if (!AU.buf) AU.buf = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(AU.buf);
      for (let i = 0; i < 24; i++) {
        const lo = Math.floor(Math.pow(340, i / 24)), hi = Math.max(lo + 1, Math.floor(Math.pow(340, (i + 1) / 24)));
        let s = 0; for (let k = lo; k < hi; k++) s += AU.buf[k];
        const x = Math.pow(s / (hi - lo) / 255, 1.5) * (1 + i * 0.03);
        b[i] = Math.min(1, x);
      }
      let lo = 0; for (let k = 1; k < 8; k++) lo += AU.buf[k]; AU.low = lo / 7 / 255;   // below ~350 Hz: where the kick lives
    } else {
      for (let i = 0; i < 24; i++) {
        const x = paused ? 0 : pulse * (0.75 - i / 40) + 0.16 * Math.abs(Math.sin(now / 420 + i * 1.7)) * (1 - i / 36);
        b[i] += (x - b[i]) * 0.3;
      }
    }
    const avg = (a, z) => { let s = 0; for (let i = a; i < z; i++) s += b[i]; return s / (z - a); };
    AU.bass = avg(0, 6); AU.mid = avg(8, 16); AU.high = avg(16, 24); AU.level = avg(0, 24);
    return AU;
  }

  function buildVM(now) {
    const v = getVideo();
    const vw = view();
    const { main, side, P, t } = vw;
    const phase = vw.phase;
    const helper = !!S.online, paused = !!(v && v.paused);
    if (P) {
      if (!V.meta[S.curId]) V.meta[S.curId] = { ...P.a, bpm: P.a.bpm / (P.a_rate || 1), dur: P.a.dur * (P.a_rate || 1) };
      const nx = S.mix ? S.mix.target : S.q?.next;
      if (nx) V.meta[nx.id] = P.b;
    }
    if (vw.prev) V.lastPrev = vw.prev;
    const rate = v ? v.playbackRate || 1 : 1;
    const track = (info, isMain) => {
      if (!info) return null;
      const m = V.meta[info.id] || {}, art = S.art[info.id] || {};
      return { id: info.id, title: info.title || "", sub: info.sub || info.artist || "", artist: info.artist || "",
        bpm: m.bpm ? m.bpm * (isMain ? rate : 1) : null, key: keyNice(m.key), cam: m.camelot || "",
        c1: art.accent || "#8a7a5a", c2: art.deep || "#2a241c", thumb: `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg` };
    };
    const blending = phase === "blending";
    const p = blending && P ? Math.max(0, Math.min(1, (t - P.blend_start) / (P.blend_end - P.blend_start))) : 0;
    const sinceDrop = V.dropAt ? (now - V.dropAt) / 1000 : 99;
    const nowT = track(main, true), nextT = track(side, false);
    const nxTitle = side?.title || "the next song", curTitle = main?.title || "this song";
    const onPage = urlParam("v");

    let mixStart = null;
    if (P && !S.mix) mixStart = P.file_start_a_orig + P.blend_start * S.aRate;

    let kind, eyebrow = "", headline = "", body = "", step = -1, countdown = null, countLabel = "";
    if (!main) { kind = "idle"; eyebrow = "Waiting"; headline = "Play a YouTube Mix"; body = "Open a Mix or a playlist and the set begins."; }
    else if (!helper) { kind = "offline"; eyebrow = "Helper offline"; headline = "Mixing is on hold"; body = "The local analysis helper isn't responding. YouTube will cut between songs as usual until it's back. Start it with start-helper.bat."; }
    else if (phase === "skipping") { kind = "skipping"; eyebrow = "Skipping"; headline = V.skip || "A long video"; body = "It's longer than 10 minutes, too long to mix. Moving on to the next song in the Mix."; }
    else if (phase === "arrival") {
      const lp = V.prevPlan; kind = "arrival";
      eyebrow = "The drop"; headline = curTitle;
      body = `Entered ${lp ? enterText(lp.entry_section) : "on the beat"}. ${vw.prev?.title || V.lastPrev?.title || "The last song"} has left the set.`;
    } else if (!S.enabled && !blending) {
      kind = "off"; eyebrow = "Auto-mix off"; headline = "YouTube's normal cut";
      body = P && mixStart != null ? `${nxTitle} is ready. Turn auto-mix on and it blends in at ${fmt(mixStart)}.` : `${nxTitle} plays next, straight after this song.`;
    } else if ((phase === "armed" || blending) && P) {
      kind = blending ? "blending" : "armed";
      if (S.mix) countdown = blending ? P.drop - t : P.blend_start - t;
      else countdown = (mixStart - (v ? v.currentTime : 0)) / rate;
      countdown = Math.max(0, countdown);
      countLabel = blending ? "Drop in" : "Mix in";
      eyebrow = paused ? "Paused" : countLabel; headline = fmt(Math.ceil(countdown));
      body = `${curTitle} leaves ${leaveText(P.exit_section)}. ${nxTitle} enters ${enterText(P.entry_section)}.`;
    } else if (S.phase === "error") { kind = "error"; eyebrow = "Listening"; headline = "No mix for this one"; body = (S.status ? S.status + ". " : "") + "The next song will start after a normal cut."; }
    else if (!side) { kind = "error"; eyebrow = "Listening"; headline = "Last song of the queue"; body = "Nothing is lined up after this one."; }
    else { kind = "analysing"; eyebrow = paused ? "Paused" : "Listening"; headline = "Planning the next mix"; step = stepFromStatus(S.status); body = STEPS[step]; }

    // the plan, in the current video's own time
    let plan = null;
    const tP = P && !S.mix ? P : S.mix && onPage === S.curId ? S.mix.plan : null;
    const showP = S.mix ? S.mix.plan : P;
    if (showP && (kind === "armed" || kind === "blending" || kind === "off")) {
      const ar = showP.a_rate || 1;
      plan = { tech: techName(showP.style), style: showP.style, leave: leaveText(showP.exit_section), enter: enterText(showP.entry_section),
        exitAt: showP.exit_a_orig, entryAt: showP.entry_b_orig, camA: showP.a.camelot, camB: showP.b.camelot,
        blendLen: Math.round((showP.blend_end - showP.blend_start) * ar), mixStart: null, mixEnd: null, drop: null };
      if (tP && S.enabled) {
        plan.mixStart = tP.file_start_a_orig + tP.blend_start * ar; plan.mixEnd = tP.file_start_a_orig + tP.blend_end * ar; plan.drop = tP.file_start_a_orig + tP.drop * ar;
      }
    }

    const dur = v && isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
    const time = v ? v.currentTime : 0;
    const rawBpm = main ? (V.meta[main.id] || {}).bpm : null;
    let beat = 0, beatPhase = 0;
    if (v && rawBpm) { beatPhase = ((time * rawBpm / 60) % 1 + 1) % 1; beat = paused ? 0 : Math.exp(-beatPhase * 5); }
    else if (!paused && v) { beatPhase = (now / 520) % 1; beat = Math.exp(-beatPhase * 5) * 0.6; }

    let status;
    if (kind === "idle") status = "Play a YouTube Mix to start the set";
    else if (!helper) status = "Helper offline. YouTube cuts between songs until it reconnects";
    else if (paused) status = "Paused. The mix waits for the music";
    else if (kind === "skipping") status = `Skipping ${V.skip || "a long video"}, too long to mix`;
    else if (kind === "arrival") status = `Mixed into ${curTitle}`;
    else if (blending) status = `Blending into ${nxTitle}, ${Math.round(p * 100)}%`;
    else if (kind === "armed") status = `${plan.tech} planned for ${fmt(mixStart ?? P.file_start_a_orig)}`;
    else if (kind === "off") status = "Auto-mix off. The next song follows a normal cut";
    else if (kind === "analysing") status = `Analysing ${nxTitle}: ${STEPS[step]}`;
    else status = body;

    let pill = "Planning next mix";
    if (kind === "idle") pill = "Waiting for a Mix";
    else if (!helper) pill = "Helper offline";
    else if (paused) pill = "Paused";
    else if (kind === "armed" || kind === "blending") pill = `${countLabel} ${fmt(Math.ceil(countdown))}`;
    else if (!S.enabled) pill = "Auto-mix off";
    else if (kind === "arrival") pill = "Mixed in";

    const videoOk = !!(v && main && onPage === main.id && v.readyState >= 2 && v.videoWidth > 0 && !adShowing());
    return {
      now: nowT, next: nextT && nextT.id !== nowT?.id ? nextT : null, prev: track(vw.prev || (sinceDrop < 7 ? V.lastPrev : null), false),
      kind, eyebrow, headline, body, status, pill, step, steps: STEPS,
      paused, enabled: S.enabled, helper, engine: /allin1/.test(S.engine || "") ? "all-in-one" : "",
      p, sinceDrop, countdown, countLabel, plan,
      time, dur, segs: (main && onPage === main.id && S.segs[main.id]) || null,
      beat, beatPhase, audio: hear(beat, paused, now),
      video: v, videoOk, visible: location.pathname === "/watch",
      rate: S.lastMix ? { id: S.lastMix.mix_id, rating: S.lastMix.rating, tags: S.lastMix.tags, a: S.lastMix.a.title, b: S.lastMix.b.title,
        live: !!(S.mix && S.mix.rec === S.lastMix), age: S.mix && S.mix.rec === S.lastMix ? 0 : (Date.now() - S.lastMix.dropWall) / 1000 } : null,
    };
  }

  function setEnabled(on) {
    S.enabled = on; localStorage.setItem("ytdj-enabled", on ? "1" : "0");
    if (on) arm();
    if (!on && S.mix) finishHandover(false, "auto_mix_turned_off");
  }
  function toggleUI(force) { window.YTDJ.toggle(force); }

  window.YTDJ.start({
    vm: buildVM,
    fontUrl: (file) => chrome.runtime.getURL("fonts/" + file),
    store: { get: (k) => localStorage.getItem("ytdj-" + k), set: (k, val) => localStorage.setItem("ytdj-" + k, val) },
    act: {
      open: () => { if (!S.enabled) setEnabled(true); arm(); },
      toggleAuto: () => setEnabled(!S.enabled),
      reconnect: () => health(),
      rate: rateAct.rate,
      tag: rateAct.tag,
      playPause: () => { const v = getVideo(); if (v) { if (v.paused) v.play().catch(() => {}); else v.pause(); } },
    },
  });
})();
