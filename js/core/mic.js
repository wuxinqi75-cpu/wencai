/* 吹气检测：宽频噪声（谱平坦度高）+ 能量高于环境底噪 */
import { ensureAudio, getContext } from './audio.js';
export async function startBlow(needSeconds) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        return null;
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
            },
        });
    }
    catch (err) {
        console.warn('mic denied', err);
        return null;
    }
    ensureAudio();
    const ac = getContext();
    if (!ac) {
        stream.getTracks().forEach((t) => t.stop());
        return null;
    }
    const source = ac.createMediaStreamSource(stream);
    const analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;
    source.connect(analyser);
    const freq = new Uint8Array(analyser.frequencyBinCount);
    const time = new Uint8Array(analyser.fftSize);
    let progress = 0;
    let level = 0;
    let floor = 0.012;
    let blowing = false;
    const stop = () => {
        stream.getTracks().forEach((t) => t.stop());
        try {
            source.disconnect();
        }
        catch {
            /* ignore */
        }
    };
    return {
        read(dt) {
            analyser.getByteTimeDomainData(time);
            analyser.getByteFrequencyData(freq);
            let sumSq = 0;
            let crossings = 0;
            let prev = 0;
            for (let i = 0; i < time.length; i++) {
                const v = (time[i] - 128) / 128;
                sumSq += v * v;
                if (i > 0) {
                    const b = v >= 0 ? 1 : -1;
                    if (b !== prev)
                        crossings += 1;
                    prev = b;
                }
            }
            const rms = Math.sqrt(sumSq / time.length);
            const zcr = crossings / time.length;
            /* 谱平坦度：吹气是宽频噪声，接近 1；说话有泛音，低 */
            let lin = 0;
            let log = 0;
            let n = 0;
            const hi = Math.floor(freq.length * 0.55);
            for (let i = 3; i < hi; i++) {
                const m = freq[i] / 255 + 1e-7;
                lin += m;
                log += Math.log(m);
                n += 1;
            }
            const flat = n > 0 ? Math.exp(log / n) / (lin / n) : 0;
            const loud = rms > Math.max(floor * 2.6, 0.03);
            const hissy = flat > 0.3 || zcr > 0.17;
            const ok = loud && hissy && rms < 0.62;
            if (rms < floor)
                floor += (rms - floor) * 0.06;
            else
                floor += (rms - floor) * 0.004;
            floor = Math.min(Math.max(floor, 0.002), 0.14);
            blowing = ok;
            progress = Math.min(1, Math.max(0, progress + (ok ? dt / needSeconds : -dt * 1.1)));
            level += (Math.min(1, rms * 3.2) - level) * Math.min(1, dt * 12);
            return { level, progress, blowing };
        },
        stop,
    };
}
