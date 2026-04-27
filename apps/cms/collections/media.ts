import path from "node:path";
import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export function getMediaCollection(cmsDir: string): CollectionConfig {
  return {
    slug: slugs.media,
    upload: {
      staticDir: path.resolve(cmsDir, "./media"),
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
        "application/pdf",
      ],
    },
    access: {
      read: () => true,
      create: isLoggedIn,
      update: isLoggedIn,
      delete: isLoggedIn,
    },
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
  };
}
