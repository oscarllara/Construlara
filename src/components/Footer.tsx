"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-slate-50 py-12">
      <div className="container flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="text-center md:text-left space-y-1">
          <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">CONSTRULARA</p>
          <p className="text-blue-600 font-black italic text-sm">"Um passo a frente em sua obra!"</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-2">CONSTRULARA &copy; {new Date().getFullYear()}</p>
        </div>

        <div className="max-w-md bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
            AVISO: Os preços e condições exibidos nesta loja online são exclusivos para compras via sistema e podem divergir dos valores praticados em nossa loja física.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-600">
          <Link to="/privacidade" className="hover:text-blue-600 transition-colors">Privacidade</Link>
          <Link to="/termos" className="hover:text-blue-600 transition-colors">Termos</Link>
          <Link to="/contato" className="hover:text-blue-600 transition-colors">Suporte</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;