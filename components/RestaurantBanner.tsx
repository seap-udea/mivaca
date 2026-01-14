'use client';

import { RestaurantAd } from '@/lib/restaurantAds';
import Image from 'next/image';
import { useState } from 'react';

interface RestaurantBannerProps {
  ad: RestaurantAd;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
}

export default function RestaurantBanner({ 
  ad, 
  className = '',
  variant = 'horizontal' 
}: RestaurantBannerProps) {
  const [imageError, setImageError] = useState(false);

  if (variant === 'compact') {
    return (
      <a
        href={ad.websiteUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow ${className}`}
      >
        <div className="flex items-center gap-3">
          {ad.imageUrl && !imageError ? (
            <div className="flex-shrink-0">
              <Image
                src={ad.imageUrl}
                alt={ad.name}
                width={48}
                height={48}
                className="rounded object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 bg-orange-200 rounded flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">🍽️</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{ad.name}</p>
            {ad.location && (
              <p className="text-xs text-gray-600 truncate">{ad.location}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs text-orange-600 font-medium">Visitar →</span>
          </div>
        </div>
      </a>
    );
  }

  if (variant === 'vertical') {
    return (
      <a
        href={ad.websiteUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow ${className}`}
      >
        <div className="text-center">
          {ad.imageUrl && !imageError ? (
            <div className="mb-3">
              <Image
                src={ad.imageUrl}
                alt={ad.name}
                width={120}
                height={120}
                className="rounded-lg object-cover mx-auto"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="mb-3 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-lg mx-auto flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          <h3 className="font-bold text-gray-800 mb-1">{ad.name}</h3>
          {ad.description && (
            <p className="text-xs text-gray-600 mb-2">{ad.description}</p>
          )}
          {ad.location && (
            <p className="text-xs text-gray-500 mb-2">📍 {ad.location}</p>
          )}
          <span className="inline-block text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
            Visitar restaurante
          </span>
        </div>
      </a>
    );
  }

  // Horizontal (default)
  return (
    <a
      href={ad.websiteUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-center gap-4">
        {ad.imageUrl && !imageError ? (
          <div className="flex-shrink-0">
            <Image
              src={ad.imageUrl}
              alt={ad.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-lg flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-1">{ad.name}</h3>
          {ad.description && (
            <p className="text-sm text-gray-600 mb-1 line-clamp-2">{ad.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {ad.location && (
              <span className="text-xs text-gray-500">📍 {ad.location}</span>
            )}
            {ad.phone && (
              <span className="text-xs text-gray-500">📞 {ad.phone}</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-block text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Visitar →
          </span>
        </div>
      </div>
    </a>
  );
}
