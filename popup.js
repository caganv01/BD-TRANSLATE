// Kelimeleri yükle ve listele
chrome.storage.sync.get(['words'], function(result) {
  const words = result.words || {};
  const entries = Object.entries(words);

  // Kelime sayısını göster
  document.getElementById('wordCount').textContent =
    entries.length + ' kelime kaydedildi';

  // Liste boşsa
  if (entries.length === 0) {
    document.getElementById('wordList').innerHTML =
      '<p style="color:#555; font-size:13px;">Henüz kelime yok.<br>Sayfalarda çift tıkla!</p>';
  } else {
    // Kelimeleri listele
    const list = document.getElementById('wordList');
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    entries.forEach(([en, tr]) => {
      const item = document.createElement('div');
      item.className = 'word-item';
      item.innerHTML = `
        <span class="word-en">${en}</span>
        <span class="word-tr">${tr}</span>
      `;
      list.appendChild(item);
    });

    // Quiz butonunu aktif et
    const quizBtn = document.getElementById('quizBtn');
    quizBtn.disabled = false;
    quizBtn.addEventListener('click', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('quiz.html') });
    });
  }

  // JSON İndir butonu
  document.getElementById('jsonIndir').addEventListener('click', function() {
    const json = JSON.stringify(words, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kelimeler.json';
    a.click();
    URL.revokeObjectURL(url);
  });
});