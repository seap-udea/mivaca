'use client';

import { useEffect, useRef } from 'react';
import { adsConfig } from '@/lib/adsConfig';

interface AdSenseBannerProps {
  adSlot: string; // ID de la unidad de anuncio de AdSense
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

export default function AdSenseBanner({
  adSlot,
  adFormat = 'auto',
  style = {},
  className = '',
  fullWidthResponsive = true,
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adsConfig.enabled || !adSlot) return;

    try {
      // Inicializar el array si no existe
      window.adsbygoogle = window.adsbygoogle || [];
      
      // Esperar a que el script se cargue y luego hacer push
      const initAd = () => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('Error pushing AdSense ad:', error);
        }
      };

      // Si el script ya está cargado, inicializar inmediatamente
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        // Esperar un momento para asegurar que el script está listo
        setTimeout(initAd, 100);
      } else {
        // Esperar a que el script se cargue
        const checkAdsbygoogle = setInterval(() => {
          if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            initAd();
            clearInterval(checkAdsbygoogle);
          }
        }, 100);

        // Limpiar después de 10 segundos si no se carga
        setTimeout(() => clearInterval(checkAdsbygoogle), 10000);
      }
    } catch (error) {
      console.error('Error loading AdSense:', error);
    }
  }, [adSlot]);

  if (!adsConfig.enabled || !adSlot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client={adsConfig.publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Extender el tipo Window para incluir adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[] | { loaded?: boolean; push: (ad: any) => void };
  }
}
