// Paletas visuales centralizadas por mundo.
// Mantiene separados los colores del contenido pedagógico y la lógica del juego.
export const WORLD_PALETTES = Object.freeze({
  world1: Object.freeze({ primary: 0x00e5ff, secondary: 0x0066ff, engine: 0xff6a00, fog: 0x020210 }),
  world2: Object.freeze({ primary: 0xff3366, secondary: 0xff8800, engine: 0xffaa00, fog: 0x1a0505 }),
  world3: Object.freeze({ primary: 0x0077ff, secondary: 0x00ffee, engine: 0x00e5ff, fog: 0x00101a }),
  world4: Object.freeze({ primary: 0xff4500, secondary: 0xffd700, engine: 0xff2200, fog: 0x1a0a00 }),
  world5: Object.freeze({ primary: 0x9d00ff, secondary: 0x5500ff, engine: 0xcc00ff, fog: 0x0a0014 }),
  world6: Object.freeze({ primary: 0xffe600, secondary: 0xffffff, engine: 0x00ffcc, fog: 0x0a0a1a })
});

export function getPalette(worldId) {
  const key = typeof worldId === 'number' ? `world${worldId}` : String(worldId || '').toLowerCase();
  return WORLD_PALETTES[key] || WORLD_PALETTES.world1;
}
