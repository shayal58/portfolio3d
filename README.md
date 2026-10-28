# SHAYAL — Interactive 3D Portfolio

All seven phases: cinematic hero, an interactive 3D model of Shayal's room, project gallery with case studies, skills universe, About, Contact with a working email form, and final polish. Next.js (App Router) + TypeScript + Tailwind CSS v4 + React Three Fiber.

## Run it

Needs Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Production check:

```bash
npm run typecheck
npm run build
npm start
```

## What Phase 1 includes

- One shared 3D canvas behind the page (`src/components/three/Experience.tsx`).
- Camera intro move with GSAP, plus cursor parallax (`CameraController.tsx`).
- Orange key light and blue fill light (`Lighting.tsx`).
- Fog, dust particles, soft floor shadow (`Environment.tsx`).
- Real HTML hero text and navigation on top of the canvas, so content works without WebGL.
- Design tokens (colors, fonts, glass panel) in `src/app/globals.css`.
- Fonts self-hosted from npm, with no Google Fonts request.
- Quality tiers: phones and touch screens get lower resolution and fewer particles; the scene also drops quality if the frame rate falls.
- Reduced-motion support: no intro move, no spin, no parallax.
- WebGL fallback: if WebGL is unavailable, a static glow replaces the scene.

## What Phase 2 adds

- Loading screen (`src/components/ui/LoadingScreen.tsx`). The percentage comes from real loading stages: page ready, WebGL checked, 3D code downloaded, 3D assets loaded, first frame drawn. It stays up at least 1.2 s so it never just flashes, and gives up after 12 s so a broken GPU can't trap visitors.
- Intro sequence (`IntroBurst.tsx`, `HeroObject.tsx`, `CameraController.tsx`): the intro object glows, bursts into particles and dissolves while the camera moves in, then the main object grows into place.
- One shared intro timeline in `src/lib/intro.ts`. Change timings there and the 3D and the text stay in sync.
- Hero text reveal (`HeroReveal.tsx` + SECTION 4 of `globals.css`): staggered rise, with the name sliding up from behind a mask.
- Role line decodes from random characters into the real text (`DecodeText.tsx`). Screen readers get the real text.
- Magnetic buttons (`MagneticButton.tsx`). Off on touch screens and for reduced motion.

### Design decisions worth knowing

- Text reveal uses CSS transitions, not GSAP. GSAP's clock slows when frames drop, which would leave the hero text invisible on a struggling device. CSS runs on real time.
- The camera tween is a GSAP tween, but its progress is set from real elapsed time for the same reason.
- If JavaScript is off, the loading screen is hidden and the plain text shows.

## What Phase 3 adds

- **The room** (`src/components/three/room/`): modelled from photos of Shayal's real room. It has the window with pleated curtains, the tray ceiling with crossed beams, cove lighting and a fan, the doorway, the wood floor and rug, the dark desk and cabinet, the yellow table and chair, the whiteboard on its easel, and the snake plant. Everything is built in code; there are no model downloads.
- **Clickable objects**: monitor → Projects, keyboard → Skills, books → Education, whiteboard → Work, phone → Contact, framed photo → About. Hovering one shows an orange outline, a lift, a tooltip and a light. Clicking flies the camera in and opens a glass panel with real content from `src/data`.
- **Explore mode** ("Explore my world"): the hero fades out and you can look around the room. Five camera angles are available (Overview, Desk, Window, Doorway, Above). There's also a plain button list of every object, which is the keyboard, screen-reader and touch-friendly route.
- **Back, Esc and browser Back/Forward** all close panels and leave explore mode.
- **Night lighting in separate pools**: cove on the ceiling, desk lamp, moonlight through the curtain gap (with real curtain shadows), a floor lamp in the whiteboard corner, an LED strip under the desk, and a monitor backlight.
- **Realism pass**: matte walls with no sheen, paint grain, a glossy floor, fabric sheen on the curtains, rounded furniture edges, reflections from a built-in light environment, ambient occlusion, soft bloom and a vignette.
- **Performance**: ambient occlusion, bloom, the extra accent lights and moonlight shadows run only on high quality. Phones and slow GPUs drop to low quality automatically.
- All GSAP animations follow real time (`src/lib/gsap.ts`), so a slow frame skips ahead instead of freezing the camera mid-move.

## What Phase 4 adds

