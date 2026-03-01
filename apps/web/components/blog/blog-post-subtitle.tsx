type Props = {
  description: string | null | undefined;
};

export function BlogPostSubtitle({ description }: Props) {
  if (!description?.trim()) return null;

  return (
    <p className="font-serif italic text-[var(--editorial-text-muted)] text-[1.05rem] leading-snug mb-8">
      {description}
    </p>
  );
}
