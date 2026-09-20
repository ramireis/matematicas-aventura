"""Patch only generated Android assets; leave Windows source untouched."""
from pathlib import Path

root = Path(__file__).resolve().parent
html = root / 'www/index.html'
s = html.read_text(encoding='utf-8')
needle = 'function speak(t){'
assert s.count(needle) == 1, 'Speech function changed: refusing unsafe patch'
s = s.replace(needle, '''function speak(t){
  // Android: device TextToSpeech, independent of Edge and browser voices.
  if(window.AndroidSpeech){
    const msg=String(t);
    $('feedback').setAttribute('aria-label',msg);
    if(!soundOn){window.AndroidSpeech.stop();return;}
    $('voiceStatus').textContent='🔊 Voz de Android · español';
    window.AndroidSpeech.speak(msg);
    return;
  }
''', 1)
# The browser speech API may be unavailable in Android WebView: it must never block play.
gate="if(!speechAvailable){$('voiceStatus').textContent='🔇 Necesitas Microsoft Edge con lector de voz activado.';alert('Para jugar necesitas activar el lector de voz de Windows en Microsoft Edge.');return;}"
assert s.count(gate) == 1, 'Windows/Edge startup gate not found; refusing unsafe patch'
s = s.replace(gate, '', 1)
s = s.replace('Prueba Microsoft Edge.', 'Revisa el motor de voz de Android.')
# Do not assume WebView implements the browser speech synthesis API.
s = s.replace('speechRequest++;window.speechSynthesis.cancel();', 'speechRequest++;if(window.speechSynthesis)window.speechSynthesis.cancel();')
assert 'Para jugar necesitas activar el lector de voz de Windows en Microsoft Edge.' not in s
html.write_text(s, encoding='utf-8')

java = root / 'android/app/src/main/java/ec/edu/edufusion/lumi/MainActivity.java'
assert java.is_file(), 'Capacitor Android project missing'
java.write_text('''package ec.edu.edufusion.lumi;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import java.util.Locale;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private TextToSpeech voice;
    private boolean ready = false;
    private String pending;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getBridge().getWebView().addJavascriptInterface(new Object() {
            @JavascriptInterface public void speak(String text) {
                runOnUiThread(() -> say(text));
            }
            @JavascriptInterface public void stop() {
                runOnUiThread(() -> { pending = null; if (voice != null) voice.stop(); });
            }
        }, "AndroidSpeech");
        voice = new TextToSpeech(getApplicationContext(), status -> runOnUiThread(() -> {
            if (status != TextToSpeech.SUCCESS || voice == null) return;
            int result = voice.setLanguage(Locale.forLanguageTag("es-MX"));
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED)
                result = voice.setLanguage(new Locale("es"));
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) return;
            voice.setSpeechRate(0.88f);
            voice.setPitch(1.04f);
            ready = true;
            if (pending != null) { String text = pending; pending = null; say(text); }
        }));
    }

    private void say(String text) {
        if (text == null || text.trim().isEmpty()) return;
        if (!ready || voice == null) { pending = text; return; }
        voice.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lumi-voice");
    }

    @Override public void onDestroy() {
        if (voice != null) { voice.stop(); voice.shutdown(); voice = null; }
        super.onDestroy();
    }
}
''', encoding='utf-8')
print('Android native voice installed; Edge startup block removed')
