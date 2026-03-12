"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/components/providers/sound-provider";
import { Reading } from "@/components/home/reading-journal";
import { ActivityStreakGrid } from "@/components/streaks/activity-streak-grid";
import { BlogCard } from "@/components/blog";
import type {
  PayloadPostListItem,
  PayloadWorkExperience,
  PayloadFavorite,
  PayloadActivityDay,
} from "@/lib/data/cms";
import { tagNames } from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";
import type { ProjectItem, ProjectStatus } from "@/lib/projects-data";

type Profile = {
  name?: string;
  tagline?: string;
  bio?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
  x?: string | null;
} | null;

type Props = {
  profile: Profile;
  posts: PayloadPostListItem[];
  projects: ProjectItem[];
  work: PayloadWorkExperience[];
  favorites: PayloadFavorite[];
  activityLog?: PayloadActivityDay[] | null;
};

const RESUME_URL = "/resume.pdf";

const projectStatusColors: Record<ProjectStatus, string> = {
  active: "text-[var(--editorial-accent2)]",
  wip: "text-[var(--editorial-accent)]",
  archived: "text-[var(--editorial-text-muted)]",
};

const projectStatusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  wip: "In Progress",
  archived: "Archived",
};

const FAVORITE_TYPE_LABELS: Record<
  NonNullable<PayloadFavorite["type"]>,
  string
> = {
  article: "Articles",
  video: "Videos",
  podcast: "Podcasts",
  book: "Books",
  tool: "Tools",
};

type FavoriteCategory = {
  category: string;
  items: {
    id: number;
    title: string;
    url?: string | null;
    subtitle?: string | null;
  }[];
};

function groupFavoritesByType(
  favorites: PayloadFavorite[]
): FavoriteCategory[] {
  const byType = new Map<string, PayloadFavorite[]>();
  for (const fav of favorites) {
    const key = fav.type ?? "other";
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key)!.push(fav);
  }
  const order = [
    "article",
    "video",
    "podcast",
    "book",
    "tool",
    "other",
  ] as const;
  return order
    .filter((k) => byType.has(k))
    .map((key) => ({
      category: key === "other" ? "Other" : FAVORITE_TYPE_LABELS[key],
      items: (byType.get(key) ?? []).map((f) => ({
        id: f.id,
        title: f.title,
        url: f.url,
        subtitle: f.source ?? f.thoughts ?? undefined,
      })),
    }));
}

