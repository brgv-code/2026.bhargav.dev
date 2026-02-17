import {
  PixelGithub,
  PixelTwitter,
  PixelLinkedIn,
} from "./pixel-icons";
import { fetchProfile } from "@/lib/payload";

export async function Hero() {
  const profile = await fetchProfile();

  return (
    <section className="min-h-[60vh] flex items-center">
      <div className="w-full">
        <p className="text-sm text-muted-foreground mb-4 tracking-wide">
          hey, i'm
        </p>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
          {profile?.name ?? "Bhargav"}
        </h1>

        <p className="text-muted-foreground max-w-md leading-relaxed mb-8">
          {profile?.tagline ??
            "Product focused developer turning coffee into code and bringing ideas to life."}
        </p>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-icon-accent transition-colors"
            aria-label="GitHub"
          >
            <PixelGithub className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-link transition-colors"
            aria-label="Twitter"
          >
            <PixelTwitter className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-link transition-colors"
            aria-label="LinkedIn"
          >
            <PixelLinkedIn className="w-5 h-5" />
          </a>
          <span className="w-px h-4 bg-border" />
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-highlight" />
            open to work
          </span>
        </div>
      </div>
    </section>
  );
}
