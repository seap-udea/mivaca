import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    icon: '/vaca-esferica.webp',
    shortcut: '/vaca-esferica.webp',
    apple: '/vaca-esferica.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();
  
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
            Desarrollado por Jorge I. Zuluaga, Dr. Z en Cursor ({currentYear})
          </p>
        </footer>
      </body>
    </html>
  );
}
