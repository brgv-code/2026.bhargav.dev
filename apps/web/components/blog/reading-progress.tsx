'use client'

import { useState, useEffect } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = document.getElementById('main-scroll')
    if (!container) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const total = scrollHeight - clientHeight
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0)
    }
    container.addEventListener('scroll', update, { passive: true })
    return () => container.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  )
}
