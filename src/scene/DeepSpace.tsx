/*
 * Deep space layer — Oort Cloud, spacecraft, nearby stars, galaxy markers
 */

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  OORT_CLOUD, SPACECRAFT, NEARBY_STARS, LOCAL_GROUP,
  PC_TO_AU, STAR_DISPLAY_CAP_AU,
  heliocentricXYZ, raDecToSphere,
} from '../data/deepspace';
import type { Spacecraft } from '../data/deepspace';

const DEEP_SPACE_SPHERE_RADIUS = 920;

const milkyWayVertexShader = `
  varying vec3 vWorldPos;
  varying vec3 vLocalDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vLocalDir = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const milkyWayFragmentShader = `
  varying vec3 vWorldPos;
  varying vec3 vLocalDir;

  uniform vec3 centerDir;
  uniform float bandOpacity;

  void main() {
    vec3 dir = normalize(vWorldPos);
    float latitude = abs(vLocalDir.y);
    float band = smoothstep(0.32, 0.04, latitude);

    float centerFalloff = max(dot(dir, normalize(centerDir)), 0.0);
    centerFalloff = pow(centerFalloff, 8.0);

    float dust = 0.7 + 0.3 * sin(dir.x * 28.0 + dir.z * 15.0) * sin(dir.y * 24.0 + dir.x * 11.0);
    float opacity = band * bandOpacity * dust + centerFalloff * 0.38;

    vec3 bandColor = vec3(0.16, 0.24, 0.34);
    vec3 coreColor = vec3(0.96, 0.78, 0.54);
    vec3 color = mix(bandColor, coreColor, centerFalloff * 0.9);

    gl_FragColor = vec4(color, opacity);
  }
