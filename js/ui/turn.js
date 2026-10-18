/* 横竖屏切换按钮
 *
 * 点一下：先试真·屏幕方向锁定（全屏 + screen.orientation.lock，安卓 Chrome 有效）；
 * 不支持（iOS Safari、微信内置浏览器、锁了竖屏的手机）就退回 CSS 整体转 90°。
 * 再点一下：回到原来的样子。
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
    let mode = 'off';
    let busy = false;
    const sync = () => {
        // 只在手机尺寸出现：竖屏时宽 ≤560，横屏时高 ≤560；平板/桌面自己会转，不用这个按钮
        const small = Math.min(window.innerWidth, window.innerHeight);
        el.classList.toggle('show', small <= 560);
        const on = mode !== 'off';
        el.classList.toggle('on', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        lbl.textContent = on ? '回正' : '横屏';
    };
    const goNative = async () => {
        const so = screen.orientation;
        if (!so || typeof so.lock !== 'function')
            return false;
        const de = document.documentElement;
        try {
            if (!document.fullscreenElement) {
                if (typeof de.requestFullscreen === 'function') {
                    await de.requestFullscreen({ navigationUI: 'hide' });
                }
                else if (typeof de.webkitRequestFullscreen === 'function') {
                    await de.webkitRequestFullscreen();
                }
                else {
                    return false;
                }
            }
            await so.lock('landscape');
            return true;
        }
        catch {
            if (document.fullscreenElement) {
                void document.exitFullscreen().catch(() => undefined);
            }
            return false;
        }
    };
    const backToNormal = async () => {
        if (mode === 'native') {
            try {
                screen.orientation.unlock?.();
            }
            catch {
                /* ignore */
            }
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(() => undefined);
            }
        }
        if (mode === 'css')
            setForcedLandscape(false);
        mode = 'off';
    };
    el.addEventListener('click', () => {
        if (busy)
            return;
        busy = true;
        void (async () => {
            try {
                if (mode === 'off') {
                    mode = (await goNative()) ? 'native' : 'css';
                    if (mode === 'css')
                        setForcedLandscape(true);
                }
                else {
                    await backToNormal();
                }
                sync();
                onChange();
            }
            finally {
                busy = false;
            }
        })();
    });
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', () => {
        if (mode === 'native' && !document.fullscreenElement)
            mode = 'off';
        sync();
    });
    // 用户自己退出全屏（或系统收走锁定）→ 认为回到未接管状态
    document.addEventListener('fullscreenchange', () => {
        if (mode === 'native' && !document.fullscreenElement) {
            mode = 'off';
            sync();
            onChange();
        }
    });
    sync();
    return { el, sync, isOn: () => mode !== 'off' };
}
