"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM, LEFT_X, RIGHT_X } from "@/lib/room";
import { RoundedBox } from "@react-three/drei";
import { usePaintTexture, useRugTexture, useWoodTexture } from "./textures";
import { sceneLight } from "./sceneLight";

// ============================================
// SECTION 2: LIGHTING SETTINGS (materials)
// Room surface colours, picked from the photos.
// ============================================
const COLORS = {
  wall: "#bcc3cb", // pale grey-blue paint
  ceiling: "#d9d6cf",
  trim: "#5a4636", // dark skirting board
  curtain: "#c4b7a3", // beige curtains
  windowGlow: "#6f8fd6", // night sky through the window
  cove: "#ffb36b", // warm LED strip in the ceiling
  doorway: "#0b0b0c",
};

const D = ROOM.frontZ - ROOM.backZ; // room depth

/** Window opening in the back wall: centre x, sill and top heights, width. */
const WIN = { cx: 0.55, y0: 0.4, y1: 2.3, w: 1.9 };
const winX0 = WIN.cx - WIN.w / 2;
const winX1 = WIN.cx + WIN.w / 2;
/** Back wall as four pieces around the opening: [x, y, width, height]. */
const BACK_WALL_PIECES: Array<[number, number, number, number]> = [
  [(LEFT_X + winX0) / 2, ROOM.height / 2, winX0 - LEFT_X, ROOM.height],
  [(winX1 + RIGHT_X) / 2, ROOM.height / 2, RIGHT_X - winX1, ROOM.height],
  [WIN.cx, WIN.y0 / 2, WIN.w, WIN.y0],
  [WIN.cx, (WIN.y1 + ROOM.height) / 2, WIN.w, ROOM.height - WIN.y1],
];
const midZ = (ROOM.frontZ + ROOM.backZ) / 2;

type Props = { reducedMotion: boolean };

export function RoomShell({ reducedMotion }: Props) {
  const wood = useWoodTexture();
  const rug = useRugTexture();
  const paint = usePaintTexture();

  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]} receiveShadow>
        <planeGeometry args={[ROOM.width, D]} />
        <meshStandardMaterial map={wood} roughness={0.45} metalness={0} envMapIntensity={0.7} />
      </mesh>

      {/* Rug */}
      <mesh rotation-x={-Math.PI / 2} position={[-0.25, 0.006, 0.35]} receiveShadow>
        <planeGeometry args={[2.1, 2.9]} />
        <meshLambertMaterial map={rug} />
      </mesh>

      {/* Back wall, built around a real window opening so moonlight only
          comes in through the window (and the gap in the curtains). */}
      {BACK_WALL_PIECES.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, ROOM.backZ]} castShadow receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshLambertMaterial color={COLORS.wall} map={paint} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Left wall */}
      <mesh position={[LEFT_X, ROOM.height / 2, midZ]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[D, ROOM.height]} />
        <meshLambertMaterial color={COLORS.wall} map={paint} />
      </mesh>
      {/* Right wall (desk wall) */}
      <mesh position={[RIGHT_X, ROOM.height / 2, midZ]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[D, ROOM.height]} />
        <meshLambertMaterial color={COLORS.wall} map={paint} />
      </mesh>

      {/* Skirting boards */}
      <Box pos={[0, 0.04, ROOM.backZ + 0.01]} size={[ROOM.width, 0.08, 0.02]} color={COLORS.trim} />
      <Box pos={[LEFT_X + 0.01, 0.04, midZ]} size={[0.02, 0.08, D]} color={COLORS.trim} />
      <Box pos={[RIGHT_X - 0.01, 0.04, midZ]} size={[0.02, 0.08, D]} color={COLORS.trim} />

      <Window />
      <Doorway />
      <TrayCeiling />
      <CeilingFan reducedMotion={reducedMotion} />

      {/* Wall switch plates, as in the photos */}
      <Box pos={[LEFT_X + 0.01, 1.2, 1.75]} size={[0.01, 0.1, 0.16]} color="#2b2b2b" />
      <Box pos={[RIGHT_X - 0.01, 1.2, -2.25]} size={[0.01, 0.1, 0.16]} color="#2b2b2b" />
    </group>
  );
}

/** Window on the back wall with heavy pleated curtains, slightly open. */
function Window() {
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    // Night sky glow is visible even before the room lights come up.
    if (glowMat.current) glowMat.current.opacity = 0.35 + 0.65 * sceneLight.level;
  });

  const cx = 0.55; // window centre (x)
  const rodY = 2.42;
  return (
    <group>
      {/* Glass, glowing cool blue */}
      <mesh position={[cx, 1.35, ROOM.backZ - 0.03]}>
        <planeGeometry args={[1.9, 1.9]} />
        <meshBasicMaterial ref={glowMat} color={COLORS.windowGlow} transparent toneMapped={false} />
      </mesh>
      {/* Frame and mullion */}
      <Box pos={[cx, 1.35, ROOM.backZ + 0.03]} size={[0.05, 1.9, 0.04]} color="#e8e8e8" />
      <Box pos={[cx, 0.4, ROOM.backZ + 0.03]} size={[1.95, 0.06, 0.05]} color="#e8e8e8" />
      {/* Curtain rod */}
      <mesh position={[cx, rodY, ROOM.backZ + 0.12]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.015, 0.015, 3.2, 10]} />
        <meshStandardMaterial color="#9a9a9a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Two curtains, with a gap showing the window */}
      <Curtain x={cx - 0.95} z={ROOM.backZ + 0.12} width={1.35} height={rodY - 0.02} folds={9} />
      <Curtain x={cx + 0.95} z={ROOM.backZ + 0.12} width={1.35} height={rodY - 0.02} folds={9} />
    </group>
  );
}

/** Doorway on the left wall, with a curtain gathered beside it. */
function Doorway() {
  const z0 = 0.35;
  const z1 = 1.35;
  const h = 2.1;
  return (
    <group>
      <mesh position={[LEFT_X + 0.006, h / 2, (z0 + z1) / 2]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[z1 - z0, h]} />
        <meshBasicMaterial color={COLORS.doorway} />
      </mesh>
      <Box pos={[LEFT_X + 0.03, h + 0.03, (z0 + z1) / 2]} size={[0.06, 0.06, z1 - z0 + 0.12]} color="#cfcfcf" />
      <Box pos={[LEFT_X + 0.03, h / 2, z0 - 0.03]} size={[0.06, h, 0.06]} color="#cfcfcf" />
      <Box pos={[LEFT_X + 0.03, h / 2, z1 + 0.03]} size={[0.06, h, 0.06]} color="#cfcfcf" />
      {/* Rod and gathered curtain */}
      <mesh position={[LEFT_X + 0.12, 2.42, 1.3]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.015, 0.015, 1.6, 10]} />
        <meshStandardMaterial color="#9a9a9a" metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[LEFT_X + 0.12, 0, 1.85]} rotation-y={Math.PI / 2}>
        <Curtain x={0} z={0} width={0.7} height={2.4} folds={6} />
      </group>
    </group>
  );
}

