import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
/* ---------- 卡通材质 ---------- */
let grad = null;
export function toonGradient() {
    if (grad)
        return grad;
    const data = new Uint8Array([70, 70, 70, 255, 140, 140, 140, 255, 210, 210, 210, 255, 255, 255, 255, 255]);
    const tex = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    grad = tex;
    return tex;
}
export function toon(color, opts = {}) {
    return new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), ...opts });
}
/* ---------- 描边（反向外壳） ---------- */
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x17182a, side: THREE.BackSide });
export function outline(root, scale = 1.045) {
    const meshes = [];
    root.traverse((o) => {
        const m = o;
        if (m.isMesh && !m.userData.noOutline)
            meshes.push(m);
    });
    for (const m of meshes) {
        const shell = new THREE.Mesh(m.geometry, outlineMat);
        shell.scale.setScalar(scale);
        shell.raycast = () => { };
        m.add(shell);
    }
    return root;
}
/* ---------- 画布纹理 ---------- */
export function canvasTex(w, h, draw) {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}
/* ---------- 光晕贴图 ---------- */
export const glowTex = canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,244,214,1)');
    g.addColorStop(0.28, 'rgba(255,214,150,0.62)');
    g.addColorStop(0.62, 'rgba(255,178,120,0.18)');
    g.addColorStop(1, 'rgba(255,160,110,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
});
export function glow(size = 0.6, color = 0xffffff, opacity = 1) {
    const mat = new THREE.SpriteMaterial({
        map: glowTex,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const s = new THREE.Sprite(mat);
    s.scale.setScalar(size);
    return s;
}
/* ---------- 接触阴影 ---------- */
const shadowTex = canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 6, 64, 64, 62);
    g.addColorStop(0, 'rgba(0,0,0,0.72)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.34)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
});
export function contactShadow(w, d, opacity = 0.6) {
    const mat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity,
        depthWrite: false,
        color: 0x05060f,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.008;
    m.renderOrder = 2;
    m.userData.noOutline = true;
    return m;
}
/* ---------- 快捷几何 ---------- */
export function rounded(w, h, d, r, color, opts = {}) {
    const geo = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) / 2));
    return new THREE.Mesh(geo, toon(color, opts));
}
export function box(w, h, d, color, opts = {}) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, opts));
}
export function cyl(rt, rb, h, color, seg = 24, opts = {}) {
    return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toon(color, opts));
}
export function ball(r, color, opts = {}) {
    return new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), toon(color, opts));
}
export function place(obj, x, y, z) {
    obj.position.set(x, y, z);
    return obj;
}
/* ---------- 随机 ---------- */
export function rand(a, b) {
    return a + Math.random() * (b - a);
}
