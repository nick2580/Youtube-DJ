// Glassmorphism: the video is the light source. Blown up and blurred it colours the whole room; a frosted pane holds
// the picture, and moving the pointer over it wipes the frost away for a moment. The next song waits on a pane
// behind and slides forward as the blend takes hold. The spectrum is a row of glass rods.
(() => {
  const Y = window.YTDJ;
  const GRAIN = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 -.2'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
  const GLASS = `background: linear-gradient(135deg, rgba(255,255,255,.17), rgba(255,255,255,.05) 42%, rgba(255,255,255,.09)); border: 1px solid rgba(255,255,255,.26);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 0 rgba(255,255,255,.1), inset 0 0 22px rgba(255,255,255,.06), 0 calc(var(--u) * 2.4) calc(var(--u) * 4.5) calc(var(--u) * -2) rgba(0,0,10,.65);`;

  Y.theme("Glassmorphism", {
    swatch: ["#22a6c9", "#7c4dff"],
    cls: "gls",
    html: `
      <div class="g-amb"><img alt=""><canvas width="48" height="27"></canvas></div>
      <div class="g-orbs"><i></i><i></i><i></i><i></i></div>
      <div class="g-veil"></div>
      <section class="g-main">
        <canvas class="g-sharp" width="640" height="384"></canvas><canvas class="g-frost" width="320" height="192"></canvas>
        <i class="g-spec"></i>
        <div class="g-cap"><p class="g-eb"></p><h1 class="g-title"></h1><p class="g-sub"></p>
          <div class="g-chips"><span class="g-bpm"></span><span class="g-key"></span><span class="g-cam"></span></div></div>
        <button class="g-play" title="Play or pause"><i></i></button>
        <p class="g-hint">Move over the glass to wipe it clear</p>
      </section>
      <div class="g-rods"></div>
      <section class="g-next"><img alt=""><i class="g-nf"></i><div class="g-ncap"><p class="g-nl"></p><p class="g-nt"></p><p class="g-ns"></p></div></section>
      <section class="g-info">
        <div class="g-ring"><svg viewBox="0 0 120 120"><circle class="g-r0" cx="60" cy="60" r="54"/><circle class="g-r1" cx="60" cy="60" r="54" pathLength="100"/></svg>
          <div class="g-rc"><p class="g-cl"></p><p class="g-cn"></p></div></div>
        <div class="g-say"><p class="g-body"></p><p class="g-plan"></p><div class="g-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="g-act"></button></div>
      </section>
      <footer class="g-tl"><span class="g-t0"></span><div class="g-tube"><div class="g-secs"></div><i class="g-mix"></i><i class="g-fill"></i><i class="g-bead"></i></div><span class="g-t1"></span></footer>
      <div class="g-grain"></div>`,
    css: `
    .ov[data-theme="Glassmorphism"] .dock { --dk-font: "Sora", sans-serif; --dk-weight: 400; --dk-size: 12.5px; --dk-ink: #fff; --dk-line: rgba(255,255,255,.3); --dk-chip: rgba(255,255,255,.16); --dk-accent: #fff; --dk-on: #1a1830; }
    .gls { background: #0d0b1c; color: #fff; font-family: "Sora", sans-serif; }
    .gls p, .gls h1 { margin: 0; }
    .g-amb { position: absolute; inset: -12%; filter: blur(46px) saturate(1.9) brightness(.82); }
    .g-amb img, .g-amb canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .g-amb canvas { transition: opacity 1.5s ease; }
    .g-orbs i { position: absolute; left: 0; top: 0; width: 44vw; height: 44vw; margin: -22vw; border-radius: 50%; mix-blend-mode: screen; will-change: transform, opacity; background: radial-gradient(circle, var(--c, #7c4dff) 0, transparent 66%); }
    .g-veil { position: absolute; inset: 0; background: radial-gradient(ellipse 90% 80% at 40% 45%, rgba(10,8,30,.12), rgba(8,6,24,.62)); }
    .g-grain { position: absolute; inset: 0; background: ${GRAIN}; opacity: .09; mix-blend-mode: overlay; pointer-events: none; z-index: 8; }

    .g-main { position: absolute; left: 6vw; top: calc(60px + 4vh); width: calc(var(--u) * 55); aspect-ratio: 5/3; border-radius: calc(var(--u) * 2.6); overflow: hidden; will-change: transform; z-index: 3; ${GLASS} }
    .g-sharp, .g-frost { position: absolute; inset: 0; width: 100%; height: 100%; }
    .g-frost { opacity: .97; }
    .g-main::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background: linear-gradient(180deg, rgba(10,8,30,0) 40%, rgba(10,8,30,.62));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(255,255,255,.2), inset 0 0 calc(var(--u) * 3) rgba(255,255,255,.1); }
    .g-spec { position: absolute; inset: -40%; pointer-events: none; background: radial-gradient(ellipse 34% 26% at var(--sx, 30%) var(--sy, 20%), rgba(255,255,255,.3), transparent 70%); mix-blend-mode: screen; z-index: 2; }
    .g-cap { position: absolute; left: calc(var(--u) * 2.8); right: calc(var(--u) * 9); bottom: calc(var(--u) * 2.5); z-index: 3; pointer-events: none; }
    .g-eb { font: 400 clamp(12px, calc(var(--u) * .95), 15px)/1 "Sora", sans-serif; color: rgba(255,255,255,.78); display: flex; align-items: center; gap: .7em; }
    .g-eb::before { content: ""; width: .6em; height: .6em; border-radius: 50%; background: #fff; box-shadow: 0 0 12px 2px var(--c1, #fff); transform: scale(var(--bt, 1)); }
    .g-title { margin: calc(var(--u) * .9) 0 calc(var(--u) * .7) !important; font: 200 calc(var(--u) * 5.6)/1 "Sora", sans-serif; letter-spacing: -.035em; text-wrap: balance; text-shadow: 0 2px 30px rgba(0,0,20,.5); }
    .g-title.re, .g-nt.re { animation: g-in 1.1s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes g-in { from { opacity: 0; filter: blur(14px); transform: translateY(.2em); } }
    .g-sub { font: 300 clamp(14px, calc(var(--u) * 1.3), 21px)/1.3 "Sora", sans-serif; color: rgba(255,255,255,.86); }
    .g-chips { display: flex; gap: 8px; margin-top: calc(var(--u) * 1.3); }
    .g-chips span { padding: 7px 13px; border-radius: 999px; font: 400 clamp(11px, calc(var(--u) * .86), 14px)/1 "Sora", sans-serif; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.28); box-shadow: inset 0 1px 0 rgba(255,255,255,.4); font-variant-numeric: tabular-nums; }
    .g-chips span:empty { display: none; }
    .g-play { position: absolute; right: calc(var(--u) * 2.4); bottom: calc(var(--u) * 2.4); width: calc(var(--u) * 4.6); height: calc(var(--u) * 4.6); border-radius: 50%; z-index: 4; backdrop-filter: blur(12px); ${GLASS} transition: transform .2s ease, background .2s ease; }
    .g-play:hover { transform: scale(1.06); }
    .g-play i { position: absolute; left: 50%; top: 50%; width: 0; height: 0; margin: calc(var(--u) * -.7) 0 0 calc(var(--u) * -.4); border: solid transparent; border-width: calc(var(--u) * .7) 0 calc(var(--u) * .7) calc(var(--u) * 1.15); border-left-color: #fff; }
    .g-play.on i { width: calc(var(--u) * 1.1); height: calc(var(--u) * 1.3); margin: calc(var(--u) * -.65) 0 0 calc(var(--u) * -.55); border: 0; background: linear-gradient(90deg, #fff 0 34%, transparent 34% 66%, #fff 66%); }
    .g-hint { position: absolute; right: calc(var(--u) * 2.6); top: calc(var(--u) * 2.2); z-index: 3; font: 300 clamp(11px, calc(var(--u) * .86), 14px)/1 "Sora", sans-serif; color: rgba(255,255,255,.8); transition: opacity 1s ease; pointer-events: none; }

    .g-rods { position: absolute; left: 6vw; top: calc(60px + 4vh + var(--u) * 34.6); width: calc(var(--u) * 55); height: calc(var(--u) * 6.4); display: flex; align-items: flex-end; justify-content: space-between; padding: 0 calc(var(--u) * 1.4); z-index: 2; }
    .g-rods i { width: calc(var(--u) * 1.15); height: 100%; border-radius: 999px; transform-origin: 50% 100%; will-change: transform; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.12) 55%, rgba(255,255,255,.04)); border: 1px solid rgba(255,255,255,.34); box-shadow: inset 2px 0 3px rgba(255,255,255,.45), 0 0 14px rgba(255,255,255,.12); }

    .g-next { position: absolute; right: 5vw; top: calc(60px + 6vh); width: calc(var(--u) * 27); aspect-ratio: 16/10; border-radius: calc(var(--u) * 2); overflow: hidden; will-change: transform; z-index: 2; backdrop-filter: blur(24px) saturate(1.5); ${GLASS} }
    .g-next img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.42); filter: blur(calc(var(--nb, 7) * 1px)) saturate(1.2); opacity: .82; }
    .g-nf { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,0) 40%), linear-gradient(180deg, rgba(10,8,30,.05) 30%, rgba(10,8,30,.7)); box-shadow: inset 0 1px 0 rgba(255,255,255,.6); border-radius: inherit; }
    .g-ncap { position: absolute; left: calc(var(--u) * 1.8); right: calc(var(--u) * 1.8); bottom: calc(var(--u) * 1.5); }
    .g-nl { font: 400 clamp(11px, calc(var(--u) * .86), 14px)/1 "Sora", sans-serif; color: rgba(255,255,255,.78); }
    .g-nt { margin: calc(var(--u) * .5) 0 calc(var(--u) * .35) !important; font: 300 calc(var(--u) * 2.5)/1.05 "Sora", sans-serif; letter-spacing: -.03em; text-wrap: balance; }
    .g-ns { font: 300 clamp(12px, calc(var(--u) * .95), 15px)/1.3 "Sora", sans-serif; color: rgba(255,255,255,.82); }

    .g-info { position: absolute; right: 5vw; top: calc(60px + 6vh + var(--u) * 20.5); width: calc(var(--u) * 27); display: flex; flex-direction: column; gap: calc(var(--u) * 1.6); z-index: 2; }
    .g-ring { position: relative; width: calc(var(--u) * 13); height: calc(var(--u) * 13); border-radius: 50%; backdrop-filter: blur(22px) saturate(1.5); ${GLASS} }
    .g-ring svg { position: absolute; inset: calc(var(--u) * .5); transform: rotate(-90deg); overflow: visible; }
    .g-r0 { fill: none; stroke: rgba(255,255,255,.16); stroke-width: 2; }
    .g-r1 { fill: none; stroke: #fff; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 0 100; filter: drop-shadow(0 0 5px var(--c1, #fff)); }
    .g-rc { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * .5); text-align: center; padding: 0 calc(var(--u) * 1.4); }
    .g-cl { font: 400 clamp(11px, calc(var(--u) * .86), 14px)/1.15 "Sora", sans-serif; color: rgba(255,255,255,.8); }
    .g-cn { font: 200 calc(var(--u) * 3.7)/1 "Sora", sans-serif; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
    .g-info[data-mode="text"] .g-cn { font: 400 calc(var(--u) * 1.15)/1.2 "Sora", sans-serif; letter-spacing: -.01em; text-wrap: balance; }
    .g-body { font: 300 clamp(13px, calc(var(--u) * 1.08), 17px)/1.5 "Sora", sans-serif; color: rgba(255,255,255,.92); text-wrap: pretty; }
    .g-plan { margin-top: 8px !important; font: 400 clamp(11px, calc(var(--u) * .86), 14px)/1.3 "Sora", sans-serif; color: rgba(255,255,255,.72); }
    .g-steps { display: flex; gap: 6px; margin-top: 12px; }
    .g-steps i { flex: 1; max-width: 44px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.2); transition: background .6s ease, box-shadow .6s ease; }
    .g-steps i[data-s="done"] { background: rgba(255,255,255,.75); } .g-steps i[data-s="now"] { background: #fff; box-shadow: 0 0 12px #fff; animation: g-now 1.4s ease-in-out infinite; }
    @keyframes g-now { 50% { opacity: .4; } }
    .g-act { margin-top: 14px; height: 40px; padding: 0 20px; border-radius: 999px; font: 400 13.5px/1 "Sora", sans-serif; backdrop-filter: blur(14px); ${GLASS} background: rgba(255,255,255,.24); }
    .g-act:hover { background: rgba(255,255,255,.36); }

    .g-tl { position: absolute; left: 6vw; right: 5vw; bottom: 4.6vh; display: flex; align-items: center; gap: 16px; z-index: 3; font: 300 clamp(12px, calc(var(--u) * .95), 15px)/1 "Sora", sans-serif; font-variant-numeric: tabular-nums; }
    .g-tube { position: relative; flex: 1; height: 12px; border-radius: 99px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.28); box-shadow: inset 0 1px 2px rgba(0,0,20,.5), 0 1px 0 rgba(255,255,255,.12); }
    .g-secs i { position: absolute; top: 2px; bottom: 2px; width: 1px; background: rgba(255,255,255,.3); } .g-secs i.ch { width: auto; background: rgba(255,255,255,.14); border-radius: 99px; }
    .g-mix { position: absolute; top: -5px; bottom: -5px; border-radius: 99px; border: 1px solid rgba(255,255,255,.75); background: rgba(255,255,255,.22); box-shadow: 0 0 14px rgba(255,255,255,.45); display: none; }
    .g-fill { position: absolute; left: 1px; top: 1px; bottom: 1px; width: 0; border-radius: 99px; background: linear-gradient(90deg, rgba(255,255,255,.25), #fff); box-shadow: 0 0 12px var(--c1, #fff); }
    .g-bead { position: absolute; top: 50%; width: 22px; height: 22px; margin: -11px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, rgba(255,255,255,.55) 45%, rgba(255,255,255,.2)); border: 1px solid rgba(255,255,255,.8); box-shadow: 0 0 18px 2px var(--c1, #fff), inset 0 -2px 4px rgba(0,0,30,.25); }
    @media (max-aspect-ratio: 13/10) { .g-main, .g-rods { width: calc(var(--u) * 62); } .g-next, .g-info { width: calc(var(--u) * 24); } .g-rods { display: none; } .g-info { top: auto; bottom: 14vh; } .g-next { top: auto; bottom: calc(14vh + var(--u) * 22); } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, ac: q(".g-amb canvas").getContext("2d"), sc: q(".g-sharp").getContext("2d"), fc: q(".g-frost").getContext("2d"), k: {}, wiped: false, lastWipe: 0, tid: null, timg: null, t0: null, cd0: null };
      st.mask = document.createElement("canvas"); st.mask.width = 160; st.mask.height = 96; st.mc = st.mask.getContext("2d");
      q(".g-rods").innerHTML = "<i></i>".repeat(24);
      st.rods = [...q(".g-rods").children];
      st.orbs = [...q(".g-orbs").children].map((e, i) => ({ e, ph: i * 1.7, fx: 0.11 + i * 0.037, fy: 0.09 + i * 0.045 }));
      const main = q(".g-main");
      main.addEventListener("pointermove", (ev) => {
        const r = main.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width) * 160, y = ((ev.clientY - r.top) / r.height) * 96;
        const g = st.mc.createRadialGradient(x, y, 0, x, y, 26); g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
        st.mc.globalCompositeOperation = "source-over"; st.mc.fillStyle = g; st.mc.fillRect(x - 26, y - 26, 52, 52);
        st.lastWipe = performance.now(); if (!st.wiped) { st.wiped = true; q(".g-hint").style.opacity = "0"; }
      });
      q(".g-play").onclick = () => Y.source.act.playPause();
      Y.bindCta(q(".g-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q, k } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, m = Y.mouse;
      const once = (key, val, fn) => { if (k[key] !== val) { k[key] = val; fn(); } };
      const pe = Y.ease(vm.p), flash = vm.sinceDrop < 3 ? 1 - vm.sinceDrop / 3 : 0;
      const c1 = a ? a.c1 : "#7c4dff";
      once("c1", c1, () => st.el.style.setProperty("--c1", c1));

      // the room is lit by the video
      if (a) { Y.src(q(".g-amb img"), a.thumb); if (st.tid !== a.id) { st.tid = a.id; const im = new Image(); im.onload = () => { st.timg = im; }; im.src = a.thumb; st.timg = null; } }
      const fresh = vm.videoOk && Y.frameTick !== st.ft;
      if (fresh) { st.ft = Y.frameTick; st.ac.drawImage(Y.frame, 0, 0, 48, 27); }
      q(".g-amb canvas").style.opacity = vm.videoOk ? "1" : "0";
      const cols = [a ? a.c1 : "#7c4dff", a ? a.c2 : "#ff4f9a", b ? b.c1 : "#22c1ee", b ? b.c1 : "#22c1ee"];
      st.orbs.forEach((o, i) => {
        once("orb" + i, cols[i], () => o.e.style.setProperty("--c", cols[i]));
        const t = (now / 1000) * mo, x = 0.5 + 0.42 * Math.sin(t * o.fx + o.ph), y = 0.5 + 0.38 * Math.cos(t * o.fy + o.ph * 1.3);
        o.e.style.transform = `translate(${(x * innerWidth).toFixed(1)}px,${(y * innerHeight).toFixed(1)}px) scale(${(0.8 + au.bass * 0.5 + (i > 1 ? pe * 0.5 : 0)).toFixed(3)})`;
        o.e.style.opacity = (i > 1 ? 0.12 + pe * 0.6 + flash * 0.3 : 0.5 - pe * 0.3).toFixed(3);
      });

      // main pane: sharp picture under frost; the pointer (or a slow wandering breath) clears it
      const sc = st.sc, fc = st.fc, mc = st.mc;
      if (vm.videoOk) { if (fresh) { const v = vm.video; try { Y.cover(sc, v, v.videoWidth || v.width, v.videoHeight || v.height, 640, 384); } catch (_) {} } }
      else if (st.timg) { const im = st.timg; sc.drawImage(im, 0, im.naturalHeight * 0.125, im.naturalWidth, im.naturalHeight * 0.75, 0, -6, 640, 396); }
      else { sc.fillStyle = "#17142e"; sc.fillRect(0, 0, 640, 384); }
      mc.globalCompositeOperation = "destination-out"; mc.fillStyle = `rgba(0,0,0,${Math.min(1, dt * 0.5).toFixed(3)})`; mc.fillRect(0, 0, 160, 96);
      if (now - st.lastWipe > 2200 && !vm.paused) {
        const t = (now / 1000) * mo, x = 80 + 52 * Math.sin(t * 0.31), y = 44 + 22 * Math.sin(t * 0.47 + 1);
        const g = mc.createRadialGradient(x, y, 0, x, y, 34); g.addColorStop(0, `rgba(0,0,0,${(0.03 + au.level * 0.08).toFixed(3)})`); g.addColorStop(1, "rgba(0,0,0,0)");
        mc.globalCompositeOperation = "source-over"; mc.fillStyle = g; mc.fillRect(x - 34, y - 34, 68, 68);
      }
      fc.globalCompositeOperation = "source-over"; fc.filter = "blur(9px) saturate(1.35) brightness(1.06)"; fc.drawImage(q(".g-sharp"), -8, -5, 336, 202); fc.filter = "none";
      fc.fillStyle = "rgba(255,255,255,.08)"; fc.fillRect(0, 0, 320, 192);
      fc.globalCompositeOperation = "destination-out"; fc.drawImage(st.mask, 0, 0, 320, 192);

      const main = q(".g-main");
      main.style.transform = `translate(${(m.x * -9).toFixed(1)}px,${(m.y * -7).toFixed(1)}px) perspective(1600px) rotateY(${(m.x * 2.2 * mo + pe * 5).toFixed(2)}deg) rotateX(${(-m.y * 1.8 * mo).toFixed(2)}deg) scale(${(1 - pe * 0.05 + au.bass * 0.004).toFixed(4)})`;
      const spec = q(".g-spec"); Y.sty(spec, "--sx", (50 + m.x * 30 + flash * 40).toFixed(1) + "%"); Y.sty(spec, "--sy", (40 + m.y * 26).toFixed(1) + "%");
      Y.txt(q(".g-eb"), vm.paused ? "Paused" : vm.kind === "blending" ? "Fading out" : "Now playing");
      Y.sty(q(".g-eb"), "--bt", (1 + vm.beat * 0.9).toFixed(2));
      const title = a ? a.title : "YouTube DJ";
      if (Y.swap(q(".g-title"), title)) q(".g-title").style.fontSize = `calc(var(--u) * ${title.length > 30 ? 3 : title.length > 18 ? 4 : 5.6})`;
      Y.txt(q(".g-sub"), a ? a.sub : "");
      Y.txt(q(".g-bpm"), a && a.bpm ? `${a.bpm.toFixed(1)} bpm` : ""); Y.txt(q(".g-key"), a ? a.key : ""); Y.txt(q(".g-cam"), a ? a.cam : "");
      q(".g-play").classList.toggle("on", !vm.paused);

      // glass rods
      for (let i = 0; i < 24; i++) st.rods[i].style.transform = `scaleY(${(0.08 + Math.min(1, au.bins[i] * 1.2) * 0.92).toFixed(3)})`;

      // next pane comes forward with the blend
      const nx = q(".g-next"); nx.style.visibility = b ? "visible" : "hidden";
      if (b) {
        Y.src(nx.querySelector("img"), b.thumb);
        Y.txt(q(".g-nl"), vm.kind === "blending" ? "Coming into focus" : vm.kind === "skipping" ? "Skipping" : "Next");
        Y.swap(q(".g-nt"), b.title);
        Y.txt(q(".g-ns"), b.bpm ? `${Math.round(b.bpm)} bpm, ${b.key}` : b.sub);
        Y.sty(nx, "--nb", (7 * (1 - pe)).toFixed(1));
        nx.style.transform = `translate(${(m.x * 20 - pe * 30).toFixed(1)}px,${(m.y * 14 + Math.sin(now / 2100) * 5 * mo + pe * 14).toFixed(1)}px) perspective(1400px) rotateY(${(-13 * (1 - pe) + m.x * 3 * mo).toFixed(2)}deg) rotateX(${(-m.y * 2 * mo).toFixed(2)}deg) scale(${(0.94 + pe * 0.16).toFixed(4)})`;
      }

      // ring: time left until the blend (or the blend itself)
      const counting = vm.countdown != null;
      q(".g-info").dataset.mode = counting ? "count" : "text";
      let frac = vm.dur ? Y.clamp(vm.time / vm.dur) : 0;
      if (vm.kind === "blending") frac = vm.p;
      else if (vm.kind === "armed" && counting) { if (st.cd0 == null || vm.countdown > st.cd0) st.cd0 = Math.max(vm.countdown, 1); frac = 1 - vm.countdown / st.cd0; }
      if (vm.kind !== "armed") st.cd0 = null;
      q(".g-r1").style.strokeDasharray = `${(frac * 100).toFixed(2)} 100`;
      q(".g-ring").style.transform = `translate(${(m.x * 14).toFixed(1)}px,${(m.y * 10).toFixed(1)}px) scale(${(1 + vm.bounce * 0.022 * mo).toFixed(4)})`;
      Y.txt(q(".g-cl"), vm.eyebrow);
      Y.txt(q(".g-cn"), counting ? Y.fmt(Math.ceil(vm.countdown)) : vm.headline);
      Y.txt(q(".g-body"), vm.step >= 0 ? `Getting the next song ready: ${vm.steps[vm.step]}.` : vm.body);
      Y.txt(q(".g-plan"), counting && vm.plan ? `${vm.plan.tech} · ${vm.plan.camA} to ${vm.plan.camB} · ${vm.plan.blendLen}s` : "");
      const steps = q(".g-steps"); steps.style.display = vm.step >= 0 ? "flex" : "none";
      [...steps.children].forEach((e, i) => { const s = i < vm.step ? "done" : i === vm.step ? "now" : "todo"; if (e.dataset.s !== s) e.dataset.s = s; });
      Y.showCta(q(".g-act"), vm);

      // tube
      const pr = vm.dur ? Y.clamp(vm.time / vm.dur) * 100 : 0;
      q(".g-fill").style.width = `calc(${pr}% - 2px)`; q(".g-bead").style.left = pr + "%";
      const secs = Y.sections(vm);
      once("secs", (a ? a.id : "") + secs.length + Math.round(vm.dur), () => { q(".g-secs").innerHTML = secs.map((s) => s.chorus ? `<i class="ch" style="left:${s.a * 100}%;width:${(s.b - s.a) * 100}%"></i>` : `<i style="left:${s.a * 100}%"></i>`).join(""); });
      const mix = q(".g-mix"), ms = vm.plan && Y.pct(vm, vm.plan.mixStart), me = vm.plan && Y.pct(vm, vm.plan.mixEnd);
      if (ms != null && me != null) { mix.style.display = "block"; mix.style.left = ms + "%"; mix.style.width = Math.max(0.8, me - ms) + "%"; } else mix.style.display = "none";
      Y.txt(q(".g-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".g-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
