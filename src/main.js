// Kim Milyoner Olmak İster? Türkiye - Oyun motoru ve durum makinesi.
// Sorular Wikipedia API üzerinden otomatik üretilir.

import { Ses, sesAc, sesKapat, sesDurumu } from './audio/sound.js';
import {
  hosgeldin, soruGiris, soruOku, secenekSecildi,
  dogruCevap as spikerDogru, yanlisCevap as spikerYanlis,
  cekilmeAnonsu, kazandiAnonsu, kaybettiAnonsu, sureAzaldi, jokerAnonsu,
  durdur as sunucuDurdur, sunucuDestekli,
} from './audio/speech.js';
import { Efektler } from './effects/confetti.js';
import { sonrakiSoru, gorulenEkle, skorKaydet, skorlar, gorulenTemizle } from './data/storage.js';
import { onlineMi } from './data/wikipedia.js';
import './styles.css';

const app = document.getElementById('app');
const boot = document.getElementById('boot');

let efektler = null;
let canvas = null;
let sesAcik = true;

const ZORLUK_ETIKET = { 1: 'Kolay', 2: 'Orta', 3: 'Zor', 4: 'Çok Zor', 5: 'Uzman' };

const state = {
  ekran: 'giris',
  ad: '',
  odul: 0,
  basamak: 0,
  zorluk: 1,
  soru: null,
  hash: null,
  secim: null,
  kilitli: false,
  yukleniyor: false,
  jokerler: { ciftCevap: true, seyirci: true, degistir: true },
  ciftCevapAktif: false,
  ciftCevapKullanildi: false,
  seyirciSonuc: null,
  timerId: null,
  kalanSure: 30,
  wikiBagli: false,
  sonuc: null,
};

const PARA_MERDIVENI = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600, 819200, 1638400];
const GARANTI_BARAJ = [0, 4, 9];
const SURE_LIMIT = 45;

function para(basamak) {
  return PARA_MERDIVENI[basamak] ?? 0;
}

function formatla(n) {
  return new Intl.NumberFormat('tr-TR').format(n) + ' ₺';
}

function zorlukBasamak(basamak) {
  if (basamak < 3) return 1;
  if (basamak < 6) return 2;
  if (basamak < 9) return 3;
  if (basamak < 12) return 4;
  return 5;
}

function garantiOdul(basamak) {
  let g = 0;
  for (const b of GARANTI_BARAJ) if (basamak >= b) g = para(b);
  return g;
}

function init() {
  canvas = document.createElement('canvas');
  canvas.id = 'fx';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9000;';
  document.body.appendChild(canvas);
  efektler = new Efektler(canvas);

  sesAcik = sesDurumu();
  if (sesAcik) sesAc(); else sesKapat();

  try {
    state.ad = localStorage.getItem('kullanici_ad') || '';
  } catch {}

  window.addEventListener('online', () => { state.wikiBagli = true; render(); });
  window.addEventListener('offline', () => { state.wikiBagli = false; render(); });
  state.wikiBagli = onlineMi();

  render();
  if (boot) boot.remove();
}

function render() {
  if (state.ekran === 'giris') renderGiris();
  else if (state.ekran === 'oyun') renderOyun();
  else if (state.ekran === 'sonuc') renderSonuc();
  else if (state.ekran === 'skorlar') renderSkorlar();
  updateSesButon();
}

function updateSesButon() {
  const btn = document.getElementById('sesToggle');
  if (btn) {
    btn.textContent = sesAcik ? '🔊 Ses Açık' : '🔇 Ses Kapalı';
    btn.setAttribute('aria-label', sesAcik ? 'Sesi kapat' : 'Sesi aç');
  }
}

function sesToggle() {
  sesAcik = !sesAcik;
  if (sesAcik) { sesAc(); Ses.buton(); } else { sesKapat(); sunucuDurdur(); }
  updateSesButon();
}

