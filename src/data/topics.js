// Türkiye konulu Wikipedia makale başlıkları (tohum listesi).
// Sorular bu makalelerin Wikipedia özetlerinden otomatik üretilir.
// Her başlık gerçek tr.wikipedia.org makalesidir.
// Kategori: { zorluk, basliklar: [...] }

export const KONU_TOHUMLARI = {
  'Türkiye Coğrafyası': {
    1: ['Türkiye', 'Ankara', 'İstanbul', 'İzmir', 'Antalya', 'Bursa', 'Konya'],
    2: ['Ağrı Dağı', 'Van Gölü', 'Kızılırmak', 'Fırat', 'Dicle', 'Tuz Gölü', 'Beyşehir Gölü', 'Erciyes', 'Uludağ', 'Süphan Dağı'],
    3: ['Atatürk Barajı', 'Keban Barajı', 'Köprüçay', 'Manavgat Çayı', 'Sakarya Nehri', 'Göksu', 'Seyhan Nehri', 'Ceyhan Nehri', 'Çoruh Nehri', 'Aras Nehri'],
    4: ['Munzur Dağları', 'Kaçkar Dağları', 'Aladağlar', 'Bolkar Dağları', 'Yıldız Dağları', 'Toros Dağları', 'Zagros Dağları', 'Kızıltepe'],
    5: ['Iğdır', 'Kilis', 'Yalova', 'Bayburt', 'Ardahan', 'Şırnak', 'Batman'],
  },
  'Türkiye Cumhuriyeti Tarihi': {
    1: ['Mustafa Kemal Atatürk', 'İsmet İnönü', 'Cumhuriyet', 'Türkiye Büyük Millet Meclisi'],
    2: ['Celal Bayar', 'Cemal Gürsel', 'Cevdet Sunay', 'Fahri Korutürk', 'Kenan Evren', 'Turgut Özal', 'Süleyman Demirel', 'Ahmet Necdet Sezer', 'Abdullah Gül', 'Recep Tayyip Erdoğan'],
    3: ['Lozan Antlaşması', 'Mondros Mütarekesi', 'Sevr Antlaşması', 'Saltanatın kaldırılması', 'Halifeliğin kaldırılması', 'Harf Devrimi', 'Türk Dil Kurumu', 'Türk Tarih Kurumu'],
    4: ['Milli Mücadele', 'Erzurum Kongresi', 'Sivas Kongresi', 'Amasya Genelgesi', 'Büyük Taarruz', 'Sakarya Meydan Muharebesi'],
    5: ['1924 Anayasası', '1961 Anayasası', '1982 Anayasası', '2017 Türkiye anayasa değişikliği referandumu'],
  },
  'Osmanlı Devleti': {
    1: ['Osman Gazi', 'Orhan Gazi', 'Fatih Sultan Mehmed', 'Kanuni Sultan Süleyman', 'Yavuz Sultan Selim'],
    2: ['Osmanlı İmparatorluğu', 'İstanbul\'un fethi', 'Çaldıran Muharebesi', 'Mohaç Muharebesi', 'Viyana Kuşatması', 'Kosova Muharebesi'],
    3: ['II. Abdülhamid', 'Mehmed Reşad', 'VI. Mehmed', 'Tanzimat Fermanı', 'I. Dünya Savaşı'],
    4: ['Köprülü Mehmed Paşa', 'Sokollu Mehmed Paşa', 'Kösem Sultan', 'Hürrem Sultan', 'Mimar Sinan'],
    5: ['Rumeli Hisarı', 'Anadoluhisarı', 'Topkapı Sarayı', 'Dolmabahçe Sarayı', 'Beylerbeyi Sarayı'],
  },
  'Çanakkale Savaşları': {
    1: ['Çanakkale Savaşları', 'Çanakkale Zaferi', 'Gelibolu Yarımadası'],
    2: ['Anzak Koyu', 'Seddülbahir', 'Arıburnu', 'Conkbayırı', 'Kerevizdere'],
    3: ['Nusrat Mayın Gemisi', '18 Mart Deniz Zaferi', 'Mehmetçik'],
    4: ['Mustafa Kemal Atatürk', 'Esat Bülkat', 'Otto Liman von Sanders'],
    5: ['Çanakkale Şehitleri Anıtı', 'Kilitbahir Kalesi'],
  },
  'Türk Kültürü ve Mutfağı': {
    1: ['Türk mutfağı', 'Kebap', 'Baklava', 'Türk kahvesi', 'Çay', 'Simit', 'Lahmacun', 'Pide'],
    2: ['Mantı', 'Dolma', 'Sarma', 'Menemen', 'Çiğ köfte', 'Adana kebabı', 'Gaziantep mutfağı'],
    3: ['Nevruz', 'Kına gecesi', 'Türk halk müziği', 'Türk sanat müziği', 'Bağlama', 'Ney'],
    4: ['Karagöz ve Hacivat', 'Meddah', 'Ortaoyunu', 'Semazen', 'Mevlana', 'Sema'],
    5: ['Yağlı güreş', 'Kırkpınar', 'Cirit', 'Türk halk oyunları'],
  },
  'Türk Edebiyatı ve Türkçe': {
    1: ['Mehmet Akif Ersoy', 'İstiklal Marşı', 'Yunus Emre', 'Pir Sultan Abdal'],
    2: ['Orhan Veli Kanık', 'Nâzım Hikmet', 'Cahit Sıtkı Tarancı', 'Fazıl Hüsnü Dağlarca', 'Ziya Gökalp', 'Tevfik Fikret'],
    3: ['Yaşar Kemal', 'Orhan Pamuk', 'Elif Şafak', 'Sabahattin Ali', 'Sait Faik Abasıyanık'],
    4: ['Tanzimat edebiyatı', 'Servet-i Fünûn', 'Fecr-i Âti', 'Garip akımı', 'Yedi Meşaleciler'],
    5: ['Divan edebiyatı', 'Halk edebiyatı', 'Aşık edebiyatı', 'Tasavvuf edebiyatı'],
  },
  'UNESCO Mirasları ve Tarihi Yapılar': {
    1: ['Ayasofya', 'Sultanahmet Camii', 'Topkapı Sarayı', 'Nemrut Dağı', 'Pamukkale', 'Kapadokya'],
    2: ['Selimiye Camii', 'Süleymaniye Camii', 'Ephesos', 'Hierapolis', 'Çatalhöyük', 'Aspendos'],
    3: ['Bodrum Kalesi', 'Rumeli Hisarı', 'Diyarbakır Surları', 'İshak Paşa Sarayı', 'Sumela Manastırı'],
    4: ['Xanthos', 'Letoon', 'Aphrodisias', 'Hattuşaş', 'Safranbolu', 'Bergama'],
    5: ['Göreme Millî Parkı', 'Nemrut Dağı Millî Parkı', 'Olympos', 'Faselis', 'Perge'],
  },
  'Türk Bilim ve Sanat': {
    1: ['Sabiha Gökçen', 'Hulusi Behçet', 'Aziz Sancar', 'Cahit Arf'],
    2: ['Sezen Aksu', 'Tarkan', 'Ajda Pekkan', 'Sertab Erener', 'Nuri Bilge Ceylan'],
    3: ['Kenan Doğulu', 'Müjdat Gezen', 'Yılmaz Güney', 'Türkan Şoray', 'Kemal Sunal'],
    4: ['Nuri Bilge Ceylan', 'Fatih Akın', 'Semih Kaplanoğlu', 'Reha Erdem'],
    5: ['Fazıl Say', 'İdil Biret', 'Güher ve Süher Pekinel'],
  },
  'Bayrak, Marş ve Semboller': {
    1: ['Türk bayrağı', 'İstiklal Marşı', 'Türkiye Cumhuriyeti Devlet Arması', 'Anıtkabir'],
    2: ['Mehmet Akif Ersoy', 'Osman Zeki Üngör', '29 Ekim', '23 Nisan', '19 Mayıs', '30 Ağustos'],
    3: ['10 Kasım', 'Ulusal Egemenlik ve Çocuk Bayramı', 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', 'Zafer Bayramı'],
    4: ['Cumhuriyet Bayramı', 'TBMM', 'Türkiye Cumhuriyeti'],
    5: ['Anayasa', '1921 Anayasası', '1924 Anayasası'],
  },
};

export function tumBasliklar() {
  const out = [];
  for (const [kategori, seviyeler] of Object.entries(KONU_TOHUMLARI)) {
    for (const [zorluk, basliklar] of Object.entries(seviyeler)) {
      for (const baslik of basliklar) {
        out.push({ kategori, zorluk: Number(zorluk), baslik });
      }
    }
  }
  return out;
}
