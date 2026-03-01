import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const usersCollection: CollectionConfig = {
  slug: slugs.users,
  auth: true,
  admin: { useAsTitle: "email" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
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
};
