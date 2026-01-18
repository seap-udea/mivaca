'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RestaurantBanner from '@/components/RestaurantBanner';
import { getRandomActiveAds } from '@/lib/restaurantAds';
import { getClientLang, type Lang } from '@/lib/langClient';

export default function Home() {
  const tutorialUrl = 'https://youtu.be/c7hhAPqXyRY';
  const [vacaName, setVacaName] = useState('');
  const [vaqueroName, setVaqueroName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('es');
  useEffect(() => {
    setLang(getClientLang());
  }, []);
  const isEn = lang === 'en';
  const tr = useCallback((es: string, en: string) => (isEn ? en : es), [isEn]);

  // Banners manuales de restaurantes (alternativa a AdSense)
  const restaurantAds = getRandomActiveAds(1);

  const handleCreateVaca = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacaName.trim() || !vaqueroName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/vaca/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: vacaName, vaqueroName: vaqueroName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create vaca');
      }

      const data = await response.json();
      if (data.vaca) {
        // Store vaqueroId in localStorage
        localStorage.setItem('vaqueroId', data.vaqueroId);
        // Include lang parameter when redirecting
        const currentLang = getClientLang();
        router.push(`/vaquero/${data.vaca.id}?lang=${currentLang}`);
      }
    } catch (error) {
      console.error('Error creating vaca:', error);
      alert(tr('Error al crear la vaca', 'Error creating the vaca'));
    } finally {
      setLoading(false);
    }
  }, [vacaName, vaqueroName, router, tr]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image
            src="/vaca-esferica-jz.webp"
            alt="Vaca Esférica"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Mi Vaca
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {tr(
            'Comparte la cuenta del restaurante con tus amigos',
            'Split the restaurant bill with your friends'
          )}
        </p>

        <div className="mb-6 flex justify-center">
          <a
            href={tutorialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
            aria-label={tr(
              'Ver video tutorial (en español) en YouTube (se abre en una nueva pestaña)',
              'Watch video tutorial (in Spanish) on YouTube (opens in a new tab)'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.26a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {tr('Ver video tutorial', 'Watch tutorial')} <span aria-hidden>🇨🇴</span>
          </a>
        </div>

        <form onSubmit={handleCreateVaca} className="space-y-4">
          <div>
            <label htmlFor="vaqueroName" className="block text-sm font-medium text-gray-700 mb-2">
              {tr('Nombre vaquer@', 'Host name')}
            </label>
            <input
              id="vaqueroName"
              type="text"
              value={vaqueroName}
              onChange={(e) => setVaqueroName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {tr('Ej. Pepita Pérez', 'e.g. Alex Smith')}
            </p>
          </div>
          <div>
            <label htmlFor="vacaName" className="block text-sm font-medium text-gray-700 mb-2">
              {tr('Nombre de la Vaca', 'Session name')}
            </label>
            <input
              id="vacaName"
              type="text"
              value={vacaName}
              onChange={(e) => setVacaName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {tr('Ej. Cena en el restaurante', 'e.g. Dinner at the restaurant')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={tr('Crear nueva vaca', 'Create new session')}
          >
            {loading ? tr('Creando...', 'Creating...') : tr('Crear Nueva Vaca', 'Create new session')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            {tr(
              '¿Eres comensal? Escanea el QR que te compartió el vaquero',
              'Are you a diner? Scan the QR shared by the host'
            )}
          </p>
        </div>
      </div>

      {/* Banners manuales de restaurantes */}
      {restaurantAds.length > 0 ? (
        <div className="mt-6 w-full max-w-md">
          <p className="text-xs text-gray-500 text-center mb-2">
            {tr('Restaurantes recomendados', 'Recommended restaurants')}
          </p>
          {restaurantAds.map((ad) => (
            <RestaurantBanner key={ad.id} ad={ad} variant="compact" className="mb-3" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
