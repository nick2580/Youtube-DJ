// Ethereal: everything is light and air. The video glows inside a soft moon with a feathered edge, ripples leave
// it in time with the music, the song's progress is a thin arc around it, and the next song is a paler moon rising.
(() => {
  const Y = window.YTDJ;
  Y.theme("Ethereal", {
    swatch: ["#e6dcf6", "#f6d9c9"],
    cls: "eth",
    html: `
      <div class="e-sky"><i></i><i></i><i></i><i></i></div>
      <canvas class="e-dust"></canvas>
      <div class="e-moonw"><i class="e-halo"></i><i class="e-rip"></i><i class="e-rip"></i><i class="e-rip"></i>
        <button class="e-moon" title="Play or pause"><img alt=""><canvas width="320" height="320"></canvas><i class="e-veil"></i></button>
        <svg class="e-arc" viewBox="0 0 200 200"><circle class="e-a0" cx="100" cy="100" r="96"/><circle class="e-am" cx="100" cy="100" r="96" pathLength="100"/><circle class="e-a1" cx="100" cy="100" r="96" pathLength="100"/><circle class="e-bead" r="2.6"/></svg></div>
      <div class="e-text"><p class="e-eb"></p><h1 class="e-title"></h1><p class="e-sub"></p><p class="e-time"></p></div>
      <div class="e-say"><p class="e-cl"></p><p class="e-cn"></p><p class="e-body"></p><div class="e-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="e-act"></button></div>
      <div class="e-next"><div class="e-moon2"><img alt=""></div><p class="e-nl"></p><p class="e-nt"></p><p class="e-ns"></p></div>`,
    css: `
    .ov[data-theme="Ethereal"] .dock { --dk-font: "Cormorant Garamond", serif; --dk-size: 16px; --dk-ink: #57506e; --dk-line: rgba(87,80,110,.3); --dk-chip: rgba(255,255,255,.5); --dk-accent: #b9975a; --dk-on: #fff; }
    .eth { background: linear-gradient(170deg, #e4dcf5 0%, #f4e3ec 45%, #fdf1e0 100%); color: #57506e; font-family: "Cormorant Garamond", serif; }
    .eth p, .eth h1 { margin: 0; font-weight: 400; }
    .e-sky i { position: absolute; border-radius: 50%; filter: blur(80px); animation: e-drift 30s ease-in-out infinite alternate; }
    .e-sky i:nth-child(1) { left: -10vw; top: -10vh; width: 50vw; height: 50vw; background: rgba(190,170,240,.6); }
    .e-sky i:nth-child(2) { right: -12vw; top: 10vh; width: 46vw; height: 46vw; background: rgba(255,200,205,.6); animation-duration: 38s; animation-delay: -12s; }
    .e-sky i:nth-child(3) { left: 20vw; bottom: -30vh; width: 60vw; height: 40vw; background: rgba(190,235,225,.55); animation-duration: 44s; animation-delay: -20s; }
    .e-sky i:nth-child(4) { left: 30vw; top: 10vh; width: 40vw; height: 40vw; background: rgba(255,255,255,.75); animation-duration: 26s; }
    @keyframes e-drift { to { transform: translate(8vw, 6vh) scale(1.2); } }
    .e-dust { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 4; }
    .e-moonw { position: absolute; left: 50%; top: 41%; width: 0; height: 0; --d: calc(var(--u) * 30); }
    .e-moonw > * { position: absolute; left: calc(var(--d) / -2); top: calc(var(--d) / -2); width: var(--d); height: var(--d); border-radius: 50%; }
    .e-halo { background: radial-gradient(circle, rgba(255,255,255,.95) 30%, var(--c1, #e9c9f2) 52%, transparent 70%); filter: blur(30px); opacity: .7; will-change: transform; }
    .e-rip { border: 1px solid rgba(255,255,255,.95); box-shadow: 0 0 18px rgba(255,255,255,.8), inset 0 0 18px rgba(255,255,255,.4); will-change: transform, opacity; pointer-events: none; }
    .e-moon { overflow: hidden; cursor: pointer; -webkit-mask: radial-gradient(circle, #000 54%, transparent 71%); mask: radial-gradient(circle, #000 54%, transparent 71%); will-change: transform; }
    .e-moon img, .e-moon canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(.72) brightness(1.14) contrast(.92); }
    .e-moon img { transform: scale(1.4); } .e-moon canvas { transition: opacity 1.6s ease; }
    .e-veil { position: absolute; inset: 0; background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.5), transparent 46%), radial-gradient(circle, transparent 40%, rgba(255,250,255,.6) 70%); mix-blend-mode: screen; }
    .e-arc { overflow: visible; transform: rotate(-90deg) scale(1.13); pointer-events: none; }
    .e-arc circle { fill: none; } .e-a0 { stroke: rgba(87,80,110,.16); stroke-width: .4; } .e-a1 { stroke: #b9975a; stroke-width: .9; stroke-linecap: round; stroke-dasharray: 0 100; }
    .e-am { stroke: rgba(255,255,255,.95); stroke-width: 3; stroke-dasharray: 0 100; filter: drop-shadow(0 0 3px #fff); } .e-bead { fill: #fff !important; stroke: #b9975a; stroke-width: .7; filter: drop-shadow(0 0 4px #fff); }
    .e-text { position: absolute; left: 20vw; right: 20vw; top: calc(41% + var(--u) * 18.6); text-align: center; z-index: 3; }
    .e-eb, .e-cl, .e-nl { font: italic 400 clamp(15px, calc(var(--u) * 1.3), 21px)/1 "Cormorant Garamond", serif; color: #b08d52; }
    .e-title { margin: calc(var(--u) * .5) 0 !important; font: italic 400 calc(var(--u) * 5.6)/1 "Cormorant Garamond", serif; letter-spacing: .01em; color: #4b4463; text-wrap: balance; }
    .e-title.re, .e-nt.re { animation: e-in 2s ease both; }
    @keyframes e-in { from { opacity: 0; filter: blur(12px); letter-spacing: .12em; } }
    .e-sub { font: 500 clamp(16px, calc(var(--u) * 1.5), 24px)/1.2 "Cormorant Garamond", serif; }
    .e-time { margin-top: 6px !important; font: italic 400 clamp(14px, calc(var(--u) * 1.15), 18px)/1 "Cormorant Garamond", serif; opacity: .75; font-variant-numeric: tabular-nums; }
    .e-say { position: absolute; left: 7vw; top: 30%; width: calc(var(--u) * 20); z-index: 3; }
    .e-cn { font: 400 calc(var(--u) * 6.2)/1 "Cormorant Garamond", serif; color: #4b4463; font-variant-numeric: tabular-nums; margin: calc(var(--u) * .3) 0 calc(var(--u) * .8) !important; }
    .e-say[data-mode="text"] .e-cn { font: italic 400 calc(var(--u) * 2.6)/1.05 "Cormorant Garamond", serif; text-wrap: balance; }
    .e-body { font: 500 clamp(16px, calc(var(--u) * 1.38), 22px)/1.36 "Cormorant Garamond", serif; text-wrap: pretty; }
    .e-steps { display: flex; gap: 10px; margin-top: 14px; }
    .e-steps i { width: 9px; height: 9px; border-radius: 50%; background: rgba(87,80,110,.18); transition: all .8s ease; }
    .e-steps i[data-s="done"] { background: #b9975a; } .e-steps i[data-s="now"] { background: #fff; box-shadow: 0 0 14px 4px #fff, 0 0 0 1px #b9975a; }
    .e-act { margin-top: 16px; padding: 10px 22px; border-radius: 999px; background: rgba(255,255,255,.7); box-shadow: 0 0 30px rgba(255,255,255,.9), 0 0 0 1px rgba(185,151,90,.6); font: italic 500 17px/1 "Cormorant Garamond", serif; color: #4b4463; }
    .e-next { position: absolute; right: 7vw; top: 24%; width: calc(var(--u) * 18); text-align: center; z-index: 3; }
    .e-moon2 { width: calc(var(--u) * 11); height: calc(var(--u) * 11); margin: 0 auto calc(var(--u) * 1.2); border-radius: 50%; overflow: hidden; -webkit-mask: radial-gradient(circle, #000 50%, transparent 71%); mask: radial-gradient(circle, #000 50%, transparent 71%); will-change: transform, opacity; }
    .e-moon2 img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.4); filter: saturate(.5) brightness(1.3) contrast(.8); }
    .e-nt { margin: 5px 0 !important; font: italic 400 calc(var(--u) * 2.7)/1.05 "Cormorant Garamond", serif; color: #4b4463; text-wrap: balance; }
    .e-ns { font: 500 clamp(14px, calc(var(--u) * 1.15), 18px)/1.25 "Cormorant Garamond", serif; }
    @media (max-aspect-ratio: 13/10) { .e-say { top: auto; bottom: 4vh; } .e-next { top: 12%; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".e-moon canvas").getContext("2d"), dust: Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * Math.random() * 5, v: 0.004 + Math.random() * 0.012, p: Math.random() * 6.28 })) };
      q(".e-moon").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".e-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p), fl = Y.flash(vm);
      Y.once(st, "c1", a ? a.c1 : "", () => st.el.style.setProperty("--c1", a ? `color-mix(in srgb, ${a.c1} 45%, white)` : "#e9c9f2"));
      if (a) Y.src(q(".e-moon img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.c, Y.frame, 320, 180, 320, 320); }
      q(".e-moon canvas").style.opacity = vm.videoOk ? "1" : "0";
      const br = 1 + Math.sin(now / 2600) * 0.012 * mo + au.bass * 0.02;
      q(".e-moon").style.transform = `scale(${(br * (1 - pe * 0.1)).toFixed(4)})`;
      const halo = q(".e-halo"); halo.style.transform = `scale(${(1.25 + au.bass * 0.35 + fl * 0.5).toFixed(3)})`; halo.style.opacity = (0.55 + au.level * 0.4 + fl * 0.3).toFixed(3);
      st.el.querySelectorAll(".e-rip").forEach((r, i) => { const ph = (((vm.flow / 3 + i / 3) % 1) + 1) % 1;   /* a ring leaves the moon on every beat and lives three */ r.style.transform = `scale(${(1.05 + ph * 0.95).toFixed(3)})`; r.style.opacity = ((1 - ph) * (0.2 + au.level * 0.9) * mo).toFixed(3); });
      const pr = Y.prog(vm), mx = Y.mix(vm);
      q(".e-a1").style.strokeDasharray = `${(pr * 100).toFixed(2)} 100`;
      const am = q(".e-am"); am.style.strokeDasharray = mx ? `0 ${mx.a.toFixed(2)} ${(mx.b - mx.a).toFixed(2)} 100` : "0 100";
      const ang = pr * 6.2832; q(".e-bead").setAttribute("cx", (100 + 96 * Math.cos(ang)).toFixed(2)); q(".e-bead").setAttribute("cy", (100 + 96 * Math.sin(ang)).toFixed(2));

      Y.txt(q(".e-eb"), vm.paused ? "resting" : vm.kind === "blending" ? "dissolving" : "now in the air");
      Y.swap(q(".e-title"), a ? a.title : "Stillness");
      Y.txt(q(".e-sub"), a ? a.sub : ""); Y.txt(q(".e-time"), vm.dur ? `${Y.fmt(vm.time)} of ${Y.fmt(vm.dur)}${a && a.bpm ? ", " + Y.meta(a, ", ") : ""}` : "");
      const cnt = Y.count(vm); q(".e-say").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".e-cl"), cnt ? (vm.kind === "blending" ? "the new song arrives in" : vm.paused ? "held still" : "they drift together in") : vm.eyebrow.toLowerCase());
      Y.txt(q(".e-cn"), cnt || vm.headline);
      Y.txt(q(".e-body"), vm.step >= 0 ? `Listening ahead: ${vm.steps[vm.step]}.` : vm.body);
      Y.stepDots(q(".e-steps"), vm); Y.showCta(q(".e-act"), vm);

      const nx = q(".e-next"); nx.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(nx.querySelector("img"), b.thumb); Y.txt(q(".e-nl"), vm.kind === "blending" ? "rising" : "next to rise"); Y.swap(q(".e-nt"), b.title); Y.txt(q(".e-ns"), Y.meta(b, ", ") || b.sub);
        const m2 = q(".e-moon2"); m2.style.transform = `translateY(${(Math.sin(now / 2300) * 6 * mo - pe * 20).toFixed(1)}px) scale(${(1 + pe * 0.5).toFixed(3)})`; m2.style.opacity = (0.55 + pe * 0.45).toFixed(3); }

      const cv = q(".e-dust"); if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
      const g = st.g || (st.g = cv.getContext("2d")); g.clearRect(0, 0, cv.width, cv.height);
      for (const d of st.dust) { d.p += dt; d.y -= d.v * dt * mo * (1 + au.level * 3); d.x += Math.sin(d.p * 0.5) * 0.0006 * mo; if (d.y < -0.03) { d.y = 1.03; d.x = Math.random(); }
        g.fillStyle = `rgba(255,255,255,${(0.25 + 0.5 * Math.abs(Math.sin(d.p * 1.3)) * (0.5 + au.high)).toFixed(3)})`; g.beginPath(); g.arc(d.x * cv.width, d.y * cv.height, d.r * (1 + au.bass * 0.4), 0, 6.283); g.fill(); }
    },
  });
})();
