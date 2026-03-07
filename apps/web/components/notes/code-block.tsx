"use client";

import { Highlight, themes } from "prism-react-renderer";
import Prism from "prismjs";

// Register Prism languages (order matters: base before extended, e.g. c before cpp)
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-git";
import "prismjs/components/prism-shell-session";

// Map common aliases to Prism language ids
const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  bash: "bash",
  yml: "yaml",
  md: "markdown",
  html: "markup",
  xml: "markup",
  rb: "ruby",
  rs: "rust",
  cs: "csharp",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  go: "go",
  golang: "go",
  java: "java",
  php: "php",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  json: "json",
  css: "css",
  scss: "scss",
  docker: "docker",
  dockerfile: "docker",
  git: "git",
};

function resolveLanguage(lang: string): string {
  const normalized = lang.trim().toLowerCase();
  return LANG_ALIASES[normalized] ?? normalized;
}

// Light theme overrides to match editorial notes (cream bg, dark text)
const NOTE_CODE_BG = "#e0ddd6";
const NOTE_INK = "#1a1a1a";

const editorialTheme = {
  ...themes.github,
  plain: {
    ...themes.github.plain,
    backgroundColor: NOTE_CODE_BG,
    color: NOTE_INK,
  },
};

export type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
  preClassName?: string;
  style?: React.CSSProperties;
};

export function CodeBlock({
  code,
  language = "text",
  className,
  preClassName,
  style: customStyle,
}: CodeBlockProps) {
  const lang = resolveLanguage(language);

  // Prism may not have this language; fallback to markup (generic)
  const safeLang = lang && Prism.languages[lang] ? lang : "markup";

  return (
    <Highlight theme={editorialTheme} code={code} language={safeLang}>
      {({
        className: innerClassName,
        style,
        tokens,
        getLineProps,
        getTokenProps,
      }) => (
        <pre
          className={
            [innerClassName, preClassName].filter(Boolean).join(" ") ||
            undefined
          }
          style={{
            ...style,
            backgroundColor: NOTE_CODE_BG,
            color: NOTE_INK,
            margin: 0,
            ...customStyle,
          }}
        >
          <code className={className}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}

/** All languages we support (for add-block UI or docs). Prism’s own list + aliases. */
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "bash",
  "json",
  "css",
  "scss",
  "markdown",
  "html",
  "markup",
  "sql",
  "yaml",
  "graphql",
  "go",
  "rust",
  "ruby",
  "php",
  "java",
  "csharp",
  "cpp",
  "c",
  "docker",
  "git",
  "shell-session",
] as const;
