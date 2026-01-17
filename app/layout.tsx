import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { readFileSync } from "fs";
import { join } from "path";
import PayPalDonate from "@/components/PayPalDonate";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import LanguageToggle from "@/components/LanguageToggle";
import { getLang } from "@/lib/lang";

// Ensure env-based scripts (GA) are rendered at runtime on Render+Docker.
// Otherwise, static prerendering during build may miss NEXT_PUBLIC_* env vars.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Vaca - Comparte la cuenta del restaurante",
  description: "Comparte la cuenta del restaurante con tus amigos",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/vaca-esferica-jz.webp', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/vaca-esferica-jz.webp',
  },
};

function getVersionDate(): string {
  try {
    const versionPath = join(process.cwd(), 'version');
    const versionDate = readFileSync(versionPath, 'utf-8').trim();
    return versionDate;
  } catch (error) {
    // Fallback to current date if version file doesn't exist
    return new Date().toISOString().split('T')[0];
  }
}

function getVersionYear(): number {
  try {
    const versionDate = getVersionDate();
    const year = new Date(versionDate).getFullYear();
    return isNaN(year) ? new Date().getFullYear() : year;
  } catch (error) {
    return new Date().getFullYear();
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  const versionDate = getVersionDate();
  const versionYear = getVersionYear();
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const developerEmail = "zuluagajorge@gmail.com";
  const singlePaymentUrl =
    process.env.NEXT_PUBLIC_MP_SINGLE_PAYMENT_URL ||
    "https://link.mercadopago.com.co/appmivaca";
  const subscriptionUrl =
    process.env.NEXT_PUBLIC_MP_SUBSCRIPTION_URL ||
    "https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=21d27377c2214d70be1e66e5e7de4a6b";
  
  // Format date to be more readable (e.g., "14 de enero de 2026")
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };
  
  return (
    <html lang={lang} className="h-full" suppressHydrationWarning>
      <head>
        {gaMeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');
`,
              }}
            />
          </>
        ) : null}
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-full`}
      >
        {gaMeasurementId ? <GoogleAnalytics measurementId={gaMeasurementId} /> : null}
        <div className="fixed top-3 left-3 z-50 flex flex-col items-start gap-2">
          <a
            href={`mailto:${developerEmail}?subject=${encodeURIComponent(
              "Sugerencias para Mi Vaca (beta)"
            )}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            title="Versión beta — sugerencias bienvenidas (clic para escribir al desarrollador)"
            aria-label="Versión beta — sugerencias bienvenidas (clic para escribir al desarrollador)"
          >
            β
          </a>
          <LanguageToggle />
        </div>
        <main className="flex-1">
          {children}
        </main>
        <footer className="w-full py-4 px-4 text-center text-sm text-gray-600 border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="mb-3">
              <i>Vibe coded</i> en Cursor por{' '}
              <a 
                href={`mailto:${developerEmail}`}
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Jorge I. Zuluaga, Dr. Z
              </a>
              {' '}© {versionYear} <span className="text-xs text-gray-500">(beta v.{versionDate})</span>
            </p>
            <div className="flex justify-center gap-4 text-xs mb-3">
              <a
                href="/acerca"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Acerca
              </a>
              <a
                href="/privacidad"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Privacidad
              </a>
              <a
                href="/licencia"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Licencia
              </a>
              <a
                href="/novedades"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Novedades
              </a>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm text-gray-700">
                Esta app es gratuita, pero puede apoyar al artista 🧑‍🎨:
              </div>
              <PayPalDonate 
                singlePaymentUrl={singlePaymentUrl}
                subscriptionUrl={subscriptionUrl}
              />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
