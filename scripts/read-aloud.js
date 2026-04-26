/**
 * Bijou Read Aloud — Deepgram Aura TTS
 * Voice: aura-asteria-en (warm, natural female)
 * Provider: Deepgram v1/speak
 */
(function () {
  'use strict';

  const DG_KEY   = 'b94de3a6d4dea130d6b39caab6af15424b6477cb';
  const DG_MODEL = 'aura-asteria-en';
  const MAX_CHARS = 5000;

  let isPlaying     = false;
  let stopRequested = false;
  let audioCtx      = null;
  let activeSource  = null;

  /* ── Helpers ─────────────────────────────────────────────── */

  function getPostText() {
    const body = document.querySelector('.post-body');
    if (!body) return '';
    const clone = body.cloneNode(true);
    clone.querySelectorAll('script, style, .bijou-lead-form').forEach(el => el.remove());
    return clone.innerText.replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
  }

  function setButtonState(btn, playing) {
    if (playing) {
      btn.innerHTML = '⏹ Stop';
      btn.style.background = 'linear-gradient(90deg, #6d28d9, #7c3aed)';
    } else {
      btn.innerHTML = '🔊 Read Aloud';
      btn.style.background = 'linear-gradient(90deg, #8b5cf6, #a855f7)';
    }
  }

  /* ── Audio ───────────────────────────────────────────────── */

  function stopAudio() {
    stopRequested = true;
    if (activeSource) {
      try { activeSource.stop(); } catch (_) {}
      activeSource = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch (_) {}
      audioCtx = null;
    }
    isPlaying = false;
    const btn = document.getElementById('bijou-read-aloud');
    if (btn) setButtonState(btn, false);
  }

  async function streamAudio(text) {
    const url = `https://api.deepgram.com/v1/speak?model=${DG_MODEL}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DG_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.status);
      throw new Error(`Deepgram ${res.status}: ${errText}`);
    }

    if (stopRequested) return;

    const arrayBuffer = await res.arrayBuffer();
    if (stopRequested) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    if (stopRequested) return;

    activeSource = audioCtx.createBufferSource();
    activeSource.buffer = audioBuffer;
    activeSource.connect(audioCtx.destination);

    activeSource.onended = () => {
      if (!stopRequested) {
        isPlaying = false;
        activeSource = null;
        const btn = document.getElementById('bijou-read-aloud');
        if (btn) setButtonState(btn, false);
      }
    };

    activeSource.start(0);
  }

  /* ── Click handler ───────────────────────────────────────── */

  async function handleClick() {
    const btn = document.getElementById('bijou-read-aloud');

    if (isPlaying) {
      stopAudio();
      return;
    }

    const text = getPostText();
    if (!text) return;

    isPlaying     = true;
    stopRequested = false;
    setButtonState(btn, true);

    try {
      await streamAudio(text);
    } catch (err) {
      console.error('[ReadAloud]', err);
      isPlaying = false;
      setButtonState(btn, false);
      alert('Read aloud failed: ' + err.message);
    }
  }

  /* ── DOM injection ───────────────────────────────────────── */

  function injectButton() {
    if (!document.querySelector('.post-body')) return; // posts only
    if (document.getElementById('bijou-read-aloud')) return;

    const btn = document.createElement('button');
    btn.id = 'bijou-read-aloud';
    btn.setAttribute('aria-label', 'Read this post aloud');
    btn.innerHTML = '🔊 Read Aloud';

    Object.assign(btn.style, {
      position:    'fixed',
      bottom:      '1.5rem',
      right:       '1.5rem',
      zIndex:      '9000',
      background:  'linear-gradient(90deg, #8b5cf6, #a855f7)',
      color:       '#fff',
      border:      'none',
      borderRadius:'999px',
      padding:     '0.7rem 1.25rem',
      fontFamily:  'Inter, system-ui, sans-serif',
      fontSize:    '0.88rem',
      fontWeight:  '700',
      cursor:      'pointer',
      boxShadow:   '0 4px 24px rgba(139,92,246,0.45)',
      transition:  'transform 0.18s ease, background 0.18s ease',
      display:     'flex',
      alignItems:  'center',
      gap:         '0.4rem',
      lineHeight:  '1',
      whiteSpace:  'nowrap',
    });

    btn.addEventListener('mouseenter', () => { if (!isPlaying) btn.style.transform = 'translateY(-2px)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translateY(0)'; });
    btn.addEventListener('click', handleClick);

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();
