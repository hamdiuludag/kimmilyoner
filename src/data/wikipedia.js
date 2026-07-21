// Wikipedia API üzerinden otomatik soru üretici.
// tr.wikipedia.org REST + MediaWiki API kullanır.
// Soru formatı: Wikipedia özeti ipucu olarak verilir, doğru başlık şıklar arasından bulunur.
// Offline durumda null döner; çağıran kod yedek senaryoyu ele alır.

import { KONU_TOHUMLARI, tumBasliklar } from './topics.js';

const REST = 'https://tr.wikipedia.org/api/rest_v1/page/summary/';
const API = 'https://tr.wikipedia.org/w/api.php';

const ozetCache = new Map();

export function onlineMi() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

async function ozetGetir(baslik) {
  if (ozetCache.has(baslik)) return ozetCache.get(baslik);
  try {
    const res = await fetch(`${REST}${encodeURIComponent(baslik)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const o = {
      baslik: data.title,
      aciklama: data.extract || '',
      url: data.content_urls?.desktop?.page || null,
    };
    ozetCache.set(baslik, o);
    return o;
  } catch {
    return null;
  }
}

function ipucuHazirla(aciklama, baslik) {
  if (!aciklama) return null;
  let ipucu = aciklama;
  const kelimeler = baslik.split(/\s+/);
  for (const k of kelimeler) {
    if (k.length < 4) continue;
    ipucu = ipucu.replace(new RegExp(k, 'gi'), '…');
  }
  if (ipucu.length < 60 || ipucu.length > 280) return null;
  if ((ipucu.match(/…/g) || []).length === 0) return null;
  return ipucu;
}

function yanliscenekUret(dogru, adaylar) {
  const havuz = adaylar.filter((b) => b !== dogru);
  if (havuz.length < 3) return null;
  const secili = [];
  const kullanilan = new Set();
  while (secili.length < 3 && havuz.length) {
    const i = Math.floor(Math.random() * havuz.length);
    const aday = havuz[i];
    if (!kullanilan.has(aday)) {
      secili.push(aday);
      kullanilan.add(aday);
    }
    havuz.splice(i, 1);
  }
  return secili.length === 3 ? secili : null;
}

function karistir(dogru, yanlis) {
  const tum = [dogru, ...yanlis];
  for (let i = tum.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tum[i], tum[j]] = [tum[j], tum[i]];
  }
  return { secenekler: tum, dogruIndex: tum.indexOf(dogru) };
}

const SORU_KALIPLARI = [
  ‘Aşağıdaki açıklama hangisi için geçerlidir?’, ‘Bu açıklama ile
tanımlanan kavram hangisidir?’, ‘Verilen ipucu hangi konuya aittir?’,
‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu özelliklerle tanımlanan
nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade eder?’, ‘Verilen açıklama
hangi unsuru belirtmektedir?’, ‘Bu bilgiler hangi konu ile ilgilidir?’,
‘Açıklaması verilen kavram hangisidir?’, ‘Bu tanımlamaya uygun cevap
hangisidir?’, ‘Aşağıdaki açıklama hangisi için geçerlidir?’, ‘Bu
açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen ipucu hangi konuya
aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu özelliklerle
tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade eder?’,
‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler hangi konu
ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’, ‘Aşağıdaki açıklama hangisi için
geçerlidir?’, ‘Bu açıklama ile tanımlanan kavram hangisidir?’, ‘Verilen
ipucu hangi konuya aittir?’, ‘Aşağıdaki bilgiler hangisine aittir?’, ‘Bu
özelliklerle tanımlanan nedir?’, ‘Aşağıdaki tanım hangi kavramı ifade
eder?’, ‘Verilen açıklama hangi unsuru belirtmektedir?’, ‘Bu bilgiler
hangi konu ile ilgilidir?’, ‘Açıklaması verilen kavram hangisidir?’, ‘Bu
tanımlamaya uygun cevap hangisidir?’,
];

export async function soruUret(zorluk, kategori = null) {
  const havuz = tumBasliklar().filter((t) =>
    t.zorluk === zorluk && (!kategori || t.kategori === kategori)
  );
  if (havuz.length === 0) return null;

  const tumBaslikListesi = tumBasliklar().map((t) => t.baslik);

  for (let deneme = 0; deneme < 15; deneme++) {
    const tohum = havuz[Math.floor(Math.random() * havuz.length)];
    const ozet = await ozetGetir(tohum.baslik);
    if (!ozet || !ozet.aciklama || ozet.aciklama.length < 80) continue;

    const ipucu = ipucuHazirla(ozet.aciklama, tohum.baslik);
    if (!ipucu) continue;

    const yanlis = yanliscenekUret(tohum.baslik, tumBaslikListesi);
    if (!yanlis) continue;

    const { secenekler, dogruIndex } = karistir(tohum.baslik, yanlis);
    const kalip = SORU_KALIPLARI[Math.floor(Math.random() * SORU_KALIPLARI.length)];

    return {
      id: `wiki-${tohum.baslik}-${deneme}`,
      kategori: tohum.kategori,
      zorluk: tohum.zorluk,
      soru: kalip,
      ipucu,
      secenekler,
      dogruIndex,
      aciklama: ozet.aciklama,
      kaynak: ozet.url,
    };
  }
  return null;
}

export async function dogrula(baslik) {
  const o = await ozetGetir(baslik);
  return !!(o && o.aciklama && o.aciklama.length >= 40);
}
