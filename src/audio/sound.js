// Web Audio API ile sentezlenmiş profesyonel ses motoru.
// Harici ses dosyası gerektirmez; AAC/OGG/MP3 yedek olarak yüklenebilir.
// Sesler: alkış, doğru/yanlış efekti, para, joker, sayaç, buton, hover, başlangıç/kazanan/kaybetme müziği, konfeti.

let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

export function sesAc() {
  ensure();
  if (ctx && ctx.state === 'suspended') ctx.resume();
  muted = false;
  try { localStorage.setItem('ses_acik', '1'); } catch {}
}

export function sesKapat() {
  muted = true;
  try { localStorage.setItem('ses_acik', '0'); } catch {}
}

export function sesDurumu() {
  try { return localStorage.getItem('ses_acik') !== '0'; } catch { return true; }
}

function tone(freq, dur, type = 'sine', vol = 0.3, when = 0, glide = null) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur, vol = 0.2, when = 0, filterFreq = 1000) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + when;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
}

export const Ses = {
  buton() { tone(660, 0.08, 'square', 0.18); },
  hover() { tone(880, 0.04, 'sine', 0.06); },
  dogru() {
    tone(523.25, 0.12, 'sine', 0.3, 0);
    tone(659.25, 0.12, 'sine', 0.3, 0.12);
    tone(783.99, 0.2, 'sine', 0.35, 0.24);
    tone(1046.5, 0.3, 'sine', 0.3, 0.4);
  },
  yanlis() {
    tone(220, 0.3, 'sawtooth', 0.25, 0, 110);
    tone(180, 0.4, 'sawtooth', 0.2, 0.15, 80);
  },
  para() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, 0.15, 'triangle', 0.25, i * 0.08));
  },
  joker() {
    tone(440, 0.1, 'square', 0.2, 0);
    tone(554.37, 0.1, 'square', 0.2, 0.1);
    tone(659.25, 0.15, 'square', 0.25, 0.2);
  },
  sayac() { tone(1200, 0.05, 'square', 0.1); },
  alkis() {
    for (let i = 0; i < 18; i++) noise(0.08, 0.12, i * 0.04, 2000 + Math.random() * 2000);
  },
  alkisUzun() {
    for (let i = 0; i < 40; i++) noise(0.1, 0.15, i * 0.05, 1500 + Math.random() * 3000);
  },
  uzgun() {
    tone(330, 0.4, 'sine', 0.2, 0, 220);
    tone(220, 0.5, 'sine', 0.18, 0.3, 165);
  },
  baslangic() {
    [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => tone(f, 0.3, 'triangle', 0.25, i * 0.15));
  },
  kazanan() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => tone(f, 0.4, 'triangle', 0.3, i * 0.12));
    setTimeout(() => this.alkisUzun(), 700);
  },
  kaybetme() {
    [440, 392, 349.23, 311.13, 261.63].forEach((f, i) => tone(f, 0.4, 'sine', 0.25, i * 0.2));
    setTimeout(() => this.uzgun(), 1000);
  },
  konfeti() {
    for (let i = 0; i < 30; i++) noise(0.06, 0.1, i * 0.03, 3000 + Math.random() * 4000);
    this.alkis();
  },
};
