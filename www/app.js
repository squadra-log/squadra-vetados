
var LOGO = "img/logo.svg";
var ICON = "img/icono.svg";
var MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
var COLORS = ["#5B6170","#7A5C48","#3F5E73","#6B5B7A","#4F6B57","#7A4F55","#55606B","#6E6448","#45566E","#5E6E4A","#6A4E6E","#4D5F70"];
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var TODAY = iso(new Date());
function parse(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function fmt(s){if(!s)return "—";var d=parse(s);return String(d.getDate()).padStart(2,"0")+" "+MES[d.getMonth()]+" "+d.getFullYear()}
function addMonths(s,m){var d=parse(s);var day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+m);var last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return iso(d)}
function nm(p){return p.name&&p.name.trim()?p.name:"Vetado el "+fmt(last(p).desde)}
function named(p){return !!(p.name&&p.name.trim())}
function faceTxt(p){return p.thumb?"":(p.name&&p.name.trim()?esc(ini(p.name)):IC.person)}
function span(n){n=Math.abs(n);if(n===0)return "hoy";if(n===1)return "1 día";if(n<14)return n+" días";if(n<60){var w=Math.round(n/7);return w+(w===1?" semana":" semanas")}var m=Math.round(n/30.4);if(m<12)return m+(m===1?" mes":" meses");var y=Math.floor(n/365),r=Math.round((n-y*365)/30.4);return y+(y===1?" año":" años")+(r?" y "+r+(r===1?" mes":" meses"):"")}
function norm(t){return String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ").trim()}
function days(a,b){return Math.round((parse(b)-parse(a))/864e5)}
function lugares(){var seen={},out=VENUES.slice();VENUES.forEach(function(x){seen[norm(x)]=1});S.people.forEach(function(p){p.vetos.forEach(function(v){var k=norm(v.lugar);if(k&&!seen[k]){seen[k]=1;out.push(v.lugar)}})});return '<datalist id="lugares">'+out.sort().map(function(x){return '<option value="'+esc(x)+'"></option>'}).join("")+'</datalist>'}
function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function ini(n){return n.trim().split(/\s+/).slice(0,2).map(function(w){return w[0]}).join("").toUpperCase()}
var L = "";

function roleTag(c){return c.off?'<span class="tag r">DESACTIVADA</span>':c.role==="supremo"?'<span class="tag" style="background:var(--gold);color:var(--goldtext)">SOPORTE</span>':c.role==="admin"?'<span class="tag" style="background:var(--navy);color:#fff">ADMIN</span>':'<span class="tag" style="background:var(--chip);color:var(--fg)">CONSULTA</span>'}
var S = {people:[],accounts:[],photoCache:{},ready:false,busy:"",offline:false,menu:false,me:null,share:false,acc:null,confirmDel:false,role:null,view:"start",tab:"vetados",q:"",id:null,photo:0,form:null,err:""};

function last(p){return p.vetos[p.vetos.length-1]}
var LOCALES=[
  {k:"solar",t:"Solar",full:"Solar"},
  {k:"sunsed",t:"Sunsed",full:"Sunsed"},
  {k:"tremenda",t:"Tremenda",full:"Tremenda"},
  {k:"delirio",t:"Delirio",full:"Delirio"},
  {k:"escobar",t:"Escobar",full:"Escobar"},
  {k:"once",t:"Once Once",full:"Once Once"},
  {k:"otros",t:"Otros",full:"Otros locales"}];
var VENUES=["Solar","Sunsed","Tremenda","Delirio","Escobar","Once Once"];
var MESES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function locs(v){var l=v&&v.locales;if(!l||!l.length)return ["todos"];var out=[];l.forEach(function(k){(k==="trio"?["tremenda","delirio","escobar"]:[k]).forEach(function(x){if(out.indexOf(x)<0)out.push(x)})});return out}
function inLocal(p,k){if(k==="todos")return true;var l=locs(last(p));return l.indexOf("todos")>=0||l.indexOf(k)>=0}
function locText(v,short){var l=locs(v);if(l.indexOf("todos")>=0)return "Todos los locales";return l.map(function(k){var o=LOCALES.filter(function(x){return x.k===k})[0];return o?(short?o.t:o.full):k}).join(", ")}
function locChips(sel,attr){var all=sel.indexOf("todos")>=0;
  return '<div class="chips">'+'<button type="button" class="chipb" '+attr+'="todos" aria-pressed="'+all+'">Todos los locales</button>'+LOCALES.map(function(o){return '<button type="button" class="chipb" '+attr+'="'+o.k+'" aria-pressed="'+(!all&&sel.indexOf(o.k)>=0)+'">'+o.t+'</button>'}).join("")+'</div>'}
function toggleLoc(arr,k){if(k==="todos")return ["todos"];var a=arr.filter(function(x){return x!=="todos"});var i=a.indexOf(k);if(i>=0)a.splice(i,1);else a.push(k);return a.length?a:["todos"]}
try{S.loc=localStorage.getItem("squadra.loc")||"todos"}catch(_){S.loc="todos"}
if(S.loc==="trio")S.loc="tremenda";
function active(p){var v=last(p);return !v.hasta || v.hasta>TODAY}
function face(p){return p.thumb?"background-image:url("+p.thumb+")":"background:"+p.color}
function find(id){return S.people.filter(function(p){return p.id===id})[0]}

var IC={
 back:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
 close:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 hist:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>',
 exit:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
 plus:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 search:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B9C7DA" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 eye:'<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 lock:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
 cam:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 users:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>',
 share:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
 person:'<svg aria-hidden="true" width="46%" height="46%" viewBox="0 0 24 24" fill="currentColor" opacity=".75"><circle cx="12" cy="8" r="4.5"/><path d="M3 21.5c0-4.7 4-8 9-8s9 3.3 9 8z"/></svg>',
 rot:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
 pencil:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
 pin:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
};

function go(view,extra){S.view=view;S.err="";S.share=false;S.zoom=false;if(extra)for(var k in extra)S[k]=extra[k];render();var ph=document.getElementById("phone");window.scrollTo(0,0);}
function notify(t){var n=document.getElementById("notif");document.getElementById("notiftext").textContent=t;n.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(function(){n.classList.remove("show")},3800)}
function header(title,backView,backLabel){return '<div class="top"><div class="row between"><div class="row"><button class="iconbtn" data-go="'+backView+'" aria-label="'+(backLabel||"Volver")+'">'+(backLabel==="Cancelar"?IC.close:IC.back)+'</button><h1>'+esc(title)+'</h1></div><img class="logo sm" alt="Squadra" src="'+ICON+'\"></div></div>'}

function vStart(){
  if(S.booting)return '<div class="start dark" style="align-items:center;justify-content:center"><img alt="Squadra Servicios Logísticos" src="'+LOGO+'" style="width:170px;height:170px;border-radius:24px"><div class="spin"></div></div>';
  var setup=S.setup;
  return '<form class="start dark" id="'+(setup?"setupf":"loginf")+'" novalidate><div style="display:flex;flex-direction:column;align-items:center;gap:12px"><img alt="Squadra Servicios Logísticos" src="'+LOGO+'" style="width:170px;height:170px;border-radius:24px"><span style="color:#B9C7DA;font-size:14px">Control de ingreso · Vetados</span></div>'+
 (setup?'<div style="background:#0B3966;border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.45;color:#D5DEEA"><b style="color:#fff">Configuración inicial.</b> Cree la primera cuenta de <b style="color:#fff">Soporte</b>. Esa persona crea todas las demás cuentas.</div><label class="field" for="sname">Nombre<input id="sname" type="text" autocomplete="off"></label>':'')+
 '<label class="field" for="lu">Usuario<input id="lu" type="text" autocomplete="username" autocapitalize="none" spellcheck="false"></label><label class="field" for="pw">Contraseña<input id="pw" type="password" autocomplete="'+(setup?"new-password":"current-password")+'" placeholder="'+(setup?"Mínimo 6 caracteres":"••••••")+'"></label>'+
 (setup?'<label class="field" for="pw2">Repita la contraseña<input id="pw2" type="password" autocomplete="new-password"></label>':'')+
 (S.err?'<span class="err" style="color:#FFB4A9">'+S.err+'</span>':'')+
 (setup?'':'<div style="display:flex;gap:10px;align-items:flex-start;background:#0B3966;border-radius:12px;padding:12px 14px;font-size:12px;line-height:1.45;color:#D5DEEA"><span style="flex-shrink:0;color:#fff">'+IC.lock+'</span><span>Solo personal autorizado. Las cuentas las entrega Soporte. Sin cuenta no se ve ninguna ficha ni foto.</span></div>')+
 '<div style="flex:1"></div><button class="btn white" type="submit">'+(setup?"Crear cuenta de Soporte":"Entrar")+'</button>'+
 (Backend.isNative()||setup?'':'<a href="SquadraVetados.apk" style="color:#B9C7DA;font-size:13px;text-align:center">Descargar la app para Android</a>')+'</form>'}
function vLogin(){return vStart()}

function vList(){
  var admin=S.role==="admin", q=norm(S.q.trim());
  var ps=S.people.filter(function(p){return inLocal(p,S.loc)&&(!q||norm(p.name||"").indexOf(q)>=0)});
  var soon=S.people.filter(function(p){var v=last(p);return active(p)&&v.hasta&&days(TODAY,v.hasta)<=7}).length;
  if(S.tab==="vetados")ps=ps.filter(active).sort(function(a,b){return last(b).desde<last(a).desde?-1:1});
  else if(S.tab==="desvetados")ps=ps.filter(function(p){return !active(p)}).sort(function(a,b){return last(b).hasta<last(a).hasta?-1:1});
  else ps=ps.slice().sort(function(a,b){return last(b).desde<last(a).desde?-1:1});
  var sortLbl=S.tab==="desvetados"?"fecha de desveto":"fecha de veto";
  var h=(S.offline?'<div class="offline">Sin internet: está viendo lo último que se cargó.</div>':'')+'<div class="top"><div class="row between"><div class="row"><img class="logo" alt="Squadra Servicios Logísticos" src="'+ICON+'\"><div><div class="eyebrow">Squadra · Control de ingreso</div><h1>Vetados</h1></div></div><div class="row" style="gap:8px">'+(S.me&&S.me.role==="supremo"?'<button class="iconbtn" data-go="accounts" aria-label="Cuentas">'+IC.users+'</button>':'')+'<button class="iconbtn" data-menu="1" aria-label="Mi cuenta">'+IC.exit+'</button><button class="iconbtn" data-go="historial" aria-label="Ver historial">'+IC.hist+'</button></div></div>'+
   (admin?'<span class="role admin">'+(S.me.role==="supremo"?"SOPORTE":"ADMINISTRADOR")+' · '+esc(S.me.name).toUpperCase()+'</span>':'<span class="role view">CONSULTA · '+esc(S.me.name).toUpperCase()+'</span>')+
   '<label class="search" for="q">'+IC.search+'<input id="q" type="search" placeholder="Buscar por nombre" value="'+esc(S.q)+'"></label></div>';
  h+='<div class="locs" role="group" aria-label="Local">'+LOCALES.concat([{k:"todos",t:"Todos"}]).map(function(o){var n=S.people.filter(function(p){return inLocal(p,o.k)&&active(p)}).length;return '<button class="loc" data-loc="'+o.k+'" aria-pressed="'+(S.loc===o.k)+'"><span class="lt">'+o.t+' <span class="ln">'+n+'</span></span></button>'}).join("")+'</div>';
  h+='<div class="tabs" role="group" aria-label="Estado">'+["vetados","desvetados","todos"].map(function(t){return '<button class="tab" data-tab="'+t+'" aria-pressed="'+(S.tab===t)+'">'+t[0].toUpperCase()+t.slice(1)+'</button>'}).join("")+'</div>';
  var word=S.tab==="todos"?(ps.length===1?"persona":"personas"):(ps.length===1?S.tab.slice(0,-1):S.tab);
  h+='<div class="count">'+ps.length+' '+word+(S.loc!=="todos"?' en <b>'+esc(LOCALES.filter(function(o){return o.k===S.loc})[0].full)+'</b>':'')+' · por <b>'+sortLbl+'</b>, más reciente primero'+(S.tab==="vetados"&&soon&&!q?'<br><span style="color:var(--greentext);font-weight:600">'+soon+(soon===1?" se desveta":" se desvetan")+' en los próximos 7 días</span>':'')+'</div><div class="grid">';
  if(!S.ready)h+='<div class="empty"><div class="spin" style="margin:0 auto 10px"></div>Cargando…</div>';else if(!ps.length)h+='<div class="empty">'+(q?"Nadie con ese nombre en esta lista."+(S.tab!=="todos"?' <br><button class="tab" data-tab="todos" style="margin-top:10px">Buscar en Todos</button>':''):"No hay personas en esta lista.")+'</div>';
  var lastMonth="";
  ps.forEach(function(p){var a=active(p),v=last(p),n=p.vetos.length;
    var md=(S.tab==="desvetados"?v.hasta:v.desde)||"",mk=md.slice(0,7);
    if(mk&&mk!==lastMonth){lastMonth=mk;var cnt=ps.filter(function(x){var y=last(x);return ((S.tab==="desvetados"?y.hasta:y.desde)||"").slice(0,7)===mk}).length;
      h+='<div class="month"><span>'+MESES[+mk.slice(5,7)-1]+' '+mk.slice(0,4)+'</span><span class="mc">'+cnt+'</span></div>'}
    h+='<button class="tile" data-open="'+p.id+'"><span class="face" style="'+face(p)+'">'+faceTxt(p)+(n>1&&a?'<span class="nth">'+n+'° veto</span>':'')+'<span class="badge '+(a?"r":"g")+'">'+(a?"VETADO":"DESVETADO")+'</span></span><span class="tname">'+(named(p)?esc(p.name):'&nbsp;')+'</span><span class="tsub">'+(a?"desde "+fmt(v.desde):"desde "+fmt(v.hasta))+'</span>'+(a&&v.hasta&&days(TODAY,v.hasta)<=7?'<span class="tsub" style="color:var(--greentext);font-weight:600">sale en '+span(days(TODAY,v.hasta))+'</span>':'')+(S.loc==="todos"&&a?'<span class="tloc">'+esc(locText(v,true))+'</span>':'')+'</button>'});
  h+='</div>';
  if(admin)h+='<button class="fab" data-new="1">'+IC.plus+'Nuevo veto</button>';
  return h;
}

function vDetail(){
  var p=find(S.id), admin=S.role==="admin", a=active(p), v=last(p), n=p.vetos.length;
  var ph=p.photos.length?p.photos:(p.thumb?[p.thumb]:[]), i=Math.min(S.photo,Math.max(ph.length-1,0));
  var h='<div class="detail"><div class="top"><div class="row between"><button class="iconbtn" data-go="list" aria-label="Volver">'+IC.back+'</button><img class="logo sm" alt="Squadra" src="'+ICON+'\"></div>'+
   (ph.length?'<button class="hero" data-zoom="1" aria-label="Ver foto en grande" style="border:0;width:100%;padding:0;color:#fff;background-image:url('+ph[i]+')"><span class="ctr">'+(p.photos.length?(i+1)+' / '+ph.length+' · ampliar':'Cargando fotos…')+'</span></button>':'<div class="hero" style="background:'+p.color+';color:#fff">'+faceTxt(p)+'<span class="ctr">Sin fotos</span></div>');
  if(ph.length||admin){h+='<div class="thumbs">'+ph.map(function(src,k){return '<button class="thumb" data-photo="'+k+'" aria-label="Foto '+(k+1)+'" aria-current="'+(k===i)+'" style="background-image:url('+src+')"></button>'}).join("")+(admin?'<label class="addthumb" for="addph" aria-label="Agregar foto">'+IC.plus+'<input id="addph" type="file" accept="image/*" multiple hidden></label>':'')+'</div>'}
  h+='<div style="display:flex;flex-direction:column;gap:6px"><div class="row" style="gap:6px;flex-wrap:wrap">'+(a?'<span class="pill r">VETADO</span>':'<span class="pill g">DESVETADO · PUEDE INGRESAR</span>')+(n>1?'<span class="pill w">'+(a?n+"° veto":n+" vetos antes")+'</span>':'')+'</div><h1 style="font-size:26px">'+esc(nm(p))+'</h1>'+'</div></div>';
  h+='<div class="body">';
  if(a&&admin)h+='<button class="btn" data-share="1" style="height:48px;font-size:15px;background:#25D366;color:#063A1C">'+IC.share+'Compartir ficha</button>';
  if(admin)h+='<button class="btn navy" data-edit="1" style="height:48px;font-size:15px">'+IC.pencil+'Editar</button>';
  if(a){
    var dd=days(v.desde,TODAY);
    h+='<div class="two"><div class="card"><span class="tsub">Fecha de veto</span><span class="big">'+fmt(v.desde)+'</span><span class="tsub">'+(dd===0?"hoy":"lleva "+span(dd)+" de veto")+'</span></div>'+
      (v.hasta?'<div class="card ok"><span class="tsub" style="color:inherit">Se desveta el</span><span class="big">'+fmt(v.hasta)+'</span><span class="tsub" style="color:inherit">faltan '+span(days(TODAY,v.hasta))+'</span></div>':'<div class="card dashed"><span class="tsub">Fecha de desveto</span><span class="big" style="color:var(--muted)">Sin definir</span></div>')+'</div>';
    h+='<div class="card"><span class="lbl">Vetado en</span><span style="font-weight:600">'+esc(locText(v))+'</span></div>';
    h+='<div class="card"><span class="lbl">Motivo</span><span style="line-height:1.45'+(v.motivo?'':';color:var(--muted)')+'">'+(v.motivo?esc(v.motivo):'Sin motivo registrado')+'</span></div>';
    if(v.lugar)h+='<div class="card" style="flex-direction:row;align-items:center;gap:12px"><span style="color:var(--muted)">'+IC.pin+'</span><span style="display:flex;flex-direction:column;gap:2px"><span class="lbl">Lugar del problema</span><span>'+esc(v.lugar||"")+'</span></span></div>';
  } else {
    h+='<div class="two"><div class="card"><span class="tsub">Último veto</span><span class="big">'+fmt(v.desde)+'</span></div><div class="card ok"><span class="tsub" style="color:inherit">Desvetado el</span><span class="big">'+fmt(v.hasta)+'</span></div></div>';
  }
  var list=p.vetos.map(function(x,k){return {x:x,k:k}}).reverse();
  h+='<div class="card" style="gap:12px"><span class="lbl">Vetos de esta persona ('+n+')</span>'+list.map(function(o){var on=a&&o.k===n-1;return '<div class="vrow"><span class="num'+(on?" on":"")+'">'+(o.k+1)+'°</span><span style="display:flex;flex-direction:column;gap:2px"><span class="t">'+fmt(o.x.desde)+' → '+(o.x.hasta?fmt(o.x.hasta):"sin definir")+'</span><span class="s">Duración: '+(o.x.hasta?span(days(o.x.desde,o.x.hasta)):(days(o.x.desde,TODAY)===0?"sin definir (empezó hoy)":"sin definir (lleva "+span(days(o.x.desde,TODAY))+")"))+'</span><span class="s">Vetado en: '+esc(locText(o.x,true))+'</span>'+(o.x.motivo?'<span class="s">Motivo: '+esc(o.x.motivo)+'</span>':'')+(o.x.lugar?'<span class="s">Lugar: '+esc(o.x.lugar)+'</span>':'')+'</span></div>'}).join("")+'</div>';
  if(admin&&a){
    h+='<div class="card" style="gap:10px"><label class="field" for="dv">Fecha de desveto<input id="dv" type="date" value="'+(v.hasta||TODAY)+'"></label>'+(S.err?'<span class="err">'+S.err+'</span>':'')+'<button class="btn green" data-desvetar="1">Guardar desveto</button></div>';
  } else if(admin){
    h+='<button class="btn red" data-revetar="1">Volver a vetar</button>';
  } else {
    h+='<div class="lock">'+IC.lock+'<span>Modo consulta. Los cambios los hace un administrador.</span></div>';
  }
  return h+'</div></div>';
}

function photoBox(list,delAttr,inputId,note){
  return '<div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:13px;font-weight:600">Fotos <span style="color:var(--redtext)">(obligatorio, mínimo una)</span></span><div class="thumbs" style="gap:12px">'+list.map(function(o,k){return '<span style="position:relative"><span class="thumb" style="display:block;width:76px;height:76px;border-radius:14px;background-image:url('+o.src+')"></span>'+(o.del?'<button type="button" '+delAttr+'="'+o.k+'" aria-label="Quitar foto" style="position:absolute;top:-8px;right:-8px;width:28px;height:28px;border-radius:14px;border:2px solid var(--bg);background:var(--red);color:#fff;font-weight:700;line-height:1;padding:0">×</button>':'')+'</span>'}).join("")+
   '<label for="'+inputId+'" style="width:76px;height:76px;border-radius:14px;border:2px dashed var(--line);background:var(--card);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:var(--muted);font-size:11px;font-weight:600;cursor:pointer">'+IC.cam+'Agregar<input id="'+inputId+'" type="file" accept="image/*" multiple hidden></label></div><span class="tsub" style="font-size:12px">'+note+'</span></div>'}
function vetoFields(o,ids){
  return '<div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:13px;font-weight:600">¿En qué locales queda vetado?</span>'+locChips(locs(o),ids[0]==="fmot"?"data-floc":"data-eloc")+'<span class="tsub" style="font-size:12px">Puede marcar varios. "Todos los locales" lo muestra en todas las listas.</span></div>'+'<label class="field" for="'+ids[0]+'"><span>Motivo <span class="opt">(opcional)</span></span><textarea id="'+ids[0]+'">'+esc(o.motivo)+'</textarea></label>'+
   '<label class="field" for="'+ids[1]+'"><span>Lugar del problema <span class="opt">(opcional)</span></span><input id="'+ids[1]+'" type="text" list="lugares" autocomplete="off" value="'+esc(o.lugar)+'"></label>'+lugares()}
function vForm(){
  var f=S.form, p=f.pid?find(f.pid):null, nth=p?p.vetos.length+1:1;
  var h=header(p?"Volver a vetar":"Registrar veto",p&&f.fromDetail?"detail":"list","Cancelar")+'<form class="body" id="vform" novalidate>';
  if(!f.fromDetail){
    h+='<div class="seg" role="group" aria-label="Tipo de persona"><button type="button" data-mode="nueva" aria-pressed="'+(f.mode==="nueva")+'">Persona nueva</button><button type="button" data-mode="antes" aria-pressed="'+(f.mode==="antes")+'">Ya fue vetada antes</button></div>';
  }
  if(f.mode==="antes"&&!p){
    var q=norm(f.pq||"");
    var opts=S.people.filter(function(x){return !active(x)&&(!q||norm(x.name||"").indexOf(q)>=0)}).sort(function(a,b){return last(b).hasta<last(a).hasta?-1:1});
    h+='<span style="font-size:13px;font-weight:600">Toque la cara de la persona</span>'+
      '<label class="search" for="pq" style="background:var(--card);border:1px solid var(--line)">'+IC.search.replace('#B9C7DA','currentColor')+'<input id="pq" type="search" placeholder="Filtrar por nombre (si se sabe)" value="'+esc(f.pq||"")+'" style="color:var(--fg)"></label>'+
      '<div class="grid" style="padding:4px 0 8px">'+(opts.length?opts.map(function(x){return '<button type="button" class="tile" data-pick="'+x.id+'"><span class="face" style="'+face(x)+'">'+faceTxt(x)+'<span class="badge g">DESVETADO</span></span><span class="tname">'+(named(x)?esc(x.name):'&nbsp;')+'</span><span class="tsub">'+x.vetos.length+(x.vetos.length>1?" vetos":" veto")+' · desvetado el '+fmt(last(x).hasta)+'</span></button>'}).join(""):'<div class="empty">No hay desvetados que coincidan.</div>')+'</div>';
  }
  if(p){h+='<div class="card" style="flex-direction:row;align-items:center;gap:12px"><span class="hface" style="'+face(p)+'">'+faceTxt(p)+'</span><span style="flex:1;display:flex;flex-direction:column;gap:2px;min-width:0"><b>'+esc(nm(p))+'</b><span class="tsub">Desvetado el '+fmt(last(p).hasta)+'</span>'+(f.fromDetail?'':'<button type="button" data-pick="" style="align-self:flex-start;border:0;background:none;padding:4px 0;color:var(--navy3);font-weight:600;font-size:13px;text-decoration:underline">Cambiar persona</button>')+'</span><span class="tag r" style="font-size:11px">Será '+nth+'° veto</span></div>'}
  if(f.mode==="nueva"||p){
    var list=(p?(p.photos.length?p.photos:(p.thumb?[p.thumb]:[])).map(function(src){return {src:src,del:false}}):[]).concat(f.photos.map(function(src,k){return {src:src,del:true,k:k}}));
    h+=photoBox(list,"data-delfph","fph",p?"Se conservan sus fotos. Puede agregar nuevas.":"Puede agregar varias y recortarlas. La primera es la que sale en el menú.");
    if(!p)h+='<label class="field" for="fname"><span>Nombre <span class="opt">(opcional)</span></span><input id="fname" type="text" value="'+esc(f.name)+'"></label>';
    h+=vetoFields(f,["fmot","flug"]);
    h+='<label class="field" for="fdes">Fecha de veto<input id="fdes" type="date" max="'+TODAY+'" value="'+f.desde+'"></label>';
    var durs=[["0","Sin definir"],["w1","1 semana"],["w2","2 semanas"],["w3","3 semanas"],["1","1 mes"],["2","2 meses"],["3","3 meses"],["6","6 meses"],["otra","Otra fecha"]];
    h+='<div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:13px;font-weight:600">Duración del veto</span><div class="chips">'+durs.map(function(d){return '<button type="button" class="chipb" data-dur="'+d[0]+'" aria-pressed="'+(f.dur===d[0])+'">'+d[1]+'</button>'}).join("")+'</div>';
    if(f.dur==="otra")h+='<label class="field" for="fhas">Fecha de desveto<input id="fhas" type="date" value="'+(f.otra||"")+'"></label>';
    var hasta=untilOf(f);
    h+=hasta?'<div class="result"><span>Se desveta el</span><b>'+fmt(hasta)+'</b></div>':'<div class="result none"><span>Fecha de desveto</span><b>Sin definir</b></div>';
    h+='</div>';
    if(S.err)h+='<span class="err">'+S.err+'</span>';
    h+='<button class="btn red" type="submit">'+(p?"Guardar "+nth+"° veto":"Guardar veto")+'</button>';
  }
  return h+'</form>';
}
function vEdit(){
  var E=S.edit, v=E.vetos[E.vk];
  var h=header("Editar","detail","Cancelar")+'<form class="body" id="eform" novalidate>';
  h+=photoBox(E.photos.map(function(src,k){return {src:src,del:true,k:k}}),"data-delph","eph","La primera foto es la que sale en el menú. Toque × para quitar una.");
  h+='<label class="field" for="ename"><span>Nombre <span class="opt">(opcional)</span></span><input id="ename" type="text" value="'+esc(E.name)+'"></label>';
  if(E.vetos.length>1){h+='<div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:13px;font-weight:600">¿Cuál veto quiere editar?</span><div class="chips">'+E.vetos.map(function(x,k){return '<button type="button" class="chipb" data-vk="'+k+'" aria-pressed="'+(E.vk===k)+'">'+(k+1)+'° veto</button>'}).join("")+'</div></div>'}
  h+='<div class="card" style="gap:12px"><span class="lbl">'+(E.vk+1)+'° veto</span>'+vetoFields(v,["emot","elug"])+
   '<div class="two"><label class="field" for="edes">Fecha de veto<input id="edes" type="date" max="'+TODAY+'" value="'+v.desde+'"></label><label class="field" for="ehas">Fecha de desveto<input id="ehas" type="date" value="'+(v.hasta||"")+'"></label></div>'+
   '<span class="tsub" style="font-size:12px">Deje la fecha de desveto vacía si todavía no se sabe.</span></div>';
  if(S.err)h+='<span class="err">'+S.err+'</span>';
  h+='<button class="btn navy" type="submit">Guardar cambios</button>';
  if(S.me&&S.me.role==="supremo")h+='<button type="button" class="btn" data-delperson="1" style="background:'+(S.confirmDel?"var(--red)":"transparent")+';color:'+(S.confirmDel?"#fff":"var(--redtext)")+';border:1.5px solid var(--red);height:48px;font-size:15px">'+(S.confirmDel?"Toque otra vez para borrar todo el registro":"Borrar registro (solo si fue un error)")+'</button>';
  return h+'</form>';
}
function syncEdit(){var E=S.edit;if(!E)return;var v=E.vetos[E.vk];var g=function(id){var el=document.getElementById(id);return el?el.value:null};
  if(g("ename")!==null)E.name=g("ename");if(g("emot")!==null)v.motivo=g("emot");if(g("elug")!==null)v.lugar=g("elug");if(g("edes")!==null)v.desde=g("edes");if(g("ehas")!==null)v.hasta=g("ehas")||null}

function shareText(p){var v=last(p),n=p.vetos.length;
  var L2=["*VETADO · Squadra Servicios Logísticos*"];
  if(p.name&&p.name.trim())L2.push("Nombre: "+p.name.trim());
  L2.push("Vetado desde: "+fmt(v.desde),"Se desveta: "+(v.hasta?fmt(v.hasta):"Sin definir"));
  if(n>1)L2.push("Veces vetado: "+n);
  L2.push("Vetado en: "+locText(v));if(v.motivo)L2.push("Motivo: "+v.motivo);if(v.lugar)L2.push("Lugar: "+v.lugar);
  L2.push("","¿Aún sigue vetado?");return L2.join("\n")}
function vShare(){
  return '<div class="overlay" data-closeshare="1"><div class="sheet" role="dialog" aria-label="Compartir ficha">'+
   '<div class="row between"><b style="font-size:16px">Compartir ficha</b><button class="iconbtn" data-closeshare="1" aria-label="Cerrar" style="background:var(--chip);color:var(--fg)">'+IC.close+'</button></div>'+
   (S.shareImg?'<img src="'+S.shareImg+'" alt="Imagen de la ficha de veto" style="width:100%;border-radius:14px;display:block">':'<div class="empty"><div class="spin" style="margin:0 auto 10px"></div>Preparando la imagen…</div>')+
   '<button class="btn" data-sharepic="1" style="background:#25D366;color:#063A1C"'+(S.shareImg?'':' disabled')+'>'+IC.share+'Compartir foto</button>'+
   (S.shareImg&&!Backend.isNative()?'<a class="btn" href="'+S.shareImg+'" download="ficha-veto.png" style="background:var(--chip);color:var(--fg);text-decoration:none;height:48px;font-size:15px">Descargar imagen</a>':'')+
   '<span class="tsub" style="font-size:12px;text-align:center">Se manda solo la imagen. Usted escoge WhatsApp y el grupo.</span>'+
  '</div></div>'}

function vAccounts(){
  return header("Cuentas","list")+'<div class="body" style="gap:10px"><span class="tsub" style="font-size:13px">Solo Soporte ve esta pantalla y puede crear, editar o borrar cuentas.</span>'+
   (S.accLoading?'<div class="empty"><div class="spin" style="margin:0 auto 10px"></div>Cargando cuentas…</div>':'')+S.accounts.map(function(c){return '<button class="hrow" data-accopen="'+esc(c.uid)+'"><span class="hface" style="background:var(--navy)">'+esc(ini(c.name))+'</span><span class="info"><span style="font-size:15px;font-weight:600">'+esc(c.name)+(S.me.uid===c.uid?' <span style="font-weight:500;color:var(--muted)">(usted)</span>':'')+'</span><span class="why">Usuario: '+esc(c.user)+'</span></span>'+roleTag(c)+'</button>'}).join("")+
   '<button class="btn navy" data-accnew="1" style="margin-top:6px">'+IC.plus+'Crear cuenta</button>'+
   '<div class="card" style="gap:8px;margin-top:6px"><span class="lbl">Qué puede hacer cada uno</span><span style="font-size:13px;line-height:1.45"><b>Soporte:</b> todo, y además crea y edita cuentas.</span><span style="font-size:13px;line-height:1.45"><b>Administrador:</b> crea vetos, edita, desveta y vuelve a vetar. Puede tomar capturas y compartir. No crea cuentas.</span><span style="font-size:13px;line-height:1.45"><b>Consulta:</b> para el personal de filtro. Solo ve las fichas: sin capturas de pantalla ni compartir.</span><span style="font-size:13px;line-height:1.45"><b>Desactivada:</b> para quien ya no trabaja con ustedes. Pierde el acceso de inmediato.</span></div></div>'}
function vAccForm(){
  var A=S.acc, own=A.orig&&A.orig===S.me.uid;
  var h=header(A.orig?"Editar cuenta":"Crear cuenta","accounts","Cancelar")+'<form class="body" id="aform" novalidate>'+
   '<label class="field" for="aname">Nombre<input id="aname" type="text" value="'+esc(A.name)+'"></label>'+
   (A.orig?'<div class="card" style="gap:4px"><span class="tsub">Usuario</span><b>'+esc(A.user)+'</b><span class="tsub" style="font-size:12px">El usuario y la contraseña no se pueden cambiar desde aquí. Si alguien olvidó su clave, desactive esta cuenta y créele una nueva.</span></div>':
   '<label class="field" for="auser">Usuario<input id="auser" type="text" autocapitalize="none" spellcheck="false" placeholder="Ej. filtro.norte" value="'+esc(A.user)+'"></label>'+
   '<label class="field" for="apass">Contraseña<input id="apass" type="text" autocomplete="off" placeholder="Mínimo 6 caracteres" value="'+esc(A.pass)+'"></label><span class="tsub" style="font-size:12px;margin-top:-8px">Anote la contraseña y entréguesela a la persona. Ella la puede cambiar después en "Mi cuenta".</span>')+
   '<div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:13px;font-weight:600">Tipo de cuenta</span><div class="seg" role="group" aria-label="Tipo de cuenta" style="grid-template-columns:repeat(3,minmax(0,1fr))"><button type="button" data-arole="consulta" aria-pressed="'+(A.role==="consulta")+'">Consulta</button><button type="button" data-arole="admin" aria-pressed="'+(A.role==="admin")+'">Admin</button><button type="button" data-arole="supremo" aria-pressed="'+(A.role==="supremo")+'">Soporte</button></div>'+
   '<span class="tsub" style="font-size:12px">'+(A.role==="supremo"?"Soporte: puede hacer todo, tomar capturas y crear o editar cuentas.":A.role==="admin"?"Administrador: crea, edita, desveta y vuelve a vetar. Puede tomar capturas y compartir fichas. No crea cuentas.":"Consulta (filtro): solo ve las fichas. No puede tomar capturas, compartir ni cambiar nada.")+'</span></div>';
  if(A.orig&&!own)h+='<button type="button" class="btn" data-aoff="1" style="height:48px;font-size:15px;background:'+(A.off?"var(--green)":"var(--chip)")+';color:'+(A.off?"#fff":"var(--fg)")+'">'+(A.off?"Activar cuenta otra vez":"Desactivar cuenta (quitar acceso)")+'</button>'+(A.off?'<span class="err">Esta cuenta está desactivada: no puede entrar.</span>':'');
  if(S.err)h+='<span class="err">'+S.err+'</span>';
  h+='<button class="btn navy" type="submit">'+(A.orig?"Guardar cambios":"Crear cuenta")+'</button>';
  if(A.orig&&!own)h+='<button type="button" class="btn" data-delacc="1" style="background:'+(S.confirmDel?"var(--red)":"transparent")+';color:'+(S.confirmDel?"#fff":"var(--redtext)")+';border:1.5px solid var(--red);height:48px;font-size:15px">'+(S.confirmDel?"Toque otra vez para borrar la cuenta":"Borrar cuenta")+'</button>';
  return h+'</form>'}
function syncAcc(){var A=S.acc;if(!A)return;["aname:name","auser:user","apass:pass"].forEach(function(x){var q=x.split(":"),el=document.getElementById(q[0]);if(el)A[q[1]]=el.value})}

function untilOf(f){if(f.dur==="0")return null;if(f.dur==="otra")return f.otra||null;if(!f.desde)return null;if(f.dur.charAt(0)==="w"){var d=parse(f.desde);d.setDate(d.getDate()+7*(+f.dur.slice(1)));return iso(d)}return addMonths(f.desde,+f.dur)}

function vHist(){
  var rows=[];S.people.forEach(function(p){p.vetos.forEach(function(v,k){rows.push({p:p,v:v,k:k,on:k===p.vetos.length-1&&active(p)})})});
  rows.sort(function(a,b){return b.v.desde<a.v.desde?-1:1});
  return header("Historial de vetos","list")+'<div class="body" style="gap:10px"><span class="tsub" style="font-size:13px">'+rows.length+' vetos guardados, del más reciente al más antiguo.</span>'+rows.map(function(r){return '<button class="hrow" data-open="'+r.p.id+'"><span class="hface" style="'+face(r.p)+'">'+faceTxt(r.p)+'</span><span class="info"><span class="row between" style="gap:8px"><span style="font-size:14px;font-weight:600">'+esc(nm(r.p))+' <span style="font-weight:500;color:var(--muted)">· '+(r.k+1)+'° veto</span></span><span class="tag '+(r.on?"r":"g")+'">'+(r.on?"VETADO":"DESVETADO")+'</span></span>'+(r.v.motivo?'<span class="why">'+esc(r.v.motivo)+'</span>':'')+(r.v.lugar?'<span class="why">Lugar: '+esc(r.v.lugar)+'</span>':'')+'<span class="why">Vetado en: '+esc(locText(r.v,true))+'</span><span style="font-size:12px"><b>Veto:</b> '+fmt(r.v.desde)+' · <b>Desveto:</b> '+(r.v.hasta?fmt(r.v.hasta):"sin definir")+'</span></span></button>'}).join("")+'</div>';
}

function render(){
  var app=document.getElementById("app"), V=S.view;
  app.innerHTML = V==="start"?vStart():V==="login"?vLogin():V==="list"?vList():V==="detail"?vDetail():V==="form"?vForm():V==="edit"?vEdit():V==="accounts"?vAccounts():V==="accform"?vAccForm():V==="pwd"?vPwd():vHist();
  var zp=V==="detail"&&S.zoom?find(S.id):null;
  if(V==="detail"&&!find(S.id)){S.view="list";return render()}
  var lsel=document.querySelector('.loc[aria-pressed="true"]');if(lsel){var lc=lsel.parentNode;lc.scrollLeft=lsel.offsetLeft-lc.offsetLeft-lc.clientWidth/2+lsel.offsetWidth/2}
  document.getElementById("sheet").innerHTML = (S.busy?'<div class="busy" role="status"><div><span class="spin"></span>'+esc(S.busy)+'</div></div>':"")+(S.menu?vMenu():"")+(S.crop&&S.crop.img?vCrop():(S.share&&V==="detail")?vShare():zp&&zp.photos.length?'<div class="overlay" style="align-items:center;background:rgba(0,0,0,.92)"><img alt="Foto de '+esc(nm(zp))+'" src="'+zp.photos[Math.min(S.photo,zp.photos.length-1)]+'" style="max-width:100%;max-height:85%;object-fit:contain"><button class="iconbtn" data-closeshare="1" aria-label="Cerrar foto" style="position:fixed;top:calc(14px + env(safe-area-inset-top,0px));right:calc(14px + env(safe-area-inset-right,0px));background:rgba(255,255,255,.18)">'+IC.close+'</button></div>':"");
  if(S.crop&&S.crop.img)wireCrop();
  syncGuard();
  if(V==="login"){var lu=document.getElementById("lu");lu&&lu.focus()}
}

function newForm(extra){var f={mode:"nueva",pid:null,fromDetail:false,photos:[],name:"",pq:"",motivo:"",lugar:"",desde:TODAY,dur:"0",otra:"",locales:["todos"]};for(var k in extra)f[k]=extra[k];return f}
function syncForm(){var f=S.form;if(!f)return;["fname:name","fmot:motivo","flug:lugar","fdes:desde","fhas:otra"].forEach(function(x){var p=x.split(":"),el=document.getElementById(p[0]);if(el)f[p[1]]=el.value})}

function readPhotos(files,cb){
  var out=[],list=Array.prototype.slice.call(files||[]),left=list.length;if(!left)return cb(out);
  list.forEach(function(file,idx){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var m=1600,s=Math.min(1,m/Math.max(img.width,img.height));var c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);out[idx]=c.toDataURL("image/jpeg",0.9);if(--left===0)cb(out.filter(Boolean))};img.onerror=function(){if(--left===0)cb(out.filter(Boolean))};img.src=r.result};r.readAsDataURL(file)});
}
var CS=640;
function startCrop(list,target){if(!list.length)return;S.crop={queue:list,target:target,total:list.length};nextCrop()}
function nextCrop(){var C=S.crop;if(!C||!C.queue.length){S.crop=null;render();return}
  var img=new Image();img.onload=function(){C.img=img;C.zoom=1;C.x=0;C.y=0;C.rot=0;render()};img.src=C.queue[0]}
