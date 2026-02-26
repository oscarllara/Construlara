"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Search, Calendar, User, Hammer, Receipt, Clock, SearchX, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddRentalDialog from '@/components/AddRentalDialog';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';
import { showSuccess } from '@/utils/toast';

const INITIAL_RENTALS = [
  { id: 'r1', client: 'Construtora Silva', item: 'Betoneira 400L', start: '20/05/2024', end: '25/05/2024', status: 'active', total: 425.00, modality: 'Diária', notes: '' },
  { id: 'r2', client: 'Carlos Santos', item: 'Martelete Rompedor', start: '22/05/2024', end: '23/05/2024', status: 'overdue', total: 120.00, modality: 'Diária', notes: '' },
  { id: 'r3', client: 'Ana Oliveira', item: 'Andaime Tubular (x4)', start: '15/05/2024', end: '15/06/2024', status: 'completed', total: 180.00, modality: 'Mês', notes: 'Devolvido sem avarias.' },
];

const RentalsPage = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const isCliente = userRole === 'Cliente';
  const isAdmin = ['Gestor', 'Vendas'].includes(userRole);

  const loadRentals = () => {
    try {
      const saved = localStorage.getItem('app_rentals');
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        setRentals(Array.isArray(parsed) ? parsed : INITIAL_RENTALS);
      } else {
        setRentals(INITIAL_RENTALS);
        localStorage.setItem('app_rentals', JSON.stringify(INITIAL_RENTALS));
      }
    } catch (e) { setRentals(INITIAL_RENTALS); }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleUpdateRental = (updated: any) => {
    const saved = localStorage.getItem('app_rentals');
    if (saved) {
      const current = JSON.parse(saved);
      const updatedList = current.map((r: any) => r.id === updated.id ? updated : r);
      localStorage.setItem('app_rentals', JSON.stringify(updatedList));
      setRentals(updatedList);
    }
    setIsDetailsOpen(false);
  };

  const filtered = useMemo(() => {
    return (rentals || []).filter(r => {
      if (!r) return false;
      if (isCliente) {
        const isMyRental = (r.clientEmail && r.clientEmail.toLowerCase().trim() === userEmail) || (r.client && r.client.toLowerCase().includes(userEmail.split('@')[0]));
        if (!isMyRental) return false;
      }
      const search = searchTerm.toLowerCase();
      return (r.client || "").toLowerCase().includes(search) || (r.item || "").toLowerCase().includes(search);
    });
  }, [rentals, searchTerm, isCliente, userEmail]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">{isCliente ? 'Meus Aluguéis' : 'Contratos de Aluguel'}</h2>
            <p className="text-slate-500 font-medium">Controle de locações e prazos de devolução</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsAddOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 shadow-lg h-12 px-6"
            >
              <PlusCircle className="h-5 w-5" /> Novo Aluguel
            </Button>
          )}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por item ou cliente..." 
            className="pl-12 h-12 rounded-2xl border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-900 py-6 pl-8">Equipamento</TableHead>
                {!isCliente && <TableHead className="font-bold text-slate-900">Cliente</TableHead>}
                <TableHead className="font-bold text-slate-900">Período</TableHead>
                <TableHead className="font-bold text-slate-900">Valor</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
                <TableHead className="text-right pr-8 font-bold text-slate-900">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-64 text-center text-slate-400">Nenhum contrato encontrado.</TableCell></TableRow>
              ) : (
                filtered.map((rental) => (
                  <TableRow key={rental.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                    <TableCell className="py-5 pl-8 font-bold text-slate-700">{rental.item}</TableCell>
                    {!isCliente && <TableCell className="font-bold text-slate-900">{rental.client}</TableCell>}
                    <TableCell className="text-xs font-bold text-slate-500">{rental.start} - {rental.end}</TableCell>
                    <TableCell className="text-lg font-black text-blue-700">R$ {Number(rental.total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-xl border-none font-bold px-3 py-1",
                        rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                        rental.status === 'overdue' ? "bg-red-100 text-red-700" :
                        rental.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                      )}>{rental.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" className="text-blue-600 font-bold" onClick={() => { setSelectedRental(rental); setIsDetailsOpen(true); }}>Detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddRentalDialog open={isAddOpen} onOpenChange={setIsAddOpen} onAdd={(d) => {
        const saved = localStorage.getItem('app_rentals');
        const list = saved ? JSON.parse(saved) : [];
        const newList = [{ ...d, id: `r-${Date.now()}`, status: 'active' }, ...list];
        localStorage.setItem('app_rentals', JSON.stringify(newList));
        setRentals(newList);
        setIsAddOpen(false);
        showSuccess("Contrato criado!");
      }} />

      <RentalDetailsDialog rental={selectedRental} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} onUpdate={handleUpdateRental} />
    </AppLayout>
  );
};

export default RentalsPage;