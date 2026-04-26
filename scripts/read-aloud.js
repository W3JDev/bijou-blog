/**
 * Bijou Read Aloud — Gemini 2.5 Flash TTS
 * Voice: Charon (deep, confident)
 * Provider: Google Generative Language API
 * Audio: PCM L16 @ 24000 Hz → Web Audio API
 */
(function () {
  'use strict';

  const GEMINI_KEY  = 'AIzaSyDUKb37oHGJCsqF-0Znd7P9wlaa_eu8opw';
  const GEMINI_MODEL = 'gemini-2.5-flash-preview-tts';
  const VOICE       = 'Charon'; // deep, confident — fits Bijou
  const SAMPLE_RATE = 24000;
  const MAX_CHARS   = 4800;

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

  function setButtonState(btn, playing, loading) {
    if (loading) {
      btn.innerHTML = '⏳ Loading…';
      btn.style.background = 'linear-gradient(90deg, #4c1d95, #5b21b6)';
    } else if (playing) {
      btn.innerHTML = '⏹ Stop';
      btn.style.background = 'linear-gradient(90deg, #6d28d9, #7c3aed)';
    } else {
      btn.innerHTML = '🔊 Read Aloud';
      btn.style.background = 'linear-gradient(90deg, #8b5cf6, #a855f7)';
    }
  }

  /* ── Audio stop ──────────────────────────────────────────── */

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
    if (btn) setButtonState(btn, false, false);
  }

  /* ── Base64 → PCM → AudioBuffer ──────────────────────────── */

  function base64ToFloat32(b64, sampleRate) {
    const binary = atob(b64);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // L16 = signed 16-bit little-endian PCM
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
    return float32;
  }

  /* ── Fetch + play ────────────────────────────────────────── */

  async function playText(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Say exactly this text naturally, no additions: ${text}` }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini TTS ${res.status}: ${err?.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
    if (!audioPart) throw new Error('No audio in Gemini response');

    if (stopRequested) return;

    const float32 = base64ToFloat32(audioPart.inlineData.data, SAMPLE_RATE);

    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    const audioBuffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
    audioBuffer.copyToChannel(float32, 0);

    if (stopRequested) return;

    activeSource = audioCtx.createBufferSource();
    activeSource.buffer = audioBuffer;
    activeSource.connect(audioCtx.destination);

    activeSource.onended = () => {
      if (!stopRequested) {
        isPlaying = false;
        activeSource = null;
        const btn = document.getElementById('bijou-read-aloud');
        if (btn) setButtonState(btn, false, false);
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
    setButtonState(btn, false, true); // loading state

    try {
      await playText(text);
      if (!stopRequested) setButtonState(btn, true, false);
    } catch (err) {
      console.error('[ReadAloud]', err);
      isPlaying = false;
      setButtonState(btn, false, false);
    }
  }

  /* ── DOM injection ───────────────────────────────────────── */

  function injectButton() {
    if (!document.querySelector('.post-body')) return;
    if (document.getElementById('bijou-read-aloud')) return;

    const btn = document.createElement('button');
    btn.id = 'bijou-read-aloud';
    btn.setAttribute('aria-label', 'Read this post aloud');
    btn.innerHTML = '🔊 Read Aloud';

    Object.assign(btn.style, {
      position:     'fixed',
      bottom:       '1.5rem',
      right:        '1.5rem',
      zIndex:       '9000',
      background:   'linear-gradient(90deg, #8b5cf6, #a855f7)',
      color:        '#fff',
      border:       'none',
      borderRadius: '999px',
      padding:      '0.7rem 1.25rem',
      fontFamily:   'Inter, system-ui, sans-serif',
      fontSize:     '0.88rem',
      fontWeight:   '700',
      cursor:       'pointer',
      boxShadow:    '0 4px 24px rgba(139,92,246,0.45)',
      transition:   'transform 0.18s ease, background 0.18s ease',
      display:      'flex',
      alignItems:   'center',
      gap:          '0.4rem',
      lineHeight:   '1',
      whiteSpace:   'nowrap',
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
