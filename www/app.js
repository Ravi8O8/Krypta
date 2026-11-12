const DB_NAME='MediaVault_Final',DB_VERSION=33;
const SF='files',SFL='folders',SS='settings';
const THUMB_PREFIX='thumb_';
const DEFAULT_SLIDESHOW_MS=3000;
const DEFAULT_TRASH_DAYS=30;
const PREVIEW_CACHE_MAX=200;
const DB_CACHE_TTL=5000;
const BIG_FILE_THRESHOLD=2*1024*1024*1024;
const AUTO_LOCK_AFTER_MS=30000;

const ICONS={
  image:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  video:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
  file:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg>',
  pause:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  star:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  home:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  trash:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  folderIcon:'<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  checkSmall:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:6px;"><polyline points="20 6 9 17 4 12"/></svg>',
  trashSmall:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--mut)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:6px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
};

const FOLDER_COLORS=['#a78bfa','#f87171','#34d399','#fbbf24','#60a5fa','#ec4899','#818cf8','#94a3b8'];
let selectedFolderColor=FOLDER_COLORS[0];

let db,currentFolder=null,filterType='all',searchQuery='';
let searchScope='current';
let viewMode='files';
let sel=new Set(),folderSel=new Set();
const failedVideoThumbs=new Set();
let sortBy='date_desc',isLocked=false;
let currentAccent = '#a78bfa';
const ACCENT_COLORS = [
  { name: 'Фиолетовый', hex: '#a78bfa', rgb: '167, 139, 250' },
  { name: 'Синий', hex: '#60a5fa', rgb: '96, 165, 250' },
  { name: 'Зелёный', hex: '#34d399', rgb: '52, 211, 153' },
  { name: 'Оранжевый', hex: '#fb923c', rgb: '251, 146, 60' },
  { name: 'Розовый', hex: '#f472b6', rgb: '244, 114, 182' },
  { name: 'Красный', hex: '#f87171', rgb: '248, 113, 113' }
];
let enteredPin='',isPinVerifying=false,pinChangeMode='set',backgroundedAt=0;
let folderCountCache=new Map();
let pressTimer=null,isLongPress=false;
let galleryFiles=[],currentGalleryIndex=0;
let rootDir=null;
let slideshowTimer=null,slideshowActive=false;
let slideshowInterval=DEFAULT_SLIDESHOW_MS;
let currentScale=1;
let viewerToken=0,slideToken=0;
let currentFilesCache=[],currentFoldersCache=[],allActiveFilesCache=[],allActiveFoldersCache=[],trashFilesCache=[],trashFoldersCache=[];
let startX=0,startY=0,isScrolling=false;
let scrollTimeout=null,scrollRaf=null;
let editIsFolder=true,editId=null;
let isDragSelecting=false,lastHoveredTile=null,lastDragTime=0;
let searchTimer=null;
let lastScrollTime=0;
let bgThumbQueue=[],bgThumbRunning=false;
let wakeLock=null,isAppInBackground=false;
let soundEnabled=true,folderPreviewEnabled=true,audioCtx=null;
let currentOperation=null,lastProgressUpdate=0,_keepAliveTimer=null;
let scrollMemory=new Map();
let _pendingScroll=null;

const filePreviewCache=new Map();
const folderPreviewCache=new Map();

let _filesCache=null,_filesCacheTime=0;
let _foldersCache=null,_foldersCacheTime=0;

function cacheGetPreview(map,key){const e=map.get(key);if(!e)return undefined;e.lastAccess=Date.now();return e.url;}
function cacheSetPreview(map,key,url){map.set(key,{url,lastAccess:Date.now()});if(map.size>PREVIEW_CACHE_MAX){let oldestKey=null,oldestTime=Infinity;for(const [k,v] of map)if(v.lastAccess<oldestTime){oldestTime=v.lastAccess;oldestKey=k;}if(oldestKey!==null){const old=map.get(oldestKey);try{URL.revokeObjectURL(old.url);}catch(e){}map.delete(oldestKey);}}}
function cacheRemovePreview(map,key){const e=map.get(key);if(e){try{URL.revokeObjectURL(e.url);}catch(_){}map.delete(key);}}
function cacheClearAll(){for(const [,v] of filePreviewCache)try{URL.revokeObjectURL(v.url);}catch(e){}for(const [,v] of folderPreviewCache)try{URL.revokeObjectURL(v.url);}catch(e){}filePreviewCache.clear();folderPreviewCache.clear();}

let virtualState={items:[],cols:3,rowHeight:0,paddingTop:16,lastRange:[-1,-1]};

function pluralize(n,forms){const n10=n%10,n100=n%100;if(n10===1&&n100!==11)return forms[0];if(n10>=2&&n10<=4&&(n100<10||n100>=20))return forms[1];return forms[2];}
function formatSize(bytes){if(bytes<1024)return bytes+' Б';if(bytes<1024*1024)return (bytes/1024).toFixed(1)+' КБ';if(bytes<1024*1024*1024)return (bytes/1024/1024).toFixed(1)+' МБ';return (bytes/1024/1024/1024).toFixed(2)+' ГБ';}

function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}
let lastSoundTime=0;
function playSound(type){
  if(!soundEnabled)return;
  const now=Date.now();if(now-lastSoundTime<25)return;lastSoundTime=now;
  initAudio();if(!audioCtx)return;
  const t=audioCtx.currentTime;
  const tone=(freq,dur,wave='sine',vol=0.08,delay=0)=>{const start=t+delay;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=wave;osc.frequency.value=freq;osc.connect(gain);gain.connect(audioCtx.destination);gain.gain.setValueAtTime(0.0001,start);gain.gain.exponentialRampToValueAtTime(vol,start+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,start+dur);osc.start(start);osc.stop(start+dur+0.02);};
  const sweep=(f1,f2,dur,vol=0.06)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.setValueAtTime(f1,t);osc.frequency.exponentialRampToValueAtTime(f2,t+dur);osc.connect(gain);gain.connect(audioCtx.destination);gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(vol,t+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,t+dur);osc.start(t);osc.stop(t+dur+0.02);};
  switch(type){
    case 'click':tone(920,0.05,'sine',0.06);if(navigator.vibrate)navigator.vibrate(6);break;
    case 'select':tone(1150,0.06,'sine',0.07);if(navigator.vibrate)navigator.vibrate(10);break;
    case 'deselect':tone(680,0.06,'sine',0.06);if(navigator.vibrate)navigator.vibrate(6);break;
    case 'success':tone(660,0.12,'sine',0.07);tone(990,0.18,'sine',0.07,0.08);if(navigator.vibrate)navigator.vibrate([15,30,15]);break;
    case 'error':tone(240,0.15,'triangle',0.09);tone(180,0.22,'triangle',0.09,0.11);if(navigator.vibrate)navigator.vibrate([40,80,40]);break;
    case 'swipe':sweep(700,1300,0.09,0.05);if(navigator.vibrate)navigator.vibrate(4);break;
    case 'open':sweep(480,880,0.11,0.055);break;
    case 'create':tone(780,0.06,'sine',0.06);tone(1170,0.11,'sine',0.06,0.06);break;
    case 'delete':sweep(620,280,0.16,0.06);if(navigator.vibrate)navigator.vibrate(18);break;
  }
}

window.toggleSound=async()=>{soundEnabled=!soundEnabled;document.getElementById('swSound').classList.toggle('on',soundEnabled);await setSetting('soundEnabled',soundEnabled);if(soundEnabled)playSound('success');};
window.toggleFolderPreview=async()=>{folderPreviewEnabled=!folderPreviewEnabled;const sw=document.getElementById('swFolderPreview');if(sw)sw.classList.toggle('on',folderPreviewEnabled);await setSetting('folderPreviewEnabled',folderPreviewEnabled);virtualState.lastRange=[-1,-1];renderGrid(true);toast(folderPreviewEnabled?'Превью папок':'Превью папок',folderPreviewEnabled?'Включено':'Отключено');};

document.addEventListener('pointerdown',(e)=>{
  if(e.target.closest('button')||e.target.closest('.tab')||e.target.closest('.ctx-item')||e.target.closest('.theme-item')||e.target.closest('.pill')||e.target.closest('.settings-btn')){
    if(!e.target.closest('.ck-key')&&!e.target.closest('#confirmOk')&&!e.target.closest('#confirmCancel'))playSound('click');
  }
},{passive:true});

window.addEventListener('beforeunload',(e)=>{if(currentOperation){e.preventDefault();return '';}});

let settingsCache=null;
async function getAllSettings(){if(settingsCache!==null)return settingsCache;const all=await p(st(SS,'readonly').getAll());settingsCache={};all.forEach(s=>{settingsCache[s.key]=s.value;});return settingsCache;}
async function getSetting(k){const s=await getAllSettings();return s[k]??null;}
async function setSetting(k,v){if(settingsCache!==null)settingsCache[k]=v;return p(st(SS,'readwrite').put({key:k,value:v}));}

const PBKDF2_WORKER_CODE=`self.onmessage = async (e) => { const { id, type, password, saltHex, iterations } = e.data; try { const hexToBytes = (hex) => { const arr = new Uint8Array(hex.length / 2); for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.substr(i, 2), 16); return arr; }; const bytesToHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''); const enc = new TextEncoder(); const salt = hexToBytes(saltHex); const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']); const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations, hash:'SHA-256'}, keyMaterial, 256); self.postMessage({ id, result: bytesToHex(bits) }); } catch (err) { self.postMessage({ id, error: err.message || String(err) }); } };`;
let pbkdf2Worker=null,pbkdf2Pending=new Map(),pbkdf2NextId=1;
function getPbkdf2Worker(){
  if(pbkdf2Worker!==null)return pbkdf2Worker;
  try{
    const blob=new Blob([PBKDF2_WORKER_CODE],{type:'application/javascript'});
    pbkdf2Worker=new Worker(URL.createObjectURL(blob));
    pbkdf2Worker.onmessage=(e)=>{const {id,result,error}=e.data;const h=pbkdf2Pending.get(id);if(!h)return;pbkdf2Pending.delete(id);if(error)h.reject(new Error(error));else h.resolve(result);};
    pbkdf2Worker.onerror=()=>{const pending=[...pbkdf2Pending.values()];pbkdf2Pending.clear();pending.forEach(h=>h.reject(new Error('Worker failed')));try{pbkdf2Worker.terminate();}catch(e){}pbkdf2Worker=null;};
  }catch(e){pbkdf2Worker=false;}
  return pbkdf2Worker;
}
function pbkdf2Run(type,password,saltHex,iterations){const w=getPbkdf2Worker();if(!w)return Promise.reject(new Error('Worker unavailable'));return new Promise((resolve,reject)=>{const id=pbkdf2NextId++;pbkdf2Pending.set(id,{resolve,reject});w.postMessage({id,type,password,saltHex,iterations});});}

const nextMacrotask=(()=>{
  if(typeof scheduler!=='undefined'&&scheduler&&typeof scheduler.postTask==='function'){
    return()=>new Promise((resolve)=>{try{scheduler.postTask(resolve,{priority:'user-blocking'});}catch(e){setTimeout(resolve,0);}});
  }
  return()=>new Promise(r=>{const ch=new MessageChannel();ch.port1.onmessage=()=>{try{ch.port1.close();}catch(e){}r();};ch.port2.postMessage(0);});
})();

let _kaEl=null,_kaRaf=null,_kaRunning=false,_kaI=0;
function startKeepAlive(){
  if(_kaRunning)return;_kaRunning=true;
  if(!_kaEl){_kaEl=document.createElement('div');_kaEl.style.cssText='position:fixed;top:0;left:0;width:2px;height:2px;pointer-events:none;opacity:0.001;z-index:-1;will-change:transform;contain:strict;';document.body.appendChild(_kaEl);}
  const tick=()=>{if(!_kaRunning)return;_kaI=(_kaI+1)%2000;_kaEl.style.transform=`translate3d(${_kaI}px,0,0)`;_kaRaf=requestAnimationFrame(tick);};
  _kaRaf=requestAnimationFrame(tick);
}
function stopKeepAlive(){_kaRunning=false;if(_kaRaf){cancelAnimationFrame(_kaRaf);_kaRaf=null;}}

async function acquireWakeLock(){try{if('wakeLock' in navigator&&!wakeLock){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}}catch(e){}}
function releaseWakeLock(){try{if(wakeLock){wakeLock.release();wakeLock=null;}}catch(e){}}

document.addEventListener('visibilitychange',async()=>{
  if(document.hidden){
    isAppInBackground=true;
    backgroundedAt=Date.now();
    releaseWakeLock();
    if(slideshowTimer)clearTimeout(slideshowTimer);
  }else{
    isAppInBackground=false;
    acquireWakeLock();
    const pinEnabled=await getSetting('pinEnabled');
    if(pinEnabled&&backgroundedAt&&(Date.now()-backgroundedAt)>AUTO_LOCK_AFTER_MS){
      isLocked=true;
      enteredPin='';
      updatePinDots();
      $('pinError').textContent='';
      $('lockScreen').style.display='flex';
    }else if(!isLocked){
      virtualState.lastRange=[-1,-1];
      await refresh();
    }
    backgroundedAt=0;
  }
});

const $=id=>document.getElementById(id);
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatEta(c,t,e){if(c<=0||t<=0||e<=0)return '...';const avg=e/c;const rem=(t-c)*avg;if(rem<1000)return '...';const s=Math.round(rem/1000);return s<60?`~${s} сек`:`~${Math.round(s/60)} мин`;}

function showProgress(title,percent,file,eta,force=false){
  const now=Date.now();
  const isMilestone=(percent===0||percent===100);
  if(!force&&!isMilestone&&now-lastProgressUpdate<200&&$('progressDrawer').classList.contains('on'))return;
  lastProgressUpdate=now;
  $('progTitle').textContent=title;$('progPercent').textContent=percent+'%';
  $('progFill').style.width=percent+'%';$('progFile').textContent=file;$('progEta').textContent=eta;
  $('progressDrawer').classList.add('on');
  if(!_keepAliveTimer&&!_kaRunning)_keepAliveTimer=setTimeout(()=>{_keepAliveTimer=null;startKeepAlive();},1000);
}
function hideProgress(){if(_keepAliveTimer){clearTimeout(_keepAliveTimer);_keepAliveTimer=null;}stopKeepAlive();$('progressDrawer').classList.remove('on');lastProgressUpdate=0;}

function startAbortableOperation(type,title){currentOperation={type,title,abort:false};$('progCancelBtn').style.display='flex';}
function endAbortableOperation(){currentOperation=null;$('progCancelBtn').style.display='none';}
function checkAbort(){if(currentOperation&&currentOperation.abort)throw new Error('Отменено пользователем');}
$('progCancelBtn').onclick=()=>{if(currentOperation&&!currentOperation.abort){currentOperation.abort=true;$('progTitle').textContent='Отмена...';$('progCancelBtn').style.display='none';}};

let pendingUndo=null;
function toast(title,sub='',isError=false){
  if(pendingUndo){clearTimeout(pendingUndo.timer);pendingUndo=null;}
  const t=$('toast');t.classList.remove('with-action');
  t.innerHTML=`<div class="toast-title ${isError?'error':''}">${escapeHtml(title)}</div><div class="toast-sub">${escapeHtml(sub)}</div>`;
  t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),4000);
  if(isError)playSound('error');else playSound('success');
}
function showUndoToast(title,sub,onUndo,duration=5000){
  if(pendingUndo){clearTimeout(pendingUndo.timer);pendingUndo=null;}
  const t=$('toast');
  t.innerHTML=`<div class="toast-title">${escapeHtml(title)}</div>${sub?`<div class="toast-sub">${escapeHtml(sub)}</div>`:''}<button type="button" class="toast-action" id="toastUndoBtn">Отменить</button>`;
  t.classList.add('on','with-action');clearTimeout(t._h);
  const btn=t.querySelector('#toastUndoBtn');let executed=false;
  const doUndo=async()=>{if(executed)return;executed=true;if(pendingUndo){clearTimeout(pendingUndo.timer);pendingUndo=null;}t.classList.remove('on','with-action');try{await onUndo();}catch(e){toast('Ошибка',e.message||'Не удалось отменить',true);}};
  btn.addEventListener('pointerdown',(e)=>{e.preventDefault();doUndo();});
  const timer=setTimeout(()=>{pendingUndo=null;t.classList.remove('on','with-action');},duration);
  pendingUndo={timer,doUndo};
}
function showConfirm(title,text,okText='ОК',cancelText='Отмена'){
  return new Promise(resolve=>{
    const modal=$('modalConfirm'),btnOk=$('confirmOk'),btnCancel=$('confirmCancel');
    $('confirmTitle').textContent=title;$('confirmText').innerHTML=text;
    btnOk.textContent=okText;btnCancel.textContent=cancelText;
    const cleanup=()=>{modal.classList.remove('on');btnOk.onclick=null;btnCancel.onclick=null;};
    btnOk.onclick=()=>{playSound('click');cleanup();resolve(true);};
    btnCancel.onclick=()=>{playSound('click');cleanup();resolve(false);};
    modal.style.zIndex='99999';modal.classList.add('on');
  });
}

const CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[i]=c>>>0;}return t;})();
function isCapacitorNative(){return window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform();}

async function blobToBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onloadend=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});}

