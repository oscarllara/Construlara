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
import { Receipt, Hammer, Calendar, Users, MessageCircle } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { differenceInDays, parseISO, format, isValid } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';

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
  const userEmail = localStorage.getItem('userEmail') || '';
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
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        setClients(Array.isArray(parsed) ? parsed : []);
        
        if (!isInternal) {
          const me = parsed.find((u: any) => u.email === userEmail);
          if (me) setFormData(prev => ({ ...prev, clientId: me.id }));
        }
      }

      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        const parsedEquip = JSON.parse(savedEquip);
        setEquipments(parsedEquip);
      }

      if (initialEquipmentId) {
        setFormData(prev => ({ ...prev, equipmentId: initialEquipmentId }));
      }
    }
  }, [open, initialEquipmentId, isInternal, userEmail]);

  // Efeito dedicado ao cálculo do preço
  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.equipmentId || equipments.length === 0) {
      return;
    }

    const start = parseISO(formData.startDate);
    const end = parseISO(formData.endDate);
    
    if (!isValid(start) || !isValid(end)) return;

    // diferença + 1 para contar o dia de início
    const totalDays = differenceInDays(end, start) + 1;
    
    // Se a data for inválida (fim antes do início), resetamos para 0
    if (totalDays <= 0) {
      setFormData(prev => ({ ...prev, totalValue: "0.00" }));
      return;
    }

    const equipment = equipments.find(e => String(e.id) === String(formData.equipmentId));
    if (equipment) {
      let calculatedTotal = 0;
      let displayModality = "Diária";

      // Lógica de faixas de preço (Tabela regressiva)
      if (totalDays >= 20) { 
        displayModality = "Mensal"; 
        calculatedTotal = equipment.monthlyRate || (equipment.dailyRate * 20); 
      }
      else if (totalDays >= 11) { 
        displayModality = "Quinzenal"; 
        calculatedTotal = equipment.biweeklyRate || (equipment.dailyRate * 11); 
      }
      else if (totalDays >= 4) { 
        displayModality = "Semanal"; 
        calculatedTotal = equipment.weeklyRate || (equipment.dailyRate * 4); 
      }
      else { 
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
    if (!formData.clientId) { showError("Identificação necessária."); return; }
    if (!formData.equipmentId) { showError("Selecione o equipamento."); return; }
    if (!formData.endDate) { showError("Informe a data de devolução."); return; }
    if (parseFloat(formData.totalValue) <= 0) { showError("Data de devolução inválida."); return; }

    const client = clients.find(c => c.id === formData.clientId);
    const equipment = equipments.find(e => String(e.id) === String(formData.equipmentId));

    const rentalPayload = {
      ...formData,
      clientName: client?.name || "Cliente",
      clientEmail: client?.email || "",
      clientId: client?.id,
      itemName: equipment?.name || "Equipamento",
      equipmentId: equipment?.id,
      start: format(parseISO(formData.startDate), 'dd/MM/yyyy'),
      end: format(parseISO(formData.endDate), 'dd/MM/yyyy'),
      total: parseFloat(formData.totalValue),
      paidAmount: 0
    };

    onAdd(rentalPayload);

    if (!isInternal) {
      const msg = `*SOLICITAÇÃO DE ALUGUEL - CONSTRULARA*%0A*Item:* ${rentalPayload.itemName}%0A*Período:* ${rentalPayload.start} até ${rentalPayload.end}%0A*Total Estimado:* R$ ${rentalPayload.total.toFixed(2)}`;
      window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-8 border-none shadow-2xl bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Receipt className="h-7 w-7 text-blue-600" />
            Solicitar Aluguel
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {isInternal && (
            <div className="space-y-2">
              <Label className="font-bold">Selecionar Cliente</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder="Escolha um cliente..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-bold">Equipamento</Label>
            <Input 
              value={equipments.find(e => String(e.id) === String(formData.equipmentId))?.name || "Carregando..."} 
              disabled 
              className="h-12 rounded-xl bg-slate-50 font-bold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Data Início</Label>
              <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Data Fim</Label>
              <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{formData.modality}</p>
            <p className="text-4xl font-black text-blue-700">R$ {formData.totalValue}</p>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={parseFloat(formData.totalValue) <= 0}
            className="w-full bg-blue-700 hover:bg-blue-800 h-14 rounded-2xl font-black text-white shadow-xl disabled:opacity-50"
          >
            {isInternal ? "Confirmar Aluguel" : "Solicitar via WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalDialog;