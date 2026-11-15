// Pixel Art: the set is a side-scrolling game. A low-resolution dusk landscape scrolls at the song's tempo with a
// runner who jumps on the beat; the video is a colour-crushed 96×54 screen; the song is a level map of blocks;
// what happens next is typed out in an RPG text box.
(() => {
  const Y = window.YTDJ;
  const SKY = ["#1b1447", "#2c1d63", "#4a2a80", "#7a3b93", "#b8509a", "#ef7f8f", "#ffb38a"];
  const RUN = ["..hh..", ".hhhh.", ".hffh.", "..ff..", ".bbbb.", "bbbbbb", ".bbbb.", ".b..b."];
  Y.theme("Pixel Art", {
    swatch: ["#4a2a80", "#ffd23f"],
    cls: "pix",
    html: `
      <canvas class="p-bg" width="320" height="180"></canvas>
      <div class="p-hud"><div><span>1P now</span><b class="p-title"></b><i class="p-sub"></i></div><div class="p-mid"><span class="p-cl"></span><b class="p-cn"></b></div></div>
      <button class="p-screen" title="Play or pause"><img alt=""><canvas width="96" height="54"></canvas><i>▶ live</i></button>
      <div class="p-side">
        <div class="p-card"><span class="p-nl"></span><canvas class="p-nc" width="40" height="30"></canvas><b class="p-nt"></b><i class="p-ns"></i></div>
        <div class="p-stats"><div><span>bpm</span><b class="p-bpm"></b></div><div><span>key</span><b class="p-key"></b></div><div><span>wheel</span><b class="p-cam"></b></div></div>
      </div>
      <div class="p-map"><span class="p-t0"></span><div class="p-blocks"></div><span class="p-t1"></span></div>
      <div class="p-box"><p class="p-body"></p><div class="p-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="p-act"></button><b class="p-more">▼</b></div>`,
    css: `
    .ov[data-theme="Pixel Art"] .dock { --dk-font: "Silkscreen", monospace; --dk-weight: 400; --dk-size: 12px; --dk-ink: #fff; --dk-line: rgba(255,255,255,.5); --dk-chip: rgba(0,0,0,.4); --dk-accent: #ffd23f; --dk-on: #1b1447; }
    .pix { background: #1b1447; color: #fff; font-family: "Press Start 2P", "Silkscreen", monospace; --px: max(3px, calc(var(--u) * .28)); }
    .pix p { margin: 0; } .pix canvas, .pix img { image-rendering: pixelated; }
    .p-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .pix .fr { box-shadow: 0 calc(var(--px) * -1) 0 #fff, 0 var(--px) 0 #fff, calc(var(--px) * -1) 0 0 #fff, var(--px) 0 0 #fff, 0 calc(var(--px) * -2) 0 #000, 0 calc(var(--px) * 2) 0 #000, calc(var(--px) * -2) 0 0 #000, calc(var(--px) * 2) 0 0 #000, calc(var(--px) * 3) calc(var(--px) * 3) 0 rgba(0,0,0,.5); }
    .p-hud { position: absolute; left: 7vw; right: 7vw; top: calc(60px + 2vh); display: flex; justify-content: space-between; align-items: flex-start; gap: 3vw; text-shadow: var(--px) var(--px) 0 #000; }
    .p-hud > div { display: flex; flex-direction: column; gap: calc(var(--u) * .7); min-width: 0; } .p-mid { align-items: flex-end; text-align: right; }
    .p-hud span, .p-card span, .p-stats span { font: 400 clamp(9px, calc(var(--u) * .78), 13px)/1 "Press Start 2P", monospace; color: #ffd23f; text-transform: uppercase; }
    .p-title { font: 400 calc(var(--u) * 2.5)/1.15 "Press Start 2P", monospace; text-transform: uppercase; max-width: 56vw; }
    .p-title.re { animation: p-bl .12s steps(1) 5; } @keyframes p-bl { 50% { opacity: 0; } }
    .p-sub, .p-ns { font: 400 clamp(11px, calc(var(--u) * 1.15), 18px)/1.2 "Silkscreen", monospace; color: #c9f0ff; font-style: normal; }
    .p-cn { font: 400 calc(var(--u) * 3.2)/1 "Press Start 2P", monospace; color: #fff; font-variant-numeric: tabular-nums; } .p-mid[data-mode="text"] .p-cn { font-size: calc(var(--u) * 1.3); line-height: 1.3; max-width: 30vw; }
    .p-screen { position: absolute; left: 7vw; top: calc(60px + 16vh); width: calc(var(--u) * 42); aspect-ratio: 16/9; background: #000; cursor: pointer; display: block; }
    .p-screen img, .p-screen canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .p-screen canvas { transition: opacity .3s steps(3); }
    .p-screen i { position: absolute; left: var(--px); top: var(--px); padding: calc(var(--px) * 1.2) calc(var(--px) * 2); background: #e23d5b; font: 400 clamp(8px, calc(var(--u) * .7), 12px)/1 "Press Start 2P", monospace; font-style: normal; }
    .p-side { position: absolute; right: 7vw; top: calc(60px + 16vh); width: calc(var(--u) * 26); display: flex; flex-direction: column; gap: calc(var(--u) * 2); }
    .p-card { background: #2c1d63; padding: calc(var(--u) * 1.2); display: grid; grid-template-columns: calc(var(--u) * 9) 1fr; gap: calc(var(--u) * .8) calc(var(--u) * 1.2); align-items: start; }
    .p-card span { grid-column: 1 / -1; } .p-nc { grid-row: span 2; width: 100%; height: auto; background: #000; outline: var(--px) solid #000; will-change: transform; }
    .p-nt { font: 400 calc(var(--u) * 1.2)/1.35 "Press Start 2P", monospace; text-transform: uppercase; overflow-wrap: anywhere; }
    .p-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(var(--px) * 3); } .p-stats > div { background: #000; padding: calc(var(--u) * .9); display: flex; flex-direction: column; gap: calc(var(--u) * .7); } .p-stats b { font: 400 calc(var(--u) * 1.05)/1 "Press Start 2P", monospace; white-space: nowrap; }
    .p-map { position: absolute; left: calc(7vw + var(--u) * 1.8); right: calc(7vw + var(--u) * 1.8); bottom: calc(5vh + var(--u) * 1.2); z-index: 2; display: flex; align-items: center; gap: calc(var(--u) * 1); font: 400 clamp(9px, calc(var(--u) * .85), 13px)/1 "Press Start 2P", monospace; text-shadow: var(--px) var(--px) 0 #000; }
    .p-blocks { flex: 1; display: flex; gap: var(--px); height: calc(var(--u) * 1.5); } .p-blocks i { flex: 1; background: #5b3a1e; box-shadow: inset 0 var(--px) 0 #8a5a2e, inset 0 calc(var(--px) * -1) 0 #2e1a0a; }
    .p-blocks i.ch { background: #d99a1c; box-shadow: inset 0 var(--px) 0 #ffe27a, inset 0 calc(var(--px) * -1) 0 #8a5a00; } .p-blocks i.mx { background: #e23d5b; box-shadow: inset 0 var(--px) 0 #ff8aa0, inset 0 calc(var(--px) * -1) 0 #7a1024; }
    .p-blocks i.on { filter: brightness(.45); } .p-blocks i.hd { background: #fff; box-shadow: none; animation: p-bl .5s steps(1) infinite; }
    .p-box { position: absolute; left: 7vw; right: 7vw; bottom: 5vh; height: calc(var(--u) * 10); padding: calc(var(--u) * 1.3) calc(var(--u) * 1.8); background: #10103a; }
    .p-body { font: 400 clamp(13px, calc(var(--u) * 1.5), 24px)/1.35 "Silkscreen", monospace; max-width: 80%; }
    .p-steps { display: flex; gap: var(--px); margin-top: calc(var(--u) * .7); } .p-steps i { width: calc(var(--u) * 1.3); height: calc(var(--u) * 1.3); background: #33336b; } .p-steps i[data-s="done"] { background: #7fe9a0; } .p-steps i[data-s="now"] { background: #ffd23f; animation: p-bl .6s steps(1) infinite; }
    .p-act { position: absolute; right: calc(var(--u) * 1.8); top: calc(var(--u) * 1.3); padding: calc(var(--u) * .8) calc(var(--u) * 1.2); background: #ffd23f; color: #1b1447; font: 400 clamp(9px, calc(var(--u) * .8), 13px)/1 "Press Start 2P", monospace; box-shadow: var(--px) var(--px) 0 #000; }
    .p-more { display: none; position: absolute; right: calc(var(--u) * 1.6); bottom: calc(var(--u) * 1.2); font-size: calc(var(--u) * 1.1); animation: p-bl 1s steps(1) infinite; }
    @media (max-aspect-ratio: 13/10) { .p-screen { width: calc(var(--u) * 58); } .p-stats { display: none; } .p-side { top: auto; bottom: calc(5vh + var(--u) * 14); width: calc(var(--u) * 30); } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      el.querySelectorAll(".p-screen,.p-card,.p-stats > div,.p-box").forEach((e) => e.classList.add("fr"));
      const st = { el, q, ft: -1, g: q(".p-bg").getContext("2d"), c: q(".p-screen canvas").getContext("2d"), nc: q(".p-nc").getContext("2d"), x: 0, typed: 0, body: "",
        stars: Array.from({ length: 46 }, () => [Math.random() * 320 | 0, Math.random() * 84 | 0, Math.random() * 6.28]) };
      q(".p-blocks").innerHTML = "<i></i>".repeat(44);
      q(".p-screen").onclick = () => Y.source.act.playPause(); Y.bindCta(q(".p-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q, g } = st, a = vm.now, b = vm.next, au = vm.audio, mo = Y.motion;
      const sp = vm.paused ? 0 : ((a && a.bpm) || 100) / 100;
      st.x += dt * 34 * sp * mo * (1 + vm.p);
      // landscape
      for (let i = 0; i < 7; i++) { g.fillStyle = SKY[i]; g.fillRect(0, i * 20, 320, 20); }
      for (const s of st.stars) { g.fillStyle = Math.sin(now / 400 + s[2]) > 0.2 ? "#fff" : "#9a8ad0"; g.fillRect(s[0], s[1], 1, 1); }
      g.fillStyle = "#fff3c4"; for (let y = -9; y <= 9; y++) { const w = Math.round(Math.sqrt(81 - y * y)); g.fillRect(250 - w, 34 + y, w * 2, 1); }
      g.fillStyle = "#b8509a"; g.fillRect(244, 30, 3, 3); g.fillRect(253, 38, 2, 2);
      const hill = (col, base, amp, par, f) => { g.fillStyle = col; for (let x = 0; x < 320; x++) { const xx = (x + st.x * par) * f, h = Math.round(base + amp * (Math.sin(xx) + 0.5 * Math.sin(xx * 2.3 + 1)) + (par > 0.3 ? au.bins[(x >> 4) % 24] * 9 : 0)); g.fillRect(x, 142 - h, 1, h); } };
      hill("#5a2d7d", 34, 12, 0.12, 0.022); hill("#3a1f5e", 20, 9, 0.3, 0.045); hill("#22143f", 9, 5, 0.6, 0.09);
      for (let x = -16; x < 336; x += 16) { const gx = Math.round(x - (st.x % 16)); g.fillStyle = "#2f7d4f"; g.fillRect(gx, 142, 16, 4); g.fillStyle = "#1f5a3a"; g.fillRect(gx, 142, 1, 4); g.fillStyle = "#6b3f1f"; g.fillRect(gx, 146, 16, 34); g.fillStyle = "#4a2a12"; g.fillRect(gx + 3, 152, 4, 2); g.fillRect(gx + 10, 162, 3, 2); }
      const jump = Math.round(Math.max(0, vm.bounce) * 10 * mo), leg = (st.x / 5 | 0) & 1;
      RUN.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === ".") return; if (y === 7 && !jump && ((x < 3) === !!leg)) return; g.fillStyle = ch === "h" ? "#ffd23f" : ch === "f" ? "#ffd9b3" : "#e23d5b"; g.fillRect(150 + x * 2, 126 + y * 2 - jump, 2, 2); }));
      for (let i = 0; i < 4; i++) { const nx = Math.round(320 - ((st.x * 1 + i * 97) % 400)), ny = 104 + Math.round(Math.sin(now / 300 + i) * 3); g.fillStyle = "#ffd23f"; g.fillRect(nx, ny, 2, 7); g.fillRect(nx - 3, ny + 5, 4, 3); g.fillRect(nx + 2, ny, 3, 2); }
      // screen
      if (a) Y.src(q(".p-screen img"), a.thumb);
      if (vm.videoOk && Y.frameTick !== st.ft) { st.ft = Y.frameTick; const d = Y.pixels(96, 54);
        if (d) { const o = st.o || (st.o = st.c.createImageData(96, 54)); for (let i = 0; i < d.length; i += 4) { o.data[i] = Math.round(d[i] / 51) * 51; o.data[i + 1] = Math.round(d[i + 1] / 51) * 51; o.data[i + 2] = Math.round(d[i + 2] / 64) * 64; o.data[i + 3] = 255; } st.c.putImageData(o, 0, 0); }
        else st.c.drawImage(Y.frame, 0, 0, 96, 54); }
      q(".p-screen canvas").style.opacity = vm.videoOk ? "1" : "0";
      Y.txt(q(".p-screen i"), vm.paused ? "ǁ pause" : "▶ live");
      // hud
      Y.swap(q(".p-title"), a ? a.title : "press start"); Y.txt(q(".p-sub"), a ? a.sub : "play a youtube mix");
      const cnt = Y.count(vm); q(".p-mid").dataset.mode = cnt ? "count" : "text";
      Y.txt(q(".p-cl"), vm.eyebrow); Y.txt(q(".p-cn"), cnt ? cnt : vm.headline);
      Y.txt(q(".p-bpm"), a && a.bpm ? String(Math.round(a.bpm)).padStart(3, "0") : "---"); Y.txt(q(".p-key"), a && a.key ? a.key.replace(" major", "").replace(" minor", "m") : "--"); Y.txt(q(".p-cam"), a && a.cam ? a.cam : "--");
      q(".p-card").style.visibility = b ? "visible" : "hidden";
      if (b) { Y.txt(q(".p-nl"), vm.kind === "blending" ? "loading stage" : "next stage"); Y.txt(q(".p-nt"), b.title); Y.txt(q(".p-ns"), Y.meta(b, " / "));
        Y.once(st, "nt", b.thumb, () => Y.img(b.thumb, (im) => { const k = im.naturalHeight / 360; st.nc.drawImage(im, 60 * k, 45 * k, 360 * k, 270 * k, 0, 0, 40, 30); }));
        q(".p-nc").style.transform = vm.kind === "blending" ? `scale(${1 + ((now / 250 | 0) & 1) * 0.06})` : ""; }
      // level map
      const pi = vm.dur ? Math.floor(Y.prog(vm) * 44) : -1, secs = Y.sections(vm), mx = Y.mix(vm);
      Y.once(st, "map", `${pi}|${secs.length}|${mx ? mx.a : ""}`, () => [...q(".p-blocks").children].forEach((e, i) => { const c = (i + 0.5) / 44;
        e.className = (i < pi ? "on " : i === pi ? "hd " : "") + (mx && c * 100 >= mx.a - 1.2 && c * 100 <= mx.b + 1.2 ? "mx" : secs.some((s) => s.chorus && c >= s.a && c < s.b) ? "ch" : ""); }));
      Y.txt(q(".p-t0"), vm.dur ? Y.fmt(vm.time) : "0:00"); Y.txt(q(".p-t1"), vm.dur ? Y.fmt(vm.dur) : "-:--");
      // text box, typed out
      const body = vm.step >= 0 ? `Scouting the next stage... ${vm.steps[vm.step]}.` : vm.plan && cnt ? `${vm.body} ${vm.plan.tech}, ${vm.plan.camA} to ${vm.plan.camB}.` : vm.body;
      if (body !== st.body) { st.body = body; st.typed = 0; }
      st.typed = Math.min(body.length, st.typed + dt * 46); Y.txt(q(".p-body"), body.slice(0, st.typed | 0));
      Y.stepDots(q(".p-steps"), vm); Y.showCta(q(".p-act"), vm);
    },
  });
})();
