"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Hammer, MapPin, Phone, Mail, FileText, AlertCircle, CheckCircle2, Wrench, Hash, Tag, Calendar, DollarSign } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

interface RentalDetailsDialogProps {
  rental: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRental: any) => void;
}

const RentalDetailsDialog = ({ rental, open, onOpenChange, onUpdate }: RentalDetailsDialogProps) => {
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modality, setModality] = useState("");
  const [totalValue, setTotalValue] = useState(0);

  // Carregar dados iniciais
  useEffect(() => {
    if (rental && open) {
      setStatus(rental.status);
      setNotes(rental.notes || "");
      setStartDate(rental.start.includes('/') ? rental.start.split('/').reverse().join('-') : rental.start);
      setEndDate(rental.end.includes('/') ? rental.end.split('/').reverse().join('-') : rental.end);
      setModality(rental.modality || "Diária");
      setTotalValue(rental.total || 0);
      
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        const users: UserAccount[] = JSON.parse(savedUsers);
        const clients = users.filter(u => u.role === 'Cliente');
        setAllClients(clients);
        const currentClient = clients.find(u => u.name === rental.client || u.id === rental.clientId);
        setSelectedClientId(currentClient?.id || "");
      }

      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        const allEquip: Equipment[] = JSON.parse(savedEquip);
        const found = allEquip.find(e => e.name === rental.item || e.id === rental.equipmentId);
        setEquipment(found || null);
      }
    }
  }, [rental, open]);

  const currentClient = useMemo(() => 
    allClients.find(c => c.id === selectedClientId), 
  [selectedClientId, allClients]);

  // Lógica de reconhecimento automático de modalidade e cálculo de valor
  useEffect(() => {
    if (!equipment || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start);
    
    if (days < 0) return;

    // Reconhecimento automático da modalidade
    let autoModality = "Diária";
    if (days >= 30) autoModality = "Mês";
    else if (days >= 15) autoModality = "Quinzena";
    else if (days >= 7) autoModality = "Semanal";

    setModality(autoModality);

    // Cálculo do valor baseado na modalidade reconhecida
    let newValue = 0;
    const actualDays = Math.max(1, days);
    
    switch (autoModality) {
      case 'Diária':
        newValue = actualDays * (equipment.dailyRate || 0);
        break;
      case 'Semanal':
        newValue = Math.ceil(actualDays / 7) * (equipment.weeklyRate || equipment.dailyRate * 7);
        break;
      case 'Quinzena':
        newValue = Math.ceil(actualDays / 15) * (equipment.biweeklyRate || equipment.dailyRate * 15);
        break;
      case 'Mês':
        newValue = Math.ceil(actualDays / 30) * (equipment.monthlyRate || equipment.dailyRate * 30);
        break;
    }
    setTotalValue(newValue);
  }, [startDate, endDate, equipment]);

  const handleSave = () => {
    onUpdate({ 
      ...rental, 
      status, 
      notes,
      client: currentClient?.name || rental.client,
      clientId: selectedClientId,
      start: startDate,
      end: endDate,
      modality,
      total: totalValue
    });
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        {/* Header do Contrato */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter">CONTRATO DE LOCAÇÃO</h2>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Nº {rental.id.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status Atual</p>
              <Badge className={cn(
                "rounded-xl border-none font-bold px-4 py-2 text-sm",
                status === 'active' ? "bg-blue-500 text-white" :
                status === 'overdue' ? "bg-red-500 text-white" :
                status === 'completed' ? "bg-emerald-500 text-white" :
                "bg-orange-500 text-white"
              )}>
                {status === 'active' ? 'Em Aberto' : 
                 status === 'overdue' ? 'Atrasado' : 
                 status === 'completed' ? 'Devolvido' : 'Em Reparo'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto bg-white">
          {/* Coluna Esquerda: Locatário e Equipamento */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Locatário (Cliente)
              </h3>
              <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Selecionar Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11 bg-white font-bold">
                      <SelectValue placeholder="Escolha o cliente..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {allClients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {currentClient && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-500" /> {currentClient.whatsapp}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Email</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-blue-500" /> {currentClient.email}
                      </p>
                    </div>
                  </div>
                )}
                
                {currentClient?.worksiteAddress && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Endereço da Obra</p>
                    <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> {currentClient.worksiteAddress}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hammer className="h-4 w-4" /> Objeto da Locação
              </h3>
              <div className="bg-blue-50/50 p-6 rounded-[2.5rem] space-y-4 border border-blue-100">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5">Equipamento</p>
                  <p className="font-black text-slate-900 text-lg">{rental.item}</p>
                </div>
                {equipment && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5">Patrimônio</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-blue-400" /> {equipment.serialNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5">Categoria</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-blue-400" /> {equipment.category}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Coluna Direita: Prazos e Valores */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Prazos e Modalidade
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Data Início</Label>
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl border-slate-200 h-11 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Previsão Devolução</Label>
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl border-slate-200 h-11 font-bold"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Modalidade (Reconhecida)</Label>
                  <Select value={modality} onValueChange={setModality}>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Diária">Diária</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quinzena">Quinzena</SelectItem>
                      <SelectItem value="Mês">Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-emerald-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-lg shadow-emerald-100">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-200 uppercase">Valor Total Recalculado</p>
                    <p className="text-3xl font-black">R$ {totalValue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-400 opacity-50" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Observações do Contrato
              </h3>
              <Textarea 
                placeholder="Registre aqui avarias, atrasos ou detalhes importantes da locação..." 
                className="rounded-2xl min-h-[120px] border-slate-200 bg-white text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </section>
          </div>
        </div>

        {/* Footer com Status à Esquerda */}
        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-between sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Label className="font-bold text-slate-500 text-xs uppercase whitespace-nowrap">Status:</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-xl h-10 border-slate-200 bg-white w-48 font-bold text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="active">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Em Aberto</div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Devolvido</div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5 text-orange-500" /> Em Reparo</div>
                </SelectItem>
                <SelectItem value="overdue">
                  <div className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-red-500" /> Atrasado</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-10 px-6 text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold px-8 h-10 text-xs shadow-lg shadow-blue-100">
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;