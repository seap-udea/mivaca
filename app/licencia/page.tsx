import Link from "next/link";
import { getLang } from "@/lib/lang";

export const metadata = {
  title: "Licencia · Mi Vaca",
  description: "Resumen de la licencia de uso de Mi Vaca.",
};

export default function LicenciaPage() {
  const lang = getLang();
  const isEn = lang === "en";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isEn ? "License" : "Licencia"}
          </h1>
          <p className="text-gray-700 mb-4">
            {isEn ? (
              <>
                This app is distributed under a <b>proprietary license</b>. In
                simple terms: you may use it for personal, non-commercial
                purposes, but you need the author&apos;s explicit permission for
                other uses.
              </>
            ) : (
              <>
                Esta app se distribuye bajo una <b>licencia propietaria</b>. En
                términos simples: puedes usarla para fines personales y no
                comerciales, pero necesitas permiso explícito del autor para otros
                usos.
              </>
            )}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "Permissions (what you can do)" : "Permisos (lo que sí puedes hacer)"}
          </h2>
          <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
            <li>
              {isEn ? (
                <>
                  <b>Personal</b> and <b>non-commercial</b> use.
                </>
              ) : (
                <>
                  Uso <b>personal</b> y <b>no comercial</b>.
                </>
              )}
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn
              ? "Restrictions (what you may NOT do without permission)"
              : "Restricciones (lo que NO puedes hacer sin permiso)"}
          </h2>
          <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
            <li>
              {isEn ? (
                <>
                  Use the software for <b>commercial</b> purposes.
                </>
              ) : (
                <>
                  Usar el software con fines <b>comerciales</b>.
                </>
              )}
            </li>
            <li>
              {isEn ? (
                <>
                  <b>Redistribute</b>, copy, share, or publish the software.
                </>
              ) : (
                <>
                  <b>Redistribuir</b>, copiar, compartir o publicar el software.
                </>
              )}
            </li>
            <li>
              {isEn ? (
                <>
                  <b>Modify</b> or create <b>derivative works</b>.
                </>
              ) : (
                <>
                  <b>Modificar</b> o crear <b>trabajos derivados</b>.
                </>
              )}
            </li>
            <li>
              {isEn ? (
                <>
                  <b>Sublicense</b>, rent, lease, or transfer rights.
                </>
              ) : (
                <>
                  <b>Sublicenciar</b>, alquilar, arrendar o transferir derechos.
                </>
              )}
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "Termination" : "Terminación"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? "If you do not comply with the terms, the license may terminate automatically and you must destroy any copies you have."
              : "Si no cumples los términos, la licencia puede terminar automáticamente y debes destruir las copias que tengas."}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "Warranty and liability" : "Garantías y responsabilidad"}
          </h2>
          <p className="text-gray-700 mb-6">
            {isEn ? (
              <>
                The software is provided <b>&quot;as is&quot;</b>, without warranties. The
                author is not liable for damages arising from the use of the
                software.
              </>
            ) : (
              <>
                El software se entrega <b>&quot;tal cual&quot;</b>, sin garantías. El autor no
                asume responsabilidad por daños derivados del uso del software.
              </>
            )}
          </p>

          <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3">
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isEn ? "Back to home" : "Volver al inicio"}
            </Link>
            <Link
              href="/acerca"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isEn ? "About" : "Acerca de"}
            </Link>
            <Link
              href="/privacidad"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isEn ? "Privacy" : "Privacidad"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

