"use client";

import { useState } from "react";
import Link from "next/link";
import { useSound } from "@/components/providers/sound-provider";
import { Reading } from "@/components/reading-journal";
import { ActivityStreakGrid } from "@/components/activity-streak-grid";
import { BlogCard } from "@/components/blog";
import type {
  PayloadPostListItem,
  PayloadWorkExperience,
  PayloadFavorite,
} from "@/lib/payload";
import { tagNames } from "@/lib/payload";
import { formatPostDate, formatReadTime } from "@/lib/format";
import type { ProjectItem } from "@/lib/projects-data";

type Profile = { name?: string; tagline?: string } | null;

type Props = {
  profile: Profile;
  posts: PayloadPostListItem[];
  projects: ProjectItem[];
  work: PayloadWorkExperience[];
  favorites: PayloadFavorite[];
};

export function HomePageLayout({ profile, posts, projects, favorites }: Props) {
  const [activeTab, setActiveTab] = useState<
    "writing" | "projects" | "experience" | "favorites"
  >("writing");
  const { playClick } = useSound();

  const switchTab = (
    tab: "writing" | "projects" | "experience" | "favorites"
  ) => {
    playClick();
    setActiveTab(tab);
  };

  const tabActive =
    "font-mono text-xs uppercase tracking-widest text-[var(--editorial-text)] pb-1 border-b-2 border-[var(--editorial-text)]";
  const tabInactive =
    "font-mono text-xs uppercase tracking-widest text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors pb-1 border-b-2 border-transparent";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 h-full min-h-0 overflow-hidden">
      <aside className="lg:col-span-4 flex flex-col gap-10 min-h-0 overflow-auto">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-tight text-[var(--editorial-text)] mb-2">
            {profile?.name ?? "Bhargav"}
          </h1>
          <p className="text-sm text-[var(--editorial-text-muted)] leading-relaxed font-light mb-6">
            {profile?.tagline ??
              "Product focused developer turning coffee into code and bringing ideas to life."}
          </p>
          <div className="flex gap-5 font-mono text-[10px] uppercase text-[var(--editorial-text-muted)]">
            {process.env.NEXT_PUBLIC_GITHUB_URL && (
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--editorial-accent)] transition-colors border-b border-transparent hover:border-[var(--editorial-accent)] pb-0.5"
              >
                GitHub
              </a>
            )}
            {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
              <a
                href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--editorial-accent)] transition-colors border-b border-transparent hover:border-[var(--editorial-accent)] pb-0.5"
              >
                LinkedIn
              </a>
            )}
            {process.env.NEXT_PUBLIC_TWITTER_URL && (
              <a
                href={process.env.NEXT_PUBLIC_TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--editorial-accent)] transition-colors border-b border-transparent hover:border-[var(--editorial-accent)] pb-0.5"
              >
                Twitter
              </a>
            )}
          </div>
        </div>

        <Reading label="Currently Reading" variant="aside" />
        <ActivityStreakGrid />
      </aside>

      <main className="lg:col-span-8 min-h-0 flex flex-col overflow-hidden">
        <nav
          className="flex gap-6 md:gap-8 border-b border-[var(--editorial-border)] pb-4 mb-10 shrink-0 overflow-x-auto whitespace-nowrap"
          aria-label="Content sections"
        >
          <button
            type="button"
            onClick={() => switchTab("writing")}
            className={activeTab === "writing" ? tabActive : tabInactive}
          >
            Writing
          </button>
          <button
            type="button"
            onClick={() => switchTab("projects")}
            className={activeTab === "projects" ? tabActive : tabInactive}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => switchTab("experience")}
            className={activeTab === "experience" ? tabActive : tabInactive}
          >
            Experience
          </button>
          <button
            type="button"
            onClick={() => switchTab("favorites")}
            className={activeTab === "favorites" ? tabActive : tabInactive}
          >
            Favorites
          </button>
        </nav>

        <div className="flex-1 min-h-0 overflow-auto">
          <div
            id="tab-writing"
            className={`tab-content ${activeTab === "writing" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "writing"}
          >
            <div className="flex flex-col space-y-6">
              {posts.length === 0 ? (
                <p className="text-[var(--editorial-text-muted)] text-[15px] py-8">
                  No posts yet. Check back soon.
                </p>
              ) : (
                posts.map((post, i) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    subtitle={post.description ?? ""}
                    date={formatPostDate(
                      post.publishedAt ?? post.updatedAt ?? post.createdAt
                    )}
                    tags={tagNames(post.tags)}
                    readTime={formatReadTime(post.readingTime)}
                    featured={i === 0}
                  />
                ))
              )}
            </div>
          </div>

          <div
            id="tab-projects"
            className={`tab-content ${activeTab === "projects" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "projects"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <Link
                  key={project.name}
                  href={project.url}
                  className="bg-[var(--editorial-surface)] border border-[var(--editorial-border)] p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-2xl sm:text-3xl text-[var(--editorial-text)]">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-sm font-light text-[var(--editorial-text-muted)] leading-relaxed">
                    {project.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div
            id="tab-experience"
            className={`tab-content ${activeTab === "experience" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "experience"}
          >
            <div className="space-y-12">
              <div className="flex flex-col sm:flex-row sm:gap-12">
                <div className="font-mono text-xs text-[var(--editorial-text-dim)] w-32 shrink-0 pt-1 mb-2 sm:mb-0">
                  2024 — Pres.
                </div>
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[var(--editorial-text)] mb-1">
                    Founding Engineer
                  </h3>
                  <div className="font-mono text-[10px] text-[var(--editorial-accent)] uppercase tracking-widest mb-4">
                    Stealth AI Lab
                  </div>
                  <p className="text-sm font-light text-[var(--editorial-text-muted)] leading-relaxed max-w-2xl">
                    Architecting the primary UI and middle-tier API layer.
                    Bridging the gap between AI outputs and type-safe state.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            id="tab-favorites"
            className={`tab-content ${activeTab === "favorites" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "favorites"}
          >
            <div className="space-y-12">
              {favorites.length === 0 ? (
                <p className="text-sm text-[var(--editorial-text-muted)]">
                  No favorites yet.{" "}
                  <Link
                    href="/favorites"
                    className="text-[var(--editorial-accent)] hover:underline"
                  >
                    Add some on the favorites page
                  </Link>
                  .
                </p>
              ) : (
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-dim)] border-b border-[var(--editorial-border)] pb-2 mb-4">
                    Saved
                  </h4>
                  <div className="space-y-4">
                    {favorites.slice(0, 10).map((fav) => (
                      <a
                        key={fav.id}
                        href={fav.url ?? "#"}
                        target={fav.url ? "_blank" : undefined}
                        rel={fav.url ? "noopener noreferrer" : undefined}
                        className="group flex flex-col sm:flex-row sm:justify-between sm:items-baseline"
                      >
                        <span className="font-serif text-xl sm:text-2xl text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors">
                          {fav.title}
                        </span>
                        {fav.source && (
                          <span className="font-mono text-[10px] text-[var(--editorial-text-dim)] mt-1 sm:mt-0">
                            {fav.source}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                  <Link
                    href="/favorites"
                    className="inline-block mt-6 font-mono text-xs text-[var(--editorial-accent)] hover:underline"
                  >
                    View all favorites →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
