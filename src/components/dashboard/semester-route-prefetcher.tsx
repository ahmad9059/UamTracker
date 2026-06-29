"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

type SemesterRoutePrefetcherProps = {
  semesterIds: string[];
};

export function SemesterRoutePrefetcher({ semesterIds }: SemesterRoutePrefetcherProps) {
  const router = useRouter();

  useEffect(() => {
    if (semesterIds.length === 0) return;

    startTransition(() => {
      semesterIds.forEach((id) => {
        router.prefetch(`/dashboard/semester/${id}`);
      });
    });
  }, [router, semesterIds]);

  return null;
}
