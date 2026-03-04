// --- DEĞİŞKENLER ---
let words = {};        // { "apple": "elma", ... }
let quizList = [];     // karışık soru listesi
let qIdx = 0;          // mevcut soru indexi
let qCorrect = 0;      // doğru sayısı
let qAnswered = false; // bu soru cevaplandı mı?
let istatistik = {
  toplamQuiz: 0,
  enIyiSkor: 0
};

// GitHub'daki kelimeler.json adresi
const GITHUB_URL = 'https://raw.githubusercontent.com/caganv01/BD-TRANSLATE/main/kelimeler.json';

// --- BAŞLAT ---
window.addEventListener('load', () => {
  istatistikYukle();
  kelimeleriYukle();
});

// --- İSTATİSTİK ---
function istatistikYukle() {
  const kayitli = localStorage.getItem('bd_istatistik');
  if (kayitli) istatistik = JSON.parse(kayitli);
}

function istatistikKaydet() {
  localStorage.setItem('bd_istatistik', JSON.stringify(istatistik));
}

// --- KELİMELERİ YÜKLE ---
async function kelimeleriYukle() {
  ekraniGoster('loading');

  // Önce localStorage'a bak
  const kayitli = localStorage.getItem('bd_words');
  if (kayitli) {
    words = JSON.parse(kayitli);
  }

  // GitHub'dan güncelle
  try {
    const response = await fetch(GITHUB_URL + '?t=' + Date.now());
    if (response.ok) {
      const yeni = await response.json();
      words = yeni;
      localStorage.setItem('bd_words', JSON.stringify(words));
    }
  } catch(err) {
    console.log('GitHub bağlantısı yok, localStorage kullanılıyor.');
  }

  anaSayfayiGoster();
}

