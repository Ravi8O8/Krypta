const DB_NAME='MediaVault_Final', DB_VERSION=33;
const SF='files', SFL='folders', SS='settings';
const PAGE_SIZE = 30;
const BG_FILE_ID = 'custom-bg';
const THUMB_PREFIX = 'thumb_';
const DEFAULT_SLIDESHOW_MS = 3000;
const DEFAULT_TRASH_DAYS = 30;

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

const FOLDER_COLORS = ['#a78bfa', '#f87171', '#34d399', '#fbbf24', '#60a5fa', '#ec4899', '#818cf8', '#94a3b8'];
let selectedFolderColor = FOLDER_COLORS[0];

let db, currentFolder=null, filterType='all', searchQuery='';
let viewMode = 'files';
let sel=new Set(), folderSel=new Set();
const failedVideoThumbs = new Set();
let sortBy='date_desc', isLocked=false, storedHash='', storedSalt='';
let pressTimer=null, isLongPress=false;
let galleryFiles=[], currentGalleryIndex=0;
let rootDir = null;
let bgObjectUrl = null;
let bgPreviewObjectUrl = null;
let slideshowTimer = null;
let slideshowActive = false;
let slideshowInterval = DEFAULT_SLIDESHOW_MS;
let currentScale = 1;
let viewerToken = 0;
let slideToken = 0;

let currentFilesCache = [];
let currentFoldersCache = [];
let trashFilesCache = [];
let trashFoldersCache = [];
let currentRenderIndex = 0;
let allLoaded = false;
let isLoadingMore = false;
let startX = 0, startY = 0, isScrolling = false;
let scrollTimeout = null;

let editIsFolder = true;
let editId = null;
let batchMode = false;

let isDragSelecting = false;
let lastHoveredTile = null;
let lastDragTime = 0;

let pinchStartDist = 0;
let pinchActive = false;
let pinchEndTime = 0;

let searchTimer = null;
let scrollRaf = null;
let bgThumbQueue = [];
let bgThumbRunning = false;

let wakeLock = null;
let isAppInBackground = false;

let soundEnabled = true;
let folderPreviewEnabled = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playSound(type) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  if (type === 'click') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);
    if (navigator.vibrate) navigator.vibrate(10);
  } else if (type === 'success') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.setValueAtTime(900, now + 0.1);
    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
  } else if (type === 'error') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now);
    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
  } else if (type === 'swipe') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);
    if (navigator.vibrate) navigator.vibrate(5);
  }
}

window.toggleSound = async () => {
  soundEnabled = !soundEnabled;
  document.getElementById('swSound').classList.toggle('on', soundEnabled);
  await setSetting('soundEnabled', soundEnabled);
  if (soundEnabled) playSound('success');
};

window.toggleFolderPreview = async () => {
  folderPreviewEnabled = !folderPreviewEnabled;
  const sw = document.getElementById('swFolderPreview');
  if (sw) sw.classList.toggle('on', folderPreviewEnabled);
  await setSetting('folderPreviewEnabled', folderPreviewEnabled);
  renderGrid(true);
  if (folderPreviewEnabled) toast('Превью папок', 'Включено');
  else toast('Превью папок', 'Отключено');
};

document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button') || e.target.closest('.tab') || e.target.closest('.ctx-item') || e.target.closest('.theme-item') || e.target.closest('.font-opt') || e.target.closest('.pill') || e.target.closest('.settings-btn')) {
    if (!e.target.closest('.ck-key') && !e.target.closest('#confirmOk') && !e.target.closest('#confirmCancel')) playSound('click');
  }
}, { passive: true });

let settingsCache = null;
async function getAllSettings() {
  if (settingsCache !== null) return settingsCache;
  const all = await p(st(SS, 'readonly').getAll());
  settingsCache = {};
  all.forEach(s => { settingsCache[s.key] = s.value; });
  return settingsCache;
}
async function getSetting(k) { const s = await getAllSettings(); return s[k] ?? null; }
async function setSetting(k, v) {
  if (settingsCache !== null) settingsCache[k] = v;
  return p(st(SS, 'readwrite').put({key: k, value: v}));
}

const PBKDF2_WORKER_CODE = `self.onmessage = async (e) => { const { id, type, password, saltHex, iterations } = e.data; try { const hexToBytes = (hex) => { const arr = new Uint8Array(hex.length / 2); for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.substr(i, 2), 16); return arr; }; const bytesToHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''); const enc = new TextEncoder(); const salt = hexToBytes(saltHex); const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']); const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations, hash:'SHA-256'}, keyMaterial, 256); self.postMessage({ id, result: bytesToHex(bits) }); } catch (err) { self.postMessage({ id, error: err.message || String(err) }); } };`;
let pbkdf2Worker = null, pbkdf2Pending = new Map(), pbkdf2NextId = 1;
function getPbkdf2Worker() {
  if (pbkdf2Worker !== null) return pbkdf2Worker;
  try {
    const blob = new Blob([PBKDF2_WORKER_CODE], { type: 'application/javascript' });
    pbkdf2Worker = new Worker(URL.createObjectURL(blob));
    pbkdf2Worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const h = pbkdf2Pending.get(id); if (!h) return;
      pbkdf2Pending.delete(id);
      if (error) h.reject(new Error(error)); else h.resolve(result);
    };
    pbkdf2Worker.onerror = () => {
      const pending = [...pbkdf2Pending.values()]; pbkdf2Pending.clear();
      pending.forEach(h => h.reject(new Error('Worker failed')));
      try { pbkdf2Worker.terminate(); } catch(e){}
      pbkdf2Worker = null;
    };
  } catch (e) { pbkdf2Worker = false; }
  return pbkdf2Worker;
}
function pbkdf2Run(type, password, saltHex, iterations) {
  const w = getPbkdf2Worker();
  if (!w) return Promise.reject(new Error('Worker unavailable'));
  return new Promise((resolve, reject) => {
    const id = pbkdf2NextId++;
    pbkdf2Pending.set(id, { resolve, reject });
    w.postMessage({ id, type, password, saltHex, iterations });
  });
}

const nextMacrotask = (() => {
  if (typeof scheduler !== 'undefined' && scheduler && typeof scheduler.postTask === 'function') {
    return () => new Promise((resolve) => {
      try {
        scheduler.postTask(resolve, { priority: 'user-visible' });
      } catch (e) {
        setTimeout(resolve, 0);
      }
    });
  }
  return () => new Promise(r => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => { try { ch.port1.close(); } catch(e){} r(); };
    ch.port2.postMessage(0);
  });
})();

async function acquireWakeLock() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch(e) {}
}
function releaseWakeLock() { try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch(e) {} }
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    isAppInBackground = true; releaseWakeLock();
    if (slideshowTimer) clearTimeout(slideshowTimer);
  } else {
    isAppInBackground = false; acquireWakeLock();
    if (!isLocked) await refresh();
  }
});

const imageLoader = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      if (el.dataset.type === 'folder') {
        if (!el._previewLoaded) loadFolderPreview(Number(el.dataset.id), el);
      } else {
        if (!el._blobUrl && !el._loading) loadTileImage(el);
      }
    } else {
      const imgEl = el.querySelector('.tile-img');
      if (el._blobUrl && imgEl && imgEl.classList.contains('loaded')) {
        const url = el._blobUrl;
        el._blobUrl = null;
        try { URL.revokeObjectURL(url); } catch(e) {}
        imgEl.removeAttribute('src');
        imgEl.classList.remove('loaded');
        if (!el.querySelector('.skeleton')) {
          const skel = document.createElement('div');
          skel.className = 'skeleton';
          el.insertBefore(skel, el.firstChild);
        }
      }
    }
  });
}, { rootMargin: '400px 0px' });

const $ = id => document.getElementById(id);
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function showProgress(title, percent, file, eta) {
  $('progTitle').textContent = title; $('progPercent').textContent = percent + '%';
  $('progFill').style.width = percent + '%'; $('progFile').textContent = file; $('progEta').textContent = eta;
  $('progressDrawer').classList.add('on');
}
function hideProgress() { $('progressDrawer').classList.remove('on'); }

// ============================================================
// TOAST + UNDO
// ============================================================
let pendingUndo = null;

function toast(title, sub='', isError=false) {
  if (pendingUndo) {
    clearTimeout(pendingUndo.timer);
    pendingUndo = null;
  }
  const t = $('toast');
  t.classList.remove('with-action');
  t.innerHTML = `<div class="toast-title ${isError?'error':''}">${escapeHtml(title)}</div><div class="toast-sub">${escapeHtml(sub)}</div>`;
  t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('on'), 4000);
  if (isError) playSound('error'); else playSound('success');
}

function showUndoToast(title, sub, onUndo, duration = 5000) {
  if (pendingUndo) {
    clearTimeout(pendingUndo.timer);
    pendingUndo = null;
  }
  const t = $('toast');
  t.innerHTML = `
    <div class="toast-title">${escapeHtml(title)}</div>
    ${sub ? `<div class="toast-sub">${escapeHtml(sub)}</div>` : ''}
    <button type="button" class="toast-action" id="toastUndoBtn">Отменить</button>
  `;
  t.classList.add('on', 'with-action');
  clearTimeout(t._h);

  const btn = t.querySelector('#toastUndoBtn');
  let executed = false;

  const doUndo = async () => {
    if (executed) return;
    executed = true;
    if (pendingUndo) { clearTimeout(pendingUndo.timer); pendingUndo = null; }
    t.classList.remove('on', 'with-action');
    try { await onUndo(); }
    catch (e) { console.error(e); toast('Ошибка', 'Не удалось отменить', true); }
  };

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    doUndo();
  });

  const timer = setTimeout(() => {
    pendingUndo = null;
    t.classList.remove('on', 'with-action');
  }, duration);

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
    modal.style.zIndex = '99999';
    modal.classList.add('on');
  });
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c=i; for (let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[i]=c>>>0; }
  return t;
})();

// ================================================================
// СОЗДАНИЕ ZIP
// ================================================================
async function createZip(files) {
  const encoder = new TextEncoder(); 
  const localParts = [], centralParts = []; 
  let offset = 0;
  
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const nameBytes = encoder.encode(f.name); 
    const blob = f.blob; 
    const size = blob.size;
    
    let crc = 0xFFFFFFFF;
    const reader = blob.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (let j = 0; j < value.length; j++) {
        crc = CRC_TABLE[(crc ^ value[j]) & 0xFF] ^ (crc >>> 8);
      }
      if (value.length > 1048576) await new Promise(r => setTimeout(r, 0));
    }
    crc = (crc ^ 0xFFFFFFFF) >>> 0;

    const lfh = new Uint8Array(30 + nameBytes.length); const dv = new DataView(lfh.buffer);
    dv.setUint32(0,0x04034b50,true); dv.setUint16(4,20,true); dv.setUint16(6,0x0800,true); dv.setUint16(8,0,true); dv.setUint16(10,0,true); dv.setUint16(12,0,true);
    dv.setUint32(14,crc,true); dv.setUint32(18,size,true); dv.setUint32(22,size,true); dv.setUint16(26,nameBytes.length,true); dv.setUint16(28,0,true);
    lfh.set(nameBytes,30); 
    localParts.push(lfh, blob);
    
    const cd = new Uint8Array(46 + nameBytes.length); const cdv = new DataView(cd.buffer);
    cdv.setUint32(0,0x02014b50,true); cdv.setUint16(4,20,true); cdv.setUint16(6,20,true); cdv.setUint16(8,0x0800,true); cdv.setUint16(10,0,true); cdv.setUint16(12,0,true); cdv.setUint16(14,0,true);
    cdv.setUint32(16,crc,true); cdv.setUint32(20,size,true); cdv.setUint32(24,size,true); cdv.setUint16(28,nameBytes.length,true);
    cdv.setUint32(42,offset,true); cd.set(nameBytes,46); centralParts.push(cd);
    offset += lfh.length + size;
    
    if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
  }
  const centralSize = centralParts.reduce((s, p) => s + p.length, 0);
  const eocd = new Uint8Array(22); const edv = new DataView(eocd.buffer);
  edv.setUint32(0,0x06054b50,true); edv.setUint16(8,files.length,true); edv.setUint16(10,files.length,true); edv.setUint32(12,centralSize,true); edv.setUint32(16,offset,true);
  return new Blob([...localParts, ...centralParts, eocd], { type: 'application/zip' });
}

async function parseZip(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  const dv = new DataView(buf.buffer);
  const files = [];
  let eocdPos = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocdPos = i; break; }
  }
  if (eocdPos === -1) throw new Error('Неверный ZIP архив (нет EOCD)');
  const cdOffset = dv.getUint32(eocdPos + 16, true);
  const cdCount = dv.getUint16(eocdPos + 10, true);
  let pos = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (dv.getUint32(pos, true) !== 0x02014b50) break;
    const method = dv.getUint16(pos + 10, true);
    const compSize = dv.getUint32(pos + 20, true);
    const nameLen = dv.getUint16(pos + 28, true);
    const extraLen = dv.getUint16(pos + 30, true);
    const commentLen = dv.getUint16(pos + 32, true);
    const localOffset = dv.getUint32(pos + 42, true);
    const name = new TextDecoder().decode(buf.slice(pos + 46, pos + 46 + nameLen));
    const lnameLen = dv.getUint16(localOffset + 26, true);
    const lextraLen = dv.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + lnameLen + lextraLen;
    const rawData = buf.slice(dataStart, dataStart + compSize);
    let data = rawData;
    if (method === 8) {
      try {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(rawData); writer.close();
        const reader = ds.readable.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLen = chunks.reduce((s, c) => s + c.length, 0);
        const out = new Uint8Array(totalLen);
        let off = 0;
        for (const c of chunks) { out.set(c, off); off += c.length; }
        data = out;
      } catch(e) { console.warn('Не удалось распаковать', name, e); continue; }
    } else if (method !== 0) {
      console.warn('Неизвестный метод сжатия', method, name); continue;
    }
    files.push({ name, data });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function sanitizeName(name) { return String(name || 'file').replace(/[\/\\:*?"<>|\x00-\x1f]/g, '_'); }

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
    const img = new Image();
    const url = URL.createObjectURL(file);
    const timeout = setTimeout(() => { URL.revokeObjectURL(url); resolve(null); }, 10000);
    img.onload = () => {
      clearTimeout(timeout);
      try {
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
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
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    const url = URL.createObjectURL(file);
    let resolved = false;
    const finish = (val) => {
      if (resolved) return;
      resolved = true;
      try { URL.revokeObjectURL(url); } catch(e) {}
      try { video.removeAttribute('src'); video.load(); } catch(e) {}
      resolve(val);
    };
    const timeout = setTimeout(() => finish(null), 8000);

    const capture = () => {
      try {
        let w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) { finish(null); return; }
        const minSide = Math.min(w, h);
        const sx = (w - minSide) / 2;
        const sy = (h - minSide) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);
        canvas.toBlob(blob => { clearTimeout(timeout); finish(blob); }, 'image/jpeg', 0.78);
      } catch(e) { finish(null); }
    };

    let attempts = 0;
    const trySeek = () => {
      try {
        const dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
        attempts++;
        if (attempts === 1) video.currentTime = Math.min(1, dur * 0.1) || 0.5;
        else if (attempts === 2) video.currentTime = Math.min(2, dur * 0.25) || 1;
        else if (attempts === 3) { try { video.currentTime = 0; } catch(e) { capture(); } }
        else capture();
      } catch(e) { capture(); }
    };

    video.onloadedmetadata = () => { trySeek(); };
    video.onseeked = () => {
      if (attempts < 3) {
        setTimeout(capture, 100);
      } else capture();
    };
    video.onerror = () => {
      if (attempts < 3) trySeek();
      else { clearTimeout(timeout); finish(null); }
    };
    video.oncanplay = () => {
      if (!resolved && attempts === 0) trySeek();
    };
    video.src = url;
    try { video.load(); } catch(e) {}
  });
}

async function saveThumb(fileId, blob) {
  if (!rootDir || !blob) return;
  try {
    const fh = await rootDir.getFileHandle(THUMB_PREFIX + fileId, { create: true });
    const wr = await fh.createWritable(); await wr.write(blob); await wr.close();
  } catch(e) {}
}
async function getThumb(f) {
  if (!rootDir) return null;
  try { const fh = await rootDir.getFileHandle(THUMB_PREFIX + f.fileId); return await fh.getFile(); } catch(e) { return null; }
}
async function deleteThumb(fileId) {
  if (!rootDir) return;
  try { await rootDir.removeEntry(THUMB_PREFIX + fileId); } catch(e) {}
}
function queueBgThumb(f) {
  if (bgThumbQueue.find(x => x.id === f.id)) return;
  bgThumbQueue.push(f);
  processBgThumbQueue();
}
async function processBgThumbQueue() {
  if (bgThumbRunning) return;
  bgThumbRunning = true;
  while (bgThumbQueue.length > 0) {
    const f = bgThumbQueue.shift();
    try {
      const existing = await getThumb(f);
      if (!existing && (f.type === 'image' || f.type === 'video')) {
        const file = await getFromOPFS(f.fileId) || f.blob;
        if (file) {
          const thumb = f.type === 'image'
            ? await generateImageThumbnail(file)
            : await generateVideoThumbnail(file);
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
  if (tileEl._previewLoaded) return;
  tileEl._previewLoaded = true;
  try {
    const tx = db.transaction(SF, 'readonly');
    const index = tx.objectStore(SF).index('folder');
    const files = await p(index.getAll(folderId));
    const valid = files.filter(f => !f.deleted && (f.type === 'image' || f.type === 'video')).slice(0, 4);
    if (valid.length === 0) return;
    const previewEl = tileEl.querySelector('.folder-preview');
    if (!previewEl) return;
    let loaded = 0;
    for (const f of valid) {
      const thumb = await getThumb(f);
      if (thumb) {
        const url = URL.createObjectURL(thumb);
        const item = document.createElement('div');
        item.className = 'fp-item';
        item.innerHTML = `<img src="${url}" loading="lazy">`;
        previewEl.appendChild(item);
        loaded++;
        if (!tileEl._previewUrls) tileEl._previewUrls = [];
        tileEl._previewUrls.push(url);
      }
    }
    if (loaded > 0) {
      tileEl.classList.remove('no-preview');
      tileEl.classList.add('has-preview');
    }
  } catch(e) { console.warn('Folder preview error', e); }
}

async function applyBackground(bgFile = undefined) {
  const s = await getAllSettings();
  const enabled = s.bgEnabled;
  const opacity = Number(s.bgOpacity ?? 85);
  document.documentElement.style.setProperty('--bg-overlay', (opacity / 100).toFixed(2));
  if (!enabled) {
    document.body.classList.remove('has-bg');
    document.documentElement.style.removeProperty('--bg-image');
    if (bgObjectUrl) { try { URL.revokeObjectURL(bgObjectUrl); } catch(e) {} bgObjectUrl = null; }
    return;
  }
  if (bgFile === undefined) bgFile = await getFromOPFS(BG_FILE_ID);
  if (!bgFile) { document.body.classList.remove('has-bg'); document.documentElement.style.removeProperty('--bg-image'); return; }
  if (bgObjectUrl) { try { URL.revokeObjectURL(bgObjectUrl); } catch(e) {} }
  bgObjectUrl = URL.createObjectURL(bgFile);
  document.documentElement.style.setProperty('--bg-image', `url("${bgObjectUrl}")`);
  document.body.classList.add('has-bg');
}
async function updateBgPreview(bgFile = undefined) {
  const s = await getAllSettings();
  const enabled = s.bgEnabled;
  if (bgFile === undefined) bgFile = await getFromOPFS(BG_FILE_ID);
  const previewEl = $('bgPreviewImg'), removeBtn = $('bgRemoveBtn'), pickerBtn = $('bgPickerBtn');
  if (bgPreviewObjectUrl) { try { URL.revokeObjectURL(bgPreviewObjectUrl); } catch(e) {} bgPreviewObjectUrl = null; }
  if (!previewEl) return;
  previewEl.style.backgroundImage = '';
  if (enabled && bgFile) {
    bgPreviewObjectUrl = URL.createObjectURL(bgFile);
    previewEl.style.backgroundImage = `url("${bgPreviewObjectUrl}")`;
    previewEl.innerHTML = '';
    if (removeBtn) removeBtn.style.display = 'flex';
    if (pickerBtn) {
      const span = pickerBtn.querySelector('span');
      if (span) span.textContent = 'Сменить фон';
    }
  } else {
    previewEl.innerHTML = ICONS.imageIcon;
    if (removeBtn) removeBtn.style.display = 'none';
    if (pickerBtn) {
      const span = pickerBtn.querySelector('span');
      if (span) span.textContent = 'Выбрать фон';
    }
  }
}
$('bgPickerBtn').onclick = () => { $('bgFileInput').value = ''; $('bgFileInput').click(); };
$('bgRemoveBtn').onclick = async () => {
  if (!await showConfirm('Фон', 'Убрать фоновое изображение?')) return;
  await setSetting('bgEnabled', false);
  await applyBackground();
  await updateBgPreview();
  toast('Готово', 'Фон убран');
};
$('bgFileInput').onchange = async e => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return toast('Ошибка', 'Только изображения', true);
  showProgress('Фон', 20, 'Обработка...', '...');
  try {
    const url0 = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload=()=>res(i); i.onerror=()=>rej(new Error('Ошибка')); i.src=url0; });
    const MAX = 1920; let w=img.width, h=img.height;
    if (w > MAX || h > MAX) { if (w>h){h=Math.round(h*MAX/w);w=MAX;} else {w=Math.round(w*MAX/h);h=MAX;} }
    showProgress('Фон', 45, 'Сжатие...', '...');
    const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85));
    URL.revokeObjectURL(url0);
    if (!blob) throw new Error('Ошибка сжатия');
    if (!rootDir) throw new Error('Хранилище недоступно');
    showProgress('Фон', 75, 'Сохранение...', '...');
    const fh = await rootDir.getFileHandle(BG_FILE_ID, { create: true });
    const wr = await fh.createWritable(); await wr.write(blob); await wr.close();
    await setSetting('bgEnabled', true);
    const bgFile = await getFromOPFS(BG_FILE_ID);
    await applyBackground(bgFile); await updateBgPreview(bgFile);
    showProgress('Фон', 100, 'Готово', '...'); setTimeout(hideProgress, 350);
    toast('Успешно', 'Фон установлен');
  } catch (err) { console.error(err); hideProgress(); toast('Ошибка', err.message || 'Ошибка', true); }
};
$('bgOpacityRange').oninput = e => {
  const v = Number(e.target.value);
  $('bgOpacityVal').textContent = v + '%';
  document.documentElement.style.setProperty('--bg-overlay', (v / 100).toFixed(2));
};
$('bgOpacityRange').onchange = async e => { await setSetting('bgOpacity', Number(e.target.value)); };

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

async function getTrashAutoDays() {
  const v = await getSetting('trashAutoDays');
  return v === null || v === undefined ? DEFAULT_TRASH_DAYS : Number(v);
}
async function setTrashAutoDays(days) {
  await setSetting('trashAutoDays', Number(days));
  updateTrashAutoPillsUI(days);
  await autoCleanTrash();
  if (days === 0) toast('Автоочистка выкл.', 'Корзина не будет очищаться');
  else toast('Готово', `Автоочистка через ${days} дн.`);
}
function updateTrashAutoPillsUI(currentDays) {
  document.querySelectorAll('#trashAutoPills .pill').forEach(p => {
    p.classList.toggle('sel', Number(p.dataset.val) === Number(currentDays));
  });
}
document.querySelectorAll('#trashAutoPills .pill').forEach(p => {
  p.onclick = () => setTrashAutoDays(Number(p.dataset.val));
});

async function initOPFS() {
  if (navigator.storage && navigator.storage.getDirectory) {
    try {
      rootDir = await navigator.storage.getDirectory();
      if (navigator.storage.persist) await navigator.storage.persist();
    } catch(e) { rootDir = null; }
  }
}
async function getFromOPFS(fileId) {
  if (!rootDir) return null;
  try { const fh = await rootDir.getFileHandle(fileId); return await fh.getFile(); } catch(e) { return null; }
}
async function deleteFromOPFS(fileId) {
  if (!rootDir) return;
  try { await rootDir.removeEntry(fileId); } catch(e) {}
}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 10); }

