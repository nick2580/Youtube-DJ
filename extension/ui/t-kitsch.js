// Kitsch: more is more. The video sits in a gold heart, a disco ball throws light around the room, chasing bulbs
// frame the page, the next song is a rotating starburst badge, the countdown is a price tag, and the timeline is
// a rainbow with a glitter star riding it.
(() => {
  const Y = window.YTDJ;
  const HEART = "M100 178 C40 130 6 96 6 56 C6 26 30 8 56 8 C76 8 92 20 100 36 C108 20 124 8 144 8 C170 8 194 26 194 56 C194 96 160 130 100 178Z";
  const burst = Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * 6.283, r = i % 2 ? 50 : 41; return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`; }).join(",");
  Y.theme("Kitsch", {
    swatch: ["#ff2d8f", "#ffd60a"],
    cls: "kit",
    html: `
      <div class="t-dots"></div><div class="t-spots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="t-bulbs top"></div><div class="t-bulbs bot"></div>
      <div class="t-ball"><i></i></div><div class="t-float"></div>
      <div class="t-left"><p class="t-rib"></p><p class="t-cn"></p><p class="t-body"></p><div class="t-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="t-act"></button></div>
      <div class="t-heartw"><svg class="t-heart" viewBox="0 0 200 186"><defs><clipPath id="t-clip"><path d="${HEART}" transform="translate(100 93) scale(.86) translate(-100 -93)"/></clipPath>
          <linearGradient id="t-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset=".3" stop-color="#ffc21a"/><stop offset=".55" stop-color="#b87400"/><stop offset=".75" stop-color="#ffe066"/><stop offset="1" stop-color="#c98a00"/></linearGradient></defs>
          <path d="${HEART}" fill="url(#t-gold)" stroke="#2b0b3f" stroke-width="3"/><g clip-path="url(#t-clip)"><image class="t-th" x="0" y="0" width="200" height="186" preserveAspectRatio="xMidYMid slice"/><foreignObject x="0" y="0" width="200" height="186"><canvas width="400" height="372" style="width:200px;height:186px"></canvas></foreignObject></g>
          <path d="${HEART}" transform="translate(100 93) scale(.86) translate(-100 -93)" fill="none" stroke="#2b0b3f" stroke-width="3"/><path d="M40 44 C46 30 58 24 68 26" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>
        <button class="t-hit" title="Play or pause"></button><h1 class="t-title"></h1><p class="t-sub"></p></div>
      <div class="t-badge"><i class="t-star"></i><div class="t-bin"><img alt=""><p class="t-nl"></p><p class="t-nt"></p><p class="t-ns"></p></div></div>
      <footer class="t-rain"><span class="t-t0"></span><div class="t-bar"><i class="t-rest"></i><i class="t-mix"></i><b class="t-st">★</b></div><span class="t-t1"></span></footer>`,
    css: `
    .ov[data-theme="Kitsch"] .dock { top: 26px; --dk-font: "Archivo Black", sans-serif; --dk-weight: 400; --dk-size: 12px; --dk-ink: #2b0b3f; --dk-line: #2b0b3f; --dk-chip: #ffd60a; --dk-accent: #ff2d8f; --dk-on: #fff; }
    .kit { background: #ffe3f1; color: #2b0b3f; font-family: "Archivo Black", sans-serif; --ol: #2b0b3f; }
    .kit p, .kit h1 { margin: 0; font-weight: 400; }
    .t-dots { position: absolute; inset: -60px; background: radial-gradient(circle, #ff8cc6 0 9px, transparent 10px) 0 0/52px 52px, radial-gradient(circle, #ffd60a 0 5px, transparent 6px) 26px 26px/52px 52px; animation: t-slide 6s linear infinite; }
    @keyframes t-slide { to { transform: translate(52px, 52px); } }
    .t-spots i { position: absolute; left: 50%; top: 13vh; width: 9vw; height: 9vw; margin: -4.5vw; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.95), rgba(255,255,255,0) 68%); mix-blend-mode: soft-light; will-change: transform; }
    .t-bulbs { position: absolute; left: 0; right: 0; height: 26px; background: radial-gradient(circle, #fff7b0 0 5px, #ffb300 6px 8px, transparent 9px) 0 0/40px 26px, #2b0b3f; z-index: 6; animation: t-chase .5s steps(2) infinite; } .t-bulbs.top { top: 0; } .t-bulbs.bot { bottom: 0; animation-direction: reverse; }
    @keyframes t-chase { to { background-position: 40px 0, 0 0; } }
    .t-ball { position: absolute; left: 50%; top: 26px; width: 2px; height: 5vh; background: var(--ol); z-index: 3; }
    .t-ball i { position: absolute; left: 50%; top: 100%; width: calc(var(--u) * 7); height: calc(var(--u) * 7); margin-left: calc(var(--u) * -3.5); border-radius: 50%; border: 3px solid var(--ol);
      background: radial-gradient(circle at 32% 28%, rgba(255,255,255,.95), transparent 30%), radial-gradient(circle at 70% 80%, rgba(60,0,90,.55), transparent 60%), linear-gradient(90deg, rgba(43,11,63,.5) 1px, transparent 1px) var(--bx, 0) 0/12.5% 100%, linear-gradient(rgba(43,11,63,.5) 1px, transparent 1px) 0 0/100% 12.5%, linear-gradient(135deg, #e9e9ff, #b9a8ff 40%, #ff9ed6 70%, #fff3a8); }
    .t-float b { position: absolute; left: 0; top: 0; font: 400 calc(var(--u) * 2.6) "Archivo Black", sans-serif; will-change: transform, opacity; text-shadow: 2px 2px 0 var(--ol); }
    .t-heartw { position: absolute; left: 50%; top: calc(26px + 9vh); width: calc(var(--u) * 34); margin-left: calc(var(--u) * -17); text-align: center; z-index: 2; }
    .t-heart { width: 100%; overflow: visible; filter: drop-shadow(8px 10px 0 var(--ol)); will-change: transform; } .t-heart canvas { transition: opacity .8s; }
    .t-hit { position: absolute; left: 12%; right: 12%; top: 4%; height: 62%; border-radius: 50%; }
    .t-title { margin-top: calc(var(--u) * -3.6) !important; position: relative; display: inline-block; padding: .08em .5em .16em; font: 400 calc(var(--u) * 4.2)/1.05 "Shrikhand", cursive; color: #fff; background: #ff2d8f; border: 4px solid var(--ol); border-radius: 999px; box-shadow: 6px 6px 0 var(--ol); transform: rotate(-3deg); text-shadow: 3px 3px 0 var(--ol); max-width: 46vw; text-wrap: balance; }
    .t-title.re { animation: t-boing .7s cubic-bezier(.3,1.8,.5,1) both; } @keyframes t-boing { from { transform: rotate(-12deg) scale(.4); } }
    .t-sub { margin-top: calc(var(--u) * 1.1) !important; position: relative; font: 400 clamp(13px, calc(var(--u) * 1.2), 18px)/1.2 "Archivo Black", sans-serif; background: #fff; display: inline-block; padding: 6px 14px; border: 3px solid var(--ol); border-radius: 99px; }
    .t-left { position: absolute; left: 6vw; top: calc(26px + 20vh); width: calc(var(--u) * 24); z-index: 3; transform: rotate(-4deg); }
    .t-rib { display: inline-block; padding: 7px 26px 8px 16px; background: #00c2b8; color: #fff; border: 3px solid var(--ol); font: 400 calc(var(--u) * 1.3)/1 "Archivo Black", sans-serif; clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%); text-transform: uppercase; }
    .t-cn { font: 400 calc(var(--u) * 8)/1 "Shrikhand", cursive; color: #ffd60a; -webkit-text-stroke: 3px var(--ol); text-shadow: 6px 6px 0 var(--ol); font-variant-numeric: tabular-nums; margin: calc(var(--u) * .4) 0 calc(var(--u) * 1.2) !important; }
    .t-left[data-mode="text"] .t-cn { font-size: calc(var(--u) * 3.2); -webkit-text-stroke-width: 2px; text-shadow: 4px 4px 0 var(--ol); line-height: 1.05; }
    .t-body { padding: calc(var(--u) * 1) calc(var(--u) * 1.3); background: #fff; border: 3px solid var(--ol); border-radius: 18px; box-shadow: 5px 5px 0 var(--ol); font: 500 clamp(13px, calc(var(--u) * 1.2), 18px)/1.35 "Jost", sans-serif; text-wrap: pretty; }
    .t-steps { display: flex; gap: 6px; margin-top: 12px; } .t-steps i { width: 22px; height: 20px; background: #fff; clip-path: path("M11 20 C3 13 0 9 0 5 C0 2 2 0 5 0 C8 0 10 2 11 4 C12 2 14 0 17 0 C20 0 22 2 22 5 C22 9 19 13 11 20Z"); } .t-steps i[data-s="done"] { background: #ff2d8f; } .t-steps i[data-s="now"] { background: #ffd60a; animation: t-boing .6s infinite alternate; }
    .t-act { margin-top: 14px; padding: 12px 20px; background: #ffd60a; border: 3px solid var(--ol); border-radius: 99px; box-shadow: 4px 4px 0 var(--ol); font: 400 14px/1 "Archivo Black", sans-serif; }
    .t-badge { position: absolute; right: 5vw; top: calc(26px + 15vh); width: calc(var(--u) * 26); height: calc(var(--u) * 26); z-index: 3; display: grid; place-items: center; will-change: transform; }
    .t-star { position: absolute; inset: 0; background: #ffd60a; clip-path: polygon(${burst}); will-change: transform; filter: drop-shadow(6px 6px 0 var(--ol)); } .t-badge::before { content: ""; position: absolute; inset: -5px; background: var(--ol); clip-path: polygon(${burst}); }
    .t-bin { position: relative; width: 62%; text-align: center; transform: rotate(8deg); } .t-bin img { width: 46%; aspect-ratio: 1; object-fit: cover; border-radius: 50%; border: 3px solid var(--ol); transform: scale(1); }
    .t-nl { font: 400 calc(var(--u) * 1.1)/1 "Archivo Black", sans-serif; color: #ff2d8f; text-transform: uppercase; margin-top: 4px !important; } .t-nt { font: 400 calc(var(--u) * 2.1)/1 "Shrikhand", cursive; margin: 4px 0 !important; text-wrap: balance; } .t-ns { font: 600 clamp(11px, calc(var(--u) * .95), 14px)/1.2 "Jost", sans-serif; }
    .t-rain { position: absolute; left: 6vw; right: 6vw; bottom: calc(26px + 3.4vh); display: flex; align-items: center; gap: 14px; font: 400 clamp(12px, calc(var(--u) * 1.05), 16px)/1 "Archivo Black", sans-serif; z-index: 4; font-variant-numeric: tabular-nums; }
    .t-bar { position: relative; flex: 1; height: calc(var(--u) * 2); border: 3px solid var(--ol); border-radius: 99px; box-shadow: 4px 4px 0 var(--ol); background: linear-gradient(90deg, #ff2d2d, #ff9a1f, #ffd60a, #3ed65a, #00c2b8, #3b6bff, #a04bff, #ff2d8f); }
    .t-rest { position: absolute; right: 0; top: 0; bottom: 0; border-radius: 0 99px 99px 0; background: rgba(255,255,255,.78); } .t-mix { position: absolute; top: -9px; bottom: -9px; border: 3px dashed var(--ol); border-radius: 10px; background: rgba(255,45,143,.35); display: none; }
    .t-st { position: absolute; top: 50%; margin: calc(var(--u) * -1.9) 0 0 calc(var(--u) * -1.5); font: 400 calc(var(--u) * 3.4)/1 sans-serif; color: #ffd60a; -webkit-text-stroke: 2.5px var(--ol); will-change: transform; }
    @media (max-aspect-ratio: 13/10) { .t-badge { top: auto; bottom: 14vh; width: calc(var(--u) * 20); height: calc(var(--u) * 20); } .t-left { top: auto; bottom: 16vh; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, c: q(".t-heart canvas").getContext("2d"), bx: 0, ang: 0, fl: [] };
      const fw = q(".t-float"); ["♥", "★", "♥", "✿", "★", "♥", "✦", "♥"].forEach((ch, i) => { const e = document.createElement("b"); e.textContent = ch; e.style.color = ["#ff2d8f", "#ffd60a", "#00c2b8", "#a04bff"][i % 4]; fw.appendChild(e); st.fl.push({ e, x: 0.04 + Math.random() * 0.92, t: Math.random(), v: 0.05 + Math.random() * 0.06 }); });
      q(".t-hit").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".t-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p), bt = vm.paused ? 0 : vm.beat;
      if (a) Y.once(st, "th", a.thumb, () => q(".t-th").setAttribute("href", a.thumb));
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.c, Y.frame, 320, 180, 400, 372); }
      q(".t-heart canvas").style.opacity = vm.videoOk ? "1" : "0";
      q(".t-heart").style.transform = `scale(${(1 + vm.bounce * 0.04 * mo).toFixed(4)}) rotate(${(Math.sin(now / 1100) * 1.5 * mo).toFixed(2)}deg)`;
      Y.swap(q(".t-title"), a ? a.title : "Fabulous silence"); Y.txt(q(".t-sub"), a ? [a.sub, Y.meta(a)].filter(Boolean).join("  ♥  ") : "Play a YouTube Mix, darling");
      // disco ball and its light
      st.bx = (st.bx + dt * 30 * (vm.paused ? 0.1 : 1) * mo) % 100; Y.sty(q(".t-ball i"), "--bx", st.bx.toFixed(1) + "%");
      st.ang += dt * (0.25 + au.level * 0.9) * (vm.paused ? 0.1 : 1) * mo;
      st.el.querySelectorAll(".t-spots i").forEach((e, i) => { const an = st.ang + i * 0.628, r = 0.2 + (i % 3) * 0.17; e.style.transform = `translate(${(Math.cos(an) * r * innerWidth * 1.1).toFixed(1)}px,${((0.3 + Math.sin(an) * r) * innerHeight).toFixed(1)}px) scale(${(0.7 + au.bass * 1.2).toFixed(3)})`; });
      for (const f of st.fl) { f.t += dt * f.v * mo * (1 + au.level * 2); if (f.t > 1) { f.t = 0; f.x = 0.04 + Math.random() * 0.92; }
        f.e.style.transform = `translate(${(f.x * innerWidth + Math.sin(f.t * 12) * 18).toFixed(1)}px,${((1 - f.t) * innerHeight).toFixed(1)}px) rotate(${(Math.sin(f.t * 9) * 25).toFixed(1)}deg) scale(${(0.7 + bt * 0.5).toFixed(2)})`; f.e.style.opacity = Math.sin(f.t * 3.14).toFixed(3); }
      // price-tag countdown
      const cnt = Y.count(vm); q(".t-left").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".t-rib"), cnt ? (vm.paused ? "on pause!" : vm.kind === "blending" ? "big finish in" : "mixing in only") : vm.eyebrow);
      Y.txt(q(".t-cn"), cnt || vm.headline); Y.txt(q(".t-body"), vm.step >= 0 ? `Getting the next number ready: ${vm.steps[vm.step]}!` : vm.body);
      Y.stepDots(q(".t-steps"), vm); Y.showCta(q(".t-act"), vm);
      // badge
      const bd = q(".t-badge"); bd.style.visibility = b ? "visible" : "hidden";
      q(".t-star").style.transform = `rotate(${((now / 90) * mo * (1 + vm.p * 3)) % 360}deg)`;
      bd.style.transform = `scale(${(1 + pe * 0.18 + bt * 0.03).toFixed(3)})`;
      if (b) { Y.src(bd.querySelector("img"), b.thumb); Y.txt(q(".t-nl"), vm.kind === "blending" ? "here it comes!" : "coming up!"); Y.swap(q(".t-nt"), b.title); Y.txt(q(".t-ns"), Y.meta(b)); }
      // rainbow
      const pr = Y.prog(vm) * 100; q(".t-rest").style.width = 100 - pr + "%"; const s = q(".t-st"); s.style.left = pr + "%"; s.style.transform = `rotate(${(now / 14) % 360}deg) scale(${(1 + bt * 0.3).toFixed(2)})`;
      const mx = Y.mix(vm), m = q(".t-mix"); m.style.display = mx ? "block" : "none"; if (mx) { m.style.left = mx.a + "%"; m.style.width = Math.max(1, mx.b - mx.a) + "%"; }
      Y.txt(q(".t-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".t-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
