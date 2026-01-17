import Link from "next/link";
import { getLang } from "@/lib/lang";

export const metadata = {
  title: "Política de Privacidad · Mi Vaca",
  description: "Política de privacidad para Mi Vaca.",
};

export default function PrivacidadPage() {
  const lang = getLang();
  const isEn = lang === "en";
  const lastUpdate = new Date().toLocaleDateString(isEn ? "en-GB" : "es-CO");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isEn ? "Privacy Policy" : "Política de Privacidad"}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {isEn ? "Last updated" : "Última actualización"}: {lastUpdate}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "1. Data we collect" : "1. Datos que recopilamos"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn ? (
              <>
                The app collects the information you enter to operate the “vaca”
                (e.g., names, items, amounts, and recorded payments). In this
                version, storage is mainly <b>in memory</b>, so data is not
                permanently stored on a server.
              </>
            ) : (
              <>
                La app recopila la información que ingresas para operar la “vaca”
                (por ejemplo: nombres, productos, valores y pagos registrados). En
                esta versión, el almacenamiento es principalmente <b>en memoria</b>,
                por lo que los datos no se almacenan permanentemente en un servidor.
              </>
            )}
          </p>
          <p className="text-gray-700 mb-4">
            {isEn ? (
              <>
                This site <b>does not track</b> users and <b>does not require</b>{" "}
                personal information at any time.
              </>
            ) : (
              <>
                Este sitio <b>no rastrea</b> a los usuarios y <b>no requiere</b>{" "}
                información personal en ningún momento.
              </>
            )}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "2. Who we share information with" : "2. Con quién compartimos información"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn ? (
              <>
                We do not sell your information. We may share minimal data with
                providers required to operate the service (e.g., the hosting
                platform).
              </>
            ) : (
              <>
                No vendemos tu información. Podemos compartir datos mínimos con
                proveedores necesarios para operar el servicio (por ejemplo, la
                plataforma de hosting).
              </>
            )}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "3. Security" : "3. Seguridad"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn ? (
              <>
                We take reasonable measures to protect information, but no
                system is 100% secure.
              </>
            ) : (
              <>
                Tomamos medidas razonables para proteger la información, pero ningún
                sistema es 100% seguro.
              </>
            )}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "4. Contact" : "4. Contacto"}
          </h2>
          <p className="text-gray-700 mb-6">
            {isEn
              ? "If you have questions or requests related to privacy, contact us at "
              : "Si tienes preguntas o solicitudes relacionadas con privacidad, contáctanos en "}
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
              {isEn ? "Back to home" : "Volver al inicio"}
            </Link>
            <Link
              href="/acerca"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isEn ? "About" : "Acerca de"}
            </Link>
            <Link
              href="/licencia"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isEn ? "License" : "Licencia"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

