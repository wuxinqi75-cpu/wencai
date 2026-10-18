import { ROOM_TITLE, AGE } from '../data/content.js';
export function createOverlay(total) {
    const root = document.createElement('div');
    root.className = 'ui';
    root.innerHTML = `
    <div class="dim" aria-hidden="true"></div>
    <div class="ui-top">
      <div class="brand"><span class="brand-name">${ROOM_TITLE}</span><span class="brand-age">${AGE}</span></div>
      <div class="trail" aria-hidden="true">${Array.from({ length: total })
        .map(() => '<i class="dot"></i>')
        .join('')}</div>
    </div>
    <button class="sound-btn" type="button" aria-label="声音开关">♪</button>
    <div class="toast" id="toast"></div>
    <div class="achv-toast" id="achv-toast"></div>
  `;
    document.body.appendChild(root);
    const dots = Array.from(root.querySelectorAll('.dot'));
    const toast = root.querySelector('#toast');
    const achvToast = root.querySelector('#achv-toast');
    const dim = root.querySelector('.dim');
    const soundBtn = root.querySelector('.sound-btn');
    const hint = document.getElementById('hint');
    const introEl = document.createElement('div');
    introEl.className = 'intro';
    introEl.innerHTML = `
    <div class="intro-inner">
      <div class="intro-kicker">给姐姐的二十七岁</div>
      <h1 class="intro-title">${ROOM_TITLE}</h1>
      <p class="intro-sub">灯还亮着，星星刚睡醒。</p>
      <button class="intro-btn" type="button">推门进去</button>
      <p class="intro-tip">横屏看更完整</p>
    </div>
  `;
    document.body.appendChild(introEl);
    let toastTimer = 0;
    let hintTimer = 0;
    let achvTimer = 0;
    let muted = false;
    const setHint = (text) => {
        if (!hint)
            return;
        hint.textContent = text;
        hint.style.opacity = '1';
        window.clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => {
            hint.style.opacity = '0.55';
        }, 6000);
    };
    const dismissIntro = () => {
        introEl.classList.add('hide');
        window.setTimeout(() => introEl.remove(), 900);
    };
    return {
        setStars(n) {
            dots.forEach((d, i) => d.classList.toggle('on', i < n));
        },
        setHint,
        flashHint(text, ms = 2600) {
            if (!hint)
                return;
            hint.textContent = text;
            hint.style.opacity = '1';
            window.clearTimeout(hintTimer);
            hintTimer = window.setTimeout(() => {
                hint.style.opacity = '0.55';
            }, ms);
        },
        showBlessing(text) {
            toast.textContent = text;
            toast.classList.add('show');
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
        },
        setDim(v) {
            dim.style.opacity = String(v);
        },
        achv(text) {
            achvToast.textContent = text;
            achvToast.classList.add('show');
            window.clearTimeout(achvTimer);
            achvTimer = window.setTimeout(() => achvToast.classList.remove('show'), 2600);
        },
        muteToggle(cb) {
            soundBtn.addEventListener('click', () => {
                muted = !muted;
                soundBtn.classList.toggle('off', muted);
                soundBtn.textContent = muted ? '♪̸' : '♪';
                cb(muted);
            });
        },
        intro(start) {
            const btn = introEl.querySelector('.intro-btn');
            btn.addEventListener('click', () => {
                start();
                dismissIntro();
            });
        },
        dismissIntro,
    };
}
