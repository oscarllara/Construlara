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
import { User, Hammer, FileText, AlertCircle, RotateCcw, Hash, Tag, Calendar, ArrowLeft, Printer, Eye, ScrollText, CheckCircle2, MessageCircle } from 'lucide-react';
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
  const [viewContractMode, setViewContractMode] = useState(false);
  
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modality, setModality] = useState("");
  const [totalValue, setTotalValue] = useState<string>("0");

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnStatus, setReturnStatus] = useState<'available' | 'maintenance'>('available');

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas', 'Entregador'].includes(userRole);

  useEffect(() => {
    if (rental && open) {
      setStatus(rental.status || "active");
      setNotes(rental.notes || "");
      setViewContractMode(false);
      
      const toISODate = (dateStr: any) => {
        if (!dateStr || typeof dateStr !== 'string') return "";
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [d, m, y] = parts;
            return `${y}-${m}-${d}`;
          }
        }
        return dateStr;
      };
      
      setStartDate(toISODate(rental.start));
      setEndDate(toISODate(rental.end));
      setModality(rental.modality || "Diária");
      setTotalValue(rental.total?.toString() || "0.00");
      setShowReturnForm(false);
      
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
          const allEquip: Equipment[] = JSON.parse(savedEquip);
          const found = allEquip.find(e => e.id === rental.equipmentId || e.name === rental.item);
          setEquipment(found || null);
        } catch (e) { setEquipment(null); }
      }
    }
  }, [rental, open]);

  // Recálculo de Valor Automático
  useEffect(() => {
    if (!startDate || !endDate || !equipment) return;

    try {
      const start = parse(startDate, 'yyyy-MM-dd', new Date());
      const end = parse(endDate, 'yyyy-MM-dd', new Date());
      
      if (!isValid(start) || !isValid(end)) return;

      const totalDays = Math.max(1, differenceInDays(end, start) + 1);
      
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

      setModality(displayModality);
      setTotalValue((calculatedTotal || 0).toFixed(2));
    } catch (e) { console.error("Erro no cálculo:", e); }
  }, [startDate, endDate, equipment]);

  const handleStartReturn = () => {
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today); 
    setShowReturnForm(true);
  };

  const handleClientRequestReturn = () => {
    const msg = `*SOLICITAÇÃO DE DEVOLUÇÃO - CONSTRULARA*%0A*Contrato:* ${rental?.id || ''}%0A*Item:* ${rental?.item || ''}%0A*Locatário:* ${rental?.client || ''}%0A%0A_Gostaria de agendar a devolução deste equipamento e solicitar a conferência final._`;
    window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
    showSuccess("Solicitação enviada via WhatsApp!");
  };

  const handleProcessReturn = () => {
    const formatDate = (dateStr: string) => {
      if (!dateStr || !dateStr.includes('-')) return dateStr;
      const parts = dateStr.split('-');
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    };

    const finalTotal = parseFloat(totalValue) || 0;

    const updatedRental = {
      ...rental,
      status: 'completed',
      end: formatDate(endDate),
      total: finalTotal,
      paidAmount: finalTotal,
      modality: modality,
      notes: notes + (notes ? "\n" : "") + `Devolvido em ${format(new Date(), 'dd/MM/yyyy')} - Estado: ${returnStatus === 'available' ? 'Pronto' : 'Manutenção'}`
    };

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      try {
        const allEquip = JSON.parse(savedEquip);
        const newEquip = allEquip.map((e: any) => 
          (e.id === rental.equipmentId || e.name === rental.item) ? { ...e, status: returnStatus, lastClient: undefined } : e
        );
        localStorage.setItem('app_equipments', JSON.stringify(newEquip));
      } catch (e) {}
    }

    onUpdate(updatedRental);
    showSuccess("Devolução e Liquidação processadas!");
    onOpenChange(false);
    window.dispatchEvent(new Event('order-placed'));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!rental) return null;

  const currentClient = allClients.find(c => c.id === rental.clientId || c.name === rental.client);

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
                <h2 className="text-3xl font-black tracking-tighter">CONTRATO {(rental.id || "").toUpperCase()}</h2>
                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80 mt-1">Gestão de Locação Ativa</p>
              </div>
            </div>
            <Badge className={cn(
              "rounded-full font-black text-xs px-5 py-1.5 border-none tracking-widest uppercase",
              status === 'completed' ? "bg-emerald-500" : "bg-white/20"
            )}>{status}</Badge>
          </div>
        </div>

        <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {viewContractMode ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md p-4 rounded-2xl z-10 border border-slate-100 shadow-sm">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Visualização do Contrato Formal</p>
                <Button onClick={handlePrint} className="bg-slate-900 text-white rounded-xl font-bold h-10 px-6 gap-2">
                  <Printer className="h-4 w-4" /> Imprimir Documento
                </Button>
              </div>
              <RentalContract rental={rental} client={currentClient} />
            </div>
          ) : showReturnForm ? (
            <div className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-100 space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2"><RotateCcw className="h-6 w-6" /> Processar Devolução</h3>
              <div className="grid gap-4">
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Valor Final Ajustado</p>
                    <p className="text-xs text-slate-400 font-bold mb-1">Calculado até hoje ({format(new Date(), 'dd/MM/yyyy')})</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900">R$ {totalValue}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-emerald-900">Estado do Equipamento no Recebimento</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant={returnStatus === 'available' ? 'default' : 'outline'} onClick={() => setReturnStatus('available')} className={cn("rounded-xl h-12 font-bold", returnStatus === 'available' && "bg-emerald-600")}>Pronto p/ Uso</Button>
                    <Button variant={returnStatus === 'maintenance' ? 'default' : 'outline'} onClick={() => setReturnStatus('maintenance')} className={cn("rounded-xl h-12 font-bold", returnStatus === 'maintenance' && "bg-orange-600")}>Manutenção</Button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setShowReturnForm(false)} className="flex-1 rounded-xl h-14 font-bold">Voltar</Button>
                  <Button onClick={handleProcessReturn} className="flex-[2] bg-emerald-600 h-14 rounded-2xl font-black text-white shadow-xl shadow-emerald-100">Confirmar Recebimento & Liquidação</Button>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                      <Input type="date" value={startDate} disabled className="rounded-xl h-11 bg-white" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Devolução</Label>
                      <Input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        disabled={status === 'completed' || !isInternal}
                        className="rounded-xl h-11 bg-white" 
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{modality}</p>
                      <p className="text-3xl font-black text-blue-700">R$ {totalValue}</p>
                    </div>
                    {status === 'completed' ? (
                      <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Clock className="h-7 w-7 text-blue-600" />
                      </div>
                    )}
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
                        <RotateCcw className="h-6 w-6" /> Devolver Item Agora
                      </Button>
                    ) : (
                      <Button onClick={handleClientRequestReturn} className="w-full bg-blue-700 h-16 rounded-[2rem] font-black text-white shadow-xl shadow-blue-100 text-base gap-2 hover:bg-blue-800">
                        <MessageCircle className="h-6 w-6" /> Solicitar Devolução via WhatsApp
                      </Button>
                    )}
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                      {isInternal ? "Finaliza o contrato e ajusta o saldo financeiro" : "A devolução depende da conferência física do gestor"}
                    </p>
                  </div>
                )}
              </div>

              {notes && (
                <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Observações Importantes</p>
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
                </div>
              )}
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