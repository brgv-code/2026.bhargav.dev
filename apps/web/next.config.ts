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
  },
};

export default nextConfig;
