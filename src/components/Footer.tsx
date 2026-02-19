"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-slate-50 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Construlara. Todos os direitos reservados.
        </p>
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