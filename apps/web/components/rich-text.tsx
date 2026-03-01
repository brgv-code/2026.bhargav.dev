import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  convertLexicalToHTML,
  defaultHTMLConverters,
  type HTMLConvertersFunction,
} from "@payloadcms/richtext-lexical/html";
function s(v: unknown): string {
  return v != null ? String(v) : "";
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Lexical block node shape (type: "block", blockType: slug, fields: {...}). */
type BlockNode = { fields: Record<string, unknown> };

type BlockConverterArgs = { node: BlockNode };

const htmlConverters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    ...(defaultConverters.blocks ?? {}),
    code: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as {
        code?: string;
        language?: string;
        filename?: string;
      };
      const filename = fields.filename
        ? `<p class="text-xs text-muted-foreground mb-2 font-mono">${escapeHtml(s(fields.filename))}</p>`
        : "";
      return `<div class="my-6 rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto">${filename}<pre class="text-sm"><code>${escapeHtml(s(fields.code))}</code></pre></div>`;
    },
    callout: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as {
        type?: string;
        title?: string;
        content?: string;
      };
      const typeClass =
        fields.type === "danger"
          ? "border-red-500/50 bg-red-500/10"
          : fields.type === "warning"
            ? "border-amber-500/50 bg-amber-500/10"
            : "border-border bg-muted/30";
      const title = s(fields.title)
        ? `<p class="font-semibold text-sm mb-2">${escapeHtml(s(fields.title))}</p>`
        : "";
      const content = `<div class="text-sm text-muted-foreground whitespace-pre-wrap">${escapeHtml(s(fields.content)).replace(/\n/g, "<br />")}</div>`;
      return `<div class="my-6 rounded-lg border p-4 ${typeClass}" role="note">${title}${content}</div>`;
    },
    videoEmbed: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as { url?: string; caption?: string };
      const url = s(fields.url);
      if (!url) return "";
      const isYoutube = /youtube\.com|youtu\.be/i.test(url);
      const isVimeo = /vimeo\.com/i.test(url);
      const ytEmbedSrc = isYoutube
        ? url.includes("youtu.be/")
          ? `https://www.youtube.com/embed/${url.split("youtu.be/")[1]?.split("?")[0] ?? ""}`
          : url.replace(/youtube\.com\/watch\?v=/, "youtube.com/embed/")
        : "";
      let embed = "";
      if (isYoutube && ytEmbedSrc) {
        embed = `<iframe src="${escapeHtml(ytEmbedSrc)}" title="YouTube embed" class="w-full h-full" allowfullscreen></iframe>`;
      } else if (isVimeo) {
        embed = `<iframe src="${escapeHtml(url.replace("vimeo.com/", "player.vimeo.com/video/"))}" title="Vimeo embed" class="w-full h-full" allowfullscreen></iframe>`;
      } else {
        embed = `<video src="${escapeHtml(url)}" controls class="w-full h-full"></video>`;
      }
      const caption = s(fields.caption)
        ? `<figcaption class="text-sm text-muted-foreground mt-2">${escapeHtml(s(fields.caption))}</figcaption>`
        : "";
      return `<figure class="my-6"><div class="aspect-video rounded-lg border border-border overflow-hidden bg-muted">${embed}</div>${caption}</figure>`;
    },
    imageGallery: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as {
        images?: Array<{
          image?: { url?: string; alt?: string };
          caption?: string;
        }>;
        layout?: string;
      };
      const images = Array.isArray(fields.images) ? fields.images : [];
      if (images.length === 0) return "";
      const layout =
        fields.layout === "carousel"
          ? "flex overflow-x-auto gap-4"
          : "grid grid-cols-2 gap-4";
      const items = images
        .map((item, i) => {
          const img = item?.image;
          const src =
            typeof img === "object" && img && "url" in img ? s(img.url) : "";
          if (!src) return "";
          const alt =
            typeof img === "object" && img && "alt" in img
              ? s(img.alt)
              : "Gallery image";
          const cap = s(item?.caption)
            ? `<figcaption class="text-sm text-muted-foreground mt-1">${escapeHtml(s(item.caption))}</figcaption>`
            : "";
          return `<figure class="min-w-0"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="rounded-lg border border-border w-full object-cover" />${cap}</figure>`;
        })
        .filter(Boolean)
        .join("");
      return `<div class="my-6 ${layout}">${items}</div>`;
    },
    sandpack: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as { code?: string };
      return `<div class="my-6 rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto"><pre class="text-sm"><code>${escapeHtml(s(fields.code))}</code></pre></div>`;
    },
    aiPlayground: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as {
        system_prompt?: string;
        initial_user_prompt?: string;
      };
      const sys = s(fields.system_prompt)
        ? `<p class="text-sm text-muted-foreground mb-2">${escapeHtml(s(fields.system_prompt))}</p>`
        : "";
      const user = s(fields.initial_user_prompt)
        ? `<p class="text-sm">${escapeHtml(s(fields.initial_user_prompt))}</p>`
        : "";
      return `<div class="my-6 rounded-lg border border-border bg-muted/30 p-4">${sys}${user}</div>`;
    },
    divider: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as { label?: string };
      const label = s(fields.label);
      if (label) {
        return `<div class="my-8 flex items-center gap-4"><span class="flex-1 border-t border-border"></span><span class="text-xs text-muted-foreground">${escapeHtml(label)}</span><span class="flex-1 border-t border-border"></span></div>`;
      }
      return `<hr class="my-8 border-border" />`;
    },
  },
});

/** Injects id into the first N heading tags (h2/h3/h4) in order. Used for TOC anchors. */
function injectHeadingIds(html: string, ids: string[]): string {
  if (!ids.length) return html;
  let index = 0;
  return html.replace(
    /<(h[234])(\s[^>]*)?>/gi,
    (match, tag: string, rest: string | undefined) => {
      const id = ids[index++];
      if (!id || (rest != null && /id\s*=/i.test(rest))) return match;
      const safeId = escapeHtml(id);
      const attrs = rest != null ? ` ${rest.trim()}` : "";
      return `<${tag} id="${safeId}"${attrs}>`;
    }
  );
}

type Props = {
  data: SerializedEditorState | null | undefined;
  className?: string;
  /** When provided (e.g. from post.tocItems), heading tags get these ids in order so TOC links work without client JS. */
  headingIds?: string[];
};

export function RichText({ data, className, headingIds }: Props) {
  if (!data || typeof data !== "object" || !("root" in data)) {
    return <p className="text-muted-foreground">No content yet.</p>;
  }

  let html = convertLexicalToHTML({
    data,
    converters: htmlConverters,
    disableContainer: true,
  });

  if (headingIds?.length) {
    html = injectHeadingIds(html, headingIds);
  }

  const wrapperClass =
    className ?? "prose prose-neutral dark:prose-invert max-w-none";
  return (
    <div className={wrapperClass} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
