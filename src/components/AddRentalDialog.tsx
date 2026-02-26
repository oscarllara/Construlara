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
      const allEquip: Equipment[] = JSON.parse(savedEquip);
      setEquipments(allEquip);
    }

    if (isCliente && userEmail) {
      const me = allUsers.find((u: any) => u.email?.toLowerCase().trim() === userEmail);
      if (me) {
        setFormData(prev => ({ ...prev, clientId: me.id }));
      } else {
        setFormData(prev => ({ ...prev, clientId: 'logged-user' }));
      }
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
      if (initialEquipmentId) {
        setFormData(prev => ({ ...prev, equipmentId: initialEquipmentId }));
      } else {
        setFormData(prev => ({ ...prev, equipmentId: "" }));
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

  const sendWhatsAppMessage = (rentalData: any) => {
    try {
      const val = typeof rentalData.totalValue === 'number' ? rentalData.totalValue.toFixed(2) : rentalData.totalValue;
      
      const message = `*SOLICITAÇÃO DE ALUGUEL - CONSTRULARA*\n` +
        `*Locatário:* ${rentalData.clientName}\n` +
        `*Equipamento:* ${rentalData.itemName}\n` +
        `*Período:* ${rentalData.start} até ${rentalData.end}\n` +
        `*Modalidade:* ${rentalData.modality}\n` +
        `*Valor Total:* R$ ${val}\n\n` +
        `Gostaria de confirmar a reserva deste equipamento!`;

      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/5532999625979?text=${encoded}`;
      
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error("Erro ao gerar link do WhatsApp:", e);
      showError("Não foi possível abrir o WhatsApp. Verifique os dados.");
    }
  };

  const handleSubmit = () => {
    if (!formData.endDate) {
      showError("Por favor, informe a data de devolução.");
      return;
    }
    if (!formData.clientId) {
      showError("Usuário não identificado.");
      return;
    }
    if (!formData.equipmentId) {
      showError("Equipamento não selecionado.");
      return;
    }

    const client = clients.find(c => c.id === formData.clientId);
    const equipment = equipments.find(e => e.id === formData.equipmentId);

    const fallbackName = userEmail ? userEmail.split('@')[0] : 'Usuário';
    const clientName = client ? client.name : fallbackName;

    const formatDate = (dateStr: string) => {
      return dateStr.split('-').reverse().join('/');
    };

    const rentalPayload = {
      ...formData,
      clientName: clientName,
      clientEmail: userEmail,
      clientId: client?.id || 'temp',
      itemName: equipment?.name || "Equipamento",
      equipmentId: equipment?.id,
      start: formatDate(formData.startDate),
      end: formatDate(formData.endDate),
      totalValue: parseFloat(formData.totalValue) || 0
    };

    onAdd(rentalPayload);
    
    if (isCliente) {
      sendWhatsAppMessage(rentalPayload);
    }

    setFormData({
      clientId: "",
      equipmentId: "",
      modality: "Diária",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      totalValue: ""
    });
  };

  const displayClientName = () => {
    const client = clients.find(c => c.id === formData.clientId);
    if (client) return client.name;
    const meByEmail = clients.find(c => c.email?.toLowerCase().trim() === userEmail);
    if (meByEmail) return meByEmail.name;
    if (isCliente && userEmail) return userEmail.split('@')[0];
    return 'Identificando...';
  };

  // Filtra apenas equipamentos disponíveis para o seletor
  const availableEquipments = equipments.filter(e => e.status === 'available' || e.id === formData.equipmentId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <Receipt className="h-7 w-7 text-red-600" />
              {isCliente ? "Reservar Equipamento" : "Gerar Contrato"}
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              {isCliente 
                ? "Confirme o período de locação para enviarmos sua solicitação." 
                : "Vincule o equipamento a um usuário para iniciar a locação."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              {!isCliente ? (
                <>
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
                </>
              ) : (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Identificado como</p>
                  <p className="text-lg font-black text-blue-900">{displayClientName()}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <Hammer className="h-4 w-4 text-slate-400" /> Equipamento
              </Label>
              {initialEquipmentId ? (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-700">
                  {equipments.find(e => e.id === formData.equipmentId)?.name || 'Carregando...'}
                </div>
              ) : (
                <Select value={formData.equipmentId} onValueChange={(v) => setFormData({...formData, equipmentId: v})}>
                  <SelectTrigger className="rounded-2xl border-slate-200 h-12 bg-white">
                    <SelectValue placeholder="Escolha um equipamento disponível..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {availableEquipments.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name} ({e.serialNumber})</SelectItem>
                    ))}
                    {availableEquipments.length === 0 && <div className="p-4 text-center text-xs text-slate-400">Nenhum equipamento disponível</div>}
                  </SelectContent>
                </Select>
              )}
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
                  <DollarSign className="h-4 w-4 text-slate-400" /> Valor Estimado
                </Label>
                <Input 
                  type="number" 
                  value={formData.totalValue}
                  onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                  readOnly={isCliente}
                  className={cn("rounded-2xl border-slate-200 h-12 font-bold text-blue-700", isCliente && "bg-slate-50")}
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
            <Button 
              onClick={handleSubmit} 
              className={cn(
                "rounded-2xl font-bold px-8 h-12 shadow-xl transition-all gap-2",
                isCliente ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100" : "bg-red-600 hover:bg-red-700 text-white shadow-red-100"
              )}
            >
              {isCliente ? <><MessageCircle className="h-5 w-5" /> Enviar p/ WhatsApp</> : "Confirmar Aluguel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} onAdd={handleAddNewUser} />
    </>
  );
};

export default AddRentalDialog;