function renderGiris() {
  const baglantiDurumu = state.wikiBagli
    ? '<span class="bagli">Wikipedia API bağlı</span> · Sorular otomatik üretiliyor'
    : '<span class="bagli-degil">Çevrimdışı · İnternet bağlantısı gerekli</span>';
  app.innerHTML = `
    <div class="screen giris">
      <button id="sesToggle" class="ses-btn" aria-label="Ses kontrolü"></button>
      <div class="logo">
        <div class="logo-tl">₺</div>
        <h1>Kim Milyoner Olmak İster?</h1>
        <p class="alt">Tamamen Türkiye konulu · Wikipedia destekli</p>
      </div>
      <form id="girisForm" class="kart giris-kart">
        <label for="adInput">Kullanıcı Adınız</label>
        <input id="adInput" type="text" autocomplete="username" placeholder="Adınızı giriniz" value="${escapeHtml(state.ad)}" maxlength="20" required />
        <button type="submit" class="btn-primary" ${state.wikiBagli ? '' : 'disabled'}>Yarışmaya Başla</button>
        <button type="button" id="skorlarBtn" class="btn-ghost">Skor Tablosu</button>
      </form>
      <p class="durum">${baglantiDurumu}</p>
    </div>
  `;
  document.getElementById('sesToggle').onclick = sesToggle;
  document.getElementById('girisForm').onsubmit = (e) => {
    e.preventDefault();
    if (!state.wikiBagli) return;
    const v = document.getElementById('adInput').value.trim();
    if (!v) return;
    state.ad = v;
    try { localStorage.setItem('kullanici_ad', v); } catch {}
    Ses.baslangic();
    baslaOyun();
    if (sunucuDestekli()) hosgeldin();
  };
  document.getElementById('skorlarBtn').onclick = () => { state.ekran = 'skorlar'; render(); };
  const adInput = document.getElementById('adInput');
  setTimeout(() => adInput.focus(), 50);
}

function baslaOyun() {
  state.ekran = 'oyun';
  state.odul = 0;
  state.basamak = 0;
  state.zorluk = 1;
  state.soru = null;
  state.hash = null;
  state.secim = null;
  state.kilitli = false;
  state.yukleniyor = true;
  state.jokerler = { ciftCevap: true, seyirci: true, degistir: true };
  state.ciftCevapAktif = false;
  state.ciftCevapKullanildi = false;
  state.seyirciSonuc = null;
  render();
  sonraki();
}

async function sonraki() {
  state.yukleniyor = true;
  state.secim = null;
  state.kilitli = false;
  state.ciftCevapAktif = false;
  state.ciftCevapKullanildi = false;
  state.seyirciSonuc = null;
  state.kalanSure = SURE_LIMIT;
  state.zorluk = zorlukBasamak(state.basamak);
  render();

  const { soru, hash } = await sonrakiSoru(state.zorluk);
  state.soru = soru;
  state.hash = hash;
  state.yukleniyor = false;

  if (!soru) {
    state.ekran = 'sonuc';
    state.sonuc = { kazandi: false, cekildi: false, hata: true };
    render();
    return;
  }

  await gorulenEkle(hash);
  render();
  startTimer();
  spikerSoruyuOku();
}

async function spikerSoruyuOku() {
  if (!sunucuDestekli() || !state.soru) return;
  const s = state.soru;
  await soruGiris();
  await soruOku(s.soru, s.ipucu, s.secenekler);
}

function startTimer() {
  stopTimer();
  state.kalanSure = SURE_LIMIT;
  const bar = document.getElementById('timerBar');
  if (bar) bar.style.width = '100%';
  state.timerId = setInterval(() => {
    state.kalanSure -= 0.1;
    const t = document.getElementById('timerText');
    const b = document.getElementById('timerBar');
    if (t) t.textContent = Math.max(0, Math.ceil(state.kalanSure)) + 's';
    if (b) b.style.width = Math.max(0, (state.kalanSure / SURE_LIMIT) * 100) + '%';
    if (state.kalanSure <= 5 && state.kalanSure > 0) {
      Ses.sayac();
      if (Math.abs(state.kalanSure - 5) < 0.05 && sunucuDestekli()) sureAzaldi();
    }
    if (state.kalanSure <= 0) {
      stopTimer();
      yanlisCevap(-1);
    }
  }, 100);
}

function stopTimer() {
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
}

