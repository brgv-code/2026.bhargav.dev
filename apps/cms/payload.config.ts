import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { z } from "zod";
import { getCollections, isLoggedIn, slugs } from "./collections";
import { markdownPlugin } from "./plugins/markdownField";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envSchema = z.object({
  PAYLOAD_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string().min(1).optional(),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().optional(),
  CMS_DB_PATH: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

const env = envSchema.parse({
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() || undefined,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  CMS_DB_PATH: process.env.CMS_DB_PATH,
  DATABASE_URL: process.env.DATABASE_URL,
});

/** Use Postgres when DATABASE_URL is set and looks like postgres; otherwise SQLite (single file). */
const usePostgres =
  typeof process.env.DATABASE_URL === "string" &&
  process.env.DATABASE_URL.trim().length > 0 &&
  /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL.trim());

const sqliteDbPath =
  env.CMS_DB_PATH?.trim() || path.resolve(__dirname, "data", "cms.sqlite");

if (!usePostgres) {
  fs.mkdirSync(path.dirname(sqliteDbPath), { recursive: true });
}

const config = buildConfig({
  serverURL: env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: env.PAYLOAD_SECRET,

  admin: {
    user: slugs.users,
    meta: { titleSuffix: "— Blog CMS" },
    livePreview: {},
  },

  db: usePostgres
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL,
        },
        push: false,
      })
    : sqliteAdapter({
        client: {
          url: `file:${sqliteDbPath}`,
        },
        push: false,
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
