import { marked } from "marked";
import { JSDOM } from "jsdom";
import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import { configPromise } from "@/payload.config";

let _sanitizedConfig: Awaited<
  ReturnType<typeof sanitizeServerEditorConfig>
> | null = null;

async function getSanitizedConfig() {
  if (!_sanitizedConfig) {
    const config = await configPromise;
    _sanitizedConfig = await sanitizeServerEditorConfig(
      defaultEditorConfig,
      config
    );
  }
  return _sanitizedConfig;
}

/**
 * Thin wrapper that satisfies the `convertHTMLToLexical` JSDOM constructor
 * signature. jsdom's Document and TypeScript's DOM Document are structurally
 * compatible at runtime — the wrapper confines the mismatch to one place.
 */
class JSDOMAdapter {
  window: { document: Document };
  constructor(html: string) {
    const dom = new JSDOM(html);
    // jsdom's Document is structurally identical to the DOM Document
    // at runtime; TypeScript just tracks them as separate declaration files.
    this.window = { document: dom.window.document as Document };
  }
}

/**
 * Renders markdown to HTML with `marked` (handles links, images, code fences).
 * Never throws — on the rare parse failure it degrades to the escaped raw text.
 * This is the reliable path: posts store this as `contentHtml` and the frontend
 * renders `markdownInput` directly (see apps/web/lib/markdown.tsx), so no Lexical
 * conversion is involved for markdown-authored content.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  try {
    return await marked(markdown, { async: true, gfm: true, breaks: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[markdownField] marked parsing failed, using raw text: ${msg}`);
    return `<p>${escapeHtml(markdown)}</p>`;
  }
}

/** A minimal valid Lexical editor state — used to clear the `content` field. */
export function emptyLexicalRoot(): Record<string, unknown> {
  return EMPTY_ROOT();
}

/**
 * Converts pasted markdown into HTML plus a best-effort Lexical tree. Retained
 * for the document-upload path; the post paste flow uses `markdownToHtml` and
 * skips Lexical entirely (see plugin.ts).
 *
 * IMPORTANT: this NEVER throws. `convertHTMLToLexical` is fragile — it chokes on
 * anchors/images whose node shape doesn't match the target editor config — so a
 * failure there must not reject the whole save; we keep the HTML and fall back
 * to an empty Lexical root.
 */
export async function markdownToPayload(markdown: string): Promise<{
  html: string;
  lexicalJSON: Record<string, unknown>;
}> {
  const html = await markdownToHtml(markdown);

  let lexicalJSON: Record<string, unknown>;
  try {
    const editorConfig = await getSanitizedConfig();
    lexicalJSON = ensureNonEmptyRoot(
      await convertHTMLToLexical({
        html,
        editorConfig,
        JSDOM: JSDOMAdapter,
      })
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[markdownField] HTML→Lexical conversion failed (keeping markdown + HTML): ${msg}`
    );
    lexicalJSON = EMPTY_ROOT();
  }

  return { html, lexicalJSON };
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const EMPTY_PARAGRAPH = {
  type: "paragraph",
  version: 1,
  children: [],
  direction: null,
  format: "",
  indent: 0,
};

/** A minimal, valid Lexical editor state used when conversion can't run. */
function EMPTY_ROOT(): Record<string, unknown> {
  return {
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [EMPTY_PARAGRAPH],
    },
  };
}

function ensureNonEmptyRoot<T extends Record<string, unknown>>(value: T): T {
  const root = value?.root as { children?: unknown[] } | undefined;
  if (!root || !Array.isArray(root.children)) return value;
  if (root.children.length > 0) return value;
  return {
    ...value,
    root: {
      ...root,
      children: [EMPTY_PARAGRAPH],
    },
  } as T;
}
