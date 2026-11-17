// Pointillism: the video is never shown, only painted. Thousands of small dabs of slightly-wrong colour are laid
// down a few hundred at a time, so the picture is always catching up with the film, in a gilt frame on a gallery
// wall. The next song is a smaller canvas beside it, the labels are museum placards, the timeline is a row of dots.
(() => {
  const Y = window.YTDJ;
  const dab = (c, d, W, H, n, cw, ch, size) => { for (let k = 0; k < n; k++) { const x = Math.random(), y = Math.random(), i = (((y * H) | 0) * W + ((x * W) | 0)) * 4, j = 34;
    const r = d[i] * 1.08 + (Math.random() - 0.5) * j, g = d[i + 1] * 1.08 + (Math.random() - 0.5) * j, b = d[i + 2] * 1.08 + (Math.random() - 0.5) * j * 1.4;
    c.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`; c.beginPath(); c.arc(x * cw, y * ch, size * (0.7 + Math.random() * 0.7), 0, 6.283); c.fill(); } };
  const SEC = { chorus: "#e07b39", verse: "#3f78b5", bridge: "#8a5aa8", intro: "#6f9a5b", outro: "#6f9a5b" };
  Y.theme("Pointillism", {
    swatch: ["#7d8f76", "#e0b23c"],
    cls: "pnt",
    html: `
      <div class="q-wall"></div><div class="q-light"></div><div class="q-rail"></div>
      <div class="q-main"><button class="q-frame" title="Play or pause"><canvas width="720" height="450"></canvas></button>
        <div class="q-card"><p class="q-title"></p><p class="q-sub"></p><p class="q-med"></p></div></div>
      <div class="q-side"><div class="q-frame q-small"><canvas width="240" height="240"></canvas></div>
        <div class="q-card"><p class="q-nl"></p><p class="q-nt"></p><p class="q-ns"></p></div>
        <div class="q-card q-note"><p class="q-cl"></p><p class="q-cn"></p><p class="q-body"></p><div class="q-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="q-act"></button></div></div>
      <footer class="q-tl"><span class="q-t0"></span><div class="q-dots"></div><span class="q-t1"></span></footer>`,
    css: `
    .ov[data-theme="Pointillism"] .dock { --dk-font: "Jost", sans-serif; --dk-size: 13px; --dk-ink: #f4efe2; --dk-line: rgba(244,239,226,.45); --dk-chip: rgba(244,239,226,.16); --dk-accent: #e0b23c; --dk-on: #2c3327; }
    .pnt { background: #74856d; color: #2a2a26; font-family: "Jost", sans-serif; }
    .pnt p { margin: 0; }
    .q-wall { position: absolute; inset: -30px; background: radial-gradient(circle, rgba(255,240,190,.2) 0 2px, transparent 3px) 0 0/17px 17px, radial-gradient(circle, rgba(40,60,90,.16) 0 2px, transparent 3px) 8px 9px/17px 17px, radial-gradient(circle, rgba(200,110,60,.12) 0 2px, transparent 3px) 4px 13px/23px 23px, linear-gradient(180deg, #82937a, #66775f); will-change: transform; }
    .q-light { position: absolute; left: 6vw; top: -10vh; width: 62vw; height: 110vh; background: radial-gradient(ellipse 50% 60% at 50% 42%, rgba(255,244,214,.42), transparent 70%); pointer-events: none; will-change: opacity; }
    .q-rail { position: absolute; left: 0; right: 0; bottom: 12.5vh; height: calc(var(--u) * .9); background: linear-gradient(#f1ece0, #cfc8b6); box-shadow: 0 6px 14px rgba(20,30,15,.35); }
    .q-frame { display: block; padding: calc(var(--u) * 1.5); cursor: pointer; background: linear-gradient(135deg, #f6e3a0, #c9972c 26%, #7d5a14 50%, #e0b23c 72%, #8f6a1c); box-shadow: inset 0 0 0 2px #5a3f0c, inset 0 0 0 calc(var(--u) * .5) #e9c665, inset 0 0 0 calc(var(--u) * .62) #5a3f0c, inset 0 0 0 calc(var(--u) * 1.2) #b98a26, inset 0 0 0 calc(var(--u) * 1.5) #3d2a07, calc(var(--u) * 1) calc(var(--u) * 1.8) calc(var(--u) * 3) rgba(20,30,15,.55); }
    .q-frame canvas { display: block; width: 100%; height: auto; background: #e9e2cf; }
    .q-main { position: absolute; left: 7vw; top: calc(60px + 3vh); width: calc(var(--u) * 56); z-index: 2; }
    .q-card { margin-top: calc(var(--u) * 1.6); padding: calc(var(--u) * 1) calc(var(--u) * 1.3); background: #f8f5ec; box-shadow: 2px 3px 8px rgba(20,30,15,.35); max-width: calc(var(--u) * 28); }
    .q-title, .q-nt { font: 600 calc(var(--u) * 1.9)/1.1 "Jost", sans-serif; letter-spacing: -.01em; } .q-title.re, .q-nt.re { animation: q-in 1.2s ease both; } @keyframes q-in { from { opacity: 0; } }
    .q-sub, .q-ns { margin-top: 4px !important; font: 400 clamp(13px, calc(var(--u) * 1.1), 17px)/1.3 "Jost", sans-serif; } .q-med { margin-top: 6px !important; font: italic 500 clamp(13px, calc(var(--u) * 1.15), 18px)/1.25 "Cormorant Garamond", serif; color: #5c5a50; }
    .q-side { position: absolute; right: 6vw; top: calc(60px + 3vh); width: calc(var(--u) * 24); z-index: 2; } .q-small { width: calc(var(--u) * 17); padding: calc(var(--u) * 1.1); cursor: default; will-change: transform; transform-origin: 50% 0; }
    .q-nl, .q-cl { font: 500 clamp(11px, calc(var(--u) * .9), 14px)/1 "Jost", sans-serif; letter-spacing: .06em; color: #8a5a1c; margin-bottom: 5px !important; } .q-nt { font-size: calc(var(--u) * 1.6); }
    .q-cn { font: 300 calc(var(--u) * 4)/1 "Jost", sans-serif; letter-spacing: -.03em; font-variant-numeric: tabular-nums; margin: 2px 0 6px !important; } .q-note[data-mode="text"] .q-cn { font: 600 calc(var(--u) * 1.6)/1.1 "Jost", sans-serif; letter-spacing: -.01em; }
    .q-body { font: italic 500 clamp(14px, calc(var(--u) * 1.25), 19px)/1.3 "Cormorant Garamond", serif; text-wrap: pretty; }
    .q-steps { display: flex; gap: 7px; margin-top: 9px; } .q-steps i { width: 11px; height: 11px; border-radius: 50%; background: #d8d2c2; } .q-steps i[data-s="done"] { background: #3f78b5; } .q-steps i[data-s="now"] { background: #e07b39; box-shadow: 5px 0 0 -2px #e0b23c, -5px 0 0 -2px #3f78b5; }
    .q-act { margin-top: 10px; padding: 8px 15px; background: #2a2a26; color: #f8f5ec; font: 500 13px/1 "Jost", sans-serif; } .q-act:hover { background: #8a5a1c; }
    .q-tl { position: absolute; left: 7vw; right: 6vw; bottom: 4.6vh; display: flex; align-items: center; gap: 14px; z-index: 3; font: 500 clamp(12px, calc(var(--u) * 1), 15px)/1 "Jost", sans-serif; color: #f4efe2; font-variant-numeric: tabular-nums; }
    .q-dots { flex: 1; display: flex; align-items: center; justify-content: space-between; height: 26px; } .q-dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--c, #6f9a5b); opacity: .42; transform: scale(.6); transition: transform .5s, opacity .5s; }
    .q-dots i.on { opacity: 1; transform: scale(1); } .q-dots i.hd { opacity: 1; transform: scale(1.9); box-shadow: 0 0 0 2px #f8f5ec; } .q-dots i.mx { box-shadow: 0 0 0 2px #c0303c; opacity: .95; }
    @media (max-aspect-ratio: 13/10) { .q-main { width: 62vw; } .q-side { width: 26vw; } .q-note { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".q-main canvas").getContext("2d"), nc: q(".q-small canvas").getContext("2d"), px: null, npx: null, spx: null };
      q(".q-dots").innerHTML = "<i></i>".repeat(64);
      q(".q-main .q-frame").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".q-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p);
      q(".q-wall").style.transform = `translate(${(Math.sin(now / 9000) * 8 * mo).toFixed(1)}px,${(Math.cos(now / 11000) * 8 * mo).toFixed(1)}px)`;
      q(".q-light").style.opacity = (0.8 + au.level * 0.25).toFixed(3);
      // the painting: a few hundred new dabs each frame, sampled from the film (or the cover while there is no film)
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const d = Y.pixels(160, 100); if (d) st.px = d.slice ? d.slice() : d; else if (!st.flat) { st.flat = true; q(".q-main canvas").style.cssText += "-webkit-mask:radial-gradient(circle,#000 0 2.4px,transparent 3px) 0 0/6px 6px;"; } }
      if (!vm.videoOk && a) Y.once(st, "still", a.thumb, () => Y.img(a.thumb, (im) => { const t = document.createElement("canvas"); t.width = 160; t.height = 100; const tc = t.getContext("2d", { willReadFrequently: true }), k = im.naturalHeight / 360; tc.drawImage(im, 24 * k, 45 * k, 432 * k, 270 * k, 0, 0, 160, 100); try { st.spx = tc.getImageData(0, 0, 160, 100).data; } catch (_) {} }));
      const src = vm.videoOk ? st.px : st.spx;
      if (src && !st.primed) { st.primed = true; dab(st.c, src, 160, 100, 7000, 720, 450, 4.6); }
      if (st.flat && vm.videoOk) Y.cover(st.c, Y.frame, 320, 180, 720, 450);
      else if (src) dab(st.c, src, 160, 100, Math.round((260 + au.level * 900 + Y.flash(vm) * 1200) * (vm.paused ? 0.25 : 1) * Math.max(0.3, mo)), 720, 450, 4.2);
      Y.swap(q(".q-title"), a ? a.title : "Untitled (silence)"); Y.txt(q(".q-sub"), a ? a.sub : "Awaiting a YouTube Mix");
      Y.txt(q(".q-med"), a ? `Light on screen, painted in dots as it plays${a.bpm ? `. ${Math.round(a.bpm)} bpm, ${a.key}` : ""}` : "");
      // next canvas
      const side = q(".q-small"); side.parentElement.querySelector(".q-card").style.visibility = side.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.once(st, "nx", b.thumb, () => { st.npx = null; Y.img(b.thumb, (im) => { const t = document.createElement("canvas"); t.width = 80; t.height = 80; const tc = t.getContext("2d", { willReadFrequently: true }), k = im.naturalHeight / 360; tc.drawImage(im, 105 * k, 45 * k, 270 * k, 270 * k, 0, 0, 80, 80); try { st.npx = tc.getImageData(0, 0, 80, 80).data; st.nc.fillStyle = "#e9e2cf"; st.nc.fillRect(0, 0, 240, 240); dab(st.nc, st.npx, 80, 80, 2600, 240, 240, 3.4); } catch (_) {} }); });
        if (st.npx) dab(st.nc, st.npx, 80, 80, 14 + Math.round(pe * 120), 240, 240, 3.4);
        Y.txt(q(".q-nl"), vm.kind === "blending" ? "Being hung now" : "Next in the room"); Y.swap(q(".q-nt"), b.title); Y.txt(q(".q-ns"), Y.meta(b, ", ") || b.sub);
        side.style.transform = `rotate(${(Math.sin(now / 2600) * 0.5 * mo).toFixed(2)}deg) scale(${(1 + pe * 0.1).toFixed(3)})`; }
      const cnt = Y.count(vm); q(".q-note").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".q-cl"), cnt ? (vm.paused ? "Paused at" : vm.kind === "blending" ? "The new picture settles in" : "The pictures merge in") : vm.eyebrow); Y.txt(q(".q-cn"), cnt || vm.headline);
      Y.txt(q(".q-body"), vm.step >= 0 ? `Studying the next picture: ${vm.steps[vm.step]}.` : vm.body); Y.stepDots(q(".q-steps"), vm); Y.showCta(q(".q-act"), vm);
      // dotted timeline
      const N = 64, pi = Math.floor(Y.prog(vm) * N), secs = Y.sections(vm), mx = Y.mix(vm);
      Y.once(st, "tl", `${pi}|${secs.length}|${mx ? mx.a : ""}`, () => [...q(".q-dots").children].forEach((e, i) => { const c = (i + 0.5) / N, s = secs.find((x) => c >= x.a && c < x.b);
        e.style.setProperty("--c", s ? SEC[s.label] || "#6f9a5b" : "#d8d2c2"); e.className = (i < pi ? "on " : i === pi ? "hd " : "") + (mx && c * 100 >= mx.a - 0.8 && c * 100 <= mx.b + 0.8 ? "mx" : ""); }));
      Y.txt(q(".q-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".q-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
