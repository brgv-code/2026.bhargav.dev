import {
  CreateNotebookDocumentSchema,
  NotebookDocumentSchema,
} from "@repo/types";
import { getNotebooks } from "@/lib/data/notebooks";
import { NextRequest, NextResponse } from "next/server";

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

export async function GET() {
  try {
    const notebooks = await getNotebooks();
    return NextResponse.json(notebooks);
  } catch (e) {
    console.error("[api/notebooks GET]", e);
    return NextResponse.json(
      { error: "Failed to fetch notebooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = CreateNotebookDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notebook payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const res = await fetch(`${cmsUrl}/api/notebooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        (data as { errors?: unknown } | null)?.errors ?? {
          error: res.statusText,
        },
        { status: res.status }
      );
    }

    const parsedResponse = NotebookDocumentSchema.safeParse(data);
    if (!parsedResponse.success) {
      return NextResponse.json(
        { error: "Invalid notebook response from CMS" },
        { status: 502 }
      );
    }

    return NextResponse.json(parsedResponse.data);
  } catch (e) {
    console.error("[api/notebooks POST]", e);
    return NextResponse.json(
      { error: "Failed to create notebook" },
      { status: 500 }
    );
  }
}
