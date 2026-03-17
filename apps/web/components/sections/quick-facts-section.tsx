type Fact = {
  label: string;
  value: string;
};

type Props = {
  items: Fact[];
  heading?: string;
};

export function QuickFactsSection({ items, heading = "Quick Facts" }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h3 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
        {heading}
      </h3>
      <dl className="grid grid-cols-1 gap-3 text-base">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="flex flex-col">
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className="text-base text-primary">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
