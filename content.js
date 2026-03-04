// Güvenlik: XSS saldırılarına karşı koruma
function temizle(metin) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(metin));
  return div.innerHTML;
}

// Eski baloncuk varsa kaldır
function balonuKaldir() {
  const eskileri = document.querySelectorAll('.kb-balon');
  eskileri.forEach(el => el.remove());
}

// Çift tıklamayı dinle
document.addEventListener('dblclick', async function(e) {

  const kelime = window.getSelection().toString().trim();
  if (kelime === '' || kelime.split(' ').length > 3) return;

  balonuKaldir();

  const x = e.pageX;
  const y = e.pageY;

  // Balonu oluştur
  const balon = document.createElement('div');
  balon.className = 'kb-balon';
  balon.style.cssText = `
    position: absolute;
    top: ${y + 10}px;
    left: ${x}px;
    background: #1a1a2e;
    color: white;
    padding: 14px 18px;
    border-radius: 14px;
    font-size: 15px;
    font-family: sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    z-index: 999999;
    min-width: 280px;
    max-width: 360px;
  `;

  // Dil seçimi + yükleniyor
  balon.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
      <select id="kb-dil" style="
        background:#0f0f1a;
        border:1px solid #6c63ff;
        color:#a89cff;
        padding:4px 8px;
        border-radius:6px;
        font-size:12px;
        cursor:pointer;
      ">
        <option value="en|tr" selected>🇬🇧 EN → 🇹🇷 TR</option>
        <option value="tr|en">🇹🇷 TR → 🇬🇧 EN</option>
        <option value="de|tr">🇩🇪 DE → 🇹🇷 TR</option>
        <option value="fr|tr">🇫🇷 FR → 🇹🇷 TR</option>
      </select>
      <button id="kb-kapat" style="
        background:none;
        border:none;
        color:#555;
        cursor:pointer;
        font-size:16px;
        line-height:1;
      ">✕</button>
    </div>
    <div style="color:#888; font-size:13px;"></div>
  `;

  document.body.appendChild(balon);

  // Kapat butonu
  balon.querySelector('#kb-kapat').addEventListener('click', balonuKaldir);

  // Dil değişince tekrar çevir
  balon.querySelector('#kb-dil').addEventListener('change', async function() {
    await cevirVeGoster(balon, kelime, this.value);
  });

  // İlk çeviri — default EN → TR
  await cevirVeGoster(balon, kelime, 'en|tr');

});

// Çeviri yapıp balonu güncelle
async function cevirVeGoster(balon, kelime, dilCifti) {
  // Yükleniyor göster (dil seçimini koru)
  const dilSecimi = balon.querySelector('#kb-dil');
  const altKisim = balon.querySelector('.kb-alt');
  if (altKisim) altKisim.remove();

  const yukleniyor = document.createElement('div');
  yukleniyor.className = 'kb-alt';
  yukleniyor.style.cssText = 'color:#888; font-size:13px; margin-top:4px;';
  yukleniyor.textContent = '';
  balon.appendChild(yukleniyor);

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(kelime)}&langpair=${dilCifti}`
    );
    const data = await response.json();
    const ceviri = data.responseData.translatedText;

    const temizKelime = temizle(kelime);
    const temizCeviri = temizle(ceviri);

    yukleniyor.remove();

    const sonuc = document.createElement('div');
    sonuc.className = 'kb-alt';
    sonuc.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        gap:10px;
        padding: 10px 0;
        border-top: 1px solid rgba(255,255,255,0.06);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        margin-bottom: 10px;
      ">
        <span style="color:#a89cff; font-weight:800; font-size:16px;">${temizKelime}</span>
        <span style="color:#555;">→</span>
        <span style="font-size:16px; font-weight:600;">${temizCeviri}</span>
      </div>
      <button class="kb-ekle" style="
        width:100%;
        background:#6c63ff;
        border:none;
        color:white;
        padding: 8px;
        border-radius:8px;
        cursor:pointer;
        font-size:13px;
        font-weight:700;
      ">+ Kelime Defterine Ekle</button>
    `;
    balon.appendChild(sonuc);

    // + Ekle butonu
    sonuc.querySelector('.kb-ekle').addEventListener('click', () => {
      chrome.storage.sync.get(['words'], function(result) {
        const words = result.words || {};

        if (words[temizKelime.toLowerCase()]) {
          sonuc.querySelector('.kb-ekle').textContent = '⚠️ Zaten kayıtlı!';
          sonuc.querySelector('.kb-ekle').style.background = '#ffa502';
          setTimeout(balonuKaldir, 1500);
          return;
        }

        words[temizKelime.toLowerCase()] = temizCeviri;
        chrome.storage.sync.set({ words }, function() {
          sonuc.querySelector('.kb-ekle').textContent = '✅ Kaydedildi!';
          sonuc.querySelector('.kb-ekle').style.background = '#2ecc71';
          setTimeout(balonuKaldir, 1500);
        });
      });
    });

  } catch(err) {
    yukleniyor.textContent = '❌ Bağlantı hatası';
    setTimeout(balonuKaldir, 2000);
  }
}

// Başka yere tıklayınca balonu kapat
document.addEventListener('click', function(e) {
  if (!e.target.closest('.kb-balon')) {
    balonuKaldir();
  }
});
