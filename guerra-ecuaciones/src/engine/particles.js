import * as THREE from '../../www/vendor/three.module.js';

export const WEAPON_COLORS = Object.freeze({
  CANNON: 0x00ffff,
  MACHINE_GUN: 0xffff00,
  MISSILE: 0xff3300,
  FLARE: 0xffffff,
  ROCKET: 0xff9900
});

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.bolts = [];
    this.engineTrail = this.createEngineTrail();
  }

  spawnBolt(type, position, direction) {
    const color = WEAPON_COLORS[type] || 0xffffff;
    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const bolt = new THREE.Mesh(geometry, material);
    bolt.position.copy(position);
    bolt.userData.velocity = direction.clone().normalize().multiplyScalar(40);
    bolt.userData.life = 2.5;
    this.scene.add(bolt);
    this.bolts.push(bolt);
    return bolt;
  }

  createEngineTrail() {
    const count = 60;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff6a00,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      toneMapped: false
    });
    const trail = new THREE.Points(geometry, material);
    trail.frustumCulled = false;
    trail.visible = false;
    this.scene.add(trail);
    return trail;
  }

  setEngineColor(color) {
    if (this.engineTrail?.material) this.engineTrail.material.color.setHex(color);
  }

  updateEngineTrail(shipPosition, direction = new THREE.Vector3(0, 0, 1)) {
    if (!this.engineTrail || !shipPosition) return;
    const attr = this.engineTrail.geometry.attributes.position;
    const dir = direction.clone().normalize();
    for (let i = attr.count - 1; i > 0; i--) {
      attr.setXYZ(i, attr.getX(i - 1), attr.getY(i - 1), attr.getZ(i - 1));
    }
    attr.setXYZ(0,
      shipPosition.x - dir.x * 1.2,
      shipPosition.y - dir.y * 1.2,
      shipPosition.z - dir.z * 1.2
    );
    attr.needsUpdate = true;
    this.engineTrail.visible = true;
  }

  update(delta) {
    const dt = Math.min(Math.max(Number(delta) || 0, 0), 0.05);
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const bolt = this.bolts[i];
      bolt.position.addScaledVector(bolt.userData.velocity, dt);
      bolt.userData.life -= dt;
      if (bolt.userData.life <= 0) {
        this.scene.remove(bolt);
        bolt.geometry.dispose();
        bolt.material.dispose();
        this.bolts.splice(i, 1);
      }
    }
  }

  dispose() {
    for (const bolt of this.bolts) {
      this.scene.remove(bolt);
      bolt.geometry.dispose();
      bolt.material.dispose();
    }
    this.bolts.length = 0;
    if (this.engineTrail) {
      this.scene.remove(this.engineTrail);
      this.engineTrail.geometry.dispose();
      this.engineTrail.material.dispose();
      this.engineTrail = null;
    }
  }
}
