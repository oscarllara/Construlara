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
  { id: 'r1', client: 'Construtora Silva', item: 'Betoneira 400L', start: '20/05/2024', end: '25/05/2024', status: 'active', total: 425.00, paidAmount: 0, modality: 'Diária', notes: '' },
  { id: 'r2', client: 'Carlos Santos', item: 'Martelete Rompedor', start: '22/05/2024', end: '23/05/2024', status: 'overdue', total: 120.00, paidAmount: 0, modality: 'Diária', notes: '' },
];

const RentalsPage = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [selectedEquipId, setSelectedEquipId] = useState<string>("");

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const isCliente = userRole === 'Cliente';
  const isAdmin = ['Gestor', 'Vendas'].includes(userRole);

  const loadRentals = () => {
    try {
      const saved = localStorage.getItem('app_rentals');
      if (saved && saved !== "undefined" && saved !== "null") {
        const parsed = JSON.parse(saved);
        setRentals(Array.isArray(parsed) ? parsed : INITIAL_RENTALS);
      } else {
        setRentals(INITIAL_RENTALS);
        localStorage.setItem('app_rentals', JSON.stringify(INITIAL_RENTALS));
      }
    } catch (e) { 
      setRentals(INITIAL_RENTALS); 
    }
  };

  useEffect(() => {
    loadRentals();
    window.addEventListener('order-placed', loadRentals);
    window.addEventListener('storage', loadRentals);
    return () => {
      window.removeEventListener('order-placed', loadRentals);
      window.removeEventListener('storage', loadRentals);
    };
  }, []);

  const handleUpdateRental = (updated: any) => {
    const saved = localStorage.getItem('app_rentals');
    if (saved) {
      try {
        const current = JSON.parse(saved);
        const updatedList = Array.isArray(current) ? current.map((r: any) => r.id === updated.id ? updated : r) : [updated];
        localStorage.setItem('app_rentals', JSON.stringify(updatedList));
        setRentals(updatedList);
        window.dispatchEvent(new Event('order-placed'));
      } catch (e) { console.error(e); }
    }
    setIsDetailsOpen(false);
  };

  const handleRentAgain = (id: string) => {
    setIsDetailsOpen(false);
    setSelectedEquipId(id);
    setIsAddOpen(true);
  };

  const filtered = useMemo(() => {
    return (rentals || []).filter(r => {
      if (!r) return false;
      
      if (isCliente) {
        const isMyRental = (r.clientEmail && r.clientEmail.toLowerCase().trim() === userEmail) || 
                           (r.client && r.client.toLowerCase().includes(userEmail.split('@')[0]));
        if (!isMyRental) return false;
      }

      const search = searchTerm.toLowerCase();
      return (r.client || "").toLowerCase().includes(search) || 
             (r.item || "").toLowerCase().includes(search) ||
             (r.id || "").toLowerCase().includes(search);
    });
  }, [rentals, searchTerm, isCliente, userEmail]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'active': 
        return <Badge className="bg-blue-100 text-blue-700 rounded-xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Ativo</Badge>;
      case 'overdue': 
        return <Badge className="bg-rose-100 text-rose-700 rounded-xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Em Atraso</Badge>;
      case 'pending_return': 
        return <Badge className="bg-orange-100 text-orange-700 rounded-xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 animate-pulse">Solicitado</Badge>;
      case 'completed': 
        return <Badge className="bg-emerald-100 text-emerald-700 rounded-xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Finalizado</Badge>;
      default: 
        return <Badge className="bg-slate-100 text-slate-700 rounded-xl border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">{s}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">{isCliente ? 'Meus Aluguéis' : 'Gestão de Contratos'}</h2>
            <p className="text-slate-500 font-medium">Controle central de locações, faturas e prazos</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => { setSelectedEquipId(""); setIsAddOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black gap-2 shadow-lg shadow-blue-50 h-12 px-6 transition-all active:scale-95"
            >
              <PlusCircle className="h-5 w-5" /> Novo Aluguel
            </Button>
          )}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por item, cliente ou ID..." 
            className="pl-12 h-12 rounded-2xl border-slate-200 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-black text-slate-900 py-6 pl-8">Contrato / Item</TableHead>
                {!isCliente && <TableHead className="font-black text-slate-900">Cliente</TableHead>}
                <TableHead className="font-black text-slate-900">Período</TableHead>
                <TableHead className="font-black text-slate-900">Total / Pago</TableHead>
                <TableHead className="font-black text-slate-900">Status</TableHead>
                <TableHead className="text-right pr-8 font-black text-slate-900">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                      <SearchX className="h-10 w-10 opacity-20" />
                      <p className="font-bold">Nenhum contrato encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((rental) => {
                  const total = Number(rental.total || 0);
                  const paid = Number(rental.paidAmount || 0);
                  const isFullyPaid = paid >= total - 0.01;

                  return (
                    <TableRow key={rental.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                      <TableCell className="py-5 pl-8">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{rental.item}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{rental.id}</span>
                        </div>
                      </TableCell>
                      {!isCliente && <TableCell className="font-bold text-slate-700">{rental.client}</TableCell>}
                      <TableCell className="text-xs font-bold text-slate-500">
                        <div className="flex flex-col">
                          <span>Início: {rental.start}</span>
                          <span>Fim: {rental.end}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-blue-700">R$ {total.toFixed(2)}</span>
                          <span className={cn("text-[10px] font-bold uppercase", isFullyPaid ? "text-emerald-500" : "text-slate-400")}>
                            {isFullyPaid ? "Pago Total" : `Pago R$ ${paid.toFixed(2)}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(rental.status)}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button 
                          variant="ghost" 
                          className="text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 rounded-xl" 
                          onClick={() => { setSelectedRental(rental); setIsDetailsOpen(true); }}
                        >
                          Visualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddRentalDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        onAdd={(d) => {
          const saved = localStorage.getItem('app_rentals');
          const list = saved ? JSON.parse(saved) : [];
          const newList = [{ ...d, id: `r-${Date.now()}`, status: 'active' }, ...list];
          localStorage.setItem('app_rentals', JSON.stringify(newList));
          setRentals(newList);
          setIsAddOpen(false);
          showSuccess("Contrato criado com sucesso!");
          window.dispatchEvent(new Event('order-placed'));
        }} 
        initialEquipmentId={selectedEquipId}
      />

      <RentalDetailsDialog 
        rental={selectedRental} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
        onUpdate={handleUpdateRental}
        onRentAgain={handleRentAgain}
      />
    </AppLayout>
  );
};

export default RentalsPage;