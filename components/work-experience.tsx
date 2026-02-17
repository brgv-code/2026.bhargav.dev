import { fetchWorkExperience } from "@/lib/payload";

export async function WorkExperience() {
  const roles = await fetchWorkExperience();

  return (
    <section className="py-12">
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        Work
      </h2>

      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No work experience added yet.</p>
      ) : (
        <div className="space-y-2.5">
          {roles.map((role) => (
            <details
              key={role.id}
              className="group border-b border-border/50 py-2.5"
            >
              <summary className="flex items-baseline justify-between gap-4 cursor-pointer list-none">
                <div>
                  <p className="text-sm text-foreground/90">{role.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {role.company}
                  </p>
                </div>
                {role.date_range && (
                  <span className="text-xs text-muted-foreground/80">
                    {role.date_range}
                  </span>
                )}
              </summary>

              {role.bullets && role.bullets.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet.id}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 h-[3px] w-[3px] bg-icon-accent" />
                      {bullet.href ? (
                        <a
                          href={bullet.href}
                          className="underline-offset-2 hover:text-foreground/90 hover:underline"
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

