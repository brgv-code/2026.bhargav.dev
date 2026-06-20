"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GA_ID } from "@/lib/analytics";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    gtag("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsPageView() {
  return (
    <Suspense>
      <PageViewTracker />
    </Suspense>
  );
}