async function calculateHash(file) {
  if (file.size === 0) return 'empty_' + generateId();
  try {
    const chunkSize = 256 * 1024;
    let combined;
    if (file.size <= chunkSize * 5) {
      combined = new Uint8Array(await file.arrayBuffer());
    } else {
      const offsets = [0, Math.floor(file.size * 0.25), Math.floor(file.size * 0.5), Math.floor(file.size * 0.75), file.size - chunkSize];
      const chunks = [];
      for (const offset of offsets) {
        const blob = file.slice(offset, offset + chunkSize);
        chunks.push(new Uint8Array(await blob.arrayBuffer()));
      }
      const totalLen = chunks.reduce((s, c) => s + c.length, 0);
      combined = new Uint8Array(totalLen);
      let off = 0;
      for (const c of chunks) { combined.set(c, off); off += c.length; }
    }
    if (window.crypto && window.crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let hash = 2166136261;
    for (let i = 0; i < combined.length; i++) { hash ^= combined[i]; hash = Math.imul(hash, 16777619); }
    return 'hash_' + file.size + '_' + (hash >>> 0).toString(16);
  } catch(e) {
    console.error('Hash error', e);
    return 'unique_' + generateId();
  }
}

async function saveToOPFSChunked(fileId, file) {
  if (!rootDir) return false;
  try {
    const fileHandle = await rootDir.getFileHandle(fileId, { create: true });
    const writable = await fileHandle.createWritable();
    const reader = file.stream().getReader();
    let bytesWritten = 0, chunksSinceYield = 0, lastYield = 0;
    while (true) {
      if (isAppInBackground) { await new Promise(r => setTimeout(r, 1000)); continue; }
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      bytesWritten += value.length;
      chunksSinceYield++;
      if (chunksSinceYield >= 4 || bytesWritten === file.size) {
        chunksSinceYield = 0;
        const now = Date.now();
        if (now - lastYield > 150 || bytesWritten === file.size) {
          lastYield = now;
          showProgress('Сохранение', Math.round((bytesWritten / file.size) * 100), file.name, `${(bytesWritten/1048576).toFixed(1)} / ${(file.size/1048576).toFixed(1)} МБ`);
          await nextMacrotask();
        }
      }
    }
    await writable.close();
    return true;
  } catch(e) { console.error('Save OPFS error', e); return false; }
}

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = e => {
      const d = e.target.result; const tx = e.target.transaction;
      if (!d.objectStoreNames.contains(SF)) {
        const s = d.createObjectStore(SF, {keyPath:'id', autoIncrement:true});
        s.createIndex('folder','folderId'); s.createIndex('type','type');
      }
      if (d.objectStoreNames.contains(SF)) {
        const s = tx.objectStore(SF);
        if (!s.indexNames.contains('hash')) s.createIndex('hash', 'hash');
      }
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
  const fileId = generateId();
  const type = detectType(file);
  const record = {
    fileId, name: file.name || 'Файл', type,
    mime: file.type||'', size: file.size, date: Date.now(),
    folderId: currentFolder, hash: hash,
    deleted: false, deletedAt: null, fav: false,
    tags: []
  };
  if (!rootDir) {
    record.blob = file;
    return p(st(SF, 'readwrite').add(record));
  }
  const success = await saveToOPFSChunked(fileId, file);
  if (!success) throw new Error("Не удалось сохранить файл.");
  if (rootDir && (type === 'image' || type === 'video')) {
    try {
      const thumbBlob = type === 'image'
        ? await generateImageThumbnail(file)
        : await generateVideoThumbnail(file);
      if (thumbBlob) await saveThumb(fileId, thumbBlob);
    } catch(e) {}
  }
  return p(st(SF, 'readwrite').add(record));
}
async function getFileData(f) {
  let raw = null;
  if (rootDir) raw = await getFromOPFS(f.fileId);
  if (!raw) raw = f.blob;
  return raw;
}
function addFolder(name, parent, color) {
  return p(st(SFL,'readwrite').add({
    name, parentId: parent??null, date: Date.now(),
    color: color || FOLDER_COLORS[0],
    deleted: false, deletedAt: null
  }));
}
function detectType(file) {
  const mime = (file.type||'').toLowerCase(), name = (file.name||'').toLowerCase();
  const ext = (name.match(/\.([a-z0-9]+)$/)||[])[1]||'';
  if(mime.startsWith('image/') || /^(jpg|jpeg|png|gif|webp|bmp|heic|heif|avif|svg)$/.test(ext)) return 'image';
  if(mime.startsWith('video/') || /^(mp4|webm|mov|avi|mkv|m4v|3gp|flv|wmv)$/.test(ext)) return 'video';
  return 'other';
}
const TYPE_LABEL = {image:'Фото', video:'Видео', other:'Файл'};

async function moveToTrash(fileIds, folderIds) {
  const now = Date.now();
  const ts = db.transaction(SF,'readwrite'), ss = ts.objectStore(SF);
  for (const id of fileIds) { const v = await p(ss.get(id)); if (v) { v.deleted = true; v.deletedAt = now; await p(ss.put(v)); } }
  await new Promise((res, rej) => { ts.oncomplete = res; ts.onerror = e => rej(e.target.error); });
  const tf = db.transaction(SFL,'readwrite'), sf = tf.objectStore(SFL);
  for (const id of folderIds) { const v = await p(sf.get(id)); if (v) { v.deleted = true; v.deletedAt = now; await p(sf.put(v)); } }
  await new Promise((res, rej) => { tf.oncomplete = res; tf.onerror = e => rej(e.target.error); });
}
async function restoreFromTrash(fileIds, folderIds) {
  const ts = db.transaction(SF,'readwrite'), ss = ts.objectStore(SF);
  for (const id of fileIds) { const v = await p(ss.get(id)); if (v) { v.deleted = false; v.deletedAt = null; await p(ss.put(v)); } }
  await new Promise((res, rej) => { ts.oncomplete = res; ts.onerror = e => rej(e.target.error); });
  const tf = db.transaction(SFL,'readwrite'), sf = tf.objectStore(SFL);
  for (const id of folderIds) { const v = await p(sf.get(id)); if (v) { v.deleted = false; v.deletedAt = null; await p(sf.put(v)); } }
  await new Promise((res, rej) => { tf.oncomplete = res; tf.onerror = e => rej(e.target.error); });
}
async function deletePermanent(fileIds, folderIds) {
  $('grid').querySelectorAll('.tile').forEach(el => {
    if (el._blobUrl) { try { URL.revokeObjectURL(el._blobUrl); } catch(e) {} el._blobUrl = null; }
  });
  if ($('viewerModal').dataset.url) { URL.revokeObjectURL($('viewerModal').dataset.url); delete $('viewerModal').dataset.url; }
  const allFiles = await getAllFiles();
  for (const f of allFiles.filter(f => fileIds.includes(f.id))) {
    await deleteFromOPFS(f.fileId);
    await deleteThumb(f.fileId);
  }
  const t = db.transaction(SF,'readwrite'), s = t.objectStore(SF);
  fileIds.forEach(id => s.delete(id));
  await new Promise((res, rej) => { t.oncomplete=res; t.onerror=e=>rej(e.target.error); });
  if (folderIds && folderIds.length) {
    const tf = db.transaction(SFL,'readwrite'), sf = tf.objectStore(SFL);
    folderIds.forEach(id => sf.delete(id));
    await new Promise((res, rej) => { tf.oncomplete=res; tf.onerror=e=>rej(e.target.error); });
  }
}
async function emptyTrash() {
  const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
  const fids = files.filter(f => f.deleted).map(f => f.id);
  const dids = folders.filter(f => f.deleted).map(f => f.id);
  if (!fids.length && !dids.length) return toast('Корзина пуста', '');
  if (!await showConfirm('Очистка корзины', `Удалить навсегда: <b>${fids.length}</b> файл. и <b>${dids.length}</b> пап.?`)) return;
  showProgress('Очистка корзины', 30, 'Удаление файлов...', '');
  try { await deletePermanent(fids, dids); hideProgress(); await refresh(); toast('Готово', 'Корзина очищена'); }
  catch (e) { console.error(e); hideProgress(); toast('Ошибка', 'Не удалось очистить', true); }
}
async function autoCleanTrash() {
  const daysVal = await getTrashAutoDays();
  if (daysVal === 0) return;
  const ms = daysVal * 24 * 60 * 60 * 1000;
  const files = await getAllFiles();
  const oldFiles = files.filter(f => f.deleted && f.deletedAt && (Date.now() - f.deletedAt > ms)).map(f => f.id);
  const folders = await getAllFolders();
  const oldFolders = folders.filter(f => f.deleted && f.deletedAt && (Date.now() - f.deletedAt > ms)).map(f => f.id);
  if (oldFiles.length || oldFolders.length) { try { await deletePermanent(oldFiles, oldFolders); } catch(e) {} }
}

window.findDuplicates = async () => {
  const files = await getAllFiles();
  const active = files.filter(f => !f.deleted && f.hash && !f.hash.startsWith('unique_'));
  const groups = {};
  active.forEach(f => { if (!groups[f.hash]) groups[f.hash] = []; groups[f.hash].push(f); });
  const duplicates = Object.values(groups).filter(g => g.length > 1);
  const res = $('dupResult');
  if (duplicates.length === 0) {
    res.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--mut);">Дубликатов не найдено</div>';
    $('btnDupDelete').style.display = 'none';
  } else {
    const totalWasted = duplicates.reduce((s, g) => s + g.slice(1).reduce((ss, f) => ss + (f.size||0), 0), 0);
    let html = `
      <div style="padding:12px 16px;background:var(--card);border-radius:12px;margin-bottom:12px;font-size:13px;">
        Найдено <b>${duplicates.length}</b> групп дубликатов.<br>
        Можно освободить <b style="color:var(--acc);">${(totalWasted/1048576).toFixed(2)} МБ</b>.<br>
        <span style="color:var(--mut);font-size:11px;display:block;margin-top:4px;">Нажмите на файл, чтобы открыть его</span>
      </div>
      <div style="max-height:50vh;overflow-y:auto;">`;
    duplicates.forEach((g, idx) => {
      html += `<div style="padding:12px;background:var(--card);border:1px solid var(--bd);border-radius:12px;margin-bottom:8px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Группа ${idx+1} (${g.length} файл.)</div>`;
      g.forEach((f, i) => {
        const opacity = i === 0 ? '1' : '0.6';
        const idsArray = g.map(x => x.id).join(',');
        html += `<div class="dup-file-row" onclick="openDupGallery([${idsArray}], ${f.id})" style="opacity:${opacity};">
          <span style="color:${i===0?'var(--txt)':'var(--mut)'};">${i===0?ICONS.checkSmall:ICONS.trashSmall}${escapeHtml(f.name)}</span>
          <span style="flex-shrink:0;margin-left:8px;">${(f.size/1048576).toFixed(2)} МБ</span>
        </div>`;
      });
      html += `</div>`;
    });
    html += `</div>`;
    res.innerHTML = html;
    $('btnDupDelete').style.display = 'block';
    $('btnDupDelete').onclick = async () => {
      if (!await showConfirm('Удаление', `Удалить <b>${duplicates.length}</b> групп дубликатов?`)) return;
      showProgress('Удаление', 30, 'Поиск лишних файлов...', '...');
      const toDelete = [];
      duplicates.forEach(g => { g.slice(1).forEach(f => toDelete.push(f.id)); });
      try {
        await deletePermanent(toDelete, []);
        hideProgress();
        $('modalDuplicates').classList.remove('on');
        await refresh();
        toast('Готово', `Удалено ${toDelete.length} файлов`);
      } catch(e) { console.error(e); hideProgress(); toast('Ошибка', 'Не удалось', true); }
    };
  }
  $('modalDuplicates').style.zIndex = '10005';
  $('modalDuplicates').classList.add('on');
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
  showProgress('Очистка', 10, 'Анализ данных...', '...');
  try {
    let files = await getAllFiles(); let folders = await getAllFolders();
    const settings = await p(st(SS,'readonly').getAll());
    const trashedFiles = files.filter(f => f.deleted);
    if (trashedFiles.length > 0) {
      showProgress('Очистка', 20, 'Удаление корзины...', '...');
      for (const f of trashedFiles) { await deleteFromOPFS(f.fileId); await deleteThumb(f.fileId); }
      const t = db.transaction(SF,'readwrite'), s = t.objectStore(SF);
      trashedFiles.forEach(f => s.delete(f.id));
      await new Promise(r => setTimeout(r, 200));
      files = files.filter(f => !f.deleted);
    }
    const trashedFolders = folders.filter(f => f.deleted);
    if (trashedFolders.length > 0) {
      const tf = db.transaction(SFL,'readwrite'), sf = tf.objectStore(SFL);
      trashedFolders.forEach(f => sf.delete(f.id));
      await new Promise(r => setTimeout(r, 200));
      folders = folders.filter(f => !f.deleted);
    }
    if (rootDir) {
      showProgress('Очистка', 40, 'Удаление лишних файлов...', '...');
      const validFileIds = new Set(files.map(f => f.fileId));
      try {
        const toRemove = [];
        for await (const name of rootDir.keys()) {
          if (name === BG_FILE_ID) continue;
          if (name.startsWith(THUMB_PREFIX)) {
            const fid = name.substring(THUMB_PREFIX.length);
            if (!validFileIds.has(fid)) toRemove.push(name);
            continue;
          }
          if (!validFileIds.has(name)) toRemove.push(name);
        }
        for (const name of toRemove) { try { await rootDir.removeEntry(name); } catch(e) {} }
      } catch(e) { console.warn('OPFS cleanup err', e); }
    }
    showProgress('Очистка', 60, 'Пересборка IndexedDB...', '...');
    db.close();
    await new Promise((res, rej) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = res; req.onerror = rej; req.onblocked = () => res();
    });
    showProgress('Очистка', 80, 'Восстановление...', '...');
    await openDB();
    settingsCache = null;
    const t1 = db.transaction(SF,'readwrite'), s1 = t1.objectStore(SF); files.forEach(f => s1.put(f));
    const t2 = db.transaction(SFL,'readwrite'), s2 = t2.objectStore(SFL); folders.forEach(f => s2.put(f));
    const t3 = db.transaction(SS,'readwrite'), s3 = t3.objectStore(SS); settings.forEach(s => s3.put(s));
    await new Promise(r => setTimeout(r, 500));
    hideProgress(); refresh(); toast('Успешно', 'Мусор удален, база сжата');
  } catch(e) {
    console.error(e);
    hideProgress();
    toast('Ошибка', 'Не удалось', true);
  } finally {
    releaseWakeLock();
  }
}
window.compactDB = compactDB;

window.hardResetDB = async () => {
  if(!await showConfirm('ВНИМАНИЕ!', 'Все данные будут <b>удалены навсегда</b>. Продолжить?', 'Удалить', 'Отмена')) return;
  showProgress('Сброс', 50, 'Очистка...', '...');
  try {
    if (db) db.close();
    if (rootDir) { const names = []; for await (const name of rootDir.keys()) names.push(name); for (const name of names) await rootDir.removeEntry(name); }
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => {
      if('caches' in window) caches.keys().then(names => names.forEach(name => caches.delete(name)));
      localStorage.clear(); sessionStorage.clear();
      showConfirm('Готово', 'База очищена. Приложение перезагрузится.').then(() => location.reload());
    };
    req.onerror = () => { showConfirm('Ошибка', 'Не удалось очистить базу.').then(() => location.reload()); };
  } catch(e) { location.reload(); }
};

async function hashPassword(password, saltHex) {
  try { return await pbkdf2Run('hash', password, saltHex, 100000); }
  catch (e) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveBits']);
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(b=>parseInt(b,16)));
    const hash = await crypto.subtle.deriveBits({name:'PBKDF2', salt, iterations:100000, hash:'SHA-256'}, keyMaterial, 256);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
}
function generateSalt() { const arr = new Uint8Array(16); crypto.getRandomValues(arr); return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join(''); }

async function checkLock() {
  const s = await getAllSettings();
  const lockEn = s.lockEnabled;
  storedHash = s.password || '';
  storedSalt = s.salt || '';
  if(lockEn && storedHash) { isLocked=true; $('lockScreen').style.display='flex'; $('lockInput').value=''; }
  else unlockApp();
}
async function unlockApp() { isLocked=false; $('lockScreen').style.display='none'; refresh(); }
$('lockBtn').onclick = async () => {
  const val = $('lockInput').value; if(!val) return;
  const btn = $('lockBtn'); btn.disabled = true; btn.textContent = '...';
  try {
    const h = await hashPassword(val, storedSalt);
    if(h===storedHash) { isLocked=false; $('lockScreen').style.display='none'; refresh(); playSound('success'); }
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
  storedHash=h; storedSalt=salt;
  $('swLock').classList.add('on'); $('newPass').value='';
  toast('Успешно','Пароль установлен');
};

function getSelectedFilesSize() {
  let total = 0;
  const source = viewMode === 'trash' ? trashFilesCache : currentFilesCache;
  for (const id of sel) { const f = source.find(x => x.id === id); if (f) total += (f.size || 0); }
  return total;
}
function toggleFileSelection(id, tileEl) {
  if (sel.has(id)) { sel.delete(id); tileEl.classList.remove('sel'); }
  else { sel.add(id); tileEl.classList.add('sel'); playSound('click'); }
}
function toggleFolderSelection(id, tileEl) {
  if (folderSel.has(id)) { folderSel.delete(id); tileEl.classList.remove('sel'); }
  else { folderSel.add(id); tileEl.classList.add('sel'); playSound('click'); }
}

async function loadTileImage(tileEl) {
  if (tileEl._loading) return;
  const fileId = Number(tileEl.dataset.fileId);
  const f = currentFilesCache.find(x => x.id === fileId) || trashFilesCache.find(x => x.id === fileId);
  if (!f) return;
  const imgEl = tileEl.querySelector('.tile-img');
  if (!imgEl || imgEl.hasAttribute('src')) return;
  tileEl._loading = true;
  try {
    const skelEl = tileEl.querySelector('.skeleton');
    let thumb = await getThumb(f);
    if (!thumb && f.type === 'video' && !failedVideoThumbs.has(f.fileId)) {
      const file = await getFileData(f);
      if (file) {
        thumb = await generateVideoThumbnail(file);
        if (thumb) await saveThumb(f.fileId, thumb);
        else failedVideoThumbs.add(f.fileId);
      }
    }
    if (!thumb && f.type === 'image') {
      const file = await getFileData(f);
      if (file) { thumb = file; queueBgThumb(f); }
    }
    if (!thumb) { if (skelEl) skelEl.remove(); return; }
    if (!tileEl.isConnected) return;
    const url = URL.createObjectURL(thumb);
    tileEl._blobUrl = url;
    const tempImg = new Image();
    tempImg.src = url;
    await tempImg.decode().catch(()=>{});
    if (!tileEl.isConnected || !tileEl._blobUrl) {
      try { URL.revokeObjectURL(url); } catch(e) {}
      if (tileEl._blobUrl === url) tileEl._blobUrl = null;
      return;
    }
    const rect = tileEl.getBoundingClientRect();
    const inView = rect.bottom > -400 && rect.top < window.innerHeight + 400;
    if (!inView) {
      tileEl._blobUrl = null;
      try { URL.revokeObjectURL(url); } catch(e) {}
      if (!tileEl.querySelector('.skeleton')) {
        const skel = document.createElement('div');
        skel.className = 'skeleton';
        tileEl.insertBefore(skel, tileEl.firstChild);
      }
      return;
    }
    imgEl.onload = () => { imgEl.classList.add('loaded'); if (skelEl) skelEl.remove(); };
    imgEl.onerror = () => { if (skelEl) skelEl.remove(); };
    imgEl.src = url;
  } catch(e) {
    const skelEl = tileEl.querySelector('.skeleton');
    if (skelEl) skelEl.remove();
  } finally {
    tileEl._loading = false;
  }
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function writeBlobToCacheChunked(blob, cachePath, onProgress) {
  const { Filesystem } = window.Capacitor.Plugins;
  const CHUNK_SIZE = 4 * 1024 * 1024;
  const total = blob.size;

  try {
    await Filesystem.deleteFile({ path: cachePath, directory: 'CACHE' });
  } catch (e) {}

  let offset = 0;
  let isFirst = true;

  while (offset < total) {
    const end = Math.min(offset + CHUNK_SIZE, total);
    const chunk = blob.slice(offset, end);
    const base64 = await blobToBase64(chunk);

    if (isFirst) {
      await Filesystem.writeFile({
        path: cachePath,
        data: base64,
        directory: 'CACHE',
        recursive: true
      });
      isFirst = false;
    } else {
      await Filesystem.appendFile({
        path: cachePath,
        data: base64,
        directory: 'CACHE'
      });
    }

    offset = end;
    if (onProgress) onProgress(offset / total);
    await new Promise(r => setTimeout(r, 0));
  }
}

async function downloadFileSafe(file, filename) {
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Share } = window.Capacitor.Plugins;

      const safeName = String(filename || 'file').replace(/[\/\\:*?"<>|]/g, '_');
      const cachePath = `krypta_${Date.now()}_${safeName}`;

      showProgress('Сохранение', 0, safeName, 'Подготовка...');

      await writeBlobToCacheChunked(file, cachePath, (pct) => {
        showProgress('Сохранение', Math.round(pct * 100), safeName, `${Math.round(pct * 100)}%`);
      });

      const { uri } = await Filesystem.getUri({
        path: cachePath,
        directory: 'CACHE'
      });

      hideProgress();

      try {
        await Share.share({
          title: safeName,
          files: [uri],
          url: uri,
          dialogTitle: 'Сохранить файл'
        });
      } catch (shareErr) {
        console.warn('Share с files[] не сработал, пробуем url:', shareErr);
        await Share.share({
          title: safeName,
          url: uri,
          dialogTitle: 'Сохранить файл'
        });
      }

      toast('Готово', 'Выберите «Сохранить в Загрузки» или приложение');
      return true;
    } catch (e) {
      console.error('Native download error:', e);
      hideProgress();
      toast('Ошибка', 'Не удалось сохранить: ' + (e.message || e), true);
      return false;
    }
  }

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (window.showSaveFilePicker && !isMobile) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: filename });
      const writable = await handle.createWritable();
      const reader = file.stream().getReader();
      let written = 0;
      const total = file.size;
      let lastUpdate = 0;
      showProgress('Скачивание', 0, filename, `0 / ${(total / 1048576).toFixed(1)} МБ`);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writable.write(value);
        written += value.length;
        const now = Date.now();
        if (now - lastUpdate > 200) {
          lastUpdate = now;
          showProgress('Скачивание', Math.round(written / total * 100), filename, `${(written / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)} МБ`);
          await nextMacrotask();
        }
      }
      await writable.close();
      hideProgress();
      return true;
    } catch (e) {
      hideProgress();
      if (e.name === 'AbortError') return false;
      console.warn('showSaveFilePicker failed, fallback:', e);
    }
  }

  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { document.body.removeChild(a); } catch (e) {}
      try { URL.revokeObjectURL(url); } catch (e) {}
    }, 2000);
    return true;
  } catch (e) {
    console.error('Download fallback error:', e);
    return false;
  }
}

