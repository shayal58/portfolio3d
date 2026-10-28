// Shared, per-frame light levels. LightDriver writes these once per frame;
// lights and glowing materials read them in their own useFrame.
// Plain mutable values on purpose: no React re-render every frame.

export const sceneLight = {
  /** 0 → 1 as the room lights fade up during the intro. */
  level: 0,
  /** 1 normally; lower while a panel is open, to darken the room around it. */
  ambient: 1,
};
