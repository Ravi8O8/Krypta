const DB_NAME='MediaVault_Final', DB_VERSION=33;
const SF='files', SFL='folders', SS='settings';
const THUMB_PREFIX = 'thumb_';
const DEFAULT_SLIDESHOW_MS = 3000;
const DEFAULT_TRASH_DAYS = 30;
const PREVIEW_CACHE_MAX = 200;

const ICONS = {
  image: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  video: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  home: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  folderIcon: '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  imageIcon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  checkSmall: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:6px;"><polyline points="20 6 9 17 4 12"/></svg>',
  trashSmall: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--mut)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:6px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  xSmall: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

const FOLDER_COLORS = ['#a78bfa','#f87171','#34d399','#fbbf24','#60a5fa','#ec4899','#818cf8','#94a3b8'];
let selectedFolderColor = FOLDER_COLORS[0];

let db, currentFolder=null, filterType='all', searchQuery='';
let searchScope = 'current';
let viewMode = 'files';
let sel=new Set(), folderSel=new Set();
const failedVideoThumbs = new Set();
let sortBy='date_desc', isLocked=false, storedHash='', storedSalt='';
let pressTimer=null, isLongPress=false;
let galleryFiles=[], currentGalleryIndex=0;
let rootDir = null;
let slideshowTimer = null;
let slideshowActive = false;
let slideshowInterval = DEFAULT_SLIDESHOW_MS;
let currentScale = 1;
let viewerToken = 0, slideToken = 0;
let currentFilesCache = [], currentFoldersCache = [], allActiveFilesCache = [], allActiveFoldersCache = [], trashFilesCache = [], trashFoldersCache = [];
let startX = 0, startY = 0, isScrolling = false;
let scrollTimeout = null, scrollRaf = null;
let editIsFolder = true, editId = null, moveMode = 'move';
let isDragSelecting = false, lastHoveredTile = null, lastDragTime = 0;
let searchTimer = null;
let lastScrollTime = 0;
let bgThumbQueue = [], bgThumbRunning = false;
let wakeLock = null, isAppInBackground = false;
let soundEnabled = true, folderPreviewEnabled = true, audioCtx = null;
let currentOperation = null, lastProgressUpdate = 0, _keepAliveTimer = null;

const filePreviewCache = new Map();
const folderPreviewCache = new Map();
function cacheGetPreview(map, key) {
  const e = map.get(key);
  if (!e) return undefined;
  e.lastAccess = Date.now();
  return e.url;
}
function cacheSetPreview(map, key, url) {
  map.set(key, { url, lastAccess: Date.now() });
  if (map.size > PREVIEW_CACHE_MAX) {
    let oldestKey = null, oldestTime = Infinity;
    for (const [k, v] of map) if (v.lastAccess < oldestTime) { oldestTime = v.lastAccess; oldestKey = k; }
    if (oldestKey !== null) {
      const old = map.get(oldestKey);
      try { URL.revokeObjectURL(old.url); } catch(e) {}
      map.delete(oldestKey);
    }
  }
}
function cacheRemovePreview(map, key) {
  const e = map.get(key);
  if (e) { try { URL.revokeObjectURL(e.url); } catch(_) {} map.delete(key); }
}
function cacheClearAll() {
  for (const [, v] of filePreviewCache) try { URL.revokeObjectURL(v.url); } catch(e) {}
  for (const [, v] of folderPreviewCache) try { URL.revokeObjectURL(v.url); } catch(e) {}
  filePreviewCache.clear();
  folderPreviewCache.clear();
}

let virtualState = { items: [], cols: 3, rowHeight: 0, paddingTop: 16, lastRange: [-1, -1] };

function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
function playSound(type) {
  if (!soundEnabled) return; initAudio(); if (!audioCtx) return;
  const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  if (type === 'click') { osc.type='sine'; osc.frequency.setValueAtTime(1200,now); gain.gain.setValueAtTime(0.1,now); gain.gain.exponentialRampToValueAtTime(0.001,now+0.05); osc.start(now); osc.stop(now+0.05); if (navigator.vibrate) navigator.vibrate(10); }
  else if (type === 'success') { osc.type='triangle'; osc.frequency.setValueAtTime(600,now); osc.frequency.setValueAtTime(900,now+0.1); gain.gain.setValueAtTime(0.1,now); gain.gain.exponentialRampToValueAtTime(0.001,now+0.3); osc.start(now); osc.stop(now+0.3); if (navigator.vibrate) navigator.vibrate([20,50,20]); }
  else if (type === 'error') { osc.type='sawtooth'; osc.frequency.setValueAtTime(200,now); gain.gain.setValueAtTime(0.15,now); gain.gain.exponentialRampToValueAtTime(0.001,now+0.3); osc.start(now); osc.stop(now+0.3); if (navigator.vibrate) navigator.vibrate([50,100,50]); }
  else if (type === 'swipe') { osc.type='sine'; osc.frequency.setValueAtTime(800,now); osc.frequency.exponentialRampToValueAtTime(1200,now+0.05); gain.gain.setValueAtTime(0.05,now); gain.gain.exponentialRampToValueAtTime(0.001,now+0.05); osc.start(now); osc.stop(now+0.05); if (navigator.vibrate) navigator.vibrate(5); }
}

window.toggleSound = async () => { soundEnabled = !soundEnabled; document.getElementById('swSound').classList.toggle('on', soundEnabled); await setSetting('soundEnabled', soundEnabled); if (soundEnabled) playSound('success'); };
window.toggleFolderPreview = async () => {
  folderPreviewEnabled = !folderPreviewEnabled;
  const sw = document.getElementById('swFolderPreview'); if (sw) sw.classList.toggle('on', folderPreviewEnabled);
  await setSetting('folderPreviewEnabled', folderPreviewEnabled);
  virtualState.lastRange = [-1,-1];
  renderGrid(true);
  toast(folderPreviewEnabled ? 'Превью папок' : 'Превью папок', folderPreviewEnabled ? 'Включено' : 'Отключено');
};

document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button') || e.target.closest('.tab') || e.target.closest('.ctx-item') || e.target.closest('.theme-item') || e.target.closest('.font-opt') || e.target.closest('.pill') || e.target.closest('.settings-btn')) {
    if (!e.target.closest('.ck-key') && !e.target.closest('#confirmOk') && !e.target.closest('#confirmCancel')) playSound('click');
  }
}, { passive: true });

window.addEventListener('beforeunload', (e) => { if (currentOperation) { e.preventDefault(); e.returnValue = ''; return ''; } });

let settingsCache = null;
async function getAllSettings() { if (settingsCache !== null) return settingsCache; const all = await p(st(SS, 'readonly').getAll()); settingsCache = {}; all.forEach(s => { settingsCache[s.key] = s.value; }); return settingsCache; }
async function getSetting(k) { const s = await getAllSettings(); return s[k] ?? null; }
async function setSetting(k, v) { if (settingsCache !== null) settingsCache[k] = v; return p(st(SS, 'readwrite').put({key: k, value: v})); }

const PBKDF2_WORKER_CODE = `self.onmessage = async (e) => { const { id, type, password, saltHex, iterations } = e.data; try { const hexToBytes = (hex) => { const arr = new Uint8Array(hex.length / 2); for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.substr(i, 2), 16); return arr; }; const bytesToHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''); const enc = new TextEncoder(); const salt = hexToBytes(saltHex); const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']); const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations, hash:'SHA-256'}, keyMaterial, 256); self.postMessage({ id, result: bytesToHex(bits) }); } catch (err) { self.postMessage({ id, error: err.message || String(err) }); } };`;
let pbkdf2Worker = null, pbkdf2Pending = new Map(), pbkdf2NextId = 1;
function getPbkdf2Worker() {
  if (pbkdf2Worker !== null) return pbkdf2Worker;
  try {
    const blob = new Blob([PBKDF2_WORKER_CODE], { type: 'application/javascript' });
    pbkdf2Worker = new Worker(URL.createObjectURL(blob));
    pbkdf2Worker.onmessage = (e) => { const { id, result, error } = e.data; const h = pbkdf2Pending.get(id); if (!h) return; pbkdf2Pending.delete(id); if (error) h.reject(new Error(error)); else h.resolve(result); };
    pbkdf2Worker.onerror = () => { const pending = [...pbkdf2Pending.values()]; pbkdf2Pending.clear(); pending.forEach(h => h.reject(new Error('Worker failed'))); try { pbkdf2Worker.terminate(); } catch(e){} pbkdf2Worker = null; };
  } catch (e) { pbkdf2Worker = false; }
  return pbkdf2Worker;
}
function pbkdf2Run(type, password, saltHex, iterations) {
  const w = getPbkdf2Worker(); if (!w) return Promise.reject(new Error('Worker unavailable'));
  return new Promise((resolve, reject) => { const id = pbkdf2NextId++; pbkdf2Pending.set(id, { resolve, reject }); w.postMessage({ id, type, password, saltHex, iterations }); });
}

const nextMacrotask = (() => {
  if (typeof scheduler !== 'undefined' && scheduler && typeof scheduler.postTask === 'function') {
    return () => new Promise((resolve) => { try { scheduler.postTask(resolve, { priority: 'user-blocking' }); } catch (e) { setTimeout(resolve, 0); } });
  }
  return () => new Promise(r => { const ch = new MessageChannel(); ch.port1.onmessage = () => { try { ch.port1.close(); } catch(e){} r(); }; ch.port2.postMessage(0); });
})();

let _kaEl = null, _kaRaf = null, _kaRunning = false, _kaI = 0;
function startKeepAlive() {
  if (_kaRunning) return; _kaRunning = true;
  if (!_kaEl) { _kaEl = document.createElement('div'); _kaEl.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px;pointer-events:none;opacity:0.001;z-index:-1;will-change:transform;contain:strict;'; document.body.appendChild(_kaEl); }
  const tick = () => { if (!_kaRunning) return; _kaI = (_kaI + 1) % 2000; _kaEl.style.transform = `translate3d(${_kaI}px,0,0)`; _kaRaf = requestAnimationFrame(tick); };
  _kaRaf = requestAnimationFrame(tick);
}
function stopKeepAlive() { _kaRunning = false; if (_kaRaf) { cancelAnimationFrame(_kaRaf); _kaRaf = null; } }

async function acquireWakeLock() { try { if ('wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } } catch(e) {} }
function releaseWakeLock() { try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch(e) {} }
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) { isAppInBackground = true; releaseWakeLock(); if (slideshowTimer) clearTimeout(slideshowTimer); }
  else { isAppInBackground = false; acquireWakeLock(); if (!isLocked) { virtualState.lastRange = [-1,-1]; await refresh(); } }
});

const $ = id => document.getElementById(id);
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatEta(c, t, e) { if (c <= 0 || t <= 0 || e <= 0) return '...'; const avg = e / c; const rem = (t - c) * avg; if (rem < 1000) return '...'; const s = Math.round(rem/1000); return s < 60 ? `~${s} сек` : `~${Math.round(s/60)} мин`; }

function showProgress(title, percent, file, eta, force = false) {
  const now = Date.now(); const isMilestone = (percent === 0 || percent === 100);
  if (!force && !isMilestone && now - lastProgressUpdate < 200 && $('progressDrawer').classList.contains('on')) return;
  lastProgressUpdate = now;
  $('progTitle').textContent = title; $('progPercent').textContent = percent + '%';
  $('progFill').style.width = percent + '%'; $('progFile').textContent = file; $('progEta').textContent = eta;
  $('progressDrawer').classList.add('on');
  if (!_keepAliveTimer && !_kaRunning) _keepAliveTimer = setTimeout(() => { _keepAliveTimer = null; startKeepAlive(); }, 1000);
}
function hideProgress() { if (_keepAliveTimer) { clearTimeout(_keepAliveTimer); _keepAliveTimer = null; } stopKeepAlive(); $('progressDrawer').classList.remove('on'); lastProgressUpdate = 0; }

function startAbortableOperation(type, title) { currentOperation = { type, title, abort: false }; $('progCancelBtn').style.display = 'flex'; }
function endAbortableOperation() { currentOperation = null; $('progCancelBtn').style.display = 'none'; }
function checkAbort() { if (currentOperation && currentOperation.abort) throw new Error('Отменено пользователем'); }
$('progCancelBtn').onclick = () => { if (currentOperation && !currentOperation.abort) { currentOperation.abort = true; $('progTitle').textContent = 'Отмена...'; $('progCancelBtn').style.display = 'none'; } };

async function checkFreeSpace(requiredBytes, label) {
  if (!navigator.storage || !navigator.storage.estimate) return true;
  try {
    const est = await navigator.storage.estimate();
    const quota = est.quota || 0, usage = est.usage || 0;
    if (quota <= 0) return true;
    const free = quota - usage;
    if (free < requiredBytes * 1.15) {
      return await showConfirm('Мало места', `${label}: свободно <b>${(free/1048576).toFixed(0)} МБ</b>, нужно <b>${(requiredBytes*1.15/1048576).toFixed(0)} МБ</b>.<br><br>Продолжить на свой риск?`, 'Продолжить', 'Отмена');
    }
    return true;
  } catch(e) { return true; }
}

let pendingUndo = null;
function toast(title, sub='', isError=false) {
  if (pendingUndo) { clearTimeout(pendingUndo.timer); pendingUndo = null; }
  const t = $('toast'); t.classList.remove('with-action');
  t.innerHTML = `<div class="toast-title ${isError?'error':''}">${escapeHtml(title)}</div><div class="toast-sub">${escapeHtml(sub)}</div>`;
  t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 4000);
  if (isError) playSound('error'); else playSound('success');
}
function showUndoToast(title, sub, onUndo, duration = 5000) {
  if (pendingUndo) { clearTimeout(pendingUndo.timer); pendingUndo = null; }
  const t = $('toast');
  t.innerHTML = `<div class="toast-title">${escapeHtml(title)}</div>${sub ? `<div class="toast-sub">${escapeHtml(sub)}</div>` : ''}<button type="button" class="toast-action" id="toastUndoBtn">Отменить</button>`;
  t.classList.add('on', 'with-action'); clearTimeout(t._h);
  const btn = t.querySelector('#toastUndoBtn'); let executed = false;
  const doUndo = async () => { if (executed) return; executed = true; if (pendingUndo) { clearTimeout(pendingUndo.timer); pendingUndo = null; } t.classList.remove('on', 'with-action'); try { await onUndo(); } catch (e) { toast('Ошибка', 'Не удалось отменить', true); } };
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); doUndo(); });
  const timer = setTimeout(() => { pendingUndo = null; t.classList.remove('on', 'with-action'); }, duration);
  pendingUndo = { timer, doUndo, executed: false };
}

function showConfirm(title, text, okText = 'ОК', cancelText = 'Отмена') {
  return new Promise(resolve => {
    const modal = $('modalConfirm'), btnOk = $('confirmOk'), btnCancel = $('confirmCancel');
    $('confirmTitle').textContent = title; $('confirmText').innerHTML = text;
    btnOk.textContent = okText; btnCancel.textContent = cancelText;
    const cleanup = () => { modal.classList.remove('on'); btnOk.onclick = null; btnCancel.onclick = null; };
    btnOk.onclick = () => { playSound('click'); cleanup(); resolve(true); };
    btnCancel.onclick = () => { playSound('click'); cleanup(); resolve(false); };
    modal.style.zIndex = '99999'; modal.classList.add('on');
  });
}

