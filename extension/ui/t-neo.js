// Neoclassical: a marble temple. The video is a living bas-relief in the cella, the title is carved into the
// entablature, the countdown is counted in Roman numerals on a stele, and the song's progress gilds a Greek key.
(() => {
  const Y = window.YTDJ;
  const VEINS = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='900'><filter id='m' x='0' y='0' width='100%' height='100%'>
    <feTurbulence type='fractalNoise' baseFrequency='.0028 .0075' numOctaves='6' seed='23' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 .36  0 0 0 0 .33  0 0 0 0 .29  1 0 0 0 0'/>
    <feComponentTransfer><feFuncA type='table' tableValues='0 0 0 0 0 .05 .5 .05 0 0 0 0 0'/></feComponentTransfer></filter>
    <rect width='100%' height='100%' filter='url(#m)'/></svg>`);
  const CLOUD = Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='700'><filter id='m' x='0' y='0' width='100%' height='100%'>
    <feTurbulence type='fractalNoise' baseFrequency='.006 .004' numOctaves='4' seed='4' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 .45  0 0 0 0 .41  0 0 0 0 .34  .9 0 0 0 -.3'/></filter>
    <rect width='100%' height='100%' filter='url(#m)'/></svg>`);
  const key = (c) => Y.svg(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='16'><path d='M0 14H20V2H4V10H14V6H9' fill='none' stroke='${c}' stroke-width='1.6'/></svg>`);
  const GILT = "linear-gradient(100deg,#7d5e1c,#c9a24a 22%,#f6e7ae 36%,#b68d35 52%,#8a6a22 66%,#dcbc66 82%,#7d5e1c)";

  // brightness as height, lit from the upper left: turns any picture into carved stone
  function carve(data, W, H, cx, st) {
    const L = st.L && st.L.length === W * H ? st.L : (st.L = new Float32Array(W * H)), B = st.B && st.B.length === W * H ? st.B : (st.B = new Float32Array(W * H));
    for (let i = 0, j = 0; i < W * H; i++, j += 4) L[i] = data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11;
    for (let y = 1; y < H - 1; y++) for (let x = 1, i = y * W + 1; x < W - 1; x++, i++)
      B[i] = (L[i] * 2 + L[i - 1] + L[i + 1] + L[i - W] + L[i + W] + (L[i - W - 1] + L[i - W + 1] + L[i + W - 1] + L[i + W + 1]) * 0.5) / 8;
    const out = st.out && st.out.width === W && st.out.height === H ? st.out : (st.out = cx.createImageData(W, H)), o = out.data;
    for (let y = 1; y < H - 1; y++) for (let x = 1, i = y * W + 1; x < W - 1; x++, i++) {
      const g = (B[i + 1] - B[i - 1]) + (B[i + W] - B[i - W]);
      let s = 0.8 + (B[i] - 128) * 0.00075 + g * 0.0098;
      s = s < 0.42 ? 0.42 : s > 1.08 ? 1.08 : s;
      const j = i * 4; o[j] = 240 * s; o[j + 1] = 234 * s; o[j + 2] = 222 * s; o[j + 3] = 255;
    }
    cx.putImageData(out, 0, 0);
  }

  Y.theme("Neoclassical", {
    swatch: ["#ece7dc", "#a8812f"],
    cls: "neo",
    html: `
      <div class="n-wall"></div><div class="n-shaft"></div><canvas class="n-motes"></canvas>
      <div class="n-stage">
        <aside class="n-stele"><div class="n-st-in">
          <p class="n-eyebrow"></p>
          <div class="n-num"></div>
          <p class="n-arabic"></p>
          <i class="n-rule"></i>
          <p class="n-body"></p>
          <div class="n-steps"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <button class="n-act"></button>
        </div></aside>
        <main class="n-temple">
          <div class="n-pedw"><div class="n-ped"><div class="n-tymp"></div></div><i class="n-oculus"><i></i></i></div>
          <div class="n-ent"><div class="n-title"></div><i class="n-dentil"></i></div>
          <div class="n-cella">
            <div class="n-col"><i class="n-cap"></i><i class="n-sh"></i><i class="n-base"></i></div>
            <button class="n-frame" title="Play or pause"><div class="n-panel"><img class="n-thumb" alt=""><canvas class="n-relief" width="256" height="144"></canvas><i class="n-vein"></i></div></button>
            <div class="n-col"><i class="n-cap"></i><i class="n-sh"></i><i class="n-base"></i></div>
          </div>
          <div class="n-styl">
            <div class="n-key"><i class="n-keyg"></i><i class="n-mixw"></i><i class="n-head"></i></div>
            <div class="n-secs"></div>
          </div>
          <div class="n-foot"><span class="n-sub"></span><span class="n-meta"></span><span class="n-time"></span></div>
        </main>
        <aside class="n-niche">
          <div class="n-arch"><div class="n-tondo"><canvas class="n-tc" width="180" height="180"></canvas><i class="n-ring"></i></div></div>
          <p class="n-nx-l"></p><p class="n-nx-t"></p><p class="n-nx-s"></p>
        </aside>
      </div>`,
    css: `
    .ov[data-theme="Neoclassical"] .dock { --dk-font: "Cinzel", serif; --dk-size: 11.5px; --dk-track: .1em; --dk-ink: #2c2823; --dk-line: rgba(44,40,35,.3); --dk-chip: rgba(44,40,35,.09); --dk-accent: #9a7628; --dk-on: #fffaf0; }
    .neo { background: #e9e4d9; color: #2c2823; font-family: "Cormorant Garamond", serif; }
    .neo p { margin: 0; }
    .n-wall { position: absolute; inset: -4%; background: ${VEINS} 0 0/1400px 900px, ${CLOUD} 0 0/1000px 700px, radial-gradient(ellipse 80% 70% at 50% 42%, #f4f1ea, #e3dccd 70%, #d2c9b6); }
    .n-shaft { position: absolute; top: -30%; left: 0; width: 34vw; height: 160%; transform-origin: 50% 50%; pointer-events: none; mix-blend-mode: soft-light;
      background: linear-gradient(90deg, transparent, rgba(255,252,240,.95) 35%, rgba(255,250,230,.75) 60%, transparent); filter: blur(18px); }
    .n-motes { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; }
    .n-stage { position: absolute; inset: 60px 0 0 0; display: flex; align-items: center; justify-content: center; gap: calc(var(--u) * 3); padding-bottom: 1vh; }
    .n-cut { color: rgba(58,50,40,.82); text-shadow: 0 1px 0 rgba(255,255,255,.8), 0 -1px 1px rgba(40,30,15,.3); }

    /* temple */
    .n-temple { width: calc(var(--u) * 56); flex: none; display: flex; flex-direction: column; align-items: center; }
    .n-pedw { position: relative; width: 104%; height: calc(var(--u) * 8.4); filter: drop-shadow(0 calc(var(--u) * .5) calc(var(--u) * .6) rgba(70,58,40,.35)); }
    .n-ped { position: absolute; inset: 0; clip-path: polygon(50% 0, 100% 100%, 0 100%); background: linear-gradient(180deg, #faf8f2, #e6dfd1); }
    .n-tymp { position: absolute; left: 6%; right: 6%; top: 16%; bottom: 9%; clip-path: polygon(50% 0, 100% 100%, 0 100%);
      background: ${VEINS} 30% 60%/900px 600px, linear-gradient(180deg, #b9af9c, #d6cebd 70%); box-shadow: inset 0 0 20px rgba(0,0,0,.4); }
    .n-oculus { position: absolute; left: 50%; top: 62%; width: calc(var(--u) * 3.6); height: calc(var(--u) * 3.6); margin: calc(var(--u) * -1.8); border-radius: 50%;
      background: repeating-conic-gradient(from 0deg, #f3e2a4 0 7.5deg, #9a7628 7.5deg 15deg); box-shadow: 0 0 0 1px #7d5e1c, 0 2px 6px rgba(60,40,0,.5), 0 0 calc(var(--u) * 2.4) rgba(240,205,120,var(--glow,.2)); }
    .n-oculus i { position: absolute; inset: 24%; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff6cf, #c9a24a 55%, #7d5e1c); box-shadow: 0 0 0 1px #7d5e1c; }
    .n-ent { position: relative; width: 100%; height: calc(var(--u) * 5.6); background: linear-gradient(180deg, #fbf9f4, #ebe5d8 78%, #d6cebd); display: flex; align-items: center; justify-content: center;
      padding: 0 calc(var(--u) * 2) calc(var(--u) * .9); box-shadow: 0 1px 0 #fff inset, 0 calc(var(--u) * .4) calc(var(--u) * .7) rgba(70,58,40,.3); z-index: 2; }
    .n-title { width: 100%; text-align: center; white-space: nowrap; overflow: hidden; font-family: "Cinzel", serif; font-weight: 600; letter-spacing: .26em; text-indent: .26em; line-height: 1.1; text-transform: uppercase;
      background: ${GILT} 0 0/300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
      filter: drop-shadow(0 1px 0 rgba(255,255,255,.85)) drop-shadow(0 -1px 0 rgba(70,48,0,.5)); animation: n-gilt 14s linear infinite; }
    .n-title.re { animation: n-gilt 14s linear infinite, n-carve 1.6s ease both; }
    @keyframes n-gilt { to { background-position: -300% 0; } }
    @keyframes n-carve { from { opacity: 0; letter-spacing: .5em; } }
    .n-dentil { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--u) * .7);
      background: repeating-linear-gradient(90deg, #f6f3ec 0 calc(var(--u) * .62), #a69c88 calc(var(--u) * .62) calc(var(--u) * .7), #cfc7b5 calc(var(--u) * .7) calc(var(--u) * 1.1)); box-shadow: inset 0 2px 3px rgba(0,0,0,.25); }
    .n-cella { width: 100%; display: flex; justify-content: space-between; align-items: stretch; padding: 0 calc(var(--u) * 1); background: linear-gradient(180deg, #a59b87, #cbc2b0 14%, #d8d0c0); box-shadow: inset 0 calc(var(--u) * 1.4) calc(var(--u) * 1.6) rgba(40,30,15,.45); }
    .n-col { width: calc(var(--u) * 4.4); display: flex; flex-direction: column; align-items: center; filter: drop-shadow(calc(var(--u) * .5) 0 calc(var(--u) * .5) rgba(50,40,25,.4)); }
    .n-cap { width: 128%; height: calc(var(--u) * 1.7); background: linear-gradient(180deg, #fdfcf8 0 34%, #b8ae9b 36%, #efeadf 44%); clip-path: polygon(0 0, 100% 0, 100% 36%, 89% 100%, 11% 100%, 0 36%); }
    .n-sh { width: 100%; flex: 1; background: linear-gradient(90deg, rgba(60,48,30,.42), transparent 28%, rgba(255,255,255,.42) 44%, transparent 62%, rgba(60,48,30,.5)),
      repeating-linear-gradient(90deg, #f7f4ec 0, #e2dccf 30%, #a89e8b 50%, #e9e3d7 68%, #f7f4ec 100%) 0 0/14.2857% 100%; }
    .n-base { width: 134%; height: calc(var(--u) * 1.5); background: linear-gradient(180deg, #a69c88 0 8%, #f6f3ec 14% 40%, #b8ae9b 46% 52%, #fbf9f4 58%, #ddd5c5); border-radius: calc(var(--u) * .3) calc(var(--u) * .3) 0 0; }
    .n-frame { display: block; align-self: center; margin: calc(var(--u) * .9) 0; padding: calc(var(--u) * .8); cursor: pointer;
      background: radial-gradient(circle, #fbf9f3 0 30%, #b3a995 56%, #d9d1c1 62%) 0 0/calc(var(--u) * .8) calc(var(--u) * .8);
      box-shadow: 0 0 0 1px #9d937f, 0 0 0 calc(var(--u) * .28) #efeadf, 0 0 0 calc(var(--u) * .32) #9d937f, calc(var(--u) * .5) calc(var(--u) * .7) calc(var(--u) * 1) rgba(40,30,15,.45); }
    .n-panel { position: relative; width: calc(var(--u) * 41.6); aspect-ratio: 16/9; overflow: hidden; background: #d9d2c3; box-shadow: 0 0 0 1px #8f8571; }
    .n-thumb, .n-relief { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .n-thumb { filter: grayscale(1) sepia(.22) contrast(.7) brightness(1.25); transform: scale(1.34); }
    .n-relief { transition: opacity 1.4s ease; }
    .n-relief.flat { filter: grayscale(1) sepia(.2) contrast(.8) brightness(1.2); }
    .n-vein { position: absolute; inset: 0; background: ${VEINS} 70% 20%/1100px 700px; mix-blend-mode: multiply; opacity: .55; box-shadow: inset calc(var(--u) * .35) calc(var(--u) * .35) calc(var(--u) * .9) rgba(40,30,15,.55), inset calc(var(--u) * -.2) calc(var(--u) * -.2) calc(var(--u) * .5) rgba(255,255,255,.5); }
    .n-styl { width: 106%; padding: calc(var(--u) * .7) calc(var(--u) * 2.2) calc(var(--u) * .5); background: linear-gradient(180deg, #fbf9f4, #e8e2d5); box-shadow: 0 1px 0 #fff inset, 0 calc(var(--u) * .8) calc(var(--u) * 1.2) rgba(70,58,40,.35); position: relative; z-index: 2; }
    .n-key { position: relative; height: 16px; background: ${key("rgba(70,60,45,.34)")} 0 0/24px 16px repeat-x; }
    .n-keyg { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: ${key("#a8812f")} 0 0/24px 16px repeat-x; filter: drop-shadow(0 1px 0 rgba(255,255,255,.8)); }
    .n-head { position: absolute; top: -5px; width: 9px; height: 9px; margin-left: -4.5px; transform: rotate(45deg); background: linear-gradient(135deg, #f6e7ae, #9a7628); box-shadow: 0 0 0 1px #7d5e1c, 0 0 10px rgba(220,180,90,.9); }
    .n-mixw { position: absolute; top: -4px; bottom: -4px; border: 1px solid #9a7628; border-top-width: 0; border-bottom-width: 2px; background: linear-gradient(180deg, transparent, rgba(201,162,74,.28)); display: none; }
    .n-mixw::after { content: "the blend"; position: absolute; left: 50%; bottom: calc(100% + 1px); transform: translateX(-50%); font: italic 500 13px/1 "Cormorant Garamond", serif; color: #7d5e1c; white-space: nowrap; }
    .n-secs { position: relative; height: 17px; margin-top: 4px; }
    .n-secs span { position: absolute; top: 0; height: 100%; border-left: 1px solid rgba(70,60,45,.4); padding-left: 5px; font: italic 500 13.5px/17px "Cormorant Garamond", serif; color: rgba(58,50,40,.75); white-space: nowrap; overflow: hidden; }
    .n-secs span.ch { color: #7d5e1c; border-left-color: #9a7628; }
    .n-foot { width: 100%; margin-top: calc(var(--u) * 1.1); display: flex; justify-content: space-between; align-items: baseline; gap: 20px; font-size: clamp(15px, calc(var(--u) * 1.25), 21px); font-style: italic; font-weight: 500; color: #4a4238; }
    .n-sub { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .n-meta, .n-time { font-style: normal; font-family: "Cinzel", serif; font-size: .68em; letter-spacing: .14em; white-space: nowrap; font-variant-numeric: tabular-nums; }

    /* stele */
    .n-stele, .n-niche { width: calc(var(--u) * 16); flex: none; }
    .n-stele { padding: calc(var(--u) * .5); background: linear-gradient(170deg, #fbf9f4, #e4ddcf); border-radius: calc(var(--u) * 8) calc(var(--u) * 8) 2px 2px / calc(var(--u) * 3.4) calc(var(--u) * 3.4) 2px 2px;
      box-shadow: calc(var(--u) * .7) calc(var(--u) * 1) calc(var(--u) * 1.6) rgba(60,48,30,.38), inset 0 1px 0 #fff; }
    .n-st-in { min-height: calc(var(--u) * 30); padding: calc(var(--u) * 3.2) calc(var(--u) * 1.4) calc(var(--u) * 2); display: flex; flex-direction: column; align-items: center; gap: calc(var(--u) * .9); text-align: center;
      border: 1px solid rgba(110,96,74,.5); border-radius: inherit; background: ${VEINS} 10% 80%/1000px 640px; box-shadow: inset 0 0 0 3px rgba(255,255,255,.5), inset 0 0 0 4px rgba(110,96,74,.25); }
    .n-eyebrow { font: 600 clamp(11px, calc(var(--u) * .86), 14px)/1 "Cinzel", serif; letter-spacing: .3em; text-indent: .3em; text-transform: uppercase; color: rgba(58,50,40,.82); text-shadow: 0 1px 0 rgba(255,255,255,.8); }
    .n-num { width: 100%; font-family: "Cinzel", serif; font-weight: 400; line-height: 1.05; white-space: nowrap; overflow: hidden; color: rgba(52,45,36,.86); text-shadow: 0 1px 0 rgba(255,255,255,.9), 0 -1px 1px rgba(40,30,15,.4); letter-spacing: .04em; }
    .n-stele[data-mode="text"] .n-num { white-space: normal; font-size: clamp(19px, calc(var(--u) * 1.75), 30px) !important; text-wrap: balance; letter-spacing: .06em; text-transform: uppercase; }
    .n-arabic { font: italic 500 clamp(15px, calc(var(--u) * 1.2), 20px)/1.2 "Cormorant Garamond", serif; color: #7d5e1c; font-variant-numeric: tabular-nums; }
    .n-rule { width: 46%; height: 9px; background: linear-gradient(#9d937f, #9d937f) 0 4px/100% 1px no-repeat; position: relative; }
    .n-rule::after { content: ""; position: absolute; left: 50%; top: 1px; width: 7px; height: 7px; margin-left: -3.5px; transform: rotate(45deg); background: #a8812f; }
    .n-body { font: 500 clamp(15px, calc(var(--u) * 1.22), 20px)/1.32 "Cormorant Garamond", serif; color: #4a4238; text-wrap: pretty; }
    .n-steps { display: flex; gap: 9px; margin-top: 2px; }
    .n-steps i { width: 8px; height: 8px; transform: rotate(45deg); border: 1px solid #9d937f; transition: background .6s ease, box-shadow .6s ease; }
    .n-steps i[data-s="done"] { background: #5a5044; border-color: #5a5044; }
    .n-steps i[data-s="now"] { background: #c9a24a; border-color: #7d5e1c; box-shadow: 0 0 9px rgba(220,180,90,.9); animation: n-now 1.6s ease-in-out infinite; }
    @keyframes n-now { 50% { opacity: .45; } }
    .n-act { margin-top: 4px; padding: 9px 14px; border: 1px solid #7d5e1c; font: 600 11px/1 "Cinzel", serif; letter-spacing: .16em; text-transform: uppercase; color: #5f4612; background: rgba(201,162,74,.16); }
    .n-act:hover { background: rgba(201,162,74,.34); }

    /* niche with the next song */
    .n-niche { display: flex; flex-direction: column; align-items: center; text-align: center; gap: calc(var(--u) * .5); }
    .n-arch { width: calc(var(--u) * 14.5); height: calc(var(--u) * 19); margin-bottom: calc(var(--u) * .8); border-radius: calc(var(--u) * 7.25) calc(var(--u) * 7.25) 2px 2px; display: grid; place-items: center;
      background: linear-gradient(180deg, #9d937f, #c9c0ad 45%, #d9d1c1); box-shadow: inset calc(var(--u) * .6) calc(var(--u) * .9) calc(var(--u) * 1.5) rgba(40,30,15,.55), 0 0 0 1px #9d937f, 0 0 0 calc(var(--u) * .45) #f1ede4, 0 0 0 calc(var(--u) * .5) #9d937f; }
    .n-tondo { position: relative; width: calc(var(--u) * 10.6); height: calc(var(--u) * 10.6); border-radius: 50%; will-change: transform; filter: drop-shadow(calc(var(--u) * .4) calc(var(--u) * .7) calc(var(--u) * .7) rgba(40,30,15,.5)); }
    .n-tc { width: 100%; height: 100%; border-radius: 50%; background: #d9d2c3; }
    .n-ring { position: absolute; inset: calc(var(--u) * -.45); border-radius: 50%; background: conic-gradient(from -90deg, #dcbc66 0, #f6e7ae calc(var(--g, 0) * .5%), #a8812f calc(var(--g, 0) * 1%), #efeadf calc(var(--g, 0) * 1%) 100%);
      -webkit-mask: radial-gradient(closest-side, transparent calc(100% - var(--u) * .45), #000 calc(100% - var(--u) * .45 + 1px)); mask: radial-gradient(closest-side, transparent calc(100% - var(--u) * .45), #000 calc(100% - var(--u) * .45 + 1px)); box-shadow: 0 0 0 1px #8f8571; }
    .n-nx-l { font: italic 500 clamp(15px, calc(var(--u) * 1.2), 20px)/1 "Cormorant Garamond", serif; color: #7d5e1c; }
    .n-nx-t { font: 600 clamp(15px, calc(var(--u) * 1.3), 22px)/1.15 "Cinzel", serif; letter-spacing: .14em; text-transform: uppercase; text-wrap: balance; color: rgba(52,45,36,.9); text-shadow: 0 1px 0 rgba(255,255,255,.9), 0 -1px 1px rgba(40,30,15,.3); }
    .n-nx-t.re, .n-num.re { animation: n-fade 1.2s ease both; }
    @keyframes n-fade { from { opacity: 0; } }
    .n-nx-s { font: italic 500 clamp(14px, calc(var(--u) * 1.12), 18px)/1.25 "Cormorant Garamond", serif; color: #5a5044; }
    @media (max-aspect-ratio: 13/10) { .n-stele { display: none; } }
    @media (max-aspect-ratio: 1/1) { .n-niche { display: none; } }
    `,
    mount(el) {
      const q = (s) => el.querySelector(s);
      const st = { el, q, ft: -1, motes: [], rc: q(".n-relief").getContext("2d"), tc: q(".n-tc").getContext("2d"), tid: null, tst: {}, secKey: "", titleKey: "", u: 15 };
      for (let i = 0; i < 54; i++) st.motes.push({ x: Math.random(), y: Math.random(), z: 0.4 + Math.random() * 1.4, p: Math.random() * 6.28, s: 0.4 + Math.random() });
      q(".n-frame").onclick = () => Y.source.act.playPause();
      Y.bindCta(q(".n-act"));
      return st;
    },
    update(st, vm, dt, now) {
      const { q } = st, a = vm.now, b = vm.next, au = vm.audio;
      const u = (st.u = Math.min(innerWidth / 100, innerHeight * 0.0172));

      // entablature inscription
      const tEl = q(".n-title");
      if (Y.swap(tEl, a ? a.title : "YouTube DJ") || st.fitU !== u) { st.fitU = u; Y.fit(tEl, u * 2.9, u * 1.1); }
      Y.txt(q(".n-sub"), a ? a.sub : "");
      Y.txt(q(".n-meta"), a && a.bpm ? `${Math.round(a.bpm)} BPM · ${a.key}` : "");
      Y.txt(q(".n-time"), vm.dur ? `${Y.fmt(vm.time)} / ${Y.fmt(vm.dur)}` : "");

      // the frieze: live relief of the video, a still of the cover while there is nothing to carve
      if (a) Y.src(q(".n-thumb"), a.thumb);
      const rel = q(".n-relief");
      if (vm.videoOk && Y.frameTick !== st.ft) {
        st.ft = Y.frameTick;
        const d = Y.pixels(256, 144);
        if (d) carve(d, 256, 144, st.rc, st);
        else { st.rc.drawImage(Y.frame, 0, 0, 256, 144); rel.classList.add("flat"); }
      }
      rel.style.opacity = vm.videoOk ? "1" : "0";

      // Greek key gilds with the song
      const pr = vm.dur ? Y.clamp(vm.time / vm.dur) * 100 : 0;
      q(".n-keyg").style.width = pr + "%"; q(".n-head").style.left = pr + "%";
      const mw = q(".n-mixw"), ms = vm.plan && Y.pct(vm, vm.plan.mixStart), me = vm.plan && Y.pct(vm, vm.plan.mixEnd);
      if (ms != null && me != null) { mw.style.display = "block"; mw.style.left = ms + "%"; mw.style.width = Math.max(0.6, me - ms) + "%"; } else mw.style.display = "none";
      const secs = Y.sections(vm), sk = (a ? a.id : "") + secs.length + Math.round(vm.dur);
      if (sk !== st.secKey) {
        st.secKey = sk;
        q(".n-secs").innerHTML = secs.map((s) => `<span class="${s.chorus ? "ch" : ""}" style="left:${s.a * 100}%;width:${(s.b - s.a) * 100}%">${(s.b - s.a) > 0.07 ? s.label : ""}</span>`).join("");
      }

      // stele
      const stele = q(".n-stele"), counting = vm.countdown != null;
      stele.dataset.mode = counting ? "count" : "text";
      Y.txt(q(".n-eyebrow"), vm.eyebrow);
      const num = q(".n-num");
      if (counting) { if (Y.txt(num, Y.roman(Math.ceil(vm.countdown))) && num.textContent !== st.numT) { st.numT = num.textContent; Y.fit(num, u * 4.6, u * 1.6); } }
      else Y.swap(num, vm.headline);
      Y.txt(q(".n-arabic"), counting ? `${Y.fmt(Math.ceil(vm.countdown))} · ${vm.plan ? vm.plan.tech.toLowerCase() : ""}` : "");
      q(".n-arabic").style.display = counting ? "" : "none";
      Y.txt(q(".n-body"), vm.body + (counting && vm.plan ? ` ${vm.plan.camA} to ${vm.plan.camB}, over ${vm.plan.blendLen} seconds.` : ""));
      const steps = q(".n-steps"); steps.style.display = vm.step >= 0 ? "flex" : "none";
      [...steps.children].forEach((e, i) => { const s = i < vm.step ? "done" : i === vm.step ? "now" : "todo"; if (e.dataset.s !== s) e.dataset.s = s; });
      Y.showCta(q(".n-act"), vm);

      // niche: the next song as a carved medallion; its rim gilds as the blend takes hold
      q(".n-niche").style.visibility = b ? "visible" : "hidden";
      if (b) {
        Y.txt(q(".n-nx-l"), vm.kind === "blending" ? "entering" : vm.kind === "skipping" ? "passing over" : "next");
        Y.swap(q(".n-nx-t"), b.title);
        if (st.nxk !== b.id + b.bpm) { st.nxk = b.id + b.bpm; q(".n-nx-s").innerHTML = ""; q(".n-nx-s").append(b.sub || "", ...(b.bpm ? [document.createElement("br"), `${Math.round(b.bpm)} bpm, ${b.key}`] : [])); }
        if (st.tid !== b.id) {
          st.tid = b.id;
          const im = new Image(); im.crossOrigin = "anonymous";
          im.onload = () => { if (st.tid !== b.id) return; const c = st.tc; const k = im.naturalHeight / 360; c.drawImage(im, 105 * k, 45 * k, 270 * k, 270 * k, 0, 0, 180, 180);
            try { carve(c.getImageData(0, 0, 180, 180).data, 180, 180, c, st.tst); } catch (_) { q(".n-tc").style.filter = "grayscale(1) sepia(.2) contrast(.8) brightness(1.2)"; } };
          im.src = b.thumb;
        }
      }
      const tondo = q(".n-tondo");
      tondo.style.transform = `scale(${(1 + 0.1 * Y.ease(vm.p) + au.bass * 0.015).toFixed(4)})`;
      Y.sty(q(".n-ring"), "--g", (vm.kind === "blending" ? vm.p * 100 : 0).toFixed(1));

      // light: a shaft of sun crossing the hall, the oculus breathing with the bass, dust in the air
      const cyc = ((now / 1000 / 52) * Y.motion + 0.18) % 1;
      const flash = vm.sinceDrop < 3 ? 1 - vm.sinceDrop / 3 : 0;
      const sx = -0.45 + cyc * 1.9;
      const shaft = q(".n-shaft");
      shaft.style.transform = `translateX(${(sx * innerWidth).toFixed(1)}px) rotate(21deg)`;
      shaft.style.opacity = (0.55 + 0.25 * vm.p + flash * 0.45).toFixed(3);
      const oc = q(".n-oculus");
      oc.style.transform = `rotate(${((now / 260) * Y.motion) % 360}deg) scale(${(1 + au.bass * 0.05 + vm.bounce * 0.07).toFixed(3)})`;
      Y.sty(oc, "--glow", (0.15 + au.bass * 0.7 + flash).toFixed(2));

      const cv = q(".n-motes");
      if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
      const g = st.mg || (st.mg = cv.getContext("2d"));
      g.clearRect(0, 0, cv.width, cv.height);
      const cxs = (sx + 0.17) * innerWidth;
      for (const m of st.motes) {
        m.p += dt * m.s;
        m.x += (Math.sin(m.p * 0.7) * 0.004 - 0.003 * m.z) * dt * Y.motion * (1 + au.bass * 3);
        m.y -= (0.006 + 0.004 * m.z) * dt * Y.motion * (1 + au.level * 4);
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); } if (m.x < -0.02) m.x = 1.02;
        const px = m.x * cv.width, py = m.y * cv.height;
        const inShaft = Math.max(0, 1 - Math.abs(px - (cxs + (py - cv.height / 2) * -0.38)) / (innerWidth * 0.15));
        const al = 0.05 + inShaft * (0.5 + 0.3 * Math.sin(m.p * 3));
        g.fillStyle = `rgba(${inShaft > 0.1 ? "255,236,170" : "120,105,80"},${al.toFixed(3)})`;
        g.beginPath(); g.arc(px, py, m.z * (1 + inShaft * 0.8), 0, 6.283); g.fill();
      }
    },
  });
})();
