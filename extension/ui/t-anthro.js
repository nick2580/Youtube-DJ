// Anthropomorphic: the songs are creatures. The one on air wears headphones, bounces on the beat, sings with the
// spectrum, watches the cursor, and shows the video on its tummy. The next song naps to the side and wakes up,
// then hops in, when the blend begins. A snail carries the playhead.
(() => {
  const Y = window.YTDJ;
  const critter = (cls) => `<div class="a-cr ${cls}"><i class="a-shadow"></i><div class="a-body">
      <i class="a-ear l"></i><i class="a-ear r"></i><i class="a-band"></i>
      <div class="a-face"><i class="a-eye"><i></i></i><i class="a-eye"><i></i></i><i class="a-cheek l"></i><i class="a-cheek r"></i><i class="a-mouth"></i></div>
      <div class="a-tum"><img alt=""><canvas width="200" height="200"></canvas></div>
      <i class="a-arm l"></i><i class="a-arm r"></i><i class="a-foot l"></i><i class="a-foot r"></i></div><b class="a-zz">z<span>z</span><span>z</span></b></div>`;
  Y.theme("Anthropomorphic", {
    swatch: ["#ffd9a8", "#ff8a7a"],
    cls: "ant",
    html: `
      <div class="a-sun"><i></i></div><div class="a-cloud c1"><i></i></div><div class="a-cloud c2"><i></i></div>
      <div class="a-ground"></div><div class="a-notes"><b>♪</b><b>♫</b><b>♪</b><b>♬</b><b>♪</b></div>
      <div class="a-stage">
        <div class="a-now">${critter("big")}<p class="a-name"></p><p class="a-sub"></p></div>
        <div class="a-bub"><p class="a-eb"></p><p class="a-cn"></p><p class="a-says"></p><div class="a-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="a-act"></button></div>
        <div class="a-nextw">${critter("small")}<p class="a-nl"></p><p class="a-name2"></p><p class="a-sub2"></p></div>
      </div>
      <div class="a-track"><i class="a-flag"><b>mix</b></i><div class="a-snail"><i class="a-shell"></i><i class="a-sbody"></i></div><span class="a-t0"></span><span class="a-t1"></span></div>`,
    css: `
    .ov[data-theme="Anthropomorphic"] .dock { --dk-font: "Jost", sans-serif; --dk-weight: 600; --dk-size: 14px; --dk-ink: #2b1d3a; --dk-line: rgba(43,29,58,.5); --dk-chip: rgba(255,255,255,.6); --dk-accent: #ff6f61; --dk-on: #fff; }
    .ant { background: linear-gradient(180deg, #bfe6ff 0%, #fff3df 58%); color: #2b1d3a; font-family: "Jost", sans-serif; --ol: #2b1d3a; }
    .ant p { margin: 0; }
    .a-sun { position: absolute; right: 9vw; top: 12vh; width: calc(var(--u) * 9); height: calc(var(--u) * 9); border-radius: 50%; background: #ffd23f; border: 4px solid var(--ol); box-shadow: 0 0 0 calc(var(--u) * 1.4) rgba(255,210,63,.3); will-change: transform; }
    .a-sun i, .a-cloud i { position: absolute; left: 50%; top: 56%; width: 34%; height: 17%; margin-left: -17%; border: 4px solid var(--ol); border-top: 0; border-radius: 0 0 99px 99px; }
    .a-sun::before, .a-sun::after, .a-cloud::before, .a-cloud::after { content: ""; position: absolute; top: 36%; width: 8%; aspect-ratio: 1; border-radius: 50%; background: var(--ol); }
    .a-sun::before, .a-cloud::before { left: 30%; } .a-sun::after, .a-cloud::after { right: 30%; }
    .a-cloud { position: absolute; width: calc(var(--u) * 13); height: calc(var(--u) * 5.4); border-radius: 99px; background: #fff; border: 4px solid var(--ol); will-change: transform; }
    .a-cloud.c1 { left: 0; top: 16vh; } .a-cloud.c2 { left: 0; top: 30vh; scale: .7; }
    .a-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 24vh; background: #9fdc8c; border-top: 4px solid var(--ol); }
    .a-notes b { position: absolute; left: 0; top: 0; font: 700 calc(var(--u) * 3) "Jost", sans-serif; color: var(--ol); will-change: transform, opacity; }
    .a-stage { position: absolute; left: 5vw; right: 5vw; bottom: 17vh; display: flex; align-items: flex-end; justify-content: center; gap: calc(var(--u) * 3); }
    .a-now, .a-nextw { text-align: center; flex: none; }
    .a-cr { position: relative; --s: calc(var(--u) * 27); width: var(--s); height: calc(var(--s) * 1.1); margin: 0 auto; }
    .a-cr.small { --s: calc(var(--u) * 13); }
    .a-shadow { position: absolute; left: 12%; right: 12%; bottom: -3%; height: 8%; border-radius: 50%; background: rgba(43,29,58,.22); will-change: transform; }
    .a-body { position: absolute; inset: 0; transform-origin: 50% 100%; will-change: transform; border: calc(var(--s) * .022) solid var(--ol); border-radius: 46% 54% 44% 56% / 54% 56% 44% 46%; background: var(--bc, #ff8a7a); box-shadow: inset calc(var(--s) * -.05) calc(var(--s) * -.06) 0 rgba(43,29,58,.14), inset calc(var(--s) * .04) calc(var(--s) * .04) 0 rgba(255,255,255,.3); }
    .a-ear { position: absolute; top: 20%; width: 13%; height: 20%; border-radius: 40%; background: #2b1d3a; border: calc(var(--s) * .02) solid var(--ol); } .a-ear.l { left: -6%; } .a-ear.r { right: -6%; }
    .a-band { position: absolute; left: 2%; right: 2%; top: -5%; height: 40%; border: calc(var(--s) * .035) solid var(--ol); border-bottom: 0; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
    .small .a-ear, .small .a-band { display: none; }
    .a-face { position: absolute; left: 20%; right: 20%; top: 14%; height: 30%; }
    .a-eye { position: absolute; top: 0; width: 26%; aspect-ratio: 1; border-radius: 50%; background: #fff; border: calc(var(--s) * .02) solid var(--ol); overflow: hidden; transition: height .1s; }
    .a-eye:nth-child(1) { left: 12%; } .a-eye:nth-child(2) { right: 12%; }
    .a-eye i { position: absolute; left: 25%; top: 25%; width: 50%; height: 50%; border-radius: 50%; background: var(--ol); will-change: transform; box-shadow: inset calc(var(--s) * .008) calc(var(--s) * .008) 0 calc(var(--s) * .006) #fff; }
    .a-cr.blink .a-eye, .a-cr.sleep .a-eye { aspect-ratio: auto; height: 0; margin-top: 12%; border-width: calc(var(--s) * .02) 0 0; border-radius: 0; background: none; }
    .a-cheek { position: absolute; top: 46%; width: 15%; aspect-ratio: 1.5; border-radius: 50%; background: rgba(255,90,120,.5); } .a-cheek.l { left: 0; } .a-cheek.r { right: 0; }
    .a-mouth { position: absolute; left: 50%; top: 52%; width: 22%; height: calc(var(--m, .1) * 44%); min-height: calc(var(--s) * .02); transform: translateX(-50%); background: #7a1f3d; border: calc(var(--s) * .02) solid var(--ol); border-radius: 30% 30% 50% 50% / 20% 20% 80% 80%; }
    .a-tum { position: absolute; left: 22%; right: 22%; bottom: 9%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; border: calc(var(--s) * .022) solid var(--ol); background: #fff3df; box-shadow: 0 0 0 calc(var(--s) * .018) rgba(255,255,255,.55); }
    .a-tum img, .a-tum canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .a-tum img { transform: scale(1.4); } .a-tum canvas { transition: opacity 1s; }
    .a-arm { position: absolute; top: 50%; width: 9%; height: 24%; border-radius: 99px; background: var(--bc, #ff8a7a); border: calc(var(--s) * .022) solid var(--ol); transform-origin: 50% 10%; will-change: transform; } .a-arm.l { left: -5%; } .a-arm.r { right: -5%; }
    .a-foot { position: absolute; bottom: -4%; width: 20%; height: 8%; border-radius: 99px 99px 30% 30%; background: var(--bc, #ff8a7a); border: calc(var(--s) * .022) solid var(--ol); } .a-foot.l { left: 20%; } .a-foot.r { right: 20%; }
    .a-zz { position: absolute; right: -8%; top: -14%; font: 700 calc(var(--u) * 1.6) "Jost", sans-serif; display: none; animation: a-zz 2.4s ease-in-out infinite; } .a-zz span { font-size: 1.4em; } .a-zz span + span { font-size: 1.9em; }
    .a-cr.sleep .a-zz { display: block; } @keyframes a-zz { 50% { transform: translate(6px, -8px); opacity: .5; } }
    .a-name, .a-name2 { margin-top: calc(var(--u) * 1.6) !important; display: inline-block; padding: .2em .7em .25em; background: #fff; border: 3px solid var(--ol); border-radius: 12px; box-shadow: 4px 4px 0 var(--ol); font: 700 calc(var(--u) * 2.4)/1.1 "Jost", sans-serif; max-width: 34vw; text-wrap: balance; }
    .a-name2 { font-size: calc(var(--u) * 1.5); box-shadow: 3px 3px 0 var(--ol); max-width: 22vw; }
    .a-name.re, .a-name2.re { animation: a-pop .5s cubic-bezier(.3,1.7,.5,1) both; } @keyframes a-pop { from { transform: scale(.6) rotate(-6deg); opacity: 0; } }
    .a-sub, .a-sub2 { margin-top: 9px !important; font: 500 clamp(13px, calc(var(--u) * 1.15), 18px)/1.2 "Jost", sans-serif; } .a-nl { margin-top: calc(var(--u) * 1) !important; font: 700 calc(var(--u) * 1.5)/1 "Caveat", cursive; color: #c0392b; }
    .a-bub { position: relative; align-self: center; margin-bottom: calc(var(--u) * 14); width: calc(var(--u) * 24); padding: calc(var(--u) * 1.4) calc(var(--u) * 1.8) calc(var(--u) * 1.6); background: #fff; border: 4px solid var(--ol); border-radius: calc(var(--u) * 2.4); box-shadow: 6px 6px 0 var(--ol); font-family: "Caveat", cursive; }
    .a-bub::before { content: ""; position: absolute; left: -22px; bottom: 26%; width: 30px; height: 30px; background: #fff; border: solid var(--ol); border-width: 0 0 4px 4px; transform: skewY(-28deg) rotate(20deg); border-radius: 0 0 0 8px; }
    .a-eb { font: 700 calc(var(--u) * 1.7)/1 "Caveat", cursive; color: #c0392b; }
    .a-cn { font: 700 calc(var(--u) * 5)/1 "Jost", sans-serif; letter-spacing: -.03em; font-variant-numeric: tabular-nums; margin: .08em 0 .12em !important; }
    .a-bub[data-mode="text"] .a-cn { font: 700 calc(var(--u) * 2.5)/1 "Caveat", cursive; letter-spacing: 0; }
    .a-says { font: 500 calc(var(--u) * 1.65)/1.15 "Caveat", cursive; text-wrap: pretty; }
    .a-steps { display: flex; gap: 6px; margin-top: 8px; } .a-steps i { width: 14px; height: 14px; border-radius: 50%; border: 3px solid var(--ol); } .a-steps i[data-s="done"] { background: var(--ol); } .a-steps i[data-s="now"] { background: #ffd23f; animation: a-zz 1s infinite; }
    .a-act { margin-top: 10px; padding: 8px 16px; background: #ffd23f; border: 3px solid var(--ol); border-radius: 99px; box-shadow: 3px 3px 0 var(--ol); font: 700 15px/1 "Jost", sans-serif; } .a-act:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--ol); }
    .a-track { position: absolute; left: 7vw; right: 7vw; bottom: 6vh; height: 0; border-top: 4px dashed var(--ol); }
    .a-snail { position: absolute; bottom: 2px; width: calc(var(--u) * 4); height: calc(var(--u) * 2.6); margin-left: calc(var(--u) * -2.4); will-change: left; }
    .a-shell { position: absolute; left: 0; bottom: 14%; width: 62%; aspect-ratio: 1; border-radius: 50%; border: 3px solid var(--ol); background: repeating-radial-gradient(circle at 55% 55%, #ffb347 0 14%, #ff7f50 14% 22%); }
    .a-sbody { position: absolute; left: 10%; right: 0; bottom: 0; height: 28%; border-radius: 99px; background: #ffe6a8; border: 3px solid var(--ol); } .a-sbody::after { content: ""; position: absolute; right: 6%; bottom: 80%; width: 3px; height: 130%; background: var(--ol); transform: rotate(18deg); box-shadow: -7px 2px 0 var(--ol); }
    .a-flag { position: absolute; bottom: 0; width: 4px; height: calc(var(--u) * 4); background: var(--ol); display: none; } .a-flag b { position: absolute; left: 4px; top: 0; padding: 2px 8px 3px; background: #ff6f61; border: 3px solid var(--ol); font: 700 12px/1 "Jost", sans-serif; color: #fff; }
    .a-t0, .a-t1 { position: absolute; top: 9px; font: 600 14px/1 "Jost", sans-serif; font-variant-numeric: tabular-nums; } .a-t1 { right: 0; }
    @media (max-aspect-ratio: 13/10) { .a-bub { position: absolute; top: -34vh; left: 0; margin: 0; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, big: q(".a-cr.big"), small: q(".a-cr.small"), c: q(".big canvas").getContext("2d"), blink: 0, hop: 0, cl: [0.1, 0.62], notes: [...el.querySelectorAll(".a-notes b")].map((e, i) => ({ e, t: i / 5 })) };
      q(".big .a-tum").onclick = () => Y.source.act.playPause(); q(".big .a-tum").style.cursor = "pointer"; Y.bindCta(q(".a-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p), u = Y.u();
      const tint = (c) => `color-mix(in srgb, ${c} 62%, #ffe9d6)`;
      Y.once(st, "bc", (a ? a.c1 : "") + (b ? b.c1 : ""), () => { st.big.style.setProperty("--bc", a ? tint(a.c1) : "#ff8a7a"); st.small.style.setProperty("--bc", b ? tint(b.c1) : "#7ac6ff"); });
      // on-air creature: bounce, sing, look
      const bt = vm.paused ? 0 : vm.beat, sq = (vm.paused ? 0 : vm.bounce) * 0.06 * mo; /* signed: stretches going up, squashes on landing */
      st.big.querySelector(".a-body").style.transform = `translateY(${(-bt * u * 1.3 * mo).toFixed(1)}px) scale(${(1 - sq * 0.6).toFixed(4)},${(1 + sq).toFixed(4)}) rotate(${(Math.sin(now / 900) * 1.6 * mo).toFixed(2)}deg)`;
      st.big.querySelector(".a-shadow").style.transform = `scale(${(1 - bt * 0.14).toFixed(3)})`;
      Y.sty(st.big, "--m", (vm.paused ? 0.06 : 0.1 + Math.min(1, au.mid * 1.6 + au.bass * 0.5)).toFixed(3));
      st.big.querySelectorAll(".a-arm").forEach((e, i) => { e.style.transform = `rotate(${((i ? -1 : 1) * (18 + au.bass * 70 * mo)).toFixed(1)}deg)`; });
      for (const cr of [st.big, st.small]) { const r = cr.querySelector(".a-face").getBoundingClientRect(), dx = Y.mouse.px - (r.left + r.width / 2), dy = Y.mouse.py - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        cr.querySelectorAll(".a-eye i").forEach((e) => { e.style.transform = `translate(${((dx / d) * 34).toFixed(1)}%,${((dy / d) * 34).toFixed(1)}%)`; }); }
      if (now > st.blink) { st.big.classList.add("blink"); setTimeout(() => st.big.classList.remove("blink"), 140); st.blink = now + 1800 + Math.random() * 3500; }
      if (a) Y.src(st.big.querySelector("img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; Y.cover(st.c, Y.frame, 320, 180, 200, 200); }
      st.big.querySelector("canvas").style.opacity = vm.videoOk ? "1" : "0";
      Y.swap(q(".a-name"), a ? a.title : "Nobody's singing yet"); Y.txt(q(".a-sub"), a ? [a.sub, Y.meta(a)].filter(Boolean).join(" · ") : "");
      // next creature: asleep until there is a plan, hops over during the blend
      q(".a-nextw").style.visibility = b ? "visible" : "hidden";
      const awake = vm.kind === "armed" || vm.kind === "blending" || vm.kind === "off";
      st.small.classList.toggle("sleep", !awake);
      if (b) { Y.src(st.small.querySelector("img"), b.thumb); st.small.querySelector("canvas").style.opacity = "0"; Y.swap(q(".a-name2"), b.title); Y.txt(q(".a-sub2"), Y.meta(b));
        Y.txt(q(".a-nl"), vm.kind === "blending" ? "my turn!" : awake ? "I'm up next" : "napping till it's planned"); }
      st.hop = vm.kind === "blending" ? Math.abs(Math.sin(now / 190)) : 0;
      st.small.querySelector(".a-body").style.transform = `translate(${(-pe * u * 6).toFixed(1)}px,${(-st.hop * u * 1.4 * mo - (awake ? bt * u * 0.4 : 0)).toFixed(1)}px) scale(${(1 + pe * 0.45).toFixed(3)})`;
      Y.sty(st.small, "--m", (awake ? 0.12 + pe * 0.5 * au.mid : 0.04).toFixed(3));
      // speech
      const cnt = Y.count(vm); q(".a-bub").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".a-eb"), cnt ? (vm.paused ? "we're paused" : vm.kind === "blending" ? "landing in" : "I hand over in") : vm.eyebrow.toLowerCase());
      Y.txt(q(".a-cn"), cnt || vm.headline); Y.txt(q(".a-says"), vm.step >= 0 ? `My friend is warming up: ${vm.steps[vm.step]}.` : vm.body);
      Y.stepDots(q(".a-steps"), vm); Y.showCta(q(".a-act"), vm);
      // sky
      q(".a-sun").style.transform = `rotate(${(Math.sin(now / 1500) * 6).toFixed(1)}deg) scale(${(1 + bt * 0.05).toFixed(3)})`;
      st.cl = st.cl.map((x, i) => { x += dt * 0.006 * (i + 1) * mo; if (x > 1.1) x = -0.2; st.el.querySelector(".a-cloud.c" + (i + 1)).style.transform = `translateX(${(x * innerWidth).toFixed(1)}px)`; return x; });
      const br = st.big.getBoundingClientRect();
      for (const n of st.notes) { n.t += dt * (vm.paused ? 0 : 0.28) * mo; if (n.t > 1) n.t -= 1; const i = st.notes.indexOf(n);
        n.e.style.transform = `translate(${(br.left + br.width * (0.1 + i * 0.2) + Math.sin(n.t * 9 + i) * 22).toFixed(1)}px,${(br.top - n.t * innerHeight * 0.22).toFixed(1)}px) rotate(${(Math.sin(n.t * 7) * 20).toFixed(1)}deg)`; n.e.style.opacity = (Math.sin(n.t * 3.14) * (0.25 + au.level)).toFixed(3); }
      // snail
      q(".a-snail").style.left = Y.prog(vm) * 100 + "%";
      const mx = Y.mix(vm), fl = q(".a-flag"); fl.style.display = mx ? "block" : "none"; if (mx) fl.style.left = mx.a + "%";
      Y.txt(q(".a-t0"), vm.dur ? Y.fmt(vm.time) : ""); Y.txt(q(".a-t1"), vm.dur ? Y.fmt(vm.dur) : "");
    },
  });
})();