const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let c=i; for (let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[i]=c>>>0; } return t; })();
function isCapacitorNative() { return window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform(); }

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function createOutputStream(filename) {
  if (window.showSaveFilePicker && !isCapacitorNative()) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: filename });
      const fileStream = await handle.createWritable();
      return { write: (c) => fileStream.write(c), close: async () => { await fileStream.close(); return { uri: null, name: filename, size: 0 }; }, abort: async () => { try { await fileStream.abort(); } catch(e) {} } };
    } catch (e) { if (e.name === 'AbortError') return null; }
  }
  if (isCapacitorNative()) {
    try {
      const { Filesystem } = window.Capacitor.Plugins;
      const safeName = String(filename || 'export.zip').replace(/[\/\\:*?"<>|]/g, '_');
      const path = `export_${Date.now()}_${safeName}`;
      const directory = 'DOCUMENTS';
      try { await Filesystem.deleteFile({ path, directory }); } catch(e) {}
      let buffer = [], bufferSize = 0; const TARGET = 4 * 1024 * 1024;
      let isFirst = true, writeChain = Promise.resolve(), bytesWritten = 0, aborted = false;
      const flush = async (force = false) => {
        if (aborted || bufferSize === 0) return; if (!force && bufferSize < TARGET) return;
        const parts = buffer; buffer = []; bufferSize = 0;
        const base64 = await blobToBase64(new Blob(parts));
        if (aborted) return;
        if (isFirst) { await Filesystem.writeFile({ path, data: base64, directory, recursive: true }); isFirst = false; }
        else await Filesystem.appendFile({ path, data: base64, directory });
      };
      return {
        write: (chunk) => { writeChain = writeChain.then(async () => { if (aborted) return; const b = chunk instanceof Blob ? chunk : new Blob([chunk]); buffer.push(b); bufferSize += b.size; bytesWritten += b.size; await flush(); }); return writeChain; },
        close: async () => { await writeChain; await flush(true); const { uri } = await Filesystem.getUri({ path, directory }); return { uri, name: safeName, size: bytesWritten }; },
        abort: async () => { aborted = true; try { await writeChain; } catch(_) {} try { await Filesystem.deleteFile({ path, directory }); } catch(e) {} }
      };
    } catch (e) { return null; }
  }
  return null;
}

async function writeStreamingZip(writable, items, onProgress) {
  const enc = new TextEncoder(); const centralDir = []; let offset = 0, lastYield = Date.now(), count = 0;
  for (let i = 0; i < items.length; i++) {
    checkAbort();
    const item = items[i]; let blob = item.getBlob ? await item.getBlob() : item.blob; if (!blob) continue;
    const nameBytes = enc.encode(item.name); const size = blob.size; const needZip64Size = size > 0xFFFFFFFE;
    const lfh = new Uint8Array(30 + nameBytes.length); const lfhDV = new DataView(lfh.buffer);
    lfhDV.setUint32(0, 0x04034b50, true); lfhDV.setUint16(4, needZip64Size ? 45 : 20, true); lfhDV.setUint16(6, 0x0808, true);
    lfhDV.setUint16(8, 0, true); lfhDV.setUint16(10, 0, true); lfhDV.setUint16(12, 0, true);
    lfhDV.setUint32(14, 0, true); lfhDV.setUint32(18, 0, true); lfhDV.setUint32(22, 0, true);
    lfhDV.setUint16(26, nameBytes.length, true); lfhDV.setUint16(28, 0, true); lfh.set(nameBytes, 30);
    const localHeaderOffset = offset; await writable.write(lfh); offset += lfh.length;
    let crc = 0xFFFFFFFF; const reader = blob.stream().getReader();
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      for (let j = 0; j < value.length; j++) crc = CRC_TABLE[(crc ^ value[j]) & 0xFF] ^ (crc >>> 8);
      await writable.write(value); offset += value.length;
      if (Date.now() - lastYield > 200) { lastYield = Date.now(); if (onProgress) onProgress(count, items.length, item.name, offset); await nextMacrotask(); }
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    const ddLen = needZip64Size ? 24 : 16;
    const dd = new Uint8Array(ddLen); const ddDV = new DataView(dd.buffer);
    ddDV.setUint32(0, 0x08074b50, true); ddDV.setUint32(4, crc, true);
    if (needZip64Size) { ddDV.setBigUint64(8, BigInt(size), true); ddDV.setBigUint64(16, BigInt(size), true); }
    else { ddDV.setUint32(8, size, true); ddDV.setUint32(12, size, true); }
    await writable.write(dd); offset += ddLen;
    const needZip64Offset = localHeaderOffset > 0xFFFFFFFE;
    let extraDataLen = 0; if (needZip64Size) extraDataLen += 16; if (needZip64Offset) extraDataLen += 8;
    const extraFieldLen = extraDataLen > 0 ? extraDataLen + 4 : 0;
    const cd = new Uint8Array(46 + nameBytes.length + extraFieldLen); const cdDV = new DataView(cd.buffer);
    const verNeeded = (needZip64Size || needZip64Offset) ? 45 : 20;
    cdDV.setUint32(0, 0x02014b50, true); cdDV.setUint16(4, verNeeded, true); cdDV.setUint16(6, verNeeded, true); cdDV.setUint16(8, 0x0808, true);
    cdDV.setUint16(10, 0, true); cdDV.setUint16(12, 0, true); cdDV.setUint16(14, 0, true);
    cdDV.setUint32(16, crc, true); cdDV.setUint32(20, needZip64Size ? 0xFFFFFFFF : size, true); cdDV.setUint32(24, needZip64Size ? 0xFFFFFFFF : size, true);
    cdDV.setUint16(28, nameBytes.length, true); cdDV.setUint16(30, extraFieldLen, true);
    cdDV.setUint32(42, needZip64Offset ? 0xFFFFFFFF : localHeaderOffset, true); cd.set(nameBytes, 46);
    if (extraFieldLen > 0) {
      const eo = 46 + nameBytes.length;
      cdDV.setUint16(eo, 0x0001, true); cdDV.setUint16(eo + 2, extraDataLen, true);
      let dp = eo + 4;
      if (needZip64Size) { cdDV.setBigUint64(dp, BigInt(size), true); cdDV.setBigUint64(dp + 8, BigInt(size), true); dp += 16; }
      if (needZip64Offset) { cdDV.setBigUint64(dp, BigInt(localHeaderOffset), true); dp += 8; }
    }
    centralDir.push(cd); count++;
    if (item.blob) item.blob = null; if (item.getBlob) item.getBlob = null;
    if (onProgress) onProgress(count, items.length, item.name, offset);
    await nextMacrotask();
  }
  const cdStart = offset;
  for (const entry of centralDir) { await writable.write(entry); offset += entry.length; }
  const cdSize = offset - cdStart;
  const needsZip64 = offset > 0xFFFFFFFE || cdStart > 0xFFFFFFFE || count >= 0xFFFF;
  if (needsZip64) {
    const z64Offset = offset; const z64 = new Uint8Array(56); const z64DV = new DataView(z64.buffer);
    z64DV.setUint32(0, 0x06064b50, true); z64DV.setBigUint64(4, 44n, true); z64DV.setUint16(12, 45, true); z64DV.setUint16(14, 45, true);
    z64DV.setBigUint64(24, BigInt(count), true); z64DV.setBigUint64(32, BigInt(count), true); z64DV.setBigUint64(40, BigInt(cdSize), true); z64DV.setBigUint64(48, BigInt(cdStart), true);
    await writable.write(z64); offset += 56;
    const loc = new Uint8Array(20); const locDV = new DataView(loc.buffer);
    locDV.setUint32(0, 0x07064b50, true); locDV.setBigUint64(8, BigInt(z64Offset), true); locDV.setUint32(16, 1, true);
    await writable.write(loc); offset += 20;
  }
  const eocd = new Uint8Array(22); const eocdDV = new DataView(eocd.buffer);
  eocdDV.setUint32(0, 0x06054b50, true);
  eocdDV.setUint16(8, needsZip64 ? 0xFFFF : count, true);
  eocdDV.setUint16(10, needsZip64 ? 0xFFFF : count, true);
  eocdDV.setUint32(12, needsZip64 ? 0xFFFFFFFF : cdSize, true);
  eocdDV.setUint32(16, needsZip64 ? 0xFFFFFFFF : cdStart, true);
  await writable.write(eocd);
}

function sanitizeName(name) { return String(name || 'file').replace(/[\/\\:*?"<>|\x00-\x1f]/g, '_'); }

async function extractExifDate(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) return null;
  if (file.size < 32) return null;
  try {
    const head = new Uint8Array(await file.slice(0, Math.min(file.size, 128 * 1024)).arrayBuffer());
    if (head[0] === 0xFF && head[1] === 0xD8) {
      const str = new TextDecoder('latin1').decode(head);
      const m = str.match(/(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2})[:\-](\d{2})[:\-](\d{2})/);
      if (m) {
        const ts = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
        if (!isNaN(ts) && ts >= Date.UTC(1990) && ts <= Date.now() + 86400000) return ts;
      }
    }
    if (file.lastModified && file.lastModified >= Date.UTC(1990) && file.lastModified <= Date.now() + 86400000) return file.lastModified;
  } catch(e) {}
  return null;
}

async function generateImageThumbnail(file, maxSize = 300) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const w0 = bitmap.width, h0 = bitmap.height;
      if (!w0 || !h0) { try { bitmap.close(); } catch(e){} throw new Error('no dims'); }
      let w = w0, h = h0;
      if (w > h) { h = Math.round(h0 * maxSize / w0); w = maxSize; }
      else { w = Math.round(w0 * maxSize / h0); h = maxSize; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      try { bitmap.close(); } catch(e) {}
      return await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.75));
    } catch (e) {}
  }
  return new Promise((resolve) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    const timeout = setTimeout(() => { URL.revokeObjectURL(url); resolve(null); }, 10000);
    img.onload = () => {
      clearTimeout(timeout);
      try {
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob); }, 'image/jpeg', 0.75);
      } catch(e) { URL.revokeObjectURL(url); resolve(null); }
    };
    img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

async function generateVideoThumbnail(file, maxSize = 300) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto'; video.muted = true; video.playsInline = true;
    const url = URL.createObjectURL(file);
    let resolved = false;
    const finish = (val) => { if (resolved) return; resolved = true; try { URL.revokeObjectURL(url); } catch(e) {} try { video.removeAttribute('src'); video.load(); } catch(e) {} resolve(val); };
    const timeout = setTimeout(() => finish(null), 12000);
    video.onloadedmetadata = () => {
      try {
        const dur = video.duration;
        if (!isFinite(dur) || dur <= 0) { clearTimeout(timeout); finish(null); return; }
        video.currentTime = Math.max(0.1, Math.min(dur * 0.25, dur - 0.1));
      } catch(e) { clearTimeout(timeout); finish(null); }
    };
    video.onseeked = () => {
      try {
        const w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) { clearTimeout(timeout); finish(null); return; }
        const minSide = Math.min(w, h);
        const c = document.createElement('canvas'); c.width = maxSize; c.height = maxSize;
        c.getContext('2d').drawImage(video, (w-minSide)/2, (h-minSide)/2, minSide, minSide, 0, 0, maxSize, maxSize);
        c.toBlob(b => { clearTimeout(timeout); finish(b); }, 'image/jpeg', 0.78);
      } catch(e) { clearTimeout(timeout); finish(null); }
    };
    video.onerror = () => { clearTimeout(timeout); finish(null); };
    video.src = url; try { video.load(); } catch(e) {}
  });
}

async function saveThumb(fileId, blob) {
  if (!rootDir || !blob) return;
  try { const fh = await rootDir.getFileHandle(THUMB_PREFIX + fileId, { create: true }); const wr = await fh.createWritable(); await wr.write(blob); await wr.close(); } catch(e) {}
}
async function getThumb(f) { if (!rootDir) return null; try { const fh = await rootDir.getFileHandle(THUMB_PREFIX + f.fileId); return await fh.getFile(); } catch(e) { return null; } }
async function deleteThumb(fileId) { if (!rootDir) return; try { await rootDir.removeEntry(THUMB_PREFIX + fileId); } catch(e) {} }

function queueBgThumb(f) { if (bgThumbQueue.find(x => x.id === f.id)) return; bgThumbQueue.push(f); processBgThumbQueue(); }
async function processBgThumbQueue() {
  if (bgThumbRunning) return; bgThumbRunning = true;
  while (bgThumbQueue.length > 0) {
    const f = bgThumbQueue.shift();
    try {
      const existing = await getThumb(f);
      if (!existing && (f.type === 'image' || f.type === 'video')) {
        const file = await getFromOPFS(f.fileId) || f.blob;
        if (file) {
          const thumb = f.type === 'image' ? await generateImageThumbnail(file) : await generateVideoThumbnail(file);
          if (thumb) await saveThumb(f.fileId, thumb);
        }
      }
    } catch(e) {}
    await nextMacrotask();
  }
  bgThumbRunning = false;
}

async function loadFolderPreview(folderId, tileEl) {
  if (!folderPreviewEnabled) return;
  const cached = cacheGetPreview(folderPreviewCache, folderId);
  if (cached) { applyFolderPreview(tileEl, cached); return; }
  try {
    const tx = db.transaction(SF, 'readonly'); const index = tx.objectStore(SF).index('folder');
    const files = await p(index.getAll(folderId));
    const valid = files.filter(f => !f.deleted && (f.type === 'image' || f.type === 'video')).slice(0, 1);
    if (valid.length === 0) return;
    const thumb = await getThumb(valid[0]);
    if (!thumb) return;
    const url = URL.createObjectURL(thumb);
    cacheSetPreview(folderPreviewCache, folderId, url);
    if (tileEl.isConnected) applyFolderPreview(tileEl, url);
  } catch(e) { console.warn('Folder preview error', e); }
}
function applyFolderPreview(el, url) {
  if (!el.isConnected) return;
  const prev = el.querySelector('.folder-preview');
  if (!prev || prev.querySelector('img')) return;
  const item = document.createElement('div');
  item.className = 'fp-item';
  item.innerHTML = `<img src="${url}" loading="lazy">`;
  prev.appendChild(item);
  el.classList.remove('no-preview');
  el.classList.add('has-preview');
}

async function loadTileImage(tileEl, f) {
  if (!tileEl || !f) return;
  const imgEl = tileEl.querySelector('.tile-img');
  if (!imgEl) return;
  const skelEl = tileEl.querySelector('.skeleton');

  const cached = cacheGetPreview(filePreviewCache, f.fileId);
  if (cached) {
    try {
      const probe = new Image();
      probe.src = cached;
      await probe.decode();
      if (!tileEl.isConnected) return;
      imgEl.src = cached;
      imgEl.classList.add('loaded');
      if (skelEl) skelEl.remove();
    } catch(e) {
      imgEl.onload = () => { imgEl.classList.add('loaded'); if (skelEl) skelEl.remove(); };
      imgEl.src = cached;
    }
    return;
  }

  try {
    let thumb = await getThumb(f);
    let hasFile = !!thumb;
    if (!thumb && f.type === 'video' && !failedVideoThumbs.has(f.fileId)) {
      const file = await getFileData(f);
      if (file) { hasFile = true; thumb = await generateVideoThumbnail(file); if (thumb) await saveThumb(f.fileId, thumb); else failedVideoThumbs.add(f.fileId); }
    }
    if (!thumb && f.type === 'image') {
      const file = await getFileData(f);
      if (file) { thumb = file; hasFile = true; queueBgThumb(f); }
    }
    if (!hasFile && (f.type === 'image' || f.type === 'video')) { tileEl.classList.add('broken'); if (skelEl) skelEl.remove(); return; }
    if (!thumb) { if (skelEl) skelEl.remove(); return; }
    if (!tileEl.isConnected) return;
    const url = URL.createObjectURL(thumb);
    cacheSetPreview(filePreviewCache, f.fileId, url);
    imgEl.onload = () => { imgEl.classList.add('loaded'); if (skelEl) skelEl.remove(); };
    imgEl.onerror = () => { if (skelEl) skelEl.remove(); };
    imgEl.src = url;
  } catch(e) { if (skelEl) skelEl.remove(); }
}

function computeGridLayout() {
  const wrap = $('gridWrap'); if (!wrap) return;
  const width = wrap.clientWidth;
  if (!width) return;
  const colsStr = getComputedStyle(document.documentElement).getPropertyValue('--cols').trim();
  const m = colsStr.match(/repeat\(\s*(\d+)/);
  const cols = m ? parseInt(m[1]) : 3;
  const sidePad = 16, topPad = 16, gap = 10;
  const contentWidth = width - sidePad * 2;
  virtualState.cols = cols;
  const tileSize = (contentWidth - gap * (cols - 1)) / cols;
  virtualState.rowHeight = tileSize + gap;
  virtualState.paddingTop = topPad;
}

function createFolderTile(f) {
  const el = document.createElement('div');
  el.className = 'tile folder no-preview' + (folderSel.has(f.id) ? ' sel' : '') + (f.deleted ? ' trashed' : '');
  el.dataset.id = f.id; el.dataset.type = 'folder';
  const folderColor = f.color || 'var(--acc)';
  el.innerHTML = `<div class="folder-preview"></div><div class="body"><svg class="folder-svg" style="color:${folderColor};" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg><div class="lbl n">${escapeHtml(f.name)}</div></div>${f.deleted ? '<div class="badge trash">Удалено</div>' : ''}<div class="chk"></div>`;
  return el;
}

function createFileTile(f) {
  const el = document.createElement('div');
  el.className = 'tile' + (sel.has(f.id) ? ' sel' : '') + (f.deleted ? ' trashed' : '');
  el.dataset.id = f.id; el.dataset.type = 'file'; el.dataset.fileId = f.id;
  const isVideo = f.type === 'video', isImage = f.type === 'image';
  let inner = '';
  if (isImage || isVideo) {
    const fallbackIcon = isVideo ? ICONS.video : ICONS.image;
    const fallbackSize = isVideo ? `<div class="lbl">${(f.size/1048576).toFixed(1)} МБ</div>` : '';
    const fallback = `<div class="body">${fallbackIcon}<div class="lbl n">${escapeHtml(f.name)}</div>${fallbackSize}</div>`;
    const overlay = isVideo ? `<div class="video-play-overlay">${ICONS.play}</div>` : '';
    inner = `${fallback}<div class="skeleton"></div><img loading="lazy" class="tile-img">${overlay}`;
  } else {
    inner = `<div class="body">${ICONS.file}<div class="lbl n">${escapeHtml(f.name)}</div></div>`;
  }
  const tagsHtml = f.tags && f.tags.length ? `<div class="tile-tags">${f.tags.slice(0,2).map(t=>`<span>#${escapeHtml(t)}</span>`).join('')}${f.tags.length>2?'<span>+</span>':''}</div>` : '';
  const favStar = f.fav ? `<div class="fav-star">${ICONS.star}</div>` : '';
  el.innerHTML = `${favStar}${inner}${tagsHtml}${f.deleted?'<div class="badge trash">Удалено</div>':`<div class="badge">${TYPE_LABEL[f.type] || 'Файл'}</div>`}<div class="chk"></div>`;
  return el;
}

function updateVirtualGrid() {
  if (isLocked) return;
  const items = virtualState.items;
  const wrap = $('gridWrap'), grid = $('grid');
  if (!wrap || !grid) return;
  if (!items.length) {
    wrap.style.height = 'auto';
    grid.style.position = 'relative';
    grid.style.top = '';
    updateUI();
    return;
  }
  computeGridLayout();
  const { cols, rowHeight } = virtualState;
  if (!rowHeight) return;
  const totalRows = Math.ceil(items.length / cols);
  const totalHeight = virtualState.paddingTop * 2 + totalRows * rowHeight - 10;
  wrap.style.height = totalHeight + 'px';
  grid.style.position = 'absolute';
  const scrollY = window.scrollY, vh = window.innerHeight;
  const wrapTop = wrap.getBoundingClientRect().top + scrollY;
  const BUFFER = 6;
  let firstRow = Math.floor((scrollY - wrapTop - virtualState.paddingTop) / rowHeight) - BUFFER;
  let lastRow = Math.ceil((scrollY - wrapTop + vh - virtualState.paddingTop) / rowHeight) + BUFFER;
  firstRow = Math.max(0, firstRow);
  lastRow = Math.min(totalRows - 1, lastRow);
  if (lastRow < firstRow) lastRow = firstRow;
  const startIndex = firstRow * cols;
  const endIndex = Math.min(items.length, (lastRow + 1) * cols);
  grid.style.top = (virtualState.paddingTop + firstRow * rowHeight) + 'px';
  const [prevStart, prevEnd] = virtualState.lastRange;
  if (prevStart === startIndex && prevEnd === endIndex) return;
  virtualState.lastRange = [startIndex, endIndex];

  const existing = new Map();
  for (const child of grid.children) {
    const id = child.dataset.id;
    if (id) existing.set(id + ':' + child.dataset.type, child);
  }

  const newTiles = [];
  const frag = document.createDocumentFragment();
  for (let i = startIndex; i < endIndex; i++) {
    const item = items[i];
    const key = String(item.id) + ':' + (item._isFolder ? 'folder' : 'file');
    let el = existing.get(key);
    if (el) {
      existing.delete(key);
      el.classList.toggle('sel', item._isFolder ? folderSel.has(item.id) : sel.has(item.id));
    } else {
      el = item._isFolder ? createFolderTile(item) : createFileTile(item);
      newTiles.push({ el, item });
    }
    frag.appendChild(el);
  }
  grid.innerHTML = '';
  grid.appendChild(frag);
  for (const { el, item } of newTiles) {
    if (item._isFolder) { if (folderPreviewEnabled) loadFolderPreview(item.id, el); }
    else loadTileImage(el, item);
  }
  updateUI();
}

$('slideshowIntRange').oninput = e => {
  const sec = Number(e.target.value);
  $('slideshowIntVal').textContent = sec + ' сек';
  slideshowInterval = sec * 1000;
  if (slideshowActive && slideshowTimer) {
    clearTimeout(slideshowTimer);
    const f = galleryFiles[currentGalleryIndex];
    if (f && f.type !== 'video') scheduleSlideshowNext(f);
  }
};
$('slideshowIntRange').onchange = async e => { await setSetting('slideshowInterval', Number(e.target.value) * 1000); };

async function getTrashAutoDays() { const v = await getSetting('trashAutoDays'); return v === null || v === undefined ? DEFAULT_TRASH_DAYS : Number(v); }
async function setTrashAutoDays(days) {
  await setSetting('trashAutoDays', Number(days));
  updateTrashAutoPillsUI(days);
  await autoCleanTrash();
  toast(days === 0 ? 'Автоочистка выкл.' : 'Готово', days === 0 ? 'Корзина не будет очищаться' : `Автоочистка через ${days} дн.`);
}
function updateTrashAutoPillsUI(d) { document.querySelectorAll('#trashAutoPills .pill').forEach(p => p.classList.toggle('sel', Number(p.dataset.val) === Number(d))); }
document.querySelectorAll('#trashAutoPills .pill').forEach(p => { p.onclick = () => setTrashAutoDays(Number(p.dataset.val)); });

async function initOPFS() {
  if (navigator.storage && navigator.storage.getDirectory) {
    try { rootDir = await navigator.storage.getDirectory(); if (navigator.storage.persist) await navigator.storage.persist(); }
    catch(e) { rootDir = null; }
  }
}
async function getFromOPFS(fileId) { if (!rootDir) return null; try { const fh = await rootDir.getFileHandle(fileId); return await fh.getFile(); } catch(e) { return null; } }
async function deleteFromOPFS(fileId) { if (!rootDir) return; try { await rootDir.removeEntry(fileId); } catch(e) {} }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 10); }

