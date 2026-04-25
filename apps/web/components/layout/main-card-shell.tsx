import type { ReactNode } from "react";
import { DevBanner } from "./dev-banner";

type Props = {
  children: ReactNode;
};

/**
 * Fixed-viewport shell: page background inset + raised card. All routes scroll
 * inside `#main-scroll` (not the window) so the frame stays put like Linear.
 */
export function MainCardShell({ children }: Props) {
  return (
    <div className="box-border flex min-h-0 flex-1 flex-col p-3">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-strong dark:border-border bg-surface shadow-md dark:shadow-sm">
        <DevBanner />
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