`;

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function GlowSprite({
  color,
  opacity,
  position,
  scale,
}: {
  color: string;
  opacity: number;
  position: [number, number, number];
  scale: [number, number, number];
}) {
  const texture = useMemo(() => makeGlowTexture(), []);

  if (!texture) return null;

  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial
        color={color}
        map={texture}
        alphaMap={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

function MilkyWayBackdrop() {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const centerDir = useMemo(() => new THREE.Vector3(...raDecToSphere(266.4, -29.0, 1)).normalize(), []);
  const uniforms = useMemo(() => ({
    centerDir: { value: centerDir },
    bandOpacity: { value: 0.24 },
  }), [centerDir]);

  useFrame((_, dt) => {
    if (!materialRef.current) return;
    const t = performance.now() * 0.00005;
    materialRef.current.uniforms.bandOpacity.value = 0.23 + Math.sin(t + dt) * 0.02;
  });

  return (
    <group rotation={[0.98, 0.54, -0.22]}>
      <mesh>
        <sphereGeometry args={[DEEP_SPACE_SPHERE_RADIUS, 96, 96]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={milkyWayVertexShader}
          fragmentShader={milkyWayFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <GlowSprite color="#ffd29a" opacity={0.3} position={raDecToSphere(266.4, -29.0, DEEP_SPACE_SPHERE_RADIUS - 20)} scale={[240, 160, 1]} />
      <GlowSprite color="#8fbaff" opacity={0.12} position={raDecToSphere(85.0, 0.0, DEEP_SPACE_SPHERE_RADIUS - 10)} scale={[340, 110, 1]} />
    </group>
  );
}

// ─── Oort Cloud (instanced particle shell) ──────────────────────────────────

function OortCloud() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const initializedRef = useRef(false);

  const [matrices] = useState(() => {
    const { innerRadius, outerRadius, particleCount } = OORT_CLOUD;
    const arr = new Float32Array(particleCount * 16);
    const mat4 = new THREE.Matrix4();

    for (let i = 0; i < particleCount; i++) {
      // Spherical shell distribution
      const u = Math.random();
      // Bias toward outer regions (cubic distribution in radius)
      const r = innerRadius + (outerRadius - innerRadius) * Math.cbrt(u);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.sin(phi);

      const scale = 0.3 + Math.random() * 0.5;
      mat4.makeTranslation(x, y, z);
      mat4.scale(new THREE.Vector3(scale, scale, scale));
      mat4.toArray(arr, i * 16);
    }
    return arr;
  });

  // Apply matrices on mount
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || initializedRef.current) return;
    const { particleCount } = OORT_CLOUD;
    const mat4 = new THREE.Matrix4();
    for (let i = 0; i < particleCount; i++) {
      mat4.fromArray(matrices, i * 16);
      mesh.setMatrixAt(i, mat4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    initializedRef.current = true;
  });

  // Slow rotation for visual interest
  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.0005;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, OORT_CLOUD.particleCount]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#aaccff" transparent opacity={0.12} toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Spacecraft markers ─────────────────────────────────────────────────────

function SpacecraftDot({ craft, selected, onSelect }: {
  craft: Spacecraft; selected: boolean; onSelect: () => void;
}) {
  const pos = useMemo(
    () => heliocentricXYZ(craft.ra, craft.dec, craft.distAU),
    [craft.ra, craft.dec, craft.distAU],
  );

  const color = craft.status === 'active' ? '#44ff88' : '#888888';
  const size = selected ? 1.5 : 0.8;

  // Trajectory line: from Sun origin through current position, extending 20% beyond
  const linePoints = useMemo(() => {
    const origin = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(...pos);
    const extended = end.clone().multiplyScalar(1.2);
    return [origin, end, extended];
  }, [pos]);

  return (
    <group>
      {/* Trajectory line */}
      <Line
        points={linePoints}
        color={color}
        lineWidth={0.5}
        transparent
        opacity={0.25}
      />
      {/* Craft dot */}
      <mesh
        position={pos}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Glow */}
      <GlowSprite color={color} opacity={0.3} position={pos} scale={[size * 4, size * 4, 1]} />
      {/* Label */}
      <Html position={[pos[0], pos[1] + 3, pos[2]]} center distanceFactor={50} style={{ pointerEvents: 'none' }} zIndexRange={[1, 0]}>
        <div style={{
          color: selected ? '#fff' : 'rgba(255,255,255,0.7)',
          fontSize: 9,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: selected ? 600 : 400,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          textShadow: '0 0 6px rgba(0,0,0,0.9)',
        }}>
          {craft.name}
          <br />
          <span style={{ fontSize: 7, opacity: 0.6 }}>{craft.distAU} AU</span>
        </div>
      </Html>
    </group>
  );
}

function SpacecraftMarkers({ selSpacecraft, setSelSpacecraft }: {
  selSpacecraft: Spacecraft | null;
  setSelSpacecraft: (s: Spacecraft | null) => void;
}) {
  return (
    <group>
      {SPACECRAFT.map(craft => (
        <SpacecraftDot
          key={craft.name}
          craft={craft}
          selected={selSpacecraft?.name === craft.name}
          onSelect={() => setSelSpacecraft(selSpacecraft?.name === craft.name ? null : craft)}
        />
      ))}
    </group>
  );
}

// ─── Nearby star markers ────────────────────────────────────────────────────

function NearStarMarkers() {
  return (
    <group>
      {NEARBY_STARS.map(star => {
        const distAU = star.distPC * PC_TO_AU;
        const capped = Math.min(distAU, STAR_DISPLAY_CAP_AU);
        const pos = heliocentricXYZ(star.ra, star.dec, capped);

        // Color by spectral type
        const isMDwarf = star.spectral.startsWith('M');
        const isAType = star.spectral.startsWith('A');
        const color = isMDwarf ? '#ff6644' : isAType ? '#aaccff' : '#ffeecc';
        const size = isAType ? 2.5 : isMDwarf ? 1.2 : 1.8;
        const ly = (star.distPC * 3.262).toFixed(1);

        return (
          <group key={star.name}>
            <mesh position={pos}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            {/* Glow sprite */}
            <GlowSprite color={color} opacity={0.25} position={pos} scale={[size * 6, size * 6, 1]} />
            <Html position={[pos[0], pos[1] + 4, pos[2]]} center distanceFactor={200} style={{ pointerEvents: 'none' }} zIndexRange={[1, 0]}>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 8,
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                textShadow: '0 0 8px rgba(0,0,0,0.9)',
              }}>
                {star.name}
                <br />
                <span style={{ fontSize: 7, opacity: 0.5 }}>{ly} ly</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ─── Galaxy markers (on celestial sphere) ───────────────────────────────────

function GalaxyMarkers() {
  return (
    <group>
      {LOCAL_GROUP.map(gal => {
        const pos = raDecToSphere(gal.ra, gal.dec, DEEP_SPACE_SPHERE_RADIUS - 90);
        const isSpiral = gal.type === 'Spiral';
        const color = isSpiral ? '#ccaaff' : '#88aacc';
        const size = isSpiral ? 3 : 1.8;
        const distLabel = gal.distKpc >= 100
          ? `${(gal.distKpc / 1000).toFixed(1)} Mpc`
          : `${gal.distKpc} kpc`;

        return (
          <group key={gal.name}>
            {/* Galaxy dot */}
            <mesh position={pos}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            {/* Diffuse glow */}
            <GlowSprite color={color} opacity={0.15} position={pos} scale={[size * 8, size * 5, 1]} />
            <Html position={[pos[0], pos[1] + 5, pos[2]]} center distanceFactor={200} style={{ pointerEvents: 'none' }} zIndexRange={[1, 0]}>
              <div style={{
                color: 'rgba(200,180,255,0.7)',
                fontSize: 8,
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                textShadow: '0 0 8px rgba(0,0,0,0.9)',
              }}>
                {gal.name}
                <br />
                <span style={{ fontSize: 7, opacity: 0.5 }}>{distLabel}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export interface DeepSpaceProps {
  visible: boolean;
  selSpacecraft: Spacecraft | null;
  setSelSpacecraft: (s: Spacecraft | null) => void;
}

export function DeepSpaceField({ visible, selSpacecraft, setSelSpacecraft }: DeepSpaceProps) {
  if (!visible) return null;
  return (
    <group>
      <MilkyWayBackdrop />
      <OortCloud />
      <SpacecraftMarkers selSpacecraft={selSpacecraft} setSelSpacecraft={setSelSpacecraft} />
      <NearStarMarkers />
      <GalaxyMarkers />
    </group>
  );
}