async function calculateHash(file) {
  if (file.size === 0) return 'empty_' + generateId();
  try {
    const chunkSize = 256 * 1024; let combined;
    if (file.size <= chunkSize * 5) combined = new Uint8Array(await file.arrayBuffer());
    else {
      const offsets = [0, Math.floor(file.size * 0.25), Math.floor(file.size * 0.5), Math.floor(file.size * 0.75), file.size - chunkSize];
      const chunks = [];
      for (const off of offsets) { const blob = file.slice(off, off + chunkSize); chunks.push(new Uint8Array(await blob.arrayBuffer())); }
      combined = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
      let off = 0; for (const c of chunks) { combined.set(c, off); off += c.length; }
    }
    if (window.crypto && window.crypto.subtle) {
      const hb = await crypto.subtle.digest('SHA-256', combined);
      return Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let hash = 2166136261; for (let i = 0; i < combined.length; i++) { hash ^= combined[i]; hash = Math.imul(hash, 16777619); }
    return 'hash_' + file.size + '_' + (hash >>> 0).toString(16);
  } catch(e) { return 'unique_' + generateId(); }
}

async function saveToOPFSChunked(fileId, file) {
  if (!rootDir) return false;
  try {
    const fh = await rootDir.getFileHandle(fileId, { create: true });
    const wr = await fh.createWritable();
    const reader = file.stream().getReader();
    let bw = 0, cy = 0, ly = 0;
    while (true) {
      if (isAppInBackground) { await new Promise(r => setTimeout(r, 1000)); continue; }
      const { done, value } = await reader.read(); if (done) break;
      await wr.write(value); bw += value.length; cy++;
      if (cy >= 4 || bw === file.size) {
        cy = 0; const now = Date.now();
        if (now - ly > 150 || bw === file.size) { ly = now; showProgress('Сохранение', Math.round((bw/file.size)*100), file.name, `${(bw/1048576).toFixed(1)} / ${(file.size/1048576).toFixed(1)} МБ`); await nextMacrotask(); }
      }
    }
    await wr.close(); return true;
  } catch(e) { return false; }
}

async function writeDataToOPFS(fileId, data) {
  if (!rootDir) return false;
  try {
    const fh = await rootDir.getFileHandle(fileId, { create: true }); const wr = await fh.createWritable();
    const CHUNK = 4 * 1024 * 1024;
    if (data.length <= CHUNK) await wr.write(data);
    else for (let off = 0; off < data.length; off += CHUNK) { await wr.write(data.subarray(off, Math.min(off + CHUNK, data.length))); await nextMacrotask(); }
    await wr.close(); return true;
  } catch (e) { return false; }
}

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = e => {
      const d = e.target.result, tx = e.target.transaction;
      if (!d.objectStoreNames.contains(SF)) { const s = d.createObjectStore(SF, {keyPath:'id', autoIncrement:true}); s.createIndex('folder','folderId'); s.createIndex('type','type'); }
      if (d.objectStoreNames.contains(SF)) { const s = tx.objectStore(SF); if (!s.indexNames.contains('hash')) s.createIndex('hash', 'hash'); }
      if (!d.objectStoreNames.contains(SFL)) { const s = d.createObjectStore(SFL, {keyPath:'id', autoIncrement:true}); s.createIndex('parent','parentId'); }
      if (!d.objectStoreNames.contains(SS)) { d.createObjectStore(SS, {keyPath:'key'}); }
    };
    r.onsuccess = e => { db = e.target.result; res(); };
    r.onerror = e => rej(e.target.error);
  });
}
const st = (n,m) => db.transaction(n,m).objectStore(n);
const p = r => new Promise((res,rej) => { r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
const getAllFiles = () => p(st(SF,'readonly').getAll());
const getAllFolders = () => p(st(SFL,'readonly').getAll());

async function addFile(file, hash) {
  const fileId = generateId(); const type = detectType(file);
  const exifDate = (type === 'image') ? await extractExifDate(file) : null;
  const record = { fileId, name: file.name || 'Файл', type, mime: file.type||'', size: file.size, date: exifDate || Date.now(), importedAt: Date.now(), folderId: currentFolder, hash, deleted: false, deletedAt: null, fav: false, tags: [] };
  if (!rootDir) { record.blob = file; return p(st(SF, 'readwrite').add(record)); }
  const success = await saveToOPFSChunked(fileId, file);
  if (!success) throw new Error("Не удалось сохранить файл.");
  if (type === 'image' || type === 'video') {
    try { const tb = type === 'image' ? await generateImageThumbnail(file) : await generateVideoThumbnail(file); if (tb) await saveThumb(fileId, tb); } catch(e) {}
  }
  return p(st(SF, 'readwrite').add(record));
}
async function getFileData(f) { let raw = null; if (rootDir) raw = await getFromOPFS(f.fileId); if (!raw) raw = f.blob; return raw; }
function addFolder(name, parent, color) { return p(st(SFL,'readwrite').add({ name, parentId: parent??null, date: Date.now(), color: color || FOLDER_COLORS[0], deleted: false, deletedAt: null })); }
function detectType(file) {
  const mime = (file.type||'').toLowerCase(), name = (file.name||'').toLowerCase();
  const ext = (name.match(/\.([a-z0-9]+)$/)||[])[1]||'';
  if(mime.startsWith('image/') || /^(jpg|jpeg|png|gif|webp|bmp|heic|heif|avif|svg)$/.test(ext)) return 'image';
  if(mime.startsWith('video/') || /^(mp4|webm|mov|avi|mkv|m4v|3gp|flv|wmv)$/.test(ext)) return 'video';
  return 'other';
}
const TYPE_LABEL = {image:'Фото', video:'Видео'};

async function moveToTrash(fileIds, folderIds) {
  const now = Date.now();
  const allFolders = await getAllFolders(), allFiles = await getAllFiles();
  const folderIdSet = new Set(folderIds);
  let ch = true;
  while (ch) { ch = false; for (const f of allFolders) if (f.parentId != null && folderIdSet.has(f.parentId) && !folderIdSet.has(f.id)) { folderIdSet.add(f.id); ch = true; } }
  const fileIdSet = new Set(fileIds);
  for (const f of allFiles) if (!f.deleted && f.folderId != null && folderIdSet.has(f.folderId)) fileIdSet.add(f.id);
  if (fileIdSet.size > 0) await new Promise((res, rej) => {
    const tx = db.transaction(SF, 'readwrite'); const store = tx.objectStore(SF);
    for (const id of fileIdSet) { const req = store.get(id); req.onsuccess = () => { const v = req.result; if (v && !v.deleted) { v.deleted = true; v.deletedAt = now; store.put(v); } }; }
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
  if (folderIdSet.size > 0) await new Promise((res, rej) => {
    const tx = db.transaction(SFL, 'readwrite'); const store = tx.objectStore(SFL);
    for (const id of folderIdSet) { const req = store.get(id); req.onsuccess = () => { const v = req.result; if (v && !v.deleted) { v.deleted = true; v.deletedAt = now; store.put(v); } }; }
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}

async function restoreFromTrash(fileIds, folderIds) {
  if (fileIds.length > 0) await new Promise((res, rej) => {
    const tx = db.transaction(SF, 'readwrite'); const store = tx.objectStore(SF);
    for (const id of fileIds) { const req = store.get(id); req.onsuccess = () => { const v = req.result; if (v && v.deleted) { v.deleted = false; v.deletedAt = null; store.put(v); } }; }
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
  if (folderIds.length > 0) await new Promise((res, rej) => {
    const tx = db.transaction(SFL, 'readwrite'); const store = tx.objectStore(SFL);
    for (const id of folderIds) { const req = store.get(id); req.onsuccess = () => { const v = req.result; if (v && v.deleted) { v.deleted = false; v.deletedAt = null; store.put(v); } }; }
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}

async function deletePermanent(fileIds, folderIds) {
  if ($('viewerModal').dataset.url) { URL.revokeObjectURL($('viewerModal').dataset.url); delete $('viewerModal').dataset.url; }
  const allFiles = await getAllFiles(), allFolders = await getAllFolders();
  const folderIdSet = new Set(folderIds);
  let changed = true;
  while (changed) { changed = false; for (const f of allFolders) if (f.parentId != null && folderIdSet.has(f.parentId) && !folderIdSet.has(f.id)) { folderIdSet.add(f.id); changed = true; } }
  const allFileIdSet = new Set(fileIds);
  for (const f of allFiles) if (f.folderId != null && folderIdSet.has(f.folderId)) allFileIdSet.add(f.id);
  const filesToDelete = allFiles.filter(f => allFileIdSet.has(f.id));
  for (const f of filesToDelete) cacheRemovePreview(filePreviewCache, f.fileId);
  for (const id of folderIdSet) cacheRemovePreview(folderPreviewCache, id);
  const CONCURRENCY = 6;
  for (let i = 0; i < filesToDelete.length; i += CONCURRENCY) {
    const batch = filesToDelete.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(f => Promise.all([deleteFromOPFS(f.fileId).catch(()=>{}), deleteThumb(f.fileId).catch(()=>{})])));
    checkAbort();
  }
  if (allFileIdSet.size > 0) await new Promise((res, rej) => {
    const tx = db.transaction(SF, 'readwrite'); const store = tx.objectStore(SF);
    allFileIdSet.forEach(id => store.delete(id));
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
  if (folderIdSet.size > 0) await new Promise((res, rej) => {
    const tx = db.transaction(SFL, 'readwrite'); const store = tx.objectStore(SFL);
    folderIdSet.forEach(id => store.delete(id));
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
  });
}

async function emptyTrash() {
  const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
  const fids = files.filter(f => f.deleted).map(f => f.id);
  const dids = folders.filter(f => f.deleted).map(f => f.id);
  if (!fids.length && !dids.length) return toast('Корзина пуста', '');
  if (!await showConfirm('Очистка корзины', `Удалить навсегда: <b>${fids.length}</b> файл. и <b>${dids.length}</b> пап.?`)) return;
  showProgress('Очистка корзины', 0, 'Удаление файлов...', '', true);
  try { await deletePermanent(fids, dids); hideProgress(); await refresh(); toast('Готово', 'Корзина очищена'); }
  catch(e) { hideProgress(); toast('Ошибка', 'Не удалось очистить', true); }
}

async function autoCleanTrash() {
  const daysVal = await getTrashAutoDays(); if (daysVal === 0) return;
  const ms = daysVal * 24 * 60 * 60 * 1000;
  const files = await getAllFiles(), folders = await getAllFolders();
  const oldFiles = files.filter(f => f.deleted && f.deletedAt && (Date.now() - f.deletedAt > ms)).map(f => f.id);
  const oldFolders = folders.filter(f => f.deleted && f.deletedAt && (Date.now() - f.deletedAt > ms)).map(f => f.id);
  if (oldFiles.length || oldFolders.length) { try { await deletePermanent(oldFiles, oldFolders); } catch(e) {} }
}

window.findDuplicates = async () => {
  const files = await getAllFiles(); const active = files.filter(f => !f.deleted);
  const bySize = {}; active.forEach(f => { const s = f.size || 0; if (!bySize[s]) bySize[s] = []; bySize[s].push(f); });
  const duplicates = [];
  for (const group of Object.values(bySize).filter(g => g.length > 1)) {
    const byHash = {};
    for (const f of group) { if (!f.hash || f.hash.startsWith('unique_')) continue; if (!byHash[f.hash]) byHash[f.hash] = []; byHash[f.hash].push(f); }
    for (const hg of Object.values(byHash)) if (hg.length > 1) duplicates.push(hg);
  }
  const res = $('dupResult');
  if (duplicates.length === 0) { res.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--mut);">Дубликатов не найдено</div>'; $('btnDupDelete').style.display = 'none'; }
  else {
    const totalWasted = duplicates.reduce((s, g) => s + g.slice(1).reduce((ss, f) => ss + (f.size||0), 0), 0);
    let html = `<div style="padding:12px 16px;background:var(--card);border-radius:12px;margin-bottom:12px;font-size:13px;">Найдено <b>${duplicates.length}</b> групп дубликатов.<br>Можно освободить <b style="color:var(--acc);">${(totalWasted/1048576).toFixed(2)} МБ</b>.</div><div style="max-height:50vh;overflow-y:auto;">`;
    duplicates.forEach((g, idx) => {
      html += `<div style="padding:12px;background:var(--card);border:1px solid var(--bd);border-radius:12px;margin-bottom:8px;"><div style="font-weight:700;font-size:13px;margin-bottom:6px;">Группа ${idx+1} (${g.length} файл.)</div>`;
      g.forEach((f, i) => {
        html += `<div class="dup-file-row" onclick="openDupGallery([${g.map(x => x.id).join(',')}], ${f.id})" style="opacity:${i===0?1:0.6};"><span style="color:${i===0?'var(--txt)':'var(--mut)'};">${i===0?ICONS.checkSmall:ICONS.trashSmall}${escapeHtml(f.name)}</span><span style="flex-shrink:0;margin-left:8px;">${(f.size/1048576).toFixed(2)} МБ</span></div>`;
      });
      html += `</div>`;
    });
    html += `</div>`;
    res.innerHTML = html;
    $('btnDupDelete').style.display = 'block';
    $('btnDupDelete').onclick = async () => {
      if (!await showConfirm('Удаление', `Удалить <b>${duplicates.length}</b> групп дубликатов?`)) return;
      showProgress('Удаление', 0, 'Удаление...', '', true);
      const toDelete = []; duplicates.forEach(g => { g.slice(1).forEach(f => toDelete.push(f.id)); });
      try { await deletePermanent(toDelete, []); hideProgress(); $('modalDuplicates').classList.remove('on'); await refresh(); toast('Готово', `Удалено ${toDelete.length} файлов`); }
      catch(e) { hideProgress(); toast('Ошибка', 'Не удалось', true); }
    };
  }
  $('modalDuplicates').style.zIndex = '10005'; $('modalDuplicates').classList.add('on');
};

window.openDupGallery = async (fileIds, clickedId) => {
  const files = await getAllFiles();
  galleryFiles = fileIds.map(id => files.find(x => x.id === id)).filter(f => f && !f.deleted);
  const idx = galleryFiles.findIndex(x => x.id === clickedId);
  currentGalleryIndex = idx !== -1 ? idx : 0;
  if (galleryFiles.length === 0) return toast('Ошибка', 'Файлы не найдены', true);
  $('modalDuplicates').classList.remove('on');
  $('viewerDelete').style.display = 'flex';
  renderViewer();
};

async function compactDB() {
  if (!await showConfirm('Сжатие базы', 'Очистить корзину, удалить "осиротевшие" файлы и пересобрать базу?')) return;
  await acquireWakeLock();
  showProgress('Очистка', 0, 'Анализ данных...', '', true);
  try {
    let files = await getAllFiles(); let folders = await getAllFolders();
    const settings = await p(st(SS,'readonly').getAll());
    const trashedFiles = files.filter(f => f.deleted);
    if (trashedFiles.length > 0) {
      showProgress('Очистка', 15, 'Удаление корзины...', '');
      for (const f of trashedFiles) { await deleteFromOPFS(f.fileId); await deleteThumb(f.fileId); }
      const t = db.transaction(SF,'readwrite'), s = t.objectStore(SF);
      trashedFiles.forEach(f => s.delete(f.id));
      await new Promise(r => setTimeout(r, 200));
      files = files.filter(f => !f.deleted);
    }
    const trashedFolders = folders.filter(f => f.deleted);
    if (trashedFolders.length > 0) {
      const trashedFolderIds = new Set(trashedFolders.map(f => f.id));
      let ch = true;
      while (ch) { ch = false; for (const f of folders) if (f.deleted && f.parentId != null && trashedFolderIds.has(f.parentId) && !trashedFolderIds.has(f.id)) { trashedFolderIds.add(f.id); ch = true; } }
      const orphanFiles = files.filter(f => trashedFolderIds.has(f.folderId));
      for (const f of orphanFiles) { await deleteFromOPFS(f.fileId); await deleteThumb(f.fileId); }
      const tFo = db.transaction(SF, 'readwrite'), sFo = tFo.objectStore(SF);
      orphanFiles.forEach(f => sFo.delete(f.id));
      await new Promise((res, rej) => { tFo.oncomplete = res; tFo.onerror = e => rej(e.target.error); });
      files = files.filter(f => !trashedFolderIds.has(f.folderId));
      const tf = db.transaction(SFL,'readwrite'), sf = tf.objectStore(SFL);
      trashedFolderIds.forEach(id => sf.delete(id));
      await new Promise(r => setTimeout(r, 200));
      folders = folders.filter(f => !f.deleted);
    }
    const validFolderIds = new Set(folders.map(f => f.id));
    const trueOrphans = files.filter(f => f.folderId != null && !validFolderIds.has(f.folderId));
    if (trueOrphans.length > 0) {
      showProgress('Очистка', 30, `Осиротевшие: ${trueOrphans.length}...`, '');
      for (const f of trueOrphans) { await deleteFromOPFS(f.fileId); await deleteThumb(f.fileId); }
      const tOr = db.transaction(SF, 'readwrite'), sOr = tOr.objectStore(SF);
      trueOrphans.forEach(f => sOr.delete(f.id));
      await new Promise((res, rej) => { tOr.oncomplete = res; tOr.onerror = e => rej(e.target.error); });
      files = files.filter(f => f.folderId == null || validFolderIds.has(f.folderId));
    }
    if (rootDir) {
      showProgress('Очистка', 40, 'Удаление лишних файлов...', '');
      const validFileIds = new Set(files.map(f => f.fileId));
      try {
        const toRemove = [];
        for await (const name of rootDir.keys()) {
          if (name.startsWith(THUMB_PREFIX)) { const fid = name.substring(THUMB_PREFIX.length); if (!validFileIds.has(fid)) toRemove.push(name); continue; }
          if (!validFileIds.has(name)) toRemove.push(name);
        }
        for (const name of toRemove) { try { await rootDir.removeEntry(name); } catch(e) {} }
      } catch(e) { console.warn('OPFS cleanup err', e); }
    }
    showProgress('Очистка', 60, 'Пересборка IndexedDB...', '');
    db.close();
    await new Promise((res, rej) => { const req = indexedDB.deleteDatabase(DB_NAME); req.onsuccess = res; req.onerror = rej; req.onblocked = () => res(); });
    showProgress('Очистка', 80, 'Восстановление...', '');
    await openDB();
    settingsCache = null;
    const t1 = db.transaction(SF,'readwrite'), s1 = t1.objectStore(SF); files.forEach(f => s1.put(f));
    const t2 = db.transaction(SFL,'readwrite'), s2 = t2.objectStore(SFL); folders.forEach(f => s2.put(f));
    const t3 = db.transaction(SS,'readwrite'), s3 = t3.objectStore(SS); settings.forEach(s => s3.put(s));
    await new Promise(r => setTimeout(r, 500));
    cacheClearAll();
    virtualState.lastRange = [-1,-1];
    hideProgress(); refresh(); toast('Успешно', 'Мусор удален, база сжата');
  } catch(e) { hideProgress(); toast('Ошибка', 'Не удалось', true); }
  finally { releaseWakeLock(); }
}
window.compactDB = compactDB;

window.hardResetDB = async () => {
  if(!await showConfirm('ВНИМАНИЕ!', 'Все данные будут <b>удалены навсегда</b>. Продолжить?', 'Удалить', 'Отмена')) return;
  showProgress('Сброс', 50, 'Очистка...', '', true);
  try {
    if (db) db.close();
    cacheClearAll();
    if (rootDir) { const names = []; for await (const name of rootDir.keys()) names.push(name); for (const name of names) await rootDir.removeEntry(name); }
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => { if ('caches' in window) caches.keys().then(names => names.forEach(n => caches.delete(n))); localStorage.clear(); sessionStorage.clear(); showConfirm('Готово', 'База очищена. Приложение перезагрузится.').then(() => location.reload()); };
    req.onerror = () => { showConfirm('Ошибка', 'Не удалось очистить базу.').then(() => location.reload()); };
  } catch(e) { location.reload(); }
};

async function hashPassword(password, saltHex) {
  try { return await pbkdf2Run('hash', password, saltHex, 100000); }
  catch (e) {
    const enc = new TextEncoder(); const km = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']);
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(b => parseInt(b,16)));
    const h = await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations:100000, hash:'SHA-256'}, km, 256);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
}
function generateSalt() { const arr = new Uint8Array(16); crypto.getRandomValues(arr); return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join(''); }

async function checkLock() {
  const s = await getAllSettings();
  storedHash = s.password || ''; storedSalt = s.salt || '';
  if(s.lockEnabled && storedHash) { isLocked=true; $('lockScreen').style.display='flex'; $('lockInput').value=''; }
  else unlockApp();
}
async function unlockApp() { isLocked=false; $('lockScreen').style.display='none'; virtualState.lastRange = [-1,-1]; refresh(); }
$('lockBtn').onclick = async () => {
  const val = $('lockInput').value; if(!val) return;
  const btn = $('lockBtn'); btn.disabled = true; btn.textContent = '...';
  try {
    const h = await hashPassword(val, storedSalt);
    if(h===storedHash) { isLocked=false; $('lockScreen').style.display='none'; virtualState.lastRange = [-1,-1]; refresh(); playSound('success'); }
    else { $('lockErr').textContent='Неверный пароль'; $('lockInput').value=''; playSound('error'); }
  } finally { btn.disabled = false; btn.textContent = 'Разблокировать'; }
};
window.toggleLock = async () => {
  const cur = await getSetting('lockEnabled');
  if(cur) { await setSetting('lockEnabled',false); $('swLock').classList.remove('on'); $('changePassWrap').style.display='none'; }
  else { $('changePassWrap').style.display='block'; $('newPass').focus(); }
};
window.savePassword = async () => {
  const val = $('newPass').value; if(val.length<4) return toast('Ошибка','Короткий пароль',true);
  const salt=generateSalt(), h=await hashPassword(val,salt);
  await setSetting('password',h); await setSetting('salt',salt); await setSetting('lockEnabled',true);
  storedHash=h; storedSalt=salt; $('swLock').classList.add('on'); $('newPass').value='';
  toast('Успешно','Пароль установлен');
};

function getSelectedFilesSize() { let total = 0; const source = viewMode === 'trash' ? trashFilesCache : currentFilesCache; for (const id of sel) { const f = source.find(x => x.id === id); if (f) total += (f.size || 0); } return total; }
function toggleFileSelection(id, tileEl) { if (sel.has(id)) { sel.delete(id); tileEl.classList.remove('sel'); } else { sel.add(id); tileEl.classList.add('sel'); playSound('click'); } }
function toggleFolderSelection(id, tileEl) { if (folderSel.has(id)) { folderSel.delete(id); tileEl.classList.remove('sel'); } else { folderSel.add(id); tileEl.classList.add('sel'); playSound('click'); } }

async function writeBlobToCacheChunked(blob, cachePath, onProgress) {
  const { Filesystem } = window.Capacitor.Plugins;
  const CHUNK_SIZE = 4 * 1024 * 1024; const total = blob.size;
  try { await Filesystem.deleteFile({ path: cachePath, directory: 'CACHE' }); } catch (e) {}
  let offset = 0, isFirst = true;
  while (offset < total) {
    const end = Math.min(offset + CHUNK_SIZE, total);
    const base64 = await blobToBase64(blob.slice(offset, end));
    if (isFirst) { await Filesystem.writeFile({ path: cachePath, data: base64, directory: 'CACHE', recursive: true }); isFirst = false; }
    else await Filesystem.appendFile({ path: cachePath, data: base64, directory: 'CACHE' });
    offset = end; if (onProgress) onProgress(offset / total); await new Promise(r => setTimeout(r, 0));
  }
}

async function downloadFileSafe(file, filename) {
  if (isCapacitorNative()) {
    try {
      const { Filesystem, Share } = window.Capacitor.Plugins;
      const safeName = String(filename || 'file').replace(/[\/\\:*?"<>|]/g, '_');
      const cachePath = `krypta_${Date.now()}_${safeName}`;
      showProgress('Сохранение', 0, safeName, 'Подготовка...', true);
      await writeBlobToCacheChunked(file, cachePath, (pct) => { showProgress('Сохранение', Math.round(pct * 100), safeName, `${Math.round(pct * 100)}%`); });
      const { uri } = await Filesystem.getUri({ path: cachePath, directory: 'CACHE' });
      hideProgress();
      try { await Share.share({ title: safeName, files: [uri], url: uri, dialogTitle: 'Сохранить файл' }); }
      catch (shareErr) { await Share.share({ title: safeName, url: uri, dialogTitle: 'Сохранить файл' }); }
      toast('Готово', 'Выберите «Сохранить в Загрузки» или приложение');
      return true;
    } catch (e) { hideProgress(); toast('Ошибка', 'Не удалось сохранить: ' + (e.message || e), true); return false; }
  }
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (window.showSaveFilePicker && !isMobile) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: filename });
      const writable = await handle.createWritable();
      const reader = file.stream().getReader();
      let written = 0; const total = file.size; let lastUpdate = 0;
      showProgress('Скачивание', 0, filename, `0 / ${(total/1048576).toFixed(1)} МБ`, true);
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        await writable.write(value); written += value.length;
        const now = Date.now();
        if (now - lastUpdate > 200) { lastUpdate = now; showProgress('Скачивание', Math.round(written/total*100), filename, `${(written/1048576).toFixed(1)} / ${(total/1048576).toFixed(1)} МБ`); await nextMacrotask(); }
      }
      await writable.close(); hideProgress(); return true;
    } catch (e) { hideProgress(); if (e.name === 'AbortError') return false; }
  }
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch(e) {} try { URL.revokeObjectURL(url); } catch(e) {} }, 2000);
    return true;
  } catch (e) { return false; }
}

function openFile(f) {
  if (isLocked) return;
  $('viewerDelete').style.display = 'none';
  getFilesForGallery().then(() => {
    const idx = galleryFiles.findIndex(x => x.id === f.id);
    currentGalleryIndex = idx !== -1 ? idx : 0;
    if (idx === -1) galleryFiles = [f];
    renderViewer();
  });
}
function getFilesForGallery() {
  return new Promise(async resolve => {
    const files = await getAllFiles(); let cur;
    if (searchQuery && searchScope === 'all') {
      cur = files.filter(x => !x.deleted && (x.type === 'image' || x.type === 'video'));
      const q = searchQuery.toLowerCase();
      cur = cur.filter(x => x.name.toLowerCase().includes(q) || (x.tags && x.tags.some(t => t.toLowerCase().includes(q))));
    } else {
      cur = files.filter(x => !x.deleted && x.folderId === currentFolder && (x.type === 'image' || x.type === 'video'));
      if (searchQuery) { const q = searchQuery.toLowerCase(); cur = cur.filter(x => x.name.toLowerCase().includes(q) || (x.tags && x.tags.some(t => t.toLowerCase().includes(q)))); }
    }
    sortList(cur); galleryFiles = cur; resolve();
  });
}
function stopSlideshow() { if (slideshowTimer) { clearTimeout(slideshowTimer); slideshowTimer = null; } slideshowActive = false; const btn = $('viewerSlideshow'); if (btn) { btn.innerHTML = ICONS.play; btn.classList.remove('active'); } }
function scheduleSlideshowNext(f) {
  if (!slideshowActive) return; if (f.type === 'video') return;
  slideshowTimer = setTimeout(() => {
    if (!slideshowActive) return;
    if (currentGalleryIndex < galleryFiles.length - 1) slide('left'); else stopSlideshow();
  }, slideshowInterval);
}
async function renderViewer() {
  const myToken = ++viewerToken;
  const f = galleryFiles[currentGalleryIndex]; if(!f) return;
  const modal=$('viewerModal'), content=$('viewerContent'), title=$('viewerTitle');
  const file = await getFileData(f);
  if (myToken !== viewerToken) return;
  if (!file) { content.innerHTML = `<div style="color:#fff;text-align:center;padding:20px;">Файл не найден</div>`; modal.classList.add('on'); return; }
  title.textContent=f.name;
  if(modal.dataset.url) URL.revokeObjectURL(modal.dataset.url);
  const url=URL.createObjectURL(file); modal.dataset.url=url;
  currentScale = 1;
  $('viewerDownload').onclick = async () => { try { const ok = await downloadFileSafe(file, f.name); if (ok) toast('Скачивание', f.name); else toast('Отменено', '', false); } catch(e) { toast('Ошибка', 'Не удалось скачать', true); } };
  $('viewerInfo').onclick = () => { showInfo('file', f); };
  $('viewerDelete').onclick = async () => {
    if (!await showConfirm('В корзину', `Переместить "${f.name}" в корзину?`, 'Да', 'Нет')) return;
    try {
      await moveToTrash([f.id], []);
      galleryFiles.splice(currentGalleryIndex, 1);
      if (galleryFiles.length === 0) { $('viewerClose').click(); }
      else { if (currentGalleryIndex >= galleryFiles.length) currentGalleryIndex = galleryFiles.length - 1; await renderViewer(); }
      refresh();
      showUndoToast('В корзине', f.name, async () => { await restoreFromTrash([f.id], []); await refresh(); toast('Восстановлено', 'Файл возвращён'); });
    } catch(e) { toast('Ошибка', 'Не удалось', true); }
  };
  content.innerHTML=''; modal.classList.add('on');
  const container = document.createElement('div');
  container.className = 'swipe-container'; container.id = 'swipe';
  if(f.type === 'image') { const img = document.createElement('img'); img.src = url; container.appendChild(img); if (slideshowActive) scheduleSlideshowNext(f); }
  else {
    const video = document.createElement('video');
    video.src = url; video.controls = true; video.autoplay = true; video.playsInline = true;
    video.setAttribute('preload', 'metadata'); video.style.maxWidth = '100%'; video.style.maxHeight = '100%';
    video.onended = () => { if (slideshowActive) { if (currentGalleryIndex < galleryFiles.length - 1) slide('left'); else stopSlideshow(); } };
    container.appendChild(video);
  }
  content.appendChild(container);
  initSwipe();
}
$('viewerSlideshow').onclick = () => {
  if (slideshowActive) { stopSlideshow(); toast('Слайдшоу', 'Остановлено'); }
  else {
    slideshowActive = true;
    const btn = $('viewerSlideshow'); btn.innerHTML = ICONS.pause; btn.classList.add('active');
    const f = galleryFiles[currentGalleryIndex];
    if (f) { if (f.type === 'video') toast('Слайдшоу', 'Начнётся после видео'); else { scheduleSlideshowNext(f); toast('Слайдшоу', `Интервал ${slideshowInterval/1000} сек`); } }
  }
};
function initSwipe() {
  const c = $('swipe'); if(!c) return;
  const img = c.querySelector('img'); const isImage = !!img;
  c.style.transition='none'; c.style.transform='translateX(0)';
  let startX=0, currX=0, drag=false, startDist=0, startScale=1, translateX=0, translateY=0, initialX=0, initialY=0, isPinching=false, lastTap=0;
  if (img) { img.style.transition='transform 0.1s ease-out'; img.style.transformOrigin='center center'; }
  const apply = () => { if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`; };
  c.ontouchstart = e => {
    if (e.touches.length === 2 && isImage) { isPinching = true; drag = false; startDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); startScale = currentScale; if (img) img.style.transition = 'none'; }
    else if (e.touches.length === 1) { startX = e.touches[0].clientX; currX = startX; initialX = startX; initialY = e.touches[0].clientY; if (currentScale === 1) { drag = true; c.style.transition = 'none'; } }
  };
  c.ontouchmove = e => {
    if (isPinching && e.touches.length === 2 && isImage) { e.preventDefault(); const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); currentScale = Math.max(1, Math.min(5, startScale * (dist/startDist))); apply(); }
    else if (e.touches.length === 1) { const cx = e.touches[0].clientX, cy = e.touches[0].clientY; if (currentScale > 1 && isImage) { e.preventDefault(); translateX += (cx - initialX); translateY += (cy - initialY); initialX = cx; initialY = cy; apply(); } else if (drag) { currX = cx; c.style.transform = `translateX(${currX-startX}px)`; } }
  };
  c.ontouchend = e => {
    if (isPinching) { isPinching = false; if (currentScale <= 1.05) { currentScale = 1; translateX = 0; translateY = 0; if (img) { img.style.transition='transform 0.2s ease-out'; apply(); } } else { if (img) img.style.transition='transform 0.2s ease-out'; apply(); } return; }
    if (drag) { drag = false; const diff = currX - startX; const th = window.innerWidth * 0.2; if (diff < -th && currentGalleryIndex < galleryFiles.length-1) slide('left'); else if (diff > th && currentGalleryIndex > 0) slide('right'); else { c.style.transition='transform 0.3s'; c.style.transform='translateX(0)'; } }
    if (isImage && e.changedTouches.length === 1) { const now = Date.now(); if (now - lastTap < 300 && Math.abs(e.changedTouches[0].clientX - initialX) < 10) { if (img) img.style.transition='transform 0.3s ease-out'; if (currentScale === 1) { currentScale = 2.5; translateX = 0; translateY = 0; } else { currentScale = 1; translateX = 0; translateY = 0; } apply(); } lastTap = now; }
  };
}
function slide(dir) {
  const c=$('swipe'); if(!c) return;
  const mySlideToken = ++slideToken; playSound('swipe'); currentScale = 1;
  const shift = dir==='left' ? -window.innerWidth : window.innerWidth;
  c.style.transition='transform 0.25s, opacity 0.25s'; c.style.transform=`translateX(${shift}px)`; c.style.opacity='0';
  setTimeout(async () => {
    if (mySlideToken !== slideToken) return;
    if(dir==='left') currentGalleryIndex=(currentGalleryIndex+1)%galleryFiles.length;
    else currentGalleryIndex=(currentGalleryIndex-1+galleryFiles.length)%galleryFiles.length;
    await renderViewer();
    if (mySlideToken !== slideToken) return;
    const nc=$('swipe'); if(nc) { nc.style.transition='none'; nc.style.transform='translateX(0)'; nc.style.opacity='1'; }
  }, 250);
}
$('viewerClose').onclick = () => {
  viewerToken++; slideToken++; stopSlideshow();
  $('viewerModal').classList.remove('on'); $('viewerContent').innerHTML='';
  $('viewerDelete').style.display = 'none';
  if($('viewerModal').dataset.url) { URL.revokeObjectURL($('viewerModal').dataset.url); delete $('viewerModal').dataset.url; }
};

function showInfo(type, data) {
  const rows = $('infoRows');
  if (type === 'file') {
    rows.innerHTML = `<div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Имя:</span><span style="font-weight:600;text-align:right;word-break:break-all;max-width:60%;">${escapeHtml(data.name)}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Тип:</span><span style="font-weight:600;">${TYPE_LABEL[data.type] || 'Файл'}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Размер:</span><span style="font-weight:600;">${((data.size||0)/1048576).toFixed(2)} МБ</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Дата:</span><span style="font-weight:600;">${new Date(data.date).toLocaleString('ru-RU')}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Избранное:</span><span style="font-weight:600;">${data.fav ? 'Да' : 'Нет'}</span></div><div style="padding:12px 0;display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Теги:</span><span style="font-weight:600;text-align:right;">${data.tags && data.tags.length ? data.tags.join(', ') : 'Нет'}</span></div>`;
  } else {
    rows.innerHTML = `<div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Имя:</span><span style="font-weight:600;text-align:right;word-break:break-all;max-width:60%;">${escapeHtml(data.name)}</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Тип:</span><span style="font-weight:600;">Папка</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Размер:</span><span id="folderSizeCalc" style="font-weight:600;">…</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Файлов:</span><span id="folderFilesCalc" style="font-weight:600;">…</span></div><div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Подпапок:</span><span id="folderSubCalc" style="font-weight:600;">…</span></div><div style="padding:12px 0;display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Создана:</span><span style="font-weight:600;">${new Date(data.date).toLocaleString('ru-RU')}</span></div>`;
    getFolderStats(data.id).then(s => { const a = $('folderSizeCalc'), b = $('folderFilesCalc'), c = $('folderSubCalc'); if (a) a.textContent = (s.size/1048576).toFixed(2)+' МБ'; if (b) b.textContent = s.count; if (c) c.textContent = s.folderCount; }).catch(() => {});
  }
  $('modalInfo').style.zIndex = '10005'; $('modalInfo').classList.add('on');
}
async function getFolderStats(folderId) {
  const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
  const folderIds = new Set([folderId]);
  let changed = true;
  while (changed) { changed = false; for (const f of folders) if (f.parentId != null && folderIds.has(f.parentId) && !folderIds.has(f.id)) { folderIds.add(f.id); changed = true; } }
  let size = 0, count = 0;
  for (const f of files) if (!f.deleted && folderIds.has(f.folderId)) { size += (f.size || 0); count++; }
  return { size, count, folderCount: folderIds.size - 1 };
}

async function updateStatistics() {
  try {
    const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
    const photos = files.filter(f => f.type === 'image').length, videos = files.filter(f => f.type === 'video').length;
    const favs = files.filter(f => f.fav && !f.deleted).length;
    const trashCount = files.filter(f => f.deleted).length + folders.filter(f => f.deleted).length;
    const e1 = $('statTotalFiles'), e2 = $('statMediaFiles'), e3 = $('statFolders'), e4 = $('statFavorites'), e5 = $('statTrash');
    if (e1) e1.textContent = files.length; if (e2) e2.textContent = `${photos} / ${videos}`; if (e3) e3.textContent = folders.length; if (e4) e4.textContent = favs; if (e5) e5.textContent = trashCount;
  } catch(e) {}
}

function renderCrumb(folders) {
  if (viewMode === 'trash') { $('crumb').innerHTML = `<a class="cur">${ICONS.trash}Корзина</a>`; return; }
  if (searchScope === 'all' && searchQuery) { $('crumb').innerHTML = `<a data-nav="root" class="cur">${ICONS.home}Поиск везде</a>`; return; }
  const path=[]; let cur=currentFolder; const seen = new Set();
  while(cur!=null) { if (seen.has(cur)) break; seen.add(cur); const f=folders.find(x=>x.id===cur); if(!f) break; path.unshift(f); cur=f.parentId; }
  let h = `<a data-nav="root" class="${path.length?'':'cur'}">${ICONS.home}Файлы</a>`;
  path.forEach((f,i)=> { h+=`<span class="sep">›</span><a data-nav="${f.id}" class="${i===path.length-1?'cur':''}">${escapeHtml(f.name)}</a>`; });
  $('crumb').innerHTML=h;
}
$('crumb').addEventListener('click', e => {
  if (viewMode === 'trash') return;
  const a=e.target.closest('a'); if(!a) return;
  if (searchScope === 'all' && searchQuery && a.dataset.nav === 'root') { currentFolder = null; searchScope = 'current'; $('btnSearchScope').classList.remove('on'); clearSel(); refresh(); return; }
  currentFolder = a.dataset.nav==='root' ? null : Number(a.dataset.nav);
  clearSel(); refresh();
});

function sortList(arr) {
  return arr.sort((a,b) => {
    if (sortBy === 'fav_first') { if (a.fav && !b.fav) return -1; if (!a.fav && b.fav) return 1; return b.date - a.date; }
    if(sortBy==='name_asc') return a.name.localeCompare(b.name,'ru');
    if(sortBy==='name_desc') return b.name.localeCompare(a.name,'ru');
    if(sortBy==='date_desc') return b.date-a.date;
    if(sortBy==='date_asc') return a.date-b.date;
    if(sortBy==='size_desc') return (b.size||0)-(a.size||0);
    if(sortBy==='size_asc') return (a.size||0)-(b.size||0);
    return 0;
  });
}

async function refresh() {
  if(isLocked) return;
  bgThumbQueue = [];
  const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
  allActiveFilesCache = files.filter(f => !f.deleted);
  allActiveFoldersCache = folders.filter(f => !f.deleted);
  currentFilesCache = files.filter(f=>!f.deleted && f.folderId===currentFolder);
  currentFoldersCache = folders.filter(f=>!f.deleted && f.parentId===currentFolder);
  trashFilesCache = files.filter(f => f.deleted);
  trashFoldersCache = folders.filter(f => f.deleted);
  const totalTrash = trashFilesCache.length + trashFoldersCache.length;
  $('trashCount').textContent = totalTrash > 0 ? `(${totalTrash})` : '';
  renderCrumb(folders);
  renderGrid(true);
  updateStorageInfo(files);
}
async function updateStorageInfo(files = null) {
  try {
    if (!files) files = await getAllFiles();
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    $('storageFilesSize').textContent = (totalBytes / (1024 * 1024)).toFixed(2) + ' МБ';
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      $('storageUsage').textContent = ((estimate.usage||0)/(1024*1024)).toFixed(2) + ' МБ';
    }
  } catch(e) {}
}

function renderGrid(reset = true) {
  if (isLocked) return;
  let curFiles, visFolders;
  if (viewMode === 'trash') {
    curFiles = [...trashFilesCache]; visFolders = [...trashFoldersCache];
    if(searchQuery) { const q = searchQuery.toLowerCase(); curFiles = curFiles.filter(f => f.name.toLowerCase().includes(q) || (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))); visFolders = visFolders.filter(f => f.name.toLowerCase().includes(q)); }
    curFiles.sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0)); visFolders.sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
  } else if (searchQuery && searchScope === 'all') {
    const q = searchQuery.toLowerCase();
    curFiles = allActiveFilesCache.filter(f => f.name.toLowerCase().includes(q) || (f.tags && f.tags.some(t => t.toLowerCase().includes(q))));
    if(filterType === 'image') curFiles = curFiles.filter(f => f.type === 'image');
    else if (filterType === 'video') curFiles = curFiles.filter(f => f.type === 'video');
    else if (filterType === 'fav') curFiles = curFiles.filter(f => f.fav);
    sortList(curFiles); visFolders = [];
  } else {
    curFiles = [...currentFilesCache];
    if(filterType === 'image') curFiles = curFiles.filter(f=>f.type==='image');
    else if (filterType === 'video') curFiles = curFiles.filter(f=>f.type==='video');
    else if (filterType === 'fav') curFiles = curFiles.filter(f=>f.fav);
    if(searchQuery) { const q = searchQuery.toLowerCase(); curFiles = curFiles.filter(f => f.name.toLowerCase().includes(q) || (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))); }
    sortList(curFiles);
    visFolders = (filterType==='all' || filterType === 'image' || filterType === 'video' || filterType === 'fav') ? [...currentFoldersCache] : [];
    if (filterType === 'fav') visFolders = [];
    if(searchQuery && visFolders.length) visFolders = visFolders.filter(f=>f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    sortList(visFolders);
  }
  const combined = [];
  for (const f of visFolders) combined.push({ ...f, _isFolder: true });
  for (const f of curFiles) combined.push({ ...f, _isFolder: false });
  virtualState.items = combined;
  virtualState.lastRange = [-1, -1];
  if (combined.length === 0) {
    const msg = viewMode === 'trash' ? (searchQuery ? 'Ничего не найдено.' : 'Корзина пуста.') : (filterType !== 'all' || searchQuery) ? 'Ничего не найдено.' : 'Пока пусто.<br>Нажмите «+ Добавить».';
    $('gridWrap').style.height = 'auto';
    $('grid').style.position = 'relative';
    $('grid').style.top = '';
    $('grid').innerHTML = `<div class="empty">${ICONS.folderIcon}<div>${msg}</div></div>`;
    updateUI();
    return;
  }
  updateVirtualGrid();
}

