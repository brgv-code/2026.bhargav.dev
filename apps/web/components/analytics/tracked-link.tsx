"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  href: string;
  eventName: string;
  eventParams?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
};

export function TrackedLink({
  href,
  eventName,
  eventParams,
  className,
  children,
  external,
}: TrackedLinkProps) {
  const handleClick = () => trackEvent(eventName, eventParams);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
