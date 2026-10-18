import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { toon, outline, canvasTex, contactShadow, cyl, ball, rand, } from '../core/three-setup.js';
function flameTexture() {
    return canvasTex(64, 96, (c, W, H) => {
        const g = c.createRadialGradient(W / 2, H * 0.72, 3, W / 2, H * 0.7, H * 0.62);
        g.addColorStop(0, 'rgba(255,253,236,1)');
        g.addColorStop(0.2, 'rgba(255,238,176,0.98)');
        g.addColorStop(0.45, 'rgba(255,176,80,0.85)');
        g.addColorStop(0.72, 'rgba(255,120,48,0.34)');
        g.addColorStop(1, 'rgba(255,96,32,0)');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(W / 2, 4);
        c.bezierCurveTo(W * 0.86, H * 0.4, W * 0.8, H * 0.82, W / 2, H * 0.96);
        c.bezierCurveTo(W * 0.2, H * 0.82, W * 0.14, H * 0.4, W / 2, 4);
        c.fill();
    });
}
/* 蛋糕放在书桌台面上 */
export function buildCake(updates) {
    const group = new THREE.Group();
    /* ---------- 蛋糕托 + 蕾丝垫 ---------- */
    const board = cyl(0.375, 0.375, 0.016, 0xfaeedb, 44);
    board.position.y = 0.008;
    board.userData.noOutline = true;
    group.add(board);
    const doily = new THREE.Shape();
    const N = 72;
    for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2;
        const r = 0.36 + Math.sin(a * 18) * 0.008;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        if (i === 0)
            doily.moveTo(x, z);
        else
            doily.lineTo(x, z);
    }
    const doilyMesh = new THREE.Mesh(new THREE.ShapeGeometry(doily), toon(0xfffaf0));
    doilyMesh.rotation.x = -Math.PI / 2;
    doilyMesh.position.y = 0.017;
    doilyMesh.userData.noOutline = true;
    group.add(doilyMesh);
    /* ---------- 三层蛋糕 ---------- */
    const tier1 = cyl(0.3, 0.31, 0.105, 0xf8e2ba, 44);
    tier1.position.y = 0.075;
    group.add(tier1);
    const tier2 = cyl(0.234, 0.244, 0.09, 0xef86a4, 40);
    tier2.position.y = 0.172;
    group.add(tier2);
    const tier3 = cyl(0.168, 0.178, 0.08, 0xfff1d6, 36);
    tier3.position.y = 0.257;
    group.add(tier3);
    const frostingTop = cyl(0.174, 0.17, 0.022, 0xfff9ea, 44);
    frostingTop.position.y = 0.308;
    group.add(frostingTop);
    /* ---------- 裱花珠边 ---------- */
    const beadRing = (radius, y, count, size, color) => {
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            const bead = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 8), toon(color));
            bead.scale.set(1, 0.8, 1);
            bead.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
            bead.userData.noOutline = true;
            group.add(bead);
        }
    };
    beadRing(0.302, 0.128, 26, 0.017, 0xfff8ea);
    beadRing(0.238, 0.216, 24, 0.015, 0xfff3e2);
    beadRing(0.176, 0.312, 20, 0.013, 0xf7a4bb);
    /* ---------- 顶部奶油玫瑰 ---------- */
    const roseColors = [0xfff7e8, 0xf9b3c6];
    for (let i = 0; i < 7; i++) {
        const a = 2.35 + i * 0.5;
        const r = 0.14;
        const rose = new THREE.Group();
        const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), toon(roseColors[i % 2]));
        c1.scale.y = 0.75;
        const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 10), toon(roseColors[(i + 1) % 2]));
        c2.position.y = 0.014;
        c2.scale.y = 0.7;
        const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), toon(0xfff7e8));
        c3.position.y = 0.026;
        rose.add(c1, c2, c3);
        rose.traverse((o) => (o.userData.noOutline = true));
        rose.position.set(Math.cos(a) * r, 0.325, Math.sin(a) * r);
        group.add(rose);
    }
    /* ---------- 樱桃 ---------- */
    for (let i = 0; i < 5; i++) {
        const a = 2.5 + i * 0.55;
        const cherry = ball(0.022, 0xd8384f);
        cherry.position.set(Math.cos(a) * 0.135, 0.335, Math.sin(a) * 0.135);
        cherry.userData.noOutline = true;
        const stem = cyl(0.0035, 0.0035, 0.026, 0x5d7a48, 4);
        stem.position.set(cherry.position.x, 0.355, cherry.position.z);
        stem.userData.noOutline = true;
        group.add(cherry, stem);
    }
    /* ---------- 糖针 ---------- */
    const sprinkleColors = [0xffd166, 0x9fd3c7, 0x8ab6f2, 0xff9fb5];
    for (let i = 0; i < 40; i++) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0.04, 0.2);
        const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.0035, 0.013, 3, 6), toon(sprinkleColors[i % 4]));
        s.position.set(Math.cos(a) * r, 0.322 + rand(0, 0.01), Math.sin(a) * r);
        s.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
        s.userData.noOutline = true;
        group.add(s);
    }
    /* ---------- 数字蜡烛 2 / 7 ---------- */
    const flameTex = flameTexture();
    const flames = [];
    const candleLight = new THREE.PointLight(0xffa050, 0.07, 0.75, 2);
    group.add(candleLight);
    const state = {
        lit: true,
        setLit(on) {
            state.lit = on;
            flames.forEach((f) => (f.visible = on));
            candleLight.visible = on;
        },
    };
    const addDigit = (font, text, color, x) => {
        const geo = new TextGeometry(text, {
            font,
            size: 0.115,
            depth: 0.028,
            curveSegments: 4,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 2,
        });
        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const h = bb.max.y - bb.min.y;
        geo.translate(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -0.014);
        const mesh = new THREE.Mesh(geo, toon(color));
        mesh.position.set(x, 0.322, 0.07);
        group.add(mesh);
        const topY = 0.322 + h;
        const wick = cyl(0.0022, 0.0022, 0.014, 0x2f2a28, 4);
        wick.position.set(x, topY + 0.006, 0.07);
        wick.userData.noOutline = true;
        group.add(wick);
        const flame = new THREE.Sprite(new THREE.SpriteMaterial({
            map: flameTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        }));
        flame.scale.set(0.048, 0.115, 1);
        flame.position.set(x, topY + 0.026, 0.07);
        flame.userData.baseScale = new THREE.Vector2(0.048, 0.115);
        flame.userData.baseX = x;
        flame.visible = state.lit;
        group.add(flame);
        flames.push(flame);
        candleLight.position.set(0, topY + 0.02, 0.07);
    };
    fetch(new URL('../../vendor/fonts/helvetiker_bold.typeface.json', import.meta.url).href)
        .then((r) => r.json())
        .then((json) => {
        const font = new FontLoader().parse(json);
        addDigit(font, '2', 0xff8fae, -0.062);
        addDigit(font, '7', 0xffc75e, 0.062);
    })
        .catch((err) => console.warn('number candle font failed', err));
    const shadow = contactShadow(0.86, 0.86, 0.4);
    group.add(shadow);
    outline(group, 1.018);
    updates.push((t) => {
        if (!state.lit)
            return;
        flames.forEach((f, i) => {
            const base = f.userData.baseScale;
            const k = 1 + Math.sin(t * 12 + i * 2.3) * 0.1 + Math.sin(t * 6.7 + i) * 0.06;
            f.scale.set(base.x * (1.06 - k * 0.06), base.y * k, 1);
            f.position.x = f.userData.baseX + Math.sin(t * 7 + i) * 0.002;
        });
        candleLight.intensity = 0.07 + Math.sin(t * 11.3) * 0.012;
    });
    group.scale.setScalar(1.1);
    group.position.set(2.02, 0.792, -2.42);
    group.rotation.y = 0.3;
    return {
        group,
        flames,
        light: candleLight,
        get lit() {
            return state.lit;
        },
        setLit: state.setLit,
    };
}
