"""Add an Android-only exit button to the generated Capacitor application."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
html = root / 'www/index.html'
java = root / 'android/app/src/main/java/ec/edu/edufusion/lumi/MainActivity.java'
packaged = root / 'android/app/src/main/assets/public/index.html'
s = html.read_text(encoding='utf-8')
assert '</body>' in s and 'id="lumiExitButton"' not in s
# Position the control independently from the game's responsive grid.
addition = '''
<style>
#lumiExitButton{position:fixed;right:10px;top:8px;z-index:2147483646;background:#a32442;color:white;border:2px solid #fff;border-radius:12px;padding:8px 14px;font:700 16px system-ui,sans-serif;min-height:42px;min-width:90px;cursor:pointer;box-shadow:0 2px 8px #0008}
#lumiExitButton:focus-visible{outline:3px solid #ffd500}
</style>
<button type="button" id="lumiExitButton" aria-label="Salir del juego">✕ Salir</button>
<script>
(function(){
  var exitButton=document.getElementById('lumiExitButton');
  exitButton.addEventListener('click',function(){
    if(!window.confirm('¿Deseas salir de Lumi EDUFUSIÓN?'))return;
    try{if(window.AndroidSpeech&&window.AndroidSpeech.stop)window.AndroidSpeech.stop();}catch(e){}
    if(window.AndroidExit&&window.AndroidExit.exit){window.AndroidExit.exit();return;}
    // Browser preview: do not pretend that closing a browser tab is supported.
    window.alert('Para salir, cierra esta pestaña.');
  });
})();
</script>
'''
s=s.replace('</body>',addition+'</body>',1)
html.write_text(s,encoding='utf-8')
assert java.is_file()
j=java.read_text(encoding='utf-8')
needle='  voice=new TextToSpeech(getApplicationContext(),status->runOnUiThread(()->{'
assert j.count(needle)==1, 'Native voice initialization changed; review exit patch'
j=j.replace(needle,'''  getBridge().getWebView().addJavascriptInterface(new Object(){
   @JavascriptInterface public void exit(){runOnUiThread(()->finishAffinity());}
  },"AndroidExit");
'''+needle,1)
java.write_text(j,encoding='utf-8')
assert packaged.is_file()
shutil.copyfile(html,packaged)
assert 'id="lumiExitButton"' in packaged.read_text(encoding='utf-8')
assert '"AndroidExit"' in java.read_text(encoding='utf-8')
print('Verified: visible confirmed exit button and native Android exit bridge included in packaged assets')
