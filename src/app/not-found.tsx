import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Error 404</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight uppercase">Page not found</h1>
        <p className="mt-4 text-muted">There&apos;s nothing at this address. It may have moved, or the link has a typo.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs font-medium tracking-[0.18em] text-bg uppercase hover:bg-accent-hover"
        >
          <ArrowLeft size={14} aria-hidden /> Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
