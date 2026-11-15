// Conceptual Sketch: the set as a designer's notebook page. The video is redrawn live as pencil outlines, the blend
// is explained with a crossfade diagram (fig. 2), the next song is a taped-in thumbnail sketch, and every line
// "boils" the way hand-drawn animation does.
(() => {
  const Y = window.YTDJ;
  const INK = "#2e2e38", RED = "#c8452f", BLUE = "#2f5fa8";
  // Sobel edges of a luminance grid, drawn as soft graphite
  function pencil(cx, L, W, H, st) {
    const out = st.o && st.o.width === W ? st.o : (st.o = cx.createImageData(W, H)), o = out.data;
    for (let y = 1; y < H - 1; y++) for (let x = 1, i = y * W + 1; x < W - 1; x++, i++) {
      const gx = L[i - W + 1] + 2 * L[i + 1] + L[i + W + 1] - L[i - W - 1] - 2 * L[i - 1] - L[i + W - 1];
      const gy = L[i + W - 1] + 2 * L[i + W] + L[i + W + 1] - L[i - W - 1] - 2 * L[i - W] - L[i - W + 1];
      const m = Math.abs(gx) + Math.abs(gy), j = i * 4, tone = (255 - L[i]) * 0.16 * ((x + y) % 3 === 0 ? 1 : 0);
      o[j] = 46; o[j + 1] = 46; o[j + 2] = 56; o[j + 3] = Math.min(235, Math.max(0, (m - 34) * 1.7) + tone);
    }
    cx.putImageData(out, 0, 0);
  }
  Y.theme("Conceptual Sketch", {
    swatch: ["#f6f3ea", "#2e2e38"],
    cls: "skt",
    html: `
      <svg class="k-defs" width="0" height="0"><filter id="k-boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></svg>
      <div class="k-page">
        <section class="k-f1"><p class="k-fig">fig. 1, what is on</p>
          <button class="k-vid" title="Play or pause"><canvas width="320" height="180"></canvas><svg class="k-box" viewBox="0 0 320 180" preserveAspectRatio="none"><path d="M3 4 L317 2 L318 177 L2 178 Z M-3 9 L8 -3 M312 -3 L323 8"/></svg></button>
          <p class="k-dim">16 : 9, redrawn about 30 times a second</p>
          <h1 class="k-title"></h1><svg class="k-ul" viewBox="0 0 300 12" preserveAspectRatio="none"><path d="M2 7 C40 2 70 11 110 6 S190 3 230 7 S280 9 298 4"/></svg>
          <p class="k-sub"></p><p class="k-meta"></p></section>
        <section class="k-f2"><p class="k-fig">fig. 2, the handover</p>
          <svg class="k-dia" viewBox="0 0 300 150"><g class="k-ax"><path d="M22 8 V128 H292"/><path d="M18 14 L22 6 L26 14 M286 124 L294 128 L286 132"/></g>
            <path class="k-ca" d="M22 30 H110 C170 30 180 122 240 122 H290"/><path class="k-cb" d="M22 122 H110 C170 122 180 30 240 30 H290"/>
            <path class="k-zone" d="M110 16 V128 M240 16 V128"/><g class="k-here"><path d="M0 12 V132"/><circle r="4" cy="12"/></g>
            <text class="k-la" x="28" y="24"></text><text class="k-lb" x="28" y="142"></text><text class="k-lz" x="175" y="14" text-anchor="middle">blend</text></svg>
          <div class="k-count"><p class="k-cl"></p><p class="k-cn"></p><svg viewBox="0 0 200 90" preserveAspectRatio="none"><path d="M12 48 C8 14 70 4 118 8 C170 12 196 30 188 54 C180 80 110 88 60 82 C24 78 6 66 14 40 C20 22 50 10 80 9"/></svg></div>
          <p class="k-body"></p><div class="k-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="k-act"></button></section>
        <section class="k-f3"><i class="k-tape"></i><canvas width="160" height="120"></canvas><p class="k-fig">fig. 3, next</p><p class="k-nt"></p><p class="k-ns"></p></section>
        <footer class="k-rule"><span class="k-t0"></span><div class="k-line"><div class="k-secs"></div><i class="k-mix"></i><i class="k-ph"></i></div><span class="k-t1"></span></footer>
      </div>`,
    css: `
    .ov[data-theme="Conceptual Sketch"] .dock { --dk-font: "Caveat", cursive; --dk-weight: 600; --dk-size: 18px; --dk-ink: ${INK}; --dk-line: rgba(46,46,56,.5); --dk-chip: rgba(46,46,56,.08); --dk-accent: ${RED}; --dk-on: #fff; }
    .skt { background: linear-gradient(rgba(47,95,168,.11) 1px, transparent 1px) 0 0/100% 26px, linear-gradient(90deg, rgba(47,95,168,.11) 1px, transparent 1px) 0 0/26px 100%, linear-gradient(rgba(47,95,168,.2) 1px, transparent 1px) 0 0/100% 130px, linear-gradient(90deg, rgba(47,95,168,.2) 1px, transparent 1px) 0 0/130px 100%, #f6f3ea;
      color: ${INK}; font-family: "Caveat", cursive; }
    .skt p, .skt h1 { margin: 0; } .skt svg { overflow: visible; }
    .skt svg path, .skt svg circle { fill: none; stroke: ${INK}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    .k-box, .k-ul, .k-dia, .k-count svg, .k-line, .k-steps, .k-tape { filter: url(#k-boil); }
    .k-page { position: absolute; inset: calc(60px + 2vh) 6vw 4vh; display: grid; grid-template-columns: calc(var(--u) * 46) 1fr calc(var(--u) * 15); grid-template-rows: 1fr auto; gap: calc(var(--u) * 1.5) calc(var(--u) * 3.4); }
    .k-fig { font: 600 calc(var(--u) * 1.5)/1 "Caveat", cursive; color: ${BLUE}; margin-bottom: calc(var(--u) * .7) !important; }
    .k-vid { position: relative; display: block; width: 100%; aspect-ratio: 16/9; cursor: pointer; } .k-vid canvas { width: 100%; height: 100%; transition: opacity 1s; }
    .k-box { position: absolute; inset: 0; width: 100%; height: 100%; } .k-box path { stroke-width: 2.6; }
    .k-dim { margin-top: 6px !important; text-align: right; font: 500 calc(var(--u) * 1.25)/1 "Caveat", cursive; color: ${BLUE}; }
    .k-title { margin-top: calc(var(--u) * .2) !important; font: 700 calc(var(--u) * 5.4)/.95 "Caveat", cursive; transform: rotate(-1.4deg); transform-origin: 0 50%; }
    .k-title.re, .k-nt.re { animation: k-write .9s steps(9) both; } @keyframes k-write { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(-20% -5% -20% 0); } }
    .k-ul { display: block; width: 62%; height: 12px; margin-top: 2px; } .k-ul path { stroke: ${RED}; stroke-width: 3; }
    .k-sub { margin-top: calc(var(--u) * .6) !important; font: 500 calc(var(--u) * 1.9)/1.1 "Caveat", cursive; } .k-meta { font: 500 calc(var(--u) * 1.5)/1.2 "Caveat", cursive; color: ${BLUE}; }
    .k-dia { display: block; width: 100%; max-height: 30vh; } .k-ca { stroke: ${INK} !important; stroke-width: 3 !important; } .k-cb { stroke: ${RED} !important; stroke-width: 3 !important; stroke-dasharray: 9 6; }
    .k-zone { stroke: ${BLUE} !important; stroke-dasharray: 3 6; stroke-width: 1.5 !important; } .k-here path { stroke: ${BLUE} !important; } .k-here circle { fill: ${BLUE} !important; stroke: none !important; }
    .k-dia text { font: 600 13px "Caveat", cursive; fill: ${INK}; } .k-lb { fill: ${RED} !important; } .k-lz { fill: ${BLUE} !important; }
    .k-count { position: relative; display: inline-block; margin-top: calc(var(--u) * 1.2); padding: calc(var(--u) * 1) calc(var(--u) * 2.4); }
    .k-count svg { position: absolute; inset: 0; width: 100%; height: 100%; } .k-count svg path { stroke: ${RED}; stroke-width: 2.4; }
    .k-cl { font: 600 calc(var(--u) * 1.6)/1 "Caveat", cursive; color: ${RED}; } .k-cn { font: 700 calc(var(--u) * 4.8)/.95 "Caveat", cursive; font-variant-numeric: tabular-nums; }
    .k-f2[data-mode="text"] .k-cn { font-size: calc(var(--u) * 2.5); line-height: 1; max-width: 14em; }
    .k-body { margin-top: calc(var(--u) * 1) !important; font: 500 calc(var(--u) * 1.75)/1.14 "Caveat", cursive; text-wrap: pretty; max-width: 24em; }
    .k-steps { display: flex; gap: 9px; margin-top: 8px; } .k-steps i { width: 17px; height: 17px; border: 2px solid ${INK}; border-radius: 3px; } .k-steps i[data-s="done"] { background: linear-gradient(45deg, transparent 42%, ${INK} 42% 58%, transparent 58%), linear-gradient(-45deg, transparent 42%, ${INK} 42% 58%, transparent 58%); } .k-steps i[data-s="now"] { border-color: ${RED}; background: repeating-linear-gradient(60deg, ${RED} 0 2px, transparent 2px 5px); }
    .k-act { margin-top: 12px; padding: 6px 18px 8px; border: 2.5px solid ${INK}; border-radius: 40% 60% 50% 50% / 60% 50% 60% 50%; font: 700 20px/1 "Caveat", cursive; background: rgba(255,224,102,.6); }
    .k-f3 { position: relative; align-self: start; margin-top: calc(var(--u) * 3); padding: calc(var(--u) * 1) calc(var(--u) * 1) calc(var(--u) * 1.2); background: #fffdf6; box-shadow: 2px 4px 14px rgba(46,46,56,.22); transform: rotate(2.4deg); will-change: transform; }
    .k-f3 canvas { width: 100%; height: auto; border: 1.5px solid ${INK}; margin-bottom: 8px; } .k-tape { position: absolute; left: 30%; top: -13px; width: 40%; height: 26px; background: rgba(255,224,102,.75); transform: rotate(-4deg); box-shadow: 0 1px 3px rgba(0,0,0,.15); }
    .k-nt { font: 700 calc(var(--u) * 2.3)/.95 "Caveat", cursive; white-space: nowrap; } .k-ns { font: 500 calc(var(--u) * 1.35)/1.1 "Caveat", cursive; color: ${BLUE}; margin-top: 3px !important; }
    .k-rule { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; font: 600 calc(var(--u) * 1.5)/1 "Caveat", cursive; font-variant-numeric: tabular-nums; padding-top: calc(var(--u) * 2); }
    .k-line { position: relative; flex: 1; height: 22px; border-bottom: 2.5px solid ${INK}; background: repeating-linear-gradient(90deg, ${INK} 0 1.5px, transparent 1.5px 2.5%) 0 100%/100% 8px no-repeat, repeating-linear-gradient(90deg, ${INK} 0 2px, transparent 2px 12.5%) 0 100%/100% 15px no-repeat; }
    .k-secs span { position: absolute; bottom: 26px; border: 1.5px solid ${BLUE}; border-bottom: 0; height: 7px; } .k-secs span b { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); font: 600 calc(var(--u) * 1.15)/1 "Caveat", cursive; color: ${BLUE}; white-space: nowrap; } .k-secs span.ch, .k-secs span.ch b { border-color: ${RED}; color: ${RED}; }
    .k-mix { position: absolute; top: 2px; bottom: 0; background: repeating-linear-gradient(55deg, ${RED} 0 1.5px, transparent 1.5px 6px); display: none; }
    .k-ph { position: absolute; bottom: -2px; width: 0; height: 0; margin-left: -9px; border: 9px solid transparent; border-bottom: 20px solid ${RED}; border-top: 0; }
    @media (max-aspect-ratio: 13/10) { .k-page { grid-template-columns: 1fr 1fr; } .k-f3 { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".k-vid canvas").getContext("2d"), nc: q(".k-f3 canvas").getContext("2d"), seed: 0, last: 0, es: {}, ns: {} };
      q(".k-vid").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".k-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, mo = Y.motion;
      if (now - st.last > 130 / Math.max(0.2, mo)) { st.last = now; st.seed = (st.seed % 7) + 1; q("#k-boil feTurbulence").setAttribute("seed", st.seed); }
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const L = Y.lum(320, 180); if (L) pencil(st.c, L, 320, 180, st.es); else { st.c.clearRect(0, 0, 320, 180); st.c.globalAlpha = 0.5; st.c.drawImage(Y.frame, 0, 0); q(".k-vid canvas").style.filter = "grayscale(1) contrast(1.6)"; } }
      else if (!vm.videoOk && a) Y.once(st, "still", a.thumb, () => Y.img(a.thumb, (im) => { const t = document.createElement("canvas"); t.width = 320; t.height = 180; const tc = t.getContext("2d"), k = im.naturalHeight / 360; tc.drawImage(im, 0, 45 * k, 480 * k, 270 * k, 0, 0, 320, 180);
        try { const d = tc.getImageData(0, 0, 320, 180).data, L = new Uint8Array(57600); for (let i = 0; i < 57600; i++) L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11; if (!Y.vm.videoOk) pencil(st.c, L, 320, 180, st.es); } catch (_) {} }));
      Y.swap(q(".k-title"), a ? a.title : "nothing playing yet"); Y.txt(q(".k-sub"), a ? a.sub : "open a YouTube Mix and this page fills in");
      Y.txt(q(".k-meta"), a && a.bpm ? `tempo ≈ ${Math.round(a.bpm)} bpm, key: ${a.key} (${a.cam})` : "");
      // fig. 2
      const cnt = Y.count(vm); q(".k-f2").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".k-la"), `A: ${a ? a.title : "this song"}`); Y.txt(q(".k-lb"), `B: ${b ? b.title : "the next song"}`);
      const hx = vm.kind === "blending" ? 110 + vm.p * 130 : vm.kind === "arrival" ? 262 : 34 + (cnt ? Y.clamp(1 - vm.countdown / 120) * 70 : 20);
      q(".k-here").setAttribute("transform", `translate(${hx.toFixed(1)} 0)`);
      Y.txt(q(".k-cl"), cnt ? (vm.paused ? "paused at" : vm.kind === "blending" ? "B takes over in" : "A meets B in") : vm.eyebrow.toLowerCase());
      Y.txt(q(".k-cn"), cnt || vm.headline);
      Y.txt(q(".k-body"), vm.step >= 0 ? `note to self: still ${vm.steps[vm.step]} for B.` : vm.plan && cnt ? `${vm.body} (${vm.plan.tech.toLowerCase()}, ${vm.plan.camA} to ${vm.plan.camB}, ${vm.plan.blendLen} s)` : vm.body);
      Y.stepDots(q(".k-steps"), vm); Y.showCta(q(".k-act"), vm);
      // fig. 3
      const f3 = q(".k-f3"); f3.style.visibility = b ? "visible" : "hidden";
      if (b) { if (Y.swap(q(".k-nt"), b.title)) Y.fit(q(".k-nt"), Y.u() * 2.3, Y.u() * 1.1); Y.txt(q(".k-ns"), Y.meta(b, ", ") || b.sub);
        Y.once(st, "nx", b.thumb, () => Y.img(b.thumb, (im) => { const k = im.naturalHeight / 360; st.nc.drawImage(im, 60 * k, 45 * k, 360 * k, 270 * k, 0, 0, 160, 120);
          try { const d = st.nc.getImageData(0, 0, 160, 120).data, L = new Uint8Array(19200); for (let i = 0; i < 19200; i++) L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11; st.nc.clearRect(0, 0, 160, 120); pencil(st.nc, L, 160, 120, st.ns); } catch (_) {} }));
        f3.style.transform = `rotate(${(2.4 + Math.sin(now / 1700) * 0.8 * mo - vm.p * 5).toFixed(2)}deg) scale(${(1 + Y.ease(vm.p) * 0.12).toFixed(3)})`; }
      // ruler
      const secs = Y.sections(vm);
      Y.once(st, "secs", (a ? a.id : "") + secs.length, () => { q(".k-secs").innerHTML = secs.map((s) => `<span class="${s.chorus ? "ch" : ""}" style="left:${s.a * 100 + 0.3}%;width:${(s.b - s.a) * 100 - 0.6}%">${(s.b - s.a) > 0.07 ? `<b>${s.label}</b>` : ""}</span>`).join(""); });
      q(".k-ph").style.left = Y.prog(vm) * 100 + "%";
      const mx = Y.mix(vm), m = q(".k-mix"); m.style.display = mx ? "block" : "none"; if (mx) { m.style.left = mx.a + "%"; m.style.width = Math.max(0.8, mx.b - mx.a) + "%"; }
      Y.txt(q(".k-t0"), vm.dur ? Y.fmt(vm.time) : "0:00"); Y.txt(q(".k-t1"), vm.dur ? Y.fmt(vm.dur) : "?");
    },
  });
})();
