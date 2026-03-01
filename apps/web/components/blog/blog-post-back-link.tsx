import Link from "next/link";

type Props = {
  href: string;
  label?: string;
};

export function BlogPostBackLink({ href, label = "← back to writing" }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] text-xs font-mono tracking-wide transition-colors mb-10"
    >
      {label}
    </Link>
  );
}
