"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PixelVideo,
  PixelArticle,
  PixelPodcast,
  PixelBook,
  PixelGear,
  PixelPlus,
  PixelClose,
  PixelNote,
} from "@/components/shared/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";
import { formatMonthDay } from "@/lib/format";

type FavoriteType = "video" | "article" | "podcast" | "book" | "tool";

interface Favorite {
  id: number;
  type: FavoriteType;
  title: string;
  url: string | null;
  thumbnailUrl: string | null;
  source: string | null;
  thoughts: string | null;
  dateAdded: string;
  createdAt: string;
}

const typeConfig: Record<
  FavoriteType,
  { icon: typeof PixelVideo; label: string }
> = {
  video: { icon: PixelVideo, label: "videos" },
  article: { icon: PixelArticle, label: "articles" },
  podcast: { icon: PixelPodcast, label: "podcasts" },
  book: { icon: PixelBook, label: "books" },
  tool: { icon: PixelGear, label: "tools" },
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [activeType, setActiveType] = useState<FavoriteType | "all">("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { playClick } = useSound();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const payloadRes = await fetch("/api/favorites", { cache: "no-store" });
      const json = payloadRes.ok ? await payloadRes.json() : [];
      const nextFavorites: Favorite[] = (Array.isArray(json) ? json : []).map(
        (doc: {
          id: number;
          type?: string | null;
          title: string;
          url?: string | null;
          thumbnailUrl?: string | null;
          source?: string | null;
          thoughts?: string | null;
          dateAdded?: string | null;
          createdAt: string;
        }) => ({
          id: doc.id,
          type: (doc.type ?? "article") as FavoriteType,
          title: doc.title,
          url: doc.url ?? null,
          thumbnailUrl: doc.thumbnailUrl ?? null,
          source: doc.source ?? null,
          thoughts: doc.thoughts ?? null,
          dateAdded: doc.dateAdded ?? doc.createdAt,
          createdAt: doc.createdAt,
        }),
      );

      nextFavorites.sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      );

      setFavorites(nextFavorites);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = (type: FavoriteType | "all") => {
    playClick();
    setActiveType(type);
  };

  const handleFavoriteClick = (favorite: Favorite) => {
    playClick();
    setSelectedFavorite(selectedFavorite?.id === favorite.id ? null : favorite);
  };

  const filteredFavorites =
    activeType === "all"
      ? favorites
      : favorites.filter((f) => f.type === activeType);

  const getTypeCount = (type: FavoriteType) =>
    favorites.filter((f) => f.type === type).length;
  const sidebarLinks = [
    { href: "/writing", label: "Latest writing" },
    { href: "/projects", label: "Selected projects" },
    { href: "/notes", label: "Daily notes" },
    { href: "/reading", label: "Reading log" },
  ];

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">Favorites</h1>
        <p className="text-sm text-secondary mt-0.5">
          Videos, articles, podcasts, books, and tools that shaped my thinking.
        </p>
      </div>

      <div className="grid min-h-0 grid-cols-1 xl:grid-cols-home-main">
        <div className="min-w-0 xl:border-r xl:border-border">
          <main className="px-6 py-6 pb-24">
            <section className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
              <button
                onClick={() => handleTypeClick("all")}
                className={`transition-colors ${
                  activeType === "all"
                    ? "text-[var(--editorial-text)]"
                    : "text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)]"
                }`}
              >
                all ({favorites.length})
              </button>
              {(Object.keys(typeConfig) as FavoriteType[]).map((type) => {
                const config = typeConfig[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeClick(type)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      activeType === type
                        ? "text-[var(--editorial-text)]"
                        : "text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>
                      {config.label} ({getTypeCount(type)})
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                playClick();
                setAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
            >
              <PixelPlus className="w-3.5 h-3.5" />
              <span>add</span>
            </button>
          </section>

            <section>
            {loading ? (
              <p className="text-sm text-[var(--editorial-text-muted)]">
                Loading...
              </p>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-16">
                <PixelNote className="w-8 h-8 text-[var(--editorial-text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--editorial-text-muted)]">
                  No favorites yet
                </p>
                <p className="text-xs text-[var(--editorial-text-dim)] mt-1">
                  Start adding your favorite content
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFavorites.map((favorite) => {
                  const config =
                    typeConfig[favorite.type] ?? typeConfig.article;
                  const Icon = config.icon;
                  const isExpanded = selectedFavorite?.id === favorite.id;

                  return (
                    <div
                      key={favorite.id}
                      className={`border transition-colors ${
                        isExpanded
                          ? "border-[var(--editorial-text)]/30 bg-[var(--editorial-surface)]"
                          : "border-[var(--editorial-border)] hover:border-[var(--editorial-text)]/20"
                      }`}
                    >
                      <button
                        onClick={() => handleFavoriteClick(favorite)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                          <h3 className="font-serif text-xl sm:text-2xl text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors truncate pr-4 flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0 text-[var(--editorial-text-muted)]" />
                            {favorite.title}
                          </h3>
                            <span className="font-mono text-[10px] text-[var(--editorial-text-dim)] shrink-0 mt-1 sm:mt-0">
                            {formatMonthDay(favorite.dateAdded)}
                          </span>
                        </div>
                        {favorite.source && (
                          <p className="font-mono text-[10px] text-[var(--editorial-text-muted)] mt-0.5">
                            {favorite.source}
                          </p>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="space-y-3">
                            {favorite.url && (
                              <a
                                href={favorite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--editorial-accent)] hover:underline transition-colors block break-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {favorite.url}
                              </a>
                            )}
                            {favorite.thoughts && (
                              <div className="pt-3 border-t border-[var(--editorial-border)]">
                                <p className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest mb-1">
                                  my thoughts
                                </p>
                                <p className="text-sm text-[var(--editorial-text-muted)] whitespace-pre-wrap leading-relaxed">
                                  {favorite.thoughts}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </section>
          </main>
        </div>

        <aside className="hidden min-h-0 xl:block" aria-labelledby="favorites-sidebar-heading">
          <section className="min-h-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2
                id="favorites-sidebar-heading"
                className="text-2xs font-mono uppercase tracking-widest text-muted"
              >
                Explore
              </h2>
            </div>
            <nav className="flex flex-col" aria-label="Explore">
              {sidebarLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col gap-1 border-b border-border px-5 py-4 transition-colors duration-normal hover:bg-interactive-hover"
                >
                  <span className="text-sm font-semibold leading-snug text-primary transition-colors duration-normal group-hover:text-accent">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </section>
        </aside>
      </div>

      <AddFavoriteModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={fetchFavorites}
      />
    </>
  );
}

function AddFavoriteModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [type, setType] = useState<FavoriteType>("article");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [saving, setSaving] = useState(false);
  const { playClick, playSuccess } = useSound();

  const handleSave = async () => {
    if (!title.trim()) return;

    playClick();
    setSaving(true);
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: title.trim(),
        url: url.trim() || null,
        source: source.trim() || null,
        thoughts: thoughts.trim() || null,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[favorites] create failed", detail);
      setSaving(false);
      return;
    }

    setSaving(false);
    playSuccess();
    resetForm();
    onSave();
    onClose();
  };

  const resetForm = () => {
    setType("article");
    setTitle("");
    setUrl("");
    setSource("");
    setThoughts("");
  };

  const handleClose = () => {
    playClick();
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[var(--editorial-bg)]/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-[var(--editorial-surface)] border border-[var(--editorial-border)] p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest mb-2">
              add favorite
            </p>
            <h2 className="font-serif text-lg text-[var(--editorial-text)]">
              New Entry
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
          >
            <PixelClose className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest block mb-2">
            type
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(typeConfig) as FavoriteType[]).map((t) => {
              const config = typeConfig[t];
              const Icon = config.icon;
              return (
                <button
                  key={t}
                  onClick={() => {
                    playClick();
                    setType(t);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs transition-colors ${
                    type === t
                      ? "bg-[var(--editorial-text)] text-[var(--editorial-bg)]"
                      : "bg-[var(--editorial-surface2)] text-[var(--editorial-text-muted)] hover:bg-[var(--editorial-border)]"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest block mb-2">
            title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--editorial-surface2)] text-[var(--editorial-text)] px-3 py-2 text-sm border border-[var(--editorial-border)] focus:ring-1 focus:ring-[var(--editorial-text)] focus:outline-none"
            placeholder="Enter title"
          />
        </div>

        <div className="mb-4">
          <label className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest block mb-2">
            url
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[var(--editorial-surface2)] text-[var(--editorial-text)] px-3 py-2 text-sm border border-[var(--editorial-border)] focus:ring-1 focus:ring-[var(--editorial-text)] focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="mb-4">
          <label className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest block mb-2">
            source
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-[var(--editorial-surface2)] text-[var(--editorial-text)] px-3 py-2 text-sm border border-[var(--editorial-border)] focus:ring-1 focus:ring-[var(--editorial-text)] focus:outline-none"
            placeholder="YouTube, Medium, Spotify..."
          />
        </div>

        <div className="mb-6">
          <label className="font-mono text-[10px] text-[var(--editorial-text-dim)] uppercase tracking-widest block mb-2">
            your thoughts
          </label>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className="w-full h-24 bg-[var(--editorial-surface2)] text-[var(--editorial-text)] px-3 py-2 text-sm border border-[var(--editorial-border)] focus:ring-1 focus:ring-[var(--editorial-text)] focus:outline-none resize-none"
            placeholder="What did you learn? Why did you save this?"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-2 font-mono text-xs uppercase tracking-widest bg-[var(--editorial-text)] text-[var(--editorial-bg)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "saving..." : "save"}
          </button>
        </div>
      </div>
    </div>
  );
}
