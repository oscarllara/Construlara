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
import { User, Hammer, MapPin, Phone, Mail, FileText, AlertCircle, CheckCircle2, Wrench, Hash, Tag, Calendar, DollarSign, RotateCcw } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { showSuccess } from '@/utils/toast';

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
  const [totalValue, setTotalValue] = useState<string>("0");

  // Estado para Devolução
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnStatus, setReturnStatus] = useState<'available' | 'maintenance'>('available');

  useEffect(() => {
    if (rental && open) {
      setStatus(rental.status);
      setNotes(rental.notes || "");
      setStartDate(rental.start.includes('/') ? rental.start.split('/').reverse().join('-') : rental.start);
      setEndDate(rental.end.includes('/') ? rental.end.split('/').reverse().join('-') : rental.end);
      setModality(rental.modality || "Diária");
      setTotalValue(rental.total?.toString() || "0");
      setShowReturnForm(false);
      
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        const users: UserAccount[] = JSON.parse(savedUsers);
        setAllClients(users);
        const currentClient = users.find(u => u.name === rental.client || u.id === rental.clientId);
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

  const currentClient = useMemo(() => allClients.find(c => c.id === selectedClientId), [selectedClientId, allClients]);

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
      total: parseFloat(totalValue)
    });
  };

  const handleProcessReturn = () => {
    // 1. Atualizar o aluguel para concluído
    const updatedRental = {
      ...rental,
      status: 'completed',
      notes: notes + (notes ? "\n" : "") + `Devolvido em ${new Date().toLocaleDateString()} - Estado: ${returnStatus === 'available' ? 'Pronto' : 'Manutenção'}`
    };

    // 2. Atualizar o equipamento
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      const allEquip = JSON.parse(savedEquip);
      const newEquip = allEquip.map((e: any) => 
        e.id === rental.equipmentId ? { ...e, status: returnStatus, lastClient: undefined } : e
      );
      localStorage.setItem('app_equipments', JSON.stringify(newEquip));
    }

    onUpdate(updatedRental);
    showSuccess("Devolução processada com sucesso!");
    onOpenChange(false);
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter">DETALHES DO CONTRATO</h2>
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
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Locatário
              </h3>
              <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Selecionar Usuário</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11 bg-white font-bold">
                      <SelectValue placeholder="Escolha o usuário..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {allClients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.role})</SelectItem>
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

          <div className="space-y-8">
            {showReturnForm ? (
              <section className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-200 space-y-6 animate-in fade-in zoom-in duration-300">
                <h3 className="text-lg font-black text-emerald-900 flex items-center gap-2">
                  <RotateCcw className="h-6 w-6" /> Processar Devolução
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-emerald-800">Estado do Item no Recebimento</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant={returnStatus === 'available' ? 'default' : 'outline'}
                        onClick={() => setReturnStatus('available')}
                        className={cn("rounded-xl h-12 font-bold", returnStatus === 'available' && "bg-emerald-600")}
                      >
                        Pronto p/ Uso
                      </Button>
                      <Button 
                        variant={returnStatus === 'maintenance' ? 'default' : 'outline'}
                        onClick={() => setReturnStatus('maintenance')}
                        className={cn("rounded-xl h-12 font-bold", returnStatus === 'maintenance' && "bg-orange-600")}
                      >
                        Necessita Reparo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-emerald-800">Notas de Devolução</Label>
                    <Textarea 
                      placeholder="Descreva o estado do item..." 
                      className="rounded-xl bg-white border-emerald-200"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleProcessReturn} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12">
                      Confirmar Recebimento
                    </Button>
                    <Button variant="ghost" onClick={() => setShowReturnForm(false)} className="rounded-xl h-12 font-bold">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Prazos e Valores
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Data Início</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl border-slate-200 h-11 font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Previsão Devolução</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl border-slate-200 h-11 font-bold" />
                      </div>
                    </div>
                    <div className="bg-emerald-600 p-6 rounded-[2rem] text-white space-y-2 shadow-lg shadow-emerald-100">
                      <Label className="text-[10px] font-bold text-emerald-200 uppercase">Valor Total do Contrato</Label>
                      <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-200">R$</span>
                        <Input type="number" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} className="bg-transparent border-none text-3xl font-black p-0 pl-10 h-auto focus-visible:ring-0 text-white" />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Observações
                  </h3>
                  <Textarea 
                    placeholder="Notas do contrato..." 
                    className="rounded-2xl min-h-[100px] border-slate-200 bg-white text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </section>

                {status !== 'completed' && (
                  <Button 
                    onClick={() => setShowReturnForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black gap-2 h-14 shadow-xl shadow-blue-100"
                  >
                    <RotateCcw className="h-5 w-5" /> Iniciar Devolução
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold h-10 px-6 text-xs">
              Fechar
            </Button>
            <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-8 h-10 text-xs">
              Salvar Alterações
            </Button>
          </div>
          <Button variant="outline" className="rounded-xl font-bold h-10 px-6 text-xs border-slate-200 gap-2">
            <FileText className="h-4 w-4" /> Imprimir Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;