async function createOutputStream(filename){
  if(window.showSaveFilePicker&&!isCapacitorNative()){
    try{
      const handle=await window.showSaveFilePicker({suggestedName:filename});
      const fileStream=await handle.createWritable();
      return {write:(c)=>fileStream.write(c),close:async()=>{await fileStream.close();return {uri:null,name:filename,size:0};},abort:async()=>{try{await fileStream.abort();}catch(e){}}};
    }catch(e){if(e.name==='AbortError')return null;}
  }
  if(isCapacitorNative()){
    try{
      const {Filesystem}=window.Capacitor.Plugins;
      const safeName=String(filename||'export.zip').replace(/[\/\\:*?"<>|]/g,'_');
      const path=`export_${Date.now()}_${safeName}`;
      const directory='DOCUMENTS';
      try{await Filesystem.deleteFile({path,directory});}catch(e){}
      let buffer=[],bufferSize=0;const TARGET=4*1024*1024;
      let isFirst=true,writeChain=Promise.resolve(),bytesWritten=0,aborted=false;
      const flush=async(force=false)=>{
        if(aborted||bufferSize===0)return;if(!force&&bufferSize<TARGET)return;
        const parts=buffer;buffer=[];bufferSize=0;
        const base64=await blobToBase64(new Blob(parts));
        if(aborted)return;
        if(isFirst){await Filesystem.writeFile({path,data:base64,directory,recursive:true});isFirst=false;}
        else await Filesystem.appendFile({path,data:base64,directory});
      };
      return {
        write:(chunk)=>{writeChain=writeChain.then(async()=>{if(aborted)return;const b=chunk instanceof Blob?chunk:new Blob([chunk]);buffer.push(b);bufferSize+=b.size;bytesWritten+=b.size;await flush();});return writeChain;},
        close:async()=>{await writeChain;await flush(true);const {uri}=await Filesystem.getUri({path,directory});return {uri,name:safeName,size:bytesWritten};},
        abort:async()=>{aborted=true;try{await writeChain;}catch(_){}try{await Filesystem.deleteFile({path,directory});}catch(e){}}
      };
    }catch(e){return null;}
  }
  return null;
}

async function writeStreamingZip(writable,items,onProgress){
  const enc=new TextEncoder();const centralDir=[];let offset=0,lastYield=Date.now(),count=0;
  for(let i=0;i<items.length;i++){
    checkAbort();
    const item=items[i];let blob=item.getBlob?await item.getBlob():item.blob;if(!blob)continue;
    const nameBytes=enc.encode(item.name);const size=blob.size;const needZip64Size=size>0xFFFFFFFE;
    const lfh=new Uint8Array(30+nameBytes.length);const lfhDV=new DataView(lfh.buffer);
    lfhDV.setUint32(0,0x04034b50,true);lfhDV.setUint16(4,needZip64Size?45:20,true);lfhDV.setUint16(6,0x0808,true);
    lfhDV.setUint16(8,0,true);lfhDV.setUint16(10,0,true);lfhDV.setUint16(12,0,true);
    lfhDV.setUint32(14,0,true);lfhDV.setUint32(18,0,true);lfhDV.setUint32(22,0,true);
    lfhDV.setUint16(26,nameBytes.length,true);lfhDV.setUint16(28,0,true);lfh.set(nameBytes,30);
    const localHeaderOffset=offset;await writable.write(lfh);offset+=lfh.length;
    let crc=0xFFFFFFFF;const reader=blob.stream().getReader();
    while(true){
      const {done,value}=await reader.read();if(done)break;
      for(let j=0;j<value.length;j++)crc=CRC_TABLE[(crc^value[j])&0xFF]^(crc>>>8);
      await writable.write(value);offset+=value.length;
      if(Date.now()-lastYield>200){lastYield=Date.now();if(onProgress)onProgress(count,items.length,item.name,offset);await nextMacrotask();}
    }
    crc=(crc^0xFFFFFFFF)>>>0;
    const ddLen=needZip64Size?24:16;
    const dd=new Uint8Array(ddLen);const ddDV=new DataView(dd.buffer);
    ddDV.setUint32(0,0x08074b50,true);ddDV.setUint32(4,crc,true);
    if(needZip64Size){ddDV.setBigUint64(8,BigInt(size),true);ddDV.setBigUint64(16,BigInt(size),true);}
    else{ddDV.setUint32(8,size,true);ddDV.setUint32(12,size,true);}
    await writable.write(dd);offset+=ddLen;
    const needZip64Offset=localHeaderOffset>0xFFFFFFFE;
    let extraDataLen=0;if(needZip64Size)extraDataLen+=16;if(needZip64Offset)extraDataLen+=8;
    const extraFieldLen=extraDataLen>0?extraDataLen+4:0;
    const cd=new Uint8Array(46+nameBytes.length+extraFieldLen);const cdDV=new DataView(cd.buffer);
    const verNeeded=(needZip64Size||needZip64Offset)?45:20;
    cdDV.setUint32(0,0x02014b50,true);cdDV.setUint16(4,verNeeded,true);cdDV.setUint16(6,verNeeded,true);cdDV.setUint16(8,0x0808,true);
    cdDV.setUint16(10,0,true);cdDV.setUint16(12,0,true);cdDV.setUint16(14,0,true);
    cdDV.setUint32(16,crc,true);cdDV.setUint32(20,needZip64Size?0xFFFFFFFF:size,true);cdDV.setUint32(24,needZip64Size?0xFFFFFFFF:size,true);
    cdDV.setUint16(28,nameBytes.length,true);cdDV.setUint16(30,extraFieldLen,true);
    cdDV.setUint32(42,needZip64Offset?0xFFFFFFFF:localHeaderOffset,true);cd.set(nameBytes,46);
    if(extraFieldLen>0){
      const eo=46+nameBytes.length;
      cdDV.setUint16(eo,0x0001,true);cdDV.setUint16(eo+2,extraDataLen,true);
      let dp=eo+4;
      if(needZip64Size){cdDV.setBigUint64(dp,BigInt(size),true);cdDV.setBigUint64(dp+8,BigInt(size),true);dp+=16;}
      if(needZip64Offset){cdDV.setBigUint64(dp,BigInt(localHeaderOffset),true);dp+=8;}
    }
    centralDir.push(cd);count++;
    if(item.blob)item.blob=null;if(item.getBlob)item.getBlob=null;
    if(onProgress)onProgress(count,items.length,item.name,offset);
    await nextMacrotask();
  }
  const cdStart=offset;
  for(const entry of centralDir){await writable.write(entry);offset+=entry.length;}
  const cdSize=offset-cdStart;
  const needsZip64=offset>0xFFFFFFFE||cdStart>0xFFFFFFFE||count>=0xFFFF;
  if(needsZip64){
    const z64Offset=offset;const z64=new Uint8Array(56);const z64DV=new DataView(z64.buffer);
    z64DV.setUint32(0,0x06064b50,true);z64DV.setBigUint64(4,44n,true);z64DV.setUint16(12,45,true);z64DV.setUint16(14,45,true);
    z64DV.setBigUint64(24,BigInt(count),true);z64DV.setBigUint64(32,BigInt(count),true);z64DV.setBigUint64(40,BigInt(cdSize),true);z64DV.setBigUint64(48,BigInt(cdStart),true);
    await writable.write(z64);offset+=56;
    const loc=new Uint8Array(20);const locDV=new DataView(loc.buffer);
    locDV.setUint32(0,0x07064b50,true);locDV.setBigUint64(8,BigInt(z64Offset),true);locDV.setUint32(16,1,true);
    await writable.write(loc);offset+=20;
  }
  const eocd=new Uint8Array(22);const eocdDV=new DataView(eocd.buffer);
  eocdDV.setUint32(0,0x06054b50,true);
  eocdDV.setUint16(8,needsZip64?0xFFFF:count,true);
  eocdDV.setUint16(10,needsZip64?0xFFFF:count,true);
  eocdDV.setUint32(12,needsZip64?0xFFFFFFFF:cdSize,true);
  eocdDV.setUint32(16,needsZip64?0xFFFFFFFF:cdStart,true);
  await writable.write(eocd);
}

async function parseZip(blob){
  const buf=new Uint8Array(await blob.arrayBuffer());
  const dv=new DataView(buf.buffer);
  const files=[];
  let eocdPos=-1;
  for(let i=buf.length-22;i>=Math.max(0,buf.length-22-65536);i--)if(dv.getUint32(i,true)===0x06054b50){eocdPos=i;break;}
  if(eocdPos===-1)throw new Error('Неверный ZIP архив (нет EOCD)');
  let cdOffset=dv.getUint32(eocdPos+16,true),cdCount=dv.getUint16(eocdPos+10,true),cdSize=dv.getUint32(eocdPos+12,true);
  if(eocdPos>=20){
    const locPos=eocdPos-20;
    if(dv.getUint32(locPos,true)===0x07064b50){
      const z64Offset=Number(dv.getBigUint64(locPos+8,true));
      if(z64Offset+56<=buf.length&&dv.getUint32(z64Offset,true)===0x06064b50){
        cdCount=Number(dv.getBigUint64(z64Offset+32,true));
        cdSize=Number(dv.getBigUint64(z64Offset+40,true));
        cdOffset=Number(dv.getBigUint64(z64Offset+48,true));
      }
    }
  }
  let pos=cdOffset;
  for(let i=0;i<cdCount;i++){
    if(pos+46>buf.length)break;
    if(dv.getUint32(pos,true)!==0x02014b50)break;
    const method=dv.getUint16(pos+10,true);
    let compSize=dv.getUint32(pos+20,true),uncompSize=dv.getUint32(pos+24,true);
    const nameLen=dv.getUint16(pos+28,true),extraLen=dv.getUint16(pos+30,true),commentLen=dv.getUint16(pos+32,true);
    let localOffset=dv.getUint32(pos+42,true);
    const name=new TextDecoder().decode(buf.subarray(pos+46,pos+46+nameLen));
    if(compSize===0xFFFFFFFF||uncompSize===0xFFFFFFFF||localOffset===0xFFFFFFFF){
      let ep=pos+46+nameLen;const epEnd=ep+extraLen;
      while(ep+4<=epEnd){
        const tag=dv.getUint16(ep,true),sz=dv.getUint16(ep+2,true);
        if(tag===0x0001){
          let dp=ep+4;
          if(uncompSize===0xFFFFFFFF&&dp+8<=epEnd){uncompSize=Number(dv.getBigUint64(dp,true));dp+=8;}
          if(compSize===0xFFFFFFFF&&dp+8<=epEnd){compSize=Number(dv.getBigUint64(dp,true));dp+=8;}
          if(localOffset===0xFFFFFFFF&&dp+8<=epEnd){localOffset=Number(dv.getBigUint64(dp,true));dp+=8;}
          break;
        }
        ep+=4+sz;
      }
    }
    const lnameLen=dv.getUint16(localOffset+26,true),lextraLen=dv.getUint16(localOffset+28,true);
    const dataStart=localOffset+30+lnameLen+lextraLen;
    if(dataStart+compSize>buf.length){pos+=46+nameLen+extraLen+commentLen;continue;}
    const rawData=buf.subarray(dataStart,dataStart+compSize);
    let data;
    if(method===0)data=rawData;
    else if(method===8){
      try{
        const ds=new DecompressionStream('deflate-raw');
        const writer=ds.writable.getWriter();writer.write(rawData);writer.close();
        const reader=ds.readable.getReader();const chunks=[];
        while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);}
        const out=new Uint8Array(chunks.reduce((s,c)=>s+c.length,0));
        let off=0;for(const c of chunks){out.set(c,off);off+=c.length;}
        data=out;
      }catch(e){pos+=46+nameLen+extraLen+commentLen;continue;}
    }else{pos+=46+nameLen+extraLen+commentLen;continue;}
    files.push({name,data});
    pos+=46+nameLen+extraLen+commentLen;
  }
  return files;
}

async function parseZipStreaming(file){
  if(file.size<22)throw new Error('Файл слишком мал');
  const tailSize=Math.min(file.size,65557),tailStart=file.size-tailSize;
  const tailBuf=new Uint8Array(await file.slice(tailStart).arrayBuffer());
  let eocdPos=-1;
  for(let i=tailBuf.length-22;i>=0;i--)if(tailBuf[i]===0x50&&tailBuf[i+1]===0x4b&&tailBuf[i+2]===0x05&&tailBuf[i+3]===0x06){eocdPos=i;break;}
  if(eocdPos===-1)throw new Error('Неверный ZIP (нет EOCD)');
  const eocdDV=new DataView(tailBuf.buffer,eocdPos);
  let cdCount=eocdDV.getUint16(10,true),cdSize=eocdDV.getUint32(12,true),cdOffset=eocdDV.getUint32(16,true);
  if(eocdPos>=20){
    const locPos=eocdPos-20;const locDV=new DataView(tailBuf.buffer,locPos);
    if(locDV.getUint32(0,true)===0x07064b50){
      const z64EocdOffset=Number(locDV.getBigUint64(8,true));
      if(z64EocdOffset+56<=file.size){
        const z64Buf=new Uint8Array(await file.slice(z64EocdOffset,z64EocdOffset+56).arrayBuffer());
        const z64DV=new DataView(z64Buf.buffer);
        if(z64DV.getUint32(0,true)===0x06064b50){
          cdCount=Number(z64DV.getBigUint64(32,true));
          cdSize=Number(z64DV.getBigUint64(40,true));
          cdOffset=Number(z64DV.getBigUint64(48,true));
        }
      }
    }
  }
  const cdBuf=new Uint8Array(await file.slice(cdOffset,cdOffset+cdSize).arrayBuffer());
  const cdDV=new DataView(cdBuf.buffer);
  const entries=[];let pos=0;
  for(let i=0;i<cdCount;i++){
    if(pos+46>cdBuf.length)break;
    if(cdDV.getUint32(pos,true)!==0x02014b50)break;
    const method=cdDV.getUint16(pos+10,true);const crc=cdDV.getUint32(pos+16,true);
    let compSize=cdDV.getUint32(pos+20,true),uncompSize=cdDV.getUint32(pos+24,true);
    const nameLen=cdDV.getUint16(pos+28,true),extraLen=cdDV.getUint16(pos+30,true),commentLen=cdDV.getUint16(pos+32,true);
    let localOffset=cdDV.getUint32(pos+42,true);
    const name=new TextDecoder().decode(cdBuf.slice(pos+46,pos+46+nameLen));
    const extra=cdBuf.slice(pos+46+nameLen,pos+46+nameLen+extraLen);
    if(compSize===0xFFFFFFFF||uncompSize===0xFFFFFFFF||localOffset===0xFFFFFFFF){
      let ep=0;
      while(ep+4<=extra.length){
        const tag=extra[ep]|(extra[ep+1]<<8);const sz=extra[ep+2]|(extra[ep+3]<<8);
        if(tag===0x0001){
          let dp=ep+4;
          if(uncompSize===0xFFFFFFFF&&dp+8<=extra.length){uncompSize=Number(new DataView(extra.buffer,extra.byteOffset+dp,8).getBigUint64(0,true));dp+=8;}
          if(compSize===0xFFFFFFFF&&dp+8<=extra.length){compSize=Number(new DataView(extra.buffer,extra.byteOffset+dp,8).getBigUint64(0,true));dp+=8;}
          if(localOffset===0xFFFFFFFF&&dp+8<=extra.length){localOffset=Number(new DataView(extra.buffer,extra.byteOffset+dp,8).getBigUint64(0,true));dp+=8;}
          break;
        }
        ep+=4+sz;
      }
    }
    entries.push({name,method,compSize,uncompSize,localOffset,crc});
    pos+=46+nameLen+extraLen+commentLen;
  }
  return {file,entries};
}

async function extractEntryToOPFS(zipInfo,entry,fileId){
  const lhBuf=new Uint8Array(await zipInfo.file.slice(entry.localOffset,entry.localOffset+30).arrayBuffer());
  const lhDV=new DataView(lhBuf.buffer);
  const dataStart=entry.localOffset+30+lhDV.getUint16(26,true)+lhDV.getUint16(28,true);
  const fh=await rootDir.getFileHandle(fileId,{create:true});
  const writable=await fh.createWritable();
  const CHUNK=8*1024*1024;let lastYield=Date.now();
  try{
    if(entry.method===0){
      let off=0;const total=entry.compSize;
      while(off<total){
        const end=Math.min(off+CHUNK,total);
        await writable.write(zipInfo.file.slice(dataStart+off,dataStart+end));
        off=end;
        if(Date.now()-lastYield>150){await nextMacrotask();lastYield=Date.now();}
      }
    }else if(entry.method===8){
      const ds=new DecompressionStream('deflate-raw');
      const dsWriter=ds.writable.getWriter();const dsReader=ds.readable.getReader();
      const writePromise=(async()=>{
        const end=dataStart+entry.compSize;let offset=dataStart;
        while(offset<end){
          const chunkEnd=Math.min(offset+CHUNK,end);
          const buf=new Uint8Array(await zipInfo.file.slice(offset,chunkEnd).arrayBuffer());
          await dsWriter.write(buf);offset=chunkEnd;
          if(Date.now()-lastYield>150){await nextMacrotask();lastYield=Date.now();}
        }
        await dsWriter.close();
      })();
      let parts=[],partsSize=0;
      const flushParts=async()=>{
        if(partsSize===0)return;
        const merged=new Uint8Array(partsSize);let o=0;
        for(const c of parts){merged.set(c,o);o+=c.length;}
        await writable.write(merged);parts=[];partsSize=0;
      };
      try{
        while(true){
          const {done,value}=await dsReader.read();
          if(done)break;
          parts.push(value);partsSize+=value.length;
          if(partsSize>=CHUNK){await flushParts();if(Date.now()-lastYield>150){await nextMacrotask();lastYield=Date.now();}}
        }
        await flushParts();await writePromise;
      }catch(e){try{await dsWriter.abort();}catch(_){}throw e;}
    }else throw new Error('Неизвестный метод сжатия '+entry.method);
    await writable.close();
    return true;
  }catch(e){try{await writable.abort();}catch(_){}try{await rootDir.removeEntry(fileId);}catch(_){}throw e;}
}

async function extractEntryToBuffer(zipInfo,entry){
  if(entry.compSize===0&&entry.uncompSize===0)return new Uint8Array(0);
  const lhBuf=new Uint8Array(await zipInfo.file.slice(entry.localOffset,entry.localOffset+30).arrayBuffer());
  const lhDV=new DataView(lhBuf.buffer);
  const dataStart=entry.localOffset+30+lhDV.getUint16(26,true)+lhDV.getUint16(28,true);
  const dataBlob=zipInfo.file.slice(dataStart,dataStart+entry.compSize);
  if(entry.method===0)return new Uint8Array(await dataBlob.arrayBuffer());
  if(entry.method===8){
    const ds=new DecompressionStream('deflate-raw');
    const pipePromise=dataBlob.stream().pipeTo(ds.writable);
    const chunks=[];const reader=ds.readable.getReader();
    while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);}
    await pipePromise;
    const out=new Uint8Array(chunks.reduce((s,c)=>s+c.length,0));
    let off=0;for(const c of chunks){out.set(c,off);off+=c.length;}
    return out;
  }
  throw new Error('Неизвестный метод сжатия '+entry.method);
}

