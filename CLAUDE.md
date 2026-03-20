# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (default http://localhost:5173)
pnpm build        # Type-check (tsc -b) then bundle (vite build)
pnpm lint         # ESLint with typescript-eslint + react-hooks
pnpm preview      # Serve production build locally
```

Deployed at: `https://dr.eamer.dev/orrery/`

## Architecture

**Stack**: React 19 + TypeScript + Three.js (@react-three/fiber + @react-three/drei) + Vite 8

### Module Structure

```
src/
  lib/kepler.ts         # Orbital mechanics: Kepler solver, Julian dates, heliocentric XYZ, moon phase
  data/planets.ts       # Planet/dwarf planet data (JPL J2000 elements), texture URLs, camera presets
  scene/
    Scene.tsx           # 3D scene composition: camera controller, AU grid, background, lighting
    Bodies.tsx           # Sun, Planet, EarthClouds, Moon, OrbitRing, SaturnRings (procedural shader)
    Asteroids.tsx       # AsteroidBelt (3000 instanced particles), NeoDot, AsteroidOrbitLine
  ui/
    Panels.tsx          # All HUD overlays: TopBar, CameraPresets, TimeControls, PlanetCard, NeoPanel, HUD
    LoadingScreen.tsx   # Loading overlay with fade transition
    styles.ts           # Shared glass style, useIsMobile hook
  Orrery.tsx            # Main component: state, effects (time tick, NASA API, keyboard), Canvas wrapper
  App.tsx               # Thin wrapper
  main.tsx              # Entry point
  index.css             # Global reset, a11y (focus-visible, sr-only, prefers-reduced-motion), safe areas
```

### Data Flow

All state lives in `Orrery.tsx`, passed down via props:
- `Orrery` → `Scene` (3D rendering) + `Panels` (HTML overlays) + `LoadingScreen`
- `Scene` → `Bodies` (planets/sun/moon) + `Asteroids` (belt/NEOs) + `CamCtrl`
- Planet positions computed in `Scene` from `lib/kepler.ts` math, bubbled up via `onPositionsUpdate`

### Coordinate System

Heliocentric ecliptic → Three.js: `[x, z, -y]` where y-up is ecliptic normal. Distances in AU (1 AU = 1 scene unit).

### External APIs

- **NASA NeoWs** (`api.nasa.gov/neo/rest/v1/feed`) — Today's near-Earth objects, fetched on mount. Uses `DEMO_KEY`.
- **NASA SBDB** (`ssd-api.jpl.nasa.gov/sbdb.api`) — Asteroid orbital elements, fetched on-demand when NEO clicked. Returns `ma` (mean anomaly) and `epoch` for position propagation.

### Key Patterns

- **Procedural Saturn rings**: Custom `ShaderMaterial` in `Bodies.tsx` with vertex UV-based ring bands (C Ring, B Ring, Cassini Division, A Ring, Encke Gap)
- **Asteroid belt**: `InstancedMesh` with 3000 icosahedrons, Kirkwood gaps at 2.50/2.82/2.95 AU
- **NEO positioning**: Once SBDB data loads, computes heliocentric position via `neoXYZ()` using mean anomaly propagation. Falls back to hash-based placement before data loads.
- **Camera**: 8 presets + planet click-to-focus. All transitions use `Vector3.lerp(target, 0.03)`.
- **Mobile**: `useIsMobile()` hook drives responsive inline styles. Touch targets 44px+, bottom sheets, safe areas.
- **Accessibility**: ARIA labels, focus-visible, sr-only announcements, prefers-reduced-motion

### Planet Data

`PLANETS` (8) + `DWARF_PLANETS` (Ceres, Pluto, Eris) combined as `ALL_BODIES`. JPL J2000 Keplerian elements with secular rates (rates zero for dwarfs). Toggled via "DWF" button.

### Deployment

Vite `base: '/orrery/'`. Built to `dist/`. Served by Caddy as static files at `dr.eamer.dev/orrery/*`.
