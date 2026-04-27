import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const workExperienceCollection: CollectionConfig = {
  slug: slugs.workExperience,
  admin: { useAsTitle: "company" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "company", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "date_range", type: "text" },
    { name: "location", type: "text" },
    { name: "summary", type: "textarea" },
    { name: "logo", type: "upload", relationTo: slugs.media },
    {
      name: "tech",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "bullets",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
      ],
    },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
