// V6.0-dev-v71: columna izquierda equipo/cliente/ganancia/tasa; derecha inversión/incremento/impacto; pie con etiquetas compactas y botón ancho.
const APP_VERSION="6.0-dev-v82";
// V6.0-dev-v69: ficha compacta con fecha y equipo/cliente separados, métricas financieras repartidas a todo el ancho y técnico abreviado junto a la acción.
// V6.0-dev-v66: el ticket ID ocupa toda la fila superior de la tarjeta económica y admite saltos de línea en IDs largos.
// V6.0-dev-v65: mostrar el técnico responsable en la lista de Contabilidad y en su ficha económica sin alterar los datos económicos.
// V6.0-dev-v63: ordenar tickets y movimientos ECN juntos usando la fecha propia de cada tipo.
// V6.0-dev-v62: obtener username mediante una acción autenticada del servidor; evita depender de lectura REST directa del perfil.
// V6.0-dev-v61: la cabecera obtiene el username del perfil autenticado en public.profiles; no confía en metadatos de nombre editables/obsoletos.
// V6.0-dev-v60: operaciones asíncronas muestran actividad y bloquean dobles pulsaciones hasta confirmar éxito o error.
function setButtonBusy(button,label="Procesando…"){
 if(!button)return ()=>{};
 const original=button.innerHTML,wasDisabled=button.disabled;
 button.disabled=true;button.classList.add("is-loading");button.setAttribute("aria-busy","true");
 button.innerHTML='<span class="button-spinner" aria-hidden="true"></span><span>'+String(label).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))+'</span>';
 return ()=>{button.innerHTML=original;button.disabled=wasDisabled;button.classList.remove("is-loading");button.removeAttribute("aria-busy");};
}
// V6.0-dev-v59: los usuarios con varias membresías activas pueden cambiar el taller usado en este dispositivo; cada contexto local y su cola permanecen separados.
// V6.0-dev-v58: la auditoría reciente se mantiene colapsada en un desplegable dentro de la consola ya protegida por autorización global del servidor.
// V6.0-dev-v57: dirigir la recuperación a la ruta marcada reset_password y reconocer el token de recuperación sin depender de que el fragmento sea la única fuente de parámetros.
// V6.0-dev-v56: retirar avisos de revisión obsoletos solo cuando no hay operaciones pendientes y el registro local ya confirma una versión igual o más reciente.
// V6.0-dev-v55: aumentar ligeramente el logo y la tipografía de la marca y del usuario; conservar intacto el tamaño de los botones.
// V6.0-dev-v52: restaurar el texto completo «Gestión del Taller» y mostrar la versión en una segunda línea bajo el logo.
// V6.0-dev-v38: confirmar contraseña inicial y revelar/ocultar contraseñas; publicar al elegir conservar local y señalizar errores/éxitos con iconos.
const KEY="taller_electronica_v5";
const ECON_CONFIG_KEY="taller_electronica_economia_config";
const SHARED_SETTINGS_KEY="nexum_shared_settings_v1";
const OLD_KEYS=["taller_electronica_v4","taller_electronica_v3","taller_electronica_v2","taller_electronica_v1"];
const DEFAULT_CATEGORIES=["Sin definir","Electrodomésticos","Electrónica","Cargadores","Ventiladores","Batería litio","Televisión","Recargables","Energía","Vehículos"];
const CATEGORIES_KEY="nexum_categories_v1", SETTINGS_KEY="nexum_settings_v1";

/*
 * V6.0-dev-v46 — recarga completa después de iniciar sesión.
 * V6.0-dev-v45 — asignación del taller obtenida de la membresía autenticada.
 * V6.0-dev-v44 — aislamiento local por taller activo.
 * Las claves históricas globales NO se leen, modifican ni borran automáticamente:
 * permanecen intactas hasta que el usuario decida explícitamente cómo migrarlas.
 */
const WORKSHOP_SCOPED_KEYS = new Set([
 "taller_electronica_v5","taller_electronica_v4","taller_electronica_v3","taller_electronica_v2","taller_electronica_v1",
 "taller_electronica_v5_movements","taller_electronica_economia_config","taller_electronica_last_rate",
 "nexum_shared_settings_v1","nexum_categories_v1","nexum_equipment_v1",
 "nexum_sync_outbox_v1","nexum_sync_inbox_v1","nexum_sync_cursor_v1"
]);
function configuredWorkshopContext(){
 try {
  const c=JSON.parse(window.localStorage.getItem("nexum_sync_config_v1")||"null");
  return c&&typeof c.workshopId==="string"&&/^[0-9a-f-]{36}$/i.test(c.workshopId)
    ? c.workshopId.toLowerCase() : "__unassigned__";
 } catch { return "__unassigned__"; }
}
let ACTIVE_WORKSHOP_CONTEXT=configuredWorkshopContext();
function contextStorageKey(key){
 const k=String(key);
 return WORKSHOP_SCOPED_KEYS.has(k) ? "nexum_ws_"+ACTIVE_WORKSHOP_CONTEXT+"__"+k : k;
}
const contextStorage={
 getItem(key){return window.localStorage.getItem(contextStorageKey(key));},
 setItem(key,value){return window.localStorage.setItem(contextStorageKey(key),value);},
 removeItem(key){return window.localStorage.removeItem(contextStorageKey(key));}
};
function legacyUnassignedSummary(){
 try {
  const tickets=JSON.parse(window.localStorage.getItem("taller_electronica_v5")||"[]");
  const movements=JSON.parse(window.localStorage.getItem("taller_electronica_v5_movements")||"[]");
  const t=Array.isArray(tickets)?tickets.length:0,m=Array.isArray(movements)?movements.length:0;
  return t||m ? "Hay datos locales antiguos sin taller asignado ("+t+" tickets y "+m+" movimientos). Se conservan aparte y no se muestran ni se sincronizan automáticamente." : "";
 } catch { return "Hay datos locales antiguos que no se han asignado a un taller; permanecen protegidos y no se sincronizan automáticamente."; }
}

let categories=loadCategories();
function loadCategories(){try{const a=JSON.parse(contextStorage.getItem(CATEGORIES_KEY)||"null");if(Array.isArray(a)&&a.includes("Sin definir"))return [...new Set(a.map(x=>String(x).trim()).filter(Boolean))]}catch(e){}return [...DEFAULT_CATEGORIES]}
function loadSettings(){try{return JSON.parse(contextStorage.getItem(SETTINGS_KEY)||"{}")||{}}catch(e){return {}}}
let appSettings=loadSettings();
const statuses=["En espera de diagnóstico","En diagnóstico","En espera de reparación","En reparación","En espera de confirmación","En espera de piezas","Listo para recoger","Entregado / Conforme","Cancelado","Devuelto","Derivado"];
const finals=["Entregado / Conforme","Cancelado","Devuelto","Derivado"];
const queueStates=["En espera de diagnóstico","En diagnóstico","En espera de reparación","En reparación"];
const frozenStates=["En espera de confirmación","En espera de piezas"];
const $=id=>document.getElementById(id),today=()=>new Date().toISOString().slice(0,10);
let data=loadData(), movements=loadMovements(), economyConfig=loadEconomyConfig(), queueMode="mosaic", historyMode="mosaic", economyMode="list", warrantyEditId=null, economySort="recent", economyPeriod="all";
/** V5.6: Repositorio independiente de fotografías.
 * Las imágenes viven en IndexedDB y la base principal solo conserva sus IDs.
 * Si una foto no existe, el ticket sigue funcionando y se muestra un aviso no fatal. */
function photoDbName(){return "nexum_v56_photos_"+ACTIVE_WORKSHOP_CONTEXT;}
function openPhotoDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(photoDbName(),1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("photos"))r.result.createObjectStore("photos",{keyPath:"id"})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
function photoPut(file){return openPhotoDB().then(db=>new Promise((resolve,reject)=>{const id="P-"+crypto.randomUUID();const tx=db.transaction("photos","readwrite");tx.objectStore("photos").put({id,blob:file,createdAt:new Date().toISOString(),name:file.name,type:file.type});tx.oncomplete=()=>resolve(id);tx.onerror=()=>reject(tx.error)}));}
function photoGet(id){return openPhotoDB().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction("photos","readonly");const q=tx.objectStore("photos").get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)}));}
function selectedPhotos(){return Array.from($("fotos")?.files||[]).slice(0,10);}
async function storeSelectedPhotos(){const files=selectedPhotos();const ids=[];for(const f of files){try{ids.push(await photoPut(f))}catch(e){console.warn("No se pudo guardar una foto",e)}}return ids;}
async function renderPhotos(ids,host){if(!host)return;host.innerHTML="";if(!ids?.length)return;for(const id of ids){const slot=document.createElement("div");slot.className="photo-slot";slot.textContent="Cargando foto…";host.appendChild(slot);try{const rec=await photoGet(id);if(!rec)throw Error("missing");const img=document.createElement("img");img.alt="Foto del equipo";img.src=URL.createObjectURL(rec.blob);slot.textContent="";slot.appendChild(img);}catch(e){slot.textContent="Error al cargar la foto o no existe";slot.classList.add("photo-error");}}}
function loadData(){let raw=contextStorage.getItem(KEY);if(!raw){for(const k of OLD_KEYS){raw=contextStorage.getItem(k);if(raw)break}}let arr=[];try{arr=JSON.parse(raw||"[]")}catch(e){}if(!Array.isArray(arr))return [];const used=new Set();const dateCounts={};return arr.map((x,i)=>{let y=normalize(x);if(!y.ordenFecha){dateCounts[y.fechaEntrada]=(dateCounts[y.fechaEntrada]||0)+1;y.ordenFecha=dateCounts[y.fechaEntrada];}if(!y.ticketId||used.has(y.ticketId)){let n=i+1;while(used.has("TK-A-"+String(n).padStart(4,"0")))n++;y.ticketId="TK-A-"+String(n).padStart(4,"0")}used.add(y.ticketId);return withSyncMeta(y,"ticket")})}
function loadMovements(){let raw=contextStorage.getItem("taller_electronica_v5_movements");let arr=[];try{arr=JSON.parse(raw||"[]")}catch(e){}return Array.isArray(arr)?arr.map(x=>withSyncMeta(normalizeMovement(x),"movement")):[]}
function loadEconomyConfig(){let raw=contextStorage.getItem(ECON_CONFIG_KEY);try{let x=JSON.parse(raw||"null");if(x&&Number(x.amount)>0)return{amount:Number(x.amount),currency:x.currency||"CUP",rate:Number(x.rate)>0?Number(x.rate):1,date:x.date||today()}}catch(e){}return{amount:0,currency:"CUP",rate:1,date:""}}
function saveEconomyConfig(){contextStorage.setItem(ECON_CONFIG_KEY,JSON.stringify(economyConfig))}
function normalize(x){let y={...x,equipoId:x.equipoId||x.id||"",equipoSyncId:x.equipoSyncId||""};delete y.id;if(y.estado==="No reparado")y.estado="Devuelto";if(y.estado==="En espera a diagnóstico")y.estado="En espera de diagnóstico";if(y.categoria==="Baterías_Litio")y.categoria="Batería litio";if(y.categoria==="TV")y.categoria="Televisión";if(y.origen==="Establecimiento")y.origen="Negocio";if(!y.estado)y.estado="En espera de diagnóstico";if(y.categoria===undefined)y.categoria="Sin definir";if(y.cid===undefined)y.cid="";if(y.moneda===undefined)y.moneda="CUP";if(y.tasa===undefined)y.tasa="";if(y.margen===undefined)y.margen="";if(y.gananciaDisponible===undefined)y.gananciaDisponible="";if(y.economicoTecnicos===undefined)y.economicoTecnicos=y.tecnico||"";if(y.ordenFecha===undefined)y.ordenFecha=0;if(y.garantia===undefined)y.garantia=false;if(y.garantiaConcedida===undefined)y.garantiaConcedida=false;if(y.garantiaDuracion===undefined)y.garantiaDuracion="";if(y.garantiaUnidad===undefined)y.garantiaUnidad="meses";if(y.garantiaInicio===undefined)y.garantiaInicio="";if(y.garantiaVencimiento===undefined)y.garantiaVencimiento="";if(y.ticketGarantiaOrigen===undefined)y.ticketGarantiaOrigen="";if(y.tipoReingresoGarantia===undefined)y.tipoReingresoGarantia=false;if(y.reingreso===undefined)y.reingreso=!!(y.ticketGarantiaOrigen||/reingreso/i.test(String(y.notas||"")));if(y.photoIds===undefined)y.photoIds=[];if(y.margen===undefined)y.margen="";const hasEconomyValues=y.precio!==undefined&&y.precio!==""&&y.inversion!==undefined&&y.inversion!=="";const gross=Number(y.precio||0)-Number(y.inversion||0);if(hasEconomyValues&&y.margen!==""&&gross<0)y.margen=0;else if(hasEconomyValues&&y.margen!==""&&Number(y.margen)>gross)y.margen=Math.max(0,gross);if(hasEconomyValues&&y.margen!==""&&Number.isFinite(gross))y.gananciaDisponible=gross-Number(y.margen||0);return y}
function normalizeMovement(x){return {...x,moneda:x.moneda||"CUP",tipo:x.tipo||"Entrada",cantidad:Math.abs(Number(x.cantidad||0)),tasa:x.tasa===""?"":Number(x.tasa||0),notas:x.notas||"",esSaldoInicial:!!x.esSaldoInicial}}
const SYNC_OUTBOX_KEY="nexum_sync_outbox_v1";
const EQUIPMENT_STORE_KEY="nexum_equipment_v1";
let suppressSyncDiff=false;
// Registro independiente del equipo físico: un equipo puede tener muchos tickets.
let equipmentRecords=loadEquipmentRecords();

/* V44: al cambiar el taller, recarga todo el estado local del nuevo contexto.
 * No se importan ni se borran las claves globales antiguas; cada taller tiene
 * su propia cola, bandeja, cursor, tasa, movimientos, tickets, equipos y fotos.
 */
function reloadActiveWorkshopContext(){
 if(window.NexumSyncBusy){window.__nexumWorkshopContextDeferred=true;return false;}
 const next=configuredWorkshopContext();
 if(next===ACTIVE_WORKSHOP_CONTEXT)return false;
 ACTIVE_WORKSHOP_CONTEXT=next;
 data=loadData();
 movements=loadMovements();
 economyConfig=loadEconomyConfig();
 categories=loadCategories();
 equipmentRecords=loadEquipmentRecords();
 try{
  const rateRecord=JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null");
  if(rateRecord?.settingKey==="exchange_rate"&&Number(rateRecord.rate)>0){
   rememberRate(rateRecord.rate);
   economyConfig={...economyConfig,rate:Number(rateRecord.rate),date:rateRecord.updatedAt?.slice(0,10)||economyConfig.date};
   saveEconomyConfig();
  }
 }catch(e){console.warn("No se pudo cargar la tasa del taller activo",e);}
 document.querySelectorAll("dialog[open]").forEach(d=>d.close());
 fillSelects();
 clearForm();
 applyTheme();
 renderSettings();
 renderAll();
 window.dispatchEvent(new Event("nexum-workshop-context-changed"));
 return true;
}
window.addEventListener("nexum-sync-config-changed",reloadActiveWorkshopContext);
window.addEventListener("storage",e=>{if(e.key==="nexum_sync_config_v1")reloadActiveWorkshopContext();});
window.addEventListener("nexum-sync-idle",()=>{if(window.__nexumWorkshopContextDeferred){window.__nexumWorkshopContextDeferred=false;reloadActiveWorkshopContext();}});

/**
 * V6.0-dev-v14: persist the normalized startup snapshot before the first user save.
 * This is a local migration baseline, not an upload: it prevents legacy tickets from
 * being misclassified as new cloud records on the first edit after upgrading.
 * Existing outbox operations are deliberately preserved for explicit review.
 */
