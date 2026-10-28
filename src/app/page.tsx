import { SceneMount } from "@/components/three/SceneMount";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ExploreUI } from "@/components/ui/ExploreUI";
import { SectionPanel } from "@/components/ui/SectionPanel";
import { profile } from "@/data/profile";
import { skillList } from "@/data/skills";
import { SITE_URL } from "@/lib/site";

/** Tells search engines who this site is about. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: SITE_URL,
  image: `${SITE_URL}${profile.photo}`,
  address: { "@type": "PostalAddress", addressLocality: "Bharatpur", addressRegion: "Chitwan", addressCountry: "NP" },
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.college },
  worksFor: { "@type": "Organization", name: profile.work.company },
  knowsAbout: skillList.map((s) => s.name),
  sameAs: [profile.links.github, profile.links.linkedin].filter(Boolean),
};

export default function Home() {
  return (
    <>
      {/* Without JavaScript the loader could never finish, so hide it. */}
      <noscript>
        <style>{`#loader{display:none}`}</style>
      </noscript>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <LoadingScreen />
      <SceneMount />
      <Navbar />
      <main id="main" className="pointer-events-none relative z-10">
        <Hero />
        <Projects />
        <Skills />
        <About />
        <Contact />
        <Footer />
      </main>
      <ExploreUI />
      <SectionPanel />
    </>
  );
}