function openFile(f) {
  if(isLocked) return;
  $('viewerDelete').style.display = 'none';
  getFilesForGallery().then(() => {
    const idx = galleryFiles.findIndex(x=>x.id===f.id);
    currentGalleryIndex = idx!==-1 ? idx : 0;
    if(idx===-1) galleryFiles=[f];
    renderViewer();
  });
}
function getFilesForGallery() {
  return new Promise(async resolve => {
    const files=await getAllFiles();
    let cur=files.filter(x=>!x.deleted && x.folderId===currentFolder && (x.type==='image'||x.type==='video'));
    if(searchQuery) {
      const q = searchQuery.toLowerCase();
      cur=cur.filter(x => x.name.toLowerCase().includes(q) || (x.tags && x.tags.some(t => t.toLowerCase().includes(q))));
    }
    sortList(cur); galleryFiles=cur; resolve();
  });
}
function stopSlideshow() {
  if (slideshowTimer) { clearTimeout(slideshowTimer); slideshowTimer = null; }
  slideshowActive = false;
  const btn = $('viewerSlideshow');
  if (btn) { btn.innerHTML = ICONS.play; btn.classList.remove('active'); }
}
function scheduleSlideshowNext(f) {
  if (!slideshowActive) return;
  if (f.type === 'video') return;
  slideshowTimer = setTimeout(() => {
    if (!slideshowActive) return;
    if (currentGalleryIndex < galleryFiles.length - 1) slide('left');
    else stopSlideshow();
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
  $('viewerDownload').onclick = async () => {
    try {
      const ok = await downloadFileSafe(file, f.name);
      if (ok) toast('Скачивание', f.name);
      else toast('Отменено', '', false);
    } catch(e) { toast('Ошибка', 'Не удалось скачать', true); }
  };
  $('viewerInfo').onclick = () => { showInfo('file', f); };
  $('viewerDelete').onclick = async () => {
    if (!await showConfirm('В корзину', `Переместить "${f.name}" в корзину?`, 'Да', 'Нет')) return;
    try {
      await moveToTrash([f.id], []);
      galleryFiles.splice(currentGalleryIndex, 1);
      if (galleryFiles.length === 0) {
        $('viewerClose').click();
      } else {
        if (currentGalleryIndex >= galleryFiles.length) currentGalleryIndex = galleryFiles.length - 1;
        await renderViewer();
      }
      refresh();
      const removedName = f.name;
      const removedId = f.id;
      showUndoToast('В корзине', removedName, async () => {
        await restoreFromTrash([removedId], []);
        await refresh();
        toast('Восстановлено', 'Файл возвращён');
      });
    } catch(e) {
      console.error(e);
      toast('Ошибка', 'Не удалось', true);
    }
  };
  content.innerHTML=''; modal.classList.add('on');
  const container = document.createElement('div');
  container.className = 'swipe-container'; container.id = 'swipe';
  if(f.type === 'image') {
    const img = document.createElement('img'); img.src = url; container.appendChild(img);
    if (slideshowActive) scheduleSlideshowNext(f);
  } else {
    const video = document.createElement('video');
    video.src = url; video.controls = true; video.autoplay = true; video.playsInline = true;
    video.setAttribute('preload', 'metadata');
    video.style.maxWidth = '100%'; video.style.maxHeight = '100%';
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
    const btn = $('viewerSlideshow');
    btn.innerHTML = ICONS.pause; btn.classList.add('active');
    const f = galleryFiles[currentGalleryIndex];
    if (f) {
      if (f.type === 'video') toast('Слайдшоу', 'Начнётся после видео');
      else { scheduleSlideshowNext(f); toast('Слайдшоу', `Интервал ${slideshowInterval/1000} сек`); }
    }
  }
};
function initSwipe() {
  const c = $('swipe'); if(!c) return;
  const img = c.querySelector('img'); const isImage = !!img;
  c.style.transition='none'; c.style.transform='translateX(0)';
  let startX=0, currX=0, drag=false, startDist=0, startScale=1;
  let translateX=0, translateY=0, initialX=0, initialY=0;
  let isPinching=false, lastTap=0;
  if (img) { img.style.transition='transform 0.1s ease-out'; img.style.transformOrigin='center center'; }
  const applyTransform = () => { if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`; };
  c.ontouchstart = e => {
    if (e.touches.length === 2 && isImage) {
      isPinching = true; drag = false;
      startDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      startScale = currentScale;
      if (img) img.style.transition = 'none';
    } else if (e.touches.length === 1) {
      startX = e.touches[0].clientX; currX = startX;
      initialX = startX; initialY = e.touches[0].clientY;
      if (currentScale === 1) { drag = true; c.style.transition = 'none'; }
    }
  };
  c.ontouchmove = e => {
    if (isPinching && e.touches.length === 2 && isImage) {
      e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      currentScale = Math.max(1, Math.min(5, startScale * (dist / startDist)));
      applyTransform();
    } else if (e.touches.length === 1) {
      const cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      if (currentScale > 1 && isImage) {
        e.preventDefault();
        translateX += (cx - initialX); translateY += (cy - initialY);
        initialX = cx; initialY = cy; applyTransform();
      } else if (drag) { currX = cx; c.style.transform = `translateX(${currX-startX}px)`; }
    }
  };
  c.ontouchend = e => {
    if (isPinching) {
      isPinching = false;
      if (currentScale <= 1.05) { currentScale = 1; translateX = 0; translateY = 0; if (img) { img.style.transition='transform 0.2s ease-out'; applyTransform(); } }
      else { if (img) img.style.transition='transform 0.2s ease-out'; applyTransform(); }
      return;
    }
    if (drag) {
      drag = false;
      const diff = currX - startX; const th = window.innerWidth * 0.2;
      if (diff < -th && currentGalleryIndex < galleryFiles.length-1) slide('left');
      else if (diff > th && currentGalleryIndex > 0) slide('right');
      else { c.style.transition='transform 0.3s'; c.style.transform='translateX(0)'; }
    }
    if (isImage && e.changedTouches.length === 1) {
      const now = Date.now(); const since = now - lastTap;
      if (since < 300 && since > 0 && Math.abs(e.changedTouches[0].clientX - initialX) < 10) {
        if (img) img.style.transition='transform 0.3s ease-out';
        if (currentScale === 1) { currentScale = 2.5; translateX = 0; translateY = 0; }
        else { currentScale = 1; translateX = 0; translateY = 0; }
        applyTransform();
      }
      lastTap = now;
    }
  };
}
function slide(dir) {
  const c=$('swipe'); if(!c) return;
  const mySlideToken = ++slideToken;
  playSound('swipe');
  currentScale = 1;
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
  viewerToken++;
  slideToken++;
  stopSlideshow();
  $('viewerModal').classList.remove('on'); $('viewerContent').innerHTML='';
  $('viewerDelete').style.display = 'none';
  if($('viewerModal').dataset.url) { URL.revokeObjectURL($('viewerModal').dataset.url); delete $('viewerModal').dataset.url; }
};

function showInfo(type, data) {
  const rows = $('infoRows');
  if (type === 'file') {
    rows.innerHTML = `
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Имя:</span><span style="font-weight:600;text-align:right;word-break:break-all;max-width:60%;">${escapeHtml(data.name)}</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Тип:</span><span style="font-weight:600;">${TYPE_LABEL[data.type] || 'Файл'}</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Размер:</span><span style="font-weight:600;">${((data.size||0)/1048576).toFixed(2)} МБ</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Дата:</span><span style="font-weight:600;">${new Date(data.date).toLocaleString('ru-RU')}</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Избранное:</span><span style="font-weight:600;">${data.fav ? 'Да' : 'Нет'}</span></div>
      <div style="padding:12px 0;display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Теги:</span><span style="font-weight:600;text-align:right;">${data.tags && data.tags.length ? data.tags.join(', ') : 'Нет'}</span></div>`;
  } else {
    rows.innerHTML = `
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Имя:</span><span style="font-weight:600;text-align:right;word-break:break-all;max-width:60%;">${escapeHtml(data.name)}</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Тип:</span><span style="font-weight:600;">Папка</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Размер:</span><span id="folderSizeCalc" style="font-weight:600;">…</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Файлов:</span><span id="folderFilesCalc" style="font-weight:600;">…</span></div>
      <div style="padding:12px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Подпапок:</span><span id="folderSubCalc" style="font-weight:600;">…</span></div>
      <div style="padding:12px 0;display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--mut);">Создана:</span><span style="font-weight:600;">${new Date(data.date).toLocaleString('ru-RU')}</span></div>`;
    getFolderStats(data.id).then(s => {
      const sEl = $('folderSizeCalc'), fEl = $('folderFilesCalc'), sfEl = $('folderSubCalc');
      if (sEl) sEl.textContent = (s.size/1048576).toFixed(2) + ' МБ';
      if (fEl) fEl.textContent = s.count;
      if (sfEl) sfEl.textContent = s.folderCount;
    }).catch(() => { const sEl = $('folderSizeCalc'); if (sEl) sEl.textContent = 'Ошибка'; });
  }
  $('modalInfo').style.zIndex = '10005';
  $('modalInfo').classList.add('on');
}
async function getFolderStats(folderId) {
  const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
  const folderIds = new Set([folderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of folders) {
      if (f.parentId != null && folderIds.has(f.parentId) && !folderIds.has(f.id)) { folderIds.add(f.id); changed = true; }
    }
  }
  let size = 0, count = 0;
  for (const f of files) { if (!f.deleted && folderIds.has(f.folderId)) { size += (f.size || 0); count++; } }
  return { size, count, folderCount: folderIds.size - 1 };
}

async function updateStatistics() {
  try {
    const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
    const totalFiles = files.length;
    const photos = files.filter(f => f.type === 'image').length;
    const videos = files.filter(f => f.type === 'video').length;
    const favs = files.filter(f => f.fav && !f.deleted).length;
    const totalFolders = folders.length;
    const trashCount = files.filter(f => f.deleted).length + folders.filter(f => f.deleted).length;
    const statTotalFiles = $('statTotalFiles'), statMediaFiles = $('statMediaFiles'), statFolders = $('statFolders'), statFavorites = $('statFavorites'), statTrash = $('statTrash');
    if (statTotalFiles) statTotalFiles.textContent = totalFiles;
    if (statMediaFiles) statMediaFiles.textContent = `${photos} / ${videos}`;
    if (statFolders) statFolders.textContent = totalFolders;
    if (statFavorites) statFavorites.textContent = favs;
    if (statTrash) statTrash.textContent = trashCount;
  } catch(e) { console.error('Stats error', e); }
}

function renderCrumb(folders) {
  if (viewMode === 'trash') { $('crumb').innerHTML = `<a class="cur">${ICONS.trash}Корзина</a>`; return; }
  const path=[]; let cur=currentFolder;
  const seen = new Set();
  while(cur!=null) {
    if (seen.has(cur)) break;
    seen.add(cur);
    const f=folders.find(x=>x.id===cur); if(!f) break;
    path.unshift(f); cur=f.parentId;
  }
  let h = `<a data-nav="root" class="${path.length?'':'cur'}">${ICONS.home}Файлы</a>`;
  path.forEach((f,i)=> { h+=`<span class="sep">›</span><a data-nav="${f.id}" class="${i===path.length-1?'cur':''}">${escapeHtml(f.name)}</a>`; });
  $('crumb').innerHTML=h;
}
$('crumb').addEventListener('click', e => {
  if (viewMode === 'trash') return;
  const a=e.target.closest('a'); if(!a) return;
  currentFolder = a.dataset.nav==='root' ? null : Number(a.dataset.nav);
  clearSel(); refresh();
});
function sortList(arr) {
  return arr.sort((a,b)=> {
    if (sortBy === 'fav_first') {
      if (a.fav && !b.fav) return -1;
      if (!a.fav && b.fav) return 1;
      return b.date - a.date;
    }
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
  const [files, folders] = await Promise.all([getAllFiles(), getAllFolders()]);
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
      const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
      $('storageUsage').textContent = `${usedMB} МБ`;
    }
  } catch(e) {}
}
function renderGrid(reset = true) {
  if(isLocked) return;
  if(reset) {
    imageLoader.disconnect();
    $('grid').querySelectorAll('.tile').forEach(el => {
      if (el._blobUrl) { try { URL.revokeObjectURL(el._blobUrl); } catch(e) {} el._blobUrl = null; }
      if (el._previewUrls) {
        el._previewUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch(e) {} });
        el._previewUrls = null;
      }
    });
    $('grid').innerHTML = ''; currentRenderIndex = 0; allLoaded = false;
  }
  let curFiles, visFolders;
  if (viewMode === 'trash') {
    curFiles = [...trashFilesCache]; visFolders = [...trashFoldersCache];
    if(searchQuery) {
      const q = searchQuery.toLowerCase();
      curFiles = curFiles.filter(f => f.name.toLowerCase().includes(q) || (f.tags && f.tags.some(t => t.toLowerCase().includes(q))));
      visFolders = visFolders.filter(f => f.name.toLowerCase().includes(q));
    }
    curFiles.sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
    visFolders.sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
  } else {
    curFiles = [...currentFilesCache];
    if(filterType === 'image') curFiles = curFiles.filter(f=>f.type==='image');
    else if (filterType === 'video') curFiles = curFiles.filter(f=>f.type==='video');
    else if (filterType === 'fav') curFiles = curFiles.filter(f=>f.fav);
    if(searchQuery) {
      const q = searchQuery.toLowerCase();
      curFiles = curFiles.filter(f => f.name.toLowerCase().includes(q) || (f.tags && f.tags.some(t => t.toLowerCase().includes(q))));
    }
    sortList(curFiles);
    visFolders = (filterType==='all' || filterType === 'image' || filterType === 'video' || filterType === 'fav') ? [...currentFoldersCache] : [];
    if (filterType === 'fav') visFolders = [];
    if(searchQuery && visFolders.length) visFolders = visFolders.filter(f=>f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    sortList(visFolders);
  }
  if (currentRenderIndex === 0 && curFiles.length === 0 && visFolders.length === 0) {
    const msg = viewMode === 'trash' ? (searchQuery ? 'Ничего не найдено.' : 'Корзина пуста.')
      : (filterType !== 'all' || searchQuery) ? 'Ничего не найдено.' : 'Пока пусто.<br>Нажмите «+ Добавить».';
    $('grid').innerHTML = `<div class="empty">${ICONS.folderIcon}<div>${msg}</div></div>`;
    allLoaded = true; return;
  }
  const grid = $('grid');
  const frag = document.createDocumentFragment();
  const foldersToRender = visFolders.slice(currentRenderIndex, currentRenderIndex + PAGE_SIZE);
  const filesToRender = curFiles.slice(currentRenderIndex, currentRenderIndex + PAGE_SIZE);
  if (foldersToRender.length === 0 && filesToRender.length === 0) { allLoaded = true; return; }
  for(const f of foldersToRender) {
    const el = document.createElement('div');
    el.className = 'tile folder no-preview' + (folderSel.has(f.id)?' sel':'') + (f.deleted?' trashed':'');
    el.dataset.id = f.id; el.dataset.type = 'folder';
    const folderColor = f.color || 'var(--acc)';
    el.innerHTML = `
      <div class="folder-preview"></div>
      <div class="body">
        <svg class="folder-svg" style="color:${folderColor};" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
        <div class="lbl n">${escapeHtml(f.name)}</div>
      </div>
      ${f.deleted?'<div class="badge trash">Удалено</div>':''}
      <div class="chk"></div>
    `;
    frag.appendChild(el);
    if (folderPreviewEnabled) {
      imageLoader.observe(el);
    }
  }
  for(const f of filesToRender) {
    const el = document.createElement('div');
    el.className = 'tile' + (sel.has(f.id)?' sel':'') + (f.deleted?' trashed':'');
    el.dataset.id = f.id;
    el.dataset.type = 'file';
    el.dataset.fileId = f.id;
    const isVideo = f.type === 'video';
    const isImage = f.type === 'image';
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
    const tagsHtml = f.tags && f.tags.length ? `<div class="tile-tags">${f.tags.slice(0,2).map(t=>`<span>#${escapeHtml(t)}</span>`).join('')}${f.tags.length>2 ? '<span>+</span>' : ''}</div>` : '';
    const favStar = f.fav ? `<div class="fav-star">${ICONS.star}</div>` : '';
    el.innerHTML = `${favStar}${inner}${tagsHtml}${f.deleted?'<div class="badge trash">Удалено</div>':`<div class="badge">${TYPE_LABEL[f.type]}</div>`}<div class="chk"></div>`;
    frag.appendChild(el);
    if (isImage || isVideo) imageLoader.observe(el);
  }
  requestAnimationFrame(() => {
    grid.appendChild(frag);
    currentRenderIndex += PAGE_SIZE;
    updateUI();
  });
}

window.addEventListener('scroll', () => {
  document.body.classList.add('is-scrolling');
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => { document.body.classList.remove('is-scrolling'); }, 150);
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    if (window.scrollY > 500) $('btnUp').classList.add('on');
    else $('btnUp').classList.remove('on');
    if (isLocked || $('viewerModal').classList.contains('on') || isLoadingMore || allLoaded) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 500) {
      isLoadingMore = true;
      renderGrid(false);
      setTimeout(() => { isLoadingMore = false; }, 150);
    }
  });
}, { passive: true });
$('btnUp').onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

const gridEl = $('grid');
gridEl.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    pinchActive = true; clearTimeout(pressTimer);
    isLongPress = false; isDragSelecting = false; isScrolling = false;
    lastHoveredTile = null; document.body.classList.remove('selecting');
    pinchStartDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    return;
  }
  const tile = e.target.closest('.tile'); if (!tile) return;
  isLongPress = false; isScrolling = false; isDragSelecting = false;
  lastHoveredTile = null;
  startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    if (!isScrolling && !pinchActive) {
      isLongPress = true; isDragSelecting = true;
      document.body.classList.add('selecting');
      const id = Number(tile.dataset.id), type = tile.dataset.type;
      if (type === 'file' && !sel.has(id)) toggleFileSelection(id, tile);
      if (type === 'folder' && !folderSel.has(id)) toggleFolderSelection(id, tile);
      lastHoveredTile = tile;
      if (navigator.vibrate) navigator.vibrate(50);
      updateUI();
    }
  }, 500);
}, {passive:true});
gridEl.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && !pinchActive) {
    pinchActive = true; clearTimeout(pressTimer);
    isLongPress = false; isDragSelecting = false; isScrolling = false;
    lastHoveredTile = null; document.body.classList.remove('selecting');
    pinchStartDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    return;
  }
  if (e.touches.length === 2 && pinchActive) {
    e.preventDefault();
    const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    const ratio = dist / pinchStartDist;
    if (ratio > 1.3) { changeGridSize(-1); pinchStartDist = dist; }
    else if (ratio < 0.75) { changeGridSize(1); pinchStartDist = dist; }
    return;
  }
  if (!e.touches[0]) return;
  const currentX = e.touches[0].clientX, currentY = e.touches[0].clientY;
  if (isDragSelecting) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastDragTime < 50) return;
    lastDragTime = now;
    const el = document.elementFromPoint(currentX, currentY);
    if (el) {
      const tile = el.closest('.tile');
      if (tile && tile !== lastHoveredTile) {
        lastHoveredTile = tile;
        const id = Number(tile.dataset.id), type = tile.dataset.type;
        if (type === 'file' && !sel.has(id)) {
          sel.add(id); tile.classList.add('sel'); updateUI(); playSound('click');
        } else if (type === 'folder' && !folderSel.has(id)) {
          folderSel.add(id); tile.classList.add('sel'); updateUI(); playSound('click');
        }
      }
    }
  } else {
    if (Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10) {
      isScrolling = true; clearTimeout(pressTimer);
    }
  }
}, { passive: false });
gridEl.addEventListener('touchend', e => {
  clearTimeout(pressTimer);
  if (e.touches.length > 0) return;
  if (pinchActive) {
    pinchActive = false; pinchEndTime = Date.now();
    isLongPress = false; isDragSelecting = false; isScrolling = false;
    document.body.classList.remove('selecting');
    return;
  }
  if (Date.now() - pinchEndTime < 500) { isLongPress = false; isDragSelecting = false; return; }
  document.body.classList.remove('selecting');
  const wasLongPress = isLongPress;
  isDragSelecting = false;
  if (isScrolling || wasLongPress) return;
  const tile = e.target.closest('.tile'); if (!tile) return;
  const id = Number(tile.dataset.id), type = tile.dataset.type;
  const inSelection = viewMode === 'trash' || sel.size > 0 || folderSel.size > 0;
  if (inSelection) {
    if (type === 'file') toggleFileSelection(id, tile);
    else toggleFolderSelection(id, tile);
    updateUI();
  } else {
    if (type === 'folder') { currentFolder = id; clearSel(); refresh(); }
    else {
      const f = currentFilesCache.find(x => x.id === id) || trashFilesCache.find(x => x.id === id);
      if (f && !f.deleted) openFile(f);
    }
  }
});
gridEl.addEventListener('touchcancel', e => {
  clearTimeout(pressTimer); pinchActive = false;
  isLongPress = false; isDragSelecting = false; isScrolling = false;
  document.body.classList.remove('selecting'); pinchEndTime = Date.now();
});
let gridSizes = ['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)'];
async function changeGridSize(delta) {
  const cur = await getSetting('cols') || 'repeat(3, 1fr)';
  let idx = gridSizes.indexOf(cur);
  if (idx === -1) idx = 1;
  idx = Math.max(0, Math.min(gridSizes.length-1, idx + delta));
  if (gridSizes[idx] !== cur) await setCols(gridSizes[idx]);
}
function clearSel() {
  sel.clear(); folderSel.clear();
  document.querySelectorAll('.tile.sel').forEach(e=>e.classList.remove('sel'));
  updateUI();
}
function updateUI() {
  const hasSel = sel.size + folderSel.size > 0;
  const totalSel = sel.size + folderSel.size;
  const inTrash = viewMode === 'trash';
  $('bar').style.display = hasSel ? 'none' : 'flex';
  $('btnEmptyTrash').style.display = inTrash ? 'flex' : 'none';
  $('ctxMenu').classList.toggle('on', hasSel);
  $('ctxRow1').style.display = inTrash ? 'none' : 'grid';
  $('ctxRow2').style.display = inTrash ? 'none' : 'grid';
  $('ctxRowTrash').style.display = inTrash ? 'grid' : 'none';
  $('ctxRename').disabled = totalSel !== 1 && sel.size === 0;
  $('ctxInfo').disabled = totalSel !== 1;
  $('ctxDownload').disabled = sel.size === 0 && folderSel.size === 0;
  $('ctxFav').disabled = sel.size === 0;
  $('ctxTag').disabled = sel.size === 0;

  if (folderSel.size > 0) {
    $('ctxDownload').querySelector('.ctx-label').textContent = 'Экспорт';
  } else {
    $('ctxDownload').querySelector('.ctx-label').textContent = 'Скачать';
  }

  if(sel.size>0 && folderSel.size===0 && !inTrash) {
    $('ctxCompress').disabled = !currentFilesCache.filter(f=>sel.has(f.id)).some(f=>f.type==='image');
  } else $('ctxCompress').disabled=true;
  if (sel.size > 1) {
    $('ctxRename').disabled = false;
    $('ctxRename').querySelector('.ctx-label').textContent = 'Пакетно';
  } else {
    $('ctxRename').querySelector('.ctx-label').textContent = 'Имя';
  }
  if (sel.size > 0) {
    const files = currentFilesCache.filter(f => sel.has(f.id));
    const allFav = files.every(f => f.fav);
    $('ctxFav').querySelector('.ctx-label').textContent = allFav ? 'Из избранного' : 'В избранное';
  }
  if (hasSel) {
    const parts = [];
    if (sel.size) parts.push(`${sel.size} файл.`);
    if (folderSel.size) parts.push(`${folderSel.size} пап.`);
    let summary = `Выбрано: ${parts.join(' + ')}`;
    if (sel.size && !inTrash) {
      const sizeBytes = getSelectedFilesSize();
      const sizeMB = sizeBytes / 1048576;
      summary += `<br><span class="size" style="color:var(--acc);">${sizeMB.toFixed(2)} МБ</span>`;
    }
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
  else {
    sel.clear(); folderSel.clear();
    curFiles.forEach(f => sel.add(f.id));
    curFolders.forEach(f => folderSel.add(f.id));
    document.querySelectorAll('.tile').forEach(el => {
      const id = Number(el.dataset.id);
      const isFile = el.dataset.type === 'file';
      if ((isFile && sel.has(id)) || (!isFile && folderSel.has(id))) el.classList.add('sel');
      else el.classList.remove('sel');
    });
    updateUI();
  }
};
$('ctxClose').onclick = () => clearSel();
document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const newView = t.dataset.view || 'files';
    viewMode = newView; document.body.dataset.view = viewMode;
    filterType = t.dataset.type || 'all';
    clearSel(); refresh();
  };
});
$('search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  const val = $('search').value.trim();
  $('searchWrap').classList.toggle('has', !!val);
  searchTimer = setTimeout(() => { searchQuery = val; renderGrid(true); }, 250);
});
$('search').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('search').blur(); } });
$('searchClear').onclick = () => { $('search').value=''; searchQuery=''; $('searchWrap').classList.remove('has'); clearTimeout(searchTimer); renderGrid(true); };
$('btnAdd').onclick = () => $('file').click();

$('file').onchange = async e => {
  const files=[...e.target.files]; if(!files.length) return;
  await acquireWakeLock();
  const addedImageIds = [];
  try {
    const existingFiles = await getAllFiles();
    const existingHashes = new Set(existingFiles.filter(f => !f.deleted).map(f => f.hash).filter(h => h && !h.startsWith('unique_')));
    for(let i=0; i<files.length; i++) {
      const file = files[i];
      if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) { toast('Ошибка', 'GIF не поддерживаются', true); continue; }
      showProgress(`Проверка ${i+1} из ${files.length}`, 0, file.name, 'Поиск дубликатов...');
      await nextMacrotask();
      let hash = '';
      try { hash = await calculateHash(file); } catch(e){}
      if (hash && existingHashes.has(hash)) {
        if (!await showConfirm('Дубликат', `Файл <b>"${file.name}"</b> уже есть.<br><br>Добавить копию?`, 'Добавить', 'Пропустить')) continue;
      }
      showProgress(`Сохранение ${i+1} из ${files.length}`, 0, file.name, '...');
      await nextMacrotask();
      const newId = await addFile(file, hash);
      if (detectType(file) === 'image') addedImageIds.push(newId);
      if (hash && !hash.startsWith('unique_')) existingHashes.add(hash);
    }
    await refresh();
    if (addedImageIds.length > 0) {
      setTimeout(async () => {
        if (await showConfirm('Сжать фото?', `Вы добавили <b>${addedImageIds.length}</b> фото. Хотите их сжать для экономии места?`, 'Сжать', 'Пропустить')) {
          await compressFiles(addedImageIds, true);
        }
      }, 500);
    }
  } catch(err) { console.error(err); toast('Ошибка', err.message || 'Не удалось', true); }
  e.target.value=''; hideProgress();
  releaseWakeLock();
};
$('btnEmptyTrash').onclick = () => emptyTrash();

