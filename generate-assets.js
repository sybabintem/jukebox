const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'assets', 'gibs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Global decades
const globalDecades = [
  { id: 'earth-1880s', decade: '1880s', years: '1880–1889', anomaly: -0.19, type: 'global' },
  { id: 'earth-1890s', decade: '1890s', years: '1890–1899', anomaly: -0.28, type: 'global' },
  { id: 'earth-1900s', decade: '1900s', years: '1900–1909', anomaly: -0.27, type: 'global' },
  { id: 'earth-1910s', decade: '1910s', years: '1910–1919', anomaly: -0.30, type: 'global' },
  { id: 'earth-1920s', decade: '1920s', years: '1920–1929', anomaly: -0.21, type: 'global' },
  { id: 'earth-1930s', decade: '1930s', years: '1930–1939', anomaly: -0.12, type: 'global' },
  { id: 'earth-1940s', decade: '1940s', years: '1940–1949', anomaly: 0.03, type: 'global' },
  { id: 'earth-1950s', decade: '1950s', years: '1950–1959', anomaly: -0.04, type: 'global' },
  { id: 'earth-1960s', decade: '1960s', years: '1960–1969', anomaly: 0.02, type: 'global' },
  { id: 'earth-1970s', decade: '1970s', years: '1970–1979', anomaly: 0.08, type: 'global' },
  { id: 'earth-1980s', decade: '1980s', years: '1980–1989', anomaly: 0.26, type: 'global' },
  { id: 'earth-1990s', decade: '1990s', years: '1990–1999', anomaly: 0.40, type: 'global' },
  { id: 'earth-2000s', decade: '2000s', years: '2000–2009', anomaly: 0.61, type: 'global' },
  { id: 'earth-2010s', decade: '2010s', years: '2010–2019', anomaly: 0.88, type: 'global' },
  { id: 'earth-2020s', decade: '2020s', years: '2020–2024', anomaly: 1.18, type: 'global' },
  { id: 'earth-2030s', decade: '2030s', years: '2025–2035 (Model)', anomaly: 1.42, type: 'global', isModel: true },
];

// Himalayan decades
const himalayaDecades = [
  { id: 'himalaya-1880s', decade: '1880s', years: '1880–1889', anomaly: -0.28, type: 'himalaya' },
  { id: 'himalaya-1890s', decade: '1890s', years: '1890–1899', anomaly: -0.35, type: 'himalaya' },
  { id: 'himalaya-1900s', decade: '1900s', years: '1900–1909', anomaly: -0.32, type: 'himalaya' },
  { id: 'himalaya-1910s', decade: '1910s', years: '1910–1919', anomaly: -0.38, type: 'himalaya' },
  { id: 'himalaya-1920s', decade: '1920s', years: '1920–1929', anomaly: -0.24, type: 'himalaya' },
  { id: 'himalaya-1930s', decade: '1930s', years: '1930–1939', anomaly: -0.14, type: 'himalaya' },
  { id: 'himalaya-1940s', decade: '1940s', years: '1940–1949', anomaly: 0.01, type: 'himalaya' },
  { id: 'himalaya-1950s', decade: '1950s', years: '1950–1959', anomaly: -0.06, type: 'himalaya' },
  { id: 'himalaya-1960s', decade: '1960s', years: '1960–1969', anomaly: 0.04, type: 'himalaya' },
  { id: 'himalaya-1970s', decade: '1970s', years: '1970–1979', anomaly: 0.12, type: 'himalaya' },
  { id: 'himalaya-1980s', decade: '1980s', years: '1980–1989', anomaly: 0.35, type: 'himalaya' },
  { id: 'himalaya-1990s', decade: '1990s', years: '1990–1999', anomaly: 0.58, type: 'himalaya' },
  { id: 'himalaya-2000s', decade: '2000s', years: '2000–2009', anomaly: 0.84, type: 'himalaya' },
  { id: 'himalaya-2010s', decade: '2010s', years: '2010–2019', anomaly: 1.15, type: 'himalaya' },
  { id: 'himalaya-2020s', decade: '2020s', years: '2020–2024', anomaly: 1.48, type: 'himalaya' }
];

function getColorForAnomaly(val) {
  if (val < -0.20) return { glow: '#38bdf8', aura: 'rgba(56, 189, 248, 0.25)', label: 'Cool Departure' };
  if (val < 0.00) return { glow: '#818cf8', aura: 'rgba(129, 140, 248, 0.25)', label: 'Near Baseline' };
  if (val < 0.30) return { glow: '#34d399', aura: 'rgba(52, 211, 153, 0.25)', label: 'Mild Departure' };
  if (val < 0.70) return { glow: '#fbbf24', aura: 'rgba(251, 191, 36, 0.25)', label: 'Accelerating' };
  if (val < 1.10) return { glow: '#f97316', aura: 'rgba(249, 115, 22, 0.3)', label: 'Elevated Departures' };
  return { glow: '#ef4444', aura: 'rgba(239, 68, 68, 0.38)', label: 'High Anomaly' };
}

