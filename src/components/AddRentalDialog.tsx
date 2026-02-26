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
import { Receipt, User, Hammer, Calendar, DollarSign, UserPlus, MessageCircle, Users } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { differenceInDays, parseISO } from 'date-fns';
import AddUserDialog from './AddUserDialog';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from "@/lib/utils";

interface AddRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (rental: any) => void;
  initialEquipmentId?: string;
}

const AddRentalDialog = ({ open, onOpenChange, onAdd, initialEquipmentId }: AddRentalDialogProps) => {
  const [clients, setClients] = useState<UserAccount[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas'].includes(userRole);

  const [formData, setFormData] = useState({
    clientId: "",
    equipmentId: "",
    modality: "Diária",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    totalValue: "0.00"
  });

  useEffect(() => {
    if (open) {
      // Carrega clientes do localStorage
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          setClients(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setClients([]); }
      }

      // Carrega equipamentos do localStorage
      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        try {
          const parsed = JSON.parse(savedEquip);
          setEquipments(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setEquipments([]); }
      }

      if (initialEquipmentId) {
        setFormData(prev => ({ ...prev, equipmentId: initialEquipmentId }));
      }
    }
  }, [open, initialEquipmentId]);

  // Recálculo automático de preço no formulário de criação
  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.equipmentId) return;
    
    const start = parseISO(formData.startDate);
    const end = parseISO(formData.endDate);
    const totalDays = differenceInDays(end, start) + 1;
    
    if (totalDays <= 0) return;

    const equipment = equipments.find(e => e.id === formData.equipmentId);
    if (equipment) {
      let calculatedTotal = 0;
      let displayModality = "Diária";
      
      if (totalDays >= 20) { 
        displayModality = "Mensal"; 
        calculatedTotal = equipment.monthlyRate || (equipment.dailyRate * 20); 
      } else if (totalDays >= 11) { 
        displayModality = "Quinzenal"; 
        calculatedTotal = equipment.biweeklyRate || (equipment.dailyRate * 11); 
      } else if (totalDays >= 4) { 
        displayModality = "Semanal"; 
        calculatedTotal = equipment.weeklyRate || (equipment.dailyRate * 4); 
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

  const handleSubmit = () => {
    if (!formData.clientId) { showError("Selecione um cliente."); return; }
    if (!formData.equipmentId) { showError("Selecione um equipamento."); return; }
    if (!formData.endDate) { showError("Informe a data de devolução."); return; }

    const client = clients.find(c => c.id === formData.clientId);
    const equipment = equipments.find(e => e.id === formData.equipmentId);

    const rentalPayload = {
      ...formData,
      clientName: client?.name || "Cliente",
      clientEmail: client?.email || "",
      clientId: client?.id,
      itemName: equipment?.name || "Equipamento",
      equipmentId: equipment?.id,
      start: formData.startDate.split('-').reverse().join('/'),
      end: formData.endDate.split('-').reverse().join('/'),
      total: parseFloat(formData.totalValue),
      paidAmount: 0 // Começa com zero pago
    };

    onAdd(rentalPayload);
    onOpenChange(false);
  };

  const availableEquipments = equipments.filter(e => e.status === 'available' || e.id === formData.equipmentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-8 border-none shadow-2xl bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Receipt className="h-7 w-7 text-blue-600" />
            Novo Contrato de Aluguel
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Vincule um equipamento a um cliente da sua base de dados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="font-bold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> Selecionar Cliente
            </Label>
            <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder="Escolha um cliente cadastrado..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px]">
                {clients.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">Nenhum cliente cadastrado.</p>
                ) : (
                  clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700 flex items-center gap-2">
              <Hammer className="h-4 w-4 text-blue-600" /> Equipamento
            </Label>
            <Select value={formData.equipmentId} onValueChange={(v) => setFormData({...formData, equipmentId: v})}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder="Escolha um item disponível..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px]">
                {availableEquipments.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name} - {e.serialNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Data de Início</Label>
              <Input 
                type="date" 
                value={formData.startDate} 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
                className="h-12 rounded-xl border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Previsão de Devolução</Label>
              <Input 
                type="date" 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
                className="h-12 rounded-xl border-slate-200" 
              />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{formData.modality}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black text-blue-700">R$</span>
              <span className="text-4xl font-black text-blue-700">{formData.totalValue}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-14">Cancelar</Button>
          <Button onClick={handleSubmit} className="flex-1 bg-blue-700 hover:bg-blue-800 h-14 rounded-2xl font-black text-white shadow-xl shadow-blue-100">
            Confirmar Aluguel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalDialog;