"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { profile } from "@/data/profile";
import { CABINET, DESK, HOTSPOT_POS, RIGHT_X } from "@/lib/room";
import { Box } from "./RoomShell";
import { HoverOutline, Interactive } from "./Interactive";
import { useWhiteboardTexture } from "./textures";
import { sceneLight } from "./sceneLight";
import { FLOOR_LAMP_POS } from "../Lighting";

// ============================================
// SECTION 2: LIGHTING SETTINGS (materials)
// Furniture colours, picked from the photos.
// ============================================
const C = {
  desk: "#3a3e44", // dark grey laminate
  deskEdge: "#2c2f34",
  handle: "#b8bcc2",
  plastic: "#e8b52a", // yellow plastic table and chair
  black: "#141518",
  screenGlow: "#ff8a4f",
};

export function Furniture() {
  return (
    <group>
      <DeskRun />
      <Cabinet />
      <DeskLamp />
      <YellowTable />
      <YellowChair />
      <Plant />
      <FloorLamp />
      <GlowStrip pos={[RIGHT_X - DESK.depth + 0.04, DESK.top - 0.05, (DESK.z0 + 0.4) / 2]} size={[0.012, 0.012, 0.4 - DESK.z0 - 0.1]} color="#ff7a3a" />
      <GlowStrip pos={[RIGHT_X - 0.035, DESK.top + 0.3, -0.45]} size={[0.01, 0.34, 0.6]} color="#ff642e" strength={0.8} />

      <Monitor />
      <Keyboard />
      <Mouse />
      <Books />
      <Phone />
      <PhotoFrame />
      <Whiteboard />
    </group>
  );
}

/** Invisible, easy-to-hit box around small objects. */
function Hitbox({ size, pos = [0, 0, 0] }: { size: [number, number, number]; pos?: [number, number, number] }) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// ---------- Right-wall desk ----------

function DeskRun() {
  const x = RIGHT_X - DESK.depth / 2;
  const len = DESK.z1 - DESK.z0;
  const zMid = (DESK.z0 + DESK.z1) / 2;
  const drawerZ0 = 0.4;
  const drawerZ1 = DESK.z1;
  const drawerMid = (drawerZ0 + drawerZ1) / 2;
  const h = DESK.top - 0.04;
  return (
    <group>
      {/* Top */}
      <Box pos={[x, DESK.top - 0.02, zMid]} size={[DESK.depth, 0.04, len]} color={C.desk} roughness={0.42} cast round={0.012} />
      {/* End panel near the cabinet */}
      <Box pos={[x, h / 2, DESK.z0 + 0.02]} size={[DESK.depth - 0.02, h, 0.03]} color={C.desk} cast round={0.008} />
      {/* Modesty panel against the wall */}
      <Box pos={[RIGHT_X - 0.03, h / 2 + 0.15, zMid]} size={[0.02, h - 0.3, len]} color={C.deskEdge} />
      {/* Drawer unit */}
      <Box pos={[x, h / 2, drawerMid]} size={[DESK.depth - 0.02, h, drawerZ1 - drawerZ0]} color={C.desk} cast round={0.01} />
      {[0.18, 0.38, 0.58].map((y) => (
        <group key={y}>
          <Box pos={[x - DESK.depth / 2 + 0.005, y, drawerMid]} size={[0.01, 0.006, drawerZ1 - drawerZ0 - 0.04]} color={C.deskEdge} />
          <Box pos={[x - DESK.depth / 2 - 0.005, y + 0.08, drawerMid]} size={[0.015, 0.015, 0.12]} color={C.handle} metalness={0.7} roughness={0.3} />
        </group>
      ))}
    </group>
  );
}

function Cabinet() {
  const x = RIGHT_X - CABINET.depth / 2;
  const len = CABINET.z1 - CABINET.z0;
  const zMid = (CABINET.z0 + CABINET.z1) / 2;
  const front = x - CABINET.depth / 2;
  return (
    <group>
      <Box pos={[x, CABINET.top / 2, zMid]} size={[CABINET.depth, CABINET.top, len]} color={C.desk} roughness={0.45} cast round={0.012} />
      {/* Door split and handles */}
      <Box pos={[front - 0.003, CABINET.top / 2, zMid]} size={[0.006, CABINET.top - 0.06, 0.008]} color={C.deskEdge} />
      <Box pos={[front - 0.008, CABINET.top - 0.12, zMid - 0.06]} size={[0.012, 0.09, 0.012]} color={C.handle} metalness={0.7} roughness={0.3} />
      <Box pos={[front - 0.008, CABINET.top - 0.12, zMid + 0.06]} size={[0.012, 0.09, 0.012]} color={C.handle} metalness={0.7} roughness={0.3} />
      {/* Loose papers on top */}
      <Box pos={[x + 0.02, CABINET.top + 0.012, CABINET.z1 - 0.12]} size={[0.24, 0.024, 0.3]} color="#e9e5dc" round={0.004} />
    </group>
  );
}

/** Warm desk lamp: the room's main key light. */
function DeskLamp() {
  const light = useRef<THREE.SpotLight>(null);
  const bulb = useRef<THREE.MeshBasicMaterial>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const base: [number, number, number] = [RIGHT_X - 0.14, DESK.top, -1.05];

  useFrame(() => {
    if (light.current) light.current.intensity = 7 * sceneLight.level;
    if (bulb.current) bulb.current.color.set("#ffcf9e").multiplyScalar(0.2 + 1.3 * sceneLight.level);
  });

  return (
    <group position={base}>
      <mesh position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 0.024, 24]} />
        <meshStandardMaterial color={C.black} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Arm, angled out over the desk */}
      <mesh position={[-0.06, 0.22, 0]} rotation-z={0.35}>
        <cylinderGeometry args={[0.01, 0.01, 0.44, 8]} />
        <meshStandardMaterial color={C.black} metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={[-0.16, 0.42, 0]} rotation-z={0.9}>
        <mesh castShadow>
          <coneGeometry args={[0.08, 0.13, 24, 1, true]} />
          <meshStandardMaterial color={C.black} metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial ref={bulb} color="#ffcf9e" toneMapped={false} />
        </mesh>
      </group>
      <primitive object={target} position={[-0.22, 0, 0.35]} />
      <spotLight
        ref={light}
        position={[-0.2, 0.38, 0]}
        target={target}
        color="#ffb07a"
        angle={0.95}
        penumbra={0.85}
        distance={6}
        decay={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
      />
    </group>
  );
}

/** Thin emissive strip (LED tape). Bloom makes it glow. */
function GlowStrip({
  pos,
  size,
  color,
  strength = 1.2,
}: {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  strength?: number;
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.color.set(color).multiplyScalar(strength * sceneLight.level);
  });
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshBasicMaterial ref={mat} color={color} toneMapped={false} />
    </mesh>
  );
}

/** Warm arc floor lamp in the whiteboard corner. */
function FloorLamp() {
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (glow.current) glow.current.color.set("#ffc28a").multiplyScalar(0.1 + 1.6 * sceneLight.level);
  });
  return (
    <group position={FLOOR_LAMP_POS}>
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.03, 32]} />
        <meshStandardMaterial color={C.black} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.6, 10]} />
        <meshStandardMaterial color="#b08a5a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Fabric drum shade, lit from inside */}
      <group position={[0.25, 1.5, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.17, 0.2, 0.24, 32, 1, true]} />
          <meshStandardMaterial color="#e8d6b8" roughness={0.9} side={THREE.DoubleSide} emissive="#ff9a4a" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial ref={glow} color="#ffc28a" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0.12, 1.55, 0.1]} rotation-z={-1.1}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <meshStandardMaterial color="#b08a5a" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ---------- Yellow table, chair, plant ----------

function YellowTable() {
  const top = 0.72;
  return (
    <group position={[0.15, 0, -0.95]} rotation-y={0.12}>
      <mesh position={[0, top, 0]} scale={[1.35, 1, 1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.035, 40]} />
        <meshPhysicalMaterial color={C.plastic} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>
      {/* X-shaped legs on each side */}
      {[-0.42, 0.42].map((x) =>
        [-0.5, 0.5].map((a) => (
          <mesh key={`${x}${a}`} position={[x, top / 2, 0]} rotation-x={a} castShadow>
            <boxGeometry args={[0.05, top * 1.12, 0.06]} />
            <meshStandardMaterial color={C.plastic} roughness={0.45} />
          </mesh>
        )),
      )}
      {/* Tablet on its stand, and a notebook */}
      <group position={[-0.05, top + 0.02, 0.05]} rotation-y={0.3}>
        <mesh position={[0, 0.1, 0]} rotation-x={-0.35} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.012]} />
          <meshStandardMaterial color={C.black} roughness={0.3} />
        </mesh>
        <TabletScreen />
      </group>
      <Box pos={[0.3, top + 0.025, 0.1]} size={[0.22, 0.015, 0.3]} color="#efece4" />
    </group>
  );
}

function TabletScreen() {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.color.set("#5a7bd6").multiplyScalar(0.15 + 0.35 * sceneLight.level);
  });
  return (
    <mesh position={[0, 0.1, 0.007]} rotation-x={-0.35}>
      <planeGeometry args={[0.27, 0.17]} />
      <meshBasicMaterial ref={mat} color="#5a7bd6" toneMapped={false} />
    </mesh>
  );
}

