import { fetchNotebooks } from "@/lib/payload";
import { NextRequest, NextResponse } from "next/server";

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);

export async function GET() {
  const notebooks = await fetchNotebooks();
  return NextResponse.json(notebooks);
}

export async function POST(request: NextRequest) {
  if (!cmsUrl) {
    return NextResponse.json(
      { error: "CMS not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const res = await fetch(`${cmsUrl}/api/notebooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        data?.errors ?? { error: res.statusText },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("[api/notebooks POST]", e);
    return NextResponse.json(
      { error: "Failed to create notebook" },
      { status: 500 }
    );
  }
}
