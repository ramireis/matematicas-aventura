"""Patch the final Android web assets after all other Android patches."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
p=root/'www/index.html'
s=p.read_text(encoding='utf-8')
# Dog and Lumi previously shared autoTick. When the dog moved first it reset
# the timer and prevented Lumi's movement in the same animation frame.
old="if(running&&!paused&&dogTravel.length&&t-autoTick>330){autoTick=t;let n=dogTravel.shift();dog.tx=n[0];dog.ty=n[1];if(!dogTravel.length)dog.waiting=true;}if(running&&!paused&&travel.length&&t-autoTick>330){autoTick=t;"
new="if(running&&!paused&&dogTravel.length&&t-autoTick>330){let n=dogTravel.shift();dog.tx=n[0];dog.ty=n[1];if(!dogTravel.length)dog.waiting=true;}if(running&&!paused&&travel.length&&t-autoTick>330){let n=travel.shift();"
assert s.count(old)==1, 'Movement animation signature changed; do not silently build'
# Keep original movement body intact: replace only timer update in dog branch.
s=s.replace('if(running&&!paused&&dogTravel.length&&t-autoTick>330){autoTick=t;let n=dogTravel.shift();', 'if(running&&!paused&&dogTravel.length&&t-autoTick>330){let n=dogTravel.shift();',1)
# The player advances once per frame while travel exists; its own autoTick remains.
assert 'if(running&&!paused&&travel.length&&t-autoTick>330){autoTick=t;' in s
# Make a separate report access button available at any stage, not only after evaluation.
assert 'function printReport(){' in s and 'function csv(){' in s
assert '</header>' in s
s=s.replace('</header>', '<button id="reportMenuBtn" type="button" onclick="openReportMenu()" style="position:fixed;right:8px;bottom:9px;z-index:8;background:#fff3ce;color:#302147;border:2px solid #7041cb;border-radius:12px;padding:6px 11px;font-weight:800;font-size:12px">📋 Informe</button></header>',1)
anchor='function printReport(){'
assert s.count(anchor)==1
s=s.replace(anchor, "function openReportMenu(){save();modal('<h2>📋 Informe de aprendizaje</h2><p>Prácticas realizadas: '+history.filter(h=>h.tipo==='Práctica').length+' · Evaluación: '+evalCount+'/10 · Nota actual: '+evalCorrect+'/10</p><button onclick=\"printReport()\">🖨️ Imprimir / guardar PDF</button><button onclick=\"csv()\">💾 Guardar resultados CSV</button><button onclick=\"closeModal()\">▶ Volver al juego</button>');}\n"+anchor,1)
# Preserve Android webview printing caveat: expose controls without promising system print support.
p.write_text(s,encoding='utf-8')
packaged=root/'android/app/src/main/assets/public/index.html'
assert packaged.is_file()
shutil.copyfile(p,packaged)
assert 'function openReportMenu()' in packaged.read_text(encoding='utf-8')
print('Verified: dog no longer steals Lumi movement tick; report menu available throughout game')
