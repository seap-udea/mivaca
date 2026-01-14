// Configuración de publicidad automática
// Para usar Google AdSense, necesitas:
// 1. Crear una cuenta en https://www.google.com/adsense
// 2. Obtener tu Publisher ID (formato: ca-pub-XXXXXXXXXXXXXXXX)
// 3. Agregar tu dominio al sitio en AdSense
// 4. Configurar el publisherId abajo

export const adsConfig = {
  // Tu Publisher ID de Google AdSense
  // Por defecto usa el ID proporcionado por Google: ca-pub-3375122749252035
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-3375122749252035',
  
  // Habilitar/deshabilitar AdSense
  // Por defecto está habilitado si hay un publisherId
  enabled: (process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'false') && 
           (process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-3375122749252035').length > 0,
  
  // IDs de unidades de anuncios (se crean en AdSense)
  adUnits: {
    // Banner horizontal (728x90 o responsive)
    banner: process.env.NEXT_PUBLIC_ADSENSE_BANNER_ID || '',
    // Banner compacto (320x100 o responsive)
    compact: process.env.NEXT_PUBLIC_ADSENSE_COMPACT_ID || '',
    // Banner vertical (300x250)
    vertical: process.env.NEXT_PUBLIC_ADSENSE_VERTICAL_ID || '',
  },
};
