"use client";

import { Mail, Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { trackContactClick } from "@/lib/analytics";

type Method = "email" | "github" | "twitter" | "linkedin";

const icons: Record<Method, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
};

export type ContactLink = {
  label: string;
  value: string;
  href: string;
  method: Method;
};

export function ContactLinks({ links }: { links: ContactLink[] }) {
  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map(({ label, value, href, method }) => {
        const Icon = icons[method];
        return (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
            onClick={() => trackContactClick(method)}
            className="group flex items-center gap-4 rounded border border-border bg-surface px-5 py-4 hover:border-border-strong transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-highlight text-muted group-hover:text-primary transition-colors">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-primary truncate">{value}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0" />
          </a>
        );
      })}
    </div>
  );
}