function vCrop(){var C=S.crop,n=C.total-C.queue.length+1;
  return '<div class="overlay" style="align-items:center;background:rgba(3,10,20,.94)"><div class="sheet cropbox" role="dialog" aria-label="Recortar foto">'+
   '<div class="row between"><b style="font-size:16px">Recortar foto'+(C.total>1?' '+n+' de '+C.total:'')+'</b><button type="button" class="iconbtn" data-cropcancel="1" aria-label="Cancelar" style="background:var(--chip);color:var(--fg)">'+IC.close+'</button></div>'+
   '<canvas id="cc" width="'+CS+'" height="'+CS+'" aria-label="Arrastre para mover la foto"></canvas>'+
   '<span class="tsub" style="font-size:12px;text-align:center">Arrastre la foto para acomodar la cara. Use la barra para acercar.</span>'+
   '<div class="row" style="gap:10px"><label for="cz" style="font-size:13px;font-weight:600">Zoom</label><input id="cz" type="range" min="1" max="4" step="0.01" value="'+C.zoom+'" style="flex:1"><button type="button" class="iconbtn" data-croprot="1" aria-label="Girar foto" style="background:var(--chip);color:var(--fg)">'+IC.rot+'</button></div>'+
   '<button type="button" class="btn navy" data-cropok="1">Usar esta foto</button>'+
   (C.total>1?'<button type="button" class="btn" data-cropskip="1" style="background:var(--chip);color:var(--fg);height:46px;font-size:15px">Saltar esta foto</button>':'')+
  '</div></div>'}
