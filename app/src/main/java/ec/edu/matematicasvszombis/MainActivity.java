package ec.edu.matematicasvszombis;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public final class MainActivity extends Activity {
    private WebView game;

    @SuppressLint("SetJavaScriptEnabled")
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(3, 10, 18));
        // Dejar que Android elija la capa evita cierres en GPU antiguas.
        game.setLayerType(View.LAYER_TYPE_NONE, null);
        WebSettings s = game.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        game.setWebViewClient(new WebViewClient());
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage m) { return true; }
        });
        game.setOverScrollMode(View.OVER_SCROLL_NEVER);
        game.setVerticalScrollBarEnabled(false);
        game.setHorizontalScrollBarEnabled(false);
        setContentView(game);
        game.postDelayed(this::enterImmersive, 250);
        if (state == null) game.loadUrl("file:///android_asset/index.html");
        else game.restoreState(state);
    }

    private void enterImmersive() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override protected void onSaveInstanceState(Bundle out) {
        game.saveState(out);
        super.onSaveInstanceState(out);
    }

    @Override public void onBackPressed() {
        if (game.canGoBack()) game.goBack();
        else new AlertDialog.Builder(this).setTitle("Salir del juego")
            .setMessage("Tu progreso guardado se conservará. ¿Deseas salir?")
            .setNegativeButton("Continuar jugando", null)
            .setPositiveButton("Salir", (d, w) -> finish()).show();
    }

    @Override protected void onPause() { game.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); game.onResume(); }
    @Override protected void onDestroy() { game.destroy(); super.onDestroy(); }
}
