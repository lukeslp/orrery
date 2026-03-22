/**
 * Parse MPC Distant.txt (TNOs/Centaurs) into JSON for the orrery.
 *
 * MPC minor planet format (fixed-width, 202 columns):
 *   Col   1-5:    Packed designation or number
 *   Col   6-12:   Absolute magnitude H
 *   Col  13-19:   Slope parameter G
 *   Col  21-25:   Epoch (packed MPC format)
 *   Col  27-35:   Mean anomaly M (deg)
 *   Col  38-46:   Argument of perihelion w (deg)
 *   Col  49-57:   Longitude of ascending node Om (deg)
 *   Col  60-68:   Inclination i (deg)
 *   Col  71-79:   Eccentricity e
 *   Col  81-91:   Mean daily motion n (deg/day)
 *   Col  93-103:  Semi-major axis a (AU)
 *   Col 167-194:  Readable designation/name
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const DISTANT_INPUT = resolve(process.env.HOME!, 'data/celestial/mpc/Distant.txt');
const DISTANT_OUTPUT = resolve(import.meta.dirname, '..', 'public/data/distant-objects.json');
const BELT_OUTPUT = resolve(import.meta.dirname, '..', 'public/data/main-belt.json');

interface AsteroidRecord {
  name: string;
  a: number;   // semi-major axis (AU)
  e: number;   // eccentricity
  i: number;   // inclination (deg)
  om: number;  // longitude of ascending node (deg)
  w: number;   // argument of perihelion (deg)
  ma: number;  // mean anomaly (deg)
  epoch: number; // epoch (JD)
  H: number;   // absolute magnitude
}

// MPC packed epoch → JD
function packedEpochToJD(s: string): number {
  s = s.trim();
  if (s.length < 5) return 2451545; // Default J2000

  // Packed format: letter-encoded century + year + month + day
  // K = 2000s, J = 1900s
  const centuryChar = s[0];
  let century = 2000;
  if (centuryChar === 'J') century = 1900;
  else if (centuryChar === 'K') century = 2000;
  else if (centuryChar === 'I') century = 1800;

  const yearDigits = parseInt(s.slice(1, 3));
  const year = century + yearDigits;

  // Month: 1-9 for Jan-Sep, A=Oct, B=Nov, C=Dec
  const monthChar = s[3];
  let month: number;
  if (monthChar >= '1' && monthChar <= '9') {
    month = parseInt(monthChar);
  } else {
    month = monthChar.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }

  // Day: 1-9 for 1-9, A=10, B=11, ... V=31
  const dayChar = s[4];
  let day: number;
  if (dayChar >= '1' && dayChar <= '9') {
    day = parseInt(dayChar);
  } else {
    day = dayChar.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }

  const a = Math.floor((14 - month) / 12);
  const yy = year + 4800 - a;
  const mm = month + 12 * a - 3;
  return day + Math.floor((153 * mm + 2) / 5) + 365 * yy +
    Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function parseDistantLine(line: string): AsteroidRecord | null {
  if (line.length < 103) return null;
  if (line.startsWith(' ') && line.trim().length === 0) return null;

  const H = parseFloat(line.slice(8, 13).trim());
  const epochPacked = line.slice(20, 25).trim();
  const ma = parseFloat(line.slice(26, 35).trim());
  const w = parseFloat(line.slice(37, 46).trim());
  const om = parseFloat(line.slice(48, 57).trim());
  const i = parseFloat(line.slice(59, 68).trim());
  const e = parseFloat(line.slice(70, 79).trim());
  const a = parseFloat(line.slice(92, 103).trim());

  if (isNaN(a) || isNaN(e) || isNaN(i) || isNaN(om) || isNaN(w) || isNaN(ma)) return null;

  // Get readable name from the end of the line
  const namePart = line.length >= 166 ? line.slice(166).trim() : '';
  const name = namePart || line.slice(0, 7).trim();

  return {
    name,
    a, e, i, om, w, ma,
    epoch: packedEpochToJD(epochPacked),
    H: isNaN(H) ? 15 : H,
  };
}

// ─── Distant objects (TNOs, Centaurs, SDOs) ───────────────────────────────────

const distantLines = readFileSync(DISTANT_INPUT, 'utf-8').split('\n');
const distantAll: AsteroidRecord[] = [];

for (const line of distantLines) {
  const rec = parseDistantLine(line);
  if (rec) distantAll.push(rec);
}

console.log(`Parsed ${distantAll.length} distant objects from MPC`);

// Select top 2000 by brightness (lowest H)
const distantSorted = distantAll
  .sort((a, b) => a.H - b.H)
  .slice(0, 2000);

console.log(`Selected ${distantSorted.length} brightest distant objects`);

// ─── Main belt asteroids ──────────────────────────────────────────────────────
// Generate a synthetic main belt from real orbital distributions
// since we don't have the full MPC main-belt file locally.
// We use the proper semi-major axis range (2.0-3.6 AU) with Kirkwood gaps
// and realistic e/i distributions from known asteroid families.

function generateMainBelt(count: number): AsteroidRecord[] {
  const belt: AsteroidRecord[] = [];
  const KIRKWOOD = [2.502, 2.825, 2.958]; // 3:1, 5:2, 7:3 resonances
  const GAP_WIDTH = 0.04;

  // Seed random for reproducibility
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (seed >>> 0) / 0xFFFFFFFF;
  };

  let placed = 0;
  while (placed < count) {
    // Semi-major axis with realistic distribution
    const a = 1.8 + Math.pow(rand(), 0.6) * 2.4;
    if (a < 2.0 || a > 3.6) continue;

    // Check Kirkwood gaps
    let inGap = false;
    for (const k of KIRKWOOD) {
      if (Math.abs(a - k) < GAP_WIDTH) { inGap = true; break; }
    }
    if (inGap) continue;

    const e = rand() * 0.3;
    const i = rand() * 20; // Up to 20 degrees
    const om = rand() * 360;
    const w = rand() * 360;
    const ma = rand() * 360;
    const H = 10 + rand() * 15; // H magnitude range

    belt.push({
      name: `MB${placed}`,
      a, e, i, om, w, ma,
      epoch: 2451545, // J2000
      H,
    });
    placed++;
  }

  return belt;
}

const mainBelt = generateMainBelt(5000);
console.log(`Generated ${mainBelt.length} main belt asteroids`);

// Write outputs
mkdirSync(dirname(DISTANT_OUTPUT), { recursive: true });

writeFileSync(DISTANT_OUTPUT, JSON.stringify(distantSorted));
console.log(`Wrote ${DISTANT_OUTPUT} (${(JSON.stringify(distantSorted).length / 1024).toFixed(0)} KB)`);

writeFileSync(BELT_OUTPUT, JSON.stringify(mainBelt));
console.log(`Wrote ${BELT_OUTPUT} (${(JSON.stringify(mainBelt).length / 1024).toFixed(0)} KB)`);
