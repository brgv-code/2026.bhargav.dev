import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildConfig } from "payload/config";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string().min(1),
});

const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});

const postsSlug = "posts";
const workExperienceSlug = "work-experience";
const mediaSlug = "media";
const favoritesSlug = "favorites";
const streaksSlug = "streaks";

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: env.PAYLOAD_SECRET,
  admin: {
    user: undefined,
  },
  db: postgresAdapter({
    url: env.DATABASE_URL,
  }),
  collections: [
    {
      slug: postsSlug,
      admin: {
        useAsTitle: "title",
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
        },
        {
          name: "status",
          type: "select",
          defaultValue: "draft",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
        },
        {
          name: "publishedAt",
          type: "date",
        },
        {
          name: "content",
          type: "blocks",
          blocks: [
            {
              slug: "hero",
              labels: {
                singular: "Hero block",
                plural: "Hero blocks",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  required: true,
                },
                {
                  name: "subtitle",
                  type: "text",
                },
                {
                  name: "handwritten",
                  type: "checkbox",
                  label: "Handwritten effect",
                  defaultValue: false,
                },
              ],
            },
            {
              slug: "sandpack",
              labels: {
                singular: "Sandpack block",
                plural: "Sandpack blocks",
              },
              fields: [
                {
                  name: "code",
                  type: "textarea",
                  required: true,
                },
                {
                  name: "template",
                  type: "select",
                  options: [
                    { label: "React", value: "react" },
                    { label: "Node", value: "node" },
                  ],
                  defaultValue: "react",
                },
                {
                  name: "dependencies",
                  type: "array",
                  fields: [
                    {
                      name: "name",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "version",
                      type: "text",
                    },
                  ],
                },
              ],
            },
            {
              slug: "aiPlayground",
              labels: {
                singular: "AI playground block",
                plural: "AI playground blocks",
              },
              fields: [
                {
                  name: "system_prompt",
                  type: "textarea",
                },
                {
                  name: "initial_user_prompt",
                  type: "textarea",
                },
              ],
            },
          ],
        },
        {
          name: "audio_summary",
          type: "upload",
          relationTo: mediaSlug,
        },
      ],
      hooks: {
        afterChange: [
          async ({ doc, req, previousDoc }) => {
            if (doc.status !== "published") return doc;
            if (doc.audio_summary) return doc;

            const text =
              typeof doc.content === "string"
                ? doc.content
                : doc.title ?? "Blog post";

            try {
              const response = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${env.OPENAI_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "tts-1-hd",
                  voice: "alloy",
                  input: text,
                }),
              });

              if (!response.ok) {
                return doc;
              }

              const buffer = Buffer.from(await response.arrayBuffer());

              const fileName = `${doc.slug || doc.id}.mp3`;
              const savedMedia = await req.payload.create({
                collection: mediaSlug,
                data: {},
                file: {
                  data: buffer,
                  name: fileName,
                  size: buffer.byteLength,
                  mimetype: "audio/mpeg",
                } as any,
              });

              const updated = await req.payload.update({
                collection: postsSlug,
                id: doc.id,
                data: {
                  audio_summary: savedMedia.id,
                },
              });

              return updated;
            } catch {
              return doc;
            }
          },
        ],
      },
    },
    {
      slug: workExperienceSlug,
      admin: {
        useAsTitle: "company",
      },
      fields: [
        {
          name: "company",
          type: "text",
          required: true,
        },
        {
          name: "role",
          type: "text",
          required: true,
        },
        {
          name: "date_range",
          type: "text",
        },
        {
          name: "logo",
          type: "upload",
          relationTo: mediaSlug,
        },
        {
          name: "tech_stack",
          type: "text",
        },
        {
          name: "bullets",
          type: "array",
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
            },
            {
              name: "href",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      slug: mediaSlug,
      upload: {
        staticDir: path.resolve(__dirname, "./media"),
      },
      fields: [],
    },
    {
      slug: favoritesSlug,
      admin: {
        useAsTitle: "title",
      },
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Article", value: "article" },
            { label: "Video", value: "video" },
            { label: "Podcast", value: "podcast" },
          ],
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "url",
          type: "text",
        },
        {
          name: "source",
          type: "text",
        },
        {
          name: "notes",
          type: "textarea",
        },
      ],
    },
    {
      slug: streaksSlug,
      admin: {
        useAsTitle: "label",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "date",
          type: "date",
          required: true,
        },
        {
          name: "completed",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
  ],
  globals: [
    {
      slug: "profile",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "tagline",
          type: "text",
        },
        {
          name: "bio",
          type: "textarea",
        },
        {
          name: "available_for_work",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "github",
          type: "text",
        },
        {
          name: "x",
          type: "text",
        },
        {
          name: "linkedin",
          type: "text",
        },
        {
          name: "email",
          type: "text",
        },
      ],
    },
  ],
});

