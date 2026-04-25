'use client'

import React, { useState, useEffect, useMemo, type ReactNode } from 'react'

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

interface ChecklistItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: ReactNode
}

export function ChecklistItem({ children, className, ...props }: ChecklistItemProps) {
  const [checked, setChecked] = useState(false)
  const [mounted, setMounted] = useState(false)

  const contentKey = useMemo(() => {
    const text = extractText(children).trim().slice(0, 60)
    return text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  }, [children])

  useEffect(() => {
    setMounted(true)
    const slug =
      window.location.pathname.split('/').filter(Boolean).pop() ?? 'post'
    const storageKey = `checklist-${slug}-${contentKey}`
    try {
      if (localStorage.getItem(storageKey) === 'true') setChecked(true)
    } catch {
      // localStorage unavailable in this context
    }
  }, [contentKey])

  const toggle = () => {
    setChecked((prev) => {
      const next = !prev
      const slug =
        window.location.pathname.split('/').filter(Boolean).pop() ?? 'post'
      const storageKey = `checklist-${slug}-${contentKey}`
      try {
        localStorage.setItem(storageKey, String(next))
      } catch {
        // ignore write failures
      }
      return next
    })
  }

  return (
    <li
      className={`checklist-item${checked ? ' checklist-item--checked' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <button
        type="button"
        className="checklist-item__btn"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            toggle()
          }
        }}
        aria-pressed={mounted ? checked : undefined}
        aria-label={`Mark item as ${checked ? 'incomplete' : 'complete'}`}
      >
        <span className="checklist-item__checkbox" aria-hidden="true">
          {mounted && checked ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect width="14" height="14" rx="2" fill="var(--color-accent)" />
              <path
                d="M3 7l3 3 5-5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="0.5"
                y="0.5"
                width="13"
                height="13"
                rx="1.5"
                stroke="var(--color-border-strong)"
              />
            </svg>
          )}
        </span>
        <span className="checklist-item__content">{children}</span>
      </button>
    </li>
  )
}
