import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

export const projectsCollection: CollectionConfig = {
  slug: slugs.projects,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "status", "year", "updatedAt"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "title", type: "text" },
    { name: "description", type: "textarea", required: true },
    { name: "url", type: "text", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "wip",
      options: [
        { label: "Active", value: "active" },
        { label: "In Progress", value: "wip" },
        { label: "Archived", value: "archived" },
      ],
    },
    { name: "year", type: "text" },
    {
      name: "tech",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    { name: "github", type: "text" },
  ],
};
