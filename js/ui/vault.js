/* 只有吴信启会用的"看瓶子"面板：连点标题五下，或者网址后面加 #wishes */
import { VAULT } from '../data/content.js';
import { readWishes, clearWishes } from '../core/achievements.js';
function esc(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function when(ts) {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function createVault() {
    let sheet = null;
    let taps = 0;
    let tapTimer = 0;
    const render = () => {
        if (!sheet)
            return;
        const list = readWishes();
        const box = sheet.el.querySelector('[data-role="list"]');
        if (!list.length) {
            box.innerHTML = `<div class="vault-empty">${VAULT.empty}</div>`;
            return;
        }
        box.innerHTML = list
            .slice()
            .reverse()
            .map((w, i) => `<div class="vault-row"><div class="vault-text">${esc(w.text)}</div><div class="vault-meta">#${list.length - i} · ${when(w.at)}</div></div>`)
            .join('');
    };
    const open = () => {
        if (sheet)
            return;
        const el = document.createElement('div');
        el.className = 'sheet vault-sheet';
        el.innerHTML = `
      <div class="vault-card">
        <button class="vault-x" data-role="x" type="button" aria-label="关闭">×</button>
        <div class="vault-title">${VAULT.title}</div>
        <div class="vault-hint">${VAULT.hint}</div>
        <div class="vault-list" data-role="list"></div>
        <div class="vault-actions">
          <button class="btn btn-ghost" data-role="copy" type="button">${VAULT.copy}</button>
          <button class="btn btn-ghost" data-role="clear" type="button">${VAULT.clear}</button>
        </div>
      </div>
    `;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('on'));
        sheet = {
            el,
            close() {
                el.classList.remove('on');
                window.setTimeout(() => el.remove(), 460);
                sheet = null;
            },
        };
        render();
        el.querySelector('[data-role="x"]').addEventListener('click', () => sheet?.close());
        el.querySelector('[data-role="copy"]').addEventListener('click', (e) => {
            const text = readWishes()
                .map((w) => `${when(w.at)}  ${w.text}`)
                .join('\n');
            const btn = e.currentTarget;
            const done = () => {
                btn.textContent = VAULT.copied;
                window.setTimeout(() => (btn.textContent = VAULT.copy), 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                void navigator.clipboard.writeText(text).then(done).catch(done);
            }
            else {
                done();
            }
        });
        el.querySelector('[data-role="clear"]').addEventListener('click', (e) => {
            clearWishes();
            render();
            const btn = e.currentTarget;
            btn.textContent = VAULT.cleared;
            window.setTimeout(() => (btn.textContent = VAULT.clear), 1600);
        });
    };
    /* 网址后面带 #wishes 直接打开 */
    const checkHash = () => {
        if (location.hash.replace('#', '') === 'wishes') {
            open();
            return true;
        }
        return false;
    };
    window.addEventListener('hashchange', checkHash);
    /* 连点标题五下（标题本身不吃点击，靠坐标判断，不影响点星星） */
    document.addEventListener('pointerdown', (e) => {
        if (sheet)
            return;
        const brand = document.querySelector('.brand');
        if (!brand)
            return;
        const r = brand.getBoundingClientRect();
        const pad = 12;
        if (e.clientX < r.left - pad || e.clientX > r.right + pad)
            return;
        if (e.clientY < r.top - pad || e.clientY > r.bottom + pad)
            return;
        taps += 1;
        window.clearTimeout(tapTimer);
        tapTimer = window.setTimeout(() => (taps = 0), 1400);
        if (taps >= 5) {
            taps = 0;
            open();
        }
    });
    window.setTimeout(checkHash, 300);
    return { open };
}
