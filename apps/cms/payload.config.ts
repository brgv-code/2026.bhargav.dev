import path from "node:path";
import { fileURLToPath } from "node:url";

import { Block, buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { seoPlugin } from "@payloadcms/plugin-seo";
import {
  lexicalEditor,
  HeadingFeature,
  BlocksFeature,
  UploadFeature,
  AlignFeature,
  ChecklistFeature,
  IndentFeature,
} from "@payloadcms/richtext-lexical";
import { z } from "zod";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envSchema = z.object({
  PAYLOAD_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string().min(1).optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().optional(),
  CMS_DB_PATH: z.string().optional(),
});

const env = envSchema.parse({
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() || undefined,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  CMS_DB_PATH: process.env.CMS_DB_PATH,
});

const dbPath = env.CMS_DB_PATH ?? path.join(__dirname, "cms.db");

const slugs = {
  users: "users",
  posts: "posts",
  tags: "tags",
  series: "series",
  media: "media",
  workExperience: "work-experience",
  favorites: "favorites",
  streaks: "streaks",
} as const;

function extractPlainText(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const root = (content as any).root;
  if (!root) return "";

  function walk(node: any): string {
    if (!node) return "";

    if (node.type === "text") return node.text ?? "";
    if (node.type === "linebreak") return " ";
    if (node.blockType === "code") return "";
    if (node.type === "code") {
      return Array.isArray(node.children)
        ? node.children.map(walk).join("")
        : "";
    }

    const childText = Array.isArray(node.children)
      ? node.children.map(walk).join("")
      : "";
    const blockTypes = ["paragraph", "heading", "listitem", "quote", "root"];
    if (blockTypes.includes(node.type)) return childText + " ";

    return childText;
  }

  return walk(root).replace(/\s+/g, " ").trim();
}

const codeBlock: Block = {
  slug: "code",
  labels: { singular: "Code block", plural: "Code blocks" },
  fields: [
    {
      name: "language",
      type: "select",
      defaultValue: "typescript",
      options: [
        { label: "TypeScript", value: "typescript" },
        { label: "JavaScript", value: "javascript" },
        { label: "TSX", value: "tsx" },
        { label: "JSX", value: "jsx" },
        { label: "Python", value: "python" },
        { label: "Rust", value: "rust" },
        { label: "Go", value: "go" },
        { label: "Bash / Shell", value: "bash" },
        { label: "SQL", value: "sql" },
        { label: "JSON", value: "json" },
        { label: "YAML", value: "yaml" },
        { label: "CSS", value: "css" },
        { label: "HTML", value: "html" },
        { label: "Markdown", value: "markdown" },
        { label: "Plaintext", value: "plaintext" },
      ],
    },
    {
      name: "code",
      type: "code", // Payload's built-in code field — Monaco editor in admin
      required: true,
      admin: {
        language: "typescript", // default Monaco language; changes with field above in custom component
      },
    },
    {
      name: "filename",
      type: "text",
      admin: {
        description: "Optional. Shown as a label above the code block.",
        placeholder: "e.g. apps/web/lib/utils.ts",
      },
    },
    {
      name: "highlight_lines",
      type: "text",
      admin: {
        description:
          "Optional. Comma-separated line numbers or ranges to highlight. e.g. 1,3,5-8",
        placeholder: "1,3,5-8",
      },
    },
  ],
};

const calloutBlock: Block = {
  slug: "callout",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "type",
      type: "select",
      defaultValue: "info",
      required: true,
      options: [
        { label: "💡 Tip", value: "tip" },
        { label: "ℹ️ Info", value: "info" },
        { label: "⚠️ Warning", value: "warning" },
        { label: "🚨 Danger", value: "danger" },
      ],
    },
    {
      name: "title",
      type: "text",
      admin: {
        description: "Optional. Bold heading shown above the callout body.",
      },
    },
    {
      name: "content",
      type: "textarea",
      required: true,
    },
  ],
};

const videoEmbedBlock: Block = {
  slug: "videoEmbed",
  labels: { singular: "Video embed", plural: "Video embeds" },
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description: "YouTube, Vimeo, or direct .mp4 URL.",
        placeholder: "https://youtube.com/watch?v=...",
      },
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: false,
      label: "Autoplay (direct video files only)",
    },
  ],
};

const imageGalleryBlock: Block = {
  slug: "imageGallery",
  labels: { singular: "Image gallery", plural: "Image galleries" },
  fields: [
    {
      name: "images",
      type: "array",
      minRows: 2,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: slugs.media,
          required: true,
        },
        {
          name: "caption",
          type: "text",
        },
      ],
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "grid",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
        { label: "Masonry", value: "masonry" },
      ],
    },
  ],
};