function sanitizeName(name){return String(name||'file').replace(/[\/\\:*?"<>|\x00-\x1f]/g,'_');}

async function generateImageThumbnail(file,maxSize=300){
  if(typeof createImageBitmap==='function'){
    try{
      const bitmap=await createImageBitmap(file);
      const w0=bitmap.width,h0=bitmap.height;
      if(!w0||!h0){try{bitmap.close();}catch(e){}throw new Error('no dims');}
      let w=w0,h=h0;
      if(w>h){h=Math.round(h0*maxSize/w0);w=maxSize;}
      else{w=Math.round(w0*maxSize/h0);h=maxSize;}
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(bitmap,0,0,w,h);
      try{bitmap.close();}catch(e){}
      return await new Promise(res=>canvas.toBlob(res,'image/jpeg',0.75));
    }catch(e){}
  }
  return new Promise((resolve)=>{
    const img=new Image();const url=URL.createObjectURL(file);
    const timeout=setTimeout(()=>{URL.revokeObjectURL(url);resolve(null);},10000);
    img.onload=()=>{
      clearTimeout(timeout);
      try{
        let w=img.width,h=img.height;
        if(w>h){h=Math.round(h*maxSize/w);w=maxSize;}
        else{w=Math.round(w*maxSize/h);h=maxSize;}
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        canvas.toBlob(blob=>{URL.revokeObjectURL(url);resolve(blob);},'image/jpeg',0.75);
      }catch(e){URL.revokeObjectURL(url);resolve(null);}
    };
    img.onerror=()=>{clearTimeout(timeout);URL.revokeObjectURL(url);resolve(null);};
    img.src=url;
  });
}

async function generateVideoThumbnail(file,maxSize=300){
  return new Promise((resolve)=>{
    const video=document.createElement('video');
    video.preload='auto';video.muted=true;video.playsInline=true;
    const url=URL.createObjectURL(file);
    let resolved=false;
    const finish=(val)=>{if(resolved)return;resolved=true;try{URL.revokeObjectURL(url);}catch(e){}try{video.removeAttribute('src');video.load();}catch(e){}resolve(val);};
    const timeout=setTimeout(()=>finish(null),12000);
    video.onloadedmetadata=()=>{
      try{
        const dur=video.duration;
        if(!isFinite(dur)||dur<=0){clearTimeout(timeout);finish(null);return;}
        video.currentTime=Math.max(0.1,Math.min(dur*0.25,dur-0.1));
      }catch(e){clearTimeout(timeout);finish(null);}
    };
    video.onseeked=()=>{
      try{
        const w=video.videoWidth,h=video.videoHeight;
        if(!w||!h){clearTimeout(timeout);finish(null);return;}
        const minSide=Math.min(w,h);
        const c=document.createElement('canvas');c.width=maxSize;c.height=maxSize;
        c.getContext('2d').drawImage(video,(w-minSide)/2,(h-minSide)/2,minSide,minSide,0,0,maxSize,maxSize);
        c.toBlob(b=>{clearTimeout(timeout);finish(b);},'image/jpeg',0.78);
      }catch(e){clearTimeout(timeout);finish(null);}
    };
    video.onerror=()=>{clearTimeout(timeout);finish(null);};
    video.src=url;try{video.load();}catch(e){}
  });
}

async function saveThumb(fileId,blob){if(!rootDir||!blob)return;try{const fh=await rootDir.getFileHandle(THUMB_PREFIX+fileId,{create:true});const wr=await fh.createWritable();await wr.write(blob);await wr.close();}catch(e){}}
async function getThumb(f){if(!rootDir)return null;try{const fh=await rootDir.getFileHandle(THUMB_PREFIX+f.fileId);return await fh.getFile();}catch(e){return null;}}
async function deleteThumb(fileId){if(!rootDir)return;try{await rootDir.removeEntry(THUMB_PREFIX+fileId);}catch(e){}}

function queueBgThumb(f){if(bgThumbQueue.find(x=>x.id===f.id))return;bgThumbQueue.push(f);processBgThumbQueue();}
async function processBgThumbQueue(){
  if(bgThumbRunning)return;bgThumbRunning=true;
  while(bgThumbQueue.length>0){
    const f=bgThumbQueue.shift();
    try{
      const existing=await getThumb(f);
      if(!existing&&(f.type==='image'||f.type==='video')){
        const file=await getFromOPFS(f.fileId)||f.blob;
        if(file){
          const thumb=f.type==='image'?await generateImageThumbnail(file):await generateVideoThumbnail(file);
          if(thumb)await saveThumb(f.fileId,thumb);
        }
      }
    }catch(e){}
    await nextMacrotask();
  }
  bgThumbRunning=false;
}

async function loadFolderPreview(folderId,tileEl){
  if(!folderPreviewEnabled)return;
  const cached=cacheGetPreview(folderPreviewCache,folderId);
  if(cached){applyFolderPreview(tileEl,cached);return;}
  try{
    const tx=db.transaction(SF,'readonly');const index=tx.objectStore(SF).index('folder');
    const files=await p(index.getAll(folderId));
    const valid=files.filter(f=>!f.deleted&&(f.type==='image'||f.type==='video')).slice(0,1);
    if(valid.length===0)return;
    const thumb=await getThumb(valid[0]);
    if(!thumb)return;
    const url=URL.createObjectURL(thumb);
    cacheSetPreview(folderPreviewCache,folderId,url);
    if(tileEl.isConnected)applyFolderPreview(tileEl,url);
  }catch(e){}
}
function applyFolderPreview(el,url){
  if(!el.isConnected)return;
  const prev=el.querySelector('.folder-preview');
  if(!prev||prev.querySelector('img'))return;
  const item=document.createElement('div');
  item.className='fp-item';
  item.innerHTML=`<img src="${url}" loading="lazy">`;
  prev.appendChild(item);
  el.classList.remove('no-preview');
  el.classList.add('has-preview');
}

async function loadTileImage(tileEl,f){
  if(!tileEl||!f)return;
  const imgEl=tileEl.querySelector('.tile-img');
  if(!imgEl)return;
  const skelEl=tileEl.querySelector('.skeleton');
  const cached=cacheGetPreview(filePreviewCache,f.fileId);
  if(cached){
    try{
      const probe=new Image();probe.src=cached;await probe.decode();
      if(!tileEl.isConnected)return;
      imgEl.src=cached;imgEl.classList.add('loaded');if(skelEl)skelEl.remove();
    }catch(e){
      imgEl.onload=()=>{imgEl.classList.add('loaded');if(skelEl)skelEl.remove();};
      imgEl.src=cached;
    }
    return;
  }
  try{
    let thumb=await getThumb(f);
    let hasFile=!!thumb;
    if(!thumb&&f.type==='video'&&!failedVideoThumbs.has(f.fileId)){
      const file=await getFileData(f);
      if(file){hasFile=true;thumb=await generateVideoThumbnail(file);if(thumb)await saveThumb(f.fileId,thumb);else failedVideoThumbs.add(f.fileId);}
    }
    if(!thumb&&f.type==='image'){
      const file=await getFileData(f);
      if(file){thumb=file;hasFile=true;queueBgThumb(f);}
    }
    if(!hasFile&&(f.type==='image'||f.type==='video')){tileEl.classList.add('broken');if(skelEl)skelEl.remove();return;}
    if(!thumb){if(skelEl)skelEl.remove();return;}
    if(!tileEl.isConnected)return;
    const url=URL.createObjectURL(thumb);
    cacheSetPreview(filePreviewCache,f.fileId,url);
    imgEl.onload=()=>{imgEl.classList.add('loaded');if(skelEl)skelEl.remove();};
    imgEl.onerror=()=>{if(skelEl)skelEl.remove();};
    imgEl.src=url;
  }catch(e){if(skelEl)skelEl.remove();}
}

function computeGridLayout(){
  const wrap=$('gridWrap');if(!wrap)return;
  const width=wrap.clientWidth;
  if(!width)return;
  const cols=3;
  const sidePad=16,topPad=16,gap=10;
  const contentWidth=width-sidePad*2;
  virtualState.cols=cols;
  const tileSize=(contentWidth-gap*(cols-1))/cols;
  virtualState.rowHeight=tileSize+gap;
  virtualState.paddingTop=topPad;
}

function createFolderTile(f){
  const el=document.createElement('div');
  el.className='tile folder no-preview'+(folderSel.has(f.id)?' sel':'')+(f.deleted?' trashed':'');
  el.dataset.id=f.id;el.dataset.type='folder';
  const folderColor=f.color||'var(--acc)';
  const fileCount=folderCountCache.get(f.id)||0;
  const countLabel=fileCount>999?'999+':String(fileCount);
  const countBadge=fileCount>0?`<div class="folder-count">${countLabel}</div>`:'';
  el.innerHTML=`<div class="folder-preview"></div><div class="body"><svg class="folder-svg" style="color:${folderColor};" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg><div class="lbl n">${escapeHtml(f.name)}</div></div>${countBadge}${f.deleted?'<div class="badge trash">Удалено</div>':''}<div class="chk"></div>`;
  return el;
}

function createFileTile(f){
  const el=document.createElement('div');
  el.className='tile'+(sel.has(f.id)?' sel':'')+(f.deleted?' trashed':'');
  el.dataset.id=f.id;el.dataset.type='file';el.dataset.fileId=f.id;
  const isVideo=f.type==='video',isImage=f.type==='image';
  let inner='';
  if(isImage||isVideo){
    const fallbackIcon=isVideo?ICONS.video:ICONS.image;
    const fallbackSize=isVideo?`<div class="lbl">${(f.size/1048576).toFixed(1)} МБ</div>`:'';
    const fallback=`<div class="body">${fallbackIcon}<div class="lbl n">${escapeHtml(f.name)}</div>${fallbackSize}</div>`;
    const overlay=isVideo?`<div class="video-play-overlay">${ICONS.play}</div>`:'';
    inner=`${fallback}<div class="skeleton"></div><img loading="lazy" class="tile-img">${overlay}`;
  }else{
    inner=`<div class="body">${ICONS.file}<div class="lbl n">${escapeHtml(f.name)}</div></div>`;
  }
  const favStar=f.fav?`<div class="fav-star">${ICONS.star}</div>`:'';
  el.innerHTML=`${favStar}${inner}${f.deleted?'<div class="badge trash">Удалено</div>':`<div class="badge">${TYPE_LABEL[f.type]||'Файл'}</div>`}<div class="chk"></div>`;
  return el;
}

function updateVirtualGrid(){
  if(isLocked)return;
  const items=virtualState.items;
  const wrap=$('gridWrap'),grid=$('grid');
  if(!wrap||!grid)return;
  if(!items.length){
    wrap.style.height='auto';
    grid.style.position='relative';
    grid.style.left='0';
    grid.style.right='0';
    grid.style.top='';
    grid.style.display='block';
    updateUI();
    return;
  }
  computeGridLayout();
  const {cols,rowHeight}=virtualState;
  if(!rowHeight)return;
  const totalRows=Math.ceil(items.length/cols);
  const totalHeight=virtualState.paddingTop*2+totalRows*rowHeight-10;
  wrap.style.height=totalHeight+'px';
  grid.style.display='grid';
  grid.style.position='absolute';
  grid.style.left='16px';
  grid.style.right='16px';
  const scrollY=window.scrollY,vh=window.innerHeight;
  const wrapTop=wrap.getBoundingClientRect().top+scrollY;
  const BUFFER=6;
  let firstRow=Math.floor((scrollY-wrapTop-virtualState.paddingTop)/rowHeight)-BUFFER;
  let lastRow=Math.ceil((scrollY-wrapTop+vh-virtualState.paddingTop)/rowHeight)+BUFFER;
  firstRow=Math.max(0,firstRow);
  lastRow=Math.min(totalRows-1,lastRow);
  if(lastRow<firstRow)lastRow=firstRow;
  const startIndex=firstRow*cols;
  const endIndex=Math.min(items.length,(lastRow+1)*cols);
  grid.style.top=(virtualState.paddingTop+firstRow*rowHeight)+'px';
  const [prevStart,prevEnd]=virtualState.lastRange;
  if(prevStart===startIndex&&prevEnd===endIndex)return;
  virtualState.lastRange=[startIndex,endIndex];
  const existing=new Map();
  for(const child of grid.children){
    const id=child.dataset.id;
    if(id)existing.set(id+':'+child.dataset.type,child);
  }
  const newTiles=[];
const frag=document.createDocumentFragment();
for(let i=startIndex;i<endIndex;i++){
  const item=items[i];
  const key=String(item.id)+':'+(item._isFolder?'folder':'file');
  let el=existing.get(key);
  if(el){
    existing.delete(key);
    el.classList.toggle('sel',item._isFolder?folderSel.has(item.id):sel.has(item.id));

    const lbl=el.querySelector('.lbl.n');
    if(lbl&&lbl.textContent!==item.name)lbl.textContent=item.name;

    if(item._isFolder){
      const svg=el.querySelector('.folder-svg');
      if(svg)svg.style.color=item.color||'var(--acc)';
    }

    const hasStar=!!el.querySelector('.fav-star');
    if(item.fav&&!hasStar){
      el.insertAdjacentHTML('afterbegin',`<div class="fav-star">${ICONS.star}</div>`);
    }else if(!item.fav&&hasStar){
      const s=el.querySelector('.fav-star');
      if(s)s.remove();
    }

    const trashBadge=el.querySelector('.badge.trash');
    if(item.deleted&&!trashBadge){
      el.classList.add('trashed');
      const normalBadge=el.querySelector('.badge:not(.trash)');
      if(normalBadge)normalBadge.remove();
      el.insertAdjacentHTML('beforeend','<div class="badge trash">Удалено</div>');
    }else if(!item.deleted&&trashBadge){
      el.classList.remove('trashed');
      trashBadge.remove();
      if(!item._isFolder){
        el.insertAdjacentHTML('beforeend',`<div class="badge">${TYPE_LABEL[item.type]||'Файл'}</div>`);
      }
    }
  }else{
    el=item._isFolder?createFolderTile(item):createFileTile(item);
    newTiles.push({el,item});
  }
  frag.appendChild(el);
}
  grid.innerHTML='';
  grid.appendChild(frag);
  for(const {el,item} of newTiles){
    if(item._isFolder){if(folderPreviewEnabled)loadFolderPreview(item.id,el);}
    else loadTileImage(el,item);
  }
  updateUI();
}

$('slideshowIntRange').oninput=e=>{
  const sec=Number(e.target.value);
  $('slideshowIntVal').textContent=sec+' сек';
  slideshowInterval=sec*1000;
  if(slideshowActive&&slideshowTimer){
    clearTimeout(slideshowTimer);
    const f=galleryFiles[currentGalleryIndex];
    if(f&&f.type!=='video')scheduleSlideshowNext(f);
  }
};
$('slideshowIntRange').onchange=async e=>{await setSetting('slideshowInterval',Number(e.target.value)*1000);};

async function getTrashAutoDays(){const v=await getSetting('trashAutoDays');return v===null||v===undefined?DEFAULT_TRASH_DAYS:Number(v);}
async function setTrashAutoDays(days){
  await setSetting('trashAutoDays',Number(days));
  updateTrashAutoPillsUI(days);
  await autoCleanTrash();
  toast(days===0?'Автоочистка выкл.':'Готово',days===0?'Корзина не будет очищаться':`Автоочистка через ${days} дн.`);
}
function updateTrashAutoPillsUI(d){document.querySelectorAll('#trashAutoPills .pill').forEach(p=>p.classList.toggle('sel',Number(p.dataset.val)===Number(d)));}
document.querySelectorAll('#trashAutoPills .pill').forEach(p=>{p.onclick=()=>setTrashAutoDays(Number(p.dataset.val));});

async function initOPFS(){
  if(navigator.storage&&navigator.storage.getDirectory){
    try{rootDir=await navigator.storage.getDirectory();if(navigator.storage.persist)await navigator.storage.persist();}
    catch(e){rootDir=null;}
  }
}

async function cleanupOrphans(){
  if(!rootDir)return;
  try{
    const allFiles=await p(st(SF,'readonly').getAll());
    const validIds=new Set();
    for(const f of allFiles){validIds.add(f.fileId);validIds.add(THUMB_PREFIX+f.fileId);}
    const names=[];
    for await(const name of rootDir.keys())names.push(name);
    for(const name of names){
      if(!validIds.has(name)){
        try{await rootDir.removeEntry(name);}catch(e){}
      }
    }
  }catch(e){}
}

async function cleanupPendingWrites(){
  try{
    const pending=await getSetting('pendingWrites');
    if(!pending||!Array.isArray(pending)||pending.length===0)return;
    for(const fileId of pending){
      try{await deleteFromOPFS(fileId);}catch(e){}
      try{await deleteThumb(fileId);}catch(e){}
    }
    await setSetting('pendingWrites',[]);
  }catch(e){}
}

async function addPendingWrite(fileId){
  try{
    const pending=await getSetting('pendingWrites')||[];
    if(!pending.includes(fileId)){pending.push(fileId);await setSetting('pendingWrites',pending);}
  }catch(e){}
}
async function removePendingWrite(fileId){
  try{
    let pending=await getSetting('pendingWrites')||[];
    pending=pending.filter(id=>id!==fileId);
    await setSetting('pendingWrites',pending);
  }catch(e){}
}

async function getFromOPFS(fileId){if(!rootDir)return null;try{const fh=await rootDir.getFileHandle(fileId);return await fh.getFile();}catch(e){return null;}}
async function deleteFromOPFS(fileId){if(!rootDir)return;try{await rootDir.removeEntry(fileId);}catch(e){}}
function generateId(){return Date.now().toString(36)+Math.random().toString(36).substring(2,10);}

async function calculateHash(file){
  if(file.size===0)return 'empty_'+generateId();
  try{
    const chunkSize=256*1024;let combined;
    if(file.size<=chunkSize*5)combined=new Uint8Array(await file.arrayBuffer());
    else{
      const offsets=[0,Math.floor(file.size*0.25),Math.floor(file.size*0.5),Math.floor(file.size*0.75),file.size-chunkSize];
      const chunks=[];
      for(const off of offsets){const blob=file.slice(off,off+chunkSize);chunks.push(new Uint8Array(await blob.arrayBuffer()));}
      combined=new Uint8Array(chunks.reduce((s,c)=>s+c.length,0));
      let off=0;for(const c of chunks){combined.set(c,off);off+=c.length;}
    }
    if(window.crypto&&window.crypto.subtle){
      const hb=await crypto.subtle.digest('SHA-256',combined);
      return Array.from(new Uint8Array(hb)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    let hash=2166136261;for(let i=0;i<combined.length;i++){hash^=combined[i];hash=Math.imul(hash,16777619);}
    return 'hash_'+file.size+'_'+(hash>>>0).toString(16);
  }catch(e){return 'unique_'+generateId();}
}

async function saveToOPFSChunked(fileId,file){
  if(!rootDir)return false;
  try{
    await addPendingWrite(fileId);
    const fh=await rootDir.getFileHandle(fileId,{create:true});
    const wr=await fh.createWritable();
    const reader=file.stream().getReader();
    let bw=0,cy=0,ly=0;
    while(true){
      if(isAppInBackground){await new Promise(r=>setTimeout(r,1000));continue;}
      const {done,value}=await reader.read();if(done)break;
      await wr.write(value);bw+=value.length;cy++;
      if(cy>=4||bw===file.size){
        cy=0;const now=Date.now();
        if(now-ly>150||bw===file.size){ly=now;showProgress('Сохранение',Math.round((bw/file.size)*100),file.name,`${(bw/1048576).toFixed(1)} / ${(file.size/1048576).toFixed(1)} МБ`);await nextMacrotask();}
      }
    }
    await wr.close();
    await removePendingWrite(fileId);
    return true;
  }catch(e){try{await deleteFromOPFS(fileId);}catch(_){}await removePendingWrite(fileId);return false;}
}

async function writeDataToOPFS(fileId,data){
  if(!rootDir)return false;
  try{
    await addPendingWrite(fileId);
    const fh=await rootDir.getFileHandle(fileId,{create:true});const wr=await fh.createWritable();
    const CHUNK=4*1024*1024;
    if(data.length<=CHUNK)await wr.write(data);
    else for(let off=0;off<data.length;off+=CHUNK){await wr.write(data.subarray(off,Math.min(off+CHUNK,data.length)));await nextMacrotask();}
    await wr.close();
    await removePendingWrite(fileId);
    return true;
  }catch(e){try{await deleteFromOPFS(fileId);}catch(_){}await removePendingWrite(fileId);return false;}
}

function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);
    r.onupgradeneeded=e=>{
      const d=e.target.result,tx=e.target.transaction;
      if(!d.objectStoreNames.contains(SF)){const s=d.createObjectStore(SF,{keyPath:'id',autoIncrement:true});s.createIndex('folder','folderId');s.createIndex('type','type');}
      if(d.objectStoreNames.contains(SF)){const s=tx.objectStore(SF);if(!s.indexNames.contains('hash'))s.createIndex('hash','hash');}
      if(!d.objectStoreNames.contains(SFL)){const s=d.createObjectStore(SFL,{keyPath:'id',autoIncrement:true});s.createIndex('parent','parentId');}
      if(!d.objectStoreNames.contains(SS)){d.createObjectStore(SS,{keyPath:'key'});}
    };
    r.onsuccess=e=>{db=e.target.result;res();};
    r.onerror=e=>rej(e.target.error);
  });
}
const st=(n,m)=>db.transaction(n,m).objectStore(n);
const p=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});

async function getAllFiles(force=false){
  if(!force&&_filesCache&&Date.now()-_filesCacheTime<DB_CACHE_TTL)return _filesCache;
  _filesCache=await p(st(SF,'readonly').getAll());
  _filesCacheTime=Date.now();
  return _filesCache;
}
async function getAllFolders(force=false){
  if(!force&&_foldersCache&&Date.now()-_foldersCacheTime<DB_CACHE_TTL)return _foldersCache;
  _foldersCache=await p(st(SFL,'readonly').getAll());
  _foldersCacheTime=Date.now();
  return _foldersCache;
}
function invalidateCache(){_filesCache=null;_foldersCache=null;}

async function addFile(file,hash){
  const fileId=generateId();const type=detectType(file);
  const record={fileId,name:file.name||'Файл',type,mime:file.type||'',size:file.size,date:Date.now(),importedAt:Date.now(),folderId:currentFolder,hash,deleted:false,deletedAt:null,fav:false};
  if(!rootDir){record.blob=file;const res=await p(st(SF,'readwrite').add(record));invalidateCache();return res;}
  const success=await saveToOPFSChunked(fileId,file);
  if(!success)throw new Error('Не удалось сохранить файл на диск');
  if(type==='image'||type==='video'){
    try{const tb=type==='image'?await generateImageThumbnail(file):await generateVideoThumbnail(file);if(tb)await saveThumb(fileId,tb);}catch(e){}
  }
  const res=await p(st(SF,'readwrite').add(record));
  invalidateCache();
  return res;
}
async function getFileData(f){let raw=null;if(rootDir)raw=await getFromOPFS(f.fileId);if(!raw)raw=f.blob;return raw;}
async function addFolder(name,parent,color){
  const res=await p(st(SFL,'readwrite').add({name,parentId:parent??null,date:Date.now(),color:color||FOLDER_COLORS[0],deleted:false,deletedAt:null}));
  invalidateCache();
  return res;
}
function detectType(file){
  const mime=(file.type||'').toLowerCase(),name=(file.name||'').toLowerCase();
  const ext=(name.match(/\.([a-z0-9]+)$/)||[])[1]||'';
  if(mime.startsWith('image/')||/^(jpg|jpeg|png|gif|webp|bmp|heic|heif|avif|svg)$/.test(ext))return 'image';
  if(mime.startsWith('video/')||/^(mp4|webm|mov|avi|mkv|m4v|3gp|flv|wmv)$/.test(ext))return 'video';
  return 'other';
}
const TYPE_LABEL={image:'Фото',video:'Видео'};

async function moveToTrash(fileIds,folderIds){
  const now=Date.now();
  const allFolders=await getAllFolders(),allFiles=await getAllFiles();
  const folderIdSet=new Set(folderIds);
  let ch=true;
  while(ch){ch=false;for(const f of allFolders)if(f.parentId!=null&&folderIdSet.has(f.parentId)&&!folderIdSet.has(f.id)){folderIdSet.add(f.id);ch=true;}}
  const fileIdSet=new Set(fileIds);
  for(const f of allFiles)if(!f.deleted&&f.folderId!=null&&folderIdSet.has(f.folderId))fileIdSet.add(f.id);
  if(fileIdSet.size>0)await new Promise((res,rej)=>{
    const tx=db.transaction(SF,'readwrite');const store=tx.objectStore(SF);
    for(const id of fileIdSet){const req=store.get(id);req.onsuccess=()=>{const v=req.result;if(v&&!v.deleted){v.deleted=true;v.deletedAt=now;store.put(v);}};}
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
  if(folderIdSet.size>0)await new Promise((res,rej)=>{
    const tx=db.transaction(SFL,'readwrite');const store=tx.objectStore(SFL);
    for(const id of folderIdSet){const req=store.get(id);req.onsuccess=()=>{const v=req.result;if(v&&!v.deleted){v.deleted=true;v.deletedAt=now;store.put(v);}};}
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
  invalidateCache();
}

async function restoreFromTrash(fileIds,folderIds){
  if(fileIds.length>0)await new Promise((res,rej)=>{
    const tx=db.transaction(SF,'readwrite');const store=tx.objectStore(SF);
    for(const id of fileIds){const req=store.get(id);req.onsuccess=()=>{const v=req.result;if(v&&v.deleted){v.deleted=false;v.deletedAt=null;store.put(v);}};}
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
  if(folderIds.length>0)await new Promise((res,rej)=>{
    const tx=db.transaction(SFL,'readwrite');const store=tx.objectStore(SFL);
    for(const id of folderIds){const req=store.get(id);req.onsuccess=()=>{const v=req.result;if(v&&v.deleted){v.deleted=false;v.deletedAt=null;store.put(v);}};}
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
  invalidateCache();
}

async function deletePermanent(fileIds,folderIds){
  if($('viewerModal').dataset.url){URL.revokeObjectURL($('viewerModal').dataset.url);delete $('viewerModal').dataset.url;}
  const allFiles=await getAllFiles(),allFolders=await getAllFolders();
  const folderIdSet=new Set(folderIds);
  let changed=true;
  while(changed){changed=false;for(const f of allFolders)if(f.parentId!=null&&folderIdSet.has(f.parentId)&&!folderIdSet.has(f.id)){folderIdSet.add(f.id);changed=true;}}
  const allFileIdSet=new Set(fileIds);
  for(const f of allFiles)if(f.folderId!=null&&folderIdSet.has(f.folderId))allFileIdSet.add(f.id);
  const filesToDelete=allFiles.filter(f=>allFileIdSet.has(f.id));
  for(const f of filesToDelete)cacheRemovePreview(filePreviewCache,f.fileId);
  for(const id of folderIdSet)cacheRemovePreview(folderPreviewCache,id);
  const CONCURRENCY=6;
  for(let i=0;i<filesToDelete.length;i+=CONCURRENCY){
    const batch=filesToDelete.slice(i,i+CONCURRENCY);
    await Promise.all(batch.map(f=>Promise.all([deleteFromOPFS(f.fileId).catch(()=>{}),deleteThumb(f.fileId).catch(()=>{})])));
    checkAbort();
  }
  if(allFileIdSet.size>0)await new Promise((res,rej)=>{
    const tx=db.transaction(SF,'readwrite');const store=tx.objectStore(SF);
    allFileIdSet.forEach(id=>store.delete(id));
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
  if(folderIdSet.size>0)await new Promise((res,rej)=>{
    const tx=db.transaction(SFL,'readwrite');const store=tx.objectStore(SFL);
    folderIdSet.forEach(id=>store.delete(id));
    tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);
  });
  invalidateCache();
}

async function emptyTrash(){
  const [files,folders]=await Promise.all([getAllFiles(),getAllFolders()]);
  const fids=files.filter(f=>f.deleted).map(f=>f.id);
  const dids=folders.filter(f=>f.deleted).map(f=>f.id);
  if(!fids.length&&!dids.length)return toast('Корзина пуста','');
  if(!await showConfirm('Очистка корзины',`Удалить навсегда: <b>${fids.length}</b> файл. и <b>${dids.length}</b> пап.?`))return;
  showProgress('Очистка корзины',0,'Удаление файлов...','',true);
  try{await deletePermanent(fids,dids);playSound('delete');hideProgress();await refresh();toast('Готово','Корзина очищена');}
  catch(e){hideProgress();toast('Ошибка',e.message||'Не удалось очистить корзину',true);}
}

async function autoCleanTrash(){
  const daysVal=await getTrashAutoDays();if(daysVal===0)return;
  const ms=daysVal*24*60*60*1000;
  const files=await getAllFiles(),folders=await getAllFolders();
  const oldFiles=files.filter(f=>f.deleted&&f.deletedAt&&(Date.now()-f.deletedAt>ms)).map(f=>f.id);
  const oldFolders=folders.filter(f=>f.deleted&&f.deletedAt&&(Date.now()-f.deletedAt>ms)).map(f=>f.id);
  if(oldFiles.length||oldFolders.length){try{await deletePermanent(oldFiles,oldFolders);}catch(e){}}
}

window.findDuplicates=async()=>{
  const files=await getAllFiles();const active=files.filter(f=>!f.deleted);
  showProgress('Поиск дубликатов',0,'Анализ...','',true);
  let processed=0;
  for(let i=0;i<active.length;i++){
    const f=active[i];
    if(!f.hash || f.hash.startsWith('unique_') || f.hash.startsWith('hash_')){
      try{
        const data = await getFileData(f);
        if(data){
          f.hash = await calculateHash(data);
          const s = st(SF,'readwrite');
          const v = await p(s.get(f.id));
          if(v){ v.hash = f.hash; await p(s.put(v)); }
        }
      }catch(e){}
    }
    processed++;
    if(processed%10===0) showProgress('Поиск дубликатов',Math.round(processed/active.length*100),f.name,'',true);
  }
  hideProgress();
  const bySize={};active.forEach(f=>{const s=f.size||0;if(!bySize[s])bySize[s]=[];bySize[s].push(f);});
  const duplicates=[];
  for(const group of Object.values(bySize).filter(g=>g.length>1)){
    const byHash={};
    for(const f of group){if(!f.hash||f.hash.startsWith('unique_'))continue;if(!byHash[f.hash])byHash[f.hash]=[];byHash[f.hash].push(f);}
    for(const hg of Object.values(byHash))if(hg.length>1)duplicates.push(hg);
  }
  const res=$('dupResult');
  if(duplicates.length===0){res.innerHTML='<div style="text-align:center;padding:40px 0;color:var(--mut);">Дубликатов не найдено</div>';$('btnDupDelete').style.display='none';}
  else{
    const totalWasted=duplicates.reduce((s,g)=>s+g.slice(1).reduce((ss,f)=>ss+(f.size||0),0),0);
    let html=`<div style="padding:12px 16px;background:var(--card);border-radius:12px;margin-bottom:12px;font-size:13px;">Найдено <b>${duplicates.length}</b> групп дубликатов.<br>Можно освободить <b style="color:var(--acc);">${(totalWasted/1048576).toFixed(2)} МБ</b>.</div><div style="max-height:50vh;overflow-y:auto;">`;
    duplicates.forEach((g,idx)=>{
      html+=`<div style="padding:12px;background:var(--card);border:1px solid var(--bd);border-radius:12px;margin-bottom:8px;"><div style="font-weight:700;font-size:13px;margin-bottom:6px;">Группа ${idx+1} (${g.length} файл.)</div>`;
      g.forEach((f,i)=>{
        html+=`<div class="dup-file-row" onclick="openDupGallery([${g.map(x=>x.id).join(',')}], ${f.id})" style="opacity:${i===0?1:0.6};"><span style="color:${i===0?'var(--txt)':'var(--mut)'};">${i===0?ICONS.checkSmall:ICONS.trashSmall}${escapeHtml(f.name)}</span><span style="flex-shrink:0;margin-left:8px;">${(f.size/1048576).toFixed(2)} МБ</span></div>`;
      });
      html+=`</div>`;
    });
    html+=`</div>`;
    res.innerHTML=html;
    $('btnDupDelete').style.display='block';
    $('btnDupDelete').onclick=async()=>{
      if(!await showConfirm('Удаление',`Удалить <b>${duplicates.length}</b> групп дубликатов?`))return;
      showProgress('Удаление',0,'Удаление...','',true);
      const toDelete=[];duplicates.forEach(g=>{g.slice(1).forEach(f=>toDelete.push(f.id));});
      try{await deletePermanent(toDelete,[]);playSound('delete');hideProgress();$('modalDuplicates').classList.remove('on');await refresh();toast('Готово',`Удалено ${toDelete.length} файлов`);}
      catch(e){hideProgress();toast('Ошибка',e.message||'Не удалось удалить дубликаты',true);}
    };
  }
  $('modalDuplicates').style.zIndex='10005';$('modalDuplicates').classList.add('on');
};

window.openDupGallery=async(fileIds,clickedId)=>{
  const files=await getAllFiles();
  galleryFiles=fileIds.map(id=>files.find(x=>x.id===id)).filter(f=>f&&!f.deleted);
  const idx=galleryFiles.findIndex(x=>x.id===clickedId);
  currentGalleryIndex=idx!==-1?idx:0;
  if(galleryFiles.length===0)return toast('Ошибка','Файлы не найдены',true);
  $('modalDuplicates').classList.remove('on');
  $('viewerDelete').style.display='flex';
  renderViewer();
};

window.hardResetDB=async()=>{
  if(!await showConfirm('ВНИМАНИЕ!','Все данные будут <b>удалены навсегда</b>. Продолжить?','Удалить','Отмена'))return;
  showProgress('Сброс',50,'Очистка...','',true);
  try{
    if(db)db.close();
    cacheClearAll();
    invalidateCache();
    if(rootDir){const names=[];for await(const name of rootDir.keys())names.push(name);for(const name of names)await rootDir.removeEntry(name);}
    const req=indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess=()=>{if('caches' in window)caches.keys().then(names=>names.forEach(n=>caches.delete(n)));localStorage.clear();sessionStorage.clear();showConfirm('Готово','База очищена. Приложение перезагрузится.').then(()=>location.reload());};
    req.onerror=()=>{showConfirm('Ошибка','Не удалось очистить базу.').then(()=>location.reload());};
  }catch(e){location.reload();}
};

window.resetSettings=async()=>{
  if(!await showConfirm('Сброс настроек','Вернуть все настройки к значениям по умолчанию?<br><br>Файлы, папки и PIN-код останутся как есть.','Сбросить','Отмена'))return;
  try{
    const all=await p(st(SS,'readonly').getAll());
    const tx=db.transaction(SS,'readwrite');
    const store=tx.objectStore(SS);
    for(const s of all){
      if(['pinHash','pinSalt','pinEnabled','pendingWrites'].includes(s.key))continue;
      store.delete(s.key);
    }
    await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});
    settingsCache=null;
    await loadTheme();
    await restoreState();
    await refresh();
    playSound('success');
    toast('Готово','Настройки сброшены');
  }catch(e){toast('Ошибка',e.message||'Не удалось сбросить настройки',true);}
};

async function hashPassword(password,saltHex){
  return pbkdf2Run('hash',password,saltHex,100000);
}
function generateSalt(){const arr=new Uint8Array(16);crypto.getRandomValues(arr);return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');}

function updatePinDots(){
  document.querySelectorAll('#pinDots .pin-dot').forEach((d,i)=>{
    d.classList.toggle('filled',i<enteredPin.length);
  });
}

async function verifyPin(){
  try{
    const s=await getAllSettings();
    if(!s.pinHash||!s.pinSalt){unlockApp();return;}
    const h=await hashPassword(enteredPin,s.pinSalt);
    if(h===s.pinHash){
      isLocked=false;
      $('lockScreen').style.display='none';
      enteredPin='';
      updatePinDots();
      $('pinError').textContent='';
      virtualState.lastRange=[-1,-1];
      playSound('success');
      await refresh();
    }else{
      const dots=$('pinDots');
      dots.classList.add('shake');
      $('pinError').textContent='Неверный PIN';
      playSound('error');
      setTimeout(()=>{
        enteredPin='';
        updatePinDots();
        dots.classList.remove('shake');
        $('pinError').textContent='';
      },600);
    }
  }finally{
    isPinVerifying=false;
  }
}

async function handlePinDigit(d){
  if(isPinVerifying||!isLocked)return;
  $('pinError').textContent='';
  if(d==='back'){enteredPin=enteredPin.slice(0,-1);updatePinDots();return;}
  if(enteredPin.length>=4)return;
  enteredPin+=d;
  updatePinDots();
  playSound('click');
  if(enteredPin.length===4){
    isPinVerifying=true;
    await verifyPin();
  }
}

$('pinPad').addEventListener('click',(e)=>{
  const btn=e.target.closest('.pin-key[data-pin]');
  if(!btn)return;
  handlePinDigit(btn.dataset.pin);
});

async function checkLock(){
  const s=await getAllSettings();
  if(s.pinEnabled&&s.pinHash&&s.pinSalt){
    isLocked=true;
    enteredPin='';
    updatePinDots();
    $('pinError').textContent='';
    $('lockScreen').style.display='flex';
  }else{
    unlockApp();
  }
}

async function unlockApp(){
  isLocked=false;
  $('lockScreen').style.display='none';
  virtualState.lastRange=[-1,-1];
  refresh();
}

window.togglePin=async()=>{
  const enabled=await getSetting('pinEnabled');
  if(enabled){
    if(!await showConfirm('Отключить PIN','Убрать защиту PIN-кодом?<br><br>При следующем запуске приложение откроется без PIN.','Отключить','Отмена'))return;
    await setSetting('pinEnabled',false);
    await setSetting('pinHash',null);
    await setSetting('pinSalt',null);
    $('swPin').classList.remove('on');
    $('btnChangePin').style.display='none';
    playSound('success');
    toast('PIN отключён','');
  }else{
    openPinChange('set');
  }
};

window.openPinChange=(mode)=>{
  pinChangeMode=mode||'change';
  $('pinChangeTitle').textContent=pinChangeMode==='set'?'Установить PIN':'Смена PIN';
  $('pinCurrentWrap').style.display=pinChangeMode==='change'?'block':'none';
  $('pinCurrent').value='';
  $('pinNew').value='';
  $('pinConfirm').value='';
  $('pinChangeErr').textContent='';
  $('modalPinChange').classList.add('on');
  setTimeout(()=>(pinChangeMode==='change'?$('pinCurrent'):$('pinNew')).focus(),150);
};

$('pinChangeCancel').onclick=()=>$('modalPinChange').classList.remove('on');

$('pinChangeOk').onclick=async()=>{
  const errEl=$('pinChangeErr');
  errEl.textContent='';
  const s=await getAllSettings();
  if(pinChangeMode==='change'){
    const cur=$('pinCurrent').value.trim();
    if(!cur){errEl.textContent='Введите текущий PIN';return;}
    if(!s.pinHash||!s.pinSalt){errEl.textContent='PIN не установлен';return;}
    const h=await hashPassword(cur,s.pinSalt);
    if(h!==s.pinHash){errEl.textContent='Неверный текущий PIN';playSound('error');return;}
  }
  const newPin=$('pinNew').value.trim();
  const confirmPin=$('pinConfirm').value.trim();
  if(!/^\d{4}$/.test(newPin)){errEl.textContent='PIN должен состоять из 4 цифр';playSound('error');return;}
  if(newPin!==confirmPin){errEl.textContent='PIN-коды не совпадают';playSound('error');return;}
  const salt=generateSalt();
  const hash=await hashPassword(newPin,salt);
  await setSetting('pinHash',hash);
  await setSetting('pinSalt',salt);
  await setSetting('pinEnabled',true);
  $('swPin').classList.add('on');
  $('btnChangePin').style.display='flex';
  $('modalPinChange').classList.remove('on');
  playSound('success');
  toast('Готово',pinChangeMode==='set'?'PIN установлен':'PIN изменён');
};

$('pinNew').addEventListener('input',(e)=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4);});
$('pinConfirm').addEventListener('input',(e)=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4);});
$('pinCurrent').addEventListener('input',(e)=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4);});

function getSelectedFilesSize(){
  let total=0;const source=viewMode==='trash'?trashFilesCache:currentFilesCache;
  for(const id of sel){const f=source.find(x=>x.id===id);if(f)total+=(f.size||0);}
  return total;
}
function toggleFileSelection(id,tileEl){if(sel.has(id)){sel.delete(id);tileEl.classList.remove('sel');playSound('deselect');}else{sel.add(id);tileEl.classList.add('sel');playSound('select');}}
function toggleFolderSelection(id,tileEl){if(folderSel.has(id)){folderSel.delete(id);tileEl.classList.remove('sel');playSound('deselect');}else{folderSel.add(id);tileEl.classList.add('sel');playSound('select');}}

async function writeBlobToCacheChunked(blob,cachePath,onProgress){
  const {Filesystem}=window.Capacitor.Plugins;
  const CHUNK_SIZE=4*1024*1024;const total=blob.size;
  try{await Filesystem.deleteFile({path:cachePath,directory:'CACHE'});}catch(e){}
  let offset=0,isFirst=true;
  while(offset<total){
    const end=Math.min(offset+CHUNK_SIZE,total);
    const base64=await blobToBase64(blob.slice(offset,end));
    if(isFirst){await Filesystem.writeFile({path:cachePath,data:base64,directory:'CACHE',recursive:true});isFirst=false;}
    else await Filesystem.appendFile({path:cachePath,data:base64,directory:'CACHE'});
    offset=end;if(onProgress)onProgress(offset/total);await new Promise(r=>setTimeout(r,0));
  }
}

async function downloadFileSafe(file,filename){
  if(isCapacitorNative()){
    try{
      const {Filesystem,Share}=window.Capacitor.Plugins;
      const safeName=String(filename||'file').replace(/[\/\\:*?"<>|]/g,'_');
      const cachePath=`krypta_${Date.now()}_${safeName}`;
      showProgress('Сохранение',0,safeName,'Подготовка...',true);
      await writeBlobToCacheChunked(file,cachePath,(pct)=>{showProgress('Сохранение',Math.round(pct*100),safeName,`${Math.round(pct*100)}%`);});
      const {uri}=await Filesystem.getUri({path:cachePath,directory:'CACHE'});
      hideProgress();
      try{await Share.share({title:safeName,files:[uri],url:uri,dialogTitle:'Сохранить файл'});}
      catch(shareErr){await Share.share({title:safeName,url:uri,dialogTitle:'Сохранить файл'});}
      toast('Готово','Выберите «Сохранить в Загрузки» или приложение');
      return true;
    }catch(e){hideProgress();toast('Ошибка','Не удалось сохранить: '+(e.message||e),true);return false;}
  }
  const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if(window.showSaveFilePicker&&!isMobile){
    try{
      const handle=await window.showSaveFilePicker({suggestedName:filename});
      const writable=await handle.createWritable();
      const reader=file.stream().getReader();
      let written=0;const total=file.size;let lastUpdate=0;
      showProgress('Скачивание',0,filename,`0 / ${(total/1048576).toFixed(1)} МБ`,true);
      while(true){
        const {done,value}=await reader.read();if(done)break;
        await writable.write(value);written+=value.length;
        const now=Date.now();
        if(now-lastUpdate>200){lastUpdate=now;showProgress('Скачивание',Math.round(written/total*100),filename,`${(written/1048576).toFixed(1)} / ${(total/1048576).toFixed(1)} МБ`);await nextMacrotask();}
      }
      await writable.close();hideProgress();return true;
    }catch(e){hideProgress();if(e.name==='AbortError')return false;}
  }
  try{
    const url=URL.createObjectURL(file);
    const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{try{document.body.removeChild(a);}catch(e){}try{URL.revokeObjectURL(url);}catch(e){}},2000);
    return true;
  }catch(e){return false;}
}

function openFile(f){
  if(isLocked)return;
  playSound('open');
  $('viewerDelete').style.display='none';
  getFilesForGallery().then(()=>{
    const idx=galleryFiles.findIndex(x=>x.id===f.id);
    currentGalleryIndex=idx!==-1?idx:0;
    if(idx===-1)galleryFiles=[f];
    renderViewer();
  });
}
function getFilesForGallery(){
  return new Promise(async resolve=>{
    const files=await getAllFiles();let cur;
    if(searchQuery&&searchScope==='all'){
      cur=files.filter(x=>!x.deleted&&(x.type==='image'||x.type==='video'));
      const q=searchQuery.toLowerCase();
      cur=cur.filter(x=>x.name.toLowerCase().includes(q));
    }else{
      cur=files.filter(x=>!x.deleted&&x.folderId===currentFolder&&(x.type==='image'||x.type==='video'));
      if(searchQuery){const q=searchQuery.toLowerCase();cur=cur.filter(x=>x.name.toLowerCase().includes(q));}
    }
    sortList(cur);galleryFiles=cur;resolve();
  });
}
function stopSlideshow(){if(slideshowTimer){clearTimeout(slideshowTimer);slideshowTimer=null;}slideshowActive=false;const btn=$('viewerSlideshow');if(btn){btn.innerHTML=ICONS.play;btn.classList.remove('active');}}
function scheduleSlideshowNext(f){
  if(!slideshowActive)return;if(f.type==='video')return;
  slideshowTimer=setTimeout(()=>{
    if(!slideshowActive)return;
    if(currentGalleryIndex<galleryFiles.length-1)slide('left');else stopSlideshow();
  },slideshowInterval);
}
async function renderViewer(){
  const myToken=++viewerToken;
  const f=galleryFiles[currentGalleryIndex];if(!f)return;
  const modal=$('viewerModal'),content=$('viewerContent'),title=$('viewerTitle');
  const file=await getFileData(f);
  if(myToken!==viewerToken)return;
  if(!file){content.innerHTML=`<div style="color:#fff;text-align:center;padding:20px;">Файл не найден</div>`;modal.classList.add('on');return;}
  title.textContent=f.name;
  if(modal.dataset.url){URL.revokeObjectURL(modal.dataset.url);delete modal.dataset.url;}
  const url=URL.createObjectURL(file);modal.dataset.url=url;
  currentScale=1;
  content.innerHTML='';modal.classList.add('on');
  const container=document.createElement('div');
  container.className='swipe-container';container.id='swipe';
  if(f.type==='image'){const img=document.createElement('img');img.src=url;container.appendChild(img);if(slideshowActive)scheduleSlideshowNext(f);}
  else{
    const video=document.createElement('video');
    video.src=url;video.controls=true;video.autoplay=true;video.playsInline=true;
    video.setAttribute('preload','metadata');video.style.maxWidth='100%';video.style.maxHeight='100%';
    video.onended=()=>{if(slideshowActive){if(currentGalleryIndex<galleryFiles.length-1)slide('left');else stopSlideshow();}};
    container.appendChild(video);
  }
  content.appendChild(container);
  initSwipe();
}

$('viewerModal').addEventListener('pointerdown', async (e) => {
  const btn = e.target.closest('button.btn-action');
  if (!btn) return;
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  const id = btn.id;
  const f = galleryFiles[currentGalleryIndex];

  if (id === 'viewerClose') {
    viewerToken++; slideToken++; stopSlideshow();
    $('viewerModal').classList.remove('on');
    $('viewerContent').innerHTML = '';
    $('viewerDelete').style.display = 'none';
    if ($('viewerModal').dataset.url) {
      URL.revokeObjectURL($('viewerModal').dataset.url);
      delete $('viewerModal').dataset.url;
    }
    return;
  }

  if (id === 'viewerSlideshow') {
    if (slideshowActive) {
      stopSlideshow();
      toast('Слайдшоу', 'Остановлено');
    } else {
      slideshowActive = true;
      const b = $('viewerSlideshow');
      b.innerHTML = ICONS.pause;
      b.classList.add('active');
      if (f) {
        if (f.type === 'video') toast('Слайдшоу', 'Начнётся после видео');
        else {
          scheduleSlideshowNext(f);
          toast('Слайдшоу', `Интервал ${slideshowInterval / 1000} сек`);
        }
      }
    }
    return;
  }

  if (!f) return;

  if (id === 'viewerDownload') {
    try {
      const file = await getFileData(f);
      if (!file) { toast('Ошибка', 'Файл не найден на диске', true); return; }
      const ok = await downloadFileSafe(file, f.name);
      if (ok) toast('Скачивание', f.name);
      else toast('Отменено', '', false);
    } catch (err) {
      toast('Ошибка', err.message || 'Не удалось скачать', true);
    }
    return;
  }

  if (id === 'viewerInfo') {
    showInfo('file', f);
    return;
  }

  if (id === 'viewerDelete') {
    if (!(await showConfirm('В корзину', `Переместить "${f.name}" в корзину?`, 'Да', 'Нет'))) return;
    try {
      await moveToTrash([f.id], []);
      playSound('delete');
      galleryFiles.splice(currentGalleryIndex, 1);
      if (galleryFiles.length === 0) {
        viewerToken++;
        slideToken++;
        stopSlideshow();
        $('viewerModal').classList.remove('on');
        $('viewerContent').innerHTML = '';
        $('viewerDelete').style.display = 'none';
        if ($('viewerModal').dataset.url) {
          URL.revokeObjectURL($('viewerModal').dataset.url);
          delete $('viewerModal').dataset.url;
        }
      } else {
        if (currentGalleryIndex >= galleryFiles.length) currentGalleryIndex = galleryFiles.length - 1;
        await renderViewer();
      }
      refresh();
      showUndoToast('В корзине', f.name, async () => {
        await restoreFromTrash([f.id], []);
        await refresh();
        toast('Восстановлено', 'Файл возвращён');
      });
    } catch (err) {
      toast('Ошибка', err.message || 'Не удалось переместить в корзину', true);
    }
    return;
  }
});

function initSwipe(){
  const c=$('swipe');if(!c)return;
  const img=c.querySelector('img');const isImage=!!img;
  c.style.transition='none';c.style.transform='translate3d(0,0,0)';
  let startX=0,startY=0,currX=0,currY=0,drag=false,startDist=0,startScale=1,translateX=0,translateY=0,initialX=0,initialY=0,isPinching=false,lastTap=0,isSwipeDown=false;
  if(img){img.style.transition='transform 0.1s ease-out';img.style.transformOrigin='center center';}
  const apply=()=>{if(img)img.style.transform=`translate(${translateX}px, ${translateY}px) scale(${currentScale})`;};
  c.ontouchstart=e=>{
    if(e.touches.length===2&&isImage){isPinching=true;drag=false;isSwipeDown=false;startDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);startScale=currentScale;if(img)img.style.transition='none';}
    else if(e.touches.length===1){
      startX=e.touches[0].clientX;currX=startX;initialX=startX;
      startY=e.touches[0].clientY;currY=startY;initialY=startY;
      if(currentScale===1){drag=true;isSwipeDown=true;c.style.transition='none';}
    }
  };
  c.ontouchmove=e=>{
    if(isPinching&&e.touches.length===2&&isImage){
      e.preventDefault();const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      currentScale=Math.max(1,Math.min(5,startScale*(dist/startDist)));apply();
    }else if(e.touches.length===1){
      const cx=e.touches[0].clientX,cy=e.touches[0].clientY;
      if(currentScale>1&&isImage){
        e.preventDefault();translateX+=(cx-initialX);translateY+=(cy-initialY);initialX=cx;initialY=cy;apply();
      }else if(drag){
        const dx=cx-startX, dy=cy-startY;
        if(Math.abs(dy)>Math.abs(dx) && dy>0){
          isSwipeDown=true;e.preventDefault();
          c.style.transform=`translate3d(0, ${dy}px, 0)`;
          c.style.opacity=Math.max(0.4, 1 - dy/300);
          currY = cy;
        }else{
          isSwipeDown=false;currX=cx;
          c.style.transform=`translateX(${currX-startX}px)`;
        }
      }
    }
  };
  c.ontouchend=e=>{
    if(isPinching){
      isPinching=false;isSwipeDown=false;
      if(currentScale<=1.05){currentScale=1;translateX=0;translateY=0;if(img){img.style.transition='transform 0.2s ease-out';apply();}}
      else{if(img)img.style.transition='transform 0.2s ease-out';apply();}
      return;
    }
    if(drag){
      drag=false;
      if(isSwipeDown){
        const dy=currY-startY;
        if(dy>100){
          viewerToken++; slideToken++; stopSlideshow();
          $('viewerModal').classList.remove('on');
          $('viewerContent').innerHTML='';
          $('viewerDelete').style.display='none';
          if($('viewerModal').dataset.url){URL.revokeObjectURL($('viewerModal').dataset.url);delete $('viewerModal').dataset.url;}
        }else{
          c.style.transition='transform 0.3s, opacity 0.3s';c.style.transform='translate3d(0,0,0)';c.style.opacity='1';
        }
      }else{
        const diff=currX-startX;const th=window.innerWidth*0.2;
        if(diff<-th&&currentGalleryIndex<galleryFiles.length-1)slide('left');
        else if(diff>th&&currentGalleryIndex>0)slide('right');
        else{c.style.transition='transform 0.3s';c.style.transform='translateX(0)';}
      }
    }
    if(isImage&&e.changedTouches.length===1){
      const now=Date.now();
      if(now-lastTap<300&&Math.abs(e.changedTouches[0].clientX-initialX)<10){
        if(img)img.style.transition='transform 0.3s ease-out';
        if(currentScale===1){currentScale=2.5;translateX=0;translateY=0;}else{currentScale=1;translateX=0;translateY=0;}
        apply();
      }
      lastTap=now;
    }
  };
}
function slide(dir){
  const c=$('swipe');if(!c)return;
  const mySlideToken=++slideToken;playSound('swipe');currentScale=1;
  const shift=dir==='left'?-window.innerWidth:window.innerWidth;
  c.style.transition='transform 0.25s, opacity 0.25s';
  c.style.transform=`translateX(${shift}px)`;
  c.style.opacity='0';
  c.style.pointerEvents='none';
  setTimeout(async()=>{
    if(mySlideToken!==slideToken)return;
    if(dir==='left')currentGalleryIndex=(currentGalleryIndex+1)%galleryFiles.length;
    else currentGalleryIndex=(currentGalleryIndex-1+galleryFiles.length)%galleryFiles.length;
    await renderViewer();
    if(mySlideToken!==slideToken)return;
    const nc=$('swipe');if(nc){nc.style.transition='none';nc.style.transform='translateX(0)';nc.style.opacity='1';nc.style.pointerEvents='auto';}
  },250);
}

function showInfo(type,data){
  const rows=$('infoRows');
  if(type==='file'){
    rows.innerHTML=`<div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Имя:</span><span style="font-weight:600;text-align:right;word-break:break-all;max-width:60%;">${escapeHtml(data.name)}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Тип:</span><span style="font-weight:600;">${TYPE_LABEL[data.type]||'Файл'}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Размер:</span><span style="font-weight:600;">${formatSize(data.size||0)}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Дата:</span><span style="font-weight:600;">${new Date(data.date).toLocaleString('ru-RU')}</span></div><div style="padding:12px 0;display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Избранное:</span><span style="font-weight:600;">${data.fav?'Да':'Нет'}</span></div>`;
  }else{
    rows.innerHTML=`
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Имя:</span><span style="font-weight:600;text-align:right;word-break:break-all;max-width:60%;">${escapeHtml(data.name)}</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Тип:</span><span style="font-weight:600;">Папка</span></div>
      <div style="padding:12px 0;display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Размер:</span><span id="folderSizeCalc" style="font-weight:600;">…</span></div>
    `;
    getFolderStats(data.id).then(s=>{
      const a=$('folderSizeCalc');
      if(a)a.textContent=formatSize(s.size);
    }).catch(()=>{});
  }
  $('modalInfo').style.zIndex='10005';$('modalInfo').classList.add('on');
}
async function getFolderStats(folderId){
  const [files,folders]=await Promise.all([getAllFiles(),getAllFolders()]);
  const folderIds=new Set([folderId]);
  let changed=true;
  while(changed){changed=false;for(const f of folders)if(f.parentId!=null&&folderIds.has(f.parentId)&&!folderIds.has(f.id)){folderIds.add(f.id);changed=true;}}
  let size=0,count=0;
  for(const f of files)if(!f.deleted&&folderIds.has(f.folderId)){size+=(f.size||0);count++;}
  return {size,count,folderCount:folderIds.size-1};
}

function computeFolderCountsFromData(files,folders){
  folderCountCache.clear();
  const directCounts=new Map();
  for(const f of files){
    if(f.deleted||f.folderId==null)continue;
    directCounts.set(f.folderId,(directCounts.get(f.folderId)||0)+1);
  }
  const childrenMap=new Map();
  for(const f of folders){
    if(f.deleted)continue;
    const key=f.parentId??null;
    if(!childrenMap.has(key))childrenMap.set(key,[]);
    childrenMap.get(key).push(f.id);
  }
  const count=(fid)=>{
    if(folderCountCache.has(fid))return folderCountCache.get(fid);
    let c=directCounts.get(fid)||0;
    const kids=childrenMap.get(fid)||[];
    for(const child of kids)c+=count(child);
    folderCountCache.set(fid,c);
    return c;
  };
  for(const f of folders)if(!f.deleted)count(f.id);
}

function updateHeaderCounter(){
  const el=$('headerCounter');
  if(!el)return;
  if(viewMode==='trash'){
    const total=trashFilesCache.length+trashFoldersCache.length;
    el.textContent=total>0?`${total} ${pluralize(total,['объект','объекта','объектов'])}`:'';
    return;
  }
  if(searchQuery&&searchScope==='all'){
    const count=virtualState.items.length;
    el.textContent=count>0?`${count} найдено`:'';
    return;
  }
  let fileCount=0;
  let totalSize=0;
  for(const f of currentFilesCache){
    if(filterType==='image'&&f.type!=='image')continue;
    if(filterType==='video'&&f.type!=='video')continue;
    if(filterType==='fav'&&!f.fav)continue;
    if(searchQuery){
      const q=searchQuery.toLowerCase();
      if(!f.name.toLowerCase().includes(q))continue;
    }
    fileCount++;
    totalSize+=(f.size||0);
  }
  let folderCount=0;
  if(filterType==='all'&&!searchQuery)folderCount=currentFoldersCache.length;
  const parts=[];
  if(folderCount>0)parts.push(`${folderCount} ${pluralize(folderCount,['папка','папки','папок'])}`);
  if(fileCount>0)parts.push(`${fileCount} ${pluralize(fileCount,['файл','файла','файлов'])}`);
  if(totalSize>0)parts.push(formatSize(totalSize));
  el.textContent=parts.join(' · ');
}

function renderCrumb(folders){
  if(viewMode==='trash'){$('crumb').innerHTML=`<a class="cur">${ICONS.trash}<span class="crumb-text">Корзина</span></a>`;return;}
  if(searchScope==='all'&&searchQuery){$('crumb').innerHTML=`<a data-nav="root" class="cur">${ICONS.home}<span class="crumb-text">Поиск везде</span></a>`;return;}
  const path=[];let cur=currentFolder;const seen=new Set();
  while(cur!=null){if(seen.has(cur))break;seen.add(cur);const f=folders.find(x=>x.id===cur);if(!f)break;path.unshift(f);cur=f.parentId;}
  let h=`<a data-nav="root" class="${path.length?'':'cur'}">${ICONS.home}<span class="crumb-text">Файлы</span></a>`;
  if(path.length>2){
    h+=`<span class="sep">›</span><span class="crumb-ellipsis">…</span>`;
    const last=path[path.length-1];
    h+=`<span class="sep">›</span><a data-nav="${last.id}" class="cur"><span class="crumb-text">${escapeHtml(last.name)}</span></a>`;
  }else{
    path.forEach((f,i)=>{
      const isLast=i===path.length-1;
      h+=`<span class="sep">›</span><a data-nav="${f.id}" class="${isLast?'cur':''}"><span class="crumb-text">${escapeHtml(f.name)}</span></a>`;
    });
  }
  $('crumb').innerHTML=h;
}
$('crumb').addEventListener('click',async e=>{
  if(viewMode==='trash')return;
  const a=e.target.closest('a');if(!a)return;
  if(searchScope==='all'&&searchQuery&&a.dataset.nav==='root'){currentFolder=null;searchScope='current';$('btnSearchScope').classList.remove('on');await setSetting('currentFolder',null);clearSel();refresh();return;}
  playSound('open');
  scrollMemory.set(currentFolder ?? 'root', window.scrollY);
  currentFolder=a.dataset.nav==='root'?null:Number(a.dataset.nav);
  await setSetting('currentFolder',currentFolder);
  _pendingScroll = scrollMemory.get(currentFolder ?? 'root') || 0;
  clearSel();refresh();
});

function sortList(arr){
  return arr.sort((a,b)=>{
    if(sortBy==='name_asc')return a.name.localeCompare(b.name,'ru');
    if(sortBy==='name_desc')return b.name.localeCompare(a.name,'ru');
    if(sortBy==='date_desc')return b.date-a.date;
    if(sortBy==='date_asc')return a.date-b.date;
    if(sortBy==='size_desc')return (b.size||0)-(a.size||0);
    if(sortBy==='size_asc')return (a.size||0)-(b.size||0);
    if(sortBy==='added_asc')return (a.id||0)-(b.id||0);
    if(sortBy==='added_desc')return (b.id||0)-(a.id||0);
    return 0;
  });
}

async function refresh(){
  if(isLocked)return;
  bgThumbQueue=[];
  const [files,folders]=await Promise.all([getAllFiles(),getAllFolders()]);
  allActiveFilesCache=files.filter(f=>!f.deleted);
  allActiveFoldersCache=folders.filter(f=>!f.deleted);
  currentFilesCache=files.filter(f=>!f.deleted&&f.folderId===currentFolder);
  currentFoldersCache=folders.filter(f=>!f.deleted&&f.parentId===currentFolder);
  trashFilesCache=files.filter(f=>f.deleted);
  trashFoldersCache=folders.filter(f=>f.deleted);
  computeFolderCountsFromData(files,folders);
  const totalTrash=trashFilesCache.length+trashFoldersCache.length;
  $('trashCount').textContent=totalTrash>0?`(${totalTrash})`:'';
  renderCrumb(folders);
  renderGrid(true);
  if(_pendingScroll!==null){
    window.scrollTo({top:_pendingScroll,behavior:'instant'});
    _pendingScroll=null;
  }
  updateStorageInfo(files);
}
async function updateStorageInfo(files=null){
  try{
    if(!files)files=await getAllFiles();
    const totalBytes=files.reduce((sum,f)=>sum+(f.size||0),0);
    $('storageFilesSize').textContent=(totalBytes/(1024*1024)).toFixed(2)+' МБ';
    if(navigator.storage&&navigator.storage.estimate){
      const estimate=await navigator.storage.estimate();
      const usage=estimate.usage||0;
      $('storageUsage').textContent=usage>0?((usage)/(1024*1024)).toFixed(2)+' МБ':'—';
    }else{
      $('storageUsage').textContent='—';
    }
  }catch(e){$('storageUsage').textContent='—';}
}

function renderGrid(reset=true){
  if(isLocked)return;
  let curFiles,visFolders;
  if(viewMode==='trash'){
    curFiles=[...trashFilesCache];visFolders=[...trashFoldersCache];
    if(searchQuery){const q=searchQuery.toLowerCase();curFiles=curFiles.filter(f=>f.name.toLowerCase().includes(q));visFolders=visFolders.filter(f=>f.name.toLowerCase().includes(q));}
    curFiles.sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));visFolders.sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
  }else if(searchQuery&&searchScope==='all'){
    const q=searchQuery.toLowerCase();
    curFiles=allActiveFilesCache.filter(f=>f.name.toLowerCase().includes(q));
    if(filterType==='image')curFiles=curFiles.filter(f=>f.type==='image');
    else if(filterType==='video')curFiles=curFiles.filter(f=>f.type==='video');
    else if(filterType==='fav')curFiles=curFiles.filter(f=>f.fav);
    sortList(curFiles);visFolders=[];
  }else{
    curFiles=[...currentFilesCache];
    if(filterType==='image')curFiles=curFiles.filter(f=>f.type==='image');
    else if(filterType==='video')curFiles=curFiles.filter(f=>f.type==='video');
    else if(filterType==='fav')curFiles=curFiles.filter(f=>f.fav);
    if(searchQuery){const q=searchQuery.toLowerCase();curFiles=curFiles.filter(f=>f.name.toLowerCase().includes(q));}
    sortList(curFiles);
    visFolders=(filterType==='all'||filterType==='image'||filterType==='video'||filterType==='fav')?[...currentFoldersCache]:[];
    if(filterType==='fav')visFolders=[];
    if(searchQuery&&visFolders.length)visFolders=visFolders.filter(f=>f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    sortList(visFolders);
  }
  const combined=[];
  for(const f of visFolders)combined.push({...f,_isFolder:true});
  for(const f of curFiles)combined.push({...f,_isFolder:false});
  virtualState.items=combined;
  virtualState.lastRange=[-1,-1];
  if(combined.length===0){
    let iconHtml,title,sub;
    if(viewMode==='trash'){
      if(searchQuery){
        iconHtml=`<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--acc)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
        title='Ничего не найдено';
        sub='Попробуйте изменить поисковый запрос.';
      }else{
        iconHtml=`<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--acc)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
        title='Корзина пуста';
        sub='Удалённые файлы попадают сюда и могут быть восстановлены в течение установленного срока.';
      }
    }else if(searchQuery){
      iconHtml=`<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--acc)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
      title='Ничего не найдено';
      sub=searchScope==='all'?'Попробуйте изменить запрос или вернуться в текущую папку.':'Попробуйте изменить запрос или искать везде — кнопка справа от поиска.';
    }else if(filterType!=='all'){
      iconHtml=`<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--acc)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>`;
      title='Нет файлов в этой категории';
      sub='Попробуйте выбрать другой фильтр или добавить новые файлы.';
    }else if(currentFolder!=null){
      iconHtml=`<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--acc)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
      title='Папка пуста';
      sub='Добавьте файлы кнопкой «+ Добавить» внизу экрана.';
    }else{
      iconHtml=`<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="var(--acc)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
      title='Добро пожаловать в Krypta';
      sub='Здесь будут храниться ваши фото и видео.<br>Нажмите «+ Добавить», чтобы начать.';
    }
    $('gridWrap').style.height='auto';
    $('grid').style.position='relative';
    $('grid').style.left='0';
    $('grid').style.right='0';
    $('grid').style.top='';
    $('grid').style.display='block';
    $('grid').innerHTML=`<div class="empty"><div class="empty-icon">${iconHtml}</div><div class="empty-title">${title}</div><div class="empty-sub">${sub}</div></div>`;
    updateUI();
    updateHeaderCounter();
    return;
  }
  updateVirtualGrid();
  updateHeaderCounter();
}

window.addEventListener('scroll',()=>{
  lastScrollTime=Date.now();
  scrollMemory.set(currentFolder ?? 'root', window.scrollY);
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollTimeout);scrollTimeout=setTimeout(()=>document.body.classList.remove('is-scrolling'),150);
  if(scrollRaf)return;
  scrollRaf=requestAnimationFrame(()=>{
    scrollRaf=null;
    if(window.scrollY>500)$('btnUp').classList.add('on');else $('btnUp').classList.remove('on');
    if(isLocked||$('viewerModal').classList.contains('on'))return;
    updateVirtualGrid();
  });
},{passive:true});
$('btnUp').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});

let resizeTimeout=null;
window.addEventListener('resize',()=>{clearTimeout(resizeTimeout);resizeTimeout=setTimeout(()=>{virtualState.lastRange=[-1,-1];updateVirtualGrid();},150);});
window.addEventListener('orientationchange',()=>{setTimeout(()=>{virtualState.lastRange=[-1,-1];updateVirtualGrid();},300);});

const gridEl=$('grid');
gridEl.addEventListener('touchstart',e=>{
  const tile=e.target.closest('.tile');if(!tile)return;
  isLongPress=false;isScrolling=false;isDragSelecting=false;lastHoveredTile=null;
  startX=e.touches[0].clientX;startY=e.touches[0].clientY;
  clearTimeout(pressTimer);
  pressTimer=setTimeout(()=>{
    if(isScrolling)return;
    if(Date.now()-lastScrollTime<400)return;
    isLongPress=true;isDragSelecting=true;document.body.classList.add('selecting');
    const id=Number(tile.dataset.id),type=tile.dataset.type;
    if(type==='file'&&!sel.has(id))toggleFileSelection(id,tile);
    if(type==='folder'&&!folderSel.has(id))toggleFolderSelection(id,tile);
    lastHoveredTile=tile;if(navigator.vibrate)navigator.vibrate(50);updateUI();
  },500);
},{passive:true});
gridEl.addEventListener('touchmove',e=>{
  if(!e.touches[0])return;
  const currentX=e.touches[0].clientX,currentY=e.touches[0].clientY;
  if(isDragSelecting){
    e.preventDefault();const now=Date.now();if(now-lastDragTime<50)return;lastDragTime=now;
    const el=document.elementFromPoint(currentX,currentY);
    if(el){const tile=el.closest('.tile');if(tile&&tile!==lastHoveredTile){lastHoveredTile=tile;const id=Number(tile.dataset.id),type=tile.dataset.type;if(type==='file'&&!sel.has(id)){sel.add(id);tile.classList.add('sel');updateUI();playSound('select');}else if(type==='folder'&&!folderSel.has(id)){folderSel.add(id);tile.classList.add('sel');updateUI();playSound('select');}}}
  }else{if(Math.abs(currentX-startX)>10||Math.abs(currentY-startY)>10){isScrolling=true;clearTimeout(pressTimer);}}
},{passive:false});
gridEl.addEventListener('touchend',async e=>{
  clearTimeout(pressTimer);
  if(e.touches.length>0)return;
  document.body.classList.remove('selecting');
  const wasLongPress=isLongPress;isDragSelecting=false;
  if(isScrolling||wasLongPress)return;
  const tile=e.target.closest('.tile');if(!tile)return;
  const id=Number(tile.dataset.id),type=tile.dataset.type;
  const inSelection=viewMode==='trash'||sel.size>0||folderSel.size>0;
  if(inSelection){if(type==='file')toggleFileSelection(id,tile);else toggleFolderSelection(id,tile);updateUI();}
  else{
    if(type==='folder'){
      playSound('open');
      scrollMemory.set(currentFolder ?? 'root', window.scrollY);
      currentFolder=id;
      await setSetting('currentFolder',id);
      _pendingScroll = scrollMemory.get(currentFolder ?? 'root') || 0;
      clearSel();refresh();
    }else{
      const f=currentFilesCache.find(x=>x.id===id)||allActiveFilesCache.find(x=>x.id===id)||trashFilesCache.find(x=>x.id===id);
      if(f&&!f.deleted)openFile(f);
    }
  }
});
gridEl.addEventListener('touchcancel',e=>{clearTimeout(pressTimer);isLongPress=false;isDragSelecting=false;isScrolling=false;document.body.classList.remove('selecting');});

function clearSel(){sel.clear();folderSel.clear();document.querySelectorAll('.tile.sel').forEach(e=>e.classList.remove('sel'));updateUI();}
function updateUI(){
  const hasSel=sel.size+folderSel.size>0;const totalSel=sel.size+folderSel.size;
  const inTrash=viewMode==='trash';
  const trashEmpty=(trashFilesCache.length+trashFoldersCache.length)===0;
  $('bar').style.display=hasSel?'none':'flex';
  $('btnEmptyTrash').style.display=(inTrash&&!trashEmpty)?'flex':'none';
  $('ctxMenu').classList.toggle('on',hasSel);
  
  $('ctxActions').style.display=inTrash?'none':'grid';
  $('ctxActions2').style.display=inTrash?'none':'grid';
  $('ctxRow3').style.display=inTrash?'none':'grid';
  $('ctxRowTrash').style.display=inTrash?'grid':'none';

  $('ctxRename').disabled=totalSel!==1;
  $('ctxRename').querySelector('.ctx-label').textContent='Имя';
  $('ctxInfo').disabled=totalSel!==1;
  $('ctxDownload').disabled=sel.size===0&&folderSel.size===0;
  $('ctxFav').disabled=sel.size===0;
  if(folderSel.size>0)$('ctxDownload').querySelector('.ctx-label').textContent='Экспорт';
  else $('ctxDownload').querySelector('.ctx-label').textContent='Скачать';
  if(sel.size>0&&folderSel.size===0&&!inTrash)$('ctxCompress').disabled=!currentFilesCache.filter(f=>sel.has(f.id)).some(f=>f.type==='image');else $('ctxCompress').disabled=true;
  if(sel.size>0){const files=currentFilesCache.filter(f=>sel.has(f.id));const allFav=files.every(f=>f.fav);$('ctxFav').querySelector('.ctx-label').textContent=allFav?'Из избранного':'В избранное';}
  if(hasSel){
    const parts=[];
    if(sel.size)parts.push(`${sel.size} ${pluralize(sel.size,['файл','файла','файлов'])}`);
    if(folderSel.size)parts.push(`${folderSel.size} ${pluralize(folderSel.size,['папка','папки','папок'])}`);
    let summary=`Выбрано: ${parts.join(' + ')}`;
    if(sel.size&&!inTrash)summary+=`<br><span class="size" style="color:var(--acc);">${formatSize(getSelectedFilesSize())}</span>`;
    $('ctxSummaryText').innerHTML=summary;
    const curFiles=viewMode==='trash'?trashFilesCache:currentFilesCache;
    const curFolders=viewMode==='trash'?trashFoldersCache:currentFoldersCache;
    const allSelected=curFiles.every(f=>sel.has(f.id))&&curFolders.every(f=>folderSel.has(f.id));
    $('btnSelectAll').textContent=allSelected?'Снять всё':'Выбрать всё';
  }
}
$('btnSelectAll').onclick=()=>{
  const curFiles=viewMode==='trash'?trashFilesCache:currentFilesCache;
  const curFolders=viewMode==='trash'?trashFoldersCache:currentFoldersCache;
  const allSelected=curFiles.every(f=>sel.has(f.id))&&curFolders.every(f=>folderSel.has(f.id));
  if(allSelected)clearSel();
  else{sel.clear();folderSel.clear();curFiles.forEach(f=>sel.add(f.id));curFolders.forEach(f=>folderSel.add(f.id));document.querySelectorAll('.tile').forEach(el=>{const id=Number(el.dataset.id);const isFile=el.dataset.type==='file';if((isFile&&sel.has(id))||(!isFile&&folderSel.has(id)))el.classList.add('sel');else el.classList.remove('sel');});updateUI();}
};
$('ctxClose').onclick=()=>clearSel();

document.querySelectorAll('.tab').forEach(t=>{
  t.onclick=async()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    viewMode=t.dataset.view||'files';document.body.dataset.view=viewMode;
    filterType=t.dataset.type||'all';
    await setSetting('viewMode',viewMode);
    await setSetting('filterType',filterType);
    clearSel();refresh();
  };
});
$('search').addEventListener('input',()=>{clearTimeout(searchTimer);const val=$('search').value.trim();$('searchWrap').classList.toggle('has',!!val);searchTimer=setTimeout(()=>{searchQuery=val;renderGrid(true);},250);});
$('search').addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();$('search').blur();}});
$('searchClear').onclick=()=>{$('search').value='';searchQuery='';$('searchWrap').classList.remove('has');clearTimeout(searchTimer);renderGrid(true);};

$('btnSearchScope').onclick=()=>{
  searchScope=searchScope==='current'?'all':'current';
  $('btnSearchScope').classList.toggle('on',searchScope==='all');
  $('btnSearchScope').title=searchScope==='all'?'Искать везде':'Искать в текущей папке';
  if(searchQuery){renderGrid(true);renderCrumb(allActiveFoldersCache);}
};
$('btnAdd').onclick=()=>$('file').click();

$('file').onchange=async e=>{
  const files=[...e.target.files];if(!files.length)return;
  const bigFiles=files.filter(f=>f.size>BIG_FILE_THRESHOLD);
  if(bigFiles.length>0){
    const list=bigFiles.map(f=>`• ${escapeHtml(f.name)} (${(f.size/1073741824).toFixed(1)} ГБ)`).join('<br>');
    const proceed=await showConfirm('Большие файлы',`Файлы больше 2 ГБ:<br><br>${list}<br><br>Телефон может не справиться с обработкой. Продолжить?`,'Продолжить','Отмена');
    if(!proceed){e.target.value='';return;}
  }
  await acquireWakeLock();startAbortableOperation('add','Добавление');
  const addedImageIds=[];
  try{
    const existingFiles=await getAllFiles();
    const existingHashes=new Set(existingFiles.filter(f=>!f.deleted).map(f=>f.hash).filter(h=>h&&!h.startsWith('unique_')));
    const prepared=[];let duplicateCount=0;
    for(let i=0;i<files.length;i++){
      checkAbort();const file=files[i];
      if(file.type==='image/gif'||file.name.toLowerCase().endsWith('.gif')){toast('Ошибка','GIF не поддерживаются',true);continue;}
      showProgress(`Проверка ${i+1} из ${files.length}`,Math.round(((i+1)/files.length)*30),file.name,'Поиск дубликатов...');await nextMacrotask();
      let hash='';try{hash=await calculateHash(file);}catch(e){}
      const isDup=!!(hash&&existingHashes.has(hash));
      if(isDup)duplicateCount++;
      else if(hash&&!hash.startsWith('unique_'))existingHashes.add(hash);
      prepared.push({file,hash,isDup});
    }
    let toAdd=prepared;
    if(duplicateCount>0){
      const skip=await showConfirm('Дубликаты',`Найдено <b>${duplicateCount}</b> ${duplicateCount===1?'дубликат':(duplicateCount<5?'дубликата':'дубликатов')}.<br><br>Пропустить их?`,'Пропустить','Добавить всё');
      if(skip)toAdd=prepared.filter(x=>!x.isDup);
    }
    for(let i=0;i<toAdd.length;i++){
      checkAbort();const {file,hash}=toAdd[i];
      showProgress(`Сохранение ${i+1} из ${toAdd.length}`,0,file.name,'...');await nextMacrotask();
      const newId=await addFile(file,hash);
      if(detectType(file)==='image')addedImageIds.push(newId);
    }
    await refresh();
    if(addedImageIds.length>0){
      setTimeout(async()=>{if(await showConfirm('Сжать фото?',`Вы добавили <b>${addedImageIds.length}</b> фото. Хотите их сжать для экономии места?`,'Сжать','Пропустить'))await compressFiles(addedImageIds,true);},500);
    }
  }catch(err){
    if(err.message==='Отменено пользователем')toast('Отменено','Добавление остановлено');
    else toast('Ошибка',err.message||'Не удалось добавить файлы',true);
  }
  e.target.value='';hideProgress();endAbortableOperation();releaseWakeLock();
};
$('btnEmptyTrash').onclick=()=>emptyTrash();

function buildColorPalette(selected){
  const wrap=$('colorPalette');wrap.innerHTML='';
  FOLDER_COLORS.forEach(c=>{const el=document.createElement('div');el.className='color-swatch'+(c===selected?' sel':'');el.style.background=c;el.onclick=()=>{selectedFolderColor=c;wrap.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');};wrap.appendChild(el);});
}
function openEditModal(title,val,isFolder,id=null,color=null){
  editIsFolder=isFolder;editId=id;
  $('meTitle').textContent=title;$('meName').value=val||'';
  $('colorPickerWrap').style.display=isFolder?'block':'none';
  if(isFolder){selectedFolderColor=color||FOLDER_COLORS[0];buildColorPalette(selectedFolderColor);}
  $('ctxMenu').classList.remove('on');$('modalEdit').classList.add('on');
  setTimeout(()=>$('meName').focus(),150);
}
$('btnFolder').onclick=()=>{editId=null;openEditModal('Новая папка','',true);};

$('meCancel').onclick = () => {
  editId = null;
  editIsFolder = true;
  $('modalEdit').classList.remove('on');
};

$('meOk').onclick = async () => {
  if (!$('modalEdit').classList.contains('on')) return;
  const n = $('meName').value.trim();
  if (!n) return toast('Ошибка', 'Введите название', true);
  try {
    if (editId !== null && editId !== undefined) {
      if (editIsFolder) await updateFolderFull(editId, n, selectedFolderColor);
      else              await renameItem(SF, editId, n);
      playSound('success');
      toast('Успешно', 'Сохранено');
    } else {
      await addFolder(n, currentFolder, selectedFolderColor);
      playSound('create');
      toast('Успешно', 'Папка создана');
    }
  } catch (err) {
    console.error('meOk error:', err);
    toast('Ошибка', err.message || 'Не удалось сохранить', true);
    return;
  }
  editId = null;
  editIsFolder = true;
  $('modalEdit').classList.remove('on');
  clearSel();
  refresh();
};

$('meName').addEventListener('keydown', e => {
  if (e.key === 'Enter' && $('modalEdit').classList.contains('on')) $('meOk').click();
});

async function renameItem(store, id, name) {
  const tx = db.transaction(store, 'readwrite');
  const s = tx.objectStore(store);
  const req = s.get(id);
  req.onsuccess = () => {
    const v = req.result;
    if (v) { v.name = name; s.put(v); }
  };
  await new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error || new Error('Aborted'));
  });
  invalidateCache();
}

async function updateFolderFull(id, name, color) {
  const tx = db.transaction(SFL, 'readwrite');
  const s = tx.objectStore(SFL);
  const req = s.get(id);
  req.onsuccess = () => {
    const v = req.result;
    if (v) { v.name = name; v.color = color; s.put(v); }
  };
  await new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error || new Error('Aborted'));
  });
  invalidateCache();
}

$('ctxRename').onclick=async()=>{
  if(sel.size+folderSel.size!==1)return;
  try{
    if(sel.size){const f=await p(st(SF,'readonly').get([...sel][0]));if(!f)return toast('Ошибка','Файл не найден в базе',true);openEditModal('Переименовать',f.name,false,f.id);}
    else{const f=await p(st(SFL,'readonly').get([...folderSel][0]));if(!f)return toast('Ошибка','Папка не найдена в базе',true);openEditModal('Переименовать',f.name,true,f.id,f.color);}
  }catch(e){toast('Ошибка',e.message||'Не удалось открыть',true);}
};
$('ctxFav').onclick=async()=>{
  if(sel.size===0)return;
  const files=currentFilesCache.filter(f=>sel.has(f.id));
  const allFav=files.every(f=>f.fav);const newFav=!allFav;
  const s=st(SF,'readwrite');
  for(const f of files){const v=await p(s.get(f.id));if(v){v.fav=newFav;await p(s.put(v));}}
  invalidateCache();
  clearSel();refresh();toast(newFav?'Добавлено':'Убрано',newFav?'Файлы в избранном':'Файлы убраны из избранного');
};

let moveTarget='ROOT';
function openMoveModal(title,btnText){
  $('mvTitle').textContent=title;$('mvOk').textContent=btnText;
  getAllFolders().then(folders=>{
    moveTarget='ROOT';$('moveList').innerHTML='';
    const mk=(id,label)=>{
      const el=document.createElement('div');
      el.className='folder-item'+(id===moveTarget?' sel':'');
      el.style.cssText=`padding:16px;cursor:pointer;border-bottom:1px solid var(--bd);background:${id===moveTarget?'var(--bd)':'transparent'}`;
      el.innerHTML=`<span style="margin-right:12px;font-size:16px;color:var(--mut);">${id===null?'/':'›'}</span><span>${escapeHtml(label)}</span>`;
      el.onclick=()=>{moveTarget=id;document.querySelectorAll('#moveList .folder-item').forEach(x=>{x.classList.remove('sel');x.style.background='transparent';});el.classList.add('sel');el.style.background='var(--bd)';};
      return el;
    };
    $('moveList').appendChild(mk(null,'Корень'));
    const byParent={};folders.filter(f=>!f.deleted).forEach(f=>{(byParent[f.parentId??null]=byParent[f.parentId??null]||[]).push(f);});
    const walk=(pid,depth)=>{(byParent[pid]||[]).forEach(f=>{$('moveList').appendChild(mk(f.id,'　'.repeat(depth)+f.name));walk(f.id,depth+1);});};
    walk(null,0);
    $('modalMove').classList.add('on');
  });
}
$('ctxMove').onclick=()=>{if(!(sel.size+folderSel.size))return;openMoveModal('Переместить в…','Переместить');};
$('mvCancel').onclick=()=>$('modalMove').classList.remove('on');
$('mvOk').onclick=async()=>{
  const target=moveTarget==='ROOT'?null:moveTarget;
  try{
    if(sel.size)await moveFiles([...sel],target);
    if(folderSel.size)await moveFolders([...folderSel],target);
    clearSel();$('modalMove').classList.remove('on');await refresh();
    toast('Перемещено','');
  }catch(e){toast('Ошибка',e.message||'Не удалось переместить',true);}
};

async function moveFiles(ids, target) {
  const tx = db.transaction(SF, 'readwrite');
  const s = tx.objectStore(SF);
  for (const id of ids) {
    const req = s.get(id);
    req.onsuccess = () => {
      const v = req.result;
      if (v) { v.folderId = target; s.put(v); }
    };
  }
  await new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error || new Error('Aborted'));
  });
  invalidateCache();
}

async function moveFolders(ids, target) {
  const allFolders = await getAllFolders();
  const byId = new Map(allFolders.map(f => [f.id, f]));
  for (const id of ids) {
    let cur = target;
    while (cur != null) {
      if (cur === id) throw new Error('Нельзя переместить папку внутрь неё самой');
      const f = byId.get(cur);
      cur = f ? f.parentId : null;
    }
  }
  const tx = db.transaction(SFL, 'readwrite');
  const s = tx.objectStore(SFL);
  for (const id of ids) {
    const req = s.get(id);
    req.onsuccess = () => {
      const v = req.result;
      if (v) { v.parentId = target; s.put(v); }
    };
  }
  await new Promise((res, rej) => {
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error || new Error('Aborted'));
  });
  invalidateCache();
}

$('ctxDel').onclick=async()=>{
  const fid=[...sel],did=[...folderSel];
  if(!fid.length&&!did.length)return;
  if(!await showConfirm('Удаление',`Переместить в корзину: <b>${fid.length}</b> файл. и <b>${did.length}</b> пап.?`))return;
  try{
    await moveToTrash(fid,did);playSound('delete');clearSel();await refresh();
    const total=fid.length+did.length;
    const subText=total===1?'Перемещено в корзину':`${total} ${did.length?'объектов':'файлов'} в корзине`;
    showUndoToast('В корзине',subText,async()=>{await restoreFromTrash(fid,did);await refresh();toast('Восстановлено',total===1?'Объект возвращён':`${total} объектов возвращено`);});
  }catch(e){toast('Ошибка',e.message||'Не удалось переместить в корзину',true);}
};
$('ctxRestore').onclick=async()=>{
  const fid=[...sel],did=[...folderSel];if(!fid.length&&!did.length)return;
  try{await restoreFromTrash(fid,did);clearSel();await refresh();toast('Восстановлено',`${fid.length+did.length} объект.`);}
  catch(e){toast('Ошибка',e.message||'Не удалось восстановить',true);}
};
$('ctxDelForever').onclick=async()=>{
  const fid=[...sel],did=[...folderSel];if(!fid.length&&!did.length)return;
  if(!await showConfirm('Удаление навсегда',`Удалить навсегда: <b>${fid.length}</b> файл. и <b>${did.length}</b> пап.?`,'Удалить'))return;
  startAbortableOperation('delete','Удаление');showProgress('Удаление',0,'Подготовка...','',true);
  try{await deletePermanent(fid,did);playSound('delete');hideProgress();clearSel();await refresh();toast('Удалено','Навсегда');}
  catch(e){hideProgress();if(e.message==='Отменено пользователем')toast('Отменено','Часть файлов удалена');else toast('Ошибка',e.message||'Не удалось удалить',true);}
  finally{endAbortableOperation();}
};

async function compressFiles(ids,isAutoBatch=false){
  if(!ids.length)return;
  const files=await getAllFiles();
  const images=files.filter(f=>ids.includes(f.id)&&f.type==='image');
  if(!images.length)return toast('Ошибка','Выбраны файлы, не являющиеся фото',true);
  $('ctxMenu').classList.remove('on');await acquireWakeLock();
  const reusableCanvas=document.createElement('canvas');const reusableCtx=reusableCanvas.getContext('2d');
  let processed=0,succeeded=0,failed=0;const stats=[];
  showProgress('Сжатие',0,`Подготовка ${images.length} файл.`,'0%',true);await nextMacrotask();
  try{
    for(let i=0;i<images.length;i++){
      const f=images[i];
      try{
        showProgress('Сжатие',Math.round((processed/images.length)*100),`${processed+1} из ${images.length}: ${f.name}`,`${processed}/${images.length}`);await nextMacrotask();
        const file=await getFileData(f);if(!file){processed++;failed++;continue;}
        const blob=await new Promise((resolve)=>{
          const img=new Image();const url0=URL.createObjectURL(file);
          const timeout=setTimeout(()=>{URL.revokeObjectURL(url0);resolve(null);},15000);
          img.onload=()=>{clearTimeout(timeout);try{reusableCanvas.width=img.width;reusableCanvas.height=img.height;reusableCtx.drawImage(img,0,0);reusableCanvas.toBlob(b=>{URL.revokeObjectURL(url0);resolve(b);},'image/jpeg',0.85);}catch(e){URL.revokeObjectURL(url0);resolve(null);}};
          img.onerror=()=>{clearTimeout(timeout);URL.revokeObjectURL(url0);resolve(null);};
          img.src=url0;
        });
        if(!blob||blob.size>=f.size){processed++;continue;}
        const oldSize=f.size,newSize=blob.size;
        if(rootDir){try{const fh=await rootDir.getFileHandle(f.fileId,{create:true});const wr=await fh.createWritable();await wr.write(blob);await wr.close();}catch(e){}}
        const s=st(SF,'readwrite');const v=await p(s.get(f.id));
        if(v){v.size=blob.size;v.name=f.name.replace(/\.[^.]+$/,'.jpg');if(!rootDir)v.blob=blob;await p(s.put(v));}
        const tb=await generateImageThumbnail(blob);if(tb)await saveThumb(f.fileId,tb);
        cacheRemovePreview(filePreviewCache,f.fileId);
        stats.push({name:f.name,oldSize,newSize});succeeded++;
      }catch(err){failed++;}
      processed++;await nextMacrotask();
    }
    invalidateCache();
    hideProgress();clearSel();virtualState.lastRange=[-1,-1];await refresh();
    if(isAutoBatch)showCompressResults(stats,ids);
    else{if(failed>0)toast('Готово',`Сжато: ${succeeded}, ошибок: ${failed}`);else toast('Успешно',`Сжато: ${succeeded} фото`);}
  }catch(e){hideProgress();toast('Ошибка',e.message||'Не удалось завершить сжатие',true);}
  finally{releaseWakeLock();}
}

function showCompressResults(stats,targetIds){
  let totalOld=0,totalNew=0;let html='';
  stats.forEach(s=>{totalOld+=s.oldSize;totalNew+=s.newSize;const saved=s.oldSize-s.newSize;const pct=Math.round((saved/s.oldSize)*100);
    html+=`<div class="compress-item"><div class="compress-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div><div class="compress-sizes"><span class="compress-old">${(s.oldSize/1048576).toFixed(2)} MB</span><span style="color:var(--mut);font-size:10px;">→</span><span class="compress-new">${(s.newSize/1048576).toFixed(2)} MB</span><span class="saved-badge">-${pct}%</span></div></div>`;
  });
  if(stats.length>0){const ts=totalOld-totalNew;const tp=Math.round((ts/totalOld)*100);
    $('compressSummary').innerHTML=`<div style="font-size:15px;font-weight:600;margin-bottom:4px;color:var(--acc);">Экономия места</div><div style="font-size:13px;color:var(--mut);">Было: ${(totalOld/1048576).toFixed(2)} МБ → Стало: ${(totalNew/1048576).toFixed(2)} МБ<br><span style="font-weight:700;color:var(--acc);">Сэкономлено: ${(ts/1048576).toFixed(2)} МБ (${tp}%)</span></div>`;
    $('compressList').innerHTML=html;
  }else{$('compressSummary').innerHTML=`<div style="font-size:15px;font-weight:600;color:var(--acc);">Сжатие не требуется</div>`;$('compressList').innerHTML='';}
  $('modalCompressResult').style.zIndex='10005';$('modalCompressResult').classList.add('on');
  $('btnDoneCompress').onclick=()=>{$('modalCompressResult').classList.remove('on');};
}

