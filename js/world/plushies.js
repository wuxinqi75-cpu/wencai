import * as THREE from '../../vendor/three.module.js';
import { toon, outline, contactShadow, ball, rounded } from '../core/three-setup.js';
/* ------------------------------------------------------------------ */
function eyes(parent, r, y, z, off, color = 0x2a2333) {
    for (const x of [-off, off]) {
        const e = ball(r, color);
        e.position.set(x, y, z);
        e.userData.noOutline = true;
        parent.add(e);
    }
}
function blush(parent, off, y, z) {
    for (const x of [-off, off]) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffb3c6, transparent: true, opacity: 0.55 }));
        b.scale.set(1, 0.6, 0.35);
        b.position.set(x, y, z);
        b.userData.noOutline = true;
        parent.add(b);
    }
}
/* ------------------------------------------------------------------ */
export function makeBunny() {
    const g = new THREE.Group();
    const fur = toon(0xf8ecdd);
    const pink = toon(0xf7b8c9);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.155, 28, 20), fur);
    body.scale.set(1, 1.02, 0.9);
    body.position.y = 0.15;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 28, 20), fur);
    head.scale.set(1.04, 1, 0.98);
    head.position.y = 0.375;
    g.add(head);
    // 耳朵
    for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.031, 0.14, 6, 12), fur);
        ear.position.set(s * 0.058, 0.52, -0.01);
        ear.rotation.z = s * 0.16;
        g.add(ear);
        const inner = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.095, 6, 10), pink);
        inner.position.set(s * 0.058, 0.52, 0.014);
        inner.rotation.z = s * 0.16;
        inner.userData.noOutline = true;
        g.add(inner);
    }
    // 脸颊
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 16), toon(0xfffaf2));
    muzzle.scale.set(1.25, 0.92, 0.8);
    muzzle.position.set(0, 0.34, 0.095);
    g.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 10), pink);
    nose.position.set(0, 0.355, 0.152);
    nose.userData.noOutline = true;
    g.add(nose);
    eyes(g, 0.019, 0.4, 0.11, 0.052);
    blush(g, 0.088, 0.352, 0.1);
    // 手
    for (const s of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), fur);
        arm.scale.set(0.9, 1.25, 0.9);
        arm.position.set(s * 0.145, 0.185, 0.015);
        arm.rotation.z = s * 0.35;
        g.add(arm);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), fur);
        foot.scale.set(1, 0.66, 1.3);
        foot.position.set(s * 0.072, 0.045, 0.085);
        g.add(foot);
    }
    // 围巾
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.024, 10, 20), toon(0x8fd0c4));
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 0.268;
    g.add(scarf);
    const tailScarf = rounded(0.062, 0.14, 0.028, 0.012, 0x8fd0c4);
    tailScarf.position.set(0.055, 0.205, 0.09);
    tailScarf.rotation.z = -0.18;
    g.add(tailScarf);
    outline(g, 1.05);
    return g;
}
/* ------------------------------------------------------------------ */
export function makeBear() {
    const g = new THREE.Group();
    const fur = toon(0xc99a76);
    const cream = toon(0xf6e3cd);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.155, 26, 20), fur);
    body.scale.set(1.05, 1.0, 0.95);
    body.position.y = 0.152;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.142, 26, 20), fur);
    head.position.y = 0.372;
    g.add(head);
    for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 14), fur);
        ear.position.set(s * 0.098, 0.482, -0.005);
        g.add(ear);
        const inner = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 12), cream);
        inner.position.set(s * 0.098, 0.482, 0.028);
        inner.userData.noOutline = true;
        g.add(inner);
    }
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.072, 20, 16), cream);
    muzzle.scale.set(1.2, 0.9, 0.75);
    muzzle.position.set(0, 0.338, 0.095);
    g.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 10), toon(0x4a3a34));
    nose.scale.set(1.2, 0.9, 0.8);
    nose.position.set(0, 0.352, 0.152);
    nose.userData.noOutline = true;
    g.add(nose);
    eyes(g, 0.02, 0.405, 0.115, 0.055);
    blush(g, 0.09, 0.345, 0.1);
    for (const s of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), fur);
        arm.scale.set(0.9, 1.2, 0.9);
        arm.position.set(s * 0.15, 0.18, 0.02);
        arm.rotation.z = s * 0.4;
        g.add(arm);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), fur);
        foot.scale.set(1, 0.68, 1.3);
        foot.position.set(s * 0.075, 0.045, 0.09);
        g.add(foot);
    }
    // 领结
    const bowL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), toon(0xe78aa7));
    bowL.scale.set(1, 0.8, 0.65);
    bowL.position.set(-0.038, 0.258, 0.11);
    const bowR = bowL.clone();
    bowR.position.x = 0.038;
    const bowC = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), toon(0xd06b8c));
    bowC.position.set(0, 0.258, 0.124);
    g.add(bowL, bowR, bowC);
    outline(g, 1.05);
    return g;
}
/* ------------------------------------------------------------------ */
export function makeCat() {
    const g = new THREE.Group();
    const fur = toon(0xa9b0c4);
    const light = toon(0xf1efe8);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.145, 26, 20), fur);
    body.scale.set(1.05, 1.0, 1.0);
    body.position.y = 0.145;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.128, 26, 20), fur);
    head.scale.set(1.06, 1, 0.96);
    head.position.y = 0.355;
    g.add(head);
    for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.1, 4), fur);
        ear.position.set(s * 0.075, 0.468, 0);
        ear.rotation.y = Math.PI / 4;
        ear.rotation.z = s * 0.22;
        g.add(ear);
    }
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.058, 18, 14), light);
    muzzle.scale.set(1.3, 0.85, 0.75);
    muzzle.position.set(0, 0.325, 0.092);
    g.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), toon(0xe78aa7));
    nose.scale.set(1.2, 0.9, 0.8);
    nose.position.set(0, 0.338, 0.145);
    nose.userData.noOutline = true;
    g.add(nose);
    eyes(g, 0.019, 0.382, 0.108, 0.05, 0x2f2b3a);
    blush(g, 0.084, 0.33, 0.098);
    for (const s of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 12), fur);
        arm.scale.set(0.9, 1.2, 0.9);
        arm.position.set(s * 0.14, 0.17, 0.02);
        arm.rotation.z = s * 0.35;
        g.add(arm);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 12), fur);
        foot.scale.set(1, 0.66, 1.25);
        foot.position.set(s * 0.07, 0.04, 0.085);
        g.add(foot);
    }
    // 尾巴
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.12, 0.12, -0.08),
        new THREE.Vector3(0.19, 0.05, -0.13),
        new THREE.Vector3(0.15, 0.03, -0.22),
        new THREE.Vector3(0.04, 0.03, -0.24),
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.022, 8, false), fur);
    g.add(tail);
    outline(g, 1.05);
    return g;
}
/* ------------------------------------------------------------------ */
export function buildPlushies(updates) {
    const group = new THREE.Group();
    const bunny = makeBunny();
    bunny.position.set(-2.5, 0.778, -0.98);
    bunny.rotation.y = 0.42;
    group.add(bunny);
    const bear = makeBear();
    bear.scale.setScalar(1.18);
    bear.position.set(0.42, 0.02, 0.72);
    bear.rotation.y = -0.5;
    group.add(bear);
    const cat = makeCat();
    cat.position.set(-2.3, 0.778, -0.32);
    cat.rotation.y = 1.0;
    group.add(cat);
    for (const p of [bunny, bear, cat]) {
        const s = contactShadow(0.52, 0.46, 0.55);
        s.position.y = 0.006;
        p.add(s);
    }
    const initial = [
        { obj: bunny, y: bunny.position.y, phase: 0 },
        { obj: bear, y: bear.position.y, phase: 2.1 },
        { obj: cat, y: cat.position.y, phase: 4.2 },
    ];
    updates.push((t) => {
        for (const it of initial) {
            it.obj.position.y = it.y + Math.sin(t * 1.4 + it.phase) * 0.006;
            it.obj.rotation.z = Math.sin(t * 0.9 + it.phase) * 0.02;
        }
        bunny.rotation.y = 0.42 + Math.sin(t * 0.5) * 0.06;
    });
    return group;
}
