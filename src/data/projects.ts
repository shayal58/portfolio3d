// ============================================
// SECTION 5: PROJECT INFORMATION
// Edit project details here. Only facts you
// have confirmed belong in this file.
// Every field set to null or [] is hidden on the
// site, so a missing detail never shows up as a
// placeholder. Fill them in as you confirm them.
// ============================================

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  /** One or two sentences: what it is and what it does. */
  summary: string;
  /** Case study: the problem it addresses. */
  problem: string | null;
  /** Case study: how it solves that problem. */
  solution: string | null;
  /** Your part in it, e.g. "Solo project: model training and web app". */
  role: string | null;
  /** e.g. "2025" */
  year: string | null;
  features: string[];
  stack: string[];
  repo: string | null;
  live: string | null;
  /** Screenshots in /public/projects/<slug>/, e.g. "/projects/agroguard/upload.png". */
  screenshots: Array<{ src: string; alt: string }>;
};

export const projects: Project[] = [
  {
    slug: "agroguard",
    title: "AgroGuard",
    subtitle: "Plant Disease Detection",
    summary:
      "Detects plant diseases from leaf images using a model trained on plant image data. Users upload a leaf photo and get a predicted disease.",
    problem: null,
    solution: null,
    role: null,
    year: null,
    features: ["Leaf image upload", "Disease prediction from a trained model"],
    stack: [],
    repo: null,
    live: null,
    screenshots: [],
  },
  {
    slug: "neoth-culture",
    title: "Neoth Culture",
    subtitle: "Brand Website",
    summary:
      "Website for Neoth Culture, a clothing brand. Built with HTML, CSS and JavaScript, hosted on GitHub Pages with a custom domain.",
    problem: null,
    solution: null,
    role: null,
    year: "2025",
    features: ["Brand showcase pages", "Join-us page", "Links to the brand's Instagram and Threads"],
    stack: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    repo: "https://github.com/shayal58/NEOTH",
    live: "https://www.neothculture.com",
    screenshots: [],
  },
  {
    slug: "finance-literacy",
    title: "Finance Literacy",
    subtitle: "Learning Tool",
    summary:
      "A tool that helps people learn about finance. It gives finance-related information and shows bank interest and loan rates.",
    problem: null,
    solution: null,
    role: null,
    year: null,
    features: ["Finance information", "Bank interest and loan rates"],
    stack: [],
    repo: null,
    live: null,
    screenshots: [],
  },
  {
    slug: "inventory",
    title: "Inventory Management System",
    subtitle: "Inventory Dashboard",
    summary:
      "A dashboard for viewing the full inventory, with adding, updating and deleting items.",
    problem: null,
    solution: null,
    role: null,
    year: null,
    features: ["Full inventory dashboard", "Add, update and delete items"],
    stack: [],
    repo: null,
    live: null,
    screenshots: [],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
