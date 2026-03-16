"use client";

import { useState } from "react";

type Props = {
  name: string;
  tagline: string;
  bio?: string | null;
};

export function BioBlock({ name, tagline, bio }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasBio = Boolean(bio && bio.trim().length > 0 && bio !== tagline);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-4xl font-semibold tracking-tight text-primary">
        {name}
      </h1>
      <p className="text-base leading-relaxed text-secondary">
        {tagline}
        {hasBio ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={[
              "ml-1 inline-flex items-center font-medium text-primary transition-transform duration-200",
              expanded ? "rotate-90" : "rotate-0",
            ].join(" ")}
            aria-label={expanded ? "Collapse bio" : "Expand bio"}
            aria-expanded={expanded}
          >
            →
          </button>
        ) : null}
      </p>
      {expanded ? (
        <p className="text-base leading-relaxed text-secondary">{bio}</p>
      ) : null}
    </div>
  );
}
