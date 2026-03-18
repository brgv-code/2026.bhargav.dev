type Props = {
  name: string;
  tagline: string;
};

export function BioBlock({ name, tagline }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-serif italic text-2xl leading-tight text-primary">
        {name}
      </h1>
      <p className="font-serif italic text-sm leading-snug text-secondary">
        {tagline}
      </p>
    </div>
  );
}
