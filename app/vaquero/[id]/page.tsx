'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vaca, Product, Comensal, Payment } from '@/types';

export default function VaqueroDashboard() {
  const params = useParams();
  const vacaId = params.id as string;
  const [vaca, setVaca] = useState<Vaca | null>(null);
  const [total, setTotal] = useState(0);
  const [paymentQR, setPaymentQR] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comensales, setComensales] = useState<Comensal[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');

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
      if (data.payments) {
        setPayments(data.payments);
        setTotalCollected(data.totalCollected || 0);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
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
        alert('Error al subir el QR');
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

  const subtotal = useMemo(
    () => vaca?.products.reduce((sum, p) => sum + p.valorEnCarta * p.numero, 0) ?? 0,
    [vaca?.products]
  );
  const tip = useMemo(() => subtotal * 0.1, [subtotal]);

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
        `$${p.valorEnCarta.toLocaleString('es-CO')}`,
        `$${(p.valorEnCarta * p.numero).toLocaleString('es-CO')}`,
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
    doc.text(`Subtotal: $${subtotal.toLocaleString('es-CO')}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Propina (10%): $${tip.toLocaleString('es-CO')}`, 14, yPosition);
    yPosition += 7;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${total.toLocaleString('es-CO')}`, 14, yPosition);
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
        const comensalTip = comensalSubtotal * 0.1;
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
          `$${p.amount.toLocaleString('es-CO')}`,
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
  }, [vaca, subtotal, tip, total, comensales, payments, totalCollected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!vaca) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600">Vaca no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-center mb-4">
            <Image 
              src="/vaca-esferica.webp" 
              alt="Vaca Esférica" 
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">{vaca.name}</h1>
          <p className="text-gray-600 text-sm">
            Creada el {new Date(vaca.createdAt).toLocaleString('es-CO')}
          </p>
        </div>

        {/* QR Code for Comensales */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            QR para Comensales
          </h2>
          <div className="flex justify-center mb-4">
            {joinUrl && (
              <QRCodeSVG value={joinUrl} size={200} />
            )}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Comparte este QR para que tus amigos se unan
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 break-all flex-1">{joinUrl}</p>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                aria-label="Copiar enlace para comensales"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Payment QR */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            QR de Pago
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
            <div className="flex flex-col items-center">
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
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Cambiar QR
              </button>
            </div>
          ) : (
            <button
              onClick={handleUploadButtonClick}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Subir QR de Pago
            </button>
          )}
        </div>

        {/* Products List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Productos Agregados
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
                    ${(product.valorEnCarta * product.numero).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Propina (10%):</span>
              <span>${tip.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Comensales List */}
        {comensales.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Comensales Registrados
            </h2>
            <div className="space-y-3">
              {comensales.map((comensal) => {
                // Calculate total for this comensal
                const comensalProducts = vaca.products.filter(
                  (p) => p.comensalId === comensal.id
                );
                const comensalSubtotal = comensalProducts.reduce(
                  (sum, p) => sum + p.valorEnCarta * p.numero,
                  0
                );
                const comensalTip = comensalSubtotal * 0.1;
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
              })}
            </div>
          </div>
        )}

        {/* Payments List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pagos Recibidos
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
                      <p className="font-medium text-gray-800">{payment.consignadorName}</p>
                      <p className="text-sm text-gray-600">
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
                  <span className="text-green-700">
                    ${Math.round(totalCollected).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Total Esperado:</span>
                  <span>${Math.round(total).toLocaleString('es-CO')}</span>
                </div>
                {totalCollected >= total && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    ✓ Todos los pagos han sido recibidos
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

        {/* Botón Exportar Informe */}
        <div className="mt-6 flex justify-center">
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
            Exportar Informe PDF
          </button>
        </div>
      </div>
    </div>
  );
}

