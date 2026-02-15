"use client";

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const saved = localStorage.getItem('app_rentals');
    if (saved) {
      setRentals(JSON.parse(saved));
    } else {
      setRentals(INITIAL_RENTALS);
      localStorage.setItem('app_rentals', JSON.stringify(INITIAL_RENTALS));
    }
  }, []);

  const saveRentals = (newRentals: any[]) => {
    setRentals(newRentals);
    localStorage.setItem('app_rentals', JSON.stringify(newRentals));
  };

  const handleAddRental = (data: any) => {
    const newRental = {
      id: `r-${Date.now()}`,
      client: data.clientName,
      clientId: data.clientId,
      item: data.itemName,
      equipmentId: data.equipmentId,
      start: data.startDate,
      end: data.endDate,
      status: 'active',
      total: data.totalValue,
      modality: data.modality,
      notes: ''
    };

    // Atualizar status do equipamento para 'rented'
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      const allEquip = JSON.parse(savedEquip);
      const updatedEquip = allEquip.map((e: any) => 
        e.id === data.equipmentId ? { ...e, status: 'rented', lastClient: data.clientName } : e
      );
      localStorage.setItem('app_equipments', JSON.stringify(updatedEquip));
    }

    saveRentals([newRental, ...rentals]);
    setIsAddOpen(false);
    showSuccess("Contrato gerado com sucesso!");
  };

  const handleUpdateRental = (updated: any) => {
    const newRentals = rentals.map(r => r.id === updated.id ? updated : r);
    
    // Se o status mudou para 'completed', liberar o equipamento
    if (updated.status === 'completed') {
      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        const allEquip = JSON.parse(savedEquip);
        const updatedEquip = allEquip.map((e: any) => 
          e.id === updated.equipmentId ? { ...e, status: 'available' } : e
        );
        localStorage.setItem('app_equipments', JSON.stringify(updatedEquip));
      }
    }

    saveRentals(newRentals);
    setIsDetailsOpen(false);
    showSuccess("Contrato atualizado.");
  };

  const openDetails = (rental: any) => {
    setSelectedRental(rental);
    setIsDetailsOpen(true);
  };

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

  const filtered = rentals.filter(r => 
    r.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Contratos de Aluguel</h2>
            <p className="text-slate-500 font-medium">Controle de locações e prazos de devolução</p>
          </div>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-red-100 h-12 px-6"
          >
            <Receipt className="h-5 w-5" />
            Novo Contrato
          </Button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente ou item..." 
            className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {filtered.map((rental) => (
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
                    <span className="text-lg font-black text-blue-700">R$ {rental.total?.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-xl border-none font-bold px-3 py-1",
                      rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                      rental.status === 'overdue' ? "bg-red-100 text-red-700" :
                      rental.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                      "bg-orange-100 text-orange-700"
                    )}>
                      {rental.status === 'active' ? 'Ativo' : 
                       rental.status === 'overdue' ? 'Atrasado' : 
                       rental.status === 'completed' ? 'Devolvido' : 'Em Reparo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl font-bold text-blue-600 hover:bg-blue-50"
                      onClick={() => openDetails(rental)}
                    >
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddRentalDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        onAdd={handleAddRental} 
      />

      <RentalDetailsDialog 
        rental={selectedRental}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdate={handleUpdateRental}
      />
    </AppLayout>
  );
};

export default RentalsPage;