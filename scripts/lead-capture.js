/**
 * Bijou Lead Capture Widget
 * Injects a "Work with me" form after .post-article
 * POSTs to Make.com webhook
 */
(function () {
  'use strict';

  const WEBHOOK_URL = 'https://hook.eu1.make.com/w75dguyhu8vyawvkvzqr5ultn78ck3cj';

  /* ── Styles ──────────────────────────────────────────────── */

  const CSS = `
    .bijou-lead-wrap {
      max-width: 52rem;
      margin: 2rem 0 0;
    }
    .bijou-lead-form {
      background: #0d1117;
      border: 1px solid #8b5cf6;
      border-radius: 24px;
      padding: 2rem;
    }
    .bijou-lead-form h3 {
      margin: 0 0 0.35rem;
      font-size: 1.3rem;
      color: #f5f7fb;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .bijou-lead-form .blc-desc {
      color: #a9b2c7;
      font-size: 1rem;
      margin: 0 0 1.5rem;
      line-height: 1.65;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .bijou-lead-form .blc-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 600px) {
      .bijou-lead-form .blc-row { grid-template-columns: 1fr; }
    }
    .bijou-lead-form .blc-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }
    .bijou-lead-form label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #c6b5ff;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .bijou-lead-form input,
    .bijou-lead-form select,
    .bijou-lead-form textarea {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 0.72rem 1rem;
      color: #f5f7fb;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .bijou-lead-form input::placeholder,
    .bijou-lead-form textarea::placeholder {
      color: rgba(169,178,199,0.55);
    }
    .bijou-lead-form input:focus,
    .bijou-lead-form select:focus,
    .bijou-lead-form textarea:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.18);
    }
    .bijou-lead-form input.blc-error,
    .bijou-lead-form select.blc-error {
      border-color: #f87171;
    }
    .bijou-lead-form select {
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23a9b2c7' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.9rem center;
      padding-right: 2.5rem;
      cursor: pointer;
    }
    .bijou-lead-form select option { background: #0d1117; color: #f5f7fb; }
    .bijou-lead-form textarea {
      resize: vertical;
      min-height: 110px;
    }
    .blc-submit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.82rem 1.6rem;
      border-radius: 999px;
      background: linear-gradient(90deg, #8b5cf6, #a855f7);
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      box-shadow: 0 4px 18px rgba(139,92,246,0.35);
      transition: transform 0.18s ease, opacity 0.18s ease;
      margin-top: 0.5rem;
    }
    .blc-submit:hover:not(:disabled) { transform: translateY(-1px); }
    .blc-submit:disabled { opacity: 0.55; cursor: not-allowed; }
    .blc-success {
      display: none;
      background: rgba(139,92,246,0.1);
      border: 1px solid rgba(139,92,246,0.3);
      border-radius: 12px;
      padding: 0.9rem 1.2rem;
      margin-top: 1rem;
      color: #c4b5fd;
      font-weight: 600;
      font-size: 0.97rem;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .blc-success.visible { display: block; }
  `;

  function injectStyles() {
    if (document.getElementById('bijou-lead-css')) return;
    const style = document.createElement('style');
    style.id = 'bijou-lead-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Form HTML ───────────────────────────────────────────── */

  function buildForm() {
    const wrap = document.createElement('div');
    wrap.className = 'bijou-lead-wrap';
    wrap.innerHTML = `
      <div class="bijou-lead-form">
        <h3>Work with me</h3>
        <p class="blc-desc">I take 2–3 clients a month. Tell me what you need — I reply within 24 hours.</p>
        <form id="bijou-lead-capture" novalidate autocomplete="on">
          <div class="blc-row">
            <div class="blc-group">
              <label for="blc-name">Name</label>
              <input type="text" id="blc-name" name="name" autocomplete="name" placeholder="Your name" />
            </div>
            <div class="blc-group">
              <label for="blc-email">Email</label>
              <input type="email" id="blc-email" name="email" autocomplete="email" placeholder="you@example.com" />
            </div>
          </div>
          <div class="blc-group">
            <label for="blc-service">What do you need?</label>
            <select id="blc-service" name="service">
              <option value="" disabled selected>Choose a service…</option>
              <option value="F&amp;B Automation">F&amp;B Automation</option>
              <option value="AI Agent Setup">AI Agent Setup</option>
              <option value="WhatsApp Integration">WhatsApp Integration</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="blc-group">
            <label for="blc-message">Message <span style="color:#a9b2c7;font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <textarea id="blc-message" name="message" placeholder="Tell me a bit about your business and what you're trying to solve…"></textarea>
          </div>
          <button type="submit" class="blc-submit">Send message →</button>
          <div class="blc-success" id="blc-success">Got it. I'll be in touch within 24 hours. — Bijou</div>
        </form>
      </div>
    `;
    return wrap;
  }

  /* ── Submit ──────────────────────────────────────────────── */

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const nameEl    = form.querySelector('#blc-name');
    const emailEl   = form.querySelector('#blc-email');
    const serviceEl = form.querySelector('#blc-service');
    const msgEl     = form.querySelector('#blc-message');
    const btn       = form.querySelector('.blc-submit');
    const success   = document.getElementById('blc-success');

    // Clear prior errors
    [nameEl, emailEl, serviceEl].forEach(el => el.classList.remove('blc-error'));

    let valid = true;
    if (!nameEl.value.trim())    { nameEl.classList.add('blc-error');    valid = false; }
    if (!emailEl.value.trim() || !emailEl.value.includes('@')) {
      emailEl.classList.add('blc-error'); valid = false;
    }
    if (!serviceEl.value)        { serviceEl.classList.add('blc-error'); valid = false; }
    if (!valid) return;

    btn.disabled    = true;
    btn.textContent = 'Sending…';

    const payload = {
      name:      nameEl.value.trim(),
      email:     emailEl.value.trim(),
      service:   serviceEl.value,
      message:   msgEl.value.trim(),
      source:    window.location.href,
      timestamp: new Date().toISOString(),
    };

    try {
      // mode: 'no-cors' because Make.com webhooks don't return CORS headers
      await fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        mode:    'no-cors',
        body:    JSON.stringify(payload),
      });

      form.reset();
      success.classList.add('visible');
      btn.textContent = 'Sent ✓';

      setTimeout(() => {
        success.classList.remove('visible');
        btn.disabled    = false;
        btn.textContent = 'Send message →';
      }, 7000);

    } catch (err) {
      console.error('[LeadCapture]', err);
      btn.disabled    = false;
      btn.textContent = 'Try again';
    }
  }

  /* ── Init ────────────────────────────────────────────────── */

  function init() {
    if (!document.querySelector('.post-article')) return;
    if (document.querySelector('.bijou-lead-wrap')) return;

    injectStyles();

    const anchor = document.querySelector('.post-article');
    const form   = buildForm();
    anchor.insertAdjacentElement('afterend', form);

    document.getElementById('bijou-lead-capture').addEventListener('submit', handleSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
