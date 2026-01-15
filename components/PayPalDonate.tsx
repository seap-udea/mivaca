'use client';

interface PayPalDonateProps {
  donateUrl: string;
  className?: string;
}

export default function PayPalDonate({ 
  donateUrl,
  className = '' 
}: PayPalDonateProps) {
  return (
    <div className={`${className}`}>
      <a
        href={donateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        aria-label="Donar con PayPal (se abre en una nueva pestaña)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.19c-.076.47-.407.78-.857.78zm-1.12-9.99h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.15.054-.294.077-.437.292-1.867-.002-3.137-1.012-4.287-1.112-1.267-3.12-1.81-5.69-1.81H5.998l-3.162 19.636h4.606l1.12-7.19z"/>
        </svg>
        Apoye al artista ;) con PayPal
      </a>
    </div>
  );
}