$('ctxCompress').onclick=async()=>{const ids=[...sel];if(!ids.length)return;await compressFiles(ids,false);};

$('ctxDownload').onclick=async()=>{
  const selectedFiles=currentFilesCache.filter(f=>sel.has(f.id));
  const selectedFolderIds=[...folderSel];
  if(!selectedFiles.length&&!selectedFolderIds.length)return toast('Ошибка','Ничего не выбрано',true);
  if(selectedFiles.length===1&&selectedFolderIds.length===0){
    const f=selectedFiles[0];
    try{const data=await getFileData(f);if(!data)return toast('Ошибка','Файл не найден на диске',true);const ok=await downloadFileSafe(data,f.name||'file');if(ok)toast('Скачивание',f.name);}
    catch(e){toast('Ошибка',e.message||'Не удалось скачать файл',true);}
    return;
  }
  await acquireWakeLock();startAbortableOperation('export','Экспорт');let stream=null;const startTime=performance.now();
  try{
    const d=new Date();const pad=n=>String(n).padStart(2,'0');
    const zipName=`mediavault_export_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
    const rawItems=[];const addedFileIds=new Set();const usedPrefixes=new Set();
    if(selectedFolderIds.length>0){
      const [allFiles,allFolders]=await Promise.all([getAllFiles(),getAllFolders()]);
      const byParent=new Map();allFolders.filter(f=>!f.deleted).forEach(f=>{const key=f.parentId??null;if(!byParent.has(key))byParent.set(key,[]);byParent.get(key).push(f);});
      const filesByFolder=new Map();allFiles.filter(f=>!f.deleted).forEach(f=>{const key=f.folderId??null;if(!filesByFolder.has(key))filesByFolder.set(key,[]);filesByFolder.get(key).push(f);});
      const walk=(fid,prefix)=>{
        for(const f of (filesByFolder.get(fid)||[])){if(addedFileIds.has(f.id))continue;addedFileIds.add(f.id);rawItems.push({zipPath:prefix+sanitizeName(f.name),file:f});}
        for(const sub of (byParent.get(fid)||[]))walk(sub.id,prefix+sanitizeName(sub.name)+'/');
      };
      for(const rid of selectedFolderIds){const rf=allFolders.find(f=>f.id===rid&&!f.deleted);if(!rf)continue;const bn=sanitizeName(rf.name);let fp=bn,c=2;while(usedPrefixes.has(fp)){fp=`${bn}_${c}`;c++;}usedPrefixes.add(fp);walk(rid,fp+'/');}
    }
    for(const f of selectedFiles){if(addedFileIds.has(f.id))continue;addedFileIds.add(f.id);rawItems.push({zipPath:sanitizeName(f.name||`file_${f.id}`),file:f});}
    if(rawItems.length===0)return toast('Пусто','Нет файлов для экспорта',true);
    const usedPaths=new Set();const finalItems=[];
    for(const item of rawItems){
      let up=item.zipPath;
      if(usedPaths.has(up.toLowerCase())){
        const si=up.lastIndexOf('/');
        const dp=si>=0?up.slice(0,si+1):'';
        const fpart=up.slice(si+1);
        const di=fpart.lastIndexOf('.');
        const bn=di>0?fpart.slice(0,di):fpart;
        const ext=di>0?fpart.slice(di):'';
        let c=1;
        while(usedPaths.has(up.toLowerCase())){up=`${dp}${bn}_${c}${ext}`;c++;}
      }
      usedPaths.add(up.toLowerCase());
      finalItems.push({name:up,getBlob:async()=>await getFileData(item.file)});
    }
    showProgress('Экспорт',0,`0/${finalItems.length}`,'',true);
    stream=await createOutputStream(zipName);
    if(!stream)return toast('Ошибка','Браузер не поддерживает сохранение в файл. Используйте APK-версию.',true);
    await writeStreamingZip(stream,finalItems,(i,total,name,bytes)=>{const pct=Math.min(99,Math.round((i/total)*100));const eta=formatEta(i,total,performance.now()-startTime);showProgress('Экспорт',pct,name||'',`${i}/${total} · ${(bytes/1048576).toFixed(0)} МБ · ${eta}`);});
    showProgress('Экспорт',99,'Финализация...','',true);
    const result=await stream.close();stream=null;hideProgress();
    if(result&&result.uri&&isCapacitorNative()){const {Share}=window.Capacitor.Plugins;try{await Share.share({title:zipName,files:[result.uri],url:result.uri});}catch(e){await Share.share({title:zipName,url:result.uri});}}
    toast('ZIP готов',`${finalItems.length} файл. · ${(result.size/1048576).toFixed(2)} МБ`);
  }catch(e){
    if(stream&&typeof stream.abort==='function'){try{await stream.abort();}catch(_){}}
    hideProgress();
    if(e.message==='Отменено пользователем')toast('Отменено','Экспорт остановлен');
    else toast('Ошибка','Не удалось создать ZIP: '+(e.message||e),true);
  }finally{endAbortableOperation();releaseWakeLock();}
};

$('ctxInfo').onclick=async()=>{
  const totalSel=sel.size+folderSel.size;if(totalSel!==1)return;
  try{
    if(sel.size===1){const id=[...sel][0];const src=viewMode==='trash'?trashFilesCache:currentFilesCache;const f=src.find(x=>x.id===id);if(f)showInfo('file',f);}
    else{const id=[...folderSel][0];const folders=await getAllFolders();const f=folders.find(x=>x.id===id);if(f)showInfo('folder',f);}
  }catch(e){toast('Ошибка',e.message||'Не удалось получить свойства',true);}
};

$('btnSort').onclick=()=>{document.querySelectorAll('#modalSort .sort-item').forEach(el=>{el.classList.toggle('sel',el.dataset.sort===sortBy);});$('modalSort').classList.add('on');};
window.setSort=async v=>{
  sortBy=v;
  await setSetting('sortBy',v);
  $('modalSort').classList.remove('on');
  renderGrid(true);
};
window.setTheme=async name=>{document.body.dataset.theme=name;await setSetting('theme',name);document.querySelectorAll('.theme-item').forEach(el=>el.classList.toggle('sel',el.dataset.t===name));};

function updateThemePreviewColors() {
  document.querySelectorAll('.theme-item').forEach(item => {
    const accDiv = item.querySelector('.theme-color:nth-child(2)');
    if (accDiv) accDiv.style.background = currentAccent;
  });
}

function renderAccentPicker() {
  const wrap = $('accentPicker');
  if (!wrap) return;
  wrap.innerHTML = '';
  ACCENT_COLORS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'accent-swatch' + (currentAccent === c.hex ? ' sel' : '');
    el.style.background = c.hex;
    el.onclick = async () => {
      currentAccent = c.hex;
      document.body.style.setProperty('--acc', c.hex);
      document.body.style.setProperty('--acc-rgb', c.rgb);
      await setSetting('accentColor', c.hex);
      renderAccentPicker();
      updateThemePreviewColors();
      playSound('success');
    };
    wrap.appendChild(el);
  });
}

async function restoreState(){
  const s=await getAllSettings();
  sortBy=s.sortBy||'date_desc';
  viewMode=(s.viewMode==='trash')?'trash':'files';
  filterType=s.filterType||'all';
  document.body.dataset.view=viewMode;
  document.querySelectorAll('.tab').forEach(t=>{
    const isActive=(t.dataset.view===viewMode)&&((t.dataset.type||'all')===filterType);
    t.classList.toggle('active',isActive);
  });
  if(s.currentFolder!==undefined&&s.currentFolder!==null){
    try{
      const folders=await getAllFolders();
      const f=folders.find(x=>x.id===s.currentFolder&&!x.deleted);
      currentFolder=f?f.id:null;
    }catch(e){currentFolder=null;}
  }else{
    currentFolder=null;
  }
}

async function loadTheme(){
  const s=await getAllSettings();
  let t=s.theme||'dark';
  const ALLOWED=['dark','light'];
  if(!ALLOWED.includes(t))t='dark';
  document.body.dataset.theme = t;
  document.querySelectorAll('.theme-item').forEach(el => el.classList.toggle('sel', el.dataset.t === t));
  
  currentAccent = s.accentColor || '#a78bfa';
  const accObj = ACCENT_COLORS.find(c => c.hex === currentAccent) || ACCENT_COLORS[0];
  document.body.style.setProperty('--acc', accObj.hex);
  document.body.style.setProperty('--acc-rgb', accObj.rgb);
  renderAccentPicker();
  updateThemePreviewColors();

  const savedSlideshowMs=Number(s.slideshowInterval??DEFAULT_SLIDESHOW_MS);
  slideshowInterval=savedSlideshowMs;
  const sec=Math.round(savedSlideshowMs/1000);
  $('slideshowIntRange').value=sec;$('slideshowIntVal').textContent=sec+' сек';
  $('swPin').classList.toggle('on',!!s.pinEnabled);
  $('btnChangePin').style.display=(s.pinEnabled&&s.pinHash)?'flex':'none';
  const trashDays=s.trashAutoDays??DEFAULT_TRASH_DAYS;
  updateTrashAutoPillsUI(trashDays);
  soundEnabled=s.soundEnabled===true;
  if($('swSound'))$('swSound').classList.toggle('on',soundEnabled);
  folderPreviewEnabled=s.folderPreviewEnabled!==false;
  if($('swFolderPreview'))$('swFolderPreview').classList.toggle('on',folderPreviewEnabled);
}
$('btnSettings').onclick=async()=>{$('modalSettings').classList.add('on');await updateStorageInfo();updateTrashAutoPillsUI(await getTrashAutoDays());};

window.exportAllData=async()=>{
  if(!await showConfirm('Экспорт','Создать полный архив со всеми файлами, папками и настройками?<br><br>Файлы стримятся на диск — поддерживаются любые объёмы (50+ ГБ).','Экспорт','Отмена'))return;
  await acquireWakeLock();startAbortableOperation('export','Экспорт');let stream=null;const startTime=performance.now();
  try{
    const [files,folders,settings]=await Promise.all([getAllFiles(),getAllFolders(),p(st(SS,'readonly').getAll())]);
    const d=new Date();const pad=n=>String(n).padStart(2,'0');
    const zipName=`mediavault_backup_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
    showProgress('Экспорт',0,'Открытие файла...','',true);
    stream=await createOutputStream(zipName);
    if(!stream)return toast('Ошибка','Браузер не поддерживает сохранение в файл. Используйте APK-версию.',true);
    const items=[];
    items.push({name:'metadata.json',getBlob:async()=>new Blob([new TextEncoder().encode(JSON.stringify({version:DB_VERSION,exportedAt:Date.now(),files,folders,settings}))])});
    for(const f of files)items.push({name:`files/${f.fileId}`,getBlob:async()=>(await getFromOPFS(f.fileId))||f.blob||null});
    for(const f of files)items.push({name:`thumbs/${f.fileId}`,getBlob:async()=>await getThumb(f)});
    await writeStreamingZip(stream,items,(i,total,name,bytes)=>{const pct=Math.min(99,Math.round((i/total)*100));const eta=formatEta(i,total,performance.now()-startTime);showProgress('Экспорт',pct,name||'...',`${i}/${total} · ${(bytes/1048576).toFixed(0)} МБ · ${eta}`);});
    showProgress('Экспорт',99,'Финализация...','',true);
    const result=await stream.close();stream=null;hideProgress();
    if(result&&result.uri&&isCapacitorNative()){const {Share}=window.Capacitor.Plugins;try{await Share.share({title:zipName,files:[result.uri],url:result.uri});}catch(e){await Share.share({title:zipName,url:result.uri});}}
    toast('Готово',`Экспортировано ${files.length} файлов (${(result.size/1048576).toFixed(1)} МБ)`);
  }catch(e){if(stream&&typeof stream.abort==='function'){try{await stream.abort();}catch(_){}}hideProgress();if(e.message==='Отменено пользователем')toast('Отменено','Экспорт остановлен');else toast('Ошибка','Не удалось экспортировать: '+(e.message||e),true);}
  finally{endAbortableOperation();releaseWakeLock();}
};

