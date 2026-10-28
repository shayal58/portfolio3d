"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/stores/useSceneStore";
import { INTRO, ease, windowProgress } from "@/lib/intro";
import { DESK, HOTSPOT_POS, LEFT_X, RIGHT_X, ROOM } from "@/lib/room";
import { sceneLight } from "./room/sceneLight";
import { scrollState } from "@/lib/scroll";

// ============================================
// SECTION 2: LIGHTING SETTINGS
// An evening room with the lights on: two
// ceiling downlights (like the recessed lights in
// the photos) light the whole room, and warmer
// pools add contrast on top. Every light is scaled
// by sceneLight.level (0 while loading, 1 after the
// intro). The desk lamp's spotlight is in
// room/Furniture.tsx. To make the room brighter or
// darker overall, change `downlight` and `ambient`.
//
//  fill      soft ambient + sky/floor bounce
//  downlight warm-white ceiling spots over the rug and the desk
//  cove      warm, washes the ceiling and upper walls
//  moon      cool, through the curtain gap onto the floor
//  floorLamp warm pool on the whiteboard corner
//  underDesk warm LED strip glow on the floor
//  monitor   screen spill onto the desk + backlight halo on the wall
// ============================================
const LIGHTS = {
  ambient: { color: "#c4c8d8", intensity: 0.4 },
  hemi: { sky: "#cdd6ee", ground: "#6a4a32", intensity: 0.6 },
  downlight: { color: "#ffe2bf", intensity: 10, distance: 7 },
  cove: { color: "#ffb36b", intensity: 5.5, distance: 6 },
  moon: { color: "#8fb0ff", intensity: 24 },
  floorLamp: { color: "#ffa45c", intensity: 8, distance: 4.5 },
  underDesk: { color: "#ff7a3a", intensity: 1.4, distance: 1.6 },
  monitor: { color: "#ff9a62", intensity: 0.9, distance: 1.6 },
  backlight: { color: "#ff642e", intensity: 1.6, distance: 1.1 },
  hover: { color: "#ff642e", intensity: 1.6, distance: 1.4 },
};

/** How dark the rest of the room gets while a panel is open (0–1). */
const FOCUS_DIM = 0.6;
/** How much the room dims by the time the Projects section covers it. */
const SCROLL_DIM = 0.45;
/** Reflection strength from the environment (see Experience.tsx). */
const ENV_INTENSITY = 0.35;

/** Where the floor lamp stands (front-left of the whiteboard). */
export const FLOOR_LAMP_POS: [number, number, number] = [LEFT_X + 0.45, 0, -2.2];

const tmp = new THREE.Vector3();

/** Recessed ceiling spots: one in the raised tray over the rug, one over the desk. */
const DOWNLIGHTS: Array<{ pos: [number, number, number]; target: [number, number, number] }> = [
  { pos: [-0.4, ROOM.tray.height - 0.02, 0.4], target: [-0.2, 0, 0.2] },
  { pos: [RIGHT_X - 1.1, ROOM.height - 0.02, -0.6], target: [RIGHT_X - 0.5, DESK.top, -0.6] },
];

type Props = { reducedMotion: boolean };

/** Updates the shared light levels once per frame. Mount before other scene parts. */
export function LightDriver({ reducedMotion }: Props) {
  useFrame(({ scene }) => {
    const { introStart, phase, focus } = useSceneStore.getState();
    if (phase === "loading" || introStart === null) sceneLight.level = 0;
    else if (reducedMotion || phase === "done") sceneLight.level = 1;
    else {
      const t = (performance.now() - introStart) / 1000;
      sceneLight.level = ease.outCubic(windowProgress(t, INTRO.roomLights.start, INTRO.roomLights.end));
    }
    const target = focus ? FOCUS_DIM : 1 - SCROLL_DIM * scrollState.progress;
    sceneLight.ambient += (target - sceneLight.ambient) * (reducedMotion ? 1 : 0.06);
    scene.environmentIntensity = ENV_INTENSITY * sceneLight.level * sceneLight.ambient;
  });
  return null;
}

type LightingProps = { quality: "high" | "low" };

