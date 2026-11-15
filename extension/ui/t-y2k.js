// Y2K: a liquid-chrome gadget floating in a bubble sky. The video is a backlit dot-matrix LCD, the spectrum is a
// segment display, the next song is a CD waiting in its jewel case, and the blend is a loading bar.
(() => {
  const Y = window.YTDJ;
  const LCD = ["#04124a", "#0a2a86", "#1456c4", "#2f93e6", "#6fd6f7", "#c9fbff"];
  const STAR = "polygon(50% 0, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0 50%, 42% 42%)";

  Y.theme("Y2K", {
    swatch: ["#b9c8ff", "#ff3fb4"],
    cls: "y2k",
    html: `
      <div class="y-sky"><i class="y-b1"></i><i class="y-b2"></i></div>
      <div class="y-big y-bigA"><span></span></div><div class="y-big y-bigB"><span></span></div>
      <div class="y-floor"><i></i></div>
      <div class="y-bubbles"></div><div class="y-stars"></div>
      <div class="y-stage">
        <section class="y-dev"><div class="y-in">
          <div class="y-bezel"><div class="y-lcd"><img class="y-thumb" alt=""><canvas class="y-dots" width="480" height="270"></canvas><i class="y-glare"></i></div><span class="y-tag">now playing</span></div>
          <div class="y-side">
            <div class="y-marq"><div class="y-marq-in"><span></span><span></span></div></div>
            <div class="y-reads"><div><b class="y-r-bpm">--</b><span>bpm</span></div><div><b class="y-r-key">--</b><span>key</span></div><div><b class="y-r-cam">--</b><span>wheel</span></div></div>
            <canvas class="y-eq" width="336" height="120"></canvas>
          </div>
          <div class="y-bar">
            <button class="y-play" title="Play or pause"><i></i></button>
            <div class="y-prog"></div>
            <div class="y-time"></div>
          </div>
        </div></section>
        <section class="y-next">
          <div class="y-count"><span class="y-cl"></span><b class="y-cn"></b></div>
          <div class="y-win">
            <div class="y-wt"><i></i><i></i><i></i><span class="y-wtt"></span></div>
            <div class="y-wb">
              <div class="y-case"><div class="y-cd"><img alt=""><i></i></div><i class="y-lid"></i></div>
              <div class="y-nt"></div><div class="y-ns"></div>
              <p class="y-body"></p>
              <div class="y-load"></div><div class="y-lc"></div>
              <button class="y-act"></button>
            </div>
          </div>
        </section>
      </div>`,
    css: `
    .ov[data-theme="Y2K"] .dock { --dk-font: "Chakra Petch", sans-serif; --dk-weight: 600; --dk-size: 13px; --dk-ink: #18206a; --dk-line: rgba(24,32,106,.4); --dk-chip: rgba(255,255,255,.55); --dk-accent: #2247ff; --dk-on: #fff; }
    .y2k { background: #c9d2ff; color: #141a5c; font-family: "Chakra Petch", sans-serif; }
    .y2k p { margin: 0; }
    .y-sky { position: absolute; inset: 0; background: linear-gradient(165deg, #a9b8ff 0%, #d6c1ff 36%, #f4cdea 58%, #b6ecf4 82%, #eafcff 100%); }
    .y-sky i { position: absolute; border-radius: 50%; filter: blur(70px); animation: y-drift 26s ease-in-out infinite alternate; }
    .y-b1 { left: -10%; top: -20%; width: 55vw; height: 55vw; background: rgba(90,120,255,.55); }
    .y-b2 { right: -12%; bottom: -30%; width: 60vw; height: 60vw; background: rgba(255,110,210,.4); animation-delay: -9s; animation-duration: 33s; }
    @keyframes y-drift { to { transform: translate(9vw, 6vh) scale(1.15); } }
    .y-big { position: absolute; left: 0; white-space: nowrap; font: 400 17vh/1 "Michroma", sans-serif; color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.62); text-transform: uppercase; pointer-events: none; will-change: transform; }
    .y-bigA { top: 9vh; } .y-bigB { bottom: 5vh; -webkit-text-stroke-color: rgba(34,71,255,.26); }
    .y-floor { position: absolute; left: -40%; right: -40%; bottom: 0; height: 46%; perspective: 46vh; overflow: hidden; -webkit-mask-image: linear-gradient(to top, #000 15%, transparent 92%); mask-image: linear-gradient(to top, #000 15%, transparent 92%); }
    .y-floor i { position: absolute; inset: -60% 0 0 0; transform: rotateX(63deg); transform-origin: 50% 100%;
      background: linear-gradient(rgba(34,71,255,.42) 2px, transparent 2px) 0 var(--gy, 0)/72px 72px, linear-gradient(90deg, rgba(255,63,180,.34) 2px, transparent 2px) 0 0/72px 72px; }
    .y-bubbles i { position: absolute; left: 0; top: 0; border-radius: 50%; will-change: transform; border: 1px solid rgba(255,255,255,.75);
      background: radial-gradient(circle at 30% 26%, #fff 0 5%, rgba(255,255,255,.35) 14%, transparent 34%), radial-gradient(circle at 72% 78%, rgba(255,120,225,.55), transparent 46%), radial-gradient(circle at 24% 80%, rgba(120,255,240,.4), transparent 40%), radial-gradient(circle, rgba(160,190,255,.08) 40%, rgba(70,100,255,.34));
      box-shadow: inset 0 0 14px rgba(255,255,255,.55), 0 10px 26px -10px rgba(40,60,200,.45); }
    .y-stars i { position: absolute; background: #fff; clip-path: ${STAR}; filter: drop-shadow(0 0 6px #fff); animation: y-tw 2.8s ease-in-out infinite; }
    @keyframes y-tw { 0%, 100% { transform: scale(.25) rotate(0); opacity: .3; } 50% { transform: scale(1) rotate(45deg); opacity: 1; } }
    .y-stage { position: absolute; inset: 60px 0 0 0; display: flex; align-items: center; justify-content: center; gap: calc(var(--u) * 3.4); padding-bottom: 3vh; }

    /* the gadget */
    .y-dev { width: calc(var(--u) * 60); flex: none; padding: calc(var(--u) * 1.7); border-radius: calc(var(--u) * 9) calc(var(--u) * 9) calc(var(--u) * 12) calc(var(--u) * 12) / calc(var(--u) * 8) calc(var(--u) * 8) calc(var(--u) * 11) calc(var(--u) * 11);
      background: linear-gradient(172deg, #ffffff 0%, #d5dbea 14%, #8b96b4 30%, #f1f4fb 46%, #a4aeca 60%, #fbfcff 76%, #8792b2 100%);
      box-shadow: inset 0 2px 1px #fff, inset 0 calc(var(--u) * -.7) calc(var(--u) * 1.2) rgba(28,38,100,.45), 0 calc(var(--u) * 3.4) calc(var(--u) * 5) calc(var(--u) * -2) rgba(40,50,190,.6), 0 0 0 1px rgba(60,70,130,.5);
      will-change: transform; position: relative; }
    .y-in { position: relative; border-radius: inherit; padding: calc(var(--u) * 2.6) calc(var(--u) * 3) calc(var(--u) * 2.4); display: grid; grid-template-columns: calc(var(--u) * 30) 1fr; gap: calc(var(--u) * 1.5) calc(var(--u) * 1.7);
      background: repeating-linear-gradient(0deg, rgba(255,255,255,.14) 0 2px, transparent 2px 5px), linear-gradient(180deg, rgba(120,232,255,.9), rgba(44,116,255,.88) 70%, rgba(90,70,255,.9));
      box-shadow: inset 0 calc(var(--u) * .5) calc(var(--u) * 1) rgba(10,30,120,.6), inset 0 -2px 2px rgba(255,255,255,.6); overflow: hidden; }
    .y-in::before { content: ""; position: absolute; left: 7%; right: 7%; top: 2%; height: 32%; border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,0)); pointer-events: none; }
    .y-bezel { position: relative; padding: calc(var(--u) * .7); border-radius: calc(var(--u) * 1.6); background: linear-gradient(180deg, #2a3158, #0b1030); box-shadow: 0 2px 0 rgba(255,255,255,.7), inset 0 2px 5px #000; }
    .y-lcd { position: relative; aspect-ratio: 16/9; border-radius: calc(var(--u) * 1); overflow: hidden; background: ${LCD[0]}; }
    .y-thumb, .y-dots { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .y-thumb { filter: grayscale(1) contrast(1.3) brightness(.8); mix-blend-mode: screen; opacity: .55; transform: scale(1.34); }
    .y-dots { transition: opacity .8s ease; }
    .y-dots.flat { filter: grayscale(1) contrast(1.2) sepia(1) hue-rotate(170deg) saturate(3.4); }
    .y-glare { position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,.22) 0 22%, transparent 36%), radial-gradient(ellipse at 50% 120%, rgba(120,230,255,.3), transparent 60%); box-shadow: inset 0 0 calc(var(--u) * 2) rgba(0,10,60,.9); }
    .y-tag { position: absolute; left: calc(var(--u) * 1.5); top: calc(var(--u) * 1.3); padding: 3px 7px 4px; background: #ff3fb4; color: #fff; font: 400 clamp(8px, calc(var(--u) * .68), 11px)/1 "Silkscreen", monospace; border-radius: 3px; }
    .y-side { display: flex; flex-direction: column; gap: calc(var(--u) * 1); min-width: 0; }
    .y-marq, .y-reads > div, .y-eq { background: #06164a; border-radius: calc(var(--u) * .7); box-shadow: 0 1px 0 rgba(255,255,255,.75), inset 0 2px 4px #000; }
    .y-marq { height: calc(var(--u) * 3.4); overflow: hidden; display: flex; align-items: center; }
    .y-marq-in { display: flex; white-space: nowrap; font: 400 clamp(11px, calc(var(--u) * 1.25), 20px)/1 "Silkscreen", monospace; color: #9ff6ff; text-shadow: 0 0 8px rgba(120,230,255,.9); will-change: transform; }
    .y-marq-in span { padding-right: 3em; }
    .y-reads { display: grid; grid-template-columns: 1fr 1.25fr 1fr; gap: calc(var(--u) * .7); }
    .y-reads > div { padding: calc(var(--u) * .6) calc(var(--u) * .8); display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .y-reads b { font: 400 clamp(11px, calc(var(--u) * 1.1), 18px)/1 "Michroma", sans-serif; color: #c9fbff; text-shadow: 0 0 8px rgba(120,230,255,.8); white-space: nowrap; overflow: hidden; }
    .y-reads span { font: 400 clamp(8px, calc(var(--u) * .62), 10px)/1 "Silkscreen", monospace; color: #5aa7ea; }
    .y-eq { flex: 1; width: 100%; min-height: 0; padding: calc(var(--u) * .7); }
    .y-bar { grid-column: 1 / -1; display: flex; align-items: center; gap: calc(var(--u) * 1.5); }
    .y-play { flex: none; width: calc(var(--u) * 5.2); height: calc(var(--u) * 5.2); border-radius: 50%; position: relative;
      background: radial-gradient(circle at 50% 18%, rgba(255,255,255,.95) 0 14%, transparent 42%), radial-gradient(circle at 50% 100%, #ff9ee0, transparent 60%), linear-gradient(180deg, #ff5cc0, #d9148f);
      box-shadow: 0 0 0 calc(var(--u) * .3) #eef1f8, 0 0 0 calc(var(--u) * .36) #7480a4, 0 calc(var(--u) * .6) calc(var(--u) * 1) rgba(20,20,90,.55), inset 0 -3px 6px rgba(120,0,70,.6); transition: transform .12s ease; }
    .y-play:active { transform: scale(.94); }
    .y-play i { position: absolute; left: 50%; top: 50%; width: 0; height: 0; margin: calc(var(--u) * -.85) 0 0 calc(var(--u) * -.5); border: solid transparent; border-width: calc(var(--u) * .85) 0 calc(var(--u) * .85) calc(var(--u) * 1.4); border-left-color: #fff; filter: drop-shadow(0 1px 1px rgba(120,0,70,.8)); }
    .y-play.on i { width: calc(var(--u) * 1.3); height: calc(var(--u) * 1.6); margin: calc(var(--u) * -.8) 0 0 calc(var(--u) * -.65); border: 0; background: linear-gradient(90deg, #fff 0 36%, transparent 36% 64%, #fff 64%); }
    .y-prog { flex: 1; height: calc(var(--u) * 2.2); padding: calc(var(--u) * .4); display: flex; gap: 2px; background: #06164a; border-radius: calc(var(--u) * .7); box-shadow: 0 1px 0 rgba(255,255,255,.75), inset 0 2px 4px #000; }
    .y-prog i { flex: 1; border-radius: 1.5px; background: #0f2a78; }
    .y-prog i.ch { background: #1b3fa6; }
    .y-prog i.mx { background: #6a1766; }
    .y-prog i.on { background: #7fe9ff; box-shadow: 0 0 6px rgba(120,230,255,.9); }
    .y-prog i.on.mx { background: #ff5cc0; box-shadow: 0 0 6px #ff5cc0; }
    .y-prog i.hd { background: #fff; box-shadow: 0 0 9px #fff; }
    .y-time { flex: none; font: 400 clamp(10px, calc(var(--u) * 1), 16px)/1 "Michroma", sans-serif; color: #fff; text-shadow: 0 1px 2px rgba(10,20,110,.9); font-variant-numeric: tabular-nums; }

    /* countdown and the next disc */
    .y-next { width: calc(var(--u) * 27); flex: none; display: flex; flex-direction: column; gap: calc(var(--u) * 1.6); }
    .y-count { display: flex; flex-direction: column; gap: calc(var(--u) * .5); min-height: calc(var(--u) * 8.4); justify-content: flex-end; }
    .y-cl { font: 400 clamp(10px, calc(var(--u) * .95), 15px)/1 "Silkscreen", monospace; color: #2247ff; }
    .y-cn { font: 400 calc(var(--u) * 6)/1 "Michroma", sans-serif; letter-spacing: -.02em; font-variant-numeric: tabular-nums; white-space: nowrap;
      background: linear-gradient(180deg, #2e3a7e 0%, #f4f6ff 44%, #1a2466 52%, #7f93e0 78%, #e9edff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 2px 0 rgba(255,255,255,.9)) drop-shadow(0 6px 10px rgba(34,71,255,.4)); }
    .y-count[data-mode="text"] .y-cn { font-size: calc(var(--u) * 2.3); line-height: 1.15; white-space: normal; letter-spacing: 0; }
    .y-win { border-radius: calc(var(--u) * 1.4); background: linear-gradient(180deg, rgba(255,255,255,.82), rgba(236,240,255,.66)); border: 1px solid #fff; box-shadow: 0 0 0 1px rgba(60,70,150,.45), 0 calc(var(--u) * 2) calc(var(--u) * 3.4) calc(var(--u) * -1.6) rgba(40,50,190,.6); backdrop-filter: blur(10px); overflow: hidden; }
    .y-wt { height: calc(var(--u) * 2.5); min-height: 26px; padding: 0 calc(var(--u) * 1); display: flex; align-items: center; gap: 6px; background: repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px), linear-gradient(180deg, #e9edfb, #b9c3e2); border-bottom: 1px solid rgba(60,70,150,.4); }
    .y-wt i { width: 11px; height: 11px; border-radius: 50%; background: radial-gradient(circle at 40% 30%, #fff, #62d9ff 45%, #1c63ff); box-shadow: 0 0 0 1px rgba(20,40,130,.5); }
    .y-wt i:nth-child(2) { background: radial-gradient(circle at 40% 30%, #fff, #ff8fd6 45%, #e0199a); } .y-wt i:nth-child(3) { background: radial-gradient(circle at 40% 30%, #fff, #d7ff7a 45%, #7fcf00); }
    .y-wtt { margin-left: auto; font: 400 clamp(9px, calc(var(--u) * .75), 12px)/1 "Silkscreen", monospace; color: #2b356f; }
    .y-wb { padding: calc(var(--u) * 1.5); display: grid; grid-template-columns: calc(var(--u) * 9.4) 1fr; gap: calc(var(--u) * .5) calc(var(--u) * 1.6); align-items: start; }
    .y-case { grid-row: span 2; position: relative; width: calc(var(--u) * 9.4); height: calc(var(--u) * 9.4); }
    .y-lid { position: absolute; inset: 0; border-radius: calc(var(--u) * .5); background: linear-gradient(125deg, rgba(255,255,255,.7) 0 16%, rgba(255,255,255,.08) 30% 62%, rgba(255,255,255,.4)), rgba(140,170,255,.2); border: 1px solid rgba(255,255,255,.95); box-shadow: 0 0 0 1px rgba(60,70,150,.4), inset calc(var(--u) * .9) 0 0 rgba(30,40,110,.16); pointer-events: none; }
    .y-cd { position: absolute; inset: 5%; border-radius: 50%; will-change: transform; background: conic-gradient(from 0deg, #e7ecff, #ffb8ec, #b7f6ff, #fff7b0, #c8c2ff, #b7ffd9, #ffc9c2, #e7ecff); box-shadow: 0 0 0 1px rgba(60,70,150,.5), 0 6px 14px rgba(30,40,150,.4); }
    .y-cd img { position: absolute; inset: 24%; width: 52%; height: 52%; border-radius: 50%; object-fit: cover; }
    .y-cd i { position: absolute; inset: 42%; border-radius: 50%; background: #e9edfb; box-shadow: 0 0 0 calc(var(--u) * .35) rgba(255,255,255,.55), inset 0 1px 3px rgba(0,0,60,.6); }
    .y-nt { align-self: end; font: 400 clamp(13px, calc(var(--u) * 1.45), 24px)/1.2 "Michroma", sans-serif; color: #141a5c; text-wrap: balance; overflow-wrap: anywhere; }
    .y-nt.re, .y-cn.re { animation: y-pop .5s cubic-bezier(.3,1.6,.5,1) both; }
    @keyframes y-pop { from { opacity: 0; transform: scale(.86); } }
    .y-ns { font: 400 clamp(12px, calc(var(--u) * 1), 16px)/1.3 "Chakra Petch", sans-serif; color: #3c4688; }
    .y-body { grid-column: 1 / -1; margin-top: calc(var(--u) * .7) !important; font: 400 clamp(13px, calc(var(--u) * 1.08), 17px)/1.4 "Chakra Petch", sans-serif; color: #222b6e; text-wrap: pretty; }
    .y-load { grid-column: 1 / -1; display: flex; gap: 3px; height: calc(var(--u) * 1.5); min-height: 14px; padding: 3px; margin-top: calc(var(--u) * .5); border-radius: 5px; background: #fff; box-shadow: inset 0 1px 3px rgba(20,30,110,.55), 0 0 0 1px rgba(60,70,150,.4); }
    .y-load i { flex: 1; border-radius: 2px; background: #dfe5fb; }
    .y-load i.on { background: linear-gradient(180deg, #8fe6ff, #2247ff 60%, #1a2fc0); } .y-load i.now { background: linear-gradient(180deg, #ffc3ec, #ff3fb4); animation: y-bl .7s steps(2) infinite; }
    @keyframes y-bl { 50% { opacity: .3; } }
    .y-lc { grid-column: 1 / -1; font: 400 clamp(9px, calc(var(--u) * .74), 12px)/1.3 "Silkscreen", monospace; color: #2247ff; }
    .y-act { grid-column: 1 / -1; justify-self: start; margin-top: calc(var(--u) * .5); height: 36px; padding: 0 18px; border-radius: 999px; font: 600 13px/1 "Chakra Petch", sans-serif; color: #fff;
      background: radial-gradient(ellipse 80% 50% at 50% 0, rgba(255,255,255,.85), transparent 70%), linear-gradient(180deg, #4d7dff, #1a2fc0); box-shadow: 0 0 0 1px #14228c, 0 4px 10px rgba(30,40,190,.5); }
    @media (max-aspect-ratio: 13/10) { .y-stage { flex-direction: column; gap: calc(var(--u) * 1.5); } .y-count { min-height: 0; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, dc: q(".y-dots").getContext("2d"), ec: q(".y-eq").getContext("2d"), bub: [], peaks: new Float32Array(24), gy: 0, mx: 0, bx: 0, cd: 0, k: {} };
      const bw = q(".y-bubbles");
      for (let i = 0; i < 11; i++) { const e = document.createElement("i"); const s = 26 + Math.random() * Math.random() * 150; e.style.width = e.style.height = s + "px"; bw.appendChild(e);
        st.bub.push({ e, s, x: Math.random(), y: Math.random() * 1.2, v: 0.012 + Math.random() * 0.03, ph: Math.random() * 6.28, d: 0.3 + s / 180 }); }
      q(".y-stars").innerHTML = Array.from({ length: 9 }, () => { const s = 10 + Math.random() * 26;
        return `<i style="left:${4 + Math.random() * 92}%;top:${8 + Math.random() * 80}%;width:${s}px;height:${s}px;animation-delay:${-Math.random() * 3}s;animation-duration:${2 + Math.random() * 2.5}s"></i>`; }).join("");
      q(".y-prog").innerHTML = "<i></i>".repeat(48);
      q(".y-play").onclick = () => Y.source.act.playPause();
      Y.bindCta(q(".y-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q, k } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion;
      const once = (key, val, fn) => { if (k[key] !== val) { k[key] = val; fn(); } };
      const bpm = (a && a.bpm) || 100, sp = vm.paused ? 0 : bpm / 100;

      // sky: kinetic titles, grid floor rushing past, bubbles
      once("bigA", a ? a.title : "YouTube DJ", () => { q(".y-bigA span").textContent = ((a ? a.title : "YouTube DJ") + " ✦ ").repeat(8); });
      once("bigB", b ? b.title : "", () => { q(".y-bigB span").textContent = b ? (b.title + " ✧ ").repeat(8) : ""; });
      st.bx = (st.bx + dt * 46 * sp * mo) % 4000;
      const wA = q(".y-bigA span").offsetWidth / 8 || 1, wB = q(".y-bigB span").offsetWidth / 8 || 1;
      q(".y-bigA").style.transform = `translateX(${(-(st.bx % wA)).toFixed(1)}px)`;
      q(".y-bigB").style.transform = `translateX(${(-wB + ((st.bx * 0.7) % wB)).toFixed(1)}px)`;
      st.gy = (((vm.flow * (mo < 1 ? 0.25 : 1)) % 1) + 1) % 1 * 72; /* one grid line per beat */
      Y.sty(q(".y-floor i"), "--gy", st.gy.toFixed(1) + "px");
      for (const o of st.bub) {
        o.y -= o.v * dt * mo * (1 + vm.p * 2 + au.level); o.ph += dt;
        if (o.y < -0.25) { o.y = 1.15; o.x = Math.random(); }
        const x = (o.x + Math.sin(o.ph * 0.6) * 0.02) * innerWidth - Y.mouse.x * 24 * o.d, y = o.y * innerHeight - Y.mouse.y * 18 * o.d;
        o.e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(1 + au.bass * 0.22 * o.d).toFixed(3)})`;
      }
      q(".y-dev").style.transform = `translateY(${(Math.sin(now / 1400) * 5 * mo).toFixed(1)}px) rotate(${(-1.2 + Y.mouse.x * 0.8).toFixed(2)}deg) scale(${(1 + au.bass * 0.008).toFixed(4)})`;

      // dot-matrix LCD
      if (a) Y.src(q(".y-thumb"), a.thumb);
      const dots = q(".y-dots");
      if (vm.videoOk && Y.frameTick !== st.ft) {
        st.ft = Y.frameTick;
        const d = Y.pixels(96, 54), c = st.dc;
        if (d) {
          c.fillStyle = LCD[0]; c.fillRect(0, 0, 480, 270);
          let last = -1;
          for (let y = 0, i = 0; y < 54; y++) for (let x = 0; x < 96; x++, i += 4) {
            const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11 + (((x + y) & 1) ? 10 : -10);
            const lv = l < 34 ? 0 : l < 76 ? 1 : l < 118 ? 2 : l < 162 ? 3 : l < 208 ? 4 : 5;
            if (!lv) continue;
            if (lv !== last) { c.fillStyle = LCD[lv]; last = lv; }
            c.fillRect(x * 5, y * 5, 4, 4);
          }
        } else { c.drawImage(Y.frame, 0, 0, 480, 270); dots.classList.add("flat"); }
      }
      dots.style.opacity = vm.videoOk ? "1" : "0";
      Y.txt(q(".y-tag"), vm.paused ? "paused" : vm.kind === "blending" ? "fading out" : "now playing");

      // marquee + readouts
      const line = a ? `${a.title}  ***  ${a.sub || "youtube mix"}  ***  ` : "play a youtube mix to start the set  ***  ";
      once("marq", line, () => { q(".y-marq-in").children[0].textContent = line; q(".y-marq-in").children[1].textContent = line; st.mw = 0; });
      if (!st.mw) st.mw = q(".y-marq-in").children[0].offsetWidth;
      st.mx = (st.mx + dt * 54 * mo * (vm.paused ? 0.2 : 1)) % (st.mw || 1);
      q(".y-marq-in").style.transform = `translateX(${(-st.mx).toFixed(1)}px)`;
      Y.txt(q(".y-r-bpm"), a && a.bpm ? a.bpm.toFixed(1) : "--");
      Y.txt(q(".y-r-key"), a && a.key ? a.key.replace(" major", " maj").replace(" minor", " min") : "--");
      Y.txt(q(".y-r-cam"), a && a.cam ? a.cam : "--");

      // segment spectrum with falling peaks
      const e = st.ec; e.clearRect(0, 0, 336, 120);
      for (let i = 0; i < 24; i++) {
        const v = Math.min(1, au.bins[i] * 1.25), n = Math.round(v * 10);
        st.peaks[i] = Math.max(st.peaks[i] - dt * 0.55, v);
        const pk = Math.min(9, Math.round(st.peaks[i] * 10));
        for (let s = 0; s < 10; s++) {
          e.fillStyle = s === pk && pk > 0 ? "#ff5cc0" : s < n ? (s > 7 ? "#c9fbff" : "#4fc4f5") : "#0d2670";
          e.fillRect(i * 14, 120 - (s + 1) * 12, 11, 9);
        }
      }

      // transport
      q(".y-play").classList.toggle("on", !vm.paused);
      const pi = vm.dur ? Math.floor(Y.clamp(vm.time / vm.dur) * 48) : -1;
      const secs = Y.sections(vm), pl = vm.plan;
      once("prog", `${pi}|${secs.length}|${pl ? pl.mixStart : ""}|${Math.round(vm.dur)}`, () => {
        [...q(".y-prog").children].forEach((s, i) => {
          const c = (i + 0.5) / 48, t = c * vm.dur;
          s.className = (i < pi ? "on " : i === pi ? "hd " : "") + (pl && pl.mixStart != null && t >= pl.mixStart && t <= pl.mixEnd + vm.dur / 48 ? "mx " : "") + (secs.some((x) => x.chorus && c >= x.a && c < x.b) ? "ch" : "");
        });
      });
      Y.txt(q(".y-time"), vm.dur ? `${Y.fmt(vm.time)} / ${Y.fmt(vm.dur)}` : "--:--");

      // countdown
      const counting = vm.countdown != null;
      q(".y-count").dataset.mode = counting ? "count" : "text";
      Y.txt(q(".y-cl"), vm.eyebrow);
      if (counting) Y.txt(q(".y-cn"), Y.fmt(Math.ceil(vm.countdown))); else Y.swap(q(".y-cn"), vm.headline);

      // the next disc
      q(".y-win").style.visibility = b || !a ? "visible" : "hidden";
      Y.txt(q(".y-wtt"), vm.kind === "blending" ? "crossfade.exe" : vm.kind === "analysing" ? "analysing.exe" : "up_next.cd");
      if (b) { Y.src(q(".y-cd img"), b.thumb); Y.swap(q(".y-nt"), b.title); Y.txt(q(".y-ns"), b.bpm ? `${Math.round(b.bpm)} bpm / ${b.key}` : b.sub); }
      else { Y.txt(q(".y-nt"), "No disc"); Y.txt(q(".y-ns"), ""); }
      st.cd = (st.cd + dt * (vm.kind === "blending" ? 90 + 400 * vm.p : 24) * (vm.paused ? 0 : 1) * mo) % 360;
      q(".y-cd").style.transform = `translateX(${(vm.p * 46).toFixed(1)}%) rotate(${st.cd.toFixed(1)}deg)`;
      Y.txt(q(".y-body"), vm.body);
      const load = q(".y-load"), nseg = vm.step >= 0 ? 6 : 16;
      const show = vm.step >= 0 || vm.kind === "blending" || vm.kind === "armed";
      load.style.display = q(".y-lc").style.display = show ? "" : "none";
      if (show) {
        const fill = vm.step >= 0 ? vm.step : Math.floor(vm.p * 16 + 0.001);
        once("load", nseg + "|" + fill + "|" + vm.kind, () => { load.innerHTML = Array.from({ length: nseg }, (_, i) => `<i class="${i < fill ? "on" : i === fill && vm.kind !== "armed" ? "now" : ""}"></i>`).join(""); });
        Y.txt(q(".y-lc"), vm.step >= 0 ? `step ${vm.step + 1} of 6` : vm.kind === "blending" ? `crossfade ${Math.round(vm.p * 100)}%` : vm.plan ? `${vm.plan.tech} / ${vm.plan.camA} to ${vm.plan.camB} / ${vm.plan.blendLen}s` : "");
      }
      Y.showCta(q(".y-act"), vm);
    },
  });
})();
