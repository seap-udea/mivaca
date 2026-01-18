'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

type Lang = "es" | "en";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : undefined;
}

function setLangCookie(lang: Lang) {
  // 1 year, Lax, whole site
  document.cookie = `lang=${encodeURIComponent(lang)}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const c = readCookie("lang");
    if (c === "en" || c === "es") setLang(c);
  }, []);

  const buttons = useMemo(
    () =>
      [
        { lang: "es" as const, label: "Español", flag: "🇨🇴" },
        { lang: "en" as const, label: "English", flag: "🇬🇧" },
      ] as const,
    []
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {buttons.map((b) => {
        const active = lang === b.lang;
        const locked =
          pathname?.startsWith("/vaquero/") ||
          pathname?.startsWith("/comensal/");
        return (
          <button
            key={b.lang}
            type="button"
            onClick={() => {
              if (lang === b.lang) return;
              if (locked) return;
              setLangCookie(b.lang);
              setLang(b.lang);
              // In Next 16 App Router, a full reload is the most reliable way to
              // ensure server components re-render with the updated cookie.
              window.location.reload();
            }}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border shadow-sm transition-colors ${
              active
                ? "bg-white border-indigo-400 ring-2 ring-indigo-300"
                : "bg-white/80 border-gray-200 hover:bg-white opacity-80"
            }`}
            title={
              locked
                ? (lang === "en"
                    ? "Language is locked for this session"
                    : "El idioma está bloqueado para esta sesión")
                : b.label
            }
            aria-label={b.label}
            disabled={locked}
          >
            <span className="text-base leading-none" aria-hidden>
              {b.flag}
            </span>
          </button>
        );
      })}
    </div>
  );
}