function YellowChair() {
  return (
    <group position={[0.2, 0, -1.7]} rotation-y={0.15}>
      <Box pos={[0, 0.44, 0]} size={[0.44, 0.04, 0.42]} color={C.plastic} roughness={0.3} cast round={0.018} />
      <mesh position={[0, 0.72, -0.2]} rotation-x={-0.12} castShadow>
        <boxGeometry args={[0.44, 0.5, 0.03]} />
        <meshPhysicalMaterial color={C.plastic} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>
      {[
        [-0.19, -0.18],
        [0.19, -0.18],
        [-0.19, 0.18],
        [0.19, 0.18],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} pos={[x, 0.21, z]} size={[0.035, 0.42, 0.035]} color={C.plastic} roughness={0.45} cast />
      ))}
    </group>
  );
}

/** Snake plant in a white pot, on the cabinet. */
function Plant() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: Math.sin(i * 2.4) * 0.045,
        z: Math.cos(i * 2.4) * 0.045,
        h: 0.32 + ((i * 37) % 10) / 40,
        rx: Math.sin(i * 1.7) * 0.18,
        rz: Math.cos(i * 1.3) * 0.18,
        ry: i * 0.7,
      })),
    [],
  );
  return (
    <group position={[RIGHT_X - 0.25, CABINET.top, -2.38]}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.07, 0.14, 24]} />
        <meshStandardMaterial color="#efefef" roughness={0.6} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={[l.x, 0.12 + l.h / 2, l.z]} rotation={[l.rx, l.ry, l.rz]} castShadow>
          <boxGeometry args={[0.035, l.h, 0.006]} />
          <meshStandardMaterial color={i % 3 ? "#2f6b3a" : "#3f7d45"} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- Interactive objects ----------

/** Monitor → Projects. */
function Monitor() {
  const screen = useScreenTexture();
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.color.setScalar(0.25 + 0.75 * sceneLight.level);
  });
  return (
    <Interactive id="projects" position={HOTSPOT_POS.projects} tooltipAt={[-0.05, 0.32, 0]}>
      {/* Bezel */}
      <mesh castShadow>
        <boxGeometry args={[0.03, 0.4, 0.68]} />
        <meshStandardMaterial color={C.black} roughness={0.35} metalness={0.3} />
        <HoverOutline />
      </mesh>
      {/* Screen, facing into the room */}
      <mesh position={[-0.016, 0.005, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.64, 0.36]} />
        <meshBasicMaterial ref={mat} map={screen} toneMapped={false} />
      </mesh>
      {/* Stand */}
      <Box pos={[0.03, -0.21, 0]} size={[0.03, 0.18, 0.06]} color={C.black} metalness={0.4} />
      <Box pos={[0.0, -0.297, 0]} size={[0.16, 0.012, 0.22]} color={C.black} metalness={0.4} />
    </Interactive>
  );
}

/** Code-editor style screen, drawn once on a canvas. */
function useScreenTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0d0f14";
    ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = "#151922";
    ctx.fillRect(0, 0, 130, 360);
    ctx.fillStyle = "#ff642e";
    ctx.font = "bold 22px monospace";
    ctx.fillText("PROJECTS", 160, 46);
    const palette = ["#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7", "#a1a1aa"];
    for (let i = 0; i < 12; i++) {
      const y = 80 + i * 22;
      const indent = ((i * 7) % 4) * 18;
      let x = 160 + indent;
      for (let w = 0; w < 3 + (i % 3); w++) {
        const len = 30 + ((i * 31 + w * 17) % 90);
        ctx.fillStyle = palette[(i + w) % palette.length];
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x, y, len, 8);
        x += len + 10;
      }
    }
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = "#a1a1aa";
      ctx.fillRect(18, 30 + i * 30, 70 + ((i * 13) % 30), 7);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Keyboard → Skills. Keys are one instanced mesh. */
function Keyboard() {
  const keys = useRef<THREE.InstancedMesh>(null);
  const rows = 5;
  const cols = 15;
  const setup = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh || mesh.userData.ready) return;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.makeTranslation(-0.055 + r * 0.028, 0.016, -0.2 + c * 0.0285);
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.ready = true;
    keys.current = mesh;
  };
  return (
    <Interactive id="skills" position={HOTSPOT_POS.skills} tooltipAt={[0, 0.16, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.022, 0.45]} />
        <meshStandardMaterial color="#1c1e22" roughness={0.5} />
        <HoverOutline thickness={0.004} />
      </mesh>
      <instancedMesh ref={setup} args={[undefined, undefined, rows * cols]} castShadow>
        <boxGeometry args={[0.022, 0.012, 0.023]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.6} />
      </instancedMesh>
    </Interactive>
  );
}

