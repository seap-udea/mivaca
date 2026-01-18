'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  defaultHref?: string;
  className?: string;
  children: React.ReactNode;
};

export default function BackToSessionLink({
  defaultHref = "/",
  className,
  children,
}: Props) {
  const [href, setHref] = useState(defaultHref);

  useEffect(() => {
    try {
      const from = window.sessionStorage.getItem("returnTo") || "";
      if (from.startsWith("/vaquero/") || from.startsWith("/comensal/")) {
        setHref(from);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

