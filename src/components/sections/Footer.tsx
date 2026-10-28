import { ArrowUp, Github } from "lucide-react";
import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="pointer-events-auto relative border-t border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built in Bharatpur, Chitwan.
        </p>
        <div className="flex items-center gap-5">
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
            <Github size={14} aria-hidden /> GitHub
          </a>
          <a href="#home" className="inline-flex items-center gap-2 hover:text-fg">
            <ArrowUp size={14} aria-hidden /> Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
