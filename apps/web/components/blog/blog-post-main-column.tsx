import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Left column for post layout — pairs with {@link BlogPostTocRail} and gap-px gutter.
 */
export function BlogPostMainColumn({ children, className }: Props) {
  return (
    <div className={cn("min-w-0 bg-surface", className)}>{children}</div>
  );
}
