'use client';

import Script from 'next/script';
import { adsConfig } from '@/lib/adsConfig';

export default function AdSenseScript() {
  if (!adsConfig.enabled || !adsConfig.publisherId) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.publisherId}`}
      onError={(e) => {
        console.error('Error loading AdSense script:', e);
      }}
    />
  );
}
