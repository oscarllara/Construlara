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
import { ShoppingBag, Package, Trash2, Clock, CheckCircle2, CreditCard, Plus, Minus, Save, Printer, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import OrderCoupon from './OrderCoupon';

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
  const [isPrinting, setIsPrinting] = useState(false);

  const userRole = localStorage.getItem('userRole');
  const canPrint = ['Gestor', 'Vendas'].includes(userRole || '');

  useEffect(() => {
    if (order && open) {
      setEditedItems(JSON.parse(JSON.stringify(order.items || [])));
      setEditedPayment(order.paymentMethod || "Pix");
      setIsPrinting(false);
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
      const step = item.packageSize || 0.5;
      item.totalAmount = Math.max(step, (Number(item.totalAmount) || 0) + (delta * step));
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

  const handlePrint = () => {
    // Forçamos a renderização do componente de cupom antes de abrir o print
    setIsPrinting(true);
    // Delay necessário para o browser detectar o elemento antes de abrir o print dialog
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-blue-700 p-8 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">DETALHES DO PEDIDO</h2>
            <div className="flex items-center gap-2">
              {canPrint && (
                <Button onClick={handlePrint} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <Printer className="h-5 w-5" />
                </Button>
              )}
              <Badge className="bg-white/20 text-white border-none rounded-xl">{order.status}</Badge>
            </div>
          </div>
          <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest">ID: {order.id} • {order.date}</p>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isPrinting ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-pulse">
              <Printer className="h-16 w-16 text-blue-600" />
              <div>
                <p className="font-black text-slate-900 text-lg">Preparando Impressão</p>
                <p className="text-slate-400 font-medium">O cupom térmico será enviado para sua impressora.</p>
              </div>
              {/* O cupom precisa estar no DOM mas visível apenas para o print */}
              <div className="opacity-0 pointer-events-none absolute">
                <OrderCoupon order={order} />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-4 w-4" /> Itens no Pedido
                </h3>
                <div className="space-y-3">
                  {editedItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Valor Unitário: R$ {(item.promoPrice || item.price).toFixed(2)}</p>
                        </div>
                        <p className="font-black text-blue-700 text-lg">R$ {((item.promoPrice || item.price) * (item.isFractional ? item.totalAmount : item.quantity)).toFixed(2)}</p>
                      </div>
                      
                      {isPending && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(idx, -1)} className="h-8 w-8 rounded-lg"><Minus className="h-3 w-3" /></Button>
                            <Input 
                              className="w-20 h-8 border-none text-center font-bold focus-visible:ring-0" 
                              value={item.isFractional ? item.totalAmount.toFixed(2) : item.quantity}
                              onChange={(e) => handleManualAmount(idx, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(idx, 1)} className="h-8 w-8 rounded-lg"><Plus className="h-3 w-3" /></Button>
                          </div>
                          <Badge variant="outline" className="h-6 rounded-lg text-[10px] font-black uppercase tracking-widest border-slate-200">{item.unitLabel || 'un'}</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs font-black text-blue-400 uppercase">Pagamento</p>
                  <p className="font-bold text-blue-900">{order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-400 uppercase">Total Geral</p>
                  <p className="text-3xl font-black text-blue-700">R$ {currentTotal.toFixed(2)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {!isPrinting && (
          <DialogFooter className="p-8 pt-0 gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold flex-1 h-14">Fechar</Button>
            {isPending && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => onCancel(order.id)}
                  className="rounded-2xl font-bold flex-1 h-14 bg-red-600 hover:bg-red-700"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  className="rounded-2xl font-bold flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-50"
                >
                  Salvar Alterações
                </Button>
              </>
            )}
          </DialogFooter>
        )}
        
        {/* Componente Oculto para Impressão */}
        <div className="hidden print:block">
           <OrderCoupon order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;