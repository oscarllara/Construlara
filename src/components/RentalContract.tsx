"use client";

import React from 'react';
import { UserAccount } from './UserTable';
import { cn } from '@/lib/utils';

interface RentalContractProps {
  rental: any;
  client?: UserAccount;
  className?: string;
}

const RentalContract = ({ rental, client, className }: RentalContractProps) => {
  if (!rental) return null;

  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div 
      id="printable-contract" 
      className={cn(
        "bg-white text-slate-900 font-serif leading-relaxed text-[12px] sm:text-sm p-8 sm:p-16 shadow-2xl mx-auto w-full max-w-[800px] border border-slate-100 print:shadow-none print:border-none print:p-0 print:max-w-none",
        className
      )}
    >
      {/* Cabeçalho Oficial */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-xl font-bold uppercase">BTM Comércio de Material de Construção Ltda</h1>
          <p className="font-black text-blue-800 text-lg">CONSTRULARA</p>
          <div className="text-[11px] space-y-0.5">
            <p><strong>CNPJ:</strong> 16.403.481/0001-16 | <strong>I.E:</strong> 001.993106.00-34</p>
            <p>Rua Maestro José Cândido das Neves, 38A - Centro</p>
            <p>Rio das Mortes - MG - CEP 36315-000</p>
            <p>Tel: (32) 3374-1135 | www.construlara.com.br</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="font-bold text-lg">CONTRATO DE LOCAÇÃO</p>
          <p className="text-xl font-bold text-blue-800">Nº {rental.id.toUpperCase()}</p>
          <p className="text-xs">Emissão: {today}</p>
        </div>
      </div>

      {/* Conteúdo do Contrato */}
      <div className="space-y-8">
        <section>
          <h2 className="font-bold border-b border-slate-300 mb-3 uppercase text-xs tracking-widest">1. IDENTIFICAÇÃO DAS PARTES</h2>
          <div className="grid grid-cols-1 gap-2">
            <p><strong>LOCADOR:</strong> BTM Comércio de Material de Construção Ltda (CONSTRULARA).</p>
            <p><strong>LOCATÁRIO:</strong> {rental.client || 'Não informado'}</p>
            <p><strong>CPF/CNPJ:</strong> {client?.cpf || '---'}</p>
            <p><strong>ENDEREÇO:</strong> {client?.address || '---'}, {client?.neighborhood || ''} - {client?.city || ''}/{client?.state || ''}</p>
            <p><strong>CONTATO:</strong> {client?.whatsapp || rental.whatsapp || '---'}</p>
          </div>
        </section>

        <section>
          <h2 className="font-bold border-b border-slate-300 mb-3 uppercase text-xs tracking-widest">2. OBJETO E PRAZO DA LOCAÇÃO</h2>
          <div className="grid grid-cols-1 gap-2">
            <p>O LOCADOR cede ao LOCATÁRIO o uso do equipamento: <strong>{rental.item}</strong>.</p>
            <p><strong>DATA DE INÍCIO:</strong> {rental.start}</p>
            <p><strong>PREVISÃO DE DEVOLUÇÃO:</strong> {rental.end}</p>
            <p><strong>MODALIDADE DE COBRANÇA:</strong> {rental.modality}</p>
          </div>
        </section>

        <section>
          <h2 className="font-bold border-b border-slate-300 mb-3 uppercase text-xs tracking-widest">3. VALORES E CONDIÇÕES FINANCEIRAS</h2>
          <p>O valor total estimado para o período contratado é de <strong>R$ {rental.total?.toFixed(2)}</strong>.</p>
          <p className="text-xs italic mt-2">Nota: Valores adicionais podem ser aplicados em caso de atraso na devolução ou danos ao equipamento.</p>
        </section>

        <section>
          <h2 className="font-bold border-b border-slate-300 mb-3 uppercase text-xs tracking-widest">4. TERMOS E RESPONSABILIDADES</h2>
          <div className="space-y-3 text-[11px] text-justify leading-snug">
            <p><strong>4.1. ESTADO DO BEM:</strong> O LOCATÁRIO confirma que o equipamento foi entregue em perfeitas condições de uso. Qualquer avaria deve ser comunicada imediatamente.</p>
            <p><strong>4.2. USO E MANUTENÇÃO:</strong> O uso deve seguir as normas técnicas. Danos por negligência, falta de lubrificação ou uso incorreto serão cobrados do LOCATÁRIO.</p>
            <p><strong>4.3. DEVOLUÇÃO:</strong> O item deve retornar limpo. Atrasos geram cobrança de novas diárias automaticamente.</p>
            <p><strong>4.4. SEGURANÇA:</strong> O LOCADOR não se responsabiliza por acidentes decorrentes do uso do equipamento por pessoas não capacitadas.</p>
          </div>
        </section>
      </div>

      {/* Assinaturas */}
      <div className="mt-24 grid grid-cols-2 gap-16">
        <div className="text-center space-y-1">
          <div className="border-t border-slate-900 pt-2"></div>
          <p className="font-bold text-xs uppercase">CONSTRULARA</p>
          <p className="text-[10px] uppercase">Locador</p>
        </div>
        <div className="text-center space-y-1">
          <div className="border-t border-slate-900 pt-2"></div>
          <p className="font-bold text-xs uppercase">{rental.client}</p>
          <p className="text-[10px] uppercase">Locatário</p>
        </div>
      </div>

      <div className="mt-16 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-4">
        Este documento é um registro digital gerado pelo Sistema Construlara em {today} às {new Date().toLocaleTimeString()}.
      </div>
    </div>
  );
};

export default RentalContract;