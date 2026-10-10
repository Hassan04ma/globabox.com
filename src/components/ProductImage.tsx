import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Language } from '../types';

interface ProductImageProps {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  language?: Language;
  onError?: () => void;
}

export default function ProductImage({
  src,
  fallbackSrc,
  alt = '',
  className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out',
  containerClassName = 'aspect-[4/3] w-full overflow-hidden bg-[#0b1528] relative',
  loading = 'lazy',
  language = 'fr',
  onError
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsUsingFallback(false);
    setHasError(!src);
  }, [src]);

  const handleImageError = () => {
    if (!isUsingFallback && fallbackSrc) {
      setIsUsingFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      if (onError) {
        onError();
      }
    }
  };

  const getTranslation = () => {
    if (language === 'ar') {
      return {
        brand: 'جلوبابوكس',
        status: 'الصورة ستتوفر قريباً'
      };
    }
    if (language === 'en') {
      return {
        brand: 'Globabox',
        status: 'Image available soon'
      };
    }
    return {
      brand: 'Globabox',
      status: 'Image bientôt disponible'
    };
  };

  const t = getTranslation();

  if (hasError) {
    return (
      <div 
        className={`${containerClassName} h-full w-full flex flex-col items-center justify-center p-4 text-center select-none bg-[#0b1528] text-white border-b border-orange-500/20`}
      >
        {/* Glow decorative graphics */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Custom Globabox Logomark with Package Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 border border-orange-500/40 flex items-center justify-center text-white shadow-lg relative overflow-hidden mb-2 z-10">
          <Package className="w-5 h-5 text-orange-100 z-10" />
          <span className="absolute bottom-0 text-[10px] opacity-75 font-mono text-white/30 select-none z-0">▲</span>
          <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></span>
        </div>
        
        <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest font-sans mb-1 z-10">
          {t.brand}
        </span>
        <span className="text-[11px] font-bold text-slate-300 font-sans max-w-[180px] leading-snug z-10">
          {t.status}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={handleImageError}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
