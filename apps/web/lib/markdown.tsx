import React from "react";
import Image from "next/image";
import * as production from "react/jsx-runtime";
import * as development from "react/jsx-dev-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";

type ImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
};

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

type TextProps = React.HTMLAttributes<HTMLParagraphElement>;

type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement>;

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

type PreProps = React.HTMLAttributes<HTMLPreElement>;

type CodeProps = React.HTMLAttributes<HTMLElement>;

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function MarkdownImage({ src, alt }: ImgProps) {
  if (!src) return null;
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "";
  const resolvedSrc =
    src.startsWith("http") || !baseUrl ? src : `${baseUrl}${src}`;

  return (
    <span className="my-8 block">
      <Image
        src={resolvedSrc}
        alt={alt ?? ""}
        width={1600}
        height={900}
        sizes="100vw"
        className="h-auto w-full"
      />
    </span>
  );
}

function MarkdownHeading({ className, ...props }: HeadingProps) {
  return (
    <h2
      {...props}
      className={classNames(
        "mt-10 text-2xl font-semibold text-primary",
        className
      )}
    />
  );
}

function MarkdownSubheading({ className, ...props }: HeadingProps) {
  return (
    <h3
      {...props}
      className={classNames(
        "mt-8 text-xl font-semibold text-primary",
        className
      )}
    />
  );
}

function MarkdownParagraph({ className, ...props }: TextProps) {
  return (
    <p
      {...props}
      className={classNames("text-base leading-relaxed text-secondary", className)}
    />
  );
}

function MarkdownList({ className, ...props }: ListProps) {
  return (
    <ul
      {...props}
      className={classNames("list-disc pl-5 text-base text-secondary", className)}
    />
  );
}

function MarkdownOrderedList({ className, ...props }: ListProps) {
  return (
    <ol
      {...props}
      className={classNames("list-decimal pl-5 text-base text-secondary", className)}
    />
  );
}

function MarkdownLink({ className, ...props }: LinkProps) {
  return (
    <a
      {...props}
      className={classNames("underline underline-offset-4", className)}
    />
  );
}

function MarkdownPre({ className, ...props }: PreProps) {
  return (
    <pre
      {...props}
      className={classNames(
        "my-6 overflow-x-auto rounded-none bg-highlight p-4 text-sm",
        className
      )}
    />
  );
}

function MarkdownCode({ className, ...props }: CodeProps) {
  return (
    <code
      {...props}
      className={classNames("font-mono", className)}
    />
  );
}

const isDevelopment = process.env.NODE_ENV !== "production";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypePrettyCode, {
    theme: "github-light",
    keepBackground: false,
  })
  .use(rehypeReact, {
    Fragment: production.Fragment,
    jsx: production.jsx,
    jsxs: production.jsxs,
    jsxDEV: development.jsxDEV,
    development: isDevelopment,
    components: {
      img: MarkdownImage,
      h2: MarkdownHeading,
      h3: MarkdownSubheading,
      p: MarkdownParagraph,
      ul: MarkdownList,
      ol: MarkdownOrderedList,
      a: MarkdownLink,
      pre: MarkdownPre,
      code: MarkdownCode,
    },
  } as unknown as Parameters<typeof rehypeReact>[0]);

export async function renderMarkdown(markdown: string): Promise<React.ReactNode> {
  const file = await processor.process(markdown);
  return file.result as React.ReactNode;
}