- **Projects section** below the hero (`src/components/sections/Projects.tsx`). As you scroll into it, the camera pushes toward the glowing monitor, the room dims and the hero text fades. Once the section covers the room, the 3D scene stops drawing to save battery.
- **A small 3D scene per project** (`src/components/three/vignettes/scenes.tsx`): a leaf being scanned (AgroGuard), a tee on a hanger (Neoth Culture), rising rate bars and a coin (Finance Literacy), and boxes stacking onto shelves (Inventory). Each one runs only while its card is on screen. An icon shows instead on devices without 3D.
- **Case-study pages** at `/projects/<slug>`: static, fast, shareable, with previous/next links. They show only the details filled in `src/data/projects.ts`; empty fields are hidden, never shown as placeholders.
- **Top bar → Projects** and **View Projects** now scroll to the section. The monitor's panel in the room links to each case study.

### To make the case studies stronger

Fill these in `src/data/projects.ts` for each project: `problem`, `solution`, `role`, `year`, `stack`, `repo`, and `screenshots` (put the images in `public/projects/<slug>/`). AgroGuard most needs this: it's the strongest project but currently has the least detail.

## What Phase 5 adds

- **Brighter room**: it's now an evening room with the lights on, not a dark one. Two ceiling downlights (like the recessed lights in the photos) light the whole room, with stronger ambient and bounce light, lighter walls, a softer vignette and a lighter scrim behind the hero text. The warm lamp, cove and monitor glow still add contrast. Change `downlight` and `ambient` in `Lighting.tsx` to make it brighter or darker overall.
- **Skills universe** (`src/components/sections/Skills.tsx`, `src/components/three/skills/SkillsCanvas.tsx`): a glowing core with one orbit per category (Frontend, Backend, Database, Tools), each in its own colour. Hovering a skill slows its orbit and lights it up; selecting one stops the orbit and the camera moves in, and a card shows what the tool is and which of your projects use it. Click empty space or press Esc to go back.
- A **plain list of the same skills** sits beside it with the same selection. It's the keyboard, screen-reader and touch route, and the only view on devices without 3D.
- **Top bar → Skills** now scrolls to the section.

Skill descriptions say what each tool is; they don't claim experience levels. Add project slugs to `usedIn` in `src/data/skills.ts` as you confirm which projects used which tools.

## What Phase 6 adds

- **About** (`src/components/sections/About.tsx`): your portrait in a glass frame with an orange glow and a slowly travelling orange edge; on desktop it tilts toward the cursor. Introduction, education (United Technical College, Computer Engineering) and work (Dursikshya). Your job title and start year appear automatically once you fill `work.role` and `work.since` in `src/data/profile.ts`.
- **Contact** (`src/components/sections/Contact.tsx`): "Let's build something together", your GitHub and location (plus email, LinkedIn and resume once you add them to `profile.ts`), and a terminal-style message form.
- **The form sends real email** through `/api/contact` (`src/app/api/contact/route.ts`):
  - Checked twice: instantly in the browser, then again on the server, with the same rules (`src/lib/contact.ts`).
  - It only says "Message delivered" after the email service confirms it accepted the message. Otherwise it shows a clear error and suggests GitHub.
  - Spam protection: a hidden field that bots fill and people don't, a 20 KB size limit, and at most 5 messages per visitor every 10 minutes.
  - **Hidden until you set it up.** Until then visitors see "Reach me on GitHub" instead.
- **Footer** with GitHub and "Back to top".
- **Top bar**: all four links now scroll to their sections.
- The room's objects still open their quick panels when clicked.

### Turn on the contact form (about 5 minutes, free)

1. Sign up at **resend.com** with the email address where you want messages to arrive.
2. In Resend, go to **API Keys → Create API Key**, and copy it.
3. In Vercel, open your project → **Settings → Environment Variables**, and add:
   - `RESEND_API_KEY` = the key you copied
   - `CONTACT_TO_EMAIL` = the email you signed up to Resend with
4. **Redeploy** (Deployments → ⋯ → Redeploy). The form appears.

Without your own domain, Resend's test sender can only deliver to the email you signed up with, which is all a portfolio needs. To send from your own address (for example `hello@shayalpiya.com.np`), verify the domain in Resend and add `CONTACT_FROM_EMAIL` = `Shayal <hello@shayalpiya.com.np>`.

To test locally, put the same two lines in a file called `.env.local` in the project folder and restart `npm run dev`. Never commit that file; it's already in `.gitignore`.

**Hosting note:** the form needs a server, so deploy on Vercel (or Netlify), not as plain static files on GitHub Pages.

## What Phase 7 adds

