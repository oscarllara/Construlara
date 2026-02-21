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
import { DollarSign, CheckCircle2, ArrowRight, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    total: number;
    paidAmount?: number;
    client: string;
    description: string;
  } | null;
  onConfirm: (amount: number) => void;
}

const PaymentActionDialog = ({ open, onOpenChange, item, onConfirm }: PaymentActionDialogProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isPartial, setIsPartial] = useState(false);

  const remaining = item ? (item.total - (item.paidAmount || 0)) : 0;

  useEffect(() => {
    if (open && item) {
      setAmount(remaining.toString());
      setIsPartial(false);
    }
  }, [open, item, remaining]);

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > remaining) return;
    onConfirm(val);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[3rem] border-none shadow-2xl p-8 bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <DollarSign className="h-7 w-7 text-emerald-600" />
            Receber Pagamento
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Registrar entrada de valor para: <span className="text-blue-700 font-bold">{item.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Saldo Devedor Atual</p>
            <p className="text-3xl font-black text-slate-900 text-center">R$ {remaining.toFixed(2)}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={!isPartial ? "default" : "outline"}
              onClick={() => {
                setIsPartial(false);
                setAmount(remaining.toString());
              }}
              className={cn("flex-1 rounded-2xl font-bold h-12", !isPartial && "bg-blue-700")}
            >
              Valor Total
            </Button>
            <Button 
              variant={isPartial ? "default" : "outline"}
              onClick={() => setIsPartial(true)}
              className={cn("flex-1 rounded-2xl font-bold h-12", isPartial && "bg-blue-700")}
            >
              Parcial
            </Button>
          </div>

          {isPartial && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-slate-700 font-bold text-sm">Quanto está sendo pago agora?</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-12 rounded-2xl border-slate-200 h-14 text-lg font-black text-emerald-600"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold px-2 italic">
                O restante de R$ {(remaining - (parseFloat(amount) || 0)).toFixed(2)} continuará em aberto.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-emerald-100"
          >
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentActionDialog;