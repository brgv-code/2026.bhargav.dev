import type { Field } from "payload";

export function markdownFields(options?: {
  inputFieldName?: string;
  contentFieldName?: string;
  htmlFieldName?: string;
}): Field[] {
  const {
    inputFieldName = "markdownInput",
    contentFieldName = "content",
    htmlFieldName = "contentHtml",
  } = options ?? {};

  return [
    {
      name: inputFieldName,
      type: "textarea",
      label: "Paste Markdown",
      admin: {
        description:
          "Paste raw Markdown here. On save it will be automatically converted to rich text and HTML.",
        style: { fontFamily: "monospace", minHeight: "200px" },
      },
    },

    {
      name: contentFieldName,
      type: "richText",
      label: "Content (Rich Text)",
      admin: {
        description:
          "Auto-populated from the Markdown input above, or edit directly.",
      },
    },

    {
      name: htmlFieldName,
      type: "textarea",
      label: "Content HTML (auto-generated)",
      admin: {
        readOnly: true,
        description:
          "Server-rendered HTML. Use this in your frontend templates.",
        style: { fontFamily: "monospace", minHeight: "200px" },
      },
    },
  ];
}