function renderOyun() {
  const s = state.soru;
  const odulSu = para(state.basamak);
  const garanti = garantiOdul(state.basamak);
  const zEtiket = ZORLUK_ETIKET[state.zorluk];

  if (state.yukleniyor || !s) {
    app.innerHTML = `
      <button id="sesToggle" class="ses-btn" aria-label="Ses kontrolü"></button>
      <div class="screen oyun">
        <div class="yukleniyor">
          <div class="ring"></div>
          <p>Wikipedia'dan soru hazırlanıyor…</p>
        </div>
      </div>
    `;
    document.getElementById('sesToggle').onclick = sesToggle;
    return;
  }

  app.innerHTML = `
    <button id="sesToggle" class="ses-btn" aria-label="Ses kontrolü"></button>
    <div class="screen oyun">
      <aside class="merdiven" aria-label="Para merdiveni">
        ${renderMerdiven()}
      </aside>
      <main class="saha">
        <header class="ust">
          <div class="oyuncu"><span class="etiket">Oyuncu</span><strong>${escapeHtml(state.ad)}</strong></div>
          <div class="odul"><span class="etiket">Mevcut Ödül</span><strong>${formatla(odulSu)}</strong></div>
          <div class="garanti"><span class="etiket">Garanti</span><strong>${formatla(garanti)}</strong></div>
          <div class="zorluk"><span class="etiket">Zorluk</span><strong>${zEtiket}</strong></div>
        </header>
        <div class="timer">
          <div class="timer-bar"><div id="timerBar" class="timer-fill"></div></div>
          <span id="timerText">${SURE_LIMIT}s</span>
        </div>
        <div class="soru-kart glass">
          <div class="soru-meta">
            <span class="kategori">${escapeHtml(s.kategori)}</span>
            <span class="zorluk-pill z${state.zorluk}">${zEtiket}</span>
          </div>
          <h2 class="soru">${escapeHtml(s.soru)}</h2>
          <div class="ipucu">${escapeHtml(s.ipucu)}</div>
          <div class="secenekler">
            ${s.secenekler.map((opt, i) => renderSecenek(i, opt)).join('')}
          </div>
          ${state.seyirciSonuc ? renderSeyirci() : ''}
        </div>
        <div class="jokerler">
          <button id="jCift" class="joker ${state.jokerler.ciftCevap ? '' : 'used'}" ${state.jokerler.ciftCevap ? '' : 'disabled'}>
            <span class="j-ikon">½</span><span class="j-ad">Çift Cevap</span>
          </button>
          <button id="jSeyirci" class="joker ${state.jokerler.seyirci ? '' : 'used'}" ${state.jokerler.seyirci ? '' : 'disabled'}>
            <span class="j-ikon">👥</span><span class="j-ad">Seyirci</span>
          </button>
          <button id="jDegistir" class="joker ${state.jokerler.degistir ? '' : 'used'}" ${state.jokerler.degistir ? '' : 'disabled'}>
            <span class="j-ikon">↻</span><span class="j-ad">Değiştir</span>
          </button>
        </div>
        <div class="alt-islem">
          <button id="cekil" class="btn-ghost" ${state.basamak === 0 ? 'disabled' : ''}>Ödülü Al ve Çekil</button>
        </div>
      </main>
    </div>
  `;
  document.getElementById('sesToggle').onclick = sesToggle;
  bindSecenekler();
  bindJokerler();
  document.getElementById('cekil').onclick = () => {
    if (state.kilitli || state.basamak === 0) return;
    stopTimer();
    sunucuDurdur();
    bitir(true);
  };
}

function renderMerdiven() {
  const total = 15;
  let html = '';
  for (let i = total - 1; i >= 0; i--) {
    const aktif = i === state.basamak;
    const gecildi = i < state.basamak;
    const baraj = GARANTI_BARAJ.includes(i);
    const cls = `basamak ${aktif ? 'aktif' : ''} ${gecildi ? 'gecildi' : ''} ${baraj ? 'baraj' : ''}`;
    html += `<div class="${cls}"><span class="b-no">${i + 1}</span><span class="b-odul">${formatla(para(i))}</span></div>`;
  }
  return html;
}

function renderSecenek(i, opt) {
  const harf = ['A', 'B', 'C', 'D'][i];
  let cls = 'secenek';
  if (state.secim === i) cls += ' secildi';
  if (state.kilitli && i === state.soru.dogruIndex) cls += ' dogru';
  if (state.kilitli && state.secim === i && i !== state.soru.dogruIndex) cls += ' yanlis';
  return `
    <button class="${cls}" data-i="${i}" ${state.kilitli ? 'disabled' : ''}>
      <span class="s-harf">${harf}</span>
      <span class="s-metin">${escapeHtml(opt)}</span>
    </button>
  `;
}