/** Pleated fabric: a plane bent into a sine wave. */
function Curtain({
  x,
  z,
  width,
  height,
  folds,
}: {
  x: number;
  z: number;
  width: number;
  height: number;
  folds: number;
}) {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, folds * 8, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      pos.setZ(i, Math.sin((px / width) * folds * Math.PI * 2) * 0.045);
    }
    g.computeVertexNormals();
    return g;
  }, [width, height, folds]);

  return (
    <mesh geometry={geom} position={[x, height / 2, z]} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={COLORS.curtain}
        roughness={0.95}
        sheen={1}
        sheenRoughness={0.6}
        sheenColor="#fff1dc"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Stepped tray ceiling with crossed beams and a warm LED cove, as in the photos. */
function TrayCeiling() {
  const t = ROOM.tray;
  const coveMats = useRef<THREE.MeshBasicMaterial[]>([]);
  useFrame(() => {
    const k = sceneLight.level * (0.55 + 0.45 * sceneLight.ambient);
    coveMats.current.forEach((m) => m && m.color.set(COLORS.cove).multiplyScalar(0.25 + 1.6 * k));
  });

  const w = t.x1 - t.x0;
  const d = t.z1 - t.z0;
  const cx = (t.x0 + t.x1) / 2;
  const cz = (t.z0 + t.z1) / 2;
  const step = t.height - ROOM.height;
  const H = ROOM.height;

  // Lower ceiling: four strips around the raised centre.
  const lower: Array<[number, number, number, number]> = [
    // [x, z, width, depth]
    [0, (ROOM.backZ + t.z0) / 2, ROOM.width, t.z0 - ROOM.backZ],
    [0, (t.z1 + ROOM.frontZ) / 2, ROOM.width, ROOM.frontZ - t.z1],
    [(LEFT_X + t.x0) / 2, cz, t.x0 - LEFT_X, d],
    [(t.x1 + RIGHT_X) / 2, cz, RIGHT_X - t.x1, d],
  ];
  // Cove LED strips along the inside of the step.
  const coves: Array<[number, number, number, number]> = [
    [cx, t.z0 + 0.03, w, 0.03],
    [cx, t.z1 - 0.03, w, 0.03],
    [t.x0 + 0.03, cz, 0.03, d],
    [t.x1 - 0.03, cz, 0.03, d],
  ];

  return (
    <group>
      {lower.map(([x, z, ww, dd], i) => (
        <mesh key={`l${i}`} position={[x, H, z]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[ww, dd]} />
          <meshLambertMaterial color={COLORS.ceiling} />
        </mesh>
      ))}
      {/* Raised centre */}
      <mesh position={[cx, t.height, cz]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[w, d]} />
        <meshLambertMaterial color={COLORS.ceiling} />
      </mesh>
      {/* Vertical step faces */}
      <Box pos={[cx, H + step / 2, t.z0]} size={[w, step, 0.02]} color={COLORS.ceiling} />
      <Box pos={[cx, H + step / 2, t.z1]} size={[w, step, 0.02]} color={COLORS.ceiling} />
      <Box pos={[t.x0, H + step / 2, cz]} size={[0.02, step, d]} color={COLORS.ceiling} />
      <Box pos={[t.x1, H + step / 2, cz]} size={[0.02, step, d]} color={COLORS.ceiling} />
      {/* Glowing cove strips */}
      {coves.map(([x, z, ww, dd], i) => (
        <mesh key={`c${i}`} position={[x, H + 0.02, z]}>
          <boxGeometry args={[ww, 0.02, dd]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) coveMats.current[i] = m;
            }}
            color={COLORS.cove}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Crossed decorative beams in the recess */}
      {[0.62, -0.62].map((angle) => (
        <mesh key={angle} position={[cx, t.height - 0.05, cz]} rotation-y={angle}>
          <boxGeometry args={[Math.hypot(w, d) * 0.95, 0.08, 0.16]} />
          <meshStandardMaterial color="#b9b2a6" roughness={1} />
        </mesh>
      ))}
      {/* Frame around the beams' crossing, like the star in the photo */}
      <mesh position={[cx, t.height - 0.05, cz]} rotation-x={Math.PI / 2}>
        <ringGeometry args={[0.32, 0.4, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color="#b9b2a6" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Three-blade ceiling fan at the centre of the tray. */
function CeilingFan({ reducedMotion }: { reducedMotion: boolean }) {
  const blades = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (blades.current && !reducedMotion) blades.current.rotation.y += dt * 0.9;
  });
  const t = ROOM.tray;
  const cx = (t.x0 + t.x1) / 2;
  const cz = (t.z0 + t.z1) / 2;
  return (
    <group position={[cx, t.height, cz]}>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#c9c4bb" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={blades} position={[0, -0.36, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.12, 0.09, 20]} />
          <meshStandardMaterial color="#c9c4bb" metalness={0.6} roughness={0.35} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation-y={(i * Math.PI * 2) / 3}
            position={[
              Math.cos((i * Math.PI * 2) / 3) * 0.45,
              0,
              -Math.sin((i * Math.PI * 2) / 3) * 0.45,
            ]}
            castShadow
          >
            <boxGeometry args={[0.72, 0.012, 0.12]} />
            <meshStandardMaterial color="#d4cfc6" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Small helper for plain boxes. */
export function Box({
  pos,
  size,
  color,
  roughness = 0.8,
  metalness = 0,
  cast = false,
  round = 0,
}: {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
  cast?: boolean;
  /** Edge radius in metres. Real furniture never has razor-sharp edges. */
  round?: number;
}) {
  const material = <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
  if (round > 0) {
    return (
      <RoundedBox args={size} radius={round} smoothness={3} position={pos} castShadow={cast} receiveShadow>
        {material}
      </RoundedBox>
    );
  }
  return (
    <mesh position={pos} castShadow={cast} receiveShadow>
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}