function drawCrop(){var C=S.crop,cv=document.getElementById("cc");if(!C||!cv||!C.img)return;var g=cv.getContext("2d"),w=C.img.width,h=C.img.height,r=C.rot%2;
  var base=Math.max(CS/(r?h:w),CS/(r?w:h)),sc=base*C.zoom;
  var mx=Math.max(0,((r?h:w)*sc-CS)/2),my=Math.max(0,((r?w:h)*sc-CS)/2);C.x=Math.max(-mx,Math.min(mx,C.x));C.y=Math.max(-my,Math.min(my,C.y));
  g.save();g.fillStyle="#000";g.fillRect(0,0,CS,CS);g.translate(CS/2+C.x,CS/2+C.y);g.rotate(C.rot*Math.PI/2);g.scale(sc,sc);g.drawImage(C.img,-w/2,-h/2);g.restore()}
function wireCrop(){var cv=document.getElementById("cc");if(!cv)return;drawCrop();var drag=null;
  cv.addEventListener("pointerdown",function(e){drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)});
  cv.addEventListener("pointermove",function(e){if(!drag)return;var k=CS/cv.clientWidth;S.crop.x+=(e.clientX-drag.x)*k;S.crop.y+=(e.clientY-drag.y)*k;drag={x:e.clientX,y:e.clientY};drawCrop()});
  cv.addEventListener("pointerup",function(){drag=null});cv.addEventListener("pointercancel",function(){drag=null});
  cv.addEventListener("wheel",function(e){e.preventDefault();S.crop.zoom=Math.max(1,Math.min(4,S.crop.zoom*(e.deltaY<0?1.08:0.93)));document.getElementById("cz").value=S.crop.zoom;drawCrop()},{passive:false});
  document.getElementById("cz").addEventListener("input",function(e){S.crop.zoom=+e.target.value;drawCrop()})}
