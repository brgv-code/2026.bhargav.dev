import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { SidebarLinkPanel } from "@/components/sections/sidebar-link-panel";
import { fetchProfile, fetchProjectsFromPayload } from "@/lib/data/cms";
import { cn } from "@/lib/utils";
import {
  absoluteUrl,
  defaultDescription,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description: "About Bhargav and the work he does.",
  alternates: {
    canonical: absoluteUrl("/about"),
  },
  openGraph: {
    type: "profile",
    title: "About",
    description: "About Bhargav and the work he does.",
    url: absoluteUrl("/about"),
    siteName,
    images: [
      {
        url: "/og-about.svg",
        width: 1200,
        height: 630,
        alt: "About Bhargav",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description: "About Bhargav and the work he does.",
    images: ["/og-about.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AboutPage() {
  const [profile, projects] = await Promise.all([
    fetchProfile(),
    fetchProjectsFromPayload(),
  ]);

  const name = profile?.name ?? "Bhargav";
  const tagline =
    profile?.tagline ??
    "Product-focused developer building intentional interfaces.";
  const bio = profile?.bio ?? "";
  const aboutText = bio || defaultDescription;

  const email = profile?.email ?? process.env.NEXT_PUBLIC_EMAIL ?? null;
  const githubUrl = profile?.github ?? process.env.NEXT_PUBLIC_GITHUB_URL ?? null;
  const twitterUrl = profile?.x ?? process.env.NEXT_PUBLIC_TWITTER_URL ?? null;
  const linkedinUrl =
    profile?.linkedin ?? process.env.NEXT_PUBLIC_LINKEDIN_URL ?? null;
  const resumeUrl = process.env.NEXT_PUBLIC_RESUME_URL ?? "/resume.pdf";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Who is ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: aboutText,
        },
      },
      {
        "@type": "Question",
        name: `What does ${name} focus on?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tagline,
        },
      },
    ],
  };

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">About</h1>
        <p className="text-sm text-secondary mt-0.5">
          Background, focus, and how to get in touch.
        </p>
      </div>

      <BreadcrumbsJsonLd
        id="about-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "About", href: absoluteUrl("/about") },
        ]}
      />
      <JsonLd
        id="about-profile"
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "@id": `${absoluteUrl("/about")}#profile`,
          url: absoluteUrl("/about"),
          name: `About ${name}`,
          description: aboutText,
          isPartOf: { "@id": `${siteUrl}#website` },
          about: { "@id": `${siteUrl}#person` },
          mainEntity: { "@id": `${siteUrl}#person` },
        }}
      />
      <JsonLd id="faq-about" data={faqJsonLd} />

      <div
        className={cn(
          "grid min-h-0",
          projects.length > 0
            ? "grid-cols-1 xl:grid-cols-home-main"
            : "grid-cols-1",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            projects.length > 0 && "xl:border-r xl:border-border",
          )}
        >
          <section
            className="border-b border-border px-6 py-8 pb-24"
            aria-labelledby="about-intro-heading"
          >
            <div className="flex max-w-3xl flex-col gap-3">
              <div>
                <h2
                  id="about-intro-heading"
                  className="text-base font-semibold text-primary leading-snug"
                >
                  {name}
                </h2>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  {tagline}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-primary">{aboutText}</p>

              {(email || githubUrl || twitterUrl || linkedinUrl) ? (
                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                  <span className="text-2xs font-mono uppercase tracking-widest text-muted">
                    Contact
                  </span>
                  <div className="flex flex-col gap-2">
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="text-sm text-primary hover:text-accent transition-colors duration-normal"
                      >
                        {email}
                      </a>
                    ) : null}
                    {githubUrl ? (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-primary transition-colors duration-normal"
                      >
                        GitHub ↗
                      </a>
                    ) : null}
                    {twitterUrl ? (
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-primary transition-colors duration-normal"
                      >
                        X / Twitter ↗
                      </a>
                    ) : null}
                    {linkedinUrl ? (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted hover:text-primary transition-colors duration-normal"
                      >
                        LinkedIn ↗
                      </a>
                    ) : null}
                  </div>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xs font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors duration-normal"
                  >
                    Resume ↓
                  </a>
                </div>
              ) : (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block w-fit text-2xs font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors duration-normal"
                >
                  Resume ↓
                </a>
              )}
            </div>
          </section>
        </div>

        {projects.length > 0 ? (
          <SidebarLinkPanel
            id="about-sidebar-projects-heading"
            title="Selected projects"
            viewAllHref="/projects"
            items={projects.slice(0, 5).map((project) => ({
              key: project.id,
              href: `/projects#project-${project.id}`,
              label: project.title ?? project.name,
            }))}
          />
        ) : null}
      </div>
    </>
  );
}
