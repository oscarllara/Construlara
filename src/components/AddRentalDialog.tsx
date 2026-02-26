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
import { Receipt, User, Hammer, Calendar, DollarSign, UserPlus, MessageCircle } from 'lucide-react';
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
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const isCliente = userRole === 'Cliente';

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
    const allUsers: UserAccount[] = savedUsers ? JSON.parse(savedUsers) : [];
    setClients(allUsers);

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      setEquipments(JSON.parse(savedEquip));
    }

    if (isCliente && userEmail) {
      const me = allUsers.find(u => u.email.toLowerCase().trim() === userEmail);
      if (me) {
        setFormData(prev => ({ ...prev, clientId: me.id }));
      }
    }
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
    const start = parseISO(formData.startDate);
    const end = parseISO(formData.endDate);
    const totalDays = differenceInDays(end, start) + 1;
    if (totalDays <= 0) return;

    const equipment = equipments.find(e => e.id === formData.equipmentId);
    if (equipment) {
      let calculatedTotal = 0;
      let displayModality = "Diária";
      if (totalDays >= 20) { displayModality = "Mensal"; calculatedTotal = equipment.monthlyRate || (equipment.dailyRate * 20); }
      else if (totalDays >= 11) { displayModality = "Quinzenal"; calculatedTotal = equipment.biweeklyRate || (equipment.dailyRate * 11); }
      else if (totalDays >= 4) { displayModality = "Semanal"; calculatedTotal = equipment.weeklyRate || (equipment.dailyRate * 4); }
      else { displayModality = "Diária"; calculatedTotal = equipment.dailyRate * totalDays; }
      setFormData(prev => ({ ...prev, modality: displayModality, totalValue: calculatedTotal.toFixed(2) }));
    }
  }, [formData.startDate, formData.endDate, formData.equipmentId, equipments]);

  const handleSubmit = () => {
    if (!formData.endDate) { showError("Informe a data de devolução."); return; }
    if (!formData.clientId) { showError("Erro: Sua conta não foi identificada. Tente sair e entrar novamente."); return; }
    if (!formData.equipmentId) { showError("Equipamento não selecionado."); return; }

    const client = clients.find(c => c.id === formData.clientId);
    const equipment = equipments.find(e => e.id === formData.equipmentId);

    const rentalPayload = {
      ...formData,
      clientName: client?.name || "Cliente",
      clientEmail: userEmail,
      clientId: client?.id || 'temp',
      itemName: equipment?.name || "Equipamento",
      equipmentId: equipment?.id,
      start: formData.startDate.split('-').reverse().join('/'),
      end: formData.endDate.split('-').reverse().join('/'),
      totalValue: parseFloat(formData.totalValue) || 0
    };

    onAdd(rentalPayload);
    if (isCliente) {
      const msg = `*RESERVA - CONSTRULARA*%0A*Item:* ${rentalPayload.itemName}%0A*Período:* ${rentalPayload.start} a ${rentalPayload.end}%0A*Total:* R$ ${rentalPayload.totalValue.toFixed(2)}`;
      window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
    }
    onOpenChange(false);
  };

  const availableEquipments = equipments.filter(e => e.status === 'available' || e.id === formData.equipmentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-8">
        <DialogHeader className="pb-4"><DialogTitle className="flex items-center gap-3 text-2xl font-black"><Receipt className="h-7 w-7 text-red-600" />{isCliente ? "Reservar Equipamento" : "Gerar Contrato"}</DialogTitle></DialogHeader>
        <div className="grid gap-5">
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Locatário Responsável</p>
            <p className="text-xl font-black text-blue-900">{clients.find(c => c.id === formData.clientId)?.name || "Buscando usuário..."}</p>
          </div>
          <div className="space-y-2"><Label className="font-bold">Equipamento</Label>
            <Select value={formData.equipmentId} onValueChange={(v) => setFormData({...formData, equipmentId: v})}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Escolha..." /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableEquipments.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-bold">Início</Label><Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="h-12 rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-bold">Devolução</Label><Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="h-12 rounded-xl" /></div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl text-center"><p className="text-[10px] font-black text-slate-400 uppercase">{formData.modality}</p><p className="text-3xl font-black text-blue-700">R$ {formData.totalValue}</p></div>
        </div>
        <DialogFooter className="pt-6"><Button onClick={handleSubmit} className="w-full bg-emerald-600 h-14 rounded-2xl font-black text-white"><MessageCircle className="mr-2" /> {isCliente ? "Enviar via WhatsApp" : "Confirmar Contrato"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalDialog;