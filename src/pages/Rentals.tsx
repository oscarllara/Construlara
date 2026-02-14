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
import { Search, Calendar, User, Hammer, Receipt } from 'lucide-react';

const INITIAL_RENTALS = [
  { id: 'r1', client: 'Construtora Silva', item: 'Betoneira 400L', start: '20/05/2024', end: '25/05/2024', status: 'active', total: 425.00 },
  { id: 'r2', client: 'Carlos Santos', item: 'Martelete Rompedor', start: '22/05/2024', end: '23/05/2024', status: 'overdue', total: 120.00 },
  { id: 'r3', client: 'Ana Oliveira', item: 'Andaime Tubular (x4)', start: '15/05/2024', end: '18/05/2024', status: 'completed', total: 180.00 },
];

const RentalsPage = () => {
  const [rentals] = useState(INITIAL_RENTALS);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Contratos de Aluguel</h2>
            <p className="text-slate-500">Controle de locações e prazos de devolução</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-2">
            <Receipt className="h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente ou item..." 
            className="pl-10 rounded-xl border-slate-200"
          />
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="font-medium">{rental.client}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-slate-400" />
                      {rental.item}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {rental.start}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {rental.end}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">R$ {rental.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-lg border-none",
                      rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                      rental.status === 'overdue' ? "bg-rose-100 text-rose-700" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {rental.status === 'active' ? 'Ativo' : 
                       rental.status === 'overdue' ? 'Atrasado' : 'Finalizado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="rounded-lg">Detalhes</Button>
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