# BD-Translate

İngilizce makale veya herhangi bir metin okurken anlamını bilmediğin kelimeleri anında öğren isteğine bağlı olarak kaydet ve quiz şeklinde bu kelimeleri tekrar et.

## Nasıl Çalışır?

Bilgisayarda herhangi bir sayfada kelimeye çift tıklıyorsun. Çeviri balonu çıkıyor, istersen kelimeyi kaydediyorsun. Kaydettiğin kelimeler otomatik olarak GitHub'daki `kelimeler.json` dosyasına yazılıyor.

Telefonda quiz sitesini açtığında bu kelimeler otomatik geliyor. Quiz başlatıyorsun, kelimeler sana soruluyor, sen yazarak cevap veriyorsun.

---

## Kendi Kurulumun İçin

### 1. Google Apps Script

Çeviri için Google'ın kendi `LanguageApp` servisini kullanıyoruz. Ücretsiz, kayıt gerektirmiyor ama bir Google hesabı lazım.

1. [script.google.com](https://script.google.com) adresine git
2. Yeni proje oluştur
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

4. Deploy → Web app olarak yayınla
5. **Execute as:** Me, **Who has access:** Anyone
6. Verilen URL'i kopyala

---

### 2. GitHub Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Yeni token oluştur, sadece **repo** iznini seç
3. Token'ı kopyala

---

### 3. Repoyu Klonla
```bash
git clone https://github.com/caganv01/BD-TRANSLATE.git
cd BD-TRANSLATE
```

---

### 4. config.js Oluştur

Klasörün içine `config.js` adında bir dosya oluştur. Bu dosya `.gitignore`'da olduğu için GitHub'a gitmez.
```javascript
const GITHUB_CONFIG = {
  token: 'GITHUB_TOKENIN',
  repo: 'BD-TRANSLATE',
  owner: 'GITHUB_KULLANICI_ADIN',
  dosyaAdi: 'kelimeler.json'
};

const TRANSLATE_CONFIG = {
  url: 'GOOGLE_APPS_SCRIPT_URLIN'
};
```

---

### 5. Tarayıcıya Yükle

**Chrome / Brave / Edge**
`chrome://extensions` → Developer mode aç → Load unpacked → klasörü seç

**Firefox**
`about:debugging` → This Firefox → Load Temporary Add-on → `manifest.json` seç

---

### 6. Quiz Siteni Yayınla

GitHub reposunda Settings → Pages → Branch: main → Save

Birkaç dakika sonra aktif olur:
```
https://KULLANICI_ADIN.github.io/BD-TRANSLATE/quiz/
```

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
  ├── manifest.json
  ├── content.js
  ├── config.js        ← gizli, .gitignore'da
  ├── .gitignore
  └── quiz/
      ├── index.html
      ├── style.css
      └── script.js
```