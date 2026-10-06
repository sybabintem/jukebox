/**
 * Earth's Vitals Jukebox - Audio Sonification Engine
 * Uses Tone.js (with pure Web Audio API fallback) to translate NASA climate anomalies into sound.
 * 
 * Rules:
 * - Pitch = Temperature Anomaly (Warmer = Higher pitch, calibrated fixed scale).
 * - Brightness = Warming Rate / Intensity (Lowpass filter cutoff + resonance).
 * - Decade Sweeps = 10-year smooth audio sweeps (no harsh staccato beeps).
 * - Calibration Legend = Reference frequencies for Low, Neutral, Warm, and High benchmarks.
 * - Screen Reader Ducking = Volume dips when assistive speech occurs.
 */

export class AudioEngine {
  constructor() {
    this.isInitialized = false;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.8; // 0 to 1
    this.masterGain = null;
    this.filter = null;
    this.synth = null;
    this.audioContext = null;
    this.useToneJs = typeof window.Tone !== "undefined";
    
    // Anomaly mapping limits
    this.ANOMALY_MIN = -0.50; // °C -> maps to ~130 Hz (C3)
    this.ANOMALY_MAX = 1.60;  // °C -> maps to ~523 Hz (C5)
    this.FREQ_MIN = 130.81;   // C3 (Hz)
    this.FREQ_MAX = 523.25;   // C5 (Hz)
    this.FILTER_MIN = 500;    // Soft, mellow (Hz)
    this.FILTER_MAX = 5500;   // Bright, tense (Hz)

    this.activeVoices = [];
    this.onProgressCallback = null;
    this.onEndCallback = null;
  }

  /**
   * Initializes Audio Context on first user gesture (WCAG & browser autoplay policy).
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      if (typeof window.Tone !== "undefined") {
        await window.Tone.start();
        this.useToneJs = true;
        this.setupToneJsEngine();
      } else {
        // Robust Web Audio fallback if Tone.js is offline/unavailable
        this.setupWebAudioFallback();
      }
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn("Audio init warning:", err);
      // Fallback directly to native Web Audio
      this.setupWebAudioFallback();
      this.isInitialized = true;
      return true;
    }
  }

  setupToneJsEngine() {
    const Tone = window.Tone;
    
    // Master Limiter to avoid clipping
    this.limiter = new Tone.Limiter(-1).toDestination();

    // Master Volume node
    this.masterGain = new Tone.Volume(Tone.gainToDb(this.volume)).connect(this.limiter);

    // Warm Lowpass Filter for brightness mapping
    this.filter = new Tone.Filter({
      frequency: 1200,
      type: "lowpass",
      rolloff: -24,
      Q: 2.5
    }).connect(this.masterGain);

    // Gentle Reverb for acoustic depth
    this.reverb = new Tone.Reverb({
      decay: 1.8,
      wet: 0.18
    }).connect(this.filter);

    // FM Synth / PolySynth with warm analog triangle/sine blend
    this.synth = new Tone.PolySynth(Tone.FMSynth, {
      maxPolyphony: 4,
      voice: Tone.FMSynth,
      options: {
        harmonicity: 1.0,
        modulationIndex: 1.2,
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.18,
          decay: 0.35,
          sustain: 0.85,
          release: 0.45
        },
        modulation: { type: "triangle" },
        modulationEnvelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.6,
          release: 0.4
        }
      }
    }).connect(this.reverb);
  }

  setupWebAudioFallback() {
    this.useToneJs = false;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    
    this.nativeGain = this.audioContext.createGain();
    this.nativeGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

    this.nativeFilter = this.audioContext.createBiquadFilter();
    this.nativeFilter.type = "lowpass";
    this.nativeFilter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    this.nativeFilter.Q.setValueAtTime(2.0, this.audioContext.currentTime);

    this.nativeFilter.connect(this.nativeGain);
    this.nativeGain.connect(this.audioContext.destination);
  }

  /**
   * Converts a temperature anomaly (°C) to an exact musical frequency (Hz).
   * Monotonic, strictly fixed formula: same temperature = exact same pitch.
   */
  anomalyToFrequency(anomaly) {
    const clamped = Math.max(this.ANOMALY_MIN, Math.min(this.ANOMALY_MAX, anomaly));
    const normalized = (clamped - this.ANOMALY_MIN) / (this.ANOMALY_MAX - this.ANOMALY_MIN);
    // Exponential 2-octave span: C3 (130.81Hz) to C5 (523.25Hz)
    return this.FREQ_MIN * Math.pow(this.FREQ_MAX / this.FREQ_MIN, normalized);
  }

