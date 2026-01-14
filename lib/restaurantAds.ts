// Configuración de banners publicitarios de restaurantes
// Para agregar un nuevo restaurante, añade un objeto al array

export interface RestaurantAd {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // URL de la imagen del logo/banner
  websiteUrl: string; // URL del sitio web del restaurante
  location?: string; // Ubicación del restaurante
  phone?: string; // Teléfono de contacto
  active: boolean; // Para activar/desactivar banners
}

export const restaurantAds: RestaurantAd[] = [
  // Ejemplo de banner - reemplaza con restaurantes reales
  {
    id: '1',
    name: 'Restaurante Ejemplo',
    description: 'Deliciosa comida colombiana en el corazón de la ciudad',
    websiteUrl: 'https://ejemplo-restaurante.com',
    location: 'Medellín, Colombia',
    phone: '+57 300 123 4567',
    active: false, // Cambia a true cuando tengas un restaurante real
  },
  // Agrega más restaurantes aquí
];

// Función para obtener banners activos aleatoriamente
export function getRandomActiveAds(count: number = 1): RestaurantAd[] {
  const activeAds = restaurantAds.filter(ad => ad.active);
  if (activeAds.length === 0) return [];
  
  // Mezclar y tomar los primeros 'count'
  const shuffled = [...activeAds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