const sandpackBlock: Block = {
  slug: "sandpack",
  labels: { singular: "Sandpack playground", plural: "Sandpack playgrounds" },
  fields: [
    {
      name: "code",
      type: "code",
      required: true,
    },
    {
      name: "template",
      type: "select",
      defaultValue: "react",
      options: [
        { label: "React", value: "react" },
        { label: "React + TypeScript", value: "react-ts" },
        { label: "Node", value: "node" },
        { label: "Vanilla JS", value: "vanilla" },
      ],
    },
    {
      name: "dependencies",
      type: "array",
      admin: {
        description: "npm packages to inject into the Sandpack environment.",
      },
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "version",
          type: "text",
          admin: { placeholder: "latest" },
        },
      ],
    },
    {
      name: "show_preview",
      type: "checkbox",
      defaultValue: true,
      label: "Show live preview panel",
    },
  ],
};

const aiPlaygroundBlock: Block = {
  slug: "aiPlayground",
  labels: { singular: "AI playground", plural: "AI playgrounds" },
  fields: [
    {
      name: "system_prompt",
      type: "textarea",
      admin: {
        description: "Sets the AI's role and behaviour for this playground.",
        placeholder: "You are a helpful assistant that...",
      },
    },
    {
      name: "initial_user_prompt",
      type: "textarea",
      admin: {
        description:
          "Pre-fills the first user message. Leave blank for an empty input.",
      },
    },
    {
      name: "model",
      type: "select",
      defaultValue: "claude-sonnet-4-20250514",
      options: [
        { label: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
        { label: "Claude Opus 4", value: "claude-opus-4-20250514" },
        { label: "GPT-4o", value: "gpt-4o" },
      ],
    },
  ],
};

const dividerBlock: Block = {
  slug: "divider",
  labels: { singular: "Divider", plural: "Dividers" },
  fields: [
    {
      name: "label",
      type: "text",
      admin: {
        description: "Optional text label shown in the centre of the divider.",
        placeholder: "e.g. · · ·",
      },
    },
  ],
};

const config = buildConfig({
  serverURL: env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: env.PAYLOAD_SECRET,

  admin: {
    user: slugs.users,
    meta: { titleSuffix: "— Blog CMS" },
    livePreview: {},
  },

  db: sqliteAdapter({
    client: { url: `file:${dbPath}` },
  }),

  plugins: [
    seoPlugin({
      collections: [slugs.posts],
      uploadsCollection: slugs.media,
      generateTitle: ({ doc }: any) => `${doc?.title?.value ?? ""}`,
      generateDescription: ({ doc }: any) => doc?.description?.value ?? "",
    }),
  ],

  collections: [
    {
      slug: slugs.users,
      auth: true,
      admin: { useAsTitle: "email" },
      access: { read: () => true },
      fields: [
        {
          name: "name",
          type: "text",
        },
        {
          name: "role",
          type: "select",
          defaultValue: "author",
          options: [
            { label: "Admin", value: "admin" },
            { label: "Author", value: "author" },
          ],
        },
      ],
    },

    {
      slug: slugs.tags,
      admin: { useAsTitle: "name" },
      access: { read: () => true },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        {
          name: "description",
          type: "text",
          admin: { description: "Optional. Shown on the tag index page." },
        },
      ],
    },

    {
      slug: slugs.series,
      admin: { useAsTitle: "name" },
      access: { read: () => true },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        {
          name: "description",
          type: "textarea",
          admin: {
            description: "Shown at the top of each post in the series.",
          },
        },
      ],
    },

    {
      slug: slugs.posts,
      admin: { useAsTitle: "title" },
      access: { read: () => true },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: {
            description: "URL-safe identifier. Used in the post URL.",
          },
        },
        {
          name: "description",
          type: "textarea",
          admin: {
            description:
              "1–2 sentence summary. Used for SEO meta, card previews, and the TTS audio intro.",
          },
        },
        {
          name: "coverImage",
          type: "upload",
          relationTo: slugs.media,
        },
        {
          name: "status",
          type: "select",
          defaultValue: "draft",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ],
        },
        {
          name: "publishedAt",
          type: "date",
        },

        {
          name: "readingTime",
          type: "number",
          admin: {
            readOnly: true,
            description:
              "Auto-computed on save. Estimated reading time in minutes.",
            position: "sidebar",
          },
        },
        {
          name: "wordCount",
          type: "number",
          admin: {
            readOnly: true,
            description: "Auto-computed on save. Word count of post content.",
            position: "sidebar",
          },
        },
        {
          name: "tocItems",
          type: "json",
          admin: {
            readOnly: true,
            description:
              "Auto-extracted heading structure for Table of Contents. Array of { id, text, level }.",
          },
        },

        {
          name: "tags",
          type: "relationship",
          relationTo: slugs.tags,
          hasMany: true,
          admin: { position: "sidebar" },
        },
        {
          name: "series",
          type: "relationship",
          relationTo: slugs.series,
          hasMany: false,
          admin: { position: "sidebar" },
        },

        {
          name: "content",
          type: "richText",
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
              AlignFeature(),
              IndentFeature(),
              ChecklistFeature(),
              UploadFeature({
                collections: {
                  [slugs.media]: {
                    fields: [
                      { name: "alt", type: "text" },
                      { name: "caption", type: "text" },
                    ],
                  },
                },
              }),
              BlocksFeature({
                blocks: [
                  codeBlock,
                  calloutBlock,
                  videoEmbedBlock,
                  imageGalleryBlock,
                  sandpackBlock,
                  aiPlaygroundBlock,
                  dividerBlock,
                ],
              }),
            ],
          }),
        },

        {
          name: "audio_summary",
          type: "upload",
          relationTo: slugs.media,
          admin: { position: "sidebar" },
        },
        {
          name: "audio_generated_at",
          type: "date",
          admin: {
            readOnly: true,
            position: "sidebar",
            description: "Timestamp of the last TTS generation.",
          },
        },
      ],

      hooks: {
        beforeChange: [
          ({ data }: any) => {
            if (data.content) {
              const text = extractPlainText(data.content);
              const wordCount = text.split(/\s+/).filter(Boolean).length;
              data.wordCount = wordCount;
              data.readingTime = Math.max(1, Math.ceil(wordCount / 200));
              const headings: { id: string; text: string; level: number }[] =
                [];
              const root = (data.content as any)?.root;
              if (root?.children) {
                for (const node of root.children) {
                  if (
                    node.type === "heading" &&
                    ["h2", "h3", "h4"].includes(node.tag)
                  ) {
                    const text = (node.children ?? [])
                      .map((c: any) => c.text ?? "")
                      .join("");
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                    const level = parseInt(node.tag.replace("h", ""), 10);
                    if (id) headings.push({ id, text, level });
                  }
                }
              }
              data.tocItems = headings;
            }
            return data;
          },
        ],

        afterChange: [
          async ({ doc, req }: any) => {
            if (doc.status !== "published") return doc;
            if (doc.audio_summary) return doc;
            if (!env.OPENAI_API_KEY) return doc;
            const bodyText = extractPlainText(doc.content);
            const fullText = [doc.title, doc.description, bodyText]
              .filter(Boolean)
              .join(". ");

            try {
              const response = await fetch(
                "https://api.openai.com/v1/audio/speech",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "tts-1-hd",
                    voice: "alloy",
                    input: fullText.slice(0, 4096),
                  }),
                }
              );

              if (!response.ok) return doc;

              const buffer = Buffer.from(await response.arrayBuffer());
              const fileName = `${doc.slug || doc.id}-audio.mp3`;

              const savedMedia = await req.payload.create({
                collection: slugs.media,
                data: { alt: `Audio summary: ${doc.title}` },
                file: {
                  data: buffer,
                  name: fileName,
                  size: buffer.byteLength,
                  mimetype: "audio/mpeg",
                } as any,
              });

              return await req.payload.update({
                collection: slugs.posts,
                id: doc.id,
                data: {
                  audio_summary: savedMedia.id,
                  audio_generated_at: new Date().toISOString(),
                },
              });
            } catch (err) {
              if (process.env.NODE_ENV === "development") {
                console.error("[TTS hook] Failed to generate audio:", err);
              }
              return doc;
            }
          },
        ],
      },
    },

    {
      slug: slugs.media,
      upload: {
        staticDir: path.resolve(__dirname, "./media"),
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/svg+xml",
          "video/mp4",
          "video/webm",
          "audio/mpeg",
          "audio/mp4",
        ],
      },
      access: { read: () => true },
      fields: [
        {
          name: "alt",
          type: "text",
          admin: {
            description: "Screen reader description. Required for images.",
          },
        },
        {
          name: "caption",
          type: "text",
        },
        {
          name: "credit",
          type: "text",
          admin: { description: "Photographer or source credit." },
        },
      ],
    },

    {
      slug: slugs.workExperience,
      admin: { useAsTitle: "company" },
      access: { read: () => true },
      fields: [
        { name: "company", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "date_range", type: "text" },
        { name: "logo", type: "upload", relationTo: slugs.media },
        { name: "tech_stack", type: "text" },
        {
          name: "bullets",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text" },
          ],
        },
      ],
    },

    {
      slug: slugs.favorites,
      admin: { useAsTitle: "title" },
      access: { read: () => true },
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Article", value: "article" },
            { label: "Video", value: "video" },
            { label: "Podcast", value: "podcast" },
            { label: "Book", value: "book" },
            { label: "Tool", value: "tool" },
          ],
        },
        { name: "title", type: "text", required: true },
        { name: "url", type: "text" },
        { name: "source", type: "text" },
        { name: "notes", type: "textarea" },
      ],
    },

    {
      slug: slugs.streaks,
      admin: { useAsTitle: "label" },
      access: { read: () => true },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "date", type: "date", required: true },
        { name: "completed", type: "checkbox", defaultValue: false },
      ],
    },
  ],

  globals: [
    {
      slug: "profile",
      access: { read: () => true },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "tagline", type: "text" },
        { name: "bio", type: "textarea" },
        { name: "available_for_work", type: "checkbox", defaultValue: true },
        { name: "github", type: "text" },
        { name: "x", type: "text" },
        { name: "linkedin", type: "text" },
        { name: "email", type: "text" },
      ],
    },
  ],
});

export default config;
export const configPromise = Promise.resolve(config);
