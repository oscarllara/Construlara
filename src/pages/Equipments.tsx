"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import EquipmentCard, { Equipment } from '@/components/EquipmentCard';
import AddEquipmentDialog from '@/components/AddEquipmentDialog';
import EditEquipmentDialog from '@/components/EditEquipmentDialog';
import ReturnEquipmentDialog from '@/components/ReturnEquipmentDialog';
import AddRentalDialog from '@/components/AddRentalDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Hammer } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const INITIAL_EQUIPMENTS: Equipment[] = [
  { id: 'e1', name: 'Betoneira 400L', category: 'Construção', serialNumber: 'BT-992', dailyRate: 85.00, status: 'available' },
  { id: 'e2', name: 'Martelete Rompedor 10kg', category: 'Ferramentas Elétricas', serialNumber: 'MR-441', dailyRate: 120.00, status: 'rented', lastClient: 'Construtora Silva' },
  { id: 'e3', name: 'Gerador 5500W', category: 'Energia', serialNumber: 'GR-102', dailyRate: 250.00, status: 'maintenance' },
  { id: 'e4', name: 'Andaime Tubular 1.5m', category: 'Acesso', serialNumber: 'AD-001', dailyRate: 15.00, status: 'available' },
];

const EquipmentsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isAdmin = ['Gestor', 'Vendas'].includes(userRole);

  useEffect(() => {
    const saved = localStorage.getItem('app_equipments');
    if (saved) {
      setEquipments(JSON.parse(saved));
    } else {
      setEquipments(INITIAL_EQUIPMENTS);
      localStorage.setItem('app_equipments', JSON.stringify(INITIAL_EQUIPMENTS));
    }
  }, []);

  const saveEquipments = (newEquipments: Equipment[]) => {
    setEquipments(newEquipments);
    localStorage.setItem('app_equipments', JSON.stringify(newEquipments));
  };

  const handleAddEquipment = (data: Omit<Equipment, 'id' | 'status'>) => {
    const newItem: Equipment = {
      id: `e-${Date.now()}`,
      ...data,
      status: 'available'
    };
    saveEquipments([newItem, ...equipments]);
    setIsAddDialogOpen(false);
    showSuccess(`${data.name} cadastrado com sucesso!`);
  };

  const handleEditEquipment = (updated: Equipment) => {
    const newEquipments = equipments.map(e => e.id === updated.id ? updated : e);
    saveEquipments(newEquipments);
    setIsEditDialogOpen(false);
    setSelectedEquipment(null);
    showSuccess(`Dados de ${updated.name} atualizados.`);
  };

  const handleRentClick = (id: string) => {
    const equip = equipments.find(e => e.id === id);
    if (equip) {
      setSelectedEquipment(equip);
      setIsRentalDialogOpen(true);
    }
  };

  const handleConfirmRental = (data: any) => {
    const newEquipments = equipments.map(e => 
      e.id === data.equipmentId ? { ...e, status: 'rented' as const, lastClient: data.clientName } : e
    );
    saveEquipments(newEquipments);

    const savedRentals = localStorage.getItem('app_rentals');
    const currentRentals = savedRentals ? JSON.parse(savedRentals) : [];
    const newRental = {
      id: `r-${Date.now()}`,
      client: data.clientName,
      clientId: data.clientId,
      clientEmail: data.clientEmail,
      item: data.itemName,
      equipmentId: data.equipmentId,
      start: data.start,
      end: data.end,
      status: 'active',
      total: data.totalValue,
      paidAmount: 0,
      modality: data.modality,
      notes: ''
    };
    localStorage.setItem('app_rentals', JSON.stringify([newRental, ...currentRentals]));

    setIsRentalDialogOpen(false);
    showSuccess(`Contrato gerado para ${data.clientName}!`);
  };

  const handleMaintenance = (id: string) => {
    const newEquipments = equipments.map(e => 
      e.id === id ? { ...e, status: 'maintenance' as const } : e
    );
    saveEquipments(newEquipments);
    showSuccess("Equipamento enviado para manutenção.");
  };

  const handleFinishRepair = (id: string) => {
    const newEquipments = equipments.map(e => 
      e.id === id ? { ...e, status: 'available' as const } : e
    );
    saveEquipments(newEquipments);
    showSuccess("Manutenção finalizada. Item disponível.");
  };

  const handleReturnClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsReturnDialogOpen(true);
  };

  const handleEditClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsEditDialogOpen(true);
  };

  const handleConfirmReturn = (id: string, nextStatus: 'available' | 'maintenance', notes: string) => {
    const newEquipments = equipments.map(e => 
      e.id === id ? { ...e, status: nextStatus, lastClient: undefined } : e
    );
    
    const savedRentals = localStorage.getItem('app_rentals');
    if (savedRentals) {
      const rentals = JSON.parse(savedRentals);
      const updatedRentals = rentals.map((r: any) => 
        (r.equipmentId === id && r.status === 'active') ? { ...r, status: 'completed', notes: notes } : r
      );
      localStorage.setItem('app_rentals', JSON.stringify(updatedRentals));
    }

    saveEquipments(newEquipments);
    setIsReturnDialogOpen(false);
    showSuccess(nextStatus === 'available' ? "Equipamento devolvido e disponível." : "Equipamento recebido e enviado para manutenção.");
  };

  const handleViewContract = (id: string) => {
    navigate('/alugueis');
  };

  const filtered = equipments
    .filter(e => 
      (e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      e.status === 'available' // EXIBIR APENAS DISPONÍVEIS
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Catálogo de Locação</h2>
            <p className="text-slate-500 font-medium">Equipamentos disponíveis para aluguel imediato</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-orange-100 h-12 px-6"
            >
              <Plus className="h-5 w-5" />
              Novo Equipamento
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar equipamento disponível..." 
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-2xl border-slate-200 h-12 px-6 font-bold gap-2 bg-white">
            <Filter className="h-4 w-4" />
            Categorias
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(item => (
            <EquipmentCard 
              key={item.id} 
              equipment={item} 
              onRent={handleRentClick}
              onMaintenance={handleMaintenance}
              onFinishRepair={handleFinishRepair}
              onViewContract={handleViewContract}
              onReturn={handleReturnClick}
              onEdit={handleEditClick}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Hammer className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No momento todos os equipamentos estão em obra.</p>
          </div>
        )}
      </div>

      <AddEquipmentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onAdd={handleAddEquipment} 
      />

      <EditEquipmentDialog 
        equipment={selectedEquipment}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditEquipment}
      />

      <ReturnEquipmentDialog 
        equipment={selectedEquipment}
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        onConfirm={handleConfirmReturn}
      />

      <AddRentalDialog 
        open={isRentalDialogOpen}
        onOpenChange={setIsRentalDialogOpen}
        onAdd={handleConfirmRental}
        initialEquipmentId={selectedEquipment?.id}
      />
    </AppLayout>
  );
};

export default EquipmentsPage;