'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import confetti from 'canvas-confetti';
import { v4 as uuidv4 } from 'uuid';
import { Vaca, Product, Comensal, Payment } from '@/types';
import { getClientLang } from '@/lib/langClient';

export default function VaqueroDashboard() {
  const tutorialUrl = 'https://youtu.be/c7hhAPqXyRY';
  const params = useParams();
  const router = useRouter();
  const vacaId = params.id as string;
  const lang = useMemo(() => getClientLang(), []);
  const isEn = lang === 'en';
  const tr = useCallback((es: string, en: string) => (isEn ? en : es), [isEn]);
  // Advanced features are off by default; user can enable them from the UI.
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [vaca, setVaca] = useState<Vaca | null>(null);
  const [total, setTotal] = useState(0);
  const [paymentQR, setPaymentQR] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brebKeyInputRef = useRef<HTMLInputElement>(null);
  const restaurantBillTotalInputRef = useRef<HTMLInputElement>(null);
  const tipPercentInputRef = useRef<HTMLInputElement>(null);
  const [comensales, setComensales] = useState<Comensal[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [distributionType, setDistributionType] = useState<'single' | 'all'>('single');
  const [selectedComensalIds, setSelectedComensalIds] = useState<string[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [brebKey, setBrebKey] = useState('');
  const [brebKeyInput, setBrebKeyInput] = useState('');
  const [submittingBrebKey, setSubmittingBrebKey] = useState(false);
  const [editingBrebKey, setEditingBrebKey] = useState(false);
  const [restaurantBillTotal, setRestaurantBillTotal] = useState('');
  const [submittingRestaurantBill, setSubmittingRestaurantBill] = useState(false);
  const [tipPercentInput, setTipPercentInput] = useState('10');
  const [submittingTipPercent, setSubmittingTipPercent] = useState(false);
  const confettiTriggeredRef = useRef(false);
  const [vaqueroId, setVaqueroId] = useState<string>('');
  const [markingPaidIds, setMarkingPaidIds] = useState<Record<string, boolean>>({});
  const [mergeTargetByComensalId, setMergeTargetByComensalId] = useState<Record<string, string>>({});
  const [mergingIds, setMergingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(`advanced_${vacaId}`);
      if (stored === '1') setAdvancedFeaturesEnabled(true);
      if (stored === '0') setAdvancedFeaturesEnabled(false);
    } catch {
      // ignore
    }
  }, [vacaId]);

  const toggleAdvancedFeatures = useCallback(() => {
    setAdvancedFeaturesEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(`advanced_${vacaId}`, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, [vacaId]);

  const fetchVaca = useCallback(async () => {
    try {
      const response = await fetch(`/api/vaca/${vacaId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.vaca) {
        setVaca(data.vaca);
        setTotal(data.total);
        if (data.vaca.paymentQRCode) {
          setPaymentQR(data.vaca.paymentQRCode);
        }
        if (data.vaca.brebKey) {
          setBrebKey(data.vaca.brebKey);
          // Only update input if not currently focused/editing
          if (!brebKeyInputRef.current || document.activeElement !== brebKeyInputRef.current) {
            setBrebKeyInput(data.vaca.brebKey);
            setEditingBrebKey(false);
          }
        } else {
          setBrebKey('');
          // Only update input if not currently focused/editing
          if (!brebKeyInputRef.current || document.activeElement !== brebKeyInputRef.current) {
            setBrebKeyInput('');
            setEditingBrebKey(true);
          }
        }
        // Only update restaurant bill total input if not currently focused
        if (!restaurantBillTotalInputRef.current || document.activeElement !== restaurantBillTotalInputRef.current) {
          if (data.vaca.restaurantBillTotal) {
            setRestaurantBillTotal(data.vaca.restaurantBillTotal.toString());
          } else {
            setRestaurantBillTotal('');
          }
        }

        // Only update tip percent input if not currently focused
        if (!tipPercentInputRef.current || document.activeElement !== tipPercentInputRef.current) {
          const currentTipPercent =
            data.vaca.tipPercent === undefined || data.vaca.tipPercent === null
              ? 10
              : data.vaca.tipPercent;
          setTipPercentInput(String(currentTipPercent));
        }
      }
    } catch (error) {
      console.error('Error fetching vaca:', error);
    } finally {
      setLoading(false);
    }
  }, [vacaId]);

  const fetchComensales = useCallback(async () => {
    try {
      const response = await fetch(`/api/vaca/${vacaId}/comensales`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.comensales) {
        setComensales(data.comensales);
      }
    } catch (error) {
      console.error('Error fetching comensales:', error);
    }
  }, [vacaId]);

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch(`/api/vaca/${vacaId}/payments`);
      if (!response.ok) return;
      const data = await response.json();
      setPayments(data.payments || []);
      setTotalCollected(data.totalCollected || 0);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      setTotalCollected(0);
    }
  }, [vacaId]);

  const copyToClipboard = useCallback(async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = joinUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [joinUrl]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/comensal/${vacaId}`);
    }
  }, [vacaId]);

  useEffect(() => {
    fetchVaca();
    fetchComensales();
    fetchPayments();
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      fetchVaca();
      fetchComensales();
      fetchPayments();
    }, 2000);
    return () => clearInterval(interval);
  }, [vacaId, fetchVaca, fetchComensales, fetchPayments]);

  // Trigger confetti when total collected equals total expected
  useEffect(() => {
    if (total > 0 && totalCollected > 0 && Math.round(totalCollected) === Math.round(total) && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      
      // Launch confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Launch from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
    
    // Reset trigger if totals don't match anymore
    if (Math.round(totalCollected) !== Math.round(total)) {
      confettiTriggeredRef.current = false;
    }
  }, [total, totalCollected]);

  const handlePaymentQRUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch(`/api/vaca/${vacaId}/payment-qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCode: base64String }),
        });
        
        if (response.ok) {
          setPaymentQR(base64String);
        } else {
          throw new Error('Failed to upload QR');
        }
      } catch (error) {
        console.error('Error uploading QR:', error);
        alert(tr('Error al subir el QR', 'Error uploading the QR'));
      }
    };
    reader.readAsDataURL(file);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [vacaId]);

  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBreBKeySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brebKeyInput.trim()) {
      alert(tr('Por favor ingresa la llave de Bre-B', 'Please enter the Bre-B key'));
      return;
    }

    setSubmittingBrebKey(true);
    try {
      const response = await fetch(`/api/vaca/${vacaId}/breb-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brebKey: brebKeyInput.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to save BreB key');
      }

      setBrebKey(brebKeyInput.trim());
      setEditingBrebKey(false);
    } catch (error) {
      console.error('Error saving Bre-B key:', error);
      alert(tr('Error al guardar la llave de Bre-B', 'Error saving the Bre-B key'));
    } finally {
      setSubmittingBrebKey(false);
    }
  }, [vacaId, brebKeyInput]);

  const handleChangeBreBKey = useCallback(() => {
    setEditingBrebKey(true);
    setBrebKeyInput(brebKey);
  }, [brebKey]);

  const paidComensalIds = useMemo(
    () => new Set(payments.map((p) => p.comensalId)),
    [payments]
  );
  const unpaidComensalesCount = useMemo(
    () => comensales.filter((c) => !paidComensalIds.has(c.id)).length,
    [comensales, paidComensalIds]
  );

  const handleRestaurantBillSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = restaurantBillTotal.trim();
    if (!trimmedValue) {
      alert(tr('Por favor ingresa el valor total de la cuenta del restaurante', 'Please enter the restaurant bill total'));
      return;
    }
    
    const value = parseFloat(trimmedValue);
    if (isNaN(value) || value <= 0 || !isFinite(value)) {
      alert(tr('Por favor ingresa un valor válido mayor a 0', 'Please enter a valid value greater than 0'));
      return;
    }

    setSubmittingRestaurantBill(true);
    try {
      const response = await fetch(`/api/vaca/${vacaId}/restaurant-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantBillTotal: value,
          distributeDifference: unpaidComensalesCount > 0, // Distribuir solo entre quienes no han pagado
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save restaurant bill total');
      }

      const data = await response.json();
      alert(tr('Valor de cuenta del restaurante guardado y diferencia distribuida exitosamente', 'Restaurant bill saved and difference distributed successfully'));
      // Clear the input field
      setRestaurantBillTotal('');
      await fetchVaca();
    } catch (error) {
      console.error('Error saving restaurant bill:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el valor de la cuenta del restaurante');
    } finally {
      setSubmittingRestaurantBill(false);
    }
  }, [vacaId, restaurantBillTotal, unpaidComensalesCount, fetchVaca]);

  const handleMarkTransferred = useCallback(
    async (comensal: Comensal, amount: number) => {
      if (!vacaId) return;

      const roundedAmount = Math.round(amount);
      if (!isFinite(roundedAmount) || roundedAmount <= 0) {
        alert(tr('El total del comensal debe ser mayor a 0 para registrar el pago', 'The diner total must be greater than 0 to register payment'));
        return;
      }

      if (!confirm(`¿Marcar como pagado a "${comensal.name}" por $${roundedAmount.toLocaleString('es-CO')}?`)) {
        return;
      }

      setMarkingPaidIds((prev) => ({ ...prev, [comensal.id]: true }));
      try {
        const response = await fetch(`/api/vaca/${vacaId}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comensalId: comensal.id,
            consignadorName: comensal.name,
            amount: roundedAmount,
          }),
        });

        const responseData = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(responseData.error || 'No se pudo registrar el pago');
        }

        await fetchPayments();
        await fetchVaca();
      } catch (error) {
        console.error('Error marking transferred:', error);
        alert(error instanceof Error ? error.message : 'Error al registrar el pago');
      } finally {
        setMarkingPaidIds((prev) => ({ ...prev, [comensal.id]: false }));
      }
    },
    [vacaId, fetchPayments, fetchVaca]
  );

  const handleMergeComensales = useCallback(
    async (fromComensalId: string) => {
      const toComensalId = mergeTargetByComensalId[fromComensalId];
      if (!toComensalId) {
        alert(tr('Selecciona con quién fusionar la cuenta', 'Select who to merge this account into'));
        return;
      }

      const from = comensales.find((c) => c.id === fromComensalId);
      const to = comensales.find((c) => c.id === toComensalId);
      if (!from || !to) {
        alert(tr('Comensal no encontrado', 'Diner not found'));
        return;
      }

      if (!confirm(`¿Fusionar la cuenta de "${from.name}" con "${to.name}"?\n\nLos productos de "${from.name}" pasarán a "${to.name}" y la sesión del comensal fusionado se reiniciará.`)) {
        return;
      }

      setMergingIds((prev) => ({ ...prev, [fromComensalId]: true }));
      try {
        const response = await fetch(`/api/vaca/${vacaId}/merge-comensal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromComensalId, toComensalId }),
        });

        const responseData = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(responseData.error || 'No se pudo fusionar la cuenta');
        }

        // Clear selection and refresh
        setMergeTargetByComensalId((prev) => ({ ...prev, [fromComensalId]: '' }));
        await fetchVaca();
        await fetchComensales();
        await fetchPayments();
      } catch (error) {
        console.error('Error merging comensales:', error);
        alert(error instanceof Error ? error.message : 'Error al fusionar la cuenta');
      } finally {
        setMergingIds((prev) => ({ ...prev, [fromComensalId]: false }));
      }
    },
    [vacaId, mergeTargetByComensalId, comensales, fetchVaca, fetchComensales, fetchPayments]
  );

  const handleTipPercentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any comensal has paid
    if (payments.length > 0) {
      alert(tr('No se puede modificar el porcentaje de propina después de que algún comensal haya pagado', 'You cannot change the tip percentage after any diner has paid'));
      return;
    }

    const trimmed = tipPercentInput.trim();
    if (trimmed === '') {
      alert(tr('Por favor ingresa un porcentaje de propina', 'Please enter a tip percentage'));
      return;
    }

    const value = Number(trimmed);
    if (!isFinite(value) || value < 0 || value > 100) {
      alert(tr('Por favor ingresa un porcentaje válido entre 0 y 100', 'Please enter a valid percentage between 0 and 100'));
      return;
    }

    setSubmittingTipPercent(true);
    try {
      const response = await fetch(`/api/vaca/${vacaId}/tip-percent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipPercent: value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save tip percent');
      }

      await fetchVaca();
    } catch (error) {
      console.error('Error saving tip percent:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el porcentaje de propina');
    } finally {
      setSubmittingTipPercent(false);
    }
  }, [vacaId, tipPercentInput, payments, fetchVaca]);

  const toggleSelectedComensalId = useCallback((id: string) => {
    setSelectedComensalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const subtotal = useMemo(
    () => vaca?.products.reduce((sum, p) => sum + p.valorEnCarta * p.numero, 0) ?? 0,
    [vaca?.products]
  );
  const tipPercent = useMemo(() => vaca?.tipPercent ?? 10, [vaca?.tipPercent]);
  const tipRate = useMemo(() => tipPercent / 100, [tipPercent]);
  const tipFactor = useMemo(() => 1 + tipRate, [tipRate]);
  const tip = useMemo(() => subtotal * tipRate, [subtotal, tipRate]);

  const round1 = useCallback((n: number) => Math.round(n * 10) / 10, []);
  const totalRounded = useMemo(() => round1(total), [total, round1]);
  const totalCollectedRounded = useMemo(
    () => round1(totalCollected),
    [totalCollected, round1]
  );

  const handleAddProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      alert(tr('Por favor ingresa el nombre del producto', 'Please enter the item name'));
      return;
    }
    
    const trimmedValue = productValue.trim();
    if (!trimmedValue) {
      alert(tr('Por favor ingresa el valor del producto', 'Please enter the item price'));
      return;
    }
    
    const value = parseFloat(trimmedValue);
    if (isNaN(value) || value <= 0 || !isFinite(value)) {
      alert(tr('Por favor ingresa un valor válido mayor a 0', 'Please enter a valid value greater than 0'));
      return;
    }
    
    if (distributionType === 'single' && selectedComensalIds.length === 0) {
      alert(tr('Por favor selecciona uno o más comensales', 'Please select one or more diners'));
      return;
    }
    
    if (distributionType === 'all' && comensales.length === 0) {
      alert(tr('No hay comensales registrados para distribuir el producto', 'There are no diners to distribute this item'));
      return;
    }

    setSubmittingProduct(true);
    try {
      const targets =
        distributionType === 'all'
          ? comensales
          : comensales.filter((c) => selectedComensalIds.includes(c.id));

      if (targets.length === 0) {
        throw new Error('No hay comensales seleccionados');
      }

      if (targets.length === 1) {
        // Add product to a single comensal (no group)
        const only = targets[0];
        const response = await fetch(`/api/vaca/${vacaId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto: productName.trim(),
            valorEnCarta: value,
            numero: productQuantity,
            comensalId: only.id,
            comensalName: only.name || 'Comensal',
            addedByVaquero: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add product');
        }
      } else {
        // Distribute product among selected comensales
        const valuePerComensal = value / targets.length;
        const distributionGroupId = uuidv4();
        const promises = targets.map((comensal) =>
          fetch(`/api/vaca/${vacaId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              producto: productName.trim(),
              valorEnCarta: valuePerComensal,
              numero: productQuantity,
              comensalId: comensal.id,
              comensalName: comensal.name,
              addedByVaquero: true,
              distributionGroupId,
            }),
          })
        );

        const responses = await Promise.all(promises);
        const failed = responses.some((r) => !r.ok);
        if (failed) {
          throw new Error('Failed to add product to some comensales');
        }
      }

      // Clear form
      setProductName('');
      setProductValue('');
      setProductQuantity(1);
      setSelectedComensalIds([]);
      
      // Refresh data
      await fetchVaca();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(tr('Error al agregar el producto', 'Error adding the item'));
    } finally {
      setSubmittingProduct(false);
    }
  }, [vacaId, productName, productValue, productQuantity, distributionType, selectedComensalIds, comensales, fetchVaca]);

  const handleDeleteProduct = useCallback(async (productId: string, comensalId: string, distributionGroupId?: string) => {
    if (!vacaId) {
      alert(tr('Error: No se encontró el ID de la vaca. Por favor, recarga la página.', 'Error: session ID not found. Please reload the page.'));
      return;
    }
    
    // If it's a distributed product, confirm deletion of all related products
    const confirmMessage = distributionGroupId 
      ? '¿Estás seguro de que quieres eliminar este producto de todas las cuentas de los comensales?'
      : '¿Estás seguro de que quieres eliminar este producto?';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // If it's a distributed product, delete all products in the group
      if (distributionGroupId && vaca) {
        const productsInGroup = vaca.products.filter(p => p.distributionGroupId === distributionGroupId);
        const deletePromises = productsInGroup.map(product =>
          fetch(`/api/vaca/${vacaId}/products/${product.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comensalId: product.comensalId }),
          })
        );
        
        const responses = await Promise.all(deletePromises);
        const failed = responses.some(r => !r.ok);
        
        if (failed) {
          throw new Error('Error al eliminar algunos productos del grupo');
        }
      } else {
        // Delete single product
        const response = await fetch(`/api/vaca/${vacaId}/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comensalId }),
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 404 && responseData.error?.includes('Vaca not found')) {
            alert(tr('La sesión parece haber expirado. Por favor, recarga la página y vuelve a intentar.', 'The session seems to have expired. Please reload the page and try again.'));
            window.location.reload();
            return;
          }
          throw new Error(responseData.error || 'Failed to delete product');
        }
      }

      await fetchVaca();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el producto');
    }
  }, [vacaId, vaca, fetchVaca]);

  // Group vaquero products by distributionGroupId
  const groupedVaqueroProducts = useMemo(() => {
    if (!vaca) return { groups: [], singleProducts: [] };
    
    const vaqueroProducts = vaca.products.filter(p => p.addedByVaquero);
    const groups = new Map<string, Product[]>();
    const singleProducts: Product[] = [];
    
    vaqueroProducts.forEach(product => {
      if (product.distributionGroupId) {
        const group = groups.get(product.distributionGroupId) || [];
        group.push(product);
        groups.set(product.distributionGroupId, group);
      } else {
        singleProducts.push(product);
      }
    });
    
    return { groups: Array.from(groups.values()), singleProducts };
  }, [vaca]);

  const generatePDF = useCallback(() => {
    if (!vaca) return;

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Informe de la Vaca', 14, 20);
    
    // Información de la vaca
    doc.setFontSize(12);
    doc.text(`Nombre: ${vaca.name}`, 14, 30);
    doc.text(`Fecha: ${new Date(vaca.createdAt).toLocaleString('es-CO')}`, 14, 37);
    
    let yPosition = 47;

    // Tabla de productos
    if (vaca.products.length > 0) {
      doc.setFontSize(14);
      doc.text('Productos', 14, yPosition);
      yPosition += 7;

      const productsData = vaca.products.map((p) => [
        p.producto,
        p.comensalName || 'N/A',
        p.numero.toString(),
        `$${Math.round(p.valorEnCarta).toLocaleString('es-CO')}`,
        `$${Math.round(p.valorEnCarta * p.numero).toLocaleString('es-CO')}`,
      ]);

      autoTable(doc, {
        head: [['Producto', 'Comensal', 'Cantidad', 'Precio Unitario', 'Total']],
        body: productsData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] }, // indigo-600
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Totales
    doc.setFontSize(12);
    doc.text(`Subtotal: $${Math.round(subtotal).toLocaleString('es-CO')}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Propina (${tipPercent}%): $${Math.round(tip).toLocaleString('es-CO')}`, 14, yPosition);
    yPosition += 7;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${Math.round(total).toLocaleString('es-CO')}`, 14, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 12;

    // Tabla de comensales
    if (comensales.length > 0) {
      doc.setFontSize(14);
      doc.text('Comensales', 14, yPosition);
      yPosition += 7;

      const comensalesData = comensales.map((comensal) => {
        const comensalProducts = vaca.products.filter((p) => p.comensalId === comensal.id);
        const comensalSubtotal = comensalProducts.reduce(
          (sum, p) => sum + p.valorEnCarta * p.numero,
          0
        );
        const comensalTip = comensalSubtotal * tipRate;
        const comensalTotal = comensalSubtotal + comensalTip;
        const hasPaid = payments.some((p) => p.comensalId === comensal.id);
        
        return [
          comensal.name,
          `$${Math.round(comensalTotal).toLocaleString('es-CO')}`,
          hasPaid ? 'Pagado' : 'Pendiente',
        ];
      });

      autoTable(doc, {
        head: [['Comensal', 'Total a Pagar', 'Estado']],
        body: comensalesData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] },
        didParseCell: (data: any) => {
          if (data.row.index >= 0 && data.column.index === 2) {
            const cellValue = data.cell.text[0];
            if (cellValue === 'Pagado') {
              data.cell.styles.textColor = [34, 197, 94]; // green-600
            } else {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            }
          }
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Tabla de pagos
    if (payments.length > 0) {
      doc.setFontSize(14);
      doc.text('Pagos Registrados', 14, yPosition);
      yPosition += 7;

      const paymentsData = payments.map((p) => {
        const comensal = comensales.find((c) => c.id === p.comensalId);
        return [
          comensal?.name || 'N/A',
          p.consignadorName,
          `$${Math.round(p.amount).toLocaleString('es-CO')}`,
          new Date(p.paidAt).toLocaleString('es-CO'),
        ];
      });

      autoTable(doc, {
        head: [['Comensal', 'Consignador', 'Monto', 'Fecha']],
        body: paymentsData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Resumen de pagos
    doc.setFontSize(12);
    doc.text(`Total Recaudado: $${Math.round(totalCollected).toLocaleString('es-CO')}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Total Esperado: $${Math.round(total).toLocaleString('es-CO')}`, 14, yPosition);
    yPosition += 7;
    
    if (totalCollected >= total) {
      doc.setTextColor(34, 197, 94); // green-600
      doc.text('✓ Todos los pagos han sido recibidos', 14, yPosition);
    } else {
      doc.setTextColor(220, 38, 38); // red-600
      const pending = total - totalCollected;
      doc.text(`Pendiente: $${Math.round(pending).toLocaleString('es-CO')}`, 14, yPosition);
    }
    doc.setTextColor(0, 0, 0); // Reset to black

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleString('es-CO')}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Guardar PDF
    doc.save(`Informe_Vaca_${vaca.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [vaca, subtotal, tip, tipPercent, tipRate, total, comensales, payments, totalCollected]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">{vaca.name}</h1>
          <p className="text-gray-600 text-sm text-center">
            {tr('Creada el', 'Created on')} {new Date(vaca.createdAt).toLocaleString(isEn ? 'en-GB' : 'es-CO')}
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex flex-col items-center gap-2">
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
              <button
                type="button"
                onClick={toggleAdvancedFeatures}
                className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {advancedFeaturesEnabled
                  ? tr('Desactivar características avanzadas', 'Disable advanced features')
                  : tr('Activar caracteristicas avanzadas', 'Enable advanced features')}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code for Comensales */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {tr('QR para Comensales', 'QR for diners')}
          </h2>
          <div className="flex justify-center mb-4">
            {joinUrl && (
              <QRCodeSVG value={joinUrl} size={200} />
            )}
          </div>
          <p className="text-sm text-gray-600 text-center">
            {tr('Comparte este QR para que tus amigos se unan', 'Share this QR so your friends can join')}
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 break-all flex-1">{joinUrl}</p>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                aria-label={tr('Copiar enlace para comensales', 'Copy link for diners')}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {tr('Copiado', 'Copied')}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {tr('Copiar', 'Copy')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tip percent (advanced) */}
        {advancedFeaturesEnabled && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Propina
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Define el porcentaje de propina que usará la app para calcular los totales.
              Valor por defecto: <b>10%</b>.
            </p>

            {payments.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No se puede modificar la propina después de que algún comensal haya pagado.
                </p>
              </div>
            )}

            <form onSubmit={handleTipPercentSubmit} className="space-y-3">
              <div>
                <label htmlFor="tipPercent" className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de propina
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    ref={tipPercentInputRef}
                    id="tipPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={tipPercentInput}
                    onChange={(e) => setTipPercentInput(e.target.value)}
                    disabled={payments.length > 0 || submittingTipPercent}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-700">%</span>
                  <span className="text-sm text-gray-500">
                    (actual: <b>{tipPercent}%</b>)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={payments.length > 0 || submittingTipPercent}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingTipPercent ? 'Guardando...' : 'Guardar porcentaje de propina'}
              </button>
            </form>
          </div>
        )}

        {/* Products List */}
        {(
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Productos Agregados por Comensales
            </h2>
            {vaca.products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aún no hay productos agregados
              </p>
            ) : (
              <div className="space-y-3">
                {vaca.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{product.producto}</p>
                      <p className="text-sm text-gray-600">
                        {product.comensalName || 'Comensal'} • Cantidad: {product.numero}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      ${Math.round(product.valorEnCarta * product.numero).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Product Form (advanced) */}
        {advancedFeaturesEnabled && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tr('Agregar Producto de Vaquero (colectivo)', 'Add host item (shared)')}
            </h2>
            {comensales.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Para usar esta sección, primero debe unirse al menos un comensal (usa el QR de arriba).
                </p>
              </div>
            )}
            {vaca?.restaurantBillTotal && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  El valor total de la cuenta ya ha sido establecido. No se pueden agregar más productos.
                </p>
              </div>
            )}
            <form
              onSubmit={handleAddProduct}
              className={`space-y-4 ${
                vaca?.restaurantBillTotal || comensales.length === 0
                  ? 'pointer-events-none opacity-50'
                  : ''
              }`}
            >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!vaca?.restaurantBillTotal}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ej. Botella de vino
                  </p>
                </div>
                <div>
                  <label htmlFor="productValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Valor
                  </label>
                  <input
                    id="productValue"
                    type="number"
                    value={productValue}
                    onChange={(e) => setProductValue(e.target.value)}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!vaca?.restaurantBillTotal}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sin puntos ni '$'
                  </p>
                </div>
                <div>
                  <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    id="productQuantity"
                    type="number"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!vaca?.restaurantBillTotal}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cantidad
                  </p>
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distribución
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="distributionType"
                    value="single"
                    checked={distributionType === 'single'}
                    onChange={(e) => {
                      setDistributionType('single');
                      setSelectedComensalIds([]);
                    }}
                    disabled={!!vaca?.restaurantBillTotal}
                    className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">Cargar a comensales elegidos</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="distributionType"
                    value="all"
                    checked={distributionType === 'all'}
                    onChange={(e) => {
                      setDistributionType('all');
                      setSelectedComensalIds([]);
                    }}
                    disabled={!!vaca?.restaurantBillTotal}
                    className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">Distribuir entre todos</span>
                </label>
              </div>
              
              {distributionType === 'single' && comensales.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar comensales
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {comensales.map((comensal) => {
                      const checked = selectedComensalIds.includes(comensal.id);
                      return (
                        <label
                          key={comensal.id}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer select-none ${
                            checked
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                              : 'bg-white border-gray-200 text-gray-700'
                          } ${vaca?.restaurantBillTotal ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectedComensalId(comensal.id)}
                            disabled={!!vaca?.restaurantBillTotal}
                            className="h-4 w-4"
                          />
                          <span>{comensal.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {selectedComensalIds.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Marca uno o más comensales para repartir el producto entre ellos.
                    </p>
                  )}
                </div>
              )}

              {distributionType === 'single' &&
                comensales.length > 0 &&
                selectedComensalIds.length > 0 &&
                parseFloat(productValue || '0') > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      El valor se dividirá equitativamente entre {selectedComensalIds.length}{' '}
                      comensal{selectedComensalIds.length !== 1 ? 'es' : ''}. Cada uno pagará:
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
                      <li>
                        Subtotal: $
                        {(
                          (parseFloat(productValue || '0') / selectedComensalIds.length) *
                          productQuantity
                        ).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </li>
                      <li>
                        Propina ({tipPercent}%): $
                        {(
                          ((parseFloat(productValue || '0') / selectedComensalIds.length) *
                            productQuantity) *
                          tipRate
                        ).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </li>
                      <li className="font-semibold">
                        Total: $
                        {(
                          ((parseFloat(productValue || '0') / selectedComensalIds.length) *
                            productQuantity) *
                          tipFactor
                        ).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </li>
                    </ul>
                  </div>
                )}
              
              {distributionType === 'all' && comensales.length > 0 && parseFloat(productValue || '0') > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    El valor se dividirá equitativamente entre {comensales.length} comensal{comensales.length !== 1 ? 'es' : ''}. 
                    Cada uno pagará:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
                    <li>Subtotal: ${((parseFloat(productValue || '0') / comensales.length) * productQuantity).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</li>
                    <li>Propina ({tipPercent}%): ${(((parseFloat(productValue || '0') / comensales.length) * productQuantity) * tipRate).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</li>
                    <li className="font-semibold">Total: ${(((parseFloat(productValue || '0') / comensales.length) * productQuantity) * tipFactor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</li>
                  </ul>
                </div>
              )}
              
              {distributionType === 'all' && comensales.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No hay comensales registrados. Primero deben unirse comensales a la vaca.
                  </p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={submittingProduct || !!vaca?.restaurantBillTotal}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Agregar producto"
            >
              {submittingProduct ? 'Agregando...' : 'Agregar Producto'}
            </button>
          </form>
          </div>
        )}

        {/* Restaurant Bill Total Form - Will be moved later */}
        {false && comensales.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Valor Total de Cuenta
            </h2>
            {payments.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Este formulario está deshabilitado porque algunos comensales ya han realizado pagos.
                </p>
              </div>
            )}
            <form onSubmit={handleRestaurantBillSubmit} className="space-y-4">
            <div>
              <label htmlFor="restaurantBillTotal" className="block text-sm font-medium text-gray-700 mb-2">
                Valor total de la cuenta del restaurante
              </label>
              <input
                ref={restaurantBillTotalInputRef}
                id="restaurantBillTotal"
                type="number"
                value={restaurantBillTotal}
                onChange={(e) => setRestaurantBillTotal(e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ej: 150000"
                disabled={payments.length > 0 || submittingRestaurantBill || !!vaca?.restaurantBillTotal || comensales.length === 0}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el valor total de la cuenta entregada por el restaurante. La diferencia con el total calculado se distribuirá equitativamente entre los comensales.
              </p>
              {vaca?.restaurantBillTotal && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  Valor actual: ${Math.round(vaca?.restaurantBillTotal || 0).toLocaleString('es-CO')}
                </p>
              )}
              {restaurantBillTotal && parseFloat(restaurantBillTotal) > 0 && subtotal > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Diferencia calculada (sin propina):</strong> ${Math.round((parseFloat(restaurantBillTotal) / tipFactor) - subtotal).toLocaleString('es-CO')}
                    {comensales.length > 0 && (
                      <> ({comensales.length} comensal{comensales.length !== 1 ? 'es' : ''} × ${Math.round(((parseFloat(restaurantBillTotal) / tipFactor) - subtotal) / comensales.length).toLocaleString('es-CO')} cada uno)</>
                    )}
                    <br />
                    <span className="text-xs">La propina ({tipPercent}%) se agregará automáticamente al calcular los totales</span>
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={payments.length > 0 || submittingRestaurantBill || !!vaca?.restaurantBillTotal}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                payments.length > 0 
                  ? 'No se puede modificar después de que algún comensal haya pagado' 
                  : vaca?.restaurantBillTotal 
                    ? 'Ya se ha guardado y distribuido el valor de la cuenta del restaurante' 
                    : ''
              }
            >
              {submittingRestaurantBill ? 'Guardando...' : vaca?.restaurantBillTotal ? 'Ya Distribuido' : comensales.length > 0 ? 'Guardar y Distribuir Diferencia' : 'Guardar Valor (sin distribuir)'}
            </button>
            {vaca?.restaurantBillTotal && (
              <p className="text-xs text-green-600 mt-2">
                ✓ El valor de la cuenta del restaurante ya ha sido guardado y la diferencia distribuida.
              </p>
            )}
            {payments.length > 0 && (
              <p className="text-xs text-red-600 mt-2">
                ⚠ El formulario está deshabilitado porque algunos comensales ya han realizado pagos.
              </p>
            )}
          </form>
          </div>
        )}

        {/* My Products - Products Added by Vaquero (advanced) */}
        {advancedFeaturesEnabled && (() => {
          const allGroupedItems = [
            ...groupedVaqueroProducts.groups.map(group => ({ type: 'group' as const, products: group })),
            ...groupedVaqueroProducts.singleProducts.map(product => ({ type: 'single' as const, product }))
          ];
          
          return (
            <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
               {tr('Productos Agregados por el Vaquero (colectivos)', 'Host-added items (shared)')}
              </h2>
              {comensales.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aquí aparecerán los productos colectivos del vaquero (después de que se unan comensales).
                </p>
              )}
              {allGroupedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aún no has agregado productos
                </p>
              ) : (
                <div className="space-y-3">
                  {allGroupedItems.map((item) => {
                    if (item.type === 'group') {
                      const group = item.products;
                      const firstProduct = group[0];
                      const totalValue = group.reduce((sum, p) => sum + (p.valorEnCarta * p.numero), 0);
                      const totalQuantity = firstProduct.numero; // Same quantity for all in group
                      
                      return (
                        <div
                          key={`group-${firstProduct.distributionGroupId}`}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{firstProduct.producto}</p>
                            <p className="text-sm text-gray-600">
                              Distribuido entre {group.length} comensal{group.length !== 1 ? 'es' : ''} • Cantidad: {totalQuantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-semibold text-gray-800">
                              ${Math.round(totalValue).toLocaleString('es-CO')}
                            </p>
                            <button
                              onClick={() => handleDeleteProduct(firstProduct.id, firstProduct.comensalId, firstProduct.distributionGroupId)}
                              disabled={!!vaca?.restaurantBillTotal}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={vaca?.restaurantBillTotal ? "No puedes eliminar productos después de establecer el valor total de la cuenta" : "Eliminar producto de todas las cuentas"}
                              aria-label={`Eliminar producto ${firstProduct.producto} de todas las cuentas`}
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
                      );
                    } else {
                      const product = item.product;
                      return (
                        <div
                          key={product.id}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.producto}</p>
                            <p className="text-sm text-gray-600">
                              {product.comensalName || 'Comensal'} • Cantidad: {product.numero}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-semibold text-gray-800">
                              ${Math.round(product.valorEnCarta * product.numero).toLocaleString('es-CO')}
                            </p>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.comensalId)}
                              disabled={!!vaca?.restaurantBillTotal}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={vaca?.restaurantBillTotal ? "No puedes eliminar productos después de establecer el valor total de la cuenta" : "Eliminar producto"}
                              aria-label={`Eliminar producto ${product.producto}`}
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
                      );
                    }
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Total */}
        {(
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tr('Totales en app', 'Totals in app')}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${Math.round(subtotal).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Propina ({tipPercent}%):</span>
                <span>${Math.round(tip).toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${Math.round(total).toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Bill Total Form - Cerrar cuenta de la vaca */}
        {(comensales.length > 0 && vaca.products.length > 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Cerrar cuenta de la vaca
            </h2>
            {payments.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Nota: si algunos comensales ya pagaron, cualquier diferencia se distribuirá entre quienes{" "}
                  <b>aún no han transferido</b>.
                </p>
              </div>
            )}
            <form onSubmit={handleRestaurantBillSubmit} className="space-y-4">
            <div>
              <label htmlFor="restaurantBillTotal" className="block text-sm font-medium text-gray-700 mb-2">
                Valor total de la cuenta del restaurante
              </label>
              <input
                ref={restaurantBillTotalInputRef}
                id="restaurantBillTotal"
                type="number"
                value={restaurantBillTotal}
                onChange={(e) => setRestaurantBillTotal(e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ej: 150000"
                disabled={submittingRestaurantBill || !!vaca?.restaurantBillTotal}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el valor total de la cuenta entregada por el restaurante. La diferencia con el total calculado se distribuirá equitativamente entre los comensales.
              </p>
              {vaca?.restaurantBillTotal && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  Valor actual: ${Math.round(vaca?.restaurantBillTotal || 0).toLocaleString('es-CO')}
                </p>
              )}
              {restaurantBillTotal && parseFloat(restaurantBillTotal) > 0 && subtotal > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Diferencia calculada (sin propina):</strong> ${Math.round((parseFloat(restaurantBillTotal) / tipFactor) - subtotal).toLocaleString('es-CO')}
                    {unpaidComensalesCount > 0 && (
                      <> ({unpaidComensalesCount} comensal{unpaidComensalesCount !== 1 ? 'es' : ''} × ${Math.round(((parseFloat(restaurantBillTotal) / tipFactor) - subtotal) / unpaidComensalesCount).toLocaleString('es-CO')} cada uno)</>
                    )}
                    <br />
                    <span className="text-xs">La propina ({tipPercent}%) se agregará automáticamente al calcular los totales</span>
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submittingRestaurantBill || !!vaca?.restaurantBillTotal}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                vaca?.restaurantBillTotal 
                    ? 'Ya se ha guardado y distribuido el valor de la cuenta del restaurante' 
                    : ''
              }
            >
              {submittingRestaurantBill ? 'Guardando...' : vaca?.restaurantBillTotal ? 'Ya Distribuido' : comensales.length > 0 ? 'Guardar y Distribuir Diferencia' : 'Guardar Valor (sin distribuir)'}
            </button>
            {vaca?.restaurantBillTotal && (
              <p className="text-xs text-green-600 mt-2">
                ✓ El valor de la cuenta del restaurante ya ha sido guardado y la diferencia distribuida.
              </p>
            )}
          </form>
          </div>
        )}

        {/* Comensales List */}
        {(
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tr('Comensales Registrados', 'Registered diners')}
            </h2>
            <div className="space-y-3">
              {comensales.filter((c) => !c.mergedIntoId).length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  Aún no hay comensales registrados. Comparte el QR para que se unan.
                </p>
              ) : (
              comensales.filter((c) => !c.mergedIntoId).map((comensal) => {
                // Calculate total for this comensal
                const comensalProducts = vaca.products.filter(
                  (p) => p.comensalId === comensal.id
                );
                const comensalSubtotal = comensalProducts.reduce(
                  (sum, p) => sum + p.valorEnCarta * p.numero,
                  0
                );
                const comensalTip = comensalSubtotal * tipRate;
                const comensalTotal = comensalSubtotal + comensalTip;

                // Check if comensal has paid
                const comensalPayment = payments.find(
                  (p) => p.comensalId === comensal.id
                );
                const hasPaid = !!comensalPayment;

                return (
                  <div
                    key={comensal.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{comensal.name}</p>
                      <p className="text-sm text-gray-600">
                        Se unió el {new Date(comensal.joinedAt as string | Date).toLocaleString('es-CO')}
                      </p>
                      {advancedFeaturesEnabled && (
                        <>
                          <div className="mt-2">
                            <div className="flex flex-nowrap gap-2 items-center">
                              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                Fusionar con
                              </span>
                              <select
                                value={mergeTargetByComensalId[comensal.id] || ''}
                                onChange={(e) =>
                                  setMergeTargetByComensalId((prev) => ({
                                    ...prev,
                                    [comensal.id]: e.target.value,
                                  }))
                                }
                                className="min-w-0 flex-1 h-8 px-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="">Selecciona un comensal...</option>
                                {comensales
                                  .filter((c) => !c.mergedIntoId && c.id !== comensal.id)
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleMergeComensales(comensal.id)}
                                disabled={!!mergingIds[comensal.id]}
                                className="h-8 px-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {mergingIds[comensal.id] ? 'Fusionando...' : 'Fusionar'}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Los productos de este comensal pasarán al comensal elegido.
                            </p>
                          </div>
                          {!hasPaid && comensalTotal > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMarkTransferred(comensal, comensalTotal)}
                              disabled={!!markingPaidIds[comensal.id]}
                              className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`Marcar como pagado: ${comensal.name}`}
                              title="Simula el envío del pago del comensal: deshabilita su sesión y activa celebración"
                            >
                              {markingPaidIds[comensal.id] ? 'Registrando...' : 'Ya transfirió'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center">
                      <p
                        className={`text-xl font-bold ${
                          hasPaid ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        ${Math.round(comensalTotal).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>
        )}

        {/* Payments List */}
        {(
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tr('Pagos Recibidos', 'Payments received')}
            </h2>
            {payments.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {(comensales.find((c) => c.id === payment.comensalId)?.name) || 'Comensal'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Consignó: {payment.consignadorName} ·{' '}
                        Pagado el {new Date(payment.paidAt as string | Date).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-green-700">
                      ${Math.round(payment.amount).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total Recaudado:</span>
                  <span className={
                    totalCollectedRounded > totalRounded 
                      ? 'text-violet-600' 
                      : totalCollectedRounded < totalRounded 
                        ? 'text-red-600' 
                        : 'text-green-700'
                  }>
                    ${Math.round(totalCollected).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Total Esperado:</span>
                  <span>${Math.round(total).toLocaleString('es-CO')}</span>
                </div>
                {totalCollectedRounded > totalRounded && (
                  <p className="text-sm text-violet-600 font-medium mt-2">
                    ⚠ Se ha recibido más del total esperado
                  </p>
                )}
                {totalCollectedRounded === totalRounded && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    ✓ Todos los pagos han sido recibidos
                  </p>
                )}
                {totalCollectedRounded < totalRounded && (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    Pendiente: ${Math.round(totalRounded - totalCollectedRounded).toLocaleString('es-CO')}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aún no se han registrado pagos
            </p>
          )}
          </div>
        )}

        {/* Payment QR - Información de Pago */}
        {(
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {tr('Información de Pago', 'Payment info')}
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePaymentQRUpload}
              className="hidden"
              aria-label="Subir código QR de pago"
            />
            {paymentQR ? (
              <div className="flex flex-col items-center mb-4">
                <Image 
                  src={paymentQR} 
                  alt="Payment QR" 
                  width={300}
                  height={300}
                  className="max-w-full h-auto mb-4 rounded-lg"
                  unoptimized
                />
                <button
                  onClick={handleUploadButtonClick}
                  className="text-sm text-indigo-600 hover:text-indigo-700 mb-4"
                >
                  {tr('Cambiar QR', 'Change QR')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleUploadButtonClick}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-4"
              >
                {tr('Subir QR de Pago', 'Upload payment QR')}
              </button>
            )}
            
            {/* Bre-B Key Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {tr('Llave de', 'Bre-B key')} <span className="bre-b-text">Bre-B</span>
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Este es un código numérico o alfanumérico usado en Colombia para transferencias entre bancos.
                Si estás en otro país puedes poner aquí otra información alfanumérica (número de cuenta y banco por ejemplo)
              </p>
              {brebKey && !editingBrebKey ? (
                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Llave de <span className="bre-b-text">Bre-B</span>:</p>
                    <p className="text-xl font-bold text-indigo-700 break-all">
                      {brebKey}
                    </p>
                  </div>
                  <button
                    onClick={handleChangeBreBKey}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Cambiar Llave
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBreBKeySubmit} className="space-y-3">
                  <div>
                    <label htmlFor="brebKeyInput" className="block text-sm font-medium text-gray-700 mb-2">
                      {brebKey ? (
                        <>Editar Llave de <span className="bre-b-text">Bre-B</span></>
                      ) : (
                        <>Ingresa la Llave de <span className="bre-b-text">Bre-B</span></>
                      )}
                    </label>
                    <input
                      ref={brebKeyInputRef}
                      id="brebKeyInput"
                      type="text"
                      value={brebKeyInput}
                      onChange={(e) => setBrebKeyInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: @ABC123456789"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor alfanumérico del sistema bancario colombiano <span className="bre-b-text">Bre-B</span> (normalmente comienza con @)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {brebKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBrebKey(false);
                          setBrebKeyInput(brebKey);
                        }}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submittingBrebKey}
                      className={`${brebKey ? 'flex-1' : 'w-full'} py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {submittingBrebKey ? 'Guardando...' : brebKey ? 'Guardar Cambios' : (
                        <>Guardar Llave de <span className="bre-b-text">Bre-B</span></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        {comensales.length > 0 && (
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <button
              onClick={generatePDF}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              aria-label="Exportar informe en PDF"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {tr('Exportar Informe PDF', 'Export PDF report')}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              aria-label="Crear nueva vaca"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {tr('Nueva Vaca', 'New session')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

