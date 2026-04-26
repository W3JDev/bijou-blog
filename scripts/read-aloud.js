/**
 * Bijou Read Aloud — ElevenLabs TTS streaming
 * Voice: e72XruyIrGwdOgcQqzw1
 */
(function () {
  'use strict';

  const VOICE_ID = 'e72XruyIrGwdOgcQqzw1';
  const API_KEY  = 'sk_dffe1f5bb61759fa62f6222037a01ced7cc9f4c939e71533';
  const MAX_CHARS = 4800; // ElevenLabs turbo v2_5 safe limit

  let isPlaying      = false;
  let stopRequested  = false;
  let audioCtx       = null;
  let activeSource   = null;

  /* ── Helpers ─────────────────────────────────────────────── */

  function getPostText() {
    const body = document.querySelector('.post-body');
    if (!body) return '';
    // Clone to strip hidden elements, then get clean text
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
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key':   API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.status);
      throw new Error(`ElevenLabs ${res.status}: ${errText}`);
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
