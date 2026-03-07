import { fetchWorkExperience } from "@/lib/data/cms";

export async function WorkExperience() {
  const roles = await fetchWorkExperience();

  return (
    <section className="py-5">
      <h2 className="text-[var(--editorial-text-dim)] font-mono text-[10px] uppercase tracking-widest mb-4">
        Work
      </h2>

      {roles.length === 0 ? (
        <p className="text-sm text-[var(--editorial-text-muted)]">
          No work experience added yet.
        </p>
      ) : (
        <div className="space-y-0">
          {roles.map((role) => (
            <details
              key={role.id}
              className="group border-b border-dashed border-[var(--editorial-border)] py-2"
            >
              <summary className="flex items-baseline justify-between gap-4 cursor-pointer list-none">
                <div>
                  <p className="text-sm text-[var(--editorial-text)]">
                    {role.role}
                  </p>
                  <p className="text-xs text-[var(--editorial-text-muted)]">
                    {role.company}
                  </p>
                </div>
                {role.date_range && (
                  <span className="text-xs text-[var(--editorial-text-muted)]">
                    {role.date_range}
                  </span>
                )}
              </summary>

              {role.bullets && role.bullets.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet.id}
                      className="flex items-start gap-2 text-sm text-[var(--editorial-text-muted)]"
                    >
                      <span className="mt-1 h-[3px] w-[3px] bg-[var(--editorial-accent)]" />
                      {bullet.href ? (
                        <a
                          href={bullet.href}
                          className="underline-offset-2 hover:text-[var(--editorial-accent)] hover:underline"
                        >
                          {bullet.label}
                        </a>
                      ) : (
                        <span>{bullet.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
