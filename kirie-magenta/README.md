# Kirie + Magenta — Audio Core

Módulo independiente para música adaptativa en LUISA (Godot 4) y Guerra de Ecuaciones 3D (Electron/Three.js).

**Estado:** adaptadores funcionales de selección musical local. No ejecuta Magenta ni incluye música generada por Magenta.

## Uso
1. Exportar legalmente pistas musicales desde Google Magenta en formato OGG (o convertirlas a OGG).
2. Colocar archivos con los nombres `exploracion.ogg`, `combate.ogg`, `evaluacion.ogg`, `victoria.ogg` en la carpeta de audio del juego.
3. En Godot, añadir `godot/KirieAudio.gd` como Autoload llamado `KirieAudio`; copiar los archivos a `res://audio/`.
4. En Electron, copiar `electron/kirie-audio.js` al frontend, importar `KirieAudio` y configurar rutas relativas de audio.
5. Emitir eventos: `exploracion`, `combate`, `evaluacion`, `victoria`; activar `set_narration(true)` o `setNarration(true)` mientras habla el narrador.

**Seguridad:** no usar claves API en el frontend. Las pistas deben incluirse en la distribución para funcionar offline. Los navegadores pueden requerir un primer clic para permitir reproducción.
