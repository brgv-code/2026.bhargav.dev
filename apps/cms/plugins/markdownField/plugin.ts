import type { Config, Field, Plugin } from "payload";
import { APIError } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import fs from "node:fs";
import path from "node:path";
import { markdownToPayload } from "./converter";
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

function descriptionFromMarkdown(
  md: string,
  maxLen = SEO_DESCRIPTION_MAX_LEN
): string {
  const trimmed = md.trim();
  if (!trimmed) return "";
  const firstPara = trimmed.split(/\n\n+/)[0] ?? trimmed;
  const stripped = firstPara
    .replace(/^#+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen - 3).trim() + "...";
}

function descriptionFromPlainText(
  plain: string,
  maxLen = SEO_DESCRIPTION_MAX_LEN
): string {
  const trimmed = plain.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const firstLine = trimmed.split(/\n/)[0] ?? trimmed;
  if (firstLine.length <= maxLen) return firstLine;
  return firstLine.slice(0, maxLen - 3).trim() + "...";
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
                "Paste raw Markdown here and save — it will be auto-converted into the Content field below.",
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
                        const rawMarkdown = fs.readFileSync(
                          filePath,
                          "utf-8"
                        );
                        const parsed =
                          await markdownToPayload(rawMarkdown);
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
                    const plain = extractPlainText(fromContent);
                    if (
                      plain.trim() &&
                      existing.includes("title") &&
                      existing.includes("slug")
                    ) {
                      const firstLine =
                        plain
                          .split(/\n/)
                          .map((l) => l.trim())
                          .find(Boolean) ?? "Untitled";
                      const title = firstLine.slice(0, 200);
                      const slug = slugify(title) || "untitled";
                      (data as Record<string, unknown>).title = title;
                      (data as Record<string, unknown>).slug = slug;
                    }
                    if (plain.trim() && existing.includes("description")) {
                      (data as Record<string, unknown>).description =
                        descriptionFromPlainText(plain);
                    }
                    if (plain.trim() && existing.includes("meta")) {
                      const meta = (data.meta as Record<string, unknown>) ?? {};
                      const firstLine =
                        plain
                          .split(/\n/)
                          .map((l) => l.trim())
                          .find(Boolean) ?? "";
                      const seoTitle = firstLine.slice(0, 200);
                      const seoDesc = descriptionFromPlainText(plain);
                      (data as Record<string, unknown>).meta = {
                        ...meta,
                        title: seoTitle,
                        description: seoDesc,
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
                  const { lexicalJSON, html } =
                    await markdownToPayload(rawMarkdown);
                  (data as Record<string, unknown>)[pasteContentName] =
                    lexicalJSON;
                  (data as Record<string, unknown>)[pasteHtmlName] = html;
                  if (existing.includes("title") && existing.includes("slug")) {
                    const title = titleFromMarkdown(rawMarkdown);
                    const slug = slugify(title) || "untitled";
                    (data as Record<string, unknown>).title = title;
                    (data as Record<string, unknown>).slug = slug;
                  }
                  if (existing.includes("description")) {
                    (data as Record<string, unknown>).description =
                      descriptionFromMarkdown(rawMarkdown);
                  }
                  if (existing.includes("meta")) {
                    const meta = (data.meta as Record<string, unknown>) ?? {};
                    const seoTitle = titleFromMarkdown(rawMarkdown);
                    const seoDesc = descriptionFromMarkdown(rawMarkdown);
                    (data as Record<string, unknown>).meta = {
                      ...meta,
                      title: seoTitle,
                      description: seoDesc,
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
