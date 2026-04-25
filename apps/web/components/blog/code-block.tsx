'use client'

import React, { useState, useRef, useEffect, useMemo, type ReactNode } from 'react'

const LANG_LABELS: Record<string, string> = {
  bash: 'bash',
  sh: 'shell',
  shell: 'shell',
  zsh: 'zsh',
  nginx: 'nginx',
  yaml: 'yaml',
  yml: 'yaml',
  json: 'json',
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  python: 'python',
  py: 'python',
  css: 'css',
  scss: 'scss',
  html: 'html',
  sql: 'sql',
  go: 'go',
  rust: 'rust',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  toml: 'toml',
  diff: 'diff',
  md: 'markdown',
  mdx: 'mdx',
  env: '.env',
}

const SHELL_CMD_RE =
  /\$ |sudo\s|apt\b|apt-get\b|yum\b|brew\b|npm\b|yarn\b|pnpm\b|git\s|ssh\b|curl\b|wget\b|chmod\b|chown\b|mkdir\b|systemctl\b|ufw\b|iptables\b|export\b/

function extractText(node: ReactNode): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    return extractText(
      (node as React.ReactElement<{ children?: ReactNode }>).props.children
    )
  }
  return ''
}

function detectNote(text: string, lang: string | undefined): boolean {
  if (lang && lang.length > 0) return false
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return false
  const allAnnotation = lines.every((l) => {
    const t = l.trim()
    return t.startsWith('-') || t.startsWith('#')
  })
  return allAnnotation && !SHELL_CMD_RE.test(text)
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: ReactNode
  'data-language'?: string
}

export function CodeBlock({
  children,
  'data-language': language,
  className,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const preRef = useRef<HTMLPreElement>(null)

  const isNote = useMemo(
    () => detectNote(extractText(children), language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const langLabel = language ? (LANG_LABELS[language] ?? language) : null
  const displayLabel = langLabel ?? (isNote ? 'note' : 'shell')

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    const codeEl = preRef.current?.querySelector('code')
    const text = codeEl?.innerText ?? extractText(children)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      if (preRef.current) {
        const range = document.createRange()
        range.selectNodeContents(preRef.current)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    }
  }

  return (
    <div className={`code-block-wrapper${isNote ? ' code-block--note' : ''}`}>
      <div className="code-block-header">
        <span className="code-block__lang">{displayLabel}</span>
        {!isNote && (
          <button
            type="button"
            className="code-block__copy"
            onClick={handleCopy}
            aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
      <pre
        ref={preRef}
        className={`code-block__pre${className ? ` ${className}` : ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
