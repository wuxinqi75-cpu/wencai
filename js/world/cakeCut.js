/* 切蛋糕：用裁剪面把蛋糕劈成两半，中间露出一封信 */
import * as THREE from '../../vendor/three.module.js';
import { toon, canvasTex, glow } from '../core/three-setup.js';
/* 横截面贴图：v 轴对应蛋糕局部 y（0 ~ 0.319） */
function crossSection() {
    const tex = canvasTex(8, 256, (c, W, H) => {
        const yv = (y) => H * (1 - y / 0.319);
        const band = (y0, y1, color) => {
            c.fillStyle = color;
            c.fillRect(0, yv(y1), W, Math.max(1, yv(y0) - yv(y1)));
        };
        band(0, 0.128, '#f4dcb0');
        band(0.086, 0.104, '#fffaea');
        band(0.128, 0.217, '#f2c8c6');
        band(0.162, 0.176, '#c33255');
        band(0.217, 0.297, '#f4dcb0');
        band(0.244, 0.258, '#fffaea');
        band(0.297, 0.319, '#fffaf0');
        for (let i = 0; i < 150; i++) {
            const y = Math.random() * yv(0.293);
            c.fillStyle = `rgba(184,148,100,${0.1 + Math.random() * 0.16})`;
            c.beginPath();
            c.arc(Math.random() * W, y, 0.7 + Math.random() * 1.6, 0, Math.PI * 2);
            c.fill();
        }
    });
    tex.repeat.set(1, 1 / 0.319);
    tex.offset.set(0, 0);
    return tex;
}
/* 信封正面 */
function envelopeTex() {
    return canvasTex(160, 112, (c, W, H) => {
        c.fillStyle = '#fff7e6';
        c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(196,166,120,0.55)';
        c.lineWidth = 1.5;
        c.strokeRect(3, 3, W - 6, H - 6);
        c.strokeStyle = '#e3c9a0';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(3, 4);
        c.lineTo(W / 2, H * 0.58);
        c.lineTo(W - 3, 4);
        c.stroke();
        const g = c.createRadialGradient(W / 2, H * 0.6, 1, W / 2, H * 0.6, 16);
        g.addColorStop(0, '#e8627a');
        g.addColorStop(1, '#b2304a');
        c.fillStyle = g;
        c.beginPath();
        c.arc(W / 2, H * 0.6, 13, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = 'rgba(255,230,230,0.7)';
        c.lineWidth = 1.2;
        c.beginPath();
        c.arc(W / 2, H * 0.6, 8, 0, Math.PI * 2);
        c.stroke();
    });
}
/* 三层蛋糕被竖着切开的轮廓（x 当作蛋糕局部 z） */
function faceShape() {
    const pts = [
        [-0.3, 0.016],
        [-0.3, 0.128],
        [-0.234, 0.128],
        [-0.234, 0.217],
        [-0.168, 0.217],
        [-0.168, 0.297],
        [-0.174, 0.297],
        [-0.174, 0.319],
        [0.174, 0.319],
        [0.174, 0.297],
        [0.168, 0.297],
        [0.168, 0.217],
        [0.234, 0.217],
        [0.234, 0.128],
        [0.3, 0.128],
        [0.3, 0.016],
    ];
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => {
        if (i === 0)
            s.moveTo(x, y);
        else
            s.lineTo(x, y);
    });
    s.closePath();
    return s;
}
export function buildCakeCut(cake, scene) {
    const group = cake.group;
    const center = group.getWorldPosition(new THREE.Vector3());
    /* ---- 左半：克隆一份，材质拆开（否则两边共用裁剪面） ---- */
    const left = group.clone(true);
    left.traverse((o) => {
        const m = o;
        if (m.isMesh || o.isSprite) {
            const mat = m.material;
            if (Array.isArray(mat))
                m.material = mat.map((x) => x.clone());
            else if (mat)
                m.material = mat.clone();
        }
    });
    scene.add(left);
    /* ---- 蛋糕里的那封信 ---- */
    const reveal = new THREE.Group();
    const paperGeo = new THREE.BoxGeometry(0.19, 0.13, 0.014);
    const faceMat = new THREE.MeshToonMaterial({ map: envelopeTex() });
    const sideMat = toon(0xfff1d8);
    const paper = new THREE.Mesh(paperGeo, [
        sideMat,
        sideMat,
        sideMat,
        sideMat,
        faceMat,
        sideMat,
    ]);
    const halo = glow(0.5, 0xffd8a0, 0.3);
    const light = new THREE.PointLight(0xffcf9a, 0, 0.9, 2);
    reveal.add(paper, halo, light);
    reveal.visible = false;
    reveal.rotation.set(-0.16, 0.3, 0);
    reveal.position.copy(center).add(new THREE.Vector3(0, 0.1, 0));
    scene.add(reveal);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.copy(reveal.position);
    hit.visible = false;
    scene.add(hit);
    /* ---- 动画状态 ---- */
    const baseA = group.position.clone();
    const baseB = left.position.clone();
    const rotY0 = group.rotation.y;
    const wide = window.innerWidth >= window.innerHeight;
    const GAP = wide ? 0.2 : 0.14;
    const dir = new THREE.Vector3(1, 0, 0);
    const dirDot = { v: 0 };
    const planeA = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    const planeB = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    /* 裁剪面跟着各自那半一起走，否则两半的切口永远不会分开 */
    const syncPlanes = (s) => {
        planeA.constant = -(dirDot.v + s);
        planeB.constant = dirDot.v - s;
    };
    let splitT = -1;
    let revealT = -1;
    const tex = crossSection();
    const faceMaterial = (planes) => new THREE.MeshBasicMaterial({
        map: tex,
        color: 0xf2e8d6,
        side: THREE.DoubleSide,
        clippingPlanes: planes,
    });
    const setPlanes = (root, planes) => {
        root.traverse((o) => {
            const m = o;
            if (!(m.isMesh || o.isSprite))
                return;
            const mat = m.material;
            if (Array.isArray(mat))
                mat.forEach((x) => (x.clippingPlanes = planes));
            else if (mat)
                mat.clippingPlanes = planes;
        });
    };
    return {
        reveal,
        hit,
        center,
        get isSplit() {
            return splitT >= 0;
        },
        split(d) {
            if (splitT >= 0)
                return;
            dir.copy(d).setY(0).normalize();
            dirDot.v = dir.dot(center);
            planeA.normal.copy(dir);
            planeB.normal.copy(dir).negate();
            syncPlanes(0);
            splitT = 0;
            setPlanes(group, [planeA]);
            setPlanes(left, [planeB]);
            /* 两片切口面：朝向要跟真实切割方向一致 */
            const geo = new THREE.ShapeGeometry(faceShape());
            const Z = new THREE.Vector3(0, 0, 1);
            const dirLocalA = dir
                .clone()
                .applyQuaternion(group.getWorldQuaternion(new THREE.Quaternion()).invert())
                .setY(0)
                .normalize();
            const faceRight = new THREE.Mesh(geo, faceMaterial([planeA]));
            faceRight.quaternion.setFromUnitVectors(Z, dirLocalA.clone().negate());
            faceRight.position.copy(dirLocalA).multiplyScalar(0.004);
            faceRight.userData.noOutline = true;
            group.add(faceRight);
            const dirLocalB = dir
                .clone()
                .applyQuaternion(left.getWorldQuaternion(new THREE.Quaternion()).invert())
                .setY(0)
                .normalize();
            const faceLeft = new THREE.Mesh(geo, faceMaterial([planeB]));
            faceLeft.quaternion.setFromUnitVectors(Z, dirLocalB.clone().negate());
            faceLeft.position.copy(dirLocalB).multiplyScalar(-0.004);
            faceLeft.userData.noOutline = true;
            left.add(faceLeft);
        },
        update(t, dt) {
            if (splitT < 0)
                return;
            if (splitT < 1)
                splitT = Math.min(1, splitT + dt / 1.15);
            const e = 1 - Math.pow(1 - splitT, 3);
            const s = GAP * e;
            syncPlanes(s);
            group.position.copy(baseA).addScaledVector(dir, s);
            left.position.copy(baseB).addScaledVector(dir, -s);
            if (revealT < 0 && splitT > 0.28) {
                revealT = 0;
                reveal.visible = true;
                hit.visible = true;
            }
            if (revealT >= 0) {
                if (revealT < 1)
                    revealT = Math.min(1, revealT + dt / 1.6);
                const r = 1 - Math.pow(1 - revealT, 3);
                reveal.position.y = center.y + 0.1 + r * 0.36 + Math.sin(t * 1.6) * 0.012 * r;
                reveal.rotation.y = 0.3 + Math.sin(t * 0.8) * 0.24 * r;
                hit.position.copy(reveal.position);
                halo.material.opacity = 0.16 + r * 0.22 + Math.sin(t * 2.4) * 0.05;
                light.intensity = r * 0.35;
            }
        },
    };
}
