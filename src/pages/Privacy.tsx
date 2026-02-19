"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';

const Privacy = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm space-y-8">
        <h1 className="text-4xl font-black text-slate-900">Política de Privacidade</h1>
        <div className="prose prose-slate max-w-none">
          <p className="font-bold">Sua privacidade é importante para nós.</p>
          <h2 className="text-xl font-black mt-6">1. Coleta de Dados</h2>
          <p>Coletamos apenas os dados necessários para a emissão de contratos e processamento de pedidos, como nome, CPF, endereço e contato.</p>
          <h2 className="text-xl font-black mt-6">2. Uso das Informações</h2>
          <p>Seus dados nunca serão vendidos ou compartilhados com terceiros para fins publicitários.</p>
          <h2 className="text-xl font-black mt-6">3. Segurança</h2>
          <p>Utilizamos criptografia e protocolos de segurança para proteger suas informações em nosso banco de dados.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Privacy;