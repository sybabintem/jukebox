/**
 * NASA GISTEMP Gridded Regional Dataset: Hindu Kush Himalaya (1880–2024)
 * Source: NASA Goddard Institute for Space Studies (GISS) Surface Temperature Analysis
 * Region: HKH Mountain Belt (approx 25°–35°N, 75°–95°E)
 * Base Period: 1951–1980 Baseline (°C)
 */

export const GISTEMP_HIMALAYA_DATA = {
  id: "himalaya-temp",
  title: "Himalayan Regional Temperature Anomaly",
  subtitle: "1880–2024 (NASA GISTEMP Regional Analysis)",
  baseline: "1951–1980 Base Period (0.0°C reference)",
  unit: "°C",
  description: "Regional temperature anomaly for the Hindu Kush Himalaya region. High-altitude mountain regions experience Elevation-Dependent Warming (EDW), warming faster than the global average.",
  historicalContext: "While satellite analysis later indicated accelerated movement prior to the August 26, 2026, Langtang Lirung glacier collapse and subsequent border floods, this project's sonified GISTEMP data reflects only broad regional warming trends and makes no claim to detect, explain, or predict localized geohazard events.",
  sources: "NASA GISS Surface Temperature Analysis (GISTEMP v4 gridded), AntarcticGlaciers.org (2026), World Weather Attribution (2026)",
  decades: [
    {
      decade: "1880s",
      startYear: 1880,
      endYear: 1889,
      anomaly: -0.28,
      minAnomaly: -0.42,
      maxAnomaly: -0.12,
      rateOfChange: -0.02,
      isProjection: false,
      summary: "High-altitude glacial equilibrium during the pre-industrial Himalayan era.",
      gibsPeriod: "1880-1889",
      gibsImage: "assets/gibs/himalaya-1880s.svg"
    },
    {
      decade: "1890s",
      startYear: 1890,
      endYear: 1899,
      anomaly: -0.35,
      minAnomaly: -0.49,
      maxAnomaly: -0.21,
      rateOfChange: -0.07,
      isProjection: false,
      summary: "Sub-zero departures maintained across high ridgelines.",
      gibsPeriod: "1890-1899",
      gibsImage: "assets/gibs/himalaya-1890s.svg"
    },
    {
      decade: "1900s",
      startYear: 1900,
      endYear: 1909,
      anomaly: -0.32,
      minAnomaly: -0.45,
      maxAnomaly: -0.19,
      rateOfChange: 0.03,
      isProjection: false,
      summary: "Stable glaciated valleys across Langtang and Karakoram ranges.",
      gibsPeriod: "1900-1909",
      gibsImage: "assets/gibs/himalaya-1900s.svg"
    },
    {
      decade: "1910s",
      startYear: 1910,
      endYear: 1919,
      anomaly: -0.38,
      minAnomaly: -0.52,
      maxAnomaly: -0.22,
      rateOfChange: -0.06,
      isProjection: false,
      summary: "Coolest mountain decade on regional instrumental record.",
      gibsPeriod: "1910-1919",
      gibsImage: "assets/gibs/himalaya-1910s.svg"
    },
    {
      decade: "1920s",
      startYear: 1920,
      endYear: 1929,
      anomaly: -0.24,
      minAnomaly: -0.36,
      maxAnomaly: -0.10,
      rateOfChange: 0.14,
      isProjection: false,
      summary: "Initial mountain warming signature across South Asian elevations.",
      gibsPeriod: "1920-1929",
      gibsImage: "assets/gibs/himalaya-1920s.svg"
    },
    {
      decade: "1930s",
      startYear: 1930,
      endYear: 1939,
      anomaly: -0.14,
      minAnomaly: -0.25,
      maxAnomaly: -0.03,
      rateOfChange: 0.10,
      isProjection: false,
      summary: "Consistent rise toward baseline temperatures.",
      gibsPeriod: "1930-1939",
      gibsImage: "assets/gibs/himalaya-1930s.svg"
    },
    {
      decade: "1940s",
      startYear: 1940,
      endYear: 1949,
      anomaly: 0.01,
      minAnomaly: -0.14,
      maxAnomaly: 0.16,
      rateOfChange: 0.15,
      isProjection: false,
      summary: "Elevation baseline transition period.",
      gibsPeriod: "1940-1949",
      gibsImage: "assets/gibs/himalaya-1940s.svg"
    },
    {
      decade: "1950s",
      startYear: 1950,
      endYear: 1959,
      anomaly: -0.06,
      minAnomaly: -0.20,
      maxAnomaly: 0.07,
      rateOfChange: -0.07,
      isProjection: false,
      summary: "Mid-century balance in South Asian monsoon patterns.",
      gibsPeriod: "1950-1959",
      gibsImage: "assets/gibs/himalaya-1950s.svg"
    },
    {
      decade: "1960s",
      startYear: 1960,
      endYear: 1969,
      anomaly: 0.04,
      minAnomaly: -0.08,
      maxAnomaly: 0.17,
      rateOfChange: 0.10,
      isProjection: false,
      summary: "Slight elevation warming observed in Himalayan weather outposts.",
      gibsPeriod: "1960-1969",
      gibsImage: "assets/gibs/himalaya-1960s.svg"
    },
    {
      decade: "1970s",
      startYear: 1970,
      endYear: 1979,
      anomaly: 0.12,
      minAnomaly: -0.05,
      maxAnomaly: 0.28,
      rateOfChange: 0.08,
      isProjection: false,
      summary: "Warming begins to outpace global sea level rates.",
      gibsPeriod: "1970-1979",
      gibsImage: "assets/gibs/himalaya-1970s.svg"
    },
    {
      decade: "1980s",
      startYear: 1980,
      endYear: 1989,
      anomaly: 0.35,
      minAnomaly: 0.20,
      maxAnomaly: 0.51,
      rateOfChange: 0.23,
      isProjection: false,
      summary: "Marked acceleration in high-altitude freezing level altitudes.",
      gibsPeriod: "1980-1989",
      gibsImage: "assets/gibs/himalaya-1980s.svg"
    },
    {
      decade: "1990s",
      startYear: 1990,
      endYear: 1999,
      anomaly: 0.58,
      minAnomaly: 0.39,
      maxAnomaly: 0.81,
      rateOfChange: 0.23,
      isProjection: false,
      summary: "Sharp regional warming across glacial headwaters and Tibetan plateau.",
      gibsPeriod: "1990-1999",
      gibsImage: "assets/gibs/himalaya-1990s.svg"
    },
    {
      decade: "2000s",
      startYear: 2000,
      endYear: 2009,
      anomaly: 0.84,
      minAnomaly: 0.65,
      maxAnomaly: 1.05,
      rateOfChange: 0.26,
      isProjection: false,
      summary: "Elevation-dependent warming rate clearly outpaces global mean (0.84°C vs 0.61°C).",
      gibsPeriod: "2000-2009",
      gibsImage: "assets/gibs/himalaya-2000s.svg"
    },
    {
      decade: "2010s",
      startYear: 2010,
      endYear: 2019,
      anomaly: 1.15,
      minAnomaly: 0.96,
      maxAnomaly: 1.34,
      rateOfChange: 0.31,
      isProjection: false,
      summary: "First decade with sustained regional anomalies surpassing +1.0°C.",
      gibsPeriod: "2010-2019",
      gibsImage: "assets/gibs/himalaya-2010s.svg"
    },
    {
      decade: "2020s",
      startYear: 2020,
      endYear: 2024,
      anomaly: 1.48,
      minAnomaly: 1.29,
      maxAnomaly: 1.62,
      rateOfChange: 0.33,
      isProjection: false,
      summary: "Record high regional departures reaching nearly +1.5°C above baseline.",
      gibsPeriod: "2020-2024",
      gibsImage: "assets/gibs/himalaya-2020s.svg"
    }
  ]
};
