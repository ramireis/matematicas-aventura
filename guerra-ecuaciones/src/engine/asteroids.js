import * as THREE from '../../www/vendor/three.module.js';

const _vertex = new THREE.Vector3();

function deformSphere(geometry, intensity = 0.35) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    _vertex.fromBufferAttribute(pos, i);
    const noise = (Math.random() - 0.5) * intensity;
    _vertex.multiplyScalar(1 + noise);
    pos.setXYZ(i, _vertex.x, _vertex.y, _vertex.z);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

export function createAsteroid(scale = 1, palette = null) {
  // detail=1 es deliberadamente ligero; la deformación aporta silueta irregular.
  const geometry = new THREE.IcosahedronGeometry(scale, 1);
  deformSphere(geometry, 0.4);

  const material = new THREE.MeshStandardMaterial({
    color: 0x4a4238,
    roughness: 0.95,
    metalness: 0.15,
    flatShading: true
  });

  if (palette) {
    material.emissive.setHex(palette.secondary);
    material.emissiveIntensity = 0.15;
  }

  const asteroid = new THREE.Mesh(geometry, material);
  asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  asteroid.userData.rotSpeed = (Math.random() - 0.5) * 1.2; // rad/s
  asteroid.userData.dispose = () => {
    geometry.dispose();
    material.dispose();
  };
  return asteroid;
}

export function updateAsteroid(asteroid, delta) {
  if (!asteroid) return;
  const dt = Math.min(Math.max(Number(delta) || 0, 0), 0.05);
  const speed = asteroid.userData.rotSpeed || 0;
  asteroid.rotation.x += speed * dt;
  asteroid.rotation.y += speed * 0.6 * dt;
}
