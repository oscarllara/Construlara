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
import { Receipt, User, Hammer, Calendar, DollarSign } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { differenceInDays } from 'date-fns';

interface AddRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (rental: any) => void;
}

const AddRentalDialog = ({ open, onOpenChange, onAdd }: AddRentalDialogProps) => {
  const [clients, setClients] = useState<UserAccount[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: "",
    equipmentId: "",
    modality: "Diária",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    totalValue: ""
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      const allUsers = JSON.parse(savedUsers);
      setClients(allUsers.filter((u: UserAccount) => u.role === 'Cliente'));
    }

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      const allEquip = JSON.parse(savedEquip);
      setEquipments(allEquip.filter((e: Equipment) => e.status === 'available'));
    }
  }, [open]);

  // Lógica de cálculo misto (Mix de prazos)
  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.equipmentId) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const totalDays = Math.max(1, differenceInDays(end, start));
    
    if (differenceInDays(end, start) < 0) return;

    const equipment = equipments.find(e => e.id === formData.equipmentId);
    if (equipment) {
      let remainingDays = totalDays;
      let calculatedTotal = 0;

      // 1. Meses (30 dias)
      const months = Math.floor(remainingDays / 30);
      if (months > 0) {
        calculatedTotal += months * (equipment.monthlyRate || (equipment.dailyRate * 30));
        remainingDays %= 30;
      }

      // 2. Quinzenas (15 dias)
      const biweeks = Math.floor(remainingDays / 15);
      if (biweeks > 0) {
        calculatedTotal += biweeks * (equipment.biweeklyRate || (equipment.dailyRate * 15));
        remainingDays %= 15;
      }

      // 3. Semanas (7 dias)
      const weeks = Math.floor(remainingDays / 7);
      if (weeks > 0) {
        calculatedTotal += weeks * (equipment.weeklyRate || (equipment.dailyRate * 7));
        remainingDays %= 7;
      }

      // 4. Diárias restantes
      if (remainingDays > 0) {
        calculatedTotal += remainingDays * equipment.dailyRate;
      }

      // Determinar modalidade principal para exibição
      let displayModality = "Diária";
      if (totalDays >= 30) displayModality = "Mês";
      else if (totalDays >= 15) displayModality = "Quinzena";
      else if (totalDays >= 7) displayModality = "Semanal";

      setFormData(prev => ({ 
        ...prev, 
        modality: displayModality, 
        totalValue: calculatedTotal.toFixed(2) 
      }));
    }
  }, [formData.startDate, formData.endDate, formData.equipmentId, equipments]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Receipt className="h-7 w-7 text-red-600" />
            Novo Contrato
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Inicie uma nova locação com cálculo automático de mix de prazos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Cliente
              </Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <Hammer className="h-4 w-4 text-slate-400" /> Equipamento
              </Label>
              <Select value={formData.equipmentId} onValueChange={(v) => setFormData({...formData, equipmentId: v})}>
                <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                  <SelectValue placeholder="Selecione o item..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {equipments.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.serialNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">Modalidade Base</Label>
              <div className="h-12 flex items-center px-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-600">
                {formData.modality}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" /> Valor Total (Mix)
              </Label>
              <Input 
                type="number" 
                placeholder="0.00" 
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
            Gerar Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalDialog;