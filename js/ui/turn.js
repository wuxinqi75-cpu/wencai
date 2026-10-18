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
    /* 系统自己转成横屏了（手机没锁方向、或者用户关了竖屏锁定）→ 立刻放手，
       不然「CSS 转 90°」和系统旋转会叠成两次，画面横过来又歪过去 */
    const autoRelease = () => {
        if (on && window.innerWidth > window.innerHeight) {
            on = false;
            setForcedLandscape(false);
            sync();
            onChange();
        }
    };
    window.addEventListener('resize', () => {
        autoRelease();
        sync();
    });
    window.addEventListener('orientationchange', autoRelease);
    sync();
    return { el, sync, isOn: () => on, toggle };
}
