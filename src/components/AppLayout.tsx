"use client";

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container py-8 relative">
        {children}
        
        {/* Mascote Beto Flutuante */}
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none select-none hidden md:block">
          <div className="relative group pointer-events-auto cursor-help">
            <div className="absolute -top-16 right-0 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 w-48">
              <p className="text-[10px] font-black text-blue-700 uppercase mb-1">Dica do Beto:</p>
              <p className="text-xs font-bold text-slate-600 leading-tight">Precisa de ajuda com as locações? Estou aqui!</p>
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45"></div>
            </div>
            <div className="animate-bounce-slow">
              <div className="h-20 w-20 rounded-[2rem] bg-white p-1 shadow-2xl border-4 border-blue-600/20 overflow-hidden">
                <img src="/beto.png" alt="Beto" className="w-full h-full object-cover rounded-[1.8rem]" />
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