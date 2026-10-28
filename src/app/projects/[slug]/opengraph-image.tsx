import { projectBySlug, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { SHARE_SIZE, shareImage } from "@/lib/shareImage";

export const size = SHARE_SIZE;
export const contentType = "image/png";
export const alt = "Project case study";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  return shareImage({
    eyebrow: p ? p.subtitle : "Case study",
    title: p?.title ?? "Project",
    subtitle: `A project by ${profile.name}`,
  });
}
