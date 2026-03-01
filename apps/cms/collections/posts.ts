import {
  lexicalEditor,
  HeadingFeature,
  BlocksFeature,
  UploadFeature,
  AlignFeature,
  ChecklistFeature,
  IndentFeature,
} from "@payloadcms/richtext-lexical";
import type { CollectionConfig } from "payload";
import type { Payload } from "payload";
import { isLoggedIn, slugs } from "./constants";
import {
  codeBlock,
  calloutBlock,
  videoEmbedBlock,
  imageGalleryBlock,
  sandpackBlock,
  aiPlaygroundBlock,
  dividerBlock,
  extractPlainText,
} from "./blocks";

export const postsCollection: CollectionConfig = {
  slug: slugs.posts,
  admin: { useAsTitle: "title" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
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
      ({ data }: { data: Record<string, unknown> }) => {
        if (data.content) {
          try {
            const text = extractPlainText(data.content);
            const wordCount = text.split(/\s+/).filter(Boolean).length;
            data.wordCount = wordCount;
            data.readingTime = Math.max(1, Math.ceil(wordCount / 200));
            const headings: { id: string; text: string; level: number }[] = [];
            const root = (data.content as { root?: { children?: unknown[] } })
              ?.root;
            const children = Array.isArray(root?.children) ? root.children : [];
            for (const node of children) {
              const n = node as {
                type?: string;
                tag?: string;
                children?: { text?: string }[];
              };
              if (
                n.type === "heading" &&
                n.tag &&
                ["h2", "h3", "h4"].includes(n.tag)
              ) {
                const childNodes = Array.isArray(n.children) ? n.children : [];
                const text = childNodes
                  .map((c) => (c as { text?: string }).text ?? "")
                  .join("");
                const id = text
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                const level = parseInt(n.tag.replace("h", ""), 10);
                if (id) headings.push({ id, text, level });
              }
            }
            data.tocItems = headings;
          } catch (err) {
            if (process.env.NODE_ENV === "development") {
              console.error("[posts beforeChange] toc/wordCount failed:", err);
            }
            data.tocItems = [];
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({
        doc,
        req,
      }: {
        doc: Record<string, unknown>;
        req: { payload: Payload };
      }) => {
        if (doc.status !== "published") return doc;
        if (doc.audio_summary) return doc;
        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        if (!openaiKey) return doc;
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
                Authorization: `Bearer ${openaiKey}`,
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
          const fileName = `${(doc.slug as string) || doc.id}-audio.mp3`;

          const savedMedia = await req.payload.create({
            collection: slugs.media,
            data: { alt: `Audio summary: ${doc.title}` },
            file: {
              data: buffer,
              name: fileName,
              size: buffer.byteLength,
              mimetype: "audio/mpeg",
            } as never,
          });

          await req.payload.update({
            collection: slugs.posts,
            id: doc.id as string | number,
            data: {
              audio_summary: savedMedia.id,
              audio_generated_at: new Date().toISOString(),
            },
          });
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("[TTS hook] Failed to generate audio:", err);
          }
        }
        return doc;
      },
    ],
  },
};
