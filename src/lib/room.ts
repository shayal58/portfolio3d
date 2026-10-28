import type { HotspotId } from "@/data/hotspots";

// ============================================
// SECTION 3: INTERACTIVE OBJECTS
// Room layout, in metres. Based on Shayal's room:
// window with curtains on the back wall, desk and
// cabinet along the right wall, doorway on the left,
// yellow table, whiteboard, rug, tray ceiling + fan.
//   x: left (-) to right (+)
//   y: floor (0) up
//   z: back wall (-) toward the viewer (+)
// ============================================

export const ROOM = {
  width: 7, // x from -3.5 to 3.5
  backZ: -2.6,
  frontZ: 3.2, // open side, where the camera is
  height: 2.8,
  /** Raised centre of the tray ceiling. */
  tray: { x0: -2.1, x1: 2.1, z0: -1.7, z1: 1.5, height: 3.05 },
};

export const LEFT_X = -ROOM.width / 2;
export const RIGHT_X = ROOM.width / 2;

/** Long desk against the right wall. */
export const DESK = { depth: 0.6, top: 0.76, z0: -1.7, z1: 0.95 };
/** Low cabinet in the back-right corner, next to the desk. */
export const CABINET = { depth: 0.55, top: 0.72, z0: -2.55, z1: -1.75 };

/** Where each clickable object sits (its centre). */
export const HOTSPOT_POS: Record<HotspotId, [number, number, number]> = {
  projects: [RIGHT_X - 0.2, DESK.top + 0.3, -0.45], // monitor
  skills: [RIGHT_X - 0.45, DESK.top + 0.02, -0.45], // keyboard
  education: [RIGHT_X - 0.3, DESK.top + 0.08, -1.45], // books
  work: [-1.7, 1.05, -1.85], // whiteboard on its easel
  contact: [RIGHT_X - 0.42, DESK.top + 0.01, 0.42], // phone
  about: [RIGHT_X - 0.2, CABINET.top + 0.13, -1.98], // photo frame on the cabinet
};

// ============================================
// SECTION 1: CAMERA CONFIGURATION
// Camera views: [position], [look-at target].
// ============================================
export type View = { pos: [number, number, number]; target: [number, number, number] };

export const VIEWS = {
  /** Far outside the room, where the intro starts. */
  start: { pos: [-1.5, 2.6, 11], target: [0.4, 1.2, -1] } as View,
  /** Hero, wide screens: room on the right, empty left side for the text. */
  heroWide: { pos: [-3.0, 1.75, 4.9], target: [0.9, 1.1, -1.1] } as View,
  /** Hero, narrow screens: aimed at the desk corner; text sits over the floor. */
  heroNarrow: { pos: [-0.2, 1.75, 4.5], target: [2.85, -0.1, -1.25] } as View,
  /** Explore mode: a view of the whole room. */
  explore: { pos: [-1.3, 1.75, 3.9], target: [1.1, 0.95, -0.9] } as View,
  /** End of the scroll into Projects: pushed in toward the glowing monitor. */
  scrollEnd: { pos: [1.2, 1.25, 0.35], target: [3.4, 1.0, -0.6] } as View,
  /** Explore mode on narrow screens: further back, angled at the desk. */
  exploreNarrow: { pos: [-1.1, 1.95, 4.9], target: [1.9, 0.9, -1.2] } as View,
};

/**
 * Camera angles the visitor can switch between in explore mode.
 * The first one is the default overview.
 */
export const ANGLES: Array<{ id: string; label: string; view: View }> = [
  { id: "overview", label: "Overview", view: VIEWS.explore },
  { id: "desk", label: "Desk", view: { pos: [0.85, 1.45, 1.7], target: [3.1, 0.95, -1.0] } },
  { id: "window", label: "Window", view: { pos: [1.7, 1.45, 2.0], target: [0.2, 1.15, -2.4] } },
  { id: "door", label: "Doorway", view: { pos: [-3.05, 1.65, 1.05], target: [1.6, 1.0, -1.4] } },
  { id: "above", label: "Above", view: { pos: [0.1, 2.6, 2.7], target: [0.6, 0.3, -0.8] } },
];

/** Close-up for each hotspot. */
export const FOCUS_VIEWS: Record<HotspotId, View> = {
  projects: { pos: [1.75, 1.2, -0.45], target: [RIGHT_X - 0.2, 1.05, -0.45] },
  skills: { pos: [2.15, 1.45, -0.2], target: [RIGHT_X - 0.45, 0.8, -0.45] },
  education: { pos: [2.05, 1.35, -1.0], target: [RIGHT_X - 0.3, 0.85, -1.45] },
  work: { pos: [-1.0, 1.35, -0.35], target: [-1.7, 1.05, -1.85] },
  contact: { pos: [2.25, 1.35, 0.85], target: [RIGHT_X - 0.42, 0.78, 0.42] },
  about: { pos: [2.05, 1.3, -1.45], target: [RIGHT_X - 0.2, 0.85, -1.98] },
};

/** Point in the air where the intro burst happens. */
export const BURST_POS: [number, number, number] = [0.3, 1.55, -0.6];