function finishCrop(use){var C=S.crop;if(use){var src=document.getElementById("cc").toDataURL("image/jpeg",0.88);
  if(C.target==="form")S.form.photos.push(src);else if(C.target==="edit"){S.edit.photos.push(src);S.edit.ids.push(null)}else{addDetailPhoto(src)}}
  C.queue.shift();nextCrop()}

document.addEventListener("click",function(e){
  var t=e.target.closest("button,[data-go]");if(!t)return;
  var d=t.dataset;
  if(d.cropok){finishCrop(true);return}
  if(d.cropskip){finishCrop(false);return}
  if(d.cropcancel){S.crop=null;render();return}
  if(d.croprot){S.crop.rot=(S.crop.rot+1)%4;S.crop.x=0;S.crop.y=0;drawCrop();return}
  if(d.pick!==undefined){syncForm();S.form.pid=d.pick||null;if(d.pick)S.form.locales=locs(last(find(d.pick))).slice();S.err="";render();window.scrollTo(0,0);if(d.pick)ensurePhotos(find(d.pick));return}
  if(d.delfph){syncForm();S.form.photos.splice(+d.delfph,1);render();return}
  if(d.menu){S.menu=true;render();return}
  if(d.closemenu){S.menu=false;render();return}
  if(d.logout){S.menu=false;Backend.logout();return}
  if(d.pwd){S.menu=false;go("pwd");return}
  if(d.sharepic){sharePicture();return}
  if(d.share){S.share=true;S.shareImg="";render();prepareShare();return}
  if(d.closeshare){S.share=false;S.zoom=false;render();return}
  if(d.copy){var txt=document.getElementById("stext"),cb=document.getElementById("copybtn");
    var ok=function(){cb.textContent="Mensaje copiado"},fb=function(){txt.focus();txt.select();cb.textContent="Mensaje seleccionado: cópielo"};
    try{navigator.clipboard.writeText(txt.value).then(ok,fb)}catch(_){fb()}return}
  if(d.accnew){S.acc={orig:null,name:"",user:"",pass:"",role:"consulta",off:false};S.confirmDel=false;go("accform");return}
  if(d.accopen){var c=S.accounts.filter(function(x){return x.uid===d.accopen})[0];S.acc={orig:c.uid,name:c.name,user:c.user,pass:"",role:c.role,off:!!c.off};S.confirmDel=false;go("accform");return}
  if(d.aoff){syncAcc();S.acc.off=!S.acc.off;render();return}
  if(d.arole){syncAcc();S.acc.role=d.arole;S.err="";render();return}
  if(d.delacc){syncAcc();if(!S.confirmDel){S.confirmDel=true;render();return}
    var gone=S.acc;S.confirmDel=false;
    save("Borrando cuenta…",Backend.deleteAccount(gone.orig),function(){S.acc=null;openAccounts();notify("Cuenta borrada: "+gone.name)});return}
  if(d.go==="accounts"){e.preventDefault();openAccounts();return}
  if(d.go){e.preventDefault();go(d.go);return}
  if(d.role){S.role=d.role;S.tab="vetados";S.q="";go("list");return}
  if(d.tab){S.tab=d.tab;render();return}
  if(d.loc){S.loc=d.loc;try{localStorage.setItem("squadra.loc",d.loc)}catch(_){}render();return}
  if(d.floc){syncForm();S.form.locales=toggleLoc(locs(S.form),d.floc);render();return}
  if(d.eloc){syncEdit();var ev=S.edit.vetos[S.edit.vk];ev.locales=toggleLoc(locs(ev),d.eloc);render();return}
  if(d.open){go("detail",{id:d.open,photo:0});ensurePhotos(find(d.open));return}
  if(d.photo){S.photo=+d.photo;render();return}
  if(d["new"]){S.form=newForm({});go("form");return}
  if(d.zoom){S.zoom=true;render();return}
  if(d.delperson){syncEdit();if(!S.confirmDel){S.confirmDel=true;render();return}
    var gp=find(S.edit.pid);S.confirmDel=false;
    save("Borrando…",Backend.deletePerson(gp.id),function(){S.edit=null;go("list");notify("Registro borrado: "+nm(gp))});return}
  if(d.edit){var pe=find(S.id);S.confirmDel=false;
    withPhotos(pe,function(){S.edit={pid:pe.id,name:pe.name||"",photos:pe.photos.slice(),ids:pe.photoIds.slice(),vk:pe.vetos.length-1,vetos:pe.vetos.map(function(x){return {desde:x.desde,hasta:x.hasta,motivo:x.motivo,lugar:x.lugar,locales:locs(x).slice()}})};go("edit")});return}
  if(d.vk){syncEdit();S.edit.vk=+d.vk;S.err="";render();return}
  if(d.delph){syncEdit();S.edit.photos.splice(+d.delph,1);S.edit.ids.splice(+d.delph,1);render();return}
  if(d.revetar){var pr=find(S.id);S.form=newForm({mode:"antes",pid:S.id,fromDetail:true,locales:locs(last(pr)).slice()});go("form");ensurePhotos(pr);return}
  if(d.mode){syncForm();S.form.mode=d.mode;S.form.pid=null;S.err="";render();return}
  if(d.dur){syncForm();S.form.dur=d.dur;render();return}
  if(d.desvetar){var dv=document.getElementById("dv").value,p=find(S.id),v=last(p);
    if(!dv){S.err="Escoja la fecha de desveto.";render();return}
    if(dv<v.desde){S.err="La fecha de desveto no puede ser antes de la fecha de veto ("+fmt(v.desde)+").";render();return}
    var nv=p.vetos.map(function(x){return Object.assign({},x)});nv[nv.length-1].hasta=dv;S.err="";
    save("Guardando…",Backend.setVetos(p.id,nv),function(){notify(dv<=TODAY?"Desvetado: "+nm(p):nm(p)+" se desveta el "+fmt(dv))});return}
});
document.addEventListener("input",function(e){
  if(e.target.id==="pq"){S.form.pq=e.target.value;syncForm();var pp2=e.target.selectionStart;render();var pq=document.getElementById("pq");pq.focus();try{pq.setSelectionRange(pp2,pp2)}catch(_){}}
  if(e.target.id==="q"){S.q=e.target.value;var pos=e.target.selectionStart;render();var q=document.getElementById("q");q.focus();try{q.setSelectionRange(pos,pos)}catch(_){}}
});
document.addEventListener("change",function(e){
  var id=e.target.id;
  if(id==="fdes"||id==="fhas"){syncForm();render()}
  if(id==="fph"){syncForm();readPhotos(e.target.files,function(a){startCrop(a,"form")})}
  if(id==="eph"){syncEdit();readPhotos(e.target.files,function(a){startCrop(a,"edit")})}
  if(id==="addph"){readPhotos(e.target.files,function(a){startCrop(a,"detail")})}
});
document.addEventListener("submit",function(e){
  e.preventDefault();
  if(e.target.id==="loginf"){var u=cleanUser(document.getElementById("lu").value),pw=document.getElementById("pw").value;
    if(!u||!pw){S.err="Escriba su usuario y su contraseña.";render();return}
    save("Entrando…",Backend.login(u,pw),function(){});return}
  if(e.target.id==="setupf"){var sn=document.getElementById("sname").value.trim(),su=cleanUser(document.getElementById("lu").value),sp=document.getElementById("pw").value,sp2=document.getElementById("pw2").value;
    if(!sn){S.err="Escriba el nombre.";render();return}
    if(!validUser(su)){S.err="El usuario solo puede tener letras, números, punto, guion o guion bajo, sin espacios.";render();return}
    if(sp.length<6){S.err="La contraseña debe tener al menos 6 caracteres.";render();return}
    if(sp!==sp2){S.err="Las dos contraseñas no coinciden.";render();return}
    save("Creando cuenta de Soporte…",Backend.setup({name:sn,user:su,pass:sp}),function(){S.setup=false});return}
  if(e.target.id==="pwdf"){var o=document.getElementById("pold").value,n1=document.getElementById("pnew").value,n2=document.getElementById("pnew2").value;
    if(n1.length<6){S.err="La nueva contraseña debe tener al menos 6 caracteres.";render();return}
    if(n1!==n2){S.err="Las dos contraseñas nuevas no coinciden.";render();return}
    save("Cambiando contraseña…",Backend.changePassword(o,n1),function(){go("list");notify("Contraseña cambiada")});return}
  if(e.target.id==="aform"){
    syncAcc();var A=S.acc;A.user=cleanUser(A.user);A.name=A.name.trim();
    if(!A.name){S.err="Escriba el nombre.";render();return}
    if(!A.orig){
      if(!validUser(A.user)){S.err="El usuario solo puede tener letras, números, punto, guion o guion bajo, sin espacios.";render();return}
      if(S.accounts.some(function(x){return x.user===A.user})){S.err="Ese usuario ya existe. Escoja otro.";render();return}
      if(A.pass.length<6){S.err="La contraseña debe tener al menos 6 caracteres.";render();return}}
    var others=S.accounts.filter(function(x){return x.role==="supremo"&&!x.off&&x.uid!==A.orig}).length;
    if((A.role!=="supremo"||A.off)&&others===0){S.err="Tiene que quedar al menos una cuenta de Soporte activa.";render();return}
    var job=A.orig?Backend.updateAccount(A.orig,{name:A.name,role:A.role,off:!!A.off}):Backend.createAccount({name:A.name,user:A.user,pass:A.pass,role:A.role});
    var was=A.orig,nm2=A.name;
    save(was?"Guardando…":"Creando cuenta…",job,function(){S.acc=null;openAccounts();notify(was?"Cuenta actualizada: "+nm2:"Cuenta creada: "+nm2)});return}
  if(e.target.id==="eform"){
    syncEdit();var E=S.edit,pp=find(E.pid);
    if(!E.photos.length){S.err="Tiene que quedar al menos una foto.";render();return}
    for(var j=0;j<E.vetos.length;j++){var y=E.vetos[j];
      if(y.desde&&y.desde>TODAY){E.vk=j;S.err="La fecha de veto no puede ser una fecha futura.";render();return}
      if(j>0&&E.vetos[j-1].hasta&&y.desde&&y.desde<E.vetos[j-1].hasta){E.vk=j;S.err="El "+(j+1)+"° veto empieza antes de que terminara el "+j+"° ("+fmt(E.vetos[j-1].hasta)+").";render();return}}
    for(var k=0;k<E.vetos.length;k++){var x=E.vetos[k];
      if(!x.desde){E.vk=k;S.err="El "+(k+1)+"° veto necesita fecha de veto.";render();return}
      if(x.hasta&&x.hasta<=x.desde){E.vk=k;S.err="En el "+(k+1)+"° veto, la fecha de desveto tiene que ser después de la fecha de veto.";render();return}
      if(k<E.vetos.length-1&&!x.hasta){E.vk=k;S.err="El "+(k+1)+"° veto ya pasó: póngale fecha de desveto.";render();return}}
    var keep=E.ids.filter(Boolean),removed=pp.photoIds.filter(function(id){return keep.indexOf(id)<0});
    var added=E.photos.filter(function(s,k){return !E.ids[k]});
    var order=E.ids.map(function(id,k){return id||null});
    var data={name:E.name.trim(),vetos:E.vetos.map(function(x){return {desde:x.desde,hasta:x.hasta||null,motivo:(x.motivo||"").trim(),lugar:(x.lugar||"").trim(),locales:locs(x).slice()}}),
      remove:removed,keepOrder:order,photos:E.photos,photosChanged:removed.length>0||added.length>0||E.ids.join()!==pp.photoIds.join()};
    save("Guardando cambios…",Backend.updatePerson(pp.id,data),function(){S.edit=null;go("detail",{id:pp.id,photo:0});ensurePhotos(find(pp.id));notify("Cambios guardados: "+nm(pp))});return}
  if(e.target.id==="vform"){
    syncForm();var f=S.form,p=f.pid?find(f.pid):null;
    if(f.mode==="antes"&&!p){S.err="Toque la cara de la persona que ya fue vetada.";render();return}
    if(!f.photos.length&&!(p&&(p.photos.length||p.thumb))){S.err="Agregue al menos una foto de la persona.";render();return}
    if(!f.desde)f.desde=TODAY;
    if(f.desde>TODAY){S.err="La fecha de veto no puede ser una fecha futura.";render();return}
    if(p&&last(p).hasta&&f.desde<last(p).hasta){S.err="La fecha de veto tiene que ser después del último desveto ("+fmt(last(p).hasta)+").";render();return}
    var hasta=untilOf(f);
    if(f.dur==="otra"&&!hasta){S.err="Escoja la fecha de desveto o marque Sin definir.";render();return}
    if(hasta&&hasta<=f.desde){S.err="La fecha de desveto tiene que ser después de la fecha de veto.";render();return}
    var veto={desde:f.desde,hasta:hasta,motivo:f.motivo.trim(),lugar:f.lugar.trim(),locales:locs(f).slice()};
    var job=p?Backend.addVeto(p.id,p.vetos.concat([veto]),f.photos):Backend.createPerson({name:f.name.trim(),vetos:[veto],photos:f.photos});
    var label=p?(p.vetos.length+1)+"° veto: "+nm(p):"Nuevo veto"+(f.name.trim()?": "+f.name.trim():"");
    save("Guardando veto…",job,function(id){S.form=null;S.tab="vetados";S.q="";S.mine[id]=Date.now();go("detail",{id:id,photo:0});ensurePhotos(find(id));notify(label)});
  }
});
function applyLayout(){document.getElementById("phone").classList.toggle("pc",window.innerWidth>=900)}
window.addEventListener("resize",applyLayout);applyLayout();
document.addEventListener("click",function(e){if(e.target.classList&&e.target.classList.contains("overlay")){S.share=false;S.zoom=false;S.menu=false;render()}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&(S.share||S.zoom||S.menu)){S.share=false;S.zoom=false;S.menu=false;render()}});

