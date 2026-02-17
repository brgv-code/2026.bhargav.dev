import type { NextRequest } from "next/server";
import payloadConfig from "../../payload.config";
import { nextAppHandler } from "@payloadcms/next/appHandler";

const handler = nextAppHandler({
  config: payloadConfig,
});

export const GET = (req: NextRequest) => handler(req);
export const POST = (req: NextRequest) => handler(req);
export const PUT = (req: NextRequest) => handler(req);
export const PATCH = (req: NextRequest) => handler(req);
export const DELETE = (req: NextRequest) => handler(req);

