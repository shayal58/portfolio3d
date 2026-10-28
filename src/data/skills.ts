// ============================================
// SECTION 5: SKILLS
// Edit your skills here. `about` says what the
// tool is. `usedIn` lists project slugs (from
// projects.ts) where you've confirmed using it;
// add more as you fill in project stacks.
// ============================================

export type SkillCategory = "Frontend" | "Backend" | "Database" | "Tools";

export type Skill = {
  name: string;
  category: SkillCategory;
  about: string;
  usedIn: string[];
};

export const skillList: Skill[] = [
  { name: "React", category: "Frontend", about: "JavaScript library for building interfaces out of reusable components.", usedIn: [] },
  { name: "JavaScript", category: "Frontend", about: "The language of the web, for interactivity in the browser.", usedIn: ["neoth-culture"] },
  { name: "Tailwind CSS", category: "Frontend", about: "Utility-first CSS framework for styling directly in markup.", usedIn: [] },
  { name: "Django", category: "Backend", about: "Python web framework for server-side apps, databases and APIs.", usedIn: [] },
  { name: "MySQL", category: "Database", about: "Relational database for storing and querying structured data.", usedIn: [] },
  { name: "GitHub", category: "Tools", about: "Version control, code hosting and collaboration; GitHub Pages also hosts static sites.", usedIn: ["neoth-culture"] },
  { name: "Docker", category: "Tools", about: "Packages an app and its dependencies into a container that runs the same everywhere.", usedIn: [] },
  { name: "Figma", category: "Tools", about: "Design tool for interface layouts and clickable prototypes.", usedIn: [] },
];

export const SKILL_CATEGORIES: SkillCategory[] = ["Frontend", "Backend", "Database", "Tools"];

/** Skills grouped by category, in the order above. */
export const skills = Object.fromEntries(
  SKILL_CATEGORIES.map((c) => [c, skillList.filter((s) => s.category === c).map((s) => s.name)]),
) as Record<SkillCategory, string[]>;
