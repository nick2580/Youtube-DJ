// Cybercore: a heads-up display over a rain of hex. The video is an intercepted feed that tears on the bass, the
// countdown is a T-minus clock running in hundredths, the spectrum is a ring around the lock-on reticle, the next
// song is an incoming signal being acquired, and a console logs what the engine is doing.
(() => {
  const Y = window.YTDJ;
  const CY = "#29f0ff", MG = "#ff2bd6", AC = "#d7ff3a";
  const HEX = "0123456789ABCDEF";
  Y.theme("Cybercore", {
    swatch: ["#05060a", "#29f0ff"],
    cls: "cyb",
    html: `
      <canvas class="c-rain"></canvas><div class="c-scan"></div>
      <section class="c-feed"><p class="c-tag"></p><h1 class="c-title"></h1><p class="c-sub"></p>
        <button class="c-view" title="Play or pause"><img alt=""><canvas width="480" height="270"></canvas><i class="c-tint"></i><i class="c-br"></i><svg class="c-ret" viewBox="-50 -50 100 100"><circle r="18"/><path d="M-30 0H-22M22 0H30M0 -30V-22M0 22V30"/><g class="c-spin"><path d="M-26 -8A27 27 0 0 1 -8 -26M26 8A27 27 0 0 1 8 26"/></g></svg></button>
        <div class="c-read"><span class="c-bpm"></span><span class="c-key"></span><span class="c-cam"></span><span class="c-time"></span></div></section>
      <section class="c-right">
        <div class="c-tm"><p class="c-cl"></p><p class="c-cn"></p><p class="c-plan"></p></div>
        <div class="c-row"><canvas class="c-ring" width="260" height="260"></canvas>
          <div class="c-in"><p class="c-nl"></p><div class="c-nimg"><img alt=""><i></i></div><p class="c-nt"></p><p class="c-ns"></p><div class="c-lock"><i></i></div></div></div>
        <div class="c-log"></div><button class="c-act"></button>
      </section>
      <footer class="c-tl"><div class="c-bar"><div class="c-secs"></div><i class="c-mix"></i><i class="c-fill"></i><i class="c-hd"></i></div><div class="c-addr"><span>0x00</span><span>0x40</span><span>0x80</span><span>0xC0</span><span>0xFF</span></div></footer>`,
    css: `
    .ov[data-theme="Cybercore"] .dock { --dk-font: "Share Tech Mono", monospace; --dk-weight: 400; --dk-size: 13px; --dk-track: .06em; --dk-ink: ${CY}; --dk-line: rgba(41,240,255,.5); --dk-chip: rgba(41,240,255,.14); --dk-accent: ${AC}; --dk-on: #05060a; }
    .ov[data-theme="Cybercore"] .dk-b { border-radius: 0; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); }
    .cyb { background: #05060a; color: #cfe9ff; font-family: "Share Tech Mono", monospace; }
    .cyb p, .cyb h1 { margin: 0; }
    .c-rain { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .5; }
    .c-scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 1px, transparent 1px 3px), radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,.75)); pointer-events: none; z-index: 6; }
    .c-feed { position: absolute; left: 5vw; top: calc(60px + 2vh); width: calc(var(--u) * 52); z-index: 2; }
    .c-tag, .c-cl, .c-nl { font: 400 clamp(11px, calc(var(--u) * .95), 15px)/1 "Share Tech Mono", monospace; color: ${AC}; letter-spacing: .12em; text-transform: uppercase; }
    .c-title { position: relative; margin: calc(var(--u) * .6) 0 calc(var(--u) * .4) !important; font: 800 calc(var(--u) * 3.8)/1.05 "Orbitron", sans-serif; text-transform: uppercase; letter-spacing: .02em; color: #fff; text-shadow: 3px 0 0 rgba(255,43,214,.8), -3px 0 0 rgba(41,240,255,.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .c-title.re { animation: c-gl .5s steps(2) 3; } @keyframes c-gl { 0% { transform: translateX(-6px) skewX(12deg); clip-path: inset(0 0 55% 0); } 50% { transform: translateX(7px) skewX(-10deg); clip-path: inset(45% 0 0 0); } }
    .c-sub { font: 400 clamp(13px, calc(var(--u) * 1.2), 19px)/1.2 "Share Tech Mono", monospace; color: ${CY}; margin-bottom: calc(var(--u) * 1.1) !important; }
    .c-view { position: relative; display: block; width: 100%; aspect-ratio: 16/9; cursor: pointer; background: #000; clip-path: polygon(0 0, calc(100% - var(--u) * 2.4) 0, 100% calc(var(--u) * 2.4), 100% 100%, calc(var(--u) * 2.4) 100%, 0 calc(100% - var(--u) * 2.4)); }
    .c-view img, .c-view canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: contrast(1.2) saturate(1.3) brightness(.9); } .c-view canvas { transition: opacity .4s steps(4); }
    .c-tint { position: absolute; inset: 0; background: linear-gradient(120deg, rgba(41,240,255,.3), rgba(255,43,214,.26)), repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 2px, transparent 2px 4px); mix-blend-mode: hard-light; }
    .c-br { position: absolute; inset: calc(var(--u) * 1); background: linear-gradient(${CY}, ${CY}) 0 0/calc(var(--u) * 3) 2px, linear-gradient(${CY}, ${CY}) 0 0/2px calc(var(--u) * 3), linear-gradient(${CY}, ${CY}) 100% 100%/calc(var(--u) * 3) 2px, linear-gradient(${CY}, ${CY}) 100% 100%/2px calc(var(--u) * 3); background-repeat: no-repeat; filter: drop-shadow(0 0 5px ${CY}); }
    .c-ret { position: absolute; left: 50%; top: 50%; width: 34%; transform: translate(-50%, -50%); overflow: visible; opacity: .8; } .c-ret * { fill: none; stroke: ${CY}; stroke-width: .7; } .c-spin { will-change: transform; } .c-spin path { stroke: ${AC}; stroke-width: 1.4; }
    .c-read { display: flex; gap: calc(var(--u) * 2.4); margin-top: calc(var(--u) * 1); font: 400 clamp(12px, calc(var(--u) * 1.1), 17px)/1 "Share Tech Mono", monospace; color: ${CY}; } .c-read span:empty { display: none; } .c-read span::before { content: "> "; color: ${MG}; } .c-time { margin-left: auto; }
    .c-right { position: absolute; left: calc(5vw + var(--u) * 56); right: 5vw; top: calc(60px + 2vh); z-index: 2; display: flex; flex-direction: column; gap: calc(var(--u) * 1.5); }
    .c-cn { font: 400 calc(var(--u) * 5.4)/1 "Share Tech Mono", monospace; color: ${AC}; text-shadow: 0 0 18px rgba(215,255,58,.6); font-variant-numeric: tabular-nums; margin: calc(var(--u) * .4) 0 !important; white-space: nowrap; }
    .c-tm[data-mode="text"] .c-cn { font: 700 calc(var(--u) * 2.2)/1.1 "Orbitron", sans-serif; white-space: normal; text-transform: uppercase; }
    .c-plan { font: 400 clamp(12px, calc(var(--u) * 1.05), 16px)/1.3 "Share Tech Mono", monospace; color: ${CY}; }
    .c-row { display: flex; gap: calc(var(--u) * 1.6); align-items: flex-start; } .c-ring { width: calc(var(--u) * 14); height: calc(var(--u) * 14); flex: none; }
    .c-in { flex: 1; min-width: 0; padding: calc(var(--u) * 1); border: 1px solid rgba(255,43,214,.7); background: rgba(255,43,214,.07); clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%); } .c-nl { color: ${MG}; }
    .c-nimg { position: relative; margin: calc(var(--u) * .7) 0; aspect-ratio: 16/8; overflow: hidden; } .c-nimg img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.4) brightness(.8); mix-blend-mode: screen; transform: scale(1.4); }
    .c-nimg { background: #2a0626; } .c-nimg i { position: absolute; left: 0; right: 0; height: 22%; background: linear-gradient(180deg, transparent, rgba(255,43,214,.6)); animation: c-sweep 2.2s linear infinite; } @keyframes c-sweep { from { top: -22%; } to { top: 100%; } }
    .c-nt { font: 700 calc(var(--u) * 1.6)/1.1 "Orbitron", sans-serif; text-transform: uppercase; color: #fff; overflow-wrap: anywhere; } .c-ns { font: 400 clamp(11px, calc(var(--u) * .95), 15px)/1.3 "Share Tech Mono", monospace; color: ${MG}; margin-top: 4px !important; }
    .c-lock { margin-top: calc(var(--u) * .7); height: 5px; background: rgba(255,43,214,.2); } .c-lock i { height: 100%; width: 0; background: ${MG}; box-shadow: 0 0 10px ${MG}; }
    .c-log { font: 400 clamp(12px, calc(var(--u) * 1.05), 16px)/1.5 "Share Tech Mono", monospace; color: rgba(207,233,255,.75); min-height: 6em; } .c-log p:last-child { color: #fff; } .c-log p:last-child::after { content: "_"; color: ${AC}; animation: c-bl 1s steps(1) infinite; } @keyframes c-bl { 50% { opacity: 0; } } .c-log b { color: ${CY}; font-weight: 400; }
    .c-act { align-self: flex-start; padding: 10px 18px; border: 1px solid ${AC}; color: ${AC}; font: 400 13px/1 "Share Tech Mono", monospace; letter-spacing: .1em; text-transform: uppercase; background: rgba(215,255,58,.08); } .c-act:hover { background: ${AC}; color: #05060a; }
    .c-tl { position: absolute; left: 5vw; right: 5vw; bottom: 4vh; z-index: 2; } .c-bar { position: relative; height: 10px; background: rgba(41,240,255,.12); border-left: 2px solid ${CY}; border-right: 2px solid ${CY}; }
    .c-secs i { position: absolute; top: 0; bottom: 0; border-left: 1px solid rgba(41,240,255,.5); } .c-secs i.ch { background: rgba(41,240,255,.16); } .c-fill { position: absolute; left: 0; top: 3px; bottom: 3px; width: 0; background: ${CY}; box-shadow: 0 0 12px ${CY}; }
    .c-mix { position: absolute; top: -4px; bottom: -4px; background: repeating-linear-gradient(90deg, ${MG} 0 3px, transparent 3px 6px); box-shadow: 0 0 12px ${MG}; display: none; } .c-hd { position: absolute; top: -7px; bottom: -7px; width: 2px; background: #fff; box-shadow: 0 0 10px #fff; }
    .c-addr { display: flex; justify-content: space-between; margin-top: 7px; font: 400 11px/1 "Share Tech Mono", monospace; color: rgba(41,240,255,.6); }
    @media (max-aspect-ratio: 13/10) { .c-feed { width: 90vw; } .c-right { left: 5vw; top: auto; bottom: 12vh; } .c-row, .c-log { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".c-view canvas").getContext("2d"), r: q(".c-ring").getContext("2d"), cols: [], log: [], acc: 0, spin: 0 };
      q(".c-view").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".c-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion;
      // hex rain at 14 px cells
      const cv = q(".c-rain"), W = Math.ceil(innerWidth / 14), H = Math.ceil(innerHeight / 16);
      if (cv.width !== W * 14 || cv.height !== H * 16) { cv.width = W * 14; cv.height = H * 16; st.cols = Array.from({ length: W }, () => Math.random() * H); }
      st.acc += dt * (10 + au.level * 30) * mo;
      if (st.acc >= 1) { st.acc = 0; const g = st.rg || (st.rg = cv.getContext("2d")); g.fillStyle = "rgba(5,6,10,.13)"; g.fillRect(0, 0, cv.width, cv.height); g.font = "13px 'Share Tech Mono', monospace";
        for (let i = 0; i < W; i++) { if (i % 2) continue; g.fillStyle = Math.random() < 0.06 ? MG : Math.random() < 0.2 ? "#eaffff" : "rgba(41,240,255,.7)"; g.fillText(HEX[(Math.random() * 16) | 0], i * 14, st.cols[i] * 16); st.cols[i] += 1; if (st.cols[i] > H && Math.random() < 0.05) st.cols[i] = 0; } }
      // feed with tearing
      if (a) Y.src(q(".c-view img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const c = st.c; c.drawImage(Y.frame, 0, 0, 480, 270);
        const n = vm.beat > 0.55 ? 1 + ((vm.beat + vm.p * 2) * 2 | 0) : vm.kind === "blending" ? 1 : Math.random() < 0.03 ? 1 : 0; /* the feed tears on the kick, not continuously */
        for (let i = 0; i < n * mo; i++) { const y = (Math.random() * 250) | 0, h = 4 + ((Math.random() * 22) | 0), dx = ((Math.random() - 0.5) * 70 * (0.4 + vm.p)) | 0; c.drawImage(q(".c-view canvas"), 0, y, 480, h, dx, y, 480, h); } }
      q(".c-view canvas").style.opacity = vm.videoOk ? "1" : "0";
      st.spin = (st.spin + dt * (40 + au.level * 260) * mo) % 360; q(".c-spin").style.transform = `rotate(${st.spin.toFixed(1)}deg)`;
      Y.txt(q(".c-tag"), `sig//${vm.paused ? "hold" : vm.kind === "blending" ? "handoff" : "live"} :: ch.01`);
      Y.swap(q(".c-title"), a ? a.title : "no carrier"); Y.txt(q(".c-sub"), a ? a.sub : "awaiting a YouTube Mix");
      Y.txt(q(".c-bpm"), a && a.bpm ? `${a.bpm.toFixed(1)} BPM` : ""); Y.txt(q(".c-key"), a ? a.key : ""); Y.txt(q(".c-cam"), a ? a.cam : ""); Y.txt(q(".c-time"), vm.dur ? `${Y.fmt(vm.time)} / ${Y.fmt(vm.dur)}` : "");
      // T-minus
      const counting = vm.countdown != null; q(".c-tm").dataset.mode = counting ? "count" : "text";
      Y.txt(q(".c-cl"), counting ? (vm.paused ? "clock held" : vm.kind === "blending" ? "handoff completes" : "handoff begins") : vm.eyebrow);
      if (counting) { const t = vm.countdown, m = Math.floor(t / 60), s = Math.floor(t % 60), h = Math.floor((t * 100) % 100); Y.txt(q(".c-cn"), `T-${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(h).padStart(2, "0")}`); } else Y.txt(q(".c-cn"), vm.headline);
      Y.txt(q(".c-plan"), vm.plan ? `${vm.plan.tech} // ${vm.plan.camA} > ${vm.plan.camB} // ${vm.plan.blendLen}s window` : "");
      // spectrum ring
      const r = st.r; r.clearRect(0, 0, 260, 260); r.lineCap = "butt";
      for (let i = 0; i < 48; i++) { const v = au.bins[i < 24 ? i : 47 - i], an = (i / 48) * 6.2832 - 1.5708, r0 = 62, r1 = 64 + v * 60;
        r.strokeStyle = v > 0.6 ? MG : CY; r.lineWidth = 4; r.beginPath(); r.moveTo(130 + Math.cos(an) * r0, 130 + Math.sin(an) * r0); r.lineTo(130 + Math.cos(an) * r1, 130 + Math.sin(an) * r1); r.stroke(); }
      r.strokeStyle = AC; r.lineWidth = 1.5; r.beginPath(); r.arc(130, 130, 52, -1.5708, -1.5708 + Y.prog(vm) * 6.2832); r.stroke();
      r.fillStyle = "#fff"; r.font = "700 22px Orbitron, sans-serif"; r.textAlign = "center"; r.fillText(a && a.bpm ? String(Math.round(a.bpm)) : "--", 130, 134); r.fillStyle = CY; r.font = "11px 'Share Tech Mono', monospace"; r.fillText("BPM", 130, 150);
      // incoming
      const inn = q(".c-in"); inn.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(inn.querySelector("img"), b.thumb); Y.txt(q(".c-nl"), vm.kind === "blending" ? `acquiring ${Math.round(vm.p * 100)}%` : "incoming signal"); Y.txt(q(".c-nt"), b.title); Y.txt(q(".c-ns"), Y.meta(b, " // ") || b.sub);
        q(".c-lock i").style.width = (vm.kind === "blending" ? vm.p * 100 : vm.kind === "armed" ? 12 : vm.step >= 0 ? (vm.step + 1) * 2 : 0) + "%"; }
      // console
      const msg = vm.step >= 0 ? `analyse: ${vm.steps[vm.step]} [${vm.step + 1}/6]` : vm.status;
      if (Y.once(st, "log", msg, () => {})) { st.log.push(`<p><b>${Y.fmt(vm.time)}</b> ${Y.esc(msg)}</p>`); st.log = st.log.slice(-4); q(".c-log").innerHTML = st.log.join(""); }
      Y.showCta(q(".c-act"), vm);
      const pr = Y.prog(vm) * 100; q(".c-fill").style.width = pr + "%"; q(".c-hd").style.left = pr + "%";
      const secs = Y.sections(vm); Y.once(st, "secs", (a ? a.id : "") + secs.length, () => { q(".c-secs").innerHTML = secs.map((s) => `<i class="${s.chorus ? "ch" : ""}" style="left:${s.a * 100}%;width:${(s.b - s.a) * 100}%"></i>`).join(""); });
      const mx = Y.mix(vm), m = q(".c-mix"); m.style.display = mx ? "block" : "none"; if (mx) { m.style.left = mx.a + "%"; m.style.width = Math.max(0.8, mx.b - mx.a) + "%"; }
    },
  });
})();
