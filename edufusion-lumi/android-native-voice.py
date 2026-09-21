"""Patch Android-only Capacitor assets, native voice, and landscape orientation."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
html = root / 'www/index.html'
s = html.read_text(encoding='utf-8')
needle = 'function speak(t){'
assert s.count(needle) == 1, 'Speech function changed'
s = s.replace(needle, '''function speak(t){
  if(window.AndroidSpeech){
    const msg=String(t);
    $('feedback').setAttribute('aria-label',msg);
    if(!audioEnabled){window.AndroidSpeech.stop();return;}
    $('voiceStatus').textContent='🔊 Voz de Android · español';
    window.AndroidSpeech.speak(msg);
    return;
  }
''', 1)
startup = "if(!speechAvailable){$('voiceStatus').textContent='🔇 Necesitas Microsoft Edge con lector de voz activado.';alert('Para jugar necesitas activar el lector de voz de Windows en Microsoft Edge.');return;}"
assert s.count(startup) == 1, 'Startup audio gate changed'
s = s.replace(startup, '', 1)
start = s.index('function nextQuestion(){')
end = s.index('answered=false;', start)
question_prefix = s[start:end]
assert 'Se necesita audio' in question_prefix and 'Microsoft Edge' in question_prefix, 'Question gate changed'
s = s[:start] + 'function nextQuestion(){' + s[end:]
# Android native speech is not the browser speechSynthesis API. Never call browser
# voice selection when only AndroidSpeech exists: that crashed script evaluation
# before the Start button click handler could be installed.
s = s.replace("let speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;", "let speechAvailable = !!window.AndroidSpeech || ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);", 1)
s = s.replace('if(speechAvailable){\n  chooseSpanishVoice();\n  window.speechSynthesis.addEventListener?.(\'voiceschanged\',chooseSpanishVoice);\n}', "if(window.speechSynthesis && window.SpeechSynthesisUtterance){\n  chooseSpanishVoice();\n  window.speechSynthesis.addEventListener?.('voiceschanged',chooseSpanishVoice);\n}", 1)
assert "if(window.speechSynthesis && window.SpeechSynthesisUtterance){" in s, 'Browser speech startup guard not applied'
s = s.replace('speechRequest++;window.speechSynthesis.cancel();', 'speechRequest++;if(window.speechSynthesis)window.speechSynthesis.cancel();')
s = s.replace('Prueba Microsoft Edge.', 'Revisa el motor de voz de Android.')
# Make the welcome screen short and readable on a landscape phone.
s = s.replace('<p>¡Lumi y su perrito están dentro del laberinto! Sigue sus movimientos mientras resuelves los retos.</p><p>Ayuda a Lumi a recorrer el laberinto. Cada acierto regala una estrella y Lumi avanza ocho pasos. Cada error la hace retroceder cuatro pasos con una explicación. ¡Una mascota puede acompañarte!</p><p>La aplicación narrará las instrucciones, preguntas, respuestas y explicaciones. Comprueba el volumen de tu equipo. Lumi se mueve de forma autónoma. Responde 10 retos y supera una evaluación de 10 preguntas con 7 aciertos.</p>', '<p>Escucha la pregunta y toca una respuesta. Lumi avanza con tus aciertos.</p>', 1)
s = s.replace('🎮 ¡Comenzar aventura!', '▶ JUGAR', 1)
assert 'Se necesita audio' not in s and 'Para jugar necesitas activar el lector de voz de Windows en Microsoft Edge.' not in s
html.write_text(s, encoding='utf-8')

java = root / 'android/app/src/main/java/ec/edu/edufusion/lumi/MainActivity.java'
assert java.is_file(), 'Capacitor Android project missing'
java.write_text('''package ec.edu.edufusion.lumi;
import android.os.Bundle;
import android.content.pm.ActivityInfo;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import java.util.Locale;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
 private TextToSpeech voice;
 private boolean ready=false;
 private String pending;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
  getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  getBridge().getWebView().addJavascriptInterface(new Object(){
   @JavascriptInterface public void speak(String text){runOnUiThread(()->say(text));}
   @JavascriptInterface public void stop(){runOnUiThread(()->{pending=null;if(voice!=null)voice.stop();});}
  },"AndroidSpeech");
  voice=new TextToSpeech(getApplicationContext(),status->runOnUiThread(()->{
   if(status!=TextToSpeech.SUCCESS||voice==null)return;
   int result=voice.setLanguage(Locale.forLanguageTag("es-MX"));
   if(result==TextToSpeech.LANG_MISSING_DATA||result==TextToSpeech.LANG_NOT_SUPPORTED)result=voice.setLanguage(new Locale("es"));
   if(result==TextToSpeech.LANG_MISSING_DATA||result==TextToSpeech.LANG_NOT_SUPPORTED)return;
   voice.setSpeechRate(0.88f);voice.setPitch(1.04f);ready=true;
   if(pending!=null){String text=pending;pending=null;say(text);}
  }));
 }
 private void say(String text){if(text==null||text.trim().isEmpty())return;if(!ready||voice==null){pending=text;return;}voice.speak(text,TextToSpeech.QUEUE_FLUSH,null,"lumi-voice");}
 @Override public void onDestroy(){if(voice!=null){voice.stop();voice.shutdown();voice=null;}super.onDestroy();}
}
''', encoding='utf-8')
manifest = root / 'android/app/src/main/AndroidManifest.xml'
m = manifest.read_text(encoding='utf-8')
assert 'android:name=".MainActivity"' in m, 'MainActivity manifest declaration changed'
m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity" android:screenOrientation="sensorLandscape"', 1)
manifest.write_text(m, encoding='utf-8')
packaged = root / 'android/app/src/main/assets/public/index.html'
assert packaged.is_file(), 'Packaged assets missing'
shutil.copyfile(html, packaged)
p = packaged.read_text(encoding='utf-8')
assert 'Se necesita audio' not in p and 'Microsoft Edge y activa una voz' not in p
assert 'window.AndroidSpeech.speak(msg)' in p and 'if(!soundOn)' not in p
assert "if(window.speechSynthesis && window.SpeechSynthesisUtterance){" in p
assert 'android:screenOrientation="sensorLandscape"' in manifest.read_text(encoding='utf-8')
print('Verified: Android start handler safe without browser speech, no Windows audio gate, native voice and landscape')