// --- ANA SAYFA ---
function anaSayfayiGoster() {
  const entries = Object.entries(words);

  // İstatistikler
  document.getElementById('totalWords').textContent = entries.length;
  document.getElementById('bestScore').textContent = istatistik.enIyiSkor + '%';
  document.getElementById('totalQuiz').textContent = istatistik.toplamQuiz;

  // Kelime listesi
  const list = document.getElementById('wordList');
  if (entries.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; color:#555; font-size:13px; padding:20px;">
        Henüz kelime yok.<br>Extension'dan kelime ekle!
      </div>`;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').style.opacity = '0.4';
  } else {
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').style.opacity = '1';
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    list.innerHTML = entries.map(([en, tr]) => `
      <div class="word-item">
        <span class="word-en">${guvenliyaz(en)}</span>
        <span class="word-arrow">→</span>
        <span class="word-tr">${guvenliyaz(tr)}</span>
      </div>
    `).join('');
  }

  ekraniGoster('home');
}

// --- BUTONLAR ---
document.getElementById('startBtn').addEventListener('click', quizBaslat);
document.getElementById('retryBtn').addEventListener('click', quizBaslat);
document.getElementById('homeBtn').addEventListener('click', anaSayfayiGoster);
document.getElementById('syncBtn').addEventListener('click', async () => {
  const btn = document.getElementById('syncBtn');
  btn.textContent = '⏳ Güncelleniyor...';
  btn.disabled = true;
  await kelimeleriYukle();
  btn.textContent = '🔄 Kelimeleri Güncelle';
  btn.disabled = false;
});

// --- QUİZ BAŞLAT ---
function quizBaslat() {
  const entries = Object.entries(words);
  if (entries.length === 0) return;

  // Soruları karıştır
  quizList = [...entries].sort(() => Math.random() - 0.5);
  qIdx = 0;
  qCorrect = 0;

  document.getElementById('qTotal').textContent = quizList.length;
  document.getElementById('qCorrect').textContent = '✅ 0';
  document.getElementById('qWrong').textContent = '❌ 0';

  ekraniGoster('quiz');
  soruGoster();
}

// --- SORU GÖSTER ---
function soruGoster() {
  qAnswered = false;

  const [en, tr] = quizList[qIdx];
  const progress = (qIdx / quizList.length) * 100;

  document.getElementById('qCurrent').textContent = qIdx + 1;
  document.getElementById('progressFill').style.width = progress + '%';

  // Rastgele tip seç — A: yaz, B: şık
  const tip = Math.random() > 0.5 ? 'A' : 'B';

  // Rastgele yön seç — EN→TR veya TR→EN
  const yon = Math.random() > 0.5 ? 'en-tr' : 'tr-en';

  const soru = yon === 'en-tr' ? en : tr;
  const cevap = yon === 'en-tr' ? tr : en;
  const soruTipi = yon === 'en-tr' ? '🇬🇧 Türkçeye çevir' : '🇹🇷 İngilizceye çevir';

  document.getElementById('qType').textContent = soruTipi;
  document.getElementById('qWord').textContent = soru;

  if (tip === 'A') {
    tipAGoster(cevap);
  } else {
    tipBGoster(en, tr, cevap, yon);
  }
}

// --- TİP A: YAZARAK CEVAP ---
function tipAGoster(cevap) {
  document.getElementById('typeA').classList.remove('hidden');
  document.getElementById('typeB').classList.add('hidden');

  const input = document.getElementById('answerInput');
  const feedback = document.getElementById('feedback');
  const checkBtn = document.getElementById('checkBtn');

  input.value = '';
  input.className = 'answer-input';
  input.disabled = false;
  feedback.textContent = '';
  feedback.className = 'feedback';
  checkBtn.textContent = 'Kontrol Et';

  input.focus();

  // Eski event listener'ları temizle
  const yeniCheckBtn = checkBtn.cloneNode(true);
  checkBtn.parentNode.replaceChild(yeniCheckBtn, checkBtn);

  const yeniInput = input.cloneNode(true);
  input.parentNode.replaceChild(yeniInput, input);

  yeniInput.focus();

  function kontrol() {
    if (qAnswered) {
      sonrakiSoru();
      return;
    }

    const cevapVerilen = yeniInput.value.trim();
    if (!cevapVerilen) { yeniInput.focus(); return; }

    const dogru = normaliz(cevapVerilen) === normaliz(cevap) ||
                  normaliz(cevap).includes(normaliz(cevapVerilen)) && cevapVerilen.length > 2;

    qAnswered = true;
    yeniInput.disabled = true;

    if (dogru) {
      qCorrect++;
      yeniInput.classList.add('correct');
      feedback.textContent = '✅ Doğru!';
      feedback.className = 'feedback correct';
    } else {
      yeniInput.classList.add('wrong');
      feedback.textContent = `❌ Doğrusu: ${cevap}`;
      feedback.className = 'feedback wrong';
    }

    skorGuncelle();
    yeniCheckBtn.textContent = qIdx + 1 >= quizList.length ? '🏁 Bitir' : '→ Sonraki';
  }

  yeniCheckBtn.addEventListener('click', kontrol);
  yeniInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') kontrol();
  });
}

// --- TİP B: ŞIKTAN SEÇ ---
function tipBGoster(en, tr, dogruCevap, yon) {
  document.getElementById('typeB').classList.remove('hidden');
  document.getElementById('typeA').classList.add('hidden');

  // 3 yanlış şık bul
  const diger = Object.entries(words)
    .filter(([k]) => k !== en)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(([k, v]) => yon === 'en-tr' ? v : k);

  // 4 şık: 1 doğru + 3 yanlış, karıştır
  const siklar = [dogruCevap, ...diger].sort(() => Math.random() - 0.5);

  const container = document.getElementById('choices');
  container.innerHTML = siklar.map(sik => `
    <button class="choice-btn" data-sik="${guvenliyaz(sik)}">
      ${guvenliyaz(sik)}
    </button>
  `).join('');

  container.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (qAnswered) return;
      qAnswered = true;

      const secilen = btn.dataset.sik;
      const dogru = normaliz(secilen) === normaliz(dogruCevap);

      if (dogru) {
        qCorrect++;
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
        // Doğru olanı göster
        container.querySelectorAll('.choice-btn').forEach(b => {
          if (normaliz(b.dataset.sik) === normaliz(dogruCevap)) {
            b.classList.add('correct');
          }
        });
      }

      // Tüm butonları devre dışı bırak
      container.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

      skorGuncelle();

      // 1 saniye sonra sonraki soru
      setTimeout(sonrakiSoru, 1000);
    });
  });
}

// --- SKOR GÜNCELLE ---
function skorGuncelle() {
  const yanlis = (qIdx + 1) - qCorrect;
  document.getElementById('qCorrect').textContent = `✅ ${qCorrect}`;
  document.getElementById('qWrong').textContent = `❌ ${yanlis}`;
}

// --- SONRAKİ SORU ---
function sonrakiSoru() {
  qIdx++;
  if (qIdx >= quizList.length) {
    sonuclariGoster();
  } else {
    soruGoster();
  }
}

// --- SONUÇLAR ---
function sonuclariGoster() {
  const toplam = quizList.length;
  const yanlis = toplam - qCorrect;
  const pct = Math.round((qCorrect / toplam) * 100);

  // İstatistik güncelle
  istatistik.toplamQuiz++;
  if (pct > istatistik.enIyiSkor) istatistik.enIyiSkor = pct;
  istatistikKaydet();

  // Emoji ve mesaj
  let emoji, baslik, alt;
  if (pct >= 90)      { emoji = '🏆'; baslik = 'Mükemmel!';       alt = 'Harika bir skor!'; }
  else if (pct >= 70) { emoji = '🌟'; baslik = 'Çok İyi!';        alt = 'Biraz daha pratik yap!'; }
  else if (pct >= 50) { emoji = '💪'; baslik = 'İyi İş!';         alt = 'Devam et!'; }
  else                { emoji = '📚'; baslik = 'Çalışmaya Devam!'; alt = 'Daha fazla pratik yaparsan olur!'; }

  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultTitle').textContent = baslik;
  document.getElementById('resultSub').textContent = `${qCorrect}/${toplam} doğru — ${alt}`;
  document.getElementById('rCorrect').textContent = qCorrect;
  document.getElementById('rWrong').textContent = yanlis;
  document.getElementById('rPct').textContent = pct + '%';

  ekraniGoster('result');
}

// --- YARDIMCI FONKSİYONLAR ---
function ekraniGoster(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function normaliz(s) {
  return s.trim().toLowerCase()
    .replace(/ğ/g,'g').replace(/ş/g,'s').replace(/ı/g,'i')
    .replace(/ö/g,'o').replace(/ü/g,'u').replace(/ç/g,'c');
}

function guvenliyaz(metin) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(metin));
  return div.innerHTML;
}