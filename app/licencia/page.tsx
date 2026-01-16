import Link from "next/link";

export const metadata = {
  title: "Licencia · Mi Vaca",
  description: "Resumen de la licencia de uso de Mi Vaca.",
};

export default function LicenciaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Licencia</h1>
          <p className="text-gray-700 mb-4">
            Esta app se distribuye bajo una <b>licencia propietaria</b>. En
            términos simples: puedes usarla para fines personales y no
            comerciales, pero necesitas permiso explícito del autor para otros
            usos.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Permisos (lo que sí puedes hacer)
          </h2>
          <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
            <li>
              Uso <b>personal</b> y <b>no comercial</b>.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Restricciones (lo que NO puedes hacer sin permiso)
          </h2>
          <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
            <li>
              Usar el software con fines <b>comerciales</b>.
            </li>
            <li>
              <b>Redistribuir</b>, copiar, compartir o publicar el software.
            </li>
            <li>
              <b>Modificar</b> o crear <b>trabajos derivados</b>.
            </li>
            <li>
              <b>Sublicenciar</b>, alquilar, arrendar o transferir derechos.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Terminación
          </h2>
          <p className="text-gray-700 mb-4">
            Si no cumples los términos, la licencia puede terminar
            automáticamente y debes destruir las copias que tengas.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Garantías y responsabilidad
          </h2>
          <p className="text-gray-700 mb-6">
            El software se entrega <b>&quot;tal cual&quot;</b>, sin garantías. El autor no
            asume responsabilidad por daños derivados del uso del software.
          </p>

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
          </div>
        </div>
      </div>
    </div>
  );
}

