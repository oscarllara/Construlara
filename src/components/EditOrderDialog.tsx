"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, Trash2, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditOrderDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (id: string) => void;
}

const EditOrderDialog = ({ order, open, onOpenChange, onCancel }: EditOrderDialogProps) => {
  if (!order) return null;

  const isPending = order.status === 'Pendente';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-blue-700 p-8 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">PEDIDO {order.id}</h2>
            <Badge className="bg-white/20 text-white border-none rounded-xl">{order.status}</Badge>
          </div>
          <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest">Realizado em {order.date}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package className="h-4 w-4" /> Itens do Pedido
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {item.isFractional ? `${item.totalAmount} ${item.unitLabel}` : `${item.quantity} un`}
                    </p>
                  </div>
                  <p className="font-black text-blue-700">R$ {((item.promoPrice || item.price) * (item.isFractional ? item.totalAmount : item.quantity)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pagamento</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-slate-700 capitalize">{order.paymentMethod === 'store' ? 'Na Loja' : order.paymentMethod}</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Total</p>
              <p className="text-xl font-black text-blue-700">R$ {Number(order.total).toFixed(2)}</p>
            </div>
          </div>

          {isPending && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-[10px] font-medium text-amber-800 leading-tight">
                Seu pedido está sendo processado. Você pode cancelá-lo enquanto o status for "Pendente".
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-0 gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold flex-1 h-12">Fechar</Button>
          {isPending && (
            <Button 
              variant="destructive" 
              onClick={() => onCancel(order.id)}
              className="rounded-xl font-bold flex-1 h-12 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Cancelar Pedido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;