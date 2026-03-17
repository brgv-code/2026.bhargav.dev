"use client";

import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  label?: string;
};

export function BackButton({ className, label = "Back" }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => router.back()}
    >
      ←
    </button>
  );
}