function buildColorPalette(selected) {
  const wrap = $('colorPalette'); wrap.innerHTML = '';
  FOLDER_COLORS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'color-swatch' + (c === selected ? ' sel' : '');
    el.style.background = c;
    el.onclick = () => {
      selectedFolderColor = c;
      wrap.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel');
    };
    wrap.appendChild(el);
  });
}
function openEditModal(title, val, isFolder, id=null, color=null, isBatch=false) {
  editIsFolder = isFolder; editId = id; batchMode = isBatch;
  $('meTitle').textContent = title; $('meName').value = val || '';
  $('batchWrap').style.display = isBatch ? 'block' : 'none';
  $('colorPickerWrap').style.display = (isFolder && !isBatch) ? 'block' : 'none';
  if (isFolder && !isBatch) { selectedFolderColor = color || FOLDER_COLORS[0]; buildColorPalette(selectedFolderColor); }
  else if (isBatch) { $('meName').value = 'Photo_#'; }
  $('ctxMenu').classList.remove('on');
  $('modalEdit').classList.add('on');
  setTimeout(() => $('meName').focus(), 150);
}
$('btnFolder').onclick = () => { editId = null; batchMode = false; openEditModal('Новая папка', '', true); };
$('meCancel').onclick = () => $('modalEdit').classList.remove('on');
$('meOk').onclick = async () => {
  const n = $('meName').value.trim();
  if(!n) return toast('Ошибка','Введите название',true);
  if (batchMode) {
    const files = currentFilesCache.filter(f => sel.has(f.id));
    const sorted = sortList([...files]);
    const s = st(SF, 'readwrite');
    for (let i = 0; i < sorted.length; i++) {
      const f = sorted[i];
      const newName = n.includes('#') ? n.replace(/#/g, String(i+1)) : `${n}_${i+1}`;
      const v = await p(s.get(f.id));
      if (v) { v.name = newName; await p(s.put(v)); }
    }
    toast('Успешно', `Переименовано ${sorted.length} файлов`);
  } else if (editId !== null && editId !== undefined) {
    if (editIsFolder) await updateFolderFull(editId, n, selectedFolderColor);
    else await renameItem(SF, editId, n);
    toast('Успешно','Сохранено');
  } else {
    await addFolder(n, currentFolder, selectedFolderColor);
    toast('Успешно','Папка создана');
  }
  editId = null; batchMode = false;
  $('modalEdit').classList.remove('on');
  clearSel(); refresh();
};
$('meName').addEventListener('keydown', e => { if (e.key === 'Enter') $('meOk').click(); });
async function renameItem(store, id, name) { const s=st(store,'readwrite'); const v=await p(s.get(id)); if(v){ v.name=name; await p(s.put(v)); } }
async function updateFolderFull(id, name, color) { const s=st(SFL,'readwrite'); const v=await p(s.get(id)); if(v){ v.name=name; v.color=color; await p(s.put(v)); } }
$('ctxRename').onclick = async () => {
  if (sel.size > 1) { openEditModal('Пакетное переименование', 'Photo_#', false, null, null, true); return; }
  if(sel.size+folderSel.size!==1) return;
  try {
    if(sel.size) { const f = await p(st(SF,'readonly').get([...sel][0])); if(!f) return toast('Ошибка', 'Не найдено', true); openEditModal('Переименовать', f.name, false, f.id); }
    else { const f = await p(st(SFL,'readonly').get([...folderSel][0])); if(!f) return toast('Ошибка', 'Не найдено', true); openEditModal('Переименовать', f.name, true, f.id, f.color); }
  } catch(e) { toast('Ошибка', 'Не удалось открыть', true); }
};
$('ctxFav').onclick = async () => {
  if (sel.size === 0) return;
  const files = currentFilesCache.filter(f => sel.has(f.id));
  const allFav = files.every(f => f.fav);
  const newFav = !allFav;
  const s = st(SF, 'readwrite');
  for (const f of files) { const v = await p(s.get(f.id)); if (v) { v.fav = newFav; await p(s.put(v)); } }
  clearSel(); refresh();
  toast(newFav ? 'Добавлено' : 'Убрано', newFav ? 'Файлы в избранном' : 'Файлы убраны из избранного');
};
let moveTarget='ROOT';
$('ctxMove').onclick = async () => {
  if(!(sel.size+folderSel.size)) return;
  const folders=await getAllFolders(); moveTarget='ROOT'; $('moveList').innerHTML='';
  const mk=(id,label)=>{
    const el=document.createElement('div');
    el.className='folder-item'+(id===moveTarget?' sel':'');
    el.style.padding='16px'; el.style.cursor='pointer'; el.style.borderBottom='1px solid var(--bd)';
    el.style.background = id===moveTarget ? 'var(--bd)' : 'transparent';
    el.innerHTML=`<span style="margin-right:12px;font-size:16px;color:var(--mut);">${id===null?'/':'›'}</span><span>${escapeHtml(label)}</span>`;
    el.onclick=()=>{
      moveTarget=id;
      document.querySelectorAll('#moveList .folder-item').forEach(x=>{x.classList.remove('sel'); x.style.background='transparent';});
      el.classList.add('sel'); el.style.background='var(--bd)';
    };
    return el;
  };
  $('moveList').appendChild(mk(null,'Корень'));
  const byParent={}; folders.filter(f=>!f.deleted).forEach(f=>{(byParent[f.parentId??null]=byParent[f.parentId??null]||[]).push(f);});
  const walk=(pid,depth)=>{ (byParent[pid]||[]).forEach(f=>{ $('moveList').appendChild(mk(f.id,'　'.repeat(depth)+f.name)); walk(f.id,depth+1); }); };
  walk(null,0); $('modalMove').classList.add('on');
};
$('mvCancel').onclick = () => $('modalMove').classList.remove('on');
$('mvOk').onclick = async () => {
  const target = moveTarget==='ROOT' ? null : moveTarget;
  try {
    if(sel.size) await moveFiles([...sel], target);
    if(folderSel.size) await moveFolders([...folderSel], target);
    clearSel(); $('modalMove').classList.remove('on'); await refresh(); toast('Успешно','Перемещено');
  } catch(e) { toast('Ошибка', e.message, true); }
};
async function moveFiles(ids, target) { const s=st(SF,'readwrite'); for(const id of ids){ const v=await p(s.get(id)); if(v){ v.folderId=target; await p(s.put(v)); } } }
async function moveFolders(ids, target) {
  const allFolders = await getAllFolders();
  const byId = new Map(allFolders.map(f => [f.id, f]));
  for (const id of ids) {
    let cur = target;
    while (cur != null) {
      if (cur === id) throw new Error('Нельзя переместить папку внутрь неё самой');
      const f = byId.get(cur); cur = f ? f.parentId : null;
    }
  }
  const s=st(SFL,'readwrite');
  for(const id of ids){ const v=await p(s.get(id)); if(v){ v.parentId=target; await p(s.put(v)); } }
}
$('ctxDel').onclick = async () => {
  const fid=[...sel], did=[...folderSel];
  if(!fid.length && !did.length) return;
  if(!await showConfirm('Удаление', `Переместить в корзину: <b>${fid.length}</b> файл. и <b>${did.length}</b> пап.?`)) return;
  try {
    await moveToTrash(fid, did);
    clearSel();
    await refresh();
    const total = fid.length + did.length;
    const subText = total === 1
      ? 'Перемещено в корзину'
      : `${total} ${did.length ? 'объектов' : 'файлов'} в корзине`;
    showUndoToast('В корзине', subText, async () => {
      await restoreFromTrash(fid, did);
      await refresh();
      toast('Восстановлено', total === 1 ? 'Объект возвращён' : `${total} объектов возвращено`);
    });
  } catch(e) {
    console.error(e);
    toast('Ошибка', 'Не удалось', true);
  }
};
$('ctxRestore').onclick = async () => {
  const fid=[...sel], did=[...folderSel];
  if(!fid.length && !did.length) return;
  try { await restoreFromTrash(fid, did); clearSel(); await refresh(); toast('Восстановлено', `${fid.length + did.length} объект.`); }
  catch(e) { toast('Ошибка', 'Не удалось', true); }
};
$('ctxDelForever').onclick = async () => {
  const fid=[...sel], did=[...folderSel];
  if(!fid.length && !did.length) return;
  if(!await showConfirm('Удаление навсегда', `Удалить навсегда: <b>${fid.length}</b> файл. и <b>${did.length}</b> пап.?`, 'Удалить')) return;
  try { await deletePermanent(fid, did); clearSel(); await refresh(); toast('Удалено', 'Навсегда'); }
  catch(e) { toast('Ошибка', 'Не удалось', true); }
};

async function compressFiles(ids, isAutoBatch = false) {
  if (!ids.length) return;
  const files = await getAllFiles();
  const selected = files.filter(f => ids.includes(f.id));
  const images = selected.filter(f => f.type === 'image');
  if(!images.length) return toast('Ошибка','Только фото',true);
  $('ctxMenu').classList.remove('on');
  await acquireWakeLock();
  const reusableCanvas = document.createElement('canvas');
  const reusableCtx = reusableCanvas.getContext('2d');
  let processed = 0, succeeded = 0, failed = 0;
  const stats = [];
  showProgress('Сжатие', 0, `Подготовка ${images.length} файл.`, '0%');
  await nextMacrotask();
  try {
    for(let i = 0; i < images.length; i++) {
      const f = images[i];
      try {
        showProgress('Сжатие', Math.round((processed / images.length) * 100), `${processed + 1} из ${images.length}: ${f.name}`, `${processed}/${images.length}`);
        await nextMacrotask();
        const file = await getFileData(f);
        if (!file) { processed++; failed++; continue; }
        const blob = await new Promise((resolve) => {
          const img = new Image();
          const url0 = URL.createObjectURL(file);
          const timeout = setTimeout(() => { URL.revokeObjectURL(url0); resolve(null); }, 15000);
          img.onload = () => {
            clearTimeout(timeout);
            try {
              reusableCanvas.width = img.width; reusableCanvas.height = img.height;
              reusableCtx.drawImage(img, 0, 0);
              reusableCanvas.toBlob(b => { URL.revokeObjectURL(url0); resolve(b); }, 'image/jpeg', 0.85);
            } catch(e) { URL.revokeObjectURL(url0); resolve(null); }
          };
          img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url0); resolve(null); };
          img.src = url0;
        });
        if (!blob || blob.size >= f.size) { processed++; continue; }
        const oldSize = f.size;
        const newSize = blob.size;
        if (rootDir) {
          try {
            const fh = await rootDir.getFileHandle(f.fileId, { create: true });
            const wr = await fh.createWritable(); await wr.write(blob); await wr.close();
          } catch(e) { console.error('Write err', e); }
        }
        const s = st(SF, 'readwrite');
        const v = await p(s.get(f.id));
        if (v) { v.size = blob.size; v.name = f.name.replace(/\.[^.]+$/, '.jpg'); if (!rootDir) v.blob = blob; await p(s.put(v)); }
        const tb = await generateImageThumbnail(blob);
        if (tb) await saveThumb(f.fileId, tb);
        stats.push({ name: f.name, oldSize: oldSize, newSize: newSize });
        succeeded++;
      } catch(err) { console.error('Compress err on', f.name, err); failed++; }
      processed++;
      await nextMacrotask();
    }
    hideProgress(); clearSel(); await refresh();
    if (isAutoBatch) {
      showCompressResults(stats, ids);
    } else {
      if (failed > 0) toast('Готово', `Сжато: ${succeeded}, ошибок: ${failed}`, false);
      else toast('Успешно', `Сжато: ${succeeded} фото`);
    }
  } catch(e) { console.error(e); hideProgress(); toast('Ошибка', 'Не удалось завершить', true); }
  finally { releaseWakeLock(); }
}

function showCompressResults(stats, targetIds) {
  let totalOld = 0, totalNew = 0;
  let html = '';
  stats.forEach(s => {
    totalOld += s.oldSize; totalNew += s.newSize;
    const savedBytes = s.oldSize - s.newSize;
    const percent = Math.round((savedBytes / s.oldSize) * 100);
    html += `
      <div class="compress-item">
        <div class="compress-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div>
        <div class="compress-sizes">
          <span class="compress-old">${(s.oldSize/1048576).toFixed(2)} MB</span>
          <span style="color:var(--mut);font-size:10px;">→</span>
          <span class="compress-new">${(s.newSize/1048576).toFixed(2)} MB</span>
          <span class="saved-badge">-${percent}%</span>
        </div>
      </div>`;
  });
  if (stats.length > 0) {
    const totalSaved = totalOld - totalNew;
    const totalPercent = Math.round((totalSaved / totalOld) * 100);
    $('compressSummary').innerHTML = `
      <div style="font-size:15px;font-weight:600;margin-bottom:4px;color:var(--acc);">Экономия места</div>
      <div style="font-size:13px;color:var(--mut);">
        Было: ${(totalOld/1048576).toFixed(2)} МБ → Стало: ${(totalNew/1048576).toFixed(2)} МБ
        <br><span style="font-weight:700;color:var(--acc);">Сэкономлено: ${(totalSaved/1048576).toFixed(2)} МБ (${totalPercent}%)</span>
      </div>`;
    $('compressList').innerHTML = html;
  } else {
    $('compressSummary').innerHTML = `<div style="font-size:15px;font-weight:600;color:var(--acc);">Сжатие не требуется</div><div style="font-size:13px;color:var(--mut);margin-top:4px;">Файлы уже оптимизированы.</div>`;
    $('compressList').innerHTML = '';
  }
  $('modalCompressResult').style.zIndex = '10005';
  $('modalCompressResult').classList.add('on');
  $('btnDoneCompress').onclick = () => {
    $('modalCompressResult').classList.remove('on');
    if (targetIds && targetIds.length > 0) {
      sel.clear();
      targetIds.forEach(id => sel.add(id));
      $('tagCount').textContent = targetIds.length;
      $('tagInput').value = '';
      renderTagList();
      $('modalTags').classList.add('on');
    }
  };
}

$('ctxCompress').onclick = async () => {
  const ids=[...sel]; if(!ids.length) return;
  await compressFiles(ids, false);
};

