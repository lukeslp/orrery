/*
 * Formal astronomical/astrological SVG symbols for solar-system body overlays.
 */

export interface BodySymbolSvg {
  viewBox: string;
  paths: string[];
}

const VB = '0 0 100 100';

export const BODY_SYMBOLS: Record<string, BodySymbolSvg> = {
  Sol: { viewBox: VB, paths: [
    'M50 18 A32 32 0 1 0 50 82 A32 32 0 1 0 50 18',
    'M50 46 A4 4 0 1 0 50 54 A4 4 0 1 0 50 46',
  ] },
  Mercury: { viewBox: VB, paths: [
    'M50 30 A16 16 0 1 0 50 62 A16 16 0 1 0 50 30',
    'M36 24 C40 14 45 10 50 10 C55 10 60 14 64 24',
    'M50 62 V86',
    'M40 76 H60',
  ] },
  Venus: { viewBox: VB, paths: [
    'M50 22 A20 20 0 1 0 50 62 A20 20 0 1 0 50 22',
    'M50 62 V88',
    'M38 76 H62',
  ] },
  Earth: { viewBox: VB, paths: [
    'M50 18 A26 26 0 1 0 50 70 A26 26 0 1 0 50 18',
    'M50 26 V62',
    'M32 44 H68',
  ] },
  Mars: { viewBox: VB, paths: [
    'M40 40 A18 18 0 1 0 40 76 A18 18 0 1 0 40 40',
    'M54 28 H78 V52',
    'M76 30 L56 50',
  ] },
  Jupiter: { viewBox: VB, paths: [
    'M38 18 V84',
    'M24 48 H58',
    'M64 18 C48 18 42 28 42 40 C42 54 50 62 62 62 C74 62 82 52 82 42 C82 30 74 22 64 22',
  ] },
  Saturn: { viewBox: VB, paths: [
    'M56 16 V80',
    'M56 30 C56 22 62 18 70 18',
    'M56 52 C52 44 44 40 36 40 C24 40 16 48 16 58 C16 70 24 78 36 78 C50 78 58 68 58 56',
    'M42 86 H70',
  ] },
  Uranus: { viewBox: VB, paths: [
    'M24 28 V72',
    'M76 28 V72',
    'M24 50 H76',
    'M50 18 V80',
    'M40 18 H60',
    'M50 80 A10 10 0 1 0 50 100 A10 10 0 1 0 50 80',
  ] },
  Neptune: { viewBox: VB, paths: [
    'M50 18 V82',
    'M34 34 C34 20 42 12 50 12 C58 12 66 20 66 34',
    'M34 34 V18',
    'M66 34 V18',
    'M40 82 H60',
  ] },
  Pluto: { viewBox: VB, paths: [
    'M34 16 V84',
    'M34 16 H56 C70 16 78 24 78 36 C78 48 70 56 56 56 H34',
    'M56 56 C56 70 48 82 36 86',
  ] },
  Ceres: { viewBox: VB, paths: [
    'M66 22 C54 22 44 32 44 44 C44 56 54 66 66 66',
    'M52 58 V86',
    'M40 74 H64',
  ] },
};
