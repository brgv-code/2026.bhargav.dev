import type { Config, Field, Plugin } from "payload";
import { APIError } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import fs from "node:fs";
import path from "node:path";
import {
  markdownToPayload,
  markdownToHtml,
  emptyLexicalRoot,
} from "./converter";
import { slugs, type SlugValues } from "@/collections/constants";
import { extractPlainText } from "@/collections/blocks";

export interface MarkdownPluginOptions {
  uploadCollectionSlug?: SlugValues;
  collectionsWithPasteField?: SlugValues[];
  pasteAndDocumentInAllCollections?: boolean;
  documentFieldName?: string;
  fieldNames?: {
    input?: string;
    content?: string;
    html?: string;
    documentContent?: string;
    documentHtml?: string;
  };
  pasteFieldNames?: { content?: string; html?: string };
}

function toSet(values: SlugValues[]): Set<string> {
  return new Set(values);
}

function isNamedField(field: Field): field is Extract<Field, { name: string }> {
  return "name" in field;
}

function getFieldNames(fields: Field[]): string[] {
  return fields.filter(isNamedField).map((f) => f.name);
}

function titleFromMarkdown(md: string): string {
  const line = md
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!line) return "Untitled";
  const heading = line.replace(/^#+\s*/, "").trim();
  return heading || "Untitled";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SEO_DESCRIPTION_MAX_LEN = 160;

function isBlank(value: unknown): boolean {
  return (
    value == null || (typeof value === "string" && value.trim().length === 0)
  );
}

function truncateForSeo(
  text: string,
  maxLen = SEO_DESCRIPTION_MAX_LEN
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen - 3);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > maxLen / 2 ? cut.slice(0, lastSpace) : cut;
  return body.trimEnd() + "...";
}

/** Strips the inline markdown that would otherwise leak into an SEO summary. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * First paragraph of real prose in the markdown.
 *
 * The heading has to be skipped explicitly: a post opens with `# Title`
 * followed by a blank line, so the first "paragraph" is the H1 itself and
 * naively taking it produces a description identical to the title. Frontmatter,
 * fenced code, horizontal rules, and image-only lines are skipped for the same
 * reason — none of them read as a summary.
 */
