import * as THREE from 'three';
import { toon, outline, canvasTex, glow, contactShadow, rounded, box, cyl, ball, } from '../core/three-setup.js';
export function buildFurniture(updates) {
    const group = new THREE.Group();
    /* ---------------- 床 ---------------- */
    const bed = new THREE.Group();
    const frame = rounded(1.72, 0.3, 2.42, 0.07, 0xa9754f);
    frame.position.y = 0.3;
    bed.add(frame);
    for (const [x, z] of [
        [-0.74, -1.05],
        [0.74, -1.05],
        [-0.74, 1.05],
        [0.74, 1.05],
    ]) {
        const leg = cyl(0.045, 0.04, 0.2, 0x8a5c3c, 8);
        leg.position.set(x, 0.1, z);
        bed.add(leg);
    }
    const mattress = rounded(1.62, 0.24, 2.32, 0.1, 0xf3e6d4);
    mattress.position.y = 0.56;
    bed.add(mattress);
    const headboard = rounded(1.8, 0.88, 0.12, 0.06, 0xe8d5bd);
    headboard.position.set(0, 0.9, -1.24);
    bed.add(headboard);
    const tuft = ball(0.05, 0xd9c3a6);
    tuft.position.set(0, 1.0, -1.17);
    bed.add(tuft);
    for (const x of [-0.38, 0.38]) {
        const pillow = rounded(0.64, 0.16, 0.42, 0.08, 0xfdf5e8);
        pillow.position.set(x, 0.72, -0.92);
        pillow.rotation.x = -0.12;
        bed.add(pillow);
    }
    const blanket = rounded(1.64, 0.12, 1.5, 0.06, 0xefa1b9);
    blanket.position.set(0, 0.715, 0.42);
    bed.add(blanket);
    const fold = rounded(1.64, 0.11, 0.28, 0.05, 0xe78aa7);
    fold.position.set(0, 0.76, -0.28);
    bed.add(fold);
    const cushion = rounded(0.36, 0.32, 0.14, 0.06, 0xffd9a0);
    cushion.position.set(0.0, 0.82, -0.55);
    cushion.rotation.x = -0.3;
    bed.add(cushion);
    const shadow = contactShadow(2.3, 3.0, 0.55);
    shadow.position.set(0, 0.012, 0);
    bed.add(shadow);
    outline(bed, 1.03);
    bed.position.set(-2.55, 0, -1.45);
    group.add(bed);
    /* ---------------- 书桌 ---------------- */
    const desk = new THREE.Group();
    const deskTop = rounded(1.78, 0.08, 0.74, 0.02, 0xab7a52);
    deskTop.position.y = 0.75;
    desk.add(deskTop);
    for (const x of [-0.84, 0.84]) {
        const panel = rounded(0.07, 0.72, 0.64, 0.02, 0x9c6c47);
        panel.position.set(x, 0.36, 0);
        desk.add(panel);
    }
    const backPanel = rounded(1.66, 0.32, 0.05, 0.02, 0x8f6242);
    backPanel.position.set(0, 0.5, -0.33);
    desk.add(backPanel);
    // 抽屉
    const drawer = rounded(0.56, 0.46, 0.66, 0.03, 0xb5855c);
    drawer.position.set(0.36, 0.28, 0);
    desk.add(drawer);
    for (const y of [0.38, 0.18]) {
        const front = box(0.5, 0.16, 0.03, 0xc79873);
        front.position.set(0.36, y, 0.34);
        desk.add(front);
        const knob = ball(0.022, 0xe8cba8);
        knob.position.set(0.36, y, 0.37);
        desk.add(knob);
    }
    const deskShadow = contactShadow(2.1, 1.1, 0.45);
    desk.add(deskShadow);
    outline(desk, 1.03);
    desk.position.set(2.12, 0, -2.58);
    group.add(desk);
    /* ---------------- 台灯（书桌） ---------------- */
    const lamp = new THREE.Group();
    const lampBase = cyl(0.075, 0.095, 0.035, 0xd9b48a);
    lampBase.position.y = 0.02;
    const pole = cyl(0.012, 0.012, 0.28, 0x6f6656);
    pole.position.y = 0.17;
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.145, 0.15, 22, 1, true), toon(0xffe0b8, { emissive: 0xff9d4d, emissiveIntensity: 0.12, side: THREE.DoubleSide }));
    shade.position.y = 0.35;
    const shadeTop = new THREE.Mesh(new THREE.CircleGeometry(0.088, 22), toon(0xf6d2a8));
    shadeTop.rotation.x = -Math.PI / 2;
    shadeTop.position.y = 0.425;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe6b0 }));
    bulb.position.y = 0.3;
    lamp.add(lampBase, pole, shade, shadeTop, bulb);
    const bulbGlow = glow(0.24, 0xffb870, 0.4);
    bulbGlow.position.y = 0.35;
    lamp.add(bulbGlow);
    lamp.position.set(-0.62, 0.79, -0.12);
    desk.add(lamp);
    const lampLight = new THREE.PointLight(0xffb070, 1.7, 4.2, 2);
    lampLight.position.set(-0.62, 1.14, -0.12);
    desk.add(lampLight);
    /* ---------------- 椅子 ---------------- */
    const chair = new THREE.Group();
    const seat = rounded(0.46, 0.08, 0.46, 0.04, 0xf0d8bd);
    seat.position.y = 0.46;
    chair.add(seat);
    const backRest = rounded(0.46, 0.44, 0.08, 0.04, 0xefd3b4);
    backRest.position.set(0, 0.7, -0.2);
    backRest.rotation.x = 0.1;
    chair.add(backRest);
    const seatCushion = rounded(0.4, 0.07, 0.4, 0.03, 0xf6b8c9);
    seatCushion.position.y = 0.52;
    chair.add(seatCushion);
    for (const [x, z] of [
        [-0.19, -0.19],
        [0.19, -0.19],
        [-0.19, 0.19],
        [0.19, 0.19],
    ]) {
        const leg = cyl(0.022, 0.018, 0.46, 0x9c6c47, 8);
        leg.position.set(x, 0.23, z);
        chair.add(leg);
    }
    const chairShadow = contactShadow(0.85, 0.85, 0.45);
    chair.add(chairShadow);
    outline(chair, 1.04);
    chair.position.set(1.62, 0, -1.78);
    chair.rotation.y = 0.38;
    group.add(chair);
    /* ---------------- 床头柜 ---------------- */
    const stand = new THREE.Group();
    const body = rounded(0.46, 0.48, 0.42, 0.03, 0xb98a60);
    body.position.y = 0.26;
    stand.add(body);
    const plate = rounded(0.5, 0.04, 0.46, 0.015, 0xcaa079);
    plate.position.y = 0.52;
    stand.add(plate);
    const knob = ball(0.025, 0xe8cba8);
    knob.position.set(0, 0.3, 0.22);
    stand.add(knob);
    const bedsideLamp = new THREE.Group();
    const bBase = cyl(0.055, 0.07, 0.03, 0xe0c19a);
    bBase.position.y = 0.015;
    const bPole = cyl(0.01, 0.01, 0.2, 0x7a6f5c);
    bPole.position.y = 0.13;
    const bShade = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.115, 0.125, 20, 1, true), toon(0xffe6c4, { emissive: 0xffa860, emissiveIntensity: 0.16, side: THREE.DoubleSide }));
    bShade.position.y = 0.28;
    const bTop = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), toon(0xf8d9b4));
    bTop.rotation.x = -Math.PI / 2;
    bTop.position.y = 0.342;
    const bBulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe6b0 }));
    bBulb.position.y = 0.24;
    const bGlow = glow(0.3, 0xffb070, 0.45);
    bGlow.position.y = 0.28;
    bedsideLamp.add(bBase, bPole, bShade, bTop, bBulb, bGlow);
    bedsideLamp.position.set(0, 0.54, 0);
    stand.add(bedsideLamp);
    outline(stand, 1.03);
    stand.position.set(-1.28, 0, -2.42);
    group.add(stand);
    /* ---------------- 桌面小物 ---------------- */
    // 马克杯
    const mug = new THREE.Group();
    const cup = cyl(0.055, 0.048, 0.1, 0xf7f0e4, 20, { side: THREE.DoubleSide });
    cup.position.y = 0.05;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.011, 8, 16), toon(0xf7f0e4));
    handle.position.set(0.062, 0.055, 0);
    handle.rotation.y = Math.PI / 2;
    const coffee = cyl(0.048, 0.048, 0.008, 0x6f4b33, 20);
    coffee.position.y = 0.092;
    mug.add(cup, handle, coffee);
    mug.position.set(0.64, 0.79, 0.2);
    desk.add(mug);
    // 书堆
    const bookColors = [0xe9b7b7, 0x9fc0d9, 0xf0d3a0];
    bookColors.forEach((c, i) => {
        const b = rounded(0.26, 0.035, 0.19, 0.008, c);
        b.position.set(0.72, 0.795 + i * 0.036, -0.16);
        b.rotation.y = 0.12 - i * 0.06;
        desk.add(b);
    });
    // 笔筒
    const pencilPot = cyl(0.04, 0.036, 0.09, 0xd2a679, 16);
    pencilPot.position.set(0.42, 0.835, -0.24);
    desk.add(pencilPot);
    for (const [dx, dz, h] of [
        [0.008, 0.006, 0.15],
        [-0.01, -0.005, 0.12],
        [0.002, -0.012, 0.1],
    ]) {
        const pen = cyl(0.005, 0.005, h, 0x6f7a9a, 6);
        pen.position.set(0.42 + dx, 0.83 + h / 2, -0.24 + dz);
        pen.rotation.z = (Math.random() - 0.5) * 0.2;
        desk.add(pen);
    }
    // 日历
    const calTex = canvasTex(360, 260, (c, W, H) => {
        c.fillStyle = '#fbf3e4';
        c.fillRect(0, 0, W, H);
        c.fillStyle = '#e78aa7';
        c.fillRect(0, 0, W, 54);
        c.fillStyle = '#fff8ec';
        c.font = '600 26px "PingFang SC", sans-serif';
        c.textAlign = 'center';
        c.fillText('十月 · 2026', W / 2, 36);
        c.fillStyle = '#3d3550';
        c.font = '700 84px "PingFang SC", sans-serif';
        c.fillText('20', W / 2 - 40, 170);
        c.font = '500 22px "PingFang SC", sans-serif';
        c.fillStyle = '#7a6a7e';
        c.textAlign = 'left';
        c.fillText('周二', W - 92, 122);
        c.fillText('农历九月十一', W - 92, 154);
        c.fillStyle = '#e78aa7';
        c.font = '400 20px "PingFang SC", sans-serif';
        c.fillText('姐姐生日', W - 92, 196);
        c.fillStyle = '#e78aa7';
        c.beginPath();
        c.arc(58, 196, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fff';
        c.font = '600 14px "PingFang SC", sans-serif';
        c.fillText('♥', 52, 201);
    });
    const calendar = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.23), new THREE.MeshBasicMaterial({ map: calTex }));
    calendar.position.set(-0.3, 0.905, -0.3);
    calendar.rotation.x = -0.18;
    calendar.userData.noOutline = true;
    desk.add(calendar);
    // 电话 / 收纳盒
    const boxy = rounded(0.22, 0.12, 0.16, 0.03, 0xe2b6c1);
    boxy.position.set(-0.35, 0.84, 0.14);
    desk.add(boxy);
    updates.push((t) => {
        lampLight.intensity = 1.62 + Math.sin(t * 2.1) * 0.12 + Math.sin(t * 5.3) * 0.05;
    });
    // 地上的坐垫与书
    const pouf = new THREE.Group();
    const pBase = rounded(0.72, 0.24, 0.72, 0.12, 0xf2b6c8);
    pBase.position.y = 0.12;
    const pTop = rounded(0.5, 0.16, 0.5, 0.08, 0xffd9a0);
    pTop.position.y = 0.3;
    pouf.add(pBase, pTop);
    outline(pouf, 1.03);
    pouf.position.set(-2.1, 0, 0.55);
    pouf.rotation.y = 0.3;
    group.add(pouf);
    const floorBookColors = [0xef9f9f, 0x9fc0d9, 0xf0d3a0];
    floorBookColors.forEach((c, i) => {
        const b = rounded(0.28, 0.04, 0.2, 0.008, c);
        b.position.set(0.95, 0.021 + i * 0.042, 1.12);
        b.rotation.y = 0.2 + i * 0.12;
        group.add(b);
    });
    return { group, bed, desk, chair, lampLight };
}
