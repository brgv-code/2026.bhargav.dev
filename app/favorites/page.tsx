"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  PixelVideo,
  PixelArticle,
  PixelPodcast,
  PixelPlus,
  PixelClose,
  PixelNote,
} from "@/components/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";

type FavoriteType = "video" | "article" | "podcast";

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

const typeConfig = {
  video: { icon: PixelVideo, label: "videos" },
  article: { icon: PixelArticle, label: "articles" },
  podcast: { icon: PixelPodcast, label: "podcasts" },
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
    const supabase = createClient();
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .order("date_added", { ascending: false });

    if (data) {
      setFavorites(data);
    }
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
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-8">
        {/* Header */}
        <section className="mb-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            curated
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Favorites</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Videos, articles, and podcasts that shaped my thinking.
          </p>
        </section>

        {/* Type Filter */}
        <section className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleTypeClick("all")}
              className={`transition-colors ${
                activeType === "all"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <PixelPlus className="w-3.5 h-3.5" />
            <span>add</span>
          </button>
        </section>

        {/* Favorites List */}
        <section>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-16">
              <PixelNote className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No favorites yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start adding your favorite content
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFavorites.map((favorite) => {
                const config = typeConfig[favorite.type];
                const Icon = config.icon;
                const isExpanded = selectedFavorite?.id === favorite.id;

                return (
                  <div
                    key={favorite.id}
                    className={`border transition-colors ${
                      isExpanded
                        ? "border-foreground/30 bg-secondary/30"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <button
                      onClick={() => handleFavoriteClick(favorite)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-icon-accent mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-sm font-medium truncate">
                              {favorite.title}
                            </h3>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(favorite.date_added).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          {favorite.source && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {favorite.source}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="ml-7 space-y-3">
                          {favorite.url && (
                            <a
                              href={favorite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-link hover:text-link-hover transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {favorite.url}
                            </a>
                          )}
                          {favorite.thoughts && (
                            <div className="pt-2 border-t border-border/30">
                              <p className="text-xs text-muted-foreground mb-1">
                                my thoughts
                              </p>
                              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
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

        <Footer />
      </main>

      {/* Add Modal */}
      <AddFavoriteModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={fetchFavorites}
      />
    </>
  );
}

// Add Favorite Modal Component
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
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-card border border-border p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
              add favorite
            </p>
            <h2 className="text-lg font-bold">New Entry</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <PixelClose className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selection */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground block mb-2">
            type
          </label>
          <div className="flex gap-2">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                    type === t
                      ? "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground block mb-2">
            title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground"
            placeholder="Enter title"
          />
        </div>

        {/* URL */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground block mb-2">
            url
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground"
            placeholder="https://..."
          />
        </div>

        {/* Source */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground block mb-2">
            source
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground"
            placeholder="YouTube, Medium, Spotify..."
          />
        </div>

        {/* Thoughts */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground block mb-2">
            your thoughts
          </label>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className="w-full h-24 bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground resize-none"
            placeholder="What did you learn? Why did you save this?"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {saving ? "saving..." : "save"}
          </button>
        </div>
      </div>
    </div>
  );
}
