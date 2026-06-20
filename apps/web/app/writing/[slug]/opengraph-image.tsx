import { ImageResponse } from "next/og";
import { fetchPostBySlug, fetchPostSlugs } from "@/lib/data/cms";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await fetchPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  const title = post?.title ?? "Writing";
  const description = post?.description ?? "";

  const titleFontSize = title.length > 60 ? 44 : title.length > 40 ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          width: "100%",
          height: "100%",
          background: "#faf9f7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#999999",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            marginBottom: 28,
          }}
        >
          bhargav.dev / writing
        </div>
        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 900,
            color: "#1a1a1a",
            lineHeight: 1.1,
            marginBottom: description ? 20 : 0,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 24,
              color: "#666666",
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            {description.length > 120 ? `${description.slice(0, 120)}…` : description}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