- **WhatsApp** in Contact and in the room's phone panel (`+977 98118 18835`). The number is put together in the visitor's browser, so it isn't in the page's HTML for simple scraper bots. To remove it, set `whatsapp: null` in `src/data/profile.ts`.
- **Top bar shows where you are**: the link for the section you're reading is highlighted with an orange underline. Links are real `#anchors`, so they work without JavaScript too.
- **Skip to content** link: the first thing keyboard users reach jumps past the top bar.
- **Share previews**: links to the site or any case study show a 1200×630 card with your name or the project title, your photo and the orange glow on LinkedIn, WhatsApp, X, Slack and so on (`src/lib/shareImage.tsx`).
- **Search engines**: page titles and descriptions, a correct canonical address on every page, `sitemap.xml`, `robots.txt` (keeps `/api/` out), and structured data describing you (name, location, college, workplace, skills, GitHub).
- **Site icon** (`src/app/icon.svg`) and a styled **404 page**.
- **Checked**: automated accessibility audit (axe-core, WCAG 2.1 AA) with 0 issues on the home page and the case studies; keyboard order; no sideways scrolling on phones; no console errors.
- **Download size**: about 360 KB to show the page; the 3D room adds about 440 KB more, loaded after the text is already on screen.

## Go-live checklist

1. Push this folder to GitHub, then import the repo in Vercel and deploy (it builds with no settings).
2. **Contact form**: add `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in Vercel → Settings → Environment Variables (see "Turn on the contact form" above), then redeploy. Send yourself a test message.
3. **Your domain** (optional): Vercel → Settings → Domains → add `shayalpiya.com.np` and enter the DNS records it shows at your registrar. Then add `NEXT_PUBLIC_SITE_URL` = `https://shayalpiya.com.np` and redeploy, so share previews and the sitemap use your domain.
4. Paste your live link into the LinkedIn Post Inspector (linkedin.com/post-inspector) to check the share card.
5. Fill in the missing details in `src/data/profile.ts` and `src/data/projects.ts`: job title, email, LinkedIn, resume, and the case-study fields (AgroGuard first).

## Where to edit things

| Change | File | Look for |
|---|---|---|
| Name, intro, links, job details | `src/data/profile.ts` | SECTION 5 |
| Projects | `src/data/projects.ts` | SECTION 5 |
| Skills | `src/data/skills.ts` | SECTION 5 |
| Colors and fonts | `src/app/globals.css` | SECTION 1 |
| Camera position and parallax | `src/components/three/CameraController.tsx` | SECTION 1 |
| Intro timing (all of it) | `src/lib/intro.ts` | SECTION 4 |
| Text reveal speed | `src/app/globals.css` | SECTION 4 |
| Loading screen timing | `src/components/ui/LoadingScreen.tsx` | SECTION 4 |
| Lights | `src/components/three/Lighting.tsx` | SECTION 2 |
| Room layout, object positions, camera views and angles | `src/lib/room.ts` | SECTIONS 1 & 3 |
| Room and furniture colours / materials | `src/components/three/room/RoomShell.tsx`, `Furniture.tsx` | SECTION 2 |
| What each object opens, tooltips | `src/data/hotspots.ts` | SECTION 3 |
| Project visuals | `src/components/three/vignettes/scenes.tsx` | SECTION 5 |
| Skills, descriptions, where used | `src/data/skills.ts` | SECTION 5 |
| Skills orbits, colours, speeds | `src/components/three/skills/SkillsCanvas.tsx` | SECTION 4 |
| Contact form rules and error messages | `src/lib/contact.ts` | SECTION 5 |
| Contact email delivery | `src/app/api/contact/route.ts` | SECTION 5 |
| WhatsApp number | `src/data/profile.ts` (`whatsapp`) | SECTION 5 |
| Site address for share cards and sitemap | `src/lib/site.ts` or `NEXT_PUBLIC_SITE_URL` | SECTION 5 |
| Share card design | `src/lib/shareImage.tsx` | — |
| Camera pose at the end of the scroll | `src/lib/room.ts` (`scrollEnd`) | SECTION 1 |
| Ambient occlusion, bloom, vignette, reflections | `src/components/three/Effects.tsx` | SECTION 2 |
| Mobile vs desktop quality | `src/lib/device.ts` | SECTION 6 |

Fields set to `null` in the data files (job title, email, LinkedIn, resume, project links) are hidden on the site until you fill them in.

## Photo

`public/images/shayal-profile.jpg` is a chest-up crop of your river photo (680×850). It appears in the About section, the room's photo frame and the share cards.

## Not yet built

Nothing from the original plan is left. What would most improve the site now is content: real case-study details, screenshots, and your job title.
# portfolio3d
