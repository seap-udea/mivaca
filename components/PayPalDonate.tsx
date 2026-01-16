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
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <a
        href={singlePaymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        aria-label="Apoye al artista (pago único) (se abre en una nueva pestaña)"
      >
        <span aria-hidden className="text-base leading-none">🎁</span>
        Apoye al artista ;)
      </a>

      <a
        href={subscriptionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-indigo-700 text-sm font-medium rounded-lg transition-colors border border-indigo-200"
        aria-label="Apoye al artista (suscripción mensual) (se abre en una nueva pestaña)"
      >
        <span aria-hidden className="text-base leading-none">🎁</span>
        Suscripción mensual
      </a>
    </div>
  );
}
