"use client";

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { getRandomTip } from '@/utils/betoTips';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  const refreshTip = () => {
    setTip(getRandomTip());
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/50">
      <Navbar />
      {/* Adicionado pb-32 para garantir que o conteúdo não fique atrás do Beto */}
      <main className="flex-1 container py-8 pb-32 relative">
        {children}
        
        {/* Mascote Beto Flutuante - pointer-events-none no pai para não bloquear cliques */}
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none select-none hidden md:block">
          <div 
            className="relative group pointer-events-auto cursor-help"
            onMouseEnter={refreshTip}
          >
            <div className="absolute -top-24 right-0 bg-white p-4 rounded-[2rem] shadow-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 w-64 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Dica do Beto:</p>
              </div>
              <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{tip}"</p>
              <div className="absolute bottom-[-8px] right-8 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45"></div>
            </div>
            <div className="animate-bounce-slow">
              <div className="h-24 w-24 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border-4 border-blue-600/20 overflow-hidden hover:scale-110 transition-transform duration-300">
                <img src="/beto.png" alt="Beto" className="w-full h-full object-cover rounded-[2rem]" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;