type Props = {
  name: string;
  tagline: string;
};

export function BioBlock({ name, tagline }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-serif italic font-semibold text-lg leading-tight text-primary">
        {name}
      </h1>
      <p className="text-2xs font-semibold uppercase tracking-ultra text-muted leading-snug">
        {tagline}
      </p>
    </div>
  );
}
