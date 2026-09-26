import * as THREE from '../../../www/vendor/three.module.js';

/**
 * Iluminación ligera por mundo, pensada para equipos escolares.
 * No activa sombras en tiempo real.
 */
export function setupDramaticLighting(scene, palette) {
  const group = new THREE.Group();
  group.name = 'WorldLighting';

  const ambient = new THREE.AmbientLight(0x111122, 0.4);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(20, 30, 15);
  keyLight.castShadow = false;

  const rimLight = new THREE.DirectionalLight(palette.primary, 1.5);
  rimLight.position.set(-15, 5, -20);
  rimLight.castShadow = false;

  group.add(ambient, keyLight, rimLight);
  scene.add(group);
  scene.fog = new THREE.FogExp2(palette.fog, 0.008);

  return {
    group, ambient, keyLight, rimLight,
    dispose() {
      scene.remove(group);
      if (scene.fog instanceof THREE.FogExp2) scene.fog = null;
    }
  };
}