const ARCHIVE_MIME_MAP={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',bmp:'image/bmp',heic:'image/heic',heif:'image/heif',avif:'image/avif',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',avi:'video/x-msvideo',mkv:'video/x-matroska',m4v:'video/x-m4v','3gp':'video/3gpp',flv:'video/x-flv',wmv:'video/x-ms-wmv'};

window.importFromArchive=async(input)=>{
  const file=input.files[0];if(!file)return;input.value='';
  const t0=performance.now();
  startAbortableOperation('import','Импорт');
  showProgress('Импорт',0,'Чтение архива...',`${(file.size/1048576).toFixed(0)} МБ`,true);
  await nextMacrotask();
  try{
    const RAM_LIMIT=3.0*1024*1024*1024;
    let entries=null,isStreamingMode=false,zipInfo=null;
    if(file.size<=RAM_LIMIT){try{entries=await parseZip(file);}catch(oomErr){isStreamingMode=true;}}
    else isStreamingMode=true;

    if(isStreamingMode){
      hideProgress();zipInfo=await parseZipStreaming(file);
      let metadataEntry=null;
      for(const e of zipInfo.entries)if(e.name.endsWith('metadata.json')){metadataEntry=e;break;}
      if(metadataEntry){
        showProgress('Восстановление',0,'Чтение метаданных...','',true);
        const metaData=await extractEntryToBuffer(zipInfo,metadataEntry);
        const metadata=JSON.parse(new TextDecoder().decode(metaData));
        hideProgress();
        if(!await showConfirm('Восстановление','Обнаружена полная резервная копия.<br><br>Все текущие данные будут <b>заменены</b>. Продолжить?','Восстановить','Отмена'))return;
        await acquireWakeLock();
        const basePath=metadataEntry.name.substring(0,metadataEntry.name.length-'metadata.json'.length);
        const entryMap=new Map(zipInfo.entries.map(e=>[e.name,e]));
        const validFiles=metadata.files.filter(f=>entryMap.has(basePath+`files/${f.fileId}`));
        const missingCount=metadata.files.length-validFiles.length;
        const totalFiles=validFiles.length;let i=0;let lastYieldRestore=Date.now();
        for(const f of validFiles){
          checkAbort();
          try{
            const mainEntry=entryMap.get(basePath+`files/${f.fileId}`);
            if(mainEntry&&rootDir)await extractEntryToOPFS(zipInfo,mainEntry,f.fileId);
            const thumbEntry=entryMap.get(basePath+`thumbs/${f.fileId}`);
            if(thumbEntry&&rootDir){const thumbData=await extractEntryToBuffer(zipInfo,thumbEntry);const fh=await rootDir.getFileHandle(THUMB_PREFIX+f.fileId,{create:true});const wr=await fh.createWritable();await wr.write(new Blob([thumbData]));await wr.close();}
          }catch(e){}
          i++;const nowR=Date.now();
          if(nowR-lastYieldRestore>150||i===totalFiles){lastYieldRestore=nowR;showProgress('Восстановление',10+Math.round((i/totalFiles)*80),f.name||`Файл ${i}`,`${i}/${totalFiles}`);await nextMacrotask();}
        }
        showProgress('Восстановление',92,'База данных...','',true);await nextMacrotask();
        const t1=db.transaction(SF,'readwrite');t1.objectStore(SF).clear();await new Promise((res,rej)=>{t1.oncomplete=res;t1.onerror=e=>rej(e.target.error);});
        const t2=db.transaction(SFL,'readwrite');t2.objectStore(SFL).clear();await new Promise((res,rej)=>{t2.oncomplete=res;t2.onerror=e=>rej(e.target.error);});
        const t3=db.transaction(SS,'readwrite');t3.objectStore(SS).clear();await new Promise((res,rej)=>{t3.oncomplete=res;t3.onerror=e=>rej(e.target.error);});
        const t4=db.transaction(SF,'readwrite');const s4=t4.objectStore(SF);validFiles.forEach(f=>s4.put(f));await new Promise((res,rej)=>{t4.oncomplete=res;t4.onerror=e=>rej(e.target.error);});
        const t5=db.transaction(SFL,'readwrite');const s5=t5.objectStore(SFL);metadata.folders.forEach(f=>s5.put(f));await new Promise((res,rej)=>{t5.oncomplete=res;t5.onerror=e=>rej(e.target.error);});
        if(metadata.settings&&metadata.settings.length){const t6=db.transaction(SS,'readwrite');const s6=t6.objectStore(SS);metadata.settings.forEach(s=>s6.put(s));await new Promise((res,rej)=>{t6.oncomplete=res;t6.onerror=e=>rej(e.target.error);});}
        settingsCache=null;invalidateCache();hideProgress();
        const skipMsg=missingCount>0?` (Пропущено отсутствующих: ${missingCount})`:'';
        toast('Готово',`Восстановлено ${totalFiles} файлов.${skipMsg} Перезагрузка...`);
        setTimeout(()=>location.reload(),1500);return;
      }
      if(!await showConfirm('Большой архив',`Архив ${(file.size/1048576/1024).toFixed(1)} ГБ.<br><br>Будет читаться с диска частями. <b>Это может занять много времени.</b><br><br>Продолжить?`,'Да, продолжить','Отмена'))return;
      await acquireWakeLock();showProgress('Импорт',0,'Анализ структуры...','',true);
      const mediaEntries=zipInfo.entries.filter(e=>{if(!e.name||e.name.endsWith('/'))return false;const parts=e.name.split('/');if(parts.some(p=>p.startsWith('__MACOSX')||p.startsWith('.')))return false;const m=e.name.match(/\.([a-z0-9]+)$/i);return m&&ARCHIVE_MIME_MAP[m[1].toLowerCase()]!==undefined;});
      if(mediaEntries.length===0){hideProgress();toast('Пусто','В архиве не найдено фото или видео',true);return;}
      if(!await showConfirm('Импорт',`Найдено <b>${mediaEntries.length}</b> медиафайлов.<br><br>Начать импорт?`,'Импортировать','Отмена'))return;
      showProgress('Импорт',3,'Создание папок...','',true);await nextMacrotask();
      const folderPaths=new Set();
      mediaEntries.forEach(e=>{const parts=e.name.split('/');parts.pop();for(let i=1;i<=parts.length;i++)folderPaths.add(parts.slice(0,i).join('/'));});
      const existingFolders=await getAllFolders();const folderMap=new Map();
      const sortedPaths=[...folderPaths].sort((a,b)=>a.split('/').length-b.split('/').length);
      for(const path of sortedPaths){
        const parts=path.split('/');const name=parts[parts.length-1];
        const parentPath=parts.slice(0,-1).join('/');
        const parentId=parentPath?folderMap.get(parentPath):currentFolder;
        const existing=existingFolders.find(f=>f.parentId===parentId&&f.name===name&&!f.deleted);
        let folderId;
        if(existing)folderId=existing.id;
        else{folderId=await addFolder(name,parentId,FOLDER_COLORS[Math.floor(Math.random()*FOLDER_COLORS.length)]);existingFolders.push({id:folderId,name,parentId:parentId??null,deleted:false});}
        folderMap.set(path,folderId);
      }
      const existingFiles=await getAllFiles();
      const existingHashes=new Set(existingFiles.filter(f=>!f.deleted).map(f=>f.hash).filter(h=>h&&!h.startsWith('unique_')));
      const sizesInDb=new Set(existingFiles.filter(f=>!f.deleted).map(f=>f.size||0));
      const pendingRecords=[];const FLUSH_SIZE=100;
      const flushPending=async()=>{if(pendingRecords.length===0)return;const batch=pendingRecords.splice(0);await new Promise((res,rej)=>{const tx=db.transaction(SF,'readwrite');const store=tx.objectStore(SF);for(const r of batch)store.add(r);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});};
      let imported=0,skipped=0,failed=0;let lastYield=Date.now();const importedFiles=[];
      for(let i=0;i<mediaEntries.length;i++){
        checkAbort();const entry=mediaEntries[i];const fileName=entry.name.split('/').pop();
        try{
          const parts=entry.name.split('/');parts.pop();const folderPath=parts.join('/');const targetFolderId=folderPath?folderMap.get(folderPath):currentFolder;
          const ext=fileName.split('.').pop().toLowerCase();const mime=ARCHIVE_MIME_MAP[ext]||'';
          const fileId=generateId();
          await extractEntryToOPFS(zipInfo,entry,fileId);
          let hash='';let isDuplicate=false;
          if(sizesInDb.has(entry.uncompSize)){const fileObj=await getFromOPFS(fileId);try{hash=await calculateHash(fileObj);}catch(e){}if(hash&&existingHashes.has(hash))isDuplicate=true;}
          if(isDuplicate){await deleteFromOPFS(fileId);skipped++;}
          else{
            const fileObj=await getFromOPFS(fileId);const type=detectType(fileObj);
            const record={fileId,name:fileName,type,mime,size:entry.uncompSize,date:Date.now(),importedAt:Date.now(),folderId:targetFolderId,hash,deleted:false,deletedAt:null,fav:false};
            pendingRecords.push(record);importedFiles.push(record);
            if(hash&&!hash.startsWith('unique_'))existingHashes.add(hash);
            sizesInDb.add(entry.uncompSize);imported++;
            if(pendingRecords.length>=FLUSH_SIZE)await flushPending();
          }
        }catch(err){failed++;}
        const now=Date.now();
        if(now-lastYield>200||i===mediaEntries.length-1){lastYield=now;const eta=formatEta(i+1,mediaEntries.length,performance.now()-t0);showProgress('Импорт',5+Math.round(((i+1)/mediaEntries.length)*90),`${i+1}/${mediaEntries.length}: ${fileName}`,`✓${imported} · ⏭${skipped} · ✗${failed} · ${eta}`);await nextMacrotask();}
      }
      await flushPending();
      invalidateCache();
      importedFiles.forEach(f=>queueBgThumb(f));
      const elapsed=(performance.now()-t0)/1000;const totalMB=mediaEntries.reduce((s,e)=>s+e.uncompSize,0)/1048576;const speed=elapsed>0?totalMB/elapsed:0;
      hideProgress();await refresh();toast('Импорт завершён',`${imported} файл. за ${elapsed.toFixed(0)} сек · ${speed.toFixed(1)} МБ/с`);
      return;
    }
    if(!entries.length){hideProgress();toast('Пусто','Архив пуст',true);return;}
    let metadataEntry=null;
    for(const e of entries)if(e.name.endsWith('metadata.json')){metadataEntry=e;break;}
    if(metadataEntry){
      showProgress('Восстановление',5,'Разбор метаданных...','',true);await nextMacrotask();
      let metadata;try{metadata=JSON.parse(new TextDecoder().decode(metadataEntry.data));}catch(e){throw new Error('Неверный формат metadata.json');}
      if(!metadata||!metadata.files||!metadata.folders)throw new Error('Неверный формат резервной копии');
      hideProgress();
      if(!await showConfirm('Восстановление','Обнаружена полная резервная копия.<br><br>Все текущие данные будут <b>заменены</b>. Продолжить?','Восстановить','Отмена'))return;
      await acquireWakeLock();
      const basePath=metadataEntry.name.substring(0,metadataEntry.name.length-'metadata.json'.length);
      const entryMap=new Map(entries.map(e=>[e.name,e]));
      const validFiles=metadata.files.filter(f=>entryMap.has(basePath+`files/${f.fileId}`));
      const missingCount=metadata.files.length-validFiles.length;
      const totalFiles=validFiles.length;let i=0;let lastYieldRestore=Date.now();
      for(const f of validFiles){
        checkAbort();
        try{
          const mainEntry=entryMap.get(basePath+`files/${f.fileId}`);
          if(mainEntry&&mainEntry.data&&rootDir){const fh=await rootDir.getFileHandle(f.fileId,{create:true});const wr=await fh.createWritable();const CHUNK=4*1024*1024;const d=mainEntry.data;if(d.length<=CHUNK)await wr.write(d);else{for(let off=0;off<d.length;off+=CHUNK)await wr.write(d.subarray(off,Math.min(off+CHUNK,d.length)));}await wr.close();}
          const thumbEntry=entryMap.get(basePath+`thumbs/${f.fileId}`);
          if(thumbEntry&&thumbEntry.data&&rootDir){const fh=await rootDir.getFileHandle(THUMB_PREFIX+f.fileId,{create:true});const wr=await fh.createWritable();await wr.write(new Blob([thumbEntry.data]));await wr.close();}
        }catch(e){}
        i++;const nowR=Date.now();
        if(nowR-lastYieldRestore>150||i===totalFiles){lastYieldRestore=nowR;showProgress('Восстановление',10+Math.round((i/totalFiles)*80),f.name||`Файл ${i}`,`${i}/${totalFiles}`);await nextMacrotask();}
      }
      showProgress('Восстановление',92,'База данных...','',true);await nextMacrotask();
      const t1=db.transaction(SF,'readwrite');t1.objectStore(SF).clear();await new Promise((res,rej)=>{t1.oncomplete=res;t1.onerror=e=>rej(e.target.error);});
      const t2=db.transaction(SFL,'readwrite');t2.objectStore(SFL).clear();await new Promise((res,rej)=>{t2.oncomplete=res;t2.onerror=e=>rej(e.target.error);});
      const t3=db.transaction(SS,'readwrite');t3.objectStore(SS).clear();await new Promise((res,rej)=>{t3.oncomplete=res;t3.onerror=e=>rej(e.target.error);});
      const t4=db.transaction(SF,'readwrite');const s4=t4.objectStore(SF);validFiles.forEach(f=>s4.put(f));await new Promise((res,rej)=>{t4.oncomplete=res;t4.onerror=e=>rej(e.target.error);});
      const t5=db.transaction(SFL,'readwrite');const s5=t5.objectStore(SFL);metadata.folders.forEach(f=>s5.put(f));await new Promise((res,rej)=>{t5.oncomplete=res;t5.onerror=e=>rej(e.target.error);});
      if(metadata.settings&&metadata.settings.length){const t6=db.transaction(SS,'readwrite');const s6=t6.objectStore(SS);metadata.settings.forEach(s=>s6.put(s));await new Promise((res,rej)=>{t6.oncomplete=res;t6.onerror=e=>rej(e.target.error);});}
      settingsCache=null;invalidateCache();hideProgress();
      const skipMsg=missingCount>0?` (Пропущено отсутствующих: ${missingCount})`:'';
      toast('Готово',`Восстановлено ${totalFiles} файлов.${skipMsg} Перезагрузка...`);
      setTimeout(()=>location.reload(),1500);return;
    }
    const mediaEntries=entries.filter(e=>{if(!e.name||e.name.endsWith('/'))return false;if(!e.data||e.data.length===0)return false;const parts=e.name.split('/');if(parts.some(p=>p.startsWith('__MACOSX')||p.startsWith('.')))return false;const m=e.name.match(/\.([a-z0-9]+)$/i);return m&&ARCHIVE_MIME_MAP[m[1].toLowerCase()]!==undefined;});
    if(mediaEntries.length===0){hideProgress();toast('Пусто','В архиве не найдено фото или видео',true);return;}
    hideProgress();
    if(!await showConfirm('Импорт из ZIP-архива',`Найдено <b>${mediaEntries.length}</b> медиафайлов.<br><br>Импортировать с сохранением структуры папок?`,'Импортировать','Отмена'))return;
    await acquireWakeLock();showProgress('Импорт',3,'Создание папок...','',true);await nextMacrotask();
    const folderPaths=new Set();
    mediaEntries.forEach(e=>{const parts=e.name.split('/');parts.pop();for(let i=1;i<=parts.length;i++)folderPaths.add(parts.slice(0,i).join('/'));});
    const existingFolders=await getAllFolders();const folderMap=new Map();
    const sortedPaths=[...folderPaths].sort((a,b)=>a.split('/').length-b.split('/').length);
    for(const path of sortedPaths){
      const parts=path.split('/');const name=parts[parts.length-1];
      const parentPath=parts.slice(0,-1).join('/');
      const parentId=parentPath?folderMap.get(parentPath):currentFolder;
      const existing=existingFolders.find(f=>f.parentId===parentId&&f.name===name&&!f.deleted);
      let folderId;
      if(existing)folderId=existing.id;
      else{folderId=await addFolder(name,parentId,FOLDER_COLORS[Math.floor(Math.random()*FOLDER_COLORS.length)]);existingFolders.push({id:folderId,name,parentId:parentId??null,deleted:false});}
      folderMap.set(path,folderId);
    }
    const existingFiles=await getAllFiles();
    const existingHashes=new Set(existingFiles.filter(f=>!f.deleted).map(f=>f.hash).filter(h=>h&&!h.startsWith('unique_')));
    const sizesInDb=new Set(existingFiles.filter(f=>!f.deleted).map(f=>f.size||0));
    let imported=0,skipped=0,failed=0;const pendingRecords=[];const importedFiles=[];const FLUSH_SIZE=100;let lastYield=Date.now();
    const flushBatch=async()=>{if(pendingRecords.length===0)return;const batch=pendingRecords.splice(0);await new Promise((res,rej)=>{const tx=db.transaction(SF,'readwrite');const store=tx.objectStore(SF);for(const r of batch)store.add(r);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});};
    for(let i=0;i<mediaEntries.length;i++){
      checkAbort();const entry=mediaEntries[i];const fileName=entry.name.split('/').pop();
      try{
        const parts=entry.name.split('/');parts.pop();const folderPath=parts.join('/');const targetFolderId=folderPath?folderMap.get(folderPath):currentFolder;
        const ext=fileName.split('.').pop().toLowerCase();const mime=ARCHIVE_MIME_MAP[ext]||'';
        const fileObj=new File([entry.data],fileName,{type:mime});
        let hash='';let isDuplicate=false;
        if(sizesInDb.has(entry.data.length)){try{hash=await calculateHash(fileObj);}catch(e){}if(hash&&existingHashes.has(hash))isDuplicate=true;}
        if(isDuplicate){skipped++;}
        else{
          const fileId=generateId();const type=detectType(fileObj);
          const record={fileId,name:fileName,type,mime,size:entry.data.length,date:Date.now(),importedAt:Date.now(),folderId:targetFolderId,hash,deleted:false,deletedAt:null,fav:false};
          if(rootDir){const ok=await writeDataToOPFS(fileId,entry.data);if(!ok)failed++;else{pendingRecords.push(record);importedFiles.push(record);if(hash&&!hash.startsWith('unique_'))existingHashes.add(hash);sizesInDb.add(entry.data.length);imported++;if(pendingRecords.length>=FLUSH_SIZE)await flushBatch();}}
          else{record.blob=fileObj;pendingRecords.push(record);importedFiles.push(record);if(hash&&!hash.startsWith('unique_'))existingHashes.add(hash);sizesInDb.add(entry.data.length);imported++;if(pendingRecords.length>=FLUSH_SIZE)await flushBatch();}
        }
      }catch(err){failed++;}
      const now=Date.now();
      if(now-lastYield>150||i===mediaEntries.length-1){lastYield=now;const eta=formatEta(i+1,mediaEntries.length,performance.now()-t0);showProgress('Импорт',5+Math.round(((i+1)/mediaEntries.length)*90),`${i+1}/${mediaEntries.length}: ${fileName}`,`✓${imported} · ⏭${skipped} · ✗${failed} · ${eta}`);await nextMacrotask();}
    }
    await flushBatch();
    invalidateCache();
    importedFiles.forEach(f=>queueBgThumb(f));
    const elapsed=(performance.now()-t0)/1000;const totalMB=mediaEntries.reduce((s,e)=>s+e.data.length,0)/1048576;const speed=elapsed>0?totalMB/elapsed:0;
    hideProgress();await refresh();toast('Импорт завершён',`${imported} файл. за ${elapsed.toFixed(0)} сек · ${speed.toFixed(1)} МБ/с · пропущено ${skipped}`);
  }catch(e){
    hideProgress();if(e.message==='Отменено пользователем')toast('Отменено','Импорт остановлен');else toast('Ошибка',e.message||'Не удалось обработать архив',true);
  }finally{endAbortableOperation();releaseWakeLock();}
};

