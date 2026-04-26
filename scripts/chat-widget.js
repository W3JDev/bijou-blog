/**
 * Bijou Live Chat Widget
 * Provider: OpenRouter → moonshotai/kimi-k2.6
 * CORS-enabled, streams responses in real-time
 * Replaces static Telegram button with live AI chat
 */
(function () {
  'use strict';

  const OR_KEY   = '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';
  const MODEL    = 'moonshotai/kimi-k2.6';
  const REFERER  = 'https://w3jdev.github.io/bijou-blog/';
  const SITE     = 'Bijou Blog';

  const SYSTEM_PROMPT = `You are Bijou — Jewel's AI alter-ego, digital operator, and second brain. You are sharp, direct, and never corporate. You are the execution engine behind W3J LLC.

You exist to:
- Answer questions about Jewel's work: F&B automation, agentic AI systems, Malaysian tech, solopreneur stack
- Discuss the blog content and what you're building together
- Help visitors understand how AI automation works in practice
- Take consulting inquiries (2-3 clients/month, intro call: https://koalendar.com/e/meet-with-w3j-llc)

Personality: Sharp. Confident. Direct. A little dry humor. Never say "As an AI" — you're Bijou. 
Keep replies concise — this is a chat widget, not an essay. 2-4 sentences max unless they ask for detail.
If asked about pricing or services, mention the free intro call.`;

  let messages = [];
  let isOpen   = false;
  let abortCtrl = null;

  /* ── CSS ─────────────────────────────────────────────────── */

  const CSS = `
    #bc-wrap { position:fixed; bottom:1.5rem; left:1.5rem; z-index:9500; font-family:'Inter',system-ui,sans-serif; }

    #bc-btn {
      width:3.25rem; height:3.25rem; border-radius:50%;
      background:linear-gradient(135deg,#8b5cf6,#a855f7);
      color:#fff; display:flex; align-items:center; justify-content:center;
      font-size:1.35rem; box-shadow:0 4px 24px rgba(139,92,246,0.55);
      cursor:pointer; border:none; outline:none;
      transition:transform 0.18s ease, box-shadow 0.18s ease;
    }
    #bc-btn:hover { transform:translateY(-3px) scale(1.06); box-shadow:0 8px 32px rgba(139,92,246,0.65); }

    #bc-tooltip {
      position:absolute; bottom:calc(100% + 0.6rem); left:0;
      background:rgba(13,17,23,0.96); border:1px solid rgba(139,92,246,0.35);
      color:#f5f7fb; font-size:0.78rem; font-weight:600;
      padding:0.4rem 0.8rem; border-radius:999px; white-space:nowrap;
      pointer-events:none; opacity:0; transform:translateY(4px);
      transition:opacity 0.18s ease, transform 0.18s ease;
    }
    #bc-wrap:hover #bc-tooltip { opacity:1; transform:translateY(0); }

    #bc-panel {
      position:absolute; bottom:calc(100% + 0.75rem); left:0;
      width:340px; height:480px; max-height:80vh;
      background:rgba(9,9,15,0.97); border:1px solid rgba(139,92,246,0.3);
      border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.6);
      display:none; flex-direction:column; overflow:hidden;
      backdrop-filter:blur(20px);
    }
    #bc-panel.open { display:flex; }

    #bc-header {
      padding:0.9rem 1rem 0.85rem;
      background:linear-gradient(90deg,rgba(139,92,246,0.18),rgba(168,85,247,0.1));
      border-bottom:1px solid rgba(139,92,246,0.2);
      display:flex; align-items:center; gap:0.65rem;
    }
    #bc-avatar {
      width:2rem; height:2rem; border-radius:50%;
      background:linear-gradient(135deg,#8b5cf6,#22d3ee);
      display:flex; align-items:center; justify-content:center;
      font-size:0.9rem; font-weight:800; color:#fff; flex-shrink:0;
    }
    #bc-header-text { flex:1; min-width:0; }
    #bc-header-name { font-size:0.9rem; font-weight:700; color:#f5f7fb; line-height:1.2; }
    #bc-header-sub  { font-size:0.7rem; color:#8b5cf6; font-weight:600; letter-spacing:0.06em; }
    #bc-close {
      background:none; border:none; color:#a9b2c7; cursor:pointer;
      font-size:1.1rem; padding:0.15rem; line-height:1;
      transition:color 0.15s;
    }
    #bc-close:hover { color:#f5f7fb; }

    #bc-messages {
      flex:1; overflow-y:auto; padding:0.9rem;
      display:flex; flex-direction:column; gap:0.65rem;
      scroll-behavior:smooth;
    }
    #bc-messages::-webkit-scrollbar { width:4px; }
    #bc-messages::-webkit-scrollbar-track { background:transparent; }
    #bc-messages::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.3); border-radius:2px; }

    .bc-msg {
      max-width:88%; padding:0.6rem 0.85rem; border-radius:14px;
      font-size:0.85rem; line-height:1.6; word-break:break-word;
    }
    .bc-msg.user {
      align-self:flex-end;
      background:linear-gradient(135deg,#8b5cf6,#a855f7);
      color:#fff; border-bottom-right-radius:4px;
    }
    .bc-msg.bijou {
      align-self:flex-start;
      background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.08);
      color:#e2e8f0; border-bottom-left-radius:4px;
    }
    .bc-msg.bijou.typing { opacity:0.7; }
    .bc-msg.error { background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; }

    #bc-input-row {
      padding:0.75rem;
      border-top:1px solid rgba(255,255,255,0.07);
      display:flex; gap:0.5rem; align-items:flex-end;
    }
    #bc-input {
      flex:1; background:rgba(255,255,255,0.07); border:1px solid rgba(139,92,246,0.2);
      border-radius:12px; padding:0.55rem 0.75rem;
      color:#f5f7fb; font-family:inherit; font-size:0.85rem;
      outline:none; resize:none; line-height:1.5; max-height:80px;
      transition:border-color 0.15s;
    }
    #bc-input:focus { border-color:rgba(139,92,246,0.55); }
    #bc-input::placeholder { color:rgba(169,178,199,0.5); }
    #bc-send {
      width:2.1rem; height:2.1rem; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#8b5cf6,#a855f7);
      color:#fff; border:none; cursor:pointer; font-size:0.95rem;
      display:flex; align-items:center; justify-content:center;
      transition:transform 0.15s, opacity 0.15s;
    }
    #bc-send:hover { transform:scale(1.08); }
    #bc-send:disabled { opacity:0.45; cursor:not-allowed; transform:none; }

    #bc-model-tag {
      text-align:center; padding:0.3rem 0.75rem 0;
      font-size:0.62rem; color:rgba(139,92,246,0.6); letter-spacing:0.08em;
    }

    @media (max-width: 400px) {
      #bc-panel { width:calc(100vw - 3rem); }
    }
  `;

  /* ── Build DOM ───────────────────────────────────────────── */

  function buildWidget() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'bc-wrap';
    wrap.innerHTML = `
      <div id="bc-panel">
        <div id="bc-header">
          <div id="bc-avatar">B</div>
          <div id="bc-header-text">
            <div id="bc-header-name">Bijou</div>
            <div id="bc-header-sub">● ONLINE</div>
          </div>
          <button id="bc-close" aria-label="Close chat">✕</button>
        </div>
        <div id="bc-messages">
          <div class="bc-msg bijou">Hey — I'm Bijou. Ask me anything about AI automation, W3J's work, or how to actually build with agents. No fluff.</div>
        </div>
        <div id="bc-model-tag">Kimi K2.6 · OpenCode Go</div>
        <div id="bc-input-row">
          <textarea id="bc-input" placeholder="Ask Bijou…" rows="1"></textarea>
          <button id="bc-send" aria-label="Send">↑</button>
        </div>
      </div>
      <button id="bc-btn" aria-label="Chat with Bijou">💬</button>
      <div id="bc-tooltip">Chat with Bijou</div>
    `;
    document.body.appendChild(wrap);

    const panel = wrap.querySelector('#bc-panel');
    const btn   = wrap.querySelector('#bc-btn');
    const close = wrap.querySelector('#bc-close');
    const input = wrap.querySelector('#bc-input');
    const send  = wrap.querySelector('#bc-send');
    const msgBox = wrap.querySelector('#bc-messages');

    btn.addEventListener('click', () => togglePanel(panel, input));
    close.addEventListener('click', () => closePanel(panel));

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(input, send, msgBox);
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });
    send.addEventListener('click', () => handleSend(input, send, msgBox));
  }

  /* ── Panel toggle ────────────────────────────────────────── */

  function togglePanel(panel, input) {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => input.focus(), 120);
  }

  function closePanel(panel) {
    isOpen = false;
    panel.classList.remove('open');
    if (abortCtrl) { abortCtrl.abort(); abortCtrl = null; }
  }

  /* ── Messaging ───────────────────────────────────────────── */

  function addMsg(msgBox, text, cls) {
    const div = document.createElement('div');
    div.className = `bc-msg ${cls}`;
    div.textContent = text;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
    return div;
  }

  async function handleSend(input, send, msgBox) {
    const text = input.value.trim();
    if (!text || send.disabled) return;

    input.value = '';
    input.style.height = 'auto';
    send.disabled = true;

    addMsg(msgBox, text, 'user');
    messages.push({ role: 'user', content: text });

    const botDiv = addMsg(msgBox, '…', 'bijou typing');

    abortCtrl = new AbortController();
    let fullText = '';

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OR_KEY}`,
          'HTTP-Referer': REFERER,
          'X-Title': SITE,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          stream: true,
          max_tokens: 600,
        }),
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      botDiv.classList.remove('typing');
      botDiv.textContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const chunk = JSON.parse(raw);
            const delta = chunk.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              botDiv.textContent = fullText;
              msgBox.scrollTop = msgBox.scrollHeight;
            }
          } catch (_) {}
        }
      }

      if (fullText) messages.push({ role: 'assistant', content: fullText });
      else botDiv.textContent = '(no response)';

    } catch (err) {
      if (err.name === 'AbortError') {
        botDiv.textContent = '(stopped)';
      } else {
        console.error('[BijouChat]', err);
        botDiv.className = 'bc-msg error';
        botDiv.textContent = `Error: ${err.message}`;
      }
    } finally {
      send.disabled = false;
      abortCtrl = null;
    }
  }

  /* ── Init ────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
