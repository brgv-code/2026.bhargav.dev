"use client";

import { Download } from "lucide-react";
import { trackCVDownload } from "@/lib/analytics";

export function CvDownloadButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      download
      onClick={trackCVDownload}
      className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-2 text-xs uppercase tracking-wider text-muted hover:border-border-strong hover:text-primary transition-colors shrink-0"
    >
      <Download className="h-3.5 w-3.5" />
      Download PDF
    </a>
  );
}
