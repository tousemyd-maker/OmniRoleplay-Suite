// Web Audio API Sound Synthesizer & Speech Synthesis Utility

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays Airport / Hotel Chime (Ding-Dong)
 */
export function playChime(type: 'airport' | 'hotel' | 'alert' | 'success' | 'bell' = 'airport') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'airport') {
      // Classic Airport Two-Tone Chime: A5 (880Hz) -> E5 (659Hz)
      playTone(ctx, 880, now, 0.6, 0.4);
      playTone(ctx, 659, now + 0.5, 0.8, 0.4);
    } else if (type === 'hotel') {
      // High Bell: C6 (1046Hz) -> G5 (784Hz)
      playTone(ctx, 1046, now, 0.4, 0.3);
      playTone(ctx, 784, now + 0.3, 0.7, 0.3);
    } else if (type === 'alert') {
      // Warning Beep Beep
      playTone(ctx, 800, now, 0.15, 0.5, 'sawtooth');
      playTone(ctx, 800, now + 0.2, 0.15, 0.5, 'sawtooth');
      playTone(ctx, 800, now + 0.4, 0.25, 0.5, 'sawtooth');
    } else if (type === 'success') {
      // Success chord: C5 -> E5 -> G5 -> C6
      playTone(ctx, 523.25, now, 0.2, 0.3);
      playTone(ctx, 659.25, now + 0.1, 0.2, 0.3);
      playTone(ctx, 783.99, now + 0.2, 0.2, 0.3);
      playTone(ctx, 1046.50, now + 0.3, 0.5, 0.3);
    } else if (type === 'bell') {
      // Reception desk bell ring
      playTone(ctx, 2093, now, 0.8, 0.5, 'sine');
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gainValue: number,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Text to Speech PA Announcement with Chime
 */
export function speakAnnouncement(
  message: string,
  withChime: boolean = true,
  onEnd?: () => void
) {
  if (withChime) {
    playChime('airport');
  }

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in browser');
    if (onEnd) onEnd();
    return;
  }

  // Delay speech slightly to let chime play
  setTimeout(() => {
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(message);
    
    utterance.rate = 0.95; // slightly formal and clear pace
    utterance.pitch = 1.0;
    
    // Pick a good English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Male')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }, withChime ? 1100 : 0);
}

/**
 * Stop any current voice announcement
 */
export function stopAnnouncement() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
