// Vaporwave: a desktop from a half-remembered 1997. Everything is a grey bevelled window drifting over a pink and
// teal void: the video plays in a media player with ghost trails, the title is typed in full-width letters in a
// notepad, the countdown is a system dialog with a block progress bar, the next song is a bitmap waiting to open.
(() => {
  const Y = window.YTDJ;
  const wide = (t) => [...String(t).toUpperCase()].map((c) => { const k = c.charCodeAt(0); return k === 32 ? "　" : k > 32 && k < 127 ? String.fromCharCode(k + 0xfee0) : c; }).join("");
  const win = (cls, title, body) => `<section class="v-win ${cls}"><div class="v-tb"><span>${title}</span><i>_</i><i>□</i><i>×</i></div>${body}</section>`;
  Y.theme("Vaporwave", {
    swatch: ["#ff9ad5", "#7ff3e6"],
    cls: "vap",
    html: `
      <div class="v-sky"></div><p class="v-jp">音楽の夢</p><p class="v-big"></p>
      <div class="v-floor"><i></i></div><i class="v-orb"></i><i class="v-pyr"></i><div class="v-col"><i></i><i></i><i></i></div>
      ${win("v-player", "media_player.exe", `<div class="v-menu"><u>F</u>ile&nbsp;&nbsp;<u>V</u>iew&nbsp;&nbsp;<u>P</u>lay&nbsp;&nbsp;<u>H</u>elp</div>
        <button class="v-screen" title="Play or pause"><img alt=""><canvas width="320" height="180"></canvas><i></i></button>
        <div class="v-track"><i class="v-mix"></i><i class="v-knob"></i></div><div class="v-status"><span class="v-st"></span><span class="v-time"></span></div>`)}
      ${win("v-note", "now_playing.txt", `<div class="v-paper"><p class="v-title"></p><p class="v-sub"></p><p class="v-meta"></p></div>`)}
      ${win("v-dlg", "mix.exe", `<div class="v-drow"><b class="v-ico">i</b><div><p class="v-cl"></p><p class="v-cn"></p><p class="v-body"></p></div></div><div class="v-prog"></div><div class="v-btns"><button class="v-act"></button><span class="v-plan"></span></div>`)}
      ${win("v-bmp", "next.bmp", `<div class="v-pic"><img alt=""><i></i></div><p class="v-nt"></p><p class="v-ns"></p>`)}`,
    css: `
    .ov[data-theme="Vaporwave"] .dock { --dk-font: Tahoma, "MS Sans Serif", sans-serif; --dk-weight: 700; --dk-size: 12px; --dk-ink: #2a0a52; --dk-line: rgba(42,10,82,.5); --dk-chip: rgba(255,255,255,.55); --dk-accent: #00a99d; --dk-on: #fff; }
    .vap { background: #ff9ad5; color: #000; font-family: Tahoma, "MS Sans Serif", sans-serif; --f: clamp(11px, calc(var(--u) * .9), 15px); }
    .vap p { margin: 0; }
    .v-sky { position: absolute; inset: 0; background: linear-gradient(180deg, #ff71ce 0%, #f9a8e6 30%, #b9a3ff 55%, #7ff3e6 80%, #d8fff6 100%); }
    .v-jp { position: absolute; right: 3vw; top: 12vh; writing-mode: vertical-rl; font: 700 calc(var(--u) * 7)/1 "Yu Mincho", "MS Mincho", serif; color: rgba(255,255,255,.55); letter-spacing: .1em; text-shadow: 4px 4px 0 rgba(1,205,254,.5); }
    .v-big { position: absolute; left: 0; top: 34vh; white-space: nowrap; font: italic 400 calc(var(--u) * 13)/1 "Times New Roman", serif; color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.75); will-change: transform; }
    .v-floor { position: absolute; left: -40%; right: -40%; bottom: 0; height: 38%; perspective: 40vh; overflow: hidden; -webkit-mask-image: linear-gradient(to top, #000 40%, transparent); mask-image: linear-gradient(to top, #000 40%, transparent); }
    .v-floor i { position: absolute; inset: -100% 0 0 0; transform: rotateX(68deg); transform-origin: 50% 100%; background: conic-gradient(#ff71ce 25%, #fff 0 50%, #ff71ce 0 75%, #fff 0) 0 var(--gy, 0)/110px 110px; }
    .v-orb { position: absolute; left: 6vw; top: 16vh; width: calc(var(--u) * 9); height: calc(var(--u) * 9); border-radius: 50%; background: radial-gradient(circle at 32% 28%, #fff, #b967ff 45%, #01cdfe); box-shadow: 0 0 40px rgba(185,103,255,.6); will-change: transform; }
    .v-pyr { position: absolute; right: 13vw; bottom: 14vh; width: calc(var(--u) * 11); height: calc(var(--u) * 10); background: linear-gradient(100deg, #05ffa1 50%, #01cdfe 50%); clip-path: polygon(50% 0, 100% 100%, 0 100%); will-change: transform; }
    .v-col { position: absolute; left: 3vw; bottom: 0; width: calc(var(--u) * 6); height: 46vh; display: flex; flex-direction: column; align-items: center; }
    .v-col i:nth-child(1) { width: 130%; height: 5%; background: linear-gradient(#fff, #d9c9f2); } .v-col i:nth-child(2) { width: 100%; flex: 1; background: repeating-linear-gradient(90deg, #fff 0, #c9b6ee 50%, #fff 100%) 0 0/16.66% 100%; } .v-col i:nth-child(3) { width: 130%; height: 5%; background: #e9dcff; }
    .v-win { position: absolute; padding: 3px; background: #c0c0c0; box-shadow: inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf, 7px 7px 0 rgba(255,255,255,.4), 14px 14px 0 rgba(255,255,255,.26), 21px 21px 0 rgba(255,255,255,.14); will-change: transform; font-size: var(--f); }
    .v-tb { display: flex; align-items: center; gap: 2px; height: calc(var(--f) * 1.75); padding: 0 3px 0 6px; background: linear-gradient(90deg, #000080, #b967ff 60%, #01cdfe); color: #fff; font-weight: 700; }
    .v-tb span { flex: 1; white-space: nowrap; overflow: hidden; } .v-tb i { width: calc(var(--f) * 1.3); height: calc(var(--f) * 1.2); display: grid; place-items: center; background: #c0c0c0; color: #000; font: 700 calc(var(--f) * .8)/1 Tahoma, sans-serif; box-shadow: inset -1px -1px 0 #000, inset 1px 1px 0 #fff; }
    .v-menu { padding: 3px 6px; } .v-sunk { box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff, inset 2px 2px 0 #000; }
    .v-player { left: 15vw; top: calc(60px + 5vh); width: calc(var(--u) * 44); z-index: 3; }
    .v-screen { position: relative; display: block; width: 100%; aspect-ratio: 16/9; background: #000; overflow: hidden; cursor: pointer; }
    .v-screen img, .v-screen canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(1.5) contrast(1.05) hue-rotate(-14deg); } .v-screen canvas { transition: opacity 1s; }
    .v-screen i { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,113,206,.42), rgba(1,205,254,.38)), repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px); mix-blend-mode: screen; }
    .v-track { position: relative; height: 4px; margin: calc(var(--f) * 1) 10px calc(var(--f) * .8); background: #fff; box-shadow: inset 1px 1px 0 #808080, 0 0 0 1px #dfdfdf; }
    .v-knob { position: absolute; top: -9px; width: 11px; height: 21px; margin-left: -5px; background: #c0c0c0; box-shadow: inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080; } .v-mix { position: absolute; top: -3px; bottom: -3px; background: #ff71ce; display: none; }
    .v-status { display: flex; justify-content: space-between; gap: 6px; } .v-status span { padding: 3px 7px; box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; } .v-st { flex: 1; }
    .v-note { left: 4vw; bottom: 7vh; width: calc(var(--u) * 34); z-index: 4; }
    .v-paper { background: #fff; padding: calc(var(--u) * 1.1) calc(var(--u) * 1.3) calc(var(--u) * 1.4); box-shadow: inset 1px 1px 0 #808080, inset 2px 2px 0 #000; min-height: calc(var(--u) * 9); }
    .v-title { font: 400 calc(var(--u) * 2.6)/1.15 "Yu Gothic", "MS Gothic", "Times New Roman", serif; color: #000080; overflow-wrap: anywhere; } .v-title::after { content: "▌"; animation: v-bl 1s steps(1) infinite; color: #ff71ce; } @keyframes v-bl { 50% { opacity: 0; } }
    .v-sub { margin-top: .5em !important; font: 400 calc(var(--f) * 1.15)/1.3 "Courier New", monospace; } .v-meta { font: 400 calc(var(--f) * 1.15)/1.3 "Courier New", monospace; color: #b0006d; }
    .v-dlg { right: 7vw; top: calc(60px + 9vh); width: calc(var(--u) * 28); z-index: 5; }
    .v-drow { display: flex; gap: calc(var(--u) * 1); padding: calc(var(--u) * 1.1) calc(var(--u) * 1) calc(var(--u) * .6); } .v-ico { flex: none; width: calc(var(--u) * 2.6); height: calc(var(--u) * 2.6); display: grid; place-items: center; border-radius: 50%; background: #000080; color: #fff; font: italic 700 calc(var(--u) * 1.7)/1 "Times New Roman", serif; box-shadow: 2px 2px 0 #808080; }
    .v-cl { font-weight: 700; } .v-cn { font: 400 calc(var(--u) * 3.6)/1.05 "Times New Roman", serif; color: #000080; font-variant-numeric: tabular-nums; margin: .1em 0 !important; } .v-dlg[data-mode="text"] .v-cn { font-size: calc(var(--u) * 1.8); }
    .v-body { line-height: 1.35; }
    .v-prog { display: flex; gap: 2px; height: calc(var(--f) * 1.5); margin: 4px calc(var(--u) * 1); padding: 3px; background: #fff; box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff, inset 2px 2px 0 #000; } .v-prog i { flex: 1; } .v-prog i.on { background: #000080; }
    .v-btns { display: flex; align-items: center; gap: 10px; padding: calc(var(--u) * .7) calc(var(--u) * 1) calc(var(--u) * 1); } .v-plan { color: #404040; }
    .v-act { padding: 5px 16px; background: #c0c0c0; box-shadow: inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf; font: 400 var(--f)/1.2 Tahoma, sans-serif; outline: 1px dotted #000; outline-offset: -5px; } .v-act:active { box-shadow: inset 1px 1px 0 #000, inset -1px -1px 0 #fff; }
    .v-bmp { right: 15vw; bottom: 9vh; width: calc(var(--u) * 20); z-index: 4; }
    .v-pic { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #000; } .v-pic img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.34); filter: saturate(1.4) hue-rotate(-14deg); } .v-pic i { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,113,206,.5), rgba(1,205,254,.45)); mix-blend-mode: screen; }
    .v-nt { padding: 6px 6px 0; font: 400 calc(var(--u) * 1.5)/1.15 "Yu Gothic", "MS Gothic", serif; color: #000080; overflow-wrap: anywhere; } .v-ns { padding: 2px 6px 6px; font: 400 var(--f)/1.2 "Courier New", monospace; }
    @media (max-aspect-ratio: 13/10) { .v-player { left: 5vw; width: 60vw; } .v-bmp { display: none; } .v-dlg { right: 3vw; top: auto; bottom: 30vh; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      el.querySelectorAll(".v-menu").forEach(() => {});
      const st = { el, q, ft: -1, c: q(".v-screen canvas").getContext("2d"), gy: 0, bx: 0, wins: [...el.querySelectorAll(".v-win")].map((e, i) => ({ e, ph: i * 1.9, d: [0.4, 1, 1.5, 0.8][i] })) };
      q(".v-prog").innerHTML = "<i></i>".repeat(20);
      q(".v-screen").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".v-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion, pe = Y.ease(vm.p);
      st.gy = (((vm.flow / 2 * (mo < 1 ? 0.25 : 1)) % 1) + 1) % 1 * 110; /* one tile every two beats */ Y.sty(q(".v-floor i"), "--gy", st.gy.toFixed(1) + "px");
      Y.once(st, "big", a ? a.title : "", () => { q(".v-big").textContent = (wide(a ? a.title : "silence") + "　").repeat(5); st.bw = 0; });
      if (!st.bw) st.bw = q(".v-big").offsetWidth / 5 || 1; st.bx = (st.bx + dt * 26 * mo) % st.bw; q(".v-big").style.transform = `translateX(${(-st.bx).toFixed(1)}px)`;
      q(".v-orb").style.transform = `translateY(${(Math.sin(now / 1700) * 14 * mo).toFixed(1)}px) scale(${(1 + au.bass * 0.12).toFixed(3)})`;
      q(".v-pyr").style.transform = `translateY(${(Math.cos(now / 2100) * 10 * mo).toFixed(1)}px) rotate(${(Math.sin(now / 2600) * 5).toFixed(1)}deg)`;
      for (const w of st.wins) w.e.style.transform = `translate(${(Math.sin(now / 2300 + w.ph) * 6 * w.d * mo + Y.mouse.x * -10 * w.d).toFixed(1)}px,${(Math.cos(now / 1900 + w.ph) * 5 * w.d * mo + Y.mouse.y * -8 * w.d).toFixed(1)}px)`;
      // media player: each new frame is laid over the last, so motion leaves ghosts
      if (a) Y.src(q(".v-screen img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; st.c.globalAlpha = 0.3; st.c.drawImage(Y.frame, 0, 0); }
      q(".v-screen canvas").style.opacity = vm.videoOk ? "1" : "0";
      const pr = Y.prog(vm) * 100; q(".v-knob").style.left = pr + "%";
      const mx = Y.mix(vm), m = q(".v-mix"); m.style.display = mx ? "block" : "none"; if (mx) { m.style.left = mx.a + "%"; m.style.width = Math.max(0.8, mx.b - mx.a) + "%"; }
      Y.txt(q(".v-st"), vm.paused ? "Paused" : vm.kind === "blending" ? "Crossfading..." : "Playing"); Y.txt(q(".v-time"), vm.dur ? `${Y.fmt(vm.time)} / ${Y.fmt(vm.dur)}` : "--:--");
      Y.txt(q(".v-title"), wide(a ? a.title : "no file")); Y.txt(q(".v-sub"), a ? a.sub : "Open a YouTube Mix to begin."); Y.txt(q(".v-meta"), a && a.bpm ? `${Math.round(a.bpm)} bpm / ${a.key} / ${a.cam}` : "");
      // dialog
      const cnt = Y.count(vm); q(".v-dlg").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".v-cl"), cnt ? (vm.paused ? "Mix paused at" : vm.kind === "blending" ? "New song lands in" : "Songs will be blended in") : vm.eyebrow); Y.txt(q(".v-cn"), cnt || vm.headline);
      Y.txt(q(".v-body"), vm.step >= 0 ? `Reading the next file: ${vm.steps[vm.step]}...` : vm.body);
      const fill = vm.kind === "blending" ? Math.round(vm.p * 20) : vm.step >= 0 ? Math.round(((vm.step + 0.5) / 6) * 20) : vm.kind === "armed" ? 0 : -1;
      q(".v-prog").style.display = fill >= 0 ? "flex" : "none";
      Y.once(st, "fill", fill, () => [...q(".v-prog").children].forEach((e, i) => e.classList.toggle("on", i < fill)));
      Y.txt(q(".v-plan"), vm.plan ? `${vm.plan.camA} to ${vm.plan.camB}, ${vm.plan.blendLen}s` : "");
      const c = Y.cta(vm), btn = q(".v-act"); Y.txt(btn, c ? c.label : "OK"); btn.onclick = () => { const k = Y.cta(Y.vm); if (k) k.run(); };
      const bm = q(".v-bmp"); bm.style.visibility = b ? "visible" : "hidden";
      if (b) { Y.src(bm.querySelector("img"), b.thumb); Y.txt(q(".v-nt"), wide(b.title)); Y.txt(q(".v-ns"), Y.meta(b, " / ") || b.sub); bm.style.zIndex = vm.kind === "blending" ? "6" : "4"; if (pe) bm.style.transform += ` scale(${(1 + pe * 0.25).toFixed(3)}) translate(${(-pe * 12).toFixed(1)}vw,${(-pe * 16).toFixed(1)}vh)`; }
    },
  });
})();
