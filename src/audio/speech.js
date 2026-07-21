// Web Speech API tabanlı ultra akıcı Türkçe sunucu.
// Noktalama işaretlerini SİLEBİLELİ (okumaz) ve yerine doğal duraklama koyar.
// Bağlama göre duygu tonlamaları ve nefes araları ile tam gerçekçi konuşma.

let voices = [];
let supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
let mevcut = false;
let konusuyor = false;

function loadVoices() {
  if (!supported) return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang?.startsWith('tr'));
  mevcut = voices.length > 0;
}
if (supported) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

export function sunucuDestekli() { return supported && mevcut; }

// Bağlama göre ses tonu ayarları
const TONLAR = {
  normal:    { rate: 0.95, pitch: 1.00, volume: 1.0 },
  heyecanli: { rate: 1.02, pitch: 1.06, volume: 1.0 },
  dusunur:   { rate: 0.82, pitch: 0.95, volume: 0.95 },
  mutlu:     { rate: 0.97, pitch: 1.10, volume: 1.0 },
  uzgun:     { rate: 0.80, pitch: 0.89, volume: 0.92 },
  ciddi:     { rate: 0.90, pitch: 0.97, volume: 1.0 },
  gizemli:   { rate: 0.84, pitch: 0.99, volume: 0.95 },
  kutlama:   { rate: 0.96, pitch: 1.14, volume: 1.0 },
};

// Noktalama işaretlerine göre duraklama süreleri (ms)
const DURAKLAMALAR = {
  '.': 360, '!': 400, '?': 430,
  ',': 200, ';': 300, ':': 280,
  '—': 380, '–': 380, '…': 520,
  '(': 120, ')': 120, '"': 0, "'": 0,
  '[': 0, ']': 0,
};

