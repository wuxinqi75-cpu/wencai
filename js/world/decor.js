import * as THREE from 'three';
import { glow, rand, canvasTex, glowTex } from '../core/three-setup.js';
const STAR_POSITIONS = [
    [-2.12, 1.56, -0.95],
    [-1.2, 2.28, -1.8],
    [0.32, 1.36, 0.6],
    [-0.5, 2.62, 0.0],
    [0.5, 1.95, -2.15],
    [-1.55, 2.05, 0.35],
    [2.3, 1.62, -2.25],
];
function starGeo() {
    const shape = new THREE.Shape();
    const outer = 0.095;
    const inner = 0.036;
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0)
            shape.moveTo(x, y);
        else
            shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.03,
        bevelEnabled: true,
        bevelSize: 0.008,
        bevelThickness: 0.008,
        bevelSegments: 2,
    });
    geo.center();
    return geo;
}
export function buildDecor(updates) {
    const group = new THREE.Group();
    const stars = [];
    const geo = starGeo();
    const bursts = [];
    const spawnBurst = (at, color) => {
        for (let i = 0; i < 14; i++) {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({
                map: glowTex,
                color,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            }));
            s.position.copy(at);
            s.scale.setScalar(rand(0.12, 0.26));
            group.add(s);
            const dir = new THREE.Vector3(rand(-1, 1), rand(-0.6, 1), rand(-1, 1)).normalize();
            bursts.push({
                sprite: s,
                vel: dir.multiplyScalar(rand(0.5, 1.3)),
                life: 0,
                max: rand(0.7, 1.15),
            });
        }
    };
    STAR_POSITIONS.forEach((pos, i) => {
        const root = new THREE.Group();
        const color = i % 2 === 0 ? 0xffc061 : 0xff8fb2;
        const big = 1;
        const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
        core.scale.setScalar((0.95 + (i % 3) * 0.1) * big);
        core.rotation.z = rand(-0.3, 0.3);
        root.add(core);
        const halo = glow(0.62 * big, color, 0.7);
        root.add(halo);
        const hit = new THREE.Mesh(new THREE.SphereGeometry(0.28 * big, 12, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        hit.userData.noOutline = true;
        root.add(hit);
        root.position.set(pos[0], pos[1], pos[2]);
        group.add(root);
        stars.push({
            root,
            core,
            halo,
            hit,
            base: new THREE.Vector3(...pos),
            phase: i * 1.7,
            index: i,
            collected: false,
        });
    });
    // 第 7 颗星星先藏着，等镜头推到蛋糕再出现
    stars[6].root.visible = false;
    /* 漂浮尘埃 */
    const count = 150;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = rand(-3.3, 3.3);
        positions[i * 3 + 1] = rand(0.2, 3.0);
        positions[i * 3 + 2] = rand(-2.8, 2.8);
        speeds[i] = rand(0.008, 0.03);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustTex = canvasTex(32, 32, (c) => {
        const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, 'rgba(255,246,220,1)');
        g.addColorStop(0.4, 'rgba(255,226,180,0.5)');
        g.addColorStop(1, 'rgba(255,210,160,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, 32, 32);
    });
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
        size: 0.035,
        map: dustTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    }));
    dust.userData.noOutline = true;
    group.add(dust);
    updates.push((t, dt) => {
        for (const s of stars) {
            if (s.collected) {
                s.root.scale.multiplyScalar(Math.max(0, 1 - dt * 6));
                if (s.root.scale.x < 0.03)
                    s.root.visible = false;
                continue;
            }
            if (!s.root.visible)
                continue;
            s.root.position.y = s.base.y + Math.sin(t * 1.1 + s.phase) * 0.05;
            s.core.rotation.z += dt * 0.35;
            s.core.rotation.y = Math.sin(t * 0.7 + s.phase) * 0.35;
            const k = 0.85 + Math.sin(t * 2.2 + s.phase) * 0.15;
            const pop = 1 + Math.sin(t * 3.1 + s.phase) * 0.03;
            s.root.scale.setScalar(pop);
            s.halo.scale.setScalar(0.62 * k);
        }
        for (let i = bursts.length - 1; i >= 0; i--) {
            const b = bursts[i];
            b.life += dt;
            const p = b.life / b.max;
            if (p >= 1) {
                b.sprite.parent?.remove(b.sprite);
                b.sprite.material.dispose();
                bursts.splice(i, 1);
                continue;
            }
            b.sprite.position.addScaledVector(b.vel, dt);
            b.vel.multiplyScalar(1 - dt * 1.6);
            b.vel.y -= dt * 0.4;
            b.sprite.material.opacity = 1 - p;
            b.sprite.scale.multiplyScalar(1 - dt * 0.6);
        }
        const arr = dustGeo.attributes.position;
        for (let i = 0; i < count; i++) {
            let y = arr.getY(i) + speeds[i] * dt;
            if (y > 3.1)
                y = 0.15;
            arr.setY(i, y);
            arr.setX(i, arr.getX(i) + Math.sin(t * 0.4 + i) * 0.0006);
        }
        arr.needsUpdate = true;
    });
    return {
        group,
        stars,
        collect(star) {
            if (star.collected)
                return;
            star.collected = true;
            const color = star.index % 2 === 0 ? 0xffc061 : 0xff8fb2;
            spawnBurst(star.root.position.clone(), color);
        },
    };
}