(function persistStartupSyncBaseline(){
 try{
  contextStorage.setItem(KEY,JSON.stringify(data));
  contextStorage.setItem("taller_electronica_v5_movements",JSON.stringify(movements));
  contextStorage.setItem(EQUIPMENT_STORE_KEY,JSON.stringify(equipmentRecords));
 }catch(err){console.warn("No se pudo persistir la referencia local de sincronización",err)}
})();
function withSyncMeta(record,entityType){const core=window.NexumSyncCore;if(core)return core.ensureSyncMeta({...record,entityType},record.remoteVersion);let r={...record};if(!r.syncId)r.syncId=crypto.randomUUID();if(!Number.isInteger(r.remoteVersion)||r.remoteVersion<0)r.remoteVersion=0;if(!r.syncStatus)r.syncStatus="local";r.entityType=entityType;return r}
function syncComparable(record){const copy={...record};delete copy.remoteVersion;delete copy.syncStatus;return JSON.stringify(stableSyncValue(copy))}
function stableSyncValue(value){if(Array.isArray(value))return value.map(stableSyncValue);if(value&&typeof value==="object")return Object.keys(value).sort().reduce((out,key)=>(out[key]=stableSyncValue(value[key]),out),{});return value}
function syncPayload(record){const payload={...record};delete payload.remoteVersion;delete payload.syncStatus;delete payload.entityType;return payload}
function queueChangedRecords(storageKey,currentRows,entityType,legacyKey){let previous=[];try{previous=JSON.parse(contextStorage.getItem(storageKey)||"[]")}catch{}if(!Array.isArray(previous))previous=[];const oldById=new Map(previous.filter(x=>x&&x.syncId).map(x=>[x.syncId,x]));for(const record of currentRows){if(!record?.syncId)continue;const old=oldById.get(record.syncId);if(!old||syncComparable(old)!==syncComparable(record))queueLocalOperation(entityType,record,"upsert",record[legacyKey]||record.id||record.equipoId||null)}}
function save(){
 // Compare against the last persisted local snapshot. Startup normalization is persisted separately,
 // so opening the app never enqueues the existing historical records for cloud upload.
 if(!suppressSyncDiff){queueChangedRecords(KEY,data,"ticket","ticketId");queueChangedRecords("taller_electronica_v5_movements",movements,"movement","id");queueChangedRecords(EQUIPMENT_STORE_KEY,equipmentRecords,"equipment","equipoId");}
 contextStorage.setItem(KEY,JSON.stringify(data));contextStorage.setItem("taller_electronica_v5_movements",JSON.stringify(movements));contextStorage.setItem(EQUIPMENT_STORE_KEY,JSON.stringify(equipmentRecords));saveEconomyConfig();renderAll()
}
/** Construye/migra el catálogo local de equipos desde tickets históricos sin encolarlos. */
function loadEquipmentRecords(){
 let stored=[];try{stored=JSON.parse(contextStorage.getItem(EQUIPMENT_STORE_KEY)||"[]")}catch(e){}
 if(!Array.isArray(stored))stored=[];
 const byVisible=new Map();
 for(const old of stored){if(old&&old.equipoId)byVisible.set(String(old.equipoId),withSyncMeta(old,"equipment"))}
 for(const t of data){
  const visible=String(t.equipoId||"").trim();if(!visible)continue;
  let e=byVisible.get(visible);
  if(!e){e=withSyncMeta({equipoId:visible,equipoSyncId:t.equipoSyncId||crypto.randomUUID(),marca:t.marca||"",modelo:t.modelo||"",serie:t.serie||"",descripcion:t.equipo||"",createdAtLocal:new Date().toISOString()},"equipment");byVisible.set(visible,e)}
  // Normaliza el UUID técnico por equipo, incluso cuando tickets legados tenían valores distintos.
  t.equipoSyncId=e.syncId;
  if(!e.descripcion&&t.equipo)e.descripcion=t.equipo;
  if(!e.modelo&&t.modelo)e.modelo=t.modelo;
 }
 return [...byVisible.values()];
}
function getOrCreateEquipment(ticket){
 const visible=String(ticket.equipoId||"").trim();
 let e=equipmentRecords.find(v=>String(v.equipoId)===visible);
 if(!e){e=withSyncMeta({equipoId:visible,equipoSyncId:ticket.equipoSyncId||crypto.randomUUID(),marca:ticket.marca||"",modelo:ticket.modelo||"",serie:ticket.serie||"",descripcion:ticket.equipo||"",createdAtLocal:new Date().toISOString()},"equipment");equipmentRecords.push(e)}
 ticket.equipoSyncId=e.syncId;
 if(ticket.equipo)e.descripcion=ticket.equipo;
 if(ticket.modelo)e.modelo=ticket.modelo;
 return e;
}
// La cola queda persistida localmente, pero esta versión no transmite ni importa datos remotos.
function queueLocalOperation(entityType,record,action="upsert",legacyId){try{const core=window.NexumSyncCore;if(!core||!record?.syncId)return;const queue=JSON.parse(contextStorage.getItem(SYNC_OUTBOX_KEY)||"[]");const op=core.makeOperation({entityType,record,action,baseVersion:Number(record.remoteVersion||0),payload:action==="delete"?null:syncPayload(record),legacyId});contextStorage.setItem(SYNC_OUTBOX_KEY,JSON.stringify(core.enqueue(queue,op)));record.syncStatus="pending";}catch(err){console.warn("No se pudo preparar la operación local de sincronización",err)}}
function queueLocalDelete(entityType,record,legacyId){try{if(!record?.syncId)return;const q=JSON.parse(contextStorage.getItem(SYNC_OUTBOX_KEY)||"[]"),hasLocalOperation=q.some(op=>op.entityType===entityType&&op.entityId===record.syncId);if(Number(record.remoteVersion||0)>0||hasLocalOperation)queueLocalOperation(entityType,record,"delete",legacyId)}catch(err){console.warn("No se pudo preparar el borrado para sincronización",err)}}
// Persiste la migración de nombre/campos al arrancar, sin encolar ni transmitir el histórico.
try{contextStorage.setItem(KEY,JSON.stringify(data));contextStorage.setItem("taller_electronica_v5_movements",JSON.stringify(movements));contextStorage.setItem(EQUIPMENT_STORE_KEY,JSON.stringify(equipmentRecords));}catch(err){console.warn("No se pudo persistir la migración de identidad local",err)}
function nextId(){let n=data.reduce((m,x)=>Math.max(m,parseInt((x.equipoId||"").replace(/\D/g,""))||0),0)+1;return "EQ-"+String(n).padStart(4,"0")}
// IDs visibles nuevos incluyen aleatoriedad para evitar colisiones entre dispositivos; los históricos se conservan.
function uniqueVisibleId(prefix){return prefix+"-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,4).toUpperCase()}
function nextTicketId(){return uniqueVisibleId("TK-A") }
function nextDateOrder(date){return data.filter(x=>x.fechaEntrada===date).reduce((m,x)=>Math.max(m,Number(x.ordenFecha||0)),0)+1}
function nextMovementId(){let id;do{id=uniqueVisibleId("ECN-X")}while(movements.some(x=>x.id===id));return id}
function show(view){document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$(view).classList.add("active");document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.view===view));if(view==="cola")renderQueue();if(view==="historico")renderHistory();if(view==="estadisticas")renderStatistics();if(view==="economia")renderEconomy();if(view==="configuracion")renderSettings()}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll("[data-view-target]").forEach(b=>b.onclick=()=>show(b.dataset.viewTarget));
function applyTheme(){const mode=appSettings.theme||"system";document.documentElement.dataset.theme=mode;const dark=mode==="dark"||(mode==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);const logo=$("brandLogo");if(logo&&logo.getAttribute("src")!=="logo-oscuro.svg")logo.src="logo-oscuro.svg";const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?"#101820":"#102a43";if($("themeMode"))$("themeMode").value=mode}
function renderCategoryManager(){const host=$("categoryManager");if(!host)return;host.innerHTML=categories.map((c,i)=>`<div class="category-row"><span>${esc(c)}</span>${c==="Sin definir"?'<small class="muted">Obligatoria</small>':`<button class="secondary" onclick="removeCategory(${i})">Quitar</button>`}</div>`).join("")}
function renderSettings(){if($("themeMode"))$("themeMode").value=appSettings.theme||"system";if($("settingRate"))$("settingRate").value=rememberedRate()||currentRate();renderCategoryManager()}
function removeCategory(i){const c=categories[i];if(!c||c==="Sin definir")return;if(data.some(x=>x.categoria===c)&&!confirm(`Hay tickets que usan «${c}». Se quitará de las opciones nuevas, pero los tickets existentes conservarán el dato. ¿Continuar?`))return;categories=categories.filter((_,n)=>n!==i);contextStorage.setItem(CATEGORIES_KEY,JSON.stringify(categories));fillSelects();renderCategoryManager()}
$("themeMode").onchange=()=>{appSettings.theme=$("themeMode").value;contextStorage.setItem(SETTINGS_KEY,JSON.stringify(appSettings));applyTheme()};
$("saveRateBtn").onclick=()=>{const r=Number($("settingRate").value);if(!(r>0)){alert("La tasa debe ser mayor que cero.");return}rememberRate(r);economyConfig={...economyConfig,rate:r,date:today()};saveEconomyConfig();queueSharedRate(r);alert("Tasa guardada y puesta en cola para sincronizar con el taller. Pulsa Sincronizar en los dispositivos.");};
$("addCategoryBtn").onclick=()=>{const v=$("newCategory").value.trim();if(!v){alert("Escribe un nombre para la categoría.");return}if(categories.some(c=>c.toLocaleLowerCase()===v.toLocaleLowerCase())){alert("Esa categoría ya existe.");return}categories.push(v);contextStorage.setItem(CATEGORIES_KEY,JSON.stringify(categories));$("newCategory").value="";fillSelects();renderCategoryManager()};
if(window.matchMedia){window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if((appSettings.theme||"system")==="system")applyTheme()})}
function fillSelects(){["categoria","filterCategoria"].forEach(id=>{const s=$(id);if(!s)return;const isFilter=id==="filterCategoria";s.innerHTML=(isFilter?'<option value="">Todas</option>':'')+categories.map((c,i)=>`<option value="${escAttr(c)}"${i===0&&!isFilter?" selected":""}>${esc(c)}</option>`).join("")});["estado","filterEstado"].forEach(id=>{const s=$(id);if(!s)return;s.innerHTML=(id==="filterEstado"?'<option value="">Todos</option>':'')+statuses.map(v=>`<option value="${escAttr(v)}">${esc(v)}</option>`).join("")})}
fillSelects();
/** Calcula la sugerencia de margen sin escribirla sobre una decisión manual. */
function suggestedMargin(investment){const n=Math.max(0,Number(investment)||0);return Math.ceil((n*0.60)/50)*50;}
/** Calcula el precio sugerido: mínimo 1000, doble de inversión y al menos 500 de ganancia disponible. */
function suggestedPrice(investment){const n=Math.max(0,Number(investment)||0);const m=suggestedMargin(n);return Math.max(1000,n*2,n+m+500);}
/** Actualiza solo placeholders; nunca reemplaza valores que el técnico ya escribió. */
function updatePricingSuggestions(){const raw=$("inversion")?.value||"";const inv=Number(raw);if(!$('margen')||!$('precio'))return;const active=raw!==""&&Number.isFinite(inv)&&inv>0;$("margen").placeholder=active?String(suggestedMargin(inv)):"";$("precio").placeholder=active?String(suggestedPrice(inv)):"";}
/* V6.0-dev-v82 — sugerencias y autocompletado de clientes dentro del taller activo. */
function clientKey(v){return String(v||"").trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase()}
function knownClients(){
 const seen=new Map();
 for(const t of data){
  const cliente=String(t.cliente||"").trim(),cid=String(t.cid||"").trim(),contacto=String(t.contacto||"").trim();
  if(!cliente&&!cid&&!contacto)continue;
  const key=[clientKey(cliente),clientKey(cid),clientKey(contacto)].join("|");
  if(!seen.has(key))seen.set(key,{cliente,cid,contacto});
 }
 return [...seen.values()];
}
function attachClientAssist(prefix=""){
 const ids={cliente:prefix+"cliente",cid:prefix+"cid",contacto:prefix+"contacto"};
 const inputs=Object.entries(ids).map(([field,id])=>({field,el:document.getElementById(id)})).filter(x=>x.el);
 const listId=prefix?"editClientSuggestions":"clientSuggestions";
 let list=document.getElementById(listId);
 if(!list){list=document.createElement("datalist");list.id=listId;(prefix?document.getElementById("detailBody"):document.getElementById("caseForm"))?.appendChild(list);}
 for(const {el} of inputs)el.setAttribute("list",listId);
 const refresh=source=>{
  const val=clientKey(source.value);
  const clients=knownClients();
  list.innerHTML="";
  const vals=new Set();
  for(const c of clients){
   const candidate=c[source.field]||"";
   if(candidate&&(!val||clientKey(candidate).includes(val))&&!vals.has(candidate)){vals.add(candidate);const opt=document.createElement("option");opt.value=candidate;list.appendChild(opt);}
  }
  if(!val)return;
  const exact=clients.filter(c=>c[source.field]&&clientKey(c[source.field])===val);
  const matches=exact.length?exact:clients.filter(c=>c[source.field]&&clientKey(c[source.field])===val);
  if(matches.length===1){
   const match=matches[0];
   for(const {field,el} of inputs)if(field!==source.field&&match[field])el.value=match[field];
  }
 };
 for(const item of inputs){
  item.el.addEventListener("input",()=>refresh(item));
  item.el.addEventListener("change",()=>refresh(item));
 }
}
function refreshClientSuggestions(){
 const list=document.getElementById("clientSuggestions");if(!list)return;
 list.innerHTML="";const values=new Set();
 for(const c of knownClients())for(const v of [c.cliente,c.cid,c.contacto])if(v&&!values.has(v)){values.add(v);const opt=document.createElement("option");opt.value=v;list.appendChild(opt);}
}
function clearForm(){warrantyEditId=null;$("caseForm").reset();refreshClientSuggestions();$("id").readOnly=false;$("id").value=nextId();$("ticketId").value=nextTicketId();$("ticketId").readOnly=true;$("fechaEntrada").value=today();$("estado").value="En espera de diagnóstico";$("categoria").value="";$("moneda").value="CUP";$("tasa").value=rememberedRate();$("tasa").disabled=false;updatePricingSuggestions()}
function loadWarrantyForm(old,isWarranty){warrantyEditId=old.ticketId;$("id").readOnly=false;$("id").value=old.equipoId||nextId();$("ticketId").value=nextTicketId();$("ticketId").readOnly=true;$("fechaEntrada").value=today();$("cliente").value=old.cliente||"";$("cid").value=old.cid||"";$("contacto").value=old.contacto||"";$("equipo").value=old.equipo||"";$("modelo").value=old.modelo||"";$("categoria").value=old.categoria||"Sin definir";$("origen").value=old.origen||"Particular";$("referido").value=old.referido||"";$("problema").value="";$("diagnostico").value="";$("tecnico").value=old.tecnico||"";$("estado").value="En espera de diagnóstico";$("inversion").value="";$("margen").value="";$("precio").value="";$("garantia").checked=!!isWarranty;updatePricingSuggestions();$("accesorios").value=old.accesorios||"";$("notas").value=isWarranty?`Reingreso por garantía del ticket ${old.ticketId}`:"Reingreso normal del equipo";$("moneda").value=old.moneda||"CUP";$("tasa").value=old.tasa||rememberedRate();$("tasa").disabled=$("moneda").value==="USD";$("detailDialog").open&&$("detailDialog").close();show("nuevo");if(isWarranty)alert(`Reingreso por garantía. Ticket original: ${old.ticketId}. ${warrantySummary(old)}`);}
function addWarrantyDuration(date,amount,unit){const d=new Date((date||today())+"T12:00:00");const n=Math.max(0,Number(amount)||0);if(unit==="días")d.setDate(d.getDate()+n);else if(unit==="semanas")d.setDate(d.getDate()+7*n);else if(unit==="meses")d.setMonth(d.getMonth()+n);else if(unit==="año")d.setFullYear(d.getFullYear()+n);return d.toISOString().slice(0,10)}
/**
 * Estado único de la garantía concedida al cliente.
 * Centraliza el cálculo para que la tarjeta, el detalle y el resumen de reingreso
 * no muestren estados o contadores distintos. La garantía no está vigente antes
 * de su fecha de inicio; el día de vencimiento se considera incluido.
 */
function warrantyStatus(x){
 if(!x?.garantiaConcedida)return null;
 if(!x.garantiaInicio||!x.garantiaVencimiento)return {kind:"unknown",left:null,label:"Garantía sin fechas"};
 const now=new Date();
 const localToday=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
 if(localToday<x.garantiaInicio)return {kind:"pending",left:null,label:`Inicia ${displayDate(x.garantiaInicio)}`};
 const left=Math.ceil((new Date(x.garantiaVencimiento+"T23:59:59")-now)/86400000);
 if(left<0)return {kind:"expired",left,label:"Garantía vencida"};
 return {kind:"active",left,label:`${left} ${left===1?"día":"días"} restantes`};
}
function warrantySummary(x){if(!x?.garantiaConcedida||!x.garantiaVencimiento)return "El ticket original no tiene una garantía registrada.";const status=warrantyStatus(x);const state=status?.kind==="pending"?`comienza el ${displayDate(x.garantiaInicio)}`:status?.kind==="expired"?`vencida hace ${Math.abs(status.left)} día(s)`:status?.kind==="unknown"?"sin fechas completas":`restan ${status.left} día(s)`;return `Garantía original: ${x.garantiaDuracion} ${x.garantiaUnidad}; vence ${displayDate(x.garantiaVencimiento)}; ${state}.`}
function warrantyDetails(x){if(!x.garantiaConcedida)return '<p class="muted">No se ha registrado una garantía concedida para este ticket.</p>';const status=warrantyStatus(x);const label=status?.kind==="pending"?`Pendiente; inicia ${displayDate(x.garantiaInicio)}`:status?.kind==="expired"?`Vencida hace ${Math.abs(status.left)} día(s)`:status?.kind==="active"?`Vigente; restan ${status.left} día(s)`:"Sin fecha calculada";return `<p><b>Garantía concedida:</b> ${esc(x.garantiaDuracion)} ${esc(x.garantiaUnidad)}</p><p><b>Inicio:</b> ${esc(displayDate(x.garantiaInicio))} · <b>Vencimiento:</b> ${esc(displayDate(x.garantiaVencimiento))}</p><p><b>Estado:</b> ${label}</p>`}
/**
 * V5.6.16-beta — Indicadores de tarjetas.
 * Solo representa la garantía concedida al cliente; `garantia` y
 * `tipoReingresoGarantia` describen el motivo del ingreso y no activan este sello.
 * Las garantías futuras o sin fechas completas no se presentan como activas/vencidas.
 */