/* ===================== Conexión con la base de datos ===================== */
S.mine={};S.booting=true;S.setup=false;
function cleanUser(u){return String(u||"").trim().toLowerCase()}
function validUser(u){return /^[a-z0-9._-]{3,30}$/.test(u)}
function colorFor(id){var h=0;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return COLORS[h%COLORS.length]}

/* Ejecuta un guardado mostrando "Guardando…" y muestra el error en pantalla si falla */
function save(label,promise,done){
  S.busy=label;S.err="";render();
  Promise.resolve(promise).then(function(r){S.busy="";render();if(done)done(r)},function(err){S.busy="";S.err=Backend.message(err);render()});
}

/* Fotos completas: se cargan aparte y se guardan en memoria */
function applyCache(p){var c=S.photoCache[p.id];if(c&&c.fv===p.fv){p.photos=c.photos;p.photoIds=c.ids}else{p.photos=[];p.photoIds=[]}}
function ensurePhotos(p,cb){
  if(!p)return;applyCache(p);
  if(p.photos.length||!p.nFotos){if(cb)cb();return}
  if(p._loading){if(cb)p._loading.push(cb);return}
  p._loading=cb?[cb]:[];var fv=p.fv,id=p.id;
  Backend.getPhotos(id).then(function(list){
    S.photoCache[id]={fv:fv,photos:list.map(function(x){return x.data}),ids:list.map(function(x){return x.id})};
    var q=find(id);if(q){applyCache(q)}var w=p._loading;p._loading=null;render();w.forEach(function(f){f()});
  },function(err){p._loading=null;S.err=Backend.message(err);render()});
}
function withPhotos(p,cb){S.busy="Cargando fotos…";render();ensurePhotos(p,function(){S.busy="";cb()});if(p.photos.length||!p.nFotos){S.busy="";}}
function addDetailPhoto(src){var p=find(S.id);if(!p)return;
  withPhotos(p,function(){save("Guardando foto…",Backend.updatePerson(p.id,{name:p.name,vetos:p.vetos,remove:[],keepOrder:p.photoIds.concat([null]),photos:p.photos.concat([src]),photosChanged:true}),function(){ensurePhotos(find(p.id))})})}