window.addEventListener('scroll', () => {
  lastScrollTime = Date.now();
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollTimeout); scrollTimeout = setTimeout(() => document.body.classList.remove('is-scrolling'), 150);
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    if (window.scrollY > 500) $('btnUp').classList.add('on'); else $('btnUp').classList.remove('on');
    if (isLocked || $('viewerModal').classList.contains('on')) return;
    updateVirtualGrid();
  });
}, { passive: true });
$('btnUp').onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

let resizeTimeout = null;
window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { virtualState.lastRange = [-1,-1]; updateVirtualGrid(); }, 150); });
window.addEventListener('orientationchange', () => { setTimeout(() => { virtualState.lastRange = [-1,-1]; updateVirtualGrid(); }, 300); });

const gridEl = $('grid');
gridEl.addEventListener('touchstart', e => {
  const tile = e.target.closest('.tile'); if (!tile) return;
  isLongPress = false; isScrolling = false; isDragSelecting = false; lastHoveredTile = null;
  startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    if (isScrolling) return;
    if (Date.now() - lastScrollTime < 400) return;
    isLongPress = true; isDragSelecting = true; document.body.classList.add('selecting');
    const id = Number(tile.dataset.id), type = tile.dataset.type;
    if (type === 'file' && !sel.has(id)) toggleFileSelection(id, tile);
    if (type === 'folder' && !folderSel.has(id)) toggleFolderSelection(id, tile);
    lastHoveredTile = tile; if (navigator.vibrate) navigator.vibrate(50); updateUI();
  }, 500);
}, {passive:true});
gridEl.addEventListener('touchmove', e => {
  if (!e.touches[0]) return;
  const currentX = e.touches[0].clientX, currentY = e.touches[0].clientY;
  if (isDragSelecting) {
    e.preventDefault(); const now = Date.now(); if (now - lastDragTime < 50) return; lastDragTime = now;
    const el = document.elementFromPoint(currentX, currentY);
    if (el) { const tile = el.closest('.tile'); if (tile && tile !== lastHoveredTile) { lastHoveredTile = tile; const id = Number(tile.dataset.id), type = tile.dataset.type; if (type === 'file' && !sel.has(id)) { sel.add(id); tile.classList.add('sel'); updateUI(); playSound('click'); } else if (type === 'folder' && !folderSel.has(id)) { folderSel.add(id); tile.classList.add('sel'); updateUI(); playSound('click'); } } }
  } else { if (Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10) { isScrolling = true; clearTimeout(pressTimer); } }
}, { passive: false });
gridEl.addEventListener('touchend', e => {
  clearTimeout(pressTimer);
  if (e.touches.length > 0) return;
  document.body.classList.remove('selecting');
  const wasLongPress = isLongPress; isDragSelecting = false;
  if (isScrolling || wasLongPress) return;
  const tile = e.target.closest('.tile'); if (!tile) return;
  const id = Number(tile.dataset.id), type = tile.dataset.type;
  const inSelection = viewMode === 'trash' || sel.size > 0 || folderSel.size > 0;
  if (inSelection) { if (type === 'file') toggleFileSelection(id, tile); else toggleFolderSelection(id, tile); updateUI(); }
  else { if (type === 'folder') { currentFolder = id; clearSel(); refresh(); } else { const f = currentFilesCache.find(x => x.id === id) || allActiveFilesCache.find(x => x.id === id) || trashFilesCache.find(x => x.id === id); if (f && !f.deleted) openFile(f); } }
});
gridEl.addEventListener('touchcancel', e => { clearTimeout(pressTimer); isLongPress = false; isDragSelecting = false; isScrolling = false; document.body.classList.remove('selecting'); });

