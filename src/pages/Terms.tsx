"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';

const Terms = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm space-y-8">
        <h1 className="text-4xl font-black text-slate-900">Termos de Uso</h1>
        <div className="prose prose-slate max-w-none">
          <p className="font-bold">Última atualização: 20 de Maio de 2024</p>
          <h2 className="text-xl font-black mt-6">1. Aceitação dos Termos</h2>
          <p>Ao acessar o sistema Construlara, você concorda em cumprir estes termos de serviço e todas as leis aplicáveis.</p>
          <h2 className="text-xl font-black mt-6">2. Uso do Sistema</h2>
          <p>O sistema é destinado à gestão de locações e compras de materiais de construção. O uso indevido ou tentativa de invasão resultará em bloqueio imediato.</p>
          <h2 className="text-xl font-black mt-6">3. Responsabilidade do Locatário</h2>
          <p>O locatário é inteiramente responsável pela conservação do equipamento durante o período de locação, devendo devolvê-lo nas mesmas condições em que o recebeu.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Terms;