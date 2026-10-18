/* 横竖屏切换按钮
 *
 * 只用 CSS 整体转 90°（html.force-land + body rotate），不碰全屏、不碰
 * screen.orientation.lock —— 真机上 requestFullscreen 会抢走页面、和横屏逻辑打架，
 * iOS 上还会闪退，所以彻底不用。
 * 点一下：转成横屏；再点一下：回正。
 */
import { setForcedLandscape } from '../core/viewport.js';
export function createTurnButton(onChange) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'turn-btn';
    el.innerHTML =
        '<span class="turn-ico" aria-hidden="true"><i></i></span><span class="turn-lbl">横屏</span>';
    document.body.appendChild(el);
    const lbl = el.querySelector('.turn-lbl');
    let on = false;
    const sync = () => {
        // 只在手机尺寸出现：竖屏时宽 ≤560，横屏时高 ≤560；平板/桌面自己会转，不用这个按钮
        const small = Math.min(window.innerWidth, window.innerHeight);
        el.classList.toggle('show', small <= 560);
        el.classList.toggle('on', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        lbl.textContent = on ? '回正' : '横屏';
    };
    const toggle = () => {
        on = !on;
        setForcedLandscape(on);
        sync();
        onChange();
    };
    el.addEventListener('click', toggle);
    window.addEventListener('resize', sync);
    sync();
    return { el, sync, isOn: () => on, toggle };
}
