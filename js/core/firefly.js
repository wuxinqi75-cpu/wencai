import * as THREE from '../../vendor/three.module.js';
import { glow } from '../core/three-setup.js';
export function createFirefly() {
    const g = new THREE.Group();
    const core = glow(0.26, 0xffe0a0, 0.95);
    const halo = glow(0.62, 0xffcf80, 0.35);
    const light = new THREE.PointLight(0xffd9a0, 0.28, 1.6, 2);
    g.add(core, halo, light);
    const pos = new THREE.Vector3(-2.3, 1.7, -0.4);
    g.position.copy(pos);
    const desired = new THREE.Vector3();
    return {
        object: g,
        update(t, dt, target) {
            desired.copy(target);
            desired.x += Math.cos(t * 0.7) * 0.16 + 0.05;
            desired.y += Math.sin(t * 0.95) * 0.09 - 0.16;
            desired.z += Math.sin(t * 0.62) * 0.11;
            pos.lerp(desired, Math.min(1, dt * 1.7));
            g.position.copy(pos);
            const pulse = 0.86 + Math.sin(t * 2.6) * 0.14;
            core.scale.setScalar(0.26 * pulse);
            halo.scale.setScalar(0.62 * pulse);
            light.intensity = 0.24 * pulse;
        },
    };
}
