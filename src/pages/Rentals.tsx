"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Hammer, Receipt, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_RENTALS = [
  { id: 'r1', client: 'Construtora Silva', item: 'Betoneira 400L', start: '20/05/2024', end: '25/05/2024', status: 'active', total: 425.00, modality: 'Diária' },
  { id: 'r2', client: 'Carlos Santos', item: 'Martelete Rompedor', start: '22/05/2024', end: '23/05/2024', status: 'overdue', total: 120.00, modality: 'Diária' },
  { id: 'r3', client: 'Ana Oliveira', item: 'Andaime Tubular (x4)', start: '15/05/2024', end: '15/06/2024', status: 'completed', total: 180.00, modality: 'Mês' },
  { id: 'r4', client: 'Engenharia Norte', item: 'Gerador 5500W', start: '10/05/2024', end: '24/05/2024', status: 'active', total: 1200.00, modality: 'Quinzena' },
];

const RentalsPage = () => {
  const [rentals] = useState(INITIAL_RENTALS);

  const getModalityBadge = (modality: string) => {
    const styles: Record<string, string> = {
      'Diária': "bg-blue-50 text-blue-700 border-blue-100",
      'Semanal': "bg-purple-50 text-purple-700 border-purple-100",
      'Quinzena': "bg-amber-50 text-amber-700 border-amber-100",
      'Mês': "bg-emerald-50 text-emerald-700 border-emerald-100"
    };
    return (
      <Badge variant="outline" className={cn("rounded-lg font-bold text-[10px] uppercase", styles[modality])}>
        {modality}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Contratos de Aluguel</h2>
            <p className="text-slate-500 font-medium">Controle de locações e prazos de devolução</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-red-100 h-12 px-6">
            <Receipt className="h-5 w-5" />
            Novo Contrato
          </Button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente ou item..." 
            className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-900 py-6 pl-8">Cliente</TableHead>
                <TableHead className="font-bold text-slate-900">Equipamento</TableHead>
                <TableHead className="font-bold text-slate-900">Modalidade</TableHead>
                <TableHead className="font-bold text-slate-900">Período</TableHead>
                <TableHead className="font-bold text-slate-900">Valor Total</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
                <TableHead className="text-right pr-8 font-bold text-slate-900">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-black text-slate-900">{rental.client}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <Hammer className="h-4 w-4 text-red-500" />
                      {rental.item}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getModalityBadge(rental.modality)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Calendar className="h-3 w-3 text-blue-500" /> {rental.start}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock className="h-3 w-3" /> {rental.end}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg font-black text-blue-700">R$ {rental.total.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-xl border-none font-bold px-3 py-1",
                      rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                      rental.status === 'overdue' ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {rental.status === 'active' ? 'Ativo' : 
                       rental.status === 'overdue' ? 'Atrasado' : 'Finalizado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default RentalsPage;