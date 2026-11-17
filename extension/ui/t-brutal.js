// Brutalism: nothing is decorated and nothing is hidden. Hard black rules, one blue, one red, system-raw type. The
// video is a 1-bit ordered dither, the countdown is the biggest thing on the page, the data is a plain table and
// the timeline is typed out in characters.
(() => {
  const Y = window.YTDJ;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const GRIT = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 -.18'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
  function dither(cx, L, W, H, st, rgb) {
    const o = st.o && st.o.width === W ? st.o : (st.o = cx.createImageData(W, H)), d = o.data;
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) { const on = L[i] > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) * 16, j = i * 4;
      d[j] = on ? 255 : rgb[0]; d[j + 1] = on ? 255 : rgb[1]; d[j + 2] = on ? 255 : rgb[2]; d[j + 3] = 255; }
    cx.putImageData(o, 0, 0);
  }
  Y.theme("Brutalism", {
    swatch: ["#e8e6e1", "#0000ff"],
    cls: "bru",
    html: `
      <div class="b-grid">
        <div class="b-marq"><div><span></span><span></span></div></div>
        <button class="b-vid" title="Play or pause"><img alt=""><canvas width="192" height="108"></canvas><b class="b-tag"></b></button>
        <div class="b-count"><p class="b-cl"></p><p class="b-cn"></p><i class="b-ast">✱</i></div>
        <div class="b-title"><h1></h1></div>
        <table class="b-tab"><tbody>
          <tr><th>artist</th><td class="b-sub"></td></tr><tr><th>tempo</th><td class="b-bpm"></td></tr><tr><th>key</th><td class="b-key"></td></tr>
          <tr><th>method</th><td class="b-tech"></td></tr><tr><th>signal</th><td><div class="b-eq"></div></td></tr></tbody></table>
        <div class="b-say"><p class="b-body"></p><div class="b-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="b-act"></button></div>
        <div class="b-next"><canvas width="64" height="48"></canvas><div><p class="b-nl"></p><p class="b-nt"></p><p class="b-ns"></p></div></div>
        <div class="b-bar"><pre></pre><span class="b-time"></span></div>
      </div>`,
    css: `
    .ov[data-theme="Brutalism"] .dock { --dk-font: "Space Mono", monospace; --dk-weight: 700; --dk-size: 12px; --dk-ink: #000; --dk-line: #000; --dk-chip: #fff; --dk-accent: #0000ff; --dk-on: #fff; }
    .ov[data-theme="Brutalism"] .dk-b { border-radius: 0; border-width: 2px; }
    .bru { background: ${GRIT}, #e8e6e1; color: #000; font-family: "Space Mono", monospace; --bw: max(3px, calc(var(--u) * .3)); }
    .bru p, .bru h1 { margin: 0; } .bru canvas, .bru img { image-rendering: pixelated; }
    .b-grid { position: absolute; inset: 60px 3vw 3vh; display: grid; grid-template-columns: calc(var(--u) * 43) 1fr 1fr; grid-template-rows: auto auto 1fr auto auto; border: var(--bw) solid #000; background: #000; gap: var(--bw); }
    .b-grid > * { background: #e8e6e1; min-width: 0; min-height: 0; }
    .b-marq { grid-column: 1 / -1; background: #000 !important; color: #fff; overflow: hidden; height: calc(var(--u) * 2.6); display: flex; align-items: center; }
    .b-marq > div { display: flex; white-space: nowrap; font: 700 calc(var(--u) * 1.15)/1 "Space Mono", monospace; text-transform: uppercase; will-change: transform; } .b-marq span { padding-right: 2em; }
    .b-vid { grid-row: 2 / 4; position: relative; display: block; cursor: pointer; background: #fff !important; overflow: hidden; }
    .b-vid img, .b-vid canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .b-vid img { filter: grayscale(1) contrast(3); }
    .b-tag { position: absolute; left: 0; top: 0; padding: .5em .8em; background: #0000ff; color: #fff; font: 700 calc(var(--u) * .95)/1 "Space Mono", monospace; text-transform: uppercase; }
    .b-vid:hover canvas { filter: invert(1); }
    .b-count { grid-column: 2 / 4; position: relative; padding: calc(var(--u) * 1) calc(var(--u) * 1.4) 0; overflow: hidden; }
    .b-cl { font: 700 calc(var(--u) * 1.15)/1 "Space Mono", monospace; text-transform: uppercase; }
    .b-cn { font: 400 calc(var(--u) * 17)/.86 "Archivo Black", sans-serif; letter-spacing: -.06em; font-variant-numeric: tabular-nums; margin-left: -.04em !important; white-space: nowrap; }
    .b-count[data-mode="text"] .b-cn { font-size: calc(var(--u) * 5); line-height: .92; white-space: normal; text-transform: uppercase; padding: .15em 0 .3em; max-width: 10em; }
    .b-ast { position: absolute; right: calc(var(--u) * 1); top: calc(var(--u) * .4); font: 400 calc(var(--u) * 6)/1 "Archivo Black", sans-serif; color: #0000ff; will-change: transform; transition: transform .16s cubic-bezier(.2,0,0,1); }
    .b-title { grid-column: 2 / 4; padding: calc(var(--u) * .9) calc(var(--u) * 1.4); background: #0000ff !important; color: #fff; display: flex; align-items: center; }
    .b-title h1 { font: 400 calc(var(--u) * 4.4)/.92 "Archivo Black", sans-serif; letter-spacing: -.04em; text-transform: uppercase; overflow-wrap: anywhere; }
    .b-title h1.re { animation: b-fl .08s steps(1) 6; } @keyframes b-fl { 50% { opacity: 0; } }
    .b-tab { grid-column: 1; border-collapse: collapse; width: 100%; height: 100%; font: 400 calc(var(--u) * 1.1)/1.2 "Space Mono", monospace; display: table; }
    .b-tab th, .b-tab td { border-bottom: 2px solid #000; padding: .5em .9em; text-align: left; vertical-align: middle; } .b-tab tr:last-child > * { border-bottom: 0; }
    .b-tab th { width: 7em; border-right: 2px solid #000; text-transform: uppercase; font-weight: 700; }
    .b-eq { display: flex; align-items: flex-end; gap: 2px; height: calc(var(--u) * 2.4); } .b-eq i { flex: 1; background: #000; height: 100%; transform-origin: 50% 100%; }
    .b-say { padding: calc(var(--u) * 1.1) calc(var(--u) * 1.4); position: relative; }
    .b-body { font: 400 calc(var(--u) * 1.5)/1.25 "Times New Roman", Times, serif; text-wrap: pretty; }
    .b-steps { display: flex; gap: 0; margin-top: .8em; border: 2px solid #000; width: max-content; } .b-steps i { width: 26px; height: 16px; border-right: 2px solid #000; } .b-steps i:last-child { border: 0; } .b-steps i[data-s="done"] { background: #000; } .b-steps i[data-s="now"] { background: #ff2a00; animation: b-fl .5s steps(1) infinite; }
    .b-act { margin-top: .9em; padding: .7em 1em; border: var(--bw) solid #000; background: #fff; font: 700 calc(var(--u) * 1)/1 "Space Mono", monospace; text-transform: uppercase; text-decoration: underline; } .b-act:hover { background: #000; color: #fff; }
    .b-next { display: flex; gap: calc(var(--u) * 1.2); padding: calc(var(--u) * 1.1) calc(var(--u) * 1.4); align-items: flex-start; }
    .b-next canvas { width: calc(var(--u) * 9); height: auto; border: 2px solid #000; flex: none; } .b-nl { font: 700 calc(var(--u) * 1)/1 "Space Mono", monospace; text-transform: uppercase; color: #ff2a00; }
    .b-nt { font: 400 calc(var(--u) * 2.1)/.95 "Archivo Black", sans-serif; letter-spacing: -.03em; text-transform: uppercase; margin: .25em 0 !important; overflow-wrap: anywhere; } .b-ns { font: 400 calc(var(--u) * 1)/1.2 "Space Mono", monospace; }
    .b-bar { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 2vw; padding: calc(var(--u) * .7) calc(var(--u) * 1.2); background: #fff !important; overflow: hidden; }
    .b-bar pre { margin: 0; font: 700 calc(var(--u) * 1.32)/1 "Space Mono", monospace; white-space: pre; overflow: hidden; } .b-bar pre b { color: #ff2a00; } .b-bar pre u { color: #0000ff; text-decoration: none; }
    .b-time { font: 700 calc(var(--u) * 1.32)/1 "Space Mono", monospace; white-space: nowrap; }
    @media (max-aspect-ratio: 13/10) { .b-grid { grid-template-columns: 1fr 1fr 1fr; } .b-cn { font-size: calc(var(--u) * 12); } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".b-vid canvas").getContext("2d"), nc: q(".b-next canvas").getContext("2d", { willReadFrequently: true }), mx: 0, ds: {}, ns: {}, beatN: 0, lastPh: 0 };
      q(".b-eq").innerHTML = "<i></i>".repeat(24); st.eq = [...q(".b-eq").children];
      q(".b-vid").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".b-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion;
      const line = `${vm.status} /// ${a ? a.title : "no signal"} /// ${a && a.sub ? a.sub : "youtube dj"} /// `;
      Y.once(st, "marq", line, () => { const d = q(".b-marq > div"); d.children[0].textContent = d.children[1].textContent = line.repeat(2); st.mw = 0; });
      if (!st.mw) st.mw = q(".b-marq span").offsetWidth; st.mx = (st.mx + dt * 70 * mo) % (st.mw || 1);
      q(".b-marq > div").style.transform = `translateX(${(-st.mx).toFixed(1)}px)`;
      if (a) Y.src(q(".b-vid img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const L = Y.lum(192, 108); if (L) dither(st.c, L, 192, 108, st.ds, [0, 0, 0]); else { st.c.drawImage(Y.frame, 0, 0, 192, 108); q(".b-vid canvas").style.filter = "grayscale(1) contrast(4)"; } }
      q(".b-vid canvas").style.opacity = vm.videoOk ? "1" : "0";
      Y.txt(q(".b-tag"), vm.paused ? "paused" : vm.kind === "blending" ? "outgoing" : "on air");
      const cnt = Y.count(vm); q(".b-count").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".b-cl"), vm.eyebrow); Y.txt(q(".b-cn"), cnt || vm.headline);
      st.beatN = Math.floor(vm.beatCount);
      q(".b-ast").style.transform = `rotate(${st.beatN * 22.5 * (mo < 1 ? 0 : 1)}deg)`;
      Y.swap(q(".b-title h1"), a ? a.title : "Nothing is playing");
      Y.txt(q(".b-sub"), a ? a.sub || "unknown" : "n/a"); Y.txt(q(".b-bpm"), a && a.bpm ? `${a.bpm.toFixed(1)} bpm` : "not analysed"); Y.txt(q(".b-key"), a && a.key ? `${a.key} / ${a.cam}` : "not analysed");
      Y.txt(q(".b-tech"), vm.plan ? `${vm.plan.tech}, ${vm.plan.camA} to ${vm.plan.camB}, ${vm.plan.blendLen} s` : vm.step >= 0 ? `${vm.steps[vm.step]} (${vm.step + 1}/6)` : "none planned");
      for (let i = 0; i < 24; i++) st.eq[i].style.transform = `scaleY(${Math.max(0.06, Math.round(Math.min(1, au.bins[i] * 1.25) * 8) / 8)})`;
      Y.txt(q(".b-body"), vm.body); Y.stepDots(q(".b-steps"), vm); Y.showCta(q(".b-act"), vm);
      q(".b-next").style.visibility = b ? "visible" : "hidden";
      if (b) { Y.txt(q(".b-nl"), vm.kind === "blending" ? `incoming ${Math.round(vm.p * 100)}%` : "next"); Y.txt(q(".b-nt"), b.title); Y.txt(q(".b-ns"), Y.meta(b, " / ") || b.sub);
        Y.once(st, "nx", b.thumb, () => Y.img(b.thumb, (im) => { const k = im.naturalHeight / 360; st.nc.drawImage(im, 60 * k, 45 * k, 360 * k, 270 * k, 0, 0, 64, 48);
          try { const d = st.nc.getImageData(0, 0, 64, 48).data, L = new Uint8Array(3072); for (let i = 0; i < 3072; i++) L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11; dither(st.nc, L, 64, 48, st.ns, [0, 0, 255]); } catch (_) {} })); }
      const N = 72, pi = Math.floor(Y.prog(vm) * N), mx = Y.mix(vm);
      Y.once(st, "bar", pi + "|" + (mx ? mx.a : ""), () => { let s = "["; for (let i = 0; i < N; i++) { const c = ((i + 0.5) / N) * 100; s += i === pi ? "<u>|</u>" : mx && c >= mx.a - 0.7 && c <= mx.b + 0.7 ? "<b>X</b>" : i < pi ? "#" : "."; } q(".b-bar pre").innerHTML = s + "]"; });
      Y.txt(q(".b-time"), vm.dur ? `${Y.fmt(vm.time)} / ${Y.fmt(vm.dur)}` : "0:00 / ?");
    },
  });
})();