function warrantyCardBadge(x){
 const status=warrantyStatus(x);
 // Un reingreso por garantía no implica que este nuevo ticket tenga garantía concedida.
 if(!status){
  if(x.tipoReingresoGarantia||x.garantia)return `<div class="card-warranty neutral" title="Reingreso por garantía"><span class="card-warranty-icon" aria-hidden="true">${toolIcon()}</span><span>Reingreso<br>por garantía</span></div>`;
  return `<div class="card-warranty neutral" title="Sin garantía concedida"><span class="card-warranty-icon" aria-hidden="true">${minusIcon()}</span><span>Sin garantía</span></div>`;
 }
 if(status.kind==="pending"||status.kind==="unknown")return "";
 if(status.kind==="active")return `<div class="card-warranty active" title="Garantía concedida al cliente"><span class="card-warranty-icon" aria-hidden="true">${shieldIcon(false)}</span><span>${esc(status.label)}</span></div>`;
 return `<div class="card-warranty expired" title="Garantía concedida vencida"><span class="card-warranty-icon" aria-hidden="true">${shieldIcon(true)}</span><span>Garantía vencida</span></div>`;
}
// Iconos SVG locales para que el aspecto sea nítido y consistente en Android/PWA.
function shieldIcon(broken){return broken?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m7 7 4 4-2 2 4 3 4-5"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m8 12 2.5 2.5L16 9"/></svg>'}
function minusIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>'}
// V5.6.17-beta: una sola silueta continua evita el rombo/rectángulo interior sobrante.
function toolIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a6 6 0 0 1-7.9 7.9l-7 7a2.1 2.1 0 0 1-3-3l7-7a6 6 0 0 1 7.9-7.9l-3.1 3.1Z"/></svg>'}

$("caseForm").onsubmit=async e=>{e.preventDefault();const cliente=$("cliente").value.trim(),contacto=$("contacto").value.trim(),equipo=$("equipo").value.trim();if(!cliente||!contacto||!equipo){alert("Para crear el registro debes completar Cliente, Contacto y Equipo.");return}const cur=$("moneda").value,rate=cur==="USD"?1:Number($("tasa").value||rememberedRate());if(cur!=="USD"&&!(rate>0)){alert("Para CUP debes indicar el cambio monetario.");return}const invRaw=$("inversion").value,marginRaw=$("margen").value,priceRaw=$("precio").value;const inv=invRaw===""?"":Number(invRaw);let margin=marginRaw===""?"":Number(marginRaw);let price=priceRaw===""?"":Number(priceRaw);if(inv!==""&&price!==""){const gross=price-inv;if(gross<0&&margin!=="")margin=0;else if(margin!==""&&margin>gross)margin=Math.max(0,gross);}const x=withSyncMeta({equipoId:$("id").value.trim(),equipoSyncId:(data.find(v=>v.equipoId===$("id").value.trim())?.equipoSyncId||equipmentRecords.find(v=>v.equipoId===$("id").value.trim())?.syncId||"")||crypto.randomUUID(),ticketId:$("ticketId").value,fechaEntrada:$("fechaEntrada").value||today(),fechaSalida:"",ordenFecha:nextDateOrder($("fechaEntrada").value||today()),cliente,cid:$("cid").value.trim(),contacto,equipo,origen:$("origen").value,referido:$("referido").value.trim(),modelo:$("modelo").value.trim(),categoria:$("categoria").value,problema:$("problema").value.trim(),diagnostico:$("diagnostico").value.trim(),tecnico:$("tecnico").value,estado:$("estado").value,accesorios:$("accesorios").value.trim(),inversion:inv,margen:margin,precio:price,moneda:cur,tasa:rate,notas:$("notas").value.trim(),garantia:$("garantia").checked,ticketGarantiaOrigen:warrantyEditId&&$("garantia").checked?warrantyEditId:"",tipoReingresoGarantia:!!(warrantyEditId&&$("garantia").checked),reingreso:!!warrantyEditId,garantiaConcedida:false,garantiaDuracion:"",garantiaUnidad:"meses",garantiaInicio:"",garantiaVencimiento:"",photoIds:await storeSelectedPhotos()},"ticket");if(cur!=="USD")rememberRate(rate);if(!validateFinal(x))return;const equipmentRecord=getOrCreateEquipment(x);data.push(x);save();alert(warrantyEditId?"Nuevo ticket de garantía creado: "+x.ticketId:"Equipo ingresado: "+x.ticketId);clearForm();show("cola")};
function validateFinal(x){if(finals.includes(x.estado)&&!x.tecnico?.trim()){alert("Un estado final requiere al menos un técnico.");return false}if(finals.includes(x.estado)&&!x.fechaSalida){alert("Un estado final requiere Fecha de salida.");return false}if(x.fechaSalida&&!finals.includes(x.estado)){alert("Si existe Fecha de salida, el estado debe ser final.");return false}return true}
function stat(l,v){return `<div class="stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`}
function renderStats(){let active=data.filter(x=>!finals.includes(x.estado));$("stats").innerHTML=stat("Equipos en registro",data.length)+stat("Activos en taller",active.length)+stat("Esperando piezas",data.filter(x=>x.estado==="En espera de piezas").length)+stat("Listos para entregar",data.filter(x=>x.estado==="Listo para recoger").length)+stat("En diagnóstico",data.filter(x=>x.estado==="En diagnóstico").length)+stat("Entregados",data.filter(x=>x.estado==="Entregado / Conforme").length)+stat("Devueltos",data.filter(x=>x.estado==="Devuelto").length)+stat("Derivados",data.filter(x=>x.estado==="Derivado").length)}
function statusClass(x){if(x.estado==="Entregado / Conforme")return"done";if(x.estado==="Devuelto")return"returned";if(x.estado==="Cancelado")return"cancelled";if(x.estado==="En espera de confirmación"||x.estado==="En espera de piezas")return"confirm";if(x.estado==="Listo para recoger")return"ready";if(x.estado==="Derivado")return"derived";return"wait"}
function actionButtons(x){return `<div class="actions"><button class="secondary" onclick="examine('${escAttr(x.ticketId)}')">Examinar</button><button class="danger" onclick="deleteCase('${escAttr(x.ticketId)}')">Borrar</button></div>`}
function displayDate(v){if(!v)return "—";let m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:String(v)}
function profitabilitySeal(x){if(!finals.includes(x.estado))return "";const e=ticketEconomy(x);if(e.gross<0)return '<span class="seal loss-seal">PÉRDIDA</span>';const thresholdUSD=1;if(e.grossUSD>0&&e.grossUSD<thresholdUSD)return '<span class="seal low-profit-seal">BAJA RENTABILIDAD</span>';if(e.gross===0)return '<span class="seal low-profit-seal">BAJA RENTABILIDAD</span>';return ""}
function card(x){return `<div class="case ${statusClass(x)}"><div class="case-head"><h3>${esc(x.equipoId)} · ${esc(x.equipo)}</h3>${warrantyCardBadge(x)}</div><div class="meta"><b>Ticket: ${esc(x.ticketId)}</b><br><b>${esc(x.cliente)}</b> · ${esc(x.contacto)}<br>${esc(x.categoria||"Sin categoría")}${x.modelo?" · "+esc(x.modelo):""}<br>Entrada: ${esc(displayDate(x.fechaEntrada))}${x.fechaSalida?" · Salida: "+esc(displayDate(x.fechaSalida)):""}${x.tecnico?" · Técnico: "+esc(x.tecnico):""}</div><span class="badge">${esc(x.estado)}</span>${x.garantia?'<span class="seal warranty-seal">GARANTÍA</span>':''}${profitabilitySeal(x)}${actionButtons(x)}</div>`}
function list(arr){return `<div class="listwrap"><table class="listtable"><thead><tr><th>ID equipo</th><th>Ticket</th><th>Entrada / salida</th><th>Cliente</th><th>Equipo</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${arr.map(x=>`<tr class="row${statusClass(x)}"><td>${esc(x.equipoId)}</td><td>${esc(x.ticketId)}</td><td>${esc(displayDate(x.fechaEntrada))}${x.fechaSalida?"<br><span class=\"muted\">"+esc(displayDate(x.fechaSalida))+"</span>":""}</td><td>${esc(x.cliente)}<br><span class="muted">${esc(x.contacto)}</span></td><td>${esc(x.equipo)}${x.modelo?"<br><span class=\"muted\">"+esc(x.modelo)+"</span>":""}</td><td>${esc(x.categoria||"—")}</td><td><span class="badge">${esc(x.estado)}</span></td><td>${actionButtons(x)}</td></tr>`).join("")}</tbody></table></div>`}
function matches(x){let q=($("search").value||"").toLowerCase().trim();if(q&&!Object.values(x).some(v=>String(v??"").toLowerCase().includes(q)))return false;let c=$("filterCategoria").value,s=$("filterEstado").value,o=$("filterOrigen").value;return(!c||x.categoria===c)&&(!s||x.estado===s)&&(!o||x.origen===o)}
function renderQueue(){const sortByDate=(a,b)=>String(a.fechaEntrada||"").localeCompare(String(b.fechaEntrada||""));const normal=data.filter(x=>queueStates.includes(x.estado)).slice().sort(sortByDate);const frozen=data.filter(x=>frozenStates.includes(x.estado)).slice().sort(sortByDate);const ready=data.filter(x=>x.estado==="Listo para recoger").slice().sort(sortByDate);const host=$("queue");if(!host)return;const group=(title,arr)=>arr.length?`<section class="queue-group"><h3>${title} (${arr.length})</h3>${queueMode==="mosaic"?`<div class="case-grid">${arr.map(card).join("")}</div>`:list(arr)}</section>`:`<section class="queue-group"><h3>${title} (0)</h3><div class="empty">No hay equipos en este grupo.</div></section>`;host.innerHTML=group("Normales",normal.slice(0,10))+group("Congelados",frozen)+group("Listos",ready)}
$("queueMosaic").onclick=()=>{queueMode="mosaic";$("queueMosaic").classList.add("active");$("queueList").classList.remove("active");renderQueue()};$("queueList").onclick=()=>{queueMode="list";$("queueList").classList.add("active");$("queueMosaic").classList.remove("active");renderQueue()};
function historySort(arr){let mode=$("historySort")?.value||"entrada_desc";return arr.slice().sort((a,b)=>{if(mode.startsWith("ticket"))return String(a.ticketId).localeCompare(String(b.ticketId))*(mode.endsWith("desc")?-1:1);let ka=mode.startsWith("salida")?(a.fechaSalida||""):(a.fechaEntrada||"");let kb=mode.startsWith("salida")?(b.fechaSalida||""):(b.fechaEntrada||"");const dateCmp=ka.localeCompare(kb);if(dateCmp!==0)return dateCmp*(mode.endsWith("desc")?-1:1);return 0})}
function renderHistory(){let arr=historySort(data.filter(matches));$("results").innerHTML=arr.length?(historyMode==="mosaic"?`<div class="case-grid">${arr.map(card).join("")}</div>`:list(arr)):'<div class="empty">Sin resultados.</div>'}
$("search").oninput=renderHistory;["filterCategoria","filterEstado","filterOrigen","historySort"].forEach(id=>$(id).onchange=renderHistory);$("filterBtn").onclick=()=>$("filterPanel").classList.toggle("hidden");$("clearFilters").onclick=()=>{$("search").value="";$("filterCategoria").value="";$("filterEstado").value="";$("filterOrigen").value="";renderHistory()};$("historyMosaic").onclick=()=>{historyMode="mosaic";$("historyMosaic").classList.add("active");$("historyList").classList.remove("active");renderHistory()};$("historyList").onclick=()=>{historyMode="list";$("historyList").classList.add("active");$("historyMosaic").classList.remove("active");renderHistory()};
function examine(ticketId,edit=false){const x=data.find(a=>a.ticketId===ticketId);if(!x)return;$("detailTitle").textContent=edit?"Editar caso":"Examinar caso";$("detailBody").innerHTML=edit?editForm(x):detailView(x);$("detailDialog").showModal();if(edit)attachClientAssist("ed_");if(!edit)renderPhotos(x.photoIds,$("detailPhotos"));}
function detailView(x){const fields=["ticketId","equipoId","fechaEntrada","fechaSalida","cliente","contacto","equipo","modelo","categoria","origen","referido","problema","diagnostico","tecnico","estado","inversion","precio","accesorios","notas"];let actions=`<div class="actions" style="margin-top:14px"><button class="primary" onclick="enableEdit('${escAttr(x.ticketId)}')">Habilitar edición</button><button class="danger" onclick="deleteCase('${escAttr(x.ticketId)}')">Borrar</button>`;if(x.estado==="Entregado / Conforme")actions+=`<button class="secondary" onclick="newWarranty('${escAttr(x.ticketId)}')">↩ Reabrir por garantía</button>`;actions+=`<button class="secondary" onclick="openEconomyTicket('${escAttr(x.ticketId)}')">$ Economía</button></div>`;return `<div class="detailgrid">${fields.map(k=>`<div class="detailitem"><small>${pretty(k)}</small><div class="detail-notes">${k.includes("fecha")?esc(displayDate(x[k])):esc(x[k]??"—")||"—"}</div></div>`).join("")}<div class="detailitem"><small>CID</small><div class="detail-notes">${esc(String(x.cid||"—"))}</div></div></div>${x.garantia?`<div class="card innercard"><b>Garantía:</b> ingreso presentado como posible garantía de un trabajo anterior.${x.ticketGarantiaOrigen?`<p>Ticket original: <b>${esc(x.ticketGarantiaOrigen)}</b></p>`:""}${x.ticketGarantiaOrigen?`<p>${esc(warrantySummary(data.find(a=>a.ticketId===x.ticketGarantiaOrigen)||{}))}</p>`:""}</div>`:""}<div class="card innercard"><h3>Garantía concedida al cliente</h3>${warrantyDetails(x)}</div><div class="card innercard"><h3>Fotos del equipo</h3><div id="detailPhotos" class="photo-preview"></div></div>${actions}`}
function editForm(x){let fields=["fechaEntrada","fechaSalida","cliente","contacto","equipo","modelo","origen","referido","problema","diagnostico","tecnico","inversion","margen","precio","accesorios","notas"];let html=`<div class="edit-form"><label class="checkline"><input id="ed_garantia" type="checkbox" ${x.garantia?"checked":""}> Garantía — este ingreso puede corresponder a un trabajo anterior de NEXUM</label><div class="two"><label>Categoría<select id="ed_categoria">${categories.map((c,i)=>`<option value="${escAttr(c)}" ${x.categoria===c?"selected":(!x.categoria&&i===0?"selected":"")}>${esc(c)}</option>`).join("")}</select></label><label>Estado<select id="ed_estado">${statuses.map(s=>`<option ${x.estado===s?"selected":""}>${esc(s)}</option>`).join("")}</select></label></div>`;for(const k of fields){let type=["inversion","margen","precio"].includes(k)?"number":k.includes("fecha")?"date":k==="diagnostico"||k==="problema"||k==="notas"?"textarea":"text";let val=esc(x[k]??"");let hasInvestment=x.inversion!==""&&Number.isFinite(Number(x.inversion))&&Number(x.inversion)>0;let ph=k==="margen"&&val===""&&hasInvestment?suggestedMargin(x.inversion):k==="precio"&&val===""&&hasInvestment?suggestedPrice(x.inversion):k==="inversion"?"Costo real del trabajo":"";html+=`<label>${pretty(k)}${type==="textarea"?`<textarea id="ed_${k}">${val}</textarea>`:`<input id="ed_${k}" type="${type}" value="${val}" placeholder="${escAttr(ph)}">`}</label>`}html+=`<label>CID<input id="ed_cid" type="text" value="${esc(x.cid||"")}" autocomplete="off" placeholder="Carné de identidad (opcional)"></label><div class="card innercard warranty-config"><h3>Garantía concedida al cliente</h3><label class="checkline"><input id="ed_garantiaConcedida" type="checkbox" ${x.garantiaConcedida?"checked":""}> Conceder garantía al entregar</label><div class="warranty-duration-row"><label>Duración<input id="ed_garantiaDuracion" type="number" min="1" step="1" inputmode="numeric" value="${escAttr(x.garantiaDuracion||"30")}"></label><label>Unidad<select id="ed_garantiaUnidad">${["días","semanas","meses","año"].map(u=>`<option ${((x.garantiaUnidad||"días")===u)?"selected":""}>${u}</option>`).join("")}</select></label></div><small class="field-help">La garantía comienza automáticamente en la fecha de salida/entrega. El vencimiento se calcula al guardar. Esta garantía concedida es distinta de la casilla de posible reclamación.</small></div>`;return html+`<div class="two"><label>Moneda<select id="ed_moneda" onchange="$('ed_tasa').disabled=this.value==='USD';if(this.value!=='USD'&&!$('ed_tasa').value)$('ed_tasa').value=rememberedRate()"><option ${x.moneda!=="USD"?"selected":""}>CUP</option><option ${x.moneda==="USD"?"selected":""}>USD</option></select></label><label>Cambio monetario actual<input id="ed_tasa" type="number" min="0" step="0.01" value="${escAttr(x.tasa||rememberedRate())}" ${x.moneda==="USD"?"disabled":""}></label></div><small class="field-help">Si cambias la tasa, se guarda como nueva tasa actual y esta operación conserva la tasa que acabas de establecer.</small><div class="actions"><button class="primary" onclick="saveEdit('${escAttr(x.ticketId)}')">Guardar cambios</button><button class="secondary" onclick="examine('${escAttr(x.ticketId)}')">Volver a examinar</button></div></div>`}
function enableEdit(ticketId){examine(ticketId,true)}
function saveEdit(ticketId){let x=data.find(a=>a.ticketId===ticketId);if(!x)return;if(!confirm("¿Confirmas guardar los cambios de este caso?"))return;const oldState=x.estado;const fields=["fechaEntrada","fechaSalida","cliente","contacto","equipo","modelo","origen","referido","problema","diagnostico","tecnico","accesorios","notas"];for(const k of fields)x[k]=$("ed_"+k).value;x.cid=$("ed_cid").value.trim();x.categoria=$("ed_categoria").value;x.estado=$("ed_estado").value;x.garantia=$("ed_garantia").checked; const invRaw=$("ed_inversion").value,marginRaw=$("ed_margen").value,priceRaw=$("ed_precio").value; x.inversion=invRaw===""?"":Number(invRaw); x.margen=marginRaw===""?"":Number(marginRaw); x.precio=priceRaw===""?"":Number(priceRaw); if(x.inversion!==""&&x.precio!==""){const editGross=x.precio-x.inversion;if(editGross<0&&x.margen!=="")x.margen=0;else if(x.margen!==""&&x.margen>editGross)x.margen=Math.max(0,editGross);}let cur=$("ed_moneda").value,rate=cur==="USD"?1:Number($("ed_tasa").value||0);if(cur!=="USD"&&!(rate>0)){alert("Para CUP debes indicar el cambio monetario.");return}x.moneda=cur;x.tasa=rate;if(cur!=="USD")rememberRate(rate);
const grant=$("ed_garantiaConcedida").checked;const duration=Number($("ed_garantiaDuracion").value||0);const unit=$("ed_garantiaUnidad").value;if(grant&&x.estado!=="Entregado / Conforme"){alert("Para conceder una garantía, cambia el estado a Entregado / Conforme.");return}if(grant&&(!Number.isFinite(duration)||duration<1)){alert("Indica una duración válida para la garantía.");return}if(grant){if(!x.fechaSalida)x.fechaSalida=today();const startDate=x.fechaSalida;x.garantiaConcedida=true;x.garantiaDuracion=duration;x.garantiaUnidad=unit;x.garantiaInicio=startDate;x.garantiaVencimiento=addWarrantyDuration(startDate,duration,unit);}else{x.garantiaConcedida=false;x.garantiaDuracion="";x.garantiaUnidad="meses";x.garantiaInicio="";x.garantiaVencimiento="";}
if(x.estado==="Entregado / Conforme"&&!x.fechaSalida)x.fechaSalida=today();if(!finals.includes(x.estado))x.fechaSalida="";if(!validateFinal(x))return;save();$("detailDialog").close();if(oldState!==x.estado&&x.estado==="Entregado / Conforme"&&!x.garantiaConcedida)alert("Ticket entregado. Si corresponde, vuelve a editarlo para registrar una garantía concedida al cliente.");}

function deleteCase(ticketId){if(!confirm("ATENCIÓN: ¿Seguro que quieres borrar este registro? Esta acción no se puede deshacer."))return;const target=data.find(x=>x.ticketId===ticketId);if(target)queueLocalDelete("ticket",target,ticketId);data=data.filter(x=>x.ticketId!==ticketId);save();if($("detailDialog").open)$("detailDialog").close()}
function newWarranty(ticketId){let old=data.find(x=>x.ticketId===ticketId);if(!old)return;if(!confirm(`¿Reabrir el ticket ${old.ticketId}?\n\nAceptar = Sí, reabrir.\nCancelar = No, mantenerlo cerrado.`))return;const isWarranty=confirm(`¿El nuevo ingreso es por garantía?\n\nAceptar = Sí, vincular con ${old.ticketId}.\nCancelar = No, crear un ingreso normal.`);loadWarrantyForm(old,isWarranty)}
$("closeDialog").onclick=()=>$("detailDialog").close();
function periodStart(v){let d=new Date();d.setHours(0,0,0,0);if(v==="today")return d;if(v==="7"||v==="30"){d.setDate(d.getDate()-(Number(v)-1));return d}if(v==="month")return new Date(d.getFullYear(),d.getMonth(),1);if(v==="prevmonth")return new Date(d.getFullYear(),d.getMonth()-1,1);return null}
function periodEnd(v){if(v==="prevmonth")return new Date(new Date().getFullYear(),new Date().getMonth(),0,23,59,59,999);return new Date()}
function inPeriod(date,v){if(!date)return false;if(v==="all")return true;let d=new Date(date+"T00:00:00"),s=periodStart(v),e=periodEnd(v);return d>=s&&d<=e}
function countMap(arr,key){let m={};arr.forEach(x=>{let k=x[key]||"Sin definir";m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])}
function niceScale(max){if(max<=10)return 10;if(max<=20)return 20;if(max<=50)return 50;if(max<=100)return 100;return Math.ceil(max/100)*100}
function chartBar(label,value,max,extra="",tone="neutral"){let pct=max?Math.max(0,Math.min(100,(value/max)*100)):0;return `<div class="chartrow"><div class="chartlabel" title="${esc(label)}">${esc(label)}</div><div class="chartarea"><div class="charttrack"><div class="chartfill tone-${esc(tone)}" style="width:${pct}%"></div></div><div class="chartvalue">${esc(value)}${extra?` <span>${esc(extra)}</span>`:""}</div></div></div>`}
function chartPanel(title,rows,opts={}){let scroll=rows.length>opts.visible;let viewportClass=`chartviewport ${scroll?"has-scroll":""} v${opts.visible||5}`;return `<div class="card chartcard"><h3>${esc(title)}</h3>${opts.note?`<p class="muted chartnote">${esc(opts.note)}</p>`:""}<div class="${viewportClass}">${rows.length?rows.join(""):'<p class="muted">Sin datos para este período.</p>'}</div>${opts.scale?`<div class="chartsale"><span>0</span><span>${esc(opts.scale)}</span></div>`:""}</div>`}
function trendLinePanel(keys,counts,labels,grouping){
 if(!keys.length)return `<div class="card chartcard"><h3>Entradas y salidas en el tiempo</h3><p class="muted">Sin datos para este período.</p></div>`;
 const H=320,L=0,R=18,T=32,B=48,stepX=58,plotW=Math.max(640,keys.length*stepX),plotH=H-T-B;
 const maxValue=Math.max(1,...keys.flatMap(k=>[counts[k].in,counts[k].out]));
 const yMax=Math.max(1,Math.ceil(maxValue));
 const x=i=>L+stepX/2+i*stepX;
 const y=v=>T+plotH-(v/yMax)*plotH;
 const tickCount=Math.min(5,yMax+1);
 const ticks=Array.from({length:tickCount},(_,i)=>Math.round(i*yMax/(tickCount-1)));
 const grid=ticks.map(v=>`<g><line x1="0" y1="${y(v)}" x2="${plotW-R}" y2="${y(v)}" class="trend-grid"/></g>`).join('');
 const series=(key,color,name)=>{
  const pts=keys.map((k,i)=>`${x(i).toFixed(2)},${y(counts[k][key]).toFixed(2)}`).join(' ');
  const circles=keys.map((k,i)=>`<circle cx="${x(i).toFixed(2)}" cy="${y(counts[k][key]).toFixed(2)}" r="3.5" fill="${color}" class="trend-point"><title>${esc(labels[k])} · ${name}: ${counts[k][key]}</title></circle>`).join('');
  return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>${circles}`;
 };
 const formatAxisLabel=k=>{
  if(grouping==='month')return k.slice(5,7);
  const match=k.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match?`${match[3]}/${match[2]}`:k;
 };
 const xLabels=keys.map((k,i)=>`<text x="${x(i)}" y="${H-18}" text-anchor="middle" class="trend-axis-label"><title>${esc(labels[k])}</title>${esc(formatAxisLabel(k))}</text>`).join('');
 const yearSegments=[];let currentYear=null,segmentStart=0;
 keys.forEach((k,i)=>{const year=String(k).slice(0,4);if(year!==currentYear){if(currentYear!==null)yearSegments.push({year:currentYear,start:segmentStart,end:i-1});currentYear=year;segmentStart=i;}});
 if(currentYear!==null)yearSegments.push({year:currentYear,start:segmentStart,end:keys.length-1});
 const yearLabels=yearSegments.map(seg=>{const center=(x(seg.start)+x(seg.end))/2;return `<text x="${center}" y="17" text-anchor="middle" class="trend-year-label">${esc(seg.year)}</text>${seg.start>0?`<line x1="${x(seg.start)-stepX/2}" y1="24" x2="${x(seg.start)-stepX/2}" y2="${H-B+3}" class="trend-year-divider"/>`:''}`}).join('');
 const groupingText=grouping==='day'?'diaria':grouping==='week'?'semanal (de lunes a domingo)':'mensual';
 return `<div class="trend-control"><label class="statsfilterlabel">Agrupar entradas/salidas<select id="trendGrouping" class="period"><option value="day" ${grouping==='day'?'selected':''}>Por día</option><option value="week" ${grouping==='week'?'selected':''}>Por semana</option><option value="month" ${grouping==='month'?'selected':''}>Por mes</option></select></label></div><div class="card chartcard trend-card"><h3>Entradas y salidas en el tiempo</h3><p class="muted chartnote">Agrupación ${groupingText}. Las entradas usan su fecha de entrada y las salidas su fecha real de salida.</p><div class="trend-legend"><span><i class="trend-dot trend-blue"></i>Entradas</span><span><i class="trend-dot trend-red"></i>Salidas</span></div><div class="trend-chart-layout"><svg class="trend-y-axis" viewBox="0 0 48 ${H}" width="48" height="${H}" aria-hidden="true"><g>${ticks.map(v=>`<text x="42" y="${y(v)+4}" text-anchor="end" class="trend-axis-label">${v}</text>`).join('')}</g><line x1="47" y1="${T}" x2="47" y2="${H-B}" class="trend-axis"/></svg><div class="trend-graph-wrap"><svg class="trend-graph" viewBox="0 0 ${plotW} ${H}" width="${plotW}" height="${H}" role="img" aria-label="Gráfico de líneas de entradas y salidas por fecha"><g>${grid}${yearLabels}</g><line x1="0" y1="${H-B}" x2="${plotW-R}" y2="${H-B}" class="trend-axis"/>${series('in','#2788f5','Entradas')}${series('out','#e05252','Salidas')}${xLabels}</svg></div></div></div>`;
}
function renderStatistics(){
 const p=$("periodFilter").value, grouping=$("trendGrouping")?.value||"day";
 const entries=data.filter(x=>inPeriod(x.fechaEntrada,p));
 const exits=data.filter(x=>inPeriod(x.fechaSalida,p));
 const active=data.filter(x=>!finals.includes(x.estado));
 const activos=active.filter(x=>["En diagnóstico","En reparación"].includes(x.estado)).length;
 const espera=active.filter(x=>["En espera a diagnóstico","En espera de diagnóstico","En espera de confirmación","En espera de piezas"].includes(x.estado)).length;
 const pendientes=active.filter(x=>x.estado==="Listo para recoger").length;
 const currentRows=[["Activos",activos],["En espera",espera],["Pendientes",pendientes]];
 const currentMax=niceScale(Math.max(...currentRows.map(r=>r[1]),0));
 const currentChart=currentRows.map(r=>chartBar(r[0],r[1],currentMax,"",({"Activos":"green","En espera":"blue","Pendientes":"yellow"})[r[0]]||"neutral"));
 const activeInPeriod=entries.filter(x=>!finals.includes(x.estado)).length;
 const finalRows=[["Total entrados",entries.length],["Activos",activeInPeriod],["Entregados conformes",entries.filter(x=>x.estado==="Entregado / Conforme").length],["Devueltos",entries.filter(x=>x.estado==="Devuelto").length],["Cancelados",entries.filter(x=>x.estado==="Cancelado").length],["Derivados",entries.filter(x=>x.estado==="Derivado").length]];
 const finalMax=niceScale(Math.max(...finalRows.map(r=>r[1]),0));
 const finalChart=finalRows.map(r=>chartBar(r[0],r[1],finalMax,"",({"Total entrados":"navy","Entregados conformes":"green","Devueltos":"red","Cancelados":"red","Derivados":"orange"})[r[0]]||"neutral"));
 const byCat=countMap(entries,"categoria");
 const catRows=byCat.map(([cat,total])=>{const catEntries=entries.filter(x=>x.categoria===cat);const ok=catEntries.filter(x=>x.estado==="Entregado / Conforme").length;const rate=total?((ok/total)*100):0;return{cat,total,rate}});
 const catMax=niceScale(Math.max(...catRows.map(r=>r.total),0));
 const catChart=catRows.map(r=>chartBar(r.cat,r.total,catMax,`${Math.round(r.rate)}% éxito`,r.rate>=80?"green":r.rate>=50?"blue":"orange"));
 // Reingresos: nuevos tickets creados desde el flujo de reapertura, incluida la versión anterior inferida por sus notas.
 const isReentry=x=>!!(x.reingreso||x.ticketGarantiaOrigen||x.tipoReingresoGarantia||/reingreso/i.test(String(x.notas||"")));
 const isWarrantyReentry=x=>!!(x.tipoReingresoGarantia||x.ticketGarantiaOrigen||(x.garantia&&isReentry(x)));
 const reentries=entries.filter(isReentry), warrantyReentries=entries.filter(isWarrantyReentry);
 const reentryPct=entries.length?reentries.length/entries.length*100:0;
 const warrantyPct=reentries.length?warrantyReentries.length/reentries.length*100:0;
 const returnedUnrepaired=entries.filter(x=>x.estado==="Devuelto");
 const economicLosses=entries.filter(x=>{const e=ticketEconomy(x);return x.inversion!==""&&x.inversion!==undefined&&x.precio!==""&&x.precio!==undefined&&e.gross<0;});
 const resolved=entries.filter(x=>x.fechaEntrada&&x.fechaSalida&&finals.includes(x.estado)&&!Number.isNaN(new Date(x.fechaEntrada+"T00:00:00").getTime())&&!Number.isNaN(new Date(x.fechaSalida+"T00:00:00").getTime())&&new Date(x.fechaSalida+"T00:00:00")>=new Date(x.fechaEntrada+"T00:00:00"));
 const resolutionByCat=countMap(resolved,"categoria").map(([cat])=>{const xs=resolved.filter(x=>(x.categoria||"Sin definir")===cat);const days=xs.map(x=>(new Date(x.fechaSalida+"T00:00:00")-new Date(x.fechaEntrada+"T00:00:00"))/86400000);return{cat,count:xs.length,avg:days.reduce((a,b)=>a+b,0)/days.length};}).sort((a,b)=>a.avg-b.avg);
 const resolutionMax=Math.max(1,...resolutionByCat.map(x=>x.avg));
 const resolutionChart=resolutionByCat.map(r=>chartBar(r.cat,Number(r.avg.toFixed(1)),resolutionMax,`${r.count} ticket(s)`,r.avg<=3?"green":r.avg<=7?"blue":"orange"));
 // Agrupación de entradas y salidas por día, semana ISO (lunes) o mes.
 const bucketKey=(date)=>{if(!date)return "";const d=new Date(date+"T00:00:00");if(Number.isNaN(d.getTime()))return "";if(grouping==="month")return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;if(grouping==="week"){const mon=new Date(d);mon.setDate(mon.getDate()-((mon.getDay()+6)%7));return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,"0")}-${String(mon.getDate()).padStart(2,"0")}`;}return date;};
 const bucketLabel=k=>grouping==="month"?k:grouping==="week"?`Semana ${displayDate(k)}`:displayDate(k);
 const bucketCounts={};entries.forEach(x=>{const k=bucketKey(x.fechaEntrada);if(k)(bucketCounts[k]??={in:0,out:0}).in++;});exits.forEach(x=>{const k=bucketKey(x.fechaSalida);if(k)(bucketCounts[k]??={in:0,out:0}).out++;});
 let trendKeys=Object.keys(bucketCounts).sort();
 // Rellena los períodos intermedios con cero para que la línea refleje los días/semanas/meses sin movimientos.
 if(trendKeys.length>1){
  const first=new Date(trendKeys[0]+(grouping==="month"?"-01":"T00:00:00"));
  const lastKey=trendKeys[trendKeys.length-1];const last=new Date(lastKey+(grouping==="month"?"-01":"T00:00:00"));
  if(!Number.isNaN(first.getTime())&&!Number.isNaN(last.getTime())){
   const cursor=new Date(first);let guard=0;
   while(cursor<=last&&guard++<5000){let k;if(grouping==="month")k=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}`;else if(grouping==="week")k=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}-${String(cursor.getDate()).padStart(2,"0")}`;else k=cursor.toISOString().slice(0,10);bucketCounts[k]??={in:0,out:0};if(grouping==="month")cursor.setMonth(cursor.getMonth()+1);else cursor.setDate(cursor.getDate()+(grouping==="week"?7:1));
   }
  }
 }
 trendKeys=Object.keys(bucketCounts).sort();
 const trendLabels=Object.fromEntries(trendKeys.map(k=>[k,bucketLabel(k)]));
 const old=active.filter(x=>x.fechaEntrada&&(Date.now()-new Date(x.fechaEntrada+"T00:00:00"))/(864e5)>=14).sort((a,b)=>a.fechaEntrada.localeCompare(b.fechaEntrada)).slice(0,10);
 let body=`<div class="statsintro"><div class="statblock accent-green"><span class="staticon">●</span><h3>Equipos activos ahora</h3><strong>${active.length}</strong></div><div class="statblock accent-yellow"><span class="staticon">✓</span><h3>Listos para entregar</h3><strong>${pendientes}</strong></div><div class="statblock accent-blue"><span class="staticon">＋</span><h3>Entradas en período</h3><strong>${entries.length}</strong></div><div class="statblock accent-navy"><span class="staticon">↗</span><h3>Salidas en período</h3><strong>${exits.length}</strong></div></div>`;
 body+=`<div class="statsgrid">${chartPanel("Situación actual",currentChart,{visible:5,scale:currentMax})}${chartPanel("Estados finales comparados",finalChart,{visible:6,scale:finalMax,note:"Compara las entradas del período con su situación actual: cada entrada cuenta una sola vez como activa o en un estado final."})}</div>`;
 body+=trendLinePanel(trendKeys,bucketCounts,trendLabels,grouping);
 body+=chartPanel("Categorías y tasa de éxito",catChart,{visible:7,scale:catMax,note:"La longitud de la barra representa la cantidad de equipos entrados. La tasa se calcula como entregados conformes ÷ total de equipos entrados de esa categoría."});
 body+=chartPanel("Tiempo medio de resolución por categoría (días)",resolutionChart,{visible:8,scale:Number(resolutionMax.toFixed(1)),note:"Promedio entre fecha de entrada y fecha de salida, agrupado por categoría. Solo incluye tickets cerrados con ambas fechas válidas y salida no anterior a la entrada; los equipos aún abiertos no se cuentan."});
 body+=`<div class="card"><h3>Garantías, reingresos y pérdidas</h3><p class="muted chartnote">Indicadores calculados según la fecha de entrada del ticket dentro del período seleccionado. Una devolución sin reparar no se considera por sí sola una pérdida económica: la pérdida exige impacto económico negativo.</p><div class="statsintro stats-extra"><div class="statblock accent-blue"><h3>Reingresos</h3><strong>${reentries.length}</strong></div><div class="statblock accent-yellow"><h3>Reingresos por garantía</h3><strong>${warrantyReentries.length}</strong><small>${warrantyPct.toFixed(1)}% de los reingresos</small></div><div class="statblock accent-navy"><h3>Reingresos / entradas nuevas</h3><strong>${reentryPct.toFixed(1)}%</strong><small>${reentries.length} de ${entries.length} entradas</small></div><div class="statblock accent-red"><h3>Pérdidas económicas</h3><strong>${economicLosses.length}</strong><small>Impacto negativo</small></div><div class="statblock accent-red"><h3>Devueltos sin reparar</h3><strong>${returnedUnrepaired.length}</strong><small>Indicador operativo, no pérdida automática</small></div></div></div>`;
 body+=`<div class="card attention"><h3>Equipos estancados</h3>${old.length?list(old):'<p class="muted">No hay equipos activos con 14 días o más desde su entrada.</p>'}</div>`;
 $("statisticsBody").innerHTML=body;
 // El selector se recrea al renderizar estadísticas: volver a enlazar su evento en cada render.
 const groupingSelect=$("trendGrouping");
 if(groupingSelect) groupingSelect.onchange=renderStatistics;
}
$("periodFilter").onchange=renderStatistics;$("trendGrouping")&&($("trendGrouping").onchange=renderStatistics);
function rateOf(x){let r=Number(x.tasa||0);return r>0?r:1}
function rememberedRate(){return Number(contextStorage.getItem("taller_electronica_last_rate")||0)||lastRate()}
// V26: prioriza la tasa compartida recibida de la nube sobre un valor local antiguo.
(function hydrateSharedRate(){try{const x=JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null");if(x?.settingKey==="exchange_rate"&&Number(x.rate)>0){rememberRate(x.rate);economyConfig={...economyConfig,rate:Number(x.rate),date:x.updatedAt?.slice(0,10)||economyConfig.date};saveEconomyConfig();}}catch(e){console.warn("No se pudo cargar la tasa compartida",e)}})();
function rememberRate(v){if(Number(v)>0)contextStorage.setItem("taller_electronica_last_rate",String(Number(v)))}
// V27: identidad estable del único ajuste compartido del taller, igual en todos los dispositivos.
const SHARED_RATE_SYNC_ID="c50321fe-f534-4435-bf6b-b1e604b74fd9";
function sharedRateRecord(rate){let x;try{x=JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null")}catch{}if(!x||x.syncId!==SHARED_RATE_SYNC_ID)x={syncId:SHARED_RATE_SYNC_ID,remoteVersion:1,syncStatus:"synced",settingKey:"exchange_rate"};return {...x,syncId:SHARED_RATE_SYNC_ID,remoteVersion:Number(x.remoteVersion??1),settingKey:"exchange_rate",rate:Number(rate),updatedAt:new Date().toISOString(),entityType:"settings"}}
function queueSharedRate(rate){const rec=sharedRateRecord(rate);contextStorage.setItem(SHARED_SETTINGS_KEY,JSON.stringify(rec));queueLocalOperation("settings",rec,"upsert","exchange_rate");}

function usd(amount,currency,rate){return currency==="USD"?Number(amount||0):Number(amount||0)/Math.max(Number(rate||0),1)}
function ticketEconomy(x){let currency=x.moneda||"CUP",rate=rateOf(x),inv=Number(x.inversion||0),price=Number(x.precio||0),income=price,gross=price-inv,margin=x.margen===""?"":Number(x.margen||0),available=margin===""?"":gross-margin;return{currency,rate,inv,price,income,gross,margin,available,invUSD:usd(inv,currency,rate),priceUSD:usd(price,currency,rate),incomeUSD:usd(income,currency,rate),grossUSD:usd(gross,currency,rate),availableUSD:available===""?"":usd(available,currency,rate)}}
function economyTickets(){return data.filter(x=>finals.includes(x.estado)).filter(x=>x.fechaSalida||x.economiaRegistrada||Number(x.precio||0)!==0||Number(x.inversion||0)!==0)}
function economyInPeriod(x){return economyPeriod==="all"||inPeriod(x.fechaSalida||x.fechaEntrada,economyPeriod)}
function money(v,c="USD"){return `${Number(v||0).toFixed(2)} ${c}`}
function moneyPair(amount,currency,rate){const v=Number(amount||0);if(currency==='USD')return `<b>${v.toFixed(2)} USD</b>`;const u=usd(v,currency,rate);return `<b>${v.toFixed(2)} CUP</b><small class="money-equivalent">≈ ${u.toFixed(2)} USD</small>`}
// V6.0-dev-v63: los movimientos ECN usan fecha y los tickets su fecha contable; ambos comparten el mismo criterio de orden.
function economyDate(x){return x.fechaSalida||x.fechaEntrada||x.fecha||''}
function economyAmountUSD(x){return x._kind==='movement'?usd(x.cantidad,x.moneda,x.tasa):ticketEconomy(x).incomeUSD}
function currentRate(){return rememberedRate()}
function currentCUP(value,currency){let v=Number(value||0);return currency==='USD'?v*currentRate():v}
function hasInitialBalanceMovement(){return movements.some(m=>m.esSaldoInicial)}
function legacyInitialBalancePhysical(){if(hasInitialBalanceMovement())return{cup:0,usd:0};if(economyConfig.currency==='USD')return{cup:0,usd:Number(economyConfig.amount||0)};return{cup:Number(economyConfig.amount||0),usd:0}}
/** Calcula el fondo físico del taller manteniendo CUP y USD separados.
 * Los movimientos ECN afectan directamente el fondo.
 * En un ticket rentable, la Inversión retorna al fondo junto con el Margen:
 * retorno = Inversión + Margen; crecimiento real = Margen.
 * En un ticket con pérdida, el impacto neto es la pérdida (Precio - Inversión).
 */
function economyBalancePhysical(){let legacy=legacyInitialBalancePhysical(),cup=legacy.cup,usdBalance=legacy.usd;const ets=economyTickets();data.forEach(x=>{if(!ets.includes(x))return;const e=ticketEconomy(x);if(e.gross<0){const loss=Math.abs(e.gross);if(e.currency==='USD')usdBalance-=loss;else cup-=loss;return}const inv=e.inv||0,m=e.margin===''?0:Number(e.margin||0),retorno=inv+m;if(e.currency==='USD')usdBalance+=retorno;else cup+=retorno});movements.forEach(m=>{const v=Number(m.cantidad||0);if(m.moneda==='USD')usdBalance+=m.tipo==='Entrada'?v:-v;else cup+=m.tipo==='Entrada'?v:-v});return{cup,usd:usdBalance}}
function economyBalanceCUP(){const b=economyBalancePhysical();return b.cup+b.usd*currentRate()}
function economyBalanceUSD(){const b=economyBalancePhysical();let r=currentRate();return r>0?b.usd+b.cup/r:0}
function economySummary(){let tickets=economyTickets().filter(economyInPeriod);let income=tickets.reduce((s,x)=>{const e=ticketEconomy(x);return s+(e.income>0?e.incomeUSD:0)},0);let investment=tickets.reduce((s,x)=>s+ticketEconomy(x).invUSD,0);let gross=income-investment;let available=tickets.reduce((s,x)=>{const e=ticketEconomy(x);const m=e.margin===""?0:usd(e.margin,e.currency,e.rate);return s+e.grossUSD-m},0);let ticketMargin=tickets.reduce((s,x)=>{const e=ticketEconomy(x);return s+(e.margin===""?0:usd(e.margin,e.currency,e.rate))},0);let emIn=movements.filter(m=>inPeriod(m.fecha,economyPeriod)&&m.tipo==="Entrada").reduce((s,m)=>s+usd(m.cantidad,m.moneda,m.tasa),0);let emOut=movements.filter(m=>inPeriod(m.fecha,economyPeriod)&&m.tipo==="Salida").reduce((s,m)=>s+usd(m.cantidad,m.moneda,m.tasa),0);let losses=tickets.reduce((s,x)=>{const e=ticketEconomy(x);return s+(e.gross<0?Math.abs(e.grossUSD):0)},0);let incremento=ticketMargin-losses;let gananciaTaller=incremento;let ingresosTaller=tickets.reduce((s,x)=>{const e=ticketEconomy(x);const m=e.margin===''?0:usd(e.margin,e.currency,e.rate);return s+(e.gross>0?Math.max(0,e.grossUSD-Math.max(0,m)):0)},0);let gananciasRepartidas=ingresosTaller;let incrementosTotales=ticketMargin+gananciasRepartidas;let gananciaTotal=gananciaTaller+gananciasRepartidas;let physical=economyBalancePhysical();return{tickets,income,investment,gross,available,reinvestment:emIn,ticketMargin,ingresosTaller,gananciasRepartidas,incremento,gananciaTaller,incrementosTotales,gananciaTotal,emIn,emOut,losses,balance:economyBalanceUSD(),balanceCUP:economyBalanceCUP(),balanceCUPPhysical:physical.cup,balanceUSDPhysical:physical.usd,otherOut:emOut}}
function economyCard(x){
 let e=ticketEconomy(x);
 let incremento=e.gross>0?Math.max(0,Number(e.margin||0)):0;
 let impactoTotal=e.gross<0?e.gross:(e.inv+incremento);
 let incrementoClass=incremento>0?"positive":"";
 let impactoClass=impactoTotal<0?"negative":impactoTotal>0?"positive":"";
 let incrementoSign=incremento>0?"+":"";
 let impactoSign=impactoTotal>0?"+":"";
 return `<div class="econ-row">
  <div class="econ-ticket-id">${esc(x.ticketId)}</div>
  <div class="econ-date muted">${esc(displayDate(economyDate(x)))}</div>
  <div class="econ-columns">
   <div class="econ-left">
    <div class="econ-meta"><div class="muted">${esc(x.equipo||"Equipo sin especificar")}</div><div class="muted">${esc(x.cliente||"Cliente sin nombre")}</div></div>
    <div class="econ-gain"><span class="econ-label">${e.gross<0?"Pérdida":"Ganancia Total"}</span><b class="${e.gross<0?"negative":"positive"}">${Math.abs(e.gross).toFixed(2)} ${e.currency}</b>${e.currency==='CUP'?`<small class="money-equivalent">≈ ${Math.abs(e.grossUSD).toFixed(2)} USD</small>`:''}</div>
    <div class="econ-rate"><span class="econ-label">Tasa CUP/USD</span><b>${e.currency==='USD'?'—':esc(e.rate||'—')}</b></div>
   </div>
   <div class="econ-right">
    <div class="econ-investment"><span class="econ-label">Inversión</span>${moneyPair(e.inv,e.currency,e.rate)}</div>
    <div class="econ-increment"><span class="econ-label">Incremento del taller</span><b class="${incrementoClass}">${incrementoSign}${incremento.toFixed(2)} ${e.currency}</b>${e.currency==='CUP'?`<small class="money-equivalent">≈ ${incrementoSign}${usd(incremento,e.currency,e.rate).toFixed(2)} USD</small>`:''}</div>
    <div class="econ-impact"><span class="econ-label">Impacto total en el taller</span><b class="${impactoClass}">${impactoSign}${impactoTotal.toFixed(2)} ${e.currency}</b>${e.currency==='CUP'?`<small class="money-equivalent">≈ ${impactoSign}${usd(impactoTotal,e.currency,e.rate).toFixed(2)} USD</small>`:''}</div>
   </div>
  </div>
  <div class="econ-footer">
   <div class="econ-status"><span class="badge">${esc(x.estado)}</span><span class="econ-technician badge">T: ${esc(x.tecnico||"Sin asignar")}</span></div>
   <div class="econ-action"><button class="secondary" onclick="openEconomyTicket('${escAttr(x.ticketId)}')">Examinar</button></div>
  </div>
 </div>`
}
function economyMovementUnified(m){return {...m,_kind:'movement'}}
function economyUnified(){return economyTickets().map(x=>({...x,_kind:'ticket'})).concat(movements.map(economyMovementUnified))}
// V6.0-dev-v64: normalizar fechas antes de ordenar; soporta ISO (AAAA-MM-DD) y DD/MM/AAAA sin mezclar sus formatos lexicográficos.
function economySortDate(value){const s=String(value||'').trim();let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return `${m[1]}-${m[2]}-${m[3]}`;m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return s}
function economySortUnified(a,b){const da=economySortDate(economyDate(a)),db=economySortDate(economyDate(b)),ida=String(a.ticketId||a.equipoId||a.id||''),idb=String(b.ticketId||b.equipoId||b.id||'');if(economySort==='oldest')return da.localeCompare(db)||ida.localeCompare(idb);if(economySort==='amount_desc')return economyAmountUSD(b)-economyAmountUSD(a)||db.localeCompare(da);if(economySort==='amount_asc')return economyAmountUSD(a)-economyAmountUSD(b)||db.localeCompare(da);if(economySort==='id_asc')return ida.localeCompare(idb);if(economySort==='id_desc')return idb.localeCompare(ida);return db.localeCompare(da)||idb.localeCompare(ida)}
function unifiedEconomyCard(x){return x._kind==='ticket'?economyCard(x):movementCard(x)}
function balanceMarkup(s,compact=false){return `<div class="balance-breakdown"><div><span>CUP</span><b>${s.balanceCUPPhysical.toFixed(2)} CUP</b></div><div><span>USD</span><b>${s.balanceUSDPhysical.toFixed(2)} USD</b></div><div><span>Total</span><b>${s.balance.toFixed(2)} USD</b></div><small class="money-equivalent">≈ ${s.balanceCUP.toFixed(2)} CUP al cambio actual</small></div>`}
function renderEconomy(){let s=economySummary();let arr=economyUnified().filter(x=>x._kind==='movement'?inPeriod(x.fecha,economyPeriod):economyInPeriod(x)).sort(economySortUnified);let current=currentRate();$('economyBody').innerHTML=`<div class="economy-kpis"><div class="statblock accent-green"><h3>Ingresos Totales</h3><strong>${money(s.income)}</strong></div><div class="statblock accent-blue"><h3>Ganancia del Taller</h3><strong class="${s.gananciaTaller<0?'negative':'positive'}">${money(s.gananciaTaller)}</strong></div><div class="statblock accent-yellow"><h3>Ganancia Total</h3><strong class="${s.gananciaTotal<0?'negative':'positive'}">${money(s.gananciaTotal)}</strong></div><div class="statblock accent-green"><h3>Balance Actual (Taller)</h3><strong class="${s.balance<0?'negative':'positive'}">${money(s.balance)}</strong>${balanceMarkup(s,true)}</div></div><div class="actions economy-main-actions"><button class="secondary" id="economyDetailsBtn">＋ Más detalles</button><button class="danger" id="factoryResetBtn">Restablecer de fábrica</button></div><div id="economyDetails" class="hidden"><div class="card"><h3>Detalles económicos</h3><div class="detailgrid"><div class="detailitem"><small>Inversión neta</small><div>${money(s.investment)}</div></div><div class="detailitem"><small>Margen</small><div>${money(s.emIn)}</div></div><div class="detailitem"><small>Gastos</small><div>${money(s.emOut)}</div></div><div class="detailitem"><small>Pérdidas</small><div class="${s.losses>0?'negative':''}">${money(s.losses)}</div></div><div class="detailitem"><small>Ganancias repartidas</small><div class="${s.gananciasRepartidas<0?'negative':'positive'}">${money(s.gananciasRepartidas)}</div></div><div class="detailitem"><small>Incrementos totales</small><div class="${s.incrementosTotales<0?'negative':'positive'}">${money(s.incrementosTotales)}</div></div></div><div class="actions"><button class="secondary" id="editCurrentRateBtn">Modificar cambio actual</button><span class="field-help">Tasa actual: <b>${current.toFixed(2)} CUP/USD</b></span></div></div></div><div class="card economy-tools"><div class="two"><label>Período<select id="economyPeriod"><option value="all">Todo</option><option value="today">Hoy</option><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="month">Este mes</option><option value="prevmonth">Mes anterior</option></select></label><label>Ordenar<select id="economySort"><option value="recent">Más recientes</option><option value="oldest">Más antiguos</option><option value="amount_desc">Importe mayor</option><option value="amount_asc">Importe menor</option><option value="id_asc">ID ascendente</option><option value="id_desc">ID descendente</option></select></label></div><div class="actions"><button class="primary" id="addMovementBtn">＋ Agregar movimiento</button></div></div><div class="card"><h3>Movimientos económicos</h3>${arr.length?`<div class="econ-cards-grid">${arr.map(unifiedEconomyCard).join('')}</div>`:'<p class="muted">No hay movimientos económicos para este período.</p>'}</div>`;$('economyPeriod').value=economyPeriod;$('economySort').value=economySort;$('economyPeriod').onchange=e=>{economyPeriod=e.target.value;renderEconomy()};$('economySort').onchange=e=>{economySort=e.target.value;renderEconomy()};$('addMovementBtn').onclick=()=>openMovementDialog();$('economyDetailsBtn').onclick=()=>{let d=$('economyDetails');d.classList.toggle('hidden');$('economyDetailsBtn').textContent=d.classList.contains('hidden')?'＋ Más detalles':'− Ocultar detalles'};$('factoryResetBtn').onclick=openFactoryReset;$('editCurrentRateBtn').onclick=openCurrentRateDialog}
function movementCard(m){const amount=Math.abs(Number(m.cantidad||0)),u=usd(amount,m.moneda,m.tasa),sign=m.tipo==='Entrada'?'+':'−';return `<div class="movement-row econ-row">
 <div class="econ-ticket-id">${esc(m.id)}</div>
 <div class="econ-date muted">${esc(displayDate(m.fecha))} · ${esc(m.tipo)}</div>
 <div class="econ-columns movement-columns">
  <div class="econ-left">
   <div class="econ-meta movement-notes">${esc(m.notas||'—')}</div>
   <div class="econ-rate"><span class="econ-label">Tasa CUP/USD</span><b>${m.moneda==='USD'?'—':esc(m.tasa||'—')}</b></div>
  </div>
  <div class="econ-right">
   <div class="econ-investment"><span class="econ-label">Cantidad</span><b class="${m.tipo==='Entrada'?'positive':'negative'}">${sign}${amount.toFixed(2)} ${esc(m.moneda)}</b>${m.moneda==='CUP'?`<small class="money-equivalent">≈ ${u.toFixed(2)} USD</small>`:''}</div>
  </div>
 </div>
 <div class="movement-footer"><div class="actions"><button class="secondary" onclick="editMovement('${escAttr(m.id)}')">Editar</button><button class="danger" onclick="deleteMovement('${escAttr(m.id)}')">Borrar</button></div></div>
</div>`}
function openEconomyTicket(ticketId){
 let x=data.find(a=>a.ticketId===ticketId);if(!x)return;
 $('economyDialogTitle').textContent='Economía · '+x.ticketId;
 let e=ticketEconomy(x);
 const invValue=x.inversion??'';
 const priceValue=x.precio??'';
 const gross=Number(e.price||0)-Number(e.inv||0);
 const maxMargin=Math.max(0,gross);
 const marginValue=e.margin===''?'':Math.min(Math.max(0,Number(e.margin||0)),maxMargin);
 $('economyDialogBody').innerHTML=`
 <div class="detailgrid economy-detailgrid">
  <div class="detailitem"><small>Ticket</small><div>${esc(x.ticketId)}</div></div>
  <div class="detailitem"><small>Fecha de salida</small><div>${esc(displayDate(x.fechaSalida||x.fechaEntrada))}</div></div>
  <div class="detailitem"><small>Equipo</small><div>${esc(x.equipo)}</div></div>
  <div class="detailitem"><small>Técnico responsable</small><div>${esc(x.tecnico||"Sin asignar")}</div></div>
  <div class="detailitem econ-editable"><small>Inversión</small><input id="econ_inversion" type="number" min="0" step="0.01" value="${escAttr(invValue)}" placeholder="Costo real del trabajo"></div>
  <div class="detailitem econ-editable"><small>Margen</small><input id="econ_margen" type="number" min="0" step="0.01" value="${escAttr(marginValue)}" placeholder="${escAttr(invValue!==''&&Number(invValue)>0?suggestedMargin(invValue):'')}" ${gross<0?'disabled':''}><small class="field-help">Parte de la ganancia total que se queda en el taller.</small></div>
  <div class="detailitem econ-editable"><small>Precio final</small><input id="econ_precio" type="number" min="0" step="0.01" value="${escAttr(priceValue)}" placeholder="Precio cobrado"></div>
  <div class="detailitem"><small>${gross<0?'Pérdida':'Ganancia Total'}</small><div id="econ_ganancia_view" class="${gross<0?'negative':'positive'}">${moneyPair(Math.abs(gross),e.currency,e.rate)}</div></div>
  <div class="detailitem"><small>Ganancia disponible</small><div id="econ_disponible_view" class="${e.available!==''&&e.available<0?'negative':''}">${e.available===''?'No definida':moneyPair(e.available,e.currency,e.rate)}</div><small class="field-help">Ganancia total − Margen.</small></div>
  <div class="detailitem"><small>Moneda del ticket</small><div>${esc(e.currency)}</div></div>
  <div class="detailitem econ-editable"><small>Tasa de cambio (CUP/USD)</small><input id="econ_tasa" type="number" min="0" step="0.01" value="${escAttr(x.tasa??'')}" ${e.currency==='USD'?'disabled':''}><small class="field-help">Solo modifica la tasa histórica de este ticket; no cambia la tasa general.</small></div>
 </div>
 <div class="actions"><button class="primary" onclick="saveEconomyTicket('${escAttr(x.ticketId)}')">Guardar economía</button><button class="secondary" onclick="$('economyDialog').close()">Cerrar</button></div>`;
 $('economyDialog').showModal();
 const invInput=$('econ_inversion'), priceInput=$('econ_precio'), marginInput=$('econ_margen'), rateInput=$('econ_tasa');
 const updateValues=()=>{
  const inv=Number(invInput.value||0), price=Number(priceInput.value||0), g=price-inv;
  const m=marginInput.value===''?'':Math.min(Math.max(0,Number(marginInput.value||0)),Math.max(0,g));
  if(g<0){marginInput.disabled=true;marginInput.value='0'}else{marginInput.disabled=false;if(marginInput.value!==''&&Number(marginInput.value)>g)marginInput.value=String(g)}
  const actualMargin=marginInput.value===''?'':Number(marginInput.value||0);
  const gain=$('econ_ganancia_view'),available=$('econ_disponible_view');
  gain.classList.toggle('negative',g<0);gain.classList.toggle('positive',g>=0);gain.innerHTML=moneyPair(Math.abs(g),e.currency,Number(rateInput.value||e.rate));
  available.classList.toggle('negative',actualMargin!==''&&g-actualMargin<0);
  available.innerHTML=actualMargin===''?'No definida':moneyPair(g-actualMargin,e.currency,Number(rateInput.value||e.rate));
 };
 [invInput,priceInput,marginInput,rateInput].forEach(el=>el.addEventListener('input',updateValues));
}

function saveEconomyTicket(ticketId){
 let x=data.find(a=>a.ticketId===ticketId);if(!x)return;
 const invRaw=$("econ_inversion").value,priceRaw=$("econ_precio").value,marginRaw=$("econ_margen").value;
 const rate=Number($("econ_tasa").value||0);
 if(x.moneda!=="USD"&&!(rate>0)){alert("Para CUP debes indicar una tasa de cambio mayor que cero.");return}
 x.inversion=invRaw===""?"":Number(invRaw);
 x.precio=priceRaw===""?"":Number(priceRaw);
 const gross=Number(x.precio||0)-Number(x.inversion||0);
 let margin=marginRaw===""?"":Number(marginRaw);
 if(gross<0&&margin!=="")margin=0;else if(margin!=="")margin=Math.min(Math.max(0,margin),Math.max(0,gross));
 x.margen=margin;
 if(x.moneda!=="USD")x.tasa=rate;else x.tasa=1;
 x.gananciaDisponible=margin===""?"":gross-margin;
 x.economiaRegistrada=true;
 save();$("economyDialog").close();renderEconomy();
}
function openMovementDialog(id=""){editingMovementId=id||null;let m=id?movements.find(v=>v.id===id):null;$("movementDialogTitle").textContent=m?"Editar movimiento":"Agregar movimiento";$("movementDialogBody").innerHTML=`<div class="two"><label>ID<input value="${escAttr(m?.id||nextMovementId())}" readonly></label><label>Fecha<input id="mov_fecha" type="date" value="${escAttr(m?.fecha||today())}"></label></div><div class="two"><label>Entrada / Salida<select id="mov_tipo"><option ${(!m||m.tipo==="Entrada")?"selected":""}>Entrada</option><option ${m?.tipo==="Salida"?"selected":""}>Salida</option></select></label><label>Cantidad<input id="mov_cantidad" type="number" min="0" step="0.01" value="${escAttr(m?.cantidad??"")}"></label></div><div class="two"><label>Moneda<select id="mov_moneda"><option ${(!m||m.moneda==="CUP")?"selected":""}>CUP</option><option ${m?.moneda==="USD"?"selected":""}>USD</option></select></label><label>Tasa cambiaria<input id="mov_tasa" type="number" min="0" step="0.01" value="${escAttr(m?.tasa??rememberedRate())}" ${m?.moneda==="USD"?"disabled":""}></label></div><label>Notas<textarea id="mov_notas">${esc(m?.notas||"")}</textarea><div class="actions"><button class="primary" onclick="saveMovement()">Guardar</button><button class="secondary" onclick="$(\'movementDialog\').close()">Cancelar</button></div>`;$("movementDialog").showModal();$("mov_moneda").onchange=()=>{let usd=$("mov_moneda").value==="USD";$("mov_tasa").disabled=usd;if(!usd&&!$("mov_tasa").value)$("mov_tasa").value=lastRate()}}
function lastRate(){for(let i=movements.length-1;i>=0;i--)if(movements[i].moneda!=="USD"&&Number(movements[i].tasa)>0)return movements[i].tasa;for(let i=data.length-1;i>=0;i--)if(data[i].moneda!=="USD"&&Number(data[i].tasa)>0)return data[i].tasa;return 1}
function saveMovement(){let id=editingMovementId||nextMovementId(),m={id,fecha:$("mov_fecha").value||today(),tipo:$("mov_tipo").value,cantidad:Math.abs(Number($("mov_cantidad").value||0)),moneda:$("mov_moneda").value,tasa:$("mov_moneda").value==="USD"?1:Number($("mov_tasa").value||rememberedRate()),notas:$("mov_notas").value.trim()};if(!m.cantidad){alert("La cantidad debe ser mayor que 0.");return}if(m.moneda!=="USD"&&!m.tasa){alert("Para CUP debes indicar la tasa cambiaria.");return}if(m.moneda!=="USD")rememberRate(m.tasa);let i=movements.findIndex(v=>v.id===id);if(i>=0){m=withSyncMeta({...m,syncId:movements[i].syncId,remoteVersion:movements[i].remoteVersion,syncStatus:movements[i].syncStatus},"movement");movements[i]=m;}else{m=withSyncMeta(m,"movement");movements.push(m);}save();$("movementDialog").close()}
function editMovement(id){openMovementDialog(id)}
function deleteMovement(id){if(!confirm("¿Borrar este movimiento económico?"))return;const target=movements.find(m=>m.id===id);if(target)queueLocalDelete("movement",target,id);movements=movements.filter(m=>m.id!==id);save()}
function openCurrentRateDialog(){let r=currentRate();let v=prompt("Cambio monetario actual (CUP por 1 USD):",String(r));if(v===null)return;let n=Number(v);if(!(n>0)){alert("La tasa debe ser mayor que 0.");return}rememberRate(n);renderAll()}
function openFactoryReset(){if(!confirm("Esto borrará todos los tickets y movimientos económicos de este dispositivo. ¿Continuar?"))return;let cup=Number(prompt("Saldo inicial en CUP. Puede ser 0:","0"));if(!(cup>=0)){alert("El saldo inicial CUP no es válido.");return}let usdAmount=Number(prompt("Saldo inicial en USD. Puede ser 0:","0"));if(!(usdAmount>=0)){alert("El saldo inicial USD no es válido.");return}if(cup===0&&usdAmount===0){/* Se permite comenzar en cero. */}let rate=Number(prompt("Cambio monetario inicial (1 USD = X CUP):",String(currentRate())));if(!(rate>0)){alert("La tasa debe ser mayor que 0.");return}if(!confirm(`Se borrarán ${data.length} tickets y ${movements.length} movimientos. Nuevo saldo inicial: ${cup.toFixed(2)} CUP + ${usdAmount.toFixed(2)} USD. ¿Confirmar restablecimiento?`))return;data=[];movements=[];let n=1;if(cup>0)movements.push(withSyncMeta({id:uniqueVisibleId("ECN-X"),fecha:today(),tipo:"Entrada",cantidad:cup,moneda:"CUP",tasa:rate,notas:"Saldo inicial del taller",esSaldoInicial:true},"movement"));if(usdAmount>0)movements.push(withSyncMeta({id:uniqueVisibleId("ECN-X"),fecha:today(),tipo:"Entrada",cantidad:usdAmount,moneda:"USD",tasa:1,notas:"Saldo inicial del taller",esSaldoInicial:true},"movement"));economyConfig={amount:0,currency:"CUP",rate:rate,date:today()};contextStorage.removeItem("taller_electronica_last_rate");rememberRate(rate);save();alert("Taller restablecido. El saldo inicial quedó registrado por separado en CUP y USD.")}
function exportExcel(){let headers=["ID","Fecha entrada","Fecha salida","Cliente","CID","Contacto","Equipo","Modelo","Categoría","Origen","Referido por","Problema","Diagnóstico","Técnico","Estado","Inversión","Precio final","Accesorios","Notas"];let map={"ID":"id","Fecha entrada":"fechaEntrada","Fecha salida":"fechaSalida","Cliente":"cliente","CID":"cid","Contacto":"contacto","Equipo":"equipo","Modelo":"modelo","Categoría":"categoria","Origen":"origen","Referido por":"referido","Problema":"problema","Diagnóstico":"diagnostico","Técnico":"tecnico","Estado":"estado","Inversión":"inversion","Precio final":"precio","Accesorios":"accesorios","Notas":"notas"};let rows=data.map(x=>headers.map(h=>{let v=x[map[h]]??"";return(h==="Fecha entrada"||h==="Fecha salida")?displayDate(v):v}));let xml='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Historico"><Table>';[headers,...rows].forEach(r=>xml+="<Row>"+r.map(v=>`<Cell><Data ss:Type="${typeof v==="number"?"Number":"String"}">${esc(v)}</Data></Cell>`).join("")+"</Row>");xml+="</Table></Worksheet></Workbook>";downloadBlob(xml,"Historico_Taller_Electronica.xls","application/vnd.ms-excel")}
$("exportBtn").onclick=exportExcel;
function downloadBlob(content,name,type){let a=document.createElement("a"),u=URL.createObjectURL(new Blob([content],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function photoAll(){return openPhotoDB().then(db=>new Promise((resolve,reject)=>{const q=db.transaction("photos","readonly").objectStore("photos").getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>reject(q.error)}))}
function blobToDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
function dataURLToBlob(data){const [meta,b64]=data.split(",");const bin=atob(b64);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new Blob([bytes],{type:(meta.match(/data:([^;]+)/)||[])[1]||"application/octet-stream"})}
/** Exporta exclusivamente el repositorio fotográfico. No incluye tickets ni datos comunes. */
async function exportPhotos(){try{const rows=[];for(const p of await photoAll())rows.push({id:p.id,name:p.name,type:p.type,createdAt:p.createdAt,data:await blobToDataURL(p.blob)});downloadBlob(JSON.stringify({version:APP_VERSION,app:"NEXUM Taller",type:"photo-repository",photos:rows}),"Fotos_NEXUM_"+today()+".json","application/json");}catch(e){alert("No se pudo exportar el repositorio de fotos.")}}
/** Importa exclusivamente fotos; los IDs se conservan para que los tickets puedan recuperar sus referencias. */
async function importPhotos(file){try{const p=JSON.parse(await file.text());if(p.type!=="photo-repository"||!Array.isArray(p.photos))throw Error();const db=await openPhotoDB();await new Promise((resolve,reject)=>{const tx=db.transaction("photos","readwrite");for(const x of p.photos){if(x.id&&x.data)tx.objectStore("photos").put({id:x.id,name:x.name||"foto",type:x.type||"image/*",createdAt:x.createdAt||new Date().toISOString(),blob:dataURLToBlob(x.data)})}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});alert("Repositorio de fotos importado correctamente.");if($("detailDialog").open){const title=$("detailTitle").textContent;/* El ticket se volverá a renderizar al abrirlo de nuevo. */}}catch(e){alert("El archivo de fotos no tiene un formato válido.")}}

$("backupBtn").onclick=()=>{let payload={version:APP_VERSION,exportado:new Date().toISOString(),app:"NEXUM Taller",data,movements,equipmentRecords,economyConfig,categories,appSettings};downloadBlob(JSON.stringify(payload,null,2),"Copia_Taller_Electronica_"+today()+".json","application/json")};$("restoreBtn").onclick=()=>$("restoreFile").click();$("exportPhotosBtn").onclick=exportPhotos;$("importPhotosBtn").onclick=()=>$("importPhotosFile").click();$("importPhotosFile").onchange=e=>{const f=e.target.files[0];if(f)importPhotos(f);e.target.value=""};$("fotos").addEventListener("change",()=>{const host=$("photoPreview");host.innerHTML="";selectedPhotos().forEach(f=>{const img=document.createElement("img");img.src=URL.createObjectURL(f);img.alt=f.name;img.className="preview-photo";host.appendChild(img)})});$("restoreFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let p=JSON.parse(r.result),arr=Array.isArray(p)?p:p.data;if(!Array.isArray(arr))throw Error();if(!confirm("Restaurar esta copia reemplazará los datos actuales. ¿Continuar?"))return;data=arr.map(x=>withSyncMeta(normalize(x),"ticket"));movements=Array.isArray(p.movements)?p.movements.map(x=>withSyncMeta(normalizeMovement(x),"movement")):[];if(Array.isArray(p.equipmentRecords)){equipmentRecords=p.equipmentRecords.map(x=>withSyncMeta(x,"equipment"));}else{contextStorage.removeItem(EQUIPMENT_STORE_KEY);equipmentRecords=loadEquipmentRecords();}economyConfig=p.economyConfig&&Number(p.economyConfig.amount)>=0?{amount:Number(p.economyConfig.amount),currency:p.economyConfig.currency||"CUP",rate:Number(p.economyConfig.rate)>0?Number(p.economyConfig.rate):1,date:p.economyConfig.date||today()}: {amount:0,currency:"CUP",rate:1,date:""};if(Array.isArray(p.categories)&&p.categories.includes("Sin definir")){categories=[...new Set(p.categories.map(String))];contextStorage.setItem(CATEGORIES_KEY,JSON.stringify(categories))}if(p.appSettings&&typeof p.appSettings==="object"){appSettings=p.appSettings;contextStorage.setItem(SETTINGS_KEY,JSON.stringify(appSettings))}save();fillSelects();applyTheme();renderSettings();alert("Copia restaurada correctamente.")}catch(err){alert("La copia no tiene un formato válido.")}e.target.value=""};r.readAsText(f)};
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}function escAttr(v){return String(v??"").replace(/'/g,"&#39;")}function pretty(k){return({garantia:"Garantía",garantiaConcedida:"Garantía concedida",garantiaDuracion:"Duración de garantía",garantiaUnidad:"Unidad de garantía",garantiaInicio:"Inicio de garantía",garantiaVencimiento:"Vencimiento de garantía",ticketGarantiaOrigen:"Ticket original de garantía",ordenFecha:"Orden del día",ticketId:"Ticket",equipoId:"ID equipo",id:"ID equipo (legado)",fechaEntrada:"Fecha entrada",fechaSalida:"Fecha salida",cliente:"Cliente",cid:"CID",contacto:"Contacto",equipo:"Equipo",modelo:"Modelo",categoria:"Categoría",origen:"Origen",referido:"Referido por",problema:"Problema",diagnostico:"Diagnóstico",tecnico:"Técnico",estado:"Estado",accesorios:"Accesorios",inversion:"Inversión",precio:"Precio final",moneda:"Moneda",tasa:"Cambio monetario",notas:"Notas"})[k]||k}
function renderAll(){applyTheme();renderStats();if($("cola").classList.contains("active"))renderQueue();if($("historico").classList.contains("active"))renderHistory();if($("estadisticas").classList.contains("active"))renderStatistics();if($("economia").classList.contains("active"))renderEconomy();$("id").value=nextId()}
clearForm();attachClientAssist();applyTheme();$("clearBtn").onclick=clearForm;$("inversion").addEventListener("input",updatePricingSuggestions);$("moneda").onchange=()=>{$("tasa").disabled=$("moneda").value==="USD";if($("moneda").value!=="USD"&&!$("tasa").value)$("tasa").value=rememberedRate()};renderAll();
/* PWA: el registro solo funciona en HTTPS/localhost; abrir index.html como file:// no registra service worker. */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(err => console.warn("NEXUM PWA: no se pudo registrar el service worker", err)));
}
let deferredInstallPrompt;
const installButton = $("installBtn");
if (installButton) {
  const alreadyInstalled = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (alreadyInstalled) installButton.classList.add("hidden"); else installButton.classList.remove("hidden");
}
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault(); deferredInstallPrompt = event;
  if (installButton) { installButton.classList.remove("hidden"); installButton.title = "Instalar aplicación"; }
});
if (installButton) installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    alert("Para instalar NEXUM: abre este enlace HTTPS en Chrome, pulsa ⋮ y elige ‘Instalar aplicación’ o ‘Añadir a pantalla de inicio’. Si solo aparece añadir acceso directo, el navegador no ofrece la instalación PWA en este momento.");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
});
window.addEventListener("appinstalled", () => { if (installButton) installButton.classList.add("hidden"); });
window.examine=examine;window.enableEdit=enableEdit;window.saveEdit=saveEdit;window.deleteCase=deleteCase;window.newWarranty=newWarranty;window.openEconomyTicket=openEconomyTicket;window.saveEconomyTicket=saveEconomyTicket;window.openMovementDialog=openMovementDialog;window.saveMovement=saveMovement;window.editMovement=editMovement;window.deleteMovement=deleteMovement;


/* V6.0-dev-v82 — la versión visible se lee del archivo version.txt. */
(async function loadVisibleVersion(){try{const response=await fetch("./version.txt?ts="+Date.now(),{cache:"no-store"});if(!response.ok)return;const version=(await response.text()).trim();if(!version)return;const label=document.getElementById("appVersion");if(label)label.textContent=version.replace(/^6\.0-dev-v?/,"V6-dev");document.title="NEXUM — Taller · "+version;}catch(_){/* La app conserva la versión de respaldo si está sin conexión. */}})();

/* V6.0 dev — estado visible sin prometer sincronización todavía.
 * Online/offline solo describe conectividad del dispositivo; no acredita un envío al servidor. */
(function initLocalOnlySyncStatus(){
 const btn=document.getElementById("syncStatusBtn");
 const panel=document.getElementById("syncStatusPanel");
 const label=document.getElementById("syncStatusLabel");
 const network=document.getElementById("syncNetworkLine");
 const title=document.getElementById("syncStatusDetailTitle");
 const close=document.getElementById("syncStatusClose");
 if(!btn||!panel||!label||!network||!title||!close)return;
 const refresh=()=>{
  const online=navigator.onLine!==false;
  label.textContent="Solo en este dispositivo";
  title.textContent="Solo en este dispositivo";
  network.textContent=online?"Conexión a Internet: disponible en el dispositivo. No hay una sesión de taller conectada.":"Conexión a Internet: sin conexión. Los datos locales siguen disponibles.";
  btn.title=online?"La conexión está disponible, pero la sincronización no está configurada.":"Sin conexión. La sincronización no está configurada.";
 };
 const setOpen=(open)=>{panel.classList.toggle("hidden",!open);btn.setAttribute("aria-expanded",String(open));};
 btn.addEventListener("click",()=>setOpen(panel.classList.contains("hidden")));
 close.addEventListener("click",()=>setOpen(false));
 window.addEventListener("online",refresh);
 window.addEventListener("offline",refresh);
 refresh();
})();


/* V6.0-dev-v10 — sincronización manual, siempre local-first. No importa el histórico al activar. */
/* V6.0-dev-v11 — contrato de administración global y consola UI; el endpoint debe desplegarse antes de habilitar acceso. */
(function initManualSync(){
 const URL="https://ywcrowviufbioeqixwrq.supabase.co";
const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Y3Jvd3ZpdWZiaW9lcWl4d3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjIwMzAsImV4cCI6MjEwNjgzODAzMH0.Mh9BHpigCVQ8Q624_M1o495A5JwTRL0M7q7yF5g5RQE";
 const SESSION_KEY="nexum_v6_auth_session", CFG_KEY="nexum_sync_config_v1", DEVICE_KEY="nexum_sync_device_v1", CURSOR_KEY="nexum_sync_cursor_v1", OUTBOX="nexum_sync_outbox_v1";
 const $=id=>document.getElementById(id), core=window.NexumSyncCore;
 let workshopAssignment=null,assignmentError="",assignmentLoading=false,assignmentUserId="",assignmentPromise=null;
 const session=()=>window.NexumAuthSession?.get()||(()=>{try{return JSON.parse(contextStorage.getItem(SESSION_KEY)||"null")}catch{return null}})();
 const cfg=()=>{try{return JSON.parse(contextStorage.getItem(CFG_KEY)||"null")}catch{return null}};
 const readOutbox=()=>{try{const x=JSON.parse(contextStorage.getItem(OUTBOX)||"[]");return Array.isArray(x)?x:[]}catch{return []}};
 const writeOutbox=x=>contextStorage.setItem(OUTBOX,JSON.stringify(x));
 const status=(title,detail)=>{let t=String(title||""),d=String(detail||"");const btn=$("syncStatusBtn");if(/^Sesión iniciada|^Sesión no iniciada/i.test(t)&&["success","conflict","error","running"].includes(btn?.dataset.syncState||""))return;const resolved=/conflicto resuelto|conflictos resueltos/i.test(t);const conflict=!resolved&&(/conflict|conflicto/i.test(t)||/(?:conflictos|para revisar):\s*[1-9]\d*/i.test(d));const bad=/error|no se pudo|falló|fallo|revisión necesaria/i.test(t);const running=/sincronizando|publicando versión local/i.test(t);const success=/completad|finalizad|resuelt|publicad|guardad|aplicad|todo correcto|sin conflictos/i.test(t);const state=conflict?"conflict":bad?"error":running?"running":success?"success":"neutral";if(btn)btn.dataset.syncState=state;btn?.setAttribute("title",state==="conflict"?"Conflicto de sincronización":state==="error"?"Error de sincronización":state==="success"?"Sincronización completada":state==="running"?"Sincronización en curso":"Estado y opciones de sincronización");const a=$("syncStatusLabel"),b=$("syncStatusDetailTitle"),c=$("syncStatusDetail");if(a)a.textContent=t.replace(/^[🟢🔴🟡⚠️❌✅]+\s*/u,"");if(b)b.textContent=t.replace(/^[🟢🔴🟡⚠️❌✅]+\s*/u,"");if(c)c.textContent=d;const line=$("syncNetworkLine");if(line)line.textContent=d;};
 function render(){
  const c=cfg(),s=session(),btn=$("syncNowBtn"),info=$("syncConfigInfo"),name=$("syncWorkshopName");
  const memberships=Array.isArray(workshopAssignment?.workshops)?workshopAssignment.workshops:[];
  const selected=memberships.find(w=>w.id===c?.workshopId);
  let label="Inicia sesión para consultar el taller asignado.";
  if(s){
   if(assignmentLoading)label="Consultando la asignación del taller…";
   else if(assignmentError)label="No se pudo comprobar la asignación del taller. Comprueba la conexión e inténtalo de nuevo.";
   else if(workshopAssignment?.ok!==true)label="No se pudo validar el acceso de esta cuenta.";
   else if(workshopAssignment.is_global_admin)label=c?.workshopId?(c.workshopName||selected?.name||"Taller seleccionado desde Administración global"):"Administrador global: elige un taller en Administración global y pulsa «Usar en este dispositivo».";
   else if(memberships.length===1)label=memberships[0].name;
   else if(memberships.length===0)label="Esta cuenta no tiene ningún taller activo asignado. Solicita al administrador que active su membresía.";
   else label=selected?.name||"Esta cuenta tiene varias membresías activas. Solicita al administrador que deje asignado el taller correcto.";
  }
  if(name)name.textContent=label;
  const legacy=legacyUnassignedSummary();
  if(info)info.textContent=(s?(c?.workshopId?"El taller se asigna desde tu cuenta; el identificador permanece interno.":"No hay un taller seleccionado para esta cuenta."):"Inicia sesión para consultar tu asignación.")+(legacy?" "+legacy:"");
  if(btn)btn.disabled=!s||!c?.workshopId||assignmentLoading||!!assignmentError;
  // V59: selector de taller para cuentas normales con más de una membresía activa.
  const switcher=$("memberWorkshopSwitcher"),switchSelect=$("memberWorkshopSelect"),switchBtn=$("memberWorkshopUseBtn");
  const canSwitch=!!s&&workshopAssignment?.ok===true&&workshopAssignment.is_global_admin!==true&&memberships.length>1;
  if(switcher)switcher.classList.toggle("hidden",!canSwitch);
  if(canSwitch&&switchSelect){
   const oldValue=switchSelect.value;
   switchSelect.replaceChildren(new Option("Seleccionar taller",""));
   for(const w of memberships)switchSelect.add(new Option(w.name,w.id));
   switchSelect.value=memberships.some(w=>w.id===c?.workshopId)?c.workshopId:(memberships.some(w=>w.id===oldValue)?oldValue:"");
   if(switchBtn)switchBtn.disabled=assignmentLoading||!!assignmentError||!switchSelect.value||switchSelect.value===c?.workshopId||!!window.NexumSyncBusy;
  }
  renderInbox();
 }
 const memberWorkshopSelect=$("memberWorkshopSelect");
 const memberWorkshopUseBtn=$("memberWorkshopUseBtn");
 if(memberWorkshopSelect)memberWorkshopSelect.addEventListener("change",()=>{
  const chosenId=memberWorkshopSelect.value,current=cfg();
  if(memberWorkshopUseBtn)memberWorkshopUseBtn.disabled=!chosenId||chosenId===current?.workshopId||assignmentLoading||!!assignmentError||!!window.NexumSyncBusy;
 });
 if(memberWorkshopUseBtn)memberWorkshopUseBtn.addEventListener("click",()=>{
  const s=session(),chosenId=$("memberWorkshopSelect")?.value;
  const memberships=Array.isArray(workshopAssignment?.workshops)?workshopAssignment.workshops:[];
  const chosen=memberships.find(w=>w.id===chosenId);
  if(!s?.user?.id||!chosen||workshopAssignment?.is_global_admin===true)return;
  if(window.NexumSyncBusy){status("Espera a que termine la sincronización antes de cambiar de taller.","No se modificó el taller seleccionado.");return;}
  if(chosen.id===cfg()?.workshopId){status("Este taller ya está seleccionado.","No se cambió el contexto del dispositivo.");return;}
  if(!confirm("¿Usar "+chosen.name+" en este dispositivo? Los datos locales y las operaciones pendientes de cada taller se mantienen separados."))return;
  const old=cfg()||{};
  contextStorage.setItem(CFG_KEY,JSON.stringify({workshopId:chosen.id,workshopName:chosen.name,deviceLabel:old.deviceLabel||defaultDeviceLabel(),userId:s.user.id}));
  window.dispatchEvent(new Event("nexum-sync-config-changed"));
  status("Taller cambiado en este dispositivo","Ahora está seleccionado "+chosen.name+". Los datos de los otros talleres permanecen separados.");
 });
 function readInbox(){try{const x=JSON.parse(contextStorage.getItem("nexum_sync_inbox_v1")||"[]");return Array.isArray(x)?x:[]}catch{return []}}
 function writeInbox(items){contextStorage.setItem("nexum_sync_inbox_v1",JSON.stringify(items.slice(-2000)))}
 function localSyncRecord(ch){
  const type=ch.entity_type,id=ch.entity_id;
  if(type==="settings"){try{return JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null")}catch{return null}}
  const rows=type==="ticket"?data:type==="movement"?movements:type==="equipment"?equipmentRecords:[];
  return rows.find(x=>x.syncId===id)||null;
 }
 function diffRows(local,remote){
  const a=local&&typeof local==="object"?local:{},b=remote&&typeof remote==="object"?remote:{};
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>!["syncId","remoteVersion","syncStatus","updatedAt","entityType","entity_id","entity_type"].includes(k)).sort();
  const rows=keys.filter(k=>JSON.stringify(a[k]??null)!==JSON.stringify(b[k]??null));
  if(!rows.length)return '<p class="field-help">No se detectan diferencias de campos visibles.</p>';
  return '<div class="sync-diff"><div class="sync-diff-head"><b>Campo</b><b>Este dispositivo</b><b>Nube</b></div>'+rows.map(k=>'<div class="sync-diff-row"><b>'+esc(pretty(k))+'</b><span>'+esc(a[k]===undefined?'—':typeof a[k]==="object"?JSON.stringify(a[k]):String(a[k]))+'</span><span>'+esc(b[k]===undefined?'—':typeof b[k]==="object"?JSON.stringify(b[k]):String(b[k]))+'</span></div>').join("")+'</div>';
 }
 function renderInbox(){
  const host=$("syncInboxReview");if(!host)return;
  // V56: un conflicto ya resuelto puede dejar su aviso antiguo en la bandeja.
  // Solo se archiva automáticamente si no hay operaciones pendientes y la versión local
  // confirma que ya se alcanzó o superó la versión del aviso. Los casos inciertos se conservan.
  const storedInbox=readInbox(),queued=readOutbox();
  const cleanedInbox=storedInbox.filter(ch=>{
   if(ch.needsReview!==true)return true;
   const remote=ch.record?.payload||{};
   const hasPending=queued.some(op=>(
    op.entityType===ch.entity_type&&op.entityId===ch.entity_id||
    ch.entity_type==="settings"&&remote.settingKey==="exchange_rate"&&op.entityType==="settings"&&op.legacyId==="exchange_rate"
   )&&["pending","sending","conflict"].includes(op.status));
   if(hasPending)return true;
   const local=localSyncRecord(ch),incomingVersion=Number(ch.version??ch.record?.version??0),localVersion=Number(local?.remoteVersion||0);
   return !(local&&incomingVersion>0&&localVersion>=incomingVersion);
  });
  if(cleanedInbox.length!==storedInbox.length)writeInbox(cleanedInbox);
  const inbox=cleanedInbox.slice().reverse().slice(0,50),conflicts=readOutbox().filter(x=>x.status==="conflict");
  if(!inbox.length&&!conflicts.length){host.innerHTML='<p class="field-help">No hay cambios remotos pendientes de revisión.</p>';return;}
  const conflictHtml=conflicts.map(op=>{
   const remote=op.remoteConflict||{},local=op.payload||{},remotePayload=remote.payload||{};
   return '<article class="sync-inbox-item sync-inbox-conflict"><h4>Conflicto · '+esc(op.entityType)+' · '+esc(op.legacyId||op.entityId)+'</h4><p>Versión local: '+esc(op.baseVersion??"desconocida")+' · Versión remota: '+esc(remote.version??"desconocida")+'</p>'+diffRows(local,remotePayload)+'<div class="actions"><button type="button" class="secondary" data-sync-conflict="remote" data-operation="'+escAttr(op.operationId)+'">Conservar versión remota</button><button type="button" class="primary" data-sync-conflict="local" data-operation="'+escAttr(op.operationId)+'">Conservar versión local</button></div></article>';
  }).join("");
  const inboxHtml=inbox.map(ch=>{
   const conflict=!!ch.needsReview,label=ch.action==="delete"||ch.record?.deleted_at?"Borrado remoto":"Cambio remoto";
   const remote=ch.record?.payload||{},local=localSyncRecord(ch);
   const summary=remote.ticketId||remote.id||remote.equipoId||remote.settingKey||ch.record?.legacy_id||ch.entity_id;
   const pending=readOutbox().some(op=>(op.entityType===ch.entity_type&&op.entityId===ch.entity_id||(ch.entity_type==="settings"&&remote.settingKey==="exchange_rate"&&op.entityType==="settings"&&op.legacyId==="exchange_rate"))&&["pending","sending","conflict"].includes(op.status));
   const isRate=ch.entity_type==="settings"&&remote.settingKey==="exchange_rate";
   const rateDiff=isRate?'<div class="sync-rate-compare"><div><small>Este dispositivo</small><strong>'+esc(local?.rate??currentRate()??"No definida")+' CUP/USD</strong></div><div><small>Nube (versión '+esc(ch.version??ch.record?.version??"?")+')</small><strong>'+esc(remote.rate??"No definida")+' CUP/USD</strong></div></div>':diffRows(local,remote);
   const decision=conflict?'<div class="actions"><button type="button" class="secondary" data-sync-inbox-remote="'+escAttr(ch.cursor)+'">Usar versión remota</button><button type="button" class="primary" data-sync-inbox-local="'+escAttr(ch.cursor)+'">Conservar versión local</button></div>':'<div class="actions"><button type="button" class="primary" data-sync-inbox-apply="'+escAttr(ch.cursor)+'">Aplicar cambio remoto</button><button type="button" class="secondary" data-sync-inbox-dismiss="'+escAttr(ch.cursor)+'">Archivar aviso</button></div>';
   return '<article class="sync-inbox-item '+(conflict?"sync-inbox-conflict":"")+'"><h4>'+label+' · '+esc(ch.entity_type)+' · '+esc(summary)+'</h4><p>Versión '+esc(ch.version??ch.record?.version??"?")+' · Cursor '+esc(ch.cursor??"?")+(pending?" · Tiene cambios locales pendientes":"")+'</p>'+(conflict?'<p class="field-help">Compara ambas versiones antes de decidir. No se modifica nada hasta que elijas.</p>':"")+rateDiff+decision+'</article>';
  }).join("");
  host.innerHTML=conflictHtml+inboxHtml;
 }
 function applyRemoteSnapshot(type,id,action,payload,version){
  if(!["ticket","equipment","movement","settings"].includes(type))throw Error("Esta entidad todavía no tiene un aplicador local seguro: "+type);
  if(type==="settings"){if(action==="delete")return;if(payload?.settingKey!=="exchange_rate"||!(Number(payload.rate)>0))throw Error("La configuración remota de tasa no es válida.");const rec={...payload,syncId:id,remoteVersion:Number(version||1),syncStatus:"synced"};contextStorage.setItem(SHARED_SETTINGS_KEY,JSON.stringify(rec));rememberRate(Number(rec.rate));economyConfig={...economyConfig,rate:Number(rec.rate),date:rec.updatedAt?.slice(0,10)||today()};saveEconomyConfig();if($("settingRate"))$("settingRate").value=String(rec.rate);return;}
  if(action==="delete"){
   if(type==="ticket")data=data.filter(x=>x.syncId!==id);
   else if(type==="movement")movements=movements.filter(x=>x.syncId!==id);
   else {if(data.some(x=>x.equipoSyncId===id))throw Error("No se puede borrar el equipo porque hay tickets locales que lo referencian.");equipmentRecords=equipmentRecords.filter(x=>x.syncId!==id);}
  }else{
   if(!payload||typeof payload!=="object"||Array.isArray(payload))throw Error("El cambio remoto no contiene un registro válido.");
   const record={...payload,syncId:id,remoteVersion:Number(version||1),syncStatus:"synced"};
   if(type==="ticket"){const normalized=withSyncMeta(normalize(record),"ticket");normalized.remoteVersion=Number(version||1);normalized.syncStatus="synced";const i=data.findIndex(x=>x.syncId===id);if(i>=0)data[i]=normalized;else data.push(normalized);}
   else if(type==="equipment"){const normalized=withSyncMeta(record,"equipment");normalized.remoteVersion=Number(version||1);normalized.syncStatus="synced";const i=equipmentRecords.findIndex(x=>x.syncId===id);if(i>=0)equipmentRecords[i]=normalized;else equipmentRecords.push(normalized);}
   else {const normalized=withSyncMeta(normalizeMovement(record),"movement");normalized.remoteVersion=Number(version||1);normalized.syncStatus="synced";const i=movements.findIndex(x=>x.syncId===id);if(i>=0)movements[i]=normalized;else movements.push(normalized);}
  }
  suppressSyncDiff=true;try{save()}finally{suppressSyncDiff=false;}
 }
 const inboxHost=$("syncInboxReview");if(inboxHost)inboxHost.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;
  const cursor=b.dataset.syncInboxApply??b.dataset.syncInboxDismiss??b.dataset.syncInboxRemote??b.dataset.syncInboxLocal;
  if(cursor!==undefined){
   const inbox=readInbox(),idx=inbox.findIndex(ch=>String(ch.cursor)===String(cursor));if(idx<0)return;const ch=inbox[idx];
   const remotePayload=ch.record?.payload||{};const isSharedRate=ch.entity_type==="settings"&&remotePayload.settingKey==="exchange_rate";const sameEntity=op=>op.entityType===ch.entity_type&&op.entityId===ch.entity_id;const pendingOps=readOutbox().filter(op=>(sameEntity(op)||(isSharedRate&&op.entityType==="settings"&&op.legacyId==="exchange_rate"))&&["pending","sending","conflict"].includes(op.status));
   if(b.dataset.syncInboxRemote!==undefined){
    if(!confirm("Se descartarán únicamente las operaciones locales pendientes de esta entidad y se aplicará la versión remota. Los demás registros no cambiarán. ¿Continuar?"))return;
    try{const action=ch.action==="delete"||ch.record?.deleted_at?"delete":"upsert";applyRemoteSnapshot(ch.entity_type,ch.entity_id,action,ch.record?.payload,ch.version??ch.record?.version);let q=readOutbox().filter(op=>!(op.entityType===ch.entity_type&&op.entityId===ch.entity_id||(isSharedRate&&op.entityType==="settings"&&op.legacyId==="exchange_rate")));writeOutbox(q);writeInbox(inbox.filter(x=>String(x.cursor)!==String(cursor)));renderInbox();renderAll();status("Conflicto resuelto","Se conservó la versión remota comparada.");}catch(err){alert(err.message||"No se pudo aplicar la versión remota.");}return;
   }
   if(b.dataset.syncInboxLocal!==undefined){
    const remoteVersion=Number(ch.version??ch.record?.version??0);
    if(!confirm("Se conservará la versión local. Las operaciones pendientes de esta entidad se reintentarán usando como base la versión remota "+remoteVersion+". ¿Continuar?"))return;
    const oldQueue=readOutbox();
    const matches=op=>(op.entityType===ch.entity_type&&op.entityId===ch.entity_id)||(isSharedRate&&op.entityType==="settings"&&(op.legacyId==="exchange_rate"||op.payload?.settingKey==="exchange_rate"));
    let localRecord=null,baseOp=oldQueue.find(op=>matches(op)&&["pending","sending","conflict"].includes(op.status));
    if(isSharedRate){try{localRecord=JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null")}catch{}}
    else localRecord=localSyncRecord(ch)||baseOp?.payload||null;
    if(!localRecord||!localRecord.syncId){alert("No se encontró la versión local completa para publicar. No se ha eliminado ningún dato.");return;}
    const canonicalId=String(ch.entity_id);
    localRecord={...localRecord,syncId:canonicalId,remoteVersion:remoteVersion,syncStatus:"pending"};
    if(isSharedRate){localRecord.settingKey="exchange_rate";contextStorage.setItem(SHARED_SETTINGS_KEY,JSON.stringify(localRecord));}
    const legacyId=isSharedRate?"exchange_rate":(baseOp?.legacyId||ch.record?.legacy_id||localRecord.ticketId||localRecord.id||null);
    const newOperation=core.makeOperation({entityType:ch.entity_type,record:localRecord,action:"upsert",baseVersion:remoteVersion,payload:localRecord,legacyId});
    let q=oldQueue.filter(op=>!(matches(op)&&["pending","sending","conflict"].includes(op.status)));
    q.push(newOperation);writeOutbox(q);
    writeInbox(inbox.filter(x=>String(x.cursor)!==String(cursor)));renderInbox();status("Publicando versión local","La versión elegida se enviará como la siguiente versión remota.");
    try{await run();}catch(err){console.warn("No se pudo publicar la versión local elegida",err);alert("La versión local quedó guardada para reintento: "+(err.message||"error de sincronización"));}
    return;
   }
   if(b.dataset.syncInboxApply!==undefined){
    if(ch.needsReview||pendingOps.length){alert("Este registro tiene cambios locales pendientes. Compara las versiones y resuelve el conflicto primero.");return;}
    const action=ch.action==="delete"||ch.record?.deleted_at?"delete":"upsert";
    if(!confirm((action==="delete"?"Aplicar el borrado remoto":"Aplicar el cambio remoto")+" reemplazará el registro local correspondiente, si existe. ¿Continuar?"))return;
    try{applyRemoteSnapshot(ch.entity_type,ch.entity_id,action,ch.record?.payload,ch.version??ch.record?.version);writeInbox(inbox.filter(x=>String(x.cursor)!==String(cursor)));renderInbox();renderAll();status("Cambios recibidos revisados","El cambio remoto se aplicó localmente.");}catch(err){alert(err.message||"No se pudo aplicar el cambio remoto.");}return;
   }
   if(b.dataset.syncInboxDismiss!==undefined){if(!confirm("Archivar el aviso no aplica el cambio remoto. ¿Continuar?"))return;writeInbox(inbox.filter(x=>String(x.cursor)!==String(cursor)));renderInbox();return;}
  }
  const mode=b.dataset.syncConflict,operationId=b.dataset.operation;if(!mode||!operationId)return;
  let q=readOutbox(),op=q.find(x=>x.operationId===operationId&&x.status==="conflict");if(!op)return;const remote=op.remoteConflict||{};
  if(mode==="remote"){if(!confirm("Se descartarán las operaciones locales pendientes de esta entidad y se aplicará la versión remota. ¿Continuar?"))return;try{applyRemoteSnapshot(op.entityType,op.entityId,remote.deleted_at?"delete":"upsert",remote.payload,remote.version);q=q.filter(x=>!(x.entityType===op.entityType&&x.entityId===op.entityId));writeOutbox(q);status("Conflicto resuelto","Se conservó la versión remota.");renderInbox();renderAll();}catch(err){alert(err.message||"No se pudo aplicar la versión remota.");}}
  else{
   if(!confirm("Se conservará la versión local y se intentará publicar ahora, usando la versión remota como base. ¿Continuar?"))return;
   const remoteVersion=Number(remote.version||0);
   try{
    if(op.conflictType==="legacy_id"){
     const resolved=resolveLegacyIdCollision(op,q,{current_record:remote});
     if(!resolved?.retry)throw Error("No se pudo resolver automáticamente la colisión del identificador. Los datos locales se conservaron; revisa el detalle del conflicto.");
     q=resolved.q;
    }else{
     const isRate=op.entityType==="settings"&&(op.legacyId==="exchange_rate"||op.payload?.settingKey==="exchange_rate");
     let payload={...(op.payload||{})};
     const entityId=String(remote.entity_id||op.entityId);
     if(isRate){
      let shared=null;try{shared=JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null")}catch{}
      payload={...(shared||payload),syncId:entityId,settingKey:"exchange_rate",rate:Number((shared||payload).rate??currentRate()),remoteVersion:remoteVersion,syncStatus:"pending",entityType:"settings"};
      contextStorage.setItem(SHARED_SETTINGS_KEY,JSON.stringify(payload));
     }else payload={...payload,syncId:entityId,remoteVersion:remoteVersion,syncStatus:"pending"};
     const legacyId=isRate?"exchange_rate":(op.legacyId||payload.ticketId||payload.id||payload.equipoId||null);
     const fresh=core.makeOperation({entityType:op.entityType,record:payload,action:op.action||"upsert",baseVersion:remoteVersion,payload:op.action==="delete"?null:payload,legacyId});
     q=q.filter(x=>!(x.entityType===op.entityType&&(x.entityId===op.entityId||x.entityId===entityId)&&["pending","sending","conflict"].includes(x.status)));
     q.push(fresh);writeOutbox(q);
    }
    renderInbox();status("🟢 Publicando versión local","La decisión se está enviando ahora; no hace falta un reintento manual.");
    await run();
   }catch(err){
    console.warn("No se pudo publicar la versión local elegida",err);
    status("🔴 No se pudo resolver el conflicto",err.message||"Los datos locales se conservaron.");
    alert("🔴 No se pudo publicar la versión local: "+(err.message||"error de sincronización")+"\n\nLos datos locales se conservaron.");
    renderInbox();
   }
  }
 });
 async function api(path,body,s){const res=await fetch(URL+path,{method:"POST",headers:{"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer "+s.access_token},body:JSON.stringify(body)});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||data.error||data.details||("Servidor respondió "+res.status));return data;}
 function defaultDeviceLabel(){return navigator.userAgent.includes("Mobi")?"Teléfono NEXUM":"Dispositivo NEXUM";}
 async function refreshWorkshopAssignment(force=false){
  const s=session();
  if(!s?.user?.id){workshopAssignment=null;assignmentError="";assignmentLoading=false;assignmentUserId="";render();return;}
  const uid=s.user.id;
  if(!force&&assignmentUserId===uid&&workshopAssignment&&!assignmentError){render();return;}
  if(assignmentPromise)return assignmentPromise;
  assignmentLoading=true;assignmentError="";render();
  assignmentPromise=(async()=>{
   try{
    const result=await api("/rest/v1/rpc/nexum_get_my_workshops",{},s);
    if(session()?.user?.id!==uid)return;
    if(!result||typeof result!=="object")throw Error("Respuesta de asignación no válida.");
    workshopAssignment=result;
    if(result.ok===true){
     const current=cfg()||{};
     if(result.is_global_admin===true){
      const match=(result.workshops||[]).find(w=>w.id===current.workshopId);
      if(match&&current.workshopName!==match.name){
       contextStorage.setItem(CFG_KEY,JSON.stringify({...current,workshopName:match.name,userId:uid}));
      }else if(current.workshopId&&!current.userId){
       contextStorage.setItem(CFG_KEY,JSON.stringify({...current,userId:uid}));
      }
     }else{
      const rows=Array.isArray(result.workshops)?result.workshops:[];
      const selected=rows.length===1?rows[0]:(rows.length>1?rows.find(w=>w.id===current.workshopId):null);
      const next=selected?{workshopId:selected.id,workshopName:selected.name,deviceLabel:current.deviceLabel||defaultDeviceLabel(),userId:uid}:{workshopId:"",workshopName:"",deviceLabel:current.deviceLabel||defaultDeviceLabel(),userId:uid};
      if(current.workshopId!==next.workshopId||current.workshopName!==next.workshopName||current.userId!==uid){
       if(window.NexumSyncBusy)throw Error("Espera a que termine la sincronización para actualizar el taller asignado.");
       contextStorage.setItem(CFG_KEY,JSON.stringify(next));
       window.dispatchEvent(new Event("nexum-sync-config-changed"));
      }
     }
    }else{
     assignmentError=result.reason||"account_not_authorized";
    }
    assignmentUserId=uid;
   }catch(e){
    if(session()?.user?.id===uid){assignmentError=e.message||"No se pudo comprobar el taller.";assignmentUserId=uid;}
   }finally{
    assignmentLoading=false;assignmentPromise=null;render();
    if(session()?.user?.id&&session().user.id!==uid)refreshWorkshopAssignment(true);
   }
  })();
  return assignmentPromise;
 }
 async function ensureDevice(s,c){let d;try{d=JSON.parse(contextStorage.getItem(DEVICE_KEY)||"null")}catch{}if(!d||d.workshopId!==c.workshopId||d.userId!==s.user.id){d={id:core.uuid(),workshopId:c.workshopId,userId:s.user.id};contextStorage.setItem(DEVICE_KEY,JSON.stringify(d));}
  // Device registration is deliberately an explicit RPC; no direct table writes from the browser.
  await api("/rest/v1/rpc/nexum_register_sync_device",{p_workshop_id:c.workshopId,p_device_id:d.id,p_device_label:c.deviceLabel||navigator.userAgent.slice(0,120)},s);return d;}

 function persistCollisionRemap(type,entityId,newId,newPayload){
  if(type==="ticket"){
   const rec=data.find(x=>x.syncId===entityId);if(!rec)return false;
   rec.ticketId=newId;rec.syncStatus="pending";
   for(const x of data){if(x!==rec&&x.ticketGarantiaOrigen===newId){}}
  }else if(type==="movement"){
   const rec=movements.find(x=>x.syncId===entityId);if(!rec)return false;
   rec.id=newId;rec.syncStatus="pending";
  }else return false;
  suppressSyncDiff=true;try{save()}finally{suppressSyncDiff=false;}
  return true;
 }
 function resolveLegacyIdCollision(op,q,result){
  const remote=result?.current_record;
  if(!remote?.entity_id)return null;
  const remotePayload=remote.payload||{};
  // The shared exchange-rate setting is one logical record. Rebind the stale local identity
  // to the canonical cloud identity, then retry the user's rate change against its current version.
  if(op.entityType==="settings"&&op.payload?.settingKey==="exchange_rate"&&remotePayload.settingKey==="exchange_rate"){
   const canonicalId=remote.entity_id,version=Number(remote.version||1);
   const local={...op.payload,syncId:canonicalId,remoteVersion:version,syncStatus:"pending",entityType:"settings"};
   contextStorage.setItem(SHARED_SETTINGS_KEY,JSON.stringify(local));
   q=q.map(x=>{
    if(x.entityType!=="settings"&&(x.legacyId!=="exchange_rate"))return x;
    if(x.entityType!=="settings"&&x.legacyId==="exchange_rate")return x;
    if(x.entityType==="settings"&&(x.entityId===op.entityId||x.legacyId==="exchange_rate")){
     return {...x,entityId:canonicalId,baseVersion:version,status:"pending",remoteConflict:null,
       operationId:x.operationId===op.operationId?core.uuid():x.operationId};
    }
    return x;
   });
   writeOutbox(q);
   return {q,retry:true};
  }
  // For a genuinely different ticket or ECN movement, keep both records and give the incoming
  // record a unique visible ID. Never merge their business data just because the old ID matches.
  if((op.entityType==="ticket"||op.entityType==="movement")&&(op.collisionResolutions||0)<3){
   const oldId=String(op.legacyId||op.payload?.ticketId||op.payload?.id||"REGISTRO");
   const newId=oldId.slice(0,175)+"-R"+crypto.randomUUID().slice(0,6).toUpperCase();
   const payload={...(op.payload||{})};
   if(op.entityType==="ticket")payload.ticketId=newId;else payload.id=newId;
   if(!persistCollisionRemap(op.entityType,op.entityId,newId,payload))return null;
   q=q.map(x=>{
    if(x.entityType!==op.entityType||x.entityId!==op.entityId)return x;
    const nextPayload=x.action==="upsert"&&x.payload&&typeof x.payload==="object"
      ? {...x.payload,[op.entityType==="ticket"?"ticketId":"id"]:newId}:x.payload;
    if(x.operationId===op.operationId){
     return {...core.makeOperation({entityType:x.entityType,record:{...payload,syncId:x.entityId},action:x.action,
       baseVersion:Number(x.baseVersion||0),payload:x.action==="delete"?null:nextPayload,legacyId:newId}),
       collisionResolutions:(x.collisionResolutions||0)+1};
    }
    return {...x,legacyId:newId,payload:nextPayload,status:x.status==="conflict"?"conflict":"pending",remoteConflict:null};
   });
   writeOutbox(q);
   return {q,retry:true,newId};
  }
  return null;
 }
 async function push(s,c,d){
  let q=readOutbox(),sent=0,conflicts=0,attempts=0;const blockedEntities=new Set();
  while(attempts++<500){
   const next=q.find(x=>x.status==="pending"&&!blockedEntities.has(x.entityType+":"+x.entityId));if(!next)break;
   const op={...next};q=core.markSending(q,op.operationId);writeOutbox(q);
   try{
    const result=await api("/rest/v1/rpc/nexum_apply_sync_operation",{p_operation_id:op.operationId,p_workshop_id:c.workshopId,p_device_id:d.id,p_entity_type:op.entityType,p_entity_id:op.entityId,p_action:op.action,p_base_version:op.baseVersion,p_payload:op.payload||{},p_legacy_id:op.legacyId||null},s);
    if(result.outcome==="legacy_id_collision"){
     const resolved=resolveLegacyIdCollision(op,q,result);
     if(resolved?.retry){q=resolved.q;continue;}
     conflicts++;blockedEntities.add(op.entityType+":"+op.entityId);
     q=q.map(x=>x.operationId===op.operationId?{...x,status:"conflict",remoteConflict:result.current_record||null,conflictType:"legacy_id"}:x);
     writeOutbox(q);continue;
    }
    if(result.outcome==="conflict"){
     conflicts++;blockedEntities.add(op.entityType+":"+op.entityId);
     q=q.map(x=>x.operationId===op.operationId?{...x,status:"conflict",remoteConflict:result.current_record||null}:x);
     writeOutbox(q);continue;
    }
    // V29: una respuesta inesperada es un conflicto recuperable de esta operación,
    // no una razón para abortar el resto de la sincronización.
    if(result?.outcome!=="applied"){
     conflicts++;blockedEntities.add(op.entityType+":"+op.entityId);
     const detail=result?.message||result?.error||result?.code||result?.outcome||"respuesta vacía o desconocida";
     q=q.map(x=>x.operationId===op.operationId?{...x,status:"conflict",conflictType:"unexpected_response",conflictDetail:String(detail),remoteConflict:result?.current_record||x.remoteConflict||null}:x);
     writeOutbox(q);
     console.warn("Respuesta de sincronización pendiente de revisión",op.entityType,op.legacyId||op.entityId,result);
     continue;
    }
    q=core.acknowledge(q,op.operationId);
    if(Number.isInteger(Number(result.version))){
     q=q.map(x=>x.entityType===op.entityType&&x.entityId===op.entityId&&x.status==="pending"?{...x,baseVersion:Number(result.version)}:x);
    }
    writeOutbox(q);markLocalSync(op.entityType,op.entityId,result.version);sent++;
   }catch(e){q=core.markRetryable(q,op.operationId,e.message);writeOutbox(q);throw e;}
  }
  return{sent,conflicts,queueRemaining:q.filter(x=>x.status==="pending").length};
 }
 function markLocalSync(type,id,version){const key=type==="ticket"?"taller_electronica_v5":type==="equipment"?"nexum_equipment_v1":type==="movement"?"taller_electronica_v5_movements":type==="settings"?SHARED_SETTINGS_KEY:null;if(type==="settings"){try{const r=JSON.parse(contextStorage.getItem(SHARED_SETTINGS_KEY)||"null");if(r?.syncId===id){r.remoteVersion=Number(version||r.remoteVersion||0);r.syncStatus="synced";contextStorage.setItem(SHARED_SETTINGS_KEY,JSON.stringify(r));}}catch(e){console.warn("No se pudo actualizar la versión de la tasa sincronizada",e)}return;}if(!key)return;try{const rows=JSON.parse(contextStorage.getItem(key)||"[]");let changed=false;for(const r of rows){if(r.syncId===id){r.remoteVersion=Number(version||r.remoteVersion||0);r.syncStatus="synced";changed=true;}}if(changed)contextStorage.setItem(key,JSON.stringify(rows));const memory=type==="ticket"?data:type==="equipment"?equipmentRecords:type==="movement"?movements:[];for(const r of memory){if(r.syncId===id){r.remoteVersion=Number(version||r.remoteVersion||0);r.syncStatus="synced";}}}catch(e){console.warn("No se pudo actualizar la versión local confirmada",e)}}
 async function pull(s,c){let cursor=Number(contextStorage.getItem(CURSOR_KEY)||0),received=0,applied=0,review=0;let inbox=[];try{inbox=JSON.parse(contextStorage.getItem("nexum_sync_inbox_v1")||"[]")}catch{}
  // Primero procesa cambios seguros guardados en sincronizaciones anteriores, aunque el cursor remoto ya haya avanzado.
  const pendingNow=()=>new Set(readOutbox().filter(o=>["pending","sending","conflict"].includes(o.status)).map(o=>o.entityType+":"+o.entityId));
  for(const ch of inbox.slice().sort((a,b)=>Number(a.cursor||0)-Number(b.cursor||0))){if(ch.needsReview===true)continue;const k=ch.entity_type+":"+ch.entity_id;if(pendingNow().has(k)){ch.needsReview=true;review++;continue;}const action=ch.action==="delete"||ch.record?.deleted_at?"delete":"upsert";try{applyRemoteSnapshot(ch.entity_type,ch.entity_id,action,ch.record?.payload,ch.version??ch.record?.version);inbox=inbox.filter(x=>String(x.cursor)!==String(ch.cursor));applied++;}catch(err){ch.needsReview=true;ch.applyError=String(err?.message||err);review++;console.warn("Cambio previamente recibido conservado para revisión",ch.entity_type,ch.entity_id,err);}}
  for(let page=0;page<20;page++){const r=await api("/rest/v1/rpc/nexum_pull_sync_changes",{p_workshop_id:c.workshopId,p_after_cursor:cursor,p_limit:100},s);const changes=Array.isArray(r.changes)?r.changes:[];if(!changes.length)break;
  // Aplicar cambios remotos automáticamente solo si la entidad no tiene operaciones locales pendientes. Si no puede aplicarse con seguridad, conservar en la bandeja.
  for(const ch of changes){received++;const pending=pendingNow();const k=ch.entity_type+":"+ch.entity_id;if(pending.has(k)){inbox.push({...ch,needsReview:true});review++;continue;}const action=ch.action==="delete"||ch.record?.deleted_at?"delete":"upsert";try{applyRemoteSnapshot(ch.entity_type,ch.entity_id,action,ch.record?.payload,ch.version??ch.record?.version);inbox=inbox.filter(x=>String(x.cursor)!==String(ch.cursor));applied++;}catch(err){inbox.push({...ch,needsReview:true,applyError:String(err?.message||err)});review++;console.warn("Cambio remoto conservado para revisión",ch.entity_type,ch.entity_id,err);}}
  cursor=Number(r.next_cursor||cursor);contextStorage.setItem(CURSOR_KEY,String(cursor));if(!r.has_more)break;
 }
 contextStorage.setItem("nexum_sync_inbox_v1",JSON.stringify(inbox.slice(-2000)));renderInbox();return {received,applied,review};}
 async function run(){
  if(window.NexumSyncBusy)throw Error("Ya hay una sincronización en curso.");
  if(navigator.onLine===false)throw Error("No hay conexión. El taller sigue disponible localmente y las operaciones pendientes se conservaron.");
  await window.NexumAuthSession?.refresh?.();
  const s=session(),c=cfg();
  if(!s)throw Error("Inicia sesión primero.");
  if(!c?.workshopId||!/^[0-9a-f-]{36}$/i.test(c.workshopId))throw Error("Esta cuenta todavía no tiene un taller asignado o no se ha podido comprobar su membresía.");
  if(navigator.onLine===false)throw Error("No hay conexión. Las operaciones pendientes se conservaron.");
  window.NexumSyncBusy=true;
  const btn=$("syncNowBtn"),restoreSyncButton=setButtonBusy(btn,"Sincronizando…");
  status("Sincronizando…","Enviando cambios, recibiendo novedades y aplicando automáticamente los cambios seguros.");
  try{
   const d=await ensureDevice(s,c);
   let sent=0,conflicts=0,received=0,applied=0,review=0,quietCycles=0,cycles=0;
   // V20: coordina varios ciclos en una sola pulsación para absorber cambios que se hagan visibles tras el primer envío.
   // Dos ciclos tranquilos consecutivos confirman estabilidad; conflictos/revisiones nunca se fuerzan ni se sobrescriben.
   for(let cycle=0;cycle<4;cycle++){
    cycles++;
    const pushed=await push(s,c,d);
    sent+=pushed.sent;conflicts+=pushed.conflicts;
    const pulled=await pull(s,c);
    received+=pulled.received;applied+=pulled.applied;review+=pulled.review;
    if(conflicts>0||review>0)break;
    const quiet=pushed.sent===0&&pulled.received===0&&pulled.applied===0&&readOutbox().filter(x=>x.status==="pending").length===0;
    quietCycles=quiet?quietCycles+1:0;
    if(quietCycles>=2)break;
   }
   const remaining=readOutbox().filter(x=>x.status==="pending").length;
   const finalTitle=conflicts||review?"Revisión necesaria":remaining?"Cambios pendientes":"Sincronización completada";
   const summary=`Enviadas: ${sent}; conflictos: ${conflicts}; pendientes: ${remaining}; cambios recibidos: ${received}; aplicados: ${applied}; para revisar: ${review}.`;
   status(finalTitle,summary);
   alert(`${conflicts||review?"❌ ERROR / REVISIÓN":"✅ TODO CORRECTO"}\nSincronización terminada.\n${summary}\nCiclos completados: ${cycles}${conflicts||review?"\n❌ Hay cambios que requieren revisión; no se sobrescribieron automáticamente.":""}`);
  }catch(e){
   status("Sincronización pendiente",e.message+" Los datos locales se conservaron.");
   alert("❌ ERROR: No se completó la sincronización: "+e.message+"\n\n✅ Los datos locales siguen guardados y las operaciones se pueden reintentar.");
  }finally{window.NexumSyncBusy=false;restoreSyncButton();render();window.dispatchEvent(new Event("nexum-sync-idle"));}
 }
 const syncBtn=$("syncNowBtn");if(syncBtn)syncBtn.onclick=run;
 window.addEventListener("storage",e=>{if([SESSION_KEY,CFG_KEY,OUTBOX].includes(e.key)){render();if(e.key===SESSION_KEY)refreshWorkshopAssignment(true);}});window.addEventListener("nexum-sync-config-changed",render);window.addEventListener("nexum-sync-auth-changed",()=>refreshWorkshopAssignment(true));window.addEventListener("focus",()=>refreshWorkshopAssignment(true));window.addEventListener("nexum-sync-idle",()=>{if(assignmentError)refreshWorkshopAssignment(true);});render();refreshWorkshopAssignment(true);
})();

/* V6.0-dev-v41 — ojo clásico dentro del campo, con SVG abierto/cerrado y sin botón lateral. */
(function initPasswordVisibility(){
 const eyeOpen='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
 const eyeClosed='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.8M6.2 6.2C3.5 8.1 2 12 2 12s3.6 7 10 7c1.5 0 2.8-.4 4-.9"/></svg>';
 document.addEventListener("focusin",e=>{
  const input=e.target;
  if(!(input instanceof HTMLInputElement)||input.type!=="password"||input.dataset.visibilityReady)return;
  input.dataset.visibilityReady="1";
  const wrap=document.createElement("span");wrap.className="password-field-wrap";
  input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
  const btn=document.createElement("button");btn.type="button";btn.className="password-visibility-toggle";
  btn.setAttribute("aria-label","Mostrar contraseña");btn.setAttribute("aria-pressed","false");btn.innerHTML=eyeClosed;
  btn.addEventListener("click",()=>{const show=input.type==="password";input.type=show?"text":"password";btn.setAttribute("aria-label",show?"Ocultar contraseña":"Mostrar contraseña");btn.setAttribute("aria-pressed",String(show));btn.innerHTML=show?eyeOpen:eyeClosed;input.focus();});
  wrap.appendChild(btn);
 });
})();

/* V6.0-dev-v27 — acceso protegido, persistencia opcional y recuperación por usuario/correo. */
(function initCloudAccountLogin(){
 const URL="https://ywcrowviufbioeqixwrq.supabase.co",PUBLIC_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ5d2Nyb3Z2aXdmaW9lcWl4d3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjIwMzAsImV4cCI6MjEwNjgzODAzMH0.Mh9BHpigCVQ8Q624_M1o495A5JwTRL0M7q7yF5g5RQE";
 const K="nexum_v6_auth_session",$=id=>document.getElementById(id),form=$("cloudLoginForm"),id=$("cloudIdentifier"),pw=$("cloudPassword"),login=$("cloudLoginBtn"),logout=$("cloudLogoutBtn"),state=$("cloudAccountState"),msg=$("cloudLoginMessage"),remember=$("cloudRememberLogin"),gate=$("loginGate"),gateContent=$("loginGateContent"),account=$("cloudAccountCard"),recovery=$("cloudRecoveryPanel"),recoverForm=$("cloudRecoveryForm"),recoverId=$("cloudRecoveryIdentifier"),recoverMsg=$("cloudRecoveryMessage"),recoverBtn=$("cloudRecoveryBtn"),recoverBack=$("cloudRecoveryBack"),reset=$("cloudPasswordResetPanel"),resetBtn=$("cloudPasswordResetBtn"),switchBtn=$("accountSwitchBtn"),logoutTop=$("accountLogoutBtn");
 if(!form||!gate||!account)return;
 const valid=s=>!!(s?.access_token&&s?.refresh_token&&s?.user),readFrom=store=>{try{const s=JSON.parse(store.getItem(K)||"null");return valid(s)?s:null}catch{return null}},get=()=>readFrom(sessionStorage)||readFrom(localStorage);
 const emit=()=>{window.dispatchEvent(new Event("nexum-auth-session-changed"));window.dispatchEvent(new Event("nexum-sync-auth-changed"));},save=(s,keep=!!remember?.checked)=>{contextStorage.removeItem(K);sessionStorage.removeItem(K);(keep?localStorage:sessionStorage).setItem(K,JSON.stringify(s));emit();},clear=()=>{contextStorage.removeItem(K);sessionStorage.removeItem(K);emit();};
 window.NexumAuthSession={get,save,clear};emit();if(contextStorage.getItem(K)&&remember)remember.checked=true;gateContent.appendChild(account);
 const recoveryParams=()=>{const hash=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search);return{hash,query,token:hash.get("access_token")||query.get("access_token"),type:hash.get("type")||query.get("type"),marked:query.has("reset_password")};},recoveryLink=()=>{const p=recoveryParams();return!!p.token&&(p.type==="recovery"||p.marked);},status=(label,detail)=>{const a=$("syncStatusLabel"),b=$("syncStatusDetailTitle"),c=document.querySelector("#syncStatusPanel p:nth-of-type(2)");if(a)a.textContent=label;if(b)b.textContent=label;if(c)c.textContent=detail;},showGate=on=>{document.body.classList.toggle("auth-locked",on);gate.classList.toggle("hidden",!on);if(switchBtn)switchBtn.classList.toggle("hidden",on);if(logoutTop)logoutTop.classList.toggle("hidden",on);};
 let profileUsername="",profileUsernameUserId="",profileUsernameAttemptedUserId="",profileUsernamePromise=null;
 async function loadProfileUsername(s){
  const uid=s?.user?.id;
  if(!uid||profileUsernameUserId===uid||profileUsernameAttemptedUserId===uid||profileUsernamePromise)return;
  profileUsernameAttemptedUserId=uid;
  profileUsernamePromise=(async()=>{
   try{
    const response=await fetch(URL+"/functions/v1/login-with-username",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY,"Authorization":"Bearer "+s.access_token},body:JSON.stringify({action:"profile_username"})});
    if(!response.ok)throw Error("No se pudo consultar el usuario del perfil.");
    const result=await response.json(),username=String(result?.username||"").trim();
    if(get()?.user?.id!==uid)return;
    if(username){profileUsername=username;profileUsernameUserId=uid;}
   }catch{/* La etiqueta usa un respaldo local si el perfil no está disponible. */}
   finally{profileUsernamePromise=null;if(get())paint();}
  })();
  return profileUsernamePromise;
 }
 const paint=()=>{const recoveryMode=recoveryLink(),s=recoveryMode?null:get();showGate(!s);const identityBox=$("accountIdentityStatus"),identity=$("accountIdentityLabel"),network=$("accountNetworkLabel");if(identityBox)identityBox.classList.toggle("hidden",!s);if(identity){const entered=String(s?.login_username||""),dbUsername=s&&profileUsernameUserId===s.user.id?profileUsername:"";identity.textContent=s?(dbUsername||(entered&&!entered.includes("@")?entered:(s.user.email?.split("@")[0]||"Usuario"))):"";if(s&&profileUsernameUserId!==s.user.id)loadProfileUsername(s);}if(network){const online=navigator.onLine!==false;const authState=!online?"offline":s?"ok":"error";network.dataset.authState=authState;network.setAttribute("aria-label",authState==="offline"?"Sin conexión de red":authState==="ok"?"Sesión activa":"Problema de sesión");}if(recoveryMode){account.classList.add("hidden");reset?.classList.remove("hidden");recovery?.classList.add("hidden");}else{account.classList.remove("hidden");reset?.classList.add("hidden");}if(s){const sessionUsername=profileUsernameUserId===s.user.id?profileUsername:(String(s.login_username||"").includes("@")?(s.user.email||s.user.id):String(s.login_username||s.user.email||s.user.id));state.textContent="Sesión iniciada: "+sessionUsername+".";login.classList.add("hidden");logout.classList.remove("hidden");id.disabled=true;pw.disabled=true;let c=null;try{c=JSON.parse(contextStorage.getItem("nexum_sync_config_v1")||"null")}catch{}status(c?.workshopId?"Sesión iniciada · taller configurado":"Sesión iniciada · taller pendiente",c?.workshopId?"Taller configurado; el dispositivo se verifica al sincronizar.":"Falta configurar el ID del taller.");}else{state.textContent="Inicia sesión para acceder al taller.";login.classList.remove("hidden");logout.classList.add("hidden");id.disabled=false;pw.disabled=false;status("Sesión no iniciada","El contenido del taller está oculto hasta confirmar la sesión.");}};
 let refreshing=null,forcePasswordChange=false;
 const forceChange=()=>{if(forcePasswordChange)return;forcePasswordChange=true;login.classList.add("hidden");logout.classList.add("hidden");const box=document.createElement("div");box.id="forcedPasswordChange";box.innerHTML='<p><strong>Primer acceso: cambia tu contraseña</strong></p><label>Nueva contraseña (mínimo 8 caracteres)<input id="cloudNewPassword" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></label><label>Confirmar nueva contraseña<input id="cloudNewPasswordConfirm" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></label><button class="primary" id="cloudChangePasswordBtn" type="button">Cambiar contraseña</button>';form.appendChild(box);msg.textContent="La contraseña temporal no permite entrar al taller.";box.querySelector("#cloudChangePasswordBtn").onclick=async()=>{const a=$("cloudNewPassword").value,b=$("cloudNewPasswordConfirm").value,btn=$("cloudChangePasswordBtn");if(a.length<8||a!==b||a===pw.value){msg.textContent="Usa al menos 8 caracteres, confirma y no repitas la temporal.";return;}btn.disabled=true;try{const r=await fetch(URL+"/functions/v1/change-initial-password",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY},body:JSON.stringify({identifier:id.value.trim(),current_password:pw.value,new_password:a})}),o=await r.json().catch(()=>({}));if(!r.ok||!o.ok)throw Error(o.error||"No se pudo cambiar la contraseña.");box.remove();forcePasswordChange=false;pw.value="";msg.textContent="Contraseña cambiada. Inicia sesión con la nueva contraseña.";login.classList.remove("hidden");}catch(e){msg.textContent=e.message||"No se pudo cambiar la contraseña.";}finally{btn.disabled=false;}};};
 async function refresh(){if(refreshing)return refreshing;const work=async()=>{const s=get();if(!s)return false;if(s.expires_at&&s.expires_at>Math.floor(Date.now()/1000)+120)return true;if(navigator.onLine===false)return false;try{const r=await fetch(URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY},body:JSON.stringify({refresh_token:s.refresh_token})}),o=await r.json().catch(()=>({}));if(r.ok&&o.access_token&&o.refresh_token&&o.user){save({access_token:o.access_token,refresh_token:o.refresh_token,expires_at:o.expires_at||(Math.floor(Date.now()/1000)+(o.expires_in||3600)),user:o.user,login_username:s.login_username||"",saved_at:Date.now()},!!contextStorage.getItem(K));paint();return true;}if(r.status===400||r.status===401){clear();paint();msg.textContent="La sesión caducó o fue revocada. Inicia sesión de nuevo.";}return false;}catch{return false;}};refreshing=(async()=>{try{return navigator.locks?.request?await navigator.locks.request("nexum-auth-refresh",{mode:"exclusive"},work):await work();}finally{refreshing=null;}})();return refreshing;}
 /* V6.0-dev-v47: renovar el JWT antes de caducar; sin red se conserva la sesión local y el trabajo offline. */
 /* V6.0-dev-v48: la cabecera muestra usuario y conectividad del navegador, separado del estado de sincronización. */
 /* V6.0-dev-v49: la cabecera compacta representa autenticación y sincronización mediante iconos y estados de color. */
 /* V6.0-dev-v50: sincronización e instalación usan una fila secundaria para reservar espacio al usuario y al cierre de sesión. */
 window.NexumAuthSession.refresh=refresh;
 window.setInterval(()=>{if(!document.hidden&&navigator.onLine!==false&&get())refresh().then(paint);},60000);
 window.addEventListener("online",()=>{if(get())refresh().then(paint);else paint();});
 window.addEventListener("offline",paint);
 form.addEventListener("submit",async e=>{e.preventDefault();const identifier=id.value.trim(),password=pw.value;if(!identifier||!password)return;login.disabled=true;msg.textContent="Comprobando credenciales…";try{const r=await fetch(URL+"/functions/v1/login-with-username",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY},body:JSON.stringify({identifier,password})}),o=await r.json().catch(()=>({}));if(r.status===428&&o.needs_password_change){forceChange();throw Error(o.error||"Debes cambiar la contraseña temporal.");}if(!r.ok||!o.access_token||!o.refresh_token||!o.user)throw Error(o.error||"Credenciales incorrectas o cuenta no verificada.");save({access_token:o.access_token,refresh_token:o.refresh_token,expires_at:o.expires_at||(Math.floor(Date.now()/1000)+(o.expires_in||3600)),user:o.user,login_username:identifier,saved_at:Date.now()},!!remember?.checked);pw.value="";msg.textContent="Sesión iniciada correctamente. Actualizando el taller…";paint();/* V6.0-dev-v46: recarga completa tras login para reconstruir cola, menús y permisos con la sesión confirmada. */window.setTimeout(()=>window.location.reload(),250);}catch(e){msg.textContent=e instanceof TypeError?"No se pudo contactar el servicio. Comprueba la conexión.":e.message||"No se pudo iniciar sesión.";}finally{login.disabled=false;}});
 const doLogout=async()=>{const s=get();clear();paint();id.disabled=false;pw.disabled=false;pw.value="";if(s&&navigator.onLine!==false)try{await fetch(URL+"/auth/v1/logout",{method:"POST",headers:{"apikey":PUBLIC_KEY,"Authorization":"Bearer "+s.access_token}})}catch{}msg.textContent="Sesión cerrada. Los datos locales del taller se conservaron.";};logout?.addEventListener("click",doLogout);switchBtn?.addEventListener("click",doLogout);logoutTop?.addEventListener("click",doLogout);
 $("cloudRecoveryBtn")?.addEventListener("click",()=>{recovery.classList.remove("hidden");recoverId.value=id.value.trim();recoverMsg.textContent="";});recoverBack?.addEventListener("click",()=>recovery.classList.add("hidden"));
 recoverForm?.addEventListener("submit",async e=>{e.preventDefault();const identifier=recoverId.value.trim();if(!identifier)return;recoverBtn.disabled=true;recoverMsg.textContent="Solicitando recuperación…";try{const r=await fetch(URL+"/functions/v1/login-with-username",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUBLIC_KEY},body:JSON.stringify({action:"recover",identifier})}),o=await r.json().catch(()=>({}));if(!r.ok||!o.ok)throw Error(o.error||"No se pudo solicitar la recuperación.");recoverMsg.textContent=o.message||"Si la cuenta existe y está activa, recibirás un enlace en el correo asociado.";}catch(e){recoverMsg.textContent=e.message||"No se pudo solicitar la recuperación.";}finally{recoverBtn.disabled=false;}});
 resetBtn?.addEventListener("click",async()=>{const a=$("cloudResetPassword").value,b=$("cloudResetPasswordConfirm").value,token=recoveryParams().token;if(a.length<8||a!==b){$("cloudPasswordResetMessage").textContent="Las contraseñas deben coincidir y tener al menos 8 caracteres.";return;}if(!token){$("cloudPasswordResetMessage").textContent="El enlace no es válido o ha caducado. Solicita otro.";return;}resetBtn.disabled=true;try{const r=await fetch(URL+"/auth/v1/user",{method:"PUT",headers:{"apikey":PUBLIC_KEY,"Authorization":"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({password:a})});if(!r.ok)throw Error("El enlace expiró o no se pudo cambiar la contraseña. Solicita otro.");clear();history.replaceState(null,"",location.pathname+location.search);$("cloudPasswordResetMessage").textContent="Contraseña actualizada. Ya puedes iniciar sesión.";reset.classList.add("hidden");account.classList.remove("hidden");paint();}catch(e){$("cloudPasswordResetMessage").textContent=e.message||"No se pudo actualizar la contraseña.";}finally{resetBtn.disabled=false;}});
 window.addEventListener("storage",e=>{if(e.key===K){paint();if(get())refresh().then(paint);}});window.addEventListener("online",paint);window.addEventListener("offline",paint);window.addEventListener("focus",()=>refresh().then(paint));document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh().then(paint);});paint();refresh().then(paint);
})();/* V6.0-dev-v14 — consola administrativa muestra UUID y permite vincular este dispositivo al taller activo. */
(function initGlobalAdminConsole(){
 const URL="https://ywcrowviufbioeqixwrq.supabase.co";
 const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ5d2Nyb3d2aXdmaW9lcWl4d3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjIwMzAsImV4cCI6MjEwNjgzODAzMH0.Mh9BHpigCVQ8Q624_M1o495A5JwTRL0M7q7yF5g5RQE";
 const SESSION_KEY="nexum_v6_auth_session";
 const $=id=>document.getElementById(id);
 const check=$("globalAdminCheckBtn"),panel=$("globalAdminPanel"),status=$("globalAdminStatus");
 if(!check||!panel||!status)return;
 let dashboard=null;
 const session=()=>window.NexumAuthSession?.get()||(()=>{try{return JSON.parse(contextStorage.getItem(SESSION_KEY)||"null")}catch{return null}})();
 const setStatus=(message,isError=false)=>{status.textContent=message;status.style.color=isError?"var(--danger, #b42318)":"";};
 async function api(action,extra={}){
  const s=session();if(!s?.access_token)throw new Error("Inicia sesión con una cuenta autorizada.");
  const res=await fetch(URL+"/functions/v1/nexum-global-admin",{method:"POST",headers:{"Content-Type":"application/json","apikey":KEY,"Authorization":"Bearer "+s.access_token},body:JSON.stringify({action,...extra})});
  const body=await res.json().catch(()=>({}));
  if(!res.ok||body.ok!==true){const code=body.error||("http_"+res.status);const detail=body.message?`${body.reason?body.reason+": ":""}${body.message}`:"";const messages={global_admin_required:"Esta cuenta no tiene permisos de administración global.",account_not_authorized:"La cuenta está inactiva o tiene pendiente el cambio inicial de contraseña.",invalid_session:"La sesión expiró. Inicia sesión de nuevo.",authentication_required:"Inicia sesión para comprobar los permisos.",admin_service_unavailable:"El servicio administrativo no está disponible todavía.",workshop_create_failed_schema_or_validation:"No se pudo crear el taller. Revisa los datos y el esquema del servidor.",workshop_membership_create_failed_rolled_back:"No se pudo activar la membresía del administrador; el alta del taller se revirtió.",workshop_create_rolled_back_audit_failure:"No se pudo registrar la auditoría; el alta del taller se revirtió."};throw new Error((messages[code]||code)+(detail?" — "+detail:""));}
  return body.data;
 }
 function formMessage(formId,message,isError=false){const form=$(formId);if(!form)return;let p=form.querySelector("[data-action-message]");if(!p){p=element("p","","field-help");p.dataset.actionMessage="";p.setAttribute("role","status");form.appendChild(p);}p.textContent=message;p.style.color=isError?"var(--danger, #b42318)":"";}
 function inlineActionMessage(button,message,isError=false){let p=button.parentElement?.querySelector(":scope > [data-action-message]");if(!p){p=element("p","","field-help");p.dataset.actionMessage="";p.setAttribute("role","status");button.parentElement?.appendChild(p);}p.textContent=message;p.style.color=isError?"var(--danger, #b42318)":"";}function inlineActionError(button,message){inlineActionMessage(button,message,true);}
 function element(tag,content,className){const n=document.createElement(tag);if(content!==undefined)n.textContent=String(content);if(className)n.className=className;return n;}
 function actionButton(label,handler,secondary=true){const b=element("button",label,secondary?"secondary":"primary");b.type="button";b.addEventListener("click",event=>{if(b.disabled)return;const result=handler(event);if(result&&typeof result.then==="function"){const restore=setButtonBusy(b,"Procesando…");Promise.resolve(result).finally(restore);}});return b;}
 function renderWorkshops(rows){const host=$("globalAdminWorkshops");host.replaceChildren();const select=$("globalAdminMembershipWorkshop");select.replaceChildren(new Option("Seleccionar taller",""));for(const w of rows){const line=element("div",`${w.name} · ${w.is_active?"Activo":"Inactivo"}`,"field-help");line.appendChild(actionButton(w.is_active?"Desactivar":"Activar",async()=>{if(w.is_active&&!confirm("¿Desactivar este taller? Se bloqueará la sincronización de sus miembros."))return;try{await api("set_workshop_status",{workshop_id:w.id,is_active:!w.is_active});await refreshDashboard();inlineActionMessage(line,"Estado del taller actualizado.");}catch(e){inlineActionError(line,e.message);}}));host.appendChild(line);const idLine=element("div",`ID del taller: ${w.id}`,"field-help");idLine.style.overflowWrap="anywhere";host.appendChild(idLine);if(w.is_active){host.appendChild(actionButton("Usar en este dispositivo",()=>{if(window.NexumSyncBusy){setStatus("Espera a que termine la sincronización antes de cambiar de taller.",true);return;}let old={};try{old=JSON.parse(contextStorage.getItem("nexum_sync_config_v1")||"{}")||{}}catch{}contextStorage.setItem("nexum_sync_config_v1",JSON.stringify({workshopId:w.id,workshopName:w.name,deviceLabel:old.deviceLabel||((navigator.userAgent.includes("Mobi"))?"Teléfono NEXUM":"Dispositivo NEXUM"),userId:session()?.user?.id||""}));window.dispatchEvent(new Event("nexum-sync-config-changed"));setStatus(`Este dispositivo quedó vinculado a ${w.name}. Pulsa «Sincronizar ahora» para probar la conexión.`);},false));select.add(new Option(w.name,w.id));}}}
 function renderUsers(rows){const host=$("globalAdminUsers");host.replaceChildren();const select=$("globalAdminMembershipUser"),adminSelect=$("globalAdminTargetAdmin");select.replaceChildren(new Option("Seleccionar usuario",""));adminSelect.replaceChildren(new Option("Seleccionar usuario",""));const s=session();for(const u of rows){const line=element("div",`${u.username} · ${u.display_name||"Sin nombre"} · ${u.is_active?"Activo":"Inactivo"}${u.force_password_change?" · Cambio de contraseña pendiente":""}`,"field-help");if(u.id!==s?.user?.id){line.appendChild(actionButton(u.is_active?"Desactivar":"Activar",async()=>{if(u.is_active&&!confirm("¿Desactivar esta cuenta? No podrá acceder al taller."))return;try{await api("set_user_status",{user_id:u.id,is_active:!u.is_active});await refreshDashboard();inlineActionMessage(line,"Estado del usuario actualizado.");}catch(e){inlineActionError(line,e.message);}}));line.appendChild(actionButton("Eliminar usuario",async()=>{const typed=prompt(`Eliminar definitivamente la cuenta «${u.username}»? Esta acción no se puede deshacer. Escribe ELIMINAR para confirmar.`);if(typed!=="ELIMINAR")return;try{await api("delete_user",{user_id:u.id,confirmation:"ELIMINAR"});await refreshDashboard();inlineActionMessage(line,`Usuario ${u.username} eliminado.`);}catch(e){inlineActionError(line,e.message);}},false));}host.appendChild(line);if(u.is_active){const label=`${u.username} — ${u.display_name||u.email_snapshot||u.id}`;select.add(new Option(label,u.id));if(!u.force_password_change)adminSelect.add(new Option(label,u.id));}}}
 function renderGlobalAdmins(rows){const host=$("globalAdminAdmins");host.replaceChildren();for(const a of rows||[]){const p=a.profile||{};const line=element("div",`${p.username||a.user_id} · ${p.display_name||p.email_snapshot||""} · ${a.is_active?"Administrador activo":"Revocado"}`,"field-help");if(a.user_id!==session()?.user?.id&&a.is_active)line.appendChild(actionButton("Revocar acceso global",async()=>{if(!confirm("¿Revocar los permisos de administración global de esta cuenta?"))return;try{await api("set_global_admin_status",{user_id:a.user_id,is_active:false,note:$("globalAdminAdminNote").value.trim()});await refreshDashboard();inlineActionMessage(line,"Acceso de administrador global revocado.");}catch(e){inlineActionError(line,e.message);}}));host.appendChild(line);}}
 function renderMemberships(rows){const host=$("globalAdminMemberships");host.replaceChildren();const users=new Map((dashboard?.users||[]).map(u=>[u.id,u]));const workshops=new Map((dashboard?.workshops||[]).map(w=>[w.id,w]));for(const m of rows||[]){const u=users.get(m.user_id),w=workshops.get(m.workshop_id);const line=element("div",`${u?.username||m.user_id} → ${w?.name||m.workshop_id} · ${m.is_active?"Activa":"Inactiva"}`,"field-help");line.appendChild(actionButton(m.is_active?"Desactivar membresía":"Activar membresía",async()=>{if(m.is_active&&!confirm("¿Desactivar esta membresía? El usuario perderá acceso de sincronización a este taller."))return;try{await api("set_membership",{user_id:m.user_id,workshop_id:m.workshop_id,is_active:!m.is_active});await refreshDashboard();inlineActionMessage(line,"Membresía actualizada.");}catch(e){inlineActionError(line,e.message);}}));host.appendChild(line);}}
 function renderAudit(rows){const host=$("globalAdminAudit");host.textContent=(rows||[]).map(x=>`${x.created_at} | ${x.action} | ${x.target_type}:${x.target_id||"—"} | actor=${x.actor_user_id||"—"}`).join("\n")||"Sin eventos de auditoría todavía.";}
 function renderDashboard(d){dashboard=d;renderWorkshops(d.workshops||[]);renderUsers(d.users||[]);renderGlobalAdmins(d.global_admins||[]);renderMemberships(d.memberships||[]);renderAudit(d.recent_audit||[]);panel.classList.remove("hidden");}
 async function refreshDashboard(message){const d=await api("dashboard");renderDashboard(d);if(message)setStatus(message);}
 check.addEventListener("click",async()=>{if(check.disabled)return;const restore=setButtonBusy(check,"Verificando…");panel.classList.add("hidden");setStatus("Verificando permisos con el servidor…");try{await refreshDashboard("Acceso administrativo confirmado por el servidor.");}catch(e){panel.classList.add("hidden");setStatus(e.message,true);}finally{restore();}});
 $("globalAdminCreateWorkshopForm")?.addEventListener("submit",async e=>{e.preventDefault();const name=$("globalAdminWorkshopName").value.trim();if(!name)return;const submit=e.submitter||$("globalAdminCreateWorkshopForm").querySelector('button[type="submit"]'),restore=setButtonBusy(submit,"Creando taller…");try{await api("create_workshop",{name});$("globalAdminCreateWorkshopForm").reset();await refreshDashboard();formMessage("globalAdminCreateWorkshopForm","Taller creado.");}catch(err){formMessage("globalAdminCreateWorkshopForm",err.message,true);}finally{restore();}});
 $("globalAdminCreateUserForm")?.addEventListener("submit",async e=>{e.preventDefault();const password=$("globalAdminTemporaryPassword").value,confirmation=$("globalAdminTemporaryPasswordConfirm").value;if(password.length<8||password.length>128){formMessage("globalAdminCreateUserForm","La contraseña temporal debe tener entre 8 y 128 caracteres.",true);return;}if(password!==confirmation){formMessage("globalAdminCreateUserForm","Las contraseñas temporales no coinciden.",true);$("globalAdminTemporaryPasswordConfirm").focus();return;}const fields={username:$("globalAdminUsername").value.trim().toLowerCase(),display_name:$("globalAdminDisplayName").value.trim(),email:$("globalAdminEmail").value.trim().toLowerCase(),temporary_password:password},submit=e.submitter||$("globalAdminCreateUserForm").querySelector('button[type="submit"]'),restore=setButtonBusy(submit,"Creando usuario…");try{await api("create_user",fields);$("globalAdminCreateUserForm").reset();await refreshDashboard();formMessage("globalAdminCreateUserForm","Usuario creado. Entrega la contraseña temporal por un canal privado y exige su cambio en el primer acceso.");}catch(err){formMessage("globalAdminCreateUserForm",err.message,true);}finally{$("globalAdminTemporaryPassword").value="";$("globalAdminTemporaryPasswordConfirm").value="";restore();}});
 $("globalAdminMembershipForm")?.addEventListener("submit",async e=>{e.preventDefault();const user_id=$("globalAdminMembershipUser").value,workshop_id=$("globalAdminMembershipWorkshop").value;if(!user_id||!workshop_id)return;const submit=e.submitter||$("globalAdminMembershipForm").querySelector('button[type="submit"]'),restore=setButtonBusy(submit,"Actualizando…");try{await api("set_membership",{user_id,workshop_id,is_active:true});await refreshDashboard();formMessage("globalAdminMembershipForm","Membresía activada.");}catch(err){formMessage("globalAdminMembershipForm",err.message,true);}finally{restore();}});
 $("globalAdminManageAdminsForm")?.addEventListener("submit",async e=>{e.preventDefault();const user_id=$("globalAdminTargetAdmin").value,note=$("globalAdminAdminNote").value.trim();if(!user_id)return;const submit=e.submitter||$("globalAdminManageAdminsForm").querySelector('button[type="submit"]'),restore=setButtonBusy(submit,"Actualizando acceso…");try{await api("set_global_admin_status",{user_id,is_active:true,note});await refreshDashboard();formMessage("globalAdminManageAdminsForm","Acceso de administrador global otorgado.");}catch(err){formMessage("globalAdminManageAdminsForm",err.message,true);}finally{restore();}});
 window.addEventListener("storage",e=>{if(e.key===SESSION_KEY){panel.classList.add("hidden");dashboard=null;setStatus("La sesión cambió. Comprueba de nuevo el acceso administrativo.");}});
})();

/* V6.0-dev-v51: versión visual bajo el logotipo; sin cambios en autenticación o sincronización. */
