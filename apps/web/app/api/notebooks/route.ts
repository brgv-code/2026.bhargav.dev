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

    const raw = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        (raw as { errors?: unknown } | null)?.errors ?? {
          error: res.statusText,
        },
        { status: res.status }
      );
    }

    // Payload wraps the updated/created doc in { doc, message }
    const data = (raw as { doc?: unknown } | null)?.doc ?? raw;

    const parsedResponse = NotebookDocumentSchema.safeParse(data);
    if (!parsedResponse.success) {
      console.error("[api/notebooks POST] invalid CMS response", {
        issues: parsedResponse.error.issues,
        data,
      });
      return NextResponse.json(
        {
          error: "Invalid notebook response from CMS",
          details: parsedResponse.error.flatten(),
        },
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