function descriptionFromMarkdown(
  md: string,
  maxLen = SEO_DESCRIPTION_MAX_LEN
): string {
  const trimmed = md.trim();
  if (!trimmed) return "";
  const body = trimmed.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  const paragraphs: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (current.length) paragraphs.push(current.join(" "));
    current = [];
  };

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    const fenceMatch = /^(```|~~~)/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1];
      else if (line.startsWith(fence)) fence = null;
      flush();
      continue;
    }
    if (fence !== null) continue;
    // Blank line, heading, or horizontal rule: paragraph break, no content.
    if (!line || /^#{1,6}\s/.test(line) || /^([-*_])\1{2,}$/.test(line)) {
      flush();
      continue;
    }
    current.push(line.replace(/^>+\s*/, "").replace(/^(?:[-*+]|\d+\.)\s+/, ""));
  }
  flush();

  const prose = paragraphs.map(stripInlineMarkdown).find((p) => p.length > 0);
  return prose ? truncateForSeo(prose, maxLen) : "";
}

function lexicalBlocks(content: unknown): { type: string; text: string }[] {
  const root = (content as { root?: { children?: unknown[] } } | null)?.root;
  const children = Array.isArray(root?.children) ? root.children : [];
  return children
    .map((node) => ({
      type: ((node as { type?: string })?.type ?? "") as string,
      text: extractPlainText({ root: node }).trim(),
    }))
    .filter((block) => block.text.length > 0);
}

/** Heading of a parsed Markdown document — its first non-empty block. */
function titleFromLexical(content: unknown): string {
  const first = lexicalBlocks(content)[0];
  return first ? first.text.slice(0, 200) : "";
}

/**
 * First prose block of a parsed Markdown document, skipping the leading block
 * (it supplies the title) and any further headings.
 */
function descriptionFromLexical(
  content: unknown,
  maxLen = SEO_DESCRIPTION_MAX_LEN
): string {
  const body = lexicalBlocks(content)
    .slice(1)
    .find((block) => block.type !== "heading");
  return body ? truncateForSeo(body.text, maxLen) : "";
}

export const markdownPlugin =
  (opts: MarkdownPluginOptions = {}): Plugin =>
  (incomingConfig: Config): Config => {
    const {
      uploadCollectionSlug = slugs.documents,
      collectionsWithPasteField = [],
      pasteAndDocumentInAllCollections = false,
      documentFieldName = "sourceDocument",
      fieldNames = {},
      pasteFieldNames = {},
    } = opts;

    const inputName = fieldNames.input ?? "markdownInput";
    const contentName = fieldNames.content ?? "content";
    const htmlName = fieldNames.html ?? "contentHtml";
    const docContentName = fieldNames.documentContent ?? "parsedContent";
    const docHtmlName = fieldNames.documentHtml ?? "contentHtml";
    const pasteContentName = pasteFieldNames.content ?? "content";
    const pasteHtmlName = pasteFieldNames.html ?? "contentHtml";

    const config: Config = { ...incomingConfig };
    const allCollectionSlugs = (config.collections ?? []).map((c) => c.slug);
    const excludeFromAll = new Set<string>([
      uploadCollectionSlug,
      slugs.users,
      slugs.media,
    ]);
    const pasteSet = pasteAndDocumentInAllCollections
      ? new Set(allCollectionSlugs.filter((s) => !excludeFromAll.has(s)))
      : toSet(collectionsWithPasteField);

    config.collections = (config.collections ?? []).map((collection) => {
      const isUploadCollection = collection.slug === uploadCollectionSlug;
      const hasPasteField = pasteSet.has(collection.slug);

      if (!isUploadCollection && !hasPasteField) return collection;

      const col = { ...collection };
      col.fields = [...(col.fields ?? [])];
      col.hooks = { ...col.hooks };

      if (isUploadCollection) {
        col.hooks.afterChange = [
          ...(col.hooks.afterChange ?? []),
          async ({ doc, req, operation }) => {
            if (operation !== "create") return doc;

            const filename: string | undefined = doc.filename;
            if (!filename?.match(/\.(md|markdown|txt)$/i)) return doc;

            try {
              const uploadDir =
                typeof col.upload === "object" && col.upload.staticDir
                  ? col.upload.staticDir
                  : "media";

              const filePath = path.isAbsolute(uploadDir)
                ? path.join(uploadDir, filename)
                : path.resolve(process.cwd(), uploadDir, filename);
              if (!fs.existsSync(filePath)) return doc;

              const rawMarkdown = fs.readFileSync(filePath, "utf-8");
              const { lexicalJSON, html } =
                await markdownToPayload(rawMarkdown);

              try {
                await req.payload.update({
                  collection: uploadCollectionSlug,
                  id: doc.id,

                  data: {
                    [contentName]: lexicalJSON,
                    [htmlName]: html,
                  } satisfies Record<string, unknown>,
                  overrideAccess: true,
                });
              } catch (updateErr) {
                const status = (updateErr as { status?: number })?.status;
                req.payload.logger.warn(
                  {
                    err: updateErr,
                    documentId: doc.id,
                    status,
                  },
                  "[markdownPlugin] Upload parse: could not persist parsed content (document saved; you can re-save or use file on a post to populate)"
                );
              }

              return { ...doc, [contentName]: lexicalJSON, [htmlName]: html };
            } catch (err) {
              req.payload.logger.error(
                { err },
                "[markdownPlugin] Upload parse failed"
              );
              return doc;
            }
          },
        ];

        const existing = getFieldNames(col.fields);

        if (!existing.includes(contentName)) {
          col.fields.push({
            name: contentName,
            type: "richText",
            label: "Content",
            editor: lexicalEditor({}),
          } satisfies Field);
        }

        if (!existing.includes(htmlName)) {
          col.fields.push({
            name: htmlName,
            type: "textarea",
            label: "Content HTML",
            admin: { readOnly: true },
          } satisfies Field);
        }
      }

      if (hasPasteField) {
        const existing = getFieldNames(col.fields);

        if (!existing.includes(inputName)) {
          col.fields.push({
            name: inputName,
            type: "textarea",
            label: "Paste Markdown",
            admin: {
              description:
                "This is the source of truth for the post body — it renders with syntax highlighting, links, and images. " +
                "Images: upload the file in the Media collection, copy its URL, and embed it as ![alt](/api/media/file/your-file.png). " +
                "The Content (Rich Text) field below is derived and optional; you do not need to edit it.",
              style: { fontFamily: "monospace", minHeight: "200px" },
            },
          } satisfies Field);
        }

        if (!existing.includes(pasteContentName)) {
          col.fields.push({
            name: pasteContentName,
            type: "richText",
            label: "Content",
            editor: lexicalEditor({}),
            admin: {
              description:
                "Auto-populated from the Markdown above, or edit directly.",
            },
          } satisfies Field);
        }

        if (!existing.includes(pasteHtmlName)) {
          col.fields.push({
            name: pasteHtmlName,
            type: "textarea",
            label: "Content HTML",
            admin: {
              readOnly: true,
              description: "Server-rendered HTML for use in your frontend.",
              style: { fontFamily: "monospace" },
            },
          } satisfies Field);
        }

        if (!existing.includes(documentFieldName)) {
          col.fields.push({
            name: documentFieldName,
            type: "upload",
            relationTo: uploadCollectionSlug,
            admin: {
              description:
                "Or choose an existing Markdown document to use its content.",
            },
          } satisfies Field);
        }

        col.hooks.beforeChange = [
          async ({ data, req, originalDoc }) => {
            try {
              const incoming = data as Record<string, unknown>;
              const stored = originalDoc as
                Record<string, unknown> | null | undefined;
              /**
               * Derived values fill blanks — they never overwrite. Anything the
               * editor typed, or a value already stored and not part of this
               * update, wins over whatever the markdown would produce. Clearing
               * the field in the admin regenerates it on the next save.
               */
              const shouldDerive = (field: string): boolean => {
                if (!existing.includes(field)) return false;
                if (!isBlank(incoming[field])) return false;
                // Absent from a partial update: keep what is already stored.
                if (!(field in incoming) && !isBlank(stored?.[field]))
                  return false;
                return true;
              };
              const sourceDocRef = data[documentFieldName];
              const docId =
                typeof sourceDocRef === "object" &&
                sourceDocRef !== null &&
                "id" in sourceDocRef
                  ? (sourceDocRef as { id: string }).id
                  : sourceDocRef;
              const prevDocRef = (
                originalDoc as Record<string, unknown> | null | undefined
              )?.[documentFieldName];
              const prevDocId =
                typeof prevDocRef === "object" &&
                prevDocRef !== null &&
                prevDocRef !== undefined &&
                "id" in prevDocRef
                  ? (prevDocRef as { id: string }).id
                  : prevDocRef;
              const documentSelectionChanged =
                docId != null && String(docId) !== String(prevDocId ?? "");

              if (docId != null && documentSelectionChanged) {
                try {
                  const doc = await req.payload.findByID({
                    collection: uploadCollectionSlug,
                    id: typeof docId === "number" ? docId : String(docId),
                    depth: 0,
                  });
                  const docRecord = doc as unknown as Record<string, unknown>;
                  let fromContent = docRecord[docContentName];
                  let fromHtml = docRecord[docHtmlName];
                  const filename =
                    typeof docRecord.filename === "string"
                      ? docRecord.filename
                      : undefined;

                  if (
                    (fromContent == null || fromHtml == null) &&
                    filename?.match(/\.(md|markdown|txt)$/i)
                  ) {
                    const uploadCol = config.collections?.find(
                      (c) => c.slug === uploadCollectionSlug
                    );
                    const uploadDir =
                      typeof uploadCol?.upload === "object" &&
                      uploadCol?.upload?.staticDir
                        ? uploadCol.upload.staticDir
                        : "media";
                    const filePath = path.isAbsolute(uploadDir)
                      ? path.join(uploadDir, filename)
                      : path.resolve(process.cwd(), uploadDir, filename);
                    if (fs.existsSync(filePath)) {
                      try {
                        const rawMarkdown = fs.readFileSync(filePath, "utf-8");
                        const parsed = await markdownToPayload(rawMarkdown);
                        fromContent = parsed.lexicalJSON;
                        fromHtml = parsed.html;
                        try {
                          await req.payload.update({
                            collection: uploadCollectionSlug,
                            id:
                              typeof docRecord.id === "number"
                                ? docRecord.id
                                : String(docRecord.id),
                            data: {
                              [docContentName]: fromContent,
                              [docHtmlName]: fromHtml,
                            } satisfies Record<string, unknown>,
                            overrideAccess: true,
                          });
                        } catch {
                          // ignore; we have content for this save
                        }
                      } catch {
                        // leave fromContent/fromHtml as-is
                      }
                    }
                  }

                  if (fromContent != null || fromHtml != null) {
                    (data as Record<string, unknown>)[pasteContentName] =
                      fromContent;
                    (data as Record<string, unknown>)[pasteHtmlName] = fromHtml;
                    const derivedTitle = titleFromLexical(fromContent);
                    const derivedDescription =
                      descriptionFromLexical(fromContent);
                    if (derivedTitle) {
                      if (shouldDerive("title")) {
                        (data as Record<string, unknown>).title = derivedTitle;
                      }
                      if (shouldDerive("slug")) {
                        (data as Record<string, unknown>).slug =
                          slugify(derivedTitle) || "untitled";
                      }
                    }
                    if (derivedDescription && shouldDerive("description")) {
                      (data as Record<string, unknown>).description =
                        derivedDescription;
                    }
                    if (existing.includes("meta")) {
                      const meta = (data.meta as Record<string, unknown>) ?? {};
                      (data as Record<string, unknown>).meta = {
                        ...meta,
                        title: isBlank(meta.title) ? derivedTitle : meta.title,
                        description: isBlank(meta.description)
                          ? derivedDescription
                          : meta.description,
                      };
                    }
                  }
                  return data;
                } catch (err) {
                  req.payload.logger.error(
                    { err },
                    "[markdownPlugin] Copy from document failed"
                  );
                }
              }

              const rawMarkdown: string | undefined = data[inputName];
              if (rawMarkdown?.trim()) {
                try {
                  // Markdown is the source of truth: render it to HTML for the
                  // `contentHtml` field and clear the Lexical `content` field.
                  // We deliberately DON'T convert to Lexical — that path fails
                  // Payload's strict richText validation on images (invalid
                  // upload IDs), links, and unsupported heading levels, and the
                  // frontend never renders `content` when `markdownInput` is set.
                  const html = await markdownToHtml(rawMarkdown);
                  (data as Record<string, unknown>)[pasteContentName] =
                    emptyLexicalRoot();
                  (data as Record<string, unknown>)[pasteHtmlName] = html;
                  const derivedTitle = titleFromMarkdown(rawMarkdown);
                  const derivedDescription =
                    descriptionFromMarkdown(rawMarkdown);
                  if (shouldDerive("title")) {
                    (data as Record<string, unknown>).title = derivedTitle;
                  }
                  if (shouldDerive("slug")) {
                    (data as Record<string, unknown>).slug =
                      slugify(derivedTitle) || "untitled";
                  }
                  if (shouldDerive("description")) {
                    (data as Record<string, unknown>).description =
                      derivedDescription;
                  }
                  if (existing.includes("meta")) {
                    const meta = (data.meta as Record<string, unknown>) ?? {};
                    (data as Record<string, unknown>).meta = {
                      ...meta,
                      title: isBlank(meta.title) ? derivedTitle : meta.title,
                      description: isBlank(meta.description)
                        ? derivedDescription
                        : meta.description,
                    };
                  }
                  return data;
                } catch (err) {
                  const message =
                    err instanceof Error ? err.message : String(err);
                  req.payload.logger.error(
                    { err },
                    "[markdownPlugin] Paste conversion failed"
                  );
                  throw new APIError(
                    `Markdown conversion failed: ${message}`,
                    400,
                    undefined,
                    true
                  );
                }
              }
              return data;
            } catch (err) {
              req.payload.logger.error(
                { err, collection: col.slug },
                "[markdownPlugin] beforeChange error"
              );
              const message =
                err instanceof APIError
                  ? err.message
                  : err instanceof Error
                    ? err.message
                    : String(err);
              throw err instanceof APIError
                ? err
                : new APIError(
                    `Markdown plugin: ${message}`,
                    400,
                    undefined,
                    true
                  );
            }
          },
          ...(col.hooks.beforeChange ?? []),
        ];
      }

      return col;
    });

    return config;
  };
