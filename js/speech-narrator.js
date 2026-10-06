/**
 * Earth's Vitals Jukebox - Speech & Accessibility Narrator
 * Coordinates screen reader ARIA announcements, optional Web Speech API vocalization,
 * and audio ducking so assistive speech never clashes with sonified music.
 */

export class SpeechNarrator {
  constructor(audioEngine, ariaLiveElement, captionElement) {
    this.audioEngine = audioEngine;
    this.ariaLiveElement = ariaLiveElement;
    this.captionElement = captionElement;
    this.speechEnabled = false; // Optional vocal speech synthesis
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.pauseMode = "duck"; // "duck" or "pause"
  }

  /**
   * Sets spoken speech synthesis on/off
   */
  setSpeechEnabled(enabled) {
    this.speechEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
      this.audioEngine.setDucking(false);
    }
  }

  /**
   * Formats a clean verbal announcement for a given decade
   */
  formatDecadeAnnouncement(decadeData, trackTitle) {
    const sign = decadeData.anomaly >= 0 ? "plus" : "minus";
    const absVal = Math.abs(decadeData.anomaly).toFixed(2);
    const prefix = decadeData.isProjection ? "Extrapolated projection: " : "Now playing: ";
    
    return `${prefix}${decadeData.decade}. Average anomaly: ${sign} ${absVal} degrees Celsius. ${decadeData.summary}`;
  }

  /**
   * Announce a decade via ARIA live region, plain-text captions, and optional voice.
   * Ducks or pauses the synthesizer while vocalizing.
   */
  announce(decadeData, trackTitle = "") {
    const text = this.formatDecadeAnnouncement(decadeData, trackTitle);

    // 1. Update Screen Reader ARIA Live Region
    if (this.ariaLiveElement) {
      this.ariaLiveElement.textContent = text;
    }

    // 2. Update High-Contrast Visual Plain-Text Captions
    if (this.captionElement) {
      this.captionElement.innerHTML = `
        <span class="caption-tag ${decadeData.isProjection ? 'projection' : ''}">${decadeData.decade}</span>
        <span class="caption-metric">${decadeData.anomaly >= 0 ? '+' : ''}${decadeData.anomaly.toFixed(2)}°C</span>
        <span class="caption-text">${decadeData.summary}</span>
      `;
    }

    // 3. Optional Voice Synthesis with Audio Ducking
    if (this.speechEnabled && this.synth) {
      this.synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      
      // Duck synthesizer audio while voice is speaking
      this.audioEngine.setDucking(true);

      utterance.onend = () => {
        this.audioEngine.setDucking(false);
      };

      utterance.onerror = () => {
        this.audioEngine.setDucking(false);
      };

      this.synth.speak(utterance);
    }
  }

  /**
   * Quick announcement for general status updates (e.g. track changed, legend triggered)
   */
  announceMessage(message) {
    if (this.ariaLiveElement) {
      this.ariaLiveElement.textContent = message;
    }
    if (this.captionElement) {
      this.captionElement.innerHTML = `<span class="caption-notice">${message}</span>`;
    }
    if (this.speechEnabled && this.synth) {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      this.synth.speak(utterance);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.audioEngine.setDucking(false);
  }
}
