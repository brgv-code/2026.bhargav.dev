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
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="uppercase tracking-widest">Archive</span>
      <select
        aria-label="View previous years"
        defaultValue=""
        onChange={handleChange}
        className="bg-transparent border border-border/60 px-2 py-1 text-[11px] tracking-wide uppercase text-muted-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-ring/60 focus:border-border"
      >
        <option value="" disabled>
          select year
        </option>
        {archiveYears.map((year) => (
          <option key={year} value={year} className="bg-background">
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