function clearSel() { sel.clear(); folderSel.clear(); document.querySelectorAll('.tile.sel').forEach(e=>e.classList.remove('sel')); updateUI(); }
function updateUI() {
  const hasSel = sel.size + folderSel.size > 0; const totalSel = sel.size + folderSel.size;
  const inTrash = viewMode === 'trash';
  const trashEmpty = (trashFilesCache.length + trashFoldersCache.length) === 0;
  $('bar').style.display = hasSel ? 'none' : 'flex';
  $('btnEmptyTrash').style.display = (inTrash && !trashEmpty) ? 'flex' : 'none';
  $('ctxMenu').classList.toggle('on', hasSel);
  $('ctxRow1').style.display = inTrash ? 'none' : 'grid';
  $('ctxRow2').style.display = inTrash ? 'none' : 'grid';
  $('ctxRow3').style.display = inTrash ? 'none' : 'grid';
  $('ctxRowTrash').style.display = inTrash ? 'grid' : 'none';
  $('ctxRename').disabled = totalSel !== 1;
  $('ctxRename').querySelector('.ctx-label').textContent = 'Имя';
  $('ctxInfo').disabled = totalSel !== 1;
  $('ctxDownload').disabled = sel.size === 0 && folderSel.size === 0;
  $('ctxFav').disabled = sel.size === 0;
  $('ctxTag').disabled = sel.size === 0;
  if (folderSel.size > 0) $('ctxDownload').querySelector('.ctx-label').textContent = 'Экспорт';
  else $('ctxDownload').querySelector('.ctx-label').textContent = 'Скачать';
  if(sel.size>0 && folderSel.size===0 && !inTrash) $('ctxCompress').disabled = !currentFilesCache.filter(f=>sel.has(f.id)).some(f=>f.type==='image'); else $('ctxCompress').disabled = true;
  if (sel.size > 0) { const files = currentFilesCache.filter(f => sel.has(f.id)); const allFav = files.every(f => f.fav); $('ctxFav').querySelector('.ctx-label').textContent = allFav ? 'Из избранного' : 'В избранное'; }
  if (hasSel) {
    const parts = [];
    if (sel.size) parts.push(`${sel.size} файл.`);
    if (folderSel.size) parts.push(`${folderSel.size} пап.`);
    let summary = `Выбрано: ${parts.join(' + ')}`;
    if (sel.size && !inTrash) summary += `<br><span class="size" style="color:var(--acc);">${(getSelectedFilesSize()/1048576).toFixed(2)} МБ</span>`;
    $('ctxSummaryText').innerHTML = summary;
    const curFiles = viewMode === 'trash' ? trashFilesCache : currentFilesCache;
    const curFolders = viewMode === 'trash' ? trashFoldersCache : currentFoldersCache;
    const allSelected = curFiles.every(f => sel.has(f.id)) && curFolders.every(f => folderSel.has(f.id));
    $('btnSelectAll').textContent = allSelected ? 'Снять всё' : 'Выбрать всё';
  }
}
$('btnSelectAll').onclick = () => {
  const curFiles = viewMode === 'trash' ? trashFilesCache : currentFilesCache;
  const curFolders = viewMode === 'trash' ? trashFoldersCache : currentFoldersCache;
  const allSelected = curFiles.every(f => sel.has(f.id)) && curFolders.every(f => folderSel.has(f.id));
  if (allSelected) clearSel();
  else { sel.clear(); folderSel.clear(); curFiles.forEach(f => sel.add(f.id)); curFolders.forEach(f => folderSel.add(f.id)); document.querySelectorAll('.tile').forEach(el => { const id = Number(el.dataset.id); const isFile = el.dataset.type === 'file'; if ((isFile && sel.has(id)) || (!isFile && folderSel.has(id))) el.classList.add('sel'); else el.classList.remove('sel'); }); updateUI(); }
};
$('ctxClose').onclick = () => clearSel();

document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    viewMode = t.dataset.view || 'files'; document.body.dataset.view = viewMode;
    filterType = t.dataset.type || 'all';
    clearSel(); refresh();
  };
});
$('search').addEventListener('input', () => { clearTimeout(searchTimer); const val = $('search').value.trim(); $('searchWrap').classList.toggle('has', !!val); searchTimer = setTimeout(() => { searchQuery = val; renderGrid(true); }, 250); });
$('search').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('search').blur(); } });
$('searchClear').onclick = () => { $('search').value=''; searchQuery=''; $('searchWrap').classList.remove('has'); clearTimeout(searchTimer); renderGrid(true); };

$('btnSearchScope').onclick = () => {
  searchScope = searchScope === 'current' ? 'all' : 'current';
  $('btnSearchScope').classList.toggle('on', searchScope === 'all');
  $('btnSearchScope').title = searchScope === 'all' ? 'Искать везде' : 'Искать в текущей папке';
  if (searchQuery) { renderGrid(true); renderCrumb(allActiveFoldersCache); }
};
$('btnAdd').onclick = () => $('file').click();

