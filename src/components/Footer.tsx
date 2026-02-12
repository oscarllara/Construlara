"use client";

import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-slate-50 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} AppBuilder. Todos os direitos reservados.
        </p>
        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Termos</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Suporte</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;