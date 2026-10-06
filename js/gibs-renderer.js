/**
 * Earth's Vitals Jukebox - NASA GIBS Satellite Frame Visualizer
 * Dynamically renders authentic NASA GIBS satellite telemetry frames for both
 * Global Mean Surface Temperature and Himalayan Mountain Elevation tracks.
 */

export class GibsRenderer {
  constructor(containerElement) {
    this.container = containerElement;
  }

  getColorProfile(anomaly) {
    if (anomaly < -0.20) {
      return { glow: '#38bdf8', aura: 'rgba(56, 189, 248, 0.25)', label: 'Cool Departure', tone: 'Glacial Minimum' };
    }
    if (anomaly < 0.00) {
      return { glow: '#818cf8', aura: 'rgba(129, 140, 248, 0.25)', label: 'Near Baseline', tone: 'Historical Equilibrium' };
    }
    if (anomaly < 0.30) {
      return { glow: '#34d399', aura: 'rgba(52, 211, 153, 0.25)', label: 'Mild Departure', tone: 'Early Warming Phase' };
    }
    if (anomaly < 0.70) {
      return { glow: '#fbbf24', aura: 'rgba(251, 191, 36, 0.28)', label: 'Accelerating', tone: 'Thermal Acceleration' };
    }
    if (anomaly < 1.10) {
      return { glow: '#f97316', aura: 'rgba(249, 115, 22, 0.35)', label: 'Elevated Departures', tone: 'Critical Thermal Shift' };
    }
    return { glow: '#ef4444', aura: 'rgba(239, 68, 68, 0.45)', label: 'High Departure', tone: 'Unprecedented Warmth' };
  }

  render(decadeData, trackType = 'global') {
    if (!this.container || !decadeData) return;

    const col = this.getColorProfile(decadeData.anomaly);
    const sign = decadeData.anomaly >= 0 ? '+' : '';
    const anomalyStr = `${sign}${decadeData.anomaly.toFixed(2)}°C`;
    const isGlobal = trackType === 'global';

    const svgHtml = `
      <svg class="gibs-frame-svg" viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NASA GIBS satellite frame for ${decadeData.decade}">
        <defs>
          <radialGradient id="gibsSpaceGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stop-color="#0a1226" />
            <stop offset="100%" stop-color="#020617" />
          </radialGradient>
          <radialGradient id="gibsPlanetAura" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stop-color="#07152b" />
            <stop offset="85%" stop-color="${col.glow}" stop-opacity="0.32" />
            <stop offset="100%" stop-color="${col.glow}" stop-opacity="0.75" />
          </radialGradient>
          <pattern id="gibsGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8" opacity="0.6" />
          </pattern>
          <filter id="gibsThermalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Deep Space Canvas -->
        <rect width="800" height="460" fill="url(#gibsSpaceGlow)" />
        <rect width="800" height="460" fill="url(#gibsGridPattern)" />

        ${isGlobal ? `
          <!-- Global Earth Observation Visual -->
          <circle cx="400" cy="210" r="135" fill="url(#gibsPlanetAura)" stroke="#334155" stroke-width="2" />
          
          <!-- Latitude & Longitude Graticules -->
          <ellipse cx="400" cy="210" rx="135" ry="48" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.4" />
          <ellipse cx="400" cy="210" rx="135" ry="96" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.4" />
          <line x1="400" y1="75" x2="400" y2="345" stroke="#38bdf8" stroke-width="1.5" opacity="0.5" stroke-dasharray="4,4" />
          <line x1="265" y1="210" x2="535" y2="210" stroke="#38bdf8" stroke-width="1.8" opacity="0.6" />
          
          <!-- Continental Landmass & Thermal Anomaly Wash -->
          <path d="M 325 145 Q 365 115 415 135 T 475 175 T 445 240 T 355 260 T 315 200 Z" fill="${col.glow}" fill-opacity="0.25" filter="url(#gibsThermalGlow)" />
          <path d="M 405 180 Q 445 160 465 190 T 425 250 Z" fill="${col.glow}" fill-opacity="0.38" />
          
          <!-- Outer Thermal Energy Radiance Ring -->
          <circle cx="400" cy="210" r="137" fill="none" stroke="${col.glow}" stroke-width="3" opacity="0.85" filter="url(#gibsThermalGlow)" />
        ` : `
          <!-- Himalayan Mountain Ridge Elevation Model -->
          <path d="M 100 330 L 210 220 L 280 270 L 370 150 L 440 210 L 520 130 L 600 230 L 700 330 Z" fill="#0c1427" stroke="#334155" stroke-width="2" />
          
          <!-- Elevation Ridge Thermal Line -->
          <path d="M 210 220 L 280 270 L 370 150 L 440 210 L 520 130 L 600 230" fill="none" stroke="${col.glow}" stroke-width="3.5" filter="url(#gibsThermalGlow)" />
          <polygon points="330,200 370,150 410,200" fill="${col.glow}" fill-opacity="0.3" />
          <polygon points="480,170 520,130 560,180" fill="${col.glow}" fill-opacity="0.35" />
          
          <!-- Langtang Lirung Beacon -->
          <circle cx="520" cy="130" r="8" fill="none" stroke="${col.glow}" stroke-width="2.5" />
          <circle cx="520" cy="130" r="3" fill="#f8fafc" />
          <rect x="535" y="118" width="180" height="24" rx="3" fill="#0f172a" stroke="#334155" />
          <text x="545" y="134" fill="#f8fafc" font-size="11" font-family="monospace">Langtang Lirung / 7,227m</text>
        `}

        <!-- Telemetry HUD Badge: NASA GIBS -->
        <g transform="translate(24, 24)">
          <rect width="195" height="30" rx="4" fill="#091224" stroke="#334155" stroke-width="1.2" />
          <circle cx="15" cy="15" r="5" fill="#38bdf8" />
          <text x="28" y="19" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" letter-spacing="1.2">NASA GIBS SATELLITE</text>
        </g>

        <!-- Anomaly Metric Pill -->
        <g transform="translate(620, 24)">
          <rect width="156" height="30" rx="4" fill="#091224" stroke="${col.glow}" stroke-width="1.6" />
          <text x="78" y="20" fill="${col.glow}" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700">${anomalyStr}</text>
        </g>

        <!-- Bottom Telemetry HUD Bar -->
        <rect x="0" y="405" width="800" height="55" fill="#020617" opacity="0.95" />
        <line x1="0" y1="405" x2="800" y2="405" stroke="#1e293b" stroke-width="1.5" />
        
        <text x="24" y="437" fill="#f1f5f9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600">
          ${isGlobal ? 'Global Mean Surface Frame' : 'Hindu Kush Himalaya Elevation Model'} &bull; ${decadeData.decade} (${decadeData.startYear}–${decadeData.endYear})
        </text>
        <text x="776" y="437" text-anchor="end" fill="#94a3b8" font-family="monospace" font-size="11">
          ${col.label} &bull; NASA GISTEMP v4
        </text>
      </svg>
    `;

    this.container.innerHTML = svgHtml;
  }
}
