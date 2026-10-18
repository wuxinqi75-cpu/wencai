/* 2D 烟花：形状从离屏 canvas 采样，爱心 / 星星 / 蛋糕 / 文彩 */
import { CONFIG } from '../data/content.js';
import { sndPop } from '../core/audio.js';
/* ---------------- 形状采样 ---------------- */
function sample(draw, step = 4, cap = 230) {
    const S = 160;
    const cv = document.createElement('canvas');
    cv.width = S;
    cv.height = S;
    const c = cv.getContext('2d');
    if (!c)
        return [];
    c.fillStyle = '#fff';
    c.strokeStyle = '#fff';
    draw(c, S);
    const data = c.getImageData(0, 0, S, S).data;
    const pts = [];
    for (let y = 0; y < S; y += step) {
        for (let x = 0; x < S; x += step) {
            if (data[(y * S + x) * 4 + 3] > 128)
                pts.push(x / S - 0.5, y / S - 0.5);
        }
    }
    const count = pts.length / 2;
    if (count <= cap)
        return pts;
    /* 太多就随机抽 cap 个 */
    const idx = [];
    for (let i = 0; i < count; i++)
        idx.push(i);
    for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = idx[i];
        idx[i] = idx[j];
        idx[j] = tmp;
    }
    const out = [];
    for (let k = 0; k < cap; k++) {
        out.push(pts[idx[k] * 2], pts[idx[k] * 2 + 1]);
    }
    return out;
}
function heartDraw(c, S) {
    const cx = S / 2;
    const cy = S * 0.54;
    const s = S * 0.4;
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(cx, cy + s * 0.75);
    c.bezierCurveTo(cx - s * 1.5, cy - s * 0.2, cx - s * 0.62, cy - s * 1.15, cx, cy - s * 0.42);
    c.bezierCurveTo(cx + s * 0.62, cy - s * 1.15, cx + s * 1.5, cy - s * 0.2, cx, cy + s * 0.75);
    c.stroke();
}
function starDraw(c, S) {
    const cx = S / 2;
    const cy = S / 2;
    const R = S * 0.44;
    const r = R * 0.42;
    c.lineWidth = 8;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? R : r;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        if (i === 0)
            c.moveTo(x, y);
        else
            c.lineTo(x, y);
    }
    c.closePath();
    c.stroke();
}
function cakeDraw(c, S) {
    const cx = S / 2;
    const base = S * 0.82;
    const tiers = [
        [0.52, 0.15],
        [0.4, 0.14],
        [0.28, 0.13],
    ];
    c.lineWidth = 8;
    let y = base;
    for (const [w, h] of tiers) {
        const ww = S * w;
        const hh = S * h;
        c.beginPath();
        c.roundRect(cx - ww / 2, y - hh, ww, hh, hh * 0.42);
        c.stroke();
        y -= hh + S * 0.012;
    }
    /* 两根数字蜡烛 */
    c.beginPath();
    c.roundRect(cx - S * 0.12, y - S * 0.15, S * 0.055, S * 0.15, S * 0.02);
    c.roundRect(cx + S * 0.065, y - S * 0.15, S * 0.055, S * 0.15, S * 0.02);
    c.stroke();
    /* 火苗 */
    c.beginPath();
    c.ellipse(cx - S * 0.0925, y - S * 0.19, S * 0.028, S * 0.045, 0, 0, Math.PI * 2);
    c.ellipse(cx + S * 0.0925, y - S * 0.19, S * 0.028, S * 0.045, 0, 0, Math.PI * 2);
    c.stroke();
}
function textDraw(text) {
    return (c, S) => {
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.lineWidth = 4.5;
        let size = S * 0.46;
        c.font = `700 ${size}px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`;
        const w = c.measureText(text).width;
        if (w > S * 0.86) {
            size *= (S * 0.86) / w;
            c.font = `700 ${size}px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`;
        }
        c.strokeText(text, S / 2, S / 2);
    };
}
let shapes = null;
function buildShapes() {
    if (shapes)
        return shapes;
    shapes = [
        sample(heartDraw, 3, 240),
        sample(starDraw, 3, 220),
        sample(cakeDraw, 3, 260),
        sample(textDraw('文彩'), 3, 300),
    ];
    return shapes;
}
const PALETTE = [
    [330, [348, 12, 330]], // 爱心：粉红
    [42, [42, 48, 36]], // 星星：金
    [20, [20, 340, 46]], // 蛋糕：暖粉 + 金
    [46, [46, 30, 200]], // 名字：金 + 一点冷色
];
/* ---------------- 主体 ---------------- */
export function createFireworks() {
    const canvas = document.createElement('canvas');
    canvas.className = 'fx';
    document.body.appendChild(canvas);
    const c2 = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        if (c2)
            c2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    let bursts = [];
    let slashes = [];
    let running = false;
    let raf = 0;
    let last = 0;
    let nextAt = 0;
    let kind = 0;
    let seen = 0;
    const pick = () => {
        const portrait = h > w;
        return {
            x: w * (0.32 + Math.random() * 0.36),
            y: h * (portrait ? 0.26 + Math.random() * 0.16 : 0.2 + Math.random() * 0.2),
            scale: Math.min(w, h) * (portrait ? 0.5 : 0.42) * (0.85 + Math.random() * 0.28),
        };
    };
    const spawn = (k) => {
        const list = buildShapes();
        const idx = (k ?? kind) % list.length;
        const pts = list[idx];
        if (!pts || !pts.length)
            return;
        const at = pick();
        const [baseHue, hues] = PALETTE[idx];
        const parts = [];
        for (let i = 0; i < pts.length; i += 2) {
            const hue = hues[Math.floor(Math.random() * hues.length)] ?? baseHue;
            parts.push({
                sx: at.x,
                sy: at.y,
                tx: at.x + (pts[i] + (Math.random() - 0.5) * 0.014) * at.scale,
                ty: at.y + (pts[i + 1] + (Math.random() - 0.5) * 0.014) * at.scale,
                vx: (Math.random() - 0.5) * 26,
                vy: (Math.random() - 0.5) * 26,
                t: 0,
                life: 1.7 + Math.random() * 0.8,
                size: 1.5 + Math.random() * 1.5,
                hue,
                sat: 70 + Math.random() * 30,
            });
        }
        bursts.push({ parts, age: 0, flash: 1 });
        sndPop();
        if (bursts.length > 4)
            bursts = bursts.slice(-4);
    };
    const drawFrame = (now) => {
        if (!c2)
            return;
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        c2.globalCompositeOperation = 'destination-out';
        c2.fillStyle = 'rgba(0,0,0,0.17)';
        c2.fillRect(0, 0, w, h);
        c2.globalCompositeOperation = 'source-over';
        for (const b of bursts) {
            b.age += dt;
            b.flash = Math.max(0, b.flash - dt * 4.2);
            if (b.flash > 0) {
                const g = c2.createRadialGradient(b.parts[0].sx, b.parts[0].sy, 0, b.parts[0].sx, b.parts[0].sy, 68);
                g.addColorStop(0, `rgba(255,240,210,${0.3 * b.flash})`);
                g.addColorStop(1, 'rgba(255,240,210,0)');
                c2.fillStyle = g;
                c2.fillRect(b.parts[0].sx - 68, b.parts[0].sy - 68, 136, 136);
            }
            for (const p of b.parts) {
                p.t += dt;
                const k = Math.min(1, p.t / 0.42);
                const e = 1 - Math.pow(1 - k, 3);
                let x = p.sx + (p.tx - p.sx) * e;
                let y = p.sy + (p.ty - p.sy) * e;
                if (k >= 1) {
                    p.vx *= 0.975;
                    p.vy = p.vy * 0.975 + 34 * dt;
                    p.tx += p.vx * dt;
                    p.ty += p.vy * dt;
                    x = p.tx;
                    y = p.ty;
                }
                const fade = p.t < p.life * 0.55 ? 1 : Math.max(0, 1 - (p.t - p.life * 0.55) / (p.life * 0.45));
                const alpha = fade * 0.85;
                if (alpha <= 0.01)
                    continue;
                c2.fillStyle = `hsla(${p.hue}, ${p.sat}%, 64%, ${alpha})`;
                c2.beginPath();
                c2.arc(x, y, p.size, 0, Math.PI * 2);
                c2.fill();
            }
        }
        bursts = bursts.filter((b) => b.age < 3.2);
        for (const s of slashes) {
            s.t += dt;
            const a = Math.max(0, 1 - s.t / 0.7);
            if (a <= 0)
                continue;
            c2.strokeStyle = `rgba(255,246,220,${a})`;
            c2.lineWidth = 2 + a * 4;
            c2.lineCap = 'round';
            c2.beginPath();
            c2.moveTo(s.x1, s.y1);
            c2.lineTo(s.x2, s.y2);
            c2.stroke();
        }
        slashes = slashes.filter((s) => s.t < 0.7);
        if (running && now >= nextAt) {
            spawn();
            kind += 1;
            seen += 1;
            nextAt = now + CONFIG.fireworkEvery;
            if (seen >= 14)
                running = false;
        }
        raf = requestAnimationFrame(drawFrame);
    };
    return {
        canvas,
        start() {
            running = true;
            seen = 0;
            spawn(0);
            kind = 1;
            nextAt = performance.now() + CONFIG.fireworkEvery;
            last = performance.now();
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(drawFrame);
        },
        stop() {
            running = false;
        },
        count() {
            return seen;
        },
        burst(k) {
            spawn(k);
        },
        slash(x1, y1, x2, y2) {
            slashes.push({ x1, y1, x2, y2, t: 0 });
            if (!raf) {
                last = performance.now();
                raf = requestAnimationFrame(drawFrame);
            }
        },
        resize,
    };
}
