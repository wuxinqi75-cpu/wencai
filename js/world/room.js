import * as THREE from 'three';
import { toon, outline, canvasTex, glow, rounded, box, cyl, ball, rand, } from '../core/three-setup.js';
export const ROOM = { w: 7, d: 6, h: 3.2, wallT: 0.14 };
/* ------------------------------------------------------------------ */
/* 窗外夜景                                                            */
/* ------------------------------------------------------------------ */
function nightSky() {
    return canvasTex(1024, 640, (c, w, h) => {
        const sky = c.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#05070f');
        sky.addColorStop(0.42, '#0c1734');
        sky.addColorStop(0.78, '#1b2a52');
        sky.addColorStop(1, '#2a3a67');
        c.fillStyle = sky;
        c.fillRect(0, 0, w, h);
        for (let i = 0; i < 220; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h * 0.8;
            const r = Math.random() * 1.6 + 0.3;
            c.globalAlpha = Math.random() * 0.8 + 0.15;
            c.fillStyle = '#eaf2ff';
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
        }
        c.globalAlpha = 1;
        // 月亮
        const mx = w * 0.28;
        const my = h * 0.27;
        const mr = 44;
        const halo = c.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.6);
        halo.addColorStop(0, 'rgba(255,246,214,0.5)');
        halo.addColorStop(0.4, 'rgba(255,232,180,0.14)');
        halo.addColorStop(1, 'rgba(255,220,160,0)');
        c.fillStyle = halo;
        c.beginPath();
        c.arc(mx, my, mr * 3.6, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fbf3d6';
        c.beginPath();
        c.arc(mx, my, mr, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(214,203,168,0.55)';
        for (const [dx, dy, rr] of [
            [-18, -12, 13],
            [16, 10, 9],
            [4, 24, 6],
            [-26, 18, 5],
        ]) {
            c.beginPath();
            c.arc(mx + dx, my + dy, rr, 0, Math.PI * 2);
            c.fill();
        }
        // 远处屋顶
        c.fillStyle = '#05070f';
        let x = -20;
        while (x < w + 20) {
            const bw = 40 + Math.random() * 90;
            const bh = 60 + Math.random() * 110;
            c.fillRect(x, h - bh, bw, bh);
            if (Math.random() > 0.4) {
                c.beginPath();
                c.moveTo(x - 4, h - bh);
                c.lineTo(x + bw / 2, h - bh - 26);
                c.lineTo(x + bw + 4, h - bh);
                c.fill();
            }
            for (let k = 0; k < 4; k++) {
                if (Math.random() > 0.55) {
                    c.fillStyle = 'rgba(255,206,138,0.85)';
                    c.fillRect(x + 8 + Math.random() * (bw - 20), h - bh + 10 + Math.random() * (bh - 26), 5, 7);
                    c.fillStyle = '#05070f';
                }
            }
            x += bw + 6;
        }
        // 窗玻璃反光
        const glass = c.createLinearGradient(0, 0, w * 0.6, h);
        glass.addColorStop(0, 'rgba(150,190,255,0.10)');
        glass.addColorStop(0.35, 'rgba(150,190,255,0.02)');
        glass.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = glass;
        c.fillRect(0, 0, w, h);
    });
}
export function buildRoom(updates) {
    const room = new THREE.Group();
    const { w, d, h, wallT } = ROOM;
    /* ---------------- 地板 ---------------- */
    const woodTex = canvasTex(512, 512, (c, W, H) => {
        c.fillStyle = '#7c5741';
        c.fillRect(0, 0, W, H);
        const plank = H / 6;
        for (let i = 0; i < 6; i++) {
            c.fillStyle = i % 2 ? '#7f5a43' : '#75513c';
            c.fillRect(0, i * plank, W, plank - 3);
            c.strokeStyle = 'rgba(60,38,26,0.55)';
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(0, i * plank + plank - 1.5);
            c.lineTo(W, i * plank + plank - 1.5);
            c.stroke();
            for (let g = 0; g < 8; g++) {
                c.strokeStyle = 'rgba(52,32,22,0.18)';
                c.lineWidth = 1;
                c.beginPath();
                const y = i * plank + 6 + Math.random() * (plank - 14);
                c.moveTo(0, y);
                c.bezierCurveTo(W * 0.3, y + rand(-4, 4), W * 0.7, y + rand(-4, 4), W, y + rand(-3, 3));
                c.stroke();
            }
        }
    });
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(1, 1);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), toon(0xffffff, { map: woodTex }));
    floor.position.set(0, -0.1, 0);
    floor.userData.noOutline = true;
    room.add(floor);
    /* ---------------- 墙 ---------------- */
    const addWall = (bw, bh, bd, x, y, z) => {
        const m = box(bw, bh, bd, 0x3d4370);
        m.position.set(x, y, z);
        m.userData.noOutline = true;
        room.add(m);
        return m;
    };
    // 后墙（挖窗）
    const winX0 = -2.25;
    const winX1 = 0.05;
    const winY0 = 1.2;
    const winY1 = 2.62;
    addWall(winX0 + 3.5, h, wallT, (winX0 - 3.5) / 2, h / 2, -3 - wallT / 2);
    addWall(3.5 - winX1, h, wallT, (winX1 + 3.5) / 2, h / 2, -3 - wallT / 2);
    addWall(winX1 - winX0, winY0, wallT, (winX0 + winX1) / 2, winY0 / 2, -3 - wallT / 2);
    addWall(winX1 - winX0, h - winY1, wallT, (winX0 + winX1) / 2, (winY1 + h) / 2, -3 - wallT / 2);
    // 左墙
    addWall(wallT, h, d, -3.5 - wallT / 2, h / 2, 0);
    // 踢脚线
    const skirting = 0x2a2d4a;
    const sk1 = box(w - 0.1, 0.09, 0.04, skirting);
    sk1.position.set(0, 0.045, -2.97);
    room.add(sk1);
    const sk2 = box(0.04, 0.09, d - 0.1, skirting);
    sk2.position.set(-3.47, 0.045, 0);
    room.add(sk2);
    /* ---------------- 窗外夜景 ---------------- */
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.76), new THREE.MeshBasicMaterial({ map: nightSky() }));
    sky.position.set(-1.1, 1.91, -3.055);
    sky.userData.noOutline = true;
    room.add(sky);
    /* ---------------- 窗框 ---------------- */
    const frameMat = 0xead7bd;
    const fw = 0.07;
    const frame = new THREE.Group();
    const top = box(winX1 - winX0 + fw * 2, fw, 0.16, frameMat);
    top.position.set((winX0 + winX1) / 2, winY1 + fw / 2, -2.98);
    const bot = box(winX1 - winX0 + fw * 2, fw, 0.16, frameMat);
    bot.position.set((winX0 + winX1) / 2, winY0 - fw / 2, -2.98);
    const l = box(fw, winY1 - winY0 + fw * 2, 0.16, frameMat);
    l.position.set(winX0 - fw / 2, (winY0 + winY1) / 2, -2.98);
    const r = box(fw, winY1 - winY0 + fw * 2, 0.16, frameMat);
    r.position.set(winX1 + fw / 2, (winY0 + winY1) / 2, -2.98);
    const midV = box(0.045, winY1 - winY0, 0.1, frameMat);
    midV.position.set((winX0 + winX1) / 2, (winY0 + winY1) / 2, -2.99);
    const midH = box(winX1 - winX0, 0.04, 0.1, frameMat);
    midH.position.set((winX0 + winX1) / 2, (winY0 + winY1) / 2, -2.99);
    frame.add(top, bot, l, r, midV, midH);
    outline(frame, 1.02);
    room.add(frame);
    // 窗台
    const sill = rounded(winX1 - winX0 + 0.3, 0.06, 0.28, 0.02, 0xf0e2cd);
    sill.position.set((winX0 + winX1) / 2, winY0 - 0.03, -2.88);
    outline(sill, 1.03);
    room.add(sill);
    /* ---------------- 窗帘 ---------------- */
    const curtainTex = canvasTex(128, 256, (c, W, H) => {
        c.fillStyle = '#f0a2ba';
        c.fillRect(0, 0, W, H);
        for (let i = 0; i < 10; i++) {
            const x = (i / 10) * W;
            const g = c.createLinearGradient(x, 0, x + W / 10, 0);
            g.addColorStop(0, 'rgba(120,40,70,0.16)');
            g.addColorStop(0.45, 'rgba(255,235,240,0.28)');
            g.addColorStop(1, 'rgba(120,40,70,0.16)');
            c.fillStyle = g;
            c.fillRect(x, 0, W / 10 + 1, H);
        }
        c.fillStyle = 'rgba(255,240,244,0.35)';
        c.fillRect(0, H - 14, W, 14);
    });
    const curtainMat = toon(0xffffff, { map: curtainTex, side: THREE.DoubleSide });
    const makeCurtain = (x) => {
        const geo = new THREE.PlaneGeometry(0.34, 1.46, 14, 1);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const u = (pos.getX(i) + 0.17) / 0.34;
            pos.setZ(i, Math.sin(u * Math.PI * 5) * 0.045);
        }
        pos.needsUpdate = true;
        const m = new THREE.Mesh(geo, curtainMat);
        m.position.set(x, 1.93, -2.86);
        m.userData.noOutline = true;
        return m;
    };
    const rod = cyl(0.012, 0.012, winX1 - winX0 + 0.9, 0xd8b07a, 8);
    rod.rotation.z = Math.PI / 2;
    rod.position.set((winX0 + winX1) / 2, winY1 + 0.1, -2.86);
    room.add(rod);
    const curtainL = makeCurtain(winX0 - 0.12);
    const curtainR = makeCurtain(winX1 + 0.12);
    room.add(curtainL, curtainR);
    updates.push((t) => {
        curtainL.rotation.y = Math.sin(t * 0.5) * 0.03;
        curtainR.rotation.y = Math.sin(t * 0.43 + 1.4) * 0.035;
    });
    /* ---------------- 地毯 ---------------- */
    const rugTex = canvasTex(512, 384, (c, W, H) => {
        c.fillStyle = '#dfcdb2';
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#d3b393';
        c.fillRect(14, 14, W - 28, H - 28);
        c.fillStyle = '#e7d8c0';
        c.fillRect(30, 30, W - 60, H - 60);
        c.strokeStyle = '#c58da0';
        c.lineWidth = 5;
        c.strokeRect(44, 44, W - 88, H - 88);
        c.fillStyle = '#c58da0';
        for (let i = 0; i < 26; i++) {
            const x = 30 + Math.random() * (W - 60);
            const y = 30 + Math.random() * (H - 60);
            c.globalAlpha = 0.55;
            c.beginPath();
            c.arc(x, y, 3 + Math.random() * 3, 0, Math.PI * 2);
            c.fill();
        }
        c.globalAlpha = 1;
        c.fillStyle = '#fff6e6';
        c.font = '600 42px "PingFang SC", sans-serif';
        c.textAlign = 'center';
        c.globalAlpha = 0.5;
        c.fillText('好 梦', W / 2, H / 2 + 15);
    });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.3), toon(0xffffff, { map: rugTex }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.25, 0.012, 0.85);
    rug.userData.noOutline = true;
    room.add(rug);
    /* ---------------- 灯串 ---------------- */
    const pts = [];
    for (let i = 0; i <= 22; i++) {
        const u = i / 22;
        pts.push(new THREE.Vector3(-3.35 + u * 6.7, 2.72 - Math.sin(u * Math.PI) * 0.42, -2.86 + Math.sin(u * Math.PI * 2) * 0.05));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.005, 4, false), toon(0x23253c));
    wire.userData.noOutline = true;
    room.add(wire);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe1ac });
    const bulbs = [];
    const glowGroup = new THREE.Group();
    for (let i = 0; i <= 21; i++) {
        const u = i / 21;
        const p = curve.getPoint(u);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), bulbMat);
        b.position.copy(p).y -= 0.03;
        b.userData.noOutline = true;
        room.add(b);
        bulbs.push(b);
        const g = glow(0.24, 0xffc98a, 0.55);
        g.position.copy(b.position);
        room.add(g);
        glowGroup.add(g);
    }
    const lightA = new THREE.PointLight(0xffb877, 1.15, 4.2, 2);
    lightA.position.set(-1.6, 2.35, -2.6);
    const lightB = new THREE.PointLight(0xffb877, 0.8, 4, 2);
    lightB.position.set(1.7, 2.35, -2.6);
    room.add(lightA, lightB);
    updates.push((t) => {
        bulbs.forEach((b, i) => {
            const k = 0.75 + 0.25 * Math.sin(t * 1.6 + i * 0.9) * Math.sin(t * 0.7 + i);
            b.material.color.setRGB(1, 0.86 * k, 0.62 * k);
        });
        lightA.intensity = 1.05 + Math.sin(t * 1.3) * 0.12;
        lightB.intensity = 0.72 + Math.sin(t * 1.1 + 2) * 0.09;
    });
    /* ---------------- 墙上的画 ---------------- */
    const posterTex = canvasTex(320, 420, (c, W, H) => {
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#2b2f5e');
        g.addColorStop(0.55, '#4a3c66');
        g.addColorStop(1, '#7c5a6b');
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#fbeecb';
        c.beginPath();
        c.arc(W * 0.66, H * 0.3, 42, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#f5d7e3';
        c.globalAlpha = 0.85;
        for (const [x, y, r] of [
            [80, 150, 3],
            [150, 96, 2],
            [230, 120, 2.5],
            [110, 230, 2],
            [260, 220, 3],
        ]) {
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
        }
        c.globalAlpha = 1;
        c.fillStyle = 'rgba(251,238,203,0.92)';
        c.font = '600 34px "PingFang SC", sans-serif';
        c.textAlign = 'center';
        c.fillText('好 梦', W / 2, H - 58);
        c.font = '300 16px "PingFang SC", sans-serif';
        c.globalAlpha = 0.6;
        c.fillText('every night', W / 2, H - 30);
    });
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.02), new THREE.MeshBasicMaterial({ map: posterTex }));
    poster.position.set(-3.435, 1.95, -1.15);
    poster.rotation.y = Math.PI / 2;
    poster.userData.noOutline = true;
    room.add(poster);
    const posterFrame = box(0.06, 1.12, 0.88, 0xe8d6ba);
    posterFrame.position.set(-3.5, 1.95, -1.15);
    room.add(posterFrame);
    /* ---------------- 小挂星 ---------------- */
    const hangers = new THREE.Group();
    const hangPos = [
        [-2.5, 2.55],
        [-1.75, 2.72],
        [-0.95, 2.5],
    ];
    hangPos.forEach(([x, y], i) => {
        const line = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.5, 4), toon(0x2a2c46));
        line.position.set(x, y + 0.25, -2.9);
        line.userData.noOutline = true;
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), toon(i === 1 ? 0xffd38a : 0xf6b8cc));
        star.position.set(x, y, -2.9);
        star.rotation.z = Math.PI / 4;
        outline(star, 1.08);
        hangers.add(line, star);
    });
    room.add(hangers);
    updates.push((t) => {
        hangers.children.forEach((o, i) => {
            if (i % 2 === 1)
                o.rotation.y = t * 0.6 + i;
        });
    });
    // 左墙三角旗
    const bunting = new THREE.Group();
    const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.44, 3.02, -2.5),
        new THREE.Vector3(-3.44, 2.78, -1.0),
        new THREE.Vector3(-3.44, 2.98, 0.5),
    ]);
    const bLine = new THREE.Mesh(new THREE.TubeGeometry(bCurve, 40, 0.004, 4, false), toon(0x2a2c46));
    bLine.userData.noOutline = true;
    bunting.add(bLine);
    const flagShape = new THREE.Shape();
    flagShape.moveTo(-0.075, 0);
    flagShape.lineTo(0.075, 0);
    flagShape.lineTo(0, -0.17);
    flagShape.closePath();
    const flagGeo = new THREE.ShapeGeometry(flagShape);
    const flagMats = [0xf7a8bd, 0xffd28a, 0xa8d8c8, 0xb7cdf0].map((c) => toon(c, { side: THREE.DoubleSide }));
    const buntingFlags = [];
    for (let i = 0; i < 9; i++) {
        const u = 0.06 + (i / 8) * 0.88;
        const p = bCurve.getPoint(u);
        const f = new THREE.Mesh(flagGeo, flagMats[i % 4]);
        f.position.set(-3.435, p.y, p.z);
        f.rotation.y = Math.PI / 2;
        f.userData.noOutline = true;
        bunting.add(f);
        buntingFlags.push(f);
    }
    room.add(bunting);
    updates.push((t) => {
        buntingFlags.forEach((f, i) => {
            f.rotation.z = Math.sin(t * 1.2 + i * 0.7) * 0.06;
        });
    });
    /* ---------------- 气球 ---------------- */
    const balloonGroup = new THREE.Group();
    const balloonColors = [0xff8fae, 0xffc45e, 0x86b7f0];
    balloonColors.forEach((color, i) => {
        const g = new THREE.Group();
        const b = ball(0.21, color);
        b.scale.set(1, 1.16, 1);
        outline(b, 1.03);
        const knot = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.06, 8), toon(color));
        knot.position.y = -0.25;
        knot.rotation.x = Math.PI;
        const str = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.9, 4), toon(0xd8c8b8));
        str.position.y = -0.72;
        str.userData.noOutline = true;
        g.add(b, knot, str);
        g.position.set(-3.02 + i * 0.26, 1.92 + (i % 2) * 0.26, 1.45 + i * 0.32);
        g.rotation.z = rand(-0.12, 0.12);
        balloonGroup.add(g);
    });
    room.add(balloonGroup);
    updates.push((t) => {
        balloonGroup.children.forEach((g, i) => {
            g.position.y = 2.15 + (i % 2) * 0.28 + Math.sin(t * 0.8 + i * 1.7) * 0.05;
            g.rotation.z = Math.sin(t * 0.6 + i) * 0.06;
        });
    });
    // 照片串（左墙）
    const photoGroup = new THREE.Group();
    const stringCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.455, 2.16, -0.5),
        new THREE.Vector3(-3.455, 2.08, 0.35),
        new THREE.Vector3(-3.455, 2.16, 1.2),
    ]);
    const stringMesh = new THREE.Mesh(new THREE.TubeGeometry(stringCurve, 30, 0.004, 4, false), toon(0x2a2c46));
    stringMesh.userData.noOutline = true;
    photoGroup.add(stringMesh);
    const polaroids = [
        [-0.35, 0xf7b8c9],
        [0.38, 0xffd08a],
        [1.05, 0xb7cdf0],
    ];
    polaroids.forEach(([z, tint], i) => {
        const card = new THREE.Group();
        const frame = box(0.012, 0.25, 0.19, 0xfbf1e2);
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.13), new THREE.MeshBasicMaterial({
            map: canvasTex(96, 96, (c, W, H) => {
                const g = c.createLinearGradient(0, 0, W, H);
                g.addColorStop(0, '#ffffff');
                g.addColorStop(1, '#000000');
                c.fillStyle = g;
                c.globalCompositeOperation = 'source-over';
                c.fillStyle = '#' + tint.toString(16).padStart(6, '0');
                c.fillRect(0, 0, W, H);
                c.fillStyle = 'rgba(255,255,255,0.30)';
                c.beginPath();
                c.arc(W / 2, H / 2 - 4, 22, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = 'rgba(0,0,0,0.16)';
                c.beginPath();
                c.arc(W / 2 - 6, H / 2 - 8, 2.4, 0, Math.PI * 2);
                c.arc(W / 2 + 6, H / 2 - 8, 2.4, 0, Math.PI * 2);
                c.fill();
            }),
        }));
        pic.rotation.y = Math.PI / 2;
        pic.position.set(0.0075, 0.018, 0);
        pic.userData.noOutline = true;
        const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.12, 4), toon(0x3a3c58));
        thread.position.y = 0.185;
        thread.userData.noOutline = true;
        card.add(frame, pic, thread);
        card.position.set(-3.44, 1.97, z);
        card.rotation.x = -0.04;
        card.rotation.z = i === 1 ? 0.05 : -0.04;
        photoGroup.add(card);
    });
    room.add(photoGroup);
    /* ---------------- 置物架 ---------------- */
    const shelf = new THREE.Group();
    const shelfBoard = rounded(1.15, 0.05, 0.26, 0.015, 0xb98a60);
    shelf.add(shelfBoard);
    const bracketL = box(0.03, 0.16, 0.2, 0x9a6d48);
    bracketL.position.set(-0.48, -0.1, -0.02);
    const bracketR = bracketL.clone();
    bracketR.position.x = 0.48;
    shelf.add(bracketL, bracketR);
    const bookColors = [0xe9b7b7, 0x9fc0d9, 0xf0d3a0, 0xb6c9a8, 0xd8b4d8];
    let bx = -0.46;
    for (let i = 0; i < 5; i++) {
        const bh = rand(0.16, 0.24);
        const bw = rand(0.035, 0.055);
        const bk = box(bw, bh, 0.16, bookColors[i]);
        bk.position.set(bx, bh / 2 + 0.025, 0);
        bk.rotation.z = rand(-0.03, 0.03);
        shelf.add(bk);
        bx += bw + 0.012;
    }
    // 小盆栽
    const pot = cyl(0.055, 0.042, 0.07, 0xd9a07a);
    pot.position.set(0.18, 0.06, 0);
    const leafMat = toon(0x7fa98a);
    for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), leafMat);
        const a = (i / 5) * Math.PI * 2;
        leaf.position.set(0.18 + Math.cos(a) * 0.045, 0.12 + Math.sin(i) * 0.02, Math.sin(a) * 0.04);
        leaf.scale.set(1, 0.7, 1);
        shelf.add(leaf);
    }
    shelf.add(pot);
    // 小相框
    const fr = box(0.12, 0.15, 0.012, 0xf6e6cf);
    fr.position.set(0.38, 0.1, 0);
    fr.rotation.y = -0.3;
    const frInner = new THREE.Mesh(new THREE.PlaneGeometry(0.095, 0.12), new THREE.MeshBasicMaterial({ map: canvasTex(96, 120, (c, W, H) => {
            const g = c.createLinearGradient(0, 0, W, H);
            g.addColorStop(0, '#f7b8c9');
            g.addColorStop(1, '#c9b7e8');
            c.fillStyle = g;
            c.fillRect(0, 0, W, H);
            c.fillStyle = '#fff7ea';
            c.beginPath();
            c.arc(W / 2, H / 2, 16, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#f7b8c9';
            c.beginPath();
            c.arc(W / 2 - 4, H / 2 - 2, 3, 0, Math.PI * 2);
            c.arc(W / 2 + 4, H / 2 - 2, 3, 0, Math.PI * 2);
            c.fill();
        }) }));
    frInner.position.set(0.38, 0.1, 0.008);
    frInner.rotation.y = -0.3;
    frInner.userData.noOutline = true;
    shelf.add(fr, frInner);
    outline(shelf, 1.03);
    shelf.position.set(2.5, 2.12, -2.86);
    room.add(shelf);
    /* ---------------- 主灯光 ---------------- */
    const hemi = new THREE.HemisphereLight(0x8ea2e8, 0x2a2236, 0.85);
    room.add(hemi);
    const moon = new THREE.DirectionalLight(0xb8d0ff, 1.25);
    moon.position.set(-4.5, 5.5, -6.5);
    room.add(moon);
    const fill = new THREE.DirectionalLight(0xffd9c0, 0.35);
    fill.position.set(6, 3, 5);
    room.add(fill);
    // 窗外月光地面光斑
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.7), new THREE.MeshBasicMaterial({
        map: canvasTex(256, 192, (c, W, H) => {
            const g = c.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W / 2);
            g.addColorStop(0, 'rgba(170,205,255,0.32)');
            g.addColorStop(1, 'rgba(170,205,255,0)');
            c.fillStyle = g;
            c.fillRect(0, 0, W, H);
        }),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }));
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(-1.1, 0.02, -1.7);
    patch.userData.noOutline = true;
    room.add(patch);
    return room;
}
