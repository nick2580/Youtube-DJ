// Dark Magic Academia: an open grimoire on a desk at night. The left page holds an enchanted, moving engraving of
// the video; the right page foretells the song that follows inside a turning alchemical circle; two candles flicker
// with the music, embers drift, and the song's progress is a line of runes catching light.
(() => {
  const Y = window.YTDJ;
  const VELLUM = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='5' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .36  0 0 0 0 .22  0 0 0 0 .08  .9 0 0 0 -.36'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
  const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᚠᚢᚦᚨᚱᚲᚷᚹ";
  const candle = (c) => `<div class="d-candle ${c}"><i class="d-glow"></i><i class="d-flame"></i><i class="d-wick"></i><i class="d-wax"></i></div>`;
  Y.theme("Dark Magic Academia", {
    swatch: ["#1a120c", "#c9a24a"],
    cls: "dma",
    html: `
      <div class="d-desk"></div><canvas class="d-embers"></canvas>${candle("l")}${candle("r")}
      <div class="d-book">
        <article class="d-page d-pl"><p class="d-run"></p>
          <button class="d-plate" title="Play or pause"><img alt=""><canvas width="320" height="240"></canvas><i class="d-hatch"></i></button>
          <p class="d-fig"></p><h1 class="d-title"><b></b><span></span></h1><p class="d-sub"></p></article>
        <article class="d-page d-pr"><p class="d-run">Of the song that follows</p>
          <div class="d-circle"><svg viewBox="-100 -100 200 200"><g class="d-rot"><circle r="92"/><circle r="78"/><path d="M0 -78 L67.5 39 L-67.5 39Z"/><path d="M0 78 L67.5 -39 L-67.5 -39Z"/>
              ${Array.from({ length: 12 }, (_, i) => `<text transform="rotate(${i * 30}) translate(0 -81.5)" text-anchor="middle">${RUNES[i * 2]}</text>`).join("")}</g>
            <circle class="d-arc0" r="50"/><circle class="d-arc" r="50" pathLength="100" transform="rotate(-90)"/></svg>
            <div class="d-cc"><p class="d-cl"></p><p class="d-cn"></p></div></div>
          <div class="d-next"><img alt=""><div><p class="d-nt"></p><p class="d-ns"></p></div></div>
          <p class="d-body"></p><div class="d-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="d-act"></button></article>
        <i class="d-spine"></i><i class="d-ribbon"></i>
      </div>
      <footer class="d-tl"><span class="d-t0"></span><div class="d-runes"></div><span class="d-t1"></span></footer>`,
    css: `
    .ov[data-theme="Dark Magic Academia"] .dock { --dk-font: "Cinzel", serif; --dk-size: 11.5px; --dk-track: .1em; --dk-ink: #e6d2a2; --dk-line: rgba(201,162,74,.5); --dk-chip: rgba(201,162,74,.16); --dk-accent: #c9a24a; --dk-on: #1a120c; }
    .dma { background: #0e0906; color: #2a1c10; font-family: "IM Fell English", "Cormorant Garamond", serif; }
    .dma p, .dma h1 { margin: 0; font-weight: 400; }
    .d-desk { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 55%, rgba(120,70,30,.5), transparent 70%), repeating-linear-gradient(92deg, rgba(0,0,0,.25) 0 2px, transparent 2px 46px), linear-gradient(180deg, #1c120b, #100a06); }
    .d-embers { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; }
    .d-candle { position: absolute; bottom: 9vh; width: calc(var(--u) * 4.4); height: calc(var(--u) * 20); z-index: 3; } .d-candle.l { left: 4.5vw; } .d-candle.r { right: 4.5vw; height: calc(var(--u) * 14); }
    .d-wax { position: absolute; left: 0; right: 0; bottom: 0; top: calc(var(--u) * 6); border-radius: calc(var(--u) * .7) calc(var(--u) * .7) 3px 3px; background: linear-gradient(90deg, #6f6249, #e9dcbc 35%, #cbbd9a 70%, #5c4f3a); box-shadow: inset 0 calc(var(--u) * 1.4) calc(var(--u) * 1.2) rgba(255,190,90,.5); }
    .d-wick { position: absolute; left: 50%; top: calc(var(--u) * 4.9); width: 2px; height: calc(var(--u) * 1.2); margin-left: -1px; background: #1a120c; }
    .d-flame { position: absolute; left: 50%; top: calc(var(--u) * .6); width: calc(var(--u) * 2.2); height: calc(var(--u) * 4.6); margin-left: calc(var(--u) * -1.1); border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%; background: radial-gradient(ellipse at 50% 78%, #fff 0 16%, #ffe07a 34%, #ff9a2a 62%, rgba(255,90,0,0) 80%); transform-origin: 50% 100%; will-change: transform; filter: blur(.6px); }
    .d-glow { position: absolute; left: 50%; top: calc(var(--u) * 3); width: 60vw; height: 60vw; margin: -30vw; border-radius: 50%; background: radial-gradient(circle, rgba(255,170,70,.34), rgba(255,140,40,.1) 34%, transparent 62%); will-change: opacity, transform; pointer-events: none; }
    .d-book { position: absolute; left: 50%; top: calc(60px + 2vh); width: calc(var(--u) * 78); height: calc(var(--u) * 44); margin-left: calc(var(--u) * -39); display: grid; grid-template-columns: 1fr 1fr; z-index: 2; filter: drop-shadow(0 calc(var(--u) * 2.4) calc(var(--u) * 2.6) rgba(0,0,0,.85)); will-change: transform; }
    .d-book::before { content: ""; position: absolute; inset: calc(var(--u) * -.9) calc(var(--u) * -1.1) calc(var(--u) * -1.3); background: linear-gradient(90deg, #2c160d, #4a2415 48%, #1a0c06 50%, #4a2415 52%, #2c160d); border-radius: calc(var(--u) * .7); box-shadow: inset 0 0 0 2px #7a5a22; z-index: -1; }
    .d-page { position: relative; padding: calc(var(--u) * 2.4) calc(var(--u) * 3.4) calc(var(--u) * 2); background: ${VELLUM}, #e2cfa2; display: flex; flex-direction: column; align-items: center; text-align: center; overflow: hidden; }
    .d-pl { border-radius: calc(var(--u) * .5) 0 0 calc(var(--u) * .5); box-shadow: inset calc(var(--u) * -5) 0 calc(var(--u) * 4) calc(var(--u) * -3) rgba(60,30,10,.6), inset 0 0 calc(var(--u) * 4) rgba(90,50,10,.4); }
    .d-pr { border-radius: 0 calc(var(--u) * .5) calc(var(--u) * .5) 0; box-shadow: inset calc(var(--u) * 5) 0 calc(var(--u) * 4) calc(var(--u) * -3) rgba(60,30,10,.6), inset 0 0 calc(var(--u) * 4) rgba(90,50,10,.4); background-position: 60% 30%; }
    .d-spine { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: rgba(40,20,5,.7); } .d-ribbon { position: absolute; left: 53%; top: calc(var(--u) * -.9); width: calc(var(--u) * 1.3); height: calc(100% + var(--u) * 4); background: linear-gradient(90deg, #6b0f17, #a31b26, #6b0f17); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 97%, 0 100%); transform-origin: 50% 0; will-change: transform; }
    .d-run { font: 400 clamp(11px, calc(var(--u) * .95), 15px)/1 "Cinzel", serif; letter-spacing: .26em; text-transform: uppercase; color: #6a4a1c; margin-bottom: calc(var(--u) * 1.3) !important; }
    .d-plate { position: relative; display: block; width: calc(var(--u) * 29); aspect-ratio: 4/3; cursor: pointer; overflow: hidden; border-radius: 50% 50% 4px 4px / 34% 34% 4px 4px; box-shadow: 0 0 0 2px #3a2410, 0 0 0 calc(var(--u) * .5) #d9c08a, 0 0 0 calc(var(--u) * .6) #7a5a22, 0 0 0 calc(var(--u) * .9) #3a2410; background: #3a2410; }
    .d-plate img, .d-plate canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) sepia(.85) contrast(1.25) brightness(.92); } .d-plate img { transform: scale(1.34); } .d-plate canvas { transition: opacity 1.4s; }
    .d-hatch { position: absolute; inset: 0; background: repeating-linear-gradient(48deg, rgba(40,22,6,.3) 0 1px, transparent 1px 3px), repeating-linear-gradient(-48deg, rgba(40,22,6,.16) 0 1px, transparent 1px 4px), radial-gradient(ellipse, transparent 48%, rgba(40,20,5,.75)); mix-blend-mode: multiply; }
    .d-fig { margin-top: calc(var(--u) * 1.5) !important; font: italic 400 clamp(13px, calc(var(--u) * 1.1), 17px)/1 "IM Fell English", serif; color: #5a3d18; }
    .d-title { margin-top: calc(var(--u) * .9) !important; display: flex; align-items: flex-start; justify-content: center; gap: .14em; font: italic 400 calc(var(--u) * 3.6)/1.02 "IM Fell English", serif; color: #24160a; text-align: left; text-wrap: balance; }
    .d-title b { flex: none; display: grid; place-items: center; width: 1.25em; height: 1.25em; margin-top: -.06em; font: 600 1em/1 "Cinzel", serif; color: #f1dc9c; background: radial-gradient(circle at 30% 25%, #9c1f2a, #5a0d14); box-shadow: 0 0 0 2px #c9a24a, 0 0 0 3px #3a2410; }
    .d-title.re span, .d-nt.re { animation: d-ink 1.8s ease both; } @keyframes d-ink { from { opacity: 0; filter: blur(5px); } }
    .d-sub { margin-top: calc(var(--u) * .8) !important; font: 400 clamp(14px, calc(var(--u) * 1.25), 19px)/1.25 "IM Fell English", serif; color: #4a3115; }
    .d-circle { position: relative; width: calc(var(--u) * 19); height: calc(var(--u) * 19); flex: none; } .d-circle svg { position: absolute; inset: 0; overflow: visible; }
    .d-circle svg * { fill: none; stroke: #4a2f10; stroke-width: .9; } .d-circle text { fill: #6a4a1c !important; stroke: none !important; font: 9px "Segoe UI Historic", "Segoe UI Symbol", serif; } .d-rot { will-change: transform; transform-origin: 0 0; }
    .d-arc0 { stroke: rgba(74,47,16,.3) !important; } .d-arc { stroke: #9c1f2a !important; stroke-width: 3 !important; stroke-linecap: round; stroke-dasharray: 0 100; }
    .d-cc { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; } .d-cl { font: italic 400 clamp(12px, calc(var(--u) * 1), 16px)/1 "IM Fell English", serif; color: #6b0f17; }
    .d-cn { font: 400 calc(var(--u) * 3.1)/1 "Cinzel", serif; color: #24160a; font-variant-numeric: tabular-nums; } .d-circle[data-mode="text"] .d-cn { font: italic 400 calc(var(--u) * 1.15)/1.1 "IM Fell English", serif; max-width: 6.5em; }
    .d-next { display: flex; align-items: center; gap: calc(var(--u) * 1.2); margin-top: calc(var(--u) * 1.3); text-align: left; } .d-next img { width: calc(var(--u) * 6); height: calc(var(--u) * 6); border-radius: 50%; object-fit: cover; filter: grayscale(1) sepia(.9) contrast(1.2); box-shadow: 0 0 0 2px #3a2410, 0 0 0 5px #d9c08a, 0 0 0 6px #7a5a22; flex: none; }
    .d-nt { font: italic 400 calc(var(--u) * 2.3)/1.02 "IM Fell English", serif; color: #24160a; } .d-ns { font: 400 clamp(12px, calc(var(--u) * 1.05), 16px)/1.25 "IM Fell English", serif; color: #5a3d18; margin-top: 3px !important; }
    .d-body { margin-top: calc(var(--u) * 1.2) !important; font: 400 clamp(13px, calc(var(--u) * 1.2), 18px)/1.34 "IM Fell English", serif; color: #33200e; text-wrap: pretty; text-align: left; }
    .d-body::first-letter { font: 600 1.9em/1 "Cinzel", serif; color: #6b0f17; float: left; padding: .06em .12em 0 0; }
    .d-steps { display: flex; gap: 8px; margin-top: 10px; } .d-steps i { width: 15px; height: 15px; border-radius: 50%; border: 1.5px solid #4a2f10; } .d-steps i[data-s="done"] { background: #4a2f10; } .d-steps i[data-s="now"] { background: linear-gradient(90deg, #4a2f10 50%, #f1dc9c 50%); box-shadow: 0 0 10px #ffb84a; }
    .d-act { margin-top: 10px; padding: 8px 16px; border: 1.5px solid #6b0f17; color: #6b0f17; font: 600 11px/1 "Cinzel", serif; letter-spacing: .14em; text-transform: uppercase; } .d-act:hover { background: #6b0f17; color: #f1dc9c; }
    .d-tl { position: absolute; left: 12vw; right: 12vw; bottom: 3.6vh; display: flex; align-items: center; gap: 16px; z-index: 4; font: 400 clamp(12px, calc(var(--u) * 1), 16px)/1 "Cinzel", serif; color: #c9a24a; font-variant-numeric: tabular-nums; }
    .d-runes { flex: 1; display: flex; justify-content: space-between; font: 400 calc(var(--u) * 1.5)/1 "Segoe UI Historic", "Segoe UI Symbol", serif; } .d-runes i { color: rgba(201,162,74,.28); transition: color .8s, text-shadow .8s; } .d-runes i.on { color: #f3d98a; text-shadow: 0 0 10px #ff9a2a; } .d-runes i.hd { color: #fff; text-shadow: 0 0 14px #ffd27a, 0 0 30px #ff9a2a; } .d-runes i.mx { color: #c0303c; } .d-runes i.mx.on { color: #ff6b76; text-shadow: 0 0 12px #c0303c; }
    @media (max-aspect-ratio: 13/10) { .d-candle { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".d-plate canvas").getContext("2d"), rot: 0, em: Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, p: Math.random() * 6.28, r: 0.6 + Math.random() * 1.6 })) };
      q(".d-runes").innerHTML = [...RUNES].map((r) => `<i>${r}</i>`).join("");
      q(".d-plate").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".d-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p), fl = Y.flash(vm);
      // candlelight
      st.el.querySelectorAll(".d-candle").forEach((c, i) => { const f = 0.5 + 0.5 * Math.sin(now / (90 + i * 23)) * Math.sin(now / (310 + i * 70)), k = (vm.paused ? 0.1 : au.level) * mo;
        c.querySelector(".d-flame").style.transform = `scale(${(1 + f * 0.06 + k * 0.25).toFixed(3)},${(1 + f * 0.12 + k * 0.5 + fl * 0.4).toFixed(3)}) rotate(${((f - 0.5) * 9 * (1 + k * 2)).toFixed(2)}deg)`;
        const g = c.querySelector(".d-glow"); g.style.opacity = (0.62 + f * 0.14 + k * 0.5 + fl * 0.3).toFixed(3); g.style.transform = `scale(${(1 + k * 0.25 + pe * 0.15).toFixed(3)})`; });
      q(".d-book").style.transform = `translate(${(Y.mouse.x * -6).toFixed(1)}px,${(Y.mouse.y * -4).toFixed(1)}px)`;
      q(".d-ribbon").style.transform = `rotate(${(Math.sin(now / 2100) * 0.8 * mo).toFixed(2)}deg)`;
      // left page
      if (a) Y.src(q(".d-plate img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.c, Y.frame, 320, 180, 320, 240); }
      q(".d-plate canvas").style.opacity = vm.videoOk ? "1" : "0";
      Y.txt(q(".d-pl .d-run"), vm.paused ? "The music sleeps" : vm.kind === "blending" ? "A song departing" : "The song now sounding");
      Y.txt(q(".d-fig"), "Plate I. A likeness that moves of its own accord");
      const title = a ? a.title : "Silence";
      Y.once(st, "title", title, () => { q(".d-title b").textContent = title[0].toUpperCase(); q(".d-title span").textContent = title.slice(1); const h = q(".d-title"); h.style.fontSize = `calc(var(--u) * ${title.length > 26 ? 2.3 : title.length > 15 ? 2.9 : 3.6})`; h.classList.remove("re"); void h.offsetWidth; h.classList.add("re"); });
      Y.txt(q(".d-sub"), a ? [a.sub, a.bpm ? `${Math.round(a.bpm)} beats to the minute, in ${a.key}` : ""].filter(Boolean).join(". ") : "Open a YouTube Mix and the page will fill.");
      // right page
      st.rot = (st.rot + dt * (4 + au.level * 18 + pe * 60) * (vm.paused ? 0.1 : 1) * mo) % 360; q(".d-rot").style.transform = `rotate(${st.rot.toFixed(2)}deg)`;
      const cnt = Y.count(vm); q(".d-circle").dataset.mode = cnt ? "count" : "text";
      let frac = Y.prog(vm); if (vm.kind === "blending") frac = vm.p; else if (vm.kind === "armed" && cnt) { if (st.cd0 == null || vm.countdown > st.cd0) st.cd0 = Math.max(1, vm.countdown); frac = 1 - vm.countdown / st.cd0; } if (vm.kind !== "armed") st.cd0 = null;
      q(".d-arc").style.strokeDasharray = `${(frac * 100).toFixed(2)} 100`;
      Y.txt(q(".d-cl"), cnt ? (vm.paused ? "stayed at" : vm.kind === "blending" ? "it is bound in" : "the binding in") : vm.eyebrow.toLowerCase()); Y.txt(q(".d-cn"), cnt || vm.headline);
      const nx = q(".d-next"); nx.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(nx.querySelector("img"), b.thumb); Y.swap(q(".d-nt"), b.title); Y.txt(q(".d-ns"), Y.meta(b, ", ") || b.sub); }
      Y.txt(q(".d-body"), vm.step >= 0 ? `The next song is being divined: ${vm.steps[vm.step]}.` : vm.plan && cnt ? `${vm.body} By ${vm.plan.tech.toLowerCase()}, ${vm.plan.camA} unto ${vm.plan.camB}.` : vm.body);
      Y.stepDots(q(".d-steps"), vm); Y.showCta(q(".d-act"), vm);
      // runes
      const N = RUNES.length, pi = Math.floor(Y.prog(vm) * N), mx = Y.mix(vm);
      Y.once(st, "runes", pi + "|" + (mx ? mx.a : ""), () => [...q(".d-runes").children].forEach((e, i) => { const c = ((i + 0.5) / N) * 100; e.className = (i < pi ? "on " : i === pi ? "hd " : "") + (mx && c >= mx.a - 1.6 && c <= mx.b + 1.6 ? "mx" : ""); }));
      Y.txt(q(".d-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".d-t1"), vm.dur ? Y.fmt(vm.dur) : "");
      // embers
      const cv = q(".d-embers"); if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
      const g = st.g || (st.g = cv.getContext("2d")); g.clearRect(0, 0, cv.width, cv.height);
      for (const e of st.em) { e.p += dt * 2; e.y -= e.v * dt * mo * (1 + au.level * 3); e.x += Math.sin(e.p) * 0.0009 * mo; if (e.y < -0.02) { e.y = 1.02; e.x = Math.random(); }
        g.fillStyle = `rgba(255,${150 + (e.r * 40 | 0)},70,${(0.15 + 0.55 * Math.abs(Math.sin(e.p * 0.7))).toFixed(3)})`; g.beginPath(); g.arc(e.x * cv.width, e.y * cv.height, e.r, 0, 6.283); g.fill(); }
    },
  });
})();
