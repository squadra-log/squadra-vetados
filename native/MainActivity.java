package com.squadra.vetados;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SeguridadPlugin.class);
        super.onCreate(savedInstanceState);
        // Capturas bloqueadas por defecto; la app las permite solo a administradores y Soporte.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);

        // Botón "atrás" del celular: vuelve a la pantalla anterior de la app; en la pantalla principal sale de la app.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView web = getBridge() != null ? getBridge().getWebView() : null;
                if (web != null && web.canGoBack()) {
                    web.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                    setEnabled(true);
                }
            }
        });
    }
}
