// Synthesizes the soundtrack: 120 BPM, A minor, bar lines on the scene cuts (3.5 / 7.5 / 11.5 / 15.5 / 19.5).
// Effects are pitched in key and sent through the same reverb as the music. Writes music.wav (48 kHz stereo).
import { writeFileSync } from 'node:fs';

const SR = 48000, DUR = 22.0, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const sendL = new Float32Array(N), sendR = new Float32Array(N); // reverb send
const BEAT = 0.5, BAR = 2.0, BAR0 = -0.5; // bar lines at -0.5 + 2k
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(t0, dur, fn, { gain = 1, pan = 0, send = 0 } = {}) {
  const i0 = Math.max(0, Math.round(t0 * SR)), i1 = Math.min(N, Math.round((t0 + dur) * SR));
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = i0; i < i1; i++) { const v = fn(Math.max(0, (i - t0 * SR) / SR)); L[i] += v * gl; R[i] += v * gr; sendL[i] += v * gl * send; sendR[i] += v * gr * send; }
}
// one-pole filters on a generated buffer
function noiseBuf(dur, hp = 0, lp = 1) {
  const n = Math.round(dur * SR) + 4, out = new Float32Array(n); let lo = 0, prev = 0, hpo = 0;
  for (let i = 0; i < n; i++) { const x = rnd(); lo += lp * (x - lo); hpo = hp ? (hpo + lo - prev) * (1 - hp) : lo; prev = lo; out[i] = hpo; }
  return out;
}

// Chords per bar (k = bar index from -0.5s): i, VI, III, VII in A minor; outro rests on A minor.
const CH = { Am: [57, 60, 64], F: [53, 57, 60], C: [55, 60, 64], G: [55, 59, 62] };
const ROOT = { Am: 45, F: 41, C: 48, G: 43 };
const prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'Am', 'Am'];
const chordAt = (t) => prog[Math.max(0, Math.min(prog.length - 1, Math.floor((t - BAR0) / BAR)))];

// ---- pad: detuned additive voices, bar-length chords with soft attack/release
for (let k = 0; k < prog.length; k++) {
  const t0 = BAR0 + k * BAR, name = prog[k];
  const len = k === prog.length - 2 ? 4.5 : BAR + 0.35;
  const notes = [...CH[name], CH[name][0] + 12];
  for (const m of notes) for (const det of [-0.06, 0.06]) {
    const f = midi(m) * Math.pow(2, det / 12);
    add(t0, len, (x) => {
      const env = Math.min(1, x / 0.35) * Math.min(1, Math.max(0, (len - x) / 0.5));
      let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(2 * Math.PI * f * h * x + h) / (h * h);
      return v * env;
    }, { gain: 0.026, pan: det > 0 ? 0.35 : -0.35, send: 0.5 });
  }
}

// ---- arp pluck: 16ths of chord tones, softer in the hook, rests in the outro
const ARP = [0, 1, 2, 3, 2, 1, 0, 2];
for (let t = 0; t < 19.5; t += BEAT / 4) {
  const step = Math.round((t - BAR0) / (BEAT / 4));
  const tones = [...CH[chordAt(t)], CH[chordAt(t)][0] + 12].map((m) => m + 12);
  const f = midi(tones[ARP[step % 8]]);
  const g = t < 3.5 ? 0.042 : t >= 15.5 && t < 17.5 ? 0.018 : 0.022;
  add(t, 0.28, (x) => Math.exp(-x * 14) * (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(4 * Math.PI * f * x)), { gain: g, pan: step % 2 ? 0.25 : -0.25, send: 0.35 });
}

// ---- drums + bass (enter on the reveal; drop out while the terminal boots, back in on the theme flip)
const groove = (t) => t >= 3.5 && t < 19.5 && !(t >= 15.5 && t < 17.5);
for (let t = 3.5; t < 19.5; t += BEAT) {
  if (!groove(t)) continue;
  add(t, 0.35, (x) => { const f = 45 + 95 * Math.exp(-x * 28); return Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 9) * Math.min(1, x / 0.003); }, { gain: 0.24 });
  // bass on the offbeat 8th
  const tb = t + BEAT / 2, f = midi(ROOT[chordAt(tb)]);
  add(tb, 0.22, (x) => { const e = Math.min(1, x / 0.006) * Math.exp(-x * 9); return (Math.sin(2 * Math.PI * f * x) + 0.35 * Math.sin(4 * Math.PI * f * x)) * e; }, { gain: 0.16 });
  // hat on the offbeat
  const hat = noiseBuf(0.06, 0.6, 1);
  add(tb, 0.06, (x) => hat[Math.min(hat.length - 1, Math.floor(x * SR))] * Math.exp(-x * 60), { gain: 0.05, pan: 0.2, send: 0.1 });
  // soft clap on 2 and 4
  const beatIdx = Math.round((t - BAR0) / BEAT) % 4;
  if (beatIdx === 1 || beatIdx === 3) { const cl = noiseBuf(0.2, 0.15, 0.5); add(t, 0.2, (x) => cl[Math.floor(x * SR)] * Math.exp(-x * 22), { gain: 0.07, send: 0.4 }); }
}
// hook: quiet ticking hats before the drop, and a swell into it
for (let t = 1.5; t < 3.5; t += BEAT / 2) { const h = noiseBuf(0.04, 0.7, 1); add(t, 0.04, (x) => h[Math.floor(x * SR)] * Math.exp(-x * 80), { gain: 0.03, pan: -0.2 }); }
{ const sw = noiseBuf(1.2, 0.05, 0.25); add(2.3, 1.2, (x) => sw[Math.floor(x * SR)] * Math.pow(x / 1.2, 2.2), { gain: 0.09, send: 0.5 }); }

