/**
 * SIH26106 Email Threat Intelligence Platform (ETIP)
 * Interactive AI Threat Assistant Drawer Widget
 */

let chatContext = null;
let chatMessages = [];

function setChatContext(ctx) {
  chatContext = ctx;
}

function initChatWidget() {
  const panel = document.getElementById('chat-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-title-group">
        <div class="chat-bot-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
            <rect x="4" y="8" width="16" height="12" rx="2"/>
            <path d="M9 13v2M15 13v2"/>
          </svg>
        </div>
        <div>
          <div class="chat-title">SOC Cyber AI Assistant</div>
          <div class="chat-status" id="chat-model-badge">● Ready (Gemini / Heuristic)</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="toggleChat()" style="color:var(--text-low);padding:4px 8px;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="chat-messages" id="chat-msg-list">
      <div class="chat-bubble chat-bubble-bot">
        👋 <strong>Welcome Analyst.</strong> I am your AI threat intelligence assistant. Ask me questions like:
        <br>• <em>"Why is this email phishing?"</em>
        <br>• <em>"What makes the SPF header fail?"</em>
        <br>• <em>"What mitigation steps should we take?"</em>
      </div>
    </div>

    <div class="chat-suggestions" id="chat-suggestions-bar">
      <div class="chat-suggestion-chip" onclick="askPreset('Why is this email phishing?')">Why is this phishing?</div>
      <div class="chat-suggestion-chip" onclick="askPreset('Explain the risk score')">Explain risk score</div>
      <div class="chat-suggestion-chip" onclick="askPreset('What is SPF authentication?')">What is SPF?</div>
      <div class="chat-suggestion-chip" onclick="askPreset('Recommended SOC actions?')">SOC Playbook</div>
    </div>

    <form class="chat-input-area" onsubmit="handleChatSubmit(event)">
      <input type="text" id="chat-input" placeholder="Ask AI about threat indicators..." autocomplete="off" />
      <button type="submit" class="btn btn-primary btn-sm" style="padding:0 12px;">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  `;
}

function toggleChat() {
  const panel = document.getElementById('chat-panel');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (isOpen) {
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  }
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="mono" style="background:rgba(0,229,255,0.1);color:var(--cyan);padding:2px 4px;border-radius:3px;">$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n• /g, '<br>• ')
    .replace(/\n/g, '<br>');
}

function appendMessage(sender, text) {
  const list = document.getElementById('chat-msg-list');
  if (!list) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${sender}`;
  bubble.innerHTML = formatMarkdown(text);
  list.appendChild(bubble);
  list.scrollTop = list.scrollHeight;
}

function updateSuggestions(suggestions = []) {
  const bar = document.getElementById('chat-suggestions-bar');
  if (!bar) return;
  if (!suggestions || suggestions.length === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  bar.innerHTML = suggestions.map(s => `
    <div class="chat-suggestion-chip" onclick="askPreset('${escapeHtml(s)}')">${escapeHtml(s)}</div>
  `).join('');
}

async function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chat-input');
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;

  input.value = '';
  appendMessage('user', q);

  // Typing indicator
  const list = document.getElementById('chat-msg-list');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-bubble chat-bubble-bot skeleton';
  typingEl.style.width = '120px';
  typingEl.style.height = '32px';
  typingEl.id = 'chat-typing';
  list.appendChild(typingEl);
  list.scrollTop = list.scrollHeight;

  try {
    const res = await ChatAPI.ask(q, chatContext);
    const typing = document.getElementById('chat-typing');
    if (typing) typing.remove();

    appendMessage('bot', res.answer || 'Analysis generated.');
    updateSuggestions(res.suggestions || []);

    if (res.source === 'gemini_generative_ai') {
      const badge = document.getElementById('chat-model-badge');
      if (badge) badge.textContent = '● Powered by Gemini AI';
    }
  } catch (err) {
    const typing = document.getElementById('chat-typing');
    if (typing) typing.remove();
    appendMessage('bot', '⚠️ Sorry, could not generate a response. Please check your backend connection.');
  }
}

function askPreset(question) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = question;
    handleChatSubmit();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initChatWidget();
});
