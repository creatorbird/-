// ===== 時刻フォーマット =====
function getTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
}

// ===== テキストエリア自動リサイズ =====
const input = document.getElementById('userInput');
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

// Enterキーで送信（Shift+Enterは改行）
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ===== ローディングメッセージのサイクル =====
const loadingMessages = [
  '宇宙の真理から感謝を紡いでいます…',
  '星々の声に耳を傾けています…',
  'ネガティブを光に変換中…',
  '宇宙の愛があなたに届きます…',
];
let loadingInterval = null;

function startLoadingMessages() {
  const el = document.getElementById('loadingText');
  let i = 0;
  el.textContent = loadingMessages[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % loadingMessages.length;
    el.style.opacity = 0;
    setTimeout(() => {
      el.textContent = loadingMessages[i];
      el.style.opacity = 1;
    }, 300);
  }, 2500);

  // テキストのフェードトランジション
  el.style.transition = 'opacity 0.3s ease';
}

function stopLoadingMessages() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

// ===== ローディング表示/非表示 =====
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');
  startLoadingMessages();
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('active');
  stopLoadingMessages();
}

// ===== メッセージを画面に追加 =====
function appendMessage({ type, text, isPoem = false, isError = false }) {
  const chatBody = document.getElementById('chatBody');

  const group = document.createElement('div');
  group.className = `message-group ${type}`;

  const bubbleWrap = document.createElement('div');
  bubbleWrap.className = 'bubble-wrap';

  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (isPoem ? ' poem' : '') + (isError ? ' error' : '');
  bubble.textContent = text;

  const timestamp = document.createElement('div');
  timestamp.className = 'timestamp';
  timestamp.textContent = getTime();

  bubbleWrap.appendChild(bubble);
  bubbleWrap.appendChild(timestamp);

  if (type === 'received') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🌌';
    group.appendChild(avatar);
  }

  group.appendChild(bubbleWrap);
  chatBody.appendChild(group);

  // スクロールを最下部へ
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
}

// ===== メッセージ送信メイン処理 =====
async function sendMessage() {
  const inputEl = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const text = inputEl.value.trim();

  if (!text) return;

  // 入力欄リセット・ボタン無効化
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;

  // ユーザーのメッセージを表示
  appendMessage({ type: 'sent', text });

  // ローディング開始
  showLoading();

  try {
    const res = await fetch('/api/poem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `サーバーエラー (${res.status})`);
    }

    const data = await res.json();
    const poem = data.poem || '（詩が返ってきませんでした）';

    // ポエムを表示
    appendMessage({ type: 'received', text: poem, isPoem: true });

  } catch (err) {
    console.error(err);
    appendMessage({
      type: 'received',
      text: `⚠️ エラーが発生しました：${err.message}\n\n少し時間をおいてから再度お試しください。`,
      isError: true,
    });
  } finally {
    hideLoading();
    sendBtn.disabled = false;
    inputEl.focus();
  }
}