$('ctxDownload').onclick = async () => {
  const selectedFiles = currentFilesCache.filter(f => sel.has(f.id));
  const selectedFolderIds = [...folderSel];
  if (!selectedFiles.length && !selectedFolderIds.length) {
    return toast('Ошибка', 'Ничего не выбрано', true);
  }

  if (selectedFiles.length === 1 && selectedFolderIds.length === 0) {
    const f = selectedFiles[0];
    try {
      const data = await getFileData(f);
      if (!data) return toast('Ошибка', 'Файл не найден', true);
      const ok = await downloadFileSafe(data, f.name || 'file');
      if (ok) toast('Скачивание', f.name);
    } catch(e) { toast('Ошибка', 'Не удалось', true); }
    return;
  }

  await acquireWakeLock();
  showProgress('Экспорт', 0, 'Подготовка...', '');
  try {
    const items = [];
    const addedFileIds = new Set();
    const usedPrefixes = new Set();

    if (selectedFolderIds.length > 0) {
      const [allFiles, allFolders] = await Promise.all([getAllFiles(), getAllFolders()]);
      const byParent = new Map();
      allFolders.filter(f => !f.deleted).forEach(f => {
        const key = f.parentId ?? null;
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key).push(f);
      });
      const filesByFolder = new Map();
      allFiles.filter(f => !f.deleted).forEach(f => {
        const key = f.folderId ?? null;
        if (!filesByFolder.has(key)) filesByFolder.set(key, []);
        filesByFolder.get(key).push(f);
      });

      const walk = (folderId, prefix) => {
        const files = filesByFolder.get(folderId) || [];
        for (const f of files) {
          if (addedFileIds.has(f.id)) continue;
          addedFileIds.add(f.id);
          items.push({ zipPath: prefix + sanitizeName(f.name), file: f });
        }
        const subs = byParent.get(folderId) || [];
        for (const sub of subs) {
          walk(sub.id, prefix + sanitizeName(sub.name) + '/');
        }
      };

      for (const rootId of selectedFolderIds) {
        const rootFolder = allFolders.find(f => f.id === rootId && !f.deleted);
        if (!rootFolder) continue;
        const baseName = sanitizeName(rootFolder.name);
        let finalPrefix = baseName;
        let counter = 2;
        while (usedPrefixes.has(finalPrefix)) {
          finalPrefix = `${baseName}_${counter}`;
          counter++;
        }
        usedPrefixes.add(finalPrefix);
        walk(rootId, finalPrefix + '/');
      }
    }

    for (const f of selectedFiles) {
      if (addedFileIds.has(f.id)) continue;
      addedFileIds.add(f.id);
      items.push({ zipPath: sanitizeName(f.name || `file_${f.id}`), file: f });
    }

    if (items.length === 0) {
      hideProgress();
      toast('Пусто', 'Нет файлов для экспорта', true);
      releaseWakeLock();
      return;
    }

    const zipFiles = [], usedPaths = new Set();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      showProgress('Экспорт', Math.round((i / items.length) * 90),
        `${i+1}/${items.length}: ${item.file.name}`, '');
      await nextMacrotask();
      const data = await getFileData(item.file);
      if (!data) continue;

      let uniquePath = item.zipPath;
      if (usedPaths.has(uniquePath.toLowerCase())) {
        const slashIdx = uniquePath.lastIndexOf('/');
        const dirPart = slashIdx >= 0 ? uniquePath.slice(0, slashIdx + 1) : '';
        const filePart = uniquePath.slice(slashIdx + 1);
        const dotIdx = filePart.lastIndexOf('.');
        const baseName = dotIdx > 0 ? filePart.slice(0, dotIdx) : filePart;
        const ext = dotIdx > 0 ? filePart.slice(dotIdx) : '';
        let counter = 1;
        while (usedPaths.has(uniquePath.toLowerCase())) {
          uniquePath = `${dirPart}${baseName}_${counter}${ext}`;
          counter++;
        }
      }
      usedPaths.add(uniquePath.toLowerCase());
      zipFiles.push({ name: uniquePath, blob: data });
    }

    showProgress('Экспорт', 92, 'Создание архива...', '');
    await nextMacrotask();
    const blob = await createZip(zipFiles);
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const zipName = `mediavault_export_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
    hideProgress();
    const ok = await downloadFileSafe(blob, zipName);
    if (ok) toast('ZIP готов', `${zipFiles.length} файл. · ${(blob.size/1048576).toFixed(2)} МБ`);
  } catch(e) {
    console.error(e);
    hideProgress();
    toast('Ошибка', 'Не удалось создать ZIP', true);
  } finally {
    releaseWakeLock();
  }
};

$('ctxInfo').onclick = async () => {
  const totalSel = sel.size + folderSel.size;
  if (totalSel !== 1) return;
  try {
    if (sel.size === 1) {
      const id = [...sel][0];
      const source = viewMode === 'trash' ? trashFilesCache : currentFilesCache;
      const f = source.find(x => x.id === id);
      if (f) showInfo('file', f);
    } else {
      const id = [...folderSel][0];
      const folders = await getAllFolders();
      const f = folders.find(x => x.id === id);
      if (f) showInfo('folder', f);
    }
  } catch(e) { toast('Ошибка', 'Не удалось', true); }
};

async function applyTagToSelected(tag, action) {
  const ids = [...sel];
  if (!ids.length) return;
  const CHUNK_SIZE = 50;
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(SF, 'readwrite');
      const store = tx.objectStore(SF);
      chunk.forEach(id => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const v = getReq.result;
          if (v) {
            if (!v.tags) v.tags = [];
            if (action === 'add') { if (!v.tags.includes(tag)) v.tags.push(tag); }
            else if (action === 'remove') { v.tags = v.tags.filter(x => x !== tag); }
            store.put(v);
          }
        };
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Aborted'));
    });
    await new Promise(r => setTimeout(r, 10));
  }
  const updateCache = (cacheArr) => {
    cacheArr.forEach(f => {
      if (sel.has(f.id)) {
        if (!f.tags) f.tags = [];
        if (action === 'add' && !f.tags.includes(tag)) f.tags.push(tag);
        if (action === 'remove') f.tags = f.tags.filter(x => x !== tag);
      }
    });
  };
  updateCache(currentFilesCache);
  updateCache(trashFilesCache);
  renderGrid(true);
  renderTagList();
}
function renderTagList() {
  const wrap = $('tagList');
  wrap.innerHTML = '';
  const selectedFiles = (viewMode === 'trash' ? trashFilesCache : currentFilesCache).filter(f => sel.has(f.id));
  const allTags = new Set();
  selectedFiles.forEach(f => (f.tags || []).forEach(t => allTags.add(t)));
  if (allTags.size === 0) {
    wrap.innerHTML = '<div style="color:var(--mut);font-size:14px;">Нет тегов</div>';
    return;
  }
  allTags.forEach(tag => {
    const el = document.createElement('div');
    el.className = 'tag-chip';
    el.innerHTML = `#${escapeHtml(tag)} <span class="tag-del">${ICONS.xSmall}</span>`;
    el.querySelector('.tag-del').onclick = (e) => {
      e.stopPropagation(); playSound('click');
      applyTagToSelected(tag, 'remove');
    };
    wrap.appendChild(el);
  });
}
$('ctxTag').onclick = () => {
  if (sel.size === 0) return;
  $('ctxMenu').classList.remove('on');
  $('tagCount').textContent = sel.size;
  $('tagInput').value = '';
  renderTagList();
  $('modalTags').classList.add('on');
};
$('tagAddBtn').onclick = async () => {
  const tag = $('tagInput').value.trim();
  if (!tag) return;
  $('tagInput').value = '';
  await applyTagToSelected(tag, 'add');
};
$('tagInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('tagAddBtn').click(); } });
$('tagClose').onclick = () => { $('modalTags').classList.remove('on'); clearSel(); };

$('btnRandom').onclick = async () => {
  if (isLocked) return;
  let curFiles = [...currentFilesCache];
  if (filterType === 'image') curFiles = curFiles.filter(f => f.type === 'image');
  else if (filterType === 'video') curFiles = curFiles.filter(f => f.type === 'video');
  else if (filterType === 'fav') curFiles = curFiles.filter(f => f.fav);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    curFiles = curFiles.filter(f => f.name.toLowerCase().includes(q) || (f.tags && f.tags.some(t => t.toLowerCase().includes(q))));
  }
  curFiles = curFiles.filter(f => f.type === 'image' || f.type === 'video');
  if (curFiles.length < 2) return toast('Рандом', 'Нужно минимум 2 фото или видео', true);
  for (let i = curFiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [curFiles[i], curFiles[j]] = [curFiles[j], curFiles[i]];
  }
  galleryFiles = curFiles;
  currentGalleryIndex = 0;
  slideshowActive = true;
  const btn = $('viewerSlideshow');
  if (btn) { btn.innerHTML = ICONS.pause; btn.classList.add('active'); }
  $('viewerDelete').style.display = 'none';
  await renderViewer();
  if (galleryFiles[currentGalleryIndex] && galleryFiles[currentGalleryIndex].type !== 'video') {
    scheduleSlideshowNext(galleryFiles[currentGalleryIndex]);
  }
  toast('Рандом', `Запущено ${curFiles.length} файлов`);
};

$('btnSort').onclick = () => {
  document.querySelectorAll('#modalSort .list-item').forEach(el=>{
    el.style.background = el.dataset.sort===sortBy ? 'var(--bd)' : 'transparent';
  });
  $('modalSort').classList.add('on');
};
window.setSort = v => { sortBy=v; $('modalSort').classList.remove('on'); renderGrid(true); };
window.setTheme = async name => {
  document.body.dataset.theme=name;
  await setSetting('theme',name);
  document.querySelectorAll('.theme-item').forEach(el=>el.classList.toggle('sel', el.dataset.t===name));
};
window.setCols = async cols => {
  document.documentElement.style.setProperty('--cols',cols);
  await setSetting('cols',cols);
  document.querySelectorAll('.font-opt[data-c]').forEach(el=>el.classList.toggle('sel', el.dataset.c===cols));
  renderGrid(true);
};
async function loadTheme() {
  const s = await getAllSettings();
  const ALLOWED_THEMES = ['dark', 'light', 'amoled', 'nord'];
  let t = s.theme || 'dark';
  if (!ALLOWED_THEMES.includes(t)) {
    t = 'dark';
    await setSetting('theme', 'dark');
  }
  const c = s.cols || 'repeat(3, 1fr)';
  await setTheme(t); await setCols(c);
  const opacity = Number(s.bgOpacity ?? 85);
  $('bgOpacityRange').value = opacity;
  $('bgOpacityVal').textContent = opacity + '%';
  const bgFile = await getFromOPFS(BG_FILE_ID);
  await applyBackground(bgFile); await updateBgPreview(bgFile);
  const savedSlideshowMs = Number(s.slideshowInterval ?? DEFAULT_SLIDESHOW_MS);
  slideshowInterval = savedSlideshowMs;
  const sec = Math.round(savedSlideshowMs / 1000);
  $('slideshowIntRange').value = sec; $('slideshowIntVal').textContent = sec + ' сек';
  $('swLock').classList.toggle('on', !!s.lockEnabled);
  $('changePassWrap').style.display = $('swLock').classList.contains('on') ? 'block' : 'none';
  const trashDays = s.trashAutoDays ?? DEFAULT_TRASH_DAYS;
  updateTrashAutoPillsUI(trashDays);
  soundEnabled = s.soundEnabled !== false;
  if ($('swSound')) $('swSound').classList.toggle('on', soundEnabled);
  folderPreviewEnabled = s.folderPreviewEnabled !== false;
  if ($('swFolderPreview')) $('swFolderPreview').classList.toggle('on', folderPreviewEnabled);
}
$('btnSettings').onclick = async () => {
  $('modalSettings').classList.add('on');
  await updateStorageInfo();
  await updateStatistics();
  const bgFile = await getFromOPFS(BG_FILE_ID);
  await updateBgPreview(bgFile);
  const trashDays = await getTrashAutoDays();
  updateTrashAutoPillsUI(trashDays);
};

