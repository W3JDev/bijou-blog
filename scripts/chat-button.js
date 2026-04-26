/**
 * Bijou "Chat with Bijou" floating Telegram button
 * Injects bottom-left, purple circle with 💬 icon
 */
(function () {
  'use strict';

  const TELEGRAM_URL = 'https://t.me/w3j_bijou';

  const CSS = `
    #bijou-chat-btn {
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      z-index: 9000;
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 24px rgba(139,92,246,0.5);
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      border: none;
      outline: none;
    }
    #bijou-chat-btn:hover {
      transform: translateY(-3px) scale(1.06);
      box-shadow: 0 8px 32px rgba(139,92,246,0.6);
    }
    #bijou-chat-tooltip {
      position: fixed;
      bottom: 5.2rem;
      left: 1.5rem;
      z-index: 9001;
      background: rgba(13,17,23,0.96);
      border: 1px solid rgba(139,92,246,0.35);
      color: #f5f7fb;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.18s ease, transform 0.18s ease;
      letter-spacing: 0.01em;
    }
    #bijou-chat-btn:hover ~ #bijou-chat-tooltip,
    #bijou-chat-btn:focus ~ #bijou-chat-tooltip {
      opacity: 1;
      transform: translateY(0);
    }
    /* Wrapper for hover coupling */
    #bijou-chat-wrap {
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    #bijou-chat-wrap:hover #bijou-chat-tooltip,
    #bijou-chat-wrap:focus-within #bijou-chat-tooltip {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  function injectStyles() {
    if (document.getElementById('bijou-chat-css')) return;
    const style = document.createElement('style');
    style.id = 'bijou-chat-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function injectButton() {
    if (document.getElementById('bijou-chat-wrap')) return;
    injectStyles();

    const wrap = document.createElement('div');
    wrap.id = 'bijou-chat-wrap';

    wrap.innerHTML = `
      <a
        id="bijou-chat-btn"
        href="${TELEGRAM_URL}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Bijou on Telegram"
      >💬</a>
      <div id="bijou-chat-tooltip">Chat with Bijou</div>
    `;

    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
