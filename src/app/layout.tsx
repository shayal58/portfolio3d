import type { Metadata, Viewport } from "next";
// Fonts are bundled from npm (self-hosted), so the site never depends on
// Google Fonts at build or run time.
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — Developer`,
    template: `%s — ${profile.name}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: profile.name, url: profile.links.github }],
  creator: profile.name,
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: `${profile.name} — Developer`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Developer`,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#080808", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-svh">
        {/* First thing keyboard users reach: jump past the 3D intro and top bar. */}
        <a
          href="#main"
          className="fixed top-3 left-3 z-[200] -translate-y-20 rounded-full bg-accent px-4 py-2 font-mono text-xs tracking-[0.15em] text-bg uppercase transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
