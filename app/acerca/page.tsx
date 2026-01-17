import Link from "next/link";
import { getLang } from "@/lib/lang";

export const metadata = {
  title: "Acerca de · Mi Vaca",
  description: "Información sobre Mi Vaca, su propósito y contacto.",
};

export default async function AcercaPage() {
  const lang = await getLang();
  const isEn = lang === "en";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isEn ? "About" : "Acerca de"}
          </h1>
          <p className="text-gray-700 mb-4">
            {isEn ? (
              <>
                <b>Mi Vaca</b> is a web app to split restaurant bills with friends:
                the <i>vaquer@</i> creates a “vaca”, diners join via QR, register
                their items, and the app calculates totals and payments.
              </>
            ) : (
              <>
                <b>Mi Vaca</b> es una aplicación web para dividir cuentas de
                restaurante entre amigos: el/la <i>vaquer@</i> crea una “vaca”, los
                comensales se unen con un QR, registran sus consumos y la app
                calcula totales y pagos.
              </>
            )}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "Support" : "Monetización"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? "To sustain the project, the app accepts one-time or recurring voluntary donations—support the artist!"
              : "Para sostener el proyecto la app recibe donaciones voluntarias únicas o periódicas ¡apoya al artista!"}
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {isEn ? "Contact" : "Contacto"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? "For support, suggestions, or licensing/sponsorship inquiries, email "
              : "Para soporte, sugerencias o temas de licencia/esponsoreo, escribe a "}
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
              href="/privacidad"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {isEn ? "Privacy Policy" : "Política de Privacidad"}
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

