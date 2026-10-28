"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "@/lib/gsap";
import * as THREE from "three";
import { useSceneStore } from "@/stores/useSceneStore";
import { INTRO, windowProgress } from "@/lib/intro";
import { scrollState } from "@/lib/scroll";
import { ANGLES, FOCUS_VIEWS, VIEWS, type View } from "@/lib/room";
import type { HotspotId } from "@/data/hotspots";

// ============================================
// SECTION 1: CAMERA CONFIGURATION
// Modify camera movement here. The views
// themselves (positions/targets) are in
// src/lib/room.ts.
// ============================================
export const CAMERA_FOV = 45;

const MOVE = { duration: 1.5, ease: "power3.inOut" };
/** How far the cursor sways the camera, per mode (world units). */
const PARALLAX = {
  hero: { x: 0.35, y: 0.2 },
  explore: { x: 0.25, y: 0.14 },
  focus: { x: 0.04, y: 0.03 },
};
const FOLLOW_EASE = 0.05;
/** Idle sway of the hero camera, in metres. 0 turns it off. */
const IDLE_DRIFT = 0.12;
/** Screens narrower than this (width / height) use the portrait layouts. */
const WIDE_ASPECT = 1.1;

const v = (a: [number, number, number]) => new THREE.Vector3(...a);
const SCROLL_POS = v(VIEWS.scrollEnd.pos);
const SCROLL_TARGET = v(VIEWS.scrollEnd.target);

/** The camera view for the current state, adjusted for screen shape. */
function resolveView(focus: HotspotId | null, mode: string, aspect: number, angle = 0) {
  const wide = aspect > WIDE_ASPECT;
  if (!focus) {
    if (mode === "explore" && angle > 0) {
      // A chosen camera angle. Portrait screens step back a little.
      const a = ANGLES[angle].view;
      const pos = v(a.pos);
      const target = v(a.target);
      if (!wide) pos.sub(target).multiplyScalar(1.3).add(target);
      return { pos, target };
    }
    const base: View =
      mode === "explore"
        ? wide
          ? VIEWS.explore
          : VIEWS.exploreNarrow
        : wide
          ? VIEWS.heroWide
          : VIEWS.heroNarrow;
    return { pos: v(base.pos), target: v(base.target) };
  }
  const pos = v(FOCUS_VIEWS[focus].pos);
  const target = v(FOCUS_VIEWS[focus].target);
  if (wide) {
    // The panel opens on the right, so frame the object left of centre.
    const dir = target.clone().sub(pos);
    const right = dir.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
    target.addScaledVector(right, dir.length() * 0.22);
  } else {
    // The panel is a bottom sheet: pull back and show the object higher up.
    pos.sub(target).multiplyScalar(1.6).add(target);
    target.y -= 0.2;
  }
  return { pos, target };
}

type Props = { reducedMotion: boolean };

export function CameraController({ reducedMotion }: Props) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(size.height, 1);
  const phase = useSceneStore((s) => s.phase);
  const mode = useSceneStore((s) => s.mode);
  const focus = useSceneStore((s) => s.focus);
  const angle = useSceneStore((s) => s.angle);
  const setPhase = useSceneStore((s) => s.setPhase);

  // Animated base position and look-at target. Parallax is added on top.
  const pos = useRef(v(VIEWS.start.pos));
  const target = useRef(v(VIEWS.start.target));
  const offset = useRef(new THREE.Vector2());
  const driftAmt = useRef(0);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  // ---- Intro fly-in --------------------------------------------------
  // GSAP supplies the tween and easing, but its progress is set from real
  // elapsed time, because GSAP's own clock slows when frames are dropped.
  const intro = useRef<gsap.core.Timeline | null>(null);
  const initialAspect = useRef(aspect);
  useEffect(() => {
    const end = resolveView(null, "hero", initialAspect.current);
    const tl = gsap.timeline({ paused: true });
    tl.to(pos.current, { x: end.pos.x, y: end.pos.y, z: end.pos.z, duration: 1, ease: "power3.inOut" }, 0);
    tl.to(target.current, { x: end.target.x, y: end.target.y, z: end.target.z, duration: 1, ease: "power3.inOut" }, 0);
    intro.current = tl;
    return () => {
      tl.kill();
    };
  }, []);

  // End the intro on real time, so the page always becomes interactive.
  useEffect(() => {
    if (phase !== "intro") return;
    if (reducedMotion) {
      intro.current?.progress(1);
      setPhase("done");
      return;
    }
    const done = setTimeout(() => setPhase("done"), INTRO.total * 1000);
    return () => clearTimeout(done);
  }, [phase, reducedMotion, setPhase]);

  // ---- Moves between views (after the intro) --------------------------
  useEffect(() => {
    if (phase !== "done") return;
    const view = resolveView(focus, mode, aspect, angle);
    gsap.killTweensOf([pos.current, target.current]);
    if (reducedMotion) {
      pos.current.copy(view.pos);
      target.current.copy(view.target);
      return;
    }
    gsap.to(pos.current, { x: view.pos.x, y: view.pos.y, z: view.pos.z, ...MOVE });
    gsap.to(target.current, { x: view.target.x, y: view.target.y, z: view.target.z, ...MOVE });
  }, [phase, focus, mode, aspect, angle, reducedMotion]);

  useFrame((state) => {
    // Drive the intro from the shared clock.
    const { introStart } = useSceneStore.getState();
    if (phase !== "done" && intro.current && introStart !== null && !reducedMotion) {
      const t = (performance.now() - introStart) / 1000;
      intro.current.progress(
        windowProgress(t, INTRO.camera.start, INTRO.camera.start + INTRO.camera.duration),
      );
    }

    // Cursor sway, only once the intro is over. Touch leaves pointer at 0.
    const p = focus ? PARALLAX.focus : mode === "explore" ? PARALLAX.explore : PARALLAX.hero;
    const follow = !reducedMotion && phase === "done";
    const tx = follow ? state.pointer.x * p.x : 0;
    const ty = follow ? state.pointer.y * p.y : 0;
    offset.current.x += (tx - offset.current.x) * FOLLOW_EASE;
    offset.current.y += (ty - offset.current.y) * FOLLOW_EASE;

    // Gentle idle drift on the hero view (a slow handheld feel).
    const drift = follow && mode === "hero" ? 1 : 0;
    driftAmt.current += (drift - driftAmt.current) * 0.02;
    const time = state.clock.elapsedTime;
    const dx = Math.sin(time * 0.21) * IDLE_DRIFT * driftAmt.current;
    const dy = Math.sin(time * 0.17 + 1.3) * IDLE_DRIFT * 0.4 * driftAmt.current;

    camera.position.set(
      pos.current.x + offset.current.x + dx,
      pos.current.y + offset.current.y + dy,
      pos.current.z,
    );
    lookAt.copy(target.current);

    // Scrolling into Projects pushes the camera toward the monitor.
    if (phase === "done" && mode === "hero" && !focus) {
      const p = scrollState.progress;
      const k = reducedMotion ? 0 : p * p * (3 - 2 * p); // smoothstep
      if (k > 0) {
        camera.position.lerp(SCROLL_POS, k);
        lookAt.lerp(SCROLL_TARGET, k);
      }
    }
    camera.lookAt(lookAt);
  });

  return null;
}
