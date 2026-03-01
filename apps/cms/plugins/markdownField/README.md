# Payload CMS – Markdown Plugin

A zero-boilerplate plugin that adds **Markdown → Lexical richText → HTML** conversion 
to any Payload collection, server-side. No frontend work needed.

---

## What it does

| Feature | How |
|---|---|
| Upload a `.md` file | `afterChange` hook reads the file, parses it, saves Lexical + HTML |
| Paste Markdown in admin | `beforeChange` hook converts the textarea on every save |
| HTML available in DB | Stored in `contentHtml` (plain text field), ready for your frontend |

---

## Install dependencies

```bash
npm install marked @lexical/headless @payloadcms/richtext-lexical
```

---

## Setup

1. Copy the `src/plugins/markdownField/` folder into your project.

2. Register the plugin in `payload.config.ts`:

```ts
import { markdownPlugin } from '@/plugins/markdownField'

export default buildConfig({
  plugins: [
    markdownPlugin({
      uploadCollectionSlug: 'documents',               // upload .md files here
      collectionsWithPasteField: ['posts', 'pages'],   // gets paste field here
    }),
  ],
  // ...rest of config
})
```

3. That's it. The plugin injects fields + hooks automatically.

---

## Fields added per collection

```
markdownInput   textarea     User pastes raw Markdown here
content         richText     Lexical JSON (auto-converted)
contentHtml     textarea     Rendered HTML string (auto-converted, read-only)
```

---

## Using `contentHtml` in your frontend

```ts
const post = await payload.find({ collection: 'posts', where: { slug: { equals: 'my-post' } } })
const html = post.docs[0].contentHtml
// → Pass directly to dangerouslySetInnerHTML or a template engine
```

---

## Using the fields manually (without the plugin)

If you want more control, use the lower-level exports directly:

```ts
import { markdownFields, markdownBeforeChangeHook } from '@/plugins/markdownField'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    { name: 'title', type: 'text' },
    ...markdownFields(),               // spreads the 3 fields
  ],
  hooks: {
    beforeChange: [markdownBeforeChangeHook()],
  },
}
```

---

## Customising field names

```ts
markdownPlugin({
  fieldNames: {
    input: 'rawMarkdown',
    content: 'body',
    html: 'bodyHtml',
  },
})
```

---

## How the conversion works

```
User input (Markdown string)
        │
        ▼
  marked()  →  HTML string          (gfm + breaks enabled)
        │
        ▼
  convertHTMLToLexical()  →  Lexical JSON    (@payloadcms/richtext-lexical)
        │
        ├──► stored in `content`    (richText field)
        └──► stored in `contentHtml` (textarea field, the HTML string)
```