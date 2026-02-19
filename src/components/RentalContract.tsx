"use client";

import React from 'react';
import { UserAccount } from './UserTable';

interface RentalContractProps {
  rental: any;
  client?: UserAccount;
}

const RentalContract = ({ rental, client }: RentalContractProps) => {
  if (!rental) return null;

  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div id="printable-contract" className="hidden print:block p-12 text-slate-900 bg-white font-serif leading-relaxed text-sm">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase">CONSTRULARA RDM</h1>
          <p className="font-bold">Locação de Equipamentos e Materiais de Construção</p>
          <p>CNPJ: 16.403.481/0001-16</p>
          <p>Tel: (32) 3374-1135 | WhatsApp: (32) 99962-5979</p>
          <p>São João del-Rei - MG</p>
        </div>
        <div className="text-right">
          <p className="font-bold">CONTRATO DE LOCAÇÃO</p>
          <p className="text-lg font-bold">Nº {rental.id.toUpperCase()}</p>
          <p>Data de Emissão: {today}</p>
        </div>
      </div>

      {/* Partes */}
      <div className="space-y-6 mb-8">
        <section>
          <h2 className="font-bold border-b border-slate-300 mb-2 uppercase">1. DAS PARTES</h2>
          <p><strong>LOCADOR:</strong> CONSTRULARA RDM, com sede em São João del-Rei/MG.</p>
          <p><strong>LOCATÁRIO:</strong> {rental.client || 'Não informado'} {client?.cpf ? `| CPF: ${client.cpf}` : ''}</p>
          <p><strong>ENDEREÇO:</strong> {client?.address || 'Não informado'}, {client?.neighborhood || ''} - {client?.city || ''}/{client?.state || ''}</p>
          <p><strong>CONTATO:</strong> {client?.whatsapp || rental.whatsapp || 'Não informado'}</p>
        </section>

        <section>
          <h2 className="font-bold border-b border-slate-300 mb-2 uppercase">2. DO OBJETO E PRAZO</h2>
          <p>O presente contrato tem como objeto a locação do equipamento: <strong>{rental.item}</strong>.</p>
          <p><strong>DATA DE INÍCIO:</strong> {rental.start}</p>
          <p><strong>PREVISÃO DE DEVOLUÇÃO:</strong> {rental.end}</p>
          <p><strong>MODALIDADE:</strong> {rental.modality}</p>
        </section>

        <section>
          <h2 className="font-bold border-b border-slate-300 mb-2 uppercase">3. VALORES E PAGAMENTO</h2>
          <p>O valor total da locação é de <strong>R$ {rental.total?.toFixed(2)}</strong>.</p>
          <p>O pagamento deverá ser realizado conforme acordado no ato da entrega ou retirada do equipamento.</p>
        </section>

        <section>
          <h2 className="font-bold border-b border-slate-300 mb-2 uppercase">4. CLÁUSULAS E CONDIÇÕES</h2>
          <div className="space-y-2 text-xs text-justify">
            <p><strong>4.1. RESPONSABILIDADE:</strong> O LOCATÁRIO declara receber o equipamento em perfeitas condições de uso e funcionamento, obrigando-se a zelar pela sua conservação e segurança.</p>
            <p><strong>4.2. MANUTENÇÃO:</strong> Danos causados por uso indevido, negligência ou falta de lubrificação serão de inteira responsabilidade do LOCATÁRIO, que arcará com os custos de reparo.</p>
            <p><strong>4.3. DEVOLUÇÃO:</strong> O equipamento deverá ser devolvido limpo e na data aprazada. O atraso implicará na cobrança de novas diárias proporcionais.</p>
            <p><strong>4.4. EXTRAVIO:</strong> Em caso de furto, roubo ou perda total, o LOCATÁRIO obriga-se a ressarcir o LOCADOR pelo valor de mercado de um equipamento novo equivalente.</p>
          </div>
        </section>
      </div>

      {/* Assinaturas */}
      <div className="mt-20 grid grid-cols-2 gap-20">
        <div className="text-center border-t border-slate-900 pt-4">
          <p className="font-bold">CONSTRULARA RDM</p>
          <p className="text-xs">LOCADOR</p>
        </div>
        <div className="text-center border-t border-slate-900 pt-4">
          <p className="font-bold">{rental.client}</p>
          <p className="text-xs">LOCATÁRIO</p>
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400">
        Documento gerado eletronicamente pelo Sistema de Gestão Construlara.
      </div>
    </div>
  );
};

export default RentalContract;