function bekle(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Metni noktalama işaretlerinden böl; işaretleri metinden çıkarıp
// yerine doğal duraklama koyar. Böylece TTS noktaları "nokta" diye okumaz.
function metinParcala(metin) {
  const parcalar = [];
  let birikim = '';
  for (let i = 0; i < metin.length; i++) {
    const ch = metin[i];
    if (DURAKLAMALAR[ch] !== undefined) {
      const metinParca = birikim.trim();
      if (metinParca) parcalar.push({ metin: metinParca, duraklama: DURAKLAMALAR[ch] });
      birikim = '';
    } else {
      birikim += ch;
    }
  }
  const son = birikim.trim();
  if (son) parcalar.push({ metin: son, duraklama: 0 });
  return parcalar;
}

function parcaKonus(metin, ton) {
  if (!supported || !metin || !konusuyor) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(metin);
    u.lang = 'tr-TR';
    u.rate = ton.rate;
    u.pitch = ton.pitch;
    u.volume = ton.volume;
    const trVoice = voices.find((v) => v.lang === 'tr-TR') || voices[0];
    if (trVoice) u.voice = trVoice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

// Ana konuşma fonksiyonu: noktalamayı siler, yerine duraklama koyar.
export async function konus(metin, tonAdi = 'normal') {
  if (!supported || !metin) return;
  speechSynthesis.cancel();
  konusuyor = true;
  const ton = TONLAR[tonAdi] || TONLAR.normal;
  const parcalar = metinParcala(metin);

  for (const p of parcalar) {
    if (!konusuyor) break;
    if (p.metin) await parcaKonus(p.metin, ton);
    if (p.duraklama > 0 && konusuyor) await bekle(p.duraklama);
  }
  konusuyor = false;
}

export function durdur() {
  konusuyor = false;
  if (supported) speechSynthesis.cancel();
}

// --- Oyun akışı anlatımları ---

const hosgeldin_mesajlari = [
  'Hoş geldiniz. Kim Milyoner Olmak İster yarışmasına. Bugün Türkiye konulu sorularla bilgi dağınızı sınayacağız. Hazır mısınız? Başlıyoruz.',
  'Merhaba ve hoş geldiniz. Tamamen Türkiye konulu bu yarışmada, doğru cevaplar sizi milyonerliğe taşıyacak. Bol şans dilerim.',
  'Sayın yarışmacı, hoş geldiniz. Karşınızda on beş soru ve sınırsız bir ödül merdiveni var. Hadi başlayalım.',
];

const soru_giris = [
  'İşte sorumuz geliyor. Dikkatli okuyalım.',
  'Yeni bir soru. Lütfen dikkatle dinleyin.',
  'Sıradaki soru. Burada ipucu size yol gösterecek.',
  'Karşınızda yeni bir soru daha. Hazır olun.',
];

const secenek_giris = [
  'Şıkları sizin için okuyorum.',
  'Seçenekler şunlar.',
  'Dört şıktan hangisi doğru? Dinleyin.',
];

const dusunme = [
  'Kararınızı verin. Acele etmeyin, ama süreyi de unutmayın.',
  'Hangisi olduğunu düşünün. İpucuyu dikkatlice okuyun.',
  'Cevabınızı seçmek için zamanınız var. İyi düşünün.',
];

const dogru_mesajlari = [
  'Doğru cevap! Tebrik ederim. Harika bir bilgi.',
  'Evet, doğru! Aferin size. Bu soruyu da geçtiniz.',
  'Doğru! İnanılmaz. Bilginize hayran kaldım.',
  'Mükemmel! Doğru cevabı buldunuz. Devam edelim.',
];

const yanlis_mesajlari = [
  'Maalesef. Bu cevap yanlış. Doğru cevap farklıydı.',
  'Üzgünüm ama bu doğru değil. Yine de cesaretiniz takdire şayan.',
  'Hayır, yanlış cevap. Doğrusunu birlikte öğrenelim.',
  'Ne yazık ki yanlış. Doğru cevabı birazdan açıklayacağım.',
];

const cekilme = [
  'Akıllıca bir karar. Ödülünüzü alıp yarışmadan ayrılıyorsunuz.',
  'Çekiliyor ve kazandığınız parayı güvenceye alıyorsunuz. Tebrikler.',
  'Stratejik bir çekilme. Ödülünüz sizin.',
];

const kazandi = [
  'Muhteşem! Tüm soruları doğru yanıtladınız ve milyoner oldunuz! Sizi tebrik ederim!',
  'İnanılmaz bir performans! Artık bir milyonersiniz. Kutlarım!',
  'Tebrikler, tebrikler! On beş soru, on beş doğru cevap. Siz bir efsanesiniz!',
];

const kaybetti = [
  'Yarışma burada sona eriyor. Üzülmeyin, her soru bir öğrenme fırsatıdır.',
  'Bugün olmazsa yarın. Bilginizi geliştirip tekrar deneyin. Görüşmek üzere.',
  'Maalesef elendiniz. Ama garantili ödülünüzü aldınız. Tekrar bekleriz.',
];

const sure_az = [
  'Süreniz azalıyor. Acele edin.',
  'On saniye kaldı. Kararınızı verin.',
  'Zaman daralıyor. Hızlı olun.',
];

const joker_mesajlari = {
  ciftCevap: 'Çift cevap hakkınızı kullanıyorsunuz. Artık iki cevap seçebilirsiniz.',
  seyirci: 'Seyirci jokerini kullandınız. Seyircinin dağılımı ekranda.',
  degistir: 'Soruyu değiştiriyorum. Yeni bir soru geliyor.',
};

function rastgele(dizi) {
  return dizi[Math.floor(Math.random() * dizi.length)];
}

export async function hosgeldin() {
  await konus(rastgele(hosgeldin_mesajlari), 'heyecanli');
}

export async function soruGiris() {
  await konus(rastgele(soru_giris), 'ciddi');
}

export async function soruOku(soru, ipucu, secenekler) {
  await konus(soru, 'ciddi');
  await bekle(350);
  await konus(`İpucu. ${ipucu}`, 'dusunur');
  await bekle(300);
  await konus(rastgele(secenek_giris), 'normal');
  const harfler = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < secenekler.length; i++) {
    await bekle(180);
    await konus(`${harfler[i]} şıkkı. ${secenekler[i]}`, 'normal');
  }
  await bekle(400);
  await konus(rastgele(dusunme), 'dusunur');
}

export async function secenekSecildi(harf, metin) {
  await konus(`${harf} şıkkını seçtiniz. ${metin}. Kesin misiniz?`, 'dusunur');
}

export async function dogruCevap(dogruMetin, aciklama) {
  await konus(rastgele(dogru_mesajlari), 'mutlu');
  await bekle(300);
  await konus(`Doğru cevap: ${dogruMetin}.`, 'mutlu');
  await bekle(400);
  await konus(aciklama, 'normal');
}

export async function yanlisCevap(secilenMetin, dogruMetin) {
  await konus(rastgele(yanlis_mesajlari), 'uzgun');
  await bekle(300);
  await konus(`Sizin cevabınız: ${secilenMetin}.`, 'uzgun');
  await bekle(300);
  await konus(`Doğru cevap ise: ${dogruMetin}.`, 'ciddi');
}

export async function cekilmeAnonsu() {
  await konus(rastgele(cekilme), 'normal');
}

export async function kazandiAnonsu() {
  await konus(rastgele(kazandi), 'kutlama');
}

export async function kaybettiAnonsu() {
  await konus(rastgele(kaybetti), 'uzgun');
}

export async function sureAzaldi() {
  await konus(rastgele(sure_az), 'heyecanli');
}

export async function jokerAnonsu(tur) {
  await konus(joker_mesajlari[tur] || 'Joker kullanıldı.', 'heyecanli');
}

export async function aciklamaOku(aciklama) {
  await konus(aciklama, 'normal');
}
