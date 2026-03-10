import {
  NotebookDocumentSchema,
  UpdateNotebookDocumentSchema,
} from "@repo/types";
import { NextRequest, NextResponse } from "next/server";

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const body = await _request.json();
    const parsed = UpdateNotebookDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notebook payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const res = await fetch(`${cmsUrl}/api/notebooks/${id}`, {
      method: "PATCH",
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

    // Payload wraps the updated doc in { doc, message }
    const data = (raw as { doc?: unknown } | null)?.doc ?? raw;

    const parsedResponse = NotebookDocumentSchema.safeParse(data);
    if (!parsedResponse.success) {
      console.error("[api/notebooks PATCH] invalid CMS response", {
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
    console.error("[api/notebooks PATCH]", e);
    return NextResponse.json(
      { error: "Failed to update notebook" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await fetch(`${cmsUrl}/api/notebooks/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data?.errors ?? { error: res.statusText }, {
        status: res.status,
      });
    }
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/notebooks DELETE]", e);
    return NextResponse.json(
      { error: "Failed to delete notebook" },
      { status: 500 }
    );
  }
}
