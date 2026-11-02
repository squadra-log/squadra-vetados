package com.squadra.vetados;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SeguridadPlugin.class);
        super.onCreate(savedInstanceState);
        // Capturas bloqueadas por defecto; la app las permite solo a administradores y Soporte.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
}