function renderSeyirci() {
  const harfler = ['A', 'B', 'C', 'D'];
  return `
    <div class="seyirci-sonuc">
      <h3>Seyirci Jokeri</h3>
      <div class="seyirci-barlar">
        ${state.seyirciSonuc.map((yuzde, i) => `
          <div class="seyirci-bar">
            <span class="sb-harf">${harfler[i]}</span>
            <div class="sb-track"><div class="sb-fill" style="width:${yuzde}%"></div></div>
            <span class="sb-yuzde">%${yuzde}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindSecenekler() {
  document.querySelectorAll('.secenek').forEach((b) => {
    b.onclick = () => sec(b.dataset.i | 0);
    b.onmouseenter = () => { if (!state.kilitli) Ses.hover(); };
  });
}

function bindJokerler() {
  const jc = document.getElementById('jCift');
  const js = document.getElementById('jSeyirci');
  const jd = document.getElementById('jDegistir');
  if (jc) jc.onclick = kullanCiftCevap;
  if (js) js.onclick = kullanSeyirci;
  if (jd) jd.onclick = kullanDegistir;
}

function sec(i) {
  if (state.kilitli) return;
  const harf = ['A', 'B', 'C', 'D'][i];
  const metin = state.soru?.secenekler?.[i];
  if (sunucuDestekli() && harf && metin) secenekSecildi(harf, metin);
  if (state.ciftCevapAktif && state.ciftCevapKullanildi) {
    stopTimer();
    Ses.buton();
    state.secim = i;
    state.kilitli = true;
    render();
    setTimeout(() => degerlendir(), 700);
    return;
  }
  if (state.ciftCevapAktif && !state.ciftCevapKullanildi) {
    Ses.buton();
    state.secim = i;
    state.ciftCevapKullanildi = true;
    render();
    return;
  }
  stopTimer();
  Ses.buton();
  state.secim = i;
  state.kilitli = true;
  render();
  setTimeout(() => degerlendir(), 700);
}

function degerlendir() {
  const dogru = state.soru.dogruIndex;
  if (state.secim === dogru) {
    dogruCevap();
  } else {
    yanlisCevap(state.secim);
  }
}

function dogruCevap() {
  Ses.dogru();
  efektler.patlama(window.innerWidth / 2, window.innerHeight / 2, '#f5b942', 50);
  efektler.altin(40);
  efektler.yildiz(8);
  if (sunucuDestekli()) sunucuDurdur();
  const dogruMetin = state.soru.secenekler[state.soru.dogruIndex];
  setTimeout(async () => {
    Ses.para();
    efektler.konfeti(120);
    Ses.alkis();
    if (sunucuDestekli()) await spikerDogru(dogruMetin, state.soru.aciklama);
  }, 500);
  setTimeout(() => {
    state.basamak += 1;
    state.odul = para(state.basamak);
    if (state.basamak >= 15) {
      bitir(false, true);
    } else {
      sonraki();
    }
  }, 4500);
}

function yanlisCevap(secimIdx) {
  Ses.yanlis();
 document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
  if (sunucuDestekli()) sunucuDurdur();
  const secilenMetin = secimIdx >= 0 ? state.soru.secenekler[secimIdx] : 'Süre doldu';
  const dogruMetin = state.soru.secenekler[state.soru.dogruIndex];
  if (sunucuDestekli()) spikerYanlis(secilenMetin, dogruMetin);
  setTimeout(() => {
    Ses.uzgun();
    bitir(false, false, secimIdx);
  }, 1500);
}

async function bitir(cekildi, kazandi = false, secimIdx = -1) {
  stopTimer();
  sunucuDurdur();
  let odul = 0;
  if (kazandi) odul = para(state.basamak);
  else if (cekildi) odul = para(state.basamak);
  else odul = garantiOdul(state.basamak);
  state.odul = odul;
  await skorKaydet(state.ad, odul, state.zorluk);
  state.ekran = 'sonuc';
  state.sonuc = { kazandi, cekildi, secimIdx };
  if (kazandi) { Ses.kazanan(); efektler.konfeti(300); efektler.altin(120); if (sunucuDestekli()) kazandiAnonsu(); }
  else if (cekildi) { if (sunucuDestekli()) cekilmeAnonsu(); }
  else { Ses.kaybetme(); if (sunucuDestekli()) kaybettiAnonsu(); }
  render();
}

function renderSonuc() {
  const { kazandi, cekildi, hata } = state.sonuc;
  let baslik = 'Oyun Bitti';
  let alt = '';
  if (hata) {
    baslik = 'Soru Yüklenemedi';
    alt = 'Wikipedia API\'ye ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.';
  } else if (kazandi) {
    baslik = 'Tebrikler! Milyoner Oldunuz!';
    alt = 'Tüm soruları doğru yanıtladınız.';
  } else if (cekildi) {
    baslik = 'Ödülünüzü Aldınız';
    alt = 'Stratejik bir çekilme.';
  } else {
    baslik = 'Yanlış Cevap';
    alt = 'Bir sonraki sefere!';
    if (state.odul > 0) alt += ` Garantili ödülünüz: ${formatla(state.odul)}`;
  }
  app.innerHTML = `
    <div class="screen sonuc">
      <button id="sesToggle" class="ses-btn"></button>
      <div class="sonuc-kart glass">
        <h1>${baslik}</h1>
        <p class="alt">${alt}</p>
        ${!hata ? `<div class="odul-buyuk">${formatla(state.odul)}</div>` : ''}
        <div class="sonuc-islem">
          <button id="tekrar" class="btn-primary">Tekrar Oyna</button>
          <button id="skorlarBtn2" class="btn-ghost">Skor Tablosu</button>
          <button id="menu" class="btn-ghost">Ana Menü</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('sesToggle').onclick = sesToggle;
  document.getElementById('tekrar').onclick = () => { efektler.temizle(); baslaOyun(); };
  document.getElementById('skorlarBtn2').onclick = () => { state.ekran = 'skorlar'; render(); };
  document.getElementById('menu').onclick = () => { efektler.temizle(); state.ekran = 'giris'; render(); };
}

async function renderSkorlar() {
  const list = await skorlar();
  app.innerHTML = `
    <div class="screen skorlar">
      <button id="sesToggle" class="ses-btn"></button>
      <div class="kart glass">
        <h1>Skor Tablosu</h1>
        ${list.length === 0 ? '<p class="bos">Henüz skor yok.</p>' : `
          <ol class="skor-liste">
            ${list.map((s, i) => `<li><span class="sira">${i + 1}</span><span class="isim">${escapeHtml(s.ad)}</span><span class="skor">${formatla(s.odul)}</span></li>`).join('')}
          </ol>`}
        <button id="geri" class="btn-primary">Geri Dön</button>
      </div>
    </div>
  `;
  document.getElementById('sesToggle').onclick = sesToggle;
  document.getElementById('geri').onclick = () => { state.ekran = 'giris'; render(); };
}

function kullanCiftCevap() {
  if (!state.jokerler.ciftCevap || state.kilitli) return;
  state.jokerler.ciftCevap = false;
  state.ciftCevapAktif = true;
  state.ciftCevapKullanildi = false;
  Ses.joker();
  if (sunucuDestekli()) jokerAnonsu('ciftCevap');
  render();
}

function kullanSeyirci() {
  if (!state.jokerler.seyirci || state.kilitli) return;
  state.jokerler.seyirci = false;
  Ses.joker();
  if (sunucuDestekli()) jokerAnonsu('seyirci');
  const dogru = state.soru.dogruIndex;
  const zorluk = state.zorluk;
  const dogruYuzde = Math.max(35, 78 - (zorluk - 1) * 10 + Math.floor(Math.random() * 12));
  const kalan = 100 - dogruYuzde;
  const dizi = [0, 0, 0, 0];
  dizi[dogru] = dogruYuzde;
  const diger = [0, 1, 2, 3].filter((i) => i !== dogru);
  let top = kalan;
  for (let i = 0; i < diger.length - 1; i++) {
    const v = Math.floor(Math.random() * (top - (diger.length - i - 1)));
    dizi[diger[i]] = v;
    top -= v;
  }
  dizi[diger[diger.length - 1]] = top;
  state.seyirciSonuc = dizi;
  render();
}

async function kullanDegistir() {
  if (!state.jokerler.degistir || state.kilitli) return;
  state.jokerler.degistir = false;
  Ses.joker();
  if (sunucuDestekli()) jokerAnonsu('degistir');
  stopTimer();
  if (state.hash) await gorulenEkle(state.hash);
  sonraki();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.addEventListener('keydown', (e) => {
  if (state.ekran !== 'oyun' || state.kilitli || state.yukleniyor) return;
  const map = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  if (e.key in map) sec(map[e.key]);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

init();