$('file').onchange = async e => {
  const files = [...e.target.files]; if (!files.length) return;
  await acquireWakeLock(); startAbortableOperation('add', 'Добавление');
  const addedImageIds = [];
  try {
    const existingFiles = await getAllFiles();
    const existingHashes = new Set(existingFiles.filter(f => !f.deleted).map(f => f.hash).filter(h => h && !h.startsWith('unique_')));
    const prepared = []; let duplicateCount = 0;
    for (let i = 0; i < files.length; i++) {
      checkAbort(); const file = files[i];
      if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) { toast('Ошибка', 'GIF не поддерживаются', true); continue; }
      showProgress(`Проверка ${i+1} из ${files.length}`, Math.round(((i+1) / files.length) * 30), file.name, 'Поиск дубликатов...'); await nextMacrotask();
      let hash = ''; try { hash = await calculateHash(file); } catch(e){}
      const isDup = !!(hash && existingHashes.has(hash));
      if (isDup) duplicateCount++;
      else if (hash && !hash.startsWith('unique_')) existingHashes.add(hash);
      prepared.push({ file, hash, isDup });
    }
    let toAdd = prepared;
    if (duplicateCount > 0) {
      const skip = await showConfirm('Дубликаты', `Найдено <b>${duplicateCount}</b> ${duplicateCount === 1 ? 'дубликат' : (duplicateCount < 5 ? 'дубликата' : 'дубликатов')}.<br><br>Пропустить их?`, 'Пропустить', 'Добавить всё');
      if (skip) toAdd = prepared.filter(x => !x.isDup);
    }
    for (let i = 0; i < toAdd.length; i++) {
      checkAbort(); const { file, hash } = toAdd[i];
      showProgress(`Сохранение ${i+1} из ${toAdd.length}`, 0, file.name, '...'); await nextMacrotask();
      const newId = await addFile(file, hash);
      if (detectType(file) === 'image') addedImageIds.push(newId);
    }
    await refresh();
    if (addedImageIds.length > 0) {
      setTimeout(async () => { if (await showConfirm('Сжать фото?', `Вы добавили <b>${addedImageIds.length}</b> фото. Хотите их сжать для экономии места?`, 'Сжать', 'Пропустить')) await compressFiles(addedImageIds, true); }, 500);
    }
  } catch(err) {
    if (err.message === 'Отменено пользователем') toast('Отменено', 'Добавление остановлено');
    else toast('Ошибка', err.message || 'Не удалось', true);
  }
  e.target.value=''; hideProgress(); endAbortableOperation(); releaseWakeLock();
};
$('btnEmptyTrash').onclick = () => emptyTrash();

function buildColorPalette(selected) {
  const wrap = $('colorPalette'); wrap.innerHTML = '';
  FOLDER_COLORS.forEach(c => { const el = document.createElement('div'); el.className = 'color-swatch' + (c === selected ? ' sel' : ''); el.style.background = c; el.onclick = () => { selectedFolderColor = c; wrap.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); }; wrap.appendChild(el); });
}
function openEditModal(title, val, isFolder, id=null, color=null) {
  editIsFolder = isFolder; editId = id;
  $('meTitle').textContent = title; $('meName').value = val || '';
  $('colorPickerWrap').style.display = isFolder ? 'block' : 'none';
  if (isFolder) { selectedFolderColor = color || FOLDER_COLORS[0]; buildColorPalette(selectedFolderColor); }
  $('ctxMenu').classList.remove('on'); $('modalEdit').classList.add('on');
  setTimeout(() => $('meName').focus(), 150);
}
$('btnFolder').onclick = () => { editId = null; openEditModal('Новая папка', '', true); };
$('meCancel').onclick = () => $('modalEdit').classList.remove('on');
$('meOk').onclick = async () => {
  const n = $('meName').value.trim(); if(!n) return toast('Ошибка','Введите название',true);
  if (editId !== null && editId !== undefined) {
    if (editIsFolder) await updateFolderFull(editId, n, selectedFolderColor);
    else await renameItem(SF, editId, n);
    toast('Успешно','Сохранено');
  } else { await addFolder(n, currentFolder, selectedFolderColor); toast('Успешно','Папка создана'); }
  editId = null; $('modalEdit').classList.remove('on'); clearSel(); refresh();
};
$('meName').addEventListener('keydown', e => { if (e.key === 'Enter') $('meOk').click(); });
async function renameItem(store, id, name) { const s=st(store,'readwrite'); const v=await p(s.get(id)); if(v){ v.name=name; await p(s.put(v)); } }
async function updateFolderFull(id, name, color) { const s=st(SFL,'readwrite'); const v=await p(s.get(id)); if(v){ v.name=name; v.color=color; await p(s.put(v)); } }

$('ctxRename').onclick = async () => {
  if(sel.size+folderSel.size!==1) return;
  try {
    if(sel.size) { const f = await p(st(SF,'readonly').get([...sel][0])); if(!f) return toast('Ошибка', 'Не найдено', true); openEditModal('Переименовать', f.name, false, f.id); }
    else { const f = await p(st(SFL,'readonly').get([...folderSel][0])); if(!f) return toast('Ошибка', 'Не найдено', true); openEditModal('Переименовать', f.name, true, f.id, f.color); }
  } catch(e) { toast('Ошибка', 'Не удалось открыть', true); }
};
$('ctxFav').onclick = async () => {
  if (sel.size === 0) return;
  const files = currentFilesCache.filter(f => sel.has(f.id));
  const allFav = files.every(f => f.fav); const newFav = !allFav;
  const s = st(SF, 'readwrite');
  for (const f of files) { const v = await p(s.get(f.id)); if (v) { v.fav = newFav; await p(s.put(v)); } }
  clearSel(); refresh(); toast(newFav ? 'Добавлено' : 'Убрано', newFav ? 'Файлы в избранном' : 'Файлы убраны из избранного');
};

let moveTarget = 'ROOT';
function openMoveModal(title, btnText) {
  $('mvTitle').textContent = title; $('mvOk').textContent = btnText;
  getAllFolders().then(folders => {
    moveTarget = 'ROOT'; $('moveList').innerHTML = '';
    const mk = (id, label) => {
      const el = document.createElement('div');
      el.className = 'folder-item' + (id === moveTarget ? ' sel' : '');
      el.style.cssText = `padding:16px;cursor:pointer;border-bottom:1px solid var(--bd);background:${id===moveTarget?'var(--bd)':'transparent'}`;
      el.innerHTML = `<span style="margin-right:12px;font-size:16px;color:var(--mut);">${id===null?'/':'›'}</span><span>${escapeHtml(label)}</span>`;
      el.onclick = () => { moveTarget = id; document.querySelectorAll('#moveList .folder-item').forEach(x => { x.classList.remove('sel'); x.style.background = 'transparent'; }); el.classList.add('sel'); el.style.background = 'var(--bd)'; };
      return el;
    };
    $('moveList').appendChild(mk(null, 'Корень'));
    const byParent = {}; folders.filter(f => !f.deleted).forEach(f => { (byParent[f.parentId ?? null] = byParent[f.parentId ?? null] || []).push(f); });
    const walk = (pid, depth) => { (byParent[pid] || []).forEach(f => { $('moveList').appendChild(mk(f.id, '　'.repeat(depth) + f.name)); walk(f.id, depth + 1); }); };
    walk(null, 0);
    $('modalMove').classList.add('on');
  });
}
$('ctxMove').onclick = () => { if (!(sel.size + folderSel.size)) return; moveMode = 'move'; openMoveModal('Переместить в…', 'Переместить'); };
$('ctxCopy').onclick = () => { if (!(sel.size + folderSel.size)) return; moveMode = 'copy'; openMoveModal('Копировать в…', 'Копировать'); };
$('mvCancel').onclick = () => $('modalMove').classList.remove('on');
$('mvOk').onclick = async () => {
  const target = moveTarget === 'ROOT' ? null : moveTarget;
  try {
    if (moveMode === 'move') { if (sel.size) await moveFiles([...sel], target); if (folderSel.size) await moveFolders([...folderSel], target); }
    else { if (sel.size) await copyFiles([...sel], target); if (folderSel.size) await copyFoldersDeep([...folderSel], target); }
    clearSel(); $('modalMove').classList.remove('on'); await refresh();
    toast(moveMode === 'move' ? 'Перемещено' : 'Скопировано', '');
  } catch(e) { toast('Ошибка', e.message || 'Не удалось', true); }
};

async function moveFiles(ids, target) { const s=st(SF,'readwrite'); for(const id of ids){ const v=await p(s.get(id)); if(v){ v.folderId=target; await p(s.put(v)); } } }
async function moveFolders(ids, target) {
  const allFolders = await getAllFolders(); const byId = new Map(allFolders.map(f => [f.id, f]));
  for (const id of ids) { let cur = target; while (cur != null) { if (cur === id) throw new Error('Нельзя переместить папку внутрь неё самой'); const f = byId.get(cur); cur = f ? f.parentId : null; } }
  const s=st(SFL,'readwrite');
  for(const id of ids){ const v=await p(s.get(id)); if(v){ v.parentId=target; await p(s.put(v)); } }
}

async function copyOneFile(srcFile, targetFolderId) {
  const newFileId = generateId();
  if (rootDir) {
    try {
      const data = await getFromOPFS(srcFile.fileId);
      if (data) { const fh = await rootDir.getFileHandle(newFileId, { create: true }); const wr = await fh.createWritable(); await wr.write(data); await wr.close(); }
      else if (srcFile.blob) { const fh = await rootDir.getFileHandle(newFileId, { create: true }); const wr = await fh.createWritable(); await wr.write(srcFile.blob); await wr.close(); }
    } catch(e) { console.warn('Copy file failed', srcFile.name, e); }
    try {
      const fh = await rootDir.getFileHandle(THUMB_PREFIX + srcFile.fileId);
      const thumb = await fh.getFile();
      await saveThumb(newFileId, thumb);
    } catch(e) {}
  }
  const { id, ...rest } = srcFile;
  const rec = { ...rest, fileId: newFileId, folderId: targetFolderId, importedAt: Date.now() };
  return await p(st(SF, 'readwrite').add(rec));
}

async function copyFiles(ids, targetFolderId) {
  const files = await getAllFiles();
  const toCopy = files.filter(f => ids.includes(f.id) && !f.deleted);
  if (!toCopy.length) return;
  showProgress('Копирование', 0, '', '', true);
  let done = 0;
  for (const f of toCopy) { await copyOneFile(f, targetFolderId); done++; showProgress('Копирование', Math.round(done / toCopy.length * 100), f.name, `${done}/${toCopy.length}`); }
  hideProgress();
}

async function copyFoldersDeep(ids, targetFolderId) {
  const allFolders = await getAllFolders(); const allFiles = await getAllFiles();
  const byParent = new Map(), filesByFolder = new Map();
  for (const f of allFolders) { const k = f.parentId ?? null; if (!byParent.has(k)) byParent.set(k, []); byParent.get(k).push(f); }
  for (const f of allFiles) { const k = f.folderId ?? null; if (!filesByFolder.has(k)) filesByFolder.set(k, []); filesByFolder.get(k).push(f); }
  let total = 0;
  const countFolder = (fid) => { total += (filesByFolder.get(fid) || []).filter(f => !f.deleted).length; for (const s of (byParent.get(fid) || [])) if (!s.deleted) countFolder(s.id); };
  for (const id of ids) countFolder(id);
  let done = 0;
  showProgress('Копирование', 0, '', `${done}/${total}`, true);
  async function recurse(src, parentId) {
    const newFid = await addFolder(src.name, parentId, src.color);
    for (const f of (filesByFolder.get(src.id) || []).filter(f => !f.deleted)) { await copyOneFile(f, newFid); done++; showProgress('Копирование', Math.round(done / Math.max(1, total) * 100), f.name, `${done}/${total}`); }
    for (const s of (byParent.get(src.id) || [])) if (!s.deleted) await recurse(s, newFid);
  }
  for (const id of ids) { const f = allFolders.find(x => x.id === id); if (f && !f.deleted) await recurse(f, targetFolderId); }
  hideProgress();
}

$('ctxDel').onclick = async () => {
  const fid=[...sel], did=[...folderSel];
  if(!fid.length && !did.length) return;
  if(!await showConfirm('Удаление', `Переместить в корзину: <b>${fid.length}</b> файл. и <b>${did.length}</b> пап.?`)) return;
  try {
    await moveToTrash(fid, did); clearSel(); await refresh();
    const total = fid.length + did.length;
    const subText = total === 1 ? 'Перемещено в корзину' : `${total} ${did.length ? 'объектов' : 'файлов'} в корзине`;
    showUndoToast('В корзине', subText, async () => { await restoreFromTrash(fid, did); await refresh(); toast('Восстановлено', total === 1 ? 'Объект возвращён' : `${total} объектов возвращено`); });
  } catch(e) { toast('Ошибка', 'Не удалось', true); }
};
$('ctxRestore').onclick = async () => {
  const fid=[...sel], did=[...folderSel]; if(!fid.length && !did.length) return;
  try { await restoreFromTrash(fid, did); clearSel(); await refresh(); toast('Восстановлено', `${fid.length + did.length} объект.`); }
  catch(e) { toast('Ошибка', 'Не удалось', true); }
};
$('ctxDelForever').onclick = async () => {
  const fid=[...sel], did=[...folderSel]; if(!fid.length && !did.length) return;
  if(!await showConfirm('Удаление навсегда', `Удалить навсегда: <b>${fid.length}</b> файл. и <b>${did.length}</b> пап.?`, 'Удалить')) return;
  startAbortableOperation('delete', 'Удаление'); showProgress('Удаление', 0, 'Подготовка...', '', true);
  try { await deletePermanent(fid, did); hideProgress(); clearSel(); await refresh(); toast('Удалено', 'Навсегда'); }
  catch(e) { hideProgress(); if (e.message === 'Отменено пользователем') toast('Отменено', 'Часть файлов удалена'); else toast('Ошибка', 'Не удалось', true); }
  finally { endAbortableOperation(); }
};

async function compressFiles(ids, isAutoBatch = false) {
  if (!ids.length) return;
  const files = await getAllFiles();
  const images = files.filter(f => ids.includes(f.id) && f.type === 'image');
  if(!images.length) return toast('Ошибка','Только фото',true);
  $('ctxMenu').classList.remove('on'); await acquireWakeLock();
  const reusableCanvas = document.createElement('canvas'); const reusableCtx = reusableCanvas.getContext('2d');
  let processed = 0, succeeded = 0, failed = 0; const stats = [];
  showProgress('Сжатие', 0, `Подготовка ${images.length} файл.`, '0%', true); await nextMacrotask();
  try {
    for(let i = 0; i < images.length; i++) {
      const f = images[i];
      try {
        showProgress('Сжатие', Math.round((processed / images.length) * 100), `${processed + 1} из ${images.length}: ${f.name}`, `${processed}/${images.length}`); await nextMacrotask();
        const file = await getFileData(f); if (!file) { processed++; failed++; continue; }
        const blob = await new Promise((resolve) => {
          const img = new Image(); const url0 = URL.createObjectURL(file);
          const timeout = setTimeout(() => { URL.revokeObjectURL(url0); resolve(null); }, 15000);
          img.onload = () => { clearTimeout(timeout); try { reusableCanvas.width = img.width; reusableCanvas.height = img.height; reusableCtx.drawImage(img, 0, 0); reusableCanvas.toBlob(b => { URL.revokeObjectURL(url0); resolve(b); }, 'image/jpeg', 0.85); } catch(e) { URL.revokeObjectURL(url0); resolve(null); } };
          img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url0); resolve(null); };
          img.src = url0;
        });
        if (!blob || blob.size >= f.size) { processed++; continue; }
        const oldSize = f.size, newSize = blob.size;
        if (rootDir) { try { const fh = await rootDir.getFileHandle(f.fileId, { create: true }); const wr = await fh.createWritable(); await wr.write(blob); await wr.close(); } catch(e) {} }
        const s = st(SF, 'readwrite'); const v = await p(s.get(f.id));
        if (v) { v.size = blob.size; v.name = f.name.replace(/\.[^.]+$/, '.jpg'); if (!rootDir) v.blob = blob; await p(s.put(v)); }
        const tb = await generateImageThumbnail(blob); if (tb) await saveThumb(f.fileId, tb);
        cacheRemovePreview(filePreviewCache, f.fileId);
        stats.push({ name: f.name, oldSize, newSize }); succeeded++;
      } catch(err) { failed++; }
      processed++; await nextMacrotask();
    }
    hideProgress(); clearSel(); virtualState.lastRange = [-1,-1]; await refresh();
    if (isAutoBatch) showCompressResults(stats, ids);
    else { if (failed > 0) toast('Готово', `Сжато: ${succeeded}, ошибок: ${failed}`); else toast('Успешно', `Сжато: ${succeeded} фото`); }
  } catch(e) { hideProgress(); toast('Ошибка', 'Не удалось завершить', true); }
  finally { releaseWakeLock(); }
}

function showCompressResults(stats, targetIds) {
  let totalOld = 0, totalNew = 0; let html = '';
  stats.forEach(s => { totalOld += s.oldSize; totalNew += s.newSize; const saved = s.oldSize - s.newSize; const pct = Math.round((saved/s.oldSize)*100);
    html += `<div class="compress-item"><div class="compress-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div><div class="compress-sizes"><span class="compress-old">${(s.oldSize/1048576).toFixed(2)} MB</span><span style="color:var(--mut);font-size:10px;">→</span><span class="compress-new">${(s.newSize/1048576).toFixed(2)} MB</span><span class="saved-badge">-${pct}%</span></div></div>`;
  });
  if (stats.length > 0) { const ts = totalOld - totalNew; const tp = Math.round((ts/totalOld)*100);
    $('compressSummary').innerHTML = `<div style="font-size:15px;font-weight:600;margin-bottom:4px;color:var(--acc);">Экономия места</div><div style="font-size:13px;color:var(--mut);">Было: ${(totalOld/1048576).toFixed(2)} МБ → Стало: ${(totalNew/1048576).toFixed(2)} МБ<br><span style="font-weight:700;color:var(--acc);">Сэкономлено: ${(ts/1048576).toFixed(2)} МБ (${tp}%)</span></div>`;
    $('compressList').innerHTML = html;
  } else { $('compressSummary').innerHTML = `<div style="font-size:15px;font-weight:600;color:var(--acc);">Сжатие не требуется</div>`; $('compressList').innerHTML = ''; }
  $('modalCompressResult').style.zIndex = '10005'; $('modalCompressResult').classList.add('on');
  $('btnDoneCompress').onclick = () => { $('modalCompressResult').classList.remove('on'); if (targetIds && targetIds.length) { sel.clear(); targetIds.forEach(id => sel.add(id)); $('tagCount').textContent = targetIds.length; $('tagInput').value = ''; renderTagList(); $('modalTags').classList.add('on'); } };
}

$('ctxCompress').onclick = async () => { const ids=[...sel]; if(!ids.length) return; await compressFiles(ids, false); };

