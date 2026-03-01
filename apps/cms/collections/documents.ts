import path from "node:path";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

/** Minimal Lexical state so the editor never receives an empty root (avoids "editor state is empty" error). */
const LEXICAL_EMPTY_DEFAULT = {
  root: {
    type: "root",
    version: 1,
    children: [
      {
        type: "paragraph",
        version: 1,
        children: [],
        direction: null,
        format: "",
        indent: 0,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
  },
};

export function getDocumentsCollection(cmsDir: string): CollectionConfig {
  return {
    slug: slugs.documents,
    upload: {
      staticDir: path.resolve(cmsDir, "media"),
      mimeTypes: ["text/markdown", "text/plain"],
    },
    fields: [
      {
        name: "parsedContent",
        type: "richText",
        editor: lexicalEditor(),
        defaultValue: LEXICAL_EMPTY_DEFAULT,
      },
    ],
  };
}
