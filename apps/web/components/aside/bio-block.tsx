type Props = {
  name: string;
  tagline: string;
};

export function BioBlock({ name, tagline }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-serif italic text-xl leading-tight text-accent">
        {name}
      </h1>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        {tagline}
      </p>
    </div>
  );
}
