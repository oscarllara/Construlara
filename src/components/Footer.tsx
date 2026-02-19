"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-slate-50 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-sm font-black text-slate-900">BTM Comércio de Material de Construção Ltda</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CONSTRULARA &copy; {new Date().getFullYear()}</p>
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <Link to="/privacidade" className="hover:text-blue-600 transition-colors">Privacidade</Link>
          <Link to="/termos" className="hover:text-blue-600 transition-colors">Termos</Link>
          <Link to="/contato" className="hover:text-blue-600 transition-colors">Suporte</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;