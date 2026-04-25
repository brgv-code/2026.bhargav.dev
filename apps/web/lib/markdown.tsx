import React from "react";
import Image from "next/image";
import * as production from "react/jsx-runtime";
import * as development from "react/jsx-dev-runtime";
import { unified } from "unified";
import { clsx } from "clsx";
import { resolveMediaSrc } from "@/lib/payload";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";
import { CodeBlock } from "@/components/blog/code-block";
import { ChecklistItem } from "@/components/blog/checklist-item";

type ImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
};

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

type TextProps = React.HTMLAttributes<HTMLParagraphElement>;

type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement>;

type ListItemProps = React.HTMLAttributes<HTMLLIElement>;

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

type CodeProps = React.HTMLAttributes<HTMLElement>;

function MarkdownImage({ src, alt }: ImgProps) {
  if (!src) return null;
  return (
    <span className="my-8 block">
      <Image
        src={resolveMediaSrc(src)}
        alt={alt ?? ""}
        width={1600}
        height={900}
        sizes="100vw"
        className="h-auto w-full"
      />
    </span>
  );
}

function MarkdownH2({ className, ...props }: HeadingProps) {
  return (
    <h2
      {...props}
      className={clsx(
        "mt-16 pt-6 mb-4 font-serif text-3xl font-bold tracking-tight text-primary",
        className
      )}
    />
  );
}

function MarkdownH3({ className, ...props }: HeadingProps) {
  return (
    <h3
      {...props}
      className={clsx(
        "mt-10 mb-3 font-serif text-2xl font-bold text-primary",
        className
      )}
    />
  );
}

function MarkdownH4({ className, ...props }: HeadingProps) {
  return (
    <h4
      {...props}
      className={clsx(
        "mt-6 mb-2 font-serif text-xl font-semibold text-primary",
        className
      )}
    />
  );
}

function MarkdownH5({ className, ...props }: HeadingProps) {
  return (
    <h5
      {...props}
      className={clsx(
        "mt-5 mb-2 font-sans text-base font-semibold text-primary uppercase tracking-wider",
        className
      )}
    />
  );
}

function MarkdownParagraph({ className, ...props }: TextProps) {
  return (
    <p
      {...props}
      className={clsx("text-base leading-relaxed text-secondary", className)}
    />
  );
}

function MarkdownList({ className, ...props }: ListProps) {
  return (
    <ul
      {...props}
      className={clsx("list-disc pl-5 text-base text-secondary", className)}
    />
  );
}

function MarkdownChecklistList({ className, ...props }: ListProps) {
  return (
    <ul
      {...props}
      className={clsx("list-none pl-0 text-base text-secondary checklist-list", className)}
    />
  );
}

function MarkdownOrderedList({ className, ...props }: ListProps) {
  return (
    <ol
      {...props}
      className={clsx("list-decimal pl-5 text-base text-secondary", className)}
    />
  );
}

function MarkdownListItem({ className, ...props }: ListItemProps) {
  return (
    <li
      {...props}
      className={clsx("mb-2", className)}
    />
  );
}

function MarkdownLink({ className, ...props }: LinkProps) {
  return (
    <a
      {...props}
      className={clsx("underline underline-offset-4", className)}
    />
  );
}

function MarkdownCode({ className, ...props }: CodeProps) {
  return (
    <code
      {...props}
      className={clsx("font-mono text-[0.875em]", className)}
    />
  );
}

const isDevelopment = process.env.NODE_ENV !== "production";

const rehypeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark-dimmed",
  },
  keepBackground: false,
} as const;

function buildProcessor(interactive: boolean) {
  const listComponent = interactive ? MarkdownChecklistList : MarkdownList;
  const listItemComponent = interactive
    ? (ChecklistItem as React.ComponentType<ListItemProps>)
    : MarkdownListItem;

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypePrettyCode, rehypeOptions)
    .use(rehypeReact, {
      Fragment: production.Fragment,
      jsx: production.jsx,
      jsxs: production.jsxs,
      jsxDEV: development.jsxDEV,
      development: isDevelopment,
      components: {
        img: MarkdownImage,
        h2: MarkdownH2,
        h3: MarkdownH3,
        h4: MarkdownH4,
        h5: MarkdownH5,
        p: MarkdownParagraph,
        ul: listComponent,
        ol: MarkdownOrderedList,
        li: listItemComponent,
        a: MarkdownLink,
        pre: CodeBlock as React.ComponentType<React.HTMLAttributes<HTMLPreElement>>,
        code: MarkdownCode,
      },
    } as unknown as Parameters<typeof rehypeReact>[0]);
}

const processor = buildProcessor(false);
const checklistProcessor = buildProcessor(true);

export async function renderMarkdown(
  markdown: string,
  options?: { slug?: string }
): Promise<React.ReactNode> {
  const isChecklist = options?.slug?.includes("checklist") ?? false;
  const proc = isChecklist ? checklistProcessor : processor;
  const file = await proc.process(markdown);
  return file.result as React.ReactNode;
}
