import * as THREE from '../../www/vendor/three.module.js';

export const WEAPON_COLORS = Object.freeze({
  CANNON: 0x00ffff,
  MACHINE_GUN: 0xffff00,
  MISSILE: 0xff3300,
  FLARE: 0xffffff,
  ROCKET: 0xff9900
});

const DEFAULT_POOL_SIZE = 40;
const TRAIL_COUNT = 80;
const WEAPON_LIFETIME = Object.freeze({
  CANNON: 2.0,
  MACHINE_GUN: 1.5,
  MISSILE: 3.0,
  FLARE: 2.5,
  ROCKET: 3.5
});
const MAX_DISTANCE_SQ = 180 * 180;
const _dir = new THREE.Vector3();

export class ParticleSystem {
  constructor(scene, palette = null) {
    this.scene = scene;
    this.palette = palette;
    this.pool = [];
    this.activeBolts = [];
    this.engineTrail = this.createEngineTrail();
    this._buildBoltPool(DEFAULT_POOL_SIZE);
    this._onFire = (event) => {
      const d = event?.detail || {};
      if (d.position && d.direction) this.spawnBolt(d.type, d.position, d.direction);
    };
    window.addEventListener('ship:fire', this._onFire);
  }

  _buildBoltPool(count) {
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
      geometry.rotateX(Math.PI / 2);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        toneMapped: false,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const bolt = new THREE.Mesh(geometry, material);
      bolt.visible = false;
      bolt.userData.velocity = new THREE.Vector3();
      bolt.userData.life = 0;
      this.scene.add(bolt);
      this.pool.push(bolt);
    }
  }

  spawnBolt(type, position, direction) {
    const bolt = this.pool.pop();
    if (!bolt || !position || !direction) return null;

    bolt.material.color.setHex(WEAPON_COLORS[type] || 0xffffff);
    bolt.position.copy(position);
    _dir.copy(direction).normalize();
    bolt.userData.velocity.copy(_dir).multiplyScalar(this._speedFor(type));
    bolt.userData.life = WEAPON_LIFETIME[type] || 2.0;
    bolt.userData.maxLife = bolt.userData.life;
    bolt.material.opacity = 1;
    bolt.userData.type = type;
    bolt.visible = true;
    this.activeBolts.push(bolt);
    return bolt;
  }

  _speedFor(type) {
    if (type === 'MACHINE_GUN') return 55;
    if (type === 'MISSILE') return 28;
    if (type === 'FLARE') return 20;
    if (type === 'ROCKET') return 32;
    return 40;
  }

  _releaseBolt(index) {
    const bolt = this.activeBolts[index];
    bolt.visible = false;
    bolt.userData.life = 0;
    bolt.material.opacity = 1;
    this.activeBolts.splice(index, 1);
    this.pool.push(bolt);
  }

  createEngineTrail() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_COUNT * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: this.palette?.engine ?? 0xff6a00,
      size: 0.16,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    const trail = new THREE.Points(geometry, material);
    trail.frustumCulled = false;
    trail.visible = false;
    this.scene.add(trail);
    return trail;
  }

  setPalette(palette) {
    this.palette = palette;
    if (this.engineTrail?.material) {
      this.engineTrail.material.color.setHex(palette?.engine ?? 0xff6a00);
    }
  }

  _updateTrail(shipPosition) {
    if (!shipPosition || !this.engineTrail) return;
    const attr = this.engineTrail.geometry.attributes.position;
    for (let i = attr.count - 1; i > 0; i--) {
      attr.setXYZ(i, attr.getX(i - 1), attr.getY(i - 1), attr.getZ(i - 1));
    }
    attr.setXYZ(0, shipPosition.x, shipPosition.y, shipPosition.z + 1.15);
    attr.needsUpdate = true;
    this.engineTrail.visible = true;
  }

  update(delta, shipPosition) {
    const dt = Math.min(Math.max(Number(delta) || 0, 0), 0.05);
    for (let i = this.activeBolts.length - 1; i >= 0; i--) {
      const bolt = this.activeBolts[i];
      bolt.position.addScaledVector(bolt.userData.velocity, dt);
      bolt.userData.life -= dt;
      if (bolt.userData.life < 0.3) {
        bolt.material.opacity = Math.max(0, bolt.userData.life / 0.3);
      }
      const tooFar = shipPosition
        ? bolt.position.distanceToSquared(shipPosition) > MAX_DISTANCE_SQ
        : false;
      if (bolt.userData.life <= 0 || tooFar) this._releaseBolt(i);
    }
    this._updateTrail(shipPosition);
  }

  dispose() {
    window.removeEventListener('ship:fire', this._onFire);
    for (const bolt of [...this.activeBolts, ...this.pool]) {
      this.scene.remove(bolt);
      bolt.geometry.dispose();
      bolt.material.dispose();
    }
    this.activeBolts.length = 0;
    this.pool.length = 0;
    if (this.engineTrail) {
      this.scene.remove(this.engineTrail);
      this.engineTrail.geometry.dispose();
      this.engineTrail.material.dispose();
      this.engineTrail = null;
    }
  }
}
