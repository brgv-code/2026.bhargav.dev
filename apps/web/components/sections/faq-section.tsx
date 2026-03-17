type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FaqItem[];
  heading?: string;
};

export function FaqSection({ items, heading = "FAQ" }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h3 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
        {heading}
      </h3>
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col gap-2">
            <p className="text-base font-semibold text-primary">
              {item.question}
            </p>
            <p className="text-base text-secondary">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export type { FaqItem };
