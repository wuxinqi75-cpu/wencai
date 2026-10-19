/* 祝福海报：把房间画面 + 祝福语合成一张竖版图，长按就能存进相册。
 *
 * 注意：WebGL canvas 的 drawing buffer 在 rAF 之外会被清空，
 * 所以 main.ts 是在 renderer.render() 之后的同一帧里调 drawPoster()。
 */
import { AGE, ENDING, ROOM_TITLE } from '../data/content.js';
const W = 1200;
const H = 1600;
const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';
function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
}
/** 把当前房间画面合成成一张 1200×1600 的 JPEG dataURL */
export function drawPoster(frame) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    if (!g)
        throw new Error('2d context unavailable');
    /* 底 */
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1d2552');
    bg.addColorStop(0.42, '#111531');
    bg.addColorStop(1, '#06070f');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    /* 星点：固定种子，每张都一样 */
    let seed = 20261020;
    const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    for (let i = 0; i < 90; i++) {
        const x = rnd() * W;
        const y = rnd() * H * 0.6;
        const r = 0.8 + rnd() * 1.9;
        g.fillStyle = `rgba(255,236,196,${(0.18 + rnd() * 0.6).toFixed(2)})`;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
    }
    /* 房间画面：圆角卡片 */
    const PAD = 56;
    const CW = W - PAD * 2;
    const CH = 740;
    const CY = 80;
    const sw = frame.width;
    const sh = frame.height;
    const ar = CW / CH;
    let cw = sw;
    let ch = sw / ar;
    if (ch > sh) {
        ch = sh;
        cw = sh * ar;
    }
    const sx = (sw - cw) / 2;
    const sy = (sh - ch) / 2;
    g.save();
    roundRect(g, PAD, CY, CW, CH, 26);
    g.clip();
    g.drawImage(frame, sx, sy, cw, ch, PAD, CY, CW, CH);
    g.restore();
    g.strokeStyle = 'rgba(255,208,138,0.32)';
    g.lineWidth = 2;
    roundRect(g, PAD, CY, CW, CH, 26);
    g.stroke();
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    /* 27 */
    const numBase = CY + CH + 236;
    const numGrad = g.createLinearGradient(0, numBase - 180, 0, numBase);
    numGrad.addColorStop(0, '#fff4da');
    numGrad.addColorStop(0.5, '#ffd08a');
    numGrad.addColorStop(1, '#dfa55f');
    g.fillStyle = numGrad;
    g.font = `600 196px ${FONT}`;
    g.fillText(String(AGE), W / 2, numBase);
    /* 主标题 */
    g.fillStyle = '#f7ecd8';
    g.font = `500 48px ${FONT}`;
    g.fillText(ENDING.title, W / 2, numBase + 104);
    /* 副标题 */
    g.fillStyle = 'rgba(251,240,221,0.62)';
    g.font = `400 28px ${FONT}`;
    g.fillText(ENDING.sub, W / 2, numBase + 166);
    /* 日期 + 落款 */
    g.strokeStyle = 'rgba(255,208,138,0.22)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(W / 2 - 150, numBase + 232);
    g.lineTo(W / 2 + 150, numBase + 232);
    g.stroke();
    g.fillStyle = 'rgba(255,208,138,0.7)';
    g.font = `400 25px ${FONT}`;
    g.fillText('2026 · 十月二十', W / 2, numBase + 288);
    g.fillStyle = 'rgba(251,240,221,0.4)';
    g.font = `400 22px ${FONT}`;
    g.fillText(ROOM_TITLE, W / 2, H - 74);
    return c.toDataURL('image/jpeg', 0.92);
}
/** 海报预览浮层 */
export function showPoster(url, onClose) {
    const el = document.createElement('div');
    el.className = 'sheet poster-sheet';
    el.innerHTML = `
    <div class="poster-card">
      <img class="poster-img" src="${url}" alt="生日海报" />
      <div class="poster-tip">长按图片存到相册</div>
      <div class="poster-actions">
        <a class="btn btn-ghost" download="姐姐生日快乐.jpg" href="${url}">下载</a>
        <button class="btn btn-ghost" data-role="close" type="button">收起</button>
      </div>
    </div>
  `;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
    const close = () => {
        el.classList.remove('on');
        window.setTimeout(() => el.remove(), 450);
        onClose?.();
    };
    el.querySelector('[data-role="close"]').addEventListener('click', close);
    return { close };
}
