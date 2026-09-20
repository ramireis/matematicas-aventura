from pathlib import Path
p=Path(__file__).with_name('index.html')
s=p.read_text(encoding='utf-8')
old="const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};document.querySelectorAll('[data-dir]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();let d=dirs[b.dataset.dir];move(...d)})});window.addEventListener('keydown',e=>{let d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];if(d){e.preventDefault();move(...dirs[d])}});"
new="const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};/* Lumi recorre el laberinto automaticamente; ninguna tecla intercepta la escritura del estudiante. */"
if old not in s: raise SystemExit('ERROR: keyboard handler not found; no changes made')
s=s.replace(old,new,1)
s=s.replace('function move(dx,dy){if(paused||!running||travel.length)return;autoWalk=false;', 'function move(dx,dy){if(paused||!running||travel.length)return;',1)
s=s.replace('El lector de Windows leerá las instrucciones, preguntas, respuestas y explicaciones. Comprueba el volumen de tu equipo. Usa las flechas del teclado o los botones.', 'La aplicación narrará las instrucciones, preguntas, respuestas y explicaciones. Comprueba el volumen de tu equipo. Lumi se mueve de forma autónoma.',1)
s=s.replace('<div class="controls"><button data-dir="up" aria-label="Arriba">▲</button><button data-dir="left" aria-label="Izquierda">◀</button><button data-dir="down" aria-label="Abajo">▼</button><button data-dir="right" aria-label="Derecha">▶</button></div>', '',1)
s=s.replace('<button id="auto">👣 Avanzar al portal</button>', '',1)
s=s.replace('<button id="pause">⏸ Pausar movimiento</button>', '',1)
# Preserve internal navigation logic, but prevent any UI from turning off automatic movement.
s=s.replace("$('auto').onclick=", "$('auto')?.onclick=",1) if False else s
# Remove references to deleted buttons safely by hiding instead of removing them from DOM.
# Restore hidden controls for existing event bindings, but keep them inaccessible to children.
s=s.replace('<div class="worldfoot">', '<div class="controls" hidden aria-hidden="true"><button data-dir="up">▲</button><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div><div class="worldfoot"><button id="auto" hidden>Auto</button><button id="pause" hidden>Pausa</button>',1)
# Ensure automatic walking stays active regardless of obsolete click handlers.
s=s.replace('autoWalk=false;', 'autoWalk=true;')
p.write_text(s,encoding='utf-8')
print('Keyboard interception removed; hidden manual controls; autonomous walking enabled')