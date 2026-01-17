import Link from "next/link";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "Novedades · Mi Vaca",
  description: "Novedades de la última versión de Mi Vaca.",
};

type LatestWhatsNew = {
  heading: string;
  items: string[];
};

function readWhatsNew(): string {
  try {
    const whatsNewPath = join(process.cwd(), "WHATSNEW.md");
    return readFileSync(whatsNewPath, "utf-8");
  } catch {
    return "";
  }
}

function parseLatestSection(md: string): LatestWhatsNew {
  const lines = md.split(/\r?\n/);

  // Find first "## " section.
  const firstSectionIdx = lines.findIndex((l) => l.startsWith("## "));
  if (firstSectionIdx === -1) {
    // Fallback: treat any "- " lines as items.
    const items = lines
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => l.replace(/^- /, "").trim())
      .filter(Boolean);

    return {
      heading: "Últimos cambios",
      items,
    };
  }

  const heading = lines[firstSectionIdx].replace(/^##\s*/, "").trim() || "Últimos cambios";

  const nextSectionIdx = lines
    .slice(firstSectionIdx + 1)
    .findIndex((l) => l.startsWith("## "));

  const endExclusive =
    nextSectionIdx === -1 ? lines.length : firstSectionIdx + 1 + nextSectionIdx;

  const sectionLines = lines.slice(firstSectionIdx + 1, endExclusive);
  const items = sectionLines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace(/^- /, "").trim())
    .filter(Boolean);

  return { heading, items };
}

export default function NovedadesPage() {
  const md = readWhatsNew();
  const latest = parseLatestSection(md);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Novedades</h1>
          <p className="text-sm text-gray-600 mb-6">
            Novedades de la última versión publicada.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {latest.heading}
          </h2>

          {latest.items.length ? (
            <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-1">
              {latest.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 mb-6">
              Aún no hay novedades publicadas.
            </p>
          )}

          <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3">
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Volver al inicio
            </Link>
            <Link
              href="/acerca"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Acerca de
            </Link>
            <Link
              href="/privacidad"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Privacidad
            </Link>
            <Link
              href="/licencia"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Licencia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