export function HomePageLayout({
  profile,
  posts,
  projects,
  work,
  favorites,
  activityLog,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "writing" | "projects" | "experience" | "favorites" | "notes"
  >("writing");
  const [showBio, setShowBio] = useState(false);
  const { playClick } = useSound();

  const switchTab = (
    tab: "writing" | "projects" | "experience" | "favorites" | "notes"
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
      <aside className="lg:col-span-4 flex flex-col min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {showBio ? (
            <motion.div
              key="bio-expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
            >
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowBio(false);
                }}
                className="font-mono text-[11px] text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors bg-transparent cursor-pointer mb-6 flex items-center gap-1"
              >
                ← Back
              </button>

              <h2 className="font-serif text-[1.8rem] text-[var(--editorial-text)] leading-tight mb-4">
                About {profile?.name ?? "Bhargav"}
              </h2>
              <p className="text-[13.5px] text-[var(--editorial-text-muted)] leading-relaxed mb-4">
                {profile?.bio ??
                  "Product-focused engineer with experience building for the web. I care about developer experience, thoughtful UI, and shipping things that matter."}
              </p>

              <div className="border-t border-[var(--editorial-border)] pt-5 mb-6">
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--editorial-text-muted)] block mb-3">
                  Get in Touch
                </span>
                <div className="flex flex-col gap-2">
                  {(profile?.email || process.env.NEXT_PUBLIC_EMAIL) && (
                    <a
                      href={`mailto:${profile?.email ?? process.env.NEXT_PUBLIC_EMAIL}`}
                      className="font-mono text-[12px] text-[var(--editorial-text)] hover:text-[var(--editorial-accent)] transition-colors"
                    >
                      {profile?.email ?? process.env.NEXT_PUBLIC_EMAIL}
                    </a>
                  )}
                  {(profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL) && (
                    <a
                      href={
                        profile?.github ??
                        process.env.NEXT_PUBLIC_GITHUB_URL ??
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[12px] text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {(profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL) && (
                    <a
                      href={
                        profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL ?? "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[12px] text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
                    >
                      Twitter / X ↗
                    </a>
                  )}
                  {(profile?.linkedin ??
                    process.env.NEXT_PUBLIC_LINKEDIN_URL) && (
                    <a
                      href={
                        profile?.linkedin ??
                        process.env.NEXT_PUBLIC_LINKEDIN_URL ??
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[12px] text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>

              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase px-4 py-2.5 border border-[var(--editorial-text)] text-[var(--editorial-text)] hover:bg-[var(--editorial-text)] hover:text-[var(--editorial-bg)] transition-colors duration-200 w-fit"
              >
                Download Resume ↓
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="bio-collapsed"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-10"
            >
              <div>
                <h1 className="font-serif text-4xl lg:text-5xl tracking-tight text-[var(--editorial-text)] mb-2">
                  {profile?.name ?? "Bhargav"}
                </h1>
                <p className="text-sm text-[var(--editorial-text-muted)] leading-relaxed font-light max-w-[280px] mb-4">
                  {profile?.tagline ??
                    "Product focused developer turning coffee into code and bringing ideas to life."}
                </p>

                <div className="flex items-center gap-4 mb-10">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowBio(true);
                    }}
                    className="font-mono text-[11px] text-[var(--editorial-accent)] hover:text-[var(--editorial-text)] transition-colors bg-transparent cursor-pointer"
                  >
                    Know more →
                  </button>
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
                  >
                    Resume ↓
                  </a>
                </div>
              </div>

              <div className="border-t border-[var(--editorial-border)]" />

              <Reading label="Currently Reading" variant="aside" />
              <ActivityStreakGrid activityLog={activityLog} />
            </motion.div>
          )}
        </AnimatePresence>
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
          <button
            type="button"
            onClick={() => switchTab("notes")}
            className={activeTab === "notes" ? tabActive : tabInactive}
          >
            Notes
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
            <div className="flex flex-col">
              {projects.map((project, i) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.35 }}
                  className="py-7 border-b border-dashed border-[var(--editorial-border)] group"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-[1.35rem] text-[var(--editorial-text)] leading-snug">
                        {project.title ?? project.name}
                      </h3>
                      {project.status && (
                        <span
                          className={`font-mono text-[10px] tracking-wider uppercase ${projectStatusColors[project.status]}`}
                        >
                          {projectStatusLabels[project.status]}
                        </span>
                      )}
                    </div>
                    {project.year && (
                      <span className="font-mono text-[11px] text-[var(--editorial-text-muted)] shrink-0">
                        {project.year}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[13px] text-[var(--editorial-text-muted)] leading-relaxed mb-3 max-w-lg">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.tech?.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] text-[var(--editorial-text-muted)] bg-[var(--editorial-surface)] px-2 py-0.5 rounded-sm"
                      >
                        {t}
                      </span>
                    ))}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-[var(--editorial-accent)] hover:text-[var(--editorial-text)] transition-colors ml-auto"
                      >
                        GitHub →
                      </a>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-[var(--editorial-accent)] hover:text-[var(--editorial-text)] transition-colors"
                      >
                        Live →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div
            id="tab-experience"
            className={`tab-content ${activeTab === "experience" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "experience"}
          >
            <div className="flex flex-col pl-0 lg:pl-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-dim)]">
                  Recent roles
                </p>
                <a
                  href="/experience"
                  className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-accent)] hover:text-[var(--editorial-text)] transition-colors"
                >
                  View full experience →
                </a>
              </div>
              {work.length === 0 ? (
                <p className="text-sm text-[var(--editorial-text-muted)]">
                  No work experience added yet.
                </p>
              ) : (
                work.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35 }}
                    className="py-7 border-b border-dashed border-[var(--editorial-border)] relative"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-[21px] top-9 w-2 h-2 rounded-full border border-[var(--editorial-border)] bg-[var(--editorial-bg)] hidden lg:block"
                      aria-hidden
                    />
                    {i === 0 && (
                      <div
                        className="absolute -left-[21px] top-9 w-2 h-2 rounded-full hidden lg:block"
                        style={{ backgroundColor: "var(--editorial-accent)" }}
                        aria-hidden
                      />
                    )}

                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className="font-serif text-[1.35rem] text-[var(--editorial-text)] leading-snug">
                          {exp.role}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[12px] text-[var(--editorial-accent)] font-medium">
                            {exp.company}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--editorial-text-muted)] whitespace-nowrap shrink-0 pt-1">
                        {exp.date_range ?? "—"}
                      </span>
                    </div>

                    {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                      <ul className="flex flex-col gap-1.5 mt-3 list-none pl-0">
                        {exp.bullets.map((bullet, j) => (
                          <li
                            key={bullet.id ?? `${exp.id}-b-${j}`}
                            className="flex items-start gap-2 text-[13px] text-[var(--editorial-text-muted)] leading-relaxed"
                          >
                            <span className="text-[var(--editorial-accent)] mt-0.5 shrink-0">
                              —
                            </span>
                            {bullet.href ? (
                              <a
                                href={bullet.href}
                                className="underline-offset-2 hover:text-[var(--editorial-accent)] hover:underline"
                              >
                                {bullet.label}
                              </a>
                            ) : (
                              <span>{bullet.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.contentHtml && (
                      <div
                        className="mt-3 text-[13px] leading-relaxed text-[var(--editorial-text-muted)] space-y-2"
                        dangerouslySetInnerHTML={{ __html: exp.contentHtml }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div
            id="tab-favorites"
            className={`tab-content ${activeTab === "favorites" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "favorites"}
          >
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
              <div className="flex flex-col gap-10">
                {groupFavoritesByType(favorites).map((category, i) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35 }}
                  >
                    <h3 className="font-serif text-[1.2rem] text-[var(--editorial-text)] mb-4 pb-2 border-b border-dashed border-[var(--editorial-border)]">
                      {category.category}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-baseline justify-between gap-4 group"
                        >
                          <div className="flex items-baseline gap-2 min-w-0">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[13px] text-[var(--editorial-text)] hover:text-[var(--editorial-accent)] transition-colors truncate"
                              >
                                {item.title} ↗
                              </a>
                            ) : (
                              <span className="font-mono text-[13px] text-[var(--editorial-text)] truncate">
                                {item.title}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <span className="font-mono text-[11px] text-[var(--editorial-text-muted)] shrink-0">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div
            id="tab-notes"
            className={`tab-content ${activeTab === "notes" ? "active" : ""}`}
            role="tabpanel"
            aria-hidden={activeTab !== "notes"}
          >
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <h2 className="font-serif text-[1.6rem] text-[var(--editorial-text)] leading-tight">
                  Daily notebook
                </h2>
                <p className="text-[13.5px] text-[var(--editorial-text-muted)] leading-relaxed max-w-md">
                  A running log of code snippets, links, and small learnings.
                  Less polished than the blog, closer to a working notebook.
                </p>
              </div>
              <div className="border-t border-[var(--editorial-border)] pt-4 flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] text-[var(--editorial-text-muted)]">
                  Browse the full notebook, grouped by day with tags, search,
                  and a streak view.
                </p>
                <Link
                  href="/notes"
                  className="font-mono text-[11px] tracking-[0.16em] uppercase px-4 py-2 rounded-sm border border-[var(--editorial-text)] text-[var(--editorial-bg)] bg-[var(--editorial-text)] hover:bg-transparent hover:text-[var(--editorial-text)] transition-colors whitespace-nowrap"
                >
                  Open notebook →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
