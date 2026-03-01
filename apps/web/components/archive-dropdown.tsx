"use client";

import type { ChangeEvent } from "react";

const archiveYears = [2025, 2024, 2023];

export function ArchiveDropdown() {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    if (!year) return;

    const url = `https://${year}.bhargav.dev`;
    window.location.href = url;
  };

  return (
    <div className="inline-flex items-center gap-2 text-xs text-[var(--editorial-text-dim)]">
      <span className="font-mono uppercase tracking-widest">Archive</span>
      <select
        aria-label="View previous years"
        defaultValue=""
        onChange={handleChange}
        className="bg-transparent border border-[var(--editorial-border)] px-2 py-1 text-[11px] font-mono tracking-wide uppercase text-[var(--editorial-text-dim)] rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--editorial-accent)] focus:border-[var(--editorial-accent)]"
      >
        <option value="" disabled>
          select year
        </option>
        {archiveYears.map((year) => (
          <option key={year} value={year} className="bg-[var(--editorial-bg)]">
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

