// Mid-century: a screen-printed jazz sleeve. The video is a halftone seen through four cut-out windows that ride
// the bass, mids and highs; a sunburst clock counts down to the blend; the next song is a record half out of its
// sleeve; the song's structure is a strip of colour swatches.
(() => {
  const Y = window.YTDJ;
  const C = { paper: "#f0e4cc", ink: "#33241a", orange: "#cf5a2a", mustard: "#dba43b", teal: "#2a7a76", mint: "#a9c9bd", sand: "#dccfb0" };
  const GRAIN = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .2  0 0 0 0 .14  0 0 0 0 .1  0 0 0 .5 -.12'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
  const BOOM = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 120'><path d='M8 84 Q58 -24 152 28 Q104 40 74 112 Q50 104 8 84Z' fill='${C.teal}'/></svg>`);
  const BURST = (c) => Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='-12 -12 24 24'><g stroke='${c}' stroke-width='1.5' stroke-linecap='round'>${[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((a, i) => `<line y1='${i % 2 ? -7 : -11}' y2='${i % 2 ? 7 : 11}' transform='rotate(${a})'/>`).join("")}</g></svg>`);
  const rays = Array.from({ length: 12 }, (_, i) => { const long = i % 2 === 0, len = long ? 92 : 62, col = [C.ink, C.orange, C.ink, C.teal, C.ink, C.mustard][i % 6];
    return `<g transform='rotate(${i * 30})'><line y1='-30' y2='${-len}' stroke='${C.ink}' stroke-width='${long ? 2.6 : 2}'/>${long ? `<circle cy='${-len - 6}' r='7' fill='${col === C.ink ? C.orange : col}'/>` : `<rect x='-4' y='${-len - 8}' width='8' height='8' fill='${col === C.ink ? C.teal : col}' transform='rotate(45 0 ${-len - 4})'/>`}</g>`; }).join("");
  const PILLS = [{ bg: C.mustard, ink: C.ink, h: 0.74, y: 0.08, dark: true }, { bg: C.teal, ink: C.paper, h: 0.92, y: -0.02, dark: false },
    { bg: C.orange, ink: C.paper, h: 0.8, y: 0.05, dark: false }, { bg: C.ink, ink: C.mustard, h: 0.62, y: -0.07, dark: false }];
  const SEC = { chorus: C.orange, verse: C.mint, bridge: C.mustard, intro: C.sand, outro: C.sand, inst: C.teal, solo: C.teal, break: C.sand };

  Y.theme("Mid-Century", {
    swatch: ["#dba43b", "#2a7a76"],
    cls: "mid",
    html: `
      <div class="m-shapes"><i class="m-s1"></i><i class="m-s2"></i><i class="m-s3"></i><i class="m-s4"></i><i class="m-o1"></i><i class="m-o2"></i><b class="m-b1"></b><b class="m-b2"></b><b class="m-b3"></b></div>
      <header class="m-head">
        <p class="m-eb"></p><h1 class="m-title"></h1><p class="m-sub"></p>
        <p class="m-meta"><span class="m-bpm"></span><span class="m-key"></span><span class="m-cam"></span></p>
        <p class="m-body"></p><div class="m-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="m-act"></button>
      </header>
      <button class="m-slats" title="Play or pause"><canvas width="640" height="560"></canvas></button>
      <aside class="m-right">
        <div class="m-clockw"><svg class="m-clock" viewBox="-110 -110 220 220"><g class="m-rays">${rays}</g><circle r="30" fill="${C.ink}"/><circle r="24" fill="none" stroke="${C.mustard}" stroke-width="1.5"/>
          <line class="m-h1" y2="-19" stroke="${C.paper}" stroke-width="4" stroke-linecap="round"/><line class="m-h2" y2="-24" stroke="${C.orange}" stroke-width="2.2" stroke-linecap="round"/><circle r="3.4" fill="${C.mustard}"/></svg>
          <div class="m-count"><p class="m-cl"></p><p class="m-cn"></p><p class="m-ct"></p></div></div>
        <div class="m-nextw"><div class="m-sleevew"><i class="m-rec"><i></i></i><div class="m-sleeve"><img alt=""><i class="m-sl1"></i><i class="m-sl2"></i><span>side two</span></div></div>
          <div class="m-nx"><p class="m-nl"></p><p class="m-nt"></p><p class="m-ns"></p></div></div>
      </aside>
      <footer class="m-tl"><div class="m-tlt"><span class="m-t0"></span><span class="m-t1"></span></div><div class="m-strip"><div class="m-segs"></div><i class="m-mix"><b>the blend</b></i><i class="m-ph"></i></div><i class="m-done"></i></footer>
      <div class="m-grain"></div>`,
    css: `
    .ov[data-theme="Mid-Century"] .dock { --dk-font: "Jost", sans-serif; --dk-size: 14px; --dk-ink: ${C.ink}; --dk-line: rgba(51,36,26,.4); --dk-chip: rgba(51,36,26,.1); --dk-accent: ${C.orange}; --dk-on: #fff8ec; }
    .mid { background: ${C.paper}; color: ${C.ink}; font-family: "Jost", sans-serif; }
    .mid p, .mid h1 { margin: 0; }
    .m-grain { position: absolute; inset: 0; background: ${GRAIN}; mix-blend-mode: multiply; opacity: .8; pointer-events: none; z-index: 9; }
    .m-shapes i, .m-shapes b { position: absolute; will-change: transform; }
    .m-s1 { left: -15vw; bottom: -30vw; width: 54vw; height: 54vw; border-radius: 50%; background: ${C.mustard}; }
    .m-s2 { right: 31vw; top: -7vh; width: 22vw; height: 16.5vw; background: ${BOOM} 0 0/100% 100% no-repeat; opacity: .92; }
    .m-s3 { right: -9vw; bottom: 9vh; width: 30vw; height: 24vw; border-radius: 58% 42% 55% 45% / 48% 60% 40% 52%; background: ${C.mint}; }
    .m-s4 { left: 31vw; top: 13vh; width: 3.2vw; height: 3.2vw; border-radius: 50%; background: ${C.orange}; }
    .m-o1, .m-o2 { left: 34vw; top: 12vh; width: 36vw; height: 15vw; border: 1.5px solid rgba(51,36,26,.5); border-radius: 50%; }
    .m-o2 { border-color: rgba(51,36,26,.28); }
    .m-shapes b { width: 3.4vw; height: 3.4vw; background: ${BURST(C.ink)} 0 0/100% 100%; animation: m-spin 26s linear infinite; }
    .m-b1 { left: 3vw; top: 11vh; } .m-b2 { right: 32vw; bottom: 20vh; width: 2.2vw !important; height: 2.2vw !important; background-image: ${BURST(C.orange)} !important; animation-direction: reverse !important; } .m-b3 { right: 3vw; top: 46vh; width: 2.6vw !important; height: 2.6vw !important; }
    @keyframes m-spin { to { transform: rotate(360deg); } }

    .m-head { position: absolute; left: 6vw; top: calc(60px + 7vh); width: 31vw; z-index: 3; }
    .m-eb { font: 500 clamp(14px, calc(var(--u) * 1.25), 20px)/1 "Jost", sans-serif; color: ${C.orange}; display: flex; align-items: center; gap: .6em; }
    .m-eb::before { content: ""; width: .7em; height: .7em; border-radius: 50%; background: ${C.orange}; transform: scale(var(--bt, 1)); }
    .m-title { margin-top: calc(var(--u) * 1) !important; font: 700 calc(var(--u) * 8)/.86 "Jost", sans-serif; letter-spacing: -.045em; text-transform: lowercase; overflow-wrap: anywhere; }
    .m-title.re { animation: m-print .9s steps(5) both; }
    @keyframes m-print { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 -10% -20% 0); } }
    .m-sub { margin-top: calc(var(--u) * 1.5) !important; font: 400 clamp(16px, calc(var(--u) * 1.65), 26px)/1.2 "Jost", sans-serif; text-wrap: balance; }
    .m-meta { margin-top: calc(var(--u) * 1.1) !important; display: flex; flex-wrap: wrap; gap: .4em 1.3em; font: 500 clamp(13px, calc(var(--u) * 1.15), 18px)/1 "Jost", sans-serif; font-variant-numeric: tabular-nums; }
    .m-meta span { display: flex; align-items: center; gap: .5em; } .m-meta span:empty { display: none; }
    .m-meta span::before { content: ""; width: .72em; height: .72em; background: ${C.teal}; }
    .m-bpm::before { border-radius: 50%; background: ${C.orange} !important; } .m-key::before { clip-path: polygon(50% 0, 100% 100%, 0 100%); } .m-cam::before { background: ${C.ink} !important; }
    .m-body { margin-top: calc(var(--u) * 2.6) !important; max-width: 27em; font: 400 clamp(15px, calc(var(--u) * 1.3), 20px)/1.42 "Jost", sans-serif; text-wrap: pretty; }
    .m-steps { display: flex; gap: 8px; margin-top: 14px; }
    .m-steps i { width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid ${C.ink}; transition: background .5s ease; }
    .m-steps i[data-s="done"] { background: ${C.ink}; } .m-steps i[data-s="now"] { background: ${C.orange}; animation: m-now 1.2s ease-in-out infinite; }
    @keyframes m-now { 50% { transform: scale(.6); } }
    .m-act { margin-top: 16px; height: 42px; padding: 0 22px; border-radius: 999px; background: ${C.ink}; color: ${C.paper}; font: 500 15px/1 "Jost", sans-serif; }
    .m-act:hover { background: ${C.orange}; }

    .m-slats { position: absolute; left: 36.5vw; top: calc(60px + 8vh); width: calc(var(--u) * 36); z-index: 2; cursor: pointer; display: block; }
    .m-slats canvas { width: 100%; height: auto; }

    .m-right { position: absolute; right: 5vw; top: calc(60px + 5vh); bottom: 16vh; width: calc(var(--u) * 25); z-index: 3; display: flex; flex-direction: column; justify-content: space-between; }
    .m-clockw { display: flex; align-items: center; gap: calc(var(--u) * 1.6); }
    .m-clock { width: calc(var(--u) * 13.5); flex: none; overflow: visible; }
    .m-rays { will-change: transform; }
    .m-cl { font: 500 clamp(14px, calc(var(--u) * 1.25), 20px)/1 "Jost", sans-serif; color: ${C.orange}; }
    .m-cn { font: 300 calc(var(--u) * 5.6)/1 "Jost", sans-serif; letter-spacing: -.03em; font-variant-numeric: tabular-nums; margin: calc(var(--u) * .3) 0 !important; }
    .m-right[data-mode="text"] .m-cn { font: 600 calc(var(--u) * 2)/1.08 "Jost", sans-serif; letter-spacing: -.02em; text-wrap: balance; }
    .m-ct { font: 400 clamp(13px, calc(var(--u) * 1.1), 17px)/1.3 "Jost", sans-serif; }
    .m-nextw { display: flex; align-items: flex-end; gap: calc(var(--u) * 5.4); }
    .m-sleevew { position: relative; flex: none; width: calc(var(--u) * 11.5); height: calc(var(--u) * 11.5); }
    .m-sleeve { position: absolute; inset: 0; overflow: hidden; background: ${C.orange}; box-shadow: calc(var(--u) * .5) calc(var(--u) * .5) 0 ${C.ink}; }
    .m-sleeve img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.25) brightness(1.7); mix-blend-mode: multiply; transform: scale(1.36); }
    .m-sl1 { position: absolute; left: -22%; bottom: -30%; width: 74%; height: 74%; border-radius: 50%; background: ${C.teal}; mix-blend-mode: multiply; }
    .m-sl2 { position: absolute; right: 8%; top: 8%; width: 16%; height: 16%; border-radius: 50%; background: ${C.paper}; }
    .m-sleeve span { position: absolute; left: 8%; top: 8%; font: 600 clamp(9px, calc(var(--u) * .78), 12px)/1 "Jost", sans-serif; color: ${C.paper}; }
    .m-rec { position: absolute; inset: 4%; border-radius: 50%; background: repeating-radial-gradient(circle, #1d1410 0 1.5px, #33241a 1.5px 3px); will-change: transform; }
    .m-rec i { position: absolute; inset: 33%; border-radius: 50%; background: radial-gradient(circle, ${C.paper} 0 12%, ${C.mustard} 13%); will-change: transform; }
    .m-rec i::after { content: ""; position: absolute; left: 50%; top: 12%; width: 2px; height: 24%; background: ${C.ink}; }
    .m-nx { min-width: 0; padding-bottom: calc(var(--u) * .3); }
    .m-nl { font: 500 clamp(14px, calc(var(--u) * 1.25), 20px)/1 "Jost", sans-serif; color: ${C.teal}; }
    .m-nt { margin: calc(var(--u) * .5) 0 !important; font: 700 calc(var(--u) * 2.5)/.95 "Jost", sans-serif; letter-spacing: -.035em; text-transform: lowercase; overflow-wrap: anywhere; }
    .m-nt.re { animation: m-print .7s steps(4) both; }
    .m-ns { font: 400 clamp(13px, calc(var(--u) * 1.1), 17px)/1.3 "Jost", sans-serif; }

    .m-tl { position: absolute; left: 6vw; right: 5vw; bottom: 4.5vh; z-index: 4; }
    .m-tlt { display: flex; justify-content: space-between; font: 500 clamp(13px, calc(var(--u) * 1.05), 16px)/1 "Jost", sans-serif; font-variant-numeric: tabular-nums; margin-bottom: 9px; }
    .m-strip { position: relative; height: calc(var(--u) * 2.3); min-height: 26px; }
    .m-segs { position: absolute; inset: 0; display: flex; gap: 3px; }
    .m-segs span { height: 100%; min-width: 0; padding: 0 9px; display: flex; align-items: center; overflow: hidden; white-space: nowrap; font: 500 clamp(11px, calc(var(--u) * .92), 14px)/1 "Jost", sans-serif; color: ${C.ink}; }
    .m-mix { position: absolute; top: -5px; bottom: -5px; border: 2px solid ${C.ink}; background: repeating-linear-gradient(135deg, ${C.ink} 0 2px, transparent 2px 8px); display: none; }
    .m-mix b { position: absolute; left: 0; bottom: calc(100% + 7px); font: 600 clamp(12px, calc(var(--u) * 1), 15px)/1 "Jost", sans-serif; white-space: nowrap; }
    .m-ph { position: absolute; top: -9px; width: 0; height: 0; margin-left: -8px; border: 8px solid transparent; border-top: 11px solid ${C.ink}; border-bottom: 0; }
    .m-ph::after { content: ""; position: absolute; left: -1px; top: 0; width: 2px; height: calc(var(--u) * 2.3 + 6px); min-height: 32px; background: ${C.ink}; }
    .m-done { margin-top: 5px; height: 4px; width: 0; background: ${C.ink}; }
    @media (max-aspect-ratio: 13/10) { .m-right { width: calc(var(--u) * 22); } .m-slats { left: 34vw; width: calc(var(--u) * 26); top: 40vh; } .m-nx { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, cx: q(".m-slats canvas").getContext("2d"), lum: null, k: {}, rec: 0, sp: [0, 0, 0, 0], kick: 0, px: null };
      q(".m-slats").onclick = () => Y.source.act.playPause();
      Y.bindCta(q(".m-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q, k } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion;
      const once = (key, val, fn) => { if (k[key] !== val) { k[key] = val; fn(); } };
      const flash = vm.sinceDrop < 2.5 ? 1 - vm.sinceDrop / 2.5 : 0;

      // paper shapes drift with the pointer
      const mx = Y.mouse.x, my = Y.mouse.y, tt = (now / 1000) * mo;
      q(".m-s1").style.transform = `translate(${(mx * -14).toFixed(1)}px,${(my * -10).toFixed(1)}px) scale(${(1 + au.bass * 0.025).toFixed(4)})`;
      q(".m-s2").style.transform = `translate(${(mx * 26).toFixed(1)}px,${(my * 18).toFixed(1)}px) rotate(${(Math.sin(tt / 7) * 7).toFixed(2)}deg)`;
      q(".m-s3").style.transform = `translate(${(mx * -22).toFixed(1)}px,${(my * -16).toFixed(1)}px) rotate(${(tt * 1.6 % 360).toFixed(2)}deg)`;
      q(".m-s4").style.transform = `translate(${(mx * 40).toFixed(1)}px,${(my * 30 - vm.beat * 10 * mo).toFixed(1)}px)`;
      q(".m-o1").style.transform = `rotate(${(-18 + tt * 3).toFixed(2)}deg)`; q(".m-o2").style.transform = `rotate(${(40 - tt * 2.2).toFixed(2)}deg)`;

      // headline
      Y.txt(q(".m-eb"), vm.paused ? "paused" : vm.kind === "blending" ? "playing out" : "now playing");
      Y.sty(q(".m-eb"), "--bt", (1 + vm.beat * 0.7).toFixed(2));
      const title = a ? a.title : "youtube dj";
      if (Y.swap(q(".m-title"), title)) q(".m-title").style.fontSize = `calc(var(--u) * ${title.length > 28 ? 3.6 : title.length > 18 ? 4.6 : title.length > 11 ? 6 : 8})`;
      Y.txt(q(".m-sub"), a ? a.sub : "");
      Y.txt(q(".m-bpm"), a && a.bpm ? `${Math.round(a.bpm)} bpm` : ""); Y.txt(q(".m-key"), a ? a.key.toLowerCase() : ""); Y.txt(q(".m-cam"), a ? a.cam : "");
      Y.txt(q(".m-body"), vm.countdown != null ? vm.body : vm.step >= 0 ? `Reading the next record: ${vm.steps[vm.step]}.` : vm.body);
      const steps = q(".m-steps"); steps.style.display = vm.step >= 0 ? "flex" : "none";
      [...steps.children].forEach((e, i) => { const s = i < vm.step ? "done" : i === vm.step ? "now" : "todo"; if (e.dataset.s !== s) e.dataset.s = s; });
      Y.showCta(q(".m-act"), vm);

      // halftone windows
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const d = Y.pixels(100, 56); if (d) { st.px = st.px || new Uint8Array(64 * 56); for (let y = 0; y < 56; y++) for (let x = 0; x < 64; x++) { const i = (y * 100 + x + 18) * 4; st.px[y * 64 + x] = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; } } }
      const c = st.cx, W = 640, H = 560, bands = [au.bass, (au.bass + au.mid) / 2, au.mid, au.high];
      c.clearRect(0, 0, W, H);
      PILLS.forEach((p, i) => {
        st.sp[i] += (bands[i] - st.sp[i]) * Math.min(1, dt * 10);
        const w = 124, x = 36 + i * 148, h = H * p.h * (1 + st.sp[i] * 0.07) - 40, wave = Math.sin(now / 700 - i * 1.2) * (vm.p * 26 + flash * 34) * mo;
        const y = (H - h) / 2 + p.y * H - (st.sp[i] - 0.25) * 54 * mo + wave - vm.bounce * (i % 2 ? 11 : 7) * mo; /* every window hops on the beat */
        c.save(); c.beginPath(); c.roundRect(x, y, w, h, 62); c.clip();
        c.fillStyle = p.bg; c.fillRect(x, y, w, h);
        c.fillStyle = p.ink;
        if (st.px && vm.videoOk) {
          const x0 = Math.floor(x / 10), x1 = Math.ceil((x + w) / 10), y0 = Math.max(0, Math.floor(y / 10)), y1 = Math.min(56, Math.ceil((y + h) / 10));
          c.beginPath();
          for (let gy = y0; gy < y1; gy++) for (let gx = x0; gx < x1; gx++) {
            const l = st.px[gy * 64 + gx] / 255, r = (p.dark ? 1 - l : l) * 6.6;
            if (r < 0.7) continue;
            const cxp = gx * 10 + 5 + (gy & 1 ? 2.5 : -2.5), cyp = gy * 10 + 5;
            c.moveTo(cxp + r, cyp); c.arc(cxp, cyp, r, 0, 6.283);
          }
          c.fill();
        } else { c.globalAlpha = 0.5; for (let r = 30; r < 400; r += 26) { c.beginPath(); c.arc(x + w / 2, y + h * 0.3, r, 0, 6.283); c.lineWidth = 6; c.strokeStyle = p.ink; c.stroke(); } }
        c.restore();
      });

      // sunburst clock
      const pr = vm.dur ? Y.clamp(vm.time / vm.dur) : 0, counting = vm.countdown != null;
      q(".m-rays").style.transform = `rotate(${(tt * 4 % 360).toFixed(2)}deg) scale(${(1 + vm.bounce * 0.07 * mo + flash * 0.12).toFixed(4)})`;
      q(".m-h1").setAttribute("transform", `rotate(${(pr * 360).toFixed(1)})`);
      q(".m-h2").setAttribute("transform", `rotate(${(counting ? -(vm.countdown % 60) * 6 : (now / 1000 % 60) * 6).toFixed(1)})`);
      q(".m-right").dataset.mode = counting ? "count" : "text";
      Y.txt(q(".m-cl"), vm.eyebrow.toLowerCase());
      Y.txt(q(".m-cn"), counting ? Y.fmt(Math.ceil(vm.countdown)) : vm.headline);
      Y.txt(q(".m-ct"), counting && vm.plan ? `${vm.plan.tech.toLowerCase()}, ${vm.plan.camA} to ${vm.plan.camB}, ${vm.plan.blendLen} sec` : "");

      // next record
      q(".m-nextw").style.visibility = b ? "visible" : "hidden";
      if (b) {
        Y.src(q(".m-sleeve img"), b.thumb);
        Y.txt(q(".m-nl"), vm.kind === "blending" ? "coming in" : vm.kind === "skipping" ? "skipped" : "next");
        Y.swap(q(".m-nt"), b.title);
        Y.txt(q(".m-ns"), b.bpm ? `${Math.round(b.bpm)} bpm, ${b.key.toLowerCase()}` : b.sub);
      }
      st.rec = (st.rec + dt * (vm.paused ? 0 : 200) * (0.25 + vm.p) * mo) % 360;
      q(".m-rec").style.transform = `translateX(${(34 + Y.ease(vm.p) * 30).toFixed(1)}%)`;
      q(".m-rec i").style.transform = `rotate(${st.rec.toFixed(1)}deg)`;

      // colour-swatch timeline
      const secs = Y.sections(vm);
      once("segs", (a ? a.id : "") + secs.length + Math.round(vm.dur), () => {
        q(".m-segs").innerHTML = secs.length ? secs.map((s) => `<span style="flex:${(s.b - s.a).toFixed(4)};background:${SEC[s.label] || C.sand}${s.chorus ? `;color:${C.paper}` : ""}">${(s.b - s.a) > 0.06 ? s.label : ""}</span>`).join("")
          : `<span style="flex:1;background:${C.sand}">${vm.dur ? "mapping the sections" : ""}</span>`;
      });
      q(".m-ph").style.left = pr * 100 + "%"; q(".m-done").style.width = pr * 100 + "%";
      const mix = q(".m-mix"), ms = vm.plan && Y.pct(vm, vm.plan.mixStart), me = vm.plan && Y.pct(vm, vm.plan.mixEnd);
      if (ms != null && me != null) { mix.style.display = "block"; mix.style.left = ms + "%"; mix.style.width = Math.max(0.8, me - ms) + "%"; } else mix.style.display = "none";
      Y.txt(q(".m-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".m-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
