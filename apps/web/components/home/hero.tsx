import {
  PixelGithub,
  PixelTwitter,
  PixelLinkedIn,
} from "@/components/shared/pixel-icons";
import { fetchProfile } from "@/lib/data/cms";

export async function Hero() {
  const profile = await fetchProfile();

  return (
    <section className="py-5 md:py-6">
      <div className="w-full">
        <p className="font-serif italic text-[var(--editorial-text-muted)] text-[15px] mb-1">
          hey, I&apos;m
        </p>

        <h1 className="font-serif text-2xl sm:text-3xl text-[var(--editorial-text)] leading-tight mb-2">
          {profile?.name ?? "Bhargav"}
        </h1>

        <p className="text-[var(--editorial-text-muted)] text-[14px] leading-snug max-w-md mb-4">
          {profile?.tagline ??
            "Product focused developer turning coffee into code and bringing ideas to life."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {process.env.NEXT_PUBLIC_GITHUB_URL && (
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--editorial-text-muted)] hover:text-[var(--editorial-accent)] transition-colors"
              aria-label="GitHub"
            >
              <PixelGithub className="w-5 h-5" />
            </a>
          )}
          {process.env.NEXT_PUBLIC_TWITTER_URL && (
            <a
              href={process.env.NEXT_PUBLIC_TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--editorial-text-muted)] hover:text-[var(--editorial-accent)] transition-colors"
              aria-label="Twitter"
            >
              <PixelTwitter className="w-5 h-5" />
            </a>
          )}
          {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
            <a
              href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--editorial-text-muted)] hover:text-[var(--editorial-accent)] transition-colors"
              aria-label="LinkedIn"
            >
              <PixelLinkedIn className="w-5 h-5" />
            </a>
          )}
          {(process.env.NEXT_PUBLIC_GITHUB_URL ??
            process.env.NEXT_PUBLIC_TWITTER_URL ??
            process.env.NEXT_PUBLIC_LINKEDIN_URL) && (
            <span className="w-px h-4 bg-[var(--editorial-border)]" />
          )}
          <span className="inline-flex items-center gap-2 text-xs text-[var(--editorial-text-muted)]">
            <span className="w-1.5 h-1.5 bg-[var(--editorial-accent)]" />
            open to work
          </span>
        </div>
      </div>
    </section>
  );
}
