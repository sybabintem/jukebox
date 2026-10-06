/**
 * Earth's Vitals Jukebox - Main UI & Interaction Controller
 * Handles track switching, playback scheduling, keyboard shortcuts,
 * modal dialogs, and accessible DOM synchronization.
 */

import { GISTEMP_GLOBAL_DATA } from './data/gistemp-global.js';
import { GISTEMP_HIMALAYA_DATA } from './data/gistemp-himalaya.js';

export class JukeboxUI {
  constructor(audioEngine, speechNarrator, gibsRenderer) {
    this.audio = audioEngine;
    this.narrator = speechNarrator;
    this.gibs = gibsRenderer;

    this.currentTrackId = 'global-temp';
    this.currentDecadeIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.includeProjection = false;

    // Cache DOM Elements
    this.dom = {
      playPauseBtn: document.getElementById('playPauseBtn'),
      prevDecadeBtn: document.getElementById('prevDecadeBtn'),
      nextDecadeBtn: document.getElementById('nextDecadeBtn'),
      trackButtons: document.querySelectorAll('.track-select-btn'),
      trackTitle: document.getElementById('trackTitle'),
      trackSubtitle: document.getElementById('trackSubtitle'),
      trackDescription: document.getElementById('trackDescription'),
      langtangBanner: document.getElementById('langtangBanner'),
      projectionToggleWrapper: document.getElementById('projectionToggleWrapper'),
      projectionToggle: document.getElementById('projectionToggle'),
      progressBar: document.getElementById('playbackProgress'),
      decadeIndicator: document.getElementById('currentDecadeLabel'),
      anomalyPill: document.getElementById('currentAnomalyLabel'),
      timelineContainer: document.getElementById('decadeTimeline'),
      legendModal: document.getElementById('legendModal'),
      tableModal: document.getElementById('tableModal'),
      limitsModal: document.getElementById('limitsModal'),
      mobileModal: document.getElementById('mobileModal'),
      openLegendBtn: document.getElementById('openLegendBtn'),
      openTableBtn: document.getElementById('openTableBtn'),
      openLimitsBtn: document.getElementById('openLimitsBtn'),
      openMobileBtn: document.getElementById('openMobileBtn'),
      closeModalBtns: document.querySelectorAll('.close-modal-btn'),
      speechToggle: document.getElementById('speechToggle'),
      muteToggle: document.getElementById('muteToggle'),
      volumeSlider: document.getElementById('volumeSlider'),
      statusAnnounce: document.getElementById('statusAnnounce'),
      captionStrip: document.getElementById('liveCaptionStrip'),
      dataTableBody: document.getElementById('dataTableBody')
    };

    this.activeModal = null;
  }

  init() {
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.loadTrack('global-temp');
    this.renderDataTable();
  }

  getCurrentDataset() {
    return this.currentTrackId === 'global-temp' 
      ? GISTEMP_GLOBAL_DATA 
      : GISTEMP_HIMALAYA_DATA;
  }

  getActiveDecades() {
    const dataset = this.getCurrentDataset();
    const decades = [...dataset.decades];
    if (this.currentTrackId === 'global-temp' && this.includeProjection && dataset.projectionDecade) {
      decades.push(dataset.projectionDecade);
    }
    return decades;
  }

  loadTrack(trackId) {
    this.stopPlayback();
    this.currentTrackId = trackId;
    this.currentDecadeIndex = 0;

    const dataset = this.getCurrentDataset();

    // Update Header and Context Panels
    if (this.dom.trackTitle) this.dom.trackTitle.textContent = dataset.title;
    if (this.dom.trackSubtitle) this.dom.trackSubtitle.textContent = dataset.subtitle;
    if (this.dom.trackDescription) this.dom.trackDescription.textContent = dataset.description;

    // Show/Hide Langtang Context & Projection Toggle
    if (this.dom.langtangBanner) {
      if (trackId === 'himalaya-temp') {
        this.dom.langtangBanner.style.display = 'block';
        this.dom.langtangBanner.setAttribute('aria-hidden', 'false');
      } else {
        this.dom.langtangBanner.style.display = 'none';
        this.dom.langtangBanner.setAttribute('aria-hidden', 'true');
      }
    }

    if (this.dom.projectionToggleWrapper) {
      this.dom.projectionToggleWrapper.style.display = trackId === 'global-temp' ? 'inline-flex' : 'none';
    }

    // Update Track Selection Buttons UI
    this.dom.trackButtons.forEach(btn => {
      const isSelected = btn.getAttribute('data-track') === trackId;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.classList.toggle('active', isSelected);
    });

    this.renderTimeline();
    this.updateDecadeView(0);
    this.renderDataTable();
    this.narrator.announceMessage(`Loaded ${dataset.title}. Press Space to start playing.`);
  }

