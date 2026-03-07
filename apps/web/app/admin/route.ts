import { NextResponse } from "next/server";

export function GET() {
  const target = process.env.PAYLOAD_PUBLIC_SERVER_URL;

  if (!target) {
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_SITE_URL)
    );
  }

  return NextResponse.redirect(target + "/admin");
}
