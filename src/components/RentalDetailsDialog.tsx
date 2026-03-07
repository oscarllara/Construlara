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
  Banknote
} from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { differenceInCalendarDays, parse, format, isValid, parseISO } from 'date-fns';
import RentalContract from './RentalContract';

interface RentalDetailsDialogProps {
  rental: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRental: any) => void;
}

const RentalDetailsDialog = ({ rental, open, onOpenChange, onUpdate }: RentalDetailsDialogProps) => {
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [viewContractMode, setViewContractMode] = useState(false);
  
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

  // Carrega dados iniciais
  useEffect(() => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        setAllClients(Array.isArray(parsed) ? parsed : []);
      } catch (e) { setAllClients([]); }
    }

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      try {
        setAllEquipments(JSON.parse(savedEquip));
      } catch (e) { setAllEquipments([]); }
    }
  }, [open]);

  // Inicializa o formulário com os dados da locação
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
      setEndDate(toISODate(rental.end));
      setModality(String(rental.modality || "Diária"));
      setTotalValue(Number(rental.total || 0).toFixed(2));
      setShowReturnForm(false);
      setPaymentOption('paid');
    }
  }, [rental, open]);

  // Encontra o equipamento atual
  const currentEquipment = useMemo(() => {
    if (!rental || allEquipments.length === 0) return null;
    return allEquipments.find(e => 
      String(e.id) === String(rental.equipmentId) || 
      e.name === rental.item
    ) || null;
  }, [rental, allEquipments]);

  // Lógica de Recálculo Automático
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
    } catch (e) { 
      console.error("Erro no recálculo:", e); 
    }
  }, [startDate, endDate, currentEquipment]);

  const handleStartReturn = () => {
    setShowReturnForm(true);
  };

  const handleRequestReturnSystem = () => {
    const updatedRental = {
      ...rental,
      status: 'pending_return',
      notes: (notes ? notes + "\n" : "") + `Solicitação de devolução enviada pelo cliente em ${format(new Date(), 'dd/MM/yyyy HH:mm')}.`
    };
    onUpdate(updatedRental);
    showSuccess("Solicitação de devolução enviada!");
    onOpenChange(false);
    window.dispatchEvent(new Event('order-placed'));
  };

  const handleClientRequestReturnWhatsApp = () => {
    const msg = `*SOLICITAÇÃO DE DEVOLUÇÃO - CONSTRULARA*%0A*Contrato:* ${rental?.id || ''}%0A*Item:* ${rental?.item || ''}%0A*Locatário:* ${rental?.client || ''}%0A%0A_Gostaria de agendar a devolução deste equipamento._`;
    window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
  };

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
      paidAmount: paymentOption === 'paid' ? finalTotal : (rental.paidAmount || 0),
      modality: modality,
      notes: notes + (notes ? "\n" : "") + `Recebido em ${format(new Date(), 'dd/MM/yyyy')} - ${paymentOption === 'paid' ? 'Pagamento efetuado' : 'Lançado no débito'} - Estado: ${returnStatus === 'available' ? 'Pronto' : 'Manutenção'}`
    };

    // Atualiza status do equipamento no inventário
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      try {
        const allEquip = JSON.parse(savedEquip);
        const newEquip = allEquip.map((e: any) => 
          (String(e.id) === String(rental.equipmentId) || e.name === rental.item) 
            ? { ...e, status: returnStatus, lastClient: undefined } 
            : e
        );
        localStorage.setItem('app_equipments', JSON.stringify(newEquip));
      } catch (e) {}
    }

    onUpdate(updatedRental);
    showSuccess(paymentOption === 'paid' ? "Contrato liquidado e finalizado!" : "Item recebido. Valor lançado no débito do cliente.");
    onOpenChange(false);
    window.dispatchEvent(new Event('order-placed'));
  };

  const setTodayDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today);
    showSuccess("Data de devolução ajustada para hoje.");
  };

  if (!rental) return null;

  const currentClient = allClients.find(c => String(c.id) === String(rental.clientId) || c.name === rental.client);
  const isPendingReturn = status === 'pending_return';

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'active': return 'Ativo';
      case 'overdue': return 'Em Atraso';
      case 'pending_return': return 'Aguardando Recebimento';
      case 'completed': return 'Finalizado';
      default: return s;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white transition-all duration-300",
        viewContractMode ? "sm:max-w-[900px] max-h-[95vh]" : "sm:max-w-[800px]"
      )}>
        <div className="bg-blue-700 p-10 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {viewContractMode && (
                <Button variant="ghost" size="icon" onClick={() => setViewContractMode(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <div>
                <h2 className="text-3xl font-black tracking-tighter">CONTRATO {String(rental.id || "").toUpperCase()}</h2>
                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80 mt-1">Gestão de Locação</p>
              </div>
            </div>
            <Badge className={cn(
              "rounded-full font-black text-xs px-5 py-1.5 border-none tracking-widest uppercase",
              status === 'completed' ? "bg-emerald-500" : 
              isPendingReturn ? "bg-orange-500 animate-pulse" : 
              status === 'overdue' ? "bg-red-500" : "bg-white/20"
            )}>{getStatusLabel(status)}</Badge>
          </div>
        </div>

        <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {viewContractMode ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md p-4 rounded-2xl z-10 border border-slate-100 shadow-sm">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Visualização do Contrato Formal</p>
                <Button onClick={() => window.print()} className="bg-slate-900 text-white rounded-xl font-bold h-10 px-6 gap-2">
                  <Printer className="h-4 w-4" /> Imprimir Documento
                </Button>
              </div>
              <RentalContract rental={rental} client={currentClient} />
            </div>
          ) : showReturnForm ? (
            <div className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-100 space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2"><RotateCcw className="h-6 w-6" /> Fechamento e Recebimento</h3>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Período de Uso</p>
                  <p className="text-xs font-bold text-slate-500">{format(parseISO(startDate), 'dd/MM/yyyy')} - {format(parseISO(endDate), 'dd/MM/yyyy')}</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Valor do Período ({modality})</p>
                    <p className="text-xs text-slate-400 font-bold mb-1">Cálculo automático pelo tempo</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900">R$ {totalValue}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-black text-emerald-900 uppercase text-[10px] tracking-widest">Estado do Equipamento</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={returnStatus === 'available' ? 'default' : 'outline'} onClick={() => setReturnStatus('available')} className={cn("rounded-xl h-12 font-bold text-[10px] uppercase", returnStatus === 'available' && "bg-emerald-600")}>Pronto</Button>
                      <Button variant={returnStatus === 'maintenance' ? 'default' : 'outline'} onClick={() => setReturnStatus('maintenance')} className={cn("rounded-xl h-12 font-bold text-[10px] uppercase", returnStatus === 'maintenance' && "bg-orange-600")}>Reparo</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-black text-emerald-900 uppercase text-[10px] tracking-widest">Financeiro</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={paymentOption === 'paid' ? 'default' : 'outline'} onClick={() => setPaymentOption('paid')} className={cn("rounded-xl h-12 font-bold text-[10px] uppercase gap-2", paymentOption === 'paid' && "bg-blue-700")}>
                        <Banknote className="h-4 w-4" /> Pago
                      </Button>
                      <Button variant={paymentOption === 'credit' ? 'default' : 'outline'} onClick={() => setPaymentOption('credit')} className={cn("rounded-xl h-12 font-bold text-[10px] uppercase gap-2", paymentOption === 'credit' && "bg-blue-700")}>
                        <CreditCard className="h-4 w-4" /> Débito
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-emerald-200">
                  <Button variant="ghost" onClick={() => setShowReturnForm(false)} className="flex-1 rounded-xl h-14 font-bold">Ajustar Data</Button>
                  <Button 
                    onClick={handleProcessReturn} 
                    className={cn(
                      "flex-[2] h-14 rounded-2xl font-black text-white shadow-xl transition-all",
                      paymentOption === 'paid' ? "bg-emerald-600 shadow-emerald-100" : "bg-blue-700 shadow-blue-100"
                    )}
                  >
                    {paymentOption === 'paid' ? 'Confirmar e Liquidar' : 'Confirmar e Lançar Débito'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isPendingReturn && (
                <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 flex gap-4 items-center animate-pulse">
                  <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-orange-900">Devolução Solicitada</p>
                    <p className="text-xs font-bold text-orange-700">Verifique a integridade do item e confirme o fechamento abaixo.</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-slate-50/80 p-6 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Locatário</p>
                    <p className="text-xl font-black text-slate-900">{rental.client || "---"}</p>
                  </div>
                  <div className="bg-slate-50/80 p-6 rounded-[2.5rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Item Locado</p>
                    <p className="text-xl font-black text-slate-900">{rental.item || "---"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Início</Label>
                      <Input type="date" value={startDate} disabled className="rounded-xl h-11 bg-slate-100/50 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Devolução</Label>
                        {isInternal && status !== 'completed' && (
                          <button 
                            onClick={setTodayDate}
                            className="text-[9px] font-black text-blue-700 hover:text-blue-900 uppercase tracking-tighter"
                          >
                            Definir Hoje
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Input 
                          type="date" 
                          value={endDate} 
                          onChange={e => setEndDate(e.target.value)} 
                          disabled={status === 'completed' || !isInternal}
                          className="rounded-xl h-11 bg-white pr-10 border-blue-200 focus:ring-blue-500" 
                        />
                        <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{modality}</p>
                      <p className="text-3xl font-black text-blue-700">R$ {totalValue}</p>
                    </div>
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center",
                      status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {status === 'completed' ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => setViewContractMode(true)} 
                  variant="outline"
                  className="w-full h-16 rounded-[2rem] font-black border-slate-100 text-blue-700 hover:bg-blue-50 gap-2 text-base transition-all"
                >
                  <ScrollText className="h-5 w-5" /> Ver Contrato Formal
                </Button>
                
                {status !== 'completed' && (
                  <div className="grid grid-cols-1 gap-3">
                    {isInternal ? (
                      <Button onClick={handleStartReturn} className="w-full bg-emerald-600 h-16 rounded-[2rem] font-black text-white shadow-xl shadow-emerald-50 text-base gap-2 hover:bg-emerald-700">
                        <RotateCcw className="h-6 w-6" /> Confirmar Recebimento e Finalizar
                      </Button>
                    ) : (
                      <>
                        {!isPendingReturn ? (
                          <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handleRequestReturnSystem} className="bg-blue-700 h-16 rounded-[2rem] font-black text-white shadow-xl shadow-blue-100 text-sm gap-2 hover:bg-blue-800">
                              <Send className="h-5 w-5" /> Solicitar Devolução
                            </Button>
                            <Button variant="outline" onClick={handleClientRequestReturnWhatsApp} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-16 rounded-[2rem] font-black text-sm gap-2">
                              <MessageCircle className="h-5 w-5" /> WhatsApp
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-100 rounded-3xl text-center">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Solicitação enviada. Aguarde o gestor.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-10 pt-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full rounded-2xl h-14 font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50">
            Fechar Detalhes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;