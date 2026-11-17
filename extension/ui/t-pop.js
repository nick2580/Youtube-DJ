// Pop Art: the video is silk-screened four times in four colourways, like a print run. Ben-Day dots and a rotating
// sunburst fill the page, the countdown is shouted from a speech balloon, the next song is a comic panel, the
// timeline is a strip of frames, and the drop lands with a BOOM.
(() => {
  const Y = window.YTDJ;
  const INKS = [[[26, 26, 26], [232, 17, 45], [255, 230, 0]], [[27, 42, 138], [255, 95, 162], [255, 255, 255]], [[11, 94, 58], [255, 230, 0], [127, 224, 255]], [[110, 20, 120], [255, 140, 0], [255, 240, 200]]];
  const burst = (n, r) => Array.from({ length: n * 2 }, (_, i) => { const a = (i / (n * 2)) * 6.283, rr = i % 2 ? 50 : r; return `${(50 + rr * Math.cos(a)).toFixed(1)}% ${(50 + rr * Math.sin(a)).toFixed(1)}%`; }).join(",");
  Y.theme("Pop Art", {
    swatch: ["#ffe600", "#e8112d"],
    cls: "pop",
    html: `
      <div class="o-rays"></div><div class="o-dots"></div>
      <div class="o-cap"><p class="o-eb"></p></div>
      <h1 class="o-title"></h1><p class="o-sub"></p>
      <button class="o-quad" title="Play or pause"><canvas width="160" height="90"></canvas><canvas width="160" height="90"></canvas><canvas width="160" height="90"></canvas><canvas width="160" height="90"></canvas></button>
      <div class="o-bal"><p class="o-cl"></p><p class="o-cn"></p></div>
      <div class="o-box"><p class="o-body"></p><div class="o-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="o-act"></button></div>
      <div class="o-panel"><div class="o-pic"><img alt=""><i></i></div><b class="o-nl"></b><p class="o-nt"></p><p class="o-ns"></p></div>
      <div class="o-boom"><b>BOOM!</b></div>
      <footer class="o-strip"><span class="o-t0"></span><div class="o-fr"><div class="o-segs"></div><i class="o-mix"><b>ZAP!</b></i><i class="o-ph"></i></div><span class="o-t1"></span></footer>`,
    css: `
    .ov[data-theme="Pop Art"] .dock { --dk-font: "Bangers", cursive; --dk-weight: 400; --dk-size: 17px; --dk-track: .05em; --dk-ink: #111; --dk-line: #111; --dk-chip: #fff; --dk-accent: #e8112d; --dk-on: #fff; }
    .ov[data-theme="Pop Art"] .dk-b { border-width: 2.5px; background: #fff; }
    .pop { background: #ffe600; color: #111; font-family: "Bangers", cursive; --ol: #111; }
    .pop p, .pop h1 { margin: 0; font-weight: 400; }
    .o-rays { position: absolute; left: 50%; top: 50%; width: 200vmax; height: 200vmax; margin: -100vmax; background: repeating-conic-gradient(#ffe600 0 7.5deg, #ffc400 7.5deg 15deg); will-change: transform; }
    .o-dots { position: absolute; inset: -40px; background: radial-gradient(circle, #e8112d 0 var(--dr, 6px), transparent calc(var(--dr, 6px) + 1px)) 0 0/30px 30px, radial-gradient(circle, #e8112d 0 var(--dr, 6px), transparent calc(var(--dr, 6px) + 1px)) 15px 15px/30px 30px; opacity: .5; -webkit-mask-image: linear-gradient(115deg, #000 0 30%, transparent 55%); mask-image: linear-gradient(115deg, #000 0 30%, transparent 55%); }
    .o-cap { position: absolute; left: 5vw; top: calc(60px + 3vh); padding: 7px 14px 5px; background: #fff; border: 4px solid var(--ol); box-shadow: 5px 5px 0 var(--ol); transform: rotate(-2deg); z-index: 3; }
    .o-eb { font: 400 calc(var(--u) * 1.7)/1 "Bangers", cursive; letter-spacing: .06em; }
    .o-title { position: absolute; left: 5vw; top: calc(60px + 10vh); max-width: 38vw; font: 400 calc(var(--u) * 9)/.9 "Bangers", cursive; letter-spacing: .02em; color: #e8112d; -webkit-text-stroke: 4px var(--ol); paint-order: stroke fill; text-shadow: 7px 7px 0 var(--ol); transform: rotate(-4deg) skewX(-6deg); transform-origin: 0 50%; z-index: 3; overflow-wrap: anywhere; }
    .o-title.re { animation: o-slam .45s cubic-bezier(.3,1.6,.5,1) both; } @keyframes o-slam { from { transform: rotate(-12deg) scale(2.2); opacity: 0; } }
    .o-sub { position: absolute; left: 5vw; top: calc(60px + 10vh + var(--u) * 19.5); max-width: 34vw; padding: 6px 12px; background: #1b2a8a; color: #fff; border: 4px solid var(--ol); font: 400 calc(var(--u) * 1.7)/1.1 "Bangers", cursive; letter-spacing: .05em; z-index: 3; transform: rotate(-2deg); }
    .o-quad { position: absolute; left: 41vw; top: calc(60px + 4vh); width: calc(var(--u) * 46); display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 5px; background: var(--ol); box-shadow: 12px 12px 0 var(--ol); transform: rotate(2deg); cursor: pointer; z-index: 2; will-change: transform; }
    .o-quad canvas { width: 100%; height: auto; image-rendering: auto; }
    .o-bal { position: absolute; right: 4vw; top: calc(60px + 3vh); min-width: calc(var(--u) * 15); padding: calc(var(--u) * 1.3) calc(var(--u) * 2.2) calc(var(--u) * 1.6); background: #fff; border: 5px solid var(--ol); border-radius: 50%; text-align: center; z-index: 5; box-shadow: 6px 6px 0 var(--ol); will-change: transform; }
    .o-bal::after { content: ""; position: absolute; left: 12%; bottom: -34px; width: 44px; height: 44px; background: #fff; border: solid var(--ol); border-width: 0 5px 5px 0; transform: skew(28deg, 12deg) rotate(18deg); clip-path: polygon(100% 0, 100% 100%, 0 100%); }
    .o-cl { font: 400 calc(var(--u) * 1.8)/1 "Bangers", cursive; letter-spacing: .06em; color: #1b2a8a; } .o-cn { font: 400 calc(var(--u) * 6.2)/.95 "Bangers", cursive; letter-spacing: .03em; font-variant-numeric: tabular-nums; } .o-bal[data-mode="text"] .o-cn { font-size: calc(var(--u) * 2.4); max-width: 9em; line-height: 1; }
    .o-box { position: absolute; left: 5vw; bottom: 15vh; width: calc(var(--u) * 30); padding: calc(var(--u) * 1) calc(var(--u) * 1.3); background: #fff7b0; border: 4px solid var(--ol); box-shadow: 6px 6px 0 var(--ol); z-index: 4; }
    .o-body { font: 600 clamp(14px, calc(var(--u) * 1.25), 19px)/1.3 "Jost", sans-serif; text-transform: uppercase; letter-spacing: .01em; text-wrap: pretty; }
    .o-steps { display: flex; gap: 6px; margin-top: 10px; } .o-steps i { width: 20px; height: 20px; border: 3px solid var(--ol); border-radius: 50%; background: #fff; } .o-steps i[data-s="done"] { background: #1b2a8a; } .o-steps i[data-s="now"] { background: #e8112d; animation: o-pulse .5s infinite alternate; } @keyframes o-pulse { to { transform: scale(1.35); } }
    .o-act { margin-top: 10px; padding: 8px 16px 6px; background: #e8112d; color: #fff; border: 4px solid var(--ol); box-shadow: 4px 4px 0 var(--ol); font: 400 20px/1 "Bangers", cursive; letter-spacing: .06em; } .o-act:active { transform: translate(3px, 3px); box-shadow: 1px 1px 0 var(--ol); }
    .o-panel { position: absolute; right: 5vw; bottom: 15vh; width: calc(var(--u) * 21); padding: 6px 6px 10px; background: #fff; border: 5px solid var(--ol); box-shadow: 8px 8px 0 var(--ol); transform: rotate(-3deg); z-index: 4; will-change: transform; }
    .o-pic { position: relative; aspect-ratio: 4/3; overflow: hidden; border: 3px solid var(--ol); background: #7fe0ff; } .o-pic img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.34); filter: grayscale(1) contrast(2.2) brightness(1.15); mix-blend-mode: multiply; }
    .o-pic i { position: absolute; inset: 0; background: radial-gradient(circle, transparent 0 2px, #7fe0ff 3px) 0 0/7px 7px; mix-blend-mode: lighten; opacity: .9; }
    .o-nl { position: absolute; left: -22px; top: -26px; width: calc(var(--u) * 7.4); height: calc(var(--u) * 7.4); display: grid; place-items: center; background: #e8112d; color: #fff; clip-path: polygon(${burst(12, 34)}); font: 400 calc(var(--u) * 1.9)/1 "Bangers", cursive; letter-spacing: .05em; transform: rotate(-10deg); }
    .o-nt { margin-top: 8px !important; font: 400 calc(var(--u) * 2.6)/.95 "Bangers", cursive; letter-spacing: .03em; overflow-wrap: anywhere; } .o-ns { font: 600 clamp(11px, calc(var(--u) * 1), 15px)/1.2 "Jost", sans-serif; text-transform: uppercase; }
    .o-boom { position: absolute; left: 50%; top: 46%; width: 70vmin; height: 70vmin; margin: -35vmin; display: grid; place-items: center; background: #e8112d; clip-path: polygon(${burst(16, 36)}); z-index: 8; pointer-events: none; opacity: 0; will-change: transform, opacity; }
    .o-boom b { font: 400 18vmin/1 "Bangers", cursive; color: #ffe600; -webkit-text-stroke: 5px #111; paint-order: stroke fill; transform: rotate(-8deg); }
    .o-strip { position: absolute; left: 5vw; right: 5vw; bottom: 4.5vh; display: flex; align-items: center; gap: 14px; font: 400 calc(var(--u) * 1.7)/1 "Bangers", cursive; z-index: 4; font-variant-numeric: tabular-nums; }
    .o-fr { position: relative; flex: 1; height: calc(var(--u) * 3); } .o-segs { position: absolute; inset: 0; display: flex; gap: 5px; }
    .o-segs span { height: 100%; min-width: 0; padding: 0 8px; display: flex; align-items: center; overflow: hidden; border: 4px solid var(--ol); background: #fff; font: 400 calc(var(--u) * 1.3)/1 "Bangers", cursive; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; } .o-segs span.ch { background: #e8112d; color: #fff; } .o-segs span.b2 { background: #7fe0ff; }
    .o-mix { position: absolute; top: -7px; bottom: -7px; border: 4px solid var(--ol); background: #ffe600; display: none; overflow: visible; } .o-mix b { position: absolute; left: 50%; bottom: calc(100% + 2px); transform: translateX(-50%) rotate(-6deg); font: 400 calc(var(--u) * 1.6)/1 "Bangers", cursive; color: #e8112d; -webkit-text-stroke: 1px #111; }
    .o-ph { position: absolute; top: -16px; width: 0; height: 0; margin-left: -12px; border: 12px solid transparent; border-top: 18px solid var(--ol); border-bottom: 0; } .o-ph::after { content: ""; position: absolute; left: -3px; top: -2px; width: 6px; height: calc(var(--u) * 3 + 20px); background: var(--ol); }
    @media (max-aspect-ratio: 13/10) { .o-quad { left: 30vw; top: 34vh; width: calc(var(--u) * 40); } .o-box { display: none; } .o-title { max-width: 60vw; font-size: calc(var(--u) * 7); } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, cs: [...el.querySelectorAll(".o-quad canvas")].map((c) => c.getContext("2d")), os: [], rot: 0 };
      q(".o-quad").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".o-act"));
      return st;
    },
    paint(st, L) { st.cs.forEach((c, k) => { const o = st.os[k] || (st.os[k] = c.createImageData(160, 90)), d = o.data, ink = INKS[k];
      for (let i = 0, j = 0; i < 14400; i++, j += 4) { const v = L[i], col = ink[v < 78 ? 0 : v < 158 ? 1 : 2]; d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; d[j + 3] = 255; } c.putImageData(o, 0, 0); }); },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p), bt = vm.paused ? 0 : vm.beat;
      st.rot = (st.rot + dt * (3 + au.level * 14) * mo) % 360; q(".o-rays").style.transform = `rotate(${st.rot.toFixed(2)}deg)`;
      Y.sty(q(".o-dots"), "--dr", (5 + bt * 3.5 * mo).toFixed(1) + "px");
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const L = Y.lum(160, 90); if (L) this.paint(st, L); else st.cs.forEach((c, k) => { c.filter = `grayscale(1) contrast(3) sepia(1) hue-rotate(${k * 90}deg) saturate(6)`; c.drawImage(Y.frame, 0, 0, 160, 90); }); }
      else if (!vm.videoOk && a) Y.once(st, "still", a.thumb, () => Y.img(a.thumb, (im) => { const t = document.createElement("canvas"); t.width = 160; t.height = 90; const tc = t.getContext("2d", { willReadFrequently: true }), k = im.naturalHeight / 360; tc.drawImage(im, 0, 45 * k, 480 * k, 270 * k, 0, 0, 160, 90);
        try { const d = tc.getImageData(0, 0, 160, 90).data, L = new Uint8Array(14400); for (let i = 0; i < 14400; i++) L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11; if (!Y.vm.videoOk) this.paint(st, L); } catch (_) {} }));
      q(".o-quad").style.transform = `rotate(${(2 + Math.sin(now / 1300) * 0.6 * mo).toFixed(2)}deg) scale(${(1 + bt * 0.014 * mo).toFixed(4)})`;
      Y.txt(q(".o-eb"), vm.paused ? "Meanwhile, on pause..." : vm.kind === "blending" ? "Its final moments!" : "Now playing!");
      const title = a ? a.title : "Silence!";
      if (Y.swap(q(".o-title"), title)) q(".o-title").style.fontSize = `calc(var(--u) * ${title.length > 24 ? 4.4 : title.length > 14 ? 6 : 9})`;
      Y.txt(q(".o-sub"), a ? [a.sub, Y.meta(a)].filter(Boolean).join(" ★ ") : "Play a YouTube Mix!"); q(".o-sub").style.top = `calc(60px + 11vh + ${q(".o-title").offsetHeight}px)`;
      const cnt = Y.count(vm), bal = q(".o-bal"); bal.dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".o-cl"), cnt ? (vm.paused ? "Holding at" : vm.kind === "blending" ? "Drop in" : "Mix in") : vm.eyebrow); Y.txt(q(".o-cn"), cnt ? cnt + "!" : vm.headline);
      bal.style.transform = `rotate(${(4 + Math.sin(now / 900) * 1.5 * mo).toFixed(2)}deg) scale(${(1 + bt * 0.04 * mo + pe * 0.1).toFixed(3)})`;
      Y.txt(q(".o-body"), vm.step >= 0 ? `Our hero studies the next song: ${vm.steps[vm.step]}!` : vm.body); Y.stepDots(q(".o-steps"), vm); Y.showCta(q(".o-act"), vm);
      const pn = q(".o-panel"); pn.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(pn.querySelector("img"), b.thumb); Y.txt(q(".o-nl"), vm.kind === "blending" ? "Here!" : "Next!"); Y.swap(q(".o-nt"), b.title); Y.txt(q(".o-ns"), Y.meta(b)); pn.style.transform = `rotate(${(-3 + pe * 3).toFixed(2)}deg) scale(${(1 + pe * 0.2).toFixed(3)})`; }
      const bm = q(".o-boom"), s = vm.sinceDrop; if (s < 2.2) { const k = Math.min(1, s / 0.18); bm.style.opacity = s > 1.6 ? ((2.2 - s) / 0.6).toFixed(2) : "1"; bm.style.transform = `scale(${(0.3 + k * 0.7 + Math.sin(s * 30) * 0.02).toFixed(3)}) rotate(${(s * 6).toFixed(1)}deg)`; } else bm.style.opacity = "0";
      const secs = Y.sections(vm);
      Y.once(st, "segs", (a ? a.id : "") + secs.length, () => { q(".o-segs").innerHTML = secs.length ? secs.map((x, i) => `<span class="${x.chorus ? "ch" : i % 2 ? "b2" : ""}" style="flex:${(x.b - x.a).toFixed(4)}">${(x.b - x.a) > 0.07 ? x.label : ""}</span>`).join("") : `<span style="flex:1">${a ? "to be continued..." : ""}</span>`; });
      q(".o-ph").style.left = Y.prog(vm) * 100 + "%";
      const mx = Y.mix(vm), m = q(".o-mix"); m.style.display = mx ? "block" : "none"; if (mx) { m.style.left = mx.a + "%"; m.style.width = Math.max(1.2, mx.b - mx.a) + "%"; }
      Y.txt(q(".o-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".o-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