/* Cuentas */
function openAccounts(){S.accLoading=true;go("accounts");
  Backend.listAccounts().then(function(list){S.accLoading=false;S.accounts=list.sort(function(a,b){return a.name.localeCompare(b.name)});render()},function(err){S.accLoading=false;S.err=Backend.message(err);render()})}

/* Menú "Mi cuenta" */
function vMenu(){return '<div class="overlay"><div class="sheet" role="dialog" aria-label="Mi cuenta">'+
  '<div class="row between"><span style="display:flex;flex-direction:column;gap:2px"><b style="font-size:16px">'+esc(S.me?S.me.name:"")+'</b><span class="tsub">Usuario: '+esc(S.me?S.me.user:"")+'</span></span><button class="iconbtn" data-closemenu="1" aria-label="Cerrar" style="background:var(--chip);color:var(--fg)">'+IC.close+'</button></div>'+
  '<button class="menuitem" data-pwd="1">'+IC.lock+'Cambiar mi contraseña</button>'+
  '<button class="menuitem" data-logout="1" style="color:var(--redtext)">'+IC.exit+'Salir</button></div></div>'}
function vPwd(){return header("Cambiar contraseña","list","Cancelar")+'<form class="body" id="pwdf" novalidate>'+
  '<label class="field" for="pold">Contraseña actual<input id="pold" type="password" autocomplete="current-password"></label>'+
  '<label class="field" for="pnew">Nueva contraseña<input id="pnew" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label>'+
  '<label class="field" for="pnew2">Repita la nueva contraseña<input id="pnew2" type="password" autocomplete="new-password"></label>'+
  (S.err?'<span class="err">'+S.err+'</span>':'')+'<button class="btn navy" type="submit">Cambiar contraseña</button></form>'}

