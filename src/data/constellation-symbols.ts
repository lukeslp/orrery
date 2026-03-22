/*
 * Constellation symbols — zodiac Unicode glyphs + representative symbols
 * for all 88 IAU constellations. Used by ConstellationLabels.
 */

// Zodiac constellations get their classic astrological symbols
// Other constellations get representative Unicode or astronomical symbols

export const CONSTELLATION_SYMBOLS: Record<string, string> = {
  // ─── Zodiac (12) ───────────────────────────────────────────────────────
  Ari: '\u2648',  // ♈ Aries
  Tau: '\u2649',  // ♉ Taurus
  Gem: '\u264A',  // ♊ Gemini
  Cnc: '\u264B',  // ♋ Cancer
  Leo: '\u264C',  // ♌ Leo
  Vir: '\u264D',  // ♍ Virgo
  Lib: '\u264E',  // ♎ Libra
  Sco: '\u264F',  // ♏ Scorpius
  Sgr: '\u2650',  // ♐ Sagittarius
  Cap: '\u2651',  // ♑ Capricornus
  Aqr: '\u2652',  // ♒ Aquarius
  Psc: '\u2653',  // ♓ Pisces

  // ─── Major northern (26) ───────────────────────────────────────────────
  UMa: '\u2726',  // ✦ Ursa Major — great bear
  UMi: '\u2735',  // ✵ Ursa Minor — little bear / Polaris
  Dra: '\u2604',  // ☄ Draco — dragon
  Cas: '\u2655',  // ♕ Cassiopeia — queen
  Cep: '\u2654',  // ♔ Cepheus — king
  Ori: '\u2694',  // ⚔ Orion — hunter
  Cyg: '\u2020',  // † Cygnus — northern cross / swan
  Lyr: '\u266A',  // ♪ Lyra — lyre
  Aql: '\u2197',  // ↗ Aquila — eagle
  Per: '\u273C',  // ✼ Perseus — hero
  And: '\u2726',  // ✦ Andromeda — chained maiden
  Peg: '\u2726',  // ✦ Pegasus — winged horse
  Aur: '\u2B50',  // ⭐ Auriga — charioteer
  Boo: '\u2660',  // ♠ Boötes — herdsman
  Her: '\u2727',  // ✧ Hercules
  Oph: '\u2695',  // ⚕ Ophiuchus — serpent-bearer
  Ser: '\u223F',  // ∿ Serpens — serpent
  CrB: '\u2655',  // ♕ Corona Borealis — northern crown
  CMa: '\u2605',  // ★ Canis Major — great dog / Sirius
  CMi: '\u2606',  // ☆ Canis Minor — little dog
  Gem: '\u264A',  // ♊ (zodiac above, included for completeness)
  Tri: '\u25B3',  // △ Triangulum
  Lyn: '\u2042',  // ⁂ Lynx
  LMi: '\u2606',  // ☆ Leo Minor
  CVn: '\u2605',  // ★ Canes Venatici — hunting dogs
  Com: '\u2729',  // ✩ Coma Berenices — hair

  // ─── Major southern (18) ───────────────────────────────────────────────
  Cru: '\u271A',  // ✚ Crux — southern cross
  Cen: '\u2726',  // ✦ Centaurus
  Car: '\u2693',  // ⚓ Carina — keel
  Vel: '\u2693',  // ⚓ Vela — sails
  Pup: '\u2693',  // ⚓ Puppis — stern
  Eri: '\u223F',  // ∿ Eridanus — river
  Hya: '\u223F',  // ∿ Hydra — water snake
  CrA: '\u2655',  // ♕ Corona Australis — southern crown
  Lup: '\u2605',  // ★ Lupus — wolf
  Gru: '\u2605',  // ★ Grus — crane
  Phe: '\u2605',  // ★ Phoenix
  Tuc: '\u2605',  // ★ Tucana
  Pav: '\u2605',  // ★ Pavo — peacock
  Ind: '\u2605',  // ★ Indus
  PsA: '\u2605',  // ★ Piscis Austrinus

  // ─── Smaller / fainter (32) ────────────────────────────────────────────
  Del: '\u25C7',  // ◇ Delphinus — dolphin
  Equ: '\u25C7',  // ◇ Equuleus — little horse
  Sge: '\u2192',  // → Sagitta — arrow
  Vul: '\u2605',  // ★ Vulpecula — fox
  Sct: '\u2726',  // ✦ Scutum — shield
  Lac: '\u2605',  // ★ Lacerta — lizard
  Mon: '\u2726',  // ✦ Monoceros — unicorn
  Lep: '\u2605',  // ★ Lepus — hare
  Col: '\u2605',  // ★ Columba — dove
  Cae: '\u2726',  // ✦ Caelum — chisel
  Hor: '\u231A',  // ⌚ Horologium — clock
  Pic: '\u2726',  // ✦ Pictor — painter
  Dor: '\u2605',  // ★ Dorado — swordfish
  Ret: '\u25C7',  // ◇ Reticulum — reticle
  Hyi: '\u223F',  // ∿ Hydrus — water snake
  Vol: '\u2605',  // ★ Volans — flying fish
  Cha: '\u2605',  // ★ Chamaeleon
  Mus: '\u2605',  // ★ Musca — fly
  TrA: '\u25B3',  // △ Triangulum Australe
  Nor: '\u2726',  // ✦ Norma — carpenter's square
  Ara: '\u2726',  // ✦ Ara — altar
  Tel: '\u2726',  // ✦ Telescopium
  Mic: '\u2726',  // ✦ Microscopium
  Scl: '\u2726',  // ✦ Sculptor
  For: '\u2726',  // ✦ Fornax — furnace
  Cet: '\u223F',  // ∿ Cetus — whale
  Ant: '\u2726',  // ✦ Antlia — pump
  Pyx: '\u2726',  // ✦ Pyxis — compass
  Cir: '\u2726',  // ✦ Circinus — compasses
  Sex: '\u2726',  // ✦ Sextans
  Crt: '\u2726',  // ✦ Crater — cup
  Crv: '\u2726',  // ✦ Corvus — crow
  Cam: '\u2726',  // ✦ Camelopardalis — giraffe
  Oct: '\u2726',  // ✦ Octans
  Men: '\u2726',  // ✦ Mensa — table
  Aps: '\u2605',  // ★ Apus — bird of paradise
};

/** Whether a constellation is in the zodiac */
export function isZodiac(id: string): boolean {
  return ['Ari','Tau','Gem','Cnc','Leo','Vir','Lib','Sco','Sgr','Cap','Aqr','Psc'].includes(id);
}
