// ============================================
// SECTION 5: PROFILE INFORMATION
// Edit personal details here. Every page reads
// from this file, so change things once here.
// Fields set to null are not shown on the site
// until you fill them in.
// ============================================

export const profile = {
  name: "Shayal Piya",
  title: "Developer",
  tagline: "Developer & Creative Problem Solver",
  intro:
    "Hi, I'm Shayal Piya, a developer from Bharatpur, Chitwan. I enjoy transforming ideas into functional digital experiences through creative design and modern web technologies.",
  location: "Bharatpur, Chitwan, Nepal",
  photo: "/images/shayal-profile.jpg",

  education: {
    college: "United Technical College",
    field: "Computer Engineering",
  },

  work: {
    company: "Dursikshya",
    role: null as string | null, // e.g. "Frontend Developer"
    since: null as string | null, // e.g. "2025"
  },

  links: {
    github: "https://github.com/shayal58",
    email: null as string | null,
    linkedin: null as string | null,
    resume: null as string | null,
  },

  /**
   * WhatsApp number in pieces: country code, then the local number split in
   * two. It's joined in the visitor's browser (see WhatsAppLink.tsx), so the
   * full number never appears in the page's HTML for scraper bots to read.
   * Set to null to remove WhatsApp from the site.
   */
  whatsapp: { country: "977", parts: ["98118", "18835"] } as { country: string; parts: string[] } | null,
} as const;
