type Props = {
  name: string;
  tagline: string;
  bio?: string | null;
};

export function BioBlock({ name, tagline, bio }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-4xl font-semibold tracking-tight text-primary">
        {name}
      </h1>
      <p className="text-base leading-relaxed text-secondary">{tagline}</p>
    </div>
  );
}
