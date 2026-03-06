// --- DEĞİŞKENLER ---
let words = {};
let quizList = [];
let qIdx = 0;
let qCorrect = 0;
let qAnswered = false;
let istatistik = {
  toplamQuiz: 0,
  enIyiSkor: 0
};

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

  const kayitli = localStorage.getItem('bd_words');
  if (kayitli) words = JSON.parse(kayitli);

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

  document.getElementById('totalWords').textContent = entries.length;
  document.getElementById('bestScore').textContent = istatistik.enIyiSkor + '%';
  document.getElementById('totalQuiz').textContent = istatistik.toplamQuiz;

  if (entries.length === 0) {
    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').style.opacity = '0.4';
  } else {
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').style.opacity = '1';
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

  // Rastgele yön — EN→TR veya TR→EN
  const yon = Math.random() > 0.5 ? 'en-tr' : 'tr-en';
  const soru = yon === 'en-tr' ? en : tr;
  const cevap = yon === 'en-tr' ? tr : en;
  const soruTipi = yon === 'en-tr' ? '🇬🇧 Türkçeye çevir' : '🇹🇷 İngilizceye çevir';

  document.getElementById('qType').textContent = soruTipi;
  document.getElementById('qWord').textContent = soru;

  tipAGoster(cevap);
}

// --- YAZARAK CEVAP ---
function tipAGoster(cevap) {
  const input = document.getElementById('answerInput');
  const feedback = document.getElementById('feedback');
  const checkBtn = document.getElementById('checkBtn');

  input.value = '';
  input.className = 'answer-input';
  input.disabled = false;
  feedback.textContent = '';
  feedback.className = 'feedback';
  checkBtn.textContent = 'Kontrol Et';

  // Eski event listener'ları temizle
  const yeniBtn = checkBtn.cloneNode(true);
  checkBtn.parentNode.replaceChild(yeniBtn, checkBtn);
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
    yeniBtn.textContent = qIdx + 1 >= quizList.length ? '🏁 Bitir' : '→ Sonraki';
  }

  yeniBtn.addEventListener('click', kontrol);
  yeniInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') kontrol();
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

  istatistik.toplamQuiz++;
  if (pct > istatistik.enIyiSkor) istatistik.enIyiSkor = pct;
  istatistikKaydet();

  let emoji, baslik, alt;
  if (pct >= 90)      { emoji = '🏆'; baslik = 'Mükemmel!';        alt = 'Harika bir skor!'; }
  else if (pct >= 70) { emoji = '🌟'; baslik = 'Çok İyi!';         alt = 'Biraz daha pratik yap!'; }
  else if (pct >= 50) { emoji = '💪'; baslik = 'İyi İş!';          alt = 'Devam et!'; }
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