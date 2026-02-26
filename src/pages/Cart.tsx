"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft, Package, Info } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp' | 'store'>('whatsapp');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        setCart(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) { 
      console.error("Erro ao carregar carrinho:", e);
      setCart([]); 
    }
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('app_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  // Cálculo de total robusto que não quebra a página
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      try {
        const price = item.isPromo ? (Number(item.promoPrice) || Number(item.price) || 0) : (Number(item.price) || 0);
        // Se for fracionado (piso), usa o totalAmount (m²), senão usa quantity (unidades)
        const amount = item.isFractional ? (Number(item.totalAmount) || 0) : (Number(item.quantity) || 0);
        return acc + (price * amount);
      } catch (e) {
        return acc;
      }
    }, 0);
  }, [cart]);

  const handleUpdateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id && !item.isFractional) {
        const newQty = Math.max(1, (Number(item.quantity) || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const handleRemove = (id: string) => {
    const newCart = cart.filter(i => i.id !== id);
    saveCart(newCart);
    showSuccess("Item removido.");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    try {
      const orderId = `ORD-${Date.now()}`;
      const orderDate = new Date().toLocaleString('pt-BR');
      const userEmail = localStorage.getItem('userEmail') || '';
      
      const savedOrders = localStorage.getItem('app_orders');
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      
      const newOrder = {
        id: orderId,
        date: orderDate,
        userEmail: userEmail,
        items: [...cart],
        total: cartTotal,
        paidAmount: 0,
        paymentMethod: paymentMethod,
        status: 'Pendente'
      };

      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...currentOrders]));
      localStorage.removeItem('app_cart');
      setCart([]);
      
      const itemsList = cart.map(it => `• ${it.name} (${it.isFractional ? it.totalAmount + (it.unitLabel || 'm²') : it.quantity + ' un'})`).join('%0A');
      const msg = `*NOVO PEDIDO - CONSTRULARA*%0A*ID:* ${orderId}%0A*Itens:*%0A${itemsList}%0A*Total:* R$ ${cartTotal.toFixed(2)}%0A*Pagamento:* ${paymentMethod}`;
      window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');

      showSuccess("Pedido realizado com sucesso!");
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('order-placed'));
      
      setTimeout(() => navigate('/perfil'), 500);
    } catch (e) {
      showError("Erro ao finalizar pedido.");
    }
  };

  if (cart.length === 0) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center py-32 space-y-6">
        <div className="h-24 w-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto">
          <ShoppingBag className="h-12 w-12 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Seu carrinho está vazio</h2>
          <p className="text-slate-500 font-medium">Adicione alguns materiais para começar sua obra!</p>
        </div>
        <Button onClick={() => navigate('/loja')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 h-14 font-black text-lg shadow-xl shadow-blue-100">
          Voltar para a Loja
        </Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/loja')} className="rounded-xl h-10 w-10 p-0">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Meu Carrinho</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <Card key={item.id} className="p-6 rounded-[2.5rem] border-none shadow-sm flex flex-col sm:flex-row items-center gap-6 bg-white group hover:shadow-md transition-all">
                <div className="h-24 w-24 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-10 w-10 text-slate-200" />
                  )}
                </div>
                
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge variant="outline" className="text-[9px] font-black uppercase rounded-lg border-slate-200">{item.category}</Badge>
                    {item.isFractional && <Badge className="bg-blue-50 text-blue-700 border-none text-[9px] font-black uppercase rounded-lg">Venda por m²</Badge>}
                  </div>
                  <h4 className="font-black text-lg text-slate-900 leading-tight">{item.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase">Cód: {item.code}</p>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {!item.isFractional ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, -1)} className="h-8 w-8 rounded-xl"><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center font-black text-base">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 1)} className="h-8 w-8 rounded-xl"><Plus className="h-3 w-3" /></Button>
                      </>
                    ) : (
                      <div className="px-4 py-1.5 flex items-center gap-2">
                        <span className="text-sm font-black text-blue-700">{item.totalAmount?.toFixed(2)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{item.unitLabel || 'm²'}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">
                      R$ {((item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? item.totalAmount : item.quantity)).toFixed(2)}
                    </p>
                    <button onClick={() => handleRemove(item.id)} className="text-[10px] font-black text-red-500 uppercase hover:underline">Remover</button>
                  </div>
                </div>
              </Card>
            ))}

            {cart.some(i => i.isFractional) && (
              <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
                <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  Para produtos vendidos por caixa (pisos e revestimentos), o total de m² já inclui o arredondamento para caixas fechadas conforme sua necessidade informada na loja.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-8 rounded-[3rem] shadow-xl bg-white border-none h-fit space-y-8">
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">Resumo do Pedido</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>Entrega</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase">A Combinar</Badge>
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-slate-900">Total</span>
                    <span className="text-3xl font-black text-blue-700 tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold text-right uppercase">Pagamento na Entrega ou Retirada</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Forma de Pagamento</Label>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                      paymentMethod === 'whatsapp' ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={cn("h-5 w-5", paymentMethod === 'whatsapp' ? "text-blue-600" : "text-slate-400")} />
                      <span className={cn("font-bold text-sm", paymentMethod === 'whatsapp' ? "text-blue-900" : "text-slate-600")}>Cartão / Dinheiro</span>
                    </div>
                    {paymentMethod === 'whatsapp' && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                      paymentMethod === 'pix' ? "border-emerald-600 bg-emerald-50" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("font-black text-xs px-1.5 py-0.5 rounded border", paymentMethod === 'pix' ? "border-emerald-600 text-emerald-600" : "border-slate-300 text-slate-400")}>PIX</div>
                      <span className={cn("font-bold text-sm", paymentMethod === 'pix' ? "text-emerald-900" : "text-slate-600")}>Pagamento via PIX</span>
                    </div>
                    {paymentMethod === 'pix' && <div className="h-2 w-2 bg-emerald-600 rounded-full" />}
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full bg-blue-700 hover:bg-blue-800 text-white h-16 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 transition-all active:scale-95"
              >
                Finalizar Pedido
              </Button>
              
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ao finalizar, seu pedido será enviado para separação e entraremos em contato via WhatsApp.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;