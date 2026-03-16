import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const payloadUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL;

if (payloadUrl) {
  try {
    const parsed = new URL(payloadUrl);
    const protocol: "http" | "https" =
      parsed.protocol === "https:" ? "https" : "http";
    const pattern = {
      protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    } satisfies NonNullable<NextConfig["images"]>["remotePatterns"][number];
    remotePatterns.push(pattern);
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
