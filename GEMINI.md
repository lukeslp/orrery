# Gemini Project Context: Orrery

## Project Overview
**Orrery** is a high-fidelity, interactive 3D solar system simulator built with **React 19**, **Three.js (via React Three Fiber)**, and **Vite**. It provides a scientifically grounded visualization of the solar system, utilizing JPL J2000 Keplerian elements with secular rates to compute planetary positions in real-time.

The project is developed by **Luke Steuber** and focuses on a balance of astronomical accuracy, visual polish, and accessibility (WCAG 2.1 AA).

### Key Technologies
- **Frontend Framework**: React 19 (TypeScript)
- **3D Engine**: Three.js with `@react-three/fiber` and `@react-three/drei`
- **Build Tool**: Vite 8
- **Data Sources**: NASA NeoWs (Near-Earth Objects), NASA SBDB (Small-Body Database), NOAA SWPC (Solar Wind), d3-celestial (Star/Constellation catalogs)
- **Styling**: Custom CSS-in-JS (glassmorphism/bokeh effects) and global resets in `index.css`

### Core Architecture
- **`src/Orrery.tsx`**: The application's "brain." Manages all global state including simulation time, cinematic tour logic, layer visibility, and selection state.
- **`src/scene/`**: Contains 3D components. `Scene.tsx` composes the world, while `Bodies.tsx`, `Stars.tsx`, `Asteroids.tsx`, and `DeepSpace.tsx` handle specific celestial rendering.
- **`src/lib/kepler.ts`**: The math engine. Implements Julian date calculations, Kepler's equation solvers, and heliocentric coordinate conversions.
- **`src/ui/Panels.tsx`**: Manages the HUD, side drawers, info cards, and cinematic overlays.
- **`src/data/`**: Static definitions for planets, moons, and camera presets.

## Building and Running
The project uses `pnpm` as the primary package manager.

- **Install Dependencies**: `pnpm install`
- **Development Server**: `pnpm dev` (Runs at http://localhost:5173)
- **Production Build**: `pnpm build` (Outputs to `dist/`)
- **Linting**: `pnpm lint`

## Development Conventions

### Coordinate System
The simulation uses a **heliocentric ecliptic coordinate system** mapped to Three.js as `[x, z, -y]`, where the Y-axis is the ecliptic normal. Distances are measured in **Astronomical Units (AU)**, where 1 scene unit = 1 AU.

### Camera Management
A unified camera controller (`CamCtrl` in `Scene.tsx`) handles transitions. It uses a **distance-adaptive lerp** to ensure smooth movement across vast scales (from planet surfaces to the Oort Cloud).

### Layer System
Functionality is organized into toggleable layers:
- **Stars/Constellations**: Infinite-distance celestial sphere following the camera.
- **NEOs**: Real-time tracking of near-Earth objects via NASA APIs.
- **Asteroid Belt**: Optimized via `InstancedMesh` (3,000 particles).
- **Deep Space**: Procedural shaders for the Milky Way and Galaxy disc.

### Aesthetic Standards
- **Themes**: Supports Brass, Silver, High Contrast, and Ember themes (colorblind-safe).
- **Glassmorphism**: HUD elements use a consistent "glass" style with backdrop blurs.
- **Procedural Shaders**: Saturn's rings and the Milky Way are rendered using custom GLSL shaders for performance and detail.

## Maintenance Notes
- **Dead Code**: `src/data/constellations.ts` is currently unused; constellation data is loaded from JSON in `public/data/`.
- **External Dependencies**: Planet textures are currently loaded from an external CloudFront CDN.
- **Accessibility**: Always maintain ARIA labels and `focus-visible` styles for interactive elements.
- **Author Credit**: Ensure all updates credit Luke Steuber.

## Opinions & Observations
- **Performance**: Extremely well-optimized for the number of vertices and particles handled (41K+ stars).
- **Robustness**: The use of a poll-based `setInterval` for the cinematic loop makes the tour resilient to React re-render cycles.
- **Scalability**: The logarithmic depth buffer configuration in the Canvas is critical for handling the 0.05 AU to 100,000 AU scale range.