  /**
   * Converts anomaly & rate of change to a lowpass filter cutoff (Hz).
   * Warmer anomalies & positive acceleration produce brighter, clearer tones.
   */
  anomalyToBrightness(anomaly, rateOfChange = 0) {
    const clamped = Math.max(this.ANOMALY_MIN, Math.min(this.ANOMALY_MAX, anomaly));
    const normalized = (clamped - this.ANOMALY_MIN) / (this.ANOMALY_MAX - this.ANOMALY_MIN);
    
    // Extra boost if warming is accelerating
    const accelerationBoost = Math.max(0, rateOfChange) * 1500;
    const baseCutoff = this.FILTER_MIN + (this.FILTER_MAX - this.FILTER_MIN) * Math.pow(normalized, 1.4);
    return Math.min(7500, baseCutoff + accelerationBoost);
  }

  /**
   * Plays a calibrated reference tone for the "Listen to the Legend" feature.
   * @param {number} anomaly - Reference temperature anomaly in °C
   * @param {number} duration - Duration in seconds (e.g. 1.2s)
   */
  async playLegendReference(anomaly, duration = 1.4) {
    await this.init();
    const freq = this.anomalyToFrequency(anomaly);
    const cutoff = this.anomalyToBrightness(anomaly, 0.05);

    if (this.useToneJs && window.Tone) {
      const Tone = window.Tone;
      this.filter.frequency.rampTo(cutoff, 0.05);
      this.synth.triggerAttackRelease(freq, duration);
    } else {
      this.playNativeTone(freq, cutoff, duration);
    }
  }

  /**
   * Plays a single smooth decade sweep.
   * @param {Object} decadeData - The decade object { decade, anomaly, rateOfChange, ... }
   * @param {number} duration - Duration of sweep in seconds
   */
  async playDecadeSweep(decadeData, duration = 1.6) {
    await this.init();
    const freq = this.anomalyToFrequency(decadeData.anomaly);
    const cutoff = this.anomalyToBrightness(decadeData.anomaly, decadeData.rateOfChange);

    if (this.useToneJs && window.Tone) {
      const Tone = window.Tone;
      // Gently ramp filter brightness to match decade warming rate
      this.filter.frequency.rampTo(cutoff, 0.15);
      
      // If projection decade, add a subtle warm overtone
      if (decadeData.isProjection) {
        this.synth.triggerAttackRelease([freq, freq * 1.5], duration * 0.9);
      } else {
        // Sustained note with gentle glide
        this.synth.triggerAttackRelease(freq, duration * 0.95);
      }
    } else {
      this.playNativeTone(freq, cutoff, duration);
    }
  }

  /**
   * Native Web Audio fallback generator when Tone.js is not present
   */
  playNativeTone(freq, cutoff, duration) {
    if (!this.audioContext) return;
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    // Apply envelope
    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume * 0.4, now + 0.15);
    oscGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, now + duration - 0.25);
    oscGain.gain.linearRampToValueAtTime(0.001, now + duration);

    // Adjust native filter
    this.nativeFilter.frequency.exponentialRampToValueAtTime(
      Math.max(200, cutoff),
      now + 0.2
    );

    osc.connect(oscGain);
    oscGain.connect(this.nativeFilter);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /**
   * Dips synthesizer volume during assistive screen reader speech announcements.
   * @param {boolean} isDucked - True to duck (-12 dB), False to restore.
   */
  setDucking(isDucked) {
    if (!this.isInitialized) return;
    
    if (this.useToneJs && window.Tone && this.masterGain) {
      const Tone = window.Tone;
      const targetGain = this.isMuted ? 0 : (isDucked ? this.volume * 0.25 : this.volume);
      this.masterGain.volume.rampTo(Tone.gainToDb(Math.max(0.0001, targetGain)), 0.1);
    } else if (this.nativeGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      const targetGain = this.isMuted ? 0 : (isDucked ? this.volume * 0.25 : this.volume);
      this.nativeGain.gain.linearRampToValueAtTime(targetGain, now + 0.1);
    }
  }

  /**
   * Set playback volume (0.0 to 1.0)
   */
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.useToneJs && window.Tone && this.masterGain) {
      const Tone = window.Tone;
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.volume.rampTo(Tone.gainToDb(Math.max(0.0001, targetGain)), 0.05);
    } else if (this.nativeGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.nativeGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);
    }
  }

  /**
   * Mute / un-mute toggle
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }
}
