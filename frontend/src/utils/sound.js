// Subtle, synthesized sound effects for button clicks and carousel swipes.
// Generated entirely in the browser via the Web Audio API (filtered noise
// bursts, tuned to sound like a soft leaf rustle) — no audio files to host,
// and nothing plays until the user has already interacted with the page
// (required by browser autoplay policy anyway).

let ctx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A short burst of filtered noise, shaped with an envelope, mimicking a
// soft leaf/paper rustle. `duration` in seconds, `freq` = filter center Hz.
function rustle({ duration = 0.09, freq = 2200, sweepTo = null, gain = 0.05 }) {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const sampleCount = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
  filter.Q.value = 0.9;
  if (sweepTo) {
    filter.frequency.linearRampToValueAtTime(sweepTo, audioCtx.currentTime + duration);
  }

  const env = audioCtx.createGain();
  env.gain.setValueAtTime(0, audioCtx.currentTime);
  env.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + duration * 0.15);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  source.connect(filter).connect(env).connect(audioCtx.destination);
  source.start();
  source.stop(audioCtx.currentTime + duration + 0.02);
}

// Respect a simple on/off preference so people who find it distracting can
// turn it off; stored so the choice persists across visits.
export function isSoundEnabled() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("alexagro_sound") !== "off";
}

export function setSoundEnabled(enabled) {
  localStorage.setItem("alexagro_sound", enabled ? "on" : "off");
}

export function playClickSound() {
  if (!isSoundEnabled()) return;
  try {
    rustle({ duration: 0.07, freq: 2600, gain: 0.045 });
  } catch (e) {
    // Audio is a nice-to-have; never let it break the UI.
  }
}

export function playSwipeSound() {
  if (!isSoundEnabled()) return;
  try {
    rustle({ duration: 0.18, freq: 1800, sweepTo: 900, gain: 0.05 });
  } catch (e) {
    // ignore
  }
}
