import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@payloadcms/db-sqlite",
    "@libsql/client",
    "libsql",
    "esbuild",
    "drizzle-kit",
    "sharp",
  ],
};

export default withPayload(nextConfig);
