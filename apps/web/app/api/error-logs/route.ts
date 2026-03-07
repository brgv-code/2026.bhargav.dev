import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

const ErrorLogInputSchema = z.object({
  level: z.enum(["info", "warn", "error", "fatal"]).default("error"),
  source: z.string().min(1),
  message: z.string().min(1),
  stack: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  occurredAt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = ErrorLogInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid error log payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload = {
      ...parsed.data,
      occurredAt: parsed.data.occurredAt ?? new Date().toISOString(),
    };

    const res = await fetch(`${cmsUrl}/api/error-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        (data as { errors?: unknown } | null)?.errors ?? {
          error: res.statusText,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("[api/error-logs POST]", e);
    return NextResponse.json(
      { error: "Failed to persist error log" },
      { status: 500 },
    );
  }
}
