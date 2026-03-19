# Orrery — Interactive 3D Solar System

A browser-based mechanical orrery built with **React 19 + Three.js (R3F)** and live NASA data feeds.

## Features

| Feature | Detail |
|---|---|
| **8 planets** | NASA texture maps (Solar System Scope, CC BY 4.0) |
| **Accurate positions** | JPL J2000 Keplerian elements with secular rates |
| **Milky Way skybox** | Equirectangular star field background |
| **Planet click-to-focus** | Camera flies to orbit any selected planet |
| **Planet info cards** | Type, moons, temperature, gravity, orbital elements |
| **Time animation** | Variable playback from 1x real-time to 1 yr/s |
| **Live NEO data** | NASA NeoWs API — today's near-Earth objects |
| **Asteroid orbits** | Full orbital ellipses via NASA SBDB API on demand |
| **7 camera presets** | Inner, System, Earth, Top, Ecliptic, Jupiter, Cinematic |
| **Smooth transitions** | lerp-based camera with OrbitControls damping |
| **Moon phase** | Accurate lunar phase indicator |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| 1–7 | Camera presets |
| Space | Pause / resume simulation |
| H | Toggle simulation HUD |
| N | Toggle NEO panel |
| F | Toggle fullscreen |
| Esc | Deselect / release focus |
| Click planet | Focus camera on planet |
| Click NEO | Show orbital elements + draw orbit |

## Data Sources

- **Planetary positions** — JPL Horizons Keplerian elements (J2000 epoch)
- **Textures** — Solar System Scope (CC BY 4.0)
- **Near-Earth Objects** — NASA NeoWs API
- **Asteroid orbital elements** — NASA JPL SBDB API

## Tech Stack

- React 19 + TypeScript
- Three.js via @react-three/fiber + @react-three/drei
- Vite 6 for development and bundling
- No backend required — all data from public NASA APIs

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

## License

MIT — textures are CC BY 4.0 (Solar System Scope). NASA data is public domain.
