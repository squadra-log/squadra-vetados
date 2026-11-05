/* Conexión con Firebase (base de datos y cuentas) */
(function(){
  var cfg = window.FIREBASE_CONFIG;
  var B = {};
  var DOMAIN = "@squadra-vetados.app";
  function email(u){ return u + DOMAIN; }
  function ts(){ return firebase.firestore.FieldValue.serverTimestamp(); }
  function native(){ return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); }
  function plugin(name){ if (!native()) return null; try{ return (Capacitor.Plugins && Capacitor.Plugins[name]) || (Capacitor.registerPlugin ? Capacitor.registerPlugin(name) : null); }catch(e){ return null; } }
  B.isNative = native;

  /* Identificación del dispositivo (para que Soporte vea dónde hay sesión iniciada) */
  function deviceId(){
    try { var d = localStorage.getItem("squadra.device"); if (!d) { d = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem("squadra.device", d); } return d; }
    catch(e) { return "sin-id"; }
  }
  function deviceInfo(){
    var ua = navigator.userAgent || "", tipo, detalle = "";
    var m = ua.match(/Android [\d.]+; ([^;)]+?)(?: Build|\))/);
    if (native()) { tipo = "App Android"; detalle = m ? m[1].trim() : ""; }
    else if (/iPhone/.test(ua)) tipo = "Página web en iPhone";
    else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) tipo = "Página web en iPad";
    else if (/Android/.test(ua)) { tipo = "Página web en celular Android"; detalle = m ? m[1].trim() : ""; }
    else tipo = "Página web en computador";
    var nav = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "";
    var so = /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua) ? "Mac" : /Linux/.test(ua) && !/Android/.test(ua) ? "Linux" : "";
    if (!native()) detalle = [detalle, nav, so].filter(Boolean).join(" · ");
    return { tipo: tipo, detalle: detalle, version: (window.SQUADRA && window.SQUADRA.v) || 0 };
  }
  B.deviceId = deviceId;
  B.deviceInfo = deviceInfo;

  if (typeof firebase === "undefined") {
    // Sin la librería de Firebase no se puede hacer nada: se muestra un aviso claro.
    B.onSession = function(cb){ setTimeout(function(){ cb(null, "No hay conexión a internet. Revise la conexión y vuelva a abrir la app."); }, 0); };
    ["needsSetup","login","setup","logout","watchPeople","getPhotos","createPerson","addVeto","setVetos","updatePerson","deletePerson","listAccounts","createAccount","updateAccount","deleteAccount","changePassword","shareImage","listDevices","closeDevice","closeAllDevices"].forEach(function(k){
      B[k] = function(){ return Promise.reject(new Error("offline")); };
    });
    B.needsSetup = function(){ return Promise.resolve(false); };
    B.watchPeople = function(){ return function(){}; };
    B.message = function(){ return "No hay conexión a internet."; };
    B.protectScreen = function(){}; B.localNotify = function(){}; B.askNotifications = function(){};
    window.Backend = B; return;
  }

  firebase.initializeApp(cfg);
  var auth = firebase.auth(), db = firebase.firestore();
  try { db.enablePersistence({ synchronizeTabs: true }).catch(function(){}); } catch(e) {}

  B.message = function(err){
    var c = (err && err.code) || "", m = (err && err.message) || "";
    if (/invalid-credential|wrong-password|user-not-found|invalid-login|invalid-email/.test(c)) return "Usuario o contraseña incorrectos.";
    if (/too-many-requests/.test(c)) return "Demasiados intentos. Espere unos minutos y vuelva a intentar.";
    if (/network|unavailable/.test(c) || /offline/.test(m)) return "No hay conexión a internet. Intente de nuevo.";
    if (/email-already-in-use/.test(c)) return "Ese usuario ya existe. Escoja otro.";
    if (/weak-password/.test(c)) return "La contraseña es muy débil. Use al menos 6 caracteres.";
    if (/requires-recent-login/.test(c)) return "Por seguridad, salga y vuelva a entrar antes de cambiar la contraseña.";
    if (/permission-denied/.test(c)) return "Su cuenta no tiene permiso para hacer esto.";
    if (/resource-exhausted/.test(c)) return "Se llegó al límite gratis de hoy. Mañana vuelve a funcionar.";
    if (/invalid-argument/.test(c) && /longer than|size/.test(m)) return "Las fotos son muy pesadas. Quite alguna e intente de nuevo.";
    return "No se pudo completar. Intente de nuevo." + (c ? " (" + c + ")" : "");
  };

  /* ---------- Sesión ---------- */
  var stopMe = null, stopDev = null, kickReason = "", freshLogin = false, beat = null;
  function devRef(uid){ return db.doc("cuentas/" + uid + "/dispositivos/" + deviceId()); }
  function startDevice(uid){
    var ref = devRef(uid), info = deviceInfo(), reg = false;
    try { reg = localStorage.getItem("squadra.devreg") === uid; } catch(e) {}
    if (freshLogin || !reg) {
      freshLogin = false;
      ref.set({ tipo: info.tipo, detalle: info.detalle, version: info.version, inicio: ts(), ultimoUso: ts(), enLinea: true }).catch(function(){});
      try { localStorage.setItem("squadra.devreg", uid); } catch(e) {}
    } else {
      ref.update({ ultimoUso: ts(), version: info.version, enLinea: true, tipo: info.tipo, detalle: info.detalle }).catch(function(){});
    }
    // Si Soporte cierra la sesión de este dispositivo, se sale de inmediato.
    stopDev = ref.onSnapshot({ includeMetadataChanges: true }, function(d){
      if (!d.exists && !d.metadata.fromCache && !d.metadata.hasPendingWrites) B.logout("Soporte cerró la sesión en este dispositivo.", true);
    }, function(){});
    // "En línea": se avisa cada 3 minutos mientras la app está abierta, y al cerrarla o dejarla en segundo plano.
    clearInterval(beat);
    beat = setInterval(function(){ if (!document.hidden) ref.update({ ultimoUso: ts(), enLinea: true }).catch(function(){}); }, 3 * 60 * 1000);
    curRef = ref;
  }
  var curRef = null;
  function presence(on){ if (curRef) curRef.update(on ? { ultimoUso: ts(), enLinea: true } : { enLinea: false }).catch(function(){}); }
  document.addEventListener("visibilitychange", function(){ presence(!document.hidden); });
  window.addEventListener("pagehide", function(){ presence(false); });
  function stopDevice(){ if (stopDev) { stopDev(); stopDev = null; } clearInterval(beat); beat = null; curRef = null; }
  B.onSession = function(cb){
    auth.onAuthStateChanged(function(user){
      if (stopMe) { stopMe(); stopMe = null; }
      stopDevice();
      if (!user) { var r = kickReason; kickReason = ""; cb(null, r); return; }
      var started = false;
      stopMe = db.doc("cuentas/" + user.uid).onSnapshot(function(d){
        if (!d.exists) { B.logout("Esta cuenta no tiene acceso. Hable con Soporte.", true); return; }
        var a = d.data();
        if (!a.activo) { B.logout("Esta cuenta está desactivada. Hable con Soporte.", true); return; }
        if (!started) { started = true; startDevice(user.uid); }
        cb({ uid: user.uid, user: a.usuario, name: a.nombre, role: a.rol });
      }, function(){ B.logout("No se pudo verificar la cuenta. Vuelva a entrar.", true); });
    });
  };
  B.needsSetup = function(){ return db.doc("sistema/listo").get().then(function(d){ return !d.exists; }); };
  B.login = function(u, p){ freshLogin = true; return auth.signInWithEmailAndPassword(email(u), p).catch(function(e){ freshLogin = false; throw e; }); };
  B.logout = function(reason, kicked){
    kickReason = reason || "";
    stopDevice();
    try { localStorage.removeItem("squadra.devreg"); } catch(e) {}
    var u = auth.currentUser;
    // Al salir por su cuenta, se borra este dispositivo de la lista de sesiones.
    var clean = (!kicked && u) ? devRef(u.uid).delete().catch(function(){}) : Promise.resolve();
    return clean.then(function(){ return auth.signOut(); });
  };
  B.setup = function(o){
    freshLogin = true;
    return auth.createUserWithEmailAndPassword(email(o.user), o.pass).then(function(c){
      var b = db.batch();
      b.set(db.doc("cuentas/" + c.user.uid), { usuario: o.user, nombre: o.name, rol: "supremo", activo: true, creado: ts() });
      b.set(db.doc("sistema/listo"), { creado: ts(), por: c.user.uid });
      return b.commit();
    });
  };
  B.changePassword = function(oldP, newP){
    var u = auth.currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(u.email, oldP);
    return u.reauthenticateWithCredential(cred).then(function(){ return u.updatePassword(newP); });
  };

  /* ---------- Personas ---------- */
  function conv(d){
    var x = d.data();
    return { id: d.id, name: x.nombre || "", thumb: x.thumb || "", fv: x.fv || 0, nFotos: x.nFotos || 0, vetos: x.vetos || [], at: x.actualizado && x.actualizado.toMillis ? x.actualizado.toMillis() : 0 };
  }
  B.watchPeople = function(onData, onError){
    return db.collection("personas").onSnapshot({ includeMetadataChanges: true }, function(s){
      var changes = s.docChanges().map(function(ch){ return { type: ch.type, id: ch.doc.id, local: ch.doc.metadata.hasPendingWrites }; });
      onData(s.docs.map(conv), changes, s.metadata.fromCache);
    }, onError);
  };
  B.getPhotos = function(id){
    return db.collection("personas/" + id + "/fotos").orderBy("orden").get().then(function(s){
      return s.docs.map(function(d){ return { id: d.id, data: d.data().data }; });
    });
  };
  function thumbOf(src){
    return new Promise(function(ok, no){
      var i = new Image(); i.onload = function(){
        var c = document.createElement("canvas"); c.width = c.height = 220;
        var s = Math.max(220 / i.width, 220 / i.height);
        c.getContext("2d").drawImage(i, (220 - i.width * s) / 2, (220 - i.height * s) / 2, i.width * s, i.height * s);
        ok(c.toDataURL("image/jpeg", 0.72));
      }; i.onerror = no; i.src = src;
    });
  }
  B.createPerson = function(o){
    var ref = db.collection("personas").doc();
    return thumbOf(o.photos[0]).then(function(th){
      var b = db.batch();
      b.set(ref, { nombre: o.name || "", thumb: th, fv: Date.now(), nFotos: o.photos.length, vetos: o.vetos, creado: ts(), actualizado: ts() });
      o.photos.forEach(function(src, k){ b.set(ref.collection("fotos").doc(), { data: src, orden: k }); });
      return b.commit().then(function(){ return ref.id; });
    });
  };
  B.addVeto = function(id, vetos, newPhotos){
    var ref = db.doc("personas/" + id), b = db.batch(), base = Date.now();
    var upd = { vetos: vetos, actualizado: ts() };
    if (newPhotos.length) {
      upd.nFotos = firebase.firestore.FieldValue.increment(newPhotos.length);
      upd.fv = Date.now();
      newPhotos.forEach(function(src, k){ b.set(ref.collection("fotos").doc(), { data: src, orden: base + k }); });
    }
    b.update(ref, upd);
    return b.commit().then(function(){ return id; });
  };
  B.setVetos = function(id, vetos){ return db.doc("personas/" + id).update({ vetos: vetos, actualizado: ts() }); };
  B.updatePerson = function(id, o){
    var ref = db.doc("personas/" + id);
    var work = o.photosChanged ? thumbOf(o.photos[0]) : Promise.resolve(null);
    return work.then(function(th){
      var b = db.batch();
      var upd = { nombre: o.name || "", vetos: o.vetos, actualizado: ts() };
      if (o.photosChanged) {
        upd.thumb = th; upd.fv = Date.now(); upd.nFotos = o.photos.length;
        o.remove.forEach(function(fid){ b.delete(ref.collection("fotos").doc(fid)); });
        o.photos.forEach(function(src, k){
          var fid = o.keepOrder[k];
          if (fid) b.update(ref.collection("fotos").doc(fid), { orden: k });
          else b.set(ref.collection("fotos").doc(), { data: src, orden: k });
        });
      }
      b.update(ref, upd);
      return b.commit();
    });
  };
  B.deletePerson = function(id){
    var ref = db.doc("personas/" + id);
    return ref.collection("fotos").get().then(function(s){
      var b = db.batch();
      s.docs.forEach(function(d){ b.delete(d.ref); });
      b.delete(ref);
      return b.commit();
    });
  };

  /* ---------- Cuentas (solo Soporte) ---------- */
  B.listAccounts = function(){
    return db.collection("cuentas").get().then(function(s){
      return s.docs.map(function(d){ var a = d.data(); return { uid: d.id, user: a.usuario, name: a.nombre, role: a.rol, off: !a.activo }; });
    });
  };
  var second = null;
  B.createAccount = function(o){
    // Se usa una segunda conexión para crear la cuenta sin cerrar la sesión de Soporte.
    if (!second) second = firebase.initializeApp(cfg, "crear-cuentas");
    var a2 = second.auth();
    return a2.createUserWithEmailAndPassword(email(o.user), o.pass).then(function(c){
      var uid = c.user.uid;
      return a2.signOut().then(function(){
        return db.doc("cuentas/" + uid).set({ usuario: o.user, nombre: o.name, rol: o.role, activo: true, creado: ts() });
      });
    });
  };
  B.updateAccount = function(uid, o){ return db.doc("cuentas/" + uid).update({ nombre: o.name, rol: o.role, activo: !o.off }); };
  B.deleteAccount = function(uid){
    return db.collection("cuentas/" + uid + "/dispositivos").get().then(function(s){
      var b = db.batch(); s.docs.forEach(function(d){ b.delete(d.ref); }); b.delete(db.doc("cuentas/" + uid)); return b.commit();
    });
  };
  function devConv(d){ var x = d.data(); return { id: d.id, uid: d.ref.parent.parent.id, tipo: x.tipo || "Dispositivo", detalle: x.detalle || "", version: x.version || 0,
    enLinea: !!x.enLinea, inicio: x.inicio && x.inicio.toDate ? x.inicio.toDate().getTime() : 0, ultimoUso: x.ultimoUso && x.ultimoUso.toDate ? x.ultimoUso.toDate().getTime() : 0 }; }
  B.listDevices = function(){ return db.collectionGroup("dispositivos").get().then(function(s){ return s.docs.map(devConv); }); };
  B.closeDevice = function(uid, id){ return db.doc("cuentas/" + uid + "/dispositivos/" + id).delete(); };
  B.closeAllDevices = function(uid){
    return db.collection("cuentas/" + uid + "/dispositivos").get().then(function(s){ var b = db.batch(); s.docs.forEach(function(d){ b.delete(d.ref); }); return b.commit(); });
  };

  /* ---------- Funciones del celular ---------- */
  var Seguridad = plugin("Seguridad"), Share = plugin("Share"), Files = plugin("Filesystem"), Local = plugin("LocalNotifications");
  B.protectScreen = function(on){ if (Seguridad) { try { (on ? Seguridad.bloquear() : Seguridad.permitir()).catch(function(){}); } catch(e) {} } };
  B.askNotifications = function(){
    if (Local) { try { Local.requestPermissions().catch(function(){}); } catch(e) {} }
  };
  var nid = 1;
  B.localNotify = function(title, body){
    if (Local) { try { Local.schedule({ notifications: [{ id: nid++, title: title, body: body }] }).catch(function(){}); } catch(e) {} return; }
    if ("Notification" in window && Notification.permission === "granted" && document.hidden) { try { new Notification(title, { body: body, icon: "img/icono-192.png" }); } catch(e) {} }
  };
  B.shareImage = function(dataUrl, text){
    var b64 = dataUrl.split(",")[1];
    if (Share && Files) {
      return Files.writeFile({ path: "ficha-veto.png", data: b64, directory: "CACHE" }).then(function(r){
        var o = { title: "Ficha de veto", files: [r.uri], dialogTitle: "Compartir ficha" }; if (text) o.text = text; return Share.share(o);
      });
    }
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    var file = new File([arr], "ficha-veto.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { var d = { files: [file] }; if (text) d.text = text; return navigator.share(d); }
    return Promise.reject(new Error("no-share"));
  };

  window.Backend = B;
})();
