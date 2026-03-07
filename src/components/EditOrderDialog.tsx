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
import { ShoppingBag, Package, Trash2, Clock, CheckCircle2, CreditCard, Plus, Minus, Save, Printer, ArrowLeft, Info, MessageCircle, Calculator as CalcIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import OrderCoupon from './OrderCoupon';
import Calculators from './Calculators';
import { showSuccess } from '@/utils/toast';

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
  const [activeCalculatorIdx, setActiveCalculatorIdx] = useState<number | null>(null);

  const userRole = localStorage.getItem('userRole');
  const canPrint = ['Gestor', 'Vendas'].includes(userRole || '');

  useEffect(() => {
    if (order && open) {
      setEditedItems(JSON.parse(JSON.stringify(order.items || [])));
      setEditedPayment(order.paymentMethod || "Pix");
      setIsPrinting(false);
      setActiveCalculatorIdx(null);
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
      const step = item.packageSize || 1;
      const currentAmount = Number(item.totalAmount) || step;
      const currentPacks = Math.round(currentAmount / step);
      const nextPacks = Math.max(1, currentPacks + delta);
      
      item.quantity = nextPacks;
      item.totalAmount = nextPacks * step;
    } else {
      item.quantity = Math.max(1, (Number(item.quantity) || 1) + delta);
    }
    
    setEditedItems(newItems);
  };

  const handleManualAmount = (idx: number, val: string) => {
    const newItems = [...editedItems];
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (newItems[idx].isFractional) {
        const step = newItems[idx].packageSize || 1;
        const packs = Math.ceil(num / step);
        newItems[idx].quantity = packs;
        newItems[idx].totalAmount = packs * step;
      } else {
        newItems[idx].quantity = Math.floor(num);
      }
      setEditedItems(newItems);
    }
  };

  const handleCalcResult = (value: number) => {
    if (activeCalculatorIdx !== null) {
      handleManualAmount(activeCalculatorIdx, value.toFixed(2));
      setActiveCalculatorIdx(null);
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
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 300);
  };

  const handleResendWhatsApp = () => {
    const pixData = localStorage.getItem('app_pix_info');
    const pixInfo = pixData ? JSON.parse(pixData) : { key: "16403481000116", name: "BTM Design", bank: "CC Crediplus" };

    let itemsText = editedItems.map((it: any) => `• ${it.name}: ${it.isFractional ? it.totalAmount.toFixed(2) + (it.unitLabel || 'm²') : it.quantity + ' un'}`).join('%0A');
    
    const pixText = editedPayment === 'Pix' 
      ? `%0A%0A*DADOS PIX:*%0AChave: ${pixInfo.key}%0A${pixInfo.name}%0A${pixInfo.bank}` 
      : '';

    const msg = `*REENVIO DE PEDIDO - CONSTRULARA*%0A*ID:* ${order.id}%0A*Data:* ${order.date}%0A*Total:* R$ ${currentTotal.toFixed(2)}${pixText}%0A%0A*Itens:*%0A${itemsText}`;
    
    window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
    showSuccess("Redirecionando para o WhatsApp...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-blue-700 p-10 text-white relative">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter">DETALHES DO PEDIDO</h2>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">ID: {order.id} • {order.date}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge className="bg-white/20 text-white border-none rounded-full font-black text-xs px-4 py-1.5 uppercase tracking-widest">
                {order.status}
              </Badge>
              {canPrint && (
                <Button onClick={handlePrint} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10">
                  <Printer className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeCalculatorIdx !== null ? (
            <div className="animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" onClick={() => setActiveCalculatorIdx(null)} className="rounded-xl gap-2 font-bold"><ArrowLeft className="h-4 w-4" /> Voltar</Button>
                <h3 className="font-black text-slate-900">Calculando Área: {editedItems[activeCalculatorIdx].name}</h3>
              </div>
              <Calculators onResult={handleCalcResult} hideHeader />
            </div>
          ) : isPrinting ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-pulse">
              <Printer className="h-16 w-16 text-blue-600" />
              <div><p className="font-black text-slate-900 text-lg">Preparando Impressão</p></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {editedItems.map((item: any, idx: number) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <p className="font-black text-slate-900 text-xl leading-tight">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Unit: R$ {(item.promoPrice || item.price).toFixed(2)}</p>
                          {(item.category === 'Argamassa' || item.category === 'Pisos e revestimentos') && isPending && (
                            <Button 
                              variant="ghost" 
                              onClick={() => setActiveCalculatorIdx(idx)}
                              className="h-6 text-[9px] font-black uppercase text-blue-700 hover:bg-blue-100 rounded-lg gap-1 px-2"
                            >
                              <CalcIcon className="h-3 w-3" /> Calcular
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="font-black text-blue-700 text-2xl">R$ {((item.promoPrice || item.price) * (item.isFractional ? item.totalAmount : item.quantity)).toFixed(2)}</p>
                    </div>
                    
                    {isPending && (
                      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(idx, -1)} className="h-12 w-12 rounded-2xl hover:bg-slate-50 text-slate-400"><Minus className="h-5 w-5" /></Button>
                        <div className="flex flex-col items-center min-w-[100px]">
                          <Input 
                            className="h-8 border-none text-center font-black text-2xl focus-visible:ring-0 p-0 text-slate-900" 
                            value={item.isFractional ? item.totalAmount.toFixed(2) : item.quantity}
                            onChange={(e) => handleManualAmount(idx, e.target.value)}
                          />
                          <span className="text-[10px] font-black uppercase text-blue-500 mt-1">{item.unitLabel || 'un'}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(idx, 1)} className="h-12 w-12 rounded-2xl hover:bg-slate-50 text-slate-400"><Plus className="h-5 w-5" /></Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50/50 p-8 rounded-[3rem] border-2 border-dashed border-blue-100 flex justify-between items-center">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Forma de Pagamento</p>
                  {isPending ? (
                    <div className="flex gap-2">
                      <Button 
                        variant={editedPayment === 'Pix' ? 'default' : 'outline'}
                        onClick={() => setEditedPayment('Pix')}
                        className={cn("h-9 rounded-xl font-bold text-xs", editedPayment === 'Pix' && "bg-blue-700")}
                      >
                        Pix
                      </Button>
                      <Button 
                        variant={editedPayment === 'Loja' ? 'default' : 'outline'}
                        onClick={() => setEditedPayment('Loja')}
                        className={cn("h-9 rounded-xl font-bold text-xs", editedPayment === 'Loja' && "bg-blue-700")}
                      >
                        Loja
                      </Button>
                    </div>
                  ) : (
                    <p className="font-black text-blue-900 text-xl">{editedPayment}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total do Pedido</p>
                  <p className="text-4xl font-black text-blue-700">R$ {currentTotal.toFixed(2)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {!isPrinting && activeCalculatorIdx === null && (
          <DialogFooter className="p-8 pt-0 grid grid-cols-2 md:flex md:flex-row gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-14 order-4 md:order-1 md:flex-1">Fechar</Button>
            
            {isPending ? (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => onCancel(order.id)}
                  className="rounded-2xl font-bold h-14 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 order-3 md:order-2 md:flex-1"
                >
                  Cancelar Pedido
                </Button>
                <Button 
                  onClick={handleResendWhatsApp}
                  className="rounded-2xl font-black h-14 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 order-2 md:order-3 md:flex-1 gap-2"
                >
                  <MessageCircle className="h-5 w-5" /> Reenviar
                </Button>
                <Button 
                  onClick={handleSave}
                  className="rounded-2xl font-black h-14 bg-blue-700 hover:bg-blue-800 text-white shadow-xl shadow-blue-100 order-1 md:order-4 md:flex-1 gap-2"
                >
                  <Save className="h-5 w-5" /> Salvar
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleResendWhatsApp}
                className="rounded-2xl font-black h-14 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 w-full md:flex-1 gap-2"
              >
                <MessageCircle className="h-5 w-5" /> Reenviar Pedido via WhatsApp
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;