// ---- sound effects, in key (A minor pentatonic), sitting under the music
const blip = (t, m, g = 0.035, pan = 0) => add(t, 0.18, (x) => Math.sin(2 * Math.PI * midi(m) * x) * Math.exp(-x * 30), { gain: g, pan, send: 0.3 });
const tick = (t, g = 0.03, pan = 0) => { const b = noiseBuf(0.03, 0.5, 0.8); add(t, 0.03, (x) => b[Math.floor(x * SR)] * Math.exp(-x * 150), { gain: g, pan }); };
const key = (t, g = 0.08) => { // mechanical key: low thock + click
  add(t, 0.09, (x) => Math.sin(2 * Math.PI * 180 * x) * Math.exp(-x * 60), { gain: g, send: 0.15 });
  tick(t, g * 0.8);
};
const whoosh = (t, len = 0.32, g = 0.05) => { const b = noiseBuf(len, 0.2, 0.35); add(t, len, (x) => b[Math.floor(x * SR)] * Math.sin(Math.PI * x / len), { gain: g, send: 0.4 }); };

for (let i = 0; i < 10; i++) tick(0.06 + i * 0.05, 0.018, -0.3);                       // route label types on
for (const [a, b] of [[1.05, 1.5], [2.05, 2.5]]) for (let t = a; t < b; t += 1 / 30) tick(t, 0.012, 0.3); // decoder scramble
blip(1.5, 76, 0.03); blip(2.5, 81, 0.03);                                                 // decoder locks
for (let i = 0; i < 13; i++) blip(3.9 + i * 0.1, [69, 72, 76, 79, 81][i % 5], 0.02, 0.3); // terminal lines print
for (let t = 5.85; t < 6.85; t += 0.06) tick(t, 0.014);                                   // count-up
for (const c of [7.5, 11.5, 15.5]) whoosh(c - 0.2);                                       // in-frame cuts
key(8.98, 0.07); blip(9.05, 81, 0.025);                                                    // cursor click on In motion
[69, 72, 76, 79, 81].forEach((m, i) => blip(i === 0 ? 11.62 : 11.85 + (i - 1) * 0.22, m, 0.03)); // trace "hay" route
whoosh(13.62, 0.28, 0.03); whoosh(14.0, 0.45, 0.03);                                      // highlighter swipes
key(15.65); key(15.85);                                                                    // m, n
add(16.05, 0.5, (x) => Math.sin(2 * Math.PI * midi(45) * x) * Math.exp(-x * 7), { gain: 0.12, send: 0.3 }); // dialog opens
for (let i = 0; i < 5; i++) tick(16.12 + i * 0.11, 0.02);                                  // boot lines
for (let i = 0; i < 5; i++) key(16.95 + i * 0.09, 0.05);                                   // t-h-e-m-e
key(17.5, 0.1);                                                                            // enter
for (const m of [57, 64, 69, 76]) add(17.52, 2.2, (x) => Math.sin(2 * Math.PI * midi(m) * x) * Math.exp(-x * 2.2) * Math.min(1, x / 0.01), { gain: 0.03, send: 0.7 }); // theme flip chime
key(18.15, 0.08);                                                                          // esc
add(19.5, 2.4, (x) => Math.sin(2 * Math.PI * 55 * x) * Math.exp(-x * 1.6) * Math.min(1, x / 0.02), { gain: 0.17 }); // outro low boom
for (const m of [57, 64, 69, 72]) add(19.5, 2.5, (x) => Math.sin(2 * Math.PI * midi(m) * x) * Math.exp(-x * 1.2) * Math.min(1, x / 0.02), { gain: 0.03, send: 0.6 });

// ---- Schroeder reverb on the send bus
function reverb(inp, combs, aps) {
  const out = new Float32Array(N);
  for (const [d, g] of combs) { const buf = new Float32Array(d); let j = 0, lp = 0; for (let i = 0; i < N; i++) { const y = buf[j]; lp = y * 0.7 + lp * 0.3; buf[j] = inp[i] + lp * g; out[i] += y / combs.length; j = (j + 1) % d; } }
  for (const [d, g] of aps) { const buf = new Float32Array(d); let j = 0; for (let i = 0; i < N; i++) { const b = buf[j]; const x = out[i]; const y = -g * x + b; buf[j] = x + g * y; out[i] = y; j = (j + 1) % d; } }
  return out;
}
const rvL = reverb(sendL, [[1557, .8], [1617, .8], [1491, .8], [1422, .8]], [[225, .5], [556, .5]]);
const rvR = reverb(sendR, [[1583, .8], [1641, .8], [1511, .8], [1447, .8]], [[241, .5], [579, .5]]);
for (let i = 0; i < N; i++) { L[i] += rvL[i] * 0.55; R[i] += rvR[i] * 0.55; }

// ---- master: gentle fade-in/out, soft clip, normalize to -1 dBFS
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, g = Math.min(1, t / 0.02) * Math.min(1, (DUR - t) / 0.7);
  L[i] = Math.tanh(L[i] * g * 1.1); R[i] = Math.tanh(R[i] * g * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4); }
writeFileSync(new URL('./music.wav', import.meta.url), buf);
console.log('music.wav', DUR + 's', 'peak before norm', peak.toFixed(3));
