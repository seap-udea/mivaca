export type Lang = "es" | "en";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : undefined;
}

export function getClientLang(): Lang {
  const c = readCookie("lang");
  return c === "en" ? "en" : "es";
}

