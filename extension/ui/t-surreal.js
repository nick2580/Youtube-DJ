// Surrealism: a desert at dusk. The video is what you see through a door standing alone on the plain, the next song
// is an eye in the sky that watches the cursor, the sun travels the horizon as the playhead, and a soft clock keeps
// the time left until the blend.
(() => {
  const Y = window.YTDJ;
  const CLOUD = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 84'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='.25' stop-color='#fffaf0'/><stop offset='1' stop-color='#e2c3b4'/></linearGradient><clipPath id='c'><rect width='220' height='74'/></clipPath></defs>
    <g fill='url(#g)' clip-path='url(#c)'><ellipse cx='62' cy='62' rx='56' ry='24'/><circle cx='92' cy='40' r='34'/><circle cx='134' cy='50' r='28'/><ellipse cx='156' cy='64' rx='56' ry='22'/><circle cx='56' cy='48' r='22'/><circle cx='168' cy='54' r='16'/></g></svg>`);
  const ticks = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 6.283, c = Math.cos(a), s = Math.sin(a);
    return `<line x1='${(72 + c * 44).toFixed(1)}' y1='${(37 + s * 20).toFixed(1)}' x2='${(72 + c * 50).toFixed(1)}' y2='${(37 + s * 23).toFixed(1)}'/>`; }).join("");

  Y.theme("Surrealism", {
    swatch: ["#2f4680", "#c6472a"],
    cls: "sur",
    html: `
      <div class="s-sky"></div>
      <div class="s-clouds s-far"></div>
      <div class="s-eyew"><svg class="s-eye" viewBox="0 0 200 110">
          <defs><clipPath id="s-al"><path d="M4 55 Q100 -28 196 55 Q100 138 4 55Z"/></clipPath><clipPath id="s-ir"><circle r="34"/></clipPath>
          <radialGradient id="s-sc" cx=".5" cy=".4"><stop offset=".5" stop-color="#fffaf0"/><stop offset="1" stop-color="#c9b9b4"/></radialGradient></defs>
          <g class="s-lid"><g clip-path="url(#s-al)"><rect width="200" height="110" fill="url(#s-sc)"/>
            <g class="s-iris" transform="translate(100 55)"><circle r="36" fill="#161a33"/><g clip-path="url(#s-ir)"><image class="s-irimg" x="-46" y="-34" width="92" height="69" preserveAspectRatio="xMidYMid slice"/></g>
              <circle r="34" fill="none" stroke="#161a33" stroke-width="5" opacity=".55"/><circle class="s-pupil" r="13" fill="#0b0d1c"/><circle cx="-11" cy="-13" r="5.5" fill="#fff" opacity=".92"/></g>
            <path d="M4 55 Q100 -28 196 55" fill="none" stroke="#161a33" stroke-width="16" opacity=".2"/></g>
            <path d="M4 55 Q100 -28 196 55 Q100 138 4 55Z" fill="none" stroke="#161a33" stroke-width="3.2" stroke-linejoin="round"/></g></svg>
        <div class="s-ncap"><p class="s-nl"></p><p class="s-nt"></p><p class="s-ns"></p></div></div>
      <div class="s-clouds s-near"></div>
      <div class="s-ground"><i class="s-check"></i><i class="s-haze"></i></div>
      <div class="s-hor"><i class="s-sun"></i><i class="s-ob"><b></b></i><span class="s-t0"></span><span class="s-t1"></span></div>
      <div class="s-stones"><i></i><i></i><i></i></div>
      <div class="s-head"><p class="s-eb"></p><h1 class="s-title"></h1><p class="s-sub"></p><p class="s-meta"></p></div>
      <div class="s-doorw">
        <i class="s-spill"></i><i class="s-dshadow"></i>
        <button class="s-door" title="Play or pause"><span class="s-open"><img class="s-thumb" alt=""><canvas class="s-vid" width="230" height="300"></canvas><i class="s-vig"></i></span><span class="s-leaf"><i></i><i></i><b></b></span></button>
        <i class="s-puff"></i>
      </div>
      <div class="s-clockw">
        <div class="s-plinth"><i class="s-ptop"></i><i class="s-pfront"></i>
          <svg class="s-clock" viewBox="0 0 160 212"><path class="s-cb" d="M14 37 C14 14 60 6 96 10 C128 14 146 30 146 60 C146 100 151 150 141 187 C135 208 108 210 104 187 C98 150 108 104 92 80 C80 65 14 67 14 37Z"/>
            <g class="s-tk">${ticks}<line x1="124" y1="96" x2="124" y2="110"/><line x1="122" y1="150" x2="123" y2="166"/></g>
            <g transform="translate(72 37) scale(1 .46)"><line class="s-h1" y2="-40"/><line class="s-h2" y2="-28"/><circle r="4.5" fill="#161a33"/></g></svg></div>
        <div class="s-say"><p class="s-ce"></p><p class="s-cn"></p><p class="s-body"></p><p class="s-steps"></p><button class="s-act"></button></div>
      </div>`,
    css: `
    .ov[data-theme="Surrealism"] .dock { --dk-font: "Instrument Serif", serif; --dk-weight: 400; --dk-size: 17px; --dk-track: .01em; --dk-ink: #f8eedb; --dk-line: rgba(248,238,219,.38); --dk-chip: rgba(248,238,219,.16); --dk-accent: #f3c58a; --dk-on: #1b2148; }
    .sur { background: #1f2a5c; color: #161a33; font-family: "Instrument Serif", serif; --hz: 62%; }
    .sur p, .sur h1 { margin: 0; font-weight: 400; }
    .s-sky { position: absolute; inset: 0 0 38% 0; background: linear-gradient(180deg, #182150 0%, #2f4680 28%, #5f8fae 56%, #b9c9bd 78%, #f4cf9f 94%, #f9ddb0 100%); }
    .s-clouds { position: absolute; inset: 0; pointer-events: none; }
    .s-clouds i, .s-puff { position: absolute; left: 0; top: 0; background: ${CLOUD} 0 0/100% 100% no-repeat; aspect-ratio: 220/84; will-change: transform; }
    .s-near { z-index: 3; }
    .s-ground { position: absolute; left: 0; right: 0; top: var(--hz); bottom: 0; overflow: hidden; perspective: 38vh; background: linear-gradient(180deg, #f1c890 0%, #dca265 18%, #c07a45 55%, #99542c 100%); }
    .s-check { position: absolute; left: -80%; right: -80%; top: -140%; bottom: 0; transform: rotateX(74deg); transform-origin: 50% 100%;
      background: conic-gradient(rgba(70,22,0,.2) 25%, transparent 0 50%, rgba(70,22,0,.2) 0 75%, transparent 0) 0 var(--gy, 0)/150px 150px; }
    .s-haze { position: absolute; inset: 0; background: linear-gradient(180deg, #f6d6a4 0, rgba(246,214,164,.7) 9%, rgba(240,190,130,0) 46%); }
    .s-hor { position: absolute; left: 0; right: 0; top: var(--hz); height: 0; border-top: 1px solid rgba(60,34,30,.55); z-index: 1; }
    .s-sun { position: absolute; top: 0; left: 0; width: calc(var(--u) * 4.4); height: calc(var(--u) * 4.4); margin: calc(var(--u) * -2.2); border-radius: 50%; background: radial-gradient(circle, #fff8dc 0 30%, #ffd98a 55%, #f39a4c);
      box-shadow: 0 0 calc(var(--u) * 3) calc(var(--u) * .8) rgba(255,214,140,.75), 0 0 calc(var(--u) * 12) calc(var(--u) * 3) rgba(255,190,110,.35); clip-path: inset(-400% -400% 50% -400%); will-change: left; }
    .s-ob { position: absolute; bottom: 0; width: calc(var(--u) * .7); height: calc(var(--u) * 4.2); margin-left: calc(var(--u) * -.35); display: none; }
    .s-ob::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #2a2440, #584a62); clip-path: polygon(50% 0, 100% 12%, 100% 100%, 0 100%, 0 12%); }
    .s-ob b { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%); font: italic 400 clamp(13px, calc(var(--u) * 1.05), 17px)/1 "Instrument Serif", serif; color: #2a2440; white-space: nowrap; }
    .s-t0, .s-t1 { position: absolute; top: 8px; font: italic 400 clamp(13px, calc(var(--u) * 1.05), 17px)/1 "Instrument Serif", serif; color: rgba(60,30,20,.7); font-variant-numeric: tabular-nums; }
    .s-t0 { left: 28px; } .s-t1 { right: 28px; }
    .s-stones i { position: absolute; left: 0; top: 0; background: linear-gradient(160deg, #6b5a68, #2a2440 70%); will-change: transform; }
    .s-stones i::after { content: ""; position: absolute; left: 5%; right: 5%; top: calc(100% + var(--sh, 60px)); height: 12px; border-radius: 50%; background: rgba(50,20,10,.4); filter: blur(5px); }
    .s-stones i:nth-child(1) { width: calc(var(--u) * 5.4); height: calc(var(--u) * 3.6); clip-path: polygon(8% 40%, 30% 6%, 68% 0, 96% 34%, 86% 82%, 48% 100%, 14% 86%); }
    .s-stones i:nth-child(2) { width: calc(var(--u) * 3); height: calc(var(--u) * 2.2); clip-path: polygon(0 50%, 34% 0, 84% 12%, 100% 60%, 62% 100%, 16% 90%); }
    .s-stones i:nth-child(3) { width: calc(var(--u) * 1.7); height: calc(var(--u) * 1.4); clip-path: polygon(10% 30%, 60% 0, 100% 50%, 70% 100%, 14% 86%); }
    .s-stones i:nth-child(n)::after { clip-path: none; }

    .s-head { position: absolute; left: 5.5vw; top: calc(60px + 5vh); width: 27vw; z-index: 4; }
    .s-eb { font: italic 400 clamp(15px, calc(var(--u) * 1.4), 23px)/1 "Instrument Serif", serif; color: #f6d9a8; }
    .s-title { margin-top: calc(var(--u) * .6) !important; font: 400 calc(var(--u) * 7)/.94 "Instrument Serif", serif; color: #fbf3e2; letter-spacing: -.012em; text-shadow: 0 calc(var(--u) * .9) calc(var(--u) * 1.6) rgba(10,14,50,.5); }
    .s-title .w { display: inline-block; white-space: nowrap; margin-right: .22em; }
    .s-title .c { display: inline-block; animation: s-float 5.5s ease-in-out infinite; }
    @keyframes s-float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-.085em) rotate(-1.4deg); } }
    .s-title.re .c { animation: s-float 5.5s ease-in-out infinite, s-rise 1.3s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes s-rise { from { opacity: 0; translate: 0 .5em; } }
    .s-sub { margin-top: calc(var(--u) * 1.1) !important; font: italic 400 clamp(17px, calc(var(--u) * 1.7), 27px)/1.2 "Instrument Serif", serif; color: #f1e2c8; text-wrap: balance; }
    .s-meta { margin-top: calc(var(--u) * .5) !important; font: 400 clamp(14px, calc(var(--u) * 1.15), 18px)/1.2 "Instrument Serif", serif; color: #f1e2c8; }

    /* the door */
    .s-doorw { position: absolute; left: 44%; top: 84%; width: 0; height: 0; z-index: 2; --dw: calc(var(--u) * 21); --dh: calc(var(--u) * 29); }
    .s-door { position: absolute; left: calc(var(--dw) / -2); bottom: 0; width: var(--dw); height: var(--dh); padding: calc(var(--u) * .9) calc(var(--u) * .9) 0; cursor: pointer; perspective: calc(var(--u) * 120);
      background: linear-gradient(90deg, #cdbfa6, #fbf3e2 14%, #f3e8d2 86%, #b9a98f); box-shadow: 0 0 0 1px rgba(60,40,30,.5), calc(var(--u) * -.5) 0 calc(var(--u) * 1) rgba(40,20,10,.3); }
    .s-open { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; background: #161a33; box-shadow: inset 0 0 0 1px rgba(40,20,10,.6); }
    .s-thumb, .s-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .s-thumb { transform: scale(1.34); }
    .s-vid { transition: opacity 1.2s ease; filter: saturate(1.12) contrast(1.04); }
    .s-vig { position: absolute; inset: 0; box-shadow: inset 0 0 calc(var(--u) * 3) rgba(10,10,40,.75), inset calc(var(--u) * 1.4) 0 calc(var(--u) * 2) rgba(10,10,40,.5); background: linear-gradient(180deg, transparent 70%, rgba(255,220,160,.22)); }
    .s-leaf { position: absolute; left: calc(var(--u) * .9); top: calc(var(--u) * .9); bottom: 0; width: calc(100% - var(--u) * 1.8); transform-origin: 0 50%; transform: rotateY(-115deg); will-change: transform;
      background: linear-gradient(90deg, #6d1c0d, #a93319 30%, #b83a1e 75%, #8f2812); box-shadow: inset 0 0 0 1px rgba(50,10,0,.7), inset 0 0 calc(var(--u) * 2) rgba(50,10,0,.4); display: block; }
    .s-leaf i { position: absolute; left: 14%; right: 14%; border: 1px solid rgba(50,10,0,.55); box-shadow: inset 2px 2px 0 rgba(255,150,110,.3); }
    .s-leaf i:nth-child(1) { top: 7%; height: 38%; } .s-leaf i:nth-child(2) { top: 52%; height: 40%; }
    .s-leaf b { position: absolute; right: 6%; top: 49%; width: calc(var(--u) * .9); height: calc(var(--u) * .9); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff3c0, #c9962e 55%, #6d4a10); box-shadow: 1px 2px 3px rgba(40,10,0,.6); }
    .s-spill { position: absolute; left: calc(var(--dw) / -2 + var(--u) * .9); top: 0; width: calc(var(--dw) - var(--u) * 1.8); height: 16vh; transform-origin: 50% 0; transform: perspective(30vh) rotateX(-58deg) scaleX(1.25);
      background: linear-gradient(180deg, var(--c1, #ffd9a0), transparent 85%); opacity: .5; mix-blend-mode: soft-light; filter: blur(3px); }
    .s-dshadow { position: absolute; left: calc(var(--dw) / 2 - 2px); top: -3px; width: calc(var(--u) * 30); height: calc(var(--u) * 2.2); transform-origin: 0 0; transform: skewX(64deg) rotate(4deg); background: linear-gradient(90deg, rgba(60,22,8,.5), rgba(60,22,8,0)); filter: blur(4px); }
    .s-puff { left: calc(var(--dw) * -.72); top: calc(var(--u) * -3.4); width: calc(var(--u) * 9); animation: s-puff 9s ease-in-out infinite; }
    @keyframes s-puff { 50% { transform: translate(calc(var(--u) * -1.2), calc(var(--u) * -.5)); } }

    /* the eye */
    .s-eyew { position: absolute; left: 77%; top: 27%; width: 0; height: 0; z-index: 2; }
    .s-eye { position: absolute; width: calc(var(--u) * 21); left: calc(var(--u) * -10.5); top: calc(var(--u) * -5.8); overflow: visible; will-change: transform; filter: drop-shadow(0 calc(var(--u) * 1.4) calc(var(--u) * 1.8) rgba(10,14,50,.45)); }
    .s-lid { transform-origin: 100px 55px; transition: transform .11s ease-in; }
    .s-eye.blink .s-lid { transform: scaleY(.04); }
    .s-ncap { position: absolute; left: calc(var(--u) * -12); width: calc(var(--u) * 24); top: calc(var(--u) * 6.6); text-align: center; }
    .s-nl { font: italic 400 clamp(14px, calc(var(--u) * 1.3), 21px)/1 "Instrument Serif", serif; color: #fbe3b8; }
    .s-nt { margin-top: 4px !important; font: 400 calc(var(--u) * 3)/1 "Instrument Serif", serif; color: #fffaf0; text-shadow: 0 2px 14px rgba(10,14,50,.6); text-wrap: balance; }
    .s-nt.re { animation: s-rise 1.2s ease both; }
    .s-ns { margin-top: 5px !important; font: italic 400 clamp(13px, calc(var(--u) * 1.15), 18px)/1.2 "Instrument Serif", serif; color: rgba(255,246,228,.85); }

    /* soft clock + what happens next */
    .s-clockw { position: absolute; left: 62%; right: 3.5vw; bottom: 5.5vh; display: flex; align-items: flex-end; gap: calc(var(--u) * 2.2); z-index: 4; }
    .s-plinth { position: relative; flex: none; width: calc(var(--u) * 11); height: calc(var(--u) * 10.4); }
    .s-ptop { position: absolute; left: 0; right: 0; top: 0; height: calc(var(--u) * 3); transform-origin: 0 100%; transform: skewX(-24deg); background: linear-gradient(180deg, #7d86a8, #5b6590); }
    .s-pfront { position: absolute; left: 0; right: 0; top: calc(var(--u) * 3); bottom: 0; background: linear-gradient(90deg, #343c6a, #232a55); box-shadow: calc(var(--u) * 1.6) calc(var(--u) * .4) calc(var(--u) * 1.4) rgba(50,20,10,.4); }
    .s-clock { position: absolute; left: 4%; top: calc(var(--u) * -.9); width: calc(var(--u) * 9.2); overflow: visible; filter: drop-shadow(calc(var(--u) * .25) calc(var(--u) * .5) calc(var(--u) * .5) rgba(20,10,30,.5)); transform-origin: 50% 12%; will-change: transform; }
    .s-cb { fill: #f8eedb; stroke: #b88a35; stroke-width: 4.5; stroke-linejoin: round; }
    .s-tk line { stroke: #161a33; stroke-width: 2.2; stroke-linecap: round; }
    .s-h1, .s-h2 { stroke: #161a33; stroke-width: 3.6; stroke-linecap: round; } .s-h2 { stroke: #b3361c; stroke-width: 4.6; }
    .s-say { flex: 1; min-width: 0; padding-bottom: calc(var(--u) * .4); color: #fff4e0; text-shadow: 0 1px 10px rgba(70,25,5,.55); }
    .s-ce { font: italic 400 clamp(15px, calc(var(--u) * 1.4), 23px)/1 "Instrument Serif", serif; color: #ffe6ba; }
    .s-cn { font: 400 calc(var(--u) * 6.4)/1 "Instrument Serif", serif; font-variant-numeric: tabular-nums; letter-spacing: -.01em; margin: calc(var(--u) * .2) 0 calc(var(--u) * .5) !important; }
    .s-clockw[data-mode="text"] .s-cn { font-size: calc(var(--u) * 3); line-height: 1.02; margin: calc(var(--u) * .6) 0 calc(var(--u) * .7) !important; text-wrap: balance; }
    .s-body { font: 400 clamp(15px, calc(var(--u) * 1.3), 21px)/1.28 "Instrument Serif", serif; text-wrap: pretty; max-width: 30em; }
    .s-steps { margin-top: 6px !important; font: italic 400 clamp(14px, calc(var(--u) * 1.15), 18px)/1.2 "Instrument Serif", serif; color: #ffe6ba; }
    .s-act { margin-top: calc(var(--u) * .9); padding: 9px 18px 10px; border-radius: 999px; background: #f8eedb; color: #1b2148; font: 400 17px/1 "Instrument Serif", serif; box-shadow: 0 6px 16px rgba(60,20,5,.4); text-shadow: none; }
    .s-act:hover { background: #fff; }
    @media (max-aspect-ratio: 13/10) { .s-head { width: 40vw; } .s-doorw { left: 30%; } .s-plinth { display: none; } .s-clockw { left: 50%; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, vc: q(".s-vid").getContext("2d"), clouds: [], gy: 0, blinkAt: performance.now() + 2500, ex: 0, ey: 0, leaf: 112, k: {} };
      const mk = (wrap, n, ymin, ymax, smin, smax) => { for (let i = 0; i < n; i++) { const e = document.createElement("i"); const s = smin + Math.random() * (smax - smin);
        e.style.width = s + "vw"; wrap.appendChild(e); st.clouds.push({ e, s, x: Math.random() * 1.3 - 0.15, y: ymin + Math.random() * (ymax - ymin), v: (0.0035 + Math.random() * 0.004) * (s / 14) }); } };
      mk(q(".s-far"), 3, 0.05, 0.075, 8, 13); mk(q(".s-far"), 2, 0.5, 0.55, 10, 16); mk(q(".s-near"), 2, 0.47, 0.54, 8, 12);
      st.stones = [...q(".s-stones").children].map((e, i) => ({ e, x: [0.13, 0.57, 0.9][i], y: [0.7, 0.53, 0.66][i], ph: i * 2.1, a: [1, 0.7, 0.5][i] }));
      q(".s-door").onclick = () => Y.source.act.playPause();
      Y.bindCta(q(".s-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q, k } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, u = Math.min(innerWidth / 100, innerHeight * 0.0172);
      const once = (key, val, fn) => { if (k[key] !== val) { k[key] = val; fn(); } };

      // title: every letter floats on its own
      const title = a ? a.title : "A door in the desert";
      once("title", title, () => {
        const h = q(".s-title"); let n = 0;
        h.innerHTML = title.split(/\s+/).map((w) => `<span class="w">${[...w].map((c) => `<span class="c" style="animation-delay:${(-(n++) * 0.37).toFixed(2)}s, ${(n * 0.045).toFixed(2)}s">${c.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join("")}</span>`).join("");
        h.style.fontSize = `calc(var(--u) * ${title.length > 26 ? 3.8 : title.length > 15 ? 4.9 : title.length > 9 ? 6 : 7.4})`;
        h.classList.remove("re"); void h.offsetWidth; h.classList.add("re");
      });
      Y.txt(q(".s-eb"), vm.paused ? "paused, mid-dream" : vm.kind === "blending" ? "leaving through the door" : "now playing");
      Y.txt(q(".s-sub"), a ? a.sub : vm.body);
      Y.txt(q(".s-meta"), a && a.bpm ? `${Math.round(a.bpm)} beats a minute, in ${a.key}` : "");

      // through the door
      if (a) Y.src(q(".s-thumb"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.vc, Y.frame, 320, 180, 230, 300); }
      q(".s-vid").style.opacity = vm.videoOk ? "1" : "0";
      const want = vm.kind === "blending" ? 114 + 34 * Y.ease(vm.p) : vm.kind === "armed" || vm.kind === "arrival" ? 114 : 100;
      st.leaf += (want - st.leaf) * Math.min(1, dt * 1.6);
      q(".s-leaf").style.transform = `rotateY(${(-st.leaf - au.bass * 2.5).toFixed(2)}deg)`;
      const flash = vm.sinceDrop < 4 ? 1 - vm.sinceDrop / 4 : 0;
      const sp = q(".s-spill");
      Y.sty(sp, "--c1", a ? a.c1 : "#ffd9a0");
      sp.style.opacity = Y.clamp(0.35 + au.level * 0.55 + flash * 0.4 + vm.p * 0.2).toFixed(3);

      // sky and ground drift
      for (const c of st.clouds) {
        c.x -= c.v * dt * mo; if (c.x < -0.3) c.x = 1.1;
        c.e.style.transform = `translate(${(c.x * innerWidth - Y.mouse.x * c.s * 0.9).toFixed(1)}px,${(c.y * innerHeight - Y.mouse.y * c.s * 0.4).toFixed(1)}px)`;
      }
      st.gy = (((vm.flow / 4 * (mo < 1 ? 0.25 : 1)) % 1) + 1) % 1 * 150; /* the plain drifts one tile per bar */
      Y.sty(q(".s-check"), "--gy", st.gy.toFixed(1) + "px");
      for (const s of st.stones) {
        s.ph += dt * 0.7;
        const lift = (Math.sin(s.ph) * 0.9 + au.bass * 3.2 * s.a) * u * mo;
        s.e.style.transform = `translate(${(s.x * innerWidth).toFixed(1)}px,${(s.y * innerHeight - lift).toFixed(1)}px) rotate(${(Math.sin(s.ph * 0.6) * 5).toFixed(2)}deg)`;
        Y.sty(s.e, "--sh", (u * 4.5 * s.a + lift).toFixed(1) + "px");
      }

      // horizon: the sun is the playhead, an obelisk marks where the blend begins
      const pr = vm.dur ? Y.clamp(vm.time / vm.dur) : 0;
      q(".s-sun").style.left = (3 + pr * 94) + "%";
      const ob = q(".s-ob"), ms = vm.plan && vm.plan.mixStart != null && vm.dur ? vm.plan.mixStart / vm.dur : null;
      ob.style.display = ms != null ? "block" : "none";
      if (ms != null) { ob.style.left = (3 + ms * 94) + "%"; Y.txt(ob.firstElementChild, `the blend, ${Y.fmt(vm.plan.mixStart)}`); }
      Y.txt(q(".s-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".s-t1"), vm.dur ? Y.fmt(vm.dur) : "");

      // the eye: next song in its iris, following the cursor, blinking now and then
      const ew = q(".s-eyew"); ew.style.visibility = b ? "visible" : "hidden";
      if (b) {
        once("iris", b.thumb, () => q(".s-irimg").setAttribute("href", b.thumb));
        Y.txt(q(".s-nl"), vm.kind === "blending" ? "it is arriving" : vm.kind === "skipping" ? "it looks away" : "watching from next in line");
        Y.swap(q(".s-nt"), b.title);
        Y.txt(q(".s-ns"), b.bpm ? `${b.sub ? b.sub + ", " : ""}${Math.round(b.bpm)} bpm, ${b.key}` : b.sub);
        const r = q(".s-eye").getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = Y.mouse.px - cx, dy = Y.mouse.py - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 420);
        st.ex += ((dx / d) * 30 * m - st.ex) * Math.min(1, dt * 7); st.ey += ((dy / d) * 13 * m - st.ey) * Math.min(1, dt * 7);
        q(".s-iris").setAttribute("transform", `translate(${(100 + st.ex).toFixed(1)} ${(55 + st.ey).toFixed(1)})`);
        q(".s-pupil").setAttribute("r", (12 + au.bass * 7 + vm.p * 4).toFixed(1));
        if (now > st.blinkAt) { const e = q(".s-eye"); e.classList.add("blink"); setTimeout(() => e.classList.remove("blink"), 130); st.blinkAt = now + 2600 + Math.random() * 4800; }
        const pe = Y.ease(vm.p);
        q(".s-eye").style.transform = `translateY(${(Math.sin(now / 1900) * 0.5 * u * mo + pe * u * 1.2).toFixed(1)}px) scale(${(1 + pe * 0.24).toFixed(3)})`;
      }

      // soft clock
      const counting = vm.countdown != null;
      q(".s-clockw").dataset.mode = counting ? "count" : "text";
      const cd = counting ? vm.countdown : (now / 1000) % 60;
      q(".s-h2").setAttribute("transform", `rotate(${(-(cd % 60) * 6).toFixed(1)})`);
      q(".s-h1").setAttribute("transform", `rotate(${(pr * 360).toFixed(1)})`);
      q(".s-clock").style.transform = `scaleY(${(1 + Math.sin(now / 2300) * 0.018 * mo + au.bass * 0.02).toFixed(4)}) skewX(${(Math.sin(now / 3100) * 0.8 * mo).toFixed(2)}deg)`;
      Y.txt(q(".s-ce"), counting ? (vm.paused ? "time stands still" : vm.kind === "blending" ? "the new song lands in" : "the songs melt together in") : vm.eyebrow.toLowerCase());
      if (counting) Y.txt(q(".s-cn"), Y.fmt(Math.ceil(vm.countdown))); else Y.txt(q(".s-cn"), vm.headline);
      Y.txt(q(".s-body"), vm.step >= 0 ? "The next song is being read before it arrives." : vm.body);
      Y.txt(q(".s-steps"), vm.step >= 0 ? `${vm.steps[vm.step]}, step ${vm.step + 1} of 6` : counting && vm.plan ? `${vm.plan.tech.toLowerCase()}, ${vm.plan.camA} to ${vm.plan.camB}, ${vm.plan.blendLen} seconds` : "");
      Y.showCta(q(".s-act"), vm);
    },
  });
})();
