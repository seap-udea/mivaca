import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad · Mi Vaca",
  description: "Política de privacidad y uso de cookies/ads para Mi Vaca.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Política de Privacidad
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Última actualización: {new Date().toLocaleDateString("es-CO")}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            1. Datos que recopilamos
          </h2>
          <p className="text-gray-700 mb-4">
            La app recopila la información que ingresas para operar la “vaca”
            (por ejemplo: nombres, productos, valores y pagos registrados). En
            esta versión, el almacenamiento es principalmente <b>en memoria</b>,
            por lo que los datos pueden reiniciarse si el servidor se reinicia.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            2. Cookies, anuncios y medición
          </h2>
          <p className="text-gray-700 mb-4">
            Este sitio puede usar <b>Google AdSense</b> para mostrar anuncios.
            AdSense puede usar cookies o identificadores para personalización,
            medición y prevención de fraude, según sus políticas y tu
            configuración/regulación aplicable.
          </p>
          <p className="text-gray-700 mb-4">
            Puedes obtener más información en las políticas de Google. (Las
            preferencias de anuncios y cookies dependen de tu navegador/cuenta y
            de la configuración de Google.)
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            3. Con quién compartimos información
          </h2>
          <p className="text-gray-700 mb-4">
            No vendemos tu información. Podemos compartir datos mínimos con
            proveedores necesarios para operar el servicio (por ejemplo, la
            plataforma de hosting) y con proveedores de anuncios (por ejemplo,
            Google) en la medida en que sea necesario para servir anuncios.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            4. Seguridad
          </h2>
          <p className="text-gray-700 mb-4">
            Tomamos medidas razonables para proteger la información, pero ningún
            sistema es 100% seguro.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            5. Contacto
          </h2>
          <p className="text-gray-700 mb-6">
            Si tienes preguntas o solicitudes relacionadas con privacidad,
            contáctanos en{" "}
            <a
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
              href="mailto:zuluagajorge@gmail.com"
            >
              zuluagajorge@gmail.com
            </a>
            .
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
          </div>
        </div>
      </div>
    </div>
  );
}