/* Imagen de la ficha para compartir */
function loadImg(src){return new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=no;i.src=src})}
function wrap(g,text,x,y,maxW,lh,maxLines){var words=String(text).split(/\s+/),line="",n=0;
  for(var i=0;i<words.length;i++){var t=line?line+" "+words[i]:words[i];if(g.measureText(t).width>maxW&&line){g.fillText(line,x,y);y+=lh;line=words[i];if(++n>=maxLines-1){line+=" …";break}}else line=t}
  g.fillText(line,x,y);return y+lh}
function fichaImage(p){
  var v=last(p),n=p.vetos.length,W=900,named=!!(p.name&&p.name.trim());
  var H=120+900+70+(named?72:0)+110+130+40;
  var c=document.createElement("canvas");c.width=W;c.height=H;var g=c.getContext("2d");
  return Promise.all([loadImg(p.photos[0]||p.thumb),loadImg(ICON).catch(function(){return null})]).then(function(r){
    var img=r[0],ic=r[1];
    g.fillStyle="#03264C";g.fillRect(0,0,W,H);
    if(ic)g.drawImage(ic,40,26,68,68);
    g.fillStyle="#B9C7DA";g.font="600 26px Inter, Arial, sans-serif";g.fillText("SQUADRA · FICHA DE VETO",126,72);
    var s=Math.max(W/img.width,900/img.height);g.save();g.beginPath();g.rect(0,120,W,900);g.clip();
    g.drawImage(img,(W-img.width*s)/2,120+(900-img.height*s)/2,img.width*s,img.height*s);g.restore();
    var y=1080;g.font="700 30px Inter, Arial, sans-serif";
    g.fillStyle="#B42318";g.fillRect(40,y-40,170,56);g.fillStyle="#fff";g.fillText("VETADO",62,y-2);
    if(n>1){g.fillStyle="#fff";g.fillRect(226,y-40,170,56);g.fillStyle="#03264C";g.fillText(n+"° veto",250,y-2)}
    y+=70;
    if(named){g.fillStyle="#fff";g.font="800 54px Montserrat, Arial, sans-serif";g.fillText(p.name.trim().slice(0,28),40,y+20);y+=72}
    g.font="500 30px Inter, Arial, sans-serif";g.fillStyle="#B9C7DA";g.fillText("Vetado desde",40,y+10);if(v.hasta)g.fillText("Se desveta",470,y+10);
    g.fillStyle="#fff";g.font="700 38px Inter, Arial, sans-serif";g.fillText(fmt(v.desde),40,y+58);if(v.hasta)g.fillText(fmt(v.hasta),470,y+58);y+=110;
    g.font="500 30px Inter, Arial, sans-serif";g.fillStyle="#B9C7DA";g.fillText("Vetado en",40,y+10);
    g.fillStyle="#fff";g.font="700 34px Inter, Arial, sans-serif";wrap(g,locText(v),40,y+56,W-80,42,2);
    return c.toDataURL("image/png");
  });
}
function sharePicture(){
  if(!S.shareImg)return;S.busy="Abriendo compartir…";render();
  Backend.shareImage(S.shareImg,"").then(function(){S.busy="";render()},function(err){
    S.busy="";render();if(err&&err.name==="AbortError")return;
    notify(Backend.isNative()?"No se pudo compartir. Intente de nuevo.":"Este navegador no comparte imágenes: use Descargar imagen.")});
}
function prepareShare(){var p=find(S.id);if(!p)return;S.shareImg="";
  ensurePhotos(p,function(){fichaImage(p).then(function(url){S.shareImg=url;render()},function(){S.share=false;render();notify("No se pudo preparar la imagen.")})})}

