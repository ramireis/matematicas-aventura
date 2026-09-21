"""Repair answer-card sizing in the actual packaged Android HTML."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
web=root/'www/index.html'
html=web.read_text(encoding='utf-8')
assert '.answers button.visual-option' in html, 'Visual answer selector missing'
assert html.count('</style>')==1
css='''
/* Android landscape: readable, independently clickable visual answer cards. */
@media (orientation:landscape) {
 .layout{grid-template-columns:minmax(0,42fr) minmax(0,58fr)!important;gap:8px!important}
 .panel{min-width:0!important;overflow:hidden;padding:clamp(5px,.7vw,10px)!important;gap:3px!important}
 .panel h2{font-size:clamp(13px,1.5vw,20px)!important;line-height:1.1!important;flex-shrink:0}
 .answers{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:repeat(4,minmax(0,1fr))!important;gap:5px!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden}
 .answers button{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;min-height:0!important;min-width:0!important;overflow:hidden!important;padding:1px 8px!important;touch-action:manipulation!important;isolation:isolate}
 .answers button.visual-option{display:flex!important;align-items:center!important;justify-content:center!important}
 .answers .set-figure{position:static!important;transform:none!important;display:flex!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:center!important;gap:clamp(3px,.5vw,8px)!important;min-width:0!important;min-height:0!important;width:auto!important;max-width:calc(100% - 28px)!important;height:calc(100% - 4px)!important;max-height:100%!important;padding:0 12px!important;border-width:2px!important;border-radius:999px!important;box-shadow:none!important;overflow:hidden!important}
 .answers .set-figure .object{font-size:clamp(17px,2.3vw,31px)!important;line-height:1!important;flex-shrink:1!important}
 .answers .set-figure .more{font-size:clamp(13px,1.6vw,22px)!important}
 .visual-label{position:absolute!important;left:10px!important;top:50%!important;transform:translateY(-50%)!important;margin:0!important;z-index:1}
 .feedback{flex-shrink:0!important;max-height:17%!important;min-height:26px!important;overflow:auto!important;font-size:clamp(10px,1.05vw,14px)!important;padding:3px 7px!important}
 .next{flex-shrink:0!important;padding:5px!important;font-size:clamp(11px,1.2vw,16px)!important}
 .world .mini{width:clamp(65px,15%,115px)!important;height:clamp(65px,20%,105px)!important}
}
'''
html=html.replace('</style>',css+'</style>',1)
web.write_text(html,encoding='utf-8')
packaged=root/'android/app/src/main/assets/public/index.html'
assert packaged.is_file(), 'Android packaged assets not generated'
shutil.copyfile(web,packaged)
check=packaged.read_text(encoding='utf-8')
assert 'grid-template-columns:minmax(0,42fr) minmax(0,58fr)' in check
assert '.answers .set-figure{position:static!important' in check
print('Verified: Android packaged HTML has 42/58 layout and non-overlapping answer cards')
