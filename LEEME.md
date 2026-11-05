# Squadra Vetados

App de control de ingreso de Squadra: personas vetadas y desvetadas.

- **Android:** APK que se fabrica solo en GitHub cada vez que cambia el código.
- **iPhone y PC:** la misma app como página web (GitHub Pages).
- **Datos:** Firebase (proyecto `squadra-vetados`), plan gratis.

## Partes
- `www/` — la app (pantallas, lógica y conexión con Firebase).
- `firestore.rules` — reglas de seguridad. Se pegan en Firebase → Firestore → Reglas.
- `native/` — código de Android para bloquear capturas a las cuentas de filtro.
- `assets/` — ícono y pantalla de inicio.
- `.github/workflows/construir.yml` — fabrica el APK y publica la web.

## Actualizaciones
- Cambios en `www/` (pantallas, textos, lógica): el APK los descarga solo y los usa la próxima vez que se abre. No hay que reinstalar.
- Cambios en `native/`, `assets/` o en los complementos de Capacitor: suba el número de `native/VERSION`. La app mostrará "Hay una actualización de la app" con el botón para descargar el APK nuevo.
- Si un cambio de `www/` necesita un APK nuevo para funcionar, suba también `native/MIN_NATIVE` al mismo número.
