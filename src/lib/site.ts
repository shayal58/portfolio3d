// ============================================
// SECTION 5: SITE ADDRESS
// Used for share previews, the sitemap and search
// engines. On Vercel it is picked up automatically.
// Once you add your own domain, set
// NEXT_PUBLIC_SITE_URL=https://shayalpiya.com.np
// in Vercel → Settings → Environment Variables.
// ============================================
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_DESCRIPTION =
  "Shayal Piya, developer from Bharatpur, Nepal. Explore a 3D model of my workspace to see my projects, skills and experience.";
