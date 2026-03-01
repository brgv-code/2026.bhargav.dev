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
};