function generateSvg(item) {
  const col = getColorForAnomaly(item.anomaly);
  const sign = item.anomaly >= 0 ? '+' : '';
  const anomalyStr = `${sign}${item.anomaly.toFixed(2)}°C`;
  const isGlobal = item.type === 'global';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <radialGradient id="spaceGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="100%" stop-color="#030712" />
    </radialGradient>
    <radialGradient id="planetAura" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#091833" />
      <stop offset="85%" stop-color="${col.glow}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${col.glow}" stop-opacity="0.6" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.7" opacity="0.6" />
    </pattern>
    <filter id="thermalGlow">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Deep Space Canvas -->
  <rect width="800" height="480" fill="url(#spaceGlow)" />
  <rect width="800" height="480" fill="url(#grid)" />

  <!-- Target Visual -->
  ${isGlobal ? `
    <!-- Earth Globe Representation -->
    <circle cx="400" cy="220" r="140" fill="url(#planetAura)" stroke="#334155" stroke-width="2" />
    <!-- Lat/Long Graticule Lines -->
    <ellipse cx="400" cy="220" rx="140" ry="50" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.35" />
    <ellipse cx="400" cy="220" rx="140" ry="100" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.35" />
    <line x1="400" y1="80" x2="400" y2="360" stroke="#38bdf8" stroke-width="1.2" opacity="0.4" stroke-dasharray="4,4" />
    <line x1="260" y1="220" x2="540" y2="220" stroke="#38bdf8" stroke-width="1.5" opacity="0.5" />
    
    <!-- Stylized Continents / Thermal Wash -->
    <path d="M 330 150 Q 370 120 420 140 T 480 180 T 450 250 T 360 270 T 320 210 Z" fill="${col.glow}" fill-opacity="0.22" filter="url(#thermalGlow)" />
    <path d="M 410 190 Q 450 170 470 200 T 430 260 Z" fill="${col.glow}" fill-opacity="0.35" />
    <circle cx="400" cy="220" r="142" fill="none" stroke="${col.glow}" stroke-width="3" opacity="0.75" />
  ` : `
    <!-- Himalayan Mountain Ridge Elevation Relief -->
    <path d="M 120 340 L 220 230 L 290 280 L 380 160 L 450 220 L 530 140 L 610 240 L 680 340 Z" fill="#0f172a" stroke="#334155" stroke-width="2" />
    <!-- Glacial / Thermal Peak Outlines -->
    <path d="M 220 230 L 290 280 L 380 160 L 450 220 L 530 140 L 610 240" fill="none" stroke="${col.glow}" stroke-width="3" filter="url(#thermalGlow)" />
    <polygon points="340,210 380,160 420,210" fill="${col.glow}" fill-opacity="0.3" />
    <polygon points="490,180 530,140 570,190" fill="${col.glow}" fill-opacity="0.35" />
    <circle cx="530" cy="140" r="8" fill="none" stroke="${col.glow}" stroke-width="2" />
    <text x="545" y="145" fill="#f8fafc" font-size="12" font-family="monospace">Langtang Lirung / 7,227m</text>
  `}

  <!-- Mission Control Header Badge -->
  <g transform="translate(30, 36)">
    <rect width="180" height="32" rx="4" fill="#0f172a" stroke="#334155" />
    <circle cx="16" cy="16" r="6" fill="#38bdf8" />
    <text x="32" y="21" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">NASA GIBS SATELLITE</text>
  </g>

  <!-- Anomaly Metric Pill -->
  <g transform="translate(620, 36)">
    <rect width="150" height="32" rx="4" fill="#0f172a" stroke="${col.glow}" stroke-width="1.5" />
    <text x="75" y="21" fill="${col.glow}" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold">${anomalyStr}</text>
  </g>

  <!-- Bottom Legend / Metadata Bar -->
  <rect x="0" y="420" width="800" height="60" fill="#020617" opacity="0.9" />
  <line x1="0" y1="420" x2="800" y2="420" stroke="#1e293b" stroke-width="1.5" />
  
  <text x="30" y="452" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="600">
    ${isGlobal ? 'Global Mean Surface Frame' : 'Hindu Kush Himalaya Elevation Model'} &bull; ${item.decade} (${item.years})
  </text>
  <text x="770" y="452" text-anchor="end" fill="#94a3b8" font-family="monospace" font-size="12">
    ${col.label} &bull; GISTEMP v4
  </text>
</svg>`;
}

[...globalDecades, ...himalayaDecades].forEach(item => {
  const filePath = path.join(outputDir, `${item.id}.svg`);
  fs.writeFileSync(filePath, generateSvg(item), 'utf8');
});

console.log('Successfully generated all GIBS satellite SVG frames.');
