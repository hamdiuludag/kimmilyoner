// Türkçe Wikipedia REST + MediaWiki API entegrasyonu.
// Soru üretiminde doğrulama için kullanılır. Offline durumda soru bankasına düşer.

const REST = 'https://tr.wikipedia.org/api/rest_v1/page/summary/';
const API = 'https://tr.wikipedia.org/w/api.php';

const cache = new Map();

export async function wikiOzet(baslik) {
  if (cache.has(baslik)) return cache.get(baslik);
  try {
    const res = await fetch(`${REST}${encodeURIComponent(baslik)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const ozet = {
      baslik: data.title,
      aciklama: data.extract || '',
      thumbnail: data.thumbnail?.source || null,
      url: data.content_urls?.desktop?.page || null,
    };
    cache.set(baslik, ozet);
    return ozet;
  } catch {
    return null;
  }
}

export async function wikiArama(sorgu, limit = 5) {
  try {
    const url = `${API}?action=query&list=search&srsearch=${encodeURIComponent(sorgu)}&format=json&origin=*&srlimit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.query?.search || []).map((r) => ({
      baslik: r.title,
      aciklama: r.snippet?.replace(/<[^>]+>/g, '') || '',
    }));
  } catch {
    return [];
  }
}

export async function wikiDogrula(baslik) {
  const ozet = await wikiOzet(baslik);
  if (!ozet || !ozet.aciklama) return false;
  if (ozet.aciklama.length < 40) return false;
  return true;
}

export function onlineMi() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
