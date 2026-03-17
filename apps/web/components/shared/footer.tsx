"use client";

export function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full shrink-0 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="font-mono text-[10px] tracking-widest uppercase text-muted">
          © {year} bhargav.dev
        </div>
        <div className="flex gap-6 font-mono text-[10px] uppercase text-muted">
          <a
            href="/rss.xml"
            className="hover:text-primary transition-colors"
            aria-label="RSS feed"
          >
            RSS
          </a>

          <button
            type="button"
            onClick={scrollToTop}
            className="text-primary hover:underline bg-transparent border-0 p-0 font-mono text-[10px] uppercase cursor-pointer"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
