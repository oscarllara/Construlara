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
import { User, Hammer, FileText, AlertCircle, RotateCcw, Hash, Tag, Calendar, ArrowLeft, Printer, Eye, ScrollText, CheckCircle2 } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { differenceInDays, parse, format, isValid, parseISO } from 'date-fns';
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
      setStatus(rental.status);
      setNotes(rental.notes || "");
      setViewContractMode(false);
      
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
      
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) setAllClients(JSON.parse(savedUsers));

      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        const allEquip: Equipment[] = JSON.parse(savedEquip);
        const found = allEquip.find(e => e.id === rental.equipmentId || e.name === rental.item);
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
    // Ao iniciar retorno, a data de devolução trava na data de hoje para o cálculo final
    const today = new Date().toISOString().split('T')[0];
    setEndDate(today); 
    setShowReturnForm(true);
  };

  const handleProcessReturn = () => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const finalTotal = parseFloat(totalValue);

    // Na devolução, assumimos que o valor é liquidado (Pago = Total)
    const updatedRental = {
      ...rental,
      status: 'completed',
      end: formatDate(endDate),
      total: finalTotal,
      paidAmount: finalTotal, // Marca como pago ao devolver
      modality: modality,
      notes: notes + (notes ? "\n" : "") + `Devolvido em ${format(new Date(), 'dd/MM/yyyy')} - Estado: ${returnStatus === 'available' ? 'Pronto' : 'Manutenção'}`
    };

    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      const allEquip = JSON.parse(savedEquip);
      const newEquip = allEquip.map((e: any) => 
        (e.id === rental.equipmentId || e.name === rental.item) ? { ...e, status: returnStatus, lastClient: undefined } : e
      );
      localStorage.setItem('app_equipments', JSON.stringify(newEquip));
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
        <div className="bg-blue-700 p-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {viewContractMode && (
                <Button variant="ghost" size="icon" onClick={() => setViewContractMode(false)} className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <h2 className="text-2xl font-black">CONTRATO {rental.id.toUpperCase()}</h2>
            </div>
            <Badge className={cn(
              "rounded-xl font-bold px-4 py-1 border-none",
              status === 'completed' ? "bg-emerald-500" : "bg-white/20"
            )}>{status}</Badge>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
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
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Locatário</p>
                    <p className="text-lg font-black text-slate-900">{rental.client}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem]">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Item Locado</p>
                    <p className="text-lg font-black text-slate-900">{rental.item}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] font-bold">Data de Início</Label><Input type="date" value={startDate} disabled className="rounded-xl h-10" /></div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold">Data de Devolução</Label>
                      <Input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        disabled={status === 'completed' || !isInternal}
                        className="rounded-xl h-10" 
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase">{modality}</p>
                      <p className="text-3xl font-black text-blue-700">R$ {totalValue}</p>
                    </div>
                    {status === 'completed' && <CheckCircle2 className="h-8 w-8 text-emerald-500" />}
                  </div>
                </div>
              </div>

              {notes && (
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Observações do Contrato</p>
                  <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap">{notes}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setViewContractMode(true)} 
                  variant="outline"
                  className="w-full h-14 rounded-2xl font-black border-blue-100 text-blue-700 hover:bg-blue-50 gap-2"
                >
                  <ScrollText className="h-5 w-5" /> Ver Contrato Formal
                </Button>
                
                <div className="flex gap-3">
                  {isInternal && status !== 'completed' && (
                    <Button onClick={handleStartReturn} className="flex-1 bg-emerald-600 h-14 rounded-2xl font-black text-white shadow-xl shadow-emerald-50">
                      <RotateCcw className="mr-2 h-5 w-5" /> Devolver Item Agora
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-14 font-bold px-8 flex-1">
                    Fechar Detalhes
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;