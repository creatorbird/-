function getTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}
const input = document.getElementById('userInput');
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
const loadingMessages = ['宇宙の真理から感謝を紡いでいます…','星々の声に耳を傾けています…','ネガティブを光に変換中…','宇宙の愛があなたに届きます…'];
let loadingInterval = null;
function startLoadingMessages() {
  const el = document.getElementById('loadingText');
  let i = 0; el.textContent = loadingMessages[0];
  el.style.transition = 'opacity 0.3s ease';
  loadingInterval = setInterval(() => {
    i = (i + 1) % loadingMessages.length;
    el.style.opacity = 0;
    setTimeout(() => { el.textContent = loadingMessages[i]; el.style.opacity = 1; }, 300);
  }, 2500);
}
function stopLoadingMessages() { if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; } }
function showLoading() { document.getElementById('loadingOverlay').classList.add('active'); startLoadingMessages(); }
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('active'); stopLoadingMessages(); }
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
    avatar.className = 'avatar'; avatar.textContent = '🌌';
    group.appendChild(avatar);
  }
  group.appendChild(bubbleWrap);
  chatBody.appendChild(group);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
}
async function sendMessage() {
  const inputEl = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = ''; inputEl.style.height = 'auto'; sendBtn.disabled = true;
  appendMessage({ type: 'sent', text });
  showLoading();
  try {
    const res = await fetch('/api/poem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `サーバーエラー (${res.status})`); }
    const data = await res.json();
    appendMessage({ type: 'received', text: data.poem || '（詩が返ってきませんでした）', isPoem: true });
  } catch (err) {
    appendMessage({ type: 'received', text: `⚠️ エラー：${err.message}`, isError: true });
  } finally {
    hideLoading(); sendBtn.disabled = false; inputEl.focus();
  }
}
