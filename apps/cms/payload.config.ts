import { buildConfig } from "payload";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { z } from "zod";
import { getCollections, isLoggedIn, slugs } from "./collections";
import { markdownPlugin } from "./plugins/markdownField";

const envSchema = z.object({
  PAYLOAD_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string().min(1).optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().optional(),
  DATABASE_URL: z.string().min(1),
});

const env = envSchema.parse({
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() || undefined,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  DATABASE_URL: process.env.DATABASE_URL,
});

const config = buildConfig({
  serverURL: env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: env.PAYLOAD_SECRET,

  admin: {
    user: slugs.users,
    meta: { titleSuffix: "— Blog CMS" },
    livePreview: {},
  },

  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),

  plugins: [
    markdownPlugin({
      uploadCollectionSlug: slugs.documents,
      pasteAndDocumentInAllCollections: true,
      fieldNames: {
        content: "parsedContent",
        html: "contentHtml",
        documentContent: "parsedContent",
        documentHtml: "contentHtml",
      },
    }),
    seoPlugin({
      collections: [slugs.posts],
      uploadsCollection: slugs.media,
      generateTitle: ({ doc }: { doc?: { title?: { value?: string } } }) =>
        `${doc?.title?.value ?? ""}`,
      generateDescription: ({
        doc,
      }: {
        doc?: { description?: { value?: string } };
      }) => doc?.description?.value ?? "",
    }),
  ],

  collections: getCollections(),

  globals: [
    {
      slug: "profile",
      access: {
        read: () => true,
        update: isLoggedIn,
      },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "tagline", type: "text" },
        { name: "bio", type: "textarea" },
        { name: "resume_summary", type: "textarea" },
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