$('archiveImportFile').onchange=function(){if(this.files&&this.files[0])importFromArchive(this);};

let ckTarget=null,ckLayout='ru',ckShift=false,ckNumeric=false;
const CK_LAYOUTS={
  ru:[['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],['ф','ы','в','а','п','р','о','л','д','ж','э'],['shift','я','ч','с','м','и','т','ь','б','ю','backspace'],['123','space','enter']],
  en:[['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['shift','z','x','c','v','b','n','m','backspace'],['123','space','enter']],
  num:[['1','2','3','4','5','6','7','8','9','0'],['-','/',':',';','(',')','₽','&','@','"'],['shift','.',',','?','!','\'','backspace'],['abc','space','enter']],
  numpad:[['1','2','3'],['4','5','6'],['7','8','9'],['backspace','0','enter']]
};
let ckLayoutsBuilt=false;
function buildKeyboardDOM(){
  if(ckLayoutsBuilt)return;
  const rowsEl=$('ckRows');rowsEl.innerHTML='';
  for(const [name,layout] of Object.entries(CK_LAYOUTS)){
    const container=document.createElement('div');container.className='ck-layout';container.id='ck-layout-'+name;container.style.display='none';
    layout.forEach(row=>{
      const rowEl=document.createElement('div');rowEl.className='ck-row';
      row.forEach(key=>{
        const btn=document.createElement('button');btn.className='ck-key';btn.type='button';
        if(key==='shift'){btn.classList.add('ck-wide');btn.innerHTML='⇧';btn.dataset.action='shift';}
        else if(key==='backspace'){btn.classList.add('ck-wide');btn.innerHTML='⌫';btn.dataset.action='backspace';}
        else if(key==='space'){btn.classList.add('ck-space');btn.textContent='Пробел';btn.dataset.action='space';}
        else if(key==='enter'){btn.classList.add('ck-wide','ck-enter');btn.innerHTML='↵';btn.dataset.action='enter';}
        else if(key==='123'){btn.classList.add('ck-wide');btn.textContent='123';btn.dataset.action='toNum';}
        else if(key==='abc'){btn.classList.add('ck-wide');btn.textContent='АБВ';btn.dataset.action='toAbc';}
        else{btn.textContent=key;btn.dataset.char=key;}
        rowEl.appendChild(btn);
      });
      container.appendChild(rowEl);
    });
    rowsEl.appendChild(container);
  }
  ckLayoutsBuilt=true;
}
function updateKeyboardKeys(){document.querySelectorAll('.ck-key[data-char]').forEach(btn=>{const c=btn.dataset.char;if(ckShift&&/[a-zа-яё]/i.test(c))btn.textContent=c.toUpperCase();else btn.textContent=c;});document.querySelectorAll('.ck-key[data-action="shift"]').forEach(btn=>btn.classList.toggle('ck-active',ckShift));}
function ckRender(){
  buildKeyboardDOM();
  const activeLayout=ckNumeric?'numpad':ckLayout;
  document.querySelectorAll('.ck-layout').forEach(el=>el.style.display='none');
  const el=$('ck-layout-'+activeLayout);if(el)el.style.display='flex';
  updateKeyboardKeys();
  const lb=$('ckLangBtn'),mb=$('ckModeBtn');
  if(ckNumeric){lb.hidden=true;mb.hidden=true;}
  else{lb.hidden=ckLayout==='num';lb.textContent=ckLayout==='en'?'EN':'РУ';mb.hidden=false;mb.textContent=ckLayout==='num'?'АБВ':'123';}
}
function ckIsTextInput(t){if(!t)return false;if(t.tagName==='TEXTAREA')return true;if(t.tagName!=='INPUT')return false;const type=(t.type||'text').toLowerCase();if(['file','range','checkbox','radio','button','submit','reset','color','date','time','datetime-local','month','week'].includes(type))return false;return true;}
function ckDetectNumeric(input){if(input.type==='password')return true;const im=input.getAttribute('inputmode');return im==='numeric'||im==='decimal'||im==='tel';}
function ckShow(input){
  ckTarget=input;ckNumeric=ckDetectNumeric(input);ckShift=false;ckLayout=ckNumeric?'num':'ru';
  if(input.dataset.ckOrigInputmode===undefined)input.dataset.ckOrigInputmode=input.getAttribute('inputmode')||'';
  input.setAttribute('inputmode','none');
  ckRender();
  $('customKeyboard').classList.add('ck-on');document.body.classList.add('kb-open');
  const modal=input.closest('.modal');if(modal)modal.classList.add('kb-open');
  setTimeout(()=>{try{input.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}},120);
}
function ckHide(blur=true){
  if(ckTarget&&ckTarget.dataset.ckOrigInputmode!==undefined){const orig=ckTarget.dataset.ckOrigInputmode;if(orig)ckTarget.setAttribute('inputmode',orig);else ckTarget.removeAttribute('inputmode');delete ckTarget.dataset.ckOrigInputmode;}
  if(blur&&ckTarget&&document.activeElement===ckTarget){try{ckTarget.blur();}catch(e){}}
  ckTarget=null;
  $('customKeyboard').classList.remove('ck-on');document.body.classList.remove('kb-open');
  document.querySelectorAll('.modal.kb-open').forEach(m=>m.classList.remove('kb-open'));
}
function ckInsert(ch){
  if(!ckTarget)return;
  const el=ckTarget;
  const max=el.maxLength;
  const start=el.selectionStart??el.value.length;
  const end=el.selectionEnd??el.value.length;
  if(max>0&&start===end&&el.value.length>=max)return;
  el.value=(el.value||'').slice(0,start)+ch+(el.value||'').slice(end);
  try{el.setSelectionRange(start+ch.length,start+ch.length);}catch(e){}
  el.dispatchEvent(new Event('input',{bubbles:true}));
}
function ckBackspace(){
  if(!ckTarget)return;
  const el=ckTarget;const start=el.selectionStart??el.value.length;const end=el.selectionEnd??el.value.length;
  if(start!==end){el.value=el.value.slice(0,start)+el.value.slice(end);try{el.setSelectionRange(start,start);}catch(e){}}
  else if(start>0){el.value=el.value.slice(0,start-1)+el.value.slice(start);try{el.setSelectionRange(start-1,start-1);}catch(e){}}
  el.dispatchEvent(new Event('input',{bubbles:true}));
}
function ckEnter(){if(!ckTarget)return;ckTarget.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));setTimeout(()=>ckHide(true),80);}
document.addEventListener('pointerdown',(e)=>{
  const key=e.target.closest('.ck-key');if(!key)return;
  e.preventDefault();if(!ckTarget)return;playSound('click');
  const a=key.dataset.action,ch=key.dataset.char;
  if(a==='shift'){ckShift=!ckShift;updateKeyboardKeys();}
  else if(a==='backspace')ckBackspace();
  else if(a==='space')ckInsert(' ');
  else if(a==='enter')ckEnter();
  else if(a==='toNum'){ckLayout='num';ckRender();}
  else if(a==='toAbc'){ckLayout='ru';ckRender();}
  else if(ch!==undefined){const c=(ckShift&&/[a-zа-яё]/i.test(ch))?ch.toUpperCase():ch;ckInsert(c);if(ckShift&&/[a-zа-яё]/i.test(ch)){ckShift=false;updateKeyboardKeys();}}
},{passive:false});
$('ckDoneBtn').addEventListener('pointerdown',(e)=>{e.preventDefault();playSound('click');ckHide(true);});
$('ckLangBtn').addEventListener('pointerdown',(e)=>{e.preventDefault();playSound('click');ckLayout=(ckLayout==='en')?'ru':'en';ckShift=false;ckRender();});
$('ckModeBtn').addEventListener('pointerdown',(e)=>{e.preventDefault();playSound('click');ckLayout=(ckLayout==='num')?'ru':'num';ckShift=false;ckRender();});
document.addEventListener('focusin',(e)=>{const t=e.target;if(!ckIsTextInput(t))return;if(t===ckTarget)return;ckShow(t);});
$('lockInput')&&$('lockInput').addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();$('lockBtn')&&$('lockBtn').click();}});
document.addEventListener('pointerdown',(e)=>{if(!ckTarget)return;if(e.target.closest('.ck'))return;if(e.target===ckTarget)return;if(ckIsTextInput(e.target))return;ckHide(true);},{passive:true});

