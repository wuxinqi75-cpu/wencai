/* 逻辑视口 + 「假装横屏」
 *
 * 手机上锁了旋转时，屏幕方向 API 是拦不住的 —— 这时候把整页 CSS 转 90°，
 * 逻辑尺寸和物理尺寸互换，用户把手机横过来看就是满屏的横屏画面。
 *
 * 坑：转过的页面里 event.clientX/clientY 仍然是物理坐标，
 * 所有指针运算（点击拾取、拖拽、滑动切蛋糕）都必须先过 toLocal()。
 */
let forced = false;
const subs = [];
export function isForcedLandscape() {
    return forced;
}
/** 逻辑视口宽（假装横屏时 = 物理高） */
export function viewW() {
    return forced ? window.innerHeight : window.innerWidth;
}
/** 逻辑视口高（假装横屏时 = 物理宽） */
export function viewH() {
    return forced ? window.innerWidth : window.innerHeight;
}
/** 物理指针坐标 → 逻辑视口坐标（未旋转时原样返回） */
export function toLocal(clientX, clientY) {
    if (!forced)
        return { x: clientX, y: clientY };
    // 顺时针 90°：逻辑 x 沿屏幕 y 增长，逻辑 y 沿屏幕 x 反向增长
    return { x: clientY, y: window.innerWidth - clientX };
}
/** 物理指针坐标 → NDC（给 Raycaster 用） */
export function toNDC(clientX, clientY, out) {
    const p = toLocal(clientX, clientY);
    out.x = (p.x / viewW()) * 2 - 1;
    out.y = -(p.y / viewH()) * 2 + 1;
    return out;
}
export function setForcedLandscape(on) {
    if (forced === on)
        return;
    forced = on;
    document.documentElement.classList.toggle('force-land', on);
    for (const cb of subs)
        cb();
}
/** 布局尺寸变了（含横竖屏切换）：重新算 canvas 尺寸 / 镜头宽高比 */
export function onLayoutChange(cb) {
    subs.push(cb);
}
