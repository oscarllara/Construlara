"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EquipmentCard, { Equipment } from '@/components/EquipmentCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const INITIAL_EQUIPMENTS: Equipment[] = [
  { id: 'e1', name: 'Betoneira 400L', category: 'Construção', serialNumber: 'BT-992', dailyRate: 85.00, status: 'available' },
  { id: 'e2', name: 'Martelete Rompedor 10kg', category: 'Ferramentas Elétricas', serialNumber: 'MR-441', dailyRate: 120.00, status: 'rented', lastClient: 'Construtora Silva' },
  { id: 'e3', name: 'Gerador 5500W', category: 'Energia', serialNumber: 'GR-102', dailyRate: 250.00, status: 'maintenance' },
  { id: 'e4', name: 'Andaime Tubular 1.5m', category: 'Acesso', serialNumber: 'AD-001', dailyRate: 15.00, status: 'available' },
];

const EquipmentsPage = () => {
  const [equipments, setEquipments] = useState(INITIAL_EQUIPMENTS);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRent = (id: string) => {
    showSuccess("Iniciando processo de aluguel...");
  };

  const handleMaintenance = (id: string) => {
    setEquipments(prev => prev.map(e => e.id === id ? { ...e, status: 'maintenance' } : e));
    showSuccess("Equipamento enviado para manutenção.");
  };

  const filtered = equipments.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Inventário</h2>
            <p className="text-slate-500">Gerencie suas ferramentas e equipamentos</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Novo Equipamento
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome ou patrimônio..." 
              className="pl-10 rounded-xl border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(item => (
            <EquipmentCard 
              key={item.id} 
              equipment={item} 
              onRent={handleRent}
              onMaintenance={handleMaintenance}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default EquipmentsPage;