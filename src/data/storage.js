// IndexedDB + LocalStorage + hash tabanlı tekrar etmeme sistemi.
// Sorular Wikipedia API üzerinden üretilir; hash'lenerek saklanır.

import { soruUret } from './wikipedia.js';

const DB_NAME = 'kim_milyoner';
const DB_VERSION = 1;
const STORE_GORULEN = 'gorulen_sorular';
const STORE_SKOR = 'skorlar';

let dbPromise = null;

function dbAc() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_GORULEN)) {
        db.createObjectStore(STORE_GORULEN, { keyPath: 'hash' });
      }
      if (!db.objectStoreNames.contains(STORE_SKOR)) {
        db.createObjectStore(STORE_SKOR, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export function soruHash(soru) {
  const str = `${soru.id}|${soru.soru}|${soru.secenekler.join('|')}`;
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

export async function gorulenEkle(hash) {
  try {
    const db = await dbAc();
    const tx = db.transaction(STORE_GORULEN, 'readwrite');
    tx.objectStore(STORE_GORULEN).put({ hash, ts: Date.now() });
    await tx.done;
  } catch {}
  try {
    const set = new Set(JSON.parse(localStorage.getItem('gorulen_sorular') || '[]'));
    set.add(hash);
    localStorage.setItem('gorulen_sorular', JSON.stringify([...set]));
  } catch {}
}

export async function gorulenMi(hash) {
  try {
    const db = await dbAc();
    const tx = db.transaction(STORE_GORULEN, 'readonly');
    const got = await tx.objectStore(STORE_GORULEN).get(hash);
    if (got) return true;
  } catch {}
  try {
    const set = new Set(JSON.parse(localStorage.getItem('gorulen_sorular') || '[]'));
    if (set.has(hash)) return true;
  } catch {}
  return false;
}

export async function gorulenTemizle() {
  try {
    const db = await dbAc();
    const tx = db.transaction(STORE_GORULEN, 'readwrite');
    tx.objectStore(STORE_GORULEN).clear();
    await tx.done;
  } catch {}
  try { localStorage.removeItem('gorulen_sorular'); } catch {}
}

export async function sonrakiSoru(zorluk, kategori = null) {
  for (let deneme = 0; deneme < 6; deneme++) {
    const soru = await soruUret(zorluk, kategori);
    if (!soru) continue;
    const hash = soruHash(soru);
    if (!(await gorulenMi(hash))) {
      return { soru, hash };
    }
  }
  const sonCikis = await soruUret(zorluk, kategori);
  if (sonCikis) return { soru: sonCikis, hash: soruHash(sonCikis) };
  return { soru: null, hash: null };
}

export async function skorKaydet(ad, odul, zorluk) {
  const kayit = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ad, odul, zorluk, ts: Date.now() };
  try {
    const db = await dbAc();
    const tx = db.transaction(STORE_SKOR, 'readwrite');
    tx.objectStore(STORE_SKOR).add(kayit);
    await tx.done;
  } catch {}
  try {
    const list = JSON.parse(localStorage.getItem('skorlar') || '[]');
    list.push(kayit);
    localStorage.setItem('skorlar', JSON.stringify(list.slice(-100)));
  } catch {}
  return kayit;
}

export async function skorlar() {
  try {
    const db = await dbAc();
    const tx = db.transaction(STORE_SKOR, 'readonly');
    const all = await tx.objectStore(STORE_SKOR).getAll();
    return all.sort((a, b) => b.odul - a.odul).slice(0, 50);
  } catch {}
  try {
    return JSON.parse(localStorage.getItem('skorlar') || '[]')
      .sort((a, b) => b.odul - a.odul).slice(0, 50);
  } catch { return []; }
}
