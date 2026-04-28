type Props = {
  name: string;
  tagline: string;
};

export function BioBlock({ name, tagline }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="font-serif font-black text-lg leading-tight text-primary">
        {name.toLowerCase()}.
      </h1>
      <p className="text-sm text-muted leading-snug">
        {tagline}
      </p>
    </div>
  );
}
