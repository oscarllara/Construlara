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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Package, Trash2, Clock, CheckCircle2, CreditCard, Plus, Minus, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditOrderDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (id: string) => void;
  onSave: (updatedOrder: any) => void;
}

const EditOrderDialog = ({ order, open, onOpenChange, onCancel, onSave }: EditOrderDialogProps) => {
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [editedPayment, setEditedPayment] = useState<string>("");

  useEffect(() => {
    if (order && open) {
      setEditedItems(JSON.parse(JSON.stringify(order.items || [])));
      setEditedPayment(order.paymentMethod || "Pix");
    }
  }, [order, open]);

  if (!order) return null;

  const isPending = order.status === 'Pendente';

  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, item) => {
      const price = item.isPromo ? (Number(item.promoPrice) || Number(item.price)) : Number(item.price);
      const amount = item.isFractional ? Number(item.totalAmount) : Number(item.quantity);
      return acc + (price * amount);
    }, 0);
  };

  const currentTotal = calculateTotal(editedItems);

  const handleUpdateQty = (idx: number, delta: number) => {
    const newItems = [...editedItems];
    const item = newItems[idx];
    
    if (item.isFractional) {
      item.totalAmount = Math.max(0.01, (Number(item.totalAmount) || 0) + (delta * 0.5));
    } else {
      item.quantity = Math.max(1, (Number(item.quantity) || 1) + delta);
    }
    
    setEditedItems(newItems);
  };

  const handleManualAmount = (idx: number, val: string) => {
    const newItems = [...editedItems];
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (newItems[idx].isFractional) newItems[idx].totalAmount = num;
      else newItems[idx].quantity = Math.floor(num);
      setEditedItems(newItems);
    }
  };

  const handleSave = () => {
    const updatedOrder = {
      ...order,
      items: editedItems,
      total: currentTotal,
      paymentMethod: editedPayment
    };
    onSave(updatedOrder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-blue-700 p-8 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">EDITAR PEDIDO {order.id}</h2>
            <Badge className="bg-white/20 text-white border-none rounded-xl">{order.status}</Badge>
          </div>
          <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest">Realizado em {order.date}</p>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package className="h-4 w-4" /> Itens e Quantidades
            </h3>
            <div className="space-y-3">
              {editedItems.map((item: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Preço Un: R$ {(item.promoPrice || item.price).toFixed(2)}</p>
                    </div>
                    <p className="font-black text-blue-700">R$ {((item.promoPrice || item.price) * (item.isFractional ? item.totalAmount : item.quantity)).toFixed(2)}</p>
                  </div>
                  
                  {isPending && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(idx, -1)} className="h-8 w-8 rounded-lg"><Minus className="h-3 w-3" /></Button>
                        <Input 
                          className="w-16 h-8 border-none text-center font-bold focus-visible:ring-0" 
                          value={item.isFractional ? item.totalAmount : item.quantity}
                          onChange={(e) => handleManualAmount(idx, e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(idx, 1)} className="h-8 w-8 rounded-lg"><Plus className="h-3 w-3" /></Button>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{item.unitLabel || 'un'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Forma de Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={editedPayment === 'Pix' ? 'default' : 'outline'} 
                onClick={() => setEditedPayment('Pix')}
                disabled={!isPending}
                className={cn("rounded-xl h-12 font-bold", editedPayment === 'Pix' && "bg-blue-600")}
              >
                Pix (BTM DESIGN)
              </Button>
              <Button 
                variant={editedPayment === 'Loja' ? 'default' : 'outline'} 
                onClick={() => setEditedPayment('Loja')}
                disabled={!isPending}
                className={cn("rounded-xl h-12 font-bold", editedPayment === 'Loja' && "bg-blue-600")}
              >
                Pagar na Loja
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex justify-between items-center">
            <p className="text-xs font-black text-blue-400 uppercase">Novo Total do Pedido</p>
            <p className="text-2xl font-black text-blue-700">R$ {currentTotal.toFixed(2)}</p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold flex-1 h-12">Fechar</Button>
          {isPending && (
            <>
              <Button 
                variant="destructive" 
                onClick={() => onCancel(order.id)}
                className="rounded-xl font-bold flex-1 h-12 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="rounded-xl font-bold flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;