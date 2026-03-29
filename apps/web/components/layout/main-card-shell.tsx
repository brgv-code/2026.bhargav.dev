import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Fixed-viewport shell: page background inset + raised card. All routes scroll
 * inside `#main-scroll` (not the window) so the frame stays put like Linear.
 */
export function MainCardShell({ children }: Props) {
  return (
    <div className="box-border flex min-h-0 flex-1 flex-col py-3 pr-3">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div
          id="main-scroll"
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
