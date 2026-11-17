// Runs monteslu/htdemucs-web-onnx (fp16, 21 chained pieces) behind the same {inputNames, outputNames, run}
// surface as one InferenceSession, so demucs-web's DemucsProcessor can drive it unchanged.
// Boundary tensors stay on the GPU ('gpu-buffer'); only the final x / xt come back to the CPU.
const CPU_NODES = ["/ReduceMean", "/Sub", "/Pow", "/ReduceMean_1", "/Clip", "/Sqrt", "/Add", "/Div",
  "/ReduceMean_2", "/Sub_1", "/Pow_1", "/ReduceMean_3", "/Clip_1", "/Sqrt_1", "/Add_1", "/Div_1"];

export async function createChain(ort, dir) {
  const man = await (await fetch(`${dir}/htdemucs_split_manifest.json`)).json();
  const finals = new Set(Object.values(man.outputs));
  const sessions = [];
  for (const [k, p] of man.pieces.entries()) {
    const loc = Object.fromEntries(p.outputs.map((o) => [o, finals.has(o) ? "cpu" : "gpu-buffer"]));
    sessions.push(await ort.InferenceSession.create(`${dir}/${p.file}`, {
      executionProviders: [k === 0 ? { name: "webgpu", forceCpuNodeNames: CPU_NODES } : "webgpu"],
      graphOptimizationLevel: "all",
      preferredOutputLocation: loc,
    }));
  }
  return {
    inputNames: ["mix", "mag"],
    outputNames: [man.outputs.freq, man.outputs.time],
    async run(feeds) {
      const env = { ...feeds }, onGpu = [];
      for (const [k, p] of man.pieces.entries()) {
        const f = Object.fromEntries(p.inputs.map((n) => [n, env[n]]));
        const r = await sessions[k].run(f);
        for (const [n, tns] of Object.entries(r)) { env[n] = tns; if (!finals.has(n)) onGpu.push(tns); }
      }
      for (const tns of onGpu) tns.dispose();
      return { [man.outputs.freq]: env[man.outputs.freq], [man.outputs.time]: env[man.outputs.time] };
    },
  };
}
