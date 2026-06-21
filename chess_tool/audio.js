// audio.js
// Synthesizes sound effects using the Web Audio API to bypass static asset hosting

let audioCtx = null;

/**
 * Initializes the AudioContext on first user interaction.
 * Required by modern browsers' autoplay restrictions.
 */
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

/**
 * Plays a bright, positive synthesizer arpeggio.
 * Triangle wave: E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.50Hz)
 */
export function playSuccessChime() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [
    { freq: 659.25, duration: 0.08 },
    { freq: 783.99, duration: 0.08 },
    { freq: 1046.50, duration: 0.20 }
  ];

  let timeOffset = 0;
  notes.forEach((note) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(note.freq, now + timeOffset);

    // Initial level 0.15, smoothly ramping down
    gainNode.gain.setValueAtTime(0.15, now + timeOffset);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + note.duration + 0.05);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + note.duration + 0.05);

    timeOffset += note.duration;
  });
}

/**
 * Plays a low-frequency failure click.
 * Sine wave: 120Hz sliding down to 60Hz over 100ms.
 */
export function playFailureClick() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.10);

  gainNode.gain.setValueAtTime(0.20, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Plays a mechanical hologram boot hum.
 * Sawtooth wave swept from 100Hz to 150Hz over 400ms through a low-pass filter.
 */
export function playBootHum() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.linearRampToValueAtTime(150, now + 0.40);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(300, now);
  filter.Q.setValueAtTime(5, now);

  gainNode.gain.setValueAtTime(0.10, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.42);
}

/**
 * Plays a quick, high-pitched tactile click when hovering over interactive elements.
 * Sine wave: 800Hz decaying within 15ms.
 */
export function playHoverTick() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(850, now);

  gainNode.gain.setValueAtTime(0.03, now); // soft volume tick
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
}

/**
 * Plays a short warning alert during low time pressure in Blitz mode.
 * Triangle wave: 600Hz sliding down to 300Hz in 50ms.
 */
export function playBlitzWarningTick() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Plays a dramatic descending minor chord sweep representing game over.
 * Sawtooth wave swept over C3, Eb3, G3, C2.
 */
export function playBlitzGameOver() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const freqs = [196.00, 155.56, 130.81, 65.41]; // G3, Eb3, C3, C2
  let offset = 0;

  freqs.forEach((freq) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now + offset);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, now + offset);

    gainNode.gain.setValueAtTime(0.08, now + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.35);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.40);
    offset += 0.08;
  });
}

/**
 * Plays a bandpass-filtered noise sweep to simulate a mechanical slide opening/closing.
 * @param {boolean} isOpen - Sweep direction
 */
export function playDrawerSweep(isOpen) {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * 0.30; // 300ms
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1; // White noise
  }

  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.setValueAtTime(4, now);

  if (isOpen) {
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.28);
  } else {
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.28);
  }

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.04, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noiseNode.start(now);
  noiseNode.stop(now + 0.30);
}

/**
 * Plays an uplifting, high-juice major chord arpeggio fanfare for level completion.
 * Sine waves: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6
 */
export function playLevelVictory() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [
    { freq: 261.63, delay: 0.00, dur: 0.15 }, // C4
    { freq: 329.63, delay: 0.06, dur: 0.15 }, // E4
    { freq: 392.00, delay: 0.12, dur: 0.15 }, // G4
    { freq: 523.25, delay: 0.18, dur: 0.15 }, // C5
    { freq: 659.25, delay: 0.24, dur: 0.15 }, // E5
    { freq: 783.99, delay: 0.30, dur: 0.15 }, // G5
    { freq: 1046.50, delay: 0.36, dur: 0.50 } // C6
  ];

  notes.forEach((note) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, now + note.delay);

    gainNode.gain.setValueAtTime(0.08, now + note.delay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.dur);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now + note.delay);
    osc.stop(now + note.delay + note.dur + 0.05);
  });
}
