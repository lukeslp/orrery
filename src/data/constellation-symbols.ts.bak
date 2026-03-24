/*
 * Zodiac SVG symbols used by Stargazer overlays.
 *
 * These correspond to the classical astrological signs described in:
 * https://en.wikipedia.org/wiki/Astrological_symbols
 */

export interface ConstellationSymbolSvg {
  viewBox: string;
  paths: string[];
}

const VB = '0 0 100 100';

export const ZODIAC_SYMBOLS: Record<string, ConstellationSymbolSvg> = {
  Ari: { viewBox: VB, paths: [
    'M50 84 C50 56 46 38 32 24 C26 18 18 18 14 24 C10 30 10 40 16 48',
    'M50 84 C50 56 54 38 68 24 C74 18 82 18 86 24 C90 30 90 40 84 48',
  ] },
  Tau: { viewBox: VB, paths: [
    'M32 58 A18 18 0 1 0 68 58 A18 18 0 1 0 32 58',
    'M32 44 C24 34 22 22 28 16 C36 8 48 14 50 28',
    'M68 44 C76 34 78 22 72 16 C64 8 52 14 50 28',
  ] },
  Gem: { viewBox: VB, paths: [
    'M28 18 H72',
    'M28 82 H72',
    'M36 18 C42 36 42 64 36 82',
    'M64 18 C58 36 58 64 64 82',
  ] },
  Cnc: { viewBox: VB, paths: [
    'M28 34 C18 34 12 42 12 52 C12 64 20 72 32 72 C44 72 52 64 52 52 C52 40 44 32 32 32 C24 32 18 36 14 42',
    'M72 66 C82 66 88 58 88 48 C88 36 80 28 68 28 C56 28 48 36 48 48 C48 60 56 68 68 68 C76 68 82 64 86 58',
  ] },
  Leo: { viewBox: VB, paths: [
    'M24 70 C36 54 48 44 62 42 C76 40 86 30 86 18 C86 10 80 6 74 6 C66 6 60 12 60 20 C60 30 68 38 78 38',
    'M24 70 C18 78 16 88 24 94 C32 100 42 96 46 88 C50 80 48 70 40 64 C32 58 22 60 18 68',
  ] },
  Vir: { viewBox: VB, paths: [
    'M18 78 V28',
    'M18 28 C28 36 30 52 30 78',
    'M30 28 C40 36 42 52 42 78',
    'M42 28 C52 36 54 52 54 78',
    'M54 28 C64 36 66 52 66 78',
    'M66 78 C66 90 76 92 84 82',
  ] },
  Lib: { viewBox: VB, paths: [
    'M18 66 H82',
    'M26 50 H74',
    'M26 50 C30 36 40 28 50 28 C60 28 70 36 74 50',
  ] },
  Sco: { viewBox: VB, paths: [
    'M18 78 V28',
    'M18 28 C28 36 30 52 30 78',
    'M30 28 C40 36 42 52 42 78',
    'M42 28 C52 36 54 52 54 78',
    'M54 28 C64 36 66 52 66 78',
    'M66 78 H78 L70 70',
  ] },
  Sgr: { viewBox: VB, paths: [
    'M18 82 L82 18',
    'M56 18 H82 V44',
    'M18 18 L44 44',
  ] },
  Cap: { viewBox: VB, paths: [
    'M18 78 V32 C18 24 28 24 34 30 C40 36 40 52 40 78',
    'M40 60 C46 46 58 38 70 38 C82 38 90 46 90 58 C90 70 82 78 70 78 C58 78 50 70 50 58 C50 46 58 38 70 38',
  ] },
  Aqr: { viewBox: VB, paths: [
    'M14 38 L28 24 L42 38 L56 24 L70 38 L84 24',
    'M14 70 L28 56 L42 70 L56 56 L70 70 L84 56',
  ] },
  Psc: { viewBox: VB, paths: [
    'M30 20 C20 30 18 44 18 50 C18 56 20 70 30 80',
    'M70 20 C80 30 82 44 82 50 C82 56 80 70 70 80',
    'M30 50 H70',
  ] },
};

export function isZodiac(id: string): boolean {
  return id in ZODIAC_SYMBOLS;
}