function Mouse() {
  return (
    <mesh position={[RIGHT_X - 0.45, DESK.top + 0.014, 0.0]} scale={[1, 0.45, 0.65]} castShadow>
      <sphereGeometry args={[0.045, 16, 12]} />
      <meshStandardMaterial color="#1c1e22" roughness={0.4} />
    </mesh>
  );
}

/** Books → Education. */
function Books() {
  const stack: Array<{ c: string; h: number; w: number; r: number }> = [
    { c: "#7a2e24", h: 0.045, w: 0.24, r: 0.05 },
    { c: "#2d3a55", h: 0.035, w: 0.22, r: -0.08 },
    { c: "#c9b48a", h: 0.04, w: 0.21, r: 0.12 },
  ];
  let y = 0;
  return (
    <Interactive id="education" position={[HOTSPOT_POS.education[0], DESK.top, HOTSPOT_POS.education[2]]} tooltipAt={[0, 0.3, 0]}>
      {stack.map((b, i) => {
        const yy = y + b.h / 2;
        y += b.h;
        return (
          <mesh key={i} position={[0, yy, 0]} rotation-y={b.r} castShadow receiveShadow>
            <boxGeometry args={[b.w * 0.75, b.h, b.w]} />
            <meshStandardMaterial color={b.c} roughness={0.7} />
            <HoverOutline thickness={0.004} />
          </mesh>
        );
      })}
      <Hitbox size={[0.3, 0.2, 0.3]} pos={[0, 0.08, 0]} />
    </Interactive>
  );
}

/** Phone → Contact. */
function Phone() {
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    // A soft pulse, like a notification waiting.
    if (glow.current)
      glow.current.color
        .set(C.screenGlow)
        .multiplyScalar(sceneLight.level * (0.25 + 0.2 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.2))));
  });
  return (
    <Interactive id="contact" position={HOTSPOT_POS.contact} rotation-y={0.35} tooltipAt={[0, 0.18, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.075, 0.01, 0.155]} />
        <meshStandardMaterial color={C.black} roughness={0.3} metalness={0.4} />
        <HoverOutline thickness={0.003} />
      </mesh>
      <mesh position={[0, 0.0055, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.066, 0.142]} />
        <meshBasicMaterial ref={glow} color={C.screenGlow} toneMapped={false} />
      </mesh>
      <Hitbox size={[0.2, 0.12, 0.25]} pos={[0, 0.05, 0]} />
    </Interactive>
  );
}

/** Framed photo of Shayal → About. */
function PhotoFrame() {
  const photo = useTexture(profile.photo);
  photo.colorSpace = THREE.SRGBColorSpace;
  return (
    <Interactive
      id="about"
      position={HOTSPOT_POS.about}
      rotation-y={-Math.PI / 2 + 0.45}
      tooltipAt={[0, 0.22, 0]}
    >
      <group rotation-x={-0.12}>
        <mesh castShadow>
          <boxGeometry args={[0.19, 0.235, 0.018]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          <HoverOutline thickness={0.004} />
        </mesh>
        <mesh position={[0, 0, 0.0095]}>
          <planeGeometry args={[0.156, 0.195]} />
          <meshStandardMaterial map={photo} roughness={0.6} />
        </mesh>
      </group>
      <Hitbox size={[0.26, 0.3, 0.12]} />
    </Interactive>
  );
}

/** Whiteboard on its easel → Work experience. */
function Whiteboard() {
  const tex = useWhiteboardTexture();
  return (
    <Interactive id="work" position={HOTSPOT_POS.work} rotation-y={0.55} tooltipAt={[0, 0.55, 0]}>
      <group rotation-x={-0.16}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.02, 0.74, 0.025]} />
          <meshStandardMaterial color="#c9ccd1" metalness={0.6} roughness={0.35} />
          <HoverOutline thickness={0.008} />
        </mesh>
        <mesh position={[0, 0, 0.0135]}>
          <planeGeometry args={[0.96, 0.68]} />
          <meshStandardMaterial map={tex} roughness={0.35} />
        </mesh>
      </group>
      {/* Easel legs and the small wooden stand under it */}
      {[-0.42, 0.42].map((x) => (
        <Box key={x} pos={[x, -0.6, -0.1]} size={[0.03, 0.9, 0.03]} color="#8a6a48" cast />
      ))}
      <Box pos={[0, -0.95, -0.05]} size={[0.95, 0.04, 0.35]} color="#8a6a48" cast />
    </Interactive>
  );
}