export function Lighting({ quality }: LightingProps) {
  const refs = {
    ambient: useRef<THREE.AmbientLight>(null),
    hemi: useRef<THREE.HemisphereLight>(null),
    downA: useRef<THREE.SpotLight>(null),
    downB: useRef<THREE.SpotLight>(null),
    coveA: useRef<THREE.PointLight>(null),
    coveB: useRef<THREE.PointLight>(null),
    moon: useRef<THREE.SpotLight>(null),
    floorLamp: useRef<THREE.PointLight>(null),
    underDesk: useRef<THREE.PointLight>(null),
    monitor: useRef<THREE.PointLight>(null),
    backlight: useRef<THREE.PointLight>(null),
    hover: useRef<THREE.PointLight>(null),
  };
  const downTargets = useMemo(
    () =>
      DOWNLIGHTS.map((d) => {
        const o = new THREE.Object3D();
        o.position.set(...d.target);
        return o;
      }),
    [],
  );
  const moonTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0.45, 0, 0.6); // pool of moonlight on the rug
    return o;
  }, []);

  useFrame(() => {
    const L = sceneLight.level;
    const A = sceneLight.ambient;
    const set = (r: React.RefObject<THREE.Light | null>, v: number) => {
      if (r.current) r.current.intensity = v;
    };
    set(refs.ambient, LIGHTS.ambient.intensity * L * A);
    set(refs.hemi, LIGHTS.hemi.intensity * L * A);
    set(refs.downA, LIGHTS.downlight.intensity * L * A);
    set(refs.downB, LIGHTS.downlight.intensity * 0.6 * L * A);
    set(refs.coveA, LIGHTS.cove.intensity * L * A);
    set(refs.coveB, LIGHTS.cove.intensity * L * A);
    // Moonlight is outside: it is there even before the room lights come on.
    set(refs.moon, LIGHTS.moon.intensity * (0.4 + 0.6 * L) * A);
    set(refs.floorLamp, LIGHTS.floorLamp.intensity * L * A);
    set(refs.underDesk, LIGHTS.underDesk.intensity * L);
    set(refs.monitor, LIGHTS.monitor.intensity * (0.3 + 0.7 * L));
    set(refs.backlight, LIGHTS.backlight.intensity * L);

    // Hover light glides to whatever is under the cursor.
    const { hovered, focus } = useSceneStore.getState();
    const hover = refs.hover.current;
    if (hover) {
      const target = hovered && hovered !== focus ? LIGHTS.hover.intensity : 0;
      hover.intensity += (target - hover.intensity) * 0.15;
      if (hovered) {
        const [x, y, z] = HOTSPOT_POS[hovered];
        hover.position.lerp(tmp.set(x - 0.35, y + 0.25, z), 0.25);
      }
    }
  });

  const t = ROOM.tray;
  const high = quality === "high";
  const coveY = ROOM.height - 0.08;

  return (
    <>
      <ambientLight ref={refs.ambient} color={LIGHTS.ambient.color} intensity={0} />
      <hemisphereLight ref={refs.hemi} args={[LIGHTS.hemi.sky, LIGHTS.hemi.ground, 0]} />

      {/* Ceiling downlights: the room's main light */}
      <primitive object={downTargets[0]} />
      <primitive object={downTargets[1]} />
      {DOWNLIGHTS.map((d, i) => (
        <group key={i}>
          <spotLight
            ref={i === 0 ? refs.downA : refs.downB}
            color={LIGHTS.downlight.color}
            position={d.pos}
            target={downTargets[i]}
            angle={1.0}
            penumbra={0.9}
            distance={LIGHTS.downlight.distance}
            decay={1.5}
            intensity={0}
          />
          {/* The fitting itself: a glowing disc in the ceiling */}
          <mesh position={[d.pos[0], d.pos[1] + 0.015, d.pos[2]]} rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.07, 24]} />
            <meshBasicMaterial color="#fff1dc" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Cove: just under the ceiling, short reach, so the top of the room glows */}
      <pointLight ref={refs.coveA} color={LIGHTS.cove.color} position={[-0.6, coveY, t.z0 + 0.25]} distance={LIGHTS.cove.distance} decay={2} intensity={0} />
      <pointLight ref={refs.coveB} color={LIGHTS.cove.color} position={[0.9, coveY, t.z1 - 0.25]} distance={LIGHTS.cove.distance} decay={2} intensity={0} />

      {/* Moonlight from outside, through the gap in the curtains */}
      <primitive object={moonTarget} />
      <spotLight
        ref={refs.moon}
        color={LIGHTS.moon.color}
        position={[0.6, 2.3, ROOM.backZ - 1.6]}
        target={moonTarget}
        angle={0.42}
        penumbra={0.5}
        distance={9}
        decay={1.4}
        intensity={0}
        castShadow={high}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />

      {/* Warm floor lamp in the whiteboard corner */}
      <pointLight ref={refs.floorLamp} color={LIGHTS.floorLamp.color} position={[FLOOR_LAMP_POS[0] + 0.25, 1.45, FLOOR_LAMP_POS[2] + 0.2]} distance={LIGHTS.floorLamp.distance} decay={2} intensity={0} />

      {/* Screen spill onto the desk */}
      <pointLight ref={refs.monitor} color={LIGHTS.monitor.color} position={[RIGHT_X - 0.55, 1.05, -0.45]} distance={LIGHTS.monitor.distance} decay={2} intensity={0} />

      {high && (
        <>
          {/* LED strip under the desk */}
          <pointLight ref={refs.underDesk} color={LIGHTS.underDesk.color} position={[RIGHT_X - 0.5, 0.25, -0.4]} distance={LIGHTS.underDesk.distance} decay={2} intensity={0} />
          {/* Backlight halo behind the monitor */}
          <pointLight ref={refs.backlight} color={LIGHTS.backlight.color} position={[RIGHT_X - 0.06, DESK.top + 0.32, -0.45]} distance={LIGHTS.backlight.distance} decay={2} intensity={0} />
        </>
      )}

      {/* Hover highlight, always mounted so adding it never triggers a shader recompile */}
      <pointLight ref={refs.hover} color={LIGHTS.hover.color} distance={LIGHTS.hover.distance} decay={2} intensity={0} />
    </>
  );
}
