/* 极简音频引擎：全部用 WebAudio 合成，零音频文件 */
import { CONFIG } from '../data/content.js';
let ctx = null;
let master = null;
let muted = false;
let ambGain = null;
export function ensureAudio() {
    if (!ctx) {
        const Ctor = window.AudioContext ||
            window.webkitAudioContext;
        ctx = new Ctor();
        master = ctx.createGain();
        master.gain.value = 0.9;
        master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended')
        void ctx.resume();
}
export function getContext() {
    return ctx;
}
export function setMuted(m) {
    muted = m;
    if (master && ctx) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(m ? 0.0001 : 0.9, ctx.currentTime + 0.25);
    }
}
export function isMuted() {
    return muted;
}
/* ---------------- 星光 ---------------- */
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5];
export function chime(index) {
    if (!ctx || !master)
        return;
    const base = SCALE[Math.min(index, SCALE.length - 1)];
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    g.connect(master);
    for (const [mult, gain] of [
        [1, 1],
        [2, 0.28],
        [3, 0.1],
    ]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = base * mult;
        const sub = ctx.createGain();
        sub.gain.value = gain;
        o.connect(sub).connect(g);
        o.start(now);
        o.stop(now + 1.6);
    }
}
export function softClick() {
    if (!ctx || !master)
        return;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.05, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    g.connect(master);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    o.connect(g);
    o.start(now);
    o.stop(now + 0.2);
}
/* ---------------- 环境铺底 ---------------- */
export function startAmbience() {
    if (!ctx || !master)
        return;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.02, now + 3);
    g.connect(master);
    ambGain = g;
    for (const f of [130.81, 196.0, 261.63]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 8;
        o.connect(g);
        o.start(now);
    }
}
export function ambienceLevel(k) {
    if (!ambGain || !ctx)
        return;
    ambGain.gain.cancelScheduledValues(ctx.currentTime);
    ambGain.gain.linearRampToValueAtTime(0.02 * k, ctx.currentTime + 1.4);
}
/* ---------------- 噪声源 ---------------- */
let noiseBuf = null;
function makeNoise(dur) {
    if (!ctx || !master)
        return null;
    if (!noiseBuf) {
        const len = Math.floor(ctx.sampleRate * 2);
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++)
            d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    src.loopEnd = dur;
    return src;
}
/* 吹灭的声音：宽频噪声 + 低通一路下滑 */
export function sndBlowOut() {
    if (!ctx || !master)
        return;
    const now = ctx.currentTime;
    const src = makeNoise(1.2);
    if (!src)
        return;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1400, now);
    lp.frequency.exponentialRampToValueAtTime(220, now + 1.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.26, now + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
    src.connect(lp).connect(g).connect(master);
    src.start(now);
    src.stop(now + 1.2);
}
/* 切蛋糕：短促的"唰" */
export function sndSlice() {
    if (!ctx || !master)
        return;
    const now = ctx.currentTime;
    const src = makeNoise(0.4);
    if (!src)
        return;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(4200, now);
    bp.frequency.exponentialRampToValueAtTime(700, now + 0.32);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.2, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    src.connect(bp).connect(g).connect(master);
    src.start(now);
    src.stop(now + 0.4);
}
/* 烟花爆开 */
export function sndPop() {
    if (!ctx || !master)
        return;
    const now = ctx.currentTime;
    const src = makeNoise(0.5);
    if (!src)
        return;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, now);
    lp.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    src.connect(lp).connect(g).connect(master);
    src.start(now);
    src.stop(now + 0.5);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, now);
    o.frequency.exponentialRampToValueAtTime(48, now + 0.28);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, now);
    og.gain.linearRampToValueAtTime(0.12, now + 0.01);
    og.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    o.connect(og).connect(master);
    o.start(now);
    o.stop(now + 0.4);
}
const G4 = 392.0;
const A4 = 440.0;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;
const MELODY = [
    { f: G4, b: 0.75 },
    { f: G4, b: 0.25 },
    { f: A4, b: 1 },
    { f: G4, b: 1 },
    { f: C5, b: 1 },
    { f: B4, b: 2 },
    { f: G4, b: 0.75 },
    { f: G4, b: 0.25 },
    { f: A4, b: 1 },
    { f: G4, b: 1 },
    { f: D5, b: 1 },
    { f: C5, b: 2 },
    { f: G4, b: 0.75 },
    { f: G4, b: 0.25 },
    { f: G5, b: 1 },
    { f: E5, b: 1 },
    { f: C5, b: 1 },
    { f: B4, b: 1 },
    { f: A4, b: 1.5 },
    { f: F5, b: 0.75 },
    { f: F5, b: 0.25 },
    { f: E5, b: 1 },
    { f: C5, b: 1 },
    { f: D5, b: 1 },
    { f: C5, b: 2.5 },
];
function bell(at, freq, vol) {
    if (!ctx || !master)
        return;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.15);
    g.connect(master);
    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.004;
    const o3 = ctx.createOscillator();
    o3.type = 'triangle';
    o3.frequency.value = freq * 4.02;
    const g2 = ctx.createGain();
    g2.gain.value = 0.3;
    const g3 = ctx.createGain();
    g3.gain.value = 0.09;
    o1.connect(g);
    o2.connect(g2).connect(g);
    o3.connect(g3).connect(g);
    o1.start(at);
    o2.start(at);
    o3.start(at);
    o1.stop(at + 1.25);
    o2.stop(at + 1.25);
    o3.stop(at + 0.5);
}
let musicTimer = 0;
let musicOn = false;
export function playBirthday() {
    if (!ctx || !master)
        return;
    musicOn = true;
    const beat = CONFIG.musicBeat;
    const start = ctx.currentTime + 0.12;
    let tt = 0;
    for (const n of MELODY) {
        const dur = n.b * beat;
        bell(start + tt * beat, n.f, 0.13 * CONFIG.musicVolume * 2);
        if (n.b >= 1)
            bell(start + tt * beat + dur * 0.5, n.f * 1.5, 0.035 * CONFIG.musicVolume * 2);
        tt += n.b;
    }
    const total = tt * beat;
    window.clearTimeout(musicTimer);
    musicTimer = window.setTimeout(() => {
        if (musicOn)
            playBirthday();
    }, Math.max(1500, total * 1000 - 150));
}
export function stopBirthday() {
    musicOn = false;
    window.clearTimeout(musicTimer);
}
