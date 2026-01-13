'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [vacaName, setVacaName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateVaca = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacaName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/vaca/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: vacaName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create vaca');
      }

      const data = await response.json();
      if (data.vaca) {
        // Store vaqueroId in localStorage
        localStorage.setItem('vaqueroId', data.vaqueroId);
        router.push(`/vaquero/${data.vaca.id}`);
      }
    } catch (error) {
      console.error('Error creating vaca:', error);
      alert('Error al crear la vaca');
    } finally {
      setLoading(false);
    }
  }, [vacaName, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image 
            src="/vaca-esferica.webp" 
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
          Comparte la cuenta del restaurante con tus amigos
        </p>
        
        <form onSubmit={handleCreateVaca} className="space-y-4">
          <div>
            <label htmlFor="vacaName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Vaca
            </label>
            <input
              id="vacaName"
              type="text"
              value={vacaName}
              onChange={(e) => setVacaName(e.target.value)}
              placeholder="Ej: Cena en el restaurante"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Crear nueva vaca"
          >
            {loading ? 'Creando...' : 'Crear Nueva Vaca'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            ¿Eres comensal? Escanea el QR que te compartió el vaquero
          </p>
        </div>
      </div>
    </div>
  );
}
