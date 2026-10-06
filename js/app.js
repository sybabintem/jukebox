/**
 * Earth's Vitals Jukebox - Main Application Bootstrap
 * Team CosmoCode - NASA Space Apps Challenge 2026
 */

import { AudioEngine } from './audio-engine.js';
import { SpeechNarrator } from './speech-narrator.js';
import { GibsRenderer } from './gibs-renderer.js';
import { JukeboxUI } from './jukebox-ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const statusAnnounce = document.getElementById('statusAnnounce');
  const captionStrip = document.getElementById('liveCaptionStrip');
  const gibsContainer = document.getElementById('gibsFrameContainer');

  // Instantiate Subsystems
  const audioEngine = new AudioEngine();
  const speechNarrator = new SpeechNarrator(audioEngine, statusAnnounce, captionStrip);
  const gibsRenderer = new GibsRenderer(gibsContainer);

  // Instantiate UI Master Controller
  const jukeboxUI = new JukeboxUI(audioEngine, speechNarrator, gibsRenderer);
  jukeboxUI.init();

  console.log("Earth's Vitals Jukebox initialized successfully.");
});