$('ctxDownload').onclick = async () => {
  const selectedFiles = currentFilesCache.filter(f => sel.has(f.id));
  const selectedFolderIds = [...folderSel];
  if (!selectedFiles.length && !selectedFolderIds.length) return toast('Ошибка', 'Ничего не выбрано', true);
  if (selectedFiles.length === 1 && selectedFolderIds.length === 0) {
    const f = selectedFiles[0];
    try { const data = await getFileData(f); if (!data) return toast('Ошибка', 'Файл не найден', true); const ok = await downloadFileSafe(data, f.name || 'file'); if (ok) toast('Скачивание', f.name); }
    catch(e) { toast('Ошибка', 'Не удалось', true); }
    return;
  }
  await acquireWakeLock(); startAbortableOperation('export', 'Экспорт'); let stream = null; const startTime = performance.now();
  try {
    const d = new Date(); const pad = n => String(n).padStart(2, '0');
    const zipName = `mediavault_export_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
    const rawItems = []; const addedFileIds = new Set(); const usedPrefixes = new Set();
    if (selectedFolderIds.length > 0) {
      const [allFiles, allFolders] = await Promise.all([getAllFiles(), getAllFolders()]);
      const byParent = new Map(); allFolders.filter(f => !f.deleted).forEach(f => { const key = f.parentId ?? null; if (!byParent.has(key)) byParent.set(key, []); byParent.get(key).push(f); });
      const filesByFolder = new Map(); allFiles.filter(f => !f.deleted).forEach(f => { const key = f.folderId ?? null; if (!filesByFolder.has(key)) filesByFolder.set(key, []); filesByFolder.get(key).push(f); });
      const walk = (fid, prefix) => {
        for (const f of (filesByFolder.get(fid) || [])) { if (addedFileIds.has(f.id)) continue; addedFileIds.add(f.id); rawItems.push({ zipPath: prefix + sanitizeName(f.name), file: f }); }
        for (const sub of (byParent.get(fid) || [])) walk(sub.id, prefix + sanitizeName(sub.name) + '/');
      };
      for (const rid of selectedFolderIds) { const rf = allFolders.find(f => f.id === rid && !f.deleted); if (!rf) continue; const bn = sanitizeName(rf.name); let fp = bn, c = 2; while (usedPrefixes.has(fp)) { fp = `${bn}_${c}`; c++; } usedPrefixes.add(fp); walk(rid, fp + '/'); }
    }
    for (const f of selectedFiles) { if (addedFileIds.has(f.id)) continue; addedFileIds.add(f.id); rawItems.push({ zipPath: sanitizeName(f.name || `file_${f.id}`), file: f }); }
    if (rawItems.length === 0) return toast('Пусто', 'Нет файлов для экспорта', true);
    const totalBytes = rawItems.reduce((s, it) => s + (it.file.size || 0), 0);
    if (!await checkFreeSpace(totalBytes * 1.05, 'Экспорт')) return;
    const usedPaths = new Set(); const finalItems = [];
    for (const item of rawItems) {
      let up = item.zipPath;
      if (usedPaths.has(up.toLowerCase())) {
        const si = up.lastIndexOf('/');
        const dp = si >= 0 ? up.slice(0, si+1) : '';
        const fpart = up.slice(si+1);
        const di = fpart.lastIndexOf('.');
        const bn = di > 0 ? fpart.slice(0, di) : fpart;
        const ext = di > 0 ? fpart.slice(di) : '';
        let c = 1;
        while (usedPaths.has(up.toLowerCase())) { up = `${dp}${bn}_${c}${ext}`; c++; }
      }
      usedPaths.add(up.toLowerCase());
      finalItems.push({ name: up, getBlob: async () => await getFileData(item.file) });
    }
    showProgress('Экспорт', 0, `0/${finalItems.length}`, '', true);
    stream = await createOutputStream(zipName);
    if (!stream) return toast('Ошибка', 'Браузер не поддерживает потоковую запись в файл. Используйте APK-версию.', true);
    await writeStreamingZip(stream, finalItems, (i, total, name, bytes) => { const pct = Math.min(99, Math.round((i / total) * 100)); const eta = formatEta(i, total, performance.now() - startTime); showProgress('Экспорт', pct, name || '', `${i}/${total} · ${(bytes/1048576).toFixed(0)} МБ · ${eta}`); });
    showProgress('Экспорт', 99, 'Финализация...', '', true);
    const result = await stream.close(); stream = null; hideProgress();
    if (result && result.uri && isCapacitorNative()) { const { Share } = window.Capacitor.Plugins; try { await Share.share({ title: zipName, files: [result.uri], url: result.uri }); } catch (e) { await Share.share({ title: zipName, url: result.uri }); } }
    toast('ZIP готов', `${finalItems.length} файл. · ${(result.size / 1048576).toFixed(2)} МБ`);
  } catch (e) {
    if (stream && typeof stream.abort === 'function') { try { await stream.abort(); } catch(_) {} }
    hideProgress();
    if (e.message === 'Отменено пользователем') toast('Отменено', 'Экспорт остановлен');
    else toast('Ошибка', 'Не удалось создать ZIP: ' + (e.message || e), true);
  } finally { endAbortableOperation(); releaseWakeLock(); }
};

$('ctxInfo').onclick = async () => {
  const totalSel = sel.size + folderSel.size; if (totalSel !== 1) return;
  try {
    if (sel.size === 1) { const id = [...sel][0]; const src = viewMode === 'trash' ? trashFilesCache : currentFilesCache; const f = src.find(x => x.id === id); if (f) showInfo('file', f); }
    else { const id = [...folderSel][0]; const folders = await getAllFolders(); const f = folders.find(x => x.id === id); if (f) showInfo('folder', f); }
  } catch(e) { toast('Ошибка', 'Не удалось', true); }
};

async function applyTagToSelected(tag, action) {
  const ids = [...sel]; if (!ids.length) return;
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(SF, 'readwrite'); const store = tx.objectStore(SF);
      chunk.forEach(id => { const getReq = store.get(id); getReq.onsuccess = () => { const v = getReq.result; if (v) { if (!v.tags) v.tags = []; if (action === 'add') { if (!v.tags.includes(tag)) v.tags.push(tag); } else if (action === 'remove') v.tags = v.tags.filter(x => x !== tag); store.put(v); } }; });
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    await new Promise(r => setTimeout(r, 10));
  }
  const updateCache = (arr) => arr.forEach(f => { if (sel.has(f.id)) { if (!f.tags) f.tags = []; if (action === 'add' && !f.tags.includes(tag)) f.tags.push(tag); if (action === 'remove') f.tags = f.tags.filter(x => x !== tag); } });
  updateCache(currentFilesCache); updateCache(trashFilesCache); updateCache(allActiveFilesCache);
  virtualState.lastRange = [-1,-1]; renderGrid(true); renderTagList();
}
function renderTagList() {
  const wrap = $('tagList'); wrap.innerHTML = '';
  const sf = (viewMode === 'trash' ? trashFilesCache : currentFilesCache).filter(f => sel.has(f.id));
  const allTags = new Set(); sf.forEach(f => (f.tags || []).forEach(t => allTags.add(t)));
  if (allTags.size === 0) { wrap.innerHTML = '<div style="color:var(--mut);font-size:14px;">Нет тегов</div>'; return; }
  allTags.forEach(tag => { const el = document.createElement('div'); el.className = 'tag-chip'; el.innerHTML = `#${escapeHtml(tag)} <span class="tag-del">${ICONS.xSmall}</span>`; el.querySelector('.tag-del').onclick = (e) => { e.stopPropagation(); playSound('click'); applyTagToSelected(tag, 'remove'); }; wrap.appendChild(el); });
}
$('ctxTag').onclick = () => { if (sel.size === 0) return; $('ctxMenu').classList.remove('on'); $('tagCount').textContent = sel.size; $('tagInput').value = ''; renderTagList(); $('modalTags').classList.add('on'); };
$('tagAddBtn').onclick = async () => { const tag = $('tagInput').value.trim(); if (!tag) return; $('tagInput').value = ''; await applyTagToSelected(tag, 'add'); };
$('tagInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('tagAddBtn').click(); } });
$('tagClose').onclick = () => { $('modalTags').classList.remove('on'); clearSel(); };

$('btnSort').onclick = () => { document.querySelectorAll('#modalSort .list-item').forEach(el=>{ el.style.background = el.dataset.sort===sortBy ? 'var(--bd)' : 'transparent'; }); $('modalSort').classList.add('on'); };
window.setSort = v => { sortBy=v; $('modalSort').classList.remove('on'); renderGrid(true); };
window.setTheme = async name => { document.body.dataset.theme=name; await setSetting('theme',name); document.querySelectorAll('.theme-item').forEach(el=>el.classList.toggle('sel', el.dataset.t===name)); };
window.setCols = async cols => { document.documentElement.style.setProperty('--cols',cols); await setSetting('cols',cols); document.querySelectorAll('.font-opt[data-c]').forEach(el=>el.classList.toggle('sel', el.dataset.c===cols)); virtualState.lastRange = [-1,-1]; renderGrid(true); };
async function loadTheme() {
  const s = await getAllSettings();
  let t = s.theme || 'dark';
  const ALLOWED = ['dark', 'light', 'warm', 'sepia'];
  if (!ALLOWED.includes(t)) t = 'dark';
  const c = s.cols || 'repeat(3, 1fr)';
  await setTheme(t); await setCols(c);
  const savedSlideshowMs = Number(s.slideshowInterval ?? DEFAULT_SLIDESHOW_MS);
  slideshowInterval = savedSlideshowMs;
  const sec = Math.round(savedSlideshowMs / 1000);
  $('slideshowIntRange').value = sec; $('slideshowIntVal').textContent = sec + ' сек';
  $('swLock').classList.toggle('on', !!s.lockEnabled);
  $('changePassWrap').style.display = $('swLock').classList.contains('on') ? 'block' : 'none';
  const trashDays = s.trashAutoDays ?? DEFAULT_TRASH_DAYS;
  updateTrashAutoPillsUI(trashDays);
  soundEnabled = s.soundEnabled === true;
  if ($('swSound')) $('swSound').classList.toggle('on', soundEnabled);
  folderPreviewEnabled = s.folderPreviewEnabled !== false;
  if ($('swFolderPreview')) $('swFolderPreview').classList.toggle('on', folderPreviewEnabled);
}
$('btnSettings').onclick = async () => { $('modalSettings').classList.add('on'); await updateStorageInfo(); await updateStatistics(); updateTrashAutoPillsUI(await getTrashAutoDays()); };

window.exportAllData = async () => {
  if (!await showConfirm('Экспорт', 'Создать полный архив со всеми файлами, папками и настройками?<br><br>Файлы стримятся на диск — поддерживаются любые объёмы (50+ ГБ).', 'Экспорт', 'Отмена')) return;
  await acquireWakeLock(); startAbortableOperation('export', 'Экспорт'); let stream = null; const startTime = performance.now();
  try {
    const [files, folders, settings] = await Promise.all([getAllFiles(), getAllFolders(), p(st(SS, 'readonly').getAll())]);
    const d = new Date(); const pad = n => String(n).padStart(2, '0');
    const zipName = `mediavault_backup_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
    const totalBytes = files.reduce((s, f) => s + (f.size || 0), 0);
    if (!await checkFreeSpace(totalBytes * 1.05, 'Экспорт')) return;
    showProgress('Экспорт', 0, 'Открытие файла...', '', true);
    stream = await createOutputStream(zipName);
    if (!stream) return toast('Ошибка', 'Браузер не поддерживает потоковую запись в файл. Используйте APK-версию.', true);
    const items = [];
    items.push({ name: 'metadata.json', getBlob: async () => new Blob([new TextEncoder().encode(JSON.stringify({ version: DB_VERSION, exportedAt: Date.now(), files, folders, settings }))]) });
    for (const f of files) items.push({ name: `files/${f.fileId}`, getBlob: async () => (await getFromOPFS(f.fileId)) || f.blob || null });
    for (const f of files) items.push({ name: `thumbs/${f.fileId}`, getBlob: async () => await getThumb(f) });
    await writeStreamingZip(stream, items, (i, total, name, bytes) => { const pct = Math.min(99, Math.round((i/total)*100)); const eta = formatEta(i, total, performance.now() - startTime); showProgress('Экспорт', pct, name || '...', `${i}/${total} · ${(bytes/1048576).toFixed(0)} МБ · ${eta}`); });
    showProgress('Экспорт', 99, 'Финализация...', '', true);
    const result = await stream.close(); stream = null; hideProgress();
    if (result && result.uri && isCapacitorNative()) { const { Share } = window.Capacitor.Plugins; try { await Share.share({ title: zipName, files: [result.uri], url: result.uri }); } catch (e) { await Share.share({ title: zipName, url: result.uri }); } }
    toast('Готово', `Экспортировано ${files.length} файлов (${(result.size / 1048576).toFixed(1)} МБ)`);
  } catch (e) { if (stream && typeof stream.abort === 'function') { try { await stream.abort(); } catch(_) {} } hideProgress(); if (e.message === 'Отменено пользователем') toast('Отменено', 'Экспорт остановлен'); else toast('Ошибка', 'Не удалось экспортировать: ' + (e.message || e), true); }
  finally { endAbortableOperation(); releaseWakeLock(); }
};

const ARCHIVE_MIME_MAP = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', bmp:'image/bmp', heic:'image/heic', heif:'image/heif', avif:'image/avif', mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime', avi:'video/x-msvideo', mkv:'video/x-matroska', m4v:'video/x-m4v', '3gp':'video/3gpp', flv:'video/x-flv', wmv:'video/x-ms-wmv' };
window.importNativeZip = async () => {
  const t0 = performance.now();
  let extractFolder = '';
  let safeZipName = '';

  try {
    const { FilePicker, Filesystem, CapacitorZip } = window.Capacitor.Plugins;

    const result = await FilePicker.pickFiles({
      types: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
      readData: false
    });

    if (!result.files || result.files.length === 0) return;

    const originalUri = result.files[0].path;
    safeZipName = `import_${Date.now()}.zip`;

    startAbortableOperation('import', 'Импорт');
    showProgress('Импорт', 0, 'Подготовка архива...', '', true);

    // ИСПОЛЬЗУЕМ FilePicker.copyFile для надежного копирования в DATA
    const { uri: cachedZipUri } = await FilePicker.copyFile({
      from: originalUri,
      to: safeZipName,
      toDirectory: 'DATA' // ИСПРАВЛЕНО: используем DATA
    });

    showProgress('Импорт', 5, 'Нативная распаковка...', '', true);
    extractFolder = `temp_extract_${Date.now()}`;

    const progressListener = await CapacitorZip.addListener('progress', (event) => {
      const percent = Math.round(event.progress * 100);
      showProgress('Импорт', 5 + Math.round(percent * 0.45), `Распаковка: ${percent}%`, '');
    });

    await CapacitorZip.unzip({
      source: cachedZipUri,
      destination: extractFolder
    });
    
    progressListener.remove();
    showProgress('Импорт', 50, 'Анализ файлов...', '', true);

    const allFiles = [];
    async function scanDir(path) {
        const res = await Filesystem.readdir({ path, directory: 'DATA' });
        for (const f of res.files) {
            if (f.type === 'directory') await scanDir(`${path}/${f.name}`);
            else allFiles.push({ name: f.name, path: `${path}/${f.name}` });
        }
    }
    await scanDir(extractFolder);

    const metaFile = allFiles.find(f => f.name === 'metadata.json');
    if (metaFile) {
      showProgress('Восстановление', 0, 'Чтение метаданных...', '', true);
      const metaData = await Filesystem.readFile({ path: metaFile.path, directory: 'DATA' });
      const metadata = JSON.parse(atob(metaData.data));
      
      hideProgress();
      if (!await showConfirm('Восстановление', 'Обнаружена полная резервная копия.<br><br>Все текущие данные будут <b>заменены</b>. Продолжить?', 'Восстановить', 'Отмена')) return;
      
      await acquireWakeLock();
      const totalFiles = metadata.files.length; let i = 0;
      for (const f of metadata.files) {
        checkAbort();
        try {
          const mainEntry = allFiles.find(x => x.name === f.fileId && x.path.includes('/files/'));
          if (mainEntry && rootDir) {
            const { uri } = await Filesystem.getUri({ path: mainEntry.path, directory: 'DATA' });
            const res = await fetch(Capacitor.convertFileSrc(uri));
            const blob = await res.blob();
            const fh = await rootDir.getFileHandle(f.fileId, { create: true });
            const wr = await fh.createWritable();
            await blob.stream().pipeTo(wr);
          }
          const thumbEntry = allFiles.find(x => x.name === f.fileId && x.path.includes('/thumbs/'));
          if (thumbEntry && rootDir) {
            const { uri } = await Filesystem.getUri({ path: thumbEntry.path, directory: 'DATA' });
            const res = await fetch(Capacitor.convertFileSrc(uri));
            const blob = await res.blob();
            const fh = await rootDir.getFileHandle(THUMB_PREFIX + f.fileId, { create: true });
            const wr = await fh.createWritable();
            await wr.write(blob); await wr.close();
          }
        } catch(e) { console.warn(e); }
        i++;
        showProgress('Восстановление', 10 + Math.round((i/totalFiles)*80), f.name || `Файл ${i}`, `${i}/${totalFiles}`);
      }
      
      showProgress('Восстановление', 92, 'База данных...', '', true);
      const t1 = db.transaction(SF, 'readwrite'); t1.objectStore(SF).clear(); await new Promise((res, rej) => { t1.oncomplete = res; t1.onerror = e => rej(e.target.error); });
      const t2 = db.transaction(SFL, 'readwrite'); t2.objectStore(SFL).clear(); await new Promise((res, rej) => { t2.oncomplete = res; t2.onerror = e => rej(e.target.error); });
      const t3 = db.transaction(SS, 'readwrite'); t3.objectStore(SS).clear(); await new Promise((res, rej) => { t3.oncomplete = res; t3.onerror = e => rej(e.target.error); });
      const t4 = db.transaction(SF, 'readwrite'); const s4 = t4.objectStore(SF); metadata.files.forEach(f => s4.put(f)); await new Promise((res, rej) => { t4.oncomplete = res; t4.onerror = e => rej(e.target.error); });
      const t5 = db.transaction(SFL, 'readwrite'); const s5 = t5.objectStore(SFL); metadata.folders.forEach(f => s5.put(f)); await new Promise((res, rej) => { t5.oncomplete = res; t5.onerror = e => rej(e.target.error); });
      if (metadata.settings && metadata.settings.length) { const t6 = db.transaction(SS, 'readwrite'); const s6 = t6.objectStore(SS); metadata.settings.forEach(s => s6.put(s)); await new Promise((res, rej) => { t6.oncomplete = res; t6.onerror = e => rej(e.target.error); }); }
      
      settingsCache = null; hideProgress(); toast('Готово', 'Восстановление завершено. Перезагрузка...');
      setTimeout(() => location.reload(), 1500); return;
    }

    const mediaFiles = allFiles.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ARCHIVE_MIME_MAP[ext] !== undefined;
    });

    if (!mediaFiles.length) { hideProgress(); toast('Пусто', 'Не найдено медиафайлов', true); return; }
    hideProgress();
    if (!await showConfirm('Импорт', `Найдено <b>${mediaFiles.length}</b> медиафайлов.<br><br>Начать импорт?`, 'Импортировать', 'Отмена')) return;
    
    await acquireWakeLock(); showProgress('Импорт', 50, 'Создание папок...', '', true);
    
    const folderPaths = new Set();
    mediaFiles.forEach(e => {
      const parts = e.path.split('/'); 
      parts.pop(); parts.shift(); 
      for (let i = 1; i <= parts.length; i++) folderPaths.add(parts.slice(0, i).join('/'));
    });
    
    const existingFolders = await getAllFolders(); const folderMap = new Map();
    const sortedPaths = [...folderPaths].sort((a, b) => a.split('/').length - b.split('/').length);
    for (const path of sortedPaths) {
      if (!path) continue;
      const parts = path.split('/'); const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      const parentId = parentPath ? folderMap.get(parentPath) : currentFolder;
      const existing = existingFolders.find(f => f.parentId === parentId && f.name === name && !f.deleted);
      let folderId;
      if (existing) folderId = existing.id;
      else { folderId = await addFolder(name, parentId, FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)]); existingFolders.push({ id: folderId, name, parentId: parentId ?? null, deleted: false }); }
      folderMap.set(path, folderId);
    }

    const existingFiles = await getAllFiles();
    const existingHashes = new Set(existingFiles.filter(f => !f.deleted).map(f => f.hash).filter(h => h && !h.startsWith('unique_')));
    const sizesInDb = new Set(existingFiles.filter(f => !f.deleted).map(f => f.size || 0));
    const pendingRecords = []; const importedFiles = []; const FLUSH_SIZE = 100; let lastYield = Date.now();
    const flushBatch = async () => { if (pendingRecords.length === 0) return; const batch = pendingRecords.splice(0); await new Promise((res, rej) => { const tx = db.transaction(SF, 'readwrite'); const store = tx.objectStore(SF); for (const r of batch) store.add(r); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); };
    
    let imported = 0, skipped = 0, failed = 0;

    for (let i = 0; i < mediaFiles.length; i++) {
      checkAbort(); const nf = mediaFiles[i]; const fileName = nf.name;
      try {
        const parts = nf.path.split('/'); parts.pop(); parts.shift(); 
        const folderPath = parts.join('/'); 
        const targetFolderId = folderPath ? folderMap.get(folderPath) : currentFolder;
        
        const ext = fileName.split('.').pop().toLowerCase(); const mime = ARCHIVE_MIME_MAP[ext] || '';
        
        const { uri } = await Filesystem.getUri({ path: nf.path, directory: 'DATA' });
        const response = await fetch(Capacitor.convertFileSrc(uri));
        const blob = await response.blob();

        let hash = ''; let isDuplicate = false;
        if (sizesInDb.has(blob.size)) { try { hash = await calculateHash(blob); } catch(e) {} if (hash && existingHashes.has(hash)) isDuplicate = true; }
        
        if (isDuplicate) { skipped++; }
        else {
          const fileId = generateId(); const type = detectType(blob);
          const exifDate = (type === 'image') ? await extractExifDate(blob) : null;
          const record = { fileId, name: fileName, type, mime, size: blob.size, date: exifDate || Date.now(), importedAt: Date.now(), folderId: targetFolderId, hash, deleted: false, deletedAt: null, fav: false, tags: [] };
          
          if (rootDir) { 
            const fh = await rootDir.getFileHandle(fileId, { create: true });
            const wr = await fh.createWritable();
            await blob.stream().pipeTo(wr); 
            pendingRecords.push(record); importedFiles.push(record); 
            if (hash && !hash.startsWith('unique_')) existingHashes.add(hash); sizesInDb.add(blob.size); imported++; 
            if (pendingRecords.length >= FLUSH_SIZE) await flushBatch(); 
          }
        }
      } catch (err) { console.warn('Import file error', err); failed++; }
      
      const now = Date.now();
      if (now - lastYield > 150 || i === mediaFiles.length - 1) { 
        lastYield = now; 
        const eta = formatEta(i + 1, mediaFiles.length, performance.now() - t0); 
        showProgress('Импорт', 50 + Math.round(((i + 1) / mediaFiles.length) * 48), `${i + 1}/${mediaFiles.length}: ${fileName}`, `✓${imported} · ⏭${skipped} · ✗${failed} · ${eta}`); 
        await nextMacrotask(); 
      }
    }
    
    await flushBatch();
    importedFiles.forEach(f => queueBgThumb(f));
    hideProgress(); await refresh(); toast('Импорт завершён', `${imported} файл. за ${((performance.now() - t0) / 1000).toFixed(0)} сек`);

  } catch (e) {
    hideProgress(); 
    if (e.message === 'Отменено пользователем') toast('Отменено', 'Импорт остановлен'); 
    else toast('Ошибка', e.message || 'Не удалось обработать архив', true);
  } finally {
    if (safeZipName) {
      try { await window.Capacitor.Plugins.Filesystem.deleteFile({ path: safeZipName, directory: 'DATA' }); } catch(e){}
    }
    if (extractFolder) {
      try { await window.Capacitor.Plugins.Filesystem.rmdir({ path: extractFolder, directory: 'DATA', recursive: true }); } catch(e){}
    }
    endAbortableOperation(); releaseWakeLock();
  }
};

let ckTarget = null, ckLayout = 'ru', ckShift = false, ckNumeric = false;
const CK_LAYOUTS = {
  ru: [['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],['ф','ы','в','а','п','р','о','л','д','ж','э'],['shift','я','ч','с','м','и','т','ь','б','ю','backspace'],['123','space','enter']],
  en: [['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['shift','z','x','c','v','b','n','m','backspace'],['123','space','enter']],
  num: [['1','2','3','4','5','6','7','8','9','0'],['-','/',':',';','(',')','₽','&','@','"'],['shift','.',',','?','!','\'','backspace'],['abc','space','enter']],
  numpad: [['1','2','3'],['4','5','6'],['7','8','9'],['backspace','0','enter']]
};
let ckLayoutsBuilt = false;
function buildKeyboardDOM() {
  if (ckLayoutsBuilt) return;
  const rowsEl = $('ckRows'); rowsEl.innerHTML = '';
  for (const [name, layout] of Object.entries(CK_LAYOUTS)) {
    const container = document.createElement('div'); container.className = 'ck-layout'; container.id = 'ck-layout-' + name; container.style.display = 'none';
    layout.forEach(row => {
      const rowEl = document.createElement('div'); rowEl.className = 'ck-row';
      row.forEach(key => {
        const btn = document.createElement('button'); btn.className = 'ck-key'; btn.type = 'button';
        if (key === 'shift') { btn.classList.add('ck-wide'); btn.innerHTML = '⇧'; btn.dataset.action = 'shift'; }
        else if (key === 'backspace') { btn.classList.add('ck-wide'); btn.innerHTML = '⌫'; btn.dataset.action = 'backspace'; }
        else if (key === 'space') { btn.classList.add('ck-space'); btn.textContent = 'Пробел'; btn.dataset.action = 'space'; }
        else if (key === 'enter') { btn.classList.add('ck-wide', 'ck-enter'); btn.innerHTML = '↵'; btn.dataset.action = 'enter'; }
        else if (key === '123') { btn.classList.add('ck-wide'); btn.textContent = '123'; btn.dataset.action = 'toNum'; }
        else if (key === 'abc') { btn.classList.add('ck-wide'); btn.textContent = 'АБВ'; btn.dataset.action = 'toAbc'; }
        else { btn.textContent = key; btn.dataset.char = key; }
        rowEl.appendChild(btn);
      });
      container.appendChild(rowEl);
    });
    rowsEl.appendChild(container);
  }
  ckLayoutsBuilt = true;
}
function updateKeyboardKeys() { document.querySelectorAll('.ck-key[data-char]').forEach(btn => { const c = btn.dataset.char; if (ckShift && /[a-zа-яё]/i.test(c)) btn.textContent = c.toUpperCase(); else btn.textContent = c; }); document.querySelectorAll('.ck-key[data-action="shift"]').forEach(btn => btn.classList.toggle('ck-active', ckShift)); }
function ckRender() {
  buildKeyboardDOM();
  const activeLayout = ckNumeric ? 'numpad' : ckLayout;
  document.querySelectorAll('.ck-layout').forEach(el => el.style.display = 'none');
  const el = $('ck-layout-' + activeLayout); if (el) el.style.display = 'flex';
  updateKeyboardKeys();
  const lb = $('ckLangBtn'), mb = $('ckModeBtn');
  if (ckNumeric) { lb.hidden = true; mb.hidden = true; }
  else { lb.hidden = ckLayout === 'num'; lb.textContent = ckLayout === 'en' ? 'EN' : 'РУ'; mb.hidden = false; mb.textContent = ckLayout === 'num' ? 'АБВ' : '123'; }
}
function ckIsTextInput(t) { if (!t) return false; if (t.tagName === 'TEXTAREA') return true; if (t.tagName !== 'INPUT') return false; const type = (t.type || 'text').toLowerCase(); if (['file','range','checkbox','radio','button','submit','reset','color','date','time','datetime-local','month','week'].includes(type)) return false; return true; }
function ckDetectNumeric(input) { if (input.type === 'password') return true; const im = input.getAttribute('inputmode'); return im === 'numeric' || im === 'decimal' || im === 'tel'; }
function ckShow(input) {
  ckTarget = input; ckNumeric = ckDetectNumeric(input); ckShift = false; ckLayout = ckNumeric ? 'num' : 'ru';
  if (input.dataset.ckOrigInputmode === undefined) input.dataset.ckOrigInputmode = input.getAttribute('inputmode') || '';
  input.setAttribute('inputmode', 'none');
  ckRender();
  $('customKeyboard').classList.add('ck-on'); document.body.classList.add('kb-open');
  const modal = input.closest('.modal'); if (modal) modal.classList.add('kb-open');
  setTimeout(() => { try { input.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(e) {} }, 120);
}
function ckHide(blur = true) {
  if (ckTarget && ckTarget.dataset.ckOrigInputmode !== undefined) { const orig = ckTarget.dataset.ckOrigInputmode; if (orig) ckTarget.setAttribute('inputmode', orig); else ckTarget.removeAttribute('inputmode'); delete ckTarget.dataset.ckOrigInputmode; }
  if (blur && ckTarget && document.activeElement === ckTarget) { try { ckTarget.blur(); } catch(e) {} }
  ckTarget = null;
  $('customKeyboard').classList.remove('ck-on'); document.body.classList.remove('kb-open');
  document.querySelectorAll('.modal.kb-open').forEach(m => m.classList.remove('kb-open'));
}
function ckInsert(ch) {
  if (!ckTarget) return;
  const el = ckTarget; const start = el.selectionStart ?? el.value.length; const end = el.selectionEnd ?? el.value.length;
  el.value = (el.value || '').slice(0, start) + ch + (el.value || '').slice(end);
  try { el.setSelectionRange(start + ch.length, start + ch.length); } catch(e) {}
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
function ckBackspace() {
  if (!ckTarget) return;
  const el = ckTarget; const start = el.selectionStart ?? el.value.length; const end = el.selectionEnd ?? el.value.length;
  if (start !== end) { el.value = el.value.slice(0, start) + el.value.slice(end); try { el.setSelectionRange(start, start); } catch(e) {} }
  else if (start > 0) { el.value = el.value.slice(0, start - 1) + el.value.slice(start); try { el.setSelectionRange(start - 1, start - 1); } catch(e) {} }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
function ckEnter() { if (!ckTarget) return; ckTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })); setTimeout(() => ckHide(true), 80); }
document.addEventListener('pointerdown', (e) => {
  const key = e.target.closest('.ck-key'); if (!key) return;
  e.preventDefault(); if (!ckTarget) return; playSound('click');
  const a = key.dataset.action, ch = key.dataset.char;
  if (a === 'shift') { ckShift = !ckShift; updateKeyboardKeys(); }
  else if (a === 'backspace') ckBackspace();
  else if (a === 'space') ckInsert(' ');
  else if (a === 'enter') ckEnter();
  else if (a === 'toNum') { ckLayout = 'num'; ckRender(); }
  else if (a === 'toAbc') { ckLayout = 'ru'; ckRender(); }
  else if (ch !== undefined) { const c = (ckShift && /[a-zа-яё]/i.test(ch)) ? ch.toUpperCase() : ch; ckInsert(c); if (ckShift && /[a-zа-яё]/i.test(ch)) { ckShift = false; updateKeyboardKeys(); } }
}, { passive: false });
$('ckDoneBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); playSound('click'); ckHide(true); });
$('ckLangBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); playSound('click'); ckLayout = (ckLayout === 'en') ? 'ru' : 'en'; ckShift = false; ckRender(); });
$('ckModeBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); playSound('click'); ckLayout = (ckLayout === 'num') ? 'ru' : 'num'; ckShift = false; ckRender(); });
document.addEventListener('focusin', (e) => { const t = e.target; if (!ckIsTextInput(t)) return; if (t === ckTarget) return; ckShow(t); });
$('lockInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('lockBtn').click(); } });
$('newPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const btn = document.querySelector('button[onclick*="savePassword"]'); if (btn) btn.click(); } });
document.addEventListener('pointerdown', (e) => { if (!ckTarget) return; if (e.target.closest('.ck')) return; if (e.target === ckTarget) return; if (ckIsTextInput(e.target)) return; ckHide(true); }, { passive: true });

document.querySelectorAll('.modal:not(.custom-confirm) .box').forEach(box => {
  let sy = 0, cy = 0, dragging = false;
  box.addEventListener('touchstart', (e) => { if (e.target.closest('input, button, select, textarea, .ck, .font-opt, .theme-item, .list-item, .settings-btn')) return; if (box.scrollTop > 0) return; sy = e.touches[0].clientY; dragging = true; box.style.transition = 'none'; }, { passive: true });
  box.addEventListener('touchmove', (e) => { if (!dragging) return; cy = e.touches[0].clientY; const dy = cy - sy; if (dy > 0 && box.scrollTop === 0) { if (e.cancelable) e.preventDefault(); box.style.transform = `translateY(${dy}px)`; } else if (dy < 0) { dragging = false; box.style.transform = ''; box.style.transition = ''; } }, { passive: false });
  box.addEventListener('touchend', () => { if (!dragging) return; dragging = false; const dy = cy - sy; box.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'; if (dy > 100) { box.style.transform = 'translateY(100%)'; setTimeout(() => { box.closest('.modal').classList.remove('on'); box.style.transform = ''; box.style.transition = ''; }, 300); } else { box.style.transform = 'translateY(0)'; setTimeout(() => { box.style.transition = ''; }, 300); } sy = 0; cy = 0; });
  box.addEventListener('touchcancel', () => { dragging = false; box.style.transform = ''; box.style.transition = ''; sy = 0; cy = 0; });
});

window.openGithub = function(e) { if (e && e.preventDefault) e.preventDefault(); const url = (e && e.currentTarget && e.currentTarget.href) || 'https://github.com/Ravi8O8/Krypta'; try { const w = window.open(url, '_blank', 'noopener,noreferrer'); if (!w || w.closed || typeof w.closed === 'undefined') window.location.href = url; } catch(err) { try { window.location.href = url; } catch(_) {} } };

function setupAndroidBackButton() {
  if (!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App)) return;
  try {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
      if ($('viewerModal').classList.contains('on')) { $('viewerClose').click(); return; }
      if ($('modalSettings').classList.contains('on')) { $('modalSettings').classList.remove('on'); return; }
      if ($('modalInfo').classList.contains('on')) { $('modalInfo').classList.remove('on'); return; }
      if ($('modalConfirm').classList.contains('on')) { $('confirmCancel').click(); return; }
      if ($('modalEdit').classList.contains('on')) { $('meCancel').click(); return; }
      if ($('modalMove').classList.contains('on')) { $('mvCancel').click(); return; }
      if ($('modalSort').classList.contains('on')) { $('modalSort').classList.remove('on'); return; }
      if ($('modalTags').classList.contains('on')) { $('tagClose').click(); return; }
      if ($('modalDuplicates').classList.contains('on')) { $('modalDuplicates').classList.remove('on'); return; }
      if ($('modalCompressResult').classList.contains('on')) { $('modalCompressResult').classList.remove('on'); return; }
      if (ckTarget) { ckHide(true); return; }
      if (sel.size + folderSel.size > 0) { clearSel(); return; }
      if (viewMode === 'trash') { document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); const filesTab = document.querySelector('.tab[data-view="files"]'); if (filesTab) filesTab.classList.add('active'); viewMode = 'files'; document.body.dataset.view = 'files'; filterType = 'all'; refresh(); return; }
      if (currentFolder !== null) { const cur = allActiveFoldersCache.find(f => f.id === currentFolder); currentFolder = cur ? cur.parentId : null; clearSel(); refresh(); return; }
      try { window.Capacitor.Plugins.App.exitApp(); } catch(_) {}
    });
  } catch(e) {}
}

(async () => {
  try {
    await initOPFS();
    await openDB();
    await loadTheme();
    await checkLock();
    setupAndroidBackButton();
    setTimeout(() => { autoCleanTrash().catch(()=>{}); }, 3000);
    setTimeout(() => { virtualState.lastRange = [-1,-1]; updateVirtualGrid(); }, 200);
  } catch(e) {
    document.body.innerHTML = '<div style="padding:20px;text-align:center;color:red;">Ошибка базы данных.</div>';
  }
})();
