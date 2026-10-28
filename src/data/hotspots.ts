// ============================================
// SECTION 3: INTERACTIVE OBJECTS
// Clickable objects in the room and what they
// open. Positions live in src/lib/room.ts.
// ============================================

export type HotspotId = "projects" | "skills" | "education" | "work" | "contact" | "about";

export type Hotspot = {
  id: HotspotId;
  /** Object in the room, shown in the accessible list. */
  object: string;
  /** Tooltip shown on hover. */
  tooltip: string;
  /** Panel heading. */
  title: string;
};

export const hotspots: Hotspot[] = [
  { id: "projects", object: "Monitor", tooltip: "Explore my projects", title: "Projects" },
  { id: "skills", object: "Keyboard", tooltip: "See my skills", title: "Technical Skills" },
  { id: "education", object: "Books", tooltip: "My education", title: "Education" },
  { id: "work", object: "Whiteboard", tooltip: "Work experience", title: "Work Experience" },
  { id: "contact", object: "Phone", tooltip: "Get in touch", title: "Contact" },
  { id: "about", object: "Photo frame", tooltip: "About me", title: "About Me" },
];

export const hotspotById = Object.fromEntries(hotspots.map((h) => [h.id, h])) as Record<
  HotspotId,
  Hotspot
>;
