import { cookies, headers } from "next/headers";

export type Lang = "es" | "en";

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    out[key] = decodeURIComponent(val);
  }
  return out;
}

export async function getLang(): Promise<Lang> {
  // First, try to get lang from URL query parameter
  try {
    const maybeHeaders = headers();
    const h: any =
      typeof (maybeHeaders as any)?.then === "function" ? await (maybeHeaders as any) : maybeHeaders;

    if (h && typeof h.get === "function") {
      // Get the full URL from headers
      const referer = h.get("referer");
      if (referer) {
        try {
          const url = new URL(referer);
          const langParam = url.searchParams.get("lang");
          if (langParam === "en" || langParam === "es") {
            return langParam;
          }
        } catch {
          // ignore URL parse errors
        }
      }
    }
  } catch {
    // fall through to cookies
  }

  // Next, try to read from cookies
  try {
    const maybeStore = cookies();
    const store: any =
      typeof (maybeStore as any)?.then === "function" ? await (maybeStore as any) : maybeStore;

    if (store && typeof store.get === "function") {
      const value = store.get("lang")?.value;
      return value === "en" ? "en" : "es";
    }
  } catch {
    // fall back to headers parsing
  }

  try {
    const maybeHeaders = headers();
    const h: any =
      typeof (maybeHeaders as any)?.then === "function" ? await (maybeHeaders as any) : maybeHeaders;
    const cookieHeader = typeof h?.get === "function" ? (h.get("cookie") as string | null) : null;
    const cookiesObj = parseCookieHeader(cookieHeader);
    return cookiesObj.lang === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

