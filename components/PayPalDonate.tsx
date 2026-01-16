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
        aria-label="Tome pa'l fresco (pago único) (se abre en una nueva pestaña)"
      >
        <span aria-hidden className="text-base leading-none">💸</span>
        Tome pa&apos;l fresco
      </a>

      <a
        href={subscriptionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        aria-label="¡Cuente conmigo! (suscripción mensual) (se abre en una nueva pestaña)"
      >
        <span aria-hidden className="text-base leading-none">💧</span>
        ¡Cuente conmigo!
      </a>
    </div>
  );
}
