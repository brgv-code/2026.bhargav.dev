import type { NextConfig } from "next";

type RemotePattern = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
  search?: string;
};

const remotePatterns: RemotePattern[] = [];
const payloadUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL;

if (payloadUrl) {
  try {
    const parsed = new URL(payloadUrl);
    const protocol: "http" | "https" =
      parsed.protocol === "https:" ? "https" : "http";
    remotePatterns.push({
      protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    });
  } catch {
    // Ignore invalid URL and fall back to defaults.
  }
}

remotePatterns.push({
  protocol: "http",
  hostname: "localhost",
  port: "3001",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    unoptimized: process.env.NODE_ENV === "development",
    // The CMS (PAYLOAD_PUBLIC_SERVER_URL) is self-hosted and its host resolves
    // to a private IP (localhost / VPS-internal). Next 16's image optimizer
    // otherwise rejects those with a 400 `"url" parameter is not allowed`
    // (SSRF guard, error E394). Image URLs come only from trusted, admin-authored
    // CMS content, so bypassing the private-IP guard here is safe.
    dangerouslyAllowLocalIP: true,
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
