"""Android-only pedagogical sequence and accessible visual layout; run after all other HTML patches."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
web=root/'www/index.html'
s=web.read_text(encoding='utf-8')
old="function pick(){if(mode==='evaluation'){if(evalPlan.length!==10)prepareEvaluation();return banks[evalPlan[evalCount]];}if(used.length===banks.length)used=[];let n;do{n=rand(banks.length)}while(used.includes(n));used.push(n);return banks[n]}"
assert s.count(old)==1, 'Question selection changed; inspect before modifying'
new="""const introductoryPlan=[0,1,2,3,4,15,5,6,7,8];
function pick(){
 if(mode==='evaluation'){if(evalPlan.length!==10)prepareEvaluation();return banks[evalPlan[evalCount]];}
 if(count<10){const n=introductoryPlan[count];if(!used.includes(n))used.push(n);return banks[n];}
 if(used.length===banks.length)used=[];
 let n;do{n=rand(banks.length)}while(used.includes(n));used.push(n);return banks[n];
}"""
s=s.replace(old,new,1)
assert '</style>' in s, 'No CSS style block found'
css='''
/* Android: visual-first, touch-friendly 7-year-old interface. */
@media (orientation:landscape){
 .layout{grid-template-columns:minmax(0,35fr) minmax(0,65fr)!important;gap:5px!important;min-height:0!important}
 .world,.panel{min-width:0!important;min-height:0!important;overflow:hidden!important}
 .panel{display:flex!important;flex-direction:column!important;padding:4px!important;gap:3px!important}
 .panel h2{font-size:clamp(12px,1.7vw,21px)!important;line-height:1.12!important;margin:0!important;flex:0 0 auto!important}
 .answers{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:repeat(2,minmax(0,1fr))!important;gap:6px!important;min-width:0!important;min-height:0!important;flex:1 1 auto!important;overflow:hidden!important;align-content:stretch!important}
 .answers button,.answers button.visual-option{box-sizing:border-box!important;position:relative!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-height:100%!important;overflow:hidden!important;padding:3px!important;touch-action:manipulation!important;white-space:normal!important;font-size:clamp(12px,1.5vw,20px)!important}
 .answers .set-figure{position:static!important;transform:none!important;box-sizing:border-box!important;display:flex!important;flex-wrap:wrap!important;align-content:center!important;align-items:center!important;justify-content:center!important;gap:2px!important;width:calc(100% - 12px)!important;height:calc(100% - 4px)!important;min-width:0!important;min-height:0!important;max-width:100%!important;max-height:100%!important;padding:2px 5px!important;border-width:2px!important;border-radius:24px!important;overflow:hidden!important;box-shadow:none!important}
 .answers .set-figure .object{font-size:clamp(17px,2.5vw,32px)!important;line-height:1!important;flex:0 1 auto!important}
 .answers .set-figure .more{font-size:clamp(11px,1.7vw,20px)!important;line-height:1!important}
 .answers .visual-label{position:absolute!important;left:3px!important;top:3px!important;transform:none!important;margin:0!important;z-index:2!important;background:#fff!important;color:#25135d!important;border-radius:50%!important;min-width:23px!important;min-height:23px!important;display:grid!important;place-items:center!important}
 .feedback{flex:0 0 auto!important;max-height:16%!important;min-height:20px!important;overflow:auto!important;font-size:clamp(10px,1.15vw,14px)!important;padding:2px!important}
 .next{flex:0 0 auto!important;min-height:30px!important;padding:3px!important}
}
'''
s=s.replace('</style>',css+'</style>',1)
assert 'const introductoryPlan=[0,1,2,3,4,15,5,6,7,8]' in s
assert 'grid-template-columns:repeat(2,minmax(0,1fr))' in s
web.write_text(s,encoding='utf-8')
packaged=root/'android/app/src/main/assets/public/index.html'
assert packaged.is_file(), 'Packaged Android assets missing'
shutil.copyfile(web,packaged)
p=packaged.read_text(encoding='utf-8')
assert 'const introductoryPlan=[0,1,2,3,4,15,5,6,7,8]' in p
assert 'Se necesita audio' not in p
print('Verified: introductory sequence and visual 2x2 answer layout packaged')
