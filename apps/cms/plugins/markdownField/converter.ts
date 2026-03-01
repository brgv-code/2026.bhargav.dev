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

export async function markdownToPayload(markdown: string): Promise<{
  html: string;
  lexicalJSON: Record<string, unknown>;
}> {
  let html: string;
  try {
    html = await marked(markdown, { async: true, gfm: true, breaks: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Markdown parsing failed: ${msg}`);
  }

  let editorConfig: Awaited<ReturnType<typeof getSanitizedConfig>>;
  try {
    editorConfig = await getSanitizedConfig();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Lexical config failed: ${msg}`);
  }

  let lexicalJSON: Record<string, unknown>;
  try {
    lexicalJSON = await convertHTMLToLexical({
      html,
      editorConfig,
      JSDOM: JSDOMAdapter,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`HTML to Lexical conversion failed: ${msg}`);
  }

  const safeLexical = ensureNonEmptyRoot(lexicalJSON);

  return { html, lexicalJSON: safeLexical };
}

const EMPTY_PARAGRAPH = {
  type: "paragraph",
  version: 1,
  children: [],
  direction: null,
  format: "",
  indent: 0,
};

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
