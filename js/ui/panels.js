/* 所有浮层：吹蜡烛 / 许愿 / 那封信 / 结尾面板 */
import { AGE, BLOW, WISH, LETTER, ENDING } from '../data/content.js';
import { allAchievements, has, readWishes, saveWish, unlock } from '../core/achievements.js';
function h(html) {
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
}
const MIC_SVG = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
  <rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>`;
/* ---------------- 通用外壳 ---------------- */
export function showSheet(cls, html, onClose) {
    const el = h(`<div class="sheet ${cls}">${html}</div>`);
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
    let closed = false;
    const close = () => {
        if (closed)
            return;
        closed = true;
        el.classList.remove('on');
        window.setTimeout(() => el.remove(), 520);
        onClose?.();
    };
    return { el, close };
}
export function showBlowPanel(handlers) {
    const sheet = showSheet('blow-sheet', `
    <div class="blow-ring" data-role="ring" style="--p:0">
      <div class="blow-inner">${MIC_SVG}</div>
    </div>
    <h2 class="sheet-title">${BLOW.title}</h2>
    <p class="sheet-sub">${BLOW.sub}</p>
    <p class="blow-note" data-role="note">${BLOW.ask}</p>
    <button class="btn btn-primary" data-role="allow" type="button">${BLOW.allow}</button>
    <button class="btn btn-ghost" data-role="fallback" type="button">${BLOW.hold}</button>
    <button class="btn btn-hold" data-role="hold" type="button">${BLOW.holding}</button>
  `);
    const ring = sheet.el.querySelector('[data-role="ring"]');
    const note = sheet.el.querySelector('[data-role="note"]');
    const allow = sheet.el.querySelector('[data-role="allow"]');
    const fallback = sheet.el.querySelector('[data-role="fallback"]');
    const holdBtn = sheet.el.querySelector('[data-role="hold"]');
    allow.addEventListener('click', handlers.onAllow);
    fallback.addEventListener('click', handlers.onFallback);
    let holding = false;
    const startHold = (e) => {
        e.preventDefault();
        if (holding)
            return;
        holding = true;
        sheet.el.classList.add('holding');
        handlers.onHoldStart();
    };
    const endHold = () => {
        if (!holding)
            return;
        holding = false;
        sheet.el.classList.remove('holding');
        handlers.onHoldEnd();
    };
    holdBtn.addEventListener('pointerdown', startHold);
    holdBtn.addEventListener('pointerup', endHold);
    holdBtn.addEventListener('pointercancel', endHold);
    holdBtn.addEventListener('pointerleave', endHold);
    return {
        setMode(m) {
            sheet.el.dataset.mode = m;
            if (m === 'listen')
                note.textContent = BLOW.listen;
            if (m === 'hold')
                note.textContent = BLOW.holding;
            if (m === 'ask')
                note.textContent = BLOW.ask;
            if (m === 'done')
                note.textContent = BLOW.done;
        },
        setProgress(p) {
            ring.style.setProperty('--p', (Math.min(1, Math.max(0, p)) * 100).toFixed(1));
            ring.classList.toggle('active', p > 0.02);
        },
        setNote(text) {
            note.textContent = text;
        },
        close: sheet.close,
    };
}
export function showWish(seconds, onDone) {
    const sheet = showSheet('wish-sheet', `
    <div class="wish-circle"></div>
    <div class="wish-title">${WISH.before}</div>
    <div class="wish-count" data-role="count"></div>
    <div class="wish-sub">${WISH.sub}</div>
  `);
    const count = sheet.el.querySelector('[data-role="count"]');
    let n = 3;
    count.textContent = '3';
    const tick = window.setInterval(() => {
        n -= 1;
        if (n > 0) {
            count.textContent = String(n);
            return;
        }
        window.clearInterval(tick);
        count.textContent = WISH.ready;
        count.classList.add('ready');
        window.setTimeout(() => {
            sheet.close();
            onDone();
        }, 1200);
    }, 1000);
    window.setTimeout(() => sheet.el.classList.add('settle'), seconds * 1000 - 1200);
    return {
        close() {
            window.clearInterval(tick);
            sheet.close();
        },
    };
}
/* ---------------- 那封信 ---------------- */
export function showLetter(onClose) {
    const body = LETTER.body.map((p) => `<p>${p}</p>`).join('');
    const sheet = showSheet('letter-sheet', `
    <div class="letter-card">
      <div class="letter-top">${LETTER.to}</div>
      <div class="letter-body">${body}<p class="letter-sign">${LETTER.sign}</p><p class="letter-from">${LETTER.from}</p></div>
      <button class="btn btn-primary" data-role="ok" type="button">收好了</button>
    </div>
  `, onClose);
    sheet.el.querySelector('[data-role="ok"]').addEventListener('click', () => sheet.close());
    return sheet;
}
export function showFinale(o) {
    const sheet = showSheet('finale-sheet', `
    <div class="finale-card">
      <div class="finale-kicker">姐姐 · ${AGE}</div>
      <h2 class="finale-title">${ENDING.title}</h2>
      <p class="finale-sub" data-role="sub">${ENDING.sub}</p>

      <div class="finale-block">
        <div class="block-label">生日成就 <span data-role="count"></span></div>
        <div class="achv-list" data-role="achv"></div>
      </div>

      <div class="finale-block">
        <div class="block-label">${ENDING.bottleTitle}</div>
        <p class="block-sub">${ENDING.bottleSub}</p>
        <textarea class="bottle-input" data-role="wish" rows="2" placeholder="${ENDING.bottlePlaceholder}" maxlength="120"></textarea>
        <button class="btn btn-primary small" data-role="save" type="button">${ENDING.bottleSave}</button>
        <div class="bottle-done" data-role="done"></div>
      </div>

      <div class="finale-actions">
        <button class="btn btn-ghost" data-role="poster" type="button">存一张海报</button>
        <button class="btn btn-ghost" data-role="fw" type="button">${ENDING.fireworks}</button>
        <button class="btn btn-ghost" data-role="again" type="button">${ENDING.again}</button>
      </div>
      <button class="btn btn-ghost wide" data-role="close" type="button">回到屋子</button>
    </div>
  `);
    const achvBox = sheet.el.querySelector('[data-role="achv"]');
    const countEl = sheet.el.querySelector('[data-role="count"]');
    const wishBox = sheet.el.querySelector('[data-role="wish"]');
    const doneBox = sheet.el.querySelector('[data-role="done"]');
    const saveBtn = sheet.el.querySelector('[data-role="save"]');
    const subEl = sheet.el.querySelector('[data-role="sub"]');
    const refresh = () => {
        const list = allAchievements();
        const got = list.filter((a) => has(a.id)).length;
        countEl.textContent = `${got} / ${list.length}`;
        achvBox.innerHTML = list
            .map((a) => `<div class="achv-row${has(a.id) ? ' on' : ''}">
          <span class="achv-tick">${has(a.id) ? '✓' : '·'}</span>
          <span class="achv-name">${a.name}</span>
          <span class="achv-desc">${a.desc}</span>
        </div>`)
            .join('');
        if (got === list.length) {
            subEl.textContent = `${ENDING.allDoneTitle} · ${ENDING.allDoneSub}`;
            subEl.classList.add('done');
        }
        const past = readWishes().length;
        if (past > 0 && !doneBox.textContent)
            doneBox.textContent = `瓶子里已经有 ${past} 个愿望了`;
    };
    refresh();
    saveBtn.addEventListener('click', () => {
        const text = wishBox.value.trim();
        if (!text) {
            wishBox.focus();
            wishBox.classList.add('shake');
            window.setTimeout(() => wishBox.classList.remove('shake'), 500);
            return;
        }
        saveWish(text);
        unlock('bottle');
        wishBox.value = '';
        wishBox.disabled = true;
        saveBtn.disabled = true;
        doneBox.textContent = ENDING.bottleSaved;
        doneBox.classList.add('pop');
        o.onSave?.();
    });
    sheet.el.querySelector('[data-role="fw"]').addEventListener('click', o.onMoreFireworks);
    sheet.el.querySelector('[data-role="again"]').addEventListener('click', o.onReplay);
    sheet.el.querySelector('[data-role="poster"]').addEventListener('click', () => {
        o.onPoster?.();
    });
    sheet.el.querySelector('[data-role="close"]').addEventListener('click', () => {
        sheet.close();
        o.onClose?.();
    });
    return { el: sheet.el, close: sheet.close, refresh };
}
/* ---------------- 小提示按钮 ---------------- */
export function showFloatButton(text, onClick) {
    const el = h(`<button class="float-btn" type="button">${text}</button>`);
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
    el.addEventListener('click', onClick);
    return {
        el,
        close() {
            el.classList.remove('on');
            window.setTimeout(() => el.remove(), 500);
        },
    };
}
/* ---------------- 左上角的小切换按钮 ---------------- */
export function showCornerButton(text, onClick) {
    const el = h(`<button class="corner-btn" type="button">${text}</button>`);
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
    el.addEventListener('click', onClick);
    return {
        el,
        setText(t) {
            el.textContent = t;
        },
        close() {
            el.classList.remove('on');
            window.setTimeout(() => el.remove(), 450);
        },
    };
}
export function createFocusBar(items, onPick, onZoom) {
    const el = h(`
    <div class="focus-bar">
      ${items.map((i) => `<button class="focus-chip" data-id="${i.id}" type="button">${i.label}</button>`).join('')}
      <i class="focus-sep"></i>
      <button class="focus-chip zoom" data-zoom="in" type="button" aria-label="放大">＋</button>
      <button class="focus-chip zoom" data-zoom="out" type="button" aria-label="缩小">－</button>
    </div>
  `);
    document.body.appendChild(el);
    el.querySelectorAll('[data-id]').forEach((b) => {
        b.addEventListener('click', () => onPick(b.dataset.id));
    });
    el.querySelector('[data-zoom="in"]').addEventListener('click', () => onZoom(1));
    el.querySelector('[data-zoom="out"]').addEventListener('click', () => onZoom(-1));
    let visible = false;
    return {
        setActive(id) {
            el.querySelectorAll('[data-id]').forEach((b) => {
                b.classList.toggle('on', b.dataset.id === id);
            });
        },
        show() {
            if (visible)
                return;
            visible = true;
            el.classList.add('on');
        },
        hide() {
            if (!visible)
                return;
            visible = false;
            el.classList.remove('on');
        },
    };
}
/* ---------------- 全部成就达成 ---------------- */
export function showEndCard(o) {
    const sheet = showSheet('end-sheet', `
    <div class="end-card">
      <div class="end-star">✦</div>
      <h2 class="end-title">${ENDING.allDoneTitle}</h2>
      <p class="end-sub">${ENDING.allDoneSub}</p>
      <div class="end-actions">
        <button class="btn btn-primary small" data-role="again" type="button">${ENDING.again}</button>
        <button class="btn btn-ghost" data-role="later" type="button">再待一会儿</button>
      </div>
    </div>
  `, o.onClose);
    sheet.el.querySelector('[data-role="again"]').addEventListener('click', o.onReplay);
    sheet.el.querySelector('[data-role="later"]').addEventListener('click', () => sheet.close());
    return { close: sheet.close };
}
