import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  convertLexicalToHTML,
  type HTMLConvertersFunction,
} from "@payloadcms/richtext-lexical/html";
import { codeToHtml } from "shiki";

const cmsBase = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "";

function resolveCmsUrl(url: string | undefined): string {
  if (!url) return "";
  return url.startsWith("http") || !cmsBase ? url : `${cmsBase}${url}`;
}

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

/**
 * Syntax highlighting for Lexical code/sandpack blocks. Uses the same shiki
 * themes as the markdown renderer (apps/web/lib/markdown.tsx) so both content
 * paths look identical, and emits `data-theme="light dark"` on the <code> so the
 * existing `code[data-theme*=" "] span` CSS colours the spans per theme.
 * convertLexicalToHTML is synchronous, so we pre-highlight every code block and
 * hand the converters a lookup map keyed by language + source.
 */
type CodeLike = { code: string; language: string };

function codeKey(language: string, code: string): string {
  return `${language} ${code}`;
}

function shikiLang(language: string): string {
  return language === "plaintext" || !language ? "text" : language;
}

function collectCodeBlocks(data: SerializedEditorState): CodeLike[] {
  const out: CodeLike[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    const fields = n.fields as Record<string, unknown> | undefined;
    if (n.type === "block" && fields && typeof fields === "object") {
      const blockType = fields.blockType;
      if (blockType === "code" || blockType === "sandpack") {
        const code = typeof fields.code === "string" ? fields.code : "";
        if (code) {
          out.push({
            code,
            language:
              blockType === "sandpack"
                ? "tsx"
                : typeof fields.language === "string"
                  ? fields.language
                  : "plaintext",
          });
        }
      }
    }
    if (Array.isArray(n.children)) n.children.forEach(walk);
  };
  const root = (data as { root?: { children?: unknown[] } }).root;
  if (Array.isArray(root?.children)) root.children.forEach(walk);
  return out;
}

/** Highlights one block and returns just the inner <code> markup (spans). */
async function highlightInner(code: string, language: string): Promise<string> {
  try {
    const html = await codeToHtml(code, {
      lang: shikiLang(language),
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultColor: false,
    });
    const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
    return match ? match[1] : escapeHtml(code);
  } catch {
    return escapeHtml(code);
  }
}

async function buildHighlightMap(
  data: SerializedEditorState
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    collectCodeBlocks(data).map(async ({ code, language }) => {
      const key = codeKey(language, code);
      if (!map.has(key)) map.set(key, await highlightInner(code, language));
    })
  );
  return map;
}

/** Wraps highlighted (or escaped) code in the site's code-block container. */
function codeContainer(inner: string, filename?: string): string {
  const filenameBar = filename
    ? `<div style="padding:0.5rem 0.75rem;border-bottom:1px solid var(--code-border);background:var(--code-header-bg);font-family:var(--font-mono);font-size:0.75rem;color:var(--color-text-muted)">${escapeHtml(filename)}</div>`
    : "";
  return `<div style="margin:2rem 0;border:1px solid var(--code-border);border-radius:var(--radius-md);overflow:hidden;background:var(--code-bg)">${filenameBar}<pre style="margin:0;padding:1.25rem;overflow-x:auto;font-size:0.875rem;line-height:1.65;background:var(--code-bg)"><code data-theme="light dark" style="font-family:var(--font-mono)">${inner}</code></pre></div>`;
}

/** Lexical block node shape (type: "block", blockType: slug, fields: {...}). */
type BlockNode = { fields: Record<string, unknown> };

type BlockConverterArgs = { node: BlockNode };

type UploadNode = {
  value?: {
    url?: string;
    alt?: string;
    mimeType?: string;
    filename?: string;
    width?: number;
    height?: number;
    sizes?: Record<string, { url?: string; width?: number; height?: number; mimeType?: string; filesize?: number; filename?: string }>;
  };
  fields?: { alt?: string; caption?: string };
};

const makeHtmlConverters =
  (highlightMap: Map<string, string>): HTMLConvertersFunction =>
  ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const uploadNode = node as unknown as UploadNode;
    if (typeof uploadNode.value !== "object" || !uploadNode.value) return "";
    const doc = uploadNode.value;
    const url = resolveCmsUrl(doc.url);
    if (!url) return "";
    const alt = escapeHtml(uploadNode.fields?.alt ?? doc.alt ?? "");
    const caption = uploadNode.fields?.caption
      ? `<figcaption class="text-sm text-muted-foreground mt-2">${escapeHtml(s(uploadNode.fields.caption))}</figcaption>`
      : "";
    if (!doc.mimeType?.startsWith("image")) {
      return `<a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(doc.filename ?? url)}</a>`;
    }
    const img = `<img src="${escapeHtml(url)}" alt="${alt}" width="${doc.width ?? ""}" height="${doc.height ?? ""}" class="rounded-lg w-full object-cover" loading="lazy" />`;
    return `<figure class="my-6">${img}${caption}</figure>`;
  },
  blocks: {
    ...(defaultConverters.blocks ?? {}),
    code: ({ node }: BlockConverterArgs) => {
      const fields = node.fields as {
        code?: string;
        language?: string;
        filename?: string;
      };
      const language = fields.language || "plaintext";
      const inner =
        highlightMap.get(codeKey(language, s(fields.code))) ??
        escapeHtml(s(fields.code));
      return codeContainer(inner, fields.filename);
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
        .map((item) => {
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
      const inner =
        highlightMap.get(codeKey("tsx", s(fields.code))) ??
        escapeHtml(s(fields.code));
      return codeContainer(inner);
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
  headingIds?: string[];
};

export async function RichText({ data, className, headingIds }: Props) {
  if (!data || typeof data !== "object" || !("root" in data)) {
    return <p className="text-muted-foreground">No content yet.</p>;
  }

  const highlightMap = await buildHighlightMap(data);

  let html = convertLexicalToHTML({
    data,
    converters: makeHtmlConverters(highlightMap),
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
