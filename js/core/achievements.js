/* 成就：一次访问内累积，重新打开就重新收集 */
import { ACHIEVEMENTS } from '../data/content.js';
const got = new Set();
let listener = null;
export function onAchievement(cb) {
    listener = cb;
}
export function unlock(id) {
    if (got.has(id))
        return false;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def)
        return false;
    got.add(id);
    listener?.(def);
    return true;
}
export function has(id) {
    return got.has(id);
}
export function resetAchievements() {
    got.clear();
}
export function allAchievements() {
    return ACHIEVEMENTS;
}
/* ---------------- 愿望瓶存本地 ---------------- */
const WISH_KEY = 'ds_wencai_wishes';
export function readWishes() {
    try {
        const raw = localStorage.getItem(WISH_KEY);
        if (!raw)
            return [];
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    }
    catch {
        return [];
    }
}
export function saveWish(text) {
    const list = readWishes();
    list.push({ text, at: Date.now() });
    try {
        localStorage.setItem(WISH_KEY, JSON.stringify(list.slice(-30)));
    }
    catch {
        /* 存不进去就算了 */
    }
}
export function clearWishes() {
    try {
        localStorage.removeItem(WISH_KEY);
    }
    catch {
        /* ignore */
    }
}
