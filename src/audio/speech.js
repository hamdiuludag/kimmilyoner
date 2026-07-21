// Web Speech API tabanlı Türkçe sunucu. Soruları, şıkları ve açıklamayı okur.

let voices = [];
let supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function loadVoices() {
  if (!supported) return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang?.startsWith('tr'));
}
if (supported) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

export function sunucuDestekli() { return supported && voices.length > 0; }

export function konus(metin, opts = {}) {
  if (!supported) return Promise.resolve();
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(metin);
    u.lang = 'tr-TR';
    u.rate = opts.rate ?? 0.98;
    u.pitch = opts.pitch ?? 1.0;
    u.volume = opts.volume ?? 1.0;
    const trVoice = voices.find((v) => v.lang === 'tr-TR') || voices[0];
    if (trVoice) u.voice = trVoice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function durdur() {
  if (supported) speechSynthesis.cancel();
}

export async function soruOku(soru, secenekler) {
  await konus(soru);
  const harfler = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < secenekler.length; i++) {
    await konus(`${harfler[i]}: ${secenekler[i]}`, { rate: 0.95 });
  }
}

export async function aciklamaOku(aciklama) {
  await konus(aciklama, { rate: 0.95 });
}
