"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, CreditCard, ArrowLeft, Copy, CheckCircle2, Box, Store } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const PIX_KEY = "16403481000116";

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp' | 'store'>('whatsapp');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      if (saved) {
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

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        const newTotalAmount = item.isFractional ? newQty * (item.packageSize || 1) : newQty;
        return { ...item, quantity: newQty, totalAmount: newTotalAmount };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
    showSuccess("Item removido do carrinho.");
  };

  const total = cart.reduce((acc, item) => {
    const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
    const amount = item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0);
    return acc + (price * amount);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date().toLocaleString('pt-BR');
    const userEmail = localStorage.getItem('userEmail');
    
    try {
      const savedOrders = localStorage.getItem('app_orders');
      let currentOrders = [];
      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);
          currentOrders = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          currentOrders = [];
        }
      }

      const newOrder = {
        id: orderId,
        date: orderDate,
        userEmail: userEmail,
        items: [...cart],
        total: total,
        paymentMethod: paymentMethod,
        status: 'Pendente'
      };
      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...currentOrders]));

      const itemsList = cart.map(item => {
        const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
        const detail = item.isFractional 
          ? `${item.quantity} cx (${(item.totalAmount || 0).toFixed(2)}${item.unitLabel || 'un'})`
          : `${item.quantity} un`;
        return `• ${item.name} [${detail}] - R$ ${(price * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}`;
      }).join('\n');

      const methodLabel = paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'store' ? 'Pagar na Loja' : 'WhatsApp';

      const message = `*NOVO PEDIDO - CONSTRULARA*\n` +
        `*ID:* ${orderId}\n` +
        `*Data:* ${orderDate}\n\n` +
        `*Itens:*\n${itemsList}\n\n` +
        `*Total:* R$ ${total.toFixed(2)}\n` +
        `*Pagamento:* ${methodLabel}\n\n` +
        `Por favor, confirme meu pedido!`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/5532999625979?text=${encoded}`, '_blank');
      
      localStorage.removeItem('app_cart');
      setCart([]);
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('order-placed'));
      showSuccess("Pedido registrado! Redirecionando para seus pedidos...");
      navigate('/perfil');
    } catch (e) {
      showError("Erro ao processar pedido. Tente novamente.");
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    showSuccess("Chave PIX copiada!");
  };

  if (cart.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
          <div className="h-24 w-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Seu carrinho está vazio</h2>
          <p className="text-slate-500 font-medium">Que tal dar uma olhada nos nossos produtos?</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold px-8 h-12">
            Ir para a Loja
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="rounded-xl gap-2 font-bold text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Continuar Comprando
          </Button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Meu Carrinho</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                <div className="flex items-center p-4 gap-6">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200">
                        {item.code}
                      </Badge>
                      {item.isFractional && (
                        <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-black uppercase flex items-center gap-1">
                          <Box className="h-3 w-3" /> Venda por Caixa
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center gap-6">
                      <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-lg">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="px-3 text-center">
                          <span className="block font-black text-sm leading-none">{item.quantity || 0}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{item.isFractional ? 'caixas' : 'un'}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-lg">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Total {item.unitLabel || 'un'}</span>
                        <span className="font-black text-slate-900">
                          {item.isFractional ? (item.totalAmount || 0).toFixed(2) : (item.quantity || 0)} {item.unitLabel || 'un'}
                        </span>
                      </div>

                      <div className="flex flex-col ml-auto pr-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
                        <span className="font-black text-blue-700">
                          R$ {((item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] bg-white p-8 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-xl font-black">Resumo do Pedido</CardTitle>
              </CardHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-600">
                  <span>Frete</span>
                  <span>A combinar</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-3xl font-black text-blue-700">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forma de Pagamento</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                      paymentMethod === 'whatsapp' ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <MessageCircle className="h-5 w-5 mb-1" />
                    <span className="text-[8px] font-black uppercase">WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                      paymentMethod === 'pix' ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <CreditCard className="h-5 w-5 mb-1" />
                    <span className="text-[8px] font-black uppercase">PIX</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('store')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                      paymentMethod === 'store' ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <Store className="h-5 w-5 mb-1" />
                    <span className="text-[8px] font-black uppercase">Na Loja</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'pix' && (
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Chave PIX (CNPJ)</p>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <code className="text-sm font-bold">{PIX_KEY}</code>
                    <Button variant="ghost" size="icon" onClick={copyPix} className="h-8 w-8 text-white hover:bg-white/20">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCheckout}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-100"
              >
                Concluir Pedido
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;