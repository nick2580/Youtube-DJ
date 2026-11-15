// Synthwave: a night drive toward a striped sun. The sun is the video, tinted sunset and cut by the classic bars;
// the mountain range on the horizon is the live spectrum; the neon grid rushes past at the song's tempo; the title
// is chrome with a neon script across it; the next song is a neon sign by the road.
(() => {
  const Y = window.YTDJ;
  Y.theme("Synthwave", {
    swatch: ["#2a0a52", "#ff2e88"],
    cls: "syn",
    html: `
      <div class="w-sky"></div><canvas class="w-stars"></canvas>
      <button class="w-sun" title="Play or pause"><img alt=""><canvas width="360" height="360"></canvas><i class="w-grad"></i></button>
      <svg class="w-mtn" viewBox="0 0 1000 200" preserveAspectRatio="none"><path class="w-m2"/><path class="w-m1"/></svg>
      <div class="w-floor"><i></i></div><div class="w-hglow"></div>
      <div class="w-head"><p class="w-script"></p><h1 class="w-title"></h1><p class="w-sub"></p></div>
      <div class="w-left"><p class="w-cl"></p><p class="w-cn"></p><p class="w-body"></p><div class="w-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="w-act"></button></div>
      <div class="w-sign"><p class="w-nl"></p><img alt=""><p class="w-nt"></p><p class="w-ns"></p></div>
      <footer class="w-tl"><span class="w-t0"></span><div class="w-line"><i class="w-mix"></i><i class="w-fill"></i><i class="w-dia"></i></div><span class="w-t1"></span></footer>`,
    css: `
    .ov[data-theme="Synthwave"] .dock { --dk-font: "Orbitron", sans-serif; --dk-weight: 600; --dk-size: 11.5px; --dk-track: .08em; --dk-ink: #ffd9f2; --dk-line: rgba(255,46,136,.7); --dk-chip: rgba(255,46,136,.22); --dk-accent: #29f0ff; --dk-on: #12032b; }
    .syn { background: #12032b; color: #ffe9f8; font-family: "Orbitron", sans-serif; --hz: 60%; }
    .syn p, .syn h1 { margin: 0; }
    .w-sky { position: absolute; left: 0; right: 0; top: 0; height: var(--hz); background: linear-gradient(180deg, #0b0221 0%, #1d0647 38%, #5a0f78 68%, #c2247f 90%, #ff5a8a 100%); }
    .w-stars { position: absolute; left: 0; top: 0; width: 100%; height: 60%; }
    .w-sun { position: absolute; left: 50%; top: var(--hz); width: calc(var(--u) * 34); height: calc(var(--u) * 34); margin: calc(var(--u) * -27) 0 0 calc(var(--u) * -17); border-radius: 50%; overflow: hidden; cursor: pointer; will-change: transform;
      box-shadow: 0 0 calc(var(--u) * 6) rgba(255,90,160,.75), 0 0 calc(var(--u) * 16) rgba(255,60,140,.4);
      -webkit-mask: linear-gradient(#000 0 48%, transparent 48% 50%, #000 50% 57%, transparent 57% 60%, #000 60% 66%, transparent 66% 70%, #000 70% 75%, transparent 75% 80.5%, #000 80.5% 84.5%, transparent 84.5% 91%, #000 91% 94%, transparent 94%);
      mask: linear-gradient(#000 0 48%, transparent 48% 50%, #000 50% 57%, transparent 57% 60%, #000 60% 66%, transparent 66% 70%, #000 70% 75%, transparent 75% 80.5%, #000 80.5% 84.5%, transparent 84.5% 91%, #000 91% 94%, transparent 94%); }
    .w-sun img, .w-sun canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.35) brightness(1.15); } .w-sun img { transform: scale(1.4); } .w-sun canvas { transition: opacity 1s; }
    .w-grad { position: absolute; inset: 0; background: linear-gradient(180deg, #fff27a 0%, #ffb23f 34%, #ff4f8f 68%, #c21fd0 100%); mix-blend-mode: multiply; } .w-sun::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, #ffd23f, #ff2e88 60%, #8a17c9); mix-blend-mode: screen; opacity: .42; }
    .w-mtn { position: absolute; left: 0; right: 0; top: calc(var(--hz) - 22vh); width: 100%; height: 22vh; overflow: visible; }
    .w-m1 { fill: #12032b; stroke: #29f0ff; stroke-width: 2; vector-effect: non-scaling-stroke; filter: drop-shadow(0 0 6px #29f0ff); } .w-m2 { fill: #2a0a52; stroke: #ff2e88; stroke-width: 1.5; vector-effect: non-scaling-stroke; opacity: .9; }
    .w-floor { position: absolute; left: -50%; right: -50%; top: var(--hz); bottom: 0; perspective: 34vh; overflow: hidden; background: linear-gradient(180deg, #2a0a52, #0b0221 70%); }
    .w-floor i { position: absolute; inset: -100% 0 0 0; transform: rotateX(70deg); transform-origin: 50% 100%; background: linear-gradient(#ff2e88 3px, transparent 3px) 0 var(--gy, 0)/90px 90px, linear-gradient(90deg, #ff2e88 3px, transparent 3px) 50% 0/90px 90px; filter: drop-shadow(0 0 8px #ff2e88); }
    .w-hglow { position: absolute; left: 0; right: 0; top: calc(var(--hz) - 2px); height: 4px; background: #fff; box-shadow: 0 0 20px 6px #ff2e88, 0 0 70px 18px rgba(255,46,136,.6); }
    .w-head { position: absolute; left: 12vw; right: 12vw; top: calc(var(--hz) + 4.5vh); text-align: center; z-index: 3; }
    .w-script { font: 400 calc(var(--u) * 3)/1 "Yellowtail", cursive; color: #ff7ad1; text-shadow: 0 0 10px #ff2e88, 0 0 26px #ff2e88; transform: rotate(-5deg) translateY(.5em); position: relative; z-index: 2; }
    .w-title { font: 900 calc(var(--u) * 6.4)/1 "Orbitron", sans-serif; letter-spacing: .02em; text-transform: uppercase; transform: skewX(-8deg); white-space: nowrap;
      background: linear-gradient(180deg, #1b2a8a 0%, #7fd0ff 30%, #ffffff 47%, #2a0a52 50%, #ff4fa3 72%, #ffd9f2 100%); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.75); filter: drop-shadow(0 4px 0 #12032b) drop-shadow(0 0 18px rgba(41,240,255,.55)); }
    .w-title.re { animation: w-in .9s cubic-bezier(.2,.8,.2,1) both; } @keyframes w-in { from { transform: skewX(-8deg) scale(1.7); opacity: 0; filter: blur(12px); } }
    .w-sub { margin-top: calc(var(--u) * .9) !important; font: 500 clamp(12px, calc(var(--u) * 1.1), 17px)/1.3 "Orbitron", sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #29f0ff; text-shadow: 0 0 10px rgba(41,240,255,.8); }
    .w-left { position: absolute; left: 5vw; top: calc(60px + 6vh); width: calc(var(--u) * 24); z-index: 3; }
    .w-cl, .w-nl { font: 400 calc(var(--u) * 2.4)/1 "Yellowtail", cursive; color: #5ff3ff; text-shadow: 0 0 10px #29f0ff, 0 0 26px #29f0ff; }
    .w-cn { font: 700 calc(var(--u) * 5.6)/1.05 "Orbitron", sans-serif; color: #fff; text-shadow: 0 0 12px #ff2e88, 0 0 34px #ff2e88, 0 0 3px #fff; font-variant-numeric: tabular-nums; margin: calc(var(--u) * .5) 0 calc(var(--u) * 1) !important; }
    .w-left[data-mode="text"] .w-cn { font-size: calc(var(--u) * 2.2); line-height: 1.15; text-transform: uppercase; }
    .w-body { font: 400 clamp(12px, calc(var(--u) * 1.02), 16px)/1.6 "Orbitron", sans-serif; letter-spacing: .03em; color: #f3d9ff; text-wrap: pretty; }
    .w-steps { display: flex; gap: 7px; margin-top: 14px; } .w-steps i { width: 26px; height: 6px; background: rgba(255,46,136,.3); transform: skewX(-24deg); } .w-steps i[data-s="done"] { background: #ff2e88; box-shadow: 0 0 10px #ff2e88; } .w-steps i[data-s="now"] { background: #29f0ff; box-shadow: 0 0 12px #29f0ff; animation: w-bl .8s ease-in-out infinite; } @keyframes w-bl { 50% { opacity: .3; } }
    .w-act { margin-top: 16px; padding: 12px 20px; border: 2px solid #29f0ff; color: #eaffff; font: 600 12px/1 "Orbitron", sans-serif; letter-spacing: .14em; text-transform: uppercase; box-shadow: 0 0 14px #29f0ff, inset 0 0 14px rgba(41,240,255,.4); transform: skewX(-8deg); }
    .w-sign { position: absolute; right: 5vw; top: calc(60px + 6vh); width: calc(var(--u) * 21); padding: calc(var(--u) * 1.3); text-align: center; z-index: 3; border: 2px solid #ff2e88; border-radius: calc(var(--u) * 1.2); box-shadow: 0 0 16px #ff2e88, inset 0 0 16px rgba(255,46,136,.45); background: rgba(18,3,43,.55); will-change: transform; }
    .w-sign img { display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; margin: calc(var(--u) * .7) 0; filter: saturate(1.3) contrast(1.1) hue-rotate(-12deg); border: 1px solid #29f0ff; box-shadow: 0 0 10px #29f0ff; }
    .w-nl { color: #ff7ad1; text-shadow: 0 0 10px #ff2e88, 0 0 26px #ff2e88; } .w-nt { font: 800 calc(var(--u) * 1.75)/1.1 "Orbitron", sans-serif; text-transform: uppercase; color: #fff; text-shadow: 0 0 10px #29f0ff; overflow-wrap: anywhere; } .w-ns { margin-top: 6px !important; font: 500 clamp(10px, calc(var(--u) * .85), 13px)/1.3 "Orbitron", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #29f0ff; }
    .w-tl { position: absolute; left: 5vw; right: 5vw; bottom: 4vh; display: flex; align-items: center; gap: 16px; z-index: 3; font: 600 clamp(11px, calc(var(--u) * .95), 15px)/1 "Orbitron", sans-serif; color: #fff; text-shadow: 0 0 8px #ff2e88; font-variant-numeric: tabular-nums; }
    .w-line { position: relative; flex: 1; height: 3px; background: rgba(255,255,255,.25); } .w-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: #fff; box-shadow: 0 0 10px #29f0ff, 0 0 24px #29f0ff; }
    .w-mix { position: absolute; top: -5px; bottom: -5px; background: #ff2e88; box-shadow: 0 0 14px #ff2e88; display: none; } .w-dia { position: absolute; top: 50%; width: 16px; height: 16px; margin: -8px; background: #fff; transform: rotate(45deg); box-shadow: 0 0 12px #fff, 0 0 26px #29f0ff; }
    @media (max-aspect-ratio: 13/10) { .w-left, .w-sign { top: calc(60px + 2vh); width: calc(var(--u) * 26); } .w-body { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".w-sun canvas").getContext("2d"), gy: 0, stars: Array.from({ length: 90 }, () => [Math.random(), Math.random() * Math.random(), Math.random() * 6.28, 0.5 + Math.random()]) };
      q(".w-sun").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".w-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p);
      if (a) Y.src(q(".w-sun img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.c, Y.frame, 320, 180, 360, 360); }
      q(".w-sun canvas").style.opacity = vm.videoOk ? "1" : "0";
      q(".w-sun").style.transform = `scale(${(1 + au.bass * 0.03 * mo).toFixed(4)})`;
      const cv = q(".w-stars"); if (cv.width !== innerWidth) { cv.width = innerWidth; cv.height = Math.round(innerHeight * 0.6); }
      const g = st.g || (st.g = cv.getContext("2d")); g.clearRect(0, 0, cv.width, cv.height);
      for (const s of st.stars) { g.fillStyle = `rgba(255,255,255,${(0.25 + 0.6 * Math.abs(Math.sin(now / 900 * s[3] + s[2])) * (0.5 + au.high)).toFixed(3)})`; g.fillRect(s[0] * cv.width, s[1] * cv.height * 0.9, s[3] * 1.6, s[3] * 1.6); }
      // mountains are the spectrum
      const range = (k, sc) => { let d = "M0 200"; for (let i = 0; i <= 48; i++) { const j = i < 24 ? 23 - i : i - 24, c = Math.abs(i - 24) / 24, v = au.bins[Math.min(23, (j + k) % 24)], h = (16 + v * 150 * sc) * (0.25 + 0.75 * Math.min(1, c * 2.4)) + ((i * 7 + k * 3) % 5) * 5 * sc; d += ` L${((i / 48) * 1000).toFixed(0)} ${(200 - h).toFixed(1)}`; } return d + " L1000 200Z"; };
      q(".w-m1").setAttribute("d", range(0, 1)); q(".w-m2").setAttribute("d", range(5, 1.35));
      st.gy = (((vm.flow * (mo < 1 ? 0.25 : 1)) % 1) + 1) % 1 * 90; /* one grid line passes under you per beat */ Y.sty(q(".w-floor i"), "--gy", st.gy.toFixed(1) + "px");
      Y.txt(q(".w-script"), vm.paused ? "Paused" : vm.kind === "blending" ? "Fading out" : "Now playing");
      if (Y.swap(q(".w-title"), a ? a.title : "YouTube DJ")) Y.fit(q(".w-title"), 6.4, 2.6, "vw");
      Y.once(st, "fitw", innerWidth, () => Y.fit(q(".w-title"), 6.4, 2.6, "vw"));
      Y.txt(q(".w-sub"), a ? [a.sub, Y.meta(a)].filter(Boolean).join("  //  ") : "Play a YouTube Mix");
      const cnt = Y.count(vm); q(".w-left").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".w-cl"), cnt ? (vm.paused ? "Holding at" : vm.kind === "blending" ? "Drop in" : "Mix in") : vm.eyebrow); Y.txt(q(".w-cn"), cnt || vm.headline);
      Y.txt(q(".w-body"), vm.step >= 0 ? `Scanning the road ahead: ${vm.steps[vm.step]}.` : vm.body); Y.stepDots(q(".w-steps"), vm); Y.showCta(q(".w-act"), vm);
      const sg = q(".w-sign"); sg.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(sg.querySelector("img"), b.thumb); Y.txt(q(".w-nl"), vm.kind === "blending" ? "Arriving" : "Next exit"); Y.swap(q(".w-nt"), b.title); Y.txt(q(".w-ns"), Y.meta(b));
        sg.style.transform = `scale(${(1 + pe * 0.14).toFixed(3)}) rotate(${(2 - pe * 2).toFixed(2)}deg)`; sg.style.opacity = (0.9 + vm.beat * 0.1).toFixed(3); /* the sign breathes with the kick instead of flickering */ }
      const pr = Y.prog(vm) * 100; q(".w-fill").style.width = pr + "%"; q(".w-dia").style.left = pr + "%";
      const mx = Y.mix(vm), m = q(".w-mix"); m.style.display = mx ? "block" : "none"; if (mx) { m.style.left = mx.a + "%"; m.style.width = Math.max(0.8, mx.b - mx.a) + "%"; }
      Y.txt(q(".w-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".w-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
