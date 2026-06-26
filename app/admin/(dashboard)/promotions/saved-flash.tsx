"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/app/components/ui/toast";

/** Shows a success toast after a redirect carrying ?saved=created|updated. */
export function SavedFlash() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const done = useRef(false);

  useEffect(() => {
    const saved = params.get("saved");
    if (!saved || done.current) return;
    done.current = true;
    toast(saved === "updated" ? "Promo diperbarui" : "Promo ditambahkan");
    router.replace(pathname, { scroll: false });
  }, [params, router, pathname, toast]);

  return null;
}
