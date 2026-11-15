// yt-dj DJ view shell: overlay, world switching, launcher pill, shared video frame, frame loop.
// Each world (ui/t-*.js) registers itself with YTDJ.theme() and draws the same view model in its own way.
(() => {
  if (window.YTDJ) return;
  const Y = (window.YTDJ = { themes: {}, order: [], mouse: { x: 0, y: 0, px: 0, py: 0, tx: 0, ty: 0 }, frameTick: 0, motion: 1 });

  Y.theme = (name, def) => { Y.themes[name] = def; Y.order.push(name); };
  Y.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  Y.lerp = (a, b, t) => a + (b - a) * t;
  Y.ease = (t) => t * t * (3 - 2 * t);
  Y.fmt = (s) => (isFinite(s) && s >= 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "–:––");
  Y.txt = (el, v) => { v = v == null ? "" : String(v); if (el && el.textContent !== v) el.textContent = v; return el; };
  Y.attr = (el, k, v) => { if (el.getAttribute(k) !== v) el.setAttribute(k, v); };
  Y.sty = (el, k, v) => { if (el.style.getPropertyValue(k) !== v) el.style.setProperty(k, v); };
  Y.src = (img, url) => { if (url && img.dataset.u !== url) { img.dataset.u = url; img.src = url; } };
  Y.svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(s.replace(/\s+/g, " "))}")`;
  Y.roman = (n) => {
    n = Math.max(0, Math.floor(n));
    if (!n) return "N";
    const M = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let s = ""; for (const [v, r] of M) while (n >= v) { s += r; n -= v; }
    return s;
  };
  Y.rgb = (hex) => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(hex || ""); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [138, 122, 90]; };
  // set text and replay the element's "re" animation when it actually changes (titles being re-carved, re-printed…)
  Y.swap = (el, v) => { v = v == null ? "" : String(v); if (el.textContent === v) return false; el.textContent = v; el.classList.remove("re"); void el.offsetWidth; el.classList.add("re"); return true; };
  // shrink a single-line element's font until it fits its box
  Y.fit = (el, max, min, unit = "px") => {
    let f = max; el.style.fontSize = f + unit;
    for (let i = 0; i < 14 && f > min && el.scrollWidth > el.clientWidth + 1; i++) { f = Math.max(min, f * 0.92); el.style.fontSize = f + unit; }
  };
  // the one thing the listener can do about the current state, if anything
  Y.cta = (vm) => (vm.kind === "offline" ? { label: "Check the helper again", run: () => Y.source.act.reconnect() }
    : vm.kind === "off" ? { label: "Turn auto-mix on", run: () => Y.source.act.toggleAuto() } : null);
  Y.bindCta = (btn) => { btn.onclick = () => { const c = Y.vm && Y.cta(Y.vm); if (c) c.run(); }; };
  Y.showCta = (btn, vm) => { const c = Y.cta(vm); btn.style.display = c ? "" : "none"; if (c) Y.txt(btn, c.label); };
  Y.once = (st, key, val, fn) => { const k = st.k || (st.k = {}); if (k[key] === val) return false; k[key] = val; fn(); return true; };
  Y.stepDots = (wrap, vm) => { wrap.style.display = vm.step >= 0 ? "" : "none"; [...wrap.children].forEach((e, i) => { const s = i < vm.step ? "done" : i === vm.step ? "now" : "todo"; if (e.dataset.s !== s) e.dataset.s = s; }); };
  Y.prog = (vm) => (vm.dur ? Y.clamp(vm.time / vm.dur) : 0);
  Y.mix = (vm) => { const p = vm.plan; return p && p.mixStart != null && vm.dur ? { a: Y.clamp(p.mixStart / vm.dur) * 100, b: Y.clamp(p.mixEnd / vm.dur) * 100 } : null; };
  Y.count = (vm) => (vm.countdown != null ? Y.fmt(Math.ceil(vm.countdown)) : null);
  Y.meta = (t, sep = " · ") => (t && t.bpm ? `${Math.round(t.bpm)} bpm${sep}${t.key}` : "");
  Y.esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  Y.u = () => Math.min(innerWidth / 100, innerHeight * 0.0172);
  Y.img = (url, cb) => { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => cb(im); im.src = url; return im; };
  Y.flash = (vm, secs = 3) => (vm.sinceDrop < secs ? 1 - vm.sinceDrop / secs : 0);
  // timeline pieces every world needs: section list and percentages
  Y.sections = (vm) => (vm.segs && vm.segs.length && vm.dur ? vm.segs.map((s) => ({ a: Y.clamp(s.start / vm.dur), b: Y.clamp(s.end / vm.dur), label: s.label, chorus: s.label === "chorus" })) : []);
  Y.pct = (vm, t) => (vm.dur && t != null ? Y.clamp(t / vm.dur) * 100 : null);

  // ---------------------------------------------------------------- motion layer
  // Worlds never see raw audio. Every frame the raw view model is passed through here and comes out with:
  //   audio.bins/bass/mid/high/level  envelope-followed (fast attack, slow release, frame-rate independent)
  //   beatCount / beatPhase           a tempo clock phase-locked to kick onsets detected in the real audio
  //   beat (0..1) and bounce (signed) a damped spring kicked on each beat: eases in, overshoots a touch, settles
  //   time                            the playhead, interpolated so progress marks glide instead of stepping
  const M = { flow: 0, pulse: 0, bins: new Float32Array(24), bass: 0, mid: 0, high: 0, level: 0, x: 0, v: 0, phase: 0, lowPrev: 0, fluxAvg: 0.01, lastOn: -9, est: 1.75, rawPh: 0, t: null, id: null, conf: 0 };
  const follow = (cur, target, dt, up, down) => cur + (target - cur) * (1 - Math.exp(-dt / (target > cur ? up : down)));
  Y.sense = (vm, dt, now) => {
    const au = vm.audio, live = !vm.paused, sec = now / 1000;
    for (let i = 0; i < 24; i++) M.bins[i] = follow(M.bins[i], live ? au.bins[i] : 0, dt, 0.035, 0.26);
    const avg = (a, z) => { let s = 0; for (let i = a; i < z; i++) s += M.bins[i]; return s / (z - a); };
    M.bass = follow(M.bass, avg(0, 6), dt, 0.05, 0.3); M.mid = follow(M.mid, avg(8, 16), dt, 0.05, 0.3);
    M.high = follow(M.high, avg(16, 24), dt, 0.05, 0.3); M.level = follow(M.level, avg(0, 24), dt, 0.08, 0.4);

    // onsets: a jump in low-end energy well above its recent average (real audio), or the mock's phase wrap
    let onset = false;
    if (au.real) {
      const low = au.low || 0, flux = Math.max(0, low - M.lowPrev); M.lowPrev = low;
      M.fluxAvg = follow(M.fluxAvg, flux, dt, 0.5, 0.5);
      if (live && flux > M.fluxAvg * 2.4 + 0.018 && sec - M.lastOn > 0.24) onset = true;
    } else if (live && vm.beatPhase < M.rawPh - 0.5) onset = true;
    M.rawPh = vm.beatPhase;

    // tempo clock: runs at the analysed tempo (or the measured gap between kicks) and is pulled onto each onset
    const bpm = vm.now && vm.now.bpm;
    if (onset) { const gap = sec - M.lastOn; if (gap > 0.3 && gap < 1.2) M.est += (1 / gap - M.est) * 0.25; M.lastOn = sec; }
    const freq = bpm ? bpm / 60 : M.est;
    const before = M.phase;
    if (live) M.phase += dt * freq;
    if (onset) { const err = M.phase - Math.round(M.phase); M.phase -= err * (au.real && bpm ? 0.3 : 1); M.conf = Math.min(1, M.conf + 0.2); }
    else M.conf = Math.max(0, M.conf - dt * 0.08);
    // the pulse is launched a hair early so that it peaks on the beat rather than after it
    // (with no analysed tempo there is no grid to trust, so the kick itself fires the pulse)
    const lead = 0.05 * freq, fired = au.real && !bpm ? onset : Math.floor(M.phase + lead) > Math.floor(before + lead);
    if (live && fired) M.v += 46 * (0.6 + 0.4 * Math.min(1, M.bass * 2.2 + 0.25));
    // the spring is much faster than any beat (period ~0.26 s) so it cannot resonate with the tempo and drift late
    for (let left = dt; left > 0; left -= 1 / 240) { const h = Math.min(left, 1 / 240); M.v += (-576 * M.x - 26.4 * M.v) * h; M.x += M.v * h; }
    M.pulse = follow(M.pulse, Math.max(0, M.x), dt, 0.012, 0.2);          // quick to rise, unhurried to fall

    // flow: the same clock with the corrections smoothed out, for things that must never jump (floors, ripples)
    if (live) M.flow += dt * freq;
    M.flow += (M.phase - M.flow) * Math.min(1, dt * 2.2);

    // playhead interpolation
    const id = vm.now && vm.now.id;
    if (M.t == null || id !== M.id || Math.abs(vm.time - M.t) > 0.6) { M.t = vm.time; M.id = id; }
    else { if (live) M.t += dt; M.t += (vm.time - M.t) * Math.min(1, dt * 2.5); }

    vm.audio = { bins: M.bins, bass: M.bass, mid: M.mid, high: M.high, level: M.level, real: !!au.real };
    vm.bounce = M.x; vm.beat = Math.min(1.1, M.pulse);
    vm.flow = M.flow; vm.beatCount = M.phase; vm.beatPhase = M.phase - Math.floor(M.phase); vm.locked = M.conf > 0.5;
    vm.time = Math.max(0, M.t);
  };

  // shared, low-res copy of the video frame; worlds restyle it (relief, LCD, halftone…)
  Y.frame = document.createElement("canvas");
  Y.frame.width = 320; Y.frame.height = 180;
  const fctx = Y.frame.getContext("2d", { willReadFrequently: true });
  const scratch = document.createElement("canvas");
  const sctx = scratch.getContext("2d", { willReadFrequently: true });
  let pixelsOk = true;
  // RGBA pixels of the current frame at w×h, or null when the browser will not let us read them
  Y.pixels = (w, h) => {
    if (!pixelsOk) return null;
    try {
      if (scratch.width !== w || scratch.height !== h) { scratch.width = w; scratch.height = h; }
      sctx.drawImage(Y.frame, 0, 0, w, h);
      return sctx.getImageData(0, 0, w, h).data;
    } catch (_) { pixelsOk = false; return null; }
  };
  // luminance (0..255) of the current frame at w×h; cached per frame and size. null if pixels are unreadable
  const lumC = {};
  Y.lum = (w, h) => {
    const key = w + "x" + h, c = lumC[key] || (lumC[key] = { tick: -1, a: new Uint8Array(w * h) });
    if (c.tick === Y.frameTick) return c.a;
    const d = Y.pixels(w, h); if (!d) return null;
    for (let i = 0, j = 0; i < w * h; i++, j += 4) c.a[i] = d[j] * 0.3 + d[j + 1] * 0.59 + d[j + 2] * 0.11;
    c.tick = Y.frameTick; return c.a;
  };
  Y.cover = (ctx, src, sw, sh, dw, dh) => {
    const r = Math.max(dw / sw, dh / sh), w = dw / r, h = dh / r;
    ctx.drawImage(src, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, dw, dh);
  };

  // ---------------------------------------------------------------- blend feedback (thumbs + optional reasons)
  const THUMB = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>`;
  const rateBtns = `<button class="dk-b rt-b" data-r="up" aria-pressed="false" aria-label="Good blend">${THUMB}</button><button class="dk-b rt-b rt-dn" data-r="down" aria-pressed="false" aria-label="Bad blend">${THUMB}</button>`;
  Y.rateTags = {
    up: ["Smooth handover", "Perfect timing", "Keys fit", "Beats locked", "Energy lift", "Great pairing"],
    down: ["Keys clashed", "Beats off / drifting", "Vocals overlapped", "Cut mid-line", "Too abrupt", "Dragged on", "Volume jump",
      "Wrong spot in the song", "Tempo change felt off", "Glitch / echo / skip", "Songs don't belong together"],
  };

  Y.start = (source) => {
    Y.source = source;
    const F = [
      ["Cinzel", "cinzel-latin-400-normal", "400"], ["Cinzel", "cinzel-latin-600-normal", "600"],
      ["Cormorant Garamond", "cormorant-garamond-latin-500-normal", "500"], ["Cormorant Garamond", "cormorant-garamond-latin-500-italic", "500", "italic"],
      ["Cormorant Garamond", "cormorant-garamond-latin-400-italic", "400", "italic"],
      ["Michroma", "michroma-400", "400"], ["Silkscreen", "silkscreen-400", "400"], ["Chakra Petch", "chakra-petch-400", "400"], ["Chakra Petch", "chakra-petch-600", "600"],
      ["Instrument Serif", "instrument-serif-400", "400"], ["Instrument Serif", "instrument-serif-400-italic", "400", "italic"],
      ["Jost", "jost-var", "300 700"], ["Sora", "sora-var", "200 700"],
      ["Archivo Black", "archivo-black-400", "400"], ["Bangers", "bangers-400", "400"], ["Caveat", "caveat-400-700", "400 700"],
      ["IM Fell English", "im-fell-english-400-italic", "400", "italic"], ["IM Fell English", "im-fell-english-400", "400"], ["Orbitron", "orbitron-400-900", "400 900"],
      ["Press Start 2P", "press-start-2p-400", "400"], ["Share Tech Mono", "share-tech-mono-400", "400"], ["Shippori Mincho", "shippori-mincho-400", "400"],
      ["Shippori Mincho", "shippori-mincho-600", "600"], ["Shrikhand", "shrikhand-400", "400"], ["Space Mono", "space-mono-400", "400"], ["Space Mono", "space-mono-700", "700"],
      ["Yellowtail", "yellowtail-400", "400"],
    ];
    // fonts live at document level: shadow roots ignore @font-face
    const st = document.createElement("style");
    st.textContent = F.map(([fam, file, w, s]) =>
      `@font-face{font-family:"${fam}";src:url("${source.fontUrl(file + ".woff2")}") format("woff2");font-weight:${w};font-style:${s || "normal"};font-display:swap}`).join("");
    (document.head || document.documentElement).appendChild(st);

    const host = document.createElement("div");
    host.id = "ytdj-host";
    const root = host.attachShadow({ mode: "open" });
    document.documentElement.appendChild(host);
    const style = document.createElement("style");
    style.textContent = CSS + Y.order.map((n) => Y.themes[n].css).join("\n");
    root.appendChild(style);
    const R = document.createElement("div");
    R.className = "root";
    R.innerHTML = `
      <div class="ov" role="dialog" aria-label="YouTube DJ">
        <div class="worlds"></div>
        <div class="dock">
          <div class="dk-themes"><button class="dk-b dk-prev" title="Previous world" aria-label="Previous world">‹</button>
            <button class="dk-b dk-pick" aria-haspopup="true" aria-expanded="false"><span class="dk-cur"></span><i class="dk-n"></i></button>
            <button class="dk-b dk-next" title="Next world" aria-label="Next world">›</button>
            <div class="dk-menu" role="menu">${Y.order.map((n) => `<button class="dk-t" role="menuitemradio" data-t="${n}"><i style="background:linear-gradient(135deg,${(Y.themes[n].swatch || ["#888", "#444"]).join(" 50%,")} 50%)"></i>${n}</button>`).join("")}</div></div>
          <div class="dk-ctl">
            <div class="rt dk-rate" data-off="1"><span class="rt-lab">Rate blend</span>${rateBtns}</div>
            <button class="dk-b dk-helper" title="Local analysis helper. Click to check again"><i class="dk-dot"></i><span></span></button>
            <button class="dk-b dk-auto" role="switch" title="Blend each song into the next">Auto-mix <i class="dk-sw"><i></i></i></button>
            <button class="dk-b dk-back" title="Mixing keeps running (Esc)">Back to YouTube</button>
          </div>
        </div>
      </div>
      <div class="rt prate" style="display:none"><span class="rt-lab"></span>${rateBtns}</div>
      <div class="rt-pop" role="dialog" aria-label="Why?"><p class="rt-q"></p><div class="rt-chips"></div>
        <div class="rt-foot"><span class="rt-hint">Optional. Saved as you tap.</span><button class="rt-done">Done</button></div></div>
      <button class="pill" title="Open YouTube DJ"><i class="pl-disc"><i></i></i><span class="pl-t"><b>YouTube DJ</b><span class="pl-v"></span></span></button>`;
    root.appendChild(R);
    const $ = (s) => R.querySelector(s);
    const ov = $(".ov"), worlds = $(".worlds");

    let open = false, cur = null, name = source.store.get("theme");
    if (!Y.themes[name]) name = Y.order[0];

    function show(n, instant) {
      if (cur && cur.name === n) return;
      const old = cur;
      if (old) {
        old.el.classList.add("out");
        setTimeout(() => { try { old.def.unmount && old.def.unmount(old.st); } catch (_) {} old.el.remove(); }, instant ? 0 : 420);
      }
      const def = Y.themes[n];
      const el = document.createElement("div");
      el.className = "world " + def.cls + (instant ? "" : " in");
      el.innerHTML = def.html;
      worlds.appendChild(el);
      cur = { name: n, def, el, st: null };
      cur.st = def.mount(el, Y) || {};
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("in")));
      // entrance choreography: backdrop first, then each piece rises into place a beat apart (whole cascade < 0.5 s).
      // Uses the standalone `translate` property so it composes with the transforms the worlds drive every frame.
      requestAnimationFrame(() => {
        const big = (c) => c.offsetWidth >= innerWidth * 0.86 && c.offsetHeight >= innerHeight * 0.5;
        const items = [];
        for (const c of el.children) { if (big(c) && c.children.length > 2 && !/^(CANVAS|svg|BUTTON)$/i.test(c.tagName)) items.push(c, ...c.children); else items.push(c); }
        let i = 0;
        for (const c of items) {
          if (!c.animate || !c.offsetWidth) continue;
          const still = big(c);
          try { c.animate([still ? { opacity: 0, offset: 0 } : { opacity: 0, translate: `0 ${Math.round(16 * Y.motion)}px`, offset: 0 }], { duration: still ? 480 : 620, delay: still ? 0 : Math.min(440, 60 + i * 48), easing: "cubic-bezier(.05,.7,.1,1)", fill: "backwards" }); } catch (_) {}
          if (!still) i++;
        }
      });
      ov.dataset.theme = n; R.dataset.theme = n;
      R.querySelectorAll(".dk-t").forEach((b) => b.setAttribute("aria-checked", b.dataset.t === n ? "true" : "false"));
      Y.txt($(".dk-cur"), n); Y.txt($(".dk-n"), `${Y.order.indexOf(n) + 1} of ${Y.order.length}`);
      name = n; source.store.set("theme", n);
    }

    Y.toggle = (force) => {
      open = force === undefined ? !open : force;
      if (open && !cur) show(name, true);
      R.classList.toggle("open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    Y.isOpen = () => open;

    const menu = (on) => { $(".dk-themes").classList.toggle("open", on); $(".dk-pick").setAttribute("aria-expanded", on ? "true" : "false"); };
    R.querySelectorAll(".dk-t").forEach((b) => (b.onclick = () => { show(b.dataset.t); menu(false); }));
    $(".dk-pick").onclick = (e) => { e.stopPropagation(); menu(!$(".dk-themes").classList.contains("open")); };
    const stepW = (d) => show(Y.order[(Y.order.indexOf(name) + d + Y.order.length) % Y.order.length]);
    $(".dk-prev").onclick = () => stepW(-1); $(".dk-next").onclick = () => stepW(1);
    ov.addEventListener("click", (e) => { if (!e.composedPath().includes($(".dk-menu"))) menu(false); });
    $(".pill").onclick = () => { source.act.open(); Y.toggle(true); };
    $(".dk-back").onclick = () => Y.toggle(false);
    $(".dk-auto").onclick = () => source.act.toggleAuto();
    $(".dk-helper").onclick = () => source.act.reconnect();
    document.addEventListener("keydown", (e) => { if (open && e.key === "Escape") { e.stopPropagation(); Y.toggle(false); } }, true);
    ov.addEventListener("pointermove", (e) => {
      const m = Y.mouse; m.px = e.clientX; m.py = e.clientY;
      m.tx = (e.clientX / innerWidth) * 2 - 1; m.ty = (e.clientY / innerHeight) * 2 - 1;
    });
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const setRm = () => { Y.motion = rm.matches ? 0.12 : 1; R.classList.toggle("calm", rm.matches); };
    setRm(); rm.addEventListener && rm.addEventListener("change", setRm);

    // feedback widgets
    const pop = $(".rt-pop"), chips = $(".rt-chips");
    const RP = { open: false, id: null, kind: null, at: 0, anchor: null };
    const closePop = () => { RP.open = false; pop.classList.remove("on"); };
    function placePop() {
      if (!RP.anchor) return;
      const r = RP.anchor.getBoundingClientRect(), w = Math.min(360, innerWidth - 24);
      pop.style.width = w + "px";
      pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w)) + "px";
      const below = r.top < innerHeight / 2;
      pop.style.top = below ? r.bottom + 10 + "px" : ""; pop.style.bottom = below ? "" : innerHeight - r.top + 10 + "px";
    }
    function renderRate(vm) {
      const r = vm.rate;
      for (const g of R.querySelectorAll(".rt")) {
        g.querySelectorAll(".rt-b").forEach((b) => Y.attr(b, "aria-pressed", r && r.rating === b.dataset.r ? "true" : "false"));
        g.querySelectorAll(".rt-b").forEach((b) => { b.disabled = !r; });
        g.title = r ? `Rate the blend: ${r.a} → ${r.b}` : "Rate the next blend once it starts mixing";
      }
      $(".dk-rate").dataset.off = r ? "0" : "1";
      Y.txt($(".dk-rate .rt-lab"), r ? (r.live ? "Rate this blend" : "Rate last blend") : "Rate blend");
      const showP = !!(r && !open && vm.visible && (r.live || r.age < 150 || RP.open));
      $(".prate").style.display = showP ? "flex" : "none";
      if (r) Y.txt($(".prate .rt-lab"), r.live ? "Rate this blend" : "Rate that blend");
      if (RP.open && (!r || r.id !== RP.id || !r.rating || (RP.anchor.classList.contains("dk-rate") && !open) || performance.now() - RP.at > 20000 || !RP.anchor.getClientRects().length)) closePop();
      if (!RP.open || !r) return;
      if (RP.kind !== r.rating) {
        RP.kind = r.rating;
        Y.txt($(".rt-q"), r.rating === "up" ? "Nice. What made it work?" : "What felt off?");
        chips.innerHTML = Y.rateTags[r.rating].map((t) => `<button class="rt-c" aria-pressed="false">${Y.esc(t)}</button>`).join("");
      }
      chips.querySelectorAll(".rt-c").forEach((c) => Y.attr(c, "aria-pressed", r.tags.includes(c.textContent) ? "true" : "false"));
    }
    const refresh = () => { try { renderRate(source.vm(performance.now())); } catch (_) {} };
    R.querySelectorAll(".rt").forEach((g) => g.querySelectorAll(".rt-b").forEach((b) => (b.onclick = (e) => {
      e.stopPropagation();
      const vm = source.vm(performance.now()), r = vm.rate; if (!r) return;
      const next = r.rating === b.dataset.r ? null : b.dataset.r;
      source.act.rate(b.dataset.r);
      if (next) { Object.assign(RP, { open: true, id: r.id, kind: null, at: performance.now(), anchor: g }); placePop(); pop.classList.add("on"); }
      else closePop();
      refresh();
    })));
    chips.onclick = (e) => { const c = e.target.closest(".rt-c"); if (!c) return; e.stopPropagation(); RP.at = performance.now(); source.act.tag(c.textContent); refresh(); };
    $(".rt-done").onclick = (e) => { e.stopPropagation(); closePop(); };
    pop.addEventListener("pointerdown", (e) => e.stopPropagation());
    window.addEventListener("pointerdown", (e) => { if (RP.open && !e.composedPath().includes(pop)) closePop(); }, true);
    addEventListener("resize", placePop);

    let lastT = performance.now(), lastPill = 0, lastFrame = 0, ang = 0;
    function loop(now) {
      const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
      try {
        if (open || now - lastPill > 250) {
          const vm = source.vm(now);
          Y.sense(vm, dt, now);
          Y.vm = vm;
          if (now - lastPill > 250) {
            lastPill = now;
            Y.txt($(".pl-v"), vm.pill);
            $(".pill").style.display = vm.visible ? "flex" : "none";
            $(".pl-disc").style.background = `radial-gradient(circle, ${vm.now ? vm.now.c1 : "#888"} 0 28%, #e9e4da 29% 33%, #131313 34%)`;
            Y.txt($(".dk-helper span"), vm.helper ? (vm.engine ? "Helper on · " + vm.engine : "Helper on") : "Helper offline");
            $(".dk-helper").dataset.on = vm.helper ? "1" : "0";
            $(".dk-auto").setAttribute("aria-checked", vm.enabled ? "true" : "false");
            renderRate(vm);
          }
          ang = (ang + (vm.paused ? 0 : 150) * dt) % 360;
          $(".pl-disc").style.transform = `rotate(${ang.toFixed(1)}deg)`;
          if (open && cur) {
            const m = Y.mouse; m.x += (m.tx - m.x) * Math.min(1, dt * 5); m.y += (m.ty - m.y) * Math.min(1, dt * 5);
            if (vm.videoOk && now - lastFrame > 33) {
              lastFrame = now;
              const v = vm.video;
              try { Y.cover(fctx, v, v.videoWidth || v.width, v.videoHeight || v.height, 320, 180); Y.frameTick++; } catch (_) {}
            }
            cur.def.update(cur.st, vm, dt, now, Y);
          }
        }
      } catch (e) { console.warn("[yt-dj ui]", e); }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  const CSS = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; }
  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  i { font-style: normal; display: block; }
  .ov { position: fixed; inset: 0; z-index: 2147483645; overflow: hidden; background: #0c0c0e; opacity: 0; visibility: hidden; pointer-events: none; transform: scale(1.02);
    transition: opacity .34s cubic-bezier(.3,0,1,1), transform .34s cubic-bezier(.3,0,1,1), visibility 0s linear .34s; contain: strict; }
  .root.open .ov { opacity: 1; visibility: visible; pointer-events: auto; transform: none; transition: opacity .55s cubic-bezier(.05,.7,.1,1), transform .65s cubic-bezier(.05,.7,.1,1), visibility 0s; }
  .worlds, .world { position: absolute; inset: 0; }
  .world { overflow: hidden; transition: opacity .65s cubic-bezier(.05,.7,.1,1), transform .75s cubic-bezier(.05,.7,.1,1); --u: min(1vw, 1.72vh); will-change: opacity, transform; }
  .world.in { opacity: 0; transform: scale(1.035); }
  .world.out { opacity: 0; transform: scale(.985); transition: opacity .38s cubic-bezier(.3,0,1,1), transform .38s cubic-bezier(.3,0,1,1); pointer-events: none; z-index: 2; }
  canvas, img { display: block; }

  /* dock: the only chrome shared by every world; each world sets its --dk-* inks and font */
  .dock { position: absolute; left: 0; right: 0; top: 0; height: 60px; padding: 0 26px; display: flex; align-items: center; justify-content: space-between; gap: 20px; z-index: 5;
    font: var(--dk-weight, 500) var(--dk-size, 12.5px)/1 var(--dk-font, system-ui, sans-serif); letter-spacing: var(--dk-track, .02em); color: var(--dk-ink, #fff); opacity: .62; transition: opacity .35s ease, color .8s ease; }
  .dock:hover, .dock:focus-within { opacity: 1; }
  .dk-themes, .dk-ctl { display: flex; align-items: center; gap: 6px; position: relative; }
  .dk-ctl { gap: 8px; }
  .dk-prev, .dk-next { width: 34px; padding: 0 !important; justify-content: center; font-size: 17px; }
  .dk-pick { background: var(--dk-chip, rgba(255,255,255,.14)); min-width: 190px; justify-content: space-between; }
  .dk-n { opacity: .6; font-variant-numeric: tabular-nums; }
  .dk-menu { position: absolute; left: 0; top: 44px; width: 430px; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; border-radius: 16px; background: rgba(20,19,24,.94);
    border: 1px solid rgba(255,255,255,.16); box-shadow: 0 24px 60px rgba(0,0,0,.55); backdrop-filter: blur(18px); color: #f4f0ea; font: 500 13.5px/1 "Jost", system-ui, sans-serif; letter-spacing: .01em;
    opacity: 0; transform: translateY(-6px) scale(.98); transform-origin: 0 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; }
  .dk-themes.open .dk-menu { opacity: 1; transform: none; pointer-events: auto; }
  .dk-t { height: 38px; padding: 0 10px; display: flex; align-items: center; gap: 10px; border-radius: 9px; text-align: left; white-space: nowrap; }
  .dk-t i { width: 18px; height: 18px; border-radius: 50%; flex: none; box-shadow: 0 0 0 1px rgba(255,255,255,.3); }
  .dk-t:hover { background: rgba(255,255,255,.1); }
  .dk-t[aria-checked="true"] { background: rgba(255,255,255,.17); }
  .dk-b { height: 34px; padding: 0 13px; display: flex; align-items: center; gap: 9px; border-radius: 999px; border: 1px solid var(--dk-line, rgba(255,255,255,.28)); white-space: nowrap;
    }
  .dk-b:hover { background: var(--dk-chip, rgba(255,255,255,.14)); }
  .dk-b, .dk-t { transition: background .12s ease-out, transform .14s cubic-bezier(.2,0,0,1); }
  .dk-b:active, .dk-t:active { transform: scale(.955); transition-duration: .06s; }
  .dk-dot { width: 7px; height: 7px; border-radius: 50%; background: #d24a3c; }
  .dk-helper[data-on="1"] .dk-dot { background: #3fa862; }
  .dk-sw { position: relative; width: 30px; height: 16px; border-radius: 999px; background: var(--dk-line, rgba(255,255,255,.28)); transition: background .3s ease; }
  .dk-sw i { position: absolute; left: 2px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--dk-ink, #fff); transition: transform .3s cubic-bezier(.3,1.4,.5,1); }
  .dk-auto[aria-checked="true"] .dk-sw { background: var(--dk-accent, #fff); }
  .dk-auto[aria-checked="true"] .dk-sw i { transform: translateX(14px); background: var(--dk-on, #111); }
  button:focus-visible { outline: 2px solid var(--dk-accent, #fff); outline-offset: 2px; }

  /* launcher on the YouTube page */
  .pill { position: fixed; right: 24px; bottom: 24px; z-index: 2147483646; display: flex; align-items: center; gap: 11px; padding: 7px 18px 7px 7px; border-radius: 999px;
    background: rgba(22,21,24,.86); border: 1px solid rgba(255,255,255,.16); backdrop-filter: blur(14px) saturate(1.4); box-shadow: 0 12px 34px rgba(0,0,0,.45);
    color: #f3efe8; font: 500 13px/1.2 "Jost", system-ui, sans-serif; transition: opacity .5s ease .25s, transform .5s ease .25s; }
  .pill:hover { background: rgba(34,33,37,.92); }
  .root.open .pill { opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity .25s ease, transform .25s ease; }
  .pl-disc { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; }
  .pl-disc i { width: 5px; height: 5px; border-radius: 50%; background: #e9e4da; }
  .pl-t { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
  .pl-t b { font-weight: 500; font-size: 11px; opacity: .6; letter-spacing: .04em; }
  .pl-v { font-variant-numeric: tabular-nums; white-space: nowrap; }
  /* blend feedback */
  .rt { display: flex; align-items: center; gap: 4px; }
  .rt-lab { opacity: .7; margin-right: 4px; white-space: nowrap; }
  .rt-b { width: 34px; padding: 0 !important; justify-content: center; }
  .rt-b svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform .2s cubic-bezier(.3,1.6,.5,1); }
  .rt-dn svg { transform: rotate(180deg); }
  .dk-rate[data-off="1"] .rt-b { opacity: .38; cursor: default; }
  .dk-rate[data-off="1"] .rt-b:hover { background: none; }
  .rt-b[aria-pressed="true"] { background: var(--dk-accent, #fff); color: var(--dk-on, #111); border-color: transparent; }
  .rt-b[aria-pressed="true"] svg { fill: currentColor; fill-opacity: .25; transform: scale(1.12); }
  .rt-dn[aria-pressed="true"] svg { transform: rotate(180deg) scale(1.12); }
  .prate { position: fixed; right: 24px; bottom: 84px; z-index: 2147483646; padding: 5px 5px 5px 14px; border-radius: 999px; background: rgba(22,21,24,.86);
    border: 1px solid rgba(255,255,255,.16); backdrop-filter: blur(14px) saturate(1.4); box-shadow: 0 12px 34px rgba(0,0,0,.45); color: #f3efe8; font: 500 12.5px/1 "Jost", system-ui, sans-serif;
    animation: rt-in .45s cubic-bezier(.05,.7,.1,1); }
  .prate .rt-b { height: 30px; width: 30px; border-color: rgba(255,255,255,.22); }
  .prate .rt-b:hover { background: rgba(255,255,255,.12); }
  .prate .rt-b[aria-pressed="true"] { background: #f3efe8; color: #161518; }
  @keyframes rt-in { from { opacity: 0; transform: translateY(8px); } }
  .rt-pop { position: fixed; z-index: 2147483647; padding: 16px 16px 12px; border-radius: 16px; background: rgba(20,19,24,.95); border: 1px solid rgba(255,255,255,.16);
    box-shadow: 0 24px 60px rgba(0,0,0,.55); backdrop-filter: blur(18px); color: #f4f0ea; font: 400 13px/1.3 "Jost", system-ui, sans-serif;
    opacity: 0; transform: translateY(-4px) scale(.98); pointer-events: none; transition: opacity .18s ease, transform .18s ease; }
  .rt-pop.on { opacity: 1; transform: none; pointer-events: auto; }
  .rt-q { margin: 0 0 12px; font-weight: 500; font-size: 14.5px; }
  .rt-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .rt-c { padding: 7px 11px; border-radius: 999px; border: 1px solid rgba(255,255,255,.22); font-size: 12.5px; transition: background .12s ease, transform .14s cubic-bezier(.2,0,0,1); }
  .rt-c:hover { background: rgba(255,255,255,.1); }
  .rt-c:active { transform: scale(.95); }
  .rt-c[aria-pressed="true"] { background: #f4f0ea; color: #141318; border-color: transparent; }
  .rt-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; gap: 10px; }
  .rt-hint { font-size: 11.5px; opacity: .55; }
  .rt-done { padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.12); font-weight: 500; }
  .rt-done:hover { background: rgba(255,255,255,.2); }
  @media (max-width: 900px) { .dk-rate .rt-lab { display: none; } }
  @media (max-width: 900px) { .dk-helper span { display: none; } .dk-pick { min-width: 0; } .dk-n { display: none; } .dk-menu { width: min(430px, 92vw); } }
  `;
})();
