import * as THREE from '../vendor/three.module.js';
import { buildRoom } from './world/room.js';
import { buildFurniture } from './world/furniture.js';
import { buildPlushies } from './world/plushies.js';
import { buildCake } from './world/cake.js';
import { buildDecor } from './world/decor.js';
import { buildCakeCut } from './world/cakeCut.js';
import { createOverlay } from './ui/overlay.js';
import { createFirefly } from './core/firefly.js';
import { createRotateHint } from './ui/rotate.js';
import { createTurnButton } from './ui/turn.js';
import { viewW, viewH, toLocal, toNDC, onLayoutChange, setForcedLandscape } from './core/viewport.js';
import { createFireworks } from './fx/fireworks.js';
import { startBlow } from './core/mic.js';
import { showBlowPanel, showWish, showLetter, showFinale, showFloatButton, showCornerButton, showEndCard, createFocusBar } from './ui/panels.js';
import { createVault } from './ui/vault.js';
import { unlock, has, allAchievements, onAchievement } from './core/achievements.js';
import { CONFIG, BLESSINGS, BLOW, CUT, ENDING } from './data/content.js';
import { ensureAudio, getContext, chime, softClick, startAmbience, ambienceLevel, sndBlowOut, sndSlice, playBirthday, stopBirthday, setMuted, } from './core/audio.js';
const canvas = document.getElementById('stage');
const overlay = createOverlay(7);
const vault = createVault();
const rotateHint = createRotateHint();
const turnBtn = createTurnButton(() => {
    onResize();
    turnBtn.sync();
    rotateHint.hide();
});
onLayoutChange(onResize);
const fireworks = createFireworks();
/* ---------------- 渲染器 ---------------- */
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
});
/* 高分屏最多 2 倍：3 倍屏（不少安卓机）按 3 倍渲染会白白多算一倍像素 */
const MAX_PR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(MAX_PR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
/* ---------------- 场景 ---------------- */
const updates = [];
scene.add(buildRoom(updates));
const furniture = buildFurniture(updates);
scene.add(furniture.group);
scene.add(buildPlushies(updates));
const cake = buildCake(updates);
scene.add(cake.group);
const decor = buildDecor(updates);
scene.add(decor.group);
const cakeCut = buildCakeCut(cake, scene);
const firefly = createFirefly();
scene.add(firefly.object);
const CAKE_CENTER = cakeCut.center.clone();
const SHOTS = {
    room: {
        wide: { pos: new THREE.Vector3(4.8, 2.78, 6.5), target: new THREE.Vector3(-0.3, 1.12, -0.9), fov: 33 },
        tall: { pos: new THREE.Vector3(3.9, 2.7, 6.2), target: new THREE.Vector3(-0.9, 1.25, -1.65), fov: 50 },
    },
    cake: {
        wide: { pos: new THREE.Vector3(2.85, 1.5, -0.6), target: new THREE.Vector3(2.04, 1.2, -2.42), fov: 34 },
        tall: { pos: new THREE.Vector3(2.62, 1.6, -0.2), target: new THREE.Vector3(2.02, 1.1, -2.42), fov: 46 },
    },
    bed: {
        wide: { pos: new THREE.Vector3(-0.35, 1.5, 0.35), target: new THREE.Vector3(-2.5, 0.82, -1.2), fov: 34 },
        tall: { pos: new THREE.Vector3(-0.5, 1.42, 1.5), target: new THREE.Vector3(-2.45, 0.92, -0.75), fov: 44 },
    },
    bear: {
        wide: { pos: new THREE.Vector3(0.68, 0.66, 2.2), target: new THREE.Vector3(0.42, 0.42, 0.72), fov: 30 },
        tall: { pos: new THREE.Vector3(0.58, 0.8, 2.75), target: new THREE.Vector3(0.42, 0.37, 0.72), fov: 42 },
    },
    cut: {
        wide: { pos: new THREE.Vector3(2.95, 1.52, -0.8), target: new THREE.Vector3(2.02, 1.05, -2.42), fov: 36 },
        tall: { pos: new THREE.Vector3(2.58, 1.58, -0.4), target: new THREE.Vector3(2.02, 1.08, -2.42), fov: 48 },
    },
    finale: {
        wide: { pos: new THREE.Vector3(4.1, 2.45, 4.9), target: new THREE.Vector3(0.1, 1.3, -1.1), fov: 40 },
        tall: { pos: new THREE.Vector3(3.5, 2.35, 4.6), target: new THREE.Vector3(0.2, 1.45, -1.5), fov: 56 },
    },
};
let shotName = 'room';
let zoom = 1;
/* 放大镜：蛋糕 / 床 / 小熊 / 房间 */
const focusBar = createFocusBar([
    { id: 'cake', label: '蛋糕' },
    { id: 'bed', label: '床' },
    { id: 'bear', label: '小熊' },
    { id: 'room', label: '房间' },
], (id) => {
    cornerBtn?.close();
    cornerBtn = null;
    if (id === 'room')
        goToShot(roam ? 'finale' : 'room');
    else
        goToShot(id);
    focusBar.setActive(id);
    overlay.flashHint(id === 'room' ? '整间屋子' : `凑近看看${id === 'cake' ? '蛋糕' : id === 'bed' ? '床' : '小熊'}`, 2400);
}, (dir) => {
    zoom = THREE.MathUtils.clamp(zoom * (dir > 0 ? 0.84 : 1.19), 0.45, 2);
});
const camPos = SHOTS.room.wide.pos.clone();
const camTarget = SHOTS.room.wide.target.clone();
let camFov = SHOTS.room.wide.fov;
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
let dragging = false;
let lastX = 0;
let lastY = 0;
let dragYaw = 0;
let dragPitch = 0;
let lastW = 0;
let lastH = 0;
function onResize() {
    const w = viewW();
    const h = viewH();
    /* iOS 地址栏伸缩会连发 resize；尺寸没真变就别重算，否则画面抖 */
    if (w === lastW && h === lastH)
        return;
    lastW = w;
    lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fireworks.resize();
}
window.addEventListener('resize', onResize);
onResize();
/* 手机切后台，系统可能回收 WebGL 上下文（安卓尤其常见）。
   preventDefault 表示"我想恢复"；恢复不了就盖一句提示，别给一片白。 */
const glNote = document.createElement('div');
glNote.className = 'gl-note';
glNote.textContent = '画面被系统暂停了，点一下恢复';
glNote.addEventListener('click', () => window.location.reload());
document.body.appendChild(glNote);
canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    glNote.style.display = 'block';
});
canvas.addEventListener('webglcontextrestored', () => {
    glNote.style.display = 'none';
    lastW = 0;
    onResize();
});
/* iOS / 安卓软键盘：算出键盘占了多高，写进 --kb 交给 CSS 让面板让位 */
const vv = window.visualViewport;
function syncKeyboard() {
    const gap = vv ? window.innerHeight - vv.height - vv.offsetTop : 0;
    const kb = Math.max(0, Math.min(gap, window.innerHeight * 0.62));
    document.documentElement.style.setProperty('--kb', `${Math.round(kb)}px`);
    document.documentElement.classList.toggle('kb', kb > 110);
}
if (vv) {
    vv.addEventListener('resize', syncKeyboard);
    vv.addEventListener('scroll', syncKeyboard);
}
syncKeyboard();
window.addEventListener('pointerdown', (e) => {
    dragging = true;
    const p = toLocal(e.clientX, e.clientY);
    lastX = p.x;
    lastY = p.y;
});
window.addEventListener('pointermove', (e) => {
    const p = toLocal(e.clientX, e.clientY);
    pointer.tx = (p.x / viewW()) * 2 - 1;
    pointer.ty = (p.y / viewH()) * 2 - 1;
    if (!dragging)
        return;
    if (phase === 'cut' || phase === 'wish')
        return;
    dragYaw = THREE.MathUtils.clamp(dragYaw - (p.x - lastX) * 0.0016, -0.24, 0.24);
    dragPitch = THREE.MathUtils.clamp(dragPitch - (p.y - lastY) * 0.0011, -0.08, 0.1);
    lastX = p.x;
    lastY = p.y;
});
window.addEventListener('pointerup', () => {
    dragging = false;
});
window.addEventListener('pointercancel', () => {
    dragging = false;
});
/* ---------------- 镜头每帧 ---------------- */
function updateCamera(t, dt) {
    const aspect = viewW() / viewH();
    const k = THREE.MathUtils.clamp((aspect - 0.55) / 0.95, 0, 1);
    const shot = SHOTS[shotName];
    const targetLook = shot.tall.target.clone().lerp(shot.wide.target, k);
    const basePos = shot.tall.pos.clone().lerp(shot.wide.pos, k);
    const targetPos = basePos.sub(targetLook).multiplyScalar(zoom).add(targetLook);
    const targetFov = THREE.MathUtils.lerp(shot.tall.fov, shot.wide.fov, k);
    const ease = Math.min(1, dt * 3.2);
    camPos.lerp(targetPos, ease);
    camTarget.lerp(targetLook, ease);
    camFov += (targetFov - camFov) * ease;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
    const sway = Math.sin(t * 0.35) * 0.05;
    const swayY = Math.cos(t * 0.27) * 0.03;
    const parallax = shotName === 'room' || shotName === 'finale' ? 1 : 0.35;
    camera.position.set(camPos.x + pointer.x * 0.16 * parallax + Math.sin(dragYaw) * 1.15 + sway, camPos.y - pointer.y * 0.09 * parallax + dragPitch * 1.4 + swayY, camPos.z);
    const look = camTarget.clone();
    look.x += pointer.x * 0.12 * parallax + Math.sin(dragYaw) * 0.32;
    look.y -= pointer.y * 0.06 * parallax + dragPitch * 0.4;
    camera.lookAt(look);
    if (Math.abs(camera.fov - camFov) > 0.01) {
        camera.fov = camFov;
        camera.updateProjectionMatrix();
    }
}
function goToShot(name) {
    shotName = name;
    zoom = 1;
}
/* 滚轮也能推拉一下 */
canvas.addEventListener('wheel', (e) => {
    if (phase !== 'stars' && phase !== 'open' && phase !== 'finale')
        return;
    e.preventDefault();
    zoom = THREE.MathUtils.clamp(zoom * (e.deltaY > 0 ? 1.08 : 0.93), 0.45, 2);
}, { passive: false });
let phase = 'intro';
let started = false;
let collected = 0;
let exposure = 1.05;
let exposureTarget = 1.05;
/* 吹蜡烛 */
let blowPanel = null;
let blowDetector = null;
let blowMode = 'mic';
let holding = false;
let blowProgress = 0;
let blowDone = false;
let lastNote = '';
/* 切蛋糕 */
let cutTimer = 0;
let cutBtn = null;
let openBtn = null;
/* 自由探索 / 愿望瓶 */
let roam = false;
let cornerBtn = null;
let bottleBtn = null;
let bottlePanel = null;
let endShown = false;
let endCard = null;
let letterOpen = false;
onAchievement((def) => {
    overlay.achv(`成就解锁 · ${def.name}`);
    bottlePanel?.refresh();
    window.setTimeout(checkAllDone, 900);
});
overlay.muteToggle((m) => setMuted(m));
/* ---------------- 星星 ---------------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function starTarget() {
    const visible = decor.stars.filter((s) => !s.collected && s.root.visible);
    if (!visible.length)
        return new THREE.Vector3(2.02, 1.35, -2.35);
    return visible.slice().sort((a, b) => a.index - b.index)[0].root.position.clone();
}
function collect(star) {
    if (star.collected)
        return;
    decor.collect(star);
    collected += 1;
    chime(collected - 1);
    overlay.setStars(collected, 7);
    overlay.showBlessing(BLESSINGS[star.index] ?? '');
    if (collected === 3)
        unlock('star3');
    if (collected === 1) {
        overlay.setHint('继续点亮别的星星');
    }
    else if (collected < 6) {
        overlay.flashHint(`还有 ${7 - collected} 颗`);
    }
    else if (collected === 6) {
        overlay.setHint('最后一颗，在蛋糕上');
        window.setTimeout(() => {
            goToShot('cake');
            window.setTimeout(() => {
                decor.stars[6].root.visible = true;
                overlay.flashHint('看，蛋糕上还亮着一颗', 3200);
                showCakeToggle();
            }, 900);
        }, 700);
    }
    else {
        overlay.setHint('星星都亮了');
        onAllStars();
    }
}
function onAllStars() {
    firefly.object.visible = false;
    unlock('star7');
    window.setTimeout(startBlowPhase, 2200);
}
/* 被强制拉到蛋糕旁边之后，给一个回房间的开关 */
function showCakeToggle() {
    if (cornerBtn)
        return;
    let atCake = true;
    cornerBtn = showCornerButton('回房间', () => {
        if (phase !== 'stars')
            return;
        atCake = !atCake;
        goToShot(atCake ? 'cake' : 'room');
        cornerBtn?.setText(atCake ? '回房间' : '去看蛋糕');
        overlay.flashHint(atCake ? '第 7 颗星星还在蛋糕上' : '房间还是原来的样子', 2600);
    });
}
function tap(clientX, clientY) {
    if (phase === 'open' || phase === 'finale') {
        toNDC(clientX, clientY, ndc);
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.intersectObject(cakeCut.hit, false).length > 0) {
            if (phase === 'open')
                openLetter();
            else
                reopenLetter();
            return;
        }
    }
    if (phase !== 'stars' || !started) {
        softClick();
        return;
    }
    toNDC(clientX, clientY, ndc);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(decor.stars.filter((s) => !s.collected && s.root.visible).map((s) => s.hit), false);
    if (hits.length) {
        const hit = hits[0].object;
        const star = decor.stars.find((s) => s.hit === hit);
        if (star)
            collect(star);
        return;
    }
    softClick();
}
/* ---------------- 吹蜡烛 ---------------- */
function noteOnce(text) {
    if (!blowPanel || lastNote === text)
        return;
    lastNote = text;
    blowPanel.setNote(text);
}
function startBlowPhase() {
    if (phase !== 'stars')
        return;
    phase = 'blow';
    rotateHint.hide();
    cornerBtn?.close();
    cornerBtn = null;
    goToShot('cake');
    overlay.setHint('该吹蜡烛了');
    lastNote = '';
    blowPanel = showBlowPanel({
        onAllow: () => {
            void tryMic();
        },
        onFallback: () => useHold(false),
        onHoldStart: () => {
            holding = true;
        },
        onHoldEnd: () => {
            holding = false;
        },
    });
    blowPanel.setMode('ask');
}
async function tryMic() {
    if (!blowPanel || phase !== 'blow')
        return;
    ensureAudio();
    noteOnce('正在打开麦克风…');
    const det = await startBlow(CONFIG.blowSeconds);
    if (phase !== 'blow') {
        det?.stop();
        return;
    }
    if (!det) {
        useHold(true);
        return;
    }
    blowDetector = det;
    blowMode = 'mic';
    lastNote = '';
    blowPanel.setMode('listen');
    noteOnce(BLOW.listen);
}
function useHold(denied) {
    blowMode = 'hold';
    holding = false;
    lastNote = '';
    if (!blowPanel)
        return;
    blowPanel.setMode('hold');
    noteOnce(denied ? BLOW.denied : BLOW.hold);
    blowPanel.setProgress(blowProgress);
}
function tickBlow(dt) {
    if (phase !== 'blow' || !blowPanel || blowDone)
        return;
    if (blowMode === 'mic' && blowDetector) {
        const r = blowDetector.read(dt);
        blowProgress = r.progress;
        if (r.blowing)
            noteOnce(BLOW.listen);
        else if (blowProgress > 0.08)
            noteOnce(BLOW.typing);
    }
    else if (blowMode === 'hold') {
        blowProgress = Math.min(1, Math.max(0, blowProgress + (holding ? dt / CONFIG.holdSeconds : -dt * 1.4)));
    }
    blowPanel.setProgress(blowProgress);
    if (blowProgress >= 1)
        finishBlow();
}
function finishBlow() {
    if (blowDone)
        return;
    blowDone = true;
    phase = 'wish';
    blowDetector?.stop();
    blowDetector = null;
    cake.setLit(false);
    sndBlowOut();
    unlock('blow');
    blowPanel?.setProgress(1);
    blowPanel?.setMode('done');
    overlay.setDim(0.55);
    exposureTarget = 0.6;
    ambienceLevel(0.4);
    window.setTimeout(() => {
        blowPanel?.close();
        blowPanel = null;
        window.setTimeout(startWish, 300);
    }, 1200);
}
function startWish() {
    showWish(CONFIG.wishSeconds, () => {
        unlock('wish');
        overlay.setDim(0.12);
        exposureTarget = 1.0;
        ambienceLevel(1);
        playBirthday();
        overlay.flashHint('睁开眼，切蛋糕吧', 3400);
        window.setTimeout(startCutPhase, 1200);
    });
}
/* ---------------- 切蛋糕 ---------------- */
function startCutPhase() {
    if (phase !== 'wish')
        return;
    phase = 'cut';
    rotateHint.hide();
    goToShot('cut');
    overlay.setHint(CUT.hint);
    cutTimer = window.setTimeout(() => {
        if (phase !== 'cut')
            return;
        cutBtn = showFloatButton('帮我切一刀', () => doCut(null));
    }, 6500);
}
function cutDirection() {
    camera.updateMatrixWorld();
    const v = camera.position.clone().sub(CAKE_CENTER);
    v.y = 0;
    v.normalize();
    const side = new THREE.Vector3(-v.z, 0, v.x);
    const ang = 0.96;
    const dir = v.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang));
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    if (dir.dot(right) < 0)
        dir.negate();
    return dir;
}
function doCut(swipe) {
    if (phase !== 'cut')
        return;
    phase = 'open';
    window.clearTimeout(cutTimer);
    cutBtn?.close();
    cutBtn = null;
    const w = viewW();
    const h = viewH();
    if (swipe)
        fireworks.slash(swipe.x1, swipe.y1, swipe.x2, swipe.y2);
    else
        fireworks.slash(w * 0.5 - 170, h * 0.42, w * 0.5 + 170, h * 0.42);
    sndSlice();
    cakeCut.split(cutDirection());
    unlock('cut');
    overlay.flashHint(CUT.done, 3400);
    window.setTimeout(() => {
        if (phase !== 'open')
            return;
        openBtn = showFloatButton(CUT.open, openLetter);
    }, 1900);
}
function openLetter() {
    if (phase !== 'open')
        return;
    phase = 'letter';
    openBtn?.close();
    openBtn = null;
    overlay.setDim(0.35);
    showLetter(() => {
        unlock('letter');
        overlay.setDim(0);
        startCelebration();
    });
}
/* 自由探索时再点一次蛋糕上的那封信：只重看，不再走一遍结尾 */
function reopenLetter() {
    if (letterOpen || bottlePanel || endCard)
        return;
    letterOpen = true;
    overlay.setDim(0.32);
    showLetter(() => {
        letterOpen = false;
        overlay.setDim(0);
    });
}
/* ---------------- 自由探索 · 烟花 · 愿望瓶 ---------------- */
function startCelebration() {
    if (roam)
        return;
    roam = true;
    phase = 'finale';
    rotateHint.hide();
    goToShot('finale');
    exposureTarget = 1.0;
    overlay.setDim(0);
    fireworks.start();
    // 手机屏幕上那块信太小，点不准；把它的隐形点击球放大
    cakeCut.hit.scale.setScalar(2.6);
    overlay.flashHint('生日快乐，到处看看', 2600);
    overlay.setHint(ENDING.roam);
    window.setTimeout(() => unlock('firework'), 3800);
    window.setTimeout(showBottleButton, 2400);
}
function showBottleButton() {
    if (!roam || bottlePanel)
        return;
    bottleBtn?.close();
    bottleBtn = showFloatButton(ENDING.openBottle, openBottle);
}
function openBottle() {
    if (!roam || bottlePanel)
        return;
    bottleBtn?.close();
    bottleBtn = null;
    bottlePanel = showFinale({
        onReplay: replay,
        onMoreFireworks: () => {
            fireworks.start();
            for (let i = 0; i < 5; i++) {
                window.setTimeout(() => fireworks.burst((i + 1) % 4), 260 * i);
            }
        },
        onClose: () => {
            bottlePanel = null;
            showBottleButton();
        },
        onSave: () => {
            window.setTimeout(() => {
                bottlePanel?.close();
                bottlePanel = null;
                overlay.flashHint(ENDING.bottleSaved, 3200);
                overlay.setHint(ENDING.roam);
                showBottleButton();
                checkAllDone();
            }, 1400);
        },
    });
}
function checkAllDone() {
    if (endShown || !roam)
        return;
    const list = allAchievements();
    const got = list.filter((a) => has(a.id)).length;
    if (got < list.length)
        return;
    endShown = true;
    endCard = showEndCard({
        onReplay: replay,
        onClose: () => {
            endCard = null;
        },
    });
}
function replay() {
    stopBirthday();
    fireworks.stop();
    const black = document.createElement('div');
    black.style.cssText =
        'position:fixed;inset:0;background:#04060e;opacity:0;transition:opacity .8s ease;z-index:60;pointer-events:none';
    document.body.appendChild(black);
    requestAnimationFrame(() => (black.style.opacity = '1'));
    window.setTimeout(() => window.location.reload(), 950);
}
/* ---------------- 指针 ---------------- */
let downX = 0;
let downY = 0;
let downAt = 0;
canvas.addEventListener('pointerdown', (e) => {
    downX = e.clientX;
    downY = e.clientY;
    downAt = performance.now();
});
canvas.addEventListener('pointerup', (e) => {
    const a = toLocal(downX, downY);
    const b = toLocal(e.clientX, e.clientY);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const moved = Math.hypot(dx, dy);
    if (phase === 'cut' && Math.abs(dx) > 70 && Math.abs(dy) < 140) {
        doCut({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        return;
    }
    if (moved < 14 && performance.now() - downAt < 700)
        tap(e.clientX, e.clientY);
});
/* ---------------- 开场 ---------------- */
overlay.intro(() => {
    begin();
});
overlay.introTip(() => turnBtn.toggle());
function begin() {
    started = true;
    phase = 'stars';
    goToShot('room');
    ensureAudio();
    startAmbience();
    unlock('enter');
    overlay.setHint('点点房间里的星星，替我把话带给她');
    window.setTimeout(() => {
        if (phase === 'stars')
            rotateHint.maybeShow(150);
    }, 4200);
}
/* ---------------- 主循环 ---------------- */
const clock = new THREE.Clock();
let elapsed = 0;
/* 低端机兜底：开跑两秒后如果一直掉在 30fps 上下，降一档像素比。
   画面糊一点总比划不动强。 */
let perfFrames = 0;
let perfAcc = 0;
let perfDone = false;
function adaptPerf(dt) {
    if (perfDone || elapsed < 2)
        return;
    perfFrames += 1;
    perfAcc += dt;
    if (perfFrames < 90)
        return;
    perfDone = true;
    const avg = perfAcc / perfFrames;
    const pr = renderer.getPixelRatio();
    if (avg > 0.031 && pr > 1) {
        renderer.setPixelRatio(1);
        lastW = 0;
        onResize();
    }
    else if (avg > 0.024 && pr > 1.5) {
        renderer.setPixelRatio(1.5);
        lastW = 0;
        onResize();
    }
}
let booted = false;
renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const frozen = window.__freeze === true;
    if (!frozen)
        updateCamera(elapsed, dt);
    for (const u of updates)
        u(elapsed, dt);
    cakeCut.update(elapsed, dt);
    firefly.update(elapsed, dt, starTarget());
    tickBlow(dt);
    if (phase === 'stars' || phase === 'open' || phase === 'finale')
        focusBar.show();
    else
        focusBar.hide();
    exposure += (exposureTarget - exposure) * Math.min(1, dt * 1.6);
    renderer.toneMappingExposure = exposure;
    renderer.render(scene, camera);
    adaptPerf(dt);
    if (!booted) {
        booted = true;
        /* 告诉 index.html 的兜底计时器：真的跑起来了 */
        window.__booted = true;
    }
});
document.addEventListener('visibilitychange', () => {
    if (document.hidden)
        return;
    clock.getDelta();
    /* iOS 切回来音频常被挂起，补一次 resume（解锁过就不用再要手势） */
    if (getContext())
        ensureAudio();
});
/* ---------------- 调试 ---------------- */
const dbg = window;
dbg.__scene = scene;
dbg.__camera = camera;
dbg.__cake = cake;
dbg.__cut = cakeCut;
dbg.__renderer = renderer;
dbg.__fw = fireworks;
dbg.__freeze = false;
dbg.__stars = decor.stars;
dbg.__phase = () => phase;
dbg.__goToShot = goToShot;
dbg.__collect = (i) => collect(decor.stars[i]);
dbg.__start = () => {
    overlay.dismissIntro();
    begin();
};
dbg.__skipTo = (p) => {
    /* 调试用：直接跳阶段 */
    if (p === 'blow') {
        started = true;
        phase = 'stars';
        startBlowPhase();
    }
    else if (p === 'cut') {
        phase = 'wish';
        finishBlow();
        startCutPhase();
    }
    else if (p === 'finale') {
        phase = 'letter';
        startCelebration();
    }
};
dbg.__vault = vault;
dbg.__openBottle = openBottle;
dbg.__roam = () => roam;
dbg.__unlock = unlock;
dbg.__doCut = () => doCut(null);
dbg.__toCut = () => {
    started = true;
    phase = 'cut';
    cake.setLit(false);
    exposureTarget = 1;
    goToShot('cut');
    overlay.setHint(CUT.hint);
};
dbg.__blow = () => {
    blowProgress = 0.99;
};
dbg.__turn = turnBtn;
dbg.__forceLand = (on) => {
    setForcedLandscape(on);
    turnBtn.sync();
};
