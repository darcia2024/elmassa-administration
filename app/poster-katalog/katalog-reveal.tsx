"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Adds the entrance travel to .k-rise elements as they scroll into view. */
export function KatalogReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector(".katalog");
    if (!root || !("IntersectionObserver" in window)) return;
    root.classList.add("k-js");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("k-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll(".k-rise:not(.k-in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