/* Sesión y datos en vivo */
var stopPeople=null,firstSnap=true;
function onPeople(list,changes,fromCache){
  var prev={};S.people.forEach(function(p){prev[p.id]=p});
  S.people=list.map(function(p){p.color=colorFor(p.id);applyCache(p);return p});
  S.ready=true;S.offline=!!fromCache&&!navigator.onLine;
  if(!firstSnap){changes.forEach(function(ch){
    var p=find(ch.id);if(!p||ch.type==="removed")return;var old=prev[p.id];
    var isNew=!old||p.vetos.length>old.vetos.length;
    if(isNew&&active(p)&&!ch.local&&!S.busy&&!(S.mine[p.id]&&Date.now()-S.mine[p.id]<15000)){
      var txt=(p.vetos.length>1?p.vetos.length+"° veto: ":"Nuevo veto: ")+nm(p)+" · "+locText(last(p),true);notify(txt);Backend.localNotify("Squadra Vetados",txt)}
  })}
  firstSnap=false;render();
}
Backend.onSession(function(me,reason){
  S.booting=false;
  if(stopPeople){stopPeople();stopPeople=null}
  if(!me){
    S.me=null;S.role=null;S.people=[];S.ready=false;S.photoCache={};S.accounts=[];Backend.protectScreen(true);
    var show=function(need){S.setup=need;go("start");S.err=reason||"";render()};Backend.needsSetup().then(show,function(){show(false)});
    return;
  }
  if(me.role==="consulta"&&!Backend.isNative()){Backend.logout("Las cuentas de filtro solo pueden entrar desde la app de Android.");return}
  var first=!S.me;S.me=me;S.role=me.role==="consulta"?"consulta":"admin";
  Backend.protectScreen(me.role==="consulta");
  if(first){S.tab="vetados";S.q="";firstSnap=true;S.ready=false;go("list");Backend.askNotifications()}else render();
  stopPeople=Backend.watchPeople(onPeople,function(err){S.err=Backend.message(err);render()});
});
window.addEventListener("online",function(){S.offline=false;render()});
window.addEventListener("offline",function(){S.offline=true;render()});
/* Botón "atrás" del celular (y del navegador): vuelve a la pantalla anterior en vez de cerrar la app */
var guard=false,consuming=false;
function overlayOpen(){return !!(S.crop||S.share||S.zoom||S.menu)}
function syncGuard(){
  var needs=(S.view!=="list"&&S.view!=="start")||overlayOpen();
  if(needs&&!guard){try{history.pushState({squadra:1},"");guard=true}catch(_){}}
  else if(!needs&&guard){guard=false;consuming=true;try{history.back()}catch(_){consuming=false}}
}
function appBack(){
  if(S.busy){syncGuard();return}
  if(S.crop){S.crop=null;render();return}
  if(S.zoom||S.share||S.menu){S.zoom=false;S.share=false;S.menu=false;render();return}
  var V=S.view;
  if(V==="edit"){S.edit=null;go("detail");return}
  if(V==="form"){var fd=S.form&&S.form.fromDetail;S.form=null;go(fd?"detail":"list");return}
  if(V==="accform"){S.acc=null;go("accounts");return}
  if(V==="detail"||V==="historial"||V==="accounts"||V==="pwd"){go("list");return}
  render();
}
window.addEventListener("popstate",function(){
  if(consuming){consuming=false;return}
  guard=false;appBack();
});
render();
window.__squadraReady=true;
