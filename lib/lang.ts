import { cookies } from "next/headers";

export type Lang = "es" | "en";

export function getLang(): Lang {
  const value = cookies().get("lang")?.value;
  return value === "en" ? "en" : "es";
}

