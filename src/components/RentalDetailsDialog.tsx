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
import { User, Hammer, FileText, AlertCircle, RotateCcw, Hash, Tag, Calendar, ArrowLeft, Printer, Eye } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { differenceInDays, parse, format, isValid } from 'date-fns';
import RentalContract from './RentalContract';

interface RentalDetailsDialogProps {
  rental: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRental: any) => void;
}

const RentalDetailsDialog = ({ rental, open, onOpenChange, onUpdate }: RentalDetailsDialogProps) => {
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modality, setModality] = useState("");
  const [totalValue, setTotalValue] = useState<string>("0");

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnStatus, setReturnStatus] = useState<'available' | 'maintenance'>('available');
  const [viewMode, setViewMode] = useState<'edit' | 'contract'>('edit');

  useEffect(() => {
    if (rental && open) {
      setStatus(rental.status);
      setNotes(rental.notes || "");
      
      const toISODate = (dateStr: string) => {
        if (!dateStr) return "";
        if (dateStr.includes('/')) {
          const [d, m, y] = dateStr.split('/');
          return `${y}-${m}-${d}`;
        }
        return dateStr;
      };
      
      setStartDate(toISODate(rental.start));
      setEndDate(toISODate(rental.end));
      setModality(rental.modality || "Diária");
      setTotalValue(rental.total?.toString() || "0");
      setShowReturnForm(false);
      setViewMode('edit');
      
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) setAllClients(JSON.parse(savedUsers));

      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        const allEquip: Equipment[] = JSON.parse(savedEquip);
        const found = allEquip.find(e => e.name === rental.item || e.id === rental.equipmentId);
        setEquipment(found || null);
      }
    }
  }, [rental, open]);

  // Recálculo de Valor Automático quando as datas mudam
  useEffect(() => {
    if (!startDate || !endDate || !equipment) return;

    try {
      const start = parse(startDate, 'yyyy-MM-dd', new Date());
      const end = parse(endDate, 'yyyy-MM-dd', new Date());
      
      if (!isValid(start) || !isValid(end)) return;

      const totalDays = Math.max(1, differenceInDays(end, start) + 1);
      
      let calculatedTotal = 0;
      let displayModality = "Diária";

      // Lógica de Tabela Progressiva (Igual ao AddRentalDialog)
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

      setModality(displayModality);
      setTotalValue(calculatedTotal.toFixed(2));
    } catch (e) { console.error("Erro no cálculo:", e); }
  }, [startDate, endDate, equipment]);

  const handleStartReturn = () => {
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today); // Isso vai disparar o useEffect acima e atualizar o totalValue
    setShowReturnForm(true);
  };

  const handleProcessReturn = () => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const updatedRental = {
      ...rental,
      status: 'completed',
      end: formatDate(endDate),
      total: parseFloat(totalValue),
      modality: modality,
      notes: notes + (notes ? "\n" : "") + `Devolvido em ${format(new Date(), 'dd/MM/yyyy')} - Estado: ${returnStatus === 'available' ? 'Pronto' : 'Manutenção'}`
    };

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      const allEquip = JSON.parse(savedEquip);
      const newEquip = allEquip.map((e: any) => 
        e.id === rental.equipmentId ? { ...e, status: returnStatus, lastClient: undefined } : e
      );
      localStorage.setItem('app_equipments', JSON.stringify(newEquip));
    }

    onUpdate(updatedRental);
    showSuccess("Devolução processada e valor ajustado com sucesso!");
    onOpenChange(false);
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-blue-700 p-8 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">CONTRATO {rental.id.toUpperCase()}</h2>
            <Badge className="bg-white/20 text-white rounded-xl font-bold px-4 py-1">{status}</Badge>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {showReturnForm ? (
            <div className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-100 space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2"><RotateCcw className="h-6 w-6" /> Processar Devolução</h3>
              <div className="grid gap-4">
                <div className="bg-white p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Valor Ajustado (Até Hoje)</p>
                  <p className="text-3xl font-black text-slate-900">R$ {totalValue}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Estado do Equipamento</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant={returnStatus === 'available' ? 'default' : 'outline'} onClick={() => setReturnStatus('available')} className={cn("rounded-xl h-12 font-bold", returnStatus === 'available' && "bg-emerald-600")}>Pronto p/ Uso</Button>
                    <Button variant={returnStatus === 'maintenance' ? 'default' : 'outline'} onClick={() => setReturnStatus('maintenance')} className={cn("rounded-xl h-12 font-bold", returnStatus === 'maintenance' && "bg-orange-600")}>Manutenção</Button>
                  </div>
                </div>
                <Button onClick={handleProcessReturn} className="bg-emerald-600 h-14 rounded-2xl font-black text-white w-full">Finalizar Recebimento</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Locatário</p>
                    <p className="text-lg font-black text-slate-900">{rental.client}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Item</p>
                    <p className="text-lg font-black text-slate-900">{rental.item}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] font-bold">Início</Label><Input type="date" value={startDate} disabled className="rounded-xl h-10" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-bold">Devolução</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-xl h-10" /></div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase">{modality}</p>
                    <p className="text-3xl font-black text-blue-700">R$ {totalValue}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleStartReturn} disabled={status === 'completed'} className="flex-1 bg-emerald-600 h-14 rounded-2xl font-black text-white">Devolver Item Agora</Button>
                <Button variant="outline" onClick={() => onUpdate({ ...rental, status, total: parseFloat(totalValue), notes })} className="rounded-2xl h-14 font-bold px-8">Salvar Alterações</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;