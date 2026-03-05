# BD-Translate

İngilizce okurken karşılaştığın kelimeleri anında çevir, kaydet ve telefonda quiz yaparak öğren.

---

## Nasıl Çalışır?

**Bilgisayarda:**
- Herhangi bir sayfada kelimeye çift tıkla
- Çeviri balonu anında çıkar
- **+ Ekle** ile kelimeyi defterine kaydet
- Kelime otomatik olarak GitHub'a yüklenir

**Telefonda:**
- Quiz sitesini aç
- Kaydettiğin kelimeler otomatik gelir
- Quiz yap, öğren!

---

## Kendi Kurulumun İçin

### 1. Google Apps Script Kur

1. [script.google.com](https://script.google.com) adresine git
2. **"New project"** oluştur, adını `BD-Translate` yap
3. Şu kodu yapıştır:
```javascript
function doGet(e) {
  const metin = e.parameter.q;
  const kaynak = e.parameter.source || 'en';
  const hedef = e.parameter.target || 'tr';
  
  const ceviri = LanguageApp.translate(metin, kaynak, hedef);
  
  return ContentService
    .createTextOutput(JSON.stringify({ ceviri: ceviri }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Deploy** → **New deployment** → **Web app**
5. **Execute as:** Me, **Who has access:** Anyone
6. Deploy et ve URL'i kopyala

---

### 2. GitHub Token Al

1. GitHub → **Settings** → **Developer settings**
2. **Personal access tokens** → **Tokens (classic)**
3. **Generate new token** → sadece **`repo`** iznini seç
4. Token'ı kopyala ve kaydet

---

### 3. Repoyu Klonla
```bash
git clone https://github.com/caganv01/BD-TRANSLATE.git
cd BD-TRANSLATE
```

---

### 4. config.js Oluştur

Klasörün içine `config.js` adında bir dosya oluştur:
```javascript
const GITHUB_CONFIG = {
  token: 'GITHUB_TOKENIN',        // 2. adımda aldığın token
  repo: 'BD-TRANSLATE',           // repo adın
  owner: 'GITHUB_KULLANICI_ADIN', // GitHub kullanıcı adın
  dosyaAdi: 'kelimeler.json'
};

const TRANSLATE_CONFIG = {
  url: 'GOOGLE_APPS_SCRIPT_URLIN' // 1. adımda aldığın URL
};
```

> ⚠️ `config.js` zaten `.gitignore`'da — GitHub'a gitmez, token'ın güvende.

---

### 5. Tarayıcıya Yükle

**Chrome / Brave / Edge:**
1. `chrome://extensions` adresine git
2. Sağ üstte **Developer mode**'u aç
3. **Load unpacked** → klonladığın klasörü seç

**Firefox:**
1. `about:debugging` adresine git
2. **This Firefox** → **Load Temporary Add-on**
3. `manifest.json` dosyasını seç

---

### 6. Quiz Siteni Yayınla

1. GitHub'da reponun **Settings** → **Pages**'e git
2. Branch: **main**, klasör: **/ (root)** seç
3. Save — birkaç dakika sonra şu adres aktif olur:
```
https://KULLANICI_ADIN.github.io/BD-TRANSLATE/quiz/
```

---

## Özellikler

- 🌍 Çoklu dil — EN→TR, TR→EN, DE→TR, FR→TR
- ⚡ Google Translate kalitesinde çeviri
- 🔄 Otomatik GitHub senkronizasyonu
- 📱 Mobil uyumlu quiz sitesi
- ✅ Duplicate kelime kontrolü

---

## Teknolojiler

| | |
|---|---|
| Extension | Vanilla JS, Manifest v3 |
| Çeviri | Google Apps Script |
| Depolama | chrome.storage.sync + localStorage |
| Hosting | GitHub Pages |
| Senkronizasyon | GitHub API |

---

## Proje Yapısı
```
BD-Translate/
  ├── manifest.json   → Extension tanımı
  ├── content.js      → Çeviri + kaydetme
  ├── config.js       → Token + API URL (gizli, .gitignore'da)
  ├── .gitignore      
  └── quiz/
      ├── index.html  → Quiz arayüzü
      ├── style.css   → Tasarım
      └── script.js   → Quiz mantığı
```