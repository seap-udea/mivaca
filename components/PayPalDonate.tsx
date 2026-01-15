'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface PayPalDonateProps {
  email?: string;
  hostedButtonId?: string; // Hosted Button ID (PayPal Hosted Buttons)
  hostedButtonsClientId?: string; // client-id del snippet del SDK para hosted buttons
  currency?: string;
  className?: string;
}

export default function PayPalDonate({ 
  email = 'zuluagajorge@gmail.com', 
  hostedButtonId,
  hostedButtonsClientId,
  currency = 'USD',
  className = '' 
}: PayPalDonateProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const paypalFallbackUrl = useMemo(() => {
    // Fallback simple (sin SDK); a veces "donate/?hosted_button_id=..." no funciona dependiendo del tipo de botón/cuenta.
    return `https://www.paypal.com/donate?business=${encodeURIComponent(email)}&currency_code=${encodeURIComponent(currency)}&item_name=Donación+para+Mi+Vaca`;
  }, [email, currency]);

  useEffect(() => {
    let cancelled = false;

    async function ensureSdkLoaded(clientId: string) {
      if (typeof window === 'undefined') return;
      if (window.paypal?.HostedButtons) return;

      const existing = document.querySelector<HTMLScriptElement>(
        `script[data-paypal-hosted-buttons-sdk="true"][data-paypal-client-id="${clientId}"]`
      );
      if (existing) {
        await new Promise<void>((resolve, reject) => {
          if (window.paypal?.HostedButtons) return resolve();
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load')), {
            once: true,
          });
        });
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          clientId
        )}&components=hosted-buttons&disable-funding=venmo&currency=${encodeURIComponent(currency)}`;
        script.setAttribute('data-paypal-hosted-buttons-sdk', 'true');
        script.setAttribute('data-paypal-client-id', clientId);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('PayPal SDK failed to load'));
        document.head.appendChild(script);
      });
    }

    async function renderHostedButton() {
      setRenderError(null);
      if (!hostedButtonId || !hostedButtonsClientId) return;
      if (!containerRef.current) return;

      // Clear any previous render (helps in dev/HMR)
      containerRef.current.innerHTML = '';

      try {
        await ensureSdkLoaded(hostedButtonsClientId);
        if (cancelled) return;

        if (!window.paypal?.HostedButtons) {
          throw new Error('PayPal HostedButtons not available');
        }

        const mount = document.createElement('div');
        containerRef.current.appendChild(mount);

        await window.paypal.HostedButtons({ hostedButtonId }).render(mount);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error desconocido';
        if (!cancelled) setRenderError(message);
      }
    }

    renderHostedButton();
    return () => {
      cancelled = true;
    };
  }, [hostedButtonId, hostedButtonsClientId, currency]);

  return (
    <div className={`${className}`}>
      {hostedButtonId && hostedButtonsClientId ? (
        <div className="flex flex-col items-center gap-2">
          <div ref={containerRef} />
          {renderError ? (
            <div className="text-xs text-gray-500 text-center">
              No se pudo cargar el botón de PayPal ({renderError}).{' '}
              <a
                href={paypalFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Abrir enlace alternativo
              </a>
              .
            </div>
          ) : null}
        </div>
      ) : (
        <a
          href={paypalFallbackUrl}
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
      )}
    </div>
  );
}

declare global {
  interface Window {
    paypal?: any;
  }
}
