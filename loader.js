/* Carga la app y la mantiene actualizada.
   En el APK: revisa en la página web si hay una versión nueva, la descarga por debajo y la usa
   la próxima vez que se abra (también funciona sin internet con la última guardada).
   Si hay un cambio que exige APK nuevo, muestra un aviso para descargarlo. */
(function(){
  var REMOTE = window.SQUADRA_REMOTE || "https://squadra-log.github.io/squadra-vetados/";
  var KEY = "squadra.update";
  var native = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  function get(){ try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch(e) { return null; } }
  function put(o){ try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch(e) { return false; } }
  function drop(){ try { localStorage.removeItem(KEY); } catch(e) {} }
  function scriptSrc(src){ return new Promise(function(ok, no){ var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.body.appendChild(s); }); }
  function scriptText(t){ var s = document.createElement("script"); s.text = t; document.body.appendChild(s); }
  function cssHref(h){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = h; document.head.appendChild(l); }
  function cssText(t){ var st = document.createElement("style"); st.textContent = t; document.head.appendChild(st); }
  function text(url){ return fetch(url, { cache: "no-store" }).then(function(r){ if (!r.ok) throw new Error(r.status); return r.text(); }); }

  function banner(msg, actionLabel, action){
    var old = document.getElementById("upd"); if (old) old.remove();
    var b = document.createElement("div"); b.id = "upd"; b.setAttribute("role", "status");
    b.style.cssText = "position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:35;max-width:420px;margin:0 auto;background:#16233A;color:#fff;border-radius:16px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:10px;font-family:Inter,system-ui,sans-serif";
    var p = document.createElement("div"); p.textContent = msg; p.style.cssText = "font-size:14px;font-weight:600;line-height:1.4";
    var row = document.createElement("div"); row.style.cssText = "display:flex;gap:8px";
    var a = document.createElement(action.href ? "a" : "button"); a.textContent = actionLabel;
    a.style.cssText = "flex:2;height:44px;border:0;border-radius:12px;background:#25D366;color:#063A1C;font:700 15px Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;text-decoration:none";
    if (action.href) { a.href = action.href; a.target = "_blank"; a.rel = "noopener"; } else a.onclick = action.run;
    var later = document.createElement("button"); later.textContent = "Después";
    later.style.cssText = "flex:1;height:44px;border:0;border-radius:12px;background:#2C3D57;color:#fff;font:600 15px Inter,system-ui,sans-serif";
    later.onclick = function(){ b.remove(); };
    row.appendChild(a); row.appendChild(later); b.appendChild(p); b.appendChild(row); document.body.appendChild(b);
  }

  function check(local){
    text(REMOTE + "version.json?t=" + Date.now()).then(function(t){
      var remote = JSON.parse(t);
      if ((remote.native || 0) > (local.native || 0)) {
        banner("Hay una actualización de la app. Descárguela e instálela encima: no se pierde nada.", "Descargar", { href: REMOTE + "SquadraVetados.apk?v=" + remote.v });
        return;
      }
      if ((remote.v || 0) <= window.SQUADRA.v) return;
      if ((remote.minNative || 0) > (local.native || 0)) return;
      var q = "?v=" + remote.v;
      return Promise.all([text(REMOTE + "styles.css" + q), text(REMOTE + "backend.js" + q), text(REMOTE + "app.js" + q)]).then(function(f){
        if (f[2].indexOf("function render(") < 0 || f[1].indexOf("window.Backend") < 0) return;
        if (put({ v: remote.v, minNative: remote.minNative || 0, css: f[0], backend: f[1], app: f[2] }))
          banner("Hay una versión nueva de la app lista. Se usa la próxima vez que la abra.", "Actualizar ahora", { run: function(){ location.reload(); } });
      });
    }).catch(function(){ /* sin internet: se intenta la próxima vez */ });
  }

  text("version.json").then(JSON.parse).catch(function(){ return { v: 0, native: 0 }; }).then(function(local){
    var up = native ? get() : null;
    var use = !!(up && up.v > local.v && (up.minNative || 0) <= (local.native || 0));
    if (up && !use) drop();
    window.SQUADRA = { v: use ? up.v : local.v, native: local.native || 0, bundled: local.v };
    if (use) {
      cssText(up.css);
      try { scriptText(up.backend); scriptText(up.app); } catch(e) {}
      // Si la versión descargada no arranca, se vuelve a la que trae el APK.
      setTimeout(function(){ if (!window.__squadraReady) { drop(); location.reload(); } }, 12000);
    } else {
      cssHref("styles.css?v=" + local.v);
      scriptSrc("backend.js?v=" + local.v).then(function(){ return scriptSrc("app.js?v=" + local.v); });
    }
    if (native) setTimeout(function(){ check(local); }, 3000);
  });
})();
