"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  PixelVideo,
  PixelArticle,
  PixelPodcast,
  PixelBook,
  PixelGear,
  PixelPlus,
  PixelClose,
  PixelNote,
} from "@/components/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";
import { formatMonthDay } from "@/lib/format";

type FavoriteType = "video" | "article" | "podcast" | "book" | "tool";

interface Favorite {
  id: string;
  type: FavoriteType;
  title: string;
  url: string | null;
  thumbnail_url: string | null;
  source: string | null;
  thoughts: string | null;
  date_added: string;
  created_at: string;
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
    const [payloadRes, supabaseData] = await Promise.all([
      fetch("/api/favorites").then((r) => (r.ok ? r.json() : [])),
      (async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("favorites")
          .select("*")
          .order("date_added", { ascending: false });
        return data ?? [];
      })(),
    ]);

    const fromPayload: Favorite[] = (Array.isArray(payloadRes) ? payloadRes : []).map(
      (doc: { id: number; type?: string | null; title: string; url?: string | null; source?: string | null; notes?: string | null; createdAt: string }) => ({
        id: `payload-${doc.id}`,
        type: (doc.type ?? "article") as FavoriteType,
        title: doc.title,
        url: doc.url ?? null,
        thumbnail_url: null,
        source: doc.source ?? null,
        thoughts: doc.notes ?? null,
        date_added: doc.createdAt,
        created_at: doc.createdAt,
      })
    );

    const fromSupabase: Favorite[] = (supabaseData as { id: string; type: string; title: string; url: string | null; thumbnail_url: string | null; source: string | null; thoughts: string | null; date_added: string; created_at: string }[]).map(
      (row) => ({
        id: row.id,
        type: row.type as FavoriteType,
        title: row.title,
        url: row.url ?? null,
        thumbnail_url: row.thumbnail_url ?? null,
        source: row.source ?? null,
        thoughts: row.thoughts ?? null,
        date_added: row.date_added,
        created_at: row.created_at,
      })
    );

    const merged = [...fromPayload, ...fromSupabase].sort(
      (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
    );
    setFavorites(merged);
    setLoading(false);
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

  return (
    <>
      <Navbar />
      <div data-theme="editorial" className="min-h-screen bg-[var(--editorial-bg)] flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <header className="mb-14">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)] mb-4">
              curated
            </p>
            <h1 className="font-serif text-4xl md:text-[3.2rem] text-[var(--editorial-text)] leading-[1.1] mb-4">
              Favorites
            </h1>
            <p className="text-[var(--editorial-text-muted)] text-[15px] leading-relaxed max-w-md">
              Videos, articles, podcasts, books, and tools that shaped my thinking.
            </p>
            <div className="mt-8 border-b border-dashed border-[var(--editorial-border)]" />
          </header>

          <section className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-[var(--editorial-border)] pb-4">
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
              <p className="text-sm text-[var(--editorial-text-muted)]">Loading...</p>
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
                          <h3 className="font-serif text-xl sm:text-2xl text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors truncate pr-4">
                            {favorite.title}
                          </h3>
                          <span className="font-mono text-[10px] text-[var(--editorial-text-dim)] shrink-0 mt-1 sm:mt-0">
                            {formatMonthDay(favorite.date_added)}
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
        <Footer />
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
    const supabase = createClient();

    await supabase.from("favorites").insert({
      type,
      title: title.trim(),
      url: url.trim() || null,
      source: source.trim() || null,
      thoughts: thoughts.trim() || null,
    });

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
            <h2 className="font-serif text-lg text-[var(--editorial-text)]">New Entry</h2>
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