  renderTimeline() {
    if (!this.dom.timelineContainer) return;
    const decades = this.getActiveDecades();
    this.dom.timelineContainer.innerHTML = '';

    decades.forEach((dec, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `timeline-chip ${dec.isProjection ? 'projection-chip' : ''}`;
      btn.setAttribute('aria-label', `${dec.decade}, anomaly ${dec.anomaly >= 0 ? '+' : ''}${dec.anomaly.toFixed(2)}°C`);
      btn.textContent = dec.decade.replace('s', '');
      btn.addEventListener('click', () => {
        this.currentDecadeIndex = idx;
        this.updateDecadeView(idx);
        this.playCurrentDecade();
      });
      this.dom.timelineContainer.appendChild(btn);
    });
  }

  updateDecadeView(index) {
    const decades = this.getActiveDecades();
    if (index < 0 || index >= decades.length) return;

    this.currentDecadeIndex = index;
    const current = decades[index];

    // Update Telemetry Display
    if (this.dom.decadeIndicator) {
      this.dom.decadeIndicator.textContent = current.decade;
    }
    if (this.dom.anomalyPill) {
      const sign = current.anomaly >= 0 ? '+' : '';
      this.dom.anomalyPill.textContent = `${sign}${current.anomaly.toFixed(2)}°C`;
      this.dom.anomalyPill.className = `anomaly-pill ${current.anomaly >= 0.8 ? 'pill-severe' : current.anomaly >= 0.3 ? 'pill-warm' : current.anomaly >= 0 ? 'pill-neutral' : 'pill-cool'}`;
    }

    // Update Progress Bar
    if (this.dom.progressBar) {
      const pct = ((index + 1) / decades.length) * 100;
      this.dom.progressBar.style.width = `${pct}%`;
      this.dom.progressBar.setAttribute('aria-valuenow', Math.round(pct));
    }

    // Update Timeline Chips Focus/Active State
    const chips = this.dom.timelineContainer.querySelectorAll('.timeline-chip');
    chips.forEach((c, i) => {
      c.classList.toggle('active', i === index);
      if (i === index) {
        c.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    // Render GIBS Satellite Visual Frame
    if (this.gibs) {
      this.gibs.render(current, this.currentTrackId === 'global-temp' ? 'global' : 'himalaya');
    }

    // Announce via Screen Reader and Plain Text Captions
    this.narrator.announce(current, this.getCurrentDataset().title);
  }

  async playCurrentDecade() {
    const decades = this.getActiveDecades();
    const current = decades[this.currentDecadeIndex];
    if (current) {
      await this.audio.playDecadeSweep(current, 1.6);
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  async startPlayback() {
    await this.audio.init();
    this.isPlaying = true;
    if (this.dom.playPauseBtn) {
      this.dom.playPauseBtn.setAttribute('aria-label', 'Pause jukebox playback');
      this.dom.playPauseBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <span>Pause</span>
      `;
      this.dom.playPauseBtn.classList.add('playing');
    }

    this.playNextStep();
  }

  playNextStep() {
    if (!this.isPlaying) return;

    const decades = this.getActiveDecades();

    if (this.currentDecadeIndex >= decades.length) {
      this.stopPlayback();
      this.narrator.announceMessage("Playback finished for this track. You have reached the final decade.");
      return;
    }

    this.updateDecadeView(this.currentDecadeIndex);
    this.playCurrentDecade();

    // Schedule next decade sweep after 1.8 seconds (1.6s sweep + 0.2s smooth overlap)
    this.playTimer = setTimeout(() => {
      this.currentDecadeIndex++;
      this.playNextStep();
    }, 1800);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }

    if (this.dom.playPauseBtn) {
      this.dom.playPauseBtn.setAttribute('aria-label', 'Play jukebox track');
      this.dom.playPauseBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>Play Track</span>
      `;
      this.dom.playPauseBtn.classList.remove('playing');
    }
  }

  stepDecade(delta) {
    const decades = this.getActiveDecades();
    const newIdx = Math.max(0, Math.min(decades.length - 1, this.currentDecadeIndex + delta));
    if (newIdx !== this.currentDecadeIndex) {
      this.currentDecadeIndex = newIdx;
      this.updateDecadeView(this.currentDecadeIndex);
      this.playCurrentDecade();
    }
  }

  setupEventListeners() {
    // Play/Pause Button
    if (this.dom.playPauseBtn) {
      this.dom.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    }

    // Previous/Next Decade Buttons
    if (this.dom.prevDecadeBtn) {
      this.dom.prevDecadeBtn.addEventListener('click', () => this.stepDecade(-1));
    }
    if (this.dom.nextDecadeBtn) {
      this.dom.nextDecadeBtn.addEventListener('click', () => this.stepDecade(1));
    }

    // Track Selector Buttons
    this.dom.trackButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackId = e.currentTarget.getAttribute('data-track');
        this.loadTrack(trackId);
      });
    });

    // Trend Extrapolation Toggle
    if (this.dom.projectionToggle) {
      this.dom.projectionToggle.addEventListener('change', (e) => {
        this.includeProjection = e.target.checked;
        this.renderTimeline();
        this.renderDataTable();
        const msg = this.includeProjection 
          ? "Linear trend extrapolation enabled (2025–2035). Note: this is a linear regression, not a climate model." 
          : "Linear trend extrapolation disabled.";
        this.narrator.announceMessage(msg);
      });
    }

    // Speech Narrator Toggle
    if (this.dom.speechToggle) {
      this.dom.speechToggle.addEventListener('change', (e) => {
        this.narrator.setSpeechEnabled(e.target.checked);
        this.narrator.announceMessage(e.target.checked ? "Voice announcements turned on." : "Voice announcements muted.");
      });
    }

    // Mute Toggle
    if (this.dom.muteToggle) {
      this.dom.muteToggle.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        this.dom.muteToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
        this.dom.muteToggle.classList.toggle('muted', isMuted);
        this.narrator.announceMessage(isMuted ? "Audio muted." : "Audio unmuted.");
      });
    }

