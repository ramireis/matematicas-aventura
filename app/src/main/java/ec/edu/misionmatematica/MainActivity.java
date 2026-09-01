package ec.edu.misionmatematica;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView webView;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(23,53,109));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout bar = new LinearLayout(this);
        bar.setGravity(android.view.Gravity.CENTER);
        bar.setPadding(4,4,4,4);
        bar.setBackgroundColor(Color.rgb(23,53,109));
        bar.addView(button("🏠 Inicio", v -> open("index.html")));
        bar.addView(button("📊 Docente", v -> open("docente.html")));
        bar.addView(button("↗ Compartir", v -> shareApp()));
        root.addView(bar, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(52)));

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u=req.getUrl();
                if ("file".equals(u.getScheme())) return false;
                startActivity(new Intent(Intent.ACTION_VIEW,u));
                return true;
            }
        });
        root.addView(webView, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,0,1));
        setContentView(root);
        open("index.html");
    }

    private Button button(String text, View.OnClickListener listener) {
        Button b=new Button(this); b.setText(text); b.setTextColor(Color.WHITE);
        b.setTextSize(12); b.setAllCaps(false); b.setBackgroundColor(Color.TRANSPARENT);
        b.setOnClickListener(listener);
        b.setLayoutParams(new LinearLayout.LayoutParams(0,ViewGroup.LayoutParams.MATCH_PARENT,1));
        return b;
    }

    private void open(String file) { webView.loadUrl("file:///android_asset/"+file); }

    private void shareApp() {
        Intent i=new Intent(Intent.ACTION_SEND); i.setType("text/plain");
        i.putExtra(Intent.EXTRA_TEXT,"Estoy practicando matemáticas con Misión Matemática ABJ.");
        startActivity(Intent.createChooser(i,"Compartir"));
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    private int dp(int n){ return (int)(n*getResources().getDisplayMetrics().density+0.5f); }

    public class AndroidBridge {
        @JavascriptInterface public void saveBase64(String base64, String name, String mime) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes=Base64.decode(base64,Base64.DEFAULT);
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues v=new ContentValues(); v.put(MediaStore.Downloads.DISPLAY_NAME,name);
                        v.put(MediaStore.Downloads.MIME_TYPE,mime);
                        v.put(MediaStore.Downloads.IS_PENDING,1);
                        Uri uri=getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI,v);
                        if(uri==null) throw new IllegalStateException("No se pudo crear el archivo");
                        try(OutputStream out=getContentResolver().openOutputStream(uri)){ out.write(bytes); }
                        v.clear(); v.put(MediaStore.Downloads.IS_PENDING,0); getContentResolver().update(uri,v,null,null);
                    } else {
                        File dir=getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS);
                        try(OutputStream out=new FileOutputStream(new File(dir,name))){ out.write(bytes); }
                    }
                    Toast.makeText(MainActivity.this,"Archivo guardado: "+name,Toast.LENGTH_LONG).show();
                } catch(Exception e) {
                    Toast.makeText(MainActivity.this,"No se pudo guardar: "+e.getMessage(),Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