window.exportAllData = async () => {
  if (!await showConfirm('Экспорт', 'Создать полный архив со всеми файлами, папками и настройками?<br><br>Это может занять время.', 'Экспорт', 'Отмена')) return;
  await acquireWakeLock();
  showProgress('Экспорт', 0, 'Подготовка...', '');
  try {
    const [files, folders, settings] = await Promise.all([getAllFiles(), getAllFolders(), p(st(SS, 'readonly').getAll())]);
    const zipParts = [];
    let step = 0;
    const totalSteps = files.length * 2 + 3;
    const metadata = { version: DB_VERSION, exportedAt: Date.now(), files, folders, settings };
    zipParts.push({ name: 'metadata.json', blob: new Blob([new TextEncoder().encode(JSON.stringify(metadata))]) });
    step++;
    showProgress('Экспорт', Math.round((step/totalSteps)*100), 'metadata.json', '');
    await nextMacrotask();
    const bgFile = await getFromOPFS(BG_FILE_ID);
    if (bgFile) {
      try {
        zipParts.push({ name: 'background.jpg', blob: bgFile });
      } catch(e) {}
    }
    step++;
    for (const f of files) {
      try {
        const mainFile = await getFromOPFS(f.fileId) || f.blob;
        if (mainFile) {
          zipParts.push({ name: `files/${f.fileId}`, blob: mainFile });
        }
      } catch(e) { console.warn('Skip file', f.name, e); }
      step++;
      showProgress('Экспорт', Math.round((step/totalSteps)*100), f.name, `${step}/${totalSteps}`);
      await nextMacrotask();
      try {
        const thumb = await getThumb(f);
        if (thumb) {
          zipParts.push({ name: `thumbs/${f.fileId}`, blob: thumb });
        }
      } catch(e) {}
      step++;
      await nextMacrotask();
    }
    showProgress('Экспорт', 95, 'Создание архива...', '');
    await nextMacrotask();
    const blob = await createZip(zipParts);
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const name = `mediavault_backup_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
    hideProgress();
    await downloadFileSafe(blob, name);
    toast('Готово', `Экспортировано ${files.length} файлов (${(blob.size/1048576).toFixed(1)} МБ)`);
  } catch(e) { console.error(e); hideProgress(); toast('Ошибка', 'Не удалось экспортировать: ' + e.message, true); }
  finally { releaseWakeLock(); }
};

const ARCHIVE_MIME_MAP = {
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
  webp:'image/webp', bmp:'image/bmp', heic:'image/heic', heif:'image/heif',
  avif:'image/avif',
  mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime',
  avi:'video/x-msvideo', mkv:'video/x-matroska', m4v:'video/x-m4v',
  '3gp':'video/3gpp', flv:'video/x-flv', wmv:'video/x-ms-wmv'
};

async function writeDataToOPFS(fileId, data) {
  if (!rootDir) return false;
  try {
    const fh = await rootDir.getFileHandle(fileId, { create: true });
    const wr = await fh.createWritable();
    const CHUNK = 4 * 1024 * 1024;
    if (data.length <= CHUNK) {
      await wr.write(data);
    } else {
      for (let off = 0; off < data.length; off += CHUNK) {
        await wr.write(data.subarray(off, Math.min(off + CHUNK, data.length)));
        await nextMacrotask();
      }
    }
    await wr.close();
    return true;
  } catch (e) {
    console.error('writeDataToOPFS error', e);
    return false;
  }
}

window.importFromArchive = async (input) => {
  const file = input.files[0];
  if (!file) return;
  input.value = '';

  showProgress('Чтение', 0, 'Анализ архива...', '');
  await nextMacrotask();

  try {
    const entries = await parseZip(file);

    let metadata = null;
    let basePath = '';
    for (const e of entries) {
      if (e.name.endsWith('metadata.json')) {
        try { 
          metadata = JSON.parse(new TextDecoder().decode(e.data)); 
          basePath = e.name.substring(0, e.name.length - 'metadata.json'.length);
        } catch(e) {}
        break;
      }
    }

    if (metadata && metadata.files && metadata.folders) {
      hideProgress();
      if (!await showConfirm('Восстановление', 'Обнаружена полная резервная копия.<br><br>Все текущие данные будут <b>заменены</b>. Продолжить?', 'Восстановить', 'Отмена')) return;

      await acquireWakeLock();
      showProgress('Импорт', 10, 'Восстановление фона...', '');
      await nextMacrotask();

      const entryMap = new Map(entries.map(e => [e.name, e.data]));

      if (entryMap.has(basePath + 'background.jpg')) {
        try {
          const fh = await rootDir.getFileHandle(BG_FILE_ID, { create: true });
          const wr = await fh.createWritable();
          await wr.write(new Blob([entryMap.get(basePath + 'background.jpg')]));
          await wr.close();
        } catch(e) { console.warn('BG restore failed', e); }
      }

      const totalFiles = metadata.files.length;
      let i = 0;
      for (const f of metadata.files) {
        try {
          const mainData = entryMap.get(basePath + `files/${f.fileId}`);
          if (mainData) {
            const fh = await rootDir.getFileHandle(f.fileId, { create: true });
            const wr = await fh.createWritable();
            await wr.write(new Blob([mainData]));
            await wr.close();
          }
          const thumbData = entryMap.get(basePath + `thumbs/${f.fileId}`);
          if (thumbData) {
            const fh = await rootDir.getFileHandle(THUMB_PREFIX + f.fileId, { create: true });
            const wr = await fh.createWritable();
            await wr.write(new Blob([thumbData]));
            await wr.close();
          }
        } catch(e) { console.warn('Restore failed', f.name, e); }
        i++;
        showProgress('Импорт', 15 + Math.round((i/totalFiles)*70), f.name || `Файл ${i}`, `${i}/${totalFiles}`);
        if (i % 3 === 0) await nextMacrotask();
      }

      showProgress('Импорт', 88, 'Восстановление базы...', '');
      await nextMacrotask();

      const t1 = db.transaction(SF, 'readwrite'); t1.objectStore(SF).clear();
      await new Promise((res, rej) => { t1.oncomplete = res; t1.onerror = e => rej(e.target.error); });
      const t2 = db.transaction(SFL, 'readwrite'); t2.objectStore(SFL).clear();
      await new Promise((res, rej) => { t2.oncomplete = res; t2.onerror = e => rej(e.target.error); });
      const t3 = db.transaction(SS, 'readwrite'); t3.objectStore(SS).clear();
      await new Promise((res, rej) => { t3.oncomplete = res; t3.onerror = e => rej(e.target.error); });

      const t4 = db.transaction(SF, 'readwrite'); const s4 = t4.objectStore(SF);
      metadata.files.forEach(f => s4.put(f));
      await new Promise((res, rej) => { t4.oncomplete = res; t4.onerror = e => rej(e.target.error); });

      const t5 = db.transaction(SFL, 'readwrite'); const s5 = t5.objectStore(SFL);
      metadata.folders.forEach(f => s5.put(f));
      await new Promise((res, rej) => { t5.oncomplete = res; t5.onerror = e => rej(e.target.error); });

      if (metadata.settings && metadata.settings.length) {
        const t6 = db.transaction(SS, 'readwrite'); const s6 = t6.objectStore(SS);
        metadata.settings.forEach(s => s6.put(s));
        await new Promise((res, rej) => { t6.oncomplete = res; t6.onerror = e => rej(e.target.error); });
      }

      settingsCache = null;
      hideProgress();
      toast('Готово', `Восстановлено ${totalFiles} файлов. Перезагрузка...`);
      setTimeout(() => location.reload(), 1500);
      releaseWakeLock();
      return;
    }

    hideProgress();
    if (!await showConfirm('Импорт из ZIP-архива',
      'Импортировать фото и видео с сохранением структуры папок?<br><br>Текущая папка станет корнем импорта.',
      'Импортировать', 'Отмена')) return;

    await acquireWakeLock();
    showProgress('Импорт', 0, 'Чтение архива...', '');
    await nextMacrotask();

    const validEntries = entries.filter(e => {
      if (!e.name || e.name.endsWith('/')) return false;
      if (!e.data || e.data.length === 0) return false;
      const parts = e.name.split('/');
      if (parts.some(p => p.startsWith('__MACOSX') || p.startsWith('.'))) return false;
      return true;
    });

    const mediaEntries = validEntries.filter(e => {
      const m = e.name.match(/\.([a-z0-9]+)$/i);
      if (!m) return false;
      return ARCHIVE_MIME_MAP[m[1].toLowerCase()] !== undefined;
    });

    if (mediaEntries.length === 0) {
      hideProgress();
      toast('Пусто', 'В архиве не найдено фото или видео', true);
      releaseWakeLock();
      return;
    }

    const folderPaths = new Set();
    mediaEntries.forEach(e => {
      const parts = e.name.split('/');
      parts.pop();
      for (let i = 1; i <= parts.length; i++) {
        folderPaths.add(parts.slice(0, i).join('/'));
      }
    });

    showProgress('Импорт', 5, 'Создание папок...', '');
    await nextMacrotask();

    const existingFolders = await getAllFolders();
    const folderMap = new Map();
    const sortedPaths = [...folderPaths].sort((a, b) => a.split('/').length - b.split('/').length);

    for (const path of sortedPaths) {
      const parts = path.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      const parentId = parentPath ? folderMap.get(parentPath) : currentFolder;

      const existing = existingFolders.find(
        f => f.parentId === parentId && f.name === name && !f.deleted
      );

      let folderId;
      if (existing) {
        folderId = existing.id;
      } else {
        folderId = await addFolder(
          name, parentId,
          FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)]
        );
        existingFolders.push({ id: folderId, name, parentId: parentId ?? null, deleted: false });
      }
      folderMap.set(path, folderId);
    }

    const existingFiles = await getAllFiles();
    const existingHashes = new Set(
      existingFiles.filter(f => !f.deleted)
        .map(f => f.hash)
        .filter(h => h && !h.startsWith('unique_'))
    );

    let imported = 0, skipped = 0, failed = 0;

    for (let i = 0; i < mediaEntries.length; i++) {
      const entry = mediaEntries[i];
      const fileName = entry.name.split('/').pop();

      try {
        showProgress('Импорт', 5 + Math.round((i / mediaEntries.length) * 90),
          `${i + 1}/${mediaEntries.length}: ${fileName}`,
          `✓${imported} · ⏭${skipped} · ✗${failed}`);
        await nextMacrotask();

        const parts = entry.name.split('/');
        parts.pop();
        const folderPath = parts.join('/');
        const targetFolderId = folderPath ? folderMap.get(folderPath) : currentFolder;

        const ext = fileName.split('.').pop().toLowerCase();
        const mime = ARCHIVE_MIME_MAP[ext] || '';
        const fileObj = new File([entry.data], fileName, { type: mime });

        let hash = '';
        try { hash = await calculateHash(fileObj); } catch (e) {}
        if (hash && existingHashes.has(hash)) {
          skipped++;
          continue;
        }

        const fileId = generateId();
        const type = detectType(fileObj);
        const record = {
          fileId, name: fileName, type, mime,
          size: entry.data.length, date: Date.now(),
          folderId: targetFolderId, hash,
          deleted: false, deletedAt: null, fav: false,
          tags: []
        };

        if (rootDir) {
          const ok = await writeDataToOPFS(fileId, entry.data);
          if (!ok) { failed++; continue; }
          if (type === 'image' || type === 'video') {
            try {
              const thumbBlob = type === 'image'
                ? await generateImageThumbnail(fileObj)
                : await generateVideoThumbnail(fileObj);
              if (thumbBlob) await saveThumb(fileId, thumbBlob);
            } catch (e) {}
          }
        } else {
          record.blob = fileObj;
        }

        await p(st(SF, 'readwrite').add(record));
        if (hash && !hash.startsWith('unique_')) existingHashes.add(hash);
        imported++;
      } catch (err) {
        console.error('Archive import error', entry.name, err);
        failed++;
      }
    }

    hideProgress();
    await refresh();
    toast('Импорт завершён',
      `Добавлено: ${imported} · Пропущено: ${skipped} · Ошибок: ${failed}`);
  } catch (e) {
    console.error(e);
    hideProgress();
    toast('Ошибка', e.message || 'Не удалось обработать архив', true);
  } finally {
    releaseWakeLock();
  }
};

$('archiveImportFile').onchange = function () {
  if (this.files && this.files[0]) importFromArchive(this);
};

let ckTarget = null;
let ckLayout = 'ru';
let ckShift = false;
let ckNumeric = false;
const CK_LAYOUTS = {
  ru: [
    ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
    ['ф','ы','в','а','п','р','о','л','д','ж','э'],
    ['shift','я','ч','с','м','и','т','ь','б','ю','backspace'],
    ['123','space','enter']
  ],
  en: [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['shift','z','x','c','v','b','n','m','backspace'],
    ['123','space','enter']
  ],
  num: [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['-','/',':',';','(',')','₽','&','@','"'],
    ['shift','.',',','?','!','\'','backspace'],
    ['abc','space','enter']
  ],
  numpad: [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['backspace','0','enter']
  ]
};
let ckLayoutsBuilt = false;
function buildKeyboardDOM() {
  if (ckLayoutsBuilt) return;
  const rowsEl = $('ckRows');
  rowsEl.innerHTML = '';
  for (const [name, layout] of Object.entries(CK_LAYOUTS)) {
    const container = document.createElement('div');
    container.className = 'ck-layout';
    container.id = 'ck-layout-' + name;
    container.style.display = 'none';
    layout.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'ck-row';
      row.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'ck-key';
        btn.type = 'button';
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
function updateKeyboardKeys() {
  document.querySelectorAll('.ck-key[data-char]').forEach(btn => {
    const char = btn.dataset.char;
    if (ckShift && /[a-zа-яё]/i.test(char)) btn.textContent = char.toUpperCase();
    else btn.textContent = char;
  });
  document.querySelectorAll('.ck-key[data-action="shift"]').forEach(btn => {
    btn.classList.toggle('ck-active', ckShift);
  });
}
function ckRender() {
  buildKeyboardDOM();
  const activeLayout = ckNumeric ? 'numpad' : ckLayout;
  document.querySelectorAll('.ck-layout').forEach(el => el.style.display = 'none');
  const activeEl = $('ck-layout-' + activeLayout);
  if (activeEl) activeEl.style.display = 'flex';
  updateKeyboardKeys();
  const langBtn = $('ckLangBtn'), modeBtn = $('ckModeBtn');
  if (ckNumeric) { langBtn.hidden = true; modeBtn.hidden = true; }
  else {
    langBtn.hidden = ckLayout === 'num';
    langBtn.textContent = ckLayout === 'en' ? 'EN' : 'РУ';
    modeBtn.hidden = false;
    modeBtn.textContent = ckLayout === 'num' ? 'АБВ' : '123';
  }
}
function ckIsTextInput(t) {
  if (!t) return false;
  if (t.tagName === 'TEXTAREA') return true;
  if (t.tagName !== 'INPUT') return false;
  const type = (t.type || 'text').toLowerCase();
  if (['file','range','checkbox','radio','button','submit','reset','color','date','time','datetime-local','month','week'].includes(type)) return false;
  return true;
}
function ckDetectNumeric(input) {
  if (input.type === 'password') return true;
  const im = input.getAttribute('inputmode');
  if (im === 'numeric' || im === 'decimal' || im === 'tel') return true;
  return false;
}
function ckShow(input) {
  ckTarget = input;
  ckNumeric = ckDetectNumeric(input);
  ckShift = false;
  ckLayout = ckNumeric ? 'num' : 'ru';
  if (input.dataset.ckOrigInputmode === undefined) input.dataset.ckOrigInputmode = input.getAttribute('inputmode') || '';
  input.setAttribute('inputmode', 'none');
  ckRender();
  $('customKeyboard').classList.add('ck-on');
  document.body.classList.add('kb-open');
  const modal = input.closest('.modal');
  if (modal) modal.classList.add('kb-open');
  setTimeout(() => { try { input.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(e) {} }, 120);
}
function ckHide(blurInput = true) {
  if (ckTarget && ckTarget.dataset.ckOrigInputmode !== undefined) {
    const orig = ckTarget.dataset.ckOrigInputmode;
    if (orig) ckTarget.setAttribute('inputmode', orig);
    else ckTarget.removeAttribute('inputmode');
    delete ckTarget.dataset.ckOrigInputmode;
  }
  if (blurInput && ckTarget && document.activeElement === ckTarget) { try { ckTarget.blur(); } catch(e) {} }
  ckTarget = null;
  $('customKeyboard').classList.remove('ck-on');
  document.body.classList.remove('kb-open');
  document.querySelectorAll('.modal.kb-open').forEach(m => m.classList.remove('kb-open'));
}
function ckInsert(ch) {
  if (!ckTarget) return;
  const el = ckTarget;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const v = el.value || '';
  el.value = v.slice(0, start) + ch + v.slice(end);
  const pos = start + ch.length;
  try { el.setSelectionRange(pos, pos); } catch(e) {}
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
function ckBackspace() {
  if (!ckTarget) return;
  const el = ckTarget;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  if (start !== end) {
    el.value = el.value.slice(0, start) + el.value.slice(end);
    try { el.setSelectionRange(start, start); } catch(e) {}
  } else if (start > 0) {
    el.value = el.value.slice(0, start - 1) + el.value.slice(start);
    try { el.setSelectionRange(start - 1, start - 1); } catch(e) {}
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
function ckEnter() {
  if (!ckTarget) return;
  ckTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
  setTimeout(() => ckHide(true), 80);
}
document.addEventListener('pointerdown', (e) => {
  const key = e.target.closest('.ck-key');
  if (!key) return;
  e.preventDefault();
  if (!ckTarget) return;
  playSound('click');
  const action = key.dataset.action;
  const ch = key.dataset.char;
  if (action === 'shift') { ckShift = !ckShift; updateKeyboardKeys(); }
  else if (action === 'backspace') ckBackspace();
  else if (action === 'space') ckInsert(' ');
  else if (action === 'enter') ckEnter();
  else if (action === 'toNum') { ckLayout = 'num'; ckRender(); }
  else if (action === 'toAbc') { ckLayout = 'ru'; ckRender(); }
  else if (ch !== undefined) {
    const charToInsert = (ckShift && /[a-zа-яё]/i.test(ch)) ? ch.toUpperCase() : ch;
    ckInsert(charToInsert);
    if (ckShift && /[a-zа-яё]/i.test(ch)) { ckShift = false; updateKeyboardKeys(); }
  }
}, { passive: false });
$('ckDoneBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); playSound('click'); ckHide(true); });
$('ckLangBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); playSound('click'); ckLayout = (ckLayout === 'en') ? 'ru' : 'en'; ckShift = false; ckRender(); });
$('ckModeBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); playSound('click'); ckLayout = (ckLayout === 'num') ? 'ru' : 'num'; ckShift = false; ckRender(); });
document.addEventListener('focusin', (e) => {
  const t = e.target;
  if (!ckIsTextInput(t)) return;
  if (t === ckTarget) return;
  ckShow(t);
});
$('lockInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('lockBtn').click(); } });
$('newPass').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const btn = document.querySelector('button[onclick*="savePassword"]');
    if (btn) btn.click();
  }
});

document.addEventListener('pointerdown', (e) => {
  if (!ckTarget) return;
  if (e.target.closest('.ck')) return;
  if (e.target === ckTarget) return;
  if (ckIsTextInput(e.target)) return;
  ckHide(true);
}, { passive: true });

document.querySelectorAll('.modal:not(.custom-confirm) .box').forEach(box => {
  let startY = 0, currentY = 0, isDragging = false;
  box.addEventListener('touchstart', (e) => {
    if (e.target.closest('input, button, select, textarea, .ck, .font-opt, .theme-item, .list-item, .settings-btn')) return;
    if (box.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    isDragging = true;
    box.style.transition = 'none';
  }, { passive: true });
  box.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0 && box.scrollTop === 0) {
      if (e.cancelable) e.preventDefault();
      box.style.transform = `translateY(${deltaY}px)`;
    } else if (deltaY < 0) {
      isDragging = false; box.style.transform = ''; box.style.transition = '';
    }
  }, { passive: false });
  box.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const deltaY = currentY - startY;
    box.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
    if (deltaY > 100) {
      box.style.transform = `translateY(100%)`;
      setTimeout(() => {
        box.closest('.modal').classList.remove('on');
        box.style.transform = ''; box.style.transition = '';
      }, 300);
    } else {
      box.style.transform = 'translateY(0)';
      setTimeout(() => { box.style.transition = ''; }, 300);
    }
    startY = 0; currentY = 0;
  });
  box.addEventListener('touchcancel', () => {
    isDragging = false; box.style.transform = ''; box.style.transition = '';
    startY = 0; currentY = 0;
  });
});

window.openGithub = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const url = (e && e.currentTarget && e.currentTarget.href) || 'https://github.com/Ravi8O8/Krypta';
  try {
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w || w.closed || typeof w.closed === 'undefined') {
      window.location.href = url;
    }
  } catch (err) {
    try { window.location.href = url; } catch (_) {}
  }
};

(function bindViewerButtonsFast() {
  const ids = ['viewerClose', 'viewerSlideshow', 'viewerDownload', 'viewerInfo', 'viewerDelete'];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    let lastAction = 0;
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() - lastAction < 350) return;
      lastAction = Date.now();
      if (typeof btn.onclick === 'function') btn.onclick.call(btn, e);
    }, { passive: false });
    btn.addEventListener('click', function(e) {
      if (Date.now() - lastAction < 350) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });
})();

(async () => {
  try {
    await initOPFS();
    await openDB();
    await loadTheme();
    await checkLock();
    setTimeout(() => { autoCleanTrash().catch(()=>{}); }, 3000);
  } catch(e) {
    console.error(e);
    document.body.innerHTML = '<div style="padding:20px;text-align:center;color:red;">Ошибка базы данных.</div>';
  }
})();