    // Master Volume Slider
    if (this.dom.volumeSlider) {
      this.dom.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.audio.setVolume(val);
      });
    }

    // Modals
    if (this.dom.openLegendBtn) {
      this.dom.openLegendBtn.addEventListener('click', () => this.openModal(this.dom.legendModal));
    }
    if (this.dom.openTableBtn) {
      this.dom.openTableBtn.addEventListener('click', () => this.openModal(this.dom.tableModal));
    }
    if (this.dom.openLimitsBtn) {
      this.dom.openLimitsBtn.addEventListener('click', () => this.openModal(this.dom.limitsModal));
    }
    if (this.dom.openMobileBtn) {
      this.dom.openMobileBtn.addEventListener('click', () => this.openModal(this.dom.mobileModal));
    }

    this.dom.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => this.closeActiveModal());
    });

    // Legend Tone Calibration Buttons
    const legendButtons = document.querySelectorAll('.legend-tone-btn');
    legendButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const temp = parseFloat(e.currentTarget.getAttribute('data-temp'));
        await this.audio.playLegendReference(temp, 1.4);
        const sign = temp >= 0 ? '+' : '';
        this.narrator.announceMessage(`Calibrated tone for ${sign}${temp.toFixed(2)} degrees Celsius.`);
      });
    });

    // Play Full Legend Calibration Suite
    const playAllLegendBtn = document.getElementById('playAllLegendBtn');
    if (playAllLegendBtn) {
      playAllLegendBtn.addEventListener('click', async () => {
        const benchmarks = [
          { label: "Cool Departure (-0.30°C)", temp: -0.30 },
          { label: "Baseline Era (0.00°C)", temp: 0.00 },
          { label: "Warm Departure (+0.60°C)", temp: 0.60 },
          { label: "Elevated High (+1.25°C)", temp: 1.25 }
        ];

        for (const item of benchmarks) {
          this.narrator.announceMessage(`Legend Reference: ${item.label}`);
          await this.audio.playLegendReference(item.temp, 1.3);
          await new Promise(r => setTimeout(r, 1500));
        }
      });
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Do not capture shortcuts if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.stepDecade(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.stepDecade(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.adjustVolume(-0.1);
          break;
        case '1':
          this.loadTrack('global-temp');
          break;
        case '2':
          this.loadTrack('himalaya-temp');
          break;
        case 'l':
        case 'L':
          if (this.activeModal === this.dom.legendModal) {
            this.closeActiveModal();
          } else {
            this.openModal(this.dom.legendModal);
          }
          break;
        case 't':
        case 'T':
          if (this.activeModal === this.dom.tableModal) {
            this.closeActiveModal();
          } else {
            this.openModal(this.dom.tableModal);
          }
          break;
        case 'p':
        case 'P':
          if (this.currentTrackId === 'global-temp' && this.dom.projectionToggle) {
            this.dom.projectionToggle.checked = !this.dom.projectionToggle.checked;
            this.dom.projectionToggle.dispatchEvent(new Event('change'));
          }
          break;
        case 'm':
        case 'M':
          if (this.dom.muteToggle) this.dom.muteToggle.click();
          break;
        case 'Escape':
          if (this.activeModal) {
            this.closeActiveModal();
          }
          break;
      }
    });
  }

  adjustVolume(delta) {
    const current = this.audio.volume;
    const next = Math.max(0, Math.min(1, current + delta));
    this.audio.setVolume(next);
    if (this.dom.volumeSlider) {
      this.dom.volumeSlider.value = next;
    }
    this.narrator.announceMessage(`Volume ${Math.round(next * 100)} percent`);
  }

  openModal(modalElem) {
    if (!modalElem) return;
    this.closeActiveModal();
    this.activeModal = modalElem;
    modalElem.classList.add('visible');
    modalElem.setAttribute('aria-hidden', 'false');

    // Trap focus inside modal
    const focusable = modalElem.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  closeActiveModal() {
    if (!this.activeModal) return;
    this.activeModal.classList.remove('visible');
    this.activeModal.setAttribute('aria-hidden', 'true');
    this.activeModal = null;
    if (this.dom.playPauseBtn) {
      this.dom.playPauseBtn.focus();
    }
  }

  renderDataTable() {
    if (!this.dom.dataTableBody) return;
    const dataset = this.getCurrentDataset();
    const decades = this.getActiveDecades();

    this.dom.dataTableBody.innerHTML = decades.map(d => {
      const fahrenheit = (d.anomaly * 1.8).toFixed(2);
      const signC = d.anomaly >= 0 ? '+' : '';
      const signF = fahrenheit >= 0 ? '+' : '';
      return `
        <tr class="${d.isProjection ? 'projection-row' : ''}">
          <th scope="row">${d.decade}</th>
          <td>${d.startYear}–${d.endYear}</td>
          <td><strong>${signC}${d.anomaly.toFixed(2)}°C</strong></td>
          <td>${signF}${fahrenheit}°F</td>
          <td>${d.rateOfChange >= 0 ? '+' : ''}${d.rateOfChange.toFixed(2)}°C/dec</td>
          <td>${d.isProjection ? '<span class="badge projection-badge">Linear Extrapolation</span>' : '<span class="badge recorded-badge">NASA Observed</span>'}</td>
          <td>${d.summary}</td>
        </tr>
      `;
    }).join('');
  }
}
