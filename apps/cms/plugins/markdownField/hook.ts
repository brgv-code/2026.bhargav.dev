import type { CollectionBeforeChangeHook } from "payload";
import { markdownToPayload } from "./converter";

/**
 * Factory – returns a `beforeChange` hook wired to the three field names
 * used in `markdownFields()`.
 *
 * Add this to every collection that uses `markdownFields()`:
 *
 *   hooks: {
 *     beforeChange: [markdownBeforeChangeHook()],
 *   }
 */
export function markdownBeforeChangeHook(options?: {
  inputFieldName?: string;
  contentFieldName?: string;
  htmlFieldName?: string;
}): CollectionBeforeChangeHook {
  const {
    inputFieldName = "markdownInput",
    contentFieldName = "content",
    htmlFieldName = "contentHtml",
  } = options ?? {};

  return async ({ data, req }) => {
    const rawMarkdown: string | undefined = data[inputFieldName];

    if (!rawMarkdown?.trim()) return data;

    req.payload.logger.info(
      `[markdownField] Converting markdown for field "${contentFieldName}"`
    );

    try {
      const { lexicalJSON, html } = await markdownToPayload(rawMarkdown);

      return {
        ...data,
        [contentFieldName]: lexicalJSON,
        [htmlFieldName]: html,
      };
    } catch (err) {
      req.payload.logger.error({ err }, "[markdownField] Conversion failed");
      return data;
    }
  };
}
