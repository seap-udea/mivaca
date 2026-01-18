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
        // Get current language from URL parameter, fallback to 'es'
        const currentParams = new URLSearchParams(window.location.search);
        const currentLang = currentParams.get('lang') || 'es';

        // Add lang parameter to the return URL
        const url = new URL(from, window.location.origin);
        if (!url.searchParams.has('lang')) {
          url.searchParams.set('lang', currentLang);
        }
        setHref(url.pathname + url.search);
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

