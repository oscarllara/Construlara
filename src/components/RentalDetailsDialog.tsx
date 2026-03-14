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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  ArrowLeft, 
  Printer, 
  ScrollText, 
  CheckCircle2, 
  MessageCircle, 
  Clock,
  AlertTriangle,
  Send,
  CalendarDays,
  CreditCard,
  Banknote,
  XCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, parse, format, isValid, parseISO } from 'date-fns';
import RentalContract from './RentalContract';

interface RentalDetailsDialogProps {
  rental: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRental: any) => void;
  onRentAgain?: (equipmentId: string) => void; 
}

const RentalDetailsDialog = ({ rental, open, onOpenChange, onUpdate, onRentAgain }: RentalDetailsDialogProps) => {
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [viewContractMode, setViewContractMode] = useState(false);
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modality, setModality] = useState("");
  const [totalValue, setTotalValue] = useState<string>("0");

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnStatus, setReturnStatus] = useState<'available' | 'maintenance'>('available');
  const [paymentOption, setPaymentOption] = useState<'paid' | 'credit'>('paid');

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas', 'Entregador'].includes(userRole);

  useEffect(() => {
    if (open) {
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers && savedUsers !== "undefined") {
        try {
          const parsed = JSON.parse(savedUsers);
          setAllClients(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setAllClients([]); }
      }

      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip && savedEquip !== "undefined") {
        try {
          const parsed = JSON.parse(savedEquip);
          setAllEquipments(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setAllEquipments([]); }
      }
    }
  }, [open]);

  useEffect(() => {
    if (rental && open) {
      setStatus(String(rental.status || "active"));
      setNotes(String(rental.notes || ""));
      setViewContractMode(false);
      
      const toISODate = (dateStr: any) => {
        if (!dateStr) return "";
        const s = String(dateStr);
        if (s.includes('/')) {
          const parts = s.split('/');
          if (parts.length === 3) {
            const [d, m, y] = parts;
            return `${y}-${m}-${d}`;
          }
        }
        return s;
      };
      
      setStartDate(toISODate(rental.start));
      // Garante que a data de devolução puxe a data de hoje do computador por padrão
      const today = new Date().toISOString().split('T')[0];
      setEndDate(today); 
      
      setModality(String(rental.modality || "Diária"));
      setShowReturnForm(false);
      setPaymentOption('paid');
      setTotalValue(Number(rental.total || 0).toFixed(2));
    }
  }, [rental, open]);

  const currentEquipment = useMemo(() => {
    if (!rental || !Array.isArray(allEquipments)) return null;
    return allEquipments.find(e => 
      e && (String(e.id) === String(rental.equipmentId) || e.name === rental.item)
    ) || null;
  }, [rental, allEquipments]);

  useEffect(() => {
    if (!startDate || !endDate || !currentEquipment) return;

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      if (!isValid(start) || !isValid(end)) return;

      const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      
      let calculatedTotal = 0;
      let displayModality = "Diária";

      if (totalDays >= 20) {
        displayModality = "Mensal";
        calculatedTotal = currentEquipment.monthlyRate || (currentEquipment.dailyRate * 20);
      } else if (totalDays >= 11) {
        displayModality = "Quinzenal";
        calculatedTotal = currentEquipment.biweeklyRate || (currentEquipment.dailyRate * 11);
      } else if (totalDays >= 4) {
        displayModality = "Semanal";
        calculatedTotal = currentEquipment.weeklyRate || (currentEquipment.dailyRate * 4);
      } else {
        displayModality = "Diária";
        calculatedTotal = currentEquipment.dailyRate * totalDays;
      }

      setModality(displayModality);
      setTotalValue(calculatedTotal.toFixed(2));
    } catch (e) { }
  }, [startDate, endDate, currentEquipment]);

  const handleStartReturn = () => setShowReturnForm(true);

  const handleProcessReturn = () => {
    const formatDateToBR = (dateStr: string) => {
      if (!dateStr || !dateStr.includes('-')) return dateStr;
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const finalTotal = parseFloat(totalValue) || 0;

    const updatedRental = {
      ...rental,
      status: 'completed',
      start: formatDateToBR(startDate),
      end: formatDateToBR(endDate),
      total: finalTotal,
      paidAmount: paymentOption === 'paid' ? finalTotal : (Number(rental.paidAmount) || 0),
      modality: modality,
      notes: notes + (notes ? "\n" : "") + `Devolvido em ${formatDateToBR(endDate)} - ${paymentOption === 'paid' ? 'Pagamento efetuado' : 'Lançado no débito'}`
    };

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      try {
        const allEquip = JSON.parse(savedEquip);
        if (Array.isArray(allEquip)) {
          const newEquip = allEquip.map((e: any) => 
            (e && (String(e.id) === String(rental.equipmentId) || e.name === rental.item)) 
              ? { ...e, status: returnStatus, lastClient: undefined } 
              : e
          );
          localStorage.setItem('app_equipments', JSON.stringify(newEquip));
        }
      } catch (e) { }
    }

    onUpdate(updatedRental);
    showSuccess("Contrato encerrado.");
    onOpenChange(false);
    window.dispatchEvent(new Event('order-placed'));
  };

  if (!rental) return null;

  const isPendingReturn = status === 'pending_return';
  const isCompleted = status === 'completed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white",
        viewContractMode ? "sm:max-w-[900px]" : "sm:max-w-[800px]"
      )}>
        <div className="bg-blue-700 p-10 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {viewContractMode && (
                <Button variant="ghost" size="icon" onClick={() => setViewContractMode(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <h2 className="text-3xl font-black tracking-tighter">CONTRATO {String(rental.id || "").toUpperCase()}</h2>
            </div>
            <Badge className="bg-white/20 text-white border-none uppercase text-[10px] font-black px-4 py-1">
              {isCompleted ? 'Finalizado' : isPendingReturn ? 'Solicitado' : 'Ativo'}
            </Badge>
          </div>
        </div>

        <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {viewContractMode ? (
            <RentalContract rental={rental} />
          ) : showReturnForm ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><RotateCcw className="h-6 w-6 text-emerald-600" /> Fechamento de Caixa</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase text-slate-400">Data de Devolução (Hoje)</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="h-14 rounded-2xl border-slate-200 font-bold text-lg bg-white"
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex flex-col justify-center items-center">
                  <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Valor Total ({modality})</p>
                  <p className="text-3xl font-black text-slate-900">R$ {totalValue}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase text-slate-400">Estado do Item:</Label>
                  <div className="flex gap-2">
                    <Button variant={returnStatus === 'available' ? 'default' : 'outline'} onClick={() => setReturnStatus('available')} className={cn("flex-1 rounded-xl h-12 font-bold", returnStatus === 'available' && "bg-blue-700")}>Pronto</Button>
                    <Button variant={returnStatus === 'maintenance' ? 'default' : 'outline'} onClick={() => setReturnStatus('maintenance')} className={cn("flex-1 rounded-xl h-12 font-bold", returnStatus === 'maintenance' && "bg-blue-700")}>Oficina</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase text-slate-400">Pagamento:</Label>
                  <div className="flex gap-2">
                    <Button variant={paymentOption === 'paid' ? 'default' : 'outline'} onClick={() => setPaymentOption('paid')} className={cn("flex-1 rounded-xl h-12 font-bold", paymentOption === 'paid' && "bg-blue-700")}>Recebido</Button>
                    <Button variant={paymentOption === 'credit' ? 'default' : 'outline'} onClick={() => setPaymentOption('credit')} className={cn("flex-1 rounded-xl h-12 font-bold", paymentOption === 'credit' && "bg-blue-700")}>Débito</Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button variant="ghost" onClick={() => setShowReturnForm(false)} className="flex-1 h-14 rounded-2xl font-bold">Voltar</Button>
                <Button onClick={handleProcessReturn} className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-100">Finalizar e Receber</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Resto do componente permanece igual */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipamento</p>
                  <p className="text-xl font-black text-slate-900">{rental.item}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Locatário</p>
                  <p className="text-lg font-bold text-slate-700">{rental.client}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 text-center">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{modality}</p>
                  <p className="text-4xl font-black text-blue-700">R$ {totalValue}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button onClick={() => setViewContractMode(true)} variant="outline" className="w-full h-16 rounded-[2rem] font-black text-blue-700 gap-2"><ScrollText className="h-5 w-5" /> Abrir Contrato Digital</Button>
                {status !== 'completed' && (
                  isInternal && (
                    <Button onClick={handleStartReturn} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 rounded-[2rem] font-black gap-2 shadow-xl shadow-emerald-100"><RotateCcw className="h-6 w-6" /> Receber e Finalizar</Button>
                  )
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-10 pt-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full rounded-2xl h-14 font-black text-slate-400 uppercase tracking-widest">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;