document.querySelectorAll('.modal:not(.custom-confirm) .box').forEach(box=>{
  let sy=0,cy=0,dragging=false;
  box.addEventListener('touchstart',(e)=>{if(e.target.closest('input, button, select, textarea, .ck, .theme-item, .list-item, .settings-btn'))return;if(box.scrollTop>0)return;sy=e.touches[0].clientY;dragging=true;box.style.transition='none';},{passive:true});
  box.addEventListener('touchmove',(e)=>{if(!dragging)return;cy=e.touches[0].clientY;const dy=cy-sy;if(dy>0&&box.scrollTop===0){if(e.cancelable)e.preventDefault();box.style.transform=`translateY(${dy}px)`;}else if(dy<0){dragging=false;box.style.transform='';box.style.transition='';}},{passive:false});
  box.addEventListener('touchend',()=>{
    if(!dragging)return;
    dragging=false;
    const dy=cy-sy;
    box.style.transition='transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
    if(dy>100){
      box.style.transform='translateY(100%)';
      setTimeout(()=>{
        const modal=box.closest('.modal');
        modal.classList.remove('on');
        if(modal && modal.id==='modalEdit'){ editId=null; editIsFolder=true; }
        box.style.transform='';box.style.transition='';
      },300);
    }else{
      box.style.transform='translateY(0)';
      setTimeout(()=>{box.style.transition='';},300);
    }
    sy=0;cy=0;
  });
  box.addEventListener('touchcancel',()=>{dragging=false;box.style.transform='';box.style.transition='';sy=0;cy=0;});
});

window.openGithub=function(e){if(e&&e.preventDefault)e.preventDefault();const url=(e&&e.currentTarget&&e.currentTarget.href)||'https://github.com/Ravi8O8/Krypta';try{const w=window.open(url,'_blank','noopener,noreferrer');if(!w||w.closed||typeof w.closed==='undefined')window.location.href=url;}catch(err){try{window.location.href=url;}catch(_){}}};

function setupAndroidBackButton(){
  if(!(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App))return;
  try{
    window.Capacitor.Plugins.App.addListener('backButton',async()=>{
      if($('viewerModal').classList.contains('on')){
  viewerToken++; slideToken++; stopSlideshow();
  $('viewerModal').classList.remove('on');
  $('viewerContent').innerHTML='';
  $('viewerDelete').style.display='none';
  if($('viewerModal').dataset.url){URL.revokeObjectURL($('viewerModal').dataset.url);delete $('viewerModal').dataset.url;}
  return;
}
      if($('modalSettings').classList.contains('on')){$('modalSettings').classList.remove('on');return;}
      if($('modalInfo').classList.contains('on')){$('modalInfo').classList.remove('on');return;}
      if($('modalConfirm').classList.contains('on')){$('confirmCancel').click();return;}
      if($('modalEdit').classList.contains('on')){$('meCancel').click();return;}
      if($('modalMove').classList.contains('on')){$('mvCancel').click();return;}
      if($('modalSort').classList.contains('on')){$('modalSort').classList.remove('on');return;}
      if($('modalDuplicates').classList.contains('on')){$('modalDuplicates').classList.remove('on');return;}
      if($('modalCompressResult').classList.contains('on')){$('modalCompressResult').classList.remove('on');return;}
      if($('modalPinChange').classList.contains('on')){$('pinChangeCancel').click();return;}
      if(ckTarget){ckHide(true);return;}
      if(sel.size+folderSel.size>0){clearSel();return;}
      if(viewMode==='trash'){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));const filesTab=document.querySelector('.tab[data-view="files"]');if(filesTab)filesTab.classList.add('active');viewMode='files';filterType='all';document.body.dataset.view='files';await setSetting('viewMode','files');await setSetting('filterType','all');refresh();return;}
      if(currentFolder!==null){const cur=allActiveFoldersCache.find(f=>f.id===currentFolder);currentFolder=cur?cur.parentId:null;await setSetting('currentFolder',currentFolder);clearSel();refresh();return;}
      try{window.Capacitor.Plugins.App.exitApp();}catch(_){}
    });
  }catch(e){}
}

let _ptrStartY = 0;
let _ptrCurrentY = 0;
let _ptrPulling = false;
let _ptrActive = false;
let _ptrLoading = false;
const _ptrThreshold = 60;

function _ptrReset() {
  const el = $('ptr');
  if (!el) return;
  el.classList.remove('visible', 'ready', 'loading');
  el.style.transform = '';
  el.style.opacity = '';
  _ptrPulling = false;
  _ptrActive = false;
}

function setupPullToRefresh() {
  if (!$('ptr')) return;

  document.addEventListener('touchstart', (e) => {
    if (_ptrLoading) return;
    if (window.scrollY > 0) return;
    if (isLocked) return;
    if (document.body.classList.contains('selecting')) return;
    if ($('viewerModal') && $('viewerModal').classList.contains('on')) return;
    if (ckTarget) return;
    if (document.querySelector('.modal.on')) return;
    if (!e.touches[0]) return;
    if (e.target.closest('.ck')) return;
    if (e.target.closest('#bar')) return;
    if (e.target.closest('#ctxMenu')) return;
    if (e.target.closest('.btn-icon')) return;
    if (e.target.closest('.btn-scope')) return;
    if (e.target.closest('.tab')) return;
    if (e.target.closest('input, textarea, button')) return;

    _ptrStartY = e.touches[0].clientY;
    _ptrCurrentY = _ptrStartY;
    _ptrActive = true;
    _ptrPulling = false;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!_ptrActive || _ptrLoading) return;
    if (!e.touches[0]) return;

    if (window.scrollY > 0) { _ptrActive = false; _ptrReset(); return; }

    _ptrCurrentY = e.touches[0].clientY;
    const dy = _ptrCurrentY - _ptrStartY;

    if (dy <= 0) {
      if (_ptrPulling) _ptrReset();
      _ptrActive = false;
      return;
    }

    if (!_ptrPulling && dy > 10) _ptrPulling = true;
    if (!_ptrPulling) return;

    if (e.cancelable) e.preventDefault();

    const progress = Math.min(dy / _ptrThreshold, 1);
    const el = $('ptr');
    el.style.opacity = String(Math.min(dy / 30, 1));
    el.style.transform = `scale(${0.4 + progress * 0.75})`;
    el.classList.add('visible');
    el.classList.toggle('ready', dy >= _ptrThreshold);
  }, { passive: false });

  const finishPtr = async () => {
    if (!_ptrActive) return;
    if (!_ptrPulling) { _ptrActive = false; return; }

    const dy = _ptrCurrentY - _ptrStartY;
    _ptrPulling = false;
    _ptrActive = false;

    if (dy >= _ptrThreshold) {
      _ptrLoading = true;
      const el = $('ptr');
      el.classList.add('loading');
      el.classList.remove('ready');
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
      playSound('swipe');
      try {
        invalidateCache();
        await refresh();
        playSound('success');
      } catch (err) {
        toast('Ошибка', 'Не удалось обновить', true);
      } finally {
        setTimeout(() => {
          _ptrLoading = false;
          el.classList.remove('loading');
          _ptrReset();
        }, 300);
      }
    } else {
      _ptrReset();
    }
  };

  document.addEventListener('touchend', finishPtr, { passive: true });
  document.addEventListener('touchcancel', () => { _ptrLoading = false; _ptrReset(); }, { passive: true });
}

(async()=>{
  const steps = [
    ['initOPFS', initOPFS],
    ['openDB', openDB],
    ['cleanupPendingWrites', cleanupPendingWrites],
    ['cleanupOrphans', cleanupOrphans],
    ['loadTheme', loadTheme],
    ['restoreState', restoreState],
    ['checkLock', checkLock],
  ];
  let lastStep = 'start';
  try{
    for (const [name, fn] of steps) {
      lastStep = name;
      await fn();
    }
    setupAndroidBackButton();
    setupPullToRefresh();
    setTimeout(()=>{autoCleanTrash().catch(()=>{});},3000);
    setTimeout(()=>{virtualState.lastRange=[-1,-1];updateVirtualGrid();},200);
  }catch(e){
    document.body.innerHTML='<div style="padding:20px;text-align:left;color:#f87171;font-family:monospace;font-size:12px;white-space:pre-wrap;line-height:1.5;">ОШИБКА на шаге ['+lastStep+']:\n\n'+e.message+'\n\n'+(e.stack||'')+'</div>';
  }
})();
