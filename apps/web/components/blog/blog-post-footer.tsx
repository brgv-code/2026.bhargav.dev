const FOOTER_TEXT = "written with care . bhargav.dev . 2026";

type Props = {
  className?: string;
};

export function BlogPostFooter({ className }: Props) {
  return (
    <footer
      className={
        "border-t border-[var(--editorial-border)] pt-7 pb-8 text-center font-mono text-[11px] text-[var(--editorial-text-dim)] bg-[var(--editorial-surface)] " +
        (className ?? "")
      }
    >
      {FOOTER_TEXT}
    </footer>
  );
}
