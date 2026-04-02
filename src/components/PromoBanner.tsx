"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const PromoBanner = () => {
  const [config, setConfig] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const loadBanner = () => {
      const saved = localStorage.getItem('app_promo_banner');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
        } catch (e) { setConfig(null); }
      }
    };

    loadBanner();
    window.addEventListener('storage', loadBanner);
    window.addEventListener('banner-updated', loadBanner);
    return () => {
      window.removeEventListener('storage', loadBanner);
      window.removeEventListener('banner-updated', loadBanner);
    };
  }, []);

  if (!config || !config.active || !isVisible) return null;

  return (
    <div className={cn(
      "w-full py-3 px-4 flex items-center justify-center gap-4 relative overflow-hidden animate-in fade-in slide-in-from-top duration-500",
      config.color || "bg-blue-700"
    )}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Megaphone className="h-24 w-24 -rotate-12 absolute -left-4 -top-4" />
      </div>
      
      <div className="flex items-center gap-3 relative z-10">
        <Sparkles className="h-5 w-5 text-white animate-pulse" />
        <p className="text-white font-black text-sm md:text-base tracking-tight">
          {config.text || "Confira nossas ofertas especiais de hoje!"}
        </p>
        {config.link && (
          <a 
            href={config.link} 
            className="bg-white text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase hover:scale-105 transition-transform"
          >
            Ver Oferta
          </a>
        )}
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 text-white/60 hover:text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PromoBanner;