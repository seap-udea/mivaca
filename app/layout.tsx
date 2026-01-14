import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { readFileSync } from "fs";
import { join } from "path";

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
      { url: '/vaca-esferica.webp', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/vaca-esferica.webp',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const versionDate = getVersionDate();
  const versionYear = getVersionYear();
  
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
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-full`}
      >
        <main className="flex-1">
          {children}
        </main>
        <footer className="w-full py-4 px-4 text-center text-sm text-gray-600 border-t border-gray-200 bg-white">
          <p>
            Desarrollado en Cursor por{' '}
            <a 
              href="mailto:zuluagajorge@gmail.com" 
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Jorge I. Zuluaga, Dr. Z
            </a>
            {' '}© {versionYear}
            <br />
            <span className="text-xs text-gray-500">
              Última versión: {formatDate(versionDate)}
            </span>
          </p>
        </footer>
      </body>
    </html>
  );
}
