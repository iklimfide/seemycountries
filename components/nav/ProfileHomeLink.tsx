"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resolveAuthenticatedHomePath } from "@/lib/client/authenticated-home";

type ProfileHomeLinkProps = {
  className?: string;
  "aria-label": string;
  children: React.ReactNode;
};

export function ProfileHomeLink({ className, "aria-label": ariaLabel, children }: ProfileHomeLinkProps) {
  const [href, setHref] = useState("/");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    void resolveAuthenticatedHomePath(supabase).then((path) => {
      setHref(path === "/login" ? "/" : path);
    });
  }, []);

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
