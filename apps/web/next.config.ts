import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const payloadUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL;

if (payloadUrl) {
  try {
    const parsed = new URL(payloadUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
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
