// Japandi: a quiet room. The video moves as soft colour behind a shoji screen, the song's progress is an ensō
// brushed around the countdown, the next song hangs as a scroll, a branch sways with the music and leaf shadows
// cross the wall. One red seal marks where the blend begins.
(() => {
  const Y = window.YTDJ;
  const WASHI = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.04 .5' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .22  0 0 0 .22 -.06'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
  Y.theme("Japandi", {
    swatch: ["#ebe4d6", "#b9946a"],
    cls: "jpd",
    html: `
      <svg width="0" height="0"><filter id="j-brush" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9 .08" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></svg>
      <div class="j-wall"></div><div class="j-sun"></div><div class="j-leaves"><i></i><i></i><i></i><i></i><i></i></div><div class="j-floor"></div>
      <button class="j-shoji" title="Play or pause"><img alt=""><canvas width="320" height="200"></canvas><i class="j-paper"></i><i class="j-grid"></i></button>
      <div class="j-text"><p class="j-eb"></p><h1 class="j-title"></h1><p class="j-sub"></p></div>
      <svg class="j-branch" viewBox="0 0 200 320"><g class="j-sway"><path class="j-stem" d="M96 300 C92 230 70 180 84 120 C92 86 120 60 132 18"/><path class="j-stem" d="M84 150 C60 130 44 118 30 86"/><path class="j-stem" d="M92 104 C112 96 134 96 158 78"/>
        <g class="j-leaf"><ellipse cx="132" cy="14" rx="7" ry="15" transform="rotate(20 132 14)"/><ellipse cx="28" cy="80" rx="7" ry="15" transform="rotate(-30 28 80)"/><ellipse cx="162" cy="74" rx="7" ry="15" transform="rotate(62 162 74)"/><ellipse cx="62" cy="126" rx="6" ry="12" transform="rotate(-58 62 126)"/><ellipse cx="118" cy="56" rx="6" ry="12" transform="rotate(48 118 56)"/><ellipse cx="124" cy="94" rx="5" ry="11" transform="rotate(74 124 94)"/></g></g>
        <path class="j-vase" d="M70 300 C60 262 82 250 84 232 H110 C112 250 134 262 124 300 Z"/></svg>
      <div class="j-enso"><svg viewBox="0 0 200 200"><circle class="j-e0" cx="100" cy="100" r="84"/><circle class="j-e1" cx="100" cy="100" r="84" pathLength="100"/></svg>
        <div class="j-ec"><p class="j-cl"></p><p class="j-cn"></p></div></div>
      <div class="j-note"><p class="j-body"></p><div class="j-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="j-act"></button></div>
      <div class="j-scroll"><i class="j-rod"></i><div class="j-sp"><img alt=""><p class="j-nt"></p><b class="j-seal">次</b></div><i class="j-rod"></i><p class="j-nl"></p><p class="j-ns"></p></div>
      <footer class="j-tl"><span class="j-t0"></span><div class="j-line"><div class="j-secs"></div><i class="j-mix"></i><i class="j-dot"></i></div><span class="j-t1"></span></footer>`,
    css: `
    .ov[data-theme="Japandi"] .dock { --dk-font: "Jost", sans-serif; --dk-weight: 400; --dk-size: 12.5px; --dk-track: .1em; --dk-ink: #2b2a27; --dk-line: rgba(43,42,39,.28); --dk-chip: rgba(43,42,39,.07); --dk-accent: #2b2a27; --dk-on: #ebe4d6; }
    .jpd { background: #ebe4d6; color: #2b2a27; font-family: "Jost", sans-serif; }
    .jpd p, .jpd h1 { margin: 0; }
    .j-wall { position: absolute; inset: 0; background: ${WASHI}, linear-gradient(180deg, #efe9dc, #e6dece); }
    .j-sun { position: absolute; left: 0; top: 0; width: 44vw; height: 120vh; background: linear-gradient(90deg, transparent, rgba(255,246,222,.75) 30%, rgba(255,246,222,.75) 70%, transparent); transform-origin: 0 0; will-change: transform; filter: blur(14px); }
    .j-leaves i { position: absolute; left: 0; top: 0; width: 12vw; height: 5vw; border-radius: 100% 0 100% 0; background: rgba(60,58,40,.1); filter: blur(7px); will-change: transform; }
    .j-floor { position: absolute; left: 0; right: 0; bottom: 0; height: 15vh; background: repeating-linear-gradient(90deg, transparent 0 22vw, rgba(90,62,30,.18) 22vw calc(22vw + 1px)), linear-gradient(180deg, #c9a67c, #b9946a); box-shadow: 0 -1px 0 rgba(43,42,39,.35), inset 0 12px 20px -10px rgba(60,40,20,.35); }
    .j-shoji { position: absolute; left: 9vw; top: calc(60px + 6vh); width: calc(var(--u) * 42); aspect-ratio: 16/10; display: block; cursor: pointer; overflow: hidden; background: #e9e1cf; box-shadow: 0 0 0 calc(var(--u) * .55) #b9946a, 0 0 0 calc(var(--u) * .62) #8f6d47, calc(var(--u) * 1) calc(var(--u) * 1.6) calc(var(--u) * 3) rgba(60,40,20,.2); }
    .j-shoji img, .j-shoji canvas { position: absolute; inset: -3%; width: 106%; height: 106%; object-fit: cover; filter: saturate(.42) sepia(.28) brightness(1.12) contrast(.86) blur(calc(var(--u) * .28)); } .j-shoji canvas { transition: opacity 2s ease; }
    .j-paper { position: absolute; inset: 0; background: ${WASHI}, rgba(244,237,222,.5); }
    .j-grid { position: absolute; inset: 0; background: linear-gradient(90deg, #b9946a 0 calc(var(--u) * .28), transparent 0) 0 0/25% 100%, linear-gradient(#b9946a 0 calc(var(--u) * .28), transparent 0) 0 0/100% 33.34%; box-shadow: inset calc(var(--u) * -.28) calc(var(--u) * -.28) 0 #b9946a; }
    .j-text { position: absolute; left: 9vw; top: calc(60px + 6vh + var(--u) * 28.4); width: calc(var(--u) * 42); }
    .j-eb, .j-cl, .j-nl { font: 400 clamp(11px, calc(var(--u) * .84), 13px)/1 "Jost", sans-serif; letter-spacing: .22em; color: #6f6a5f; }
    .j-title { margin: calc(var(--u) * .9) 0 calc(var(--u) * .7) !important; font: 600 calc(var(--u) * 3.9)/1.08 "Shippori Mincho", serif; letter-spacing: .02em; text-wrap: balance; }
    .j-title.re, .j-nt.re { animation: j-in 2.2s ease both; } @keyframes j-in { from { opacity: 0; } }
    .j-sub { font: 300 clamp(14px, calc(var(--u) * 1.25), 19px)/1.4 "Jost", sans-serif; letter-spacing: .04em; color: #4a4741; }
    .j-branch { position: absolute; left: calc(9vw + var(--u) * 43.5); bottom: 15vh; width: calc(var(--u) * 10.5); overflow: visible; }
    .j-sway { transform-origin: 96px 300px; will-change: transform; } .j-stem { fill: none; stroke: #3b332a; stroke-width: 3; stroke-linecap: round; } .j-leaf ellipse { fill: #7f8f6f; } .j-vase { fill: #d9d2c4; stroke: #a59d8c; stroke-width: 1.5; }
    .j-enso { position: absolute; right: calc(5vw + var(--u) * 14); top: calc(60px + 7vh); width: calc(var(--u) * 17); height: calc(var(--u) * 17); }
    .j-enso svg { position: absolute; inset: 0; overflow: visible; transform: rotate(-78deg); filter: url(#j-brush); } .j-enso circle { fill: none; stroke-linecap: round; }
    .j-e0 { stroke: rgba(43,42,39,.1); stroke-width: 2; } .j-e1 { stroke: #2b2a27; stroke-width: 11; stroke-dasharray: 0 100; }
    .j-ec { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * .8); text-align: center; padding: 0 calc(var(--u) * 2.4); }
    .j-cn { font: 400 calc(var(--u) * 3.6)/1 "Shippori Mincho", serif; font-variant-numeric: tabular-nums; } .j-enso[data-mode="text"] .j-cn { font-size: calc(var(--u) * 1.35); line-height: 1.25; text-wrap: balance; }
    .j-note { position: absolute; right: calc(5vw + var(--u) * 11.5); top: calc(60px + 7vh + var(--u) * 19.5); width: calc(var(--u) * 22); }
    .j-body { font: 300 clamp(14px, calc(var(--u) * 1.2), 18px)/1.6 "Jost", sans-serif; letter-spacing: .02em; text-wrap: pretty; }
    .j-steps { display: flex; align-items: flex-end; gap: 7px; margin-top: 16px; } .j-steps i { width: 20px; height: 9px; border-radius: 50%; background: rgba(43,42,39,.14); transition: background 1s; } .j-steps i[data-s="done"] { background: #8a857a; } .j-steps i[data-s="now"] { background: #2b2a27; }
    .j-act { margin-top: 18px; padding: 11px 20px; border: 1px solid #2b2a27; font: 400 12.5px/1 "Jost", sans-serif; letter-spacing: .14em; } .j-act:hover { background: #2b2a27; color: #ebe4d6; }
    .j-scroll { position: absolute; right: 5vw; top: calc(60px + 3vh); width: calc(var(--u) * 9); text-align: center; transform-origin: 50% 0; will-change: transform; }
    .j-rod { height: calc(var(--u) * .6); margin: 0 calc(var(--u) * -.7); background: #3b332a; border-radius: 99px; }
    .j-sp { position: relative; padding: calc(var(--u) * 1) calc(var(--u) * .9) calc(var(--u) * 1.6); background: #f4eee0; box-shadow: calc(var(--u) * .6) calc(var(--u) * .9) calc(var(--u) * 1.6) rgba(60,40,20,.18); min-height: calc(var(--u) * 24); display: flex; flex-direction: column; align-items: center; gap: calc(var(--u) * 1.2); }
    .j-sp img { width: 100%; aspect-ratio: 1; object-fit: cover; filter: grayscale(.75) sepia(.3) contrast(.9) brightness(1.08); }
    .j-nt { writing-mode: vertical-rl; font: 600 calc(var(--u) * 1.7)/1.2 "Shippori Mincho", serif; letter-spacing: .12em; max-height: calc(var(--u) * 15); overflow: hidden; }
    .j-seal { position: absolute; right: calc(var(--u) * .7); bottom: calc(var(--u) * .7); width: calc(var(--u) * 1.7); height: calc(var(--u) * 1.7); display: grid; place-items: center; background: #b5402f; color: #f4eee0; font: 600 calc(var(--u) * 1) "Yu Mincho", "MS Mincho", serif; border-radius: 2px; }
    .j-nl { margin-top: calc(var(--u) * 1.2) !important; } .j-ns { margin-top: 6px !important; font: 300 12.5px/1.3 "Jost", sans-serif; color: #4a4741; }
    .j-tl { position: absolute; left: 9vw; right: 5vw; bottom: 5.4vh; display: flex; align-items: center; gap: 18px; font: 300 clamp(12px, calc(var(--u) * .95), 15px)/1 "Jost", sans-serif; letter-spacing: .08em; color: #3b332a; font-variant-numeric: tabular-nums; z-index: 2; }
    .j-line { position: relative; flex: 1; height: 1px; background: rgba(43,42,39,.55); } .j-secs i { position: absolute; top: -4px; width: 1px; height: 9px; background: rgba(43,42,39,.55); }
    .j-dot { position: absolute; top: 50%; width: 13px; height: 13px; margin: -6.5px; border-radius: 50%; background: #2b2a27; box-shadow: 0 0 0 5px rgba(43,42,39,.12); }
    .j-mix { position: absolute; top: -6px; width: 12px; height: 12px; margin-left: -6px; background: #b5402f; border-radius: 2px; display: none; }
    @media (max-aspect-ratio: 13/10) { .j-branch { display: none; } .j-enso { right: 5vw; top: auto; bottom: 24vh; } .j-note { display: none; } .j-scroll { top: calc(60px + 2vh); } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".j-shoji canvas").getContext("2d"), sway: 0, lv: [...el.querySelectorAll(".j-leaves i")].map((e, i) => ({ e, x: Math.random(), y: 0.1 + i * 0.13, r: Math.random() * 360, v: 0.006 + Math.random() * 0.006 })) };
      q(".j-shoji").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".j-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p);
      if (a) Y.src(q(".j-shoji img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.c, Y.frame, 320, 180, 320, 200); }
      q(".j-shoji canvas").style.opacity = vm.videoOk ? "1" : "0";
      q(".j-sun").style.transform = `translateX(${((0.15 + 0.5 * (0.5 + 0.5 * Math.sin(now / 60000 * mo))) * innerWidth).toFixed(1)}px) skewX(-18deg)`;
      for (const l of st.lv) { l.x += l.v * dt * mo; if (l.x > 1.15) l.x = -0.15; l.e.style.transform = `translate(${(l.x * innerWidth).toFixed(1)}px,${((l.y + Math.sin(now / 4000 + l.r) * 0.03) * innerHeight).toFixed(1)}px) rotate(${(l.r + Math.sin(now / 3000 + l.r) * 14).toFixed(1)}deg)`; }
      st.sway += ((vm.paused ? 0 : au.bass * 5 + au.mid * 3) - st.sway) * Math.min(1, dt * 3);
      q(".j-sway").style.transform = `rotate(${((Math.sin(now / 2400) * 1.6 + st.sway * Math.sin(now / 500)) * mo).toFixed(2)}deg)`;
      Y.txt(q(".j-eb"), vm.paused ? "PAUSED" : vm.kind === "blending" ? "LEAVING" : "NOW PLAYING");
      Y.swap(q(".j-title"), a ? a.title : "Silence"); Y.txt(q(".j-sub"), a ? [a.sub, Y.meta(a, ", ")].filter(Boolean).join("  /  ") : "Play a YouTube Mix to begin.");
      // ensō: the brushed circle closes as the song plays
      const cnt = Y.count(vm); q(".j-enso").dataset.mode = cnt ? "count" : "text";
      q(".j-e1").style.strokeDasharray = `${(Y.prog(vm) * 96).toFixed(2)} 100`;
      Y.txt(q(".j-cl"), vm.eyebrow.toUpperCase()); Y.txt(q(".j-cn"), cnt || vm.headline);
      Y.txt(q(".j-body"), vm.step >= 0 ? `Preparing the next song: ${vm.steps[vm.step]}.` : vm.body);
      Y.stepDots(q(".j-steps"), vm); Y.showCta(q(".j-act"), vm);
      const sc = q(".j-scroll"); sc.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(sc.querySelector("img"), b.thumb); Y.swap(q(".j-nt"), b.title); Y.txt(q(".j-nl"), vm.kind === "blending" ? "ARRIVING" : "NEXT"); Y.txt(q(".j-ns"), Y.meta(b, ", "));
        sc.style.transform = `rotate(${((Math.sin(now / 2900) * 0.7 + au.bass * 0.5 * Math.sin(now / 420)) * mo).toFixed(2)}deg) scale(${(1 + pe * 0.07).toFixed(3)})`; }
      const secs = Y.sections(vm);
      Y.once(st, "secs", (a ? a.id : "") + secs.length, () => { q(".j-secs").innerHTML = secs.slice(1).map((s) => `<i style="left:${s.a * 100}%"></i>`).join(""); });
      q(".j-dot").style.left = Y.prog(vm) * 100 + "%";
      const mx = Y.mix(vm), m = q(".j-mix"); m.style.display = mx ? "block" : "none"; if (mx) m.style.left = mx.a + "%";
      Y.txt(q(".j-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".j-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
