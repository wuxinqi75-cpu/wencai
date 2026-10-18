/* 竖屏时提示可以横过来看：只提示一次，不挡操作 */
import { isForcedLandscape } from '../core/viewport.js';
const KEY = 'ds_wencai_rotate_tip';
function isPortrait() {
    return window.matchMedia('(orientation: portrait)').matches;
}
function isSmall() {
    return Math.min(window.innerWidth, window.innerHeight) < 820;
}
export function createRotateHint() {
    const el = document.createElement('div');
    el.className = 'rotate';
    el.innerHTML = `
    <div class="rotate-ico" aria-hidden="true">
      <span class="rotate-phone"></span>
      <span class="rotate-arrow">↻</span>
    </div>
    <div class="rotate-txt"><span>把手机横过来</span><b>或点右上角「横屏」</b></div>
    <button class="rotate-x" type="button">知道啦</button>
  `;
    document.body.appendChild(el);
    let shown = false;
    let timer = 0;
    let switched = false;
    const hide = () => {
        el.classList.remove('on');
        window.clearTimeout(timer);
    };
    const dismiss = () => {
        try {
            sessionStorage.setItem(KEY, '1');
        }
        catch {
            /* ignore */
        }
        hide();
    };
    el.querySelector('.rotate-x').addEventListener('click', dismiss);
    const onOrient = () => {
        if (isForcedLandscape())
            return;
        if (!isPortrait() && isSmall() && shown && !switched) {
            switched = true;
            const txt = el.querySelector('.rotate-txt');
            if (txt)
                txt.innerHTML = '<span>好，就这样看</span><b>视野宽多了</b>';
            window.clearTimeout(timer);
            timer = window.setTimeout(hide, 3200);
        }
    };
    window.addEventListener('orientationchange', onOrient);
    window.addEventListener('resize', onOrient);
    return {
        maybeShow(delayMs = 2600) {
            if (shown)
                return;
            if (isForcedLandscape())
                return;
            if (!isPortrait() || !isSmall())
                return;
            try {
                if (sessionStorage.getItem(KEY) === '1')
                    return;
            }
            catch {
                /* ignore */
            }
            shown = true;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                if (!isPortrait() || isForcedLandscape())
                    return;
                el.classList.add('on');
                window.clearTimeout(timer);
                timer = window.setTimeout(hide, 11000);
            }, delayMs);
        },
        forceShow() {
            shown = true;
            el.classList.add('on');
            window.clearTimeout(timer);
            timer = window.setTimeout(hide, 11000);
        },
        hide,
    };
}
