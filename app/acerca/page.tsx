import Link from "next/link";

export const metadata = {
  title: "Acerca de · Mi Vaca",
  description: "Información sobre Mi Vaca, su propósito y contacto.",
};

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acerca de</h1>
          <p className="text-gray-700 mb-4">
            <b>Mi Vaca</b> es una aplicación web para dividir cuentas de restaurante
            entre amigos: el/la <i>vaquer@</i> crea una “vaca”, los comensales se
            unen con un QR, registran sus consumos y la app calcula totales y pagos.
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">Monetización</h2>
          <p className="text-gray-700 mb-4">
            Para sostener el proyecto la app recibe donaciones voluntarias únicas
            o periódicas ¡apoya al artista!
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">Contacto</h2>
          <p className="text-gray-700 mb-4">
            Para soporte, sugerencias o temas de licencia/esponsoreo, escribe a{" "}
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
              href="/privacidad"
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Política de Privacidad
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

