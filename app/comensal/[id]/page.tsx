'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { Vaca, Product, Payment } from '@/types';
import RestaurantBanner from '@/components/RestaurantBanner';
import { getRandomActiveAds } from '@/lib/restaurantAds';
import { getClientLang, type Lang } from '@/lib/langClient';

export default function ComensalPage() {
  const tutorialUrl = 'https://youtu.be/c7hhAPqXyRY';
  const params = useParams();
  const vacaId = params.id as string;
  const [lang, setLang] = useState<Lang>('es');
  useEffect(() => {
    setLang(getClientLang());
  }, []);
  const isEn = lang === 'en';
  const tr = useCallback((es: string, en: string) => (isEn ? en : es), [isEn]);
  const moneyFormatter = useMemo(() => {
    const locale = isEn ? 'en-GB' : 'es-CO';
    const fractionDigits = isEn ? 2 : 0;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }, [isEn]);
  const formatMoney = useCallback(
    (value: number) => `$${moneyFormatter.format(Number.isFinite(value) ? value : 0)}`,
    [moneyFormatter]
  );
  const [vaca, setVaca] = useState<Vaca | null>(null);
  const [comensalName, setComensalName] = useState('');
  const [comensalId, setComensalId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [products, setProducts] = useState<Array<Omit<Product, 'id' | 'addedAt' | 'comensalId'>>>([
    {
      producto: '',
      valorEnCarta: 0,
      numero: 1,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consignadorName, setConsignadorName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const confettiTriggeredRef = useRef(false);
  const hasPaidCheckedRef = useRef(false);
  const mergeNotifiedRef = useRef(false);
  const restaurantAds = useMemo(() => getRandomActiveAds(1), []);

  const launchConfetti = useCallback(() => {
    if (confettiTriggeredRef.current) return;
    confettiTriggeredRef.current = true;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Launch from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  const fetchVaca = useCallback(async () => {
    try {
      const response = await fetch(`/api/vaca/${vacaId}`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data.vaca) {
        setVaca(data.vaca);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vaca:', error);
      setLoading(false);
    }
  }, [vacaId]);

  const fetchPayments = useCallback(async () => {
    if (!comensalId) return;
    
    try {
      const response = await fetch(`/api/vaca/${vacaId}/payments`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.payments) {
        // Check if this comensal has made a payment
        const comensalPayment = data.payments.find(
          (p: Payment) => p.comensalId === comensalId
        );
        const paid = !!comensalPayment;
        setHasPaid(paid);

        // On initial load, if the comensal already paid, don't celebrate again.
        if (!hasPaidCheckedRef.current) {
          hasPaidCheckedRef.current = true;
          if (paid) {
            confettiTriggeredRef.current = true;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }, [vacaId, comensalId]);

  const fetchComensalInfo = useCallback(async () => {
    if (!comensalId) return;
    try {
      const response = await fetch(`/api/vaca/${vacaId}/comensales`);
      if (!response.ok) return;
      const data = await response.json();
      const found = (data.comensales || []).find(
        (c: { id: string; name: string; mergedIntoId?: string }) => c.id === comensalId
      );
      if (found?.mergedIntoId) {
        // This comensal was merged into another; reset session
        if (!mergeNotifiedRef.current) {
          mergeNotifiedRef.current = true;
          alert(
            tr(
              'Tu cuenta fue fusionada por el vaquero. La sesión se reiniciará.',
              'Your account was merged by the host. The session will restart.'
            )
          );
        }
        localStorage.removeItem(`comensal_${vacaId}`);
        localStorage.removeItem(`comensalName_${vacaId}`);
        setIsJoined(false);
        setComensalId('');
        setHasPaid(false);
        setProducts([{ producto: '', valorEnCarta: 0, numero: 1 }]);
        return;
      }
      if (found?.name) {
        setComensalName(found.name);
        localStorage.setItem(`comensalName_${vacaId}`, found.name);
      }
    } catch (error) {
      console.error('Error fetching comensal info:', error);
    }
  }, [vacaId, comensalId]);

  // Celebrate when payment arrives via polling (e.g., marked by vaquero)
  useEffect(() => {
    if (hasPaid && hasPaidCheckedRef.current && !confettiTriggeredRef.current) {
      launchConfetti();
    }
  }, [hasPaid, launchConfetti]);

  const handleJoin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comensalName.trim()) return;

    try {
      const response = await fetch(`/api/vaca/${vacaId}/comensal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: comensalName }),
      });

      if (!response.ok) {
        throw new Error('Failed to join');
      }

      const data = await response.json();
      if (data.comensal) {
        setComensalId(data.comensal.id);
        setIsJoined(true);
        localStorage.setItem(`comensal_${vacaId}`, data.comensal.id);
        localStorage.setItem(`comensalName_${vacaId}`, comensalName.trim());
      }
    } catch (error) {
      console.error('Error joining:', error);
      alert(tr('Error al unirse a la vaca', 'Error joining the session'));
    }
  }, [vacaId, comensalName, tr]);

  const addProductField = useCallback(() => {
    setProducts((prev) => [...prev, { producto: '', valorEnCarta: 0, numero: 1 }]);
  }, []);

  const updateProduct = useCallback((index: number, field: string, value: string | number) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeProduct = useCallback((index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitProducts = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comensalId) return;

    setSubmitting(true);
    try {
      const promises = products
        .filter((p) => p.producto.trim() && p.valorEnCarta > 0)
        .map((product) =>
          fetch(`/api/vaca/${vacaId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...product,
              comensalId,
              comensalName,
            }),
          })
        );
      
      await Promise.all(promises);
      // Clear form
      setProducts([{ producto: '', valorEnCarta: 0, numero: 1 }]);
    } catch (error) {
      console.error('Error adding products:', error);
      alert(tr('Error al agregar productos', 'Error adding products'));
    } finally {
      setSubmitting(false);
    }
  }, [vacaId, comensalId, comensalName, products, tr]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!comensalId) {
      alert(
        tr(
          'Error: No se encontró tu ID de comensal. Por favor, recarga la página.',
          'Error: your diner ID was not found. Please reload the page.'
        )
      );
      return;
    }
    
    if (!vacaId) {
      alert(
        tr(
          'Error: No se encontró el ID de la vaca. Por favor, recarga la página.',
          'Error: the session ID was not found. Please reload the page.'
        )
      );
      return;
    }
    
    if (!confirm(tr('¿Estás seguro de que quieres eliminar este producto?', 'Are you sure you want to delete this item?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/vaca/${vacaId}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comensalId }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If vaca not found, suggest refreshing
        if (response.status === 404 && responseData.error?.includes('Vaca not found')) {
          alert(
            tr(
              'La sesión parece haber expirado. Por favor, recarga la página y vuelve a intentar.',
              'The session seems to have expired. Please reload the page and try again.'
            )
          );
          // Optionally refresh the page
          window.location.reload();
          return;
        }
        throw new Error(responseData.error || 'Failed to delete product');
      }

      // Refresh vaca data
      await fetchVaca();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error instanceof Error ? error.message : tr('Error al eliminar el producto', 'Error deleting the item'));
    }
  }, [vacaId, comensalId, fetchVaca, tr]);

  const handleSubmitPayment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comensalId) {
      alert(
        tr(
          'Error: No se encontró tu ID de comensal. Por favor, recarga la página.',
          'Error: your diner ID was not found. Please reload the page.'
        )
      );
      return;
    }
    
    if (!consignadorName.trim()) {
      alert(tr('Por favor ingresa el nombre de quién consigna', 'Please enter the payer name'));
      return;
    }
    
    // Improved validation: trim and parse the amount
    const trimmedAmount = paymentAmount.trim();
    if (!trimmedAmount) {
      alert(tr('Por favor ingresa el valor pagado', 'Please enter the paid amount'));
      return;
    }
    
    const amountValue = parseFloat(trimmedAmount);
    if (isNaN(amountValue) || amountValue <= 0 || !isFinite(amountValue)) {
      alert(tr('Por favor ingresa un valor válido mayor a 0', 'Please enter a valid amount greater than 0'));
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await fetch(`/api/vaca/${vacaId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comensalId,
          consignadorName: consignadorName.trim(),
          amount: parseFloat(paymentAmount.trim()),
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || `Error ${response.status}: Failed to submit payment`);
      }

      // Clear form
      setConsignadorName('');
      setPaymentAmount('');
      setHasPaid(true);
      
      // Trigger confetti celebration when payment is successfully registered
      launchConfetti();
      
      fetchVaca();
      fetchPayments();
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert(error instanceof Error ? error.message : tr('Error al registrar el pago', 'Error registering payment'));
    } finally {
      setSubmittingPayment(false);
    }
  }, [vacaId, comensalId, consignadorName, paymentAmount, fetchVaca, fetchPayments, launchConfetti, tr]);

  useEffect(() => {
    // Check if already joined
    const savedComensalId = localStorage.getItem(`comensal_${vacaId}`);
    const savedComensalName = localStorage.getItem(`comensalName_${vacaId}`);
    if (savedComensalId) {
      setComensalId(savedComensalId);
      setIsJoined(true);
    }
    if (savedComensalName && !comensalName) {
      setComensalName(savedComensalName);
    }
    fetchVaca();
  }, [vacaId, fetchVaca, comensalName]);

  useEffect(() => {
    if (!comensalId) return;

    // If we don't have the name (e.g. old sessions), fetch it once
    fetchComensalInfo();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      fetchVaca();
      fetchPayments();
      fetchComensalInfo();
    }, 2000);
    return () => clearInterval(interval);
  }, [comensalId, fetchComensalInfo, fetchVaca, fetchPayments]);

  const myProducts = useMemo(
    () => vaca?.products.filter((p) => p.comensalId === comensalId) ?? [],
    [vaca?.products, comensalId]
  );
  
  const mySubtotal = useMemo(
    () => myProducts.reduce((sum, p) => sum + p.valorEnCarta * p.numero, 0),
    [myProducts]
  );
  
  const tipPercent = useMemo(() => vaca?.tipPercent ?? 10, [vaca?.tipPercent]);
  const tipRate = useMemo(() => tipPercent / 100, [tipPercent]);

  const myTip = useMemo(() => mySubtotal * tipRate, [mySubtotal, tipRate]);
  const myTotal = useMemo(() => mySubtotal + myTip, [mySubtotal, myTip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">{tr('Cargando...', 'Loading...')}</div>
      </div>
    );
  }

  if (!vaca) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600">{tr('Vaca no encontrada', 'Session not found')}</div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-4">
            <Image 
              src="/vaca-esferica-jz.webp" 
              alt="Vaca Esférica" 
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {tr('Unirse a la Vaca', 'Join the session')}
          </h1>
          <p className="text-gray-600 text-center mb-6">
            {vaca.vaqueroName ? `${vaca.name} by ${vaca.vaqueroName}` : vaca.name}
          </p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="comensalName" className="block text-sm font-medium text-gray-700 mb-2">
                {tr('Tu Nombre', 'Your name')}
              </label>
              <input
                id="comensalName"
                type="text"
                value={comensalName}
                onChange={(e) => setComensalName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {tr('Ej. Juan Pérez', 'e.g. Alex Smith')}
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              aria-label="Unirse a la vaca"
            >
              {tr('Unirse', 'Join')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-center mb-4">
            <Image 
              src="/vaca-esferica-jz.webp" 
              alt="Vaca Esférica" 
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {vaca.vaqueroName ? `${vaca.name} by ${vaca.vaqueroName}` : vaca.name}
          </h1>
          <p className="text-gray-600 text-sm text-center">
            {tr('¡A comer se dijo,', "Let's eat,")} {comensalName}!
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href={tutorialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              aria-label={tr(
                'Ver video tutorial en YouTube (se abre en una nueva pestaña)',
                'Watch video tutorial on YouTube (opens in a new tab)'
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
              {tr('Ver video tutorial', 'Watch tutorial')}
            </a>
          </div>
        </div>

        {/* Add Products Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {tr('Agregar Productos', 'Add items')}
          </h2>
          {(hasPaid || vaca?.restaurantBillTotal) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {hasPaid 
                  ? tr('Ya has realizado tu pago. No puedes agregar más productos.', "You've already paid. You can't add more items.")
                  : tr('El valor total de la cuenta ya ha sido establecido. No se pueden agregar más productos.', 'The restaurant bill total has been set. No more items can be added.')}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmitProducts} className={`space-y-4 ${hasPaid || vaca?.restaurantBillTotal ? 'pointer-events-none opacity-50' : ''}`}>
            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  <label className="block text-xs text-gray-600 mb-1">
                    {tr('Producto', 'Item')}
                  </label>
                  <input
                    type="text"
                    value={product.producto}
                    onChange={(e) => updateProduct(index, 'producto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={hasPaid || !!vaca?.restaurantBillTotal}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tr('Ej. Pollo a la plancha', 'e.g. Grilled chicken')}
                  </p>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    {tr('Valor', 'Price')}
                  </label>
                  <input
                    type="number"
                    value={product.valorEnCarta || ''}
                    onChange={(e) => updateProduct(index, 'valorEnCarta', Number(e.target.value))}
                    min="0"
                    step={isEn ? '0.01' : '1'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={hasPaid || !!vaca?.restaurantBillTotal}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isEn
                      ? tr('', 'You may use decimals (e.g., 10.50)')
                      : tr("Sin puntos ni '$'", '')}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    {tr('Cant.', 'Qty.')}
                  </label>
                  <input
                    type="number"
                    value={product.numero}
                    onChange={(e) => updateProduct(index, 'numero', Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={hasPaid || !!vaca?.restaurantBillTotal}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tr('Cantidad', 'Quantity')}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1 opacity-0">
                    {tr('Eliminar', 'Remove')}
                  </label>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      disabled={hasPaid || !!vaca?.restaurantBillTotal}
                      className="w-full py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addProductField}
                disabled={hasPaid || !!vaca?.restaurantBillTotal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={tr('Agregar otro producto', 'Add another item')}
              >
                {tr('+ Agregar Otro', '+ Add another')}
              </button>
              <button
                type="submit"
                disabled={submitting || hasPaid || !!vaca?.restaurantBillTotal}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={tr('Agregar productos', 'Add items')}
              >
                {submitting ? tr('Agregando...', 'Adding...') : tr('Agregar Productos', 'Add items')}
              </button>
            </div>
          </form>
        </div>

        {/* My Products */}
        {myProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Mis Productos
            </h2>
            <div className="space-y-2">
              {myProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{product.producto}</p>
                    <p className="text-sm text-gray-600">
                      {tr('Cantidad', 'Quantity')}: {product.numero}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-800">
                      {formatMoney(product.valorEnCarta * product.numero)}
                    </p>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={hasPaid || !!vaca?.restaurantBillTotal || product.addedByVaquero}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        hasPaid 
                          ? "No puedes eliminar productos después de pagar" 
                          : vaca?.restaurantBillTotal 
                            ? "No puedes eliminar productos después de establecer el valor total de la cuenta"
                            : product.addedByVaquero
                              ? "No puedes eliminar productos agregados por el vaquero"
                              : tr('Eliminar producto', 'Delete item')
                      }
                      aria-label={tr('Eliminar producto', 'Delete item') + ` ${product.producto}`}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{tr('Subtotal', 'Subtotal')}:</span>
                  <span>{formatMoney(mySubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    {tr('Propina', 'Tip')} ({tipPercent}%):
                  </span>
                  <span>{formatMoney(myTip)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>{tr('Mi Total', 'My total')}:</span>
                  <span>{formatMoney(myTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment QR */}
        {vaca.paymentQRCode && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              QR para Pago
            </h2>
            <div className="flex justify-center">
              <Image
                src={vaca.paymentQRCode}
                alt="Payment QR"
                width={300}
                height={300}
                className="max-w-full h-auto rounded-lg"
                unoptimized
              />
            </div>
            <p className="text-sm text-gray-600 text-center mt-4">
              Escanea este QR para realizar el pago
            </p>
          </div>
        )}

        {/* Bre-B Key */}
        {vaca.brebKey && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Llave de <span className="bre-b-text">Bre-B</span>
            </h2>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2 text-center">Usa esta llave para realizar el pago:</p>
              <p className="text-2xl font-bold text-indigo-700 break-all text-center">
                {vaca.brebKey}
              </p>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {(vaca.paymentQRCode || vaca.brebKey) && myTotal > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tr('Registrar Pago', 'Register payment')}
            </h2>
            {hasPaid ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  {tr('✓ Ya has registrado tu pago', '✓ Your payment is registered')}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {tr('Indica que ya realizaste el pago:', 'Confirm that you have paid:')}
                </p>
                <div className="mb-6 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
                  <p className="text-lg font-bold text-indigo-700 text-center">
                    {tr('Tu total a pagar', 'Your total to pay')} {comensalName || tr('Comensal', 'Diner')}: {formatMoney(myTotal)}
                  </p>
                </div>
                <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label htmlFor="consignadorName" className="block text-sm font-medium text-gray-700 mb-2">
                  {tr('Nombre de quién consigna', 'Payer name')}
                </label>
                <input
                  id="consignadorName"
                  type="text"
                  value={consignadorName}
                  onChange={(e) => setConsignadorName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={hasPaid}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {tr('Ej. Juan Pérez', 'e.g. Alex Smith')}
                </p>
              </div>
              <div>
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  {tr('Valor pagado', 'Amount paid')}
                </label>
                <input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  step={isEn ? '0.01' : '1'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={hasPaid}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {tr(
                    "Ingresa el valor en número sin puntos, ni signo '$'",
                    'Enter the amount as a number'
                  )}
                </p>
              </div>
              <button
                type="submit"
                disabled={submittingPayment || hasPaid}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Registrar pago"
              >
                {submittingPayment ? tr('Enviando...', 'Sending...') : tr('Enviar', 'Send')}
              </button>
            </form>
              </>
            )}
          </div>
        )}
        
        {/* Banners manuales de restaurantes */}
        {restaurantAds.length > 0 ? (
          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-2">
              {tr('Restaurantes recomendados', 'Recommended restaurants')}
            </p>
            {restaurantAds.map((ad) => (
              <RestaurantBanner key={ad.id} ad={ad} variant="compact" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

