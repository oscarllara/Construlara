"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, User, Hammer, Calendar, DollarSign, UserPlus } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { differenceInDays } from 'date-fns';
import AddUserDialog from './AddUserDialog';
import { showSuccess } from '@/utils/toast';

interface AddRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (rental: any) => void;
  initialEquipmentId?: string;
}

const AddRentalDialog = ({ open, onOpenChange, onAdd, initialEquipmentId }: AddRentalDialogProps) => {
  const [clients, setClients] = useState<UserAccount[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: "",
    equipmentId: "",
    modality: "Diária",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    totalValue: ""
  });

  const loadData = () => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) setClients(JSON.parse(savedUsers));

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) setEquipments(JSON.parse(savedEquip));
  };

  useEffect(() => {
    if (open) {
      loadData();
      if (initialEquipmentId) {
        setFormData(prev => ({ ...prev, equipmentId: initialEquipmentId }));
      }
    }
  }, [open, initialEquipmentId]);

  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.equipmentId) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const totalDays = Math.max(1, differenceInDays(end, start));
    
    if (differenceInDays(end, start) < 0) return;

    const equipment = equipments.find(e => e.id === formData.equipmentId);
    if (equipment) {
      let calculatedTotal = 0;
      let displayModality = "Diária";

      if (totalDays >= 30) {
        displayModality = "Mensal";
        calculatedTotal = equipment.monthlyRate || (equipment.dailyRate * 20);
      } else if (totalDays >= 15) {
        displayModality = "Quinzenal";
        calculatedTotal = equipment.biweeklyRate || (equipment.dailyRate * 12);
      } else if (totalDays >= 7) {
        displayModality = "Semanal";
        calculatedTotal = equipment.weeklyRate || (equipment.dailyRate * 6);
      } else {
        displayModality = "Diária";
        calculatedTotal = equipment.dailyRate * totalDays;
      }

      setFormData(prev => ({ 
        ...prev, 
        modality: displayModality, 
        totalValue: calculatedTotal.toFixed(2) 
      }));
    }
  }, [formData.startDate, formData.endDate, formData.equipmentId, equipments]);

  const handleAddNewUser = (userData: any) => {
    const savedUsers = localStorage.getItem('app_users');
    const currentUsers = savedUsers ? JSON.parse(savedUsers) : [];
    const newUser = { id: `u-${Date.now()}`, ...userData, status: 'active', lastAccess: 'Nunca' };
    const updatedUsers = [newUser, ...currentUsers];
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setClients(updatedUsers);
    setFormData(prev => ({ ...prev, clientId: newUser.id }));
    setIsAddUserOpen(false);
    showSuccess(`Usuário ${userData.name} cadastrado.`);
  };

  const handleSubmit = () => {
    if (!formData.clientId || !formData.equipmentId || !formData.totalValue) return;
    const client = clients.find(c => c.id === formData.clientId);
    const equipment = equipments.find(e => e.id === formData.equipmentId);

    onAdd({
      ...formData,
      clientName: client?.name,
      itemName: equipment?.name,
      totalValue: parseFloat(formData.totalValue)
    });
    
    setFormData({
      clientId: "",
      equipmentId: "",
      modality: "Diária",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      totalValue: ""
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <Receipt className="h-7 w-7 text-red-600" />
              Gerar Contrato
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              Vincule o equipamento a um usuário para iniciar a locação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Locatário
                </Label>
                <Button variant="ghost" size="sm" onClick={() => setIsAddUserOpen(true)} className="h-7 text-[10px] font-black uppercase text-blue-600 rounded-lg gap-1">
                  <UserPlus className="h-3 w-3" /> Novo Usuário
                </Button>
              </div>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                  <SelectValue placeholder="Selecione o usuário..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <Hammer className="h-4 w-4 text-slate-400" /> Equipamento
              </Label>
              <Select 
                value={formData.equipmentId} 
                onValueChange={(v) => setFormData({...formData, equipmentId: v})}
                disabled={!!initialEquipmentId}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                  <SelectValue placeholder="Selecione o item..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {equipments.filter(e => e.status === 'available' || e.id === initialEquipmentId).map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.serialNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm">Modalidade Aplicada</Label>
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-blue-700">
                  {formData.modality}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" /> Valor Total
                </Label>
                <Input 
                  type="number" 
                  value={formData.totalValue}
                  onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12 font-bold text-blue-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" /> Data Início
                </Label>
                <Input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" /> Previsão Devolução
                </Label>
                <Input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-red-100">
              Confirmar Aluguel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} onAdd={handleAddNewUser} />
    </>
  );
};

export default AddRentalDialog;