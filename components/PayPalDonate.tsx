'use client';

interface PayPalDonateProps {
  singlePaymentUrl: string;
  subscriptionUrl: string;
  className?: string;
}

export default function PayPalDonate({ 
  singlePaymentUrl,
  subscriptionUrl,
  className = '' 
}: PayPalDonateProps) {
  return (
    <div className={`flex flex-row flex-wrap items-center justify-center gap-3 ${className}`}>
      <a
        href={singlePaymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        aria-label="Tome al fresco (pago único) (se abre en una nueva pestaña)"
      >
        <span aria-hidden className="text-base leading-none">🍾</span>
        Tome al fresco
      </a>

      <a
        href={subscriptionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-indigo-700 text-sm font-medium rounded-lg transition-colors border border-indigo-200"
        aria-label="¡Cuente conmigo pues! (suscripción mensual) (se abre en una nueva pestaña)"
      >
        <span aria-hidden className="text-base leading-none">💸</span>
        ¡Cuente conmigo pues!
      </a>
    </div>
  );
}
