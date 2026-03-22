/*
 * Scene composition — camera, lighting, all 3D elements
 */

import { useState, useEffect, useMemo, useRef, useCallback, type ElementRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ALL_BODIES } from '../data/planets';
import { getMoonsForPlanet } from '../data/moons';
import type { PlanetDef, NEO, FocusTarget, CamPreset } from '../lib/kepler';
import { planetXYZ } from '../lib/kepler';
import { Sun, Planet, OrbitRing, Satellite as MoonSatellite, SatelliteOrbit } from './Bodies';
import { RealAsteroidBelt, NeoDot, AsteroidOrbitLine } from './Asteroids';
import { StarField, ConstellationLines, ConstellationLabels } from './Stars';
import { AsterismField } from './Asterisms';
import { DeepSkyField } from './DeepSky';
import { CometField } from './Comets';
import { MeteorField } from './Meteors';
import { SatelliteField } from './Satellites';
import { DeepSpaceField } from './DeepSpace';
import type { CometDef } from '../data/comets';
import type { MeteorShower } from './Meteors';
import type { SatellitePosition } from '../lib/satellites';
import type { Spacecraft } from '../data/deepspace';

// Default home camera position (replaces CAMS[1] "System" view)
const HOME_POS: [number, number, number] = [0, 30, 40];
const HOME_TGT: [number, number, number] = [0, 0, 0];

// ─── AU reference grid ──────────────────────────────────────────────────────────

function AUGrid() {
  return (
    <group>
      {[1, 2, 5, 10, 20, 30, 50, 100].map(r => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.003, r + 0.003, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.025} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Camera controller ──────────────────────────────────────────────────────────

function CamCtrl({ focusTarget, positions, cinematic, camPreset, cinematicRotateSpeed, onCameraDistance }: {
  focusTarget: FocusTarget | null;
  positions: Map<number, [number, number, number]>;
  cinematic: boolean;
  camPreset?: CamPreset | null;
  cinematicRotateSpeed: number;
  onCameraDistance?: (d: number) => void;
}) {
  const { camera } = useThree();
  const ctrlRef = useRef<ElementRef<typeof OrbitControls> | null>(null);
  const interactiveFreePreset = camPreset?.label === 'Stargazer';
  const tPos = useRef(new THREE.Vector3(...HOME_POS));
  const tLook = useRef(new THREE.Vector3(...HOME_TGT));
  const settling = useRef(true);
  const prevTrackPos = useRef(new THREE.Vector3());
  const lastDistanceReportRef = useRef(0);
  const lastDistanceValueRef = useRef(0);
  const presetTrackPos = useRef(new THREE.Vector3());

  // Compute camera offset from angle/elevation/distance
  const offsetFromAngle = useCallback((dist: number, angle: number, elevation: number): [number, number, number] => [
    dist * Math.cos(elevation) * Math.cos(angle),
    dist * Math.sin(elevation),
    dist * Math.cos(elevation) * Math.sin(angle),
  ], []);

  // Compute focus offset for a planet or moon
  const computeFocusOffset = useCallback((pp: [number, number, number]) => {
    if (focusTarget === null) return;
    if (focusTarget.moonIdx !== undefined) {
      const moons = getMoonsForPlanet(focusTarget.planetIdx);
      const moon = moons[focusTarget.moonIdx];
      if (moon) {
        const d = moon.radius * 15;
        const [ox, oy, oz] = offsetFromAngle(d, 0.7, 0.4);
        return { pos: [pp[0] + ox, pp[1] + oy, pp[2] + oz] as [number, number, number], look: pp };
      }
    } else {
      const planet = ALL_BODIES[focusTarget.planetIdx];
      const moons = getMoonsForPlanet(focusTarget.planetIdx);
      const maxMoonA = moons.length > 0 ? Math.max(...moons.map(m => m.a)) : 0;
      const d = Math.max(planet.radius * 8, maxMoonA * 2.5);
      const [ox, oy, oz] = offsetFromAngle(d, 0.7, 0.4);
      return { pos: [pp[0] + ox, pp[1] + oy, pp[2] + oz] as [number, number, number], look: pp };
    }
    return undefined;
  }, [focusTarget, offsetFromAngle]);

  const computePresetFollowOffset = useCallback((pp: [number, number, number], preset: CamPreset) => ({
    pos: [pp[0] + preset.pos[0], pp[1] + preset.pos[1], pp[2] + preset.pos[2]] as [number, number, number],
    look: pp,
  }), []);

  // Trigger transition on focus or preset changes
  // Both cinematic and interactive use the same settling approach so the
  // zoom feel is identical (snappy lerp instead of floaty two-stage drift).
  useEffect(() => {
    settling.current = true;
    if (focusTarget !== null) {
      const pp = positions.get(focusTarget.planetIdx);
      if (pp) {
        const off = computeFocusOffset(pp);
        if (off) {
          tLook.current.set(...off.look);
          tPos.current.set(...off.pos);
          prevTrackPos.current.set(...pp);
        }
      }
    } else if (camPreset?.follow !== undefined) {
      const pp = positions.get(camPreset.follow);
      if (pp) {
        const followView = computePresetFollowOffset(pp, camPreset);
        tLook.current.set(...followView.look);
        tPos.current.set(...followView.pos);
        presetTrackPos.current.set(...pp);
      } else {
        tPos.current.set(...camPreset.pos);
        tLook.current.set(...camPreset.tgt);
      }
    } else if (camPreset) {
      tPos.current.set(...camPreset.pos);
      tLook.current.set(...camPreset.tgt);
    } else {
      tPos.current.set(...HOME_POS);
      tLook.current.set(...HOME_TGT);
    }
  }, [focusTarget, camPreset, cinematic, computeFocusOffset, computePresetFollowOffset, positions]);

  // Stop transition when user grabs orbit controls
  useEffect(() => {
    const ctrl = ctrlRef.current;
    if (!ctrl) return;
    const stop = () => { if (!cinematic) settling.current = false; };
    ctrl.addEventListener('start', stop);
    return () => ctrl.removeEventListener('start', stop);
  }, [cinematic]);

  useFrame((_, dt) => {
    const ctrl = ctrlRef.current;
    const trackIdx = interactiveFreePreset && !cinematic
      ? focusTarget?.planetIdx ?? null
      : focusTarget?.planetIdx ?? camPreset?.follow ?? null;

    // Distance-adaptive lerp: faster when far from target so deep-space
    // transitions (Oort→Galaxy) don't crawl through empty blackness.
    const remainDist = camera.position.distanceTo(tPos.current);
    const smoothBase = cinematic ? 1.35 : 2.2;
    const smoothBoost = remainDist > 10000 ? 1.15 : remainDist > 1000 ? 0.75 : remainDist > 100 ? 0.35 : 0;
    const posAlpha = 1 - Math.exp(-(smoothBase + smoothBoost) * dt);
    const lookAlpha = 1 - Math.exp(-(smoothBase + smoothBoost * 0.7) * dt);
    const settleThreshold = remainDist > 10000 ? 120 : remainDist > 1000 ? 32 : remainDist > 100 ? 3 : 0.035;

    // In cinematic mode, always keep gliding (never settle)
    if (cinematic) {
      // Update target position for tracked planets
      if (trackIdx !== null) {
        const pp = positions.get(trackIdx);
        if (pp) {
          if (focusTarget !== null && focusTarget.moonIdx === undefined) {
            const planet = ALL_BODIES[trackIdx];
            const moons = getMoonsForPlanet(trackIdx);
            const maxMoonA = moons.length > 0 ? Math.max(...moons.map(m => m.a)) : 0;
            const d = Math.max(planet.radius * 8, maxMoonA * 2.5);
            const [ox, oy, oz] = offsetFromAngle(d, 0.7, 0.4);
            tPos.current.set(pp[0] + ox, pp[1] + oy, pp[2] + oz);
          } else if (camPreset?.follow === trackIdx) {
            const followView = computePresetFollowOffset(pp, camPreset);
            tPos.current.set(...followView.pos);
          }
          tLook.current.set(...pp);
        }
      }
      // Continuously glide toward current target
      camera.position.lerp(tPos.current, posAlpha);
      if (ctrl) ctrl.target.lerp(tLook.current, lookAlpha);
    } else if (trackIdx !== null) {
      // Interactive planet tracking
      const pp = positions.get(trackIdx);
      if (pp) {
        const newTarget = new THREE.Vector3(...pp);

        if (settling.current) {
          if (focusTarget !== null && focusTarget.moonIdx === undefined) {
            const planet = ALL_BODIES[trackIdx];
            const moons = getMoonsForPlanet(trackIdx);
            const maxMoonA = moons.length > 0 ? Math.max(...moons.map(m => m.a)) : 0;
            const d = Math.max(planet.radius * 8, maxMoonA * 2.5);
            const [ox, oy, oz] = offsetFromAngle(d, 0.7, 0.4);
            tPos.current.set(pp[0] + ox, pp[1] + oy, pp[2] + oz);
          } else if (camPreset?.follow === trackIdx) {
            const followView = computePresetFollowOffset(pp, camPreset);
            tPos.current.set(...followView.pos);
          }
          tLook.current.copy(newTarget);
          camera.position.lerp(tPos.current, posAlpha);
          if (ctrl) ctrl.target.lerp(tLook.current, lookAlpha);
          if (camera.position.distanceTo(tPos.current) < settleThreshold) {
            settling.current = false;
          }
        } else {
          const prevTrackedPos = focusTarget !== null ? prevTrackPos.current : presetTrackPos.current;
          const delta = newTarget.clone().sub(prevTrackedPos);
          if (delta.length() > 0.00001) {
            camera.position.add(delta);
            if (ctrl) ctrl.target.add(delta);
          }
        }
        if (focusTarget !== null) prevTrackPos.current.copy(newTarget);
        else presetTrackPos.current.copy(newTarget);
      }
    } else {
      if (settling.current) {
        camera.position.lerp(tPos.current, posAlpha);
        if (ctrl) ctrl.target.lerp(tLook.current, lookAlpha);
        if (camera.position.distanceTo(tPos.current) < settleThreshold) {
          settling.current = false;
        }
      }
    }

    // Report camera distance for UI (scale indicator)
    if (onCameraDistance) {
      const distance = camera.position.length();
      const now = performance.now();
      if (
        now - lastDistanceReportRef.current > 120 &&
        Math.abs(distance - lastDistanceValueRef.current) > Math.max(0.05, distance * 0.01)
      ) {
        lastDistanceReportRef.current = now;
        lastDistanceValueRef.current = distance;
        onCameraDistance(distance);
      }
    }

    if (ctrl) ctrl.update();
  });

  return (
    <OrbitControls
      ref={ctrlRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.05}
      maxDistance={100000}
      autoRotate={cinematic || camPreset?.autoRotate || false}
      autoRotateSpeed={cinematic ? cinematicRotateSpeed * 0.78 : camPreset?.autoRotate ? 0.1 : 0}
    />
  );
}

// ─── Scene ──────────────────────────────────────────────────────────────────────

export interface SceneProps {
  jd: number; T: number;
  simTime: Date;
  neos: NEO[]; selNeo: NEO | null; setSelNeo: (n: NEO | null) => void;
  selPlanet: number | null; setSelPlanet: (i: number | null) => void;
  focusTarget: FocusTarget | null;
  onPositionsUpdate: (m: Map<number, [number, number, number]>) => void;
  showDwarf: boolean;
  showStars: boolean;
  showConstellations: boolean;
  showAsteroidBelt: boolean;
  showComets: boolean;
  showMeteors: boolean;
  showSatellites: boolean;
  showDeepSky: boolean;
  showDeepSpace: boolean;
  constellationFocus: boolean;
  cinematic: boolean;
  cinematicRotateSpeed: number;
  onMoonSelect?: (planetIdx: number, moonIdx: number) => void;
  selMoonIdx?: number | null;
  onCameraDistance?: (d: number) => void;
  cameraDistance: number;
  camPreset?: CamPreset | null;
  showBodyGlyphs?: boolean;
  selComet: CometDef | null; setSelComet: (c: CometDef | null) => void;
  selMeteor: MeteorShower | null; setSelMeteor: (m: MeteorShower | null) => void;
  selSatellite: SatellitePosition | null; setSelSatellite: (s: SatellitePosition | null) => void;
  selSpacecraft: Spacecraft | null; setSelSpacecraft: (s: Spacecraft | null) => void;
  onConstellationSelect?: (id: string) => void;
}

export default function Scene({
  jd, T, simTime, neos, selNeo, setSelNeo, selPlanet, setSelPlanet,
  focusTarget, onPositionsUpdate, showDwarf,
  showStars, showConstellations, showAsteroidBelt,
  showComets, showMeteors, showSatellites, showDeepSky, showDeepSpace,
  constellationFocus, cinematic, cinematicRotateSpeed, onMoonSelect, selMoonIdx, onCameraDistance, cameraDistance, camPreset,
  showBodyGlyphs = false,
  selComet, setSelComet, selMeteor, setSelMeteor, selSatellite, setSelSatellite,
  selSpacecraft, setSelSpacecraft,
  onConstellationSelect,
}: SceneProps) {
  const [hov, setHov] = useState<number | null>(null);
  const [hovMoon, setHovMoon] = useState<number | null>(null);

  const positions = useMemo(() => {
    const m = new Map<number, [number, number, number]>();
    ALL_BODIES.forEach((p: PlanetDef, i: number) => m.set(i, planetXYZ(p, T)));
    return m;
  }, [T]);

  useEffect(() => { onPositionsUpdate(positions); }, [positions, onPositionsUpdate]);

  const visibleBodies = showDwarf ? ALL_BODIES : ALL_BODIES.filter(b => !b.isDwarf);

  const handleCameraDistance = onCameraDistance;

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.15} />
      <Sun cameraDistance={cameraDistance} showGlyphOverlay={showBodyGlyphs} />
      <AUGrid />
      {showAsteroidBelt && <RealAsteroidBelt jd={jd} />}
      {visibleBodies.map((p) => {
        const bodyIdx = ALL_BODIES.indexOf(p);
        return (
          <group key={p.name}>
            <OrbitRing
              planet={p} T={T}
              dim={selPlanet !== null && selPlanet !== bodyIdx}
              highlighted={selPlanet === bodyIdx}
              cameraDistance={cameraDistance}
            />
            <Planet
              planet={p} T={T}
              selected={selPlanet === bodyIdx}
              onSelect={() => setSelPlanet(selPlanet === bodyIdx ? null : bodyIdx)}
              hovered={hov === bodyIdx}
              onHover={h => setHov(h ? bodyIdx : null)}
              moonFocused={focusTarget?.planetIdx === bodyIdx && focusTarget?.moonIdx !== undefined}
              cameraDistance={cameraDistance}
              showGlyphOverlay={showBodyGlyphs}
            />
          </group>
        );
      })}
      {/* Render moons for all visible bodies */}
      {visibleBodies.map((body) => {
        const bodyIdx = ALL_BODIES.indexOf(body);
        const moons = getMoonsForPlanet(bodyIdx);
        const parentPos = positions.get(bodyIdx);
        if (!parentPos || moons.length === 0) return null;
        const isFocused = selPlanet === bodyIdx;
        return moons.map((moon, mIdx) => (
          <group key={moon.name}>
            {isFocused && <SatelliteOrbit moon={moon} parentPos={parentPos} />}
            <MoonSatellite
              moon={moon}
              parentPos={parentPos}
              jd={jd}
              selected={isFocused && selMoonIdx === mIdx}
              onSelect={isFocused && onMoonSelect ? () => onMoonSelect(bodyIdx, mIdx) : undefined}
              hovered={isFocused && hovMoon === mIdx}
              onHover={isFocused ? (h => setHovMoon(h ? mIdx : null)) : undefined}
            />
          </group>
        ));
      })}
      {neos.map(neo => (
        <group key={neo.id}>
          <NeoDot
            neo={neo} jd={jd}
            selected={selNeo?.id === neo.id}
            onSelect={() => setSelNeo(selNeo?.id === neo.id ? null : neo)}
          />
          {selNeo?.id === neo.id && <AsteroidOrbitLine neo={neo} />}
        </group>
      ))}
      <StarField visible={showStars} showDesignations={showConstellations} />
      <ConstellationLines visible={showConstellations} focus={constellationFocus} />
      <ConstellationLabels visible={showConstellations} focus={constellationFocus} onSelect={onConstellationSelect} />
      <AsterismField visible={showConstellations} />
      <DeepSkyField visible={showDeepSky} />
      <CometField
        jd={jd}
        visible={showComets}
        selComet={selComet}
        setSelComet={setSelComet}
      />
      <MeteorField
        jd={jd}
        visible={showMeteors}
        selMeteor={selMeteor}
        setSelMeteor={setSelMeteor}
      />
      <SatelliteField
        visible={showSatellites}
        simTime={simTime}
        earthPos={positions.get(2) ?? null}
        cameraDistance={cameraDistance}
        selSatellite={selSatellite}
        setSelSatellite={setSelSatellite}
      />
      <DeepSpaceField
        visible={showDeepSpace}
        selSpacecraft={selSpacecraft}
        setSelSpacecraft={setSelSpacecraft}
      />
      <CamCtrl
        focusTarget={focusTarget}
        positions={positions}
        cinematic={cinematic}
        camPreset={camPreset}
        cinematicRotateSpeed={cinematicRotateSpeed}
        onCameraDistance={handleCameraDistance}
      />
    </>
  );
}
