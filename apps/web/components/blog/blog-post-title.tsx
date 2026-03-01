type Props = {
  title: string;
};

export function BlogPostTitle({ title }: Props) {
  return (
    <h1 className="font-serif text-[clamp(1.7rem,3.5vw,2.5rem)] font-semibold leading-tight text-[var(--editorial-text)] tracking-tight mb-2">
      {title}
    </h1>
